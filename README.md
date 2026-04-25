# CyberRisk AI

AI-powered cyber risk assessment for startups. Enter your tech stack, get a prioritised list of vulnerabilities, scored by likelihood × impact × exposure, and enriched with actionable fixes by an LLM.

**Live demo:** https://cyber-risk-app.vercel.app  
**Case study:** https://cyber-risk-app.vercel.app/case-study

---

## What it does

1. You enter your company type and tech stack (AWS, MongoDB, Stripe, etc.)
2. A deterministic risk mapping engine identifies known vulnerabilities for each technology
3. A scoring model quantifies each risk: `score = likelihood × impact × exposure`
4. The top 5 risks are sent to Groq (Llama 3) for AI-generated descriptions, business impact analysis, and mitigation steps
5. Results are stored in Supabase and displayed on a shareable dashboard

---

## Architecture

```
Frontend (Next.js App Router)
        ↓
POST /api/analyze
        ↓
┌─────────────────────────────────────┐
│           Analysis Pipeline         │
│                                     │
│  1. Risk Mapping Engine             │
│     Stack → known vulnerability     │
│     knowledge base (25+ risks,      │
│     12 technologies)                │
│                                     │
│  2. Scoring Engine                  │
│     Likelihood × Impact × Exposure  │
│     → 0–100 score per risk          │
│     → Critical / High / Medium / Low│
│                                     │
│  3. AI Enrichment (Groq/Llama 3)    │
│     Top 5 risks → LLM prompt →      │
│     description + business impact   │
│     + mitigation                    │
│                                     │
│  4. Prioritisation                  │
│     Sort by score + severity        │
│                                     │
│  5. Report Assembly                 │
│     Overall score, summary,         │
│     top actions, full risk list     │
└─────────────────────────────────────┘
        ↓
Supabase (assessments + risks tables)
        ↓
Dashboard — score ring, breakdown, expandable risk cards
```

### Why this architecture?

The LLM is deliberately **not** doing the risk identification or scoring. Those are deterministic, explainable, and fast. The LLM only handles the interpretation layer — turning a structured risk object into human-readable context. This separation means:

- Results are consistent and auditable
- Scoring logic can be tested independently
- LLM failures degrade gracefully (raw risk data still shows)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| Backend | Next.js API routes |
| AI | Groq API (Llama 3.3 70B) |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel |

---

## Risk scoring model

Each vulnerability in the knowledge base is assigned three dimensions:

- **Likelihood (1–5):** How commonly is this misconfiguration seen in the wild?
- **Impact (1–5):** What is the potential damage if exploited?
- **Exposure (1–5):** How exposed is this vector given a typical deployment?

```
Score = Likelihood × Impact × Exposure  (max: 125, normalised to 100)

Critical  80–100
High      60–79
Medium    30–59
Low       < 30
```

The overall assessment score is the weighted average of the top 5 risks.

---

## Case study — PayFlow Fintech

A simulated fintech startup processing $2M/month was assessed against a stack of AWS + MongoDB + Stripe + React + Node.js.

| | Before | After |
|---|---|---|
| Overall score | 82 (High) | 35 (Moderate) |
| Critical risks | 1 | 0 |
| High risks | 3 | 0 |
| Medium risks | 7 | 3 |

Key fixes: S3 bucket policies, MongoDB authentication, IAM least privilege, Stripe key rotation, EC2 security groups.

Full case study: https://cyber-risk-app.vercel.app/case-study

---

## Running locally

```bash
git clone https://github.com/YOUR_USERNAME/cyber-risk-app
cd cyber-risk-app
npm install
```

Create `.env.local`:

```
GROQ_API_KEY=your_groq_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

Open http://localhost:3000

---

## Database schema

```sql
create table assessments (
  id uuid primary key default gen_random_uuid(),
  company_type text not null,
  stack text[] not null,
  notes text,
  overall_score integer not null,
  summary text not null,
  top_actions text[] not null,
  created_at timestamptz default now()
);

create table risks (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  risk text not null,
  source text not null,
  severity text not null,
  score integer not null,
  likelihood integer not null,
  impact integer not null,
  exposure integer not null,
  description text,
  business_impact text,
  mitigation text
);
```

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── assess/page.tsx           # Input form
│   ├── dashboard/[id]/page.tsx   # Results dashboard
│   ├── case-study/page.tsx       # PayFlow demo
│   └── api/analyze/route.ts      # Core API endpoint
├── lib/
│   ├── riskMapping.ts            # Tech stack → vulnerability knowledge base
│   ├── groqClient.ts             # Groq API wrapper + prompt
│   └── supabase.ts               # Supabase client
└── types/
    └── index.ts                  # Shared TypeScript 
```

---

## What I'd add next

- CVE database integration for real-time vulnerability data
- "What if I fix this?" score simulation
- Multi-user accounts with assessment history
- Compliance mapping (SOC 2, ISO 27001)
- PDF report export
```