import os
import pandas as pd
from typing import List, Dict, Any, Optional
from schemas import (
    CollegePredictionRequest,
    CollegePredictionResponse,
    CollegeResult,
    CollegeRecommendation
)
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "josaa_cutoffs.csv")

class CollegeRAGEngine:
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self._load_data()

    def _load_data(self):
        try:
            if os.path.exists(DATA_PATH):
                print(f"Loading JoSAA cutoffs from {DATA_PATH}...")
                df = pd.read_csv(DATA_PATH, low_memory=False)
                df.columns = [c.strip() for c in df.columns]
                for col in ["Opening Rank", "Closing Rank"]:
                    if col in df.columns:
                        df[col] = pd.to_numeric(df[col], errors="coerce")
                self.df = df
                print(f"Loaded {len(self.df)} cutoff records successfully.")
            else:
                self.df = pd.DataFrame()
        except Exception as e:
            print(f"Error loading CSV data: {e}")
            self.df = pd.DataFrame()

    def normalize(self, val: Any) -> str:
        if val is None or pd.isna(val):
            return ""
        return str(val).lower().replace(" ", "").replace("-", "")

    def retrieve_cutoffs(self, req: CollegePredictionRequest, limit: int = 25) -> List[Dict[str, Any]]:
        if self.df is None or self.df.empty:
            return []

        df = self.df.copy()

        # 1. Category Filter
        if req.category:
            cat_norm = self.normalize(req.category)
            if "Seat Type" in df.columns:
                df = df[df["Seat Type"].apply(lambda x: cat_norm in self.normalize(x))]

        # 2. Gender Filter
        if req.gender and req.gender != "All":
            gen_norm = self.normalize(req.gender)
            if "Gender" in df.columns:
                df = df[df["Gender"].apply(lambda x: "genderneutral" in self.normalize(x) or gen_norm in self.normalize(x))]

        # 3. Branch / Course Filter (CSE, ECE, ME, CE)
        if req.preferredCourse:
            course_norm = self.normalize(req.preferredCourse)
            col_prog = "Academic Program Name" if "Academic Program Name" in df.columns else "branch"
            if col_prog in df.columns:
                if course_norm in ["cse", "cs", "computer"]:
                    df = df[df[col_prog].apply(lambda x: "computer" in self.normalize(x))]
                elif course_norm in ["ece", "electronics"]:
                    df = df[df[col_prog].apply(lambda x: "electronics" in self.normalize(x) and "communication" in self.normalize(x))]
                elif course_norm in ["me", "mechanical"]:
                    df = df[df[col_prog].apply(lambda x: "mechanical" in self.normalize(x))]
                elif course_norm in ["ce", "civil"]:
                    df = df[df[col_prog].apply(lambda x: "civil" in self.normalize(x))]
                else:
                    df = df[df[col_prog].apply(lambda x: course_norm in self.normalize(x))]

        # 4. Parse student rank & sort by proximity
        try:
            student_rank = float(req.examRankPercentile)
        except (ValueError, TypeError):
            student_rank = None

        results = []
        seen = set()
        col_inst = "Institute" if "Institute" in df.columns else "college"
        col_prog = "Academic Program Name" if "Academic Program Name" in df.columns else "branch"
        col_open = "Opening Rank" if "Opening Rank" in df.columns else "openingRank"
        col_close = "Closing Rank" if "Closing Rank" in df.columns else "closingRank"

        for _, row in df.iterrows():
            inst = str(row.get(col_inst, ""))
            prog = str(row.get(col_prog, ""))
            key = f"{inst}|{prog}"
            if key in seen: continue
            seen.add(key)

            o_val = int(row.get(col_open)) if pd.notna(row.get(col_open)) else None
            c_val = int(row.get(col_close)) if pd.notna(row.get(col_close)) else None

            diff = abs(c_val - student_rank) if (student_rank and c_val) else float("inf")

            results.append({
                "college": inst,
                "branch": prog.split(" (")[0] if " (" in prog else prog,
                "openingRank": o_val,
                "closingRank": c_val,
                "openingClosingRank": f"{o_val} – {c_val}" if o_val and c_val else "Not available",
                "diff": diff
            })

        if student_rank is not None:
            results.sort(key=lambda r: r["diff"])
        
        return results[:limit]

    def predict_and_explain(self, req: CollegePredictionRequest) -> CollegePredictionResponse:
        retrieved = self.retrieve_cutoffs(req, limit=20)
        try:
            student_rank = float(req.examRankPercentile)
        except (ValueError, TypeError):
            student_rank = None

        college_results: List[CollegeResult] = []
        for r in retrieved:
            college_results.append(CollegeResult(
                college=r["college"],
                openingClosingRank=r["openingClosingRank"],
                branch=r["branch"],
                fees="Standard Govt. Structure",
                avgPackage="₹12-25 LPA",
                counselling="JoSAA"
            ))

        # Mathematical Categorization: Safe, Target, Ambitious
        safe, target, ambitious = [], [], []

        for r in retrieved:
            o_rank, c_rank = r["openingRank"], r["closingRank"]
            if not student_rank or not o_rank or not c_rank:
                category, conf = "Target", "Medium"
            elif student_rank < o_rank:
                category, conf = "Safe", "High"
            elif student_rank <= c_rank:
                category, conf = "Target", "Medium"
            else:
                category, conf = "Ambitious", "Low"

            rec = CollegeRecommendation(
                college=r["college"],
                branch=r["branch"],
                category=category,
                reason=f"Candidate rank ({int(student_rank) if student_rank else 'N/A'}) compared to historical cutoff ({r['openingClosingRank']}) indicates {category.lower()} probability.",
                confidence=conf
            )
            if category == "Safe": safe.append(rec)
            elif category == "Target": target.append(rec)
            else: ambitious.append(rec)

        balanced_recommendations: List[CollegeRecommendation] = []
        balanced_recommendations.extend(safe[:2])
        balanced_recommendations.extend(target[:2])
        balanced_recommendations.extend(ambitious[:1])

        # Fill up to 5 if needed
        pool = safe[2:] + target[2:] + ambitious[1:]
        while len(balanced_recommendations) < 5 and pool:
            item = pool.pop(0)
            if item not in balanced_recommendations:
                balanced_recommendations.append(item)

        # Target College Check
        target_res, target_status, target_msg = None, None, None
        if req.targetCollege and req.targetCollege.strip():
            target_norm = self.normalize(req.targetCollege)
            matches = [r for r in retrieved if target_norm in self.normalize(r["college"])]
            if matches:
                m = matches[0]
                target_res = CollegeResult(college=m["college"], openingClosingRank=m["openingClosingRank"], branch=m["branch"])
                o, c = m["openingRank"], m["closingRank"]
                if student_rank and o and c:
                    if student_rank < o:
                        target_status, target_msg = "SAFE", f"Your rank {int(student_rank)} is better than opening rank ({o})."
                    elif student_rank <= c:
                        target_status, target_msg = "TARGET", f"Your rank {int(student_rank)} is within cutoff range ({m['openingClosingRank']})."
                    else:
                        target_status, target_msg = "AMBITIOUS", f"Your rank {int(student_rank)} exceeds closing rank ({c})."
            else:
                target_status, target_msg = "NOT_FOUND", f"No cutoffs found for {req.targetCollege} under selected filters."

        # Augmented Strategic Counseling via LLM
        ai_summary = None
        api_key = os.getenv("GROQ_API_KEY", "")
        if api_key and balanced_recommendations:
            try:
                llm = ChatGroq(api_key=api_key, model_name=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"), temperature=0.3)
                prompt = ChatPromptTemplate.from_template(
                    """Candidate Details: Exam: {exam}, Rank: {rank}, Category: {category}, Preferred Course: {course}
Retrieved Top Colleges from JoSAA RAG:
{colleges}
Provide a 2-3 sentence strategic admission counseling summary for this student, advising on choice-filling order."""
                )
                colleges_str = "\n".join([f"- {rec.college} ({rec.branch}): {rec.category}" for rec in balanced_recommendations])
                ai_res = (prompt | llm).invoke({
                    "exam": req.examType, "rank": req.examRankPercentile,
                    "category": req.category, "course": req.preferredCourse, "colleges": colleges_str
                })
                ai_summary = ai_res.content.strip()
            except Exception:
                ai_summary = f"Based on JoSAA cutoffs for rank {req.examRankPercentile}, we identified {len(balanced_recommendations)} balanced recommendations across Safe, Target, and Ambitious tiers."

        return CollegePredictionResponse(
            aiAnalysis=ai_summary,
            collegeResultList=college_results,
            recommendations=balanced_recommendations,
            targetCollegeResult=target_res,
            targetCollegeStatus=target_status,
            targetCollegeMessage=target_msg
        )

rag_engine = CollegeRAGEngine()
