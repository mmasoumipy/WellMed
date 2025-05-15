from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.schemas import MBIAssessmentCreate, MBIAssessmentOut
from app.crud import create_mbi_assessment_with_answers, get_mbi_assessments_by_user, get_mbi_assessment_by_id

router = APIRouter()

@router.post("/", response_model=MBIAssessmentOut)
def submit_mbi_assessment(assessment: MBIAssessmentCreate, db: Session = Depends(get_db)):
    """Submit a complete MBI assessment with all 22 answers"""
    # Validate that we have exactly 22 questions
    if len(assessment.answers) != 22:
        raise HTTPException(status_code=400, detail="MBI assessment requires exactly 22 questions")
    
    # Validate answer values are in the correct range (0-6)
    for answer in assessment.answers:
        if not 0 <= answer.answer_value <= 6:
            raise HTTPException(status_code=400, detail="Answer values must be between 0 and 6")
    
    # Convert answers to dict format for the CRUD function
    answers_data = [{"question_id": a.question_id, "answer_value": a.answer_value} for a in assessment.answers]
    
    # Create the assessment with answers
    result = create_mbi_assessment_with_answers(db, assessment.user_id, answers_data)
    return result

@router.get("/user/{user_id}", response_model=List[MBIAssessmentOut])
def get_user_mbi_assessments(user_id: UUID, db: Session = Depends(get_db)):
    """Get all MBI assessments for a specific user"""
    return get_mbi_assessments_by_user(db, user_id)

@router.get("/{assessment_id}", response_model=MBIAssessmentOut)
def get_mbi_assessment_details(assessment_id: UUID, db: Session = Depends(get_db)):
    """Get a specific MBI assessment by ID"""
    assessment = get_mbi_assessment_by_id(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment
