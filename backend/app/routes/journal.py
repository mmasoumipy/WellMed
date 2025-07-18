from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.models import User
from app.utils.token import get_current_user
import uuid
from datetime import datetime
import os
from app.database import get_db
from app.schemas import JournalEntryCreate, JournalEntryResponseOut, JournalEntryBase
from app.crud import create_journal_entry, get_all_user_journals, get_user_journal
from app.services.chatbot import analyze_journal_entry, get_user_context_from_db
from typing import Optional, Union
import asyncio

router = APIRouter()

@router.post("/", response_model=JournalEntryBase)
async def add_journal_entry(
    user_id: uuid.UUID = Form(...),
    text_content: Optional[str] = Form(None),
    audio_file: Union[UploadFile, str, None] = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new journal entry from text or audio with AI analysis"""
    
    if user_id is None or current_user.id is None or user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create journal entries for yourself")
    
    print(f"Received journal entry from user: {user_id}")

    if isinstance(audio_file, str) and audio_file == "":
        audio_file = None
    
    if not text_content and (not audio_file or not audio_file.filename):
        raise HTTPException(status_code=400, detail="Either text content or audio file must be provided")
    
    print(f"Journal text content: {text_content}")

    audio_path = None
    
    # Process audio file if provided
    if audio_file and audio_file.filename:
        upload_dir = "uploads/audio"
        os.makedirs(upload_dir, exist_ok=True)

        audio_path = f"{upload_dir}/{user_id}{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.wav"
        contents = await audio_file.read()
        
        with open(audio_path, "wb") as f:
            f.write(contents)
        
        # TODO: Add speech-to-text conversion here if needed
        if not text_content:
            text_content = "Audio journal entry (transcription pending)"
    
    print(f"Audio file saved at: {audio_path}")
    
    # Get user context for better AI analysis
    try:
        user_context = await get_user_context_from_db(db, str(user_id))
        print(f"User context gathered: {user_context}")
    except Exception as e:
        print(f"Error getting user context: {e}")
        user_context = {}
    
    # Analyze journal entry with Ollama
    try:
        print("Starting AI analysis...")
        analysis = await analyze_journal_entry(text_content, user_context)
        print(f"AI Analysis completed: {analysis[:100]}...")
    except Exception as e:
        print(f"Error in AI analysis: {e}")
        # Fallback analysis
        word_count = len(text_content.split())
        analysis = f"Thank you for taking time to reflect and journal. Your {word_count}-word entry shows commitment to your mental wellness. Regular journaling is an excellent practice for healthcare professionals to process experiences and maintain emotional balance."

    # Create entry object with all required fields
    try:
        entry_data = JournalEntryCreate(
            user_id=user_id,
            text_content=text_content,
            audio_path=audio_path,
            created_at=datetime.utcnow()
        )
        
        # Add to database with AI analysis
        db_entry = create_journal_entry(db=db, entry=entry_data, analysis=analysis)
        print(f"Journal entry saved to database: {db_entry.id}")
        return db_entry
        
    except Exception as e:
        print(f"Error saving journal entry: {e}")
        raise HTTPException(status_code=422, detail=f"Failed to save journal entry: {str(e)}")

@router.get("/user/{user_id}", response_model=list[JournalEntryResponseOut])
def get_journal_entries(
    user_id: uuid.UUID, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all journal entries for a user"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own journal entries")
    
    return get_all_user_journals(db, user_id=user_id)

@router.get("/{entry_id}", response_model=JournalEntryResponseOut)
def get_journal_entry(
    entry_id: uuid.UUID, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific journal entry"""
    entry = get_user_journal(db, entry_id=entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    # Check if user owns this journal entry
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own journal entries")
    
    return entry

@router.post("/{entry_id}/reanalyze")
async def reanalyze_journal_entry(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Re-analyze a journal entry with updated AI model"""
    entry = get_user_journal(db, entry_id=entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only reanalyze your own journal entries")
    
    try:
        # Get current user context
        user_context = await get_user_context_from_db(db, str(current_user.id))
        
        # Re-analyze with current context
        new_analysis = await analyze_journal_entry(entry.text_content, user_context)
        
        # Update the entry
        entry.analysis = new_analysis
        db.commit()
        db.refresh(entry)
        
        return {"message": "Journal entry re-analyzed successfully", "analysis": new_analysis}
        
    except Exception as e:
        print(f"Error re-analyzing journal entry: {e}")
        raise HTTPException(status_code=500, detail="Failed to re-analyze journal entry")