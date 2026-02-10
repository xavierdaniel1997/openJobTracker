'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useJobStore, Job } from '@/store/job.store';

interface JobModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingJob?: Job | null;
}

export const JobModal = ({ isOpen, onClose, editingJob }: JobModalProps) => {
    const { addJob, updateJob, isLoading } = useJobStore();
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salary: '',
        job_url: '',
        status: 'applied' as Job['status'],
        platform: '',
        description: '',
    });

    useEffect(() => {
        if (editingJob) {
            setFormData({
                title: editingJob.title,
                company: editingJob.company,
                location: editingJob.location || '',
                salary: editingJob.salary || '',
                job_url: editingJob.job_url,
                status: editingJob.status,
                platform: editingJob.platform || '',
                description: editingJob.description || '',
            });
        } else {
            setFormData({
                title: '',
                company: '',
                location: '',
                salary: '',
                job_url: '',
                status: 'applied',
                platform: '',
                description: '',
            });
        }
    }, [editingJob, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingJob) {
            await updateJob(editingJob.id, formData);
        } else {
            await addJob(formData);
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingJob ? 'Edit Job Application' : 'Add New Application'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Job Title"
                        placeholder="e.g. Senior Frontend Developer"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <Input
                        label="Company"
                        placeholder="e.g. Google"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                    />
                    <Input
                        label="Location"
                        placeholder="e.g. Remote / New York"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    <Input
                        label="Salary / Package"
                        placeholder="e.g. $120k - $150k"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                    <Input
                        label="Job URL"
                        placeholder="https://linkedin.com/jobs/..."
                        value={formData.job_url}
                        onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                        required
                    />
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Job['status'] })}
                            className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none appearance-none"
                        >
                            <option value="applied">Applied</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted">Description / Notes</label>
                    <textarea
                        rows={4}
                        placeholder="Add some details about the job..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        {editingJob ? 'Save Changes' : 'Track Application'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
