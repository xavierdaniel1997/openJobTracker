'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(formData);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-black selection:bg-white/20">
            {/* Left Side: Illustration - Hidden on Mobile */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-white/[0.02] p-12 border-r border-white/5 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] animate-pulse-slow" />

                <div className="relative z-10 text-center max-w-md animate-in fade-in slide-in-from-left-12 duration-1000">
                    <div className="mb-12 inline-block relative">
                        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full opacity-20" />
                        <svg className="w-64 h-64 mx-auto relative z-10 drop-shadow-2xl animate-float" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="90" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-20" />
                            <circle cx="100" cy="100" r="70" stroke="white" strokeWidth="0.5" className="opacity-30" />
                            <path d="M100 40V60M100 140V160M40 100H60M140 100H160" stroke="white" strokeWidth="1" strokeLinecap="round" className="opacity-40" />

                            {/* Shield Icon in Center */}
                            <path d="M100 70C100 70 60 80 60 110C60 140 100 160 100 160C100 160 140 140 140 110C140 80 100 70 100 70Z" fill="url(#grad1)" stroke="white" strokeWidth="2" />
                            <defs>
                                <linearGradient id="grad1" x1="60" y1="70" x2="140" y2="160" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0.05" />
                                </linearGradient>
                            </defs>

                            {/* Floating Lock */}
                            <rect x="85" y="105" width="30" height="25" rx="4" fill="white" />
                            <path d="M92 105V98C92 93.5817 95.5817 90 100 90C104.418 90 108 93.5817 108 98V105" stroke="white" strokeWidth="3" />
                        </svg>
                    </div>
                    <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Welcome Back</h2>
                    <p className="text-xl text-text-secondary leading-relaxed font-medium">
                        Your career data is secure and ready for analysis. Sign in to continue your progress.
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-12 relative overflow-hidden">
                {/* Mobile Decorative Glow */}
                <div className="lg:hidden absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-white/[0.05] rounded-full blur-[100px]" />

                <div className="w-full max-w-md animate-in fade-in slide-in-from-right-12 duration-1000">
                    <div className="mb-10 text-center lg:text-left">
                        <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center text-xl font-bold mb-6 shadow-xl shadow-white/10 mx-auto lg:mx-0">
                            JT
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3">Sign In</h1>
                        <p className="text-text-secondary">Enter your credentials to access your workspace.</p>
                    </div>

                    <Card glass className="p-8 border-white/10 shadow-2xl backdrop-blur-2xl bg-black/40">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl text-sm animate-in fade-in zoom-in-95 duration-300 font-medium flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />

                            <div className="space-y-2">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <div className="flex justify-end">
                                    <Link href="#" className="text-xs font-bold text-text-secondary hover:text-white transition-colors uppercase tracking-wide">Forgot password?</Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-white/10 hover:shadow-white/20 hover:scale-[1.01] active:scale-[0.99] transition-all bg-white text-black border-none"
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-text-secondary text-sm font-medium">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-white hover:underline decoration-white/30 underline-offset-4 transition-all">
                                Create an account
                            </Link>
                        </div>
                    </Card>

                    <p className="mt-12 text-center text-xs font-bold text-text-secondary uppercase tracking-widest opacity-50">
                        &copy; 2026 JobTracker
                    </p>
                </div>
            </div>
        </div>
    );
}
