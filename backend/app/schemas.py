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
