from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import GoalCreate, GoalResponse
from app.crud import create_goal, get_user_goals

router = APIRouter()

@router.post("/", response_model=GoalResponse)
def set_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    return create_goal(db=db, goal=goal)

@router.get("/user/{user_id}", response_model=list[GoalResponse])
def get_goals(user_id: int, db: Session = Depends(get_db)):
    return get_user_goals(db, user_id=user_id)
