# Task Plan

## Blueprint
**(Approved)**

### Project Name: Local LLM Test Generator

### 1. Overview
A web-based tool allowing users to generate API and Web Application test cases (both functional and non-functional) from Jira requirements using various LLM providers.

### 2. Tech Stack
- **Frontend**: React with TypeScript.
- **Backend / API**: Node.js with TypeScript.

### 3. Core Features
- **Requirement Input**: A chat interface or text area where users can copy and paste Jira requirements.
- **Test Generation Engine**: 
  - Capable of generating Functional and Non-Functional test cases.
  - Outputs test cases strictly in **Jira format** (e.g., Summary, Description, Preconditions, Steps to Reproduce, Expected Results, Priority).
- **LLM Configuration & Settings**:
  - Support for local providers: Ollama API, LM Studio API.
  - Support for cloud providers: Grok API, OpenAI, Claude API, Gemini API.
  - Settings window to configure these providers (e.g., Provider Selection, Base URL, API Key, Model Name, Temperature).

### 4. Implementation Details
- The frontend will have a main input area for requirements and an output area to display the generated test cases cleanly formatting them for Jira.
- A settings modal/page will exist to configure the LLM endpoints and API keys.

***

## Phases and Goals
### Phase 1: Discovery (Completed)
- [x] Understand the scope and requirements of the project.
- [x] Ask discovery questions to the user.

### Phase 2: Planning (Completed)
- [x] Draft the project blueprint.
- [x] Get the blueprint approved.

### Phase 3: Execution (Current)
- [ ] Initialize the Node.js backend (`backend/` directory).
- [ ] Initialize the React frontend (`frontend/` directory).
- [ ] Implement backend API endpoints for LLM routing.
- [ ] Implement frontend UI (chat interface, settings modal).
- [ ] Integrate local LLMs (Ollama, LM Studio).
- [ ] Integrate Cloud LLMs (OpenAI, Claude, Gemini, Grok).
- [ ] Add Jira Formatting logic to the backend/LLM prompts.

## Checklists (Overall)
- [x] Create initialization files.
- [x] User answers discovery questions.
- [x] Formulate Blueprint.
- [x] Blueprint approved by user.
- [ ] Set up Project Structure (Frontend/Backend).
