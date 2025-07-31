from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID
from enum import Enum

# USER
class UserBase(BaseModel):
    email: str
    name: str
    birthday: Optional[date]
    specialty: Optional[str]
    created_at: datetime

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str]
    birthday: Optional[date]
    specialty: Optional[str]
    updated_at: datetime

class UserResponse(UserBase):
    id: UUID
    email: str
    name: str
    birthday: date | None = None
    specialty: str | None = None

    class Config:
        from_attributes = True

# MOOD
class MoodBase(BaseModel):
    user_id: UUID
    mood: str
    reason: Optional[str]
    timestamp: datetime

class MoodCreate(MoodBase):
    pass

class MoodResponse(MoodBase):
    pass

class MoodOut(MoodBase):
    id: UUID

    class Config:
        orm_mode = True

# MICRO ASSESSMENT
class MicroAssessmentBase(BaseModel):
    user_id: UUID
    fatigue_level: int
    stress_level: int
    work_satisfaction: int
    sleep_quality: int
    support_feeling: int
    comments: Optional[str] = None
    submitted_at: datetime

class MicroAssessmentCreate(MicroAssessmentBase):
    pass

class MicroAssessmentOut(MicroAssessmentBase):
    id: Optional[UUID] = None

    class Config:
        orm_mode = True

# MBI ASSESSMENT
class MBIAnswerCreate(BaseModel):
    question_id: int
    answer_value: int

class MBIAssessmentCreate(BaseModel):
    user_id: UUID
    answers: List[MBIAnswerCreate]

class MBIAnswerOut(BaseModel):
    id: UUID
    question_id: int
    answer_value: int
    submitted_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True

class MBIAssessmentOut(BaseModel):
    id: UUID
    user_id: UUID
    emotional_exhaustion: int
    depersonalization: int
    personal_accomplishment: int
    submitted_at: datetime
    answers: List[MBIAnswerOut] = []
    
    class Config:
        orm_mode = True
        from_attributes = True

# MBI ANSWER



# JOURNAL ENTRY
class JournalEntryBase(BaseModel):
    user_id: UUID
    text_content: str
    audio_path: Optional[str] = None
    created_at: Optional[datetime] = None

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryResponseOut(JournalEntryBase):
    id: UUID
    analysis: str

    class Config:
        from_attributes = True

# GOAL
class GoalTypeEnum(str, Enum):
    PERSONAL = "Personal"
    PROFESSIONAL = "Professional"
    HEALTH = "Health"
    COMMUNICATION = "Communication"
    OTHER = "Other"

class GoalBase(BaseModel):
    user_id: UUID
    title: str
    description: Optional[str]
    goal_type: GoalTypeEnum | None

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    pass

class GoalOut(GoalBase):
    id: UUID

    class Config:
        orm_mode = True

# Conversation schemas
class ConversationBase(BaseModel):
    title: Optional[str] = "New Conversation"

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(ConversationBase):
    title: Optional[str] = None

class Conversation(ConversationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Message schemas
class MessageBase(BaseModel):
    content: str
    role: str  # 'user' or 'assistant'

class MessageCreate(MessageBase):
    conversation_id: UUID

class Message(MessageBase):
    id: UUID
    conversation_id: UUID
    created_at: datetime

    class Config:
        orm_mode = True

class ConversationWithMessages(Conversation):
    messages: List[Message]

    class Config:
        orm_mode = True


# CHATBOT MESSAGE
class ChatMessageBase(BaseModel):
    user_id: UUID
    message: str
    response: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    pass

class ChatMessageOut(ChatMessageBase):
    id: UUID
    timestamp: datetime

    class Config:
        orm_mode = True


# WELLNESS ACTIVITIES
class WellnessActivityBase(BaseModel):
    user_id: UUID
    activity_type: str  # 'box_breathing', 'stretching'
    duration_seconds: int
    cycles_completed: Optional[int] = None
    poses_completed: Optional[int] = None
    session_data: Optional[str] = None  # JSON string
    completed_at: datetime

class WellnessActivityCreate(WellnessActivityBase):
    pass

class WellnessActivityResponse(WellnessActivityBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class WellnessActivityOut(WellnessActivityBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# WELLNESS STATISTICS
class WellnessStatsResponse(BaseModel):
    total_sessions: int
    total_duration_minutes: int
    box_breathing_sessions: int
    stretching_sessions: int
    avg_session_duration: float
    longest_session_duration: int
    current_streak: int
    activities_this_week: int

    class Config:
        from_attributes = True


# COURSE
class CourseModuleBase(BaseModel):
    module_id: str
    title: str
    content: str
    duration: Optional[str] = None
    module_type: str = 'reading'
    sort_order: int = 0
    key_takeaways: Optional[List[str]] = None
    action_items: Optional[List[str]] = None

class CourseModuleCreate(CourseModuleBase):
    course_id: str

class CourseModuleOut(CourseModuleBase):
    id: UUID
    course_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    duration: Optional[str] = None
    difficulty: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    category: Optional[str] = None
    modules_count: int = 1
    is_active: bool = True
    sort_order: int = 0
    image_path: Optional[str] = None

class CourseCreate(CourseBase):
    modules: Optional[List[CourseModuleBase]] = []

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    difficulty: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    category: Optional[str] = None
    modules_count: Optional[int] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    image_path: Optional[str] = None

class CourseOut(CourseBase):
    created_at: datetime
    updated_at: datetime
    modules: List[CourseModuleOut] = []
    
    class Config:
        from_attributes = True

class CourseWithProgress(CourseOut):
    progress_percentage: Optional[float] = 0.0
    is_completed: Optional[bool] = False
    last_accessed_at: Optional[datetime] = None

# USER COURSE PROGRESS
class UserModuleProgressBase(BaseModel):
    is_completed: bool = False
    time_spent_seconds: int = 0

class UserModuleProgressCreate(UserModuleProgressBase):
    user_course_progress_id: UUID
    module_id: UUID

class UserModuleProgressUpdate(BaseModel):
    is_completed: Optional[bool] = None
    time_spent_seconds: Optional[int] = None

class UserModuleProgressOut(UserModuleProgressBase):
    id: UUID
    user_course_progress_id: UUID
    module_id: UUID
    completion_date: Optional[datetime] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserCourseProgressBase(BaseModel):
    progress_percentage: float = 0.0
    is_completed: bool = False

class UserCourseProgressCreate(UserCourseProgressBase):
    user_id: UUID
    course_id: str

class UserCourseProgressUpdate(BaseModel):
    progress_percentage: Optional[float] = None
    is_completed: Optional[bool] = None
    last_accessed_at: Optional[datetime] = None

class UserCourseProgressOut(UserCourseProgressBase):
    id: UUID
    user_id: UUID
    course_id: str
    completion_date: Optional[datetime] = None
    started_at: datetime
    last_accessed_at: datetime
    module_progresses: List[UserModuleProgressOut] = []
    
    class Config:
        from_attributes = True

# COURSE CATEGORY
class CourseCategoryOut(BaseModel):
    id: str
    title: str
    description: str
    courses: List[CourseWithProgress]

# COURSE STATS
class CourseStatsOut(BaseModel):
    total_courses: int
    completed_courses: int
    in_progress_courses: int
    total_modules_completed: int
    overall_progress_percentage: float
    favorite_category: Optional[str] = None
    total_time_spent_minutes: int
    
    class Config:
        from_attributes = True
