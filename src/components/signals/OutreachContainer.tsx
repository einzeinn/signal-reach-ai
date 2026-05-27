'use client';

import { useState, useRef } from 'react';
import { Database, Search, X, CheckCircle2, Flame, AlertTriangle, Loader2 } from 'lucide-react';
import OutreachPanel from './OutreachPanel';
import type { EnrichedLead } from '../../types/leads';
import { resolveScore, scoreBg } from '../../lib/utils';

export default function OutreachContainer({ leads }: { leads: EnrichedLead[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localLeads, setLocalLeads] = useState<EnrichedLead[]>(leads);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [loadingCompanies, setLoadingCompanies] = useState<Set<string>>(new Set());

  const filteredLeads = localLeads.filter(lead => 
    lead.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedCompany, setSelectedCompany] = useState<string>(
     localLeads[0]?.company_name ?? 'Similarweb'
  );

  const panelRef = useRef<HTMLDivElement>(null);

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetName.trim()) return;

    const targetCompany = newTargetName.trim();
    const tempId = `temp-id-${Date.now()}`;

    // Optimistic UI: show card immediately with loading state
    const newLead: EnrichedLead = {
      company_id: tempId,
      company_name: targetCompany,
      intent_score: null,
      jobRole: null,
      jobSource: null,
      redditSub: null,
    };

    setLocalLeads(prev => [newLead, ...prev]);
    handleSelectCompany(targetCompany);
    setIsModalOpen(false);
    setNewTargetName('');
    setLoadingCompanies(prev => new Set(prev).add(tempId));

    showToast(`Scraping live signals for "${targetCompany}"...`);

    try {
      const res = await fetch(`/api/signals?company=${encodeURIComponent(targetCompany)}`);
      
      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }
      
      const data = await res.json();
      
      const job = data.signals?.jobs?.[0] ?? null;
      const reddit = data.signals?.reddit?.[0] ?? null;

      // Update card with real signal data (or null if nothing found — not an error)
      setLocalLeads(prev => prev.map(lead => 
        lead.company_id === tempId 
          ? {
              ...lead,
              jobRole: job?.role ?? null,
              jobSource: job?.source ?? null,
              redditSub: reddit?.subreddit ?? null,
            }
          : lead
      ));

      const hasSignals = job || reddit;
      showToast(hasSignals ? `✅ Signals found for ${targetCompany}!` : `No signals found for ${targetCompany} yet.`);

    } catch (error) {
      console.error('[handleAddTarget] Signal fetch failed:', error);

      // On error: reset signal fields to null (not an error string)
      // The card will show "Waiting for signals..." which is accurate
      setLocalLeads(prev => prev.map(lead => 
        lead.company_id === tempId 
          ? { ...lead, jobRole: null, jobSource: null, redditSub: null }
          : lead
      ));

      showToast(`⚠️ Could not fetch signals for "${targetCompany}". Try again later.`);
    } finally {
      setLoadingCompanies(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectCompany = (companyName: string) => {
    setSelectedCompany(companyName);
    if (window.innerWidth < 1024 && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-[floatIn_0.3s_ease_forwards]">
          <div className="bg-neo-yellow border-2 border-neo-black p-4 shadow-[4px_4px_0_#000] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-black text-sm uppercase">{toastMessage}</span>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-4 border-neo-black p-6 md:p-8 shadow-[8px_8px_0_#000] max-w-md w-full relative animate-[popIn_0.2s_ease_forwards]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-neo-yellow border-2 border-neo-black w-8 h-8 flex items-center justify-center hover:bg-neo-black hover:text-white transition-colors shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-black uppercase mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>
              Add New Target
            </h2>
            <p className="text-sm font-bold text-gray-600 mb-6">
              Enter a company name. SignalReach will immediately start monitoring the web for buying signals via Bright Data.
            </p>
            <form onSubmit={handleAddTarget} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase">Company Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required 
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  className="border-2 border-neo-black p-3 outline-none focus:bg-neo-yellow/20 transition-colors font-bold text-sm" 
                  placeholder="e.g. OpenAI, Stripe, Vercel" 
                />
              </div>
              <button 
                type="submit" 
                className="mt-2 bg-neo-teal border-2 border-neo-black p-4 font-black uppercase text-sm shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex justify-center gap-2"
              >
                Start Monitoring <Database className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8 pb-4 shrink-0">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-2 border-neo-black bg-white p-4 shadow-comic">
          <div className="flex items-center gap-2 w-full md:w-1/3 border-b-2 md:border-b-0 md:border-r-2 border-neo-black md:pr-4 pb-2 md:pb-0">
            <Search className="w-5 h-5 text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Search targets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none font-medium bg-transparent text-sm"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-neo-teal border-2 border-neo-black px-4 py-2 font-bold shadow-comic active:shadow-comic-hover active:translate-x-[2px] active:translate-y-[2px] transition-all hover:bg-[#00b3a4]"
          >
            + Add Target
          </button>
        </header>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-2">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 items-start">
          
          <div 
            ref={panelRef}
            className="order-first lg:order-last w-full lg:sticky lg:top-2 h-[450px] lg:h-[calc(100vh-200px)] lg:col-span-1 z-10 mb-2 lg:mb-0 scroll-mt-4"
          >
            <OutreachPanel company={selectedCompany} />
          </div>

          <section className="order-last lg:order-first w-full lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-black uppercase flex items-center gap-2">
                <Flame className="w-5 h-5 md:w-6 md:h-6 text-[#00C7B7] fill-current" /> Hot Leads
              </h2>
              <span className="bg-neo-yellow border-2 border-neo-black px-3 py-1 text-[10px] md:text-xs font-bold flex items-center gap-2 shadow-comic">
                <Database className="w-3 h-3 md:w-4 md:h-4" /> {filteredLeads.length} leads
              </span>
            </div>

            {filteredLeads.length === 0 && (
              <div className="border-2 border-dashed border-neo-black p-10 text-center text-gray-400 font-bold bg-white shadow-comic">
                No matching targets found.
              </div>
            )}

            {filteredLeads.map((lead) => {
              const score = resolveScore(lead);
              const isSelected = lead.company_name === selectedCompany;
              const isLoading = loadingCompanies.has(lead.company_id);

              return (
                <div
                  key={lead.company_id}
                  onClick={() => handleSelectCompany(lead.company_name)}
                  className={`border-2 border-neo-black bg-white p-4 md:p-5 shadow-comic flex justify-between items-center hover:-translate-y-1 hover:shadow-comic-hover transition-transform cursor-pointer ${
                    isSelected ? 'bg-neo-teal' : ''
                  }`}
                >
                  <div className="pr-4 flex-1">
                    <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                      {lead.company_name}
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
                    </h3>
                    
                    {isLoading ? (
                      <p className="font-medium text-gray-500 mt-1 italic text-[10px] md:text-xs animate-pulse">
                        Scraping the web for live signals (approx. 5-10s)...
                      </p>
                    ) : lead.jobRole ? (
                      <p className="font-medium text-gray-600 mt-1 text-xs md:text-sm">
                        Hiring: <span className="font-bold text-neo-black">{lead.jobRole}</span>
                      </p>
                    ) : (
                      <p className="font-medium text-gray-500 mt-1 italic text-[10px] md:text-xs">
                        Waiting for signals...
                      </p>
                    )}
                    
                    {!isLoading && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {lead.jobSource && (
                          <span className="text-[10px] md:text-xs font-bold bg-white border-2 border-neo-black px-2 py-1">
                            {lead.jobSource} Signal
                          </span>
                        )}
                        {lead.redditSub && (
                          <span className="text-[10px] md:text-xs font-bold bg-white border-2 border-neo-black px-2 py-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 md:w-3.5 md:h-3.5" /> Pain on {lead.redditSub}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 ${scoreBg(score)} border-2 border-neo-black rounded-full shadow-comic shrink-0`}>
                    <span className="text-[10px] md:text-sm font-bold">Score</span>
                    <span className="text-xl md:text-2xl font-black">
                      {isLoading ? '-' : score}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>

        </div>
      </div>
    </div>
  );
}