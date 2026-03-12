from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class CourseLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class CourseStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False, index=True)
    slug = Column(String(350), unique=True, index=True)
    description = Column(Text)
    short_description = Column(String(500))
    thumbnail_url = Column(String(500))
    price = Column(Float, default=0.0)
    is_free = Column(Boolean, default=True)
    level = Column(Enum(CourseLevel), default=CourseLevel.beginner)
    status = Column(Enum(CourseStatus), default=CourseStatus.draft)
    duration_hours = Column(Float, default=0.0)
    category = Column(String(100))
    tags = Column(String(500))  # comma-separated
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    instructor = relationship("User", back_populates="created_courses")
    modules = relationship("CourseModule", back_populates="course", cascade="all, delete-orphan", order_by="CourseModule.order")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


class CourseModule(Base):
    __tablename__ = "course_modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    title = Column(String(300), nullable=False)
    description = Column(Text)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("course_modules.id", ondelete="CASCADE"))
    title = Column(String(300), nullable=False)
    content = Column(Text)
    video_url = Column(String(500))
    duration_minutes = Column(Integer, default=0)
    order = Column(Integer, default=0)
    is_preview = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    module = relationship("CourseModule", back_populates="lessons")
