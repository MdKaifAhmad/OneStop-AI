from typing import List, Optional
from pydantic import BaseModel, Field

# ==========================================================
# PLACEMENT SCHEMAS
# ==========================================================
class SkillItem(BaseModel):
    skill: str
    priority: str
    topics: str

class HiringStage(BaseModel):
    stage: str
    focus: str

class PreviouslyAskedQuestion(BaseModel):
    question: str
    answer: str

class PriorityItem(BaseModel):
    rank: int
    area: str
    recommendedDays: int

class RoadmapDay(BaseModel):
    days: str
    focus: str

class PlacementRequest(BaseModel):
    targetCompany: str
    targetRole: str
    timeLeftDays: int

class PlacementPlanResponse(BaseModel):
    skillsRequired: List[SkillItem] = Field(default_factory=list)
    hiringProcess: List[HiringStage] = Field(default_factory=list)
    previouslyAskedQuestions: List[PreviouslyAskedQuestion] = Field(default_factory=list)
    preparationPriority: List[PriorityItem] = Field(default_factory=list)
    preparationRoadmap: List[RoadmapDay] = Field(default_factory=list)

# ==========================================================
# SCHOLARSHIP SCHEMAS
# ==========================================================
class ScholarshipRequest(BaseModel):
    state: str
    category: str
    annualFamilyIncome: float
    course: str
    educationStage: str
    currentYear: str
    lastQualifyingExam: str
    lastQualifyingExamPercentage: float
    gender: str
    pwd: bool
    parentOccupation: str

class ScholarshipResult(BaseModel):
    name: str
    provider: str
    eligibility: str
    amount: str
    deadline: str
    matchScore: int
    status: str
    reason: str
    applicationLink: str

class ScholarshipResponse(BaseModel):
    scholarshipResultList: List[ScholarshipResult] = Field(default_factory=list)

# ==========================================================
# COLLEGE PREDICTION & RAG SCHEMAS
# ==========================================================
class CollegeResult(BaseModel):
    college: str
    openingClosingRank: str
    branch: str
    fees: str = "Research required"
    avgPackage: str = "Research required"
    counselling: str = "JoSAA"

class CollegeRecommendation(BaseModel):
    college: str
    branch: str
    category: str
    reason: str
    confidence: str

class CollegePredictionRequest(BaseModel):
    tenthPercentage: Optional[float] = None
    twelfthPercentage: Optional[float] = None
    diplomaPercentage: Optional[float] = None
    examType: str = "JEE Main"
    examRankPercentile: str
    rankType: str = "RANK"
    gender: str = "Gender-Neutral"
    category: str = "General"
    pwd: Optional[str] = "No"
    preferredCourse: str = "CSE"
    quota: Optional[str] = "All India"
    collegeType: Optional[str] = None
    targetCollege: Optional[str] = None

class CollegePredictionResponse(BaseModel):
    aiAnalysis: Optional[str] = None
    collegeResultList: List[CollegeResult] = Field(default_factory=list)
    recommendations: List[CollegeRecommendation] = Field(default_factory=list)
    targetCollegeResult: Optional[CollegeResult] = None
    targetCollegeStatus: Optional[str] = None
    targetCollegeMessage: Optional[str] = None
