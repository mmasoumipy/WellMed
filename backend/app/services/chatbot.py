import os
from typing import List, Dict, Any
from app.services.ollama_service import ollama_service
from sqlalchemy.orm import Session
from uuid import UUID
import json
import logging

logger = logging.getLogger(__name__)

async def generate_ai_response(message_history: List[Dict[str, str]], user_id: UUID = None, db: Session = None) -> str:
    """
    Generate AI response using Ollama with user context
    
    Args:
        message_history: List of message dictionaries with 'role' and 'content'
        user_id: User ID for context
        db: Database session for user data
    
    Returns:
        str: The generated AI response
    """
    
    # Build user context if available
    context = await _build_user_context(user_id, db) if user_id and db else ""
    
    # Generate response using Ollama
    response = await ollama_service.generate_response(message_history, context)
    
    return response

async def analyze_journal_entry(journal_text: str, user_id: UUID = None, db: Session = None) -> str:
    """
    Analyze journal entry using AI
    
    Args:
        journal_text: The journal entry content
        user_id: User ID for context
        db: Database session
    
    Returns:
        Analysis summary
    """
    
    # Build user context for better analysis
    context = await _build_user_context(user_id, db) if user_id and db else ""
    
    # Use Ollama to analyze the journal entry
    analysis = await ollama_service.analyze_journal_entry(journal_text, context)
    
    return analysis

async def _build_user_context(user_id: UUID, db: Session) -> str:
    """Build contextual information about the user for better AI responses"""
    
    try:
        # Import here to avoid circular imports
        from app import models
        from app.crud import get_user_moods, get_mbi_assessments_by_user, get_all_micro_assessment
        
        context_parts = []
        
        # Get user basic info
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            context_parts.append(f"User specialty: {user.specialty or 'General'}")
        
        # Get recent mood trends
        try:
            moods = get_user_moods(db, user_id)
            if moods:
                recent_moods = [mood.mood for mood in moods[-5:]]  # Last 5 moods
                context_parts.append(f"Recent mood patterns: {', '.join(recent_moods)}")
        except Exception as e:
            logger.warning(f"Error getting moods: {e}")
        
        # Get latest MBI assessment if available
        try:
            mbi_assessments = get_mbi_assessments_by_user(db, user_id)
            if mbi_assessments:
                latest_mbi = mbi_assessments[0]
                risk_level = _calculate_burnout_risk_level(
                    latest_mbi.emotional_exhaustion,
                    latest_mbi.depersonalization,
                    latest_mbi.personal_accomplishment
                )
                context_parts.append(f"Current burnout risk: {risk_level}")
        except Exception as e:
            logger.warning(f"Error getting MBI assessments: {e}")
        
        # Get recent micro assessments
        try:
            micro_assessments = get_all_micro_assessment(db, user_id)
            if micro_assessments:
                latest_micro = micro_assessments[0]
                context_parts.append(f"Recent stress level: {latest_micro.stress_level}/5")
                context_parts.append(f"Recent fatigue level: {latest_micro.fatigue_level}/5")
        except Exception as e:
            logger.warning(f"Error getting micro assessments: {e}")
        
        return " | ".join(context_parts) if context_parts else ""
        
    except Exception as e:
        logger.error(f"Error building user context: {e}")
        return ""

def _calculate_burnout_risk_level(emotional_exhaustion: int, depersonalization: int, personal_accomplishment: int) -> str:
    """Calculate simple burnout risk level"""
    # Simplified calculation - you can use your existing burnout risk function
    if emotional_exhaustion >= 27 or depersonalization >= 10:
        return "High"
    elif emotional_exhaustion >= 17 or depersonalization >= 6:
        return "Medium"
    else:
        return "Low"