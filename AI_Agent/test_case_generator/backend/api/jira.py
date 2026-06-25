from fastapi import APIRouter, HTTPException
from models.schemas import JiraConnectionRequest, IssueFetchRequest, IssueData
from services.jira_service import JiraService

router = APIRouter()

@router.post("/test-connection")
async def test_jira_connection(req: JiraConnectionRequest):
    try:
        success = await JiraService.test_connection(req.base_url, req.email, req.api_token)
        if success:
            return {"status": "success", "message": "Connection successful"}
        else:
            raise HTTPException(status_code=401, detail="Authentication failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fetch-issue", response_model=IssueData)
async def fetch_issue(req: IssueFetchRequest):
    try:
        issue_data = await JiraService.fetch_issue(req.issue_id, req.base_url, req.email, req.api_token)
        return issue_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch issue: {str(e)}")
