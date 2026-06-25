import { History, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function TopHeader() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setIsDark(true);
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark);
  };

  const loadHistory = () => {
    try {
      setHistory(JSON.parse(localStorage.getItem("ai_test_history") || "[]"));
    } catch(e) {}
    setHistoryOpen(true);
  };

  return (
    <>
      <header className="flex flex-col sm:flex-row h-auto sm:h-16 shrink-0 items-start sm:items-center justify-between border-b px-6 py-4 sm:py-0 bg-card relative z-10 gap-3 sm:gap-0">
        <div className="w-full sm:w-auto overflow-hidden">
          <h1 className="text-xl font-semibold tracking-tight text-primary">TestPlan AI</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 w-full truncate">
            Generate comprehensive test plans from Jira requirements using AI
          </p>
        </div>
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <Button variant="ghost" size="icon" onClick={toggleDark}>
            {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </Button>
          <Button variant="outline" className="gap-2 text-primary border-primary/20 hover:bg-primary/10" onClick={loadHistory}>
            <History className="h-4 w-4" />
            View History
          </Button>
        </div>
      </header>
      
      {/* History Slide-over */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background border-l shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b flex justify-between items-center bg-card">
              <h2 className="text-lg font-semibold flex items-center gap-2"><History className="w-5 h-5"/> Saved Test Plans</h2>
              <Button variant="ghost" size="icon" onClick={() => setHistoryOpen(false)}><X className="w-5 h-5"/></Button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4 bg-muted/20">
              {history.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10 text-sm">No generated test plans yet.</div>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="p-4 bg-card border rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-primary">{h.project}</span>
                      <span className="text-xs text-muted-foreground">{h.date}</span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-3 bg-muted p-2 rounded border font-mono">
                      {h.plan.substring(0, 150)}...
                    </div>
                    <Button variant="secondary" size="sm" className="w-full mt-3" onClick={() => {
                        const blob = new Blob([h.plan], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${h.project.replace(/[^a-zA-Z0-9_-]/g, '')}_Test_Plan.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }}>Download Markdown</Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
