# SafeAI Scan

**A free 5-minute AI security check for Australian small businesses.**

Most small businesses are now running on AI tools they never set any rules
around. Staff paste customer details, payroll and contracts into free ChatGPT
accounts that quietly keep the data. SafeAI Scan gives an owner a plain-English
read on where they're exposed — in about the time it takes to make a coffee.

---

## The problem I built it for

- Around **73%** of small businesses now use AI tools, and roughly **40%** have
  no policy around it at all.
- Pasting sensitive data into free AI tools is the **number-one cause** of
  small-business AI data leaks.
- From **10 December 2026**, a new Privacy Act rule (APP 1.7) will require many
  Australian businesses to disclose AI-driven decisions about people in their
  privacy policy. Penalties for serious breaches now reach **$50M**.
- Enterprise AI-security platforms exist, but none of them speak to a tradie, a
  bookkeeper or a local clinic. That gap is exactly who this is for.

## What it does

The owner answers 20 plain-English questions. SafeAI Scan turns that into a
traffic-light scorecard across three things that actually matter to them:

- the six **AI6** essential practices (National AI Centre's Guidance for AI Adoption),
- their **shadow-AI and data-leak** risk, and
- the **cyber basics** (in the spirit of the ACSC Essential Eight).

They walk away with a report that names their three biggest risks in plain
English and gives them a simple 30-day plan to fix them.

## Why it's grounded in real frameworks

This isn't a made-up checklist. Every question maps to something a business in
Australia genuinely has to think about:

| Area | What it's based on |
|------|--------------------|
| AI governance | National AI Centre — Guidance for AI Adoption (AI6), Oct 2025 |
| AI + personal data | Privacy Act 1988 reforms — APP 1.7 automated-decision disclosure |
| Cyber baseline | ACSC Essential Eight |
| Shadow AI | OWASP LLM Top 10 risks, applied at a small-business level |

## Why it matters

- **For the business:** a fast, honest answer to *"are we doing anything risky
  with AI?"* — plus a report they can hand to an insurer or a larger client who
  asks how they handle data.
- **A head start** on the December 2026 Privacy Act change, before it turns into
  a last-minute scramble.
- **For me:** it's a real product built from my AI-governance work, sized down
  to something a small business will actually use.

## How it works (in brief)

A lightweight web app — no heavy backend. The scoring logic is a set of small,
testable functions; the report is generated in the browser; and an optional
serverless function can email the report straight to the visitor. Built to run
cheaply and load instantly.

## Where it's going

1. **Now** — the shadow-AI and AI6 check (this version).
2. **Next** — a module for *agentic* AI: tools that can act on their own, which
   is the fastest-growing risk heading into 2026.
3. **Later** — a quarterly re-scan so a business can track its score over time,
   instead of a one-off snapshot.

---

## About

Built by **Hirdyansh Dudi** — focused on AI security and governance for the
Australian market. SafeAI Scan grew out of CruxGuard, an AI governance framework
I've been developing, reworked into something a small business can pick up in
five minutes.

*SafeAI Scan is an indicative self-assessment to help a business understand
where it stands. It's a starting point, not formal legal or compliance advice.*
