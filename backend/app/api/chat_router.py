# backend/app/api/chat_router.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.api.deps import get_current_user_from_cookie
from app.db.database import get_db
from app.db import models
from app.core.config import settings
import logging
from typing import Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

# Lazy initialization of OpenAI client to avoid import-time errors
_client: Optional[object] = None


def get_openai_client():
    """
    Lazy initialization of OpenAI client.
    Only creates the client when needed and if API key is available.
    """
    global _client
    
    if _client is not None:
        return _client
    
    if not settings.OPENAI_API_KEY or not settings.OPENAI_API_KEY.strip():
        logger.warning("⚠️ OPENAI_API_KEY not set. Chat functionality will be limited.")
        return None
    
    try:
        from openai import OpenAI
        # Initialize without passing proxies to avoid httpx compatibility issues
        _client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            http_client=None  # Let OpenAI SDK create its own client
        )
        logger.info("✅ OpenAI client initialized successfully")
        return _client
    except Exception as e:
        logger.error(f"❌ Failed to initialize OpenAI client: {str(e)}", exc_info=True)
        return None


class ChatMessageRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    response: str


class ChatMessageItem(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime  # Maps to created_at from database
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        """Convert database model to response model with timestamp field"""
        return cls(
            id=obj.id,
            role=obj.role,
            content=obj.content,
            timestamp=obj.created_at
        )


class ChatMessagesResponse(BaseModel):
    messages: List[ChatMessageItem]


@router.get("/chat/messages", response_model=ChatMessagesResponse)
def get_chat_messages(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie),
):
    """
    Get all chat messages for the current user.
    Returns empty list for new users.
    """
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    ).order_by(models.ChatMessage.created_at).all()
    
    # Convert to response format with timestamp field
    message_items = [
        ChatMessageItem(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            timestamp=msg.created_at
        )
        for msg in messages
    ]
    
    # If no messages, return empty list (frontend will show welcome message)
    return ChatMessagesResponse(messages=message_items)


@router.post("/chat/message", response_model=ChatMessageResponse)
async def chat_message(
    request: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user_from_cookie),
):
    """
    Process a chat message using OpenAI API.
    Stores both user message and AI response in database tied to user account.
    Returns an AI-generated response about markets, trading, or general questions.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )

    # Store user message in database
    user_message = models.ChatMessage(
        user_id=current_user.id,
        role="user",
        content=request.message.strip()
    )
    db.add(user_message)
    db.flush()  # Flush to get the ID, but don't commit yet

    # Get OpenAI client (lazy initialization)
    client = get_openai_client()
    
    # Check if OpenAI client is configured
    if not client:
        logger.error("OpenAI client not initialized - OPENAI_API_KEY missing or invalid")
        # Store error message in database
        error_message = models.ChatMessage(
            user_id=current_user.id,
            role="assistant",
            content="AI service is not configured. Please set OPENAI_API_KEY environment variable."
        )
        db.add(error_message)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not configured. Please set OPENAI_API_KEY environment variable."
        )

    try:
        # Get recent conversation history for context (last 10 messages)
        recent_messages = db.query(models.ChatMessage).filter(
            models.ChatMessage.user_id == current_user.id
        ).order_by(models.ChatMessage.created_at.desc()).limit(10).all()
        
        # Build conversation history for OpenAI (most recent first, so reverse)
        conversation_history = []
        for msg in reversed(recent_messages):
            conversation_history.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # System prompt to make the AI act as a trading assistant
        system_prompt = """You are an expert AI trading assistant for Profit Path, a financial trading platform. 
Your role is to help users with:
- Market analysis and insights
- Trading strategies and techniques
- Stock recommendations and analysis
- Risk management advice
- General financial market questions

Always provide accurate, helpful, and professional responses. If asked about specific stocks, provide balanced analysis 
and remind users that this is not financial advice. Be concise but informative."""

        # Build messages array with system prompt, history, and current message
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history)
        messages.append({"role": "user", "content": request.message.strip()})

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using gpt-4o-mini for cost efficiency, can be changed to gpt-4 or gpt-3.5-turbo
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )

        # Extract the response text
        ai_response = response.choices[0].message.content

        if not ai_response:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No response from AI service"
            )

        # Store assistant response in database
        assistant_message = models.ChatMessage(
            user_id=current_user.id,
            role="assistant",
            content=ai_response
        )
        db.add(assistant_message)
        db.commit()

        logger.info(f"✅ Chat message processed for user {current_user.id}")
        return ChatMessageResponse(response=ai_response)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error processing chat message: {str(e)}", exc_info=True)
        
        # Store error message in database
        error_message = models.ChatMessage(
            user_id=current_user.id,
            role="assistant",
            content=f"Sorry, I encountered an error: {str(e)}. Please try again."
        )
        db.add(error_message)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat message: {str(e)}"
        )

