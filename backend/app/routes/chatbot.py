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
from app.services.ollama_service import ollama_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Health check endpoint
@router.get("/health")
async def chatbot_health():
    """Check if the chatbot service is healthy"""
    try:
        is_available = await ollama_service.check_model_availability()
        return {
            "status": "healthy" if is_available else "degraded",
            "ollama_available": is_available,
            "model": ollama_service.model_name
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# Conversation routes
@router.post("/conversations/", response_model=Conversation)
def create_new_conversation(
    user_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Create a new conversation"""
    if user_id is None or current_user.id is None or user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create conversations for yourself")
    
    conversation = create_conversation(db=db, user_id=user_id)
    logger.info(f"Created new conversation {conversation.id} for user {user_id}")
    return conversation

@router.get("/conversations/user/{user_id}", response_model=List[Conversation])
def get_user_chat_history(
    user_id: UUID,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get all conversations for a user"""
    if user_id is None or current_user.id is None or user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own conversations")
    
    return get_user_conversations(db, user_id=user_id)

@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessages)
def get_single_conversation(
    conversation_id: UUID, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific conversation with messages"""
    conversation = get_conversation_with_messages(db, conversation_id=conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user owns this conversation
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own conversations")
    
    return conversation

@router.put("/conversations/{conversation_id}", response_model=Conversation)
def update_conversation_title(
    conversation_id: UUID, 
    conversation_data: ConversationUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update conversation title"""
    conversation = get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own conversations")
    
    updated_conversation = update_conversation(db, conversation_id, conversation_data)
    return updated_conversation

@router.delete("/conversations/{conversation_id}")
def delete_single_conversation(
    conversation_id: UUID, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a conversation"""
    conversation = get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own conversations")
    
    success = delete_conversation(db, conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"detail": "Conversation deleted successfully"}

# Message routes
@router.post("/messages/", response_model=Message)
async def send_message(
    message: MessageCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message and get AI response"""
    
    # Verify user owns the conversation
    conversation = get_conversation(db, message.conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only send messages to your own conversations")
    
    # Only allow user messages through this endpoint
    if message.role != "user":
        raise HTTPException(status_code=400, detail="Only user messages can be sent through this endpoint")
    
    # Save the user message
    user_message = create_message(db=db, message=message)
    logger.info(f"User message saved: {user_message.id}")
    
    # Generate AI response in the background
    background_tasks.add_task(
        process_ai_response,
        conversation_id=message.conversation_id,
        user_message_content=message.content,
        user_id=current_user.id,
        db=db
    )
    
    return user_message

async def process_ai_response(
    conversation_id: UUID, 
    user_message_content: str, 
    user_id: UUID,
    db: Session
):
    """Process AI response in the background"""
    try:
        # Get conversation history for context
        messages = get_conversation_messages(db, conversation_id)
        
        # Format messages for AI context (limit to last 20 messages)
        message_history = []
        for msg in messages[-20:]:
            message_history.append({
                "role": msg.role, 
                "content": msg.content
            })
        
        # Generate AI response with user context
        ai_response = await generate_ai_response(message_history, user_id, db)
        
        # Save AI response to database
        assistant_message = MessageCreate(
            conversation_id=conversation_id,
            content=ai_response,
            role="assistant"
        )
        
        ai_message = create_message(db=db, message=assistant_message)
        logger.info(f"AI response saved: {ai_message.id}")
        
    except Exception as e:
        logger.error(f"Error processing AI response: {str(e)}")
        # Save error message
        try:
            error_message = MessageCreate(
                conversation_id=conversation_id,
                content="I'm sorry, I'm having trouble responding right now. Please try again.",
                role="assistant"
            )
            create_message(db=db, message=error_message)
        except Exception as db_error:
            logger.error(f"Failed to save error message: {str(db_error)}")

@router.get("/messages/{conversation_id}", response_model=List[Message])
def get_conversation_messages_route(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all messages in a conversation"""
    conversation = get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own conversations")
    
    return get_conversation_messages(db, conversation_id)

@router.post("/conversations/{conversation_id}/title/generate")
async def generate_conversation_title(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a title for a conversation based on its content"""
    
    conversation = get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own conversations")
    
    try:
        # Get conversation messages
        messages = get_conversation_messages(db, conversation_id)
        
        if not messages:
            raise HTTPException(status_code=400, detail="No messages found to generate title")
        
        # Get first few messages for title generation
        first_messages = messages[:5]
        content = " ".join([msg.content for msg in first_messages])
        
        # Generate title using AI
        title_prompt = f"Generate a short, descriptive title (max 5 words) for this conversation: {content[:200]}..."
        title_response = await ollama_service.generate_response(
            [{"role": "user", "content": title_prompt}]
        )
        
        # Clean up the title
        title = title_response.strip().replace('"', '').replace("'", '')
        if len(title) > 50:
            title = title[:47] + "..."
        
        # Update conversation title
        update_data = ConversationUpdate(title=title)
        updated_conversation = update_conversation(db, conversation_id, update_data)
        
        return {
            "title": title,
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        logger.error(f"Error generating conversation title: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate title")