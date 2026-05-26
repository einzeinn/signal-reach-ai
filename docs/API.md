# SignalReach AI — API Reference

## Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://your-app.vercel.app/api`

---

## Endpoints

### 1. `GET /api/signals`
Fetches and aggregates all intent signals for a target company.

**Query Parameters:**

| Parameter | Type   | Required | Description                  |
|-----------|--------|----------|------------------------------|
| `company` | string | ✅ Yes   | Name of the target company   |

**Example Request:**
```
GET /api/signals?company=Acme+Corp
```

**Success Response `200`:**
```json
{
  "company": "Acme Corp",
  "fetchedAt": "2026-05-19T15:00:00.000Z",
  "signals": {
    "jobs": [
      {
        "role": "Head of IT Infrastructure",
        "postedAt": "2026-05-18T10:00:00Z",
        "rawText": "Looking for an experienced IT leader...",
        "source": "LinkedIn"
      }
    ],
    "reddit": [
      {
        "subreddit": "r/sysadmin",
        "title": "Acme Corp's current internal tools are a nightmare",
        "body": "Does anyone know what CRM Acme uses?...",
        "upvotes": 142
      }
    ],
    "news": [
      {
        "headline": "Acme Corp Secures Series B Funding",
        "summary": "The $50M round will be used to upgrade their tech stack...",
        "publishedAt": "2026-05-15T08:30:00Z",
        "url": "https://techcrunch.mock/acme-corp-series-b"
      }
    ]
  },
  "summary": {
    "totalSignals": 3,
    "jobCount": 1,
    "redditCount": 1,
    "newsCount": 1
  }
}
```

**Error Responses:**
| Status | Reason                               |
|--------|--------------------------------------|
| `400`  | Missing or invalid `company` param   |
| `500`  | Signal fetching failed               |

---

### 2. `POST /api/score`
Analyzes signals with Gemini AI and returns an intent score (0–100).

**Request Body:**
```json
{
  "company": "Acme Corp"
}
```

**Success Response `200`:**
```json
{
  "company": "Acme Corp",
  "scoredAt": "2026-05-19T15:00:00.000Z",
  "score": 87,
  "reasoning": "Company is actively hiring for the exact role our solution augments, and public complaints confirm internal tool frustration.",
  "keySignals": [
    "Hiring Head of IT Infrastructure",
    "CRM complaint on r/sysadmin",
    "Series B funding secured"
  ],
  "signalSummary": {
    "jobCount": 1,
    "redditCount": 1,
    "newsCount": 1
  }
}
```

**Error Responses:**
| Status | Reason                                         |
|--------|------------------------------------------------|
| `400`  | Missing or invalid `company` field             |
| `503`  | `GEMINI_API_KEY` not configured                |
| `500`  | Scoring failed                                 |

---

### 3. `POST /api/outreach`
Runs the full pipeline (signals → score → email) and returns a personalized cold email draft.

**Request Body:**
```json
{
  "company": "Acme Corp",
  "recipientName": "Sarah"
}
```

**Success Response `200`:**
```json
{
  "company": "Acme Corp",
  "recipientName": "Sarah",
  "generatedAt": "2026-05-19T15:00:00.000Z",
  "intentScore": 87,
  "email": {
    "subject": "7 AI hires + legacy CRM = a bottleneck you don't need",
    "body": "Hi Sarah,\n\nI noticed Acme Corp posted 7 AI Engineer roles in the last 30 days..."
  },
  "context": {
    "keySignals": ["Hiring Head of IT Infrastructure", "CRM complaint on r/sysadmin"],
    "reasoning": "Strong multi-source signal alignment.",
    "signalCounts": {
      "jobs": 1,
      "reddit": 1,
      "news": 1
    }
  }
}
```

**Error Responses:**
| Status | Reason                                              |
|--------|-----------------------------------------------------|
| `400`  | Missing `company` or `recipientName`                |
| `503`  | `GEMINI_API_KEY` not configured                     |
| `500`  | Generation failed                                   |

---

## Data Provider Switch

Control which data source is used via the `DATA_PROVIDER` environment variable:

| Value         | Behavior                                          |
|---------------|---------------------------------------------------|
| `mock`        | Uses local JSON mock data. Fast. No API calls.    |
| `brightdata`  | Uses live Bright Data scraping. Requires API key. |

> **Hackathon Tip:** Keep `DATA_PROVIDER=mock` during development. Switch to `brightdata` only during your live demo.
