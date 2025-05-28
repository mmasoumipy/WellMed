from fastapi import APIRouter, HTTPException, Depends
from fastapi import Form
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.utils.token import create_access_token
from app.database import get_db
from app.schemas import UserCreate, UserUpdate, UserResponse, UserLogin
from app.models import User
from app.crud import create_user, get_user_by_email, update_user
import logging


router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

@router.post("/login")
def login(
    username: str = Form(...), 
    password: str = Form(...), 
    db: Session = Depends(get_db)
):
    logging.info(f"Login attempt for email: {username}")
    db_user = get_user_by_email(db, username)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not pwd_context.verify(password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")

    access_token = create_access_token(data={"sub": str(db_user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name
        }
    }