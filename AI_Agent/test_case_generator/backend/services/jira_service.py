import httpx
import base64
from models.schemas import IssueData

class JiraService:
    @staticmethod
    def get_auth_header(email: str, api_token: str) -> dict:
        auth_str = f"{email}:{api_token}"
        b64_auth_str = base64.b64encode(auth_str.encode()).decode()
        return {
            "Authorization": f"Basic {b64_auth_str}",
            "Accept": "application/json"
        }

    @staticmethod
    async def test_connection(base_url: str, email: str, api_token: str) -> bool:
        url = f"{base_url.rstrip('/')}/rest/api/3/myself"
        headers = JiraService.get_auth_header(email, api_token)
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            return response.status_code == 200

    @staticmethod
    async def fetch_issue(issue_id: str, base_url: str, email: str, api_token: str) -> dict:
        url = f"{base_url.rstrip('/')}/rest/api/3/issue/{issue_id}"
        headers = JiraService.get_auth_header(email, api_token)
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            # Extract basic data
            fields = data.get("fields", {})
            summary = fields.get("summary", "")
            
            # Description processing (Adf format to text roughly, or just raw string for LLM)
            # Jira REST API v3 returns Atlassian Document Format (ADF) for description
            description_obj = fields.get("description", {})
            description_text = str(description_obj) if description_obj else "No description provided."
            
            # Custom field for acceptance criteria could be tricky to find by name, but we can look for 'customfield' containing string
            acceptance_criteria = "Not found"
            for key, val in fields.items():
                if val and isinstance(val, str) and ("acceptance" in key.lower() or "criteria" in key.lower()):
                    acceptance_criteria = val
                    break
            
            issue_type = fields.get("issuetype", {}).get("name", "Unknown")
            priority = fields.get("priority", {}).get("name", "Medium")
            components = [comp.get("name") for comp in fields.get("components", [])]
            
            return IssueData(
                id=data.get("id"),
                key=data.get("key"),
                summary=summary,
                description=description_text,
                issue_type=issue_type,
                priority=priority,
                components=components,
                acceptance_criteria=acceptance_criteria
            ).model_dump()
