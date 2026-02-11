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
        <div
            onClick={onClick}
            className="group relative p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
        >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                        {job.company?.[0]?.toUpperCase() || 'J'}
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-white transition-colors line-clamp-1 flex items-center gap-2">
                            {job.title}
                            {job.job_url && (
                                <a href={job.job_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            )}
                        </h4>
                        <p className="text-text-secondary text-sm line-clamp-1 font-medium">{job.company}</p>
                    </div>
                </div>
                <Badge variant={statusVariants[job.status] || 'default'} className="backdrop-blur-md shadow-lg">
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
            </div>

            <div className="relative z-10 space-y-3 mb-6">
                {job.location && (
                    <div className="flex items-center gap-2 text-xs font-medium text-text-secondary group-hover:text-text-muted transition-colors">
                        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                    </div>
                )}
                {job.salary && (
                    <div className="flex items-center gap-2 text-xs font-medium text-text-secondary group-hover:text-text-muted transition-colors">
                        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary}
                    </div>
                )}
            </div>

            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                    {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                        onClick={onEdit}
                        className="p-2 text-text-secondary hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        title="Edit Job"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                        title="Delete Job"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
