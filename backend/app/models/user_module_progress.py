from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey, String, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class UserModuleProgress(Base):
    __tablename__ = 'user_module_progress'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_course_progress_id = Column(UUID(as_uuid=True), ForeignKey('user_course_progress.id'), nullable=False)
    module_id = Column(UUID(as_uuid=True), ForeignKey('course_modules.id'), nullable=False)
    is_completed = Column(Boolean, default=False)
    completion_date = Column(DateTime, nullable=True)
    time_spent_seconds = Column(Integer, default=0)  # Track time spent on module
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    course_progress = relationship("UserCourseProgress", back_populates="module_progresses")
    module = relationship("CourseModule", back_populates="user_module_progresses")
    