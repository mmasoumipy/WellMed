from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
import uuid
from datetime import datetime

Base = declarative_base()


class MBIAssessment(Base):
    __tablename__ = 'mbi_assessments'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="mbi_assessments")
    answers = relationship("MBIAnswer", back_populates="mbi")