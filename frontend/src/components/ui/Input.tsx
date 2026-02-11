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
                    <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl",
                        "text-foreground placeholder-text-muted",
                        "focus:outline-none focus:ring-3 focus:ring-white/[0.15] focus:border-white/20 focus:bg-white/[0.05]",
                        "transition-all duration-300 backdrop-blur-xl",
                        error && "border-danger focus:ring-danger/50 focus:border-danger",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-sm text-danger">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
