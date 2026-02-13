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
        jobUrl: '',
        status: 'applied' as Job['status'],
        platform: '',
        notes: '',
        hrName: '',
        hrEmail: '',
        hrPhone: '',
        interviewDate: '',
        contactMethod: '',
        feedback: '',
    });

    useEffect(() => {
        if (editingJob) {
            setFormData({
                title: editingJob.title,
                company: editingJob.company,
                location: editingJob.location || '',
                salary: editingJob.salary || '',
                jobUrl: editingJob.jobUrl || '',
                status: editingJob.status,
                platform: editingJob.platform || '',
                notes: editingJob.notes || '',
                hrName: editingJob.hrName || '',
                hrEmail: editingJob.hrEmail || '',
                hrPhone: editingJob.hrPhone || '',
                interviewDate: editingJob.interviewDate ? new Date(editingJob.interviewDate).toISOString().slice(0, 16) : '',
                contactMethod: editingJob.contactMethod || '',
                feedback: editingJob.feedback || '',
            });
        } else {
            setFormData({
                title: '',
                company: '',
                location: '',
                salary: '',
                jobUrl: '',
                status: 'applied',
                platform: '',
                notes: '',
                hrName: '',
                hrEmail: '',
                hrPhone: '',
                interviewDate: '',
                contactMethod: '',
                feedback: '',
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
                        placeholder="https://..."
                        value={formData.jobUrl}
                        onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                        required
                    />
                    <Input
                        label="Platform"
                        placeholder="e.g. LinkedIn"
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    />
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Status</label>
                        <div className="relative">
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                        <span className="text-lg">👤</span> Recruiter Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Name"
                            placeholder="Recruiter Name"
                            value={formData.hrName}
                            onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
                        />
                        <Input
                            label="Email"
                            placeholder="hr@company.com"
                            value={formData.hrEmail}
                            onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                        />
                        <Input
                            label="Phone"
                            placeholder="+1 234..."
                            value={formData.hrPhone}
                            onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Contact Mode</label>
                        <div className="relative">
                            <select
                                value={formData.contactMethod}
                                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-white/20 focus:bg-white/[0.05] transition-all outline-none appearance-none font-medium"
                            >
                                <option value="" className="bg-card text-white">Select Mode</option>
                                <option value="Phone Call" className="bg-card text-white">Phone Call</option>
                                <option value="Email" className="bg-card text-white">Email</option>
                                <option value="LinkedIn" className="bg-card text-white">LinkedIn</option>
                                <option value="WhatsApp" className="bg-card text-white">WhatsApp</option>
                                <option value="In Person" className="bg-card text-white">In Person</option>
                                <option value="Other" className="bg-card text-white">Other</option>
                            </select>
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {formData.status === 'interview' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <Input
                                type="datetime-local"
                                label="Interview Date & Time"
                                value={formData.interviewDate}
                                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Feedback / HR Response</label>
                    <textarea
                        rows={3}
                        placeholder="What did they say? Any specific feedback or next steps..."
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:border-white/20 focus:bg-white/[0.05] transition-all outline-none resize-none font-medium placeholder:text-text-muted"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Description / Notes</label>
                    <textarea
                        rows={4}
                        placeholder="Add some details about the job, interview dates, or recruiter contacts..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
