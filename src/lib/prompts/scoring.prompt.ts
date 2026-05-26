// src/lib/prompts/scoring.prompt.ts
// Prompt for Gemini to analyze signals and return a structured intent score

import { JobSignal, RedditSignal, NewsSignal } from '../data-providers/types';

export function scoringPrompt(
  company: string,
  jobs: JobSignal[],
  reddit: RedditSignal[],
  news: NewsSignal[]
): string {
  const jobSection = jobs.length > 0
    ? jobs.map(j => `- [${j.source}] Hiring "${j.role}" (posted: ${j.postedAt})\n  Context: "${j.rawText}"`).join('\n')
    : '- No active job signals found.';

  const redditSection = reddit.length > 0
    ? reddit.map(r => `- [${r.subreddit}] "${r.title}" (${r.upvotes} upvotes)\n  "${r.body}"`).join('\n')
    : '- No Reddit pain points found.';

  const newsSection = news.length > 0
    ? news.map(n => `- "${n.headline}" (${n.publishedAt})\n  Summary: "${n.summary}"`).join('\n')
    : '- No relevant news found.';

  return `
You are a B2B sales intelligence analyst. Your job is to evaluate how likely a company is to need an external software solution RIGHT NOW, based on observable signals.

## Target Company: ${company}

## Signal Data:

### 1. Hiring Signals (indicates growth, new initiatives, or tech gaps)
${jobSection}

### 2. Reddit Pain Points (indicates internal frustration and unmet needs)
${redditSection}

### 3. News & Funding Signals (indicates budget availability and strategic direction)
${newsSection}

## Your Task:
Analyze ALL signals above holistically and return a JSON object with:
- "score": integer from 0-100 (0 = not ready to buy, 100 = extremely high intent)
- "reasoning": a single, concise sentence explaining WHY this score was given
- "signals": an array of 2-4 short strings, each being one key signal that influenced the score (max 10 words each)

## Scoring Rubric:
- 0-30: No clear signals, wrong timing
- 31-50: Some activity, but no urgent pain point
- 51-70: Clear need exists, but budget/timing uncertain
- 71-85: Strong multi-source signal, high likelihood of receptiveness
- 86-100: All signals aligned — hiring + pain + budget. Reach out NOW.

## Output Format (ONLY return valid JSON, no markdown, no explanation):
{
  "score": 87,
  "reasoning": "Company is actively hiring for the exact role our solution augments, and public complaints confirm internal tool frustration.",
  "signals": ["Hiring Head of IT Infrastructure", "CRM complaint on r/sysadmin", "Series B funding secured"]
}
`.trim();
}
