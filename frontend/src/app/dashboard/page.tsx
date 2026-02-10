'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { useJobStore, Job } from '@/store/job.store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full shadow-xl shadow-primary/20"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

            {/* Header */}
            <header className="sticky top-0 z-30 w-full glass-dark border-b border-white/5 px-4 sm:px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                            <span className="text-lg font-bold text-white">JT</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-foreground">JobTracker</h1>
                            <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Workspace</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3 pr-6 border-r border-white/10">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <span className="text-sm font-medium text-foreground">{user?.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm text-muted hover:text-danger hover:bg-danger/10 border border-transparent rounded-xl transition-all font-medium"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Dashboard Hero/Welcome */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <h2 className="text-4xl font-extrabold text-foreground mb-2">My Applications</h2>
                        <p className="text-muted text-lg">You have {stats.total} total jobs tracked. Keep going!</p>
                    </div>
                    <Button onClick={handleAdd} className="h-12 px-8 rounded-2xl shadow-xl shadow-primary/30 group">
                        <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Job
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                    <Card glass className="relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-muted text-xs font-bold uppercase tracking-wider mb-2">Total</p>
                            <h3 className="text-4xl font-extrabold text-foreground">{stats.total}</h3>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">📋</div>
                    </Card>
                    <Card glass className="relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-2">Applied</p>
                            <h3 className="text-4xl font-extrabold text-foreground">{stats.applied}</h3>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 text-primary group-hover:scale-110 transition-transform">🚀</div>
                    </Card>
                    <Card glass className="relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-warning text-xs font-bold uppercase tracking-wider mb-2">Interviews</p>
                            <h3 className="text-4xl font-extrabold text-foreground">{stats.interviews}</h3>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 text-warning group-hover:scale-110 transition-transform">📞</div>
                    </Card>
                    <Card glass className="relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-success text-xs font-bold uppercase tracking-wider mb-2">Offers</p>
                            <h3 className="text-4xl font-extrabold text-white">{stats.offers}</h3>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 text-success group-hover:scale-110 transition-transform">🎉</div>
                    </Card>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8 pb-8 border-b border-white/5">
                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 w-full md:w-auto">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterStatus === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus('applied')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterStatus === 'applied' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
                        >
                            Applied
                        </button>
                        <button
                            onClick={() => setFilterStatus('interview')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterStatus === 'interview' ? 'bg-warning text-white shadow-lg shadow-warning/20' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
                        >
                            Interview
                        </button>
                        <button
                            onClick={() => setFilterStatus('offer')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterStatus === 'offer' ? 'bg-success text-white shadow-lg shadow-success/20' : 'text-muted hover:text-foreground hover:bg-white/5'}`}
                        >
                            Offers
                        </button>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <input
                            type="text"
                            placeholder="Search company or title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-6 rounded-2xl bg-white/5 border border-white/5 text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Jobs Grid/List */}
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
                    <div className="text-center py-24 animate-in fade-in zoom-in-95 duration-700">
                        <div className="relative inline-block mb-12">
                            <Image
                                src="/illustrations/empty-dashboard.svg"
                                alt="No jobs tracked"
                                width={300}
                                height={200}
                                className="mx-auto drop-shadow-2xl"
                            />
                            <div className="absolute inset-0 bg-primary/20 blur-[80px] -z-10 rounded-full" />
                        </div>
                        <h4 className="text-2xl font-bold text-foreground mb-3">No jobs tracked yet</h4>
                        <p className="text-muted mb-8 max-w-sm mx-auto">Click "Add New Job" or use our browser extension to start tracking your applications.</p>
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 text-primary rounded-2xl text-sm font-bold shadow-xl shadow-primary/5">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                            Tip: Install the chrome extension for one-click saving!
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            <JobModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingJob={editingJob}
            />
        </div>
    );
}
