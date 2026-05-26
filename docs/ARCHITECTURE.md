# SignalReach AI — Architecture

## Overview

SignalReach AI is an intent-based B2B sales intelligence platform. It monitors public signals (hiring, pain points, funding news) across multiple sources, scores buying intent with Gemini AI, and generates hyper-personalized cold email drafts — all in seconds.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                     Next.js App Router UI                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP
┌──────────────────────────────▼──────────────────────────────────┐
│                    NEXT.JS SERVER (Vercel)                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API ROUTES                           │    │
│  │                                                         │    │
│  │  GET  /api/signals   → Aggregate signals                │    │
│  │  POST /api/score     → AI intent scoring                │    │
│  │  POST /api/outreach  → Generate email draft             │    │
│  └──────────┬──────────────────────┬───────────────────────┘    │
│             │                      │                             │
│  ┌──────────▼──────┐    ┌──────────▼──────────────────────┐    │
│  │  DATA PROVIDER  │    │       GEMINI AI SERVICE          │    │
│  │   (Factory)     │    │                                  │    │
│  │                 │    │  calculateIntentScore()           │    │
│  │  [Mock] ──────► │    │  generateOutreachEmail()         │    │
│  │  [BrightData] ► │    └──────────┬───────────────────────┘    │
│  └──────────┬──────┘               │ Google Gemini API          │
│             │                      │                             │
└─────────────┼──────────────────────┼─────────────────────────────┘
              │                      │
┌─────────────▼──────┐  ┌────────────▼──────────┐
│   BRIGHT DATA API  │  │    GOOGLE GEMINI API   │
│                    │  │  gemini-2.0-flash      │
│  LinkedIn Jobs     │  │                        │
│  Reddit Posts      │  │  Intent Scoring        │
│  Google News       │  │  Email Generation      │
└────────────────────┘  └────────────────────────┘
              │
┌─────────────▼──────────────────────────────────┐
│               SUPABASE (PostgreSQL)             │
│                                                 │
│  companies       — tracked target companies     │
│  signals         — cached scraping results      │
│  intent_scores   — Gemini scoring history       │
│  outreach_drafts — generated email drafts       │
└─────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Provider Pattern (Strategy Pattern)
The `IDataProvider` interface decouples signal fetching from the rest of the system. Switching between mock data and live Bright Data scraping requires changing exactly **one environment variable** (`DATA_PROVIDER`).

```
src/lib/data-providers/
├── types.ts              ← Interface contract (IDataProvider)
├── mock.provider.ts      ← Dev/demo: instant, no API calls
├── brightdata.provider.ts ← Production: live Bright Data scraping
└── index.ts              ← Factory: reads DATA_PROVIDER env var
```

### 2. Prompt Engineering as Core Value
The quality of the output (score accuracy and email personalization) is determined entirely by the prompts in `src/lib/prompts/`. These are treated as first-class code assets, not afterthoughts.

```
src/lib/prompts/
├── scoring.prompt.ts  ← Structured JSON output for reliable parsing
└── outreach.prompt.ts ← Strict copywriting rules to prevent generic output
```

### 3. Parallel Signal Fetching
All three signal sources (jobs, reddit, news) are fetched simultaneously using `Promise.all()`. This keeps latency at the level of the **slowest single source**, not the sum of all sources.

### 4. Server Components First
The dashboard uses Next.js **Server Components** for initial data load. No client-side fetching on first render. Interactive features (search, generate email) are handled via Client Components calling the API routes.

---

## Data Flow

```
User types company name
        │
        ▼
GET /api/signals?company=Acme+Corp
        │
        ├── scrapeJobSignals()    ─┐
        ├── scrapeRedditPainPoints() ─┤─ Promise.all() → parallel
        └── scrapeNewsSignals()   ─┘
        │
        ▼
POST /api/score { company }
        │
        └── Gemini: scoringPrompt → JSON { score, reasoning, signals }
        │
        ▼
POST /api/outreach { company, recipientName }
        │
        └── Gemini: outreachPrompt → JSON { subject, body }
        │
        ▼
Dashboard displays: Score badge + Email draft
```

---

## File Structure

```
signal-reach-ai/
├── src/
│   ├── app/
│   │   ├── (auth)/login/     ← Auth pages (Supabase magic link)
│   │   ├── api/
│   │   │   ├── signals/route.ts   ← Signal aggregation
│   │   │   ├── score/route.ts     ← Intent scoring
│   │   │   └── outreach/route.ts  ← Email generation
│   │   ├── globals.css        ← Design tokens (Tailwind v4 @theme)
│   │   ├── layout.tsx
│   │   └── page.tsx           ← Dashboard (Server Component)
│   ├── components/
│   │   ├── signals/           ← Signal display components
│   │   └── ui/                ← Reusable UI primitives
│   ├── data/
│   │   └── mock-signals.json  ← Local mock data for development
│   ├── lib/
│   │   ├── data-providers/    ← Provider pattern (see above)
│   │   ├── prompts/           ← Gemini prompt templates
│   │   ├── services/
│   │   │   └── gemini.ts      ← Gemini API client
│   │   ├── supabase/          ← Supabase client (to be added)
│   │   └── validators/        ← Input validation utilities
│   └── types/                 ← Shared TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_init.sql       ← Database schema
├── docs/
│   ├── API.md                 ← This file
│   └── ARCHITECTURE.md        ← Architecture documentation
├── .env.local.example         ← Environment variable template
└── .env.local                 ← Your actual secrets (git-ignored)
```

---

## Environment Variables

| Variable                        | Required | Description                                    |
|---------------------------------|----------|------------------------------------------------|
| `GEMINI_API_KEY`                | ✅       | Google Gemini API key                          |
| `BRIGHTDATA_API_TOKEN`          | Demo day | Bright Data API token                          |
| `BRIGHTDATA_DATASET_LINKEDIN`   | Demo day | Bright Data LinkedIn Jobs dataset ID           |
| `BRIGHTDATA_DATASET_REDDIT`     | Demo day | Bright Data Reddit dataset ID                  |
| `BRIGHTDATA_DATASET_NEWS`       | Demo day | Bright Data Google News dataset ID             |
| `DATA_PROVIDER`                 | ✅       | `mock` or `brightdata`                         |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅       | Supabase project URL                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅       | Supabase anonymous key                         |
