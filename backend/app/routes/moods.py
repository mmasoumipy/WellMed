from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import User
from app.utils.token import get_current_user
from app.database import get_db
from app.schemas import MoodCreate, MoodResponse
from app.models import MoodEntry
from app.crud import create_mood, get_user_moods
from uuid import UUID

router = APIRouter()

# @router.post("/", response_model=MoodResponse)
# def add_mood(mood: MoodCreate, db: Session = Depends(get_db)):
#     return create_mood(db=db, mood=mood)

@router.post("/", response_model=MoodResponse)
def add_mood(
    mood: MoodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if mood.user_id is None or current_user.id is None or mood.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create mood entries for yourself")
    return create_mood(db=db, mood=mood)


@router.get("/user/{user_id}", response_model=list[MoodResponse])
def get_moods(user_id: UUID, db: Session = Depends(get_db)):
    moods = get_user_moods(db, user_id=user_id)
    if not moods:
        raise HTTPException(status_code=404, detail="No mood entries found")
    return moods
