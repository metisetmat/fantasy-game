import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewPreviewComparison8P,
  ManualReviewPreviewComparisonCard8P,
} from "./manualReviewPreviewComparisonTypes8P";

function answerLabel(value: ManualReviewPreviewComparisonCard8P["answerStatus"]): string {
  if (value === "answers_question") return "repond a la question";
  if (value === "partially_answers_question") return "repond partiellement";
  return "insuffisant pour repondre";
}

function shortTitle(title: string): string {
  if (title.includes("Premiere sortie")) return "Premiere sortie apres recuperation";
  if (title.includes("Continuite")) return "Continuite apres zone dangereuse";
  return "Structure apres action neutralisee";
}

function renderMiniLine(card: ManualReviewPreviewComparisonCard8P): string {
  return [
    '<li class="manual-review-preview-comparison-export-card-8p">',
    `<strong>${escapeHtml(shortTitle(card.observationTitle))}</strong> - ${escapeHtml(answerLabel(card.answerStatus))}.`,
    ` Question: ${escapeHtml(card.originalObservationQuestion)}`,
    ` Outcome: ${escapeHtml(card.previewOutcome)}.`,
    ` Ecart: ${escapeHtml(card.gapToReview)}`,
    "</li>",
  ].join("");
}

export function renderManualReviewPreviewComparisonExport8P(comparison: ManualReviewPreviewComparison8P): string {
  return [
    '<section id="manual-review-preview-comparison-export-8p" class="premium-section manual-review-preview-comparison-export-8p" data-manual-review-preview-comparison-version="8P">',
    "<h2>Comparaison preview / plan</h2>",
    '<p class="eyebrow">Comparaison preview 8P</p>',
    '<ol class="compact-list">',
    ...comparison.comparisonCards.map(renderMiniLine),
    "</ol>",
    '<p class="guard">Comparaison de demonstration non officielle. Non persistee, non appliquee, sans decision automatique.</p>',
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

function updateExportMetadata8P(exportHtml: string): string {
  let updated = exportHtml.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8P - comparaison preview plan</title>",
  );
  updated = updated.replace(
    /<main\b(?![^>]*\bdata-manual-review-preview-comparison-version=)/iu,
    '<main data-manual-review-preview-comparison-version="8P"',
  );
  updated = updated.replace(/\bid="compressed-export-8n"/giu, 'id="compressed-export-8p"');
  updated = updated.replace(/\bid="compressed-export-8i"/giu, 'id="compressed-export-8p"');
  updated = updated.replace(/Export compact 8O/gu, "Export compact 8P");
  updated = updated.replace(/Preview revue manuelle 8O/gu, "Comparaison preview 8P");
  return updated;
}

export function insertManualReviewPreviewComparisonExport8P(exportHtml: string, section: string): string {
  const metadataHtml = updateExportMetadata8P(exportHtml);
  if (metadataHtml.includes('id="manual-review-preview-comparison-export-8p"')) return metadataHtml;
  const previewIndex = metadataHtml.indexOf('id="manual-review-preview-renderer-export-8o"');
  if (previewIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, previewIndex);
    if (insertAt >= 0) return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
