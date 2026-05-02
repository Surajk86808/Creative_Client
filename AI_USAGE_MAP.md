# AI Usage Map

This file maps the real AI usage in the current repo so the workflow dependencies are explicit.

## Summary

- `4` direct AI usage areas in the business workflow
- `1` AI integration layer for Gemini MCP access

## Direct AI Usage

| Area | File | Provider / Model | Purpose | Env Var | Required or Optional |
|---|---|---|---|---|---|
| Website content generation | [Leads/backend/website-builder/src/filler.js](/p:/Creative-client-/Leads/backend/website-builder/src/filler.js:12) | Groq / `meta-llama/llama-4-scout-17b-16e-instruct` by default | Generate placeholder values and business copy for websites | `GROQ_API_KEY` | Required for AI website generation |
| Lead scoring / website analysis | [Leads/backend/lead_finder/analyzer.py](/p:/Creative-client-/Leads/backend/lead_finder/analyzer.py:24) | NVIDIA-hosted models via OpenAI client | Score leads and analyze business/web quality | `NVIDIA_API_KEY` | Optional overall, required if AI analysis is used |
| Outreach email generation | [Leads/backend/email_sender/agent.py](/p:/Creative-client-/Leads/backend/email_sender/agent.py:46) | Groq / `meta-llama/llama-4-scout-17b-16e-instruct` | Generate personalized cold outreach emails | `GROQ_API_KEY` | Required for live Groq email generation |
| Email safety / moderation | [Leads/backend/email_sender/agent.py](/p:/Creative-client-/Leads/backend/email_sender/agent.py:947) | NVIDIA / `nvidia/llama-guard-4-12b` | Check generated emails for safety/spam risk | `NVIDIA_API_KEY` | Optional fallback/guard layer |

## AI Integration Layer

| Area | File | Purpose | Env Var | Required or Optional |
|---|---|---|---|---|
| Gemini MCP bridge | [Mcp/server.py](/p:/Creative-client-/Mcp/server.py:1) | Exposes the pipeline as tools to Gemini CLI | `NEXVIA_ROOT` | Optional integration layer |

## Notes About Gemini Mentions

You will see many `GEMINI_API_KEY` and `@google/genai` references in:

- `Leads/backend/website-builder/global-website/*`
- `Leads/backend/nexviamain_web/*`
- `Leads/backend/output/*`

These currently look like imported AI Studio templates or generated app scaffolds. They are not part of the canonical backend pipeline path driven by:

- [run_pipeline.py](/p:/Creative-client-/run_pipeline.py)
- [Leads/backend/run_pipeline.py](/p:/Creative-client-/Leads/backend/run_pipeline.py)

## Current Config Contract

### Required for the main documented backend flow

- `GROQ_API_KEY`
- `VERCEL_TOKEN`
- `EMAIL_SMTP_HOST`
- `EMAIL_SMTP_USER`
- `EMAIL_SMTP_PASS`
- `EMAIL_HOST_PASSWORD`

### Optional AI-specific keys

- `NVIDIA_API_KEY`
  Enables AI lead analysis and NVIDIA-backed email safety/generation paths.

## Recommended Next AI Upgrades

- AI-assisted website review scoring on top of the current rule-based checker
- AI-ranked outreach priority based on conversion likelihood
- AI-generated WhatsApp openers for no-email leads
- Competitor-aware pitch generation using local market context
- Follow-up sequence generation after first outreach
- AI summary cards in the dashboard for bottlenecks and best-performing categories
