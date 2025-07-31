from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func
from passlib.context import CryptContext
from app import schemas, models
from datetime import datetime
from uuid import UUID
from typing import List, Optional
from sqlalchemy import func, desc, and_

# from app.models.courses import Course, CourseModule, UserCourseEnrollment, UserModuleProgress
from app import schemas
from datetime import datetime
from uuid import UUID
from typing import List, Optional

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
    all_journals = db.query(models.JournalEntry).filter(models.JournalEntry.user_id == user_id).all()
    all_journals = sorted(all_journals, key=lambda x: x.created_at, reverse=True)
    # Convert to list of schemas for response
    return [schemas.JournalEntryResponseOut.from_orm(journal) for journal in all_journals]

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
            "longest_streak": 0,  # Add this
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
    
    # Calculate current and longest streak using enhanced function
    current_streak, longest_streak = calculate_enhanced_user_streak(db, user_id)
    
    return {
        "total_sessions": total_sessions,
        "total_duration_minutes": total_duration_minutes,
        "box_breathing_sessions": box_breathing_count,
        "stretching_sessions": stretching_count,
        "avg_session_duration": avg_duration,
        "longest_session_duration": longest_duration,
        "current_streak": current_streak,
        "longest_streak": longest_streak,  # Add this field
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

def get_user_activity_history_for_streak(db: Session, user_id: UUID, days: int = 30):
    """Get activity history for streak calculation"""
    from datetime import datetime, timedelta
    from sqlalchemy import func, or_
    
    # Get date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get all activity types for the user in the date range
    activities = {
        'moods': db.query(models.MoodEntry).filter(
            models.MoodEntry.user_id == user_id,
            models.MoodEntry.timestamp >= start_date
        ).all(),
        'micro_assessments': db.query(models.MicroAssessment).filter(
            models.MicroAssessment.user_id == user_id,
            models.MicroAssessment.submitted_at >= start_date
        ).all(),
        'mbi_assessments': db.query(models.MBIAssessment).filter(
            models.MBIAssessment.user_id == user_id,
            models.MBIAssessment.submitted_at >= start_date
        ).all(),
        'wellness_activities': db.query(models.WellnessActivity).filter(
            models.WellnessActivity.user_id == user_id,
            models.WellnessActivity.completed_at >= start_date
        ).all(),
    }
    
    # Group by date
    activity_by_date = {}
    
    # Process each activity type
    for activity_type, activity_list in activities.items():
        for activity in activity_list:
            # Get the date for this activity
            if hasattr(activity, 'timestamp'):
                activity_date = activity.timestamp.date()
            elif hasattr(activity, 'submitted_at'):
                activity_date = activity.submitted_at.date()
            elif hasattr(activity, 'completed_at'):
                activity_date = activity.completed_at.date()
            else:
                continue
                
            date_str = activity_date.isoformat()
            
            if date_str not in activity_by_date:
                activity_by_date[date_str] = {
                    'date': date_str,
                    'mood': False,
                    'microAssessment': False,
                    'mbiAssessment': False,
                    'activities': {'boxBreathing': 0, 'stretching': 0}
                }
            
            # Mark the appropriate activity type
            if activity_type == 'moods':
                activity_by_date[date_str]['mood'] = True
            elif activity_type == 'micro_assessments':
                activity_by_date[date_str]['microAssessment'] = True
            elif activity_type == 'mbi_assessments':
                activity_by_date[date_str]['mbiAssessment'] = True
            elif activity_type == 'wellness_activities':
                if activity.activity_type == 'box_breathing':
                    activity_by_date[date_str]['activities']['boxBreathing'] += 1
                elif activity.activity_type == 'stretching':
                    activity_by_date[date_str]['activities']['stretching'] += 1
    
    # Fill in missing dates with no activity
    current_date = start_date.date()
    while current_date <= end_date.date():
        date_str = current_date.isoformat()
        if date_str not in activity_by_date:
            activity_by_date[date_str] = {
                'date': date_str,
                'mood': False,
                'microAssessment': False,
                'mbiAssessment': False,
                'activities': {'boxBreathing': 0, 'stretching': 0}
            }
        current_date += timedelta(days=1)
    
    # Convert to sorted list
    return sorted(activity_by_date.values(), key=lambda x: x['date'])

def calculate_enhanced_user_streak(db: Session, user_id: UUID):
    """Calculate current and longest streak for user"""
    history = get_user_activity_history_for_streak(db, user_id, days=365)  # Get full year for longest streak
    
    def has_activity(day):
        return (day['mood'] or day['microAssessment'] or day['mbiAssessment'] or 
                day['activities']['boxBreathing'] > 0 or day['activities']['stretching'] > 0)
    
    # Calculate current streak (from most recent day backwards)
    current_streak = 0
    for day in reversed(history):
        if has_activity(day):
            current_streak += 1
        else:
            break
    
    # Calculate longest streak
    longest_streak = 0
    temp_streak = 0
    
    for day in history:
        if has_activity(day):
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 0
    
    return current_streak, longest_streak



# COURSE CRUD OPERATIONS
def create_course(db: Session, course: schemas.CourseCreate):
    """Create a new course with its modules"""
    db_course = models.Course(**course.dict(exclude={'modules'}))
    db.add(db_course)
    db.flush()  # Get the course ID
    
    # Create modules if provided
    if course.modules:
        for i, module_data in enumerate(course.modules):
            db_module = models.CourseModule(
                course_id=db_course.id,
                **module_data.dict(),
                sort_order=i
            )
            db.add(db_module)
    
    db.commit()
    db.refresh(db_course)
    return db_course

def get_course_by_id(db: Session, course_id: str):
    """Get course by ID with modules"""
    return db.query(models.Course).filter(models.Course.id == course_id).first()

def get_courses(db: Session, category: Optional[str] = None, is_active: bool = True):
    """Get all courses, optionally filtered by category"""
    query = db.query(models.Course).filter(models.Course.is_active == is_active)
    if category:
        query = query.filter(models.Course.category == category)
    return query.order_by(models.Course.sort_order, models.Course.title).all()

def get_courses_with_user_progress(db: Session, user_id: UUID, category: Optional[str] = None):
    """Get courses with user progress information"""
    from sqlalchemy.orm import joinedload
    
    # Get courses
    courses_query = db.query(models.Course).filter(models.Course.is_active == True)
    if category:
        courses_query = courses_query.filter(models.Course.category == category)
    
    courses = courses_query.order_by(models.Course.sort_order, models.Course.title).all()
    
    # Get user progress for these courses
    progress_data = db.query(models.UserCourseProgress).filter(
        models.UserCourseProgress.user_id == user_id,
        models.UserCourseProgress.course_id.in_([c.id for c in courses])
    ).all()
    
    progress_dict = {p.course_id: p for p in progress_data}
    
    # Combine course data with progress
    result = []
    for course in courses:
        course_dict = course.__dict__.copy()
        progress = progress_dict.get(course.id)
        if progress:
            course_dict.update({
                'progress_percentage': progress.progress_percentage,
                'is_completed': progress.is_completed,
                'last_accessed_at': progress.last_accessed_at
            })
        else:
            course_dict.update({
                'progress_percentage': 0.0,
                'is_completed': False,
                'last_accessed_at': None
            })
        result.append(course_dict)
    
    return result

def update_course(db: Session, course_id: str, course_update: schemas.CourseUpdate):
    """Update course"""
    course = get_course_by_id(db, course_id)
    if not course:
        return None
    
    update_data = course_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(course, key, value)
    
    course.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(course)
    return course

def delete_course(db: Session, course_id: str):
    """Delete course (soft delete by setting is_active=False)"""
    course = get_course_by_id(db, course_id)
    if course:
        course.is_active = False
        db.commit()
        return True
    return False

# COURSE MODULE CRUD OPERATIONS
def create_course_module(db: Session, module: schemas.CourseModuleCreate):
    """Create a new course module"""
    db_module = models.CourseModule(**module.dict())
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

def get_course_modules(db: Session, course_id: str):
    """Get all modules for a course"""
    return db.query(models.CourseModule).filter(
        models.CourseModule.course_id == course_id
    ).order_by(models.CourseModule.sort_order).all()

def get_module_by_id(db: Session, module_id: UUID):
    """Get module by ID"""
    return db.query(models.CourseModule).filter(models.CourseModule.id == module_id).first()

def update_course_module(db: Session, module_id: UUID, module_update: dict):
    """Update course module"""
    module = get_module_by_id(db, module_id)
    if not module:
        return None
    
    for key, value in module_update.items():
        if hasattr(module, key):
            setattr(module, key, value)
    
    module.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(module)
    return module

# USER COURSE PROGRESS CRUD OPERATIONS
def start_course(db: Session, user_id: UUID, course_id: str):
    """Start a course for a user (create progress record)"""
    # Check if progress already exists
    existing_progress = db.query(models.UserCourseProgress).filter(
        models.UserCourseProgress.user_id == user_id,
        models.UserCourseProgress.course_id == course_id
    ).first()
    
    if existing_progress:
        # Update last accessed time
        existing_progress.last_accessed_at = datetime.utcnow()
        db.commit()
        return existing_progress
    
    # Create new progress record
    progress = models.UserCourseProgress(
        user_id=user_id,
        course_id=course_id,
        progress_percentage=0.0,
        is_completed=False
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress

def get_user_course_progress(db: Session, user_id: UUID, course_id: str):
    """Get user's progress for a specific course"""
    return db.query(models.UserCourseProgress).filter(
        models.UserCourseProgress.user_id == user_id,
        models.UserCourseProgress.course_id == course_id
    ).first()

def get_user_all_course_progress(db: Session, user_id: UUID):
    """Get all course progress for a user"""
    return db.query(models.UserCourseProgress).filter(
        models.UserCourseProgress.user_id == user_id
    ).all()

def complete_module(db: Session, user_id: UUID, course_id: str, module_id: UUID):
    """Mark a module as completed and update course progress"""
    # Get or create course progress
    course_progress = get_user_course_progress(db, user_id, course_id)
    if not course_progress:
        course_progress = start_course(db, user_id, course_id)
    
    # Check if module progress already exists
    module_progress = db.query(models.UserModuleProgress).filter(
        models.UserModuleProgress.user_course_progress_id == course_progress.id,
        models.UserModuleProgress.module_id == module_id
    ).first()
    
    if not module_progress:
        # Create new module progress
        module_progress = models.UserModuleProgress(
            user_course_progress_id=course_progress.id,
            module_id=module_id,
            is_completed=True,
            completion_date=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )
        db.add(module_progress)
    else:
        # Update existing module progress
        module_progress.is_completed = True
        module_progress.completion_date = datetime.utcnow()
        module_progress.completed_at = datetime.utcnow()
    
    # Update course progress
    total_modules = db.query(models.CourseModule).filter(
        models.CourseModule.course_id == course_id
    ).count()
    
    completed_modules = db.query(models.UserModuleProgress).join(
        models.CourseModule
    ).filter(
        models.UserModuleProgress.user_course_progress_id == course_progress.id,
        models.UserModuleProgress.is_completed == True,
        models.CourseModule.course_id == course_id
    ).count()
    
    if not module_progress.is_completed:  # If this is a new completion
        completed_modules += 1
    
    # Calculate progress percentage
    progress_percentage = (completed_modules / total_modules * 100) if total_modules > 0 else 100
    course_progress.progress_percentage = progress_percentage
    course_progress.last_accessed_at = datetime.utcnow()
    
    # Mark course as completed if all modules are done
    if progress_percentage >= 100:
        course_progress.is_completed = True
        course_progress.completion_date = datetime.utcnow()
    
    db.commit()
    db.refresh(course_progress)
    return course_progress

def update_module_time_spent(db: Session, user_id: UUID, course_id: str, module_id: UUID, time_spent_seconds: int):
    """Update time spent on a module"""
    course_progress = get_user_course_progress(db, user_id, course_id)
    if not course_progress:
        course_progress = start_course(db, user_id, course_id)
    
    module_progress = db.query(models.UserModuleProgress).filter(
        models.UserModuleProgress.user_course_progress_id == course_progress.id,
        models.UserModuleProgress.module_id == module_id
    ).first()
    
    if not module_progress:
        module_progress = models.UserModuleProgress(
            user_course_progress_id=course_progress.id,
            module_id=module_id,
            time_spent_seconds=time_spent_seconds
        )
        db.add(module_progress)
    else:
        module_progress.time_spent_seconds = max(module_progress.time_spent_seconds, time_spent_seconds)
    
    course_progress.last_accessed_at = datetime.utcnow()
    db.commit()
    return module_progress

def get_user_course_stats(db: Session, user_id: UUID):
    """Get comprehensive course statistics for a user"""
    # Get all course progress
    all_progress = get_user_all_course_progress(db, user_id)
    
    # Get total courses available
    total_courses = db.query(models.Course).filter(models.Course.is_active == True).count()
    
    # Calculate stats
    completed_courses = sum(1 for p in all_progress if p.is_completed)
    in_progress_courses = sum(1 for p in all_progress if not p.is_completed and p.progress_percentage > 0)
    
    # Get total modules completed
    total_modules_completed = db.query(models.UserModuleProgress).join(
        models.UserCourseProgress
    ).filter(
        models.UserCourseProgress.user_id == user_id,
        models.UserModuleProgress.is_completed == True
    ).count()
    
    # Calculate overall progress
    if total_courses > 0:
        overall_progress = sum(p.progress_percentage for p in all_progress) / total_courses
    else:
        overall_progress = 0.0
    
    # Get favorite category (most completed courses)
    category_counts = db.query(
        models.Course.category,
        func.count(models.Course.category).label('count')
    ).join(models.UserCourseProgress).filter(
        models.UserCourseProgress.user_id == user_id,
        models.UserCourseProgress.is_completed == True,
        models.Course.category.isnot(None)
    ).group_by(models.Course.category).order_by(desc('count')).first()
    
    favorite_category = category_counts[0] if category_counts else None
    
    # Get total time spent (in minutes)
    total_time_seconds = db.query(func.sum(models.UserModuleProgress.time_spent_seconds)).join(
        models.UserCourseProgress
    ).filter(models.UserCourseProgress.user_id == user_id).scalar() or 0
    
    total_time_minutes = total_time_seconds // 60
    
    return {
        'total_courses': total_courses,
        'completed_courses': completed_courses,
        'in_progress_courses': in_progress_courses,
        'total_modules_completed': total_modules_completed,
        'overall_progress_percentage': round(overall_progress, 1),
        'favorite_category': favorite_category,
        'total_time_spent_minutes': total_time_minutes
    }