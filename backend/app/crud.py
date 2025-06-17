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

# Conversation - Carely
def create_conversation(db: Session, user_id: UUID):
    db_conversation = models.Conversation(user_id=user_id)
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

def get_user_conversations(db: Session, user_id: UUID):
    return db.query(models.Conversation).filter(models.Conversation.user_id == user_id).order_by(models.Conversation.updated_at.desc()).all()

def get_conversation(db: Session, conversation_id: UUID):
    return db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()

def update_conversation(db: Session, conversation_id: UUID, conversation_data: schemas.ConversationUpdate):
    db_conversation = get_conversation(db, conversation_id)
    if db_conversation:
        update_data = conversation_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_conversation, key, value)
        db_conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_conversation)
    return db_conversation

def delete_conversation(db: Session, conversation_id: UUID):
    db_conversation = get_conversation(db, conversation_id)
    if db_conversation:
        db.delete(db_conversation)
        db.commit()
        return True
    return False

# Message
def create_message(db: Session, message: schemas.MessageCreate):
    db_message = models.Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    db_conversation = get_conversation(db, message.conversation_id)
    if db_conversation:
        db_conversation.updated_at = datetime.utcnow()
        db.commit()
    
    return db_message

def get_conversation_messages(db: Session, conversation_id: UUID):
    return db.query(models.Message).filter(models.Message.conversation_id == conversation_id).order_by(models.Message.created_at).all()

def get_conversation_with_messages(db: Session, conversation_id: UUID):
    conversation = get_conversation(db, conversation_id)
    if conversation:
        messages = get_conversation_messages(db, conversation_id)
        # Don't return a dictionary, just attach the messages to the conversation object
        setattr(conversation, "messages", messages)
        return conversation
    return None


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



# WELLNESS ACTIVITIES
def create_wellness_activity(db: Session, activity: schemas.WellnessActivityCreate):
    db_activity = models.WellnessActivity(**activity.dict())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

def get_user_wellness_activities(db: Session, user_id: UUID, limit: int = 50):
    return db.query(models.WellnessActivity).filter(
        models.WellnessActivity.user_id == user_id
    ).order_by(models.WellnessActivity.completed_at.desc()).limit(limit).all()

def get_wellness_activity_by_id(db: Session, activity_id: UUID):
    return db.query(models.WellnessActivity).filter(
        models.WellnessActivity.id == activity_id
    ).first()

def get_user_wellness_stats(db: Session, user_id: UUID):
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    activities = db.query(models.WellnessActivity).filter(
        models.WellnessActivity.user_id == user_id
    ).all()
    
    if not activities:
        return {
            "total_sessions": 0,
            "total_duration_minutes": 0,
            "box_breathing_sessions": 0,
            "stretching_sessions": 0,
            "avg_session_duration": 0,
            "longest_session_duration": 0,
            "current_streak": 0,
            "activities_this_week": 0
        }
    
    total_sessions = len(activities)
    total_duration = sum(a.duration_seconds for a in activities)
    total_duration_minutes = total_duration // 60
    
    box_breathing_count = len([a for a in activities if a.activity_type == 'box_breathing'])
    stretching_count = len([a for a in activities if a.activity_type == 'stretching'])
    
    avg_duration = total_duration / total_sessions if total_sessions > 0 else 0
    longest_duration = max((a.duration_seconds for a in activities), default=0)
    
    # Calculate activities this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    activities_this_week = len([a for a in activities if a.completed_at >= week_ago])
    
    # Calculate current streak (consecutive days with activities)
    current_streak = calculate_activity_streak(activities)
    
    return {
        "total_sessions": total_sessions,
        "total_duration_minutes": total_duration_minutes,
        "box_breathing_sessions": box_breathing_count,
        "stretching_sessions": stretching_count,
        "avg_session_duration": avg_duration,
        "longest_session_duration": longest_duration,
        "current_streak": current_streak,
        "activities_this_week": activities_this_week
    }

def calculate_activity_streak(activities):
    """Calculate current streak of consecutive days with wellness activities"""
    if not activities:
        return 0
    
    from datetime import datetime, timedelta
    
    # Group activities by date
    activity_dates = set()
    for activity in activities:
        activity_dates.add(activity.completed_at.date())
    
    # Sort dates in descending order
    sorted_dates = sorted(activity_dates, reverse=True)
    
    if not sorted_dates:
        return 0
    
    # Check if there's activity today or yesterday
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    if sorted_dates[0] not in [today, yesterday]:
        return 0
    
    # Count consecutive days
    streak = 1
    current_date = sorted_dates[0]
    
    for i in range(1, len(sorted_dates)):
        expected_date = current_date - timedelta(days=1)
        if sorted_dates[i] == expected_date:
            streak += 1
            current_date = sorted_dates[i]
        else:
            break
    
    return streak
