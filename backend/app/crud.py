from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app import schemas, models
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# USERS
def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        birthday=user.birthday,
        specialty=user.specialty,
        password_hash=hashed_password,
        created_at=datetime.utcnow(),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def update_user(db: Session, user_id: int, updates: schemas.UserUpdate):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    for var, value in vars(updates).items():
        if value is not None:
            setattr(user, var, value)
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

# MOODS
def create_mood(db: Session, mood: schemas.MoodCreate):
    db_mood = models.MoodEntry(**mood.dict())
    db.add(db_mood)
    db.commit()
    db.refresh(db_mood)
    return db_mood

def get_user_moods(db: Session, user_id: int):
    return db.query(models.MoodEntry).filter(models.MoodEntry.user_id == user_id).all()

# MICRO ASSESSMENTS
def create_micro_assessment(db: Session, micro: schemas.MicroAssessmentCreate):
    db_micro = models.MicroAssessment(**micro.dict())
    db.add(db_micro)
    db.commit()
    db.refresh(db_micro)
    return db_micro

def get_all_micro_assessment(db: Session, user_id: int):
    return db.query(models.MicroAssessment).filter(models.MicroAssessment.user_id == user_id).all()

def get_micro_assessment(db: Session, assessment_id: int):
    return db.query(models.MicroAssessment).filter(
        models.MicroAssessment.id == assessment_id
    ).first()

# MBI ASSESSMENTS
def create_mbi_assessment(db: Session, mbi: schemas.MBIAssessmentCreate):
    db_mbi = models.MBIAssessment(**mbi.dict())
    db.add(db_mbi)
    db.commit()
    db.refresh(db_mbi)
    return db_mbi

def create_mbi_answer(db: Session, response: schemas.MBIAssessmentResponseCreate):
    db_response = models.MBIAnswer(**response.dict())
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    return db_response

def get_mbi_assessments(db: Session, user_id: int):
    return db.query(models.MBIAssessment).filter(models.MBIAssessment.user_id == user_id).all()


# JOURNAL
def create_journal_entry(db: Session, entry: schemas.JournalEntryCreate):
    db_entry = models.JournalEntry(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_all_user_journals(db: Session, user_id: int):
    return db.query(models.JournalEntry).filter(models.JournalEntry.user_id == user_id).all()

def get_user_journal(db: Session, entry_id: int):
    return db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()


# GOALS
def create_goal(db: Session, goal: schemas.GoalCreate):
    db_goal = models.Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_user_goals(db: Session, user_id: int):
    return db.query(models.Goal).filter(models.Goal.user_id == user_id).all()

# CHATBOT
def create_chat_message(db: Session, message: schemas.ChatMessageCreate):
    db_message = models.ChatbotConversation(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_user_chat_history(db: Session, user_id: int):
    return db.query(models.ChatbotConversation).filter(models.ChatbotConversation.user_id == user_id).all()

def get_chatbot_conversation(db: Session, user_id: int, conversation_id: int):
    return db.query(models.ChatbotConversation).filter(
        models.ChatbotConversation.user_id == user_id,
        models.ChatbotConversation.id == conversation_id
    ).first()