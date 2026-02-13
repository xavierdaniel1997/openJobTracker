import React from 'react';
import { Job, useJobStore } from '@/store/job.store';
import { Badge } from '@/components/ui/Badge';
import { Draggable } from '@hello-pangea/dnd';

interface KanbanCardProps {
    job: Job;
    index: number;
    onEdit: (job: Job) => void;
    onDelete: (job: Job) => void;
}

export const KanbanCard = ({ job, index, onEdit, onDelete }: KanbanCardProps) => {
    const { updateJob } = useJobStore();

    const handleStatusChange = async (newStatus: string) => {
        await updateJob(job.id, { status: newStatus });
    };

    const platformColors: Record<string, string> = {
        linkedin: 'text-[#0077b5] bg-[#0077b5]/10 border-[#0077b5]/20',
        indeed: 'text-[#2164f3] bg-[#2164f3]/10 border-[#2164f3]/20',
        glassdoor: 'text-[#0caa41] bg-[#0caa41]/10 border-[#0caa41]/20',
        naukri: 'text-[#4a90e2] bg-[#4a90e2]/10 border-[#4a90e2]/20',
    };

    const getPlatformStyle = (platform?: string) => {
        const p = platform?.toLowerCase() || '';
        for (const [key, value] of Object.entries(platformColors)) {
            if (p.includes(key)) return value;
        }
        return 'text-[#8a8a8a] bg-white/5 border-white/10';
    };

    return (
        <Draggable draggableId={job.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`group relative p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-xl ${snapshot.isDragging ? 'rotate-2 scale-105 z-50 bg-[#1a1a1a] border-white/20 shadow-2xl' : ''
                        }`}
                >
                    <div className="mb-2">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white text-sm line-clamp-2 leading-tight flex-1 mr-2">
                                {job.title}
                            </h4>
                            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                                {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-text-secondary font-medium lowercase">
                            <span className="capitalize">{job.company}</span>
                            {job.location && (
                                <span className="flex items-center gap-1 opacity-60">
                                    <span className="text-[10px]">|</span>
                                    <span>📍 {job.location}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {job.contactMethod && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20 uppercase">
                                <span>📞</span>
                                {job.contactMethod}
                            </div>
                        )}
                    </div>

                    {job.feedback && (
                        <div className="mb-4 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                            <p className="text-[10px] text-text-muted line-clamp-2 italic leading-relaxed">
                                {job.feedback}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {job.platform && (
                                <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] uppercase tracking-wider font-bold border ${getPlatformStyle(job.platform)}`}>
                                    {job.platform}
                                </span>
                            )}
                            <div className="flex gap-1 ml-1">
                                {['applied', 'interview', 'offer', 'rejected'].map((s) => (
                                    s !== job.status && (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusChange(s)}
                                            className="w-5 h-5 rounded-md flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-[8px] transition-all"
                                            title={`Move to ${s}`}
                                        >
                                            {s[0].toUpperCase()}
                                        </button>
                                    )
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(job); }}
                                className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-xl transition-all w-8 h-8 flex items-center justify-center"
                                title="Edit"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(job); }}
                                className="p-2 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all w-8 h-8 flex items-center justify-center"
                                title="Delete"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};
