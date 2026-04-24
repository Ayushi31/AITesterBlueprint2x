import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { url, email, token, productName, projectKey, sprint, issueKeys } = body;

    if (!url || (!projectKey && !issueKeys)) {
      return NextResponse.json({ error: "Missing Jira Configuration, Project Key, or Issue Keys" }, { status: 400 });
    }

    // CRITICAL: Strip any copy/paste invisible newline characters that crash Node.js fetch() headers
    email = email?.trim().replace(/[\r\n\t]/g, '') || '';
    token = token?.trim().replace(/[\r\n\t]/g, '') || '';

    let cleanUrl = url.trim().replace(/\/$/, "");
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    
    try {
      const parsedUrl = new URL(cleanUrl);
      cleanUrl = parsedUrl.origin;
    } catch(e) {}

    const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;

    let jqlChunks = [];
    if (projectKey) jqlChunks.push(`project="${projectKey}"`);
    if (sprint) jqlChunks.push(`sprint="${sprint}"`);
    if (issueKeys) {
        const keysArray = issueKeys.split(',').filter((k: string) => k.trim()).map((k: string) => `"${k.trim()}"`).join(',');
        if (keysArray) jqlChunks.push(`issueKey IN (${keysArray})`);
    }
    const jql = jqlChunks.join(" AND ") + " ORDER BY created DESC";

    const res = await fetch(`${cleanUrl}/rest/api/3/search/jql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        jql: jql,
        maxResults: 20,
        fields: ["summary", "status", "issuetype", "assignee", "description"]
      })
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch issues: ${res.statusText}. Please verify that the Project Key (${projectKey}) exists.` }, { status: 400 });
    }

    const data = await res.json();
    const realIssues = data.issues?.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields?.summary || "No Summary",
        type: issue.fields?.issuetype?.name || "Task",
        status: issue.fields?.status?.name || "To Do",
        assignee: issue.fields?.assignee?.displayName || "Unassigned",
        // Extracting primitive text from Jira's Atlassian Document Format (ADF) for description
        description: issue.fields?.description?.content?.map((c: any) => c.content?.map((t: any) => t.text).join(" ")).join("\n") || "", 
    })) || [];

    return NextResponse.json({ success: true, issues: realIssues });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
