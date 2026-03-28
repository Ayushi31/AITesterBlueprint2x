export type JobStatus = 'wishlist' | 'applied' | 'interviewing' | 'offer' | 'rejected';
export type JobPriority = 'high' | 'medium' | 'low';
export type AppType = 'quick' | 'customized' | 'referral';

export interface Job {
  id: string;
  companyName: string;
  roleTitle: string;
  status: JobStatus;
  priority: JobPriority;
  applicationDate: string; // ISO date string
  updatedAt: string; // Track stale status
  notes: string;
  jobLink: string;
  resumeUsed: string;
  contactPerson: string;
  followUpCount: number;
  nextFollowUpDate: string | null;
  appType: AppType;
  rejectionReason: string;
}

export interface UserStats {
  dailyStreak: number;
  lastLogin: string;
  totalApplications: number;
  focusMode: boolean;
}
