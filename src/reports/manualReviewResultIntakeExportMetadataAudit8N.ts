import type { ManualReviewResultIntakeExportMetadataAudit8N } from "./manualReviewResultIntakeBoundaryTypes8N";
import type { ManualReviewResultIntakeBoundaryWarningCode8N } from "./manualReviewResultIntakeBoundaryWarnings8N";

export function auditManualReviewResultIntakeExportMetadata8N(exportHtml: string): ManualReviewResultIntakeExportMetadataAudit8N {
  const titleMatch = /<title>([^<]*)<\/title>/iu.exec(exportHtml);
  const title = titleMatch?.[1] ?? "";
  const mainTag = /<main\b[^>]*>/iu.exec(exportHtml)?.[0] ?? "";
  const visibleBadgeStillOnly8I = /<span class="badge">\s*Export story-first 8I\s*<\/span>/iu.test(exportHtml);
  const exportTitleMentions8N = /\b8N\b/u.test(title);
  const exportTitleStillOnly8I = /\b8I\b/u.test(title) && !/\b8N\b/u.test(title);
  const exportTitleStillOnly8M = /\b8M\b/u.test(title) && !/\b8N\b/u.test(title);
  const exportMainCurrentVersionVisible = mainTag.includes('data-manual-review-intake-boundary-version="8N"');
  const exportMainIdStillCompressedExport8I = /id="compressed-export-8i"/iu.test(mainTag);
  const exportVisibleBadgeMentionsCurrentSprint = /<span class="badge">\s*(Export compact 8N|Frontiere saisie manuelle 8N)\s*<\/span>/iu.test(exportHtml);
  const exportHistoricalMarkersPreservedAsDataAttributes = mainTag.includes('data-story-first-export-version="8I"') &&
    mainTag.includes('data-export-restoration-version="8J"') &&
    mainTag.includes('data-manual-review-form-version="8M"');
  const warnings: ManualReviewResultIntakeBoundaryWarningCode8N[] = [];

  if (!exportTitleMentions8N) warnings.push("EXPORT_TITLE_STILL_ONLY_8M");
  if (exportTitleStillOnly8I) warnings.push("EXPORT_TITLE_STILL_ONLY_8I");
  if (exportTitleStillOnly8M) warnings.push("EXPORT_TITLE_STILL_ONLY_8M");
  if (!exportMainCurrentVersionVisible) warnings.push("EXPORT_METADATA_CLEANED");
  if (exportMainIdStillCompressedExport8I) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_8I");
  if (visibleBadgeStillOnly8I) warnings.push("EXPORT_VISIBLE_BADGE_STILL_ONLY_8I");

  return {
    exportTitleMentions8N,
    exportTitleStillOnly8I,
    exportTitleStillOnly8M,
    exportMainCurrentVersionVisible,
    exportMainIdStillCompressedExport8I,
    exportVisibleBadgeStillOnly8I: visibleBadgeStillOnly8I,
    exportVisibleBadgeMentionsCurrentSprint,
    exportHistoricalMarkersPreservedAsDataAttributes,
    metadataWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 && exportVisibleBadgeMentionsCurrentSprint
      ? "KEEP_EXPORT_METADATA_8N"
      : "REPAIR_EXPORT_METADATA_8N",
  };
}
