from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import JournalEntryCreate, JournalEntryResponse
from app.crud import create_journal_entry, get_all_user_journals, get_user_journal

router = APIRouter()

@router.post("/", response_model=JournalEntryResponse)
def add_journal_entry(entry: JournalEntryCreate, db: Session = Depends(get_db)):
    return create_journal_entry(db=db, entry=entry)

@router.get("/user/{user_id}", response_model=list[JournalEntryResponse])
def get_journal_entries(user_id: int, db: Session = Depends(get_db)):
    return get_all_user_journals(db, user_id=user_id)

@router.get("/user/journals/{entry_id}", response_model=JournalEntryResponse)
def get_journal_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = get_user_journal(db, entry_id=entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry