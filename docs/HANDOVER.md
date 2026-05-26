# SignalReach AI — Handover Documentation

## 📋 Project Overview

**SignalReach AI** is a full-stack web application that automates B2B outreach by analyzing company signals (job postings, Reddit discussions, news) and generating personalized sales emails using Gemini AI.

**Tech Stack:**
- **Frontend:** Next.js 15 (React Server Components), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes with Supabase PostgreSQL
- **AI/LLM:** Google Gemini API (intent scoring + email generation)
- **Data Sources:** Bright Data Web Scraper (or mock provider for development)
- **Database:** Supabase (PostgreSQL + RLS policies)

---

## 🏗️ Architecture

### Data Flow

```
Dashboard (SSR) → getEnrichedLeads()
  ↓
  Fetch companies from Supabase
  ↓
  Scrape signals (jobs, reddit, news) via provider
  ↓
  Enrich data + resolve intent score → OutreachContainer (Client)
  ↓
  User selects company → OutreachPanel calls /api/outreach
  ↓
  API: Score + Generate email + Save to DB → Return to UI
```

### Key Components

1. **`src/app/page.tsx`** - SSR Dashboard with lead list
2. **`src/components/signals/OutreachContainer.tsx`** - Client component managing selected company state
3. **`src/components/signals/OutreachPanel.tsx`** - Email generation UI
4. **`src/app/api/outreach/route.ts`** - Gemini + Supabase integration
5. **`src/lib/data-providers/`** - Data provider pattern (mock/brightdata switchable)

### Type Safety

All shared types centralized in `src/types/leads.ts`:
- `EnrichedLead` - UI data model
- `DashboardLead` - Database view type

---

## 🚀 Setup & Deployment

### Prerequisites

```bash
Node.js 18+
npm / pnpm / yarn
Supabase account (https://supabase.com)
Google Gemini API key (https://ai.google.dev)
```

### Local Development

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd signal-reach-ai
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Fill in:
   # - GEMINI_API_KEY
   # - NEXT_PUBLIC_SUPABASE_URL
   # - NEXT_PUBLIC_SUPABASE_ANON_KEY
   # - USE_MOCK_PROVIDER=true (for dev without Bright Data)
   ```

3. **Database**
   ```bash
   # Push schema to Supabase
   supabase db push
   
   # Or run SQL manually via Supabase dashboard:
   # Copy contents of supabase/migrations/001_init.sql
   ```

4. **Run**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

### Production Deployment

```bash
# Build
npm run build

# Deploy to Vercel / Netlify
# Set environment variables in hosting platform
# Configure Supabase RLS policies per your security needs
```

---

## 🔒 Security & Rate Limiting

- **Environment Validation** - `lib/config.ts` validates all required env vars at startup
- **Rate Limiting** - 10 requests/min per IP on `/api/outreach`
- **RLS Policies** - Supabase row-level security (currently permissive for hackathon)
- **Request Logging** - `middleware.ts` logs all requests

---

## 🛠️ Key Features

### ✅ Implemented

- **Interactive lead selection** — Click company → update email panel instantly (Client Component state)
- **Async data fetching** — Parallel scraping via data provider pattern
- **Gemini integration** — Intent scoring + personalized email generation
- **Supabase integration** — Save drafts + intent scores to PostgreSQL
- **Environment validation** — Clear error messages if env vars missing
- **Loading states** — Skeleton UI + error boundaries
- **Retry logic** — Exponential backoff for Bright Data API calls
- **TypeScript strict mode** — Type-safe across codebase

### 🚧 Future Enhancements

- Authentication (Supabase Auth)
- Email sending integration (SendGrid / Resend)
- Analytics dashboard (email open rates, replies)
- Bulk outreach scheduling
- Multi-user workspace support
- More signal sources (LinkedIn, Crunchbase, etc.)

---

## 🐛 Known Limitations

1. **Bright Data provider** — Requires paid subscription + dataset setup. Dev: use `USE_MOCK_PROVIDER=true`
2. **Rate limiting** — In-memory only (not distributed). Production: use Redis
3. **RLS policies** — Currently allow all authenticated users. Tighten in production
4. **No authentication UI** — Auth scaffolding only (middleware.ts ready, but no login form)

---

## 📚 Documentation Files

- **`docs/API.md`** - API endpoint specifications
- **`docs/ARCHITECTURE.md`** - Detailed system design
- **`README.md`** - Quick start guide

---

## 🤝 Support & Questions

For issues or questions:
1. Check `docs/ARCHITECTURE.md` for system design details
2. Review `lib/config.ts` for environment variable requirements
3. Test with `USE_MOCK_PROVIDER=true` to isolate Bright Data issues
4. Check browser DevTools for client-side errors
5. Check terminal for server-side errors + validation warnings

---

## 📝 Last Updated

**May 20, 2026** - Full-stack implementation with environment validation, rate limiting, error boundaries, and Supabase integration complete.

**Ready for hackathon demo!** ✨
