from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class CourseModule(Base):
    __tablename__ = 'course_modules'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    module_id = Column(String(100), nullable=False)  # "intro", "science", etc.
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    duration = Column(String(20), nullable=True)  # "4 min", "3 min", etc.
    module_type = Column(String(20), default='reading')  # 'reading', 'video', 'interactive', 'exercise'
    sort_order = Column(Integer, default=0)
    key_takeaways = Column(JSON, nullable=True)  # Array of strings
    action_items = Column(JSON, nullable=True)  # Array of strings (optional)
    image_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    course = relationship("Course", back_populates="modules")
    user_module_progresses = relationship("UserModuleProgress", back_populates="module", cascade="all, delete-orphan")
