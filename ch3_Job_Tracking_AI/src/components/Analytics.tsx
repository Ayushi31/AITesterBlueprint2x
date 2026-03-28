import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { JobStatus } from '../types';

export function Analytics() {
  const { jobs } = useStore();

  const statusColors: Record<JobStatus, string> = {
    wishlist: '#a855f7', // purple-500
    applied: '#3b82f6', // blue-500
    interviewing: '#eab308', // yellow-500
    offer: '#22c55e', // green-500
    rejected: '#ef4444', // red-500
  };

  const pieData = Object.keys(statusColors)
    .map(key => ({
      name: key,
      value: jobs.filter(j => j.status === key).length,
      color: statusColors[key as JobStatus]
    }))
    .filter(d => d.value > 0);

  const appliedJobs = jobs.filter(j => j.status !== 'wishlist');
  const interviewRate = appliedJobs.length ? Math.round((jobs.filter(j => ['interviewing', 'offer'].includes(j.status)).length / appliedJobs.length) * 100) : 0;
  const offerRate = appliedJobs.length ? Math.round((jobs.filter(j => j.status === 'offer').length / appliedJobs.length) * 100) : 0;

  return (
    <div className="glass-card p-6 mt-8 mb-20 relative overflow-hidden">
      <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-6">
        My Stats
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-4 rounded-xl flex flex-col items-center justify-center col-span-1">
          <div className="text-4xl font-extrabold text-white mb-2">{interviewRate}%</div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold text-center mt-1 text-balance">Interview Rate (from applied)</div>
          
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-4">
            <div className="bg-gradient-to-r from-yellow-400 to-green-400 h-1.5 rounded-full" style={{ width: `${interviewRate}%` }} />
          </div>
          
          <div className="text-4xl font-extrabold text-white mt-6 mb-2">{offerRate}%</div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold text-center mt-1 text-balance">Offer Rate (from applied)</div>
          
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-4">
            <div className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 rounded-full" style={{ width: `${offerRate}%` }} />
          </div>
        </div>

        <div className="glass p-4 rounded-xl flex items-center justify-center col-span-2 min-h-[250px] relative">
          <h3 className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-slate-400 z-10">Pipeline Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={e => e.name}
                  labelLine={false}
                  stroke="transparent"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="text-slate-500 text-sm flex items-center justify-center h-full">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
