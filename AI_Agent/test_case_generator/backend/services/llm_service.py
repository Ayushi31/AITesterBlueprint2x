import json
import os
from groq import AsyncGroq
from models.schemas import IssueData, TestCase
from pydantic import ValidationError

class LLMService:
    @staticmethod
    async def test_llm_connection(api_key: str) -> list[str]:
        if not api_key:
            api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise ValueError("API Key is missing for LLM Provider.")

        client = AsyncGroq(api_key=api_key)
        try:
            # Filter for valid, free text models supported on Groq
            FREE_MODELS = {
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant",
                "llama-3.2-1b-preview",
                "llama-3.2-3b-preview",
                "mixtral-8x7b-32768",
                "gemma2-9b-it",
                "deepseek-r1-distill-llama-70b",
                "deepseek-r1-distill-qwen-32b",
                "llama3-70b-8192",
                "llama3-8b-8192"
            }
            models = [m.id for m in models_response.data if m.id in FREE_MODELS]
            # Ensure a fallback default is available just in case list is empty
            if not models:
                models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"]
            return models
        except Exception as e:
            if "invalid_api_key" in str(e).lower() or "401" in str(e):
                raise ValueError("Invalid Groq API Key provided.")
            # Fallback to hardcoded safe list if API merely restricts model fetching
            return ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"]

    @staticmethod
    async def generate_test_cases(issue_data: dict, template: str, llm_provider: str, model: str, api_key: str) -> list[dict]:
        if not api_key:
            api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise ValueError("API Key is missing for LLM Provider.")

        client = AsyncGroq(api_key=api_key)
        
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

        user_prompt = f"""
Jira Issue Details:
Summary: {issue_data.get('summary')}
Issue Type: {issue_data.get('issue_type')}
Priority: {issue_data.get('priority')}
Components: {', '.join(issue_data.get('components', []))}
Acceptance Criteria: {issue_data.get('acceptance_criteria')}
Description: {issue_data.get('description')}

Return the JSON object now.
"""
        
        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model=model if model else "llama-3.3-70b-versatile",
            temperature=0.4,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        data = json.loads(content)
        return data.get("testcases", [])

