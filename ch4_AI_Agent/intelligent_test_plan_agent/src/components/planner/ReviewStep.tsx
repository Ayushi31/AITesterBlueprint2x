import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2, Play, CheckSquare, Square } from "lucide-react";
import { useEffect } from "react";

export function ReviewStep({ issuesList, selectedIssues, setSelectedIssues, reviewNotes, setReviewNotes, onNext, onBack, setTestPlan, setIsGenerating }: any) {
  useEffect(() => {
    if (issuesList.length > 0 && selectedIssues.size === 0) {
      setSelectedIssues(new Set(issuesList.map((i: any) => i.id)));
    }
  }, [issuesList]);
  const handleGenerate = async () => {
    setIsGenerating(true);
    onNext(); // Navigate to the final step immediately, showing the loading screen
    try {
      const activeIssues = issuesList.filter((issue: any) => selectedIssues.has(issue.id));
      const res = await fetch("/api/test-plan/generate", {
        method: "POST",
        body: JSON.stringify({ issues: activeIssues, context: reviewNotes }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestPlan(data.testPlan);
      } else {
        setTestPlan("Error generating test plan. Please try again.");
      }
    } catch (e) {
      setTestPlan("Network error occurred during generation.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} size="icon" className="h-8 w-8 rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Review Requirements</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Additional Context & Notes</CardTitle>
            <CardDescription>Add any high-level testing strategies or constraints the AI should consider.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="h-32"
              placeholder="e.g. Ensure we focus on performance testing for the new auth endpoints. Accessibility needs to be WCAG AA compliant..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-3 sm:gap-0">
            <div>
              <CardTitle>2. Review User Stories ({selectedIssues.size} Selected)</CardTitle>
              <CardDescription>Select or deselect specific user stories you want the AI test planner to focus on.</CardDescription>
            </div>
            {issuesList.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                   if (selectedIssues.size === issuesList.length) setSelectedIssues(new Set());
                   else setSelectedIssues(new Set(issuesList.map((i: any) => i.id)));
                }}
              >
                {selectedIssues.size === issuesList.length ? "Deselect All" : "Select All"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {issuesList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                No user stories fetched. Go back to step 2 to fetch user stories.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {issuesList.map((issue: any) => {
                  const isSelected = selectedIssues.has(issue.id);
                  return (
                    <div 
                      key={issue.id} 
                      onClick={() => {
                        const newSelection = new Set(selectedIssues);
                        if (newSelection.has(issue.id)) newSelection.delete(issue.id);
                        else newSelection.add(issue.id);
                        setSelectedIssues(newSelection);
                      }}
                      className={`p-4 border rounded-lg flex cursor-pointer transition-colors ${isSelected ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : "bg-muted/10 opacity-70 hover:opacity-100 hover:bg-muted/30"}`}
                    >
                      <div className="mr-4 flex items-center justify-center">
                        {isSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="w-20 font-mono text-xs font-semibold text-primary/80 pt-0.5">{issue.key}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-foreground leading-tight mb-1">{issue.summary}</h4>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="bg-background border px-1.5 py-0.5 rounded shadow-sm">{issue.type}</span>
                          <span className="truncate max-w-[150px]">{issue.assignee}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t bg-muted/20 px-6 py-4">
            <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleGenerate} disabled={selectedIssues.size === 0} className="gap-2 px-6 w-full sm:w-auto">
              <Play className="w-4 h-4" fill="currentColor" />
              Generate Test Plan ({selectedIssues.size})
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
