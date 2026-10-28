import json
import os
from typing import Dict, Any, TypedDict
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from schemas import PlacementRequest, PlacementPlanResponse

class PlacementState(TypedDict):
    company: str
    role: str
    days: int
    company_intel: Dict[str, Any]
    interview_qa: list
    final_output: Dict[str, Any]

def get_llm():
    api_key = os.getenv("GROQ_API_KEY", "")
    model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    return ChatGroq(
        api_key=api_key,
        model_name=model_name,
        temperature=0.2
    )

def analyze_company_node(state: PlacementState) -> Dict[str, Any]:
    llm = get_llm()
    prompt = ChatPromptTemplate.from_template(
        """You are a senior tech recruiter and engineering manager.
Target Company: {company}
Target Role: {role}
Available Prep Days: {days}

Analyze the typical interview stages and required technical core competencies for this role at this company.
Respond with a strict JSON object:
{{
  "core_skills": [
    {{"skill": "string", "priority": "High/Medium/Low", "topics": "string"}}
  ],
  "hiring_stages": [
    {{"stage": "string", "focus": "string"}}
  ],
  "preparation_priority": [
    {{"rank": 1, "area": "string", "recommendedDays": 1}}
  ]
}}
Do NOT wrap in markdown fences. Output pure JSON only."""
    )
    chain = prompt | llm
    res = chain.invoke({
        "company": state["company"],
        "role": state["role"],
        "days": state["days"]
    })
    
    text = res.content.strip()
    if text.startswith("```json"): text = text[7:]
    if text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
    
    try:
        intel = json.loads(text.strip())
    except Exception:
        intel = {
            "core_skills": [
                {"skill": "Data Structures & Algorithms", "priority": "High", "topics": "Arrays, Trees, Graphs, DP"},
                {"skill": "System Design", "priority": "High", "topics": "Scalability, Caching, Databases"},
                {"skill": "Core CS Fundamentals", "priority": "Medium", "topics": "OS, DBMS, Computer Networks"}
            ],
            "hiring_stages": [
                {"stage": "Online Assessment (OA)", "focus": "DSA Coding + MCQs"},
                {"stage": "Technical Round 1", "focus": "Live Coding & Problem Solving"},
                {"stage": "Technical Round 2", "focus": "System Architecture & Projects"},
                {"stage": "HR & Behavioral", "focus": "Cultural Fit & Leadership Principles"}
            ],
            "preparation_priority": [
                {"rank": 1, "area": "DSA & Coding", "recommendedDays": max(1, int(state["days"] * 0.5))},
                {"rank": 2, "area": "System Design & Projects", "recommendedDays": max(1, int(state["days"] * 0.3))},
                {"rank": 3, "area": "CS Fundamentals & Behavioral", "recommendedDays": max(1, int(state["days"] * 0.2))}
            ]
        }
    return {"company_intel": intel}

def curate_questions_node(state: PlacementState) -> Dict[str, Any]:
    llm = get_llm()
    prompt = ChatPromptTemplate.from_template(
        """You are an interview coach.
Provide 15 real-world technical and domain questions commonly asked in interviews at {company} for the role of {role}.
Each question must include a concise, technically accurate answer suitable for a candidate to articulate.

Format as a JSON object:
{{
  "previouslyAskedQuestions": [
    {{
      "question": "string",
      "answer": "string"
    }}
  ]
}}
Ensure exactly 10 to 15 questions. Return pure JSON only, no markdown formatting."""
    )
    chain = prompt | llm
    res = chain.invoke({"company": state["company"], "role": state["role"]})
    
    text = res.content.strip()
    if text.startswith("```json"): text = text[7:]
    if text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
        
    try:
        q_data = json.loads(text.strip())
        questions = q_data.get("previouslyAskedQuestions", [])
    except Exception:
        questions = [
            {"question": "How does HashMap work internally in Java / your primary language?", "answer": "HashMap operates on the hashing principle using an array of buckets. When put(k, v) is called, hashCode() computes index, handling collisions via linked list or balanced Red-Black tree."},
            {"question": "Explain the difference between Optimistic and Pessimistic concurrency control.", "answer": "Pessimistic locking locks records at read time preventing conflicts. Optimistic locking verifies version timestamps at commit time, rolling back if modified."}
        ]
    return {"interview_qa": questions}

def build_roadmap_node(state: PlacementState) -> Dict[str, Any]:
    intel = state.get("company_intel", {})
    days = state["days"]
    llm = get_llm()
    
    prompt = ChatPromptTemplate.from_template(
        """Generate a day-by-day technical preparation roadmap for {company} - {role} spanning exactly {days} days.
Divide the {days} days into logical intervals (e.g. '1-3', '4-7', '8-{days}').
Every interval must have:
- "days": string representing the day interval (e.g., '1-3')
- "focus": detailed description of what to practice and learn.

Return a JSON object:
{{
  "preparationRoadmap": [
    {{"days": "1-3", "focus": "..."}},
    {{"days": "4-7", "focus": "..."}}
  ]
}}
Return pure JSON only."""
    )
    chain = prompt | llm
    res = chain.invoke({
        "company": state["company"],
        "role": state["role"],
        "days": days
    })
    
    text = res.content.strip()
    if text.startswith("```json"): text = text[7:]
    if text.startswith("```"): text = text[3:]
    if text.endswith("```"): text = text[:-3]
        
    try:
        roadmap_data = json.loads(text.strip())
        roadmap = roadmap_data.get("preparationRoadmap", [])
    except Exception:
        roadmap = [
            {"days": f"1-{max(1, days//3)}", "focus": "DSA Fundamentals (Arrays, Strings, HashMaps) & LeetCode medium questions"},
            {"days": f"{max(2, days//3 + 1)}-{max(2, 2*days//3)}", "focus": "Advanced Data Structures, Trees, Graphs, and System Design"},
            {"days": f"{max(3, 2*days//3 + 1)}-{days}", "focus": "Mock Interviews, Company past papers, Resume & Behavioral prep"}
        ]
    
    final_output = {
        "skillsRequired": intel.get("core_skills", []),
        "hiringProcess": intel.get("hiring_stages", []),
        "preparationPriority": intel.get("preparation_priority", []),
        "previouslyAskedQuestions": state.get("interview_qa", []),
        "preparationRoadmap": roadmap
    }
    return {"final_output": final_output}

# Build LangGraph Workflow
def create_placement_graph():
    workflow = StateGraph(PlacementState)
    workflow.add_node("analyze_company", analyze_company_node)
    workflow.add_node("curate_questions", curate_questions_node)
    workflow.add_node("build_roadmap", build_roadmap_node)
    
    workflow.set_entry_point("analyze_company")
    workflow.add_edge("analyze_company", "curate_questions")
    workflow.add_edge("curate_questions", "build_roadmap")
    workflow.add_edge("build_roadmap", END)
    
    return workflow.compile()

placement_app = create_placement_graph()

def run_placement_pipeline(req: PlacementRequest) -> PlacementPlanResponse:
    init_state: PlacementState = {
        "company": req.targetCompany,
        "role": req.targetRole,
        "days": req.timeLeftDays,
        "company_intel": {},
        "interview_qa": [],
        "final_output": {}
    }
    result = placement_app.invoke(init_state)
    output = result.get("final_output", {})
    return PlacementPlanResponse(**output)
