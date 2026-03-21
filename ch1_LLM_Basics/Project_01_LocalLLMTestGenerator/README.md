# Local LLM Test Generator

This project allows you to paste Jira requirements and instantly generate Functional and Non-Functional test cases formatted perfectly for Jira issues. It supports local LLMs (Ollama, LM Studio) and Cloud LLMs (OpenAI, Claude, Gemini, Grok).

## Project Structure
- `/backend`: Node.js Express server acting as the bridge to various LLM APIs.
- `/frontend`: React (Vite) + TypeScript application providing a chat UI and settings panel.

## How to Run Locally

Since this was generated natively, you need to install the dependencies on your machine first.

### 1. Start the Backend
Open a terminal and run:
```bash
cd backend
npm install
npm run dev
```
*The backend will run on http://localhost:3001*

### 2. Start the Frontend
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on http://localhost:5173 (or similar Vite port)*

### 3. Usage
1. Open the frontend in your browser.
2. Click **Settings** in the top right.
3. Choose your provider (e.g., Ollama, OpenAI).
4. Enter the necessary configuration (Base URL or API Key, and Model name).
5. Paste your Jira requirement in the chat box and click Send! 

**Note**: Ensure your local LLM (like Ollama) is actually running before sending requests from the settings menu.
