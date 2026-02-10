import React from 'react';
import { Job } from '@/store/job.store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface JobCardProps {
    job: Job;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

export const JobCard = ({ job, onClick, onEdit, onDelete }: JobCardProps) => {
    const statusVariants: Record<string, any> = {
        applied: 'primary',
        interview: 'warning',
        offer: 'success',
        rejected: 'danger',
    };

    return (
        <Card glass onClick={onClick} className="group relative">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                        {job.company?.[0]?.toUpperCase() || 'J'}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">{job.title}</h4>
                        <p className="text-muted text-sm line-clamp-1">{job.company}</p>
                    </div>
                </div>
                <Badge variant={statusVariants[job.status] || 'default'}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
            </div>

            <div className="space-y-2 mb-6">
                {job.location && (
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                    </div>
                )}
                {job.salary && (
                    <div className="flex items-center gap-2 text-xs text-muted">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">
                    {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Edit Job"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                        title="Delete Job"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </Card>
    );
};
