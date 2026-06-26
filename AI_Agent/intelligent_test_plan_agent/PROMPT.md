# 📝 Intelligent Test Plan Agent (TestPlan AI) - Creation Prompt

This document contains the comprehensive, end-to-end prompt that can be used to instruct a code-generation LLM (like Gemini, Claude, or GPT-4) to build the entire **Intelligent Test Plan Agent (TestPlan AI)** application from scratch.

---

## 🤖 End-to-End System Generation Prompt

```markdown
You are a Principal Software Engineer and QA Architect. Build a premium, full-stack, responsive web application called **TestPlan AI** (Intelligent Test Plan Agent) using Next.js 14 (App Router), TypeScript, and Tailwind CSS. 

The application must feature a step-by-step wizard (Stepper) with 4 steps that guides the user from connection setup to generating a detailed test plan based on Jira user stories, following the B.L.A.S.T. Framework.

### 🛠️ Tech Stack & Dependencies
- **Core**: Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS.
- **Components & Icons**: Radix UI (or shadcn/ui primitives), Lucide React.
- **Markdown & Export**: react-markdown, remark-gfm, marked (for parsing markdown to HTML for Word export).
- **Package Manager**: npm.

---

### 📂 File & Directory Structure to Create
Generate the following file tree:
```plaintext
intelligent_test_plan_agent/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── src/
│   ├── lib/
│   │   └── utils.ts              # Tailwind merger helper
│   ├── components/
│   │   ├── ui/                   # Basic shadcn/ui components (card, button, input, label, textarea)
│   │   ├── layout/
│   │   │   └── TopHeader.tsx     # Navigation & Branding Header
│   │   └── planner/
│   │       ├── SetupStep.tsx     # Step 1: LLM & Jira credentials configuration
│   │       ├── FetchIssuesStep.tsx # Step 2: Query parameters to pull stories from Jira
│   │       ├── ReviewStep.tsx    # Step 3: Selection list & additional testing notes
│   │       └── TestPlanStep.tsx  # Step 4: Markdown preview, download, and history
│   └── app/
│       ├── globals.css           # Custom theme colors and Tailwind configurations
│       ├── layout.tsx            # Global layout wrapper
│       ├── page.tsx              # Central state controller & wizard UI
│       └── api/
│           ├── llm/
│           │   └── test-connection/
│           │       └── route.ts  # Verifies connectivity to Ollama or Groq/Grok APIs
│           ├── jira/
│           │   ├── connect/
│           │   │   └── route.ts  # Verifies basicauth credentials with Jiramyself endpoint
│           │   └── fetch-issues/
│           │       └── route.ts  # Issues JQL search query to fetch Jira stories
│           └── test-plan/
│               └── generate/
│                   └── route.ts  # Generates test plans from issues & context notes
```

---

### 🎨 Design & Styling
- **Aesthetic**: Premium dark mode/zinc aesthetic, clean cards with primary/accent glow (`border-primary/20`), responsive grids, elegant loaders (`animate-spin`), and smooth CSS page transitions (`animate-in fade-in zoom-in-95`).
- **Typography**: Modern fonts (e.g. Geist Sans, Geist Mono), clean table spacing, and properly padded layouts.

---

### ⚙️ Page and Component Functional Requirements

#### 1. Page State Controller (`src/app/page.tsx`)
- Maintain overall wizard progress (`currentStep` from 1 to 4).
- Manage shared state: `llmConfig`, `jiraConfig`, `fetchConfig` (product name, project key, sprint, specific issue keys, and context), `issuesList`, `selectedIssues` (a Set of issue IDs), `reviewNotes`, `testPlan` (Markdown string), and `isGenerating` state.
- Save/load `llmConfig` and `jiraConfig` to/from `localStorage` automatically on change to avoid re-inputting secrets.
- Add history tracking: Auto-save generated test plans to `localStorage` as history entries (timestamp, project name, and test plan content). Keep the last 20 entries.

#### 2. Layout Header (`src/components/layout/TopHeader.tsx`)
- Display brand logo/icon ("TestPlan AI") with a styled beta tag and modern dark-mode header bar.

#### 3. Step 1: Setup (`src/components/planner/SetupStep.tsx`)
- **LLM Connection**:
  - Dropdown to select provider: `Ollama (Local)`, `Groq`, or `Grok`.
  - Input field for Model Name (prefilled depending on provider).
  - Conditional URL input (Base URL for Ollama, prefilled with `http://localhost:11434`).
  - Conditional API Key input (Password masked input for Groq/Grok).
  - Button: "Test Connection" triggering `POST /api/llm/test-connection` with status feedback (Success/Error banners).
  - Button: "Save Connection" saving configuration state.
- **Jira Connection**:
  - Inputs for: Connection Name, Jira URL (e.g., `https://domain.atlassian.net`), Jira user Email, and Atlassian API Token.
  - Button: "Test Connection" triggering `POST /api/jira/connect`.
  - Button: "Save Connection" saving configuration state.
