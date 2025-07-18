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
from app.services.chatbot import analyze_journal_entry, get_user_context_from_db
from typing import Optional, Union
import asyncio

router = APIRouter()

async def analyze_and_update_journal(entry_id: str, text_content: str, user_id: str, db: Session):
    """Background task to analyze journal entry and update the database"""
    try:
        print(f"Starting background analysis for journal entry: {entry_id}")
        
        # Get user context for better AI analysis
        user_context = await get_user_context_from_db(db, user_id)
        print(f"User context gathered for analysis: {user_context}")
        
        # Analyze journal entry with Ollama
        analysis = await analyze_journal_entry(text_content, user_context)
        print(f"AI Analysis completed: {analysis[:100]}...")
        
        # Update the journal entry with the analysis
        journal_entry = get_user_journal(db, entry_id)
        if journal_entry:
            journal_entry.analysis = analysis
            db.commit()
            print(f"Journal entry {entry_id} updated with analysis")
        else:
            print(f"Warning: Journal entry {entry_id} not found for analysis update")
            
    except Exception as e:
        print(f"Error in background journal analysis: {e}")
        import traceback
        traceback.print_exc()
        
        # Update with fallback analysis
        try:
            journal_entry = get_user_journal(db, entry_id)
            if journal_entry:
                word_count = len(text_content.split())
                fallback_analysis = f"Thank you for taking time to reflect and journal. Your {word_count}-word entry shows commitment to your mental wellness. Regular journaling is an excellent practice for healthcare professionals to process experiences and maintain emotional balance."
                journal_entry.analysis = fallback_analysis
                db.commit()
                print(f"Journal entry {entry_id} updated with fallback analysis")
        except Exception as fallback_error:
            print(f"Error updating journal entry with fallback analysis: {fallback_error}")

@router.post("/", response_model=JournalEntryBase)
async def add_journal_entry(
    background_tasks: BackgroundTasks,
    user_id: uuid.UUID = Form(...),
    text_content: Optional[str] = Form(None),
    audio_file: Union[UploadFile, str, None] = File(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new journal entry and analyze it in background"""
    
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
    
    # Create entry object with placeholder analysis
    try:
        entry_data = JournalEntryCreate(
            user_id=user_id,
            text_content=text_content,
            audio_path=audio_path,
            created_at=datetime.utcnow()
        )
        
        # Save to database with temporary analysis
        temporary_analysis = "Your journal entry is being analyzed by Carely. Refresh to see the insights!"
        db_entry = create_journal_entry(db=db, entry=entry_data, analysis=temporary_analysis)
        print(f"Journal entry saved to database: {db_entry.id}")
        
        # Add background task for AI analysis
        background_tasks.add_task(
            analyze_and_update_journal,
            str(db_entry.id),
            text_content,
            str(user_id),
            db
        )
        print(f"Background analysis task added for journal entry: {db_entry.id}")
        
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
    background_tasks: BackgroundTasks,
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
        # Update with temporary message
        entry.analysis = "Your journal entry is being re-analyzed by Carely. Refresh to see the updated insights!"
        db.commit()
        
        # Add background task for re-analysis
        background_tasks.add_task(
            analyze_and_update_journal,
            str(entry_id),
            entry.text_content,
            str(current_user.id),
            db
        )
        
        return {"message": "Journal entry is being re-analyzed in the background. Refresh to see updated analysis."}
        
    except Exception as e:
        print(f"Error re-analyzing journal entry: {e}")
        raise HTTPException(status_code=500, detail="Failed to re-analyze journal entry")