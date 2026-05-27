🚀 SignalReach AI

Automated B2B Outreach powered by Real-Time Signals and Generative AI.

SignalReach AI is a modern B2B sales intelligence platform that bridges the gap between deep, personalized prospect research and scalable automated outreach. It instantly scrapes live web signals and synthesizes them into highly personalized cold email drafts using advanced AI.

✨ Key Features

Live Data Scraping: Dynamically fetches real-time signals including recent job postings (LinkedIn), technical pain points and discussions (Reddit), and latest company news.

AI-Powered Synthesis: Utilizes Google's Gemini 2.5 Flash to analyze unstructured data and generate hyper-personalized, context-aware cold emails.

Edge-Optimized Performance: Fully deployed on the Edge (Cloudflare Pages), ensuring ultra-low latency.

Fault-Tolerant AI Generation: Implements a custom asynchronous Promise.race handler to bypass serverless execution limits gracefully, guaranteeing a response under 12 seconds.

Draft Management: Automatically saves generated outreach drafts to a Supabase PostgreSQL database for sales teams to review and send.

🛠️ Tech Stack

Framework: Next.js (App Router, Edge Runtime)

Deployment: Cloudflare Pages & Workers

AI Model: Google Gemini 2.5 Flash via official @google/genai SDK

Data Provider: Bright Data (SERP API & Web Unlocker)

Database: Supabase (PostgreSQL)

Styling: Tailwind CSS

🏗️ Architecture & How It Works

User Input: An Account Executive inputs a target company name.

Parallel Scraping: The API concurrently triggers Bright Data to scrape Google/LinkedIn for hiring roles, Reddit for pain points, and News for recent events.

Prompt Engineering: The raw data is structured into a highly engineered prompt outlining the prospect's current initiatives.

AI Generation: The @google/genai SDK processes the prompt. A custom race-condition timeout ensures the AI responds within serverless boundaries (under 15s).

Storage & UI: The generated email is saved to Supabase and immediately rendered on the frontend dashboard.

🚦 Getting Started (Local Development)

Prerequisites

Node.js 18+

npm, yarn, or pnpm

API Keys for Bright Data, Google Gemini, and Supabase

1. Clone the repository

git clone [https://github.com/yourusername/signal-reach-ai.git](https://github.com/yourusername/signal-reach-ai.git)
cd signal-reach-ai


2. Install dependencies

npm install


3. Environment Variables

Create a .env.local file in the root directory and add the following keys:

# AI Provider
GEMINI_API_KEY=your_gemini_api_key

# Data Provider (Bright Data)
DATA_PROVIDER=brightdata
BRIGHTDATA_API_TOKEN=your_brightdata_token
BRIGHTDATA_DATASET_LINKEDIN=your_dataset_id
BRIGHTDATA_DATASET_REDDIT=your_dataset_id
BRIGHTDATA_DATASET_NEWS=your_dataset_id
BRIGHTDATA_SERP_ZONE=your_serp_zone_name

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key


4. Run the development server

npm run dev


Open http://localhost:3000 with your browser to see the result.

☁️ Deployment (Cloudflare Pages)

This project is configured to deploy seamlessly to Cloudflare Pages.

Ensure your GitHub repository is connected to Cloudflare Pages.

Set all Environment Variables in the Cloudflare Dashboard (Settings > Variables and Secrets).

Security Note: Do not hardcode API keys into wrangler.jsonc if your repository is public.

Push to the main branch to trigger an automatic build and deployment.

📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
