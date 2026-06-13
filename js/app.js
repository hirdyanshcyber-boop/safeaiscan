/*
 * SafeAI Scan — UI controller.
 * Flow: landing -> one-question-at-a-time quiz -> email gate -> dashboard.
 */

const state = { idx: 0, answers: {}, result: null, meta: {} };
const $ = sel => document.querySelector(sel);
const screens = ["landing", "quiz", "gate", "dashboard"];

function show(screen) {
  screens.forEach(s => $("#" + s).classList.toggle("active", s === screen));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Live counter ---------- */
async function refreshCounter() {
  const b = await getBenchmark();
  const el = $("#live-count");
  if (el) animateNumber(el, b.count);
  const leak = $("#live-leak");
  if (leak) leak.textContent = b.leakPct + "%";
}

function animateNumber(el, target) {
  const start = parseInt(el.textContent.replace(/\D/g, "")) || 0;
  const dur = 800, t0 = performance.now();
  function step(t) {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(start + (target - start) * p).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- Quiz ---------- */
function startQuiz() {
  state.idx = 0;
  state.answers = {};
  show("quiz");
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[state.idx];
  const pct = Math.round((state.idx) / QUESTIONS.length * 100);
  $("#progress-bar").style.width = pct + "%";
  $("#progress-text").textContent = `Question ${state.idx + 1} of ${QUESTIONS.length}`;
  $("#pillar-tag").textContent = PILLARS[q.pillar].name;

  const opts = q.options.map((o, i) => {
    const sel = state.answers[q.id] === i ? " selected" : "";
    return `<button class="option${sel}" data-i="${i}">
      <span class="opt-radio"></span><span>${o.label}</span></button>`;
  }).join("");

  $("#question-card").innerHTML = `
    <h2 class="q-text">${q.text}</h2>
    <p class="q-help">${q.help}</p>
    <div class="options">${opts}</div>`;

  document.querySelectorAll(".option").forEach(btn => {
    btn.addEventListener("click", () => {
      state.answers[q.id] = parseInt(btn.dataset.i);
      document.querySelectorAll(".option").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      setTimeout(next, 220);
    });
  });

  $("#back-btn").style.visibility = state.idx === 0 ? "hidden" : "visible";
}

function next() {
  if (state.answers[QUESTIONS[state.idx].id] == null) return;
  if (state.idx < QUESTIONS.length - 1) {
    state.idx++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function back() {
  if (state.idx > 0) { state.idx--; renderQuestion(); }
}

function finishQuiz() {
  state.result = buildResult(state.answers);
  $("#progress-bar").style.width = "100%";
  // Preview score on the gate to earn the email.
  $("#gate-score").textContent = state.result.overall;
  $("#gate-grade").textContent = "Grade " + state.result.grade;
  $("#gate-score").style.color = state.result.band.color;
  show("gate");
}

/* ---------- Email gate ---------- */
async function submitGate(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  if (state.submitting) return;              // guard against click + Enter double-fire
  const email = $("#email").value.trim();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) { $("#email").focus(); return; }
  state.submitting = true;
  state.meta = {
    email,
    name: $("#name").value.trim(),
    business: $("#business").value.trim(),
    industry: $("#industry").value
  };

  $("#gate-submit").disabled = true;
  $("#gate-submit").textContent = "Building your report…";

  const leaksData = state.answers["q1"] != null && state.answers["q1"] <= 1; // pasting sensitive data

  // Build the PDF once here so we can both email it and let them download it.
  let pdfBase64 = null;
  try { pdfBase64 = getReportBase64(state.result, state.meta); } catch (e) { /* download still works */ }

  const [, , emailed] = await Promise.all([
    captureLead({ ...state.meta, result: state.result }),
    recordCompletion(state.result, leaksData),
    pdfBase64 ? emailReport({ ...state.meta, pdfBase64, result: state.result }) : Promise.resolve(false)
  ]);
  state.emailed = emailed;

  renderDashboard();
  show("dashboard");
  refreshCounter();
  $("#gate-submit").disabled = false;
  $("#gate-submit").textContent = "See my results";
  state.submitting = false;
}

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const r = state.result;
  $("#dash-score").textContent = r.overall;
  $("#dash-score").style.color = r.band.color;
  $("#dash-grade").textContent = "Grade " + r.grade;
  $("#dash-band").textContent = r.band.label;
  $("#dash-band").style.background = r.band.color;
  $("#dash-ring").style.background =
    `conic-gradient(${r.band.color} ${r.overall * 3.6}deg, #e2e8f0 0deg)`;

  const es = $("#email-status");
  if (es) es.textContent = state.emailed ? `📧 Report on its way to ${state.meta.email}` : "";

  $("#pillars").innerHTML = r.pillars.map(p => `
    <div class="pillar ${p.band.level}">
      <div class="pillar-head">
        <span class="dot" style="background:${p.band.color}"></span>
        <strong>${p.name}</strong>
        <span class="pillar-score" style="color:${p.band.color}">${p.score != null ? p.score : "—"}</span>
      </div>
      <div class="pillar-ai6">${p.ai6}</div>
      <div class="pillar-bar"><i style="width:${p.score || 0}%;background:${p.band.color}"></i></div>
    </div>`).join("");

  $("#risks").innerHTML = r.topRisks.length ? r.topRisks.map((rk, i) => `
    <div class="risk">
      <div class="risk-num" style="background:${rk.band.color}">${i + 1}</div>
      <div>
        <h4>${rk.fix.title}</h4>
        <p class="risk-meta">${rk.name} · scored ${rk.score}/100</p>
        <ul>${rk.fix.steps.map(s => `<li>${s}</li>`).join("")}</ul>
      </div>
    </div>`).join("")
    : `<p class="all-clear">✅ No major risks flagged. Keep reviewing as you adopt new AI tools.</p>`;
}

/* ---------- Share card ---------- */
function buildShareText() {
  const r = state.result;
  return `I just ran my business through SafeAI Scan and scored ${r.overall}/100 (Grade ${r.grade}) on AI security, mapped to Australia's AI6 guidance. Free 5-min check: https://safeaiscan.com.au`;
}

function shareLinkedIn() {
  const url = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent("https://safeaiscan.com.au");
  window.open(url, "_blank", "width=600,height=600");
}

async function copyShare() {
  try {
    await navigator.clipboard.writeText(buildShareText());
    const b = $("#copy-btn");
    const old = b.textContent;
    b.textContent = "Copied!";
    setTimeout(() => (b.textContent = old), 1500);
  } catch { alert(buildShareText()); }
}

/* ---------- Wire up ---------- */
// bind(selector, event, handler): no-op if the element is missing, so one
// stray selector can never abort the rest of the bindings.
function bind(sel, event, handler) {
  const el = $(sel);
  if (el) el.addEventListener(event, handler);
}

function init() {
  refreshCounter();
  bind("#start-btn", "click", startQuiz);
  bind("#back-btn", "click", back);
  bind("#gate-form", "submit", submitGate);   // Enter key
  bind("#gate-submit", "click", submitGate);  // button (type=button, no native submit)
  bind("#pdf-btn", "click", () => generatePDF(state.result, state.meta));
  bind("#copy-btn", "click", copyShare);
  bind("#linkedin-btn", "click", shareLinkedIn);
  bind("#restart-btn", "click", () => show("landing"));
}

// Run now if the DOM is already parsed (scripts sit at end of <body>),
// otherwise wait for it. Avoids the "DOMContentLoaded already fired" race.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
