import axios from 'axios';

interface LLMConfig {
  requirements: string;
  provider: string; // 'ollama' | 'lmstudio' | 'openai' | 'claude' | 'gemini' | 'grok'
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
}

const JIRA_SYSTEM_PROMPT = `You are a QA Engineer. Generate Functional and Non-Functional test cases for the user's requirement.

CRITICAL INSTRUCTION:
You MUST output EXACTLY ONE Markdown table containing ALL test cases. Do NOT create separate tables. Do NOT add introduction or conclusion text.

**HOW TO FORMAT THE EXPECTED RESULT:**
Do NOT put the expected result inside the "Steps to Reproduce" column. The final outcome goes ONLY in the "Expected Results" column.

FORMAT YOUR ENTIRE RESPONSE EXACTLY LIKE THIS EXAMPLE AND NOTHING ELSE:

| Jira ID | Type | Priority | Summary | Description | Preconditions | Steps to Reproduce | Expected Results |
|---|---|---|---|---|---|---|---|
| TEST-01 | Functional | High | Valid Login | Verify successful login | User has valid account | 1. Open app<br>2. Enter credentials<br>3. Click login | User is logged in successfully |
| TEST-02 | Non-Functional | Medium | Load Time | Verify page load | Network is stable | 1. Open app<br>2. Measure render time | Page loads in under 2 seconds |`;

export const generateTests = async (config: LLMConfig): Promise<string> => {
  const { requirements, provider, apiKey, baseUrl, model, temperature = 0.7 } = config;

  switch (provider.toLowerCase()) {
    case 'ollama':
      return await callOllama(requirements, baseUrl, model, temperature);
    case 'lmstudio':
      return await callLMStudio(requirements, baseUrl, model, temperature);
    case 'openai':
    case 'grok':
      // Grok uses OpenAI compatible API
      return await callOpenAICompatible(requirements, baseUrl || 'https://api.openai.com/v1', apiKey, model, temperature);
    case 'claude':
      return await callClaude(requirements, apiKey, model, temperature);
    case 'gemini':
      return await callGemini(requirements, apiKey, model, temperature);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

// --- API Connectors ---

async function callOllama(prompt: string, baseUrl = 'http://localhost:11434', model = 'llama2', temp: number): Promise<string> {
  const response = await axios.post(`${baseUrl}/api/generate`, {
    model: model,
    system: JIRA_SYSTEM_PROMPT,
    prompt: prompt,
    stream: false,
    options: {
      temperature: temp
    }
  });
  return response.data.response;
}

async function callLMStudio(prompt: string, baseUrl = 'http://localhost:1234/v1', model = 'local-model', temp: number): Promise<string> {
  // LM Studio mimics OpenAI API
  return await callOpenAICompatible(prompt, baseUrl, 'lm-studio', model, temp);
}

async function callOpenAICompatible(prompt: string, baseUrl: string, apiKey: string = '', model = 'gpt-3.5-turbo', temp: number): Promise<string> {
  if (!apiKey && !baseUrl.includes('localhost')) {
    throw new Error('API key is required for this cloud provider.');
  }

  const response = await axios.post(`${baseUrl}/chat/completions`, {
    model: model,
    temperature: temp,
    messages: [
      { role: 'system', content: JIRA_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices[0].message.content;
}

async function callClaude(prompt: string, apiKey: string = '', model = 'claude-3-haiku-20240307', temp: number): Promise<string> {
  if (!apiKey) throw new Error('Anthropic API key required.');
  
  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: model,
    system: JIRA_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
    temperature: temp,
    max_tokens: 4000
  }, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }
  });
  return response.data.content[0].text;
}

async function callGemini(prompt: string, apiKey: string = '', model = 'gemini-pro', temp: number): Promise<string> {
  if (!apiKey) throw new Error('Gemini API key required.');
  
  const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    contents: [
      { role: 'user', parts: [{ text: JIRA_SYSTEM_PROMPT + '\n\nUser Requirements:\n' + prompt }] }
    ],
    generationConfig: {
      temperature: temp,
    }
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.data.candidates[0].content.parts[0].text;
}
