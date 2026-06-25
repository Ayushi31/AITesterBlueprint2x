import { Settings, Home, BookOpen, BrainCircuit } from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-card flex-col md:flex hidden min-h-screen">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BrainCircuit className="w-6 h-6" />
          TestPlan AI
        </h2>
      </div>
      <div className="flex-1 py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
            <Home className="h-4 w-4" />
            Dashboard
          </a>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
            <BookOpen className="h-4 w-4" />
            Curriculum
          </a>
          <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
            <Settings className="h-4 w-4" />
            Settings
          </a>
          
          <div className="mt-8 mb-2 px-3 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            Planning & Strategy
          </div>
          <a className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-all">
            <BrainCircuit className="h-4 w-4" />
            Test Planner
          </a>
        </nav>
      </div>
    </div>
  );
}
