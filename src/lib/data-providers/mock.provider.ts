import { IDataProvider, JobSignal, RedditSignal, NewsSignal } from './types';
import mockData from '../../data/mock-signals.json';

// This is our mock implementation. 
// On May 25th, we will create 'brightdata.provider.ts' 
// which will fetch data from the actual Bright Data APIs.
export class MockDataProvider implements IDataProvider {
  
  async scrapeJobSignals(company: string): Promise<JobSignal[]> {
    // Simulate network delay (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockData.jobs.filter(j => j.company.toLowerCase() === company.toLowerCase());
  }

  async scrapeRedditPainPoints(topic: string): Promise<RedditSignal[]> {
    // Simulate network delay (0.8 seconds)
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockData.reddit.filter(r => r.topic.toLowerCase() === topic.toLowerCase());
  }

  async scrapeNewsSignals(company: string): Promise<NewsSignal[]> {
    // Simulate network delay (1.2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1200));
    return mockData.news.filter(n => n.company.toLowerCase() === company.toLowerCase());
  }
}