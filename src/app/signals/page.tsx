// src/app/signals/page.tsx
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Sidebar from '../../components/ui/sidebar';
import { Activity, Briefcase, MessageSquare, Newspaper, ExternalLink } from 'lucide-react';
import { getDataProvider } from '../../lib/data-providers';
import { formatDate } from '../../lib/utils';

// Uniform data type for timeline feed
type FeedItem = {
  id: string;
  type: 'job' | 'reddit' | 'news';
  company: string;
  title: string;
  content: string;
  meta: string;
  date: Date;
  url?: string;
};

// List of target companies for demo feed
const TARGET_COMPANIES = ['Similarweb', 'Zoominfo', 'Apify', 'Semrush', 'Sensor Tower'];

async function getLiveFeed(): Promise<FeedItem[]> {
  const provider = getDataProvider();
  let allSignals: FeedItem[] = [];

  // Fetch data for all companies in parallel
  await Promise.all(
    TARGET_COMPANIES.map(async (company) => {
      const [jobs, reddit, news] = await Promise.all([
        provider.scrapeJobSignals(company),
        provider.scrapeRedditPainPoints(company),
        provider.scrapeNewsSignals(company),
      ]);

      // Normalisasi Job Signals
      jobs.forEach((job, idx) => {
        allSignals.push({
          id: `job-${company}-${idx}`,
          type: 'job',
          company,
          title: `Hiring: ${job.role}`,
          content: job.rawText,
          meta: job.source,
          date: new Date(job.postedAt),
        });
      });

      // Normalisasi Reddit Signals
      reddit.forEach((post, idx) => {
        const randomDate = new Date();
        randomDate.setHours(randomDate.getHours() - Math.floor(Math.random() * 48));
        allSignals.push({
          id: `reddit-${company}-${idx}`,
          type: 'reddit',
          company,
          title: post.title,
          content: post.body,
          meta: `${post.subreddit} • ${post.upvotes} upvotes`,
          date: randomDate,
        });
      });

      // Normalisasi News Signals
      news.forEach((article, idx) => {
        allSignals.push({
          id: `news-${company}-${idx}`,
          type: 'news',
          company,
          title: article.headline,
          content: article.summary,
          meta: 'News Article',
          date: new Date(article.publishedAt),
          url: article.url,
          });
      });
    })
  );

  // Sort from newest (descending)
  return allSignals.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export default async function SignalsPage() {
  const feedItems = await getLiveFeed();

  return (
    <div className="min-h-screen flex bg-grid font-sans text-neo-black">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Tetap (Fixed) */}
        <div className="p-8 pb-4 bg-neo-white shrink-0">
          <header className="flex items-center justify-between border-2 border-neo-black bg-neo-teal p-4 shadow-comic">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6" />
              <h2 className="text-xl font-black uppercase">Live Intelligence Feed</h2>
            </div>
            <div className="bg-white border-2 border-neo-black px-3 py-1 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Monitoring {TARGET_COMPANIES.length} Companies
            </div>
          </header>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            
            <Suspense fallback={<div className="text-center font-bold p-10 bg-white border-2 border-neo-black shadow-comic">Fetching live web signals...</div>}>
              {feedItems.map((item) => {
                const isJob = item.type === 'job';
                const isReddit = item.type === 'reddit';
                const isNews = item.type === 'news';

                const Icon = isJob ? Briefcase : isReddit ? MessageSquare : Newspaper;
                const bgColor = isJob ? 'bg-neo-yellow' : isReddit ? 'bg-[#00C7B7]' : 'bg-white';
                const badgeText = isJob ? 'HIRING SIGNAL' : isReddit ? 'PAIN POINT' : 'MARKET NEWS';

                return (
                  <div key={item.id} className="border-2 border-neo-black bg-white shadow-comic flex overflow-hidden hover:-translate-y-1 hover:shadow-comic-hover transition-transform">
                    {/* Left Side - Type Indicator */}
                    <div className={`w-16 ${bgColor} border-r-2 border-neo-black flex flex-col items-center justify-start pt-6 shrink-0`}>
                      <div className="bg-white border-2 border-neo-black p-2 shadow-[2px_2px_0_#000]">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 items-center">
                          <span className="font-black text-xs uppercase bg-neo-black text-white px-2 py-1">
                            {item.company}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 border border-gray-300 px-2 py-0.5">
                            {badgeText}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-400">
                          {formatDate(item.date)}
                        </span>
                      </div>

                      <h3 className="text-lg font-black leading-tight mb-2">
                        {item.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 font-medium leading-relaxed mb-4 line-clamp-3">
                        {item.content}
                      </p>

                      <div className="mt-auto flex justify-between items-center pt-3 border-t-2 border-dashed border-gray-200">
                        <span className="text-xs font-bold flex items-center gap-1 text-gray-500">
                          📍 Source: <span className="text-neo-black">{item.meta}</span>
                        </span>
                        
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs font-black flex items-center gap-1 hover:text-neo-teal transition-colors">
                            Read Original <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Suspense>

            {/* End of feed indicator */}
            <div className="text-center py-6 flex flex-col items-center justify-center opacity-70 bg-white border-2 border-neo-black shadow-comic max-w-xs mx-auto w-full mt-4">
              <Activity className="w-8 h-8 mb-2" />
              <p className="text-xs font-black uppercase tracking-widest">End of Recent Signals</p>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}