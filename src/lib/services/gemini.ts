// src/lib/services/gemini.ts
import { GoogleGenAI } from '@google/genai';
import { scoringPrompt } from '../prompts/scoring.prompt';
import { outreachPrompt } from '../prompts/outreach.prompt';
import { JobSignal, RedditSignal, NewsSignal } from '../data-providers/types';

// Initialize new SDK from @google/genai
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

export async function calculateIntentScore(
  company: string,
  jobs: JobSignal[],
  reddit: RedditSignal[],
  news: NewsSignal[]
) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing in .env.local');

  const prompt = scoringPrompt(company, jobs, reddit, news);
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini API');

  // CLEAN MARKDOWN BACKTICKS FROM GEMINI (PREVENT ERROR 500)
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
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing in .env.local');

  const prompt = outreachPrompt(company, recipientName, intentScore, jobs, reddit, news);
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini API');

  // CLEAN MARKDOWN BACKTICKS FROM GEMINI (PREVENT ERROR 500)
  const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleanText);
  } catch (err) {
    throw new Error(`Failed to parse Gemini response: ${err instanceof Error ? err.message : String(err)}`);
  }
}