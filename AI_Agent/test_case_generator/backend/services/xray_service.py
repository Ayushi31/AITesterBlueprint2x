import httpx

class XrayService:
    @staticmethod
    async def push_test_cases(client_id: str, client_secret: str, project_key: str, test_cases: list[dict]) -> dict:
        auth_url = "https://xray.cloud.getxray.app/api/v2/authenticate"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            auth_response = await client.post(auth_url, json={
                "client_id": client_id,
                "client_secret": client_secret
            })
            
            if auth_response.status_code != 200:
                raise ValueError("Failed to authenticate with Xray. Please check your credentials.")
                
            token = auth_response.text.strip('"')
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Map generated tests into Xray GraphQL or REST format (using REST /api/v2/import/test/bulk as a simpler proxy or standard json)
            # The structure for Xray Bulk Import format:
            xray_tests = []
            for tc in test_cases:
                xray_tests.append({
                    "testtype": "Manual",
                    "fields": {
                        "summary": tc.get("title", "Generated Test Case"),
                        "project": {
                            "key": project_key
                        },
                        "description": tc.get("preconditions") + "\n\nTest Data: " + tc.get("test_data", ""),
                        "labels": tc.get("labels", [])
                    },
                    "steps": [{"action": step, "data": "", "result": tc.get("expected_result", "")} for step in tc.get("steps", [])]
                })

            # Due to the complexity of actual Xray API schemas, we'll hit an endpoint if provided or mock success.
            # Push tests logic:
            # We would usually use `/api/v2/import/test/bulk` endpoint
            # return {"success": True, "pushed_count": len(xray_tests), "message": "Successfully pushed to Xray Cloud"}
            
            import_url = "https://xray.cloud.getxray.app/api/v2/import/test/bulk"
            # For demonstration, we'll try the actual bulk import:
            import_response = await client.post(import_url, headers=headers, json=xray_tests)
            
            if import_response.status_code in [200, 201]:
                return {"success": True, "pushed_count": len(xray_tests), "message": "Successfully pushed to Xray", "response": import_response.json()}
            else:
                return {"success": False, "pushed_count": 0, "message": f"Xray Import failed: {import_response.text}", "response": {}}
