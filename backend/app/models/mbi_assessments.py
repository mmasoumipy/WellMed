from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class MBIAssessment(Base):
    __tablename__ = 'mbi_assessments'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    emotional_exhaustion = Column(Integer)
    depersonalization = Column(Integer)
    personal_accomplishment = Column(Integer)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="mbi_assessments")
    mbi_answers = relationship("MBIAnswer", back_populates="mbi")