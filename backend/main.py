from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, SessionLocal
from models import user as user_model
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS (very important for React Native)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)







user_model.Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register_user(email: str, password: str, db: Session = Depends(get_db)):
    hashed_password = pwd_context.hash(password)
    db_user = user_model.User(email=email, hashed_password=hashed_password)
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
        return {"message": "User registered successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered.")

@app.post("/login")
def login_user(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(user_model.User).filter(user_model.User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful"}
