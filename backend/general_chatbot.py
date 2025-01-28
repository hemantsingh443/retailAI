# general_chatbot.py
import google.generativeai as genai
from datetime import datetime
import os
from dotenv import load_dotenv
load_dotenv()
class GeminiGeneralBot:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.context = self._build_context()
        self.session_history = []  # Initialize an empty list for session history

    def _build_context(self) -> str:
        return f"""
            You are a friendly and helpful AI assistant for a platform called AI Chatbot.
            Your goal is to tell users about the AI Chatbot Platform and its various features.
            Be very helpful, polite, and answer the questions that they may have.
            Keep your responses short, and use emojis when appropriate.
       """


    async def get_response(self, message: str) -> str:
        """Get response from Gemini API"""
        try:
            # Prepare chat
            chat = self.model.start_chat(history=self.session_history)

            # Add context and get response
            response = chat.send_message(
                f"{self.context}\n\nUser Question: {message}",
            )
            # Extract and format response
            response_text = response.text

            # Update the session history
            self.session_history.append({"role": "user", "parts": [message]})
            self.session_history.append({"role": "model", "parts": [response_text]})
             # Limit the history
            if len(self.session_history) > 10:
                self.session_history = self.session_history[-10:]

            return response_text

        except Exception as e:
            return f"I apologize, but I'm having trouble processing your request. Please try again or contact support. Error: {str(e)}"