import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
    glass?: boolean;
}

export const Card = ({ children, className = '', onClick, hover = true, glass = false }: CardProps) => {
    return (
        <div
            onClick={onClick}
            className={`
                rounded-3xl border bg-card p-6 transition-all duration-300
                ${glass ? 'bg-white/[0.03] backdrop-blur-2xl border-white/[0.08]' : 'border-white/[0.08]'}
                ${hover ? 'hover:border-white/[0.15] hover:shadow-2xl hover:-translate-y-1 hover:bg-white/[0.05]' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
            style={{
                boxShadow: glass ? '0 4px 24px rgba(0, 0, 0, 0.4)' : undefined
            }}
        >
            {children}
        </div>
    );
};
