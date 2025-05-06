from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import MoodCreate, MoodResponse
from models import MoodEntry
from crud import create_mood, get_user_moods

router = APIRouter()

@router.post("/", response_model=MoodResponse)
def add_mood(mood: MoodCreate, db: Session = Depends(get_db)):
    return create_mood(db=db, mood=mood)

@router.get("/user/{user_id}", response_model=list[MoodResponse])
def get_moods(user_id: int, db: Session = Depends(get_db)):
    moods = get_user_moods(db, user_id=user_id)
    if not moods:
        raise HTTPException(status_code=404, detail="No mood entries found")
    return moods
