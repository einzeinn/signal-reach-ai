'use client';

import { useEffect, useState } from 'react';
import { Briefcase, MessageSquare, Flame } from 'lucide-react';

interface HeroSectionProps {
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export default function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 border-b-2 border-black relative overflow-hidden bg-white">

      {/* Halftone bg */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#00000012 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />

      {/* ── LEFT ── */}
      <div className="relative z-10 flex flex-col justify-center gap-6 px-10 py-16 md:px-12 border-b-2 md:border-b-0 md:border-r-2 border-black">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#FEF08A] border-2 border-black px-4 py-1.5 text-[11px] font-black uppercase tracking-widest w-fit shadow-[3px_3px_0_#000] opacity-0 animate-[popIn_0.4s_ease_3.8s_forwards]">
          <span className="w-2 h-2 rounded-full bg-[#00C7B7] animate-pulse" />
          Intent-Based GTM Intelligence
        </div>

        {/* Headline */}
        <h1
          className="font-black uppercase leading-[0.92] text-[clamp(48px,7vw,76px)] text-black opacity-0 animate-[slideUp_0.6s_ease_4.1s_forwards]"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}
        >
          FIND THE<br />
          <span className="text-[#00C7B7]">SIGNAL.</span><br />
          <span style={{ WebkitTextStroke: '2px #000', color: 'transparent' }}>CLOSE</span><br />
          THE DEAL.
        </h1>

