from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float, Boolean, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Float, default=0.0)
    is_completed = Column(Boolean, default=False)
    certificate_url = Column(String(500), nullable=True)

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    lesson_progress = relationship("LessonProgress", back_populates="enrollment", cascade="all, delete-orphan")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id", ondelete="CASCADE"))
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"))
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    enrollment = relationship("Enrollment", back_populates="lesson_progress")
