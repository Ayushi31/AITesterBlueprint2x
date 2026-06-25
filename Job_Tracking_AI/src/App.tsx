import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import type { Tab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { PipelineView } from './components/PipelineView';
import { ActionsView } from './components/ActionsView';
import { Analytics } from './components/Analytics';
import { SettingsView } from './components/SettingsView';
import { AddJobModal } from './components/AddJobModal';
import { Plus, Menu } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-100 font-sans relative flex bg-slate-950">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none -z-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-purple-900/10 to-transparent" />
      <div className="fixed inset-0 pointer-events-none -z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 w-full glass z-30 flex items-center justify-between p-4 border-b border-white/10">
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">HirePilot</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 p-2">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 pt-16 bg-slate-900/95 backdrop-blur-3xl border-b border-white/10 flex flex-col items-center">
           {/* Quick simple map to mobile view */}
           <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className="p-4 w-full text-center border-b border-white/5 active:bg-white/5 font-bold">My Day</button>
           <button onClick={() => { setActiveTab('pipeline'); setMobileMenuOpen(false); }} className="p-4 w-full text-center border-b border-white/5 active:bg-white/5 font-bold">My Jobs</button>
           <button onClick={() => { setActiveTab('actions'); setMobileMenuOpen(false); }} className="p-4 w-full text-center border-b border-white/5 active:bg-white/5 font-bold">Next Steps</button>
           <button onClick={() => { setActiveTab('insights'); setMobileMenuOpen(false); }} className="p-4 w-full text-center border-b border-white/5 active:bg-white/5 font-bold">My Stats</button>
           <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} className="p-4 w-full text-center font-bold">Settings</button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative pt-20 md:pt-0">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 relative min-h-full">
          {activeTab === 'dashboard' && <DashboardView onNavigate={(t: Tab) => setActiveTab(t)} />}
          {activeTab === 'pipeline' && <PipelineView />}
          {activeTab === 'actions' && <ActionsView />}
          {activeTab === 'insights' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <Analytics />
            </div>
          )}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Quick Add FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] text-white hover:scale-110 active:scale-95 transition-all group border border-white/20"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <AddJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default App;
