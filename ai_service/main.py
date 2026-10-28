import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from schemas import (
    PlacementRequest,
    PlacementPlanResponse,
    ScholarshipRequest,
    ScholarshipResponse,
    CollegePredictionRequest,
    CollegePredictionResponse
)
from graphs.placement_graph import run_placement_pipeline
from services.scholarship_ai import find_scholarships_ai
from rag.college_retriever import rag_engine

app = FastAPI(
    title="OneStop AI & LangGraph / RAG Microservice",
    description="High-performance AI engine for Placement Roadmaps, Scholarship Matching, and College RAG Predictions",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "OneStop AI Engine",
        "engine": "FastAPI + LangChain + LangGraph + RAG",
        "records_loaded": len(rag_engine.df) if rag_engine.df is not None else 0
    }

@app.post("/api/ai/placement", response_model=PlacementPlanResponse)
async def generate_placement_plan(req: PlacementRequest):
    try:
        plan = run_placement_pipeline(req)
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Placement pipeline failed: {str(e)}")

@app.post("/api/ai/scholarship", response_model=ScholarshipResponse)
async def find_scholarships(req: ScholarshipRequest):
    try:
        response = find_scholarships_ai(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scholarship matching failed: {str(e)}")

@app.post("/api/ai/college-rag", response_model=CollegePredictionResponse)
async def predict_colleges_rag(req: CollegePredictionRequest):
    try:
        response = rag_engine.predict_and_explain(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"College RAG prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
