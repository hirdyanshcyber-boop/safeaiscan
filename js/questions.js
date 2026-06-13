/*
 * SafeAI Scan — question bank
 * 20 plain-English questions for Australian small business owners.
 * Each maps to an AI6 essential practice (National AI Centre, Oct 2025),
 * a shadow-AI risk, or a cyber-hygiene baseline.
 *
 * Scoring model:
 *   - Each option carries a score 0..100 (higher = safer).
 *   - Questions are grouped by `pillar`. A pillar score is the weighted
 *     average of its questions. Overall score = weighted average of pillars.
 *   - `weight` lets the shadow-AI / data-leak questions hit harder, because
 *     that is the #1 real-world cause of SMB AI incidents.
 */

const PILLARS = {
  accountable:   { name: "Accountability",        ai6: "Decide who is accountable" },
  impacts:       { name: "Impact awareness",       ai6: "Understand impacts and plan accordingly" },
  risks:         { name: "Risk management",        ai6: "Measure and manage risks" },
  transparency:  { name: "Transparency",           ai6: "Share essential information" },
  testing:       { name: "Testing & monitoring",   ai6: "Test and monitor" },
  control:       { name: "Human control",          ai6: "Maintain human control" },
  shadow:        { name: "Shadow AI & data leaks", ai6: "Cross-cutting — staff use of AI tools" },
  cyber:         { name: "Cyber baseline",          ai6: "Foundational hygiene" }
};

