import { Suspense } from 'react';
import { createServerClient } from '../../lib/supabase/client';
import Sidebar from '../../components/ui/sidebar';
import CampaignList from './CampaignList';

// Type definition based on Supabase schema
export type OutreachDraft = {
  id: string;
  company_id: string;
  recipient_name: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'replied' | 'archived';
  created_at: string;
  companies: { name: string } | null;
};

// Fetch outreach drafts from Supabase
async function getOutreachCampaigns(): Promise<OutreachDraft[]> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('outreach_drafts')
      .select('*, companies(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error.message);
      return [];
    }
    return (data as any) || [];
  } catch (error) {
    console.error('Failed to fetch from Supabase:', error);
    return [];
  }
}

export default async function OutreachPage() {
  const campaigns = await getOutreachCampaigns();

  return (
    <div className="min-h-screen flex bg-grid font-sans text-neo-black">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Suspense 
          fallback={
            <div className="flex-1 flex items-center justify-center p-10 font-bold text-lg">
              Loading campaigns...
            </div>
          }
        >
          {/* We pass the fetched data to our interactive Client Component */}
          <CampaignList initialCampaigns={campaigns} />
        </Suspense>
      </main>
    </div>
  );
}