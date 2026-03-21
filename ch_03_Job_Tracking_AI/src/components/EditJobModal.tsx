import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { JobStatus, JobPriority, Job } from '../types';
import { useStore } from '../store/useStore';
import { X, Save, Edit3 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

export function EditJobModal({ isOpen, onClose, job }: Props) {
  const { updateJob } = useStore();
  
  const [formData, setFormData] = useState({
    companyName: job.companyName,
    roleTitle: job.roleTitle,
    status: job.status,
    priority: job.priority,
    jobLink: job.jobLink || '',
    nextFollowUpDate: job.nextFollowUpDate ? new Date(job.nextFollowUpDate).toISOString().split('T')[0] : '',
    notes: job.notes || ''
  });

  // Keep form in sync if the job prop changes externally
  useEffect(() => {
    setFormData({
      companyName: job.companyName,
      roleTitle: job.roleTitle,
      status: job.status,
      priority: job.priority,
      jobLink: job.jobLink || '',
      nextFollowUpDate: job.nextFollowUpDate ? new Date(job.nextFollowUpDate).toISOString().split('T')[0] : '',
      notes: job.notes || ''
    });
  }, [job]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.roleTitle) return;

    updateJob(job.id, {
      ...formData,
      nextFollowUpDate: formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate).toISOString() : null,
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
         onPointerDown={(e) => e.stopPropagation()} // Stop drag events bleeding into modal
         >
      <div 
        className="glass-card shadow-2xl shadow-emerald-500/10 w-full max-w-md border border-white/20 transform transition-all duration-300 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-16 bg-emerald-500/20 rounded-full blur-[60px] -z-10" />
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Edit3 className="text-emerald-400" size={20} /> Edit Job
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold ml-1">Company</label>
            <input
              autoFocus
              required
              className="glass-input w-full"
              value={formData.companyName}
              onChange={e => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold ml-1">Role Title</label>
            <input
              required
              className="glass-input w-full"
              value={formData.roleTitle}
              onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-bold ml-1">Status</label>
              <select
                className="glass-input w-full appearance-none bg-indigo-950/50"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as JobStatus })}
              >
                <option value="wishlist" className="bg-slate-800 text-slate-100">Wishlist</option>
                <option value="applied" className="bg-slate-800 text-slate-100">Applied</option>
                <option value="interviewing" className="bg-slate-800 text-slate-100">Interviewing</option>
                <option value="offer" className="bg-slate-800 text-slate-100">Offer</option>
                <option value="rejected" className="bg-slate-800 text-slate-100">Rejected</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-slate-400 font-bold ml-1">Priority</label>
              <select
                className="glass-input w-full appearance-none bg-indigo-950/50"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as JobPriority })}
              >
                <option value="high" className="bg-slate-800 text-slate-100">High</option>
                <option value="medium" className="bg-slate-800 text-slate-100">Medium</option>
                <option value="low" className="bg-slate-800 text-slate-100">Low</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold ml-1">Job Link</label>
            <input
              type="url"
              className="glass-input w-full"
              value={formData.jobLink}
              onChange={e => setFormData({ ...formData, jobLink: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold ml-1">Next Follow-Up Date</label>
            <input
              type="date"
              className="glass-input w-full color-scheme-dark"
              value={formData.nextFollowUpDate}
              onChange={e => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold ml-1">Notes / Checklist</label>
            <textarea
              className="glass-input w-full min-h-[80px] resize-y"
              value={formData.notes}
              placeholder="Jot down interview prep, salary expectations, etc."
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-slate-900/80 backdrop-blur pb-2">
            <button
              type="button"
              onClick={onClose}
              className="glass-button text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="glass-button bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
