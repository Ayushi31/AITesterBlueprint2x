from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.schemas import TestCaseGenerationRequest, XrayPushRequest, TestCase
from services.llm_service import LLMService
from services.xray_service import XrayService
from typing import List

router = APIRouter()

class LLMConnectionRequest(BaseModel):
    api_key: str = ""

@router.post("/test-llm-connection")
async def test_llm_connection(req: LLMConnectionRequest):
    try:
        models = await LLMService.test_llm_connection(req.api_key)
        return {"status": "success", "models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=List[TestCase])
async def generate_testcases(req: TestCaseGenerationRequest):
    try:
        data = await LLMService.generate_test_cases(
            issue_data=req.issue_data.model_dump(),
            template=req.template,
            llm_provider=req.llm_provider,
            model=req.model,
            api_key=req.api_key
        )
        # Validate data against Pydantic schema
        validated_cases = [TestCase(**tc) for tc in data]
        return validated_cases
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.post("/push-xray")
async def push_to_xray(req: XrayPushRequest):
    try:
        result = await XrayService.push_test_cases(
            client_id=req.client_id,
            client_secret=req.client_secret,
            project_key=req.project_key,
            test_cases=[tc.model_dump() for tc in req.test_cases]
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
