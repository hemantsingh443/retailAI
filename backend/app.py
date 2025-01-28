from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
import models
from database import SessionLocal, engine
from pydantic import BaseModel, EmailStr, Field
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import os
from dotenv import load_dotenv
from schemas import BusinessProfileCreate, ChatbotConfigCreate, ChatAnalysisResponse
from typing import Optional, List
from chatbot import GeminiCompanyBot
from general_chatbot import GeminiGeneralBot


# Load environment variables
load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY")  # Get from environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Email configuration
mail_conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM = os.getenv("MAIL_FROM"),
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True
)

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    company_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatMessage(BaseModel):
    message: str


# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Token creation functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_verification_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(
        {"email": email, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

# Email sending function
async def send_verification_email(email: str, verification_token: str):
    verify_url = f"http://localhost:8000/verify/{verification_token}"
    
    message = MessageSchema(
        subject="Verify your email",
        recipients=[email],
        body=f"""
        <html>
            <body>
                <h1>Email Verification</h1>
                <p>Hi,</p>
                <p>Please verify your email by clicking on the link below:</p>
                <p><a href="{verify_url}">Verify Email</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
            </body>
        </html>
        """,
        subtype="html"
    )
    
    fm = FastMail(mail_conf)
    await fm.send_message(message)

@app.post("/api/register", response_model=dict)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create verification token
    verification_token = create_verification_token(user.email)
    
    # Create new user
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        company_name=user.company_name,
        verification_token=verification_token,
        is_verified=False,
        is_active=False
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Send verification email
        await send_verification_email(user.email, verification_token)
        
        return {"message": "Registration successful. Please check your email to verify your account."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")

@app.get("/verify/{token}")
async def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        # Decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")  # Changed from "sub" to "email"
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
            
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        if user.is_verified:
            return {"message": "Email already verified"}
            
        user.is_verified = True
        user.is_active = True
        user.verification_token = None
        db.commit()
        
        return {"message": "Email verified successfully"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Verification link has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid verification token") 
    

def create_verification_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {
        "email": email,
        "exp": expire
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/api/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not db_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email first"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Keep your existing endpoints
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
     raise credentials_exception

    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@app.get("/api/user/profile")
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "company_name": current_user.company_name,
        "created_at": current_user.created_at
    }

@app.delete("/api/user/delete", status_code=204)
async def delete_user(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        db.delete(current_user)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}") 
    
@app.delete("/api/user/business-profile", status_code=204)
async def delete_business_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete the user's business profile"""
    if current_user.business_profile:
        try:
            db.delete(current_user.business_profile)
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete business profile: {str(e)}")
    else:
        raise HTTPException(status_code=404, detail="Business profile not found")

@app.get("/api/user/complete-profile")
async def get_complete_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get complete user profile including business profile and chatbot config"""
    business_profile = current_user.business_profile
    chatbot_config = current_user.chatbot_config
    
    return {
        "user": {
            "email": current_user.email,
            "company_name": current_user.company_name,
            "created_at": current_user.created_at,
            "is_verified": current_user.is_verified
        },
        "business_profile": business_profile,
        "chatbot_config": chatbot_config
    }

@app.post("/api/user/business-profile")
async def create_business_profile(
    profile: BusinessProfileCreate,
    config: ChatbotConfigCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update business profile and chatbot config"""
    if current_user.business_profile:
         # Update existing profile
        for key, value in profile.dict().items():
             setattr(current_user.business_profile, key, value)
    else:
       # Create new profile
       db_profile = models.BusinessProfile(**profile.dict(), user_id=current_user.id)
       db.add(db_profile)


    if current_user.chatbot_config:
         # Update existing config
         for key, value in config.dict().items():
             setattr(current_user.chatbot_config, key, value)
    else:
        # Create new config
       db_config = models.ChatbotConfig(**config.dict(), user_id = current_user.id)
       db.add(db_config)

    db.commit()
    return {"message": "Business profile and Chatbot config updated successfully"}

@app.put("/api/user/business-profile")
async def update_business_profile(
       profile: BusinessProfileCreate,
       config: ChatbotConfigCreate,
       current_user: models.User = Depends(get_current_user),
       db: Session = Depends(get_db)
   ):
      """Update existing business profile"""
      if not current_user.business_profile:
          raise HTTPException(status_code=404, detail="Business profile not found")

     
      for key, value in profile.dict().items():
        setattr(current_user.business_profile, key, value)
   
      if not current_user.chatbot_config:
         raise HTTPException(status_code=404, detail="Chatbot config not found")

      for key, value in config.dict().items():
           setattr(current_user.chatbot_config, key, value)
      db.commit()

      return {"message": "Business profile and Chatbot config updated successfully"}

@app.post("/api/chat/{business_id}")
async def chat_endpoint(
    business_id: int,
    chat_message: ChatMessage,
    db: Session = Depends(get_db)
):
    """Handle chat interactions for a specific business"""
    # Get business profile and config
    message = chat_message.message
    business_profile = db.query(models.BusinessProfile).filter(
        models.BusinessProfile.id == business_id
    ).first()
    
    if not business_profile:
        raise HTTPException(status_code=404, detail="Business not found")
    
    chatbot_config = db.query(models.ChatbotConfig).filter(
        models.ChatbotConfig.user_id == business_profile.user_id
    ).first()

    if not chatbot_config:
           return {
               "business_name": business_profile.business_name,
               "message": message,
              "response": "Hi there! Thanks for your interest in our business. I'll gladly assist you. However, based on the information provided, I'm unable to share any specific details about our business since the necessary information is missing. Would you like to connect with a human representative to get more information? If so, I can provide you with their contact details.",
              "timestamp": datetime.utcnow().isoformat()
          }

    # Initialize chatbot
    bot = GeminiCompanyBot(
        business_profile=business_profile.__dict__,
        config=chatbot_config.__dict__,
        api_key=os.getenv("GEMINI_API_KEY")
    )
    
    # Get response
    response = await bot.get_response(message)
    
    # Classify Request
    category = classify_message(message)
    sentiment_score = analyze_sentiment(message)

    # Store interaction if enabled
    if chatbot_config.save_chat_history:
        # You'll need to create a ChatInteraction model
        interaction = models.ChatInteraction(
            business_profile_id=business_id,
            user_message=message,
            bot_response=response,
            timestamp=datetime.utcnow(),
             category = category,
              sentiment_score = sentiment_score
        )
        db.add(interaction)
        db.commit()
    
    return {
        "business_name": business_profile.business_name,
        "message": message,
        "response": response,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/general-chat")
async def general_chat_endpoint(
    chat_message: ChatMessage,
):
    """Handle chat interactions for a specific business"""
    message = chat_message.message
    # Initialize chatbot
    bot = GeminiGeneralBot(
        api_key=os.getenv("GEMINI_API_KEY")
    )

    # Get response
    response = await bot.get_response(message)

    return {
        "message": message,
        "response": response,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/user/chat-analysis")
async def get_user_chat_analysis(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get chat analysis for the current user"""
    business_profile = current_user.business_profile

    if not business_profile:
        raise HTTPException(status_code=404, detail="Business profile not found")
    
    interactions = db.query(models.ChatInteraction).filter(
        models.ChatInteraction.business_profile_id == business_profile.id
     ).all()

    total_queries = len(interactions)

   # Count query by category
    category_counts = {}
    for interaction in interactions:
         category = interaction.category if interaction.category else "uncategorized"
         category_counts[category] = category_counts.get(category, 0) + 1
    sorted_categories = sorted(category_counts.items(), key=lambda item: item[1], reverse=True)
   # Convert to list of objects
    top_categories = [{"category": cat, "count": count} for cat, count in sorted_categories]
     # Limit to top categories
    top_categories = top_categories[:5]
    
    avg_sentiment = 0
    total_sentiment = 0
    for interaction in interactions:
        if interaction.sentiment_score:
         total_sentiment += interaction.sentiment_score
     
    if total_queries > 0:
       avg_sentiment = total_sentiment / total_queries


    
    return {
        "total_queries": total_queries,
        "top_categories": top_categories,
        "average_sentiment": avg_sentiment
    }



def classify_message(message: str) -> str:
    message = message.lower()

    if "hours" in message or "time" in message:
        return "hours"
    elif "location" in message or "address" in message:
        return "location"
    elif "payment" in message or "pay" in message or "method" in message:
        return "payment"
    elif "services" in message or "offer" in message or "provide" in message:
        return "services"
    else:
        return "general"

def analyze_sentiment(message: str) -> float:
     message = message.lower()

     positive_keywords = ["good", "great", "excellent", "happy", "love", "best"]
     negative_keywords = ["bad", "terrible", "awful", "unhappy", "hate", "worst"]

     positive_count = sum(1 for keyword in positive_keywords if keyword in message)
     negative_count = sum(1 for keyword in negative_keywords if keyword in message)

     if positive_count > negative_count:
        return 1
     elif negative_count > positive_count:
        return -1
     else:
         return 0