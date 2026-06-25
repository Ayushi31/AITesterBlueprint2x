import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function SetupStep({ llmConfig, setLlmConfig, jiraConfig, setJiraConfig, onNext }: any) {
  const [testingLlm, setTestingLlm] = useState(false);
  const [testingJira, setTestingJira] = useState(false);
  const [llmTested, setLlmTested] = useState(false);
  const [jiraTested, setJiraTested] = useState(false);
  const [llmSaved, setLlmSaved] = useState(false);
  const [jiraSaved, setJiraSaved] = useState(false);
  
  const [llmError, setLlmError] = useState<string | null>(null);
  const [jiraError, setJiraError] = useState<string | null>(null);
  const [jiraSuccess, setJiraSuccess] = useState<string | null>(null);

  const handleTestLlm = async () => {
    setTestingLlm(true);
    setLlmError(null);
    try {
      const res = await fetch("/api/llm/test-connection", {
        method: "POST",
        body: JSON.stringify(llmConfig),
      });
      const data = await res.json();
      if (res.ok) {
        setLlmTested(true);
        setLlmConfig({ ...llmConfig, status: "success" });
      } else {
        setLlmConfig({ ...llmConfig, status: "error" });
        setLlmError(data.error || "Connection failed");
      }
    } catch (e: any) {
      setLlmConfig({ ...llmConfig, status: "error" });
      setLlmError("Network error check configuration");
    }
    setTestingLlm(false);
  };

  const handleTestJira = async () => {
    setTestingJira(true);
    setJiraError(null);
    setJiraSuccess(null);
    try {
      const res = await fetch("/api/jira/connect", {
        method: "POST",
        body: JSON.stringify(jiraConfig),
      });
      const data = await res.json();
      if (res.ok) {
        setJiraTested(true);
        setJiraSuccess(data.message);
      } else {
        setJiraError(data.error || "Connection failed");
      }
    } catch (e: any) {
      setJiraError("Network error reaching the server");
    }
    setTestingJira(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <Card className="border-primary/20 shadow-lg shadow-primary/5 flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">1. LLM Connection (Required)</CardTitle>
          <CardDescription>Configure your preferred Large Language Model provider.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 flex-1">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={llmConfig.provider}
                onChange={(e) => {
                  const newProvider = e.target.value;
                  let newModelName = "llama3";
                  let newBaseUrl = "http://localhost:11434";
                  
                  if (newProvider === "Groq") {
                    newModelName = "llama-3.1-8b-instant";
                    newBaseUrl = "";
                  } else if (newProvider === "Grok") {
                    newModelName = "grok-1";
                    newBaseUrl = "";
                  }
                  
                  setLlmConfig({
                    ...llmConfig, 
                    provider: newProvider, 
                    modelName: newModelName,
                    baseUrl: newBaseUrl,
                    status: "untested"
                  });
                }}
              >
                <option value="Ollama">Ollama (Local)</option>
                <option value="Groq">Groq</option>
                <option value="Grok">Grok</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Model Name</Label>
              <Input 
                value={llmConfig.modelName} 
                onChange={(e) => setLlmConfig({...llmConfig, modelName: e.target.value, status: "untested"})} 
                placeholder={llmConfig.provider === "Groq" ? "e.g., llama-3.1-8b-instant" : "e.g., llama3"}
              />
            </div>
            {llmConfig.provider === "Ollama" && (
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input 
                  value={llmConfig.baseUrl} 
                  onChange={(e) => setLlmConfig({...llmConfig, baseUrl: e.target.value, status: "untested"})} 
                />
              </div>
            )}
            {llmConfig.provider !== "Ollama" && (
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input 
                  type="password"
                  value={llmConfig.apiKey} 
                  onChange={(e) => setLlmConfig({...llmConfig, apiKey: e.target.value, status: "untested"})} 
                  placeholder="Enter API Key"
                />
              </div>
            )}
          </div>
          {llmError && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">{llmError}</div>}
          {llmConfig.status === "success" && <div className="p-3 bg-emerald-500/10 text-emerald-600 text-sm rounded-md border border-emerald-500/20 flex gap-2 items-center"><CheckCircle2 className="w-4 h-4"/> Connection successful</div>}
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-4 gap-3">
          <Button variant="outline" onClick={handleTestLlm} disabled={testingLlm}>
            {testingLlm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection
          </Button>
          <Button 
              disabled={!llmConfig.modelName && !llmConfig.apiKey && !llmConfig.baseUrl} 
              onClick={() => setLlmSaved(true)}
              className={llmSaved ? "bg-emerald-600 hover:bg-emerald-700 text-white transition-colors" : ""}
          >
            {llmSaved ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Connection Saved</> : "Save Connection"}
          </Button>
        </CardFooter>
      </Card>

        <Card className="border-primary/20 shadow-lg shadow-primary/5 flex flex-col">
          <CardHeader>
            <CardTitle>2. Jira Connection (Required)</CardTitle>
            <CardDescription>Connect your Jira instance to fetch scope data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label>Connection Name</Label>
              <Input value={jiraConfig.name} onChange={(e) => setJiraConfig({...jiraConfig, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Jira URL</Label>
              <Input value={jiraConfig.url} onChange={(e) => setJiraConfig({...jiraConfig, url: e.target.value})} placeholder="https://domain.atlassian.net" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={jiraConfig.email} onChange={(e) => setJiraConfig({...jiraConfig, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>API Token</Label>
                <Input type="password" value={jiraConfig.token} onChange={(e) => setJiraConfig({...jiraConfig, token: e.target.value})} />
              </div>
            </div>
            
            {jiraError && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">{jiraError}</div>}
            {jiraSuccess && <div className="p-3 bg-emerald-500/10 text-emerald-600 text-sm rounded-md border border-emerald-500/20 flex gap-2 items-center"><CheckCircle2 className="w-4 h-4"/> {jiraSuccess}</div>}

          </CardContent>
          <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-4 gap-3">
            <Button variant="outline" onClick={handleTestJira} disabled={testingJira}>
              {testingJira && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            <Button 
              disabled={!jiraConfig.url || !jiraConfig.email} 
              onClick={() => setJiraSaved(true)}
              className={jiraSaved ? "bg-emerald-600 hover:bg-emerald-700 text-white transition-colors" : ""}
            >
              {jiraSaved ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Connection Saved</> : "Save Connection"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <Button size="lg" onClick={onNext} className="mt-4 px-8" disabled={!llmConfig.modelName}>
          Continue to Fetch User Story
        </Button>
      </div>
    </div>
  );
}
