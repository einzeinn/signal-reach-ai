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
import { MockDataProvider } from './mock.provider';

const BRIGHTDATA_API_BASE = 'https://api.brightdata.com/datasets/v3';

// These Dataset IDs come from your Bright Data dashboard.
// Replace with your actual dataset IDs after creating them.
const DATASET_IDS = {
  linkedinJobs : process.env.BRIGHTDATA_DATASET_LINKEDIN  || '',
  reddit       : process.env.BRIGHTDATA_DATASET_REDDIT    || '',
  googleNews   : process.env.BRIGHTDATA_DATASET_NEWS      || '',
};

// Validate dataset IDs are configured
function validateDatasets() {
  if (!DATASET_IDS.linkedinJobs || !DATASET_IDS.reddit || !DATASET_IDS.googleNews) {
    console.warn(
      '[BrightData Provider] Missing dataset IDs. Please configure:\n' +
      '  - BRIGHTDATA_DATASET_LINKEDIN\n' +
      '  - BRIGHTDATA_DATASET_REDDIT\n' +
      '  - BRIGHTDATA_DATASET_NEWS\n' +
      'in your .env.local file. Falling back to mock provider.'
    );
    return false;
  }
  return true;
}

/**
 * Triggers a Bright Data snapshot (scrape job) and polls until complete.
 * Includes exponential backoff retry logic for resilience.
 * Returns the resulting dataset rows.
 * WARNING: Wrapped with aggressive timeout (15 seconds) to prevent Vercel timeouts.
 */
async function triggerAndPoll<T>(
  datasetId: string,
  filters: Record<string, string>
): Promise<T[]> {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  if (!token) throw new Error('BRIGHTDATA_API_TOKEN is not set.');

  // Wrap entire operation in a 15-second timeout for Vercel compatibility
  const timeoutPromise = new Promise<T[]>((_, reject) =>
    setTimeout(() => reject(new Error('Bright Data API timeout after 15 seconds')), 15000)
  );

  const apiPromise = (async () => {
    // Step 1: Trigger a new snapshot with retry logic
    const triggerRes = await retryWithBackoff(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second fetch timeout

        try {
          const response = await fetch(
            `${BRIGHTDATA_API_BASE}/trigger?dataset_id=${datasetId}&include_errors=true`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify([filters]),
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Bright Data trigger failed (${response.status}): ${errText}`);
          }
          return response;
        } catch (e) {
          clearTimeout(timeoutId);
          throw e;
        }
      },
      2,
      500
    );

    const { snapshot_id } = await triggerRes.json() as { snapshot_id: string };

    // Step 2: Poll for completion with aggressive timeout (max 10 seconds total polling)
    const MAX_POLLS = 3; // Only 3 polls instead of 20
    const POLL_DELAY = 2000; // 2 seconds between polls

    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, POLL_DELAY));

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second fetch timeout

        const statusRes = await retryWithBackoff(
          async () => {
            try {
              return await fetch(
                `${BRIGHTDATA_API_BASE}/snapshot/${snapshot_id}?format=json`,
                {
                  headers: { 'Authorization': `Bearer ${token}` },
                  signal: controller.signal,
                }
              );
            } finally {
              clearTimeout(timeoutId);
            }
          },
          1,
          300
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

    throw new Error('Bright Data scrape timed out after polling.');
  })();

  return Promise.race([apiPromise, timeoutPromise]);
}

// ─────────────────────────────────────────────────────────
// Raw response shapes from Bright Data
// ─────────────────────────────────────────────────────────
interface BrightDataJob {
  title        : string;
  company_name: string;
  date_posted : string;
  description : string;
  job_posting_url?: string;
}

interface BrightDataReddit {
  title      : string;
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
  private fallbackProvider: MockDataProvider;
  private isConfiguredProperly: boolean;

  constructor() {
    this.fallbackProvider = new MockDataProvider();
    this.isConfiguredProperly = validateDatasets();
  }

  private async withFallback<T>(
    apiCall: () => Promise<T[]>,
    mockFallback: () => Promise<T[]>
  ): Promise<T[]> {
    if (!this.isConfiguredProperly) {
      console.info('[BrightData Provider] Using mock data due to missing dataset IDs');
      return mockFallback();
    }

    try {
      return await apiCall();
    } catch (error) {
      console.warn(
        '[BrightData Provider] API call failed, falling back to mock data:',
        error instanceof Error ? error.message : String(error)
      );
      return mockFallback();
    }
  }

  async scrapeJobSignals(company: string): Promise<JobSignal[]> {
    return this.withFallback(
      async () => {
        const rows = await triggerAndPoll<BrightDataJob>(
          DATASET_IDS.linkedinJobs,
          // CHANGED: Using URL format for LinkedIn Jobs
          { url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(company)}` }
        );
        return rows.map(r => ({
          role    : r.title,
          postedAt: r.date_posted,
          rawText : r.description,
          source  : 'LinkedIn',
        }));
      },
      () => this.fallbackProvider.scrapeJobSignals(company)
    );
  }

  async scrapeRedditPainPoints(topic: string): Promise<RedditSignal[]> {
    return this.withFallback(
      async () => {
        const rows = await triggerAndPoll<BrightDataReddit>(
          DATASET_IDS.reddit,
          // CHANGED: Using URL format for Reddit
          { url: `https://www.reddit.com/search/?q=${encodeURIComponent(topic)}` }
        );
        return rows.map(r => ({
          subreddit: r.subreddit,
          title    : r.title,
          body     : r.selftext,
          upvotes  : r.score,
        }));
      },
      () => this.fallbackProvider.scrapeRedditPainPoints(topic)
    );
  }

  async scrapeNewsSignals(company: string): Promise<NewsSignal[]> {
    return this.withFallback(
      async () => {
        const rows = await triggerAndPoll<BrightDataNews>(
          DATASET_IDS.googleNews,
          // CHANGED: Using URL format for Google News
          { url: `https://news.google.com/search?q=${encodeURIComponent(company + ' funding OR expansion OR growth')}` }
        );
        return rows.map(r => ({
          headline   : r.title,
          summary    : r.description,
          publishedAt: r.date,
          url        : r.url,
        }));
      },
      () => this.fallbackProvider.scrapeNewsSignals(company)
    );
  }
}