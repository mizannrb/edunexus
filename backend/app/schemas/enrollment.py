from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class EnrollmentCreate(BaseModel):
    course_id: int


class LessonProgressUpdate(BaseModel):
    lesson_id: int
    is_completed: bool


class EnrollmentResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    progress: float
    is_completed: bool
    course_title: Optional[str] = None
    course_thumbnail: Optional[str] = None

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_users: int
    total_courses: int
    total_enrollments: int
    published_courses: int
    active_users: int
