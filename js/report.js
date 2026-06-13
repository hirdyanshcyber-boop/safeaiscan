/*
 * SafeAI Scan — PDF report generator (jsPDF, in-browser, $0).
 * Output should read like a $500 consultant deliverable:
 *   cover score, AI6 traffic-light heatmap, top-3 risks in plain English,
 *   and a 30-day fix checklist.
 */

const BRAND = {
  navy:  [15, 23, 42],     // #0f172a
  blue:  [37, 99, 235],    // #2563eb
  green: [22, 163, 74],
  amber: [217, 119, 6],
  red:   [220, 38, 38],
  grey:  [100, 116, 139],
  light: [241, 245, 249]
};

function bandRGB(level) {
  return { green: BRAND.green, amber: BRAND.amber, red: BRAND.red, na: BRAND.grey }[level] || BRAND.grey;
}

function buildReportDoc(result, meta) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = 0;

  // ---------- Header band ----------
  doc.setFillColor(...BRAND.navy);
  doc.rect(0, 0, W, 110, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold").setFontSize(22);
  doc.text("SafeAI Scan", M, 50);
  doc.setFont("helvetica", "normal").setFontSize(11);
  doc.setTextColor(180, 200, 230);
  doc.text("AI Security Health Check for Australian Small Business", M, 70);
  doc.setFontSize(9);
  doc.text(`Report generated ${result.date}`, M, 90);

  // ---------- Score badge ----------
  const bx = W - M - 90, by = 22, bw = 90, bh = 66;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(bx, by, bw, bh, 6, 6, "F");
  const obc = bandRGB(result.band.level);
  doc.setTextColor(...obc);
  doc.setFont("helvetica", "bold").setFontSize(34);
  doc.text(String(result.overall), bx + bw / 2, by + 36, { align: "center" });
  doc.setFontSize(10);
  doc.text(`/100 · Grade ${result.grade}`, bx + bw / 2, by + 54, { align: "center" });

  y = 140;

  // ---------- Business line ----------
  if (meta && (meta.business || meta.name)) {
    doc.setTextColor(...BRAND.navy);
    doc.setFont("helvetica", "bold").setFontSize(13);
    doc.text(meta.business || meta.name, M, y);
    if (meta.industry) {
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...BRAND.grey);
      doc.text(meta.industry, M, y + 16);
    }
    y += 34;
  }

  // ---------- Headline verdict ----------
  doc.setFillColor(...BRAND.light);
  doc.roundedRect(M, y, W - 2 * M, 50, 6, 6, "F");
  doc.setTextColor(...obc).setFont("helvetica", "bold").setFontSize(13);
  doc.text(`Overall: ${result.band.label}`, M + 16, y + 22);
  doc.setTextColor(...BRAND.navy).setFont("helvetica", "normal").setFontSize(10);
  const verdict = result.overall >= 75
    ? "Solid foundation. Tighten the items below to stay ahead as AI risks grow."
    : result.overall >= 45
    ? "Real gaps that are common and fixable. The 30-day plan below closes most of them."
    : "Significant exposure. Start with your top risk this week — it's the highest payoff.";
  doc.text(doc.splitTextToSize(verdict, W - 2 * M - 32), M + 16, y + 38);
  y += 70;

  // ---------- AI6 heatmap ----------
  doc.setTextColor(...BRAND.navy).setFont("helvetica", "bold").setFontSize(13);
  doc.text("Your scorecard", M, y); y += 8;
  doc.setDrawColor(...BRAND.light).setLineWidth(1);
  doc.line(M, y, W - M, y); y += 18;

  const rowH = 26;
  result.pillars.forEach(p => {
    const c = bandRGB(p.band.level);
    // dot
    doc.setFillColor(...c);
    doc.circle(M + 6, y - 3, 4, "F");
    // name
    doc.setTextColor(...BRAND.navy).setFont("helvetica", "bold").setFontSize(10);
    doc.text(p.name, M + 20, y);
    // ai6 tag
    doc.setTextColor(...BRAND.grey).setFont("helvetica", "normal").setFontSize(8);
    doc.text(p.ai6, M + 20, y + 11);
    // bar
    const barX = W - M - 180, barW = 120, barY = y - 9;
    doc.setFillColor(...BRAND.light);
    doc.roundedRect(barX, barY, barW, 9, 4, 4, "F");
    if (p.score != null) {
      doc.setFillColor(...c);
      doc.roundedRect(barX, barY, Math.max(8, barW * p.score / 100), 9, 4, 4, "F");
    }
    // label
    doc.setTextColor(...c).setFont("helvetica", "bold").setFontSize(9);
    doc.text(p.score != null ? `${p.score} · ${p.band.label}` : "n/a", W - M, y, { align: "right" });
    y += rowH;
  });

  // ---------- Top 3 risks + fixes ----------
  y += 8;
  if (y > 640) { doc.addPage(); y = M; }
  doc.setTextColor(...BRAND.navy).setFont("helvetica", "bold").setFontSize(13);
  doc.text("Your top risks — explained", M, y); y += 8;
  doc.setDrawColor(...BRAND.light); doc.line(M, y, W - M, y); y += 20;

  if (!result.topRisks.length) {
    doc.setTextColor(...BRAND.green).setFont("helvetica", "bold").setFontSize(11);
    doc.text("No major risks flagged — well done. Keep reviewing as you adopt new AI tools.", M, y);
    y += 24;
  } else {
    result.topRisks.forEach((r, i) => {
      if (y > 700) { doc.addPage(); y = M; }
      const c = bandRGB(r.band.level);
      doc.setFillColor(...c);
      doc.roundedRect(M, y - 12, 22, 22, 4, 4, "F");
      doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").setFontSize(12);
      doc.text(String(i + 1), M + 11, y + 3, { align: "center" });

      doc.setTextColor(...BRAND.navy).setFont("helvetica", "bold").setFontSize(11);
      doc.text(r.fix.title, M + 32, y);
      doc.setTextColor(...BRAND.grey).setFont("helvetica", "normal").setFontSize(9);
      doc.text(`${r.name} — scored ${r.score}/100 (${r.band.label})`, M + 32, y + 13);
      y += 28;

      doc.setTextColor(...BRAND.navy).setFontSize(10);
      r.fix.steps.forEach(step => {
        if (y > 770) { doc.addPage(); y = M; }
        doc.setFillColor(...BRAND.blue);
        doc.circle(M + 36, y - 3, 1.6, "F");
        const lines = doc.splitTextToSize(step, W - 2 * M - 56);
        doc.text(lines, M + 44, y);
        y += lines.length * 13 + 4;
      });
      y += 12;
    });
  }

  // ---------- 30-day checklist ----------
  if (y > 620) { doc.addPage(); y = M; }
  doc.setFillColor(...BRAND.navy);
  doc.roundedRect(M, y, W - 2 * M, 30, 6, 6, "F");
  doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").setFontSize(12);
  doc.text("Your 30-day action plan", M + 16, y + 20);
  y += 46;

  const plan = result.topRisks.length
    ? result.topRisks.flatMap(r => r.fix.steps).slice(0, 6)
    : ["Review AI tool list quarterly", "Refresh your AI use policy", "Re-run this scan in 90 days"];
  plan.forEach(step => {
    if (y > 780) { doc.addPage(); y = M; }
    doc.setDrawColor(...BRAND.grey).setLineWidth(1);
    doc.rect(M, y - 9, 11, 11);
    doc.setTextColor(...BRAND.navy).setFont("helvetica", "normal").setFontSize(10);
    const lines = doc.splitTextToSize(step, W - 2 * M - 28);
    doc.text(lines, M + 20, y);
    y += lines.length * 14 + 8;
  });

  // ---------- Footer on every page ----------
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const H = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...BRAND.light).setLineWidth(1);
    doc.line(M, H - 40, W - M, H - 40);
    doc.setTextColor(...BRAND.grey).setFont("helvetica", "normal").setFontSize(8);
    doc.text("SafeAI Scan · safeaiscan.com.au · Built around AI6 guidance, the Essential Eight, and the Privacy Act", M, H - 26);
    doc.text(`Page ${i} of ${pages}`, W - M, H - 26, { align: "right" });
    doc.setFontSize(7).setTextColor(...BRAND.grey);
    doc.text("Indicative self-assessment, not legal or compliance advice.", M, H - 14);
  }

  return doc;
}

function reportFilename(meta) {
  const safeName = (meta && meta.business ? meta.business : "SafeAI-Scan").replace(/[^a-z0-9]+/gi, "-");
  return `${safeName}-AI-Security-Report.pdf`;
}

// Download the report (the dashboard button).
function generatePDF(result, meta) {
  buildReportDoc(result, meta).save(reportFilename(meta));
}

// Base64 of the PDF body (no "data:" prefix) — for emailing as an attachment.
function getReportBase64(result, meta) {
  return buildReportDoc(result, meta).output("datauristring").split(",")[1];
}

window.generatePDF = generatePDF;
window.getReportBase64 = getReportBase64;
