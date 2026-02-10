import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-foreground mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-2.5 bg-card border border-border rounded-lg",
                        "text-foreground placeholder-muted",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "transition-all duration-200",
                        error && "border-danger focus:ring-danger/50 focus:border-danger",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-danger">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
