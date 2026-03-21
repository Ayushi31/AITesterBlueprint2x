import { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useStore } from '../store/useStore';
import type { JobStatus, Job, JobPriority } from '../types';
import { Column } from './Column';
import { JobCard } from './JobCard';

interface KanbanBoardProps {
  searchQuery?: string;
  priorityFilter?: JobPriority | 'all';
}

export function KanbanBoard({ searchQuery = '', priorityFilter = 'all' }: KanbanBoardProps) {
  const { jobs, updateJobStatus, stats } = useStore();
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  // Apply filters
  const displayJobs = jobs.filter(j => {
    // Priority filter
    if (priorityFilter !== 'all' && j.priority !== priorityFilter) return false;
    
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!j.companyName.toLowerCase().includes(q) && !j.roleTitle.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Existing Focus Mode
    if (stats.focusMode) {
      const isUrgent = j.priority === 'high' || j.status === 'interviewing' || j.status === 'offer' || (j.nextFollowUpDate && new Date(j.nextFollowUpDate) < new Date());
      if (!isUrgent) return false;
    }

    return true;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    if (job) setActiveJob(job);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceStatus = jobs.find((j) => j.id === activeId)?.status;
    const destStatus = (Object.keys({
      wishlist: 1, applied: 1, interviewing: 1, offer: 1, rejected: 1
    }).includes(overId) ? overId : jobs.find(j => j.id === overId)?.status) as JobStatus;

    if (!sourceStatus || !destStatus) return;

    if (sourceStatus !== destStatus) {
      updateJobStatus(activeId, destStatus);
    }
    // Note: To reorder within column we'd need sorting logic. Simplified for Kanban workflow.
  };

  const statusColumns: { id: JobStatus; title: string }[] = [
    { id: 'wishlist', title: 'Wishlist' },
    { id: 'applied', title: 'Applied' },
    { id: 'interviewing', title: 'Interviewing' },
    { id: 'offer', title: 'Offer' },
    { id: 'rejected', title: 'Rejected' },
  ];

  return (
    <div className="flex-1 w-full overflow-x-auto pb-6">
      <div className="flex gap-6 min-w-max h-[calc(100vh-140px)] min-h-[500px]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {statusColumns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              jobs={displayJobs.filter((j) => j.status === col.id)}
            />
          ))}

          <DragOverlay>
            {activeJob ? (
              <div className="rotate-2 scale-105 opacity-80 cursor-grabbing shadow-2xl z-50">
                <JobCard job={activeJob} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
