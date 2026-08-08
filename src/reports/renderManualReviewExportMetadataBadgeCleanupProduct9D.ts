import type { ManualReviewExportMetadataBadgeCleanup9DModel } from "./manualReviewExportMetadataBadgeCleanupTypes9D";

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

function findSectionEndById(html: string, sectionId: string): number | null {
  const idIndex = html.indexOf(`id="${sectionId}"`);
  if (idIndex === -1) return null;
  const sectionStart = html.lastIndexOf("<section", idIndex);
  if (sectionStart === -1) return null;
  const sectionTagPattern = /<\/?section\b[^>]*>/giu;
  sectionTagPattern.lastIndex = sectionStart;
  let depth = 0;
  let match: RegExpExecArray | null;
  while ((match = sectionTagPattern.exec(html)) !== null) {
    const tag = match[0];
    if (tag.startsWith("</")) {
      depth -= 1;
      if (depth === 0) return sectionTagPattern.lastIndex;
    } else {
      depth += 1;
    }
  }
  return null;
}

export function renderManualReviewExportMetadataBadgeCleanupProduct9D(
  model: ManualReviewExportMetadataBadgeCleanup9DModel,
): string {
  return [
    '<section id="manual-review-export-metadata-badge-cleanup-9d" class="premium-section manual-review-export-metadata-badge-cleanup-9d" data-export-metadata-badge-cleanup-version="9D">',
    '<p class="eyebrow">Sprint 9D - metadata export, sans runtime</p>',
    "<h2>Correction metadata export</h2>",
    "<p><strong>Badge de couverture aligne - audit strict anti faux positif.</strong></p>",
    `<p>Avant 9D: badge stale = ${escapeHtml(model.staleCoverBadgeBefore9D)}. Apres 9D: badge = ${escapeHtml(model.exportCoverBadgeText)}.</p>`,
    `<ul><li>Title: ${model.exportTitleMentions9D ? "9D" : "stale"}</li><li>Main id: ${model.exportMainIdIs9D ? "compressed-export-9d" : "stale"}</li><li>Data current: ${model.exportMainCurrentVersionVisible ? "9D" : "missing"}</li><li>Historique conserve: 9C/9B/9A/8Z/8Y/8X/8W</li></ul>`,
    `<p>Audit strict: badge verifie depuis ${escapeHtml(model.coverBadgeAudit.coverBadgeSelectorUsed)}; fallback body interdit: ${model.coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge ? "false" : "true"}; faux positifs apres 9D: ${model.metadataFalsePositiveCountAfter9D}.</p>`,
    `<p>No-runtime: validation ${model.validationRuntimeActive}; payload lu ${model.realPayloadReadCount}; payload accepte ${model.dryRunAcceptedPayloadCount}; preview ${model.realPreviewGenerated}; stockage ${model.storageCreated}; official truth ${model.officialTruthPromoted}.</p>`,
    "</section>",
  ].join("\n");
}

export function insertManualReviewExportMetadataBadgeCleanupProduct9D(productHtml: string, section: string): string {
  if (productHtml.includes('id="manual-review-export-metadata-badge-cleanup-9d"')) return productHtml;
  const insertAt = findSectionEndById(productHtml, "manual-review-preview-payload-dry-run-result-detail-cards-9c");
  if (insertAt !== null) {
    return `${productHtml.slice(0, insertAt)}\n${section}\n${productHtml.slice(insertAt)}`;
  }
  return productHtml.includes("</main>")
    ? productHtml.replace("</main>", `${section}\n</main>`)
    : `${productHtml}\n${section}`;
}
