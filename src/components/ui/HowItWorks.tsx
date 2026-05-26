'use client';
import { RadioTower, BrainCircuit, SendHorizontal } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: <RadioTower className="w-6 h-6" />,
    title: 'Monitor Signals',
    desc: 'Bright Data scrapes LinkedIn jobs, Reddit threads, and funding news in real time — across hundreds of target companies simultaneously.',
    tags: ['LinkedIn Jobs', 'Reddit Pain', 'News & Funding'],
    color: 'bg-[#FEF08A]',
  },
  {
    num: '02',
    icon: <BrainCircuit className="w-6 h-6 text-white" />,
    title: 'Score Intent',
    desc: 'Gemini AI triangulates all signals and returns a 0–100 buying intent score with reasoning — so you know exactly who to call first.',
    tags: ['Gemini 2.5 Flash', 'Multi-signal AI', '0–100 Score'],
    color: 'bg-[#00C7B7]',
  },
  {
    num: '03',
    icon: <SendHorizontal className="w-6 h-6 text-white" />,
    title: 'Reach Further',
    desc: 'One click generates a hyper-personalized cold email referencing real signals — hiring roles, Reddit complaints, recent news. No templates.',
    tags: ['Auto-personalized', 'Signal-referenced', 'Copy in 1 click'],
    color: 'bg-black',
  },
];

interface HowItWorksProps {
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
}

export default function HowItWorks({ onOpenAuth }: HowItWorksProps) {
  return (
    <section className="bg-white border-b-2 border-black relative overflow-hidden">

      {/* Halftone bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#00000008 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[4px] text-gray-400">
              How It Works
            </span>
            <h2
              className="text-[clamp(40px,6vw,72px)] font-black uppercase leading-none mt-2 text-black"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              FROM SIGNAL<br />
              <span className="text-[#00C7B7]">TO SIGNED.</span>
            </h2>
          </div>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed md:text-right">
            Three steps. Fully automated. Powered by Bright Data infrastructure and Gemini AI.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black bg-white">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`relative flex flex-col gap-5 p-8 ${
                i < STEPS.length - 1 ? 'border-b-2 md:border-b-0 md:border-r-2' : ''
              } border-black`}
            >
              {/* Step number — big background */}
              <span
                className="absolute top-4 right-6 text-[80px] font-black leading-none select-none pointer-events-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: 'transparent',
                  WebkitTextStroke: '1.5px #e5e7eb',
                }}
              >
                {step.num}
              </span>

              {/* Icon badge */}
              <div className={`w-12 h-12 ${step.color} border-2 border-black flex items-center justify-center shadow-[3px_3px_0_#000] relative z-10`}>
                {step.icon}
              </div>

              {/* Title */}
              <h3
                className={`text-2xl font-black uppercase relative z-10 ${step.color === 'bg-black' ? '' : 'text-black'}`}
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}
              >
                {step.title}
              </h3>

              {/* Desc */}
              <p className="text-sm text-gray-600 leading-relaxed flex-1 relative z-10">
                {step.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                {step.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-black uppercase tracking-wider border-2 border-black px-2 py-1 bg-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Arrow connector (desktop only, not last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border-2 border-black items-center justify-center shadow-[2px_2px_0_#000]">
                  <span className="text-black font-black text-sm leading-none">→</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-black p-8 bg-[#FEF08A] shadow-[6px_6px_0_#000]">
          <div>
            <p
              className="text-[clamp(24px,4vw,40px)] font-black uppercase leading-tight text-black"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Ready to find your<br />next 10 customers?
            </p>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              No setup. No manual research. Just signals, scores, and emails.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {/* Button changed to trigger Modal */}
            <button
              onClick={() => onOpenAuth?.('signup')}
              className="bg-black text-white border-2 border-black px-8 py-4 font-black text-sm uppercase tracking-wide shadow-[4px_4px_0_#00C7B7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#00C7B7] transition-none inline-block cursor-pointer"
            >
              Launch Dashboard →
            </button>
          </div>
        </div>

        {/* Powered by row */}
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-[3px] text-gray-400">Powered by</span>
          {['Bright Data', 'Gemini AI', 'Supabase', 'Next.js 16'].map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-black uppercase tracking-wider border border-gray-200 px-3 py-1 text-gray-500"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
      `}</style>
    </section>
  );
}