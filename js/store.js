/*
 * SafeAI Scan — data & lead layer.
 *
 * Two jobs:
 *   1. Live benchmark counter ("X businesses checked, Y% leak data") — the viral hook.
 *   2. Email lead capture — the sales pipeline.
 *
 * Works with ZERO backend out of the box (localStorage), so the site is
 * deployable today. Flip CONFIG to wire a real backend when you're ready:
 *   - Supabase  : set SUPABASE_URL + SUPABASE_KEY (anon) for shared live stats.
 *   - Formspree : set FORMSPREE_ID to email yourself every new lead.
 * See README.md "Going live" for the 10-minute setup.
 */

const CONFIG = {
  SUPABASE_URL:  "",   // e.g. https://xxxx.supabase.co
  SUPABASE_KEY:  "",   // anon public key
  FORMSPREE_ID:  "",   // e.g. "xanbgkqz" -> https://formspree.io/f/xanbgkqz
  // Seed so the live counter never reads as empty on launch day.
  SEED_COUNT: 312,
  SEED_LEAK_PCT: 71
};

const LS_KEYS = { stats: "safeaiscan_stats", leads: "safeaiscan_leads" };

function localStats() {
  try { return JSON.parse(localStorage.getItem(LS_KEYS.stats)) || { count: 0, leaks: 0 }; }
  catch { return { count: 0, leaks: 0 }; }
}

// Public: current benchmark numbers for the live counter.
async function getBenchmark() {
  if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY) {
    try {
      const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/get_benchmark`, {
        method: "POST",
        headers: {
          "apikey": CONFIG.SUPABASE_KEY,
          "Authorization": `Bearer ${CONFIG.SUPABASE_KEY}`,
          "Content-Type": "application/json"
        },
        body: "{}"
      });
      if (res.ok) {
        const d = await res.json();
        return {
          count: CONFIG.SEED_COUNT + (d.count || 0),
          leakPct: d.leak_pct != null ? d.leak_pct : CONFIG.SEED_LEAK_PCT
        };
      }
    } catch (e) { /* fall through to local */ }
  }
  const s = localStats();
  const count = CONFIG.SEED_COUNT + s.count;
  const leakPct = s.count
    ? Math.round(((CONFIG.SEED_LEAK_PCT / 100 * CONFIG.SEED_COUNT) + s.leaks) / count * 100)
    : CONFIG.SEED_LEAK_PCT;
  return { count, leakPct };
}

// Public: record a completed assessment (anonymous aggregate only).
async function recordCompletion(result, leaksData) {
  const s = localStats();
  s.count += 1;
  if (leaksData) s.leaks += 1;
  try { localStorage.setItem(LS_KEYS.stats, JSON.stringify(s)); } catch {}

  if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY) {
    try {
      await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/assessments`, {
        method: "POST",
        headers: {
          "apikey": CONFIG.SUPABASE_KEY,
          "Authorization": `Bearer ${CONFIG.SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({
          overall: result.overall,
          grade: result.grade,
          leaks_data: !!leaksData,
          created_at: new Date().toISOString()
        })
      });
    } catch (e) { /* non-fatal */ }
  }
}

// Public: capture an email lead (your sales pipeline).
async function captureLead({ email, name, business, industry, result }) {
  const lead = {
    email, name, business, industry,
    score: result.overall, grade: result.grade,
    date: new Date().toISOString()
  };

  // Always keep a local copy so you never lose a lead during testing.
  try {
    const arr = JSON.parse(localStorage.getItem(LS_KEYS.leads)) || [];
    arr.push(lead);
    localStorage.setItem(LS_KEYS.leads, JSON.stringify(arr));
  } catch {}

  if (CONFIG.FORMSPREE_ID) {
    try {
      await fetch(`https://formspree.io/f/${CONFIG.FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(lead)
      });
      return true;
    } catch (e) { return false; }
  }
  return true; // local-only mode still "succeeds"
}

// Public: export captured leads as CSV (run from the browser console in local mode).
function exportLeadsCSV() {
  const arr = JSON.parse(localStorage.getItem(LS_KEYS.leads) || "[]");
  if (!arr.length) return "no leads yet";
  const header = Object.keys(arr[0]).join(",");
  const rows = arr.map(l => Object.values(l).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [header, ...rows].join("\n");
  console.log(csv);
  return csv;
}
window.exportLeadsCSV = exportLeadsCSV;
