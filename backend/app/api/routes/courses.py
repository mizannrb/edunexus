from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import re
from app.db.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from app.models.course import Course, CourseModule, Lesson, CourseStatus
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse, CourseListResponse,
    PaginatedCourses, ModuleCreate, ModuleUpdate, ModuleResponse,
    LessonCreate, LessonUpdate, LessonResponse
)

router = APIRouter(prefix="/courses", tags=["Courses"])


def make_slug(title: str) -> str:
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug).strip('-')
    return slug


def get_unique_slug(db: Session, title: str, exclude_id: Optional[int] = None) -> str:
    base_slug = make_slug(title)
    slug = base_slug
    counter = 1
    while True:
        query = db.query(Course).filter(Course.slug == slug)
        if exclude_id:
            query = query.filter(Course.id != exclude_id)
        if not query.first():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


# ── Public Endpoints ──────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=PaginatedCourses,
    summary="List published courses",
    description="Get all published courses with pagination and filters."
)
def list_courses(
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    is_free: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Course).filter(Course.status == CourseStatus.published)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%"))
    if category:
        query = query.filter(Course.category == category)
    if level:
        query = query.filter(Course.level == level)
    if is_free is not None:
        query = query.filter(Course.is_free == is_free)

    total = query.count()
    courses = query.offset((page - 1) * size).limit(size).all()

    items = []
    for c in courses:
        items.append(CourseListResponse(
            id=c.id, title=c.title, slug=c.slug,
            short_description=c.short_description,
            thumbnail_url=c.thumbnail_url, price=c.price,
            is_free=c.is_free, level=c.level, status=c.status,
            category=c.category,
            instructor_name=c.instructor.full_name if c.instructor else None,
            enrollment_count=len(c.enrollments),
            duration_hours=c.duration_hours, created_at=c.created_at,
        ))

    return PaginatedCourses(
        items=items, total=total, page=page, size=size,
        pages=(total + size - 1) // size
    )


