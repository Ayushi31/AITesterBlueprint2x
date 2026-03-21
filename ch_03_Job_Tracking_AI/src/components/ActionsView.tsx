import { useStore } from '../store/useStore';
import { isPast, differenceInDays } from 'date-fns';
import { CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { JobCard } from './JobCard';

export function ActionsView() {
  const { jobs } = useStore();

  const overdueFollowUps = jobs.filter(
    (j) => j.nextFollowUpDate && isPast(new Date(j.nextFollowUpDate)) && j.status !== 'rejected'
  );

  const staleJobs = jobs.filter(
    (j) => !['rejected', 'offer'].includes(j.status) && differenceInDays(new Date(), new Date(j.updatedAt)) > 7
  );

  const needApplying = jobs.filter((j) => j.status === 'wishlist' && j.priority === 'high');

  const noActions = overdueFollowUps.length === 0 && staleJobs.length === 0 && needApplying.length === 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="text-green-400" /> Next Steps
        </h2>
        <p className="text-slate-400 text-sm mt-1">Here is what you need to focus on next.</p>
      </div>

      {noActions && (
        <div className="glass flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-white/10 text-slate-400">
          <CheckCircle2 size={48} className="text-green-500/50 mb-4" />
          <p className="text-lg font-bold text-slate-300">You're all caught up!</p>
          <p className="text-sm">Enjoy the peace or add new opportunities to pursue.</p>
        </div>
      )}

      {overdueFollowUps.length > 0 && (
        <section>
          <h3 className="text-red-400 font-bold flex items-center gap-2 mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <Clock size={18} /> Overdue Follow-ups
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueFollowUps.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </section>
      )}

      {needApplying.length > 0 && (
        <section>
          <h3 className="text-purple-400 font-bold flex items-center gap-2 mb-4 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
            <ArrowRight size={18} /> Urgent Applications (High Priority)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {needApplying.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </section>
      )}

      {staleJobs.length > 0 && (
        <section>
          <h3 className="text-orange-400 font-bold flex items-center gap-2 mb-4 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
            <AlertTriangle size={18} /> Stale Jobs ({'>'} 7 days untouched)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-l-2 border-orange-500/30 pl-4 py-2">
             {staleJobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </section>
      )}
    </div>
  );
}
