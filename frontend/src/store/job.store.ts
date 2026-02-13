import { create } from 'zustand';
import api from '@/lib/api';

export interface Job {
    id: string;
    title: string;
    company: string;
    platform?: string;
    location?: string;
    salary?: string;
    jobUrl?: string;
    status: string;
    notes?: string;
    interviewDate?: string;
    contactMethod?: string;
    feedback?: string;
    scrapedAt?: string;
    hrName?: string;
    hrEmail?: string;
    hrPhone?: string;
    jobId?: string;
    createdAt: string;
    updatedAt: string;
}

interface JobState {
    jobs: Job[];
    isLoading: boolean;
    error: string | null;
    fetchJobs: () => Promise<void>;
    addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateJob: (id: string, data: Partial<Job>) => Promise<void>;
    deleteJob: (id: string) => Promise<void>;
}

export const useJobStore = create<JobState>((set, get) => ({
    jobs: [],
    isLoading: false,
    error: null,

    fetchJobs: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get('/jobs');
            set({ jobs: data, isLoading: false });
        } catch (err: any) {
            set({ error: 'Failed to fetch jobs', isLoading: false });
        }
    },

    addJob: async (jobData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/jobs', jobData);
            set({ jobs: [data, ...get().jobs], isLoading: false });
        } catch (err: any) {
            set({ error: 'Failed to add job', isLoading: false });
        }
    },

    updateJob: async (id, updateData) => {
        const previousJobs = get().jobs;
        
        // Optimistically update the UI
        set({
            jobs: previousJobs.map((job) => 
                job.id === id ? { ...job, ...updateData } : job
            )
        });

        try {
            const { data } = await api.patch(`/jobs/${id}`, updateData);
            // Sync with server data (in case server has auto-generated fields or validation)
            set({
                jobs: get().jobs.map((job) => (job.id === id ? { ...job, ...data } : job)),
                isLoading: false,
            });
        } catch (err: any) {
            // Revert on error
            set({ 
                jobs: previousJobs,
                error: 'Failed to update job', 
                isLoading: false 
            });
        }
    },

    deleteJob: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/jobs/${id}`);
            set({
                jobs: get().jobs.filter((job) => job.id !== id),
                isLoading: false,
            });
        } catch (err: any) {
            set({ error: 'Failed to delete job', isLoading: false });
        }
    },
}));
