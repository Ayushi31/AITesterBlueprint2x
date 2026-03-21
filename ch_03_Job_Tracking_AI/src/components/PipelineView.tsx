import { useState } from 'react';
import { useStore } from '../store/useStore';
import { KanbanBoard } from './KanbanBoard';
import { Layers, Search, ChevronDown } from 'lucide-react';
import type { JobPriority } from '../types';

export function PipelineView() {
  const { stats, updateStats } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<JobPriority | 'all'>('all');

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="text-purple-400" /> My Jobs
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage and track your active job applications.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 select-none">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input 
              type="text" 
              placeholder="Search roles or companies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 w-full md:w-64 text-sm"
            />
          </div>

          {/* Priority Filter */}
          <div className="relative group cursor-pointer">
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as JobPriority | 'all')}
              className="glass-input pl-4 pr-10 appearance-none bg-indigo-950/50 text-sm w-full cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value="all" className="bg-slate-800 text-slate-100">All Priorities</option>
              <option value="high" className="bg-slate-800 text-slate-100">High Priority</option>
              <option value="medium" className="bg-slate-800 text-slate-100">Medium Priority</option>
              <option value="low" className="bg-slate-800 text-slate-100">Low Priority</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-white transition-colors" size={16} />
          </div>

          {/* Focus Mode Toggle */}
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1.5 px-3 border border-white/10 h-[42px]">
            <span className="text-sm font-semibold text-slate-300">Focus Mode</span>
            <button 
              onClick={() => updateStats({ focusMode: !stats.focusMode })}
              className={`w-10 h-5 rounded-full transition-colors relative ${stats.focusMode ? 'bg-purple-500' : 'bg-slate-700'}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-transform ${stats.focusMode ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
            </button>
          </div>
        </div>
      </div>

      <KanbanBoard searchQuery={searchQuery} priorityFilter={priorityFilter} />
    </div>
  );
}
