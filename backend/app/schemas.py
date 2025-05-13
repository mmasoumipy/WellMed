from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

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
    id: int
    updated_at: datetime

    class Config:
        orm_mode = True

class UserOut(UserBase):
    id: int

    class Config:
        orm_mode = True

# MOOD
class MoodBase(BaseModel):
    user_id: int
    mood: str
    reason: Optional[str]
    timestamp: datetime

class MoodCreate(MoodBase):
    pass

class MoodResponse(MoodBase):
    pass

class MoodOut(MoodBase):
    id: int

    class Config:
        orm_mode = True

# MICRO ASSESSMENT
class MicroAssessmentBase(BaseModel):
    user_id: int
    fatigue: int
    stress: int
    satisfaction: int
    sleep: int
    comments: Optional[str]
    submitted_at: datetime

class MicroAssessmentCreate(MicroAssessmentBase):
    pass

class MicroAssessmentOut(MicroAssessmentBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# MBI ASSESSMENT
class MBIAssessmentBase(BaseModel):
    user_id: int
    emotional_exhaustion: int
    depersonalization: int
    personal_accomplishment: int
    

class MBIAssessmentCreate(MBIAssessmentBase):
    pass

class MBIAssessmentResponse(MBIAssessmentBase):
    pass
    
class MBIAssessmentResponseCreate(MBIAssessmentBase):
    pass

class MBIAssessmentOut(MBIAssessmentBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# MBI ANSWER
class MBIAnswerBase(BaseModel):
    user_id: int
    question_id: int
    answer_value: int
    mbi_id: int

class MBIAnswerCreate(MBIAnswerBase):
    pass

class MBIAnswerOut(MBIAnswerBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True


# JOURNAL ENTRY
class JournalEntryBase(BaseModel):
    user_id: int
    content: str

class JournalEntryCreate(JournalEntryBase):
    pass

class JournalEntryResponse(JournalEntryBase):
    pass

class JournalEntryOut(JournalEntryBase):
    id: int
    timestamp: datetime

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
