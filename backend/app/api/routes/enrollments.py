from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from app.models.course import Course, Lesson, CourseStatus
from app.models.enrollment import Enrollment, LessonProgress
from app.schemas.enrollment import EnrollmentCreate, EnrollmentResponse, LessonProgressUpdate, DashboardStats

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


@router.post(
    "/",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll in a course",
    description="Enroll the current user in a course."
)
def enroll_course(
    data: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(
        Course.id == data.course_id,
        Course.status == CourseStatus.published
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not available")

    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == data.course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    enrollment = Enrollment(user_id=current_user.id, course_id=data.course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return EnrollmentResponse(
        id=enrollment.id, user_id=enrollment.user_id,
        course_id=enrollment.course_id, enrolled_at=enrollment.enrolled_at,
        completed_at=enrollment.completed_at, progress=enrollment.progress,
        is_completed=enrollment.is_completed,
        course_title=course.title, course_thumbnail=course.thumbnail_url,
    )


@router.get(
    "/my",
    response_model=List[EnrollmentResponse],
    summary="My enrollments",
    description="Get all courses the current user is enrolled in."
)
def my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    result = []
    for e in enrollments:
        result.append(EnrollmentResponse(
            id=e.id, user_id=e.user_id, course_id=e.course_id,
            enrolled_at=e.enrolled_at, completed_at=e.completed_at,
            progress=e.progress, is_completed=e.is_completed,
            course_title=e.course.title if e.course else None,
            course_thumbnail=e.course.thumbnail_url if e.course else None,
        ))
    return result


@router.post(
    "/{enrollment_id}/progress",
    summary="Update lesson progress",
    description="Mark a lesson as completed and recalculate course progress."
)
def update_progress(
    enrollment_id: int,
    data: LessonProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollment = db.query(Enrollment).filter(
        Enrollment.id == enrollment_id,
        Enrollment.user_id == current_user.id
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    lesson = db.query(Lesson).filter(Lesson.id == data.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    progress_rec = db.query(LessonProgress).filter(
        LessonProgress.enrollment_id == enrollment_id,
        LessonProgress.lesson_id == data.lesson_id
    ).first()

    if progress_rec:
        progress_rec.is_completed = data.is_completed
        if data.is_completed:
            progress_rec.completed_at = datetime.utcnow()
    else:
        progress_rec = LessonProgress(
            enrollment_id=enrollment_id,
            lesson_id=data.lesson_id,
            is_completed=data.is_completed,
            completed_at=datetime.utcnow() if data.is_completed else None
        )
        db.add(progress_rec)

    db.flush()

    # Recalculate overall progress
    course = enrollment.course
    total_lessons = sum(len(m.lessons) for m in course.modules)
    if total_lessons > 0:
        completed_count = db.query(LessonProgress).filter(
            LessonProgress.enrollment_id == enrollment_id,
            LessonProgress.is_completed == True
        ).count()
        enrollment.progress = round((completed_count / total_lessons) * 100, 2)
        if enrollment.progress >= 100:
            enrollment.is_completed = True
            enrollment.completed_at = datetime.utcnow()

    db.commit()
    return {"message": "Progress updated", "progress": enrollment.progress}


@router.delete(
    "/{enrollment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unenroll from course",
    description="Remove the current user's enrollment from a course."
)
def unenroll(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollment = db.query(Enrollment).filter(
        Enrollment.id == enrollment_id,
        Enrollment.user_id == current_user.id
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(enrollment)
    db.commit()


@router.get(
    "/admin/stats",
    response_model=DashboardStats,
    summary="Dashboard statistics (Admin)",
    description="Get platform-wide statistics for the admin dashboard."
)
def dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    from app.models.course import CourseStatus
    return DashboardStats(
        total_users=db.query(User).count(),
        total_courses=db.query(Course).count(),
        total_enrollments=db.query(Enrollment).count(),
        published_courses=db.query(Course).filter(Course.status == CourseStatus.published).count(),
        active_users=db.query(User).filter(User.is_active == True).count(),
    )