        {/* Sub */}
        <p className="text-sm leading-relaxed text-gray-600 max-w-md opacity-0 animate-[slideUp_0.5s_ease_4.4s_forwards]">
          Monitor hiring, Reddit pain points &amp; funding news in real time.
          Gemini AI scores buying intent and writes hyper-personalized cold emails —
          before your competitors even know the lead exists.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 items-center opacity-0 animate-[slideUp_0.5s_ease_4.6s_forwards]">
          <button
            onClick={() => onOpenAuth?.('signup')}
            className="bg-black text-white border-2 border-black px-7 py-3.5 font-black text-xs uppercase tracking-wide shadow-[4px_4px_0_#00C7B7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#00C7B7] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-none cursor-pointer"
          >
            Sign Up Free →
          </button>
          <button
            onClick={() => onOpenAuth?.('signin')}
            className="bg-transparent text-black border-2 border-black px-6 py-3.5 font-black text-xs uppercase tracking-wide shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-none cursor-pointer"
          >
            Sign In
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-8 border-t-2 border-dashed border-gray-200 pt-5 opacity-0 animate-[slideUp_0.5s_ease_4.8s_forwards]">
          {[
            { num: '3×',    label: 'Signal Sources'  },
            { num: '0–100', label: 'Intent Score'    },
            { num: '<10s',  label: 'Email Generated' },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-3xl font-black text-black" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {num}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Logo ── */}
      <div className="relative z-10 flex items-center justify-center p-10 bg-white">
        {/* Corner decorations */}
        {[
          'top-4 left-4 border-t-2 border-l-2',
          'top-4 right-4 border-t-2 border-r-2',
          'bottom-4 left-4 border-b-2 border-l-2',
          'bottom-4 right-4 border-b-2 border-r-2',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-6 h-6 border-black ${cls}`} />
        ))}

        {/* Logo + cards wrapper */}
        <div className="relative flex flex-col items-center" style={{ width: 300 }}>
          {/* Signal card TOP */}
          <div className="absolute -top-8 right-0 border-2 border-black px-3 py-1.5 text-[11px] font-black shadow-[3px_3px_0_#000] whitespace-nowrap bg-[#FEF08A] opacity-0 animate-[floatIn_0.4s_ease_4.5s_forwards] z-20 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Hiring: Head of IT Infra
          </div>
          {/* Signal card LEFT */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 border-2 border-black px-3 py-1.5 text-[11px] font-black shadow-[3px_3px_0_#000] whitespace-nowrap bg-white opacity-0 animate-[floatIn_0.4s_ease_4.7s_forwards] z-20 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-gray-500" /> Pain on r/sysadmin
          </div>
          {/* Signal card BOTTOM-RIGHT */}
          <div className="absolute right-0 bottom-20 border-2 border-black px-3 py-1.5 text-[11px] font-black shadow-[3px_3px_0_#000] whitespace-nowrap bg-[#00C7B7] opacity-0 animate-[floatIn_0.4s_ease_4.9s_forwards] z-20 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-black" /> Score: 87
          </div>

          <LogoSVG />

          {/* Wordmark */}
          <div className="text-center mt-4 opacity-0 animate-[fadeIn_0.5s_ease_4.2s_forwards]">
            <div className="text-4xl tracking-[4px]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              <span className="text-black">SIGNAL</span>
              <span className="text-[#00C7B7]">REACH</span>
              <span className="text-[13px] font-black border-2 border-black px-1.5 py-0.5 ml-1.5 align-super inline-block leading-none" style={{ fontFamily: 'sans-serif' }}>
                AI
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[3px] text-gray-400 mt-1">
              Find Signals. Reach Further.
            </p>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

        @keyframes draw    { to { stroke-dashoffset: 0; } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes popIn   { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

        .outer-circle { stroke-dasharray:502; stroke-dashoffset:502; animation:draw 1.2s cubic-bezier(.4,0,.2,1) 0.3s forwards; }
        .ch-t  { stroke-dasharray:30; stroke-dashoffset:30; animation:draw 0.25s ease 1.5s forwards; }
        .ch-b  { stroke-dasharray:30; stroke-dashoffset:30; animation:draw 0.25s ease 1.6s forwards; }
        .ch-l  { stroke-dasharray:30; stroke-dashoffset:30; animation:draw 0.25s ease 1.7s forwards; }
        .ch-r  { stroke-dasharray:30; stroke-dashoffset:30; animation:draw 0.25s ease 1.8s forwards; }
        .inner-ring { stroke-dasharray:380; stroke-dashoffset:380; animation:draw 0.8s cubic-bezier(.4,0,.2,1) 1.9s forwards; }
        .teal-bg { opacity:0; animation:fadeIn 0.35s ease 2.7s forwards; }
        .bolt    { stroke-dasharray:220; stroke-dashoffset:220; animation:draw 0.55s ease 3.0s forwards; }
        .orb-1   { opacity:0; animation:fadeIn 0.3s ease 3.6s  forwards; }
        .orb-2   { opacity:0; animation:fadeIn 0.3s ease 3.75s forwards; }
        .orb-3   { opacity:0; animation:fadeIn 0.3s ease 3.9s  forwards; }
      `}</style>
    </section>
  );
}

function LogoSVG() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" role="img" xmlns="http://www.w3.org/2000/svg">
      <title>SignalReach AI</title>
      <circle className="outer-circle" cx="110" cy="110" r="80"
        fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <line className="ch-t" x1="110" y1="10"  x2="110" y2="38"  stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <line className="ch-b" x1="110" y1="182" x2="110" y2="210" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <line className="ch-l" x1="10"  y1="110" x2="38"  y2="110" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <line className="ch-r" x1="182" y1="110" x2="210" y2="110" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
      <circle className="inner-ring" cx="110" cy="110" r="60"
        fill="none" stroke="#000" strokeWidth="1.8" />
      <circle className="teal-bg" cx="110" cy="110" r="44" fill="#00C7B7" />
      <path className="bolt"
        fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        d="M122 80 L100 111 L115 111 L98 140 L132 103 L117 103 Z" />
      <circle className="orb-1" cx="172" cy="58"  r="7" fill="#00C7B7" />
      <circle className="orb-2" cx="186" cy="124" r="7" fill="#F97316" />
      <circle className="orb-3" cx="162" cy="175" r="7" fill="none" stroke="#000" strokeWidth="2" />
    </svg>
  );
}