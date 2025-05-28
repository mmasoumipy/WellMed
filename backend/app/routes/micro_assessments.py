from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.token import get_current_user
from app.models import User
from app.schemas import MicroAssessmentBase, MicroAssessmentOut, MicroAssessmentCreate
from app.crud import create_micro_assessment, get_all_micro_assessment, get_micro_assessment
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=MicroAssessmentCreate)
def add_micro_assessment(
                        micro_assessment: MicroAssessmentCreate, 
                        db: Session = Depends(get_db), 
                        current_user: User = Depends(get_current_user)
                        ):
    if micro_assessment.user_id is None or current_user.id is None or micro_assessment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create micro assessments for yourself")
    return create_micro_assessment(db=db, micro=micro_assessment)

@router.get("/user/{user_id}", response_model=list[MicroAssessmentOut])
def get_micro_assessments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user), user_id: UUID = None):
    if user_id is None:
        user_id = current_user.id
    elif user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own micro assessments")
    return get_all_micro_assessment(db, user_id=user_id)

@router.get("/user/micro_assessments/{entry_id}", response_model=MicroAssessmentBase)
def get_micro_assessment_entry(entry_id: UUID, db: Session = Depends(get_db)):
    entry = get_micro_assessment(db, assessment_id=entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Micro assessment entry not found")
    return entry