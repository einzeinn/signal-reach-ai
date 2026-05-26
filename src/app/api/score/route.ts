// src/app/api/score/route.ts
// POST /api/score
// Body: { company: string }
// Fetches all signals, then asks Gemini to calculate an intent score

import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/lib/data-providers';
import { calculateIntentScore } from '@/lib/services/gemini';
import { validateScoreBody } from '@/lib/validators/signals.validator';

// --- Rate Limiting Setup ---
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // Max 10 requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // Per 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count < RATE_LIMIT) {
    record.count++;
    return true;
  }

  return false;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
// ---------------------------

export async function POST(request: NextRequest) {
  // 0. Security Check: Rate Limiting
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

  // 1. Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validation = validateScoreBody(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { company } = validation.data;
  const provider = getDataProvider();

  try {
    // 2. Fetch all signals in parallel
    const [jobs, reddit, news] = await Promise.all([
      provider.scrapeJobSignals(company),
      provider.scrapeRedditPainPoints(company),
      provider.scrapeNewsSignals(company),
    ]);

    // 3. Pass all signals to Gemini for analysis
    const result = await calculateIntentScore(company, jobs, reddit, news);

    // 4. Return structured score result
    return NextResponse.json({
      company,
      scoredAt: new Date().toISOString(),
      score: result.score,
      reasoning: result.reasoning,
      keySignals: result.signals,
      // Include raw signal counts for transparency
      signalSummary: {
        jobCount: jobs.length,
        redditCount: reddit.length,
        newsCount: news.length,
      },
    });
  } catch (error) {
    console.error('[/api/score] Error calculating score:', error);

    // Check if it's a Gemini API key error specifically
    if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please set GEMINI_API_KEY.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to calculate intent score. Please try again.' },
      { status: 500 }
    );
  }
}