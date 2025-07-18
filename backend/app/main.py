# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import FileResponse
# # from .models import models
# # import models
# from app import models
# from app.database import engine
# from app.routes import users, moods, micro_assessments, mbi_assessments, journal, chatbot, goals

# models.Base.metadata.create_all(bind=engine)
# app = FastAPI()

# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(moods.router, prefix="/moods", tags=["Moods"])
# app.include_router(micro_assessments.router, prefix="/micro", tags=["Micro Assessments"])
# app.include_router(mbi_assessments.router, prefix="/mbi", tags=["MBI Assessments"])
# app.include_router(journal.router, prefix="/journals", tags=["Journals"])
# app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
# app.include_router(goals.router, prefix="/goals", tags=["Goals"])
# # app.include_router(health.router, prefix="/health", tags=["Health"])

# @app.get("/")
# def root():
#     return {"message": "Backend is running 🚀"}




from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import logging
import os
from datetime import datetime

# Import all models to ensure they're loaded
from app import models
from app.database import engine
from app.routes import (
    users, moods, micro_assessments, mbi_assessments, 
    journal, chatbot, goals, wellness
)

from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WellMed API",
    description="Burnout prevention and wellness tracking for healthcare professionals",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
os.makedirs("uploads/audio", exist_ok=True)

# Include routers
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(moods.router, prefix="/moods", tags=["Moods"])
app.include_router(micro_assessments.router, prefix="/micro", tags=["Micro Assessments"])
app.include_router(mbi_assessments.router, prefix="/mbi", tags=["MBI Assessments"])
app.include_router(journal.router, prefix="/journals", tags=["Journals"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(goals.router, prefix="/goals", tags=["Goals"])
app.include_router(wellness.router, prefix="/wellness", tags=["Wellness Activities"])

# Serve static files (for uploaded audio files)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {
        "message": "WellMed Backend API is running 🚀",
        "version": "1.0.0",
        "features": [
            "User authentication",
            "Mood tracking",
            "MBI assessments",
            "Micro assessments",
            "Journal with AI analysis",
            "AI-powered chatbot (Carely)",
            "Wellness activities",
            "Goal setting"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "unhealthy"
    
    # Check Ollama availability
    try:
        from app.services.ollama_service import ollama_service
        ollama_status = "healthy" if await ollama_service.check_model_availability() else "unavailable"
    except Exception as e:
        logger.error(f"Ollama health check failed: {str(e)}")
        ollama_status = "error"
    
    return {
        "status": "healthy" if db_status == "healthy" and ollama_status == "healthy" else "degraded",
        "database": db_status,
        "ollama": ollama_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("WellMed API starting up...")
    
    # Check Ollama availability
    try:
        from app.services.ollama_service import ollama_service
        is_available = await ollama_service.check_model_availability()
        if is_available:
            logger.info(f"Ollama model {ollama_service.model_name} is available")
        else:
            logger.warning("Ollama model is not available - AI features may be limited")
    except Exception as e:
        logger.error(f"Failed to check Ollama availability: {str(e)}")
    
    logger.info("WellMed API startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("WellMed API shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )







# from fastapi import FastAPI, Depends, HTTPException
# from sqlalchemy.orm import Session
# from backend.app.database import engine, SessionLocal
# from models import user as user_model
# from passlib.context import CryptContext
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# # Allow CORS (very important for React Native)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )







# user_model.Base.metadata.create_all(bind=engine)

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @app.post("/register")
# def register_user(email: str, password: str, db: Session = Depends(get_db)):
#     hashed_password = pwd_context.hash(password)
#     db_user = user_model.User(email=email, hashed_password=hashed_password)
#     db.add(db_user)
#     try:
#         db.commit()
#         db.refresh(db_user)
#         return {"message": "User registered successfully"}
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(status_code=400, detail="Email already registered.")

# @app.post("/login")
# def login_user(email: str, password: str, db: Session = Depends(get_db)):
#     user = db.query(user_model.User).filter(user_model.User.email == email).first()
#     if not user or not pwd_context.verify(password, user.hashed_password):
#         raise HTTPException(status_code=400, detail="Invalid credentials")
#     return {"token": "mock-token-123", "message": "Login successful"}

