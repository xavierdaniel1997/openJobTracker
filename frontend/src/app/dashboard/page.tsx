'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { useJobStore, Job } from '@/store/job.store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { JobCard } from '@/components/dashboard/JobCard';
import { JobModal } from '@/components/dashboard/JobModal';

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, logout, checkAuth, user } = useAuthStore();
    const { jobs, fetchJobs, deleteJob, isLoading } = useJobStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    useEffect(() => {
        checkAuth();
        if (!isAuthenticated) {
            router.push('/login');
        } else {
            fetchJobs();
        }
    }, [isAuthenticated, router, checkAuth, fetchJobs]);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: jobs.length,
        applied: jobs.filter(j => j.status === 'applied').length,
        interviews: jobs.filter(j => j.status === 'interview').length,
        offers: jobs.filter(j => j.status === 'offer').length,
    };

    const handleEdit = (job: Job) => {
        setEditingJob(job);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingJob(null);
        setIsModalOpen(true);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full opacity-50"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden selection:bg-white/20">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] animate-pulse-slow" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 w-full glass-dark border-b border-white/5 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-gray-400 flex items-center justify-center shadow-lg shadow-white/10 group-hover:scale-105 transition-transform duration-500">
                            <span className="text-lg font-bold text-black">JT</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-tight">JOBTRACKER</h1>
                            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Workspace</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3 pr-6 border-r border-white/10">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <span className="text-sm font-medium text-text-secondary">{user?.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="text-xs font-bold text-text-secondary hover:text-white uppercase tracking-wider transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Dashboard Hero */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <h2 className="text-4xl font-black mb-2 tracking-tight">Overview</h2>
                        <p className="text-text-secondary text-lg">Your application velocity is looking good.</p>
                    </div>
                    <Button onClick={handleAdd} className="h-12 px-8 rounded-2xl bg-white text-black hover:bg-gray-200 border-none shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all duration-300 font-bold flex items-center gap-2">
                        <span>+</span> Add New Job
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Total', value: stats.total, icon: '💼' },
                        { label: 'Applied', value: stats.applied, icon: '⚡' },
                        { label: 'Interviews', value: stats.interviews, icon: '🎙️' },
                        { label: 'Offers', value: stats.offers, icon: '🎉' },
                    ].map((stat, i) => (
                        <div key={i} className="group relative p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
                            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-4">{stat.label}</p>
                            <h3 className="text-4xl font-black text-white mb-2">{stat.value}</h3>
                            <div className="absolute right-6 bottom-6 text-2xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300 grayscale group-hover:grayscale-0">
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
                    <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto">
                        {['all', 'applied', 'interview', 'offer'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${filterStatus === status
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-6 rounded-2xl bg-white/[0.03] border border-white/5 text-white placeholder:text-text-muted focus:border-white/20 focus:bg-white/[0.05] transition-all outline-none text-sm"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Jobs Grid */}
                {filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                        {filteredJobs.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onClick={() => handleEdit(job)}
                                onEdit={(e) => { e.stopPropagation(); handleEdit(job); }}
                                onDelete={(e) => { e.stopPropagation(); deleteJob(job.id); }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 rounded-[3rem] bg-white/[0.01] border border-dashed border-white/5 animate-in fade-in zoom-in-95 duration-700">
                        <div className="mb-8 opacity-50">
                            <Image
                                src="/illustrations/empty-dashboard.svg"
                                alt="No jobs"
                                width={120}
                                height={120}
                                className="mx-auto grayscale"
                            />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">No jobs found</h4>
                        <p className="text-text-secondary text-sm mb-8">Start tracking your applications to see them here.</p>
                        <Button onClick={handleAdd} className="bg-white/10 hover:bg-white text-white hover:text-black border-none transition-all duration-300">
                            Add First Job
                        </Button>
                    </div>
                )}
            </main>

            <JobModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingJob={editingJob}
            />
        </div>
    );
}
