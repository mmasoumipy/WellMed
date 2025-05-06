from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserCreate, UserUpdate, UserResponse
from models import User
from crud import create_user, get_user_by_email, update_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db=db, user=user)

@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user_info(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = update_user(db, user_id=user_id, user_update=user_update)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