- **Next Navigation**: "Continue to Fetch User Story" button, active only if LLM configuration model is filled.

#### 4. Step 2: Fetch User Story (`src/components/planner/FetchIssuesStep.tsx`)
- Display readonly summary of active Jira connection URL and email.
- Fields:
  - Product Name (Required)
  - Sprint / Fix Version (Optional)
  - Project Key (e.g. `PROJ`) (Required unless Specific Story IDs are provided)
  - Specific Story IDs (Optional, comma-separated keys like `PROJ-1, PROJ-2`)
  - Additional Fetch Context (Optional textarea)
- Button: "Fetch User Story" triggering `POST /api/jira/fetch-issues`.
- Banners: If successful, show "Successfully fetched X user stories". If fail, display an error banner.
- Button: "Proceed to Select & Review", enabled only when stories are fetched.

#### 5. Step 3: Review (`src/components/planner/ReviewStep.tsx`)
- Textarea to supply optional "Additional Context & Notes" (e.g.,WCAG accessibility guidelines, performance targets, specific browser versions).
- Checkbox list displaying fetched Jira stories (Key, Summary, Type, Assignee).
- Checkboxes should toggle membership in `selectedIssues` (default all selected). Provide a "Select All" / "Deselect All" helper button.
- Button: "Generate Test Plan" triggering `POST /api/test-plan/generate` and proceeding immediately to Step 4.

#### 6. Step 4: Test Plan (`src/components/planner/TestPlanStep.tsx`)
- Displays an elegant markdown viewer rendering the generated markdown using `react-markdown` and `remark-gfm` inside a styled card.
- Provide a clean spinner loading screen while `isGenerating` is true.
- Actions:
  - **Copy**: Copy the raw Markdown output to the clipboard. Show a dynamic "Copied" check icon for 2 seconds.
  - **Download .DOCX**: Generate a `.doc` file containing the HTML parsed Markdown. Build this purely on the client side using a Blob formatted as `application/msword` with HTML wrappers so Word can open it natively.
- Button: "Create New Test Plan" which resets states (issuesList, selectedIssues, testPlan, reviewNotes) and takes the user back to Step 1.

---

### 🛰️ API Router Requirements (Next.js route handlers)

#### 1. `POST /api/llm/test-connection`
- Validate payload: `provider`, `modelName`, `baseUrl`, `apiKey`.
- If provider is `Ollama`, verify clean base URL, perform a GET to `${baseUrl}/api/tags`, and check if `modelName` is in the returned models list.
- If provider is `Groq` or `Grok`, resolve the endpoint (`https://api.groq.com/openai/v1` or `https://api.x.ai/v1`) and issue a POST to `/chat/completions` with a test message (`{"model": modelName, "messages": [{"role": "user", "content": "Test ping"}], "max_tokens": 1}`) and check for an HTTP 200 response. Return relevant error text if connection fails.

#### 2. `POST /api/jira/connect`
- Sanitize email and API token (strip trailing spaces or copy-paste newlines).
- Build Basic Auth header: `Basic Base64(email:token)`.
- Make GET request to Atlassian API at `${jiraUrl}/rest/api/3/myself`.
- Verify response is HTTP 200 and valid JSON. Return user display name on success.

#### 3. `POST /api/jira/fetch-issues`
- Extract credentials and JQL inputs. Sanitize credentials.
- Compile JQL query dynamically:
  - Include project key filter if specified: `project="PROJECT_KEY"`.
  - Include sprint filter if specified: `sprint="SPRINT"`.
  - Include issue key list if specified: `issueKey IN ("KEY1", "KEY2")`.
  - Join elements with ` AND ` and append ` ORDER BY created DESC`.
- POST query to `${jiraUrl}/rest/api/3/search/jql` with payload: `{"jql": jql, "maxResults": 20, "fields": ["summary", "status", "issuetype", "assignee", "description"]}`.
- Parse Jira response. Map issues list to simple JSON format: `{ id, key, summary, type, status, assignee, description }`. Extract primitive text content from Jira's Atlassian Document Format (ADF) for the description.

#### 4. `POST /api/test-plan/generate`
- Input: Selected issues list and additional context notes.
- (Mock Mode): Simulate LLM execution using a 3.5s delay. Generate a beautiful, highly structured Markdown template using the issue summaries/keys and the custom context.
- (Production Mode): Connect directly to the user's selected LLM provider. Pass the issues data and review notes with a highly structured prompt to write a detailed QA Test Plan containing:
  - Objective & Strategic Context
  - Detailed Scope (Inclusions, Exclusions, Environments)
  - Detailed Step-by-Step Test Scenarios (Positive, Negative, Edge cases) mapped back to individual JIRA keys
  - Entry/Exit Criteria and Tools
  - Risks and Mitigations
  - Approvals Section
```
