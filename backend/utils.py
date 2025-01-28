# utils.py
from fastapi import HTTPException
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM = os.getenv("MAIL_FROM"),
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True
)

# JWT utilities
def create_verification_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(
        {"email": email, "exp": expire},
        os.getenv("SECRET_KEY"),
        algorithm="HS256"
    )

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        return payload["email"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Verification link has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Invalid verification token")

# Email sender utility
async def send_verification_email(email: str, verification_token: str):
    verify_url = f"http://localhost:8000/verify/{verification_token}"
    
    message = MessageSchema(
        subject="Verify your email",
        recipients=[email],
        body=f"""
        Hi,
        
        Please verify your email by clicking on the link below:
        {verify_url}
        
        This link will expire in 24 hours.
        
        If you didn't request this verification, please ignore this email.
        """,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)
