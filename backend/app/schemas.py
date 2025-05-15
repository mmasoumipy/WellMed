from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

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
    comments: Optional[str]
    submitted_at: datetime

class MicroAssessmentCreate(MicroAssessmentBase):
    pass

class MicroAssessmentOut(MicroAssessmentBase):
    id: UUID

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
    content: str
    audio_path: Optional[str]
    created_at: datetime

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryResponse(JournalEntryBase):
    pass

class JournalEntryOut(JournalEntryBase):
    id: UUID
    analysis: str

    class Config:
        orm_mode = True

# GOAL
class GoalBase(BaseModel):
    user_id: int
    title: str
    description: Optional[str]

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    pass

class GoalOut(GoalBase):
    id: int

    class Config:
        orm_mode = True

# CHATBOT MESSAGE
class ChatMessageBase(BaseModel):
    user_id: int
    message: str
    response: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    pass

class ChatMessageOut(ChatMessageBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
