from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class WellnessActivity(Base):
    __tablename__ = 'wellness_activities'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    activity_type = Column(String(50), nullable=False)  # 'box_breathing', 'stretching'
    duration_seconds = Column(Integer, nullable=False)
    cycles_completed = Column(Integer, nullable=True)  # for box breathing
    poses_completed = Column(Integer, nullable=True)   # for stretching
    session_data = Column(Text, nullable=True)  # Change from JSON to Text to store JSON string
    completed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="wellness_activities")