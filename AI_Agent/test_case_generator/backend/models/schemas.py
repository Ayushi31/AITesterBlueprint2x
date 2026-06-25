from pydantic import BaseModel, Field
from typing import List, Optional

class JiraConnectionRequest(BaseModel):
    base_url: str
    email: str
    api_token: str

class IssueFetchRequest(BaseModel):
    issue_id: str
    base_url: str
    email: str
    api_token: str

class IssueData(BaseModel):
    id: str
    key: str
    summary: str
    description: Optional[str] = None
    issue_type: str
    priority: str
    components: List[str]
    acceptance_criteria: Optional[str] = None

class TestCaseGenerationRequest(BaseModel):
    issue_data: IssueData
    template: str
    llm_provider: str = "groq"
    model: str = "llama3-70b-8192"
    api_key: Optional[str] = None

class TestCase(BaseModel):
    id: str = Field(description="Unique Test Case ID e.g., TC_001")
    title: str = Field(description="Summary or title of the test case")
    type: str = Field(description="Positive | Negative | Edge | Boundary | Security")
    priority: str = Field(description="P0 | P1 | P2")
    component: str = Field(description="Component name")
    labels: List[str] = Field(description="List of labels or tags")
    preconditions: str = Field(description="Setup or context required before execution")
    steps: List[str] = Field(description="Numbered step-by-step instructions")
    test_data: str = Field(description="Required test data if any")
    expected_result: str = Field(description="The desired or expected outcome")
    linked_jira_id: str = Field(description="The Jira story ID this links to")
    automation_candidate: str = Field(description="Yes | No")

class XrayPushRequest(BaseModel):
    test_cases: List[TestCase]
    client_id: str
    client_secret: str
    project_key: str
