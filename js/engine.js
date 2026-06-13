/*
 * SafeAI Scan — scoring engine
 * Pure functions, no DOM. Easy to unit-test and reuse.
 */

// Weighted average of answered questions within a pillar.
function pillarScore(pillarKey, answers) {
  const qs = QUESTIONS.filter(q => q.pillar === pillarKey && answers[q.id] != null);
  if (!qs.length) return null;
  let num = 0, den = 0;
  for (const q of qs) {
    const opt = q.options[answers[q.id]];
    num += opt.score * q.weight;
    den += q.weight;
  }
  return Math.round(num / den);
}

// Overall score = weighted average across all answered questions.
function overallScore(answers) {
  let num = 0, den = 0;
  for (const q of QUESTIONS) {
    if (answers[q.id] == null) continue;
    const opt = q.options[answers[q.id]];
    num += opt.score * q.weight;
    den += q.weight;
  }
  return den ? Math.round(num / den) : 0;
}

// Traffic light banding.
function band(score) {
  if (score == null) return { level: "na",   label: "Not assessed", color: "#94a3b8" };
  if (score >= 75)   return { level: "green", label: "On track",     color: "#16a34a" };
  if (score >= 45)   return { level: "amber", label: "Needs work",   color: "#d97706" };
  return                    { level: "red",   label: "At risk",      color: "#dc2626" };
}

function grade(score) {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

// Full result object the UI and PDF both consume.
function buildResult(answers) {
  const pillars = Object.keys(PILLARS).map(key => {
    const score = pillarScore(key, answers);
    return { key, ...PILLARS[key], score, band: band(score) };
  });

  const overall = overallScore(answers);

  // Top risks = lowest-scoring pillars that have a fix and a real (red/amber) gap.
  const topRisks = pillars
    .filter(p => p.score != null && p.score < 75 && FIXES[p.key])
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(p => ({ ...p, fix: FIXES[p.key] }));

  return {
    overall,
    grade: grade(overall),
    band: band(overall),
    pillars,
    topRisks,
    answeredCount: Object.keys(answers).length,
    totalCount: QUESTIONS.length,
    date: new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })
  };
}

if (typeof module !== "undefined") module.exports = { pillarScore, overallScore, band, grade, buildResult };
