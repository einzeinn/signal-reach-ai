'use client';

import { useState, useEffect, useRef } from 'react';
import { Zap, Mail, Copy, Check, RefreshCw, Terminal, AlertTriangle, Briefcase, MessageSquare, Newspaper, Edit3 } from 'lucide-react';

interface OutreachPanelProps {
  company: string;
}

export default function OutreachPanel({ company }: OutreachPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailData, setEmailData] = useState<{ subject: string; body: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Effect on company change: Reset panel when user clicks another company
  useEffect(() => {
    setEmailData(null);
    setError(null);
    setLogs([]);
  }, [company]);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setEmailData(null);
    setLogs([`> Initializing outreach sequence for ${company}...`]);

    try {
      // 1. Log UI Updates (to make it look sophisticated)
      setTimeout(() => setLogs(prev => [...prev, `> Fetching live signals via Bright Data...`]), 600);
      setTimeout(() => setLogs(prev => [...prev, `> Finding Reddit pain points & hiring trends...`]), 1500);
      setTimeout(() => setLogs(prev => [...prev, `> Analyzing sentiment with Gemini AI...`]), 2500);
      setTimeout(() => setLogs(prev => [...prev, `> Crafting hyper-personalized B2B email draft...`]), 3500);

      // 2. Calling our actual Outreach API
      const response = await fetch('/api/outreach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyId: `comp-${Date.now()}`, // Temporary dummy ID
          companyName: company 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP Error ${response.status}`);
      }

      setLogs(prev => [...prev, `> ✅ Successfully created! Loading workspace...`]);
      
      // Wait a moment for the terminal effect to be readable
      await new Promise(resolve => setTimeout(resolve, 800));

      // 3. Set result from Gemini/Database to UI
      setEmailData({
        subject: result.data.subject,
        body: result.data.body
      });

    } catch (err) {
      console.error('[OutreachPanel] Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (emailData) {
      navigator.clipboard.writeText(`${emailData.subject}\n\n${emailData.body}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border-2 border-neo-black shadow-comic flex flex-col h-full overflow-hidden relative">
      <div className="bg-neo-black text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-neo-yellow fill-current" />
          <h3 className="font-black uppercase tracking-wide">AI Email Workspace</h3>
        </div>
        <span className="text-[10px] font-bold bg-white text-neo-black px-2 py-0.5 border border-neo-black">
          {company}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-neo-white relative flex flex-col">
        {/* STATE 1: IDLE */}
        {!isLoading && !emailData && !error && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-70">
            <div className="w-16 h-16 border-2 border-neo-black bg-neo-yellow flex items-center justify-center mb-4 shadow-[4px_4px_0_#000]">
              <Mail className="w-8 h-8 text-neo-black" />
            </div>
            <p className="font-black uppercase text-gray-500">Ready to Generate</p>
            <p className="text-xs font-bold text-gray-400 mt-2 max-w-[200px]">
              Click the button below to create a hyper-personalized B2B email based on live signals.
            </p>
          </div>
        )}

        {/* STATE 2: LOADING (Terminal) */}
        {isLoading && (
          <div className="flex-1 bg-white p-4 font-mono text-xs text-gray-600 overflow-y-auto flex flex-col gap-1" ref={scrollRef}>
            <div className="flex items-center gap-2 mb-2 text-neo-black border-b-2 border-dashed border-gray-200 pb-2 font-bold">
              <Terminal className="w-4 h-4" /> System Terminal
            </div>
            {logs.map((log, i) => <div key={i} className="animate-[fadeIn_0.2s_ease_forwards]">{log}</div>)}
            <div className="animate-pulse mt-2 font-black text-neo-teal">_</div>
          </div>
        )}

        {/* STATE 3: ERROR */}
        {error && !isLoading && (
          <div className="m-4 border-2 border-neo-black bg-red-50 p-3 shadow-comic">
            <p className="text-xs font-black text-red-700 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Generation Failed
            </p>
            <p className="text-[11px] font-mono text-red-600">{error}</p>
          </div>
        )}

        {/* STATE 4: SUCCESS */}
        {emailData && !isLoading && (
          <div className="p-6 flex flex-col gap-6 animate-[fadeIn_0.3s_ease_forwards]">
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-500">
                <Edit3 className="w-3 h-3" /> Email Subject
              </label>
              <input
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full border-2 border-neo-black p-3 font-bold text-sm bg-white shadow-[2px_2px_0_#000] focus:ring-2 focus:ring-neo-teal outline-none"
              />
            </div>
            
            <div className="space-y-2 flex-1">
              <label className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-500">
                <Edit3 className="w-3 h-3" /> Email Content
              </label>
              <textarea
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                className="w-full h-72 border-2 border-neo-black p-4 text-xs md:text-sm font-medium bg-white shadow-[2px_2px_0_#000] focus:ring-2 focus:ring-neo-teal outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {emailData && !isLoading && (
        <div className="relative z-10 border-t-2 border-dashed border-gray-200 bg-white px-4 py-2 flex gap-2 flex-wrap shrink-0">
          <span className="text-[9px] font-black bg-neo-yellow border border-black px-1.5 py-0.5 shadow-[1px_1px_0_#000]">JOB SIGNALS</span>
          <span className="text-[9px] font-black bg-neo-teal border border-black px-1.5 py-0.5 shadow-[1px_1px_0_#000]">REDDIT PAIN POINTS</span>
        </div>
      )}

      <div className="p-4 border-t-2 border-neo-black bg-white flex items-center justify-between gap-3 shrink-0">
        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className={`flex-1 border-2 border-neo-black py-2.5 px-4 font-black text-sm uppercase flex justify-center items-center gap-2 transition-all ${
            isLoading 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none translate-x-[3px] translate-y-[3px]' 
              : 'bg-neo-teal text-neo-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#000] shadow-[3px_3px_0_#000]'
          }`}
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
          {isLoading ? 'PROCESSING WITH AI...' : (emailData ? 'RECREATE' : 'CREATE WITH AI')}
        </button>

        {emailData && (
          <button 
            onClick={handleCopy}
            className="w-12 h-11 border-2 border-neo-black bg-neo-yellow flex items-center justify-center shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all"
          >
            {isCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}