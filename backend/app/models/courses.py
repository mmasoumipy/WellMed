from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class Course(Base):
    __tablename__ = 'courses'
    
    id = Column(String, primary_key=True)  # Use string ID like 'burnout-basics'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(String(50), nullable=True)  # "15 min", "20 min", etc.
    difficulty = Column(String(20), nullable=True)  # "Beginner", "Intermediate", "Advanced"
    icon = Column(String(100), nullable=True)  # Icon name
    color = Column(String(7), nullable=True)  # Hex color code
    category = Column(String(50), nullable=True)  # "core", "quick-wins", "specialty"
    modules_count = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    image_path = Column(String(255), nullable=True)  # Optional course image
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    modules = relationship("CourseModule", back_populates="course", cascade="all, delete-orphan")
    user_progresses = relationship("UserCourseProgress", back_populates="course", cascade="all, delete-orphan")
