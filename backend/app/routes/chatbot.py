from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import ChatMessageCreate, ChatMessageResponse
from crud import save_chat_message, get_user_chat_history

router = APIRouter()

@router.post("/", response_model=ChatMessageResponse)
def save_message(message: ChatMessageCreate, db: Session = Depends(get_db)):
    return save_chat_message(db=db, message=message)

@router.get("/user/{user_id}", response_model=list[ChatMessageResponse])
def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    return get_user_chat_history(db, user_id=user_id)
