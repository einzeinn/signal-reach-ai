'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Target, Mail, BarChart, X } from 'lucide-react';
import HeroSection from '../components/ui/HeroSection';
import HowItWorks from '../components/ui/HowItWorks';

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);
  const router = useRouter();

  return (
    <>
      {/* Pass the setAuthMode function to child components */}
      <HeroSection onOpenAuth={setAuthMode} />
      <HowItWorks onOpenAuth={setAuthMode} />

      {/* CTA Section */}
      <section className="min-h-screen flex flex-col items-center justify-center bg-neo-white border-b-2 border-black px-6 py-16 font-sans relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#00000012 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />

        <div className="relative z-10 max-w-2xl text-center">
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-6 leading-tight">
            Ready to find your next leads?
          </h2>

          <p className="text-lg md:text-xl text-gray-600 font-bold mb-12">
            SignalReach AI analyzes job postings, Reddit discussions, and news to identify companies ready for your pitch. Start generating personalized outreach emails powered by AI.
          </p>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: <Target className="w-8 h-8 stroke-[2.5]" />, title: 'Intent Scoring', desc: 'AI-powered scoring' },
              { icon: <Mail className="w-8 h-8 stroke-[2.5]" />, title: 'Email Generation', desc: 'Personalized drafts' },
              { icon: <BarChart className="w-8 h-8 stroke-[2.5]" />, title: 'Signal Analysis', desc: 'Real-time insights' },
            ].map((feature, i) => (
              <div
                key={i}
                className="border-2 border-black bg-white p-5 shadow-comic hover:-translate-y-1 hover:shadow-comic-hover transition-transform flex flex-col items-center justify-center text-center"
              >
                <div className="mb-3 text-neo-teal">{feature.icon}</div>
                <h3 className="font-black uppercase text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Button - Now triggers the Auth Modal instead of direct link */}
          <button
            onClick={() => setAuthMode('signup')}
            className="inline-flex items-center gap-3 bg-neo-teal border-2 border-neo-black px-8 py-4 font-black uppercase text-lg shadow-comic hover:-translate-y-1 hover:shadow-comic-hover active:shadow-comic-hover active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
          >
            Launch Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-xs text-gray-500 mt-8 font-bold">
            No credit card required • 5-minute setup
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neo-black text-neo-white border-t-2 border-neo-black px-8 py-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-black text-lg mb-4">SignalReach</h3>
              <p className="text-sm text-gray-300">Intent-based B2B outreach powered by AI</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Docs'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Contact'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-black text-sm mb-3 uppercase">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-300 hover:text-neo-teal transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 SignalReach AI. All rights reserved. Built for hackers. 🚀</p>
          </div>
        </div>
      </footer>

      {/* ── GLOBAL AUTH MODAL ── */}
      {authMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_#00C7B7] max-w-md w-full relative animate-[popIn_0.2s_ease_forwards]">
            
            <button
              onClick={() => setAuthMode(null)}
              className="absolute top-4 right-4 bg-neo-yellow border-2 border-black w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-3xl font-black uppercase mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>
              {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            
            <p className="text-sm font-bold text-gray-600 mb-6">
              {authMode === 'signin' ? 'Sign in to access your dashboard.' : 'Start finding hot leads in seconds.'}
            </p>

            <form 
              className="flex flex-col gap-4" 
              onSubmit={(e) => { 
                e.preventDefault(); 
                router.push('/dashboard'); 
              }}
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="border-2 border-black p-3 outline-none focus:bg-neo-yellow/20 transition-colors font-bold text-sm" 
                  placeholder="you@company.com" 
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase">Password</label>
                <input 
                  type="password" 
                  required 
                  className="border-2 border-black p-3 outline-none focus:bg-neo-yellow/20 transition-colors font-bold text-sm" 
                  placeholder="••••••••" 
                />
              </div>
              
              <button 
                type="submit" 
                className="mt-2 bg-neo-teal border-2 border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
              >
                {authMode === 'signin' ? 'Log In' : 'Sign Up Free'}
              </button>
            </form>

            <div 
              className="mt-6 text-center text-xs font-bold text-gray-500 cursor-pointer hover:text-black hover:underline"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            >
              {authMode === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </div>
          </div>
          <style>{`
            @keyframes popIn { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
          `}</style>
        </div>
      )}
    </>
  );
}