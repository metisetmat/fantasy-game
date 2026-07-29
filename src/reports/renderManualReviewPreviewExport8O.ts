import { escapeHtml } from "./htmlCoachReport";
import type {
  ManualReviewPreviewCard8O,
  ManualReviewPreviewSummary8O,
} from "./manualReviewPreviewRendererTypes8O";

function renderMiniCard(card: ManualReviewPreviewCard8O): string {
  return [
    '<li class="manual-review-preview-export-card-8o">',
    `<strong>${escapeHtml(card.observationTitle)}</strong> - ${escapeHtml(card.outcomeLabel)}.`,
    ` Situations: ${card.comparableSituationCount}; signaux + / -: ${card.positiveSignalCount}/${card.negativeSignalCount}.`,
    ` Question: ${escapeHtml(card.nextQuestion)}`,
    "</li>",
  ].join("");
}

export function renderManualReviewPreviewExport8O(input: {
  readonly cards: readonly ManualReviewPreviewCard8O[];
  readonly summary: ManualReviewPreviewSummary8O;
}): string {
  return [
    '<section id="manual-review-preview-renderer-export-8o" class="premium-section manual-review-preview-renderer-export-8o" data-manual-review-preview-renderer-version="8O">',
    "<h2>Preview revue manuelle</h2>",
    '<p class="eyebrow">Preview demo non officielle 8O</p>',
    '<ul class="compact-list">',
    ...input.cards.map(renderMiniCard),
    "</ul>",
    `<p>${escapeHtml(input.summary.previewReadout)}</p>`,
    '<p class="guard">Preview de demonstration non officielle. Non persistee, non appliquee, sans mutation score/timeline.</p>',
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

function updateExportMetadata8O(exportHtml: string): string {
  let updated = exportHtml.replace(
    /<title>[^<]*<\/title>/iu,
    "<title>Rapport coach export compact 8O - preview revue manuelle</title>",
  );
  updated = updated.replace(
    /<main\b(?![^>]*\bdata-manual-review-preview-renderer-version=)/iu,
    '<main data-manual-review-preview-renderer-version="8O"',
  );
  updated = updated.replace(/Export compact 8N/gu, "Export compact 8O");
  updated = updated.replace(/Preview revue manuelle 8N/gu, "Preview revue manuelle 8O");
  return updated;
}

export function insertManualReviewPreviewExport8O(exportHtml: string, section: string): string {
  const metadataHtml = updateExportMetadata8O(exportHtml);
  if (metadataHtml.includes('id="manual-review-preview-renderer-export-8o"')) return metadataHtml;
  const intakeBoundaryIndex = metadataHtml.indexOf('id="manual-review-result-intake-boundary-export-8n"');
  if (intakeBoundaryIndex >= 0) {
    const insertAt = findBalancedSectionEnd(metadataHtml, intakeBoundaryIndex);
    if (insertAt >= 0) {
      return `${metadataHtml.slice(0, insertAt)}\n${section}${metadataHtml.slice(insertAt)}`;
    }
  }
  return metadataHtml.includes("</main>")
    ? metadataHtml.replace("</main>", `${section}\n</main>`)
    : `${metadataHtml}\n${section}`;
}
