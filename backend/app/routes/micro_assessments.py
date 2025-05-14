from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import MicroAssessmentBase
from app.crud import create_micro_assessment, get_all_micro_assessment, get_micro_assessment

router = APIRouter()

@router.post("/", response_model=MicroAssessmentBase)
def add_micro_assessment(micro_assessment: MicroAssessmentBase, db: Session = Depends(get_db)):
    return create_micro_assessment(db=db, micro_assessment=micro_assessment)

@router.get("/user/{user_id}", response_model=list[MicroAssessmentBase])
def get_micro_assessments(user_id: int, db: Session = Depends(get_db)):
    return get_all_micro_assessment(db, user_id=user_id)

@router.get("/user/micro_assessments/{entry_id}", response_model=MicroAssessmentBase)
def get_micro_assessment_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = get_micro_assessment(db, entry_id=entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Micro assessment entry not found")
    return entry