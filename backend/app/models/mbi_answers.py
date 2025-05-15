from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base


class MBIAnswer(Base):
    __tablename__ = 'mbi_answers'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mbi_id = Column(UUID(as_uuid=True), ForeignKey('mbi_assessments.id'), nullable=False)
    question_id = Column(Integer, nullable=False)
    answer_value = Column(Integer, nullable=False)  # Typically 0-6 for MBI
    # dimension = Column(String(2), nullable=False)  # 'EE', 'DP', or 'PA'
    submitted_at = Column(DateTime, default=datetime.utcnow)

    mbi = relationship("MBIAssessment", back_populates="mbi_answers")

    __table_args__ = (
        UniqueConstraint('mbi_id', 'question_id', name='uix_assessment_question'),
    )