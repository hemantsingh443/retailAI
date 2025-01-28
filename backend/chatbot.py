# chatbot.py
import google.generativeai as genai
from typing import List, Dict
from datetime import datetime
import json

class GeminiCompanyBot:
    def __init__(self, business_profile: dict, config: dict, api_key: str):
            self.business_profile = business_profile
            self.config = config
            # Configure Gemini
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.context = self._build_context()
            self.session_history = []  
        
    def _build_context(self) -> str:
            """Build context from business profile"""
            business_hours = json.dumps(self.business_profile['business_hours'], indent=2)
            specialties = ', '.join(self.business_profile['specialties']) if self.business_profile['specialties'] else ''
            payment_methods = ', '.join(self.business_profile['payment_methods']) if self.business_profile['payment_methods'] else ''
            
            context = f"""
              {self.config['greeting_message']}
              
              You are {self.config['chatbot_name']}, a customer service assistant for {self.business_profile['business_name']}.
              
              Company Information:
              - Business Type: {self.business_profile['business_type']}
              - Industry: {self.business_profile['industry']}
              - Description: {self.business_profile['description']}
              
              Contact Information:
              - Phone: {self.business_profile['phone']}
              - Address: {self.business_profile['address']}, {self.business_profile['city']}, {self.business_profile['state']} {self.business_profile['postal_code']}
              - Website: {self.business_profile['website']}
              
              Business Hours:
              {business_hours}
              
              Services & Payment:
              - Specialties: {specialties}
              - Payment Methods: {payment_methods}
              
              Communication Style:
              - Tone: {self.config['tone']}
              
              Instructions:
              1. Respond in the specified tone ({self.config['tone']})
              2. Keep responses short, and use emojis when appropriate.
              3. If outside business hours, mention: "{self.config['out_of_hours_message']}"
              4. If unsure about any information, offer to connect with a human representative
              5. Be helpful, accurate, and concise
              """
            print(f"Generated Context : {context}") # print the context
            return context

    def _is_within_business_hours(self) -> bool:
        """Check if current time is within business hours"""
        return True # Always true for testing

    async def get_response(self, message: str) -> str:
        """Get response from Gemini API"""
        try:
            # Check business hours if enabled
            if self.config['show_business_hours'] and not self._is_within_business_hours():
                return self.config['out_of_hours_message']

            # Prepare chat
            chat = self.model.start_chat(history=[])
            
            # Add context and get response
            response = chat.send_message(
                f"{self.context}\n\nUser Question: {message}",
                generation_config={"max_output_tokens": self.config['max_message_length']}
            )
            
            # Extract and format response
            response_text = response.text
            if len(response_text) > self.config['max_message_length']:
                response_text = response_text[:self.config['max_message_length']] + "..."
                
            return response_text
            
        except Exception as e:
            return f"I apologize, but I'm having trouble processing your request. Please try again or contact support. Error: {str(e)}" 
        
