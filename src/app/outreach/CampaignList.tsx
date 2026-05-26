'use client';

import { useState } from 'react';
import { Mail, Send, FileEdit, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import Link from 'next/link';
import type { OutreachDraft } from './page';

export default function CampaignList({ initialCampaigns }: { initialCampaigns: OutreachDraft[] }) {
  const [campaigns, setCampaigns] = useState<OutreachDraft[]>(initialCampaigns);
  const [toast, setToast] = useState<string | null>(null);

  const handleSend = (id: string) => {
    // Optimistic UI Update: Change status to 'sent' immediately
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'sent' } : c));
    
    // Trigger Toast Notification
    setToast('Email sent successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const totalDrafts = campaigns.filter(c => c.status === 'draft').length;
  const totalSent = campaigns.filter(c => c.status === 'sent').length;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-[floatIn_0.3s_ease_forwards]">
          <div className="bg-neo-teal border-2 border-neo-black p-4 shadow-[4px_4px_0_#000] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-neo-black" />
            <span className="font-black text-sm uppercase text-neo-black">{toast}</span>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="p-4 md:p-8 md:pb-4 shrink-0 bg-neo-white">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-2 border-neo-black bg-neo-yellow p-4 shadow-comic gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase">Campaign Manager</h2>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-white border-2 border-neo-black px-3 py-2 md:py-1 text-xs font-bold shadow-[2px_2px_0_#000] flex items-center justify-center gap-2">
              <FileEdit className="w-4 h-4 md:w-3 md:h-3 text-blue-500" /> {totalDrafts} Drafts
            </div>
            <div className="flex-1 md:flex-none bg-neo-teal border-2 border-neo-black px-3 py-2 md:py-1 text-xs font-bold shadow-[2px_2px_0_#000] flex items-center justify-center gap-2">
              <Send className="w-4 h-4 md:w-3 md:h-3 text-white" /> {totalSent} Sent
            </div>
          </div>
        </header>
      </div>

      {/* Scrollable List Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 pt-2">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          
          {/* Empty State */}
          {campaigns.length === 0 && (
            <div className="border-2 border-dashed border-neo-black bg-white p-12 text-center shadow-comic flex flex-col items-center justify-center">
              <div className="bg-neo-yellow border-2 border-neo-black p-4 mb-4 shadow-[4px_4px_0_#000]">
                <Mail className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-2">No Campaigns Yet</h3>
              <p className="text-gray-600 font-bold mb-6 max-w-md">
                You haven't generated any AI outreach emails yet. Go to the Target Leads dashboard to analyze signals and draft your first email.
              </p>
              <Link 
                href="/dashboard"
                className="bg-neo-teal border-2 border-neo-black px-6 py-3 font-black text-sm uppercase shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all flex items-center gap-2"
              >
                Go to Target Leads <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Grid List */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {campaigns.map((campaign) => {
              const isSent = campaign.status === 'sent';
              
              return (
                <div key={campaign.id} className="border-2 border-neo-black bg-white shadow-comic flex flex-col hover:-translate-y-1 hover:shadow-comic-hover transition-transform">
                  <div className="border-b-2 border-neo-black p-3 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] md:text-xs font-black uppercase bg-neo-black text-white px-2 py-0.5">
                        {campaign.companies?.name || 'Unknown Company'}
                      </span>
                      <span className="text-[10px] md:text-xs font-bold text-gray-500">
                        To: {campaign.recipient_name}
                      </span>
                    </div>
                    
                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-neo-black flex items-center gap-1 ${
                      isSent ? 'bg-neo-teal text-black' : 'bg-neo-yellow'
                    }`}>
                      {isSent ? <CheckCircle2 className="w-3 h-3" /> : <FileEdit className="w-3 h-3" />}
                      {campaign.status}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs font-black uppercase text-gray-400 mb-1">Subject</p>
                    <h4 className="font-bold text-sm md:text-base mb-3 line-clamp-1 border-b-2 border-dashed border-gray-200 pb-2">
                      {campaign.subject}
                    </h4>
                    
                    <div className="flex-1 bg-gray-50 border border-gray-200 p-3 overflow-hidden relative">
                      <p className="text-xs md:text-sm font-medium text-gray-600 whitespace-pre-wrap line-clamp-4">
                        {campaign.body}
                      </p>
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
                    </div>
                  </div>

                  <div className="border-t-2 border-neo-black p-3 bg-white flex justify-between items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400">
                      Gen: {formatDate(campaign.created_at)}
                    </span>
                    
                    <div className="flex gap-2">
                      <button className="border-2 border-neo-black bg-white px-3 py-1.5 text-[10px] md:text-xs font-black shadow-[2px_2px_0_#000] hover:bg-gray-100 flex items-center gap-1 cursor-pointer">
                        <FileEdit className="w-3 h-3" /> Edit
                      </button>
                      {!isSent && (
                        <button 
                          onClick={() => handleSend(campaign.id)}
                          className="border-2 border-neo-black bg-neo-teal px-3 py-1.5 text-[10px] md:text-xs font-black shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" /> Send
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}