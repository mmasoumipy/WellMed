from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatMessageCreate, ChatMessageResponse
from app.crud import create_chat_message, get_user_chat_history, get_chatbot_conversation

router = APIRouter()

@router.post("/", response_model=ChatMessageResponse)
def save_message(message: ChatMessageCreate, db: Session = Depends(get_db)):
    return create_chat_message(db=db, message=message)

@router.get("/user/{user_id}", response_model=list[ChatMessageResponse])
def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    return get_user_chat_history(db, user_id=user_id)

@router.get("/conversation/{conversation_id}", response_model=list[ChatMessageResponse])
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = get_chatbot_conversation(db, conversation_id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation
