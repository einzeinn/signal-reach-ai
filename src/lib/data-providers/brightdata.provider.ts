// src/lib/data-providers/brightdata.provider.ts
// Bright Data implementation of IDataProvider.
// This replaces MockDataProvider on hackathon demo day.
//
// SETUP GUIDE:
// 1. Login to brightdata.com → go to "Proxies & Scraping Infrastructure"
// 2. Create a "Web Scraper API" dataset for: LinkedIn Jobs, Reddit, Google News
// 3. Copy your API token to .env.local as BRIGHTDATA_API_TOKEN
// 4. In index.ts, set DATA_PROVIDER=brightdata in your environment

import { IDataProvider, JobSignal, RedditSignal, NewsSignal } from './types';
import { retryWithBackoff } from '../utils';

const BRIGHTDATA_API_BASE = 'https://api.brightdata.com/datasets/v3';

// These Dataset IDs come from your Bright Data dashboard.
// Replace with your actual dataset IDs after creating them.
const DATASET_IDS = {
  linkedinJobs : process.env.BRIGHTDATA_DATASET_LINKEDIN  ?? 'gd_lpfll7v5hcjjljdl7m', // example ID
  reddit       : process.env.BRIGHTDATA_DATASET_REDDIT    ?? 'gd_lvz8ah06192smhhc',   // example ID
  googleNews   : process.env.BRIGHTDATA_DATASET_NEWS      ?? 'gd_lk538t2k2p1k3oos71', // example ID
};

/**
 * Triggers a Bright Data snapshot (scrape job) and polls until complete.
 * Includes exponential backoff retry logic for resilience.
 * Returns the resulting dataset rows.
 */
async function triggerAndPoll<T>(
  datasetId: string,
  filters: Record<string, string>
): Promise<T[]> {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  if (!token) throw new Error('BRIGHTDATA_API_TOKEN is not set.');

  // Step 1: Trigger a new snapshot with retry logic
  const triggerRes = await retryWithBackoff(
    async () => {
      const response = await fetch(
        `${BRIGHTDATA_API_BASE}/trigger?dataset_id=${datasetId}&include_errors=true`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([filters]),
        }
      );
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Bright Data trigger failed (${response.status}): ${errText}`);
      }
      return response;
    },
    3,
    500
  );

  const { snapshot_id } = await triggerRes.json() as { snapshot_id: string };

  // Step 2: Poll for completion with retry logic (max 60 seconds, every 3 seconds)
  const MAX_POLLS = 20;
  const POLL_DELAY = 3000;

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_DELAY));

    try {
      const statusRes = await retryWithBackoff(
        async () => {
          return fetch(
            `${BRIGHTDATA_API_BASE}/snapshot/${snapshot_id}?format=json`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        },
        2,
        500
      );

      if (statusRes.status === 200) {
        // Data is ready
        const rows = (await statusRes.json()) as T[];
        return rows;
      }

      if (statusRes.status === 202) {
        // Still processing — continue polling
        continue;
      }

      throw new Error(`Unexpected Bright Data status: ${statusRes.status}`);
    } catch (error) {
      console.warn(`Poll attempt ${i + 1} failed:`, error);
      if (i === MAX_POLLS - 1) throw error;
    }
  }

  throw new Error('Bright Data scrape timed out after 60 seconds.');
}

// ─────────────────────────────────────────────────────────
// Raw response shapes from Bright Data (adjust to match
// your actual dataset schema in the BD dashboard)
// ─────────────────────────────────────────────────────────
interface BrightDataJob {
  title       : string;
  company_name: string;
  date_posted : string;
  description : string;
  job_posting_url?: string;
}

interface BrightDataReddit {
  title     : string;
  selftext  : string;
  subreddit : string;
  score     : number;
}

interface BrightDataNews {
  title      : string;
  description: string;
  date       : string;
  url        : string;
}

// ─────────────────────────────────────────────────────────
// Provider Implementation
// ─────────────────────────────────────────────────────────
export class BrightDataProvider implements IDataProvider {

  async scrapeJobSignals(company: string): Promise<JobSignal[]> {
    const rows = await triggerAndPoll<BrightDataJob>(
      DATASET_IDS.linkedinJobs,
      { keyword: company, location: 'Worldwide' }
    );

    // Map Bright Data schema → our internal JobSignal schema
    return rows.map(r => ({
      role    : r.title,
      postedAt: r.date_posted,
      rawText : r.description,
      source  : 'LinkedIn',
    }));
  }

  async scrapeRedditPainPoints(topic: string): Promise<RedditSignal[]> {
    const rows = await triggerAndPoll<BrightDataReddit>(
      DATASET_IDS.reddit,
      { keyword: topic }
    );

    // Map Bright Data schema → our internal RedditSignal schema
    return rows.map(r => ({
      subreddit: r.subreddit,
      title    : r.title,
      body     : r.selftext,
      upvotes  : r.score,
    }));
  }

  async scrapeNewsSignals(company: string): Promise<NewsSignal[]> {
    const rows = await triggerAndPoll<BrightDataNews>(
      DATASET_IDS.googleNews,
      { keyword: `${company} funding OR expansion OR growth` }
    );

    // Map Bright Data schema → our internal NewsSignal schema
    return rows.map(r => ({
      headline   : r.title,
      summary    : r.description,
      publishedAt: r.date,
      url        : r.url,
    }));
  }
}
