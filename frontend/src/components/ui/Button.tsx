import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline";
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = "px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

        const variants = {
            primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30",
            secondary: "bg-card text-foreground hover:bg-card-hover",
            outline: "border border-border text-foreground hover:bg-card-hover",
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
