from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.course import CourseLevel, CourseStatus


class LessonBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=300)
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: int = 0
    order: int = 0
    is_preview: bool = False


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    order: Optional[int] = None
    is_preview: Optional[bool] = None


class LessonResponse(LessonBase):
    id: int
    module_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ModuleBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=300)
    description: Optional[str] = None
    order: int = 0


class ModuleCreate(ModuleBase):
    lessons: Optional[List[LessonCreate]] = []


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


class ModuleResponse(ModuleBase):
    id: int
    course_id: int
    lessons: List[LessonResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    thumbnail_url: Optional[str] = None
    price: float = 0.0
    is_free: bool = True
    level: CourseLevel = CourseLevel.beginner
    status: CourseStatus = CourseStatus.draft
    duration_hours: float = 0.0
    category: Optional[str] = None
    tags: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=300)
    description: Optional[str] = None
    short_description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    price: Optional[float] = None
    is_free: Optional[bool] = None
    level: Optional[CourseLevel] = None
    status: Optional[CourseStatus] = None
    duration_hours: Optional[float] = None
    category: Optional[str] = None
    tags: Optional[str] = None


class CourseResponse(CourseBase):
    id: int
    slug: str
    instructor_id: Optional[int]
    instructor_name: Optional[str] = None
    modules: List[ModuleResponse] = []
    enrollment_count: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    id: int
    title: str
    slug: str
    short_description: Optional[str]
    thumbnail_url: Optional[str]
    price: float
    is_free: bool
    level: CourseLevel
    status: CourseStatus
    category: Optional[str]
    instructor_name: Optional[str] = None
    enrollment_count: Optional[int] = 0
    duration_hours: float
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedCourses(BaseModel):
    items: List[CourseListResponse]
    total: int
    page: int
    size: int
    pages: int
