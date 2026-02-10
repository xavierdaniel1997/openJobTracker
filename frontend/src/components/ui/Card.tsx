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
                rounded-2xl border border-border bg-card p-6 transition-all duration-300
                ${hover ? 'hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1' : ''}
                ${glass ? 'bg-white/5 backdrop-blur-xl border-white/10' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};
