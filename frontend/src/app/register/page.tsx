'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            router.push('/dashboard');
        } catch (err: any) {
            setErrors({
                general: err.response?.data?.message || 'Registration failed. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Side: Auth Illustration */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-white/[0.02] p-12 border-r border-white/5 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />

                <div className="relative z-10 text-center max-w-md animate-in fade-in slide-in-from-left-12 duration-1000">
                    <div className="mb-12 inline-block">
                        <Image
                            src="/illustrations/auth-hero.svg"
                            alt="Register Illustration"
                            width={500}
                            height={400}
                            className="w-full h-auto drop-shadow-2xl opacity-90 brightness-110"
                        />
                    </div>
                    <h2 className="text-4xl font-extrabold text-foreground mb-4">Start Your Journey</h2>
                    <p className="text-xl text-muted leading-relaxed">
                        Join thousands of job seekers who stay organized and land better opportunities with JobTracker.
                    </p>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-12 py-12 relative overflow-hidden">
                <div className="lg:hidden absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-[#a855f7]/10 rounded-full blur-[80px]" />

                <div className="w-full max-w-md animate-in fade-in slide-in-from-right-12 duration-1000">
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center shadow-xl shadow-primary/30">
                            <span className="text-2xl font-bold text-white">JT</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
                        <p className="text-muted">Fill in your details to get started for free</p>
                    </div>

                    <Card glass className="p-8 border-white/10 shadow-2xl overflow-y-auto max-h-[85vh]">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {errors.general && (
                                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl text-sm animate-in fade-in zoom-in-95 duration-300">
                                    {errors.general}
                                </div>
                            )}

                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name}
                                required
                                className="bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                error={errors.email}
                                required
                                className="bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    error={errors.password}
                                    required
                                    className="bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                                />

                                <Input
                                    label="Confirm"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    error={errors.confirmPassword}
                                    required
                                    className="bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                                />
                            </div>

                            <div className="flex items-start gap-3 text-sm text-muted py-2">
                                <input type="checkbox" className="mt-1 accent-primary" required id="tos" />
                                <label htmlFor="tos">I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.</label>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-muted font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:text-primary-hover transition-colors border-b border-primary/30">
                                Sign in
                            </Link>
                        </div>
                    </Card>

                    <p className="mt-8 text-center text-sm text-muted animate-in fade-in duration-1000 delay-500 pb-4">
                        &copy; 2026 JobTracker. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
