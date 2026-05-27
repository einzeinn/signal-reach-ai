import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase/client';
import { getDataProvider } from '../../../lib/data-providers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

export async function POST(request: NextRequest) {
  // DEBUG: cek semua env vars
  console.log('[DEBUG ENV]', {
    GEMINI: !!process.env.GEMINI_API_KEY,
    GEMINI_VALUE: process.env.GEMINI_API_KEY?.slice(0, 10),
    DATA_PROVIDER: process.env.DATA_PROVIDER,
    SUPABASE: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  const clientIp = getClientIp(request);

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { companyId, companyName } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required to generate outreach.' },
        { status: 400 }
      );
    }

    console.log(`[Outreach API] Fetching live signals for ${companyName}...`);
    const provider = getDataProvider();
    const [jobs, reddit, news] = await Promise.all([
      provider.scrapeJobSignals(companyName),
      provider.scrapeRedditPainPoints(companyName),
      provider.scrapeNewsSignals(companyName),
    ]);

    console.log(`[Outreach API] Generating personalized email via Gemini...`);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    const jobSignalsStr = jobs.length > 0 ? jobs.map(j => j.role).join(', ') : 'No specific roles';
    const redditSignalsStr = reddit.length > 0 ? reddit.map(r => r.title).join(' | ') : 'No specific discussions';
    const newsSignalsStr = news.length > 0 ? news.map(n => n.headline).join(' | ') : 'No recent news';

    const prompt = `
      You are an elite Enterprise B2B Account Executive.
      Write a highly personalized cold email to a prospect at ${companyName}.
      
      Here are the raw real-time signals we found about them today:
      - Hiring Roles: ${jobSignalsStr}
      - Reddit Discussions/Pain Points: ${redditSignalsStr}
      - Recent News: ${newsSignalsStr}
      
      Email Requirements:
      1. Write the email in English with a professional, confident B2B tone. MUST use double line breaks (\n\n) between paragraphs for readability.
      2. Subject line must be catchy, short, and relevant to the signals.
      3. Start with "Hi [First Name],", followed by a double line break.
      4. Paragraph 1: Mention a specific signal from the data above. 
         IMPORTANT: Analyze the Reddit discussions to figure out the actual pain point. DO NOT copy-paste raw search query operators like "OR", "AND", "pain", "bottleneck" literally. Phrase it naturally.
      5. Paragraph 2: Soft pitch our value proposition at SignalReach AI.
      6. Call to Action: Ask for a 10-minute introductory call next week.
      7. Sign off as "Best,\n\nAlex Mercer\nEnterprise Account Executive\nSignalReach AI".
    `;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                subject: { type: "STRING" },
                body: { type: "STRING" }
              }
            }
          }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!geminiResponse.ok) {
        const errData = await geminiResponse.text();
        throw new Error(`Gemini API returned ${geminiResponse.status}: ${errData.substring(0, 200)}`);
      }

      const aiData = await geminiResponse.json();

      if (!aiData.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response structure from Gemini API');
      }

      let responseText = aiData.candidates[0].content.parts[0].text;
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const generatedData = JSON.parse(responseText);

      try {
        const supabase = await createServerClient();
        await supabase.from('outreach_drafts').insert({
          company_id: companyId,
          recipient_name: 'Decision Maker',
          subject: generatedData.subject,
          body: generatedData.body,
          status: 'draft'
        });
      } catch (dbError) {
        console.warn('[Outreach API] DB insert failed:', dbError);
      }

      return NextResponse.json({
        success: true,
        message: 'Draft generated successfully',
        data: generatedData
      });

    } catch (geminiError) {
      clearTimeout(timeoutId);
      console.error('[Outreach API] Gemini Error:', geminiError instanceof Error ? geminiError.message : geminiError);

      return NextResponse.json({
        success: true,
        message: 'Using template draft due to AI generation delay',
        data: {
          subject: `Exciting signals from ${companyName} - Let's connect`,
          body: `Hi there,\n\nWe noticed some exciting activity at ${companyName} and thought this might be a good time to connect.\n\nWould you be available for a quick 10-minute call next week?\n\nBest,\n\nAlex Mercer\nEnterprise Account Executive\nSignalReach AI`
        }
      });
    }

  } catch (error) {
    console.error('[Outreach API] Internal Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}