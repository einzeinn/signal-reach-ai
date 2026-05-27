import { GoogleGenAI } from '@google/genai';
import { scoringPrompt } from '../prompts/scoring.prompt';
import { outreachPrompt } from '../prompts/outreach.prompt';
import { JobSignal, RedditSignal, NewsSignal } from '../data-providers/types';

const MODEL_NAME = "gemini-2.5-flash-lite";

export async function calculateIntentScore(
  company: string,
  jobs: JobSignal[],
  reddit: RedditSignal[],
  news: NewsSignal[]
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = scoringPrompt(company, jobs, reddit, news);
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini API');

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    throw new Error(`Failed to parse Gemini response: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function generateOutreachEmail(
  company: string,
  recipientName: string,
  intentScore: number,
  jobs: JobSignal[],
  reddit: RedditSignal[],
  news: NewsSignal[]
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = outreachPrompt(company, recipientName, intentScore, jobs, reddit, news);
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini API');

  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    throw new Error(`Failed to parse Gemini response: ${err instanceof Error ? err.message : String(err)}`);
  }
}