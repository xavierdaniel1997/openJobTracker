import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "danger";
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = "px-6 py-3 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

        const variants = {
            primary: "bg-white text-black hover:-translate-y-1 shadow-lg shadow-white/20 hover:shadow-2xl hover:shadow-white/30",
            secondary: "bg-white/[0.03] text-white border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] hover:-translate-y-1 hover:shadow-xl",
            outline: "border border-border-hover text-white hover:bg-white/[0.03] hover:border-white/20 hover:-translate-y-1",
            danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/20",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
