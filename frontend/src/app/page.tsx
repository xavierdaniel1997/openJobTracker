'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const router = useRouter();
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();

    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, checkAuth]);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {/* Navigation/Header */}
        <nav className="flex items-center justify-between mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-gray-200 flex items-center justify-center shadow-xl shadow-white/20 group-hover:scale-110 transition-transform">
              <span className="text-2xl font-bold text-black">JT</span>
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">JobTracker</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-text-secondary hover:text-foreground transition-colors px-4 py-2 font-medium">Log In</Link>
            <Link href="/register" className="bg-white hover:bg-gray-100 text-black px-6 py-2.5 rounded-2xl font-bold shadow-lg shadow-white/25 transition-all hover:-translate-y-1">Get Started</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.15] text-xs font-bold text-white mb-6">
              <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
              NEW: AUTO-SCRAPE FROM LINKEDIN & INDEED
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-[1.1] mb-6">
              Track Jobs <br />
              <span className="text-gradient">Effortlessly.</span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed mb-10 max-w-lg">
              The ultimate job application tracker for modern professionals. Save jobs with one click directly from your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-100 shadow-2xl shadow-white/30 transition-all hover:-translate-y-2 text-center"
              >
                Start for Free
              </Link>
              <div className="flex items-center gap-4 px-6 border-l border-border ml-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-bold text-foreground block">5,000+</span>
                  <span className="text-muted">Users tracking jobs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="relative z-10 glass-card p-4 overflow-hidden group">
              <Image
                src="/illustrations/landing-hero.svg"
                alt="JobTracker Illustration"
                width={600}
                height={400}
                className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Background Glow for Hero */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/[0.03] blur-3xl opacity-50" />
          </div>
        </div>

        {/* Features Section */}
        <div>
          <div className="text-center mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why JobTracker?</h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg">Everything you need to land your next big role, organized in one powerful dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card glass className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.08] flex items-center justify-center text-3xl mb-6 shadow-inner ring-1 ring-white/[0.15]">🚀</div>
              <h4 className="text-xl font-bold text-foreground mb-3 tracking-tight">Quick Scraping</h4>
              <p className="text-text-secondary leading-relaxed">Automatically extract job details from LinkedIn, Indeed, Naukri, and Glassdoor with our extension.</p>
            </Card>

            <Card glass className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.08] flex items-center justify-center text-3xl mb-6 shadow-inner ring-1 ring-white/[0.15]">📊</div>
              <h4 className="text-xl font-bold text-foreground mb-3 tracking-tight">Track Progress</h4>
              <p className="text-text-secondary leading-relaxed">Visualize your application funnel and monitor progress across different stages from applied to offer.</p>
            </Card>

            <Card glass className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.08] flex items-center justify-center text-3xl mb-6 shadow-inner ring-1 ring-white/[0.15]">🔔</div>
              <h4 className="text-xl font-bold text-foreground mb-3 tracking-tight">Stay Organized</h4>
              <p className="text-text-secondary leading-relaxed">Never miss a follow-up with built-in reminders and detailed notes for every interaction.</p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
