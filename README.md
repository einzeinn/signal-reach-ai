SignalReach AI

Intent-Based GTM Intelligence Engine. Find the signal. Close the deal.

SignalReach AI is an automated B2B sales intelligence platform built for hackathons. It eliminates the manual prospecting bottleneck by triangulating real-time web signals—such as hiring trends, Reddit technical complaints, and company news—into hyper-personalized, high-converting cold emails using generative AI.

The Bottleneck: Manual Prospecting

Modern B2B cold outreach suffers from a massive efficiency problem. Sales and Go-To-Market (GTM) teams are forced to choose between two flawed approaches:

High Volume, Low Quality: Sending generic, automated templates that result in near-zero response rates.

High Quality, Low Volume: Spending 45+ minutes manually researching a prospect's tech stack, recent news, and pain points across multiple platforms just to write a single email.

The Architecture: A Real-Time Pipeline

SignalReach AI solves this by automating the entire research and drafting workflow into a pipeline that executes in under 10 seconds. Instead of guessing what a company needs, the system listens to what they are actively struggling with on the open web.

Core Technical Features

Real-Time Data Ingestion (Bright Data)
Instead of relying on outdated databases, the application utilizes the Bright Data SERP API. It bypasses captchas and blocks to concurrently scrape live Google search results, pinpointing specific LinkedIn job openings and relevant Reddit pain points associated with the target company.

Generative Intent Analysis (Google Gemini)
Raw, unstructured scraped data is fed into Google's Gemini 2.5 Flash model. Utilizing strict prompt engineering and enforced JSON schemas, the AI acts as an elite Account Executive—extracting the core meaning behind the signals (e.g., translating a "Wayland compatibility" Reddit complaint into an "IT infrastructure" value pitch).

Graceful Degradation & Fallback System
Built with production-grade reliability in mind. The data provider layer implements the Object-Oriented Strategy pattern (IDataProvider). If the Bright Data API hits rate limits or network failures, the system automatically falls back to a local MockDataProvider, ensuring the UI never breaks during a live demo.

Asynchronous Campaign Management (Supabase)
Generated AI drafts are securely persisted in a Supabase PostgreSQL database. The UI updates optimistically, allowing users to seamlessly transition from signal monitoring to email dispatching.

Technical Stack

Framework: Next.js 16 (App Router, Turbopack)

Language: TypeScript

Styling: Tailwind CSS v4 (Custom Neo-Brutalism design system)

Data Infrastructure: Bright Data SERP API

AI Engine: Google Gemini 2.5 Flash API

Database & Auth: Supabase (PostgreSQL)

System Flow (How It Works Under the Hood)

Input: The user adds a target company name (e.g., "Anthropic") in the Dashboard.

Parallel Fetching: The Next.js API route (/api/signals) instantiates the Bright Data provider and fires parallel requests to scrape Jobs, Reddit, and News.

Data Normalization: The raw DOM/JSON response is cleaned and structured into uniform signal objects.

AI Generation: Upon clicking "Generate", the /api/outreach route aggregates the signals and injects them into a strict Gemini prompt.

Output Validation: Gemini returns the customized email subject and body in a guaranteed JSON format (responseSchema enforcement).

Persistence: The structured draft is saved to Supabase and rendered in the AI Workspace for final user review.

Local Development Setup

Follow these instructions to run the application locally.

1. Clone the repository

git clone [https://github.com/yourusername/signal-reach-ai.git](https://github.com/yourusername/signal-reach-ai.git)
cd signal-reach-ai


2. Install dependencies

npm install


3. Configure Environment Variables

Create a .env.local file in the project root and add your specific API keys:

# AI Provider
GEMINI_API_KEY=your_gemini_api_key_here

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Data Provider Mode (Values: 'mock' | 'brightdata' | 'brightdata-serp')
DATA_PROVIDER=brightdata-serp

# Bright Data Credentials
BRIGHTDATA_API_TOKEN=your_brightdata_token
BRIGHTDATA_SERP_ZONE=your_brightdata_serp_zone_name


4. Run the development server

npm run dev


Navigate to http://localhost:3000 to interact with the application.

Built for Hackathon 2026. Transforming unstructured web noise into actionable sales signals.