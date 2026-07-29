import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewPreviewDecisionGate8Q,
  ManualReviewPreviewDecisionGateCard8Q,
} from "./manualReviewPreviewDecisionGateTypes8Q";

function shortTitle(title: string): string {
  if (title.includes("Premiere sortie")) return "Premiere sortie apres recuperation";
  if (title.includes("Continuite")) return "Continuite apres zone dangereuse";
  return "Structure apres action neutralisee";
}

function renderMiniLine(card: ManualReviewPreviewDecisionGateCard8Q): string {
  return [
    '<li class="manual-review-preview-decision-gate-export-card-8q">',
    `<strong>${escapeHtml(shortTitle(card.observationTitle))}</strong> - ${escapeHtml(card.gateLabel)}.`,
    ` ${escapeHtml(card.gateReason)}`,
    "</li>",
  ].join("");
}

export function renderManualReviewPreviewDecisionGateExport8Q(gate: ManualReviewPreviewDecisionGate8Q): string {
  return [
    '<section id="manual-review-preview-decision-gate-export-8q" class="premium-section manual-review-preview-decision-gate-export-8q" data-manual-review-preview-decision-gate-version="8Q">',
    "<h2>Gate preview</h2>",
    '<p class="eyebrow">Gate preview 8Q</p>',
    `<p><strong>Gate global :</strong> ${escapeHtml(gate.globalGate.gateLabel)}. ${escapeHtml(gate.globalGate.globalGateReason)}</p>`,
    '<ol class="compact-list">',
    ...gate.gateCards.map(renderMiniLine),
    "</ol>",
    '<p class="guard">Gate de demonstration non officiel. Non persiste, non applique, sans decision automatique.</p>',
    "</section>",
  ].join("\n");
}

function findBalancedSectionEnd(html: string, markerIndex: number): number {
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return -1;
  const pattern = /<\/?section\b[^>]*>/giu;
  let depth = 0;
  for (const match of html.slice(sectionStart).matchAll(pattern)) {
    const tag = match[0];
    const absoluteEnd = sectionStart + (match.index ?? 0) + tag.length;
    if (tag.startsWith("</")) {
      depth -= 1;
      if (depth === 0) return absoluteEnd;
    } else {
      depth += 1;
    }
  }
  return -1;
}

function updateExportMetadata8Q(exportHtml: string): string {
  let updated = exportHtml.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8Q - gate preview non persistant</title>",
  );
  updated = updated.replace(
    /<main\b(?![^>]*\bdata-manual-review-preview-decision-gate-version=)/iu,
    '<main data-manual-review-preview-decision-gate-version="8Q"',
  );
  updated = updated.replace(/\bid="compressed-export-8p"/giu, 'id="compressed-export-8q"');
  updated = updated.replace(/\bid="compressed-export-8n"/giu, 'id="compressed-export-8q"');
  updated = updated.replace(/\bid="compressed-export-8i"/giu, 'id="compressed-export-8q"');
  updated = updated.replace(/Export compact 8P/gu, "Export compact 8Q");
  updated = updated.replace(/Comparaison preview 8P/gu, "Gate preview 8Q");
  return updated;
}

export function insertManualReviewPreviewDecisionGateExport8Q(exportHtml: string, section: string): string {
  const metadataHtml = updateExportMetadata8Q(exportHtml);
  if (metadataHtml.includes('id="manual-review-preview-decision-gate-export-8q"')) return metadataHtml;
  const comparisonIndex = metadataHtml.indexOf('id="manual-review-preview-comparison-export-8p"');
  if (comparisonIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, comparisonIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
