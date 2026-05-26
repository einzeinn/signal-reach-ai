// src/app/dashboard/page.tsx
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { getDataProvider } from '../../lib/data-providers';
import OutreachContainer from '../../components/signals/OutreachContainer';
import Sidebar from '../../components/ui/sidebar';
import { getDashboardLeads } from '../../lib/supabase/client';
import type { EnrichedLead } from '../../types/leads';

async function getEnrichedLeads(): Promise<EnrichedLead[]> {
  const provider = getDataProvider();
  const leads = await getDashboardLeads();

  return Promise.all(
    leads.map(async (lead) => {
      const [jobSignals, redditSignals] = await Promise.all([
        provider.scrapeJobSignals(lead.company_name),
        provider.scrapeRedditPainPoints(lead.company_name),
      ]);
      return {
        company_id:   lead.company_id,
        company_name: lead.company_name,
        intent_score: lead.intent_score,
        jobRole:      jobSignals[0]?.role   ?? null,
        jobSource:    jobSignals[0]?.source ?? null,
        redditSub:    redditSignals[0]?.subreddit ?? null,
      };
    })
  );
}

export default async function Dashboard() {
  const leads = await getEnrichedLeads();

  return (
    <div className="min-h-screen flex bg-grid font-sans text-neo-black">
      {/* SIDEBAR Component */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Suspense fallback={<div className="p-8 text-center font-bold">Loading dashboard data...</div>}>
          <OutreachContainer leads={leads} />
        </Suspense>
      </main>
    </div>
  );
}