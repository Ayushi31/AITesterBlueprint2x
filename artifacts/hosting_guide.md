# 🌐 Deployment Guide: Hosting the AI Test Case Generator for Free

To share this full-stack application (React frontend + FastAPI backend) with other users, you need to host both components. Below is a guide to the best free-tier hosting setups.

---

## 🛠️ Step 0: Make Frontend URLs Dynamic (Prerequisite)

Currently, the React frontend points directly to `http://localhost:8000` in files like [App.tsx](file:///c:/Repositories/AITesterBlueprint2x/AI_Agent/test_case_generator/frontend/src/App.tsx) and [JiraConnection.tsx](file:///c:/Repositories/AITesterBlueprint2x/AI_Agent/test_case_generator/frontend/src/components/JiraConnection.tsx). Before deploying, we should modify these files to use an environment variable for the API base URL, falling back to localhost during development:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Example request:
const response = await axios.post(`${API_BASE_URL}/testcases/generate`, { ... });
```

---

## 💻 Option 1: Frontend on Vercel + Backend on Render/Koyeb (Recommended)

This is the standard and most reliable full-stack deployment model.

### 1. Frontend: Deploy to Vercel (Free)
Vercel is the premier platform for hosting React (Vite) applications.
* **Cost**: Free (Hobby plan)
* **Setup Steps**:
  1. Go to [Vercel](https://vercel.com/) and sign up with GitHub.
  2. Click **Add New** > **Project** and import your `AITesterBlueprint2x` repository.
  3. Set the **Root Directory** to `AI_Agent/test_case_generator/frontend`.
  4. Vercel will auto-detect Vite. Under **Environment Variables**, add:
     * `VITE_API_URL` = `<your-deployed-backend-url>` (e.g. `https://my-backend.onrender.com`)
  5. Click **Deploy**. Vercel will build and host your app with free SSL (e.g. `https://my-frontend.vercel.app`).

### 2. Backend: Deploy to Render or Koyeb (Free)
Both Render and Koyeb support hosting Python/FastAPI services directly from your GitHub repository.
* **Cost**: Free (instances spin down/go to sleep after 15–50 minutes of inactivity, taking ~30–50 seconds to wake up on the first request).
* **Setup Steps (Render)**:
  1. Go to [Render](https://render.com/) and connect your GitHub account.
  2. Click **New** > **Web Service**.
  3. Choose your repository.
  4. Configure settings:
     * **Root Directory**: `AI_Agent/test_case_generator/backend`
     * **Language**: `Python 3`
     * **Build Command**: `pip install -r requirements.txt`
     * **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
  5. Under **Environment Variables**, add:
     * `GROQ_API_KEY` = `<your-corporate-fallback-key>` (optional, since users can bring their own keys).
  6. Click **Create Web Service**. Render will build and deploy the service, providing an HTTPS URL.

---

## 🐋 Option 2: Deploy Both as a Single Dockerized App on Hugging Face Spaces (Free)

Hugging Face Spaces allows you to run free Docker containers with up to 16GB RAM and 2 vCPUs. You can run both the FastAPI backend and build/serve the Vite frontend from the same container!

* **Cost**: Free (no spin-down when active; remains running).
* **Setup Steps**:
  1. Create a `Dockerfile` at the root of `test_case_generator` that builds the React static files and copies them into a folder that FastAPI serves using `StaticFiles`:
     ```dockerfile
     # Stage 1: Build React Frontend
     FROM node:20 AS frontend-builder
     WORKDIR /app/frontend
     COPY frontend/package*.json ./
     RUN npm install
     COPY frontend/ ./
     RUN npm run build

     # Stage 2: Build FastAPI Backend & Serve Frontend
     FROM python:3.11-slim
     WORKDIR /app
     COPY backend/requirements.txt ./
     RUN pip install --no-cache-dir -r requirements.txt
     COPY backend/ ./
     COPY --from=frontend-builder /app/frontend/dist ./static
     
     # Expose port
     EXPOSE 7860
     CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
     ```
  2. Modify `backend/main.py` to mount and serve the static files:
     ```python
     from fastapi.staticfiles import StaticFiles
     # ...
     app.mount("/", StaticFiles(directory="static", html=True), name="static")
     ```
  3. Go to [Hugging Face Spaces](https://huggingface.co/spaces), create a new Space, choose **Docker** as the SDK, and push your repository. It will build and run automatically for free.

---

## ⚡ Option 3: Deploy Backend on Vercel Serverless (Free)

Vercel supports Python Serverless Functions, allowing you to deploy the backend and frontend together on Vercel.
* **Setup Steps**:
  1. Create a `vercel.json` file at the root of `test_case_generator`:
     ```json
     {
       "rewrites": [
         { "source": "/api/(.*)", "destination": "/backend/main.py" },
         { "source": "/(.*)", "destination": "/frontend/$1" }
       ]
     }
     ```
  2. However, this requires writing handler files conforming to WSGI/ASGI adapters (like `mangum`), which can add configuration complexity. Option 1 is generally preferred for ease of setup.
