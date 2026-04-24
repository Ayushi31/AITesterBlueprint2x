import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api import jira, testcases

load_dotenv()

app = FastAPI(title="AI Test Case Generator API", version="1.0.0")

# Configure CORS for local React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Since it's a local tool
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jira.router, prefix="/jira", tags=["Jira"])
app.include_router(testcases.router, prefix="/testcases", tags=["Test Cases"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
