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

    const getPlatformStyle = (platform?: string) => {
        const p = platform?.toLowerCase() || '';
        // Extension uses simple styling for platform in the list usually, but let's keep it distinct but subtle
        if (p.includes('linkedin')) return { style: 'text-[#0077b5] bg-[#0077b5]/10 border-[#0077b5]/20', label: 'LinkedIn' };
        if (p.includes('indeed')) return { style: 'text-[#2164f3] bg-[#2164f3]/10 border-[#2164f3]/20', label: 'Indeed' };
        if (p.includes('glassdoor')) return { style: 'text-[#0caa41] bg-[#0caa41]/10 border-[#0caa41]/20', label: 'Glassdoor' };
        if (p.includes('naukri')) return { style: 'text-[#4a90e2] bg-[#4a90e2]/10 border-[#4a90e2]/20', label: 'Naukri' };
        return { style: 'text-[#8a8a8a] bg-white/5 border-white/10', label: platform || 'Other' };
    };

    const platformConfig = getPlatformStyle(job.platform);

    return (
        <div
            onClick={onClick}
            className="group relative p-[18px] rounded-[16px] bg-[#141414] border border-white/[0.08] hover:bg-[#1a1a1a] hover:border-[#3a3a3a] transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden shadow-sm hover:shadow-xl"
        >
            <div className="relative z-10 flex justify-between items-start mb-3">
                <div className="flex gap-4 w-full">
                    {/* Extension doesn't show logo? It shows title/company/platform. But dashboard usually has logos. We'll keep logo but make it subtle? 
                       Extension popup has NO logo in the list items (see popup.html JS). It only has text.
                       User said "exact like extension". But removing logo might make it too plain for dashboard.
                       I'll keep logo but style it to fit.
                    */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-white text-[16px] leading-[1.4] mb-1.5 line-clamp-1 flex items-center gap-2">
                                {job.title}
                                {job.jobUrl && (
                                    <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8a8a8a] hover:text-white">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                )}
                            </h4>
                            <Badge variant={statusVariants[job.status] || 'default'} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/20">
                                {job.status}
                            </Badge>
                        </div>

                        <div className="text-[13px] text-[#8a8a8a] font-medium flex items-center gap-2">
                            {job.company}
                            {job.platform && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold border ${platformConfig.style}`}>
                                    {platformConfig.label}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex flex-wrap gap-2.5 mt-4">
                {job.location && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] font-medium text-[#8a8a8a] hover:bg-white/10 hover:text-white hover:border-white/[0.15] transition-colors">
                        <span>📍</span>
                        {job.location}
                    </div>
                )}
                {job.salary && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] font-medium text-[#8a8a8a] hover:bg-white/10 hover:text-white hover:border-white/[0.15] transition-colors">
                        <span>💰</span>
                        {job.salary}
                    </div>
                )}
                {job.hrName && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-[11px] font-medium text-[#8a8a8a] hover:bg-white/10 hover:text-white hover:border-white/[0.15] transition-colors" title={job.hrEmail || 'Recruiter'}>
                        <span>👤</span>
                        {job.hrName}
                    </div>
                )}
                {/* Extension has 'Time' tag for jobType, we don't have jobType in schema yet, but if we did: 
                      <div className="tag">⏰ {job.jobType}</div> 
                  */}
            </div>

            <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                <span className="text-[10px] text-[#5a5a5a] uppercase tracking-wider font-bold">
                    {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                    {/* Buttons matching extension .btn style roughly (icon only) */}
                    {job.jobUrl && (
                        <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-[#8a8a8a] hover:text-white hover:bg-white/10 rounded-xl transition-all w-8 h-8 flex items-center justify-center"
                            title="Open Job Post"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    )}
                    <button
                        onClick={onEdit}
                        className="p-2 text-[#8a8a8a] hover:text-white hover:bg-white/10 rounded-xl transition-all w-8 h-8 flex items-center justify-center"
                        title="Edit Job"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-[#8a8a8a] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-xl transition-all w-8 h-8 flex items-center justify-center"
                        title="Delete Job"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
