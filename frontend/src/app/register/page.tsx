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
            console.log("error from the register page", err);
            setErrors({
                general: err.response?.data?.message || 'Registration failed. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-black selection:bg-white/20">
            {/* Left Side: Auth Illustration */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-white/[0.02] p-12 border-r border-white/5 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] animate-pulse-slow" />

                <div className="relative z-10 text-center max-w-md animate-in fade-in slide-in-from-left-12 duration-1000">
                    <div className="mb-12 inline-block relative">
                        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full opacity-20" />
                        <svg className="w-64 h-64 mx-auto relative z-10 drop-shadow-2xl animate-float" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-20" />

                            {/* Animated Rocket-like shape */}
                            <path d="M100 40C100 40 120 80 120 110C120 140 100 150 100 150C100 150 80 140 80 110C80 80 100 40 100 40Z" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="1" />
                            <circle cx="100" cy="90" r="10" fill="white" />

                            {/* Particles */}
                            <circle cx="60" cy="140" r="2" fill="white" className="animate-pulse" />
                            <circle cx="140" cy="80" r="3" fill="white" className="animate-pulse" style={{ animationDelay: '1s' }} />
                            <circle cx="120" cy="160" r="2" fill="white" className="animate-pulse" style={{ animationDelay: '2s' }} />

                            {/* Lines */}
                            <path d="M100 150V180" stroke="white" strokeWidth="1" strokeDasharray="2 2" className="opacity-50" />
                        </svg>
                    </div>
                    <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Join the Elite</h2>
                    <p className="text-xl text-text-secondary leading-relaxed font-medium">
                        Create an account to start your journey towards your dream career with precision tracking.
                    </p>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-12 py-12 relative overflow-hidden">
                <div className="lg:hidden absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/[0.05] rounded-full blur-[80px]" />

                <div className="w-full max-w-md animate-in fade-in slide-in-from-right-12 duration-1000">
                    <div className="mb-10 text-center lg:text-left">
                        <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center text-xl font-bold mb-6 shadow-xl shadow-white/10 mx-auto lg:mx-0">
                            JT
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3">Create Account</h1>
                        <p className="text-text-secondary">Fill in your details to get started.</p>
                    </div>

                    <Card glass className="p-8 border-white/10 shadow-2xl overflow-y-auto max-h-[85vh] bg-black/40">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {errors.general && (
                                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl text-sm animate-in fade-in zoom-in-95 duration-300 font-medium font-medium flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                error={errors.email}
                                required
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
                                />

                                <Input
                                    label="Confirm"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    error={errors.confirmPassword}
                                    required
                                />
                            </div>

                            <div className="flex items-start gap-3 text-sm text-text-secondary py-2">
                                <input type="checkbox" className="mt-1 accent-white" required id="tos" />
                                <label htmlFor="tos">I agree to the <Link href="#" className="text-white hover:underline decoration-white/30 underline-offset-4">Terms of Service</Link> and <Link href="#" className="text-white hover:underline decoration-white/30 underline-offset-4">Privacy Policy</Link>.</label>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.01] active:scale-[0.99] transition-all bg-white text-black border-none"
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-text-secondary text-sm font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white hover:underline decoration-white/30 underline-offset-4 transition-all">
                                Sign in
                            </Link>
                        </div>
                    </Card>

                    <p className="mt-8 text-center text-xs font-bold text-text-secondary uppercase tracking-widest opacity-50 pb-4">
                        &copy; 2026 JobTracker
                    </p>
                </div>
            </div>
        </div>
    );
}
