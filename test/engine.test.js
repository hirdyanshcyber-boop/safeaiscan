/*
 * Minimal sanity tests for the scoring engine. No framework — run with:
 *   node test/engine.test.js
 */
const { PILLARS, QUESTIONS, FIXES } = require("../js/questions.js");
// engine.js references QUESTIONS/PILLARS/FIXES as globals, so expose them:
global.PILLARS = PILLARS; global.QUESTIONS = QUESTIONS; global.FIXES = FIXES;
const { buildResult, overallScore, band } = require("../js/engine.js");

let pass = 0, fail = 0;
function assert(name, cond) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name); }
}

// All questions present and each maps to a known pillar.
assert("21 questions", QUESTIONS.length === 21);
assert("every pillar key valid", QUESTIONS.every(q => PILLARS[q.pillar]));
assert("every option has numeric score", QUESTIONS.every(q => q.options.every(o => typeof o.score === "number")));

// Worst-case answers: pick the lowest-scoring option for every question -> ~0 overall, grade E.
const worst = {};
QUESTIONS.forEach(q => {
  let min = 0;
  q.options.forEach((o, i) => { if (o.score < q.options[min].score) min = i; });
  worst[q.id] = min;
});
const rW = buildResult(worst);
assert("worst-case overall is low", rW.overall <= 15);
assert("worst-case grade E", rW.grade === "E");
assert("worst-case surfaces 3 risks", rW.topRisks.length === 3);

// Best-case answers: highest-scoring option everywhere -> high overall, grade A, no risks.
const best = {};
QUESTIONS.forEach(q => {
  let max = 0;
  q.options.forEach((o, i) => { if (o.score > q.options[max].score) max = i; });
  best[q.id] = max;
});
const rB = buildResult(best);
assert("best-case overall is high", rB.overall >= 90);
assert("best-case grade A", rB.grade === "A");
assert("best-case no top risks", rB.topRisks.length === 0);

// Bands.
assert("band green", band(80).level === "green");
assert("band amber", band(50).level === "amber");
assert("band red", band(20).level === "red");

// Partial answers still score.
assert("partial scores", typeof overallScore({ q1: 0, q17: 2 }) === "number");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
