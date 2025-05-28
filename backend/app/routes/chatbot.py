# routes/chat.py
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.models import User
from app.utils.token import get_current_user
from uuid import UUID
from typing import List
from app.database import get_db
from app.schemas import (
    ConversationCreate, 
    ConversationUpdate, 
    Conversation, 
    MessageCreate, 
    Message, 
    ConversationWithMessages
)
from app.crud import (
    create_conversation, 
    get_user_conversations, 
    get_conversation,
    update_conversation,
    delete_conversation,
    create_message,
    get_conversation_messages,
    get_conversation_with_messages
)
from app.services.chatbot import generate_ai_response

router = APIRouter()

# Conversation routes
@router.post("/conversations/", response_model=Conversation)
def create_new_conversation(user_id: UUID, 
                            db: Session = Depends(get_db), 
                            current_user: User = Depends(get_current_user)):
    if user_id is None or current_user.id is None or user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create conversations for yourself")
    return create_conversation(db=db, user_id=user_id)

@router.get("/conversations/user/{user_id}", response_model=List[Conversation])
def get_user_chat_history(user_id: UUID,
                          db: Session = Depends(get_db), 
                          current_user: User = Depends(get_current_user)):
    if user_id is None or current_user.id is None or user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own conversations")
    return get_user_conversations(db, user_id=user_id)

@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessages)
def get_single_conversation(conversation_id: UUID, db: Session = Depends(get_db)):
    conversation = get_conversation_with_messages(db, conversation_id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.put("/conversations/{conversation_id}", response_model=Conversation)
def update_conversation_title(conversation_id: UUID, conversation_data: ConversationUpdate, db: Session = Depends(get_db)):
    updated_conversation = update_conversation(db, conversation_id, conversation_data)
    if not updated_conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return updated_conversation

@router.delete("/conversations/{conversation_id}")
def delete_single_conversation(conversation_id: UUID, db: Session = Depends(get_db)):
    success = delete_conversation(db, conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"detail": "Conversation deleted successfully"}

# Message routes
@router.post("/messages/", response_model=Message)
async def send_message(
    message: MessageCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # First save the user message
    if message.role != "user":
        raise HTTPException(status_code=400, detail="Only user messages can be sent through this endpoint")
    
    user_message = create_message(db=db, message=message)
    
    # Generate AI response in the background
    background_tasks.add_task(
        process_ai_response,
        conversation_id=message.conversation_id,
        user_message=message.content,
        db=db
    )
    
    return user_message

async def process_ai_response(conversation_id: UUID, user_message: str, db: Session):
    # Get conversation history for context
    messages = get_conversation_messages(db, conversation_id)
    
    # Format messages for AI context
    message_history = [{"role": msg.role, "content": msg.content} for msg in messages]
    
    # Generate AI response
    ai_response = await generate_ai_response(message_history)
    
    # Save AI response to database
    assistant_message = MessageCreate(
        conversation_id=conversation_id,
        content=ai_response,
        role="assistant"
    )
    create_message(db=db, message=assistant_message)