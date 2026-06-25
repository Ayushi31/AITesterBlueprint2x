import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let requestBody: any = {};
  let cleanUrlRef = "";
  try {
    requestBody = await req.json();
    let { url, email, token } = requestBody;

    if (!url || !email || !token) {
      return NextResponse.json({ error: "Missing Jira URL, Email, or Token" }, { status: 400 });
    }

    // CRITICAL: Strip any copy/paste invisible newline characters that crash Node.js fetch() headers
    email = email.trim().replace(/[\r\n\t]/g, '');
    token = token.trim().replace(/[\r\n\t]/g, '');

    let cleanUrl = url.trim().replace(/\/$/, "");
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    
    // Remove query params if mistakenly pasted
    try {
      const parsedUrl = new URL(cleanUrl);
      cleanUrl = parsedUrl.origin;
    } catch(e) {}
    cleanUrlRef = cleanUrl;

    if (cleanUrl.includes("home.atlassian.com")) {
      return NextResponse.json({ error: "Please use your specific instance URL (e.g. https://your-domain.atlassian.net), not the Atlassian home page." }, { status: 400 });
    }

    const authHeader = `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;

    const res = await fetch(`${cleanUrl}/rest/api/3/myself`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Connection failed with status: ${res.status} ${res.statusText}` }, { status: 400 });
    }

    const text = await res.text();
    let user;
    try {
      user = JSON.parse(text);
    } catch(e) {
      return NextResponse.json({ error: `Connected to ${cleanUrl}, but Jira returned an invalid non-JSON response. Check your instance URL.` }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: `Connected as ${user.displayName || email}` });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message === "fetch failed" 
        ? `Node Fetch Failed internally to: [${requestBody?.url}]. We securely parsed this to: [${cleanUrlRef}]` 
        : error.message || "Failed to connect to Jira"
    }, { status: 500 });
  }
}
