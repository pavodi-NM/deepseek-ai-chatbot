# DeepSeek Chat

A modern, responsive web chat interface for interacting with the DeepSeek language model through Ollama.

![DeepSeek Chat Interface](https://raw.githubusercontent.com/pavodi-NM/deepseek-ai-chatbot/main/screenshots/screenshot.png)

![DeepSeek Chat Interface](https://raw.githubusercontent.com/pavodi-NM/deepseek-ai-chatbot/main/screenshots/screenshot-2.png)

## Features

- 🚀 Real-time chat interface using WebSocket connections
- 📝 Markdown support with code syntax highlighting
- 💬 Chat history organization (Today, Previous 7 Days, Previous 30 Days)
- 🎨 Clean, modern UI with dark theme
- ⚡ FastAPI backend for efficient request handling
- 🤖 Integration with Ollama API for DeepSeek model interactions

## Prerequisites

- Python 3.7+
- Ollama installed and running
- DeepSeek model pulled in Ollama (`ollama pull deepseek-r1:14b`)

## Installation

1. Clone the repository:
```bash
git clone git@github.com:pavodi-NM/deepseek-ai-chatbot.git
cd deepseek-ai-chatbot
```

2. Install required Python packages:
```bash
pip install fastapi uvicorn httpx websockets
```

3. Make sure Ollama is running: (not mandatory - you can go to step 4, which will run the model in the background)
```bash
ollama serve
```

4. Start the application:
```bash
python main.py
```

The application will be available at `http://localhost:8000`

## Project Structure

```
deepseek-chat/
├── main.py           # FastAPI server and WebSocket handling
├── static/
│   ├── chat.js      # Chat functionality and message formatting
│   └── chat.css     # Chat styling and animations
└── index.html       # Main application interface
```

## Features in Detail

### Backend (main.py)
- FastAPI server with WebSocket support
- Chat history management with period-based organization
- Ollama API integration with error handling
- Real-time message streaming

### Frontend
- Responsive layout with sidebar navigation
- Real-time message updates
- Code syntax highlighting
- Auto-resizing message input
- Markdown formatting support
- Loading indicators
- Chat history organization

## Configuration

The Ollama API endpoint and model name can be configured in `main.py`:

```python
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "deepseek-r1:14b"
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ using FastAPI, Ollama, and DeepSeek