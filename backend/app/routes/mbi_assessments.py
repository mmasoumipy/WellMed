from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import MBIAssessmentCreate, MBIAssessmentResponse
from crud import create_mbi_assessment, get_mbi_assessments

router = APIRouter()

@router.post("/", response_model=MBIAssessmentResponse)
def submit_mbi_assessment(assessment: MBIAssessmentCreate, db: Session = Depends(get_db)):
    return create_mbi_assessment(db=db, assessment=assessment)

@router.get("/user/{user_id}", response_model=list[MBIAssessmentResponse])
def get_mbi_assessments_list(user_id: int, db: Session = Depends(get_db)):
    return get_mbi_assessments(db, user_id=user_id)
