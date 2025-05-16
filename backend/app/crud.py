from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app import schemas, models
from datetime import datetime
from uuid import UUID
from typing import List

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

def get_user_moods(db: Session, user_id: UUID):
    return db.query(models.MoodEntry).filter(models.MoodEntry.user_id == user_id).all()

# MICRO ASSESSMENTS
def create_micro_assessment(db: Session, micro: schemas.MicroAssessmentCreate):
    db_micro = models.MicroAssessment(**micro.dict())
    db.add(db_micro)
    db.commit()
    db.refresh(db_micro)
    return db_micro

def get_all_micro_assessment(db: Session, user_id: UUID):
    return db.query(models.MicroAssessment).filter(models.MicroAssessment.user_id == user_id).all()

def get_micro_assessment(db: Session, assessment_id: UUID):
    return db.query(models.MicroAssessment).filter(
        models.MicroAssessment.id == assessment_id
    ).first()

# MBI ASSESSMENTS
def create_mbi_assessment_with_answers(db: Session, user_id: UUID, answers_data: List[dict]):
    # Calculate subscale scores
    ee_questions = {1, 2, 3, 6, 8, 13, 14, 16, 20}
    dp_questions = {5, 10, 11, 15, 22}
    pa_questions = {4, 7, 9, 12, 17, 18, 19, 21}
    
    emotional_exhaustion = sum(ans["answer_value"] for ans in answers_data if ans["question_id"] in ee_questions)
    depersonalization = sum(ans["answer_value"] for ans in answers_data if ans["question_id"] in dp_questions)
    personal_accomplishment = sum(ans["answer_value"] for ans in answers_data if ans["question_id"] in pa_questions)
    
    # Create assessment
    db_assessment = models.MBIAssessment(
        user_id=user_id,
        emotional_exhaustion=emotional_exhaustion,
        depersonalization=depersonalization,
        personal_accomplishment=personal_accomplishment
    )
    db.add(db_assessment)
    db.flush()
    
    # Create answers linked to the assessment
    for answer_data in answers_data:
        db_answer = models.MBIAnswer(
            mbi_id=db_assessment.id,
            question_id=answer_data["question_id"],
            answer_value=answer_data["answer_value"]
        )
        db.add(db_answer)
    
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

def get_mbi_assessments_by_user(db: Session, user_id: UUID):
    return db.query(models.MBIAssessment).filter(models.MBIAssessment.user_id == user_id).order_by(models.MBIAssessment.submitted_at.desc()).all()

def get_mbi_assessment_by_id(db: Session, assessment_id: UUID):
    return db.query(models.MBIAssessment).filter(models.MBIAssessment.id == assessment_id).first()


# JOURNAL
def create_journal_entry(db: Session, entry: schemas.JournalEntryCreate, analysis: str):
    # Convert pydantic model to dict
    entry_dict = entry.dict()
    # Add analysis field
    entry_dict["analysis"] = analysis
    
    # Create the database entry
    db_entry = models.JournalEntry(**entry_dict)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def get_all_user_journals(db: Session, user_id: UUID):
    return db.query(models.JournalEntry).filter(models.JournalEntry.user_id == user_id).all()

def get_user_journal(db: Session, entry_id: UUID):
    return db.query(models.JournalEntry).filter(models.JournalEntry.id == entry_id).first()


# GOALS
def create_goal(db: Session, goal: schemas.GoalCreate):
    db_goal = models.Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_user_goals(db: Session, user_id: UUID):
    goals = db.query(models.Goal).filter(models.Goal.user_id == user_id).all()
    # for goal in goals:
    #     if goal.goal_type:
    #         goal.goal_type = str(goal.goal_type)
    return goals

def get_goal_by_id(db: Session, goal_id: UUID):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    # if goal and goal.goal_type:
    #     goal.goal_type = str(goal.goal_type)
    return goal

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