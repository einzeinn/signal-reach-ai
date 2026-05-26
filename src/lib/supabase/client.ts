// src/lib/supabase/client.ts

import type { DashboardLead } from '../../types/leads';

interface SupabaseClientOptions {
  auth?: { persistSession?: boolean; autoRefreshToken?: boolean };
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars.\n' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }
  return { url, anonKey };
}

export async function createBrowserClient() {
  const { createClient } = await import('@supabase/supabase-js');
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  } as SupabaseClientOptions);
}

export async function createServerClient() {
  const { createClient } = await import('@supabase/supabase-js');
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  } as SupabaseClientOptions);
}

export async function getDashboardLeads(): Promise<DashboardLead[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('[supabase] env vars not set — returning empty leads');
    return [];
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('dashboard_leads')
    .select('*');

  if (error) throw new Error(`getDashboardLeads: ${error.message}`);
  return (data ?? []) as DashboardLead[];
}

export async function saveOutreachDraft(draft: {
  companyId:      string;
  recipientName:  string;
  recipientEmail?: string;
  subject:        string;
  body:           string;
  intentScoreId?: string | null;
}) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('outreach_drafts')
    .insert({
      company_id:      draft.companyId,
      recipient_name:  draft.recipientName,
      recipient_email: draft.recipientEmail ?? null,
      subject:         draft.subject,
      body:            draft.body,
      intent_score_id: draft.intentScoreId ?? null,
      status:          'draft',
    })
    .select()
    .single();

  if (error) throw new Error(`saveOutreachDraft: ${error.message}`);
  return data;
}