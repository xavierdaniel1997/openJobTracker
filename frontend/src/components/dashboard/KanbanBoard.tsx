import React from 'react';
import { Job, useJobStore } from '@/store/job.store';
import { KanbanColumn } from './KanbanColumn';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

interface KanbanBoardProps {
    jobs: Job[];
    onEdit: (job: Job) => void;
    onDelete: (job: Job) => void;
}

export const KanbanBoard = ({ jobs, onEdit, onDelete }: KanbanBoardProps) => {
    const { updateJob } = useJobStore();

    const columns = [
        { title: 'Applied', status: 'applied' },
        { title: 'Interviews', status: 'interview' },
        { title: 'Offers', status: 'offer' },
        { title: 'Rejected', status: 'rejected' },
    ];

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId;
        await updateJob(draggableId, { status: newStatus });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
                {columns.map((col) => (
                    <div key={col.status} className="flex-1">
                        <KanbanColumn
                            title={col.title}
                            status={col.status}
                            jobs={jobs.filter(j => j.status === col.status)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};
