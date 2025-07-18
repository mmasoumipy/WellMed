import os
import httpx
from typing import List, Dict, Any
import json
from sqlalchemy.orm import Session
from app import models


OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma2:2b")

async def generate_ai_response(message_history: List[Dict[str, str]], user_context: Dict = None) -> str:
    """
    Generate AI response using Ollama's API with healthcare-specific context
    
    Args:
        message_history: List of message dictionaries with 'role' and 'content'
        user_context: Optional context about the user (specialty, recent assessments, etc.)
    
    Returns:
        str: The generated AI response
    """
    
    # Create healthcare-specific system prompt
    system_prompt = create_healthcare_system_prompt(user_context)
    
    # Prepare messages with system prompt
    messages = [{"role": "system", "content": system_prompt}] + message_history
    
    # Try the new chat API first, then fall back to generate API
    success, response = await try_chat_api(messages)
    if success:
        return response
    
    # Fallback to generate API
    return await try_generate_api(messages, system_prompt)

async def try_chat_api(messages: List[Dict[str, str]]) -> tuple[bool, str]:
    """Try the newer chat API endpoint"""
    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 800,
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                response_data = response.json()
                if "message" in response_data and "content" in response_data["message"]:
                    return True, response_data["message"]["content"].strip()
            
            return False, ""
                
    except Exception as e:
        print(f"Chat API failed: {e}")
        return False, ""

async def try_generate_api(messages: List[Dict[str, str]], system_prompt: str) -> str:
    """Fallback to the generate API for older Ollama versions"""
    
    # Convert messages to a single prompt for generate API
    conversation_text = system_prompt + "\n\n"
    for msg in messages[1:]:  # Skip system message since we already added it
        role = "Human" if msg["role"] == "user" else "Assistant"
        conversation_text += f"{role}: {msg['content']}\n"
    conversation_text += "Assistant: "
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": conversation_text,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 800,
            "stop": ["Human:", "User:"]
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            response_data = response.json()
            
            if "response" in response_data:
                return response_data["response"].strip()
            else:
                return "I'm having trouble processing your request right now. Please try again."
                
    except httpx.TimeoutException:
        return "I'm taking longer to respond than usual. Please try again."
    except httpx.HTTPStatusError as e:
        print(f"HTTP error occurred: {e}")
        return "I'm experiencing technical difficulties. Please try again later."
    except httpx.RequestError as e:
        print(f"Network error occurred: {e}")
        return "I'm having trouble connecting. Please check if Ollama is running and try again."
    except Exception as e:
        print(f"Unexpected error: {e}")
        return "Something unexpected happened. Please try again."

def create_healthcare_system_prompt(user_context: Dict = None) -> str:
    """Create a healthcare-focused system prompt for the AI"""
    
    base_prompt = """You are Carely, an AI wellness companion specifically designed for healthcare professionals. Your role is to provide emotional support, burnout prevention guidance, and wellness coaching.

Key Guidelines:
- Be empathetic, understanding, and supportive
- Focus on burnout prevention and mental health
- Provide practical, actionable wellness advice
- Acknowledge the unique stresses of healthcare work
- Never provide medical advice or diagnoses
- Encourage professional help when appropriate
- Keep responses conversational and encouraging
- Ask follow-up questions to better understand their situation

Your expertise areas:
- Stress management and coping strategies
- Work-life balance for healthcare workers
- Burnout recognition and prevention
- Self-care techniques and mindfulness
- Emotional processing and support"""

    if user_context:
        context_addition = f"\n\nUser Context:"
        if user_context.get('specialty'):
            context_addition += f"\n- Medical Specialty: {user_context['specialty']}"
        if user_context.get('recent_mood'):
            context_addition += f"\n- Recent Mood: {user_context['recent_mood']}"
        if user_context.get('burnout_risk'):
            context_addition += f"\n- Burnout Risk Level: {user_context['burnout_risk']}"
        if user_context.get('stress_level'):
            context_addition += f"\n- Recent Stress Level: {user_context['stress_level']}/5"
        
        base_prompt += context_addition

    base_prompt += "\n\nRespond naturally and supportively. Keep responses under 150 words unless more detail is specifically requested."
    
    return base_prompt

async def analyze_journal_entry(journal_text: str, user_context: Dict = None) -> str:
    """
    Analyze a journal entry and provide supportive insights
    
    Args:
        journal_text: The journal entry text to analyze
        user_context: Optional context about the user
    
    Returns:
        str: Analysis and supportive response
    """
    
    system_prompt = f"""You are Carely, an AI wellness companion for healthcare professionals. 

Analyze this journal entry with empathy and provide:
1. Acknowledgment of their feelings
2. Identification of key themes or concerns
3. Practical wellness suggestions
4. Encouragement and support

Keep your analysis supportive, non-judgmental, and under 200 words. Focus on their emotional wellbeing and provide actionable advice for healthcare worker burnout prevention.

{f"User Context: {user_context}" if user_context else ""}"""

    # Try chat API first
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Please analyze this journal entry: {journal_text}"}
    ]
    
    success, response = await try_chat_api(messages)
    if success:
        return response
    
    # Fallback to generate API
    prompt = f"{system_prompt}\n\nHuman: Please analyze this journal entry: {journal_text}\nAssistant: "
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.8,
            "top_p": 0.9,
            "num_predict": 300
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            response_data = response.json()
            
            if "response" in response_data:
                return response_data["response"].strip()
            else:
                return "Thank you for sharing your thoughts. Your reflections are valuable for your wellbeing journey."
                
    except Exception as e:
        print(f"Error analyzing journal entry: {e}")
        return "Thank you for taking time to journal. Reflection is an important part of maintaining mental wellness in healthcare."

async def get_user_context_from_db(db: Session, user_id: str) -> Dict:
    """
    Gather user context from database for better AI responses
    """
    from app import crud
    
    try:
        # Get user info
        user = db.query(models.User).filter(models.User.id == user_id).first()
        context = {}
        
        if user:
            context['specialty'] = user.specialty
        
        # Get recent mood
        recent_moods = crud.get_user_moods(db, user_id)
        if recent_moods:
            context['recent_mood'] = recent_moods[0].mood
        
        # Get recent micro assessment
        recent_micro = crud.get_all_micro_assessment(db, user_id)
        if recent_micro:
            latest_micro = recent_micro[0]
            context['stress_level'] = latest_micro.stress_level
            context['fatigue_level'] = latest_micro.fatigue_level
        
        # Get MBI burnout risk
        recent_mbi = crud.get_mbi_assessments_by_user(db, user_id)
        if recent_mbi:
            latest_mbi = recent_mbi[0]
            # Calculate simple burnout risk
            ee_risk = "High" if latest_mbi.emotional_exhaustion > 27 else "Medium" if latest_mbi.emotional_exhaustion > 17 else "Low"
            context['burnout_risk'] = ee_risk
        
        return context
        
    except Exception as e:
        print(f"Error getting user context: {e}")
        return {}

# Test Ollama connection
async def test_ollama_connection() -> bool:
    """Test if Ollama is running and accessible"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return response.status_code == 200
    except Exception:
        return False