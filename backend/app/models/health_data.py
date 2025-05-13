from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.database import Base

class HealthData(Base):
    __tablename__ = 'health_data'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    type = Column(String)
    value = Column(Float)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="health_data")