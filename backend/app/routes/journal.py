from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from app.models import User
from app.utils.token import get_current_user
import uuid
from datetime import datetime
import os
from app.database import get_db
from app.schemas import JournalEntryCreate, JournalEntryResponseOut, JournalEntryBase
from app.crud import create_journal_entry, get_all_user_journals, get_user_journal
from app.services.chatbot import analyze_journal_entry
from typing import Optional, Union
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=JournalEntryBase)
async def add_journal_entry(
    background_tasks: BackgroundTasks,
    user_id: uuid.UUID = Form(...),
    text_content: Optional[str] = Form(None),
    audio_file: Union[UploadFile, str, None] = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new journal entry from text or audio with AI analysis"""
    
    if user_id is None or current_user.id is None or user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only create journal entries for yourself")
    
    logger.info(f"Received journal entry from user: {user_id}")

    if isinstance(audio_file, str) and audio_file == "":
        audio_file = None
    
    if not text_content and (not audio_file or not audio_file.filename):
        raise HTTPException(status_code=400, detail="Either text content or audio file must be provided")
    
    audio_path = None
    
    # Process audio file if provided
    if audio_file and audio_file.filename:
        upload_dir = "uploads/audio"
        os.makedirs(upload_dir, exist_ok=True)

        audio_path = f"{upload_dir}/{user_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.wav"
        contents = await audio_file.read()
        
        with open(audio_path, "wb") as f:
            f.write(contents)
        
        logger.info(f"Audio file saved at: {audio_path}")
        
        # TODO: Implement audio-to-text transcription
        if not text_content:
            text_content = "Audio transcription will be implemented here"
    
    try:
        # Create entry object
        entry_data = JournalEntryCreate(
            user_id=user_id,
            text_content=text_content,
            audio_path=audio_path,
            created_at=datetime.utcnow()
        )
        
        # Generate AI analysis asynchronously
        analysis = await analyze_journal_entry(text_content, user_id, db)
        
        # Create database entry with analysis
        db_entry = create_journal_entry(db=db, entry=entry_data, analysis=analysis)
        
        logger.info(f"Journal entry created successfully with AI analysis")
        
        return db_entry
        
    except Exception as e:
        logger.error(f"Error creating journal entry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create journal entry: {str(e)}")

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
    
    # Check if user owns this entry
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own journal entries")
    
    return entry

@router.post("/{entry_id}/reanalyze")
async def reanalyze_journal_entry(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Re-analyze a journal entry with updated AI"""
    
    entry = get_user_journal(db, entry_id=entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own journal entries")
    
    try:
        # Generate new analysis
        new_analysis = await analyze_journal_entry(entry.text_content, current_user.id, db)
        
        # Update the entry
        entry.analysis = new_analysis
        db.commit()
        db.refresh(entry)
        
        return {"message": "Journal entry re-analyzed successfully", "analysis": new_analysis}
        
    except Exception as e:
        logger.error(f"Error re-analyzing journal entry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to re-analyze journal entry")

@router.get("/user/{user_id}/insights")
async def get_journal_insights(
    user_id: uuid.UUID,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-generated insights from recent journal entries"""
    
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own insights")
    
    try:
        # Get recent journal entries
        entries = get_all_user_journals(db, user_id=user_id)
        recent_entries = entries[:limit]
        
        if not recent_entries:
            return {"insights": "No journal entries found for analysis"}
        
        # Combine recent entries for pattern analysis
        combined_text = " ".join([entry.text_content for entry in recent_entries])
        
        # Generate insights
        insights = await analyze_journal_entry(
            f"Analyze patterns and provide insights from these journal entries: {combined_text}",
            user_id,
            db
        )
        
        return {
            "insights": insights,
            "entries_analyzed": len(recent_entries),
            "period": f"Last {len(recent_entries)} entries"
        }
        
    except Exception as e:
        logger.error(f"Error generating journal insights: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")