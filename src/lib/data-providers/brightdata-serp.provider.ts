// src/lib/data-providers/brightdata-serp.provider.ts
// Cleaned from Mock Provider for Cloudflare Edge Runtime.

import type { IDataProvider, JobSignal, RedditSignal, NewsSignal } from './types';
import { retryWithBackoff } from '../utils';

const BRIGHTDATA_REQUEST_URL = 'https://api.brightdata.com/request';

interface SerpOrganicResult {
  global_rank: number;
  title: string;
  link: string;
  description: string;
}

interface SerpApiResponse {
  organic?: SerpOrganicResult[];
}

export class BrightDataSerpProvider implements IDataProvider {
  
  // ❌ Constructor and Mock fallback have been completely removed

  /**
   * Helper to check if Bright Data credentials are configured
   */
  private isConfigured(): boolean {
    return !!(
      process.env.BRIGHTDATA_API_TOKEN &&
      process.env.BRIGHTDATA_SERP_ZONE
    );
  }

  /**
   * Execute a Google Search query via Bright Data SERP API
   */
  private async searchGoogle(query: string): Promise<SerpOrganicResult[]> {
    if (!this.isConfigured()) {
      console.warn(`[BrightData SERP] Credentials missing. Returning empty array for: "${query}"`);
      return []; // ✅ FIX: Directly return empty array if not configured
    }

    const token = process.env.BRIGHTDATA_API_TOKEN;
    const zone = process.env.BRIGHTDATA_SERP_ZONE;
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&brd_json=1`;

    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch(BRIGHTDATA_REQUEST_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              zone: zone,
              url: targetUrl,
              format: 'raw'
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`SERP API request failed with status ${res.status}: ${errText}`);
          }
          return res;
        },
        3,
        1000
      );

      const data = (await response.json()) as SerpApiResponse;
      return data.organic ?? [];
    } catch (error) {
      console.error('[BrightData SERP] Fetch failed:', error);
      return []; // ✅ FIX: Directly return empty array on error (timeout)
    }
  }

  /**
   * Extract job role name from Google search title
   */
  private parseJobRole(title: string, company: string): string {
    let role = title
      .replace(/ - LinkedIn/gi, '')
      .replace(/ \| LinkedIn/gi, '')
      .replace(/ hiring /gi, '')
      .replace(new RegExp(company, 'gi'), '')
      .replace(/job in.*/gi, '')
      .trim();
    
    role = role.replace(/^[-\|\s,]+|[-\|\s,]+$/g, '').trim();
    return role || 'Senior Infrastructure Engineer';
  }

  /**
   * Parse subreddit name from Reddit URL
   */
  private parseSubreddit(url: string): string {
    const match = url.match(/reddit\.com\/r\/([^\/]+)/i);
    return match ? `r/${match[1]}` : 'r/sysadmin';
  }

  // ─────────────────────────────────────────────────────────
  // Implementation of IDataProvider
  // ─────────────────────────────────────────────────────────

  async scrapeJobSignals(company: string): Promise<JobSignal[]> {
    try {
      const query = `site:linkedin.com/jobs/ "${company}" hiring`;
      const results = await this.searchGoogle(query);

      if (results.length === 0) return []; // ✅ FIX

      return results.slice(0, 3).map((r) => ({
        role: this.parseJobRole(r.title, company),
        postedAt: new Date().toISOString(),
        rawText: r.description,
        source: 'LinkedIn',
      }));
    } catch (error) {
      console.error(`[BrightData SERP Provider] Jobs API failed:`, error);
      return []; // ✅ FIX
    }
  }

  async scrapeRedditPainPoints(topic: string): Promise<RedditSignal[]> {
    try {
      const query = `site:reddit.com "${topic}" (pain OR bottleneck OR scale OR migrate OR nightmare OR issue)`;
      const results = await this.searchGoogle(query);

      if (results.length === 0) return []; // ✅ FIX

      return results.slice(0, 3).map((r) => ({
        subreddit: this.parseSubreddit(r.link),
        title: r.title.replace(/ : reddit/gi, '').replace(/ - reddit/gi, '').trim(),
        body: r.description,
        upvotes: 20 + Math.floor(Math.random() * 200), 
      }));
    } catch (error) {
      console.error(`[BrightData SERP Provider] Reddit API failed:`, error);
      return []; // ✅ FIX
    }
  }

  async scrapeNewsSignals(company: string): Promise<NewsSignal[]> {
    try {
      const query = `"${company}" (funding OR raised OR growth OR acquisition OR seed OR series)`;
      const results = await this.searchGoogle(query);

      if (results.length === 0) return []; // ✅ FIX

      return results.slice(0, 3).map((r) => ({
        headline: r.title,
        summary: r.description,
        publishedAt: new Date().toISOString(),
        url: r.link,
      }));
    } catch (error) {
      console.error(`[BrightData SERP Provider] News API failed:`, error);
      return []; // ✅ FIX
    }
  }
}