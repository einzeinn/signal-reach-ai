export interface DashboardLead {
  company_id: string;
  company_name: string;
  intent_score: number | null;
}

export interface EnrichedLead extends DashboardLead {
  jobRole: string | null;
  jobSource: string | null;
  redditSub: string | null;
}
