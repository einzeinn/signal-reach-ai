// src/lib/data-providers/types.ts

export interface JobSignal {
  role: string;
  postedAt: string;
  rawText: string;
  source: string;
}

export interface RedditSignal {
  subreddit: string;
  title: string;
  body: string;
  upvotes: number;
}

export interface NewsSignal {
  headline: string;
  summary: string;
  publishedAt: string;
  url: string;
}

// This is our "contract". Both Mock Provider and Bright Data Provider
// must follow this data structure format.
export interface IDataProvider {
  scrapeJobSignals(company: string): Promise<JobSignal[]>;
  scrapeRedditPainPoints(topic: string): Promise<RedditSignal[]>;
  scrapeNewsSignals(company: string): Promise<NewsSignal[]>;
}