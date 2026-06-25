import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../types';
import { useStore } from '../store/useStore';
import { Building2, Calendar, Link as LinkIcon, AlertCircle, PhoneCall, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { EditJobModal } from './EditJobModal';

export function JobCard({ job }: { job: Job }) {
  const { deleteJob } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  const priorityColors = {
    high: 'priority-high bg-red-500/10 border-red-500/20',
    medium: 'priority-medium bg-yellow-500/10 border-yellow-500/20',
    low: 'priority-low bg-green-500/10 border-green-500/20',
  };

  const isOverdueFollowUp = job.nextFollowUpDate && isPast(new Date(job.nextFollowUpDate)) && job.status !== 'rejected';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card p-4 mx-2 cursor-grab active:cursor-grabbing select-none hover:shadow-2xl hover:scale-[1.02] transition-transform duration-200 border-l-4 ${
        job.status === 'wishlist' ? 'border-l-purple-500' :
        job.status === 'applied' ? 'border-l-blue-500' :
        job.status === 'interviewing' ? 'border-l-yellow-500' :
        job.status === 'offer' ? 'border-l-green-500' :
        'border-l-red-500'
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-2 group">
        <div>
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            {job.roleTitle}
          </h3>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mt-1 hover:text-white transition-colors">
            <Building2 size={14} className="text-purple-400" />
            {job.companyName}
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-bold border capitalize ${priorityColors[job.priority]}`}>
          {job.priority}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-1 mt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 bg-white/5 rounded px-2 py-1">
          <Calendar size={12} className="text-blue-400" />
          {new Date(job.applicationDate).toLocaleDateString()}
        </div>
        
        {job.nextFollowUpDate && (
          <div className={`flex items-center gap-1.5 rounded px-2 py-1 shadow-sm ${
            isOverdueFollowUp 
              ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/50 animate-pulse' 
              : 'bg-white/5 text-slate-300'
          }`}>
            <PhoneCall size={12} className={isOverdueFollowUp ? 'text-red-400' : 'text-slate-400'} />
            {formatDistanceToNow(new Date(job.nextFollowUpDate), { addSuffix: true })}
          </div>
        )}

        <div className="col-span-2 flex items-center justify-between mt-2 pt-2 border-t border-white/10">
          <div className="flex gap-2">
            {isOverdueFollowUp && (
              <AlertCircle size={14} className="text-red-400 fill-red-400/20" />
            )}
          </div>
          <div className="flex items-center gap-2 opacity-100 transition-opacity">
            {job.jobLink && (
              <a 
                href={job.jobLink} 
                target="_blank" 
                rel="noreferrer"
                onPointerDown={(e) => e.stopPropagation()} // prevent drag when clicking link
                className="hover:text-purple-400 transition-colors"
                title="View Job Post"
              >
                <LinkIcon size={14} />
              </a>
            )}
            <button 
              onPointerDown={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
              title="Edit Job"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onPointerDown={(e) => {
                e.stopPropagation();
                if(confirm('Delete job?')) deleteJob(job.id);
              }}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="Delete Job"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit Modal rendered conditionally but decoupled from drag transforms visually because of fixed inset */}
      <EditJobModal isOpen={isEditing} onClose={() => setIsEditing(false)} job={job} />
    </div>
  );
}