const QUESTIONS = [
  // ---- Shadow AI / data leaks (highest weight — the real killer) ----
  {
    id: "q1", pillar: "shadow", weight: 3,
    text: "Do staff paste customer details, payroll, or other sensitive info into free AI tools (e.g. ChatGPT)?",
    help: "Free AI tools can keep and learn from whatever you type in. This is the #1 cause of small-business AI data leaks.",
    options: [
      { label: "Yes, regularly",                     score: 0 },
      { label: "Sometimes / not sure",               score: 25 },
      { label: "Rarely, and only non-sensitive info", score: 70 },
      { label: "No — we have clear rules against it", score: 100 }
    ]
  },
  {
    id: "q2", pillar: "shadow", weight: 2,
    text: "Do staff use personal AI accounts for work tasks?",
    help: "Personal accounts sit outside any business control — IT can't see or secure what's shared.",
    options: [
      { label: "Yes, that's normal here",            score: 0 },
      { label: "Some do",                             score: 30 },
      { label: "Only approved business accounts",     score: 100 },
      { label: "We don't use AI tools at all",        score: 80 }
    ]
  },
  {
    id: "q3", pillar: "shadow", weight: 2,
    text: "Do any AI tools have access to your email, files, or Google Drive / OneDrive?",
    help: "Connected AI tools can read far more than you intend. A breach there exposes everything they can reach.",
    options: [
      { label: "Yes, and we haven't reviewed it",     score: 0 },
      { label: "Yes, but access is limited",          score: 50 },
      { label: "No, or read-only on specific folders",score: 90 },
      { label: "Not sure",                            score: 15 }
    ]
  },
  {
    id: "q4", pillar: "shadow", weight: 2,
    text: "Do you use AI tools that can act on their own — send emails, book, or pay — without a person approving each action?",
    help: "Autonomous 'AI agents' are the fastest-growing risk in 2026. An unsupervised agent can cause real damage fast.",
    options: [
      { label: "Yes, with no approval step",          score: 0 },
      { label: "Yes, but a person reviews first",     score: 70 },
      { label: "No — AI only suggests, people act",   score: 100 },
      { label: "Not sure",                            score: 20 }
    ]
  },

  // ---- AI6: Accountability ----
  {
    id: "q5", pillar: "accountable", weight: 2,
    text: "Is there a specific person responsible for how AI is used in your business?",
    help: "AI6 practice 1: every AI use should have a clear owner — someone accountable when it goes wrong.",
    options: [
      { label: "No one in particular",               score: 0 },
      { label: "Informally, the owner/manager",       score: 50 },
      { label: "Yes, a named person owns it",         score: 100 }
    ]
  },
  {
    id: "q6", pillar: "accountable", weight: 1,
    text: "Do you keep a list of the AI tools your business actually uses?",
    help: "You can't govern what you can't see. An inventory is the first step.",
    options: [
      { label: "No",                                  score: 0 },
      { label: "Roughly, in my head",                 score: 40 },
      { label: "Yes, a written list we keep current", score: 100 }
    ]
  },

  // ---- AI6: Impact awareness ----
  {
    id: "q7", pillar: "impacts", weight: 1,
    text: "Have you thought through what could go wrong if AI gives a customer wrong or misleading information?",
    help: "AI6 practice 2: identify who's affected and classify uses by how much harm a mistake could cause.",
    options: [
      { label: "Never considered it",                score: 0 },
      { label: "A little",                            score: 50 },
      { label: "Yes, and we limit AI in risky areas", score: 100 }
    ]
  },
  {
    id: "q8", pillar: "impacts", weight: 1,
    text: "Do you use AI for anything high-stakes (legal, medical, financial, hiring advice) given to customers?",
    help: "High-stakes uses need the most care — a wrong AI answer here can mean real harm or liability.",
    options: [
      { label: "Yes, with no extra checks",           score: 0 },
      { label: "Yes, but a qualified person checks",  score: 80 },
      { label: "No high-stakes use",                  score: 100 }
    ]
  },

  // ---- AI6: Risk management ----
  {
    id: "q9", pillar: "risks", weight: 2,
    text: "Do you have any written rules or policy for staff using AI tools?",
    help: "AI6 practice 3: 40% of SMBs have no AI policy at all. A one-page policy closes most of the gap.",
    options: [
      { label: "No policy",                           score: 0 },
      { label: "Verbal guidance only",                score: 35 },
      { label: "Yes, a written AI use policy",        score: 100 }
    ]
  },
  {
    id: "q10", pillar: "risks", weight: 1,
    text: "Before adopting a new AI tool, do you check what it does with your data?",
    help: "Some AI tools train on your inputs or store data overseas. Read the terms before you trust it.",
    options: [
      { label: "No, we just start using it",          score: 0 },
      { label: "Sometimes",                           score: 40 },
      { label: "Yes, every time",                     score: 100 }
    ]
  },

  // ---- AI6: Transparency ----
  {
    id: "q11", pillar: "transparency", weight: 1,
    text: "Do you tell customers when AI is involved in serving them (e.g. an AI chatbot or AI-written advice)?",
    help: "AI6 practice 4: being upfront about AI builds trust and is increasingly expected.",
    options: [
      { label: "No",                                  score: 0 },
      { label: "Sometimes",                           score: 50 },
      { label: "Yes, clearly",                        score: 100 },
      { label: "We don't use customer-facing AI",     score: 90 }
    ]
  },

  {
    id: "q21", pillar: "transparency", weight: 2,
    text: "Does your privacy policy say how you use AI — especially for decisions about customers?",
    help: "From December 2026, Australian privacy law (new APP 1.7) requires many businesses to disclose AI-driven decisions in their privacy policy. Getting ahead of it is cheap; scrambling later isn't.",
    options: [
      { label: "We don't have a privacy policy",          score: 0 },
      { label: "We have one, but it doesn't mention AI",   score: 35 },
      { label: "Not sure",                                 score: 20 },
      { label: "Yes, it covers how we use AI",             score: 100 }
    ]
  },

  // ---- AI6: Testing & monitoring ----
  {
    id: "q12", pillar: "testing", weight: 2,
    text: "Do you check AI outputs for accuracy before relying on them?",
    help: "AI6 practice 5: AI confidently makes things up ('hallucinations'). A human check catches it.",
    options: [
      { label: "No, we trust the output",             score: 0 },
      { label: "Sometimes",                           score: 45 },
      { label: "Yes, always reviewed before use",     score: 100 }
    ]
  },
  {
    id: "q13", pillar: "testing", weight: 1,
    text: "Would you know if an AI tool started leaking data or behaving badly?",
    help: "Ongoing monitoring matters — most shadow-AI incidents go unnoticed for weeks.",
    options: [
      { label: "No way to know",                      score: 0 },
      { label: "Maybe, eventually",                   score: 40 },
      { label: "Yes, we'd spot it quickly",           score: 100 }
    ]
  },

  // ---- AI6: Human control ----
  {
    id: "q14", pillar: "control", weight: 2,
    text: "Can a person always override or reject an AI decision before it affects a customer?",
    help: "AI6 practice 6: humans must keep final say, especially in anything important.",
    options: [
      { label: "No, AI acts automatically",           score: 0 },
      { label: "For some things",                     score: 50 },
      { label: "Yes, always",                         score: 100 }
    ]
  },
  {
    id: "q15", pillar: "control", weight: 1,
    text: "Do staff know what they are NOT allowed to use AI for?",
    help: "Clear 'no-go' zones stop the worst mistakes before they happen.",
    options: [
      { label: "No",                                  score: 0 },
      { label: "Roughly",                             score: 45 },
      { label: "Yes, clearly communicated",           score: 100 }
    ]
  },
  {
    id: "q16", pillar: "control", weight: 1,
    text: "Have staff had any training on safe AI use?",
    help: "Training is the cheapest, highest-return control you can put in place.",
    options: [
      { label: "None",                                score: 0 },
      { label: "Informal chat",                       score: 40 },
      { label: "Yes, proper training",                score: 100 }
    ]
  },

  // ---- Cyber baseline (Essential Eight flavour) ----
  {
    id: "q17", pillar: "cyber", weight: 2,
    text: "Is multi-factor authentication (MFA) turned on for email and key business accounts?",
    help: "MFA blocks the vast majority of account takeovers — and AI-powered phishing is now near-perfect.",
    options: [
      { label: "No",                                  score: 0 },
      { label: "On some accounts",                    score: 50 },
      { label: "Yes, on all key accounts",            score: 100 }
    ]
  },
  {
    id: "q18", pillar: "cyber", weight: 1,
    text: "Do you have working, tested backups of your important data?",
    help: "Backups are your safety net against ransomware and accidental loss.",
    options: [
      { label: "No backups",                          score: 0 },
      { label: "Some, never tested",                  score: 45 },
      { label: "Yes, automatic and tested",           score: 100 }
    ]
  },
  {
    id: "q19", pillar: "cyber", weight: 1,
    text: "Are staff trained to spot phishing and scam messages?",
    help: "AI now writes flawless phishing emails and clones voices. Awareness is the front line.",
    options: [
      { label: "No",                                  score: 0 },
      { label: "Informally",                          score: 45 },
      { label: "Yes, regularly",                      score: 100 }
    ]
  },
  {
    id: "q20", pillar: "cyber", weight: 1,
    text: "Are your devices and software kept up to date with security patches?",
    help: "Most breaches exploit known holes that a simple update would have closed.",
    options: [
      { label: "Rarely / not sure",                   score: 0 },
      { label: "Manually, sometimes",                 score: 45 },
      { label: "Yes, automatic updates on",           score: 100 }
    ]
  }
];

