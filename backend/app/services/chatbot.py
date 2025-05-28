import os
import httpx
from typing import List, Dict, Any
import json


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

async def generate_ai_response(message_history: List[Dict[str, str]]) -> str:
    """
    Generate AI response using OpenAI's API
    
    Args:
        message_history: List of message dictionaries with 'role' and 'content'
    
    Returns:
        str: The generated AI response
    """
    # TODO: Replace it with acual code, 
    return f"Hello, I am your AI assistant. How can I help you today? Your message history is: {message_history}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    
    data = {
        "model": "gpt-4o",  # or any other model
        "messages": message_history,
        "temperature": 0.7,
        "max_tokens": 800
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OPENAI_API_URL,
                headers=headers,
                json=data,
                timeout=30.0
            )
            response.raise_for_status()
            response_data = response.json()
            return response_data["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        print(f"HTTP error occurred: {e}")
        return "I'm sorry, I encountered an error processing your request."
    except httpx.RequestError as e:
        print(f"Network error occurred: {e}")
        return "I'm sorry, I'm having trouble connecting to my knowledge source."
    except Exception as e:
        print(f"Unexpected error: {e}")
        return "I'm sorry, something unexpected happened while processing your request."

# Alternative implementation using Anthropic/Claude API
"""
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

async def generate_ai_response(message_history: List[Dict[str, str]]) -> str:
    headers = {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
    }
    
    data = {
        "model": "claude-3-opus-20240229",
        "messages": message_history,
        "max_tokens": 1000,
        "temperature": 0.7
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                ANTHROPIC_API_URL,
                headers=headers,
                json=data,
                timeout=30.0
            )
            response.raise_for_status()
            response_data = response.json()
            return response_data["content"][0]["text"]
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return "I'm sorry, I encountered an error processing your request."
"""