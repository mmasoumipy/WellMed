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
from app.services.chatbot import generate_ai_response, get_user_context_from_db, test_ollama_connection

router = APIRouter()

# Health check for Ollama
@router.get("/health")
async def check_ollama_health():
    """Check if Ollama service is running"""
    is_connected = await test_ollama_connection()
    if is_connected:
        return {"status": "healthy", "message": "Ollama is connected and running"}
    else:
        return {"status": "unhealthy", "message": "Ollama is not accessible"}

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
    return create_conversation(db=db, user_id=user_id)

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
    """Get a specific conversation with all messages"""
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
        raise HTTPException(status_code=404, detail="Failed to delete conversation")
    return {"detail": "Conversation deleted successfully"}

# Message routes with Ollama integration
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
    
    # Generate AI response in the background
    background_tasks.add_task(
        process_ai_response,
        conversation_id=message.conversation_id,
        user_message=message.content,
        user_id=current_user.id,
        db=db
    )
    
    return user_message

async def process_ai_response(conversation_id: UUID, user_message: str, user_id: UUID, db: Session):
    """Process AI response using Ollama"""
    try:
        print(f"Processing AI response for conversation {conversation_id}")
        
        # Get conversation history for context
        messages = get_conversation_messages(db, conversation_id)
        print(f"Found {len(messages)} existing messages in conversation")
        
        # Format messages for AI context (limit to last 10 messages to avoid token limits)
        message_history = []
        for msg in messages[-10:]:  # Get last 10 messages
            message_history.append({
                "role": msg.role, 
                "content": msg.content
            })
        
        print(f"Prepared {len(message_history)} messages for AI context")
        
        # Get user context for personalized responses
        user_context = await get_user_context_from_db(db, str(user_id))
        print(f"User context: {user_context}")
        
        # Generate AI response using Ollama
        print("Calling Ollama for AI response...")
        ai_response = await generate_ai_response(message_history, user_context)
        print(f"AI response received: {ai_response[:100]}...")
        
        # Save AI response to database
        assistant_message = MessageCreate(
            conversation_id=conversation_id,
            content=ai_response,
            role="assistant"
        )
        
        saved_message = create_message(db=db, message=assistant_message)
        print(f"AI response saved to database with ID: {saved_message.id}")
        
        print(f"AI response generated and saved for conversation {conversation_id}")
        
    except Exception as e:
        print(f"Error processing AI response: {e}")
        import traceback
        traceback.print_exc()
        
        # Save fallback response
        fallback_response = "I'm having trouble processing your message right now. As a healthcare professional, remember that it's important to take breaks and practice self-care. Please try again in a moment."
        
        assistant_message = MessageCreate(
            conversation_id=conversation_id,
            content=fallback_response,
            role="assistant"
        )
        
        saved_message = create_message(db=db, message=assistant_message)
        print(f"Fallback response saved with ID: {saved_message.id}")

@router.get("/messages/{conversation_id}", response_model=List[Message])
def get_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all messages in a conversation"""
    conversation = get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own conversation messages")
    
    return get_conversation_messages(db, conversation_id)

# Quick message endpoint for simple interactions
@router.post("/quick-message")
async def quick_message(
    message: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a quick message without creating a persistent conversation"""
    try:
        print(f"Quick message received: {message}")
        
        # Get user context
        user_context = await get_user_context_from_db(db, str(current_user.id))
        print(f"User context for quick message: {user_context}")
        
        # Format as message history
        message_history = [{"role": "user", "content": message}]
        
        # Generate response
        print("Generating AI response for quick message...")
        ai_response = await generate_ai_response(message_history, user_context)
        print(f"Quick message AI response: {ai_response}")
        
        return {
            "user_message": message,
            "ai_response": ai_response,
            "context_used": bool(user_context)
        }
        
    except Exception as e:
        print(f"Error in quick message: {e}")
        import traceback
        traceback.print_exc()
        return {
            "user_message": message,
            "ai_response": "I'm here to support you as a healthcare professional. Could you please try your message again?",
            "context_used": False
        }

# Add a direct sync message endpoint for testing
@router.post("/send-sync-message")
async def send_sync_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message and get immediate AI response (synchronous)"""
    # Verify user owns the conversation
    conversation = get_conversation(db, message.conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only send messages to your own conversations")
    
    # Only allow user messages through this endpoint
    if message.role != "user":
        raise HTTPException(status_code=400, detail="Only user messages can be sent through this endpoint")
    
    try:
        # Save the user message
        user_message = create_message(db=db, message=message)
        print(f"User message saved: {user_message.id}")
        
        # Get conversation history
        messages = get_conversation_messages(db, message.conversation_id)
        message_history = [{"role": msg.role, "content": msg.content} for msg in messages[-10:]]
        
        # Get user context
        user_context = await get_user_context_from_db(db, str(current_user.id))
        
        # Generate AI response
        ai_response = await generate_ai_response(message_history, user_context)
        print(f"AI response generated: {ai_response[:100]}...")
        
        # Save AI response
        assistant_message = MessageCreate(
            conversation_id=message.conversation_id,
            content=ai_response,
            role="assistant"
        )
        ai_message = create_message(db=db, message=assistant_message)
        print(f"AI message saved: {ai_message.id}")
        
        return {
            "user_message": user_message,
            "ai_message": ai_message,
            "success": True
        }
        
    except Exception as e:
        print(f"Error in sync message: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to process message")