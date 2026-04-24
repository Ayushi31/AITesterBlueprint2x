import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Download, Copy, CheckCircle2, FileText } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { marked } from "marked";

export function TestPlanStep({ testPlan, isGenerating, onBack, onReset, projectName }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(testPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  const handleDownloadDocx = () => {
    const htmlContent = marked.parse(testPlan);
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Test Plan</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + htmlContent + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
    });
    
    // Create download link element
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `TestPlan_${projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Test Plan Generation</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleCopy} disabled={isGenerating || !testPlan} size="sm">
            {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button onClick={handleDownloadDocx} disabled={isGenerating || !testPlan} size="sm">
            <FileText className="w-4 h-4 mr-2" fill="currentColor" />
            Download .DOCX
          </Button>
        </div>
      </div>

      <Card className="min-h-[500px] border-primary/20 shadow-xl">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Generated Test Plan Output</CardTitle>
          <CardDescription>Review the final comprehensive testing strategy.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground animate-pulse delay-75">
              <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
              <p className="text-lg font-medium">Analyzing Requirements...</p>
              <p className="text-sm opacity-70 mt-2">Constructing Test Scenarios & Cases safely through the B.L.A.S.T Framework.</p>
            </div>
          ) : !testPlan ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <p className="text-lg">No Output Available.</p>
              <p className="text-sm">Go back and generate a test plan.</p>
            </div>
          ) : (
            <div className="p-4 bg-muted/10 rounded-xl border border-border/50 overflow-x-auto">
              <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-primary prose-a:text-primary prose-table:min-w-full">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {testPlan}
                </ReactMarkdown>
              </article>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!isGenerating && testPlan && (
        <div className="flex justify-end pt-4 pb-12">
          <Button size="lg" onClick={onReset}>
            Create New Test Plan
          </Button>
        </div>
      )}
    </div>
  );
}
