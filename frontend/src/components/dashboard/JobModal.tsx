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
                        value={formData.job_url}
                        onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                        required
                    />
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Status</label>
                        <div className="relative">
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Job['status'] })}
                                className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-white/20 focus:bg-white/[0.05] transition-all outline-none appearance-none font-medium"
                            >
                                <option value="applied" className="bg-card text-white">Applied</option>
                                <option value="interview" className="bg-card text-white">Interview</option>
                                <option value="offer" className="bg-card text-white">Offer</option>
                                <option value="rejected" className="bg-card text-white">Rejected</option>
                            </select>
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Description / Notes</label>
                    <textarea
                        rows={4}
                        placeholder="Add some details about the job, interview dates, or recruiter contacts..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-white/20 focus:bg-white/[0.05] transition-all outline-none resize-none font-medium placeholder:text-text-muted"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/[0.08]">
                    <Button variant="outline" onClick={onClose} type="button" className="border-white/10 hover:bg-white/5 hover:text-white">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="bg-white text-black hover:bg-gray-200">
                        {editingJob ? 'Save Changes' : 'Track Application'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
