import { create } from 'zustand';
import api from '@/lib/api';

export interface Job {
    id: number;
    title: string;
    company: string;
    platform?: string;
    location?: string;
    salary?: string;
    job_url: string;
    status: 'applied' | 'interview' | 'offer' | 'rejected';
    description?: string;
    posted_date?: string;
    hr_name?: string;
    hr_email?: string;
    hr_phone?: string;
    createdAt: string;
    updatedAt: string;
}

interface JobState {
    jobs: Job[];
    isLoading: boolean;
    error: string | null;
    fetchJobs: () => Promise<void>;
    addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateJob: (id: number, data: Partial<Job>) => Promise<void>;
    deleteJob: (id: number) => Promise<void>;
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
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.patch(`/jobs/${id}`, updateData);
            set({
                jobs: get().jobs.map((job) => (job.id === id ? { ...job, ...data } : job)),
                isLoading: false,
            });
        } catch (err: any) {
            set({ error: 'Failed to update job', isLoading: false });
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
