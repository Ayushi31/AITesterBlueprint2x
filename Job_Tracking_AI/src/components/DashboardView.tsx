import { useStore } from '../store/useStore';
import { Target, Clock, AlertTriangle, LightbulbIcon, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { isPast, differenceInDays } from 'date-fns';
// no types imported

export function DashboardView({ onNavigate }: { onNavigate: (tab: any) => void }) {
  const { jobs, stats } = useStore();

  const overdueFollowUps = jobs.filter(
    (j) => j.nextFollowUpDate && isPast(new Date(j.nextFollowUpDate)) && j.status !== 'rejected'
  );

  const activeInterviews = jobs.filter((j) => j.status === 'interviewing');
  const needApplying = jobs.filter((j) => j.status === 'wishlist' && j.priority === 'high');

  // Stale jobs (> 7 days without update and not rejected/offer)
  const staleJobs = jobs.filter(
    (j) => !['rejected', 'offer'].includes(j.status) && differenceInDays(new Date(), new Date(j.updatedAt)) > 7
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Welcome */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden items-center justify-between">
        <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-[100px] -z-10" />
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Ready to take action?</h2>
          <p className="text-slate-300 md:max-w-xl text-lg">
            You've sent <strong className="text-purple-400">{stats.totalApplications}</strong> applications so far. Keep the momentum going!
          </p>
        </div>
        <div className="flex flex-col items-center bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0 min-w-[140px]">
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 flex items-center gap-2">
            {stats.dailyStreak} <Zap className="text-orange-400" fill="currentColor" />
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2">Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Today's Actions */}
        <div className="glass-card p-6 flex flex-col col-span-1 lg:col-span-2 shadow-2xl shadow-indigo-500/5 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-6 text-indigo-400">
            <Target size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Action Items</h3>
          </div>
          
          <div className="space-y-3 flex-1">
            {overdueFollowUps.length > 0 && (
              <ActionItem 
                icon={<Clock size={16} />} 
                title={`${overdueFollowUps.length} follow-ups overdue`}
                count={overdueFollowUps.length}
                color="red"
                onClick={() => onNavigate('actions')}
              />
            )}
            {activeInterviews.length > 0 && (
              <ActionItem 
                icon={<Target size={16} />} 
                title={`${activeInterviews.length} upcoming interviews`}
                count={activeInterviews.length}
                color="yellow"
                onClick={() => onNavigate('pipeline')}
              />
            )}
            {needApplying.length > 0 && (
              <ActionItem 
                icon={<ArrowRight size={16} />} 
                title={`${needApplying.length} high-priority jobs to apply for`}
                count={needApplying.length}
                color="purple"
                onClick={() => onNavigate('pipeline')}
              />
            )}
            
            {overdueFollowUps.length === 0 && activeInterviews.length === 0 && needApplying.length === 0 && (
              <div className="text-slate-500 text-sm flex items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-xl">
                No immediate actions required. Time to hunt for more roles!
              </div>
            )}
          </div>
        </div>

        {/* Alerts & Suggestions */}
        <div className="glass flex flex-col p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-6 text-slate-300">
            <LightbulbIcon size={20} className="text-yellow-400" />
            <h3 className="font-bold uppercase tracking-wider text-sm">Smart Alerts</h3>
          </div>

          <div className="space-y-4 flex-1">
            {staleJobs.length > 0 ? (
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="text-orange-400 flex-shrink-0" size={18} />
                <div>
                  <h4 className="text-orange-300 font-bold text-sm mb-1">Stale Pipeline</h4>
                  <p className="text-xs text-orange-200/70 leading-relaxed">
                    You have {staleJobs.length} {staleJobs.length === 1 ? 'job' : 'jobs'} sitting without updates for over 7 days.
                  </p>
                  <button onClick={() => onNavigate('actions')} className="text-xs font-bold text-orange-400 mt-2 hover:underline">
                    Review stale jobs &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-start gap-3">
                <RefreshCw className="text-green-400 flex-shrink-0" size={18} />
                <div>
                  <h4 className="text-green-300 font-bold text-sm mb-1">Pipeline Fresh</h4>
                  <p className="text-xs text-green-200/70 leading-relaxed">
                    No stale jobs in your pipeline!
                  </p>
                </div>
              </div>
            )}
            
            {/* Contextual hints */}
            {jobs.length > 0 && overdueFollowUps.length === 0 && (
               <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex flex-col">
                 <span className="text-xs text-blue-300 font-bold mb-1">Suggestion</span>
                 <p className="text-xs text-slate-300">It's a great time to review your resume or prepare for behavioral interviews.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionItem({ icon, title, color, onClick }: any) {
  const colorMap: any = {
    red: 'bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 hover:border-red-500/40',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/40',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40',
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all group ${colorMap[color]}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
          {icon}
        </div>
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
}
