# Test Case Generation Process - RICEPOT

## 1. Objective and Overview
Based on the explicit rules in `Anti-HallucinationRule.md` and the user's sequential prompts, the objective was initially to extract the **Restful-Booker** (`https://restful-booker.herokuapp.com/apidoc/index.html`) API documentation and build an Excel test execution suite.

Afterward, a second prompt required refining the exact Excel column structure to map identically to an industry-standard format referenced in a provided Google Sheet (`https://docs.google.com/spreadsheets/d/1EH1UJ9Qezgx_aZ0xim3KcVJUCEeR7A-7`), ensuring that the steps map explicitly to **POSTMAN Execution**.

## 2. Actions Taken

- **Step 1: Extracted Provided Reference CSV** 
  Downloaded the provided reference link (`template.csv`) to parse the required columns mapping for POSTMAN execution templates.
  
- **Step 2: Restructured API Test Generations (`generate_excel.js`)**
  A customized `generate_excel.js` using `ExcelJS` was written to transform `api_data.json` into the specific format.
  - Columns defined: `Scenario TID`, `TestCase Description`, `PreCondition`, `TestSteps`, `Expected Result`, `Actual Result`, `Status`, `Executed QA Name`, `Misc (Comments)`, `Priority`, `Is Automated`.
  - Injected `cURL` commands inline into the **TestSteps** column, formatted sequentially: "1. Login to POSTMAN tool -> 2. Import the Curl command...".
  - Injected explicit Postman scripting snippets (`pm.test()`) into the `TestSteps` column as reference material for the exact status codes.
  - **Negative Coverage**: Extracted explicitly defined optional vs. mandatory parameters and authorization definitions from the documentation to build 403 Forbidden and validation error requests.

- **Step 3: Output Delivery**
  Successfully executed the codebase via `node generate_excel.js`, writing the final matching file to: `api-bookings-testcases.xlsx`.

## 3. The Prompts Used

**Prompt 1 (Initial Build):**
```text
@[c:\Users\HP\AITesterBlueprint2x\project_04_TestCases_apiBooking_RICEPOT]You are an QA Engineer 15 years of experience of end to end experience starting from test plan creation to test case generation. Use this API Documentation 
https://restful-booker.herokuapp.com/apidoc/index.html
I want you to create the Test Cases in the Excel sheet ...
```

**Prompt 2 (Postman and Pattern Realignment):**
```text
I have reviewed the xlsx file. i dont think its as per the indistry standard. You have to cover the api testcases mentioned in the https://restful-booker.herokuapp.com/apidoc/index.html 
The xlsx which is craeted is not following the columns as that of the xlsx link I provided. Also the basic column of Steps to reprdduce s no there.
https://docs.google.com/spreadsheets/d/1EH1UJ9Qezgx_aZ0xim3KcVJUCEeR7A-7/edit?gid=2092503341#gid=2092503341

Now refer this doc and write test cases in this pattern as if we have to execute this test acses in POSTMAN
```
