import { useStore } from '../store/useStore';
import { Target, Zap, Clock, Trophy } from 'lucide-react';
import { isPast } from 'date-fns';

export function TodayFocus() {
  const { jobs, stats } = useStore();

  const overdueFollowUps = jobs.filter(
    (j) => j.nextFollowUpDate && isPast(new Date(j.nextFollowUpDate)) && j.status !== 'rejected'
  ).length;

  const activeInterviews = jobs.filter((j) => j.status === 'interviewing').length;
  const needApplying = jobs.filter((j) => j.status === 'wishlist' && j.priority === 'high').length;

  const messages = [
    "Consistency is what transforms average into excellence.",
    "Your next big opportunity is just an application away.",
    "Every 'No' brings you closer to the right 'Yes'.",
    "Stay focused, stay driven. You've got this."
  ];

  const todayMotiv = messages[new Date().getDay() % messages.length];

  return (
    <div className="glass-card p-6 mb-8 flex flex-col md:flex-row gap-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 p-32 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      
      <div className="flex-1">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
          Today's Focus
        </h2>
        <p className="text-slate-300 flex items-center gap-2 italic">
          <Zap size={16} className="text-yellow-400" />
          "{todayMotiv}"
        </p>
        
        <div className="mt-6 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {stats.totalApplications}
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">Total Apps</span>
          </div>
          <div className="h-10 w-px bg-white/20 mx-2" />
          <div className="flex flex-col">
            <span className="text-4xl font-extrabold text-white flex items-center gap-2">
              {stats.dailyStreak} <FlameIcon />
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">Day Streak</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 md:justify-end flex-[1.5]">
        <FocusCard 
          title="Overdue Follow-ups" 
          count={overdueFollowUps} 
          icon={<Clock className="text-red-400" />} 
          critical={overdueFollowUps > 0} 
        />
        <FocusCard 
          title="Active Interviews" 
          count={activeInterviews} 
          icon={<Trophy className="text-yellow-400" />} 
          active={activeInterviews > 0} 
        />
        <FocusCard 
          title="High Priority Wishlist" 
          count={needApplying} 
          icon={<Target className="text-purple-400" />} 
        />
      </div>
    </div>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-orange-400" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path>
    </svg>
  );
}

function FocusCard({ title, count, icon, critical = false, active = false }: any) {
  return (
    <div className={`glass p-4 rounded-xl flex items-center gap-4 flex-1 min-w-[200px] border ${
      critical ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
      active ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/10'
    }`}>
      <div className={`p-3 rounded-xl ${
        critical ? 'bg-red-500/20' : active ? 'bg-yellow-500/20' : 'bg-white/5'
      }`}>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-bold ${critical ? 'text-red-400' : active ? 'text-yellow-400' : 'text-slate-200'}`}>
          {count}
        </div>
        <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">{title}</div>
      </div>
    </div>
  );
}
