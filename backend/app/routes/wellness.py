from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import User
from app.utils.token import get_current_user
from app.database import get_db
from app.schemas import WellnessActivityCreate, WellnessActivityResponse, WellnessStatsResponse
from app.crud import create_wellness_activity, get_user_wellness_activities, get_wellness_activity_by_id, get_user_wellness_stats
from uuid import UUID
from typing import List

router = APIRouter()

@router.post("/", response_model=WellnessActivityResponse)
def record_wellness_activity(
    activity: WellnessActivityCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a wellness activity (box breathing or stretching)"""
    if activity.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only record activities for yourself")
    
    # Validate activity type
    if activity.activity_type not in ['box_breathing', 'stretching']:
        raise HTTPException(status_code=400, detail="Invalid activity type")
    
    # Validate duration (must be positive and reasonable)
    if activity.duration_seconds <= 0 or activity.duration_seconds > 7200:  # Max 2 hours
        raise HTTPException(status_code=400, detail="Duration must be between 1 second and 2 hours")
    
    return create_wellness_activity(db=db, activity=activity)

@router.get("/user/{user_id}", response_model=List[WellnessActivityResponse])
def get_user_activities(
    user_id: UUID,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get wellness activities for a specific user"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own activities")
    
    return get_user_wellness_activities(db, user_id=user_id, limit=limit)

@router.get("/user/{user_id}/stats", response_model=WellnessStatsResponse)
def get_user_wellness_statistics(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get wellness activity statistics for a user"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own statistics")
    
    stats = get_user_wellness_stats(db, user_id=user_id)
    return WellnessStatsResponse(**stats)

@router.get("/{activity_id}", response_model=WellnessActivityResponse)
def get_activity_details(
    activity_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific wellness activity"""
    activity = get_wellness_activity_by_id(db, activity_id=activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    if activity.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only access your own activities")
    
    return activity