@router.get(
    "/admin/all",
    response_model=PaginatedCourses,
    summary="List all courses (Admin)",
    description="Get all courses including drafts and archived. Admin only."
)
def list_all_courses_admin(
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    query = db.query(Course)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%"))
    if status:
        query = query.filter(Course.status == status)

    total = query.count()
    courses = query.offset((page - 1) * size).limit(size).all()

    items = [CourseListResponse(
        id=c.id, title=c.title, slug=c.slug,
        short_description=c.short_description,
        thumbnail_url=c.thumbnail_url, price=c.price,
        is_free=c.is_free, level=c.level, status=c.status,
        category=c.category,
        instructor_name=c.instructor.full_name if c.instructor else None,
        enrollment_count=len(c.enrollments),
        duration_hours=c.duration_hours, created_at=c.created_at,
    ) for c in courses]

    return PaginatedCourses(items=items, total=total, page=page, size=size, pages=(total + size - 1) // size)


@router.get(
    "/{slug}",
    response_model=CourseResponse,
    summary="Get course details",
    description="Get full course details including modules and lessons."
)
def get_course(slug: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseResponse(
        id=course.id, title=course.title, slug=course.slug,
        description=course.description, short_description=course.short_description,
        thumbnail_url=course.thumbnail_url, price=course.price,
        is_free=course.is_free, level=course.level, status=course.status,
        duration_hours=course.duration_hours, category=course.category,
        tags=course.tags, instructor_id=course.instructor_id,
        instructor_name=course.instructor.full_name if course.instructor else None,
        modules=course.modules,
        enrollment_count=len(course.enrollments),
        created_at=course.created_at, updated_at=course.updated_at,
    )


# ── Admin CRUD ────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create course (Admin)",
    description="Create a new course. Admin only."
)
def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    slug = get_unique_slug(db, course_data.title)
    course = Course(**course_data.model_dump(), slug=slug, instructor_id=current_admin.id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return CourseResponse(
        id=course.id, title=course.title, slug=course.slug,
        description=course.description, short_description=course.short_description,
        thumbnail_url=course.thumbnail_url, price=course.price,
        is_free=course.is_free, level=course.level, status=course.status,
        duration_hours=course.duration_hours, category=course.category,
        tags=course.tags, instructor_id=course.instructor_id,
        instructor_name=current_admin.full_name,
        modules=[], enrollment_count=0,
        created_at=course.created_at, updated_at=course.updated_at,
    )


@router.put(
    "/{course_id}",
    response_model=CourseResponse,
    summary="Update course (Admin)",
    description="Update course details. Admin only."
)
def update_course(
    course_id: int,
    update_data: CourseUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    data = update_data.model_dump(exclude_none=True)
    if "title" in data:
        data["slug"] = get_unique_slug(db, data["title"], exclude_id=course_id)
    for field, value in data.items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return CourseResponse(
        id=course.id, title=course.title, slug=course.slug,
        description=course.description, short_description=course.short_description,
        thumbnail_url=course.thumbnail_url, price=course.price,
        is_free=course.is_free, level=course.level, status=course.status,
        duration_hours=course.duration_hours, category=course.category,
        tags=course.tags, instructor_id=course.instructor_id,
        instructor_name=course.instructor.full_name if course.instructor else None,
        modules=course.modules, enrollment_count=len(course.enrollments),
        created_at=course.created_at, updated_at=course.updated_at,
    )


@router.delete(
    "/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete course (Admin)",
    description="Permanently delete a course and all its content. Admin only."
)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()


# ── Modules ───────────────────────────────────────────────────────────────────

@router.post(
    "/{course_id}/modules",
    response_model=ModuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add module to course (Admin)"
)
def add_module(
    course_id: int, module_data: ModuleCreate,
    db: Session = Depends(get_db), _: User = Depends(get_current_admin)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lessons_data = module_data.lessons or []
    module = CourseModule(
        course_id=course_id, title=module_data.title,
        description=module_data.description, order=module_data.order
    )
    db.add(module)
    db.flush()

    for lesson_data in lessons_data:
        lesson = Lesson(module_id=module.id, **lesson_data.model_dump())
        db.add(lesson)

    db.commit()
    db.refresh(module)
    return module


@router.put(
    "/{course_id}/modules/{module_id}",
    response_model=ModuleResponse,
    summary="Update module (Admin)"
)
def update_module(
    course_id: int, module_id: int, update_data: ModuleUpdate,
    db: Session = Depends(get_db), _: User = Depends(get_current_admin)
):
    module = db.query(CourseModule).filter(
        CourseModule.id == module_id, CourseModule.course_id == course_id
    ).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(module, field, value)
    db.commit()
    db.refresh(module)
    return module


@router.delete(
    "/{course_id}/modules/{module_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete module (Admin)"
)
def delete_module(
    course_id: int, module_id: int,
    db: Session = Depends(get_db), _: User = Depends(get_current_admin)
):
    module = db.query(CourseModule).filter(
        CourseModule.id == module_id, CourseModule.course_id == course_id
    ).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(module)
    db.commit()


# ── Lessons ───────────────────────────────────────────────────────────────────

@router.post(
    "/{course_id}/modules/{module_id}/lessons",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add lesson to module (Admin)"
)
def add_lesson(
    course_id: int, module_id: int, lesson_data: LessonCreate,
    db: Session = Depends(get_db), _: User = Depends(get_current_admin)
):
    module = db.query(CourseModule).filter(
        CourseModule.id == module_id, CourseModule.course_id == course_id
    ).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    lesson = Lesson(module_id=module_id, **lesson_data.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.put(
    "/{course_id}/modules/{module_id}/lessons/{lesson_id}",
    response_model=LessonResponse,
    summary="Update lesson (Admin)"
)
def update_lesson(
    course_id: int, module_id: int, lesson_id: int, update_data: LessonUpdate,
    db: Session = Depends(get_db), _: User = Depends(get_current_admin)
):
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id, Lesson.module_id == module_id
    ).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(lesson, field, value)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete(
    "/{course_id}/modules/{module_id}/lessons/{lesson_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete lesson (Admin)"
)
def delete_lesson(
    course_id: int, module_id: int, lesson_id: int,
    db: Session = Depends(get_db), _: User = Depends(get_current_admin)
):
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id, Lesson.module_id == module_id
    ).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
