/*
 * Cloudflare Pages Function — POST /api/send-report
 *
 * Emails the visitor their PDF report (as an attachment) and pings you with
 * the lead. Runs at the edge, no server to manage.
 *
 * Set these in Cloudflare Pages → Settings → Environment variables:
 *   RESEND_API_KEY  (required)  - from resend.com (free tier: 3,000 emails/mo)
 *   SAFEAI_FROM     (optional)  - verified sender, e.g. "SafeAI Scan <report@safeaiscan.com.au>"
 *   SAFEAI_NOTIFY   (optional)  - your inbox, to get a lead alert per submission
 *
 * Until RESEND_API_KEY is set, the endpoint returns 503 and the frontend
 * falls back to the in-browser PDF download — nothing breaks.
 */

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

const esc = (s = "") =>
  String(s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad request" }, 400);
  }

  const { email, name, business, pdfBase64, score, grade } = body || {};
  if (!email || !pdfBase64) return json({ ok: false, error: "missing email or report" }, 400);
  if (!env.RESEND_API_KEY) return json({ ok: false, error: "email not configured" }, 503);

  const from = env.SAFEAI_FROM || "SafeAI Scan <onboarding@resend.dev>";

  const send = (to, subject, html, attachments) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from, to, subject, html, attachments })
    });

  const hi = name ? ` ${esc(name)}` : " there";
  const biz = business ? esc(business) : "your business";

  // 1) report to the visitor
  const reportHtml =
    `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0f172a;line-height:1.6">` +
    `<p>Hi${hi},</p>` +
    `<p>Thanks for running ${biz} through SafeAI Scan. Your report is attached — ` +
    `you scored <strong>${esc(score)}/100 (Grade ${esc(grade)})</strong>.</p>` +
    `<p>Inside you'll find your three biggest risks in plain English, and a simple 30-day plan ` +
    `to sort them out. Work through it at your own pace.</p>` +
    `<p>If you'd like a hand with any of it, just reply to this email.</p>` +
    `<p>SafeAI Scan<br><span style="color:#64748b">safeaiscan.com.au</span></p>` +
    `</div>`;

  const r = await send(
    [email],
    "Your SafeAI Scan report",
    reportHtml,
    [{ filename: "SafeAI-Scan-Report.pdf", content: pdfBase64 }]
  );

  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    return json({ ok: false, error: "send failed", detail }, 502);
  }

  // 2) lead alert to you (best-effort, never blocks the visitor's email)
  if (env.SAFEAI_NOTIFY) {
    const leadHtml =
      `<p><strong>New SafeAI Scan lead</strong></p>` +
      `<p>Name: ${esc(name) || "(none)"}<br>Email: ${esc(email)}<br>` +
      `Business: ${esc(business) || "(none)"}<br>Score: ${esc(score)}/100 (Grade ${esc(grade)})</p>`;
    try {
      await send([env.SAFEAI_NOTIFY], `New lead: ${esc(business) || esc(email)}`, leadHtml);
    } catch { /* ignore */ }
  }

  return json({ ok: true });
}
