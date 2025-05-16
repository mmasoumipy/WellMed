from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from enum import Enum as PyEnum

from app.database import Base

class GoalTypeEnum(str, PyEnum):
    PERSONAL = "Personal"
    PROFESSIONAL = "Professional"
    HEALTH = "Health"
    COMMUNICATION = "Communication"
    OTHER = "Other"

class Goal(Base):
    __tablename__ = 'goals'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    # goal_type = Enum('Personal', 'Professional', 'Health', 'Communication', 'Other', name='goal_type_enum', nullable=True)
    goal_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="goals")