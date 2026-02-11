'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative selection:bg-white/20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-white/[0.03] rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative z-10">
        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 glass-dark border-b border-white/5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-gray-400 flex items-center justify-center shadow-lg shadow-white/10 group-hover:scale-105 transition-transform duration-500">
                <span className="text-xl font-bold text-black">JT</span>
              </div>
              <span className="text-xl font-bold tracking-tight">JobTracker</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-semibold text-text-secondary hover:text-white transition-colors">Log In</Link>
              <Link href="/register" className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-40 pb-32 px-6 relative">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold tracking-widest text-text-secondary mb-8 hover:bg-white/[0.05] transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                V2.0 NOW LIVE
              </div>

              <h1 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight mb-8">
                TRACK <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 animate-gradient-x">
                  CAREERS
                </span>
              </h1>

              <p className="text-xl text-text-secondary leading-relaxed max-w-lg mb-12">
                The intelligent workspace for ambitious professionals. Track applications, analyze growth, and land your dream role with precision.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/register" className="group relative px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-1">
                  <span className="relative z-10">Start Tracking Free</span>
                  <div className="absolute inset-0 bg-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </Link>
                <div className="flex items-center gap-4 px-6 border-l border-white/10">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] font-bold ring-2 ring-black">
                        <span className="opacity-50">U{i}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-white">10k+</p>
                    <p className="text-xs text-text-secondary uppercase tracking-wider">Active Users</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-200">
              <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-700">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-[2rem] blur-2xl opacity-20" />
                <Image
                  src="/illustrations/landing-hero.svg"
                  alt="Dashboard Preview"
                  width={800}
                  height={600}
                  className="w-full h-auto drop-shadow-2xl"
                  priority
                />

                {/* Floating Cards */}
                <div className="absolute -left-8 top-20 animate-float bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl max-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">💼</div>
                    <div>
                      <p className="text-xs font-bold text-white">New Offer</p>
                      <p className="text-[10px] text-text-secondary">Google</p>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="w-[80%] h-full bg-success/80" />
                  </div>
                </div>

                <div className="absolute -right-8 bottom-20 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="bg-white text-black p-4 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    <p className="text-2xl font-black mb-1">Top 1%</p>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Growth Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Engineered for <br />High Performers</h2>
              <p className="text-text-secondary max-w-2xl mx-auto text-lg">Every feature is designed to reduce friction and amplify your career potential.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Auto-Import', desc: 'One-click save from LinkedIn, Indeed & Glassdoor.', icon: '⚡' },
                { title: 'Smart Analytics', desc: 'Visualize your application velocity and success rates.', icon: 'aa' },
                { title: 'Goal Tracking', desc: 'Set targets and stay accountable to your career growth.', icon: '🎯' },
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 hover:-translate-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/[0.02]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tight">
              Ready to <br />Level Up?
            </h2>
            <Link href="/register" className="inline-block bg-white text-black px-12 py-5 rounded-full font-bold text-xl hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300">
              Get Started Now
            </Link>
            <p className="mt-8 text-sm text-text-secondary uppercase tracking-widest font-semibold">No credit card required</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 px-6 bg-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <span className="font-bold">JobTracker</span>
              <span className="text-xs text-text-secondary">© 2026</span>
            </div>
            <div className="flex gap-8 text-sm text-text-secondary font-medium">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}


