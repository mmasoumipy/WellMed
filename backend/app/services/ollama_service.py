# backend/app/services/ollama_service.py
import httpx
import json
import os
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model_name = os.getenv("OLLAMA_MODEL", "gemma3:12b")  # Using Gemma3:12b
        self.timeout = 120.0  # Increased timeout for larger model
        
    async def generate_response(self, messages: List[Dict[str, str]], context: str = "") -> str:
        """
        Generate AI response using Ollama
        
        Args:
            messages: List of conversation messages
            context: Additional context (like journal analysis, user profile, etc.)
        
        Returns:
            Generated response string
        """
        try:
            # Build the prompt with context
            prompt = self._build_prompt(messages, context)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "num_predict": 500,  # Gemma3 uses num_predict instead of max_tokens
                            "top_p": 0.9,
                            "top_k": 40,
                            "repeat_penalty": 1.1
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "I'm sorry, I couldn't generate a response.")
                else:
                    logger.error(f"Ollama API error: {response.status_code}")
                    return "I'm experiencing technical difficulties. Please try again later."
                    
        except httpx.TimeoutException:
            logger.error("Ollama request timed out")
            return "I'm taking longer than usual to respond. Please try again."
        except Exception as e:
            logger.error(f"Ollama service error: {str(e)}")
            return "I'm experiencing technical difficulties. Please try again later."
    
    async def analyze_journal_entry(self, journal_text: str, user_context: str = "") -> str:
        """
        Analyze journal entry for emotional content, themes, and insights
        
        Args:
            journal_text: The journal entry text
            user_context: User profile context (specialty, previous entries, etc.)
        
        Returns:
            Analysis summary
        """
        try:
            prompt = self._build_journal_analysis_prompt(journal_text, user_context)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.3,  # Lower temperature for more consistent analysis
                            "num_predict": 300,  # Gemma3 parameter
                            "top_p": 0.8,
                            "top_k": 30,
                            "repeat_penalty": 1.05
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "Unable to analyze this entry.")
                else:
                    return "Analysis temporarily unavailable."
                    
        except Exception as e:
            logger.error(f"Journal analysis error: {str(e)}")
            return "Analysis temporarily unavailable."
    
    def _build_prompt(self, messages: List[Dict[str, str]], context: str) -> str:
        """Build conversation prompt optimized for Gemma3"""
        
        system_prompt = """You are Carely, a compassionate AI assistant designed to support healthcare professionals with burnout and stress management.

Your role:
- Provide empathetic, understanding responses
- Focus on mental health and wellbeing for healthcare workers
- Offer evidence-based advice and coping strategies
- Recognize burnout symptoms and stress indicators
- Encourage professional help when appropriate
- Keep responses helpful but concise (2-3 paragraphs max)
- Never provide medical diagnoses or treatment
- Maintain a supportive, professional tone

Important: You're speaking with a healthcare professional who may be experiencing work-related stress or burnout."""

        if context:
            system_prompt += f"\n\nUser Context: {context}"
        
        # Format for Gemma3 (uses <start_of_turn> and <end_of_turn> tokens)
        conversation = f"<start_of_turn>system\n{system_prompt}<end_of_turn>\n"
        
        for message in messages[-10:]:  # Keep last 10 messages for context
            role = "user" if message["role"] == "user" else "model"
            conversation += f"<start_of_turn>{role}\n{message['content']}<end_of_turn>\n"
        
        conversation += "<start_of_turn>model\n"
        
        return conversation
    
    def _build_journal_analysis_prompt(self, journal_text: str, user_context: str) -> str:
        """Build journal analysis prompt optimized for Gemma3"""
        
        prompt = f"""<start_of_turn>system
You are an AI assistant that analyzes journal entries from healthcare professionals to provide supportive insights about emotional wellbeing and stress patterns.

Analyze the journal entry and provide:
1. Emotional tone (positive/neutral/negative/mixed)
2. Key themes or concerns
3. Stress indicators (if present)
4. Supportive observations
5. Self-care recommendations

Keep analysis professional, supportive, and concise (2-3 sentences maximum).
<end_of_turn>

<start_of_turn>user
{f"User context: {user_context}" if user_context else ""}

Journal entry to analyze:
{journal_text}

Please provide your analysis:
<end_of_turn>

<start_of_turn>model
"""
        
        return prompt
    
    async def check_model_availability(self) -> bool:
        """Check if Ollama model is available"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    return any(model.get("name", "").startswith(self.model_name) for model in models)
                return False
        except Exception:
            return False

# Initialize service
ollama_service = OllamaService()