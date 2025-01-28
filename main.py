# main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn
from typing import List, Dict
import httpx
import json
import asyncio
from datetime import datetime, timedelta

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configure Ollama API
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "deepseek-r1:14b"

class ChatManager:
    def __init__(self):
        self.chats: Dict[str, List[Dict]] = {}
        self.current_chat_id = None

    def create_new_chat(self) -> str:
        chat_id = datetime.now().strftime("%Y%m%d%H%M%S")
        self.chats[chat_id] = []
        self.current_chat_id = chat_id
        return chat_id

    def add_message(self, chat_id: str, content: str, role: str):
        if chat_id not in self.chats:
            chat_id = self.create_new_chat()
        
        self.chats[chat_id].append({
            "content": content,
            "role": role,
            "timestamp": datetime.now().isoformat()
        })
        return chat_id

    def get_chats_by_period(self):
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = today_start - timedelta(days=7)
        month_ago = today_start - timedelta(days=30)

        today = []
        previous_7_days = []
        previous_30_days = []

        for chat_id, messages in self.chats.items():
            if not messages:
                continue
            first_message_time = datetime.fromisoformat(messages[0]["timestamp"])
            
            chat_info = {
                "id": chat_id,
                "title": messages[0]["content"][:30] + "..." if len(messages[0]["content"]) > 30 else messages[0]["content"]
            }
            
            if first_message_time >= today_start:
                today.append(chat_info)
            elif first_message_time >= week_ago:
                previous_7_days.append(chat_info)
            elif first_message_time >= month_ago:
                previous_30_days.append(chat_info)

        return {
            "today": today,
            "previous_7_days": previous_7_days,
            "previous_30_days": previous_30_days
        }

chat_manager = ChatManager()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}  # Changed to dict with chat_id as key

    async def connect(self, websocket: WebSocket, chat_id: str):
        await websocket.accept()
        self.active_connections[chat_id] = websocket
        print(f"Added connection for chat {chat_id}")

    async def disconnect(self, chat_id: str):
        if chat_id in self.active_connections:
            del self.active_connections[chat_id]
            print(f"Removed connection for chat {chat_id}")

    async def send_message(self, message: str, chat_id: str):
        if chat_id in self.active_connections:
            await self.active_connections[chat_id].send_text(message)

manager = ConnectionManager()

async def generate_response(prompt: str) -> str:
    """Generate response using Ollama API with improved error handling"""
    async with httpx.AsyncClient() as client:
        try:
            print(f"Sending request to Ollama API at {OLLAMA_API_URL}")
            response = await client.post(
                OLLAMA_API_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=1200.0  # 20 minute timeout
            )
            print(f"Received response with status code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                if "response" in result and result["response"]:
                    return result["response"]
                else:
                    return "Error: Received empty response from the model."
            elif response.status_code == 404:
                return "Error: Ollama API not found. Please make sure Ollama is running and the model is pulled."
            else:
                error_text = await response.text()
                print(f"Error response body: {error_text}")
                return f"Error: Received status code {response.status_code}. Details: {error_text}"
        except httpx.TimeoutException:
            return "Error: The model is taking too long to respond. Please try again or try a shorter message."
        except httpx.ConnectError:
            return "Error: Could not connect to Ollama. Please make sure Ollama is running (ollama serve)"
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return f"Error: {str(e)}"

@app.get("/")
async def get():
    with open("static/index.html") as f:
        return HTMLResponse(f.read())

@app.post("/new-chat")
async def new_chat():
    chat_id = chat_manager.create_new_chat()
    return {"chat_id": chat_id}

@app.get("/chat-history")
async def get_chat_history():
    return chat_manager.get_chats_by_period()

@app.get("/chat/{chat_id}")
async def get_chat(chat_id: str):
    if chat_id in chat_manager.chats:
        return {"messages": chat_manager.chats[chat_id]}
    return {"messages": []}

@app.websocket("/ws/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str):
    await manager.connect(websocket, chat_id)
    try:
        while True:
            data = await websocket.receive_text()
            if not data.strip():
                continue
            
            print(f"Received message for chat {chat_id}: {data[:50]}...")  # Log first 50 chars
            
            # Add user message to chat history
            chat_manager.add_message(chat_id, data, "user")
            
            # Generate response using Ollama
            response = await generate_response(data)
            
            # Add assistant message to chat history
            chat_manager.add_message(chat_id, response, "assistant")
            
            # Send response back to client
            try:
                await websocket.send_text(json.dumps({
                    "content": response,
                    "chat_id": chat_id
                }))
            except Exception as e:
                print(f"Error sending response: {e}")
                raise
                
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for chat {chat_id}")
    except Exception as e:
        print(f"Error in WebSocket connection: {e}")
    finally:
        await manager.disconnect(chat_id)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)



# MODEL_NAME = "deepseek-r1:14b"  
# Ollama API to pull the model, Uvircorn to run the server, FASTAPI and html, css for the interface.