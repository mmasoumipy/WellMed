from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
import uuid
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String)
    birthday = Column(Date)
    specialty = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    moods = relationship("MoodEntry", back_populates="user")
    micro_assessments = relationship("MicroAssessment", back_populates="user")
    mbi_assessments = relationship("MBIAssessment", back_populates="user")
    reminders = relationship("Reminder", back_populates="user")
    goals = relationship("Goal", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    chatbot_conversations = relationship("ChatbotConversation", back_populates="user")
    health_data = relationship("HealthData", back_populates="user")

