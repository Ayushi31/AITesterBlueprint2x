import { LayoutDashboard, Columns3, CheckSquare, LineChart, Settings, Rocket } from 'lucide-react';

export type Tab = 'dashboard' | 'pipeline' | 'actions' | 'insights' | 'settings';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'My Day', icon: LayoutDashboard },
    { id: 'pipeline', label: 'My Jobs', icon: Columns3 },
    { id: 'actions', label: 'Next Steps', icon: CheckSquare },
    { id: 'insights', label: 'My Stats', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const quotes = [
    "Consistency is what transforms average into excellence.",
    "Every 'No' brings you one step closer to the right 'Yes'.",
    "Your next big breakthrough is just one application away.",
    "Do something today that your future self will thank you for.",
    "Success is the sum of small efforts repeated daily.",
  ];
  const todayQuote = quotes[new Date().getDay() % quotes.length];

  return (
    <div className="w-64 min-w-[16rem] h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col p-4 md:p-6 pb-8 sticky top-0 hidden md:flex shrink-0 z-20">
      <div className="flex items-center gap-3 mb-8 pl-2 group cursor-default">
        <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2 rounded-xl text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:-translate-y-1 transition-transform duration-300">
          <Rocket size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 leading-tight">
            HirePilot
          </h1>
          <p className="text-[10px] text-teal-300 uppercase tracking-widest font-bold">Navigate your job search with clarity.</p>
        </div>
      </div>

      {/* Motivation Widget - Moved to top so it's always visible */}
      <div className="bg-gradient-to-b from-emerald-900/20 to-slate-900/40 rounded-xl p-4 border border-emerald-500/20 relative overflow-hidden mb-8 shadow-lg shadow-emerald-500/5">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-4 -mt-4 opacity-50" />
        <div className="text-[10px] font-bold text-emerald-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          ✨ Daily Fuel
        </div>
        <p className="text-xs text-slate-300 italic leading-relaxed font-medium">
          "{todayQuote}"
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/10 text-purple-300 border border-purple-500/30 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent font-medium'
              }`}
            >
              <Icon size={18} className={isActive ? "text-purple-400" : ""} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        {/* Auto Save indicator */}
        <div className="flex items-center gap-2 px-2 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-[10px] text-slate-400 font-medium">Auto-save Active</span>
        </div>
      </div>
    </div>
  );
}
