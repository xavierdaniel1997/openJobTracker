import React from 'react';
import { Job } from '@/store/job.store';
import { KanbanCard } from './KanbanCard';
import { Droppable } from '@hello-pangea/dnd';

interface KanbanColumnProps {
    title: string;
    status: string;
    jobs: Job[];
    onEdit: (job: Job) => void;
    onDelete: (job: Job) => void;
}

export const KanbanColumn = ({ title, status, jobs, onEdit, onDelete }: KanbanColumnProps) => {
    const headerStyles: Record<string, string> = {
        applied: 'text-blue-400',
        interview: 'text-amber-400',
        offer: 'text-emerald-400',
        rejected: 'text-red-400',
    };

    return (
        <div className="flex flex-col rounded-3xl border border-white/5 bg-white/[0.02] min-h-[500px] w-full">
            <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className={`font-black text-sm uppercase tracking-widest ${headerStyles[status] || 'text-white'}`}>
                        {title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white shadow-sm border border-white/5">
                        {jobs.length}
                    </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>

            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`px-3 pb-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar flex-1 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-white/[0.05]' : ''
                            }`}
                    >
                        {jobs.map((job, index) => (
                            <KanbanCard
                                key={job.id}
                                index={index}
                                job={job}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                        {provided.placeholder}

                        {jobs.length === 0 && !snapshot.isDraggingOver && (
                            <div className="py-12 px-4 rounded-2xl border border-dashed border-white/5 text-center">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                    No applications
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );
};
