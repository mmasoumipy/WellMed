from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.models import User, Course, CourseModule, UserModuleProgress, UserCourseProgress
from app.utils.token import get_current_user
from app.database import get_db
from app.schemas import (
    CourseCreate, CourseUpdate, CourseOut, CourseWithProgress,
    UserCourseProgressOut, UserCourseProgressUpdate,
    UserModuleProgressUpdate, CourseStatsOut, CourseCategoryOut
)
from app.crud import (
    create_course, get_course_by_id, get_courses, get_courses_with_user_progress,
    update_course, delete_course, get_course_modules,
    start_course, get_user_course_progress, get_user_all_course_progress,
    complete_module, update_module_time_spent, get_user_course_stats
)
from app.models import UserCourseProgress, UserModuleProgress, CourseModule, Course
from uuid import UUID
from typing import List, Optional

router = APIRouter()

# COURSE MANAGEMENT ROUTES (Admin/Content Management)
@router.post("/", response_model=CourseOut)
def create_new_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new course (admin only)"""
    # Add role-based access control here if needed
    return create_course(db=db, course=course)

@router.get("/", response_model=List[CourseOut])
def get_all_courses(
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Get all active courses"""
    return get_courses(db=db, category=category)

@router.get("/{course_id}", response_model=CourseOut)
def get_course(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Get course by ID with modules"""
    course = get_course_by_id(db, course_id=course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseOut)
def update_course_info(
    course_id: str,
    course_update: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update course (admin only)"""
    course = update_course(db, course_id=course_id, course_update=course_update)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.delete("/{course_id}")
def delete_course_endpoint(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete course (admin only)"""
    success = delete_course(db, course_id=course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"detail": "Course deleted successfully"}

# USER COURSE INTERACTION ROUTES
@router.get("/user/{user_id}/courses", response_model=List[CourseWithProgress])
def get_user_courses(
    user_id: UUID,
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all courses with user progress"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own course progress")
    
    courses = get_courses_with_user_progress(db, user_id=user_id, category=category)
    return courses

@router.get("/user/{user_id}/categories", response_model=List[CourseCategoryOut])
def get_courses_by_category(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get courses organized by category with user progress"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own course progress")
    
    # Get courses with progress for each category
    categories = [
        {
            'id': 'core',
            'title': 'Core Burnout Prevention',
            'description': 'Essential modules for every healthcare professional',
        },
        {
            'id': 'quick-wins',
            'title': 'Quick Wins Mini-Courses',
            'description': 'Immediate strategies for breaks or between shifts',
        },
        {
            'id': 'specialty',
            'title': 'Specialty-Specific Courses',
            'description': 'Tailored content for different healthcare roles',
        }
    ]
    
    result = []
    for category in categories:
        courses = get_courses_with_user_progress(db, user_id=user_id, category=category['id'])
        result.append({
            **category,
            'courses': courses
        })
    
    return result

@router.post("/user/{user_id}/courses/{course_id}/start", response_model=UserCourseProgressOut)
def start_user_course(
    user_id: UUID,
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a course for a user"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only start courses for yourself")
    
    # Verify course exists
    course = get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    progress = start_course(db, user_id=user_id, course_id=course_id)
    return progress

@router.get("/user/{user_id}/courses/{course_id}/progress", response_model=UserCourseProgressOut)
def get_course_progress(
    user_id: UUID,
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's progress for a specific course"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own progress")
    
    progress = get_user_course_progress(db, user_id=user_id, course_id=course_id)
    if not progress:
        raise HTTPException(status_code=404, detail="Course progress not found")
    return progress

@router.post("/user/{user_id}/courses/{course_id}/modules/{module_id}/complete")
def complete_course_module(
    user_id: UUID,
    course_id: str,
    module_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a module as completed"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own progress")
    
    # Verify course and module exist
    course = get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    from app.crud import get_module_by_id
    module = get_module_by_id(db, module_id)
    if not module or module.course_id != course_id:
        raise HTTPException(status_code=404, detail="Module not found")
    
    progress = complete_module(db, user_id=user_id, course_id=course_id, module_id=module_id)
    return {
        "detail": "Module completed successfully",
        "progress_percentage": progress.progress_percentage,
        "is_course_completed": progress.is_completed
    }

@router.put("/user/{user_id}/courses/{course_id}/modules/{module_id}/time")
def update_module_time(
    user_id: UUID,
    course_id: str,
    module_id: UUID,
    time_spent_seconds: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update time spent on a module"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own progress")
    
    if time_spent_seconds < 0:
        raise HTTPException(status_code=400, detail="Time spent cannot be negative")
    
    progress = update_module_time_spent(db, user_id=user_id, course_id=course_id, 
                                      module_id=module_id, time_spent_seconds=time_spent_seconds)
    return {"detail": "Module time updated successfully"}

@router.get("/user/{user_id}/progress", response_model=List[UserCourseProgressOut])
def get_all_user_progress(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all course progress for a user"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own progress")
    
    return get_user_all_course_progress(db, user_id=user_id)

@router.get("/user/{user_id}/stats", response_model=CourseStatsOut)
def get_user_course_statistics(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive course statistics for a user"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own statistics")
    
    stats = get_user_course_stats(db, user_id=user_id)
    return CourseStatsOut(**stats)

# COURSE CONTENT ROUTES
@router.get("/{course_id}/modules")
def get_course_module_list(
    course_id: str,
    db: Session = Depends(get_db)
):
    """Get all modules for a course"""
    course = get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    modules = get_course_modules(db, course_id=course_id)
    return modules

# SEARCH AND DISCOVERY ROUTES
@router.get("/search/courses")
def search_courses(
    q: str = Query(..., description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    db: Session = Depends(get_db)
):
    """Search courses by title, description, or content"""
    from sqlalchemy import or_, and_

    query = db.query(Course).filter(Course.is_active == True)

    # Text search
    search_filter = or_(
        Course.title.ilike(f"%{q}%"),
        Course.description.ilike(f"%{q}%")
    )
    query = query.filter(search_filter)
    
    # Apply filters
    if category:
        query = query.filter(Course.category == category)
    if difficulty:
        query = query.filter(Course.difficulty == difficulty)

    courses = query.order_by(Course.sort_order, Course.title).all()
    return courses

@router.get("/recommended/{user_id}")
def get_recommended_courses(
    user_id: UUID,
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get recommended courses for a user based on their progress and preferences"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only get recommendations for yourself")
    
    # Get user's completed courses
    completed_courses = db.query(UserCourseProgress.course_id).filter(
        UserCourseProgress.user_id == user_id,
        UserCourseProgress.is_completed == True
    ).subquery()
    
    # Get user's favorite category
    stats = get_user_course_stats(db, user_id)
    favorite_category = stats.get('favorite_category')
    
    # Recommend courses user hasn't completed
    query = db.query(Course).filter(
        Course.is_active == True,
        ~Course.id.in_(completed_courses)
    )
    
    # Prioritize favorite category
    if favorite_category:
        query = query.order_by(
            Course.category == favorite_category,
            Course.sort_order,
            Course.title
        )
    else:
        query = query.order_by(Course.sort_order, Course.title)

    recommended = query.limit(limit).all()
    return recommended
