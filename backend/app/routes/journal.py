from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import JournalEntryCreate, JournalEntryResponse
from crud import create_journal_entry, get_user_journal

router = APIRouter()

@router.post("/", response_model=JournalEntryResponse)
def add_journal_entry(entry: JournalEntryCreate, db: Session = Depends(get_db)):
    return create_journal_entry(db=db, entry=entry)

@router.get("/user/{user_id}", response_model=list[JournalEntryResponse])
def get_journal_entries(user_id: int, db: Session = Depends(get_db)):
    return get_user_journal(db, user_id=user_id)
