export const exportToCSV = (testCases: any[], filename: string = "testcases.csv") => {
  const headers = [
    "Test Type", "Summary", "Precondition", "Test Steps", "Expected Result",
    "Priority", "Labels", "Components", "Automation Status", "Requirement ID"
  ];

  const rows = testCases.map(tc => {
    // Format steps properly for CSV
    const stepsFormatted = (tc.steps || []).map((step: string, index: number) => `${index + 1}. ${step}`).join("\n");
    return [
      tc.type || "Positive",
      tc.title || "Untitled",
      (tc.preconditions || "") + (tc.test_data ? `\nTest Data: ${tc.test_data}` : ""),
      stepsFormatted,
      tc.expected_result || "",
      tc.priority || "Medium",
      (tc.labels || []).join(", "),
      tc.component || "",
      tc.automation_candidate || "No",
      tc.linked_jira_id || ""
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToTSV = (testCases: any[]) => {
  const headers = [
    "Test Type", "Summary", "Precondition", "Test Steps", "Expected Result",
    "Priority", "Labels", "Components"
  ];
  const rows = testCases.map(tc => {
    const stepsFormatted = (tc.steps || []).map((step: string, index: number) => `${index + 1}. ${step}`).join(" | ");
    return [
      tc.type, tc.title, tc.preconditions, stepsFormatted, tc.expected_result,
      tc.priority, (tc.labels || []).join(", "), tc.component
    ].join("\t");
  });
  const tsvContent = [headers.join("\t"), ...rows].join("\n");
  navigator.clipboard.writeText(tsvContent);
  alert("Copied as TSV");
};

export const exportToMarkdown = (testCases: any[]) => {
  let md = "# Test Cases\n\n";
  testCases.forEach(tc => {
    md += `## [${tc.id}] ${tc.title}\n`;
    md += `- **Type**: ${tc.type}\n`;
    md += `- **Priority**: ${tc.priority}\n`;
    md += `- **Component**: ${tc.component}\n`;
    md += `- **Preconditions**: ${tc.preconditions}\n`;
    md += `- **Test Data**: ${tc.test_data}\n\n`;
    md += `### Steps\n`;
    (tc.steps || []).forEach((step: string, i: number) => {
      md += `${i + 1}. ${step}\n`;
    });
    md += `\n### Expected Result\n${tc.expected_result}\n\n`;
    md += `---\n\n`;
  });
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "testcases.md");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToWhatsApp = (testCases: any[]) => {
  const text = testCases.map(tc => {
    return `✅ *${tc.id}* - ${tc.title}\n\n*Steps:*\n${(tc.steps || []).map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\n*Expected:*\n${tc.expected_result}\n\n*Priority:* ${tc.priority}\n*Type:* ${tc.type}`;
  }).join("\n\n-----------------\n\n");
  navigator.clipboard.writeText(text);
  alert("Copied for WhatsApp");
};
