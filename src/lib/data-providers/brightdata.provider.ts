import type { IDataProvider, JobSignal, RedditSignal, NewsSignal } from './types';

// ❌ PENTING: IMPORT MOCK PROVIDER DIHAPUS TOTAL DARI FILE INI

export class BrightDataProvider implements IDataProvider {
  
  async scrapeJobSignals(company: string): Promise<JobSignal[]> {
    try {
      console.log(`[BrightData] Fetching jobs for ${company}...`);
      const datasetId = process.env.BRIGHTDATA_DATASET_LINKEDIN;
      const token = process.env.BRIGHTDATA_API_TOKEN;

      if (!datasetId || !token) throw new Error('Bright Data credentials missing');

      // --- LOGIKA FETCH BRIGHT DATA ---
      const triggerUrl = `https://api.brightdata.com/dca/trigger?dataset_id=${datasetId}&include_errors=true`;
      const response = await fetch(triggerUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ keyword: company }])
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];

    } catch (error) {
      // ✅ FIX CLOUDFLARE: Kembalikan array kosong [], BUKAN memanggil mock provider!
      console.error(`[BrightData Provider] Jobs API failed, returning empty array:`, error);
      return []; 
    }
  }

  async scrapeRedditPainPoints(company: string): Promise<RedditSignal[]> {
    try {
      console.log(`[BrightData] Fetching reddit for ${company}...`);
      const datasetId = process.env.BRIGHTDATA_DATASET_REDDIT;
      const token = process.env.BRIGHTDATA_API_TOKEN;

      if (!datasetId || !token) throw new Error('Bright Data credentials missing');

      // --- LOGIKA FETCH BRIGHT DATA ---
      const triggerUrl = `https://api.brightdata.com/dca/trigger?dataset_id=${datasetId}&include_errors=true`;
      const response = await fetch(triggerUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ keyword: company }])
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];

    } catch (error) {
      // ✅ FIX CLOUDFLARE
      console.error(`[BrightData Provider] Reddit API failed, returning empty array:`, error);
      return []; 
    }
  }

  async scrapeNewsSignals(company: string): Promise<NewsSignal[]> {
    try {
      console.log(`[BrightData] Fetching news for ${company}...`);
      const datasetId = process.env.BRIGHTDATA_DATASET_NEWS;
      const token = process.env.BRIGHTDATA_API_TOKEN;

      if (!datasetId || !token) throw new Error('Bright Data credentials missing');

      // --- LOGIKA FETCH BRIGHT DATA ---
      const triggerUrl = `https://api.brightdata.com/dca/trigger?dataset_id=${datasetId}&include_errors=true`;
      const response = await fetch(triggerUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ keyword: company }])
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];

    } catch (error) {
      // ✅ FIX CLOUDFLARE
      console.error(`[BrightData Provider] News API failed, returning empty array:`, error);
      return []; 
    }
  }
}