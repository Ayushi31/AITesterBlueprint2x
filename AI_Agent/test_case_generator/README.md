# 🧪 AI Test Case Generator

An AI-powered, full-stack Quality Assurance assistant that fetches Jira stories, uses LLMs to generate high-quality test cases based on structured testing templates, displays them in an interactive spreadsheet interface, and exports/pushes them directly to Jira or Xray.

---

## 🚀 How to Run the Project

### 1. Run the Backend API Server
The backend is built with FastAPI and runs on port `8000`.

1. Navigate to the backend directory:
   ```bash
   cd AI_Agent/test_case_generator/backend
   ```
2. Activate the Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```
3. Run the FastAPI development server:
   ```bash
   python main.py
   ```
   The backend API will be available at **`http://localhost:8000`**. You can access the interactive Swagger documentation at **`http://localhost:8000/docs`**.

> [!NOTE]
> The backend expects a `.env` file containing your `GROQ_API_KEY` if you want to use a corporate/fallback API key. Alternatively, users can supply their own keys via the frontend UI (Bring Your Own Key model).

---

### 2. Run the Frontend Web Application
The frontend is built with React, Vite, and Tailwind CSS. It runs on port `5173`.

1. Navigate to the frontend directory:
   ```bash
   cd AI_Agent/test_case_generator/frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at **`http://localhost:5173`**.

---

## 📂 Project Structure

```plaintext
test_case_generator/
├── backend/
│   ├── api/                  # FastAPI routers (jira, testcases)
│   ├── models/               # Pydantic data schemas
│   ├── services/             # API services (jira, llm/groq, xray)
│   ├── main.py               # Application entry point
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # UI Components (JiraConnection, IssueFetcher, TestCaseTable, ExportPanel)
│   │   ├── utils/            # Export utilities
│   │   ├── App.tsx           # Main application state and layout
│   │   └── index.css         # Tailwind directives & global styling
│   ├── package.json          # Node dependencies & scripts
│   └── vite.config.ts        # Vite configuration
└── README.md                 # Project documentation (this file)
```

---

## 🤖 Creation Prompt & Blueprint

This project was built following the **B.L.A.S.T.** (Blueprint, Link, Architect, Stylize, Trigger) protocol as defined in the System Pilot guidelines. Below is the blueprint prompt that was used to design and generate the codebase:

### 📝 System Pilot Directive / Creation Prompt

```markdown
Build a premium, dark-themed, full-stack AI Test Case Generator. The application must feature:

1. FastAPI Backend (Layer 3 Tools):
   - A Jira integration service to fetch issue details (Summary, Description, Acceptance Criteria, Priority, Components).
   - An LLM service utilizing the Groq API (AsyncGroq) that generates a structured list of test cases in JSON format matching a predefined schema.
   - An Xray Integration service to authenticate and push generated test cases directly to Jira Xray.
   - Strict validation of response JSONs using Pydantic schemas.

2. React + TypeScript + Vite Frontend (Layer 4 Stylize):
   - A modern dark-mode UI with clean glassmorphism cards and smooth transitions.
   - Live Connection Testing for LLMs with dynamic model fetching from the Groq API.
   - Interactive, spreadsheet-style editable grid to modify, add, or delete test cases before exporting.
   - Export Panel support:
     - CSV download formatted specifically for Jira Xray import.
     - Direct markdown preview and download.
     - Copy-to-clipboard for quick sharing (e.g. WhatsApp, Slack).
     - Live direct push to Xray Cloud via credentials form.

3. Architectural Alignment:
   - Separate concerns clearly into models, services, and routers in the backend.
   - Follow clean, reusable component principles in the frontend with robust error boundaries and loading states.
```

### 🧠 LLM Generation Prompt (from [llm_service.py](file:///c:/Repositories/AITesterBlueprint2x/AI_Agent/test_case_generator/backend/services/llm_service.py))

Below is the core system prompt executed by the backend LLM service to produce deterministic, high-quality test cases:

```python
system_prompt = f"""You are a senior full-stack QA Architect with 15+ years of experience.
Your goal is to generate professional, high-quality test cases directly usable in Jira/Xray based on the given Jira Story.
We need at least 5 to 12 test cases covering Positive, Negative, Edge, Boundary, and Security aspects.

Use this specific testing template/focus: {template}

Rules:
- Derive everything from acceptance criteria first.
- Add missing real-world scenarios.
- Keep realistic test data.
- Ensure reproducible steps.
- Avoid vague wording.
- OUTPUT ONLY STRICT VALID JSON object with a single key 'testcases' containing an array matching this exact schema:
{{
  "testcases": [
    {{
      "id": "TC_001",
      "title": "...",
      "type": "Positive | Negative | Edge | Boundary | Security",
      "priority": "P0 | P1 | P2",
      "component": "...",
      "labels": ["..."],
      "preconditions": "...",
      "steps": ["step 1", "step 2"],
      "test_data": "...",
      "expected_result": "...",
      "linked_jira_id": "{issue_data.get('key', 'UNKNOWN')}",
      "automation_candidate": "Yes | No"
    }}
  ]
}}
"""
```
