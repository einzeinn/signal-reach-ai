import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase/client';
import { getDataProvider } from '../../../lib/data-providers';

export const maxDuration = 60; // Force Vercel to give up to 60 seconds
export const dynamic = 'force-dynamic'; // Disable Next.js cache to always live

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
  const clientIp = getClientIp(request);

  // 1. Security Check: Rate Limiting
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

    // ==========================================
    // STEP 1: DATA GATHERING (LIVE BRIGHT DATA)
    // ==========================================
    console.log(`[Outreach API] Fetching live signals for ${companyName}...`);
    const provider = getDataProvider();
    const [jobs, reddit, news] = await Promise.all([
      provider.scrapeJobSignals(companyName),
      provider.scrapeRedditPainPoints(companyName),
      provider.scrapeNewsSignals(companyName),
    ]);

    // ==========================================
    // STEP 2: AI GENERATION (GEMINI AI)
    // ==========================================
    console.log(`[Outreach API] Generating personalized email via Gemini...`);
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    // Summarize signals for Gemini
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
         IMPORTANT: Analyze the Reddit discussions to figure out the actual pain point. DO NOT copy-paste raw search query operators like "OR", "AND", "pain", "bottleneck" literally. Phrase it naturally (e.g., "saw some discussions around scaling challenges" or "noticed your team is navigating infrastructure hurdles").
      5. Paragraph 2: Soft pitch our value proposition at SignalReach AI (streamlining IT workflows, zero-downtime cloud infrastructure, and saving engineering hours).
      6. Call to Action: Ask for a 10-minute introductory call next week.
      7. Sign off as "Best,\n\nAlex Mercer\nEnterprise Account Executive\nSignalReach AI".
    `;

    // Call Gemini API (using forced JSON format)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
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
      })
    });

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.text();
      console.error('Gemini Error:', errData);
      throw new Error('Failed to generate email with Gemini AI');
    }

    const aiData = await geminiResponse.json();
    const responseText = aiData.candidates[0].content.parts[0].text;
    const generatedData = JSON.parse(responseText);

    // ==========================================
    // STEP 3: SAVE TO DATABASE (SUPABASE)
    // ==========================================
    console.log(`[Outreach API] Saving draft to Supabase...`);
    try {
      const supabase = await createServerClient();
      await supabase.from('outreach_drafts').insert({
        company_id: companyId,
        recipient_name: 'Decision Maker', // Bisa diedit nanti di UI
        subject: generatedData.subject,
        body: generatedData.body,
        status: 'draft'
      });
    } catch (dbError) {
      console.warn('[Outreach API] Database insert failed, but returning AI data to UI anyway:', dbError);
    }

    // ==========================================
    // STEP 4: RETURN RESPONSE
    // ==========================================
    return NextResponse.json({
      success: true,
      message: 'Draft generated successfully',
      data: generatedData
    });

  } catch (error) {
    console.error('[Outreach API] Internal Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}