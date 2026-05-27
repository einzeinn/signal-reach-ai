import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/lib/data-providers';
import { validateSignalsQuery } from '@/lib/validators/signals.validator';

export const dynamic = 'force-dynamic'; // Disable Next.js cache
export const maxDuration = 60; // Allow Vercel to run for maximum 60 seconds

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; 
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

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

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

  const validation = validateSignalsQuery(request.nextUrl.searchParams);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { company } = validation.data;
  const provider = getDataProvider();

  try {
    const [jobs, reddit, news] = await Promise.all([
      provider.scrapeJobSignals(company),
      provider.scrapeRedditPainPoints(company),
      provider.scrapeNewsSignals(company),
    ]);

    return NextResponse.json({
      company,
      fetchedAt: new Date().toISOString(),
      signals: {
        jobs,
        reddit,
        news,
      },
      summary: {
        totalSignals: jobs.length + reddit.length + news.length,
        jobCount: jobs.length,
        redditCount: reddit.length,
        newsCount: news.length,
      },
    });
  } catch (error) {
    console.error('[/api/signals] Error fetching signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signals. Please try again.' },
      { status: 500 }
    );
  }
}