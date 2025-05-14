from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import MoodCreate, MoodResponse
from app.models import MoodEntry
from app.crud import create_mood, get_user_moods
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=MoodResponse)
def add_mood(mood: MoodCreate, db: Session = Depends(get_db)):
    return create_mood(db=db, mood=mood)

@router.get("/user/{user_id}", response_model=list[MoodResponse])
def get_moods(user_id: UUID, db: Session = Depends(get_db)):
    moods = get_user_moods(db, user_id=user_id)
    if not moods:
        raise HTTPException(status_code=404, detail="No mood entries found")
    return moods
