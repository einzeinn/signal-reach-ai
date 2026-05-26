// src/lib/services/gemini.service.ts
import { GoogleGenAI } from '@google/genai';
import { scoringPrompt } from '../prompts/scoring.prompt';
import { outreachPrompt } from '../prompts/outreach.prompt';
import { JobSignal, RedditSignal, NewsSignal } from '../data-providers/types';

// Inisialisasi SDK baru dari @google/genai
// Secara otomatis akan mencari GEMINI_API_KEY di environment variables, 
// tapi kita deklarasikan eksplisit untuk keamanan tipe (type safety).
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
  
  // Memanggil API menggunakan struktur SDK terbaru
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      // Memaksa model merespons dalam format JSON murni
      responseMimeType: "application/json"
    }
  });

  // response.text di SDK baru adalah sebuah getter/property langsung
  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini API');

  try {
    return JSON.parse(text);
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
  
  // Memanggil API menggunakan struktur SDK terbaru
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      // Memaksa model merespons dalam format JSON murni
      responseMimeType: "application/json"
    }
  });

  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini API');

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse Gemini response: ${err instanceof Error ? err.message : String(err)}`);
  }
}