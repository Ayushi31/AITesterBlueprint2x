import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job, JobStatus, UserStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface AppState {
  jobs: Job[];
  stats: UserStats;
  addJob: (job: Omit<Job, 'id' | 'updatedAt'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateJobStatus: (id: string, newStatus: JobStatus) => void;
  importData: (data: AppState) => void;
  updateStats: (updates: Partial<UserStats>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      jobs: [],
      stats: {
        dailyStreak: 0,
        lastLogin: new Date().toISOString(),
        totalApplications: 0,
        focusMode: false,
      },
      addJob: (job) =>
        set((state) => ({
          jobs: [...state.jobs, { ...job, id: uuidv4(), updatedAt: new Date().toISOString() }],
        })),
      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j)),
        })),
      deleteJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== id),
        })),
      updateJobStatus: (id, newStatus) =>
        set((state) => ({
          jobs: state.jobs.map((j) => (j.id === id ? { ...j, status: newStatus, updatedAt: new Date().toISOString() } : j)),
        })),
      importData: (data) =>
        set(() => ({
          jobs: data.jobs || [],
          stats: data.stats || {
            dailyStreak: 0,
            lastLogin: new Date().toISOString(),
            totalApplications: data.jobs?.length || 0,
            focusMode: false,
          },
        })),
      updateStats: (updates) =>
        set((state) => ({
          stats: { ...state.stats, ...updates },
        })),
    }),
    {
      name: 'jobflow-storage', // key in local storage
    }
  )
);
