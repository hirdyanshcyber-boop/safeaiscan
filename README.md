# 🛡️ SafeAI Scan

**The free 5-minute AI security health check for Australian small business.**

A static web tool: a business owner answers 20 plain-English questions, gets an
instant traffic-light scorecard mapped to the National AI Centre's **AI6**
guidance (Oct 2025), and downloads a branded PDF with their top 3 risks and a
30-day fix plan. The email they enter to get the report is your sales lead.

- **Zero backend required** to deploy — pure HTML/CSS/JS, PDF generated in-browser.
- **Live counter + share card** built in as the viral growth loop.
- Optional Supabase (shared live stats) + Formspree (email leads) — 10-min setup.

---

## Run locally

```powershell
# from the project root
python -m http.server 8000   # or: npx serve .
# open http://localhost:8000
```

No build step. Edit a file, refresh.

---

## Deploy (free)

### Cloudflare Pages (recommended)
1. Push this repo to GitHub.
2. Cloudflare dashboard → Pages → *Connect to Git* → pick the repo.
3. Build command: *(none)*. Output directory: `/`.
4. Add your custom domain `safeaiscan.com.au`.

### GitHub Pages
Settings → Pages → deploy from `main` / root. Done.

---

## Going live (optional backends)

### 0. Auto-email the PDF report to the visitor (Resend + Cloudflare Function)

This is the recommended path — the visitor gets their branded report in their
inbox automatically, and you get a lead alert. Code already lives in
`functions/api/send-report.js`; it runs for free on Cloudflare Pages.

1. Sign up at [resend.com](https://resend.com) (free: 3,000 emails/month). Create an API key.
2. Verify your sending domain in Resend (add the DNS records to `safeaiscan.com.au`)
   so emails don't go to spam.
3. Cloudflare Pages → your project → **Settings → Environment variables**, add:
   - `RESEND_API_KEY` — your key (required)
   - `SAFEAI_FROM` — e.g. `SafeAI Scan <report@safeaiscan.com.au>` (optional)
   - `SAFEAI_NOTIFY` — your inbox, to get a lead alert per submission (optional)
4. Redeploy. Done — the report now emails itself.

Until `RESEND_API_KEY` is set, the endpoint returns 503 and the site quietly
falls back to the in-browser PDF download. Nothing breaks in local dev.

The other two below are optional extras.

### 1. Email leads → your inbox (Formspree, free tier)
1. Sign up at formspree.io, create a form, copy its ID (e.g. `xanbgkqz`).
2. Set `FORMSPREE_ID: "xanbgkqz"`.
   Every completed assessment now emails you the lead (name, business, email, score).

Until you set this, leads are stored in the browser. Run `exportLeadsCSV()` in
the dev console to pull them out during local testing.

### 2. Shared live counter (Supabase, free tier)
1. Create a project at supabase.com. Copy the project URL + anon key.
2. Run `supabase-schema.sql` (in this repo) in the Supabase SQL editor.
3. Set `SUPABASE_URL` and `SUPABASE_KEY` in `CONFIG`.

Without Supabase the counter runs off `SEED_COUNT` + this browser's local tally —
fine for launch, but the number won't be shared across visitors.

---

## How scoring works

- 20 questions, each weighted (shadow-AI / data-leak questions hit hardest —
  that's the real-world #1 incident cause).
- Grouped into 8 pillars: the six AI6 practices + *Shadow AI* + *Cyber baseline*.
- Each pillar gets a weighted-average 0–100 score and a traffic light
  (green ≥75 / amber ≥45 / red <45). Overall score = weighted average of all answers.
- Top 3 risks = lowest-scoring pillars with a fix; surfaced in the report.

All logic is pure functions in `js/engine.js` — see `test/engine.test.js`.

---

## File map

| File | Job |
|------|-----|
| `index.html` | Markup + screen layout (landing → quiz → gate → dashboard) |
| `styles.css` | All styling |
| `js/questions.js` | The 20-question bank, AI6 pillar map, plain-English fixes |
| `js/engine.js` | Pure scoring functions |
| `js/store.js` | Live counter + lead capture (localStorage / Supabase / Formspree) |
| `js/report.js` | Branded PDF generator (jsPDF) — build / download / base64 |
| `js/app.js` | UI controller / flow |
| `functions/api/send-report.js` | Cloudflare Function: emails the PDF via Resend |
| `supabase-schema.sql` | DB tables + RPC for the shared live counter |

---

## Roadmap (the market-changing path)

1. **Now** — Shadow-AI check (this build). No competitor at SMB level.
2. **+6 mo** — Agentic-AI module: questions on AI agents that act autonomously.
3. **+12 mo** — Continuous monitoring: quarterly re-scan, score-over-time,
   alerts on new AI risks. Recurring product → you own the Aussie SMB AI-risk dataset.

---

*Indicative self-assessment. Not legal or compliance advice. Mapped to the
National AI Centre's [Guidance for AI Adoption (AI6)](https://www.ai.gov.au/staying-safe-and-responsible/essential-ai-practices).*
