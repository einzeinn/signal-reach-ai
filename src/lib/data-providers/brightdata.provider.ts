import { IDataProvider, JobSignal, RedditSignal, NewsSignal } from './types';
import { retryWithBackoff } from '../utils';
import { MockDataProvider } from './mock.provider';

const BRIGHTDATA_API_BASE = 'https://api.brightdata.com/datasets/v3';

async function triggerAndPoll<T>(
  datasetId: string,
  filters: Record<string, string>
): Promise<T[]> {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  if (!token) throw new Error('BRIGHTDATA_API_TOKEN is not set.');

  const operationStartTime = Date.now();
  const OPERATION_TIMEOUT_MS = 50000;

  const triggerRes = await retryWithBackoff(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
    3,
    500
  );

  const { snapshot_id } = await triggerRes.json() as { snapshot_id: string };
  console.log(`[BrightData] Triggered snapshot: ${snapshot_id}`);

  const MAX_POLLS = 25;
  const POLL_DELAY_MS = 2000;

  for (let i = 0; i < MAX_POLLS; i++) {
    const elapsedMs = Date.now() - operationStartTime;
    if (elapsedMs > OPERATION_TIMEOUT_MS) {
      throw new Error(`Bright Data scrape timed out after ${Math.round(elapsedMs / 1000)}s.`);
    }

    await new Promise((r) => setTimeout(r, POLL_DELAY_MS));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

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
        2,
        300
      );

      if (statusRes.status === 200) {
        console.log(`[BrightData] Snapshot completed after ${i + 1} polls`);
        return (await statusRes.json()) as T[];
      }

      if (statusRes.status === 202) {
        console.log(`[BrightData] Poll ${i + 1}/${MAX_POLLS}: Still processing...`);
        continue;
      }

      throw new Error(`Unexpected Bright Data status: ${statusRes.status}`);
    } catch (error) {
      console.warn(`[BrightData] Poll attempt ${i + 1} failed:`, error);
      if (i === MAX_POLLS - 1) throw error;
    }
  }

  throw new Error('Bright Data scrape timed out after maximum polling attempts.');
}

interface BrightDataJob {
  title: string;
  company_name: string;
  date_posted: string;
  description: string;
}

interface BrightDataReddit {
  title: string;
  selftext: string;
  subreddit: string;
  score: number;
}

interface BrightDataNews {
  title: string;
  description: string;
  date: string;
  url: string;
}

export class BrightDataProvider implements IDataProvider {
  private fallbackProvider: MockDataProvider;

  constructor() {
    this.fallbackProvider = new MockDataProvider();
  }

  // ← Dipindah ke method, bukan module level
  private getDatasetIds() {
    return {
      linkedinJobs: process.env.BRIGHTDATA_DATASET_LINKEDIN || '',
      reddit: process.env.BRIGHTDATA_DATASET_REDDIT || '',
      googleNews: process.env.BRIGHTDATA_DATASET_NEWS || '',
    };
  }

  private isConfigured(): boolean {
    const ids = this.getDatasetIds();
    if (!ids.linkedinJobs || !ids.reddit || !ids.googleNews) {
      console.warn('[BrightData Provider] Missing dataset IDs, falling back to mock.');
      return false;
    }
    if (!process.env.BRIGHTDATA_API_TOKEN) {
      console.warn('[BrightData Provider] Missing API token, falling back to mock.');
      return false;
    }
    return true;
  }

  private async withFallback<T>(
    apiCall: () => Promise<T[]>,
    mockFallback: () => Promise<T[]>
  ): Promise<T[]> {
    if (!this.isConfigured()) {
      return mockFallback();
    }
    try {
      return await apiCall();
    } catch (error) {
      console.warn('[BrightData Provider] API call failed, falling back to mock:', 
        error instanceof Error ? error.message : String(error));
      return mockFallback();
    }
  }

  async scrapeJobSignals(company: string): Promise<JobSignal[]> {
    return this.withFallback(
      async () => {
        const ids = this.getDatasetIds();
        const rows = await triggerAndPoll<BrightDataJob>(
          ids.linkedinJobs,
          { url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(company)}` }
        );
        return rows.map(r => ({
          role: r.title,
          postedAt: r.date_posted,
          rawText: r.description,
          source: 'LinkedIn',
        }));
      },
      () => this.fallbackProvider.scrapeJobSignals(company)
    );
  }

  async scrapeRedditPainPoints(topic: string): Promise<RedditSignal[]> {
    return this.withFallback(
      async () => {
        const ids = this.getDatasetIds();
        const rows = await triggerAndPoll<BrightDataReddit>(
          ids.reddit,
          { url: `https://www.reddit.com/search/?q=${encodeURIComponent(topic)}` }
        );
        return rows.map(r => ({
          subreddit: r.subreddit,
          title: r.title,
          body: r.selftext,
          upvotes: r.score,
        }));
      },
      () => this.fallbackProvider.scrapeRedditPainPoints(topic)
    );
  }

  async scrapeNewsSignals(company: string): Promise<NewsSignal[]> {
    return this.withFallback(
      async () => {
        const ids = this.getDatasetIds();
        const rows = await triggerAndPoll<BrightDataNews>(
          ids.googleNews,
          { url: `https://news.google.com/search?q=${encodeURIComponent(company + ' funding OR expansion OR growth')}` }
        );
        return rows.map(r => ({
          headline: r.title,
          summary: r.description,
          publishedAt: r.date,
          url: r.url,
        }));
      },
      () => this.fallbackProvider.scrapeNewsSignals(company)
    );
  }
}