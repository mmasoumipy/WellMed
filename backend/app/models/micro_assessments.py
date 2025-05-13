from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class MicroAssessment(Base):
    __tablename__ = 'micro_assessments'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    fatigue_level = Column(Integer)
    stress_level = Column(Integer)
    work_satisfaction = Column(Integer)
    sleep_quality = Column(Integer)
    support_feeling = Column(Integer)
    comments = Column(Text)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="micro_assessments")