from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
import uuid
from datetime import datetime
import os
# import whisper
from app.database import get_db
from app.schemas import JournalEntryCreate, JournalEntryResponseOut, JournalEntryBase
from app.crud import create_journal_entry, get_all_user_journals, get_user_journal
# from app.ml_model import analyze_text
from typing import Optional, Union

router = APIRouter()

@router.post("/", response_model=JournalEntryBase)
async def add_journal_entry(
    user_id: uuid.UUID = Form(...),
    text_content: Optional[str] = Form(None),
    audio_file: Union[UploadFile, str, None] = File(default=None), # Union is used to allow for both UploadFile and str types
    db: Session = Depends(get_db)
):
    print(f"Received user_id: {user_id}")
    """Create a new journal entry from text or audio"""

    if isinstance(audio_file, str) and audio_file == "":
        audio_file = None
    
    if not text_content and (not audio_file or not audio_file.filename):
        raise HTTPException(status_code=400, detail="Either text content or audio file must be provided")
    
    print(f"Received text content: {text_content}")

    audio_path = None
    
    # Process audio file if provided
    if audio_file and audio_file.filename:
        upload_dir = "uploads/audio"
        os.makedirs(upload_dir, exist_ok=True)

        audio_path = f"{upload_dir}/{user_id}{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.wav"
        contents = await audio_file.read()
        
        # Write to file
        with open(audio_path, "wb") as f:
            f.write(contents)
        
        # TODO: Transcribe audio using Whisper
        # For now, just use a placeholder
        if not text_content:
            text_content = "Transcribed text from audio would go here"
    
    print(f"Audio file saved at: {audio_path}")
    
    # TODO: Analyze text content
    # Dummy analysis for now
    analysis = f"Sample analysis of text containing {len(text_content.split())} words"
    
    print(f"Analysis result: {analysis}")

    # Create entry object with all required fields
    try:
        entry_data = JournalEntryCreate(
            user_id=user_id,
            text_content=text_content,
            audio_path=audio_path,
            created_at=datetime.utcnow()
        )
        
        # Add to database with analysis
        db_entry = create_journal_entry(db=db, entry=entry_data, analysis=analysis)
        print(f"Database entry created: {db_entry}")
        return db_entry
        
    except Exception as e:
        # This will help debug schema validation errors
        raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")

@router.get("/user/{user_id}", response_model=list[JournalEntryResponseOut])
def get_journal_entries(user_id: uuid.UUID, db: Session = Depends(get_db)):
    return get_all_user_journals(db, user_id=user_id)

@router.get("/{entry_id}", response_model=JournalEntryResponseOut)
def get_journal_entry(entry_id: uuid.UUID, db: Session = Depends(get_db)):
    entry = get_user_journal(db, entry_id=entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


# from fastapi import APIRouter, HTTPException, Depends
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.schemas import JournalEntryCreate, JournalEntryResponse
# from app.crud import create_journal_entry, get_all_user_journals, get_user_journal

# router = APIRouter()

# @router.post("/", response_model=JournalEntryResponse)
# def add_journal_entry(entry: JournalEntryCreate, db: Session = Depends(get_db)):
#     """Create a new journal entry"""
#     return create_journal_entry(db=db, entry=entry)

# @router.get("/user/{user_id}", response_model=list[JournalEntryResponse])
# def get_journal_entries(user_id: int, db: Session = Depends(get_db)):
#     return get_all_user_journals(db, user_id=user_id)

# @router.get("/user/journals/{entry_id}", response_model=JournalEntryResponse)
# def get_journal_entry(entry_id: int, db: Session = Depends(get_db)):
#     entry = get_user_journal(db, entry_id=entry_id)
#     if not entry:
#         raise HTTPException(status_code=404, detail="Journal entry not found")
#     return entry