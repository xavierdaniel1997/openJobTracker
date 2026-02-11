import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
    const variants = {
        default: 'bg-white/10 text-white border-white/20',
        primary: 'bg-white/10 text-white border-white/20',
        success: 'bg-success/15 text-success border-success/30',
        warning: 'bg-warning/15 text-warning border-warning/30',
        danger: 'bg-danger/15 text-danger border-danger/30',
        info: 'bg-white/10 text-text-secondary border-white/20',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
