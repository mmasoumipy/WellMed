import os
from typing import List, Dict, Any


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
