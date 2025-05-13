from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class MBIAnswer(Base):
    __tablename__ = 'mbi_answers'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mbi_id = Column(UUID(as_uuid=True), ForeignKey('mbi_assessments.id'))
    question_id = Column(Integer)
    answer_value = Column(Integer)

    mbi = relationship("MBIAssessment", back_populates="mbi_answers")