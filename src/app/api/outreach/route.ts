import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase/client';
import { getDataProvider } from '../../../lib/data-providers';
import { GoogleGenAI } from '@google/genai'; // KITA PAKE SDK RESMI SAJA

export const dynamic = 'force-dynamic';

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
    
    // Fetch signals
    const [jobs, reddit, news] = await Promise.all([
      provider.scrapeJobSignals(companyName),
      provider.scrapeRedditPainPoints(companyName),
      provider.scrapeNewsSignals(companyName),
    ]);

    console.log(`[Outreach API] Generating personalized email via Gemini SDK...`);
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
         IMPORTANT: Analyze the Reddit discussions to figure out the actual pain point. Phrase it naturally.
      5. Paragraph 2: Soft pitch our value proposition at SignalReach AI.
      6. Call to Action: Ask for a 10-minute introductory call next week.
      7. Sign off as "Best,\n\nAlex Mercer\nEnterprise Account Executive\nSignalReach AI".
      
      Keep the email VERY SHORT. Maximum 4 sentences only.
    `;

    try {
      // MENGGUNAKAN SDK RESMI @google/genai
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      // Kita pakai Promise.race untuk bikin timeout manual 12 detik yang lebih stabil
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 12000)
      );

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash', // Pakai flash biasa, seringkali lebih stabil dari lite
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: "OBJECT",
             properties: {
               subject: { type: "STRING" },
               body: { type: "STRING" }
             }
          }
        }
      });

      // Balapan: Mana yang duluan, Gemini selesai atau 12 detik habis?
      const response = await Promise.race([geminiPromise, timeoutPromise]) as any;
      
      const text = response.text;
      if (!text) throw new Error('Empty response from Gemini SDK');

      // Bersihkan markdown jika ada
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const generatedData = JSON.parse(cleanText);

      // Simpan ke Supabase (opsional, biarkan fail kalau DB bermasalah)
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
        data: generatedData // Data asli dari Gemini
      });

    } catch (geminiError: any) {
      console.warn('[Outreach API] Gemini Failed or Timeout:', geminiError.message);

      // 🛡️ FALLBACK YANG DIJAMIN TIDAK BLANK DI UI
      const fallbackData = {
        subject: `Quick question regarding ${companyName}'s current initiatives`,
        body: `Hi [First Name],\n\nI noticed some interesting technical and hiring discussions regarding ${companyName} recently.\n\nSignalReach AI specializes in streamlining these exact operational workflows for enterprise teams.\n\nDo you have 10 minutes next week to see if we might be a fit to help?\n\nBest,\n\nAlex Mercer\nEnterprise Account Executive\nSignalReach AI`
      };

      return NextResponse.json({
        success: true,
        message: 'Draft generated using template',
        data: fallbackData // Format sama persis (subject & body)
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