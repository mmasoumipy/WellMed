from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class UserCourseProgress(Base):
    __tablename__ = 'user_course_progress'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    progress_percentage = Column(Float, default=0.0)  # 0.0 to 100.0
    is_completed = Column(Boolean, default=False)
    completion_date = Column(DateTime, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    last_accessed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="course_progresses")
    course = relationship("Course", back_populates="user_progresses")
    module_progresses = relationship("UserModuleProgress", back_populates="course_progress", cascade="all, delete-orphan")
