#models.py

from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    company_name = Column(String)
    is_active = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    business_profile = relationship("BusinessProfile", back_populates="user", uselist=False)
    chatbot_config = relationship("ChatbotConfig", back_populates="user", uselist=False)

class BusinessProfile(Base):
    __tablename__ = "business_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Basic Info
    business_name = Column(String)
    business_type = Column(String)
    website = Column(String, nullable=True)
    industry = Column(String)
    
    # Contact Info
    phone = Column(String)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    country = Column(String)
    
    # Business Hours
    business_hours = Column(JSON)  # Store as JSON for flexibility
    
    # Business Details
    description = Column(Text)
    year_established = Column(Integer, nullable=True)
    employee_count = Column(Integer, nullable=True)
    
    # Social Media
    facebook_url = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    
    # Additional Fields
    specialties = Column(JSON, nullable=True)  # Array of specialties
    payment_methods = Column(JSON, nullable=True)  # Array of accepted payments
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="business_profile")
    faqs = relationship("FAQ", back_populates="business_profile")
    chat_interactions = relationship("ChatInteraction", back_populates="business_profile")

class ChatbotConfig(Base):
    __tablename__ = "chatbot_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Chatbot Personality
    chatbot_name = Column(String)
    greeting_message = Column(String)
    tone = Column(String)  # e.g., professional, casual, friendly
    
    # Appearance
    primary_color = Column(String)
    secondary_color = Column(String)
    chat_bubble_position = Column(String)  # e.g., bottom-right, bottom-left
    
    # Behavior
    auto_show_delay = Column(Integer)  # Delay in seconds before showing chat bubble
    enable_voice = Column(Boolean, default=False)
    enable_file_sharing = Column(Boolean, default=False)
    max_message_length = Column(Integer, default=500)
    
    # Business Hours Integration
    show_business_hours = Column(Boolean, default=True)
    out_of_hours_message = Column(String, nullable=True)
    
    # Analytics & Features
    enable_analytics = Column(Boolean, default=True)
    save_chat_history = Column(Boolean, default=True)
    enable_email_transcript = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chatbot_config")

class FAQ(Base):
    __tablename__ = "faqs"
    
    id = Column(Integer, primary_key=True, index=True)
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"))
    question = Column(String)
    answer = Column(Text)
    category = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    business_profile = relationship("BusinessProfile", back_populates="faqs") 


class ChatInteraction(Base):
    __tablename__ = "chat_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    business_profile_id = Column(Integer, ForeignKey("business_profiles.id"))
    user_message = Column(Text)
    bot_response = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Optional fields for analytics
    category = Column(String, nullable=True)
    sentiment_score = Column(Float, nullable=True)
    
    # Relationships
    business_profile = relationship("BusinessProfile", back_populates="chat_interactions")