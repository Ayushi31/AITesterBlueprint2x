import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Job, JobStatus } from '../types';
import { JobCard } from './JobCard'; // Force IDE refresh

interface ColumnProps {
  id: JobStatus;
  title: string;
  jobs: Job[];
}

const statusColors = {
  wishlist: 'bg-purple-500',
  applied: 'bg-blue-500',
  interviewing: 'bg-yellow-500',
  offer: 'bg-green-500',
  rejected: 'bg-red-500',
};

export function Column({ id, title, jobs }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[320px] max-w-sm flex flex-col h-full bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${statusColors[id]}`} />
          <h2 className="font-bold text-slate-200 capitalize tracking-wide">{title}</h2>
        </div>
        <span className="bg-white/10 text-slate-300 text-xs px-2 py-1 rounded-full font-semibold">
          {jobs.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto space-y-3">
        <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </SortableContext>
        {jobs.length === 0 && (
          <div className="h-24 hidden mt-4 border-2 border-dashed border-white/10 rounded-xl items-center justify-center text-slate-500 text-sm">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
