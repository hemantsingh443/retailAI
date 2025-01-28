from pydantic import BaseModel, EmailStr, HttpUrl, constr
from typing import Optional, Dict, List, Any
from datetime import datetime
from pydantic import BaseModel, Field


class BusinessHours(BaseModel):
    monday: Optional[Dict[str, str]]
    tuesday: Optional[Dict[str, str]]
    wednesday: Optional[Dict[str, str]]
    thursday: Optional[Dict[str, str]]
    friday: Optional[Dict[str, str]]
    saturday: Optional[Dict[str, str]]
    sunday: Optional[Dict[str, str]]

class BusinessProfileCreate(BaseModel):
    business_name: str
    business_type: str
    website: Optional[HttpUrl]
    industry: str
    phone: str
    address: str
    city: str
    state: str
    postal_code: str
    country: str
    business_hours: BusinessHours
    description: str
    year_established: Optional[int]
    employee_count: Optional[int]
    facebook_url: Optional[HttpUrl]
    instagram_url: Optional[HttpUrl]
    twitter_url: Optional[HttpUrl]
    specialties: Optional[List[str]]
    payment_methods: Optional[List[str]]


class ChatbotConfigCreate(BaseModel):
    chatbot_name: str
    greeting_message: str
    tone: str
    primary_color: str = Field(..., pattern=r'^#(?:[0-9a-fA-F]{3}){1,2}$')
    secondary_color: str = Field(..., pattern=r'^#(?:[0-9a-fA-F]{3}){1,2}$')
    chat_bubble_position: str
    auto_show_delay: int
    enable_voice: bool = False
    enable_file_sharing: bool = False
    max_message_length: int = 500
    show_business_hours: bool = True
    out_of_hours_message: Optional[str]
    enable_analytics: bool = True
    save_chat_history: bool = True
    enable_email_transcript: bool = False



class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str]
    priority: Optional[int] = 0

class BusinessProfileResponse(BusinessProfileCreate):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        orm_mode = True

class ChatbotConfigResponse(ChatbotConfigCreate):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        orm_mode = True

class FAQResponse(FAQCreate):
    id: int
    business_profile_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        orm_mode = True

class ChatAnalysisResponse(BaseModel):
     total_queries: int
     top_categories: List[dict]
     average_sentiment: float