// Plain-English fixes shown for the weakest pillars in the report.
const FIXES = {
  shadow: {
    title: "Stop sensitive data leaking into AI tools",
    steps: [
      "Write a one-line rule: never paste customer, payroll, or financial data into free AI tools.",
      "Move staff onto a business AI account (ChatGPT Team / Microsoft Copilot) where data isn't used for training.",
      "Review what your AI tools can access — turn off email/file connections you don't need."
    ]
  },
  accountable: {
    title: "Put someone in charge of AI",
    steps: [
      "Name one person responsible for AI use (it can be the owner).",
      "Make a simple list of every AI tool the business uses.",
      "Review the list every quarter."
    ]
  },
  impacts: {
    title: "Know where AI mistakes would hurt most",
    steps: [
      "List where you use AI that touches customers.",
      "Flag anything high-stakes (money, health, legal, hiring) for extra human checks.",
      "Keep AI out of decisions it shouldn't make alone."
    ]
  },
  risks: {
    title: "Write a one-page AI use policy",
    steps: [
      "State what staff can and can't use AI for.",
      "Require a quick data-handling check before adopting any new AI tool.",
      "Share it with every staff member and get a sign-off."
    ]
  },
  transparency: {
    title: "Be upfront about AI",
    steps: [
      "Add a line to your privacy policy on how you use AI — the new Privacy Act rule (APP 1.7) expects this from Dec 2026.",
      "Tell customers when they're dealing with an AI chatbot.",
      "Keep a plain-English explanation of how you use AI ready for anyone who asks."
    ]
  },
  testing: {
    title: "Check AI before you trust it",
    steps: [
      "Have a person review AI output for accuracy before it's used or sent.",
      "Spot-check AI tools regularly for wrong or biased answers.",
      "Decide how you'd notice if an AI tool started misbehaving."
    ]
  },
  control: {
    title: "Keep humans in charge",
    steps: [
      "Make sure a person can override or reject any AI action that affects customers.",
      "Set clear 'no-go' uses for AI and tell staff.",
      "Run a short safe-AI training session for the team."
    ]
  },
  cyber: {
    title: "Lock down the basics",
    steps: [
      "Turn on multi-factor authentication (MFA) for email and key accounts.",
      "Set up automatic, tested backups.",
      "Keep devices and software patched, and train staff to spot phishing."
    ]
  }
};

if (typeof module !== "undefined") module.exports = { PILLARS, QUESTIONS, FIXES };
