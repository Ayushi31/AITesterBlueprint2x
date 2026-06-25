import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { issues, context } = body;

    if (!issues || issues.length === 0) {
      return NextResponse.json({ error: "Missing Jira issues" }, { status: 400 });
    }

    // Simulate LLM Processing Wait Time
    await new Promise((resolve) => setTimeout(resolve, 3500));

    const featuresMarkdown = issues.map((i: any) => `- **${i.key}:** ${i.summary} (Assignee: ${i.assignee || 'Unassigned'})`).join("\n");
    const testCasesScenarios = issues.map((i: any, ind: number) => `### TC-${ind + 1}: ${i.summary}\n- **Linked Issue:** ${i.key}\n- **Pre-condition:** User has access and context is established.\n- **Steps:** Validate the functionality described in ${i.key}.\n- **Expected Result:** Functionality works seamlessly without errors.\n`).join("\n");

    const generatedMarkdown = `# Test Plan for Generated Jira Scope

**Created by:** AI Test Planner
**Date:** ${new Date().toLocaleDateString()}
**Requirements Count:** ${issues.length}
**Strategic Context:** ${context || "None provided by user."}

---

# 1. Objective
This document outlines the test plan for the **Jira Generated Scope** application. The objective is to ensure that all features and functionalities work as expected for the target audience.

---

# 2. Scope

The scope of this test plan includes:

**Features to be tested:**  
${featuresMarkdown}

**Types of testing:**
- Manual Testing
- Automated Testing
- Performance Testing
- Accessibility Testing

**Environments:**  
Testing across different browsers, operating systems, and device types.

**Evaluation Criteria:**
- Number of defects found
- Time taken to complete testing
- User satisfaction ratings

**Team Roles and Responsibilities:**
- Test Lead
- Testers
- Developers
- Stakeholders

---

# 3. Inclusions

## Introduction
Overview of the test plan including its **purpose, scope, and goals**.

## Test Objectives
- Identify defects in the application.
- Improve user experience.
- Ensure the system performs efficiently under expected load.
- Validate that all core functionalities work as expected.

---

# 4. Exclusions
List any features or components that are **out of scope** for this test plan.

Examples:
- Third-party integrations not controlled by the application team.
- Future features planned for later releases.
- Beta or experimental modules.

---

# 5. Test Environments

**Operating Systems:**
- Windows 10
- macOS
- Linux

**Browsers:**
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

**Devices:**
- Desktop computers
- Laptops
- Tablets
- Smartphones

**Network Connectivity:**
- Wi-Fi
- Cellular networks
- Wired connections

---

# 6. Defect Reporting Procedure

**Criteria for Identifying Defects:**
- Deviation from requirements
- User experience issues
- Technical errors or crashes

**Steps for Reporting Defects:**
1. Use the designated defect template.
2. Provide detailed reproduction steps.
3. Attach screenshots or logs where necessary.

**Triage and Prioritization:**
- Assign severity levels (Critical, High, Medium, Low).
- Assign priority levels.

---

# 7. Test Strategy

## Step 1: Test Scenarios and Test Cases Creation

${testCasesScenarios}

## Step 2: Testing Procedure

**Smoke Testing:**  
To verify that critical functionalities work before detailed testing begins.

**In-Depth Testing:**  
Execution of detailed test cases after the build passes Smoke Testing.

---

# 8. Test Schedule

**Tasks and Estimated Time Duration:**
- Test Plan Creation
- Test Scenario Creation
- Test Case Creation
- Test Case Execution
- Test Summary Report Submission

---

# 9. Entry and Exit Criteria

## Requirement Analysis

**Entry Criteria:**
- Receiving Requirements Documents.

**Exit Criteria:**
- Requirements understood and clarified.

---

# 10. Tools

**List of Tools:**
- JIRA – Bug Tracking Tool
- Mind Map Tool
- Snipping Tool / Screenshot Tool
- Microsoft Word
- Microsoft Excel

---

# 11. Risks and Mitigations

**Possible Risks:**
- Non-availability of a key resource.
- Build URL not working.
- Limited time available for testing.

**Mitigations:**
- Backup resource planning.
- Working on parallel tasks when blocked.
- Dynamically allocating additional resources if required.

---

# 12. Approvals

**Approved By:** ___________________________

**Date:** ___________________________
`;

    return NextResponse.json({ success: true, testPlan: generatedMarkdown });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
