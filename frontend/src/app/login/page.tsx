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
        <div className="min-h-screen flex bg-background">
            {/* Left Side: Illustration - Hidden on Mobile */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-white/[0.02] p-12 border-r border-white/5 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />

                <div className="relative z-10 text-center max-w-md animate-in fade-in slide-in-from-left-12 duration-1000">
                    <div className="mb-12 inline-block">
                        <Image
                            src="/illustrations/auth-hero.svg"
                            alt="Login Illustration"
                            width={500}
                            height={400}
                            className="w-full h-auto drop-shadow-2xl"
                        />
                    </div>
                    <h2 className="text-4xl font-extrabold text-foreground mb-4">Welcome Back!</h2>
                    <p className="text-xl text-muted leading-relaxed">
                        Sign in to continue tracking your career growth and managing your applications.
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-12 relative overflow-hidden">
                {/* Mobile Decorative Glow */}
                <div className="lg:hidden absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px]" />

                <div className="w-full max-w-md animate-in fade-in slide-in-from-right-12 duration-1000">
                    {/* Brand Logo - Mobile Only */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center shadow-xl shadow-primary/30">
                            <span className="text-2xl font-bold text-white">JT</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
                        <p className="text-muted">Enter your credentials to access your dashboard</p>
                    </div>

                    <Card glass className="p-8 border-white/10 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl text-sm animate-in fade-in zoom-in-95 duration-300">
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
                                className="bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                            />

                            <div className="space-y-2">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-xl"
                                />
                                <div className="flex justify-end">
                                    <Link href="#" className="text-sm text-primary hover:text-primary-hover transition-colors font-medium">Forgot password?</Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-muted font-medium">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-primary hover:text-primary-hover transition-colors border-b border-primary/30">
                                Create an account
                            </Link>
                        </div>
                    </Card>

                    <p className="mt-12 text-center text-sm text-muted animate-in fade-in duration-1000 delay-500">
                        &copy; 2026 JobTracker. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
