from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

from app.models.mood_enteries import MoodEntry
from app.models.mbi_assessments import MBIAssessment
from app.models.journal_enteries import JournalEntry
from app.models.micro_assessments import MicroAssessment
from app.models.chatbot_conversations import ChatbotConversation
from app.models.goals import Goal
from app.models.reminders import Reminder


class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    birthday = Column(Date, nullable=True)
    specialty = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(String, nullable=False, default=datetime.utcnow)
    updated_at = Column(String, nullable=True)

    # Relationships
    mood_entries = relationship("MoodEntry", back_populates="user")
    mbi_assessments = relationship("MBIAssessment", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    micro_assessments = relationship("MicroAssessment", back_populates="user")
    chatbot_conversations = relationship("ChatbotConversation", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    reminders = relationship("Reminder", back_populates="user")
    health_data = relationship("HealthData", back_populates="user")
