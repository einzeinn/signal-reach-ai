# SignalReach AI 🎯

**Intent-Based GTM Intelligence Engine** — Find the signal. Close the deal.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)

---

## The Problem

Modern B2B cold outreach is broken. Sales and GTM teams are stuck choosing between two bad options:

| Approach | Result |
|---|---|
| 🔴 High Volume, Low Quality | Generic templates → near-zero reply rates |
| 🔴 High Quality, Low Volume | 45+ min of manual research per prospect |

There's no middle ground — until now.

---

## What SignalReach AI Does

SignalReach AI automates the entire research-to-draft workflow in **under 10 seconds**. Instead of guessing what a prospect needs, it listens to what they're actively struggling with on the open web — then writes the email for you.

```
Company Name → Live Signal Scraping → AI Intent Analysis → Hyper-Personalized Cold Email
```

---

## Architecture

### 1. Real-Time Signal Ingestion — Bright Data SERP API
Fires parallel scraping requests against live Google search results to surface:
- LinkedIn job openings (hiring intent signals)
- Reddit threads with technical complaints (pain point signals)
- Company news (strategic context signals)

No stale databases. No guessing. Live data, every time.

### 2. Generative Intent Analysis — Google Gemini 2.5 Flash
Raw scraped data gets fed into Gemini with strict prompt engineering and enforced JSON response schemas. The model acts as an elite Account Executive — translating raw signals into actionable pitch angles.

> e.g., A Reddit post complaining about "Wayland compatibility issues" → mapped to an "IT infrastructure modernization" value pitch.

### 3. Graceful Degradation — Strategy Pattern Fallback
The data provider layer uses the **OOP Strategy Pattern** (`IDataProvider` interface). If Bright Data hits rate limits or network failures, the system silently falls back to `MockDataProvider` — the UI never breaks, even during a live demo.

### 4. Async Campaign Management — Supabase
Generated drafts are persisted to a PostgreSQL database via Supabase. The UI updates optimistically, so users move straight from signal monitoring to dispatching without waiting for roundtrips.

---

## System Flow

```
[User Input: Company Name]
         │
         ▼
[/api/signals] ──── Bright Data SERP ──── Parallel scrape: Jobs + Reddit + News
         │
         ▼
[Data Normalization] ──── Raw DOM/JSON → Uniform signal objects
         │
         ▼
[/api/outreach] ──── Gemini 2.5 Flash ──── Signal aggregation + strict prompt injection
         │
         ▼
[Output Validation] ──── Enforced JSON schema (subject + body guaranteed)
         │
         ▼
[Supabase Persistence] ──── Draft saved → Rendered in AI Workspace
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 — custom Neo-Brutalism design system |
| Data | Bright Data SERP API |
| AI Engine | Google Gemini 2.5 Flash |
| Database & Auth | Supabase (PostgreSQL) |

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/signal-reach-ai.git
cd signal-reach-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# AI Provider
GEMINI_API_KEY=your_gemini_api_key_here

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Data Provider (values: 'mock' | 'brightdata' | 'brightdata-serp')
DATA_PROVIDER=brightdata-serp

# Bright Data
BRIGHTDATA_API_TOKEN=your_brightdata_token
BRIGHTDATA_SERP_ZONE=your_brightdata_serp_zone_name
```

> 💡 **Tip:** Set `DATA_PROVIDER=mock` to run the app without any external API keys. The fallback MockDataProvider will handle everything.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're good to go.

---

## Key Design Decisions

**Why Bright Data over free scraping?**
Anti-bot measures on LinkedIn and Google block naive scrapers instantly. Bright Data handles rotating proxies, CAPTCHA bypassing, and rendering — so the pipeline works reliably in production, not just locally.

**Why enforce JSON schema on Gemini output?**
Free-form LLM output is unpredictable under load. Enforcing a strict `responseSchema` at the API level guarantees the subject and body fields always exist and are correctly typed — no parsing hacks needed.

**Why the Strategy Pattern for data providers?**
Swapping between live and mock data needs to be seamless — especially during demos. The `IDataProvider` interface makes the provider layer pluggable without touching any business logic.

---

## Built for Hackathon 2026

Transforming unstructured web noise into actionable sales signals.
