from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import GoalCreate, GoalResponse, GoalOut
from app.crud import create_goal, get_user_goals, get_goal_by_id
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=GoalResponse)
def set_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    return create_goal(db=db, goal=goal)

@router.get("/user/{user_id}", response_model=list[GoalOut])
def get_goals(user_id: UUID, db: Session = Depends(get_db)):
    return get_user_goals(db, user_id=user_id)

@router.get("/{goal_id}", response_model=GoalOut)
def get_goal(goal_id: UUID, db: Session = Depends(get_db)):
    goal = get_goal_by_id(db, goal_id=goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal
