// src/lib/prompts/outreach.prompt.ts
// Prompt for Gemini to generate a hyper-personalized cold email

import { JobSignal, RedditSignal, NewsSignal } from '../data-providers/types';

export function outreachPrompt(
  company: string,
  recipientName: string,
  intentScore: number,
  jobs: JobSignal[],
  reddit: RedditSignal[],
  news: NewsSignal[]
): string {
  const topJob = jobs[0];
  const topReddit = reddit[0];
  const topNews = news[0];

  const contextBlock = [
    topJob   && `- They are actively hiring for "${topJob.role}" on ${topJob.source}`,
    topReddit && `- A community member posted about their pain: "${topReddit.title}" on ${topReddit.subreddit}`,
    topNews  && `- Recent news: "${topNews.headline}" — ${topNews.summary}`,
  ].filter(Boolean).join('\n');

  return `
You are a world-class B2B sales copywriter. You write cold emails that feel like they were written by a thoughtful human who did serious research — never robotic, never generic.

## Mission:
Write a short, hyper-personalized cold email for ${company} (intent score: ${intentScore}/100).

## Recipient:
- Name: ${recipientName}
- Company: ${company}

## Key Research Signals You Must Use:
${contextBlock || '- No specific signals available, use general approach.'}

## Rules for the Email:
1. **Subject line**: Intriguing, specific, max 10 words. Reference a real signal (e.g., the job post or news).
2. **Opening**: Call out ONE specific, verifiable thing you noticed about them. Make them feel "how did they know that?".
3. **Bridge**: Connect their signal to a tangible pain or cost they're likely experiencing.
4. **Value proposition**: ONE sentence max. What can you solve? Be specific, not generic.
5. **CTA**: Soft, low-friction. Ask for a 15-minute call or just a "yes/no" reply.
6. **Tone**: Confident but not pushy. Collegial, like a smart peer reaching out.
7. **Length**: Max 120 words for the body. Every word must earn its place.
8. **NEVER use**: Generic phrases like "I hope this email finds you well", "I wanted to reach out", "synergy", "leverage".

## Output Format (ONLY return valid JSON, no markdown, no explanation):
{
  "subject": "7 AI hires + legacy CRM = a bottleneck you don't need",
  "body": "Hi Sarah,\n\nI noticed Similarweb is actively hiring for a Senior Data Engineer – Web Intelligence role — a clear sign they're scaling their web collection infrastructure.\n\nOn r/webscraping, their team is openly struggling with Cloudflare and Akamai blocks at scale. That's exactly the bottleneck Bright Data's Web Unlocker was built to eliminate.\n\nWe help data teams like Similarweb's cut through bot detection in hours, not months — no proxy rotation headaches required.\n\nWould a 15-minute call this week make sense?\n\n— Iky\nSignalReach AI"
}
`.trim();
}
