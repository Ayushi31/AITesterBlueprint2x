import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CloudDownload, Loader2 } from "lucide-react";

export function FetchIssuesStep({ jiraConfig, fetchConfig, setFetchConfig, issuesList, setIssuesList, onNext, onBack }: any) {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/jira/fetch-issues", {
        method: "POST",
        body: JSON.stringify({ ...jiraConfig, ...fetchConfig }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.issues && data.issues.length === 0) {
          setError("No stories or Jira issues found valid for these inputs.");
          setIssuesList([]);
        } else {
          setIssuesList(data.issues);
        }
      } else {
        setError(data.error || "Failed context fetch");
        setIssuesList([]);
      }
    } catch (e) {
      setError("Network or API error");
    }
    setIsFetching(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} size="icon" className="h-8 w-8 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Fetch Jira Requirements</h2>
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle>Scope Selection</CardTitle>
          <CardDescription>Target specific product requirements from Jira.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center justify-between">
              Connected Jira Instance
              <Button variant="link" className="h-4 p-0 underline decoration-primary underline-offset-4">Change</Button>
            </Label>
            <div className="p-3 bg-muted/20 border rounded-md font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground cursor-not-allowed">
              {jiraConfig.url} | {jiraConfig.email}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Product Name <span className="text-destructive">*</span></Label>
              <Input placeholder="E.g., E-Commerce App" value={fetchConfig.productName} onChange={(e) => setFetchConfig({...fetchConfig, productName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Sprint / Fix Version (Optional)</Label>
              <Input placeholder="Sprint 42" value={fetchConfig.sprint} onChange={(e) => setFetchConfig({...fetchConfig, sprint: e.target.value})} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Project Key / Domain <span className="text-destructive">*</span></Label>
              <Input placeholder="E.g., PROJ or SCRUM" value={fetchConfig.projectKey} onChange={(e) => setFetchConfig({...fetchConfig, projectKey: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Specific Story IDs (Optional)</Label>
              <Input placeholder="E.g., SCRUM-1, SCRUM-5" value={fetchConfig.issueKeys || ""} onChange={(e) => setFetchConfig({...fetchConfig, issueKeys: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
             <Label>Additional Context (Optional)</Label>
             <Textarea placeholder="Any extra information about this fetch request..." className="h-24" value={fetchConfig.context} onChange={(e) => setFetchConfig({...fetchConfig, context: e.target.value})} />
          </div>
          {issuesList && issuesList.length > 0 && !error && (
            <div className="p-3 bg-emerald-500/10 text-emerald-600 text-sm rounded-md border border-emerald-500/20 mb-4">
              Successfully fetched {issuesList.length} user stories. You can now proceed to review and select them.
            </div>
          )}
          {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">{error}</div>}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between border-t bg-muted/20 px-6 py-4 gap-3">
          <Button onClick={handleFetch} disabled={isFetching || (!fetchConfig.productName) || (!fetchConfig.projectKey && !fetchConfig.issueKeys)} className="gap-2 w-full sm:w-auto">
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
            {isFetching ? "Fetching..." : "Fetch User Story"}
          </Button>
          <Button onClick={onNext} disabled={!issuesList || issuesList.length === 0} className="w-full sm:w-auto px-8">
            Proceed to Select & Review
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
