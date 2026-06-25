import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider, baseUrl, apiKey, modelName } = body;

    if (!provider || !modelName) {
      return NextResponse.json({ error: "Missing required configuration fields" }, { status: 400 });
    }

    if (provider === "Ollama") {
      if (!baseUrl) return NextResponse.json({ error: "Ollama requires a Base URL" }, { status: 400 });
      // Connect to Ollama instances and verify the model exists in their tags list
      const cleanBaseUrl = baseUrl.replace(/\/$/, "");
      const res = await fetch(`${cleanBaseUrl}/api/tags`);
      
      if (!res.ok) {
        return NextResponse.json({ error: `Could not connect to Ollama at ${baseUrl}` }, { status: 400 });
      }

      const data = await res.json();
      const modelExists = data.models?.some((m: any) => m.name === modelName || m.name.startsWith(`${modelName}:`));

      if (!modelExists) {
        return NextResponse.json({ error: `Model '${modelName}' not found in Ollama` }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Ollama connection and model verified." });

    } else if (provider === "Groq" || provider === "Grok") {
      // Simulate an OpenAI compatible endpoint test
      const resolveBaseUrl = () => {
        if (provider === "Groq") return "https://api.groq.com/openai/v1";
        if (provider === "Grok") return "https://api.x.ai/v1";
        return baseUrl;
      };

      const url = `${resolveBaseUrl()}/chat/completions`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: "Test ping" }],
          max_tokens: 1,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return NextResponse.json({ error: errData.error?.message || `Failed to authenticate or access model on ${provider}` }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: `${provider} connection and model verified.` });
    }

    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
