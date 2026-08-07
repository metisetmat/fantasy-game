import { auditManualReviewExportCoverBadge9D } from "./manualReviewExportCoverBadgeAudit9D";
import type { ManualReviewExportMetadataAudit9D } from "./manualReviewExportMetadataBadgeCleanupTypes9D";
import type { ManualReviewExportMetadataBadgeCleanupWarningCode9D } from "./manualReviewExportMetadataBadgeCleanupWarnings9D";

const HISTORICAL_DATA_ATTRIBUTES = [
  'data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C"',
  'data-manual-review-preview-payload-dry-run-result-renderer-version="9B"',
  'data-manual-review-preview-payload-dry-run-validator-version="9A"',
  'data-manual-review-validation-contract-audit-consistency-repair-version="8Z"',
  'data-manual-review-preview-payload-validation-contract-version="8Y"',
  'data-manual-review-preview-payload-contract-version="8X"',
  'data-manual-review-preview-activation-guards-version="8W"',
] as const;

const HISTORICAL_SECTION_MARKERS = [
  'id="manual-review-preview-payload-dry-run-result-detail-cards-export-9c"',
  'id="manual-review-preview-payload-dry-run-result-renderer-export-9b"',
  'id="manual-review-preview-payload-dry-run-validator-export-9a"',
  'id="manual-review-validation-contract-audit-consistency-repair-export-8z"',
  'id="manual-review-preview-payload-validation-contract-export-8y"',
  'id="manual-review-preview-payload-contract-export-8x"',
  'id="manual-review-preview-activation-guards-export-8w"',
] as const;

function mainTag(html: string): string {
  return html.match(/<main\b[^>]*>/u)?.[0] ?? "";
}

export function auditManualReviewExportMetadata9D(exportHtml: string): ManualReviewExportMetadataAudit9D {
  const coverBadgeAudit = auditManualReviewExportCoverBadge9D(exportHtml);
  const main = mainTag(exportHtml);
  const exportTitleMentions9D = exportHtml.includes("<title>Rapport coach export compact 9D - metadata badge cleanup</title>");
  const exportMainIdIs9D = main.includes('id="compressed-export-9d"');
  const exportCurrentDataAttributeVisible = main.includes('data-export-metadata-badge-cleanup-version="9D"');
  const exportMainCurrentVersionVisible = exportMainIdIs9D && exportCurrentDataAttributeVisible;
  const exportHistoricalMarkersPreservedAsDataAttributes = HISTORICAL_DATA_ATTRIBUTES.every((marker) => main.includes(marker));
  const exportHistoricalSectionsPreserved = HISTORICAL_SECTION_MARKERS.every((marker) => exportHtml.includes(marker));
  const exportMainIdStillCompressedExport9C = main.includes('id="compressed-export-9c"');
  const exportMainIdStillCompressedExport9B = main.includes('id="compressed-export-9b"');
  const exportMainIdStillCompressedExport9A = main.includes('id="compressed-export-9a"');
  const exportMainIdStillCompressedExport8Z = main.includes('id="compressed-export-8z"');
  const staleCoverBadge =
    coverBadgeAudit.exportCoverBadgeMentions9C ||
    coverBadgeAudit.exportCoverBadgeMentions9B ||
    coverBadgeAudit.exportCoverBadgeMentions9A ||
    coverBadgeAudit.exportCoverBadgeMentions8Z;
  const metadataAuditFalsePositiveCount = coverBadgeAudit.exportCoverBadgeCorrect && coverBadgeAudit.coverBadgeSource === "unknown"
    ? 1
    : 0;
  const warningCodes: ManualReviewExportMetadataBadgeCleanupWarningCode9D[] = [];
  if (exportTitleMentions9D) warningCodes.push("EXPORT_TITLE_9D_READY");
  else warningCodes.push("EXPORT_TITLE_STALE");
  if (exportMainIdIs9D) warningCodes.push("EXPORT_MAIN_ID_9D_READY");
  else warningCodes.push("EXPORT_MAIN_ID_STALE");
  if (exportCurrentDataAttributeVisible) warningCodes.push("EXPORT_CURRENT_DATA_ATTRIBUTE_9D_READY");
  if (coverBadgeAudit.exportCoverBadgeCorrect) warningCodes.push("EXPORT_COVER_BADGE_9D_READY");
  if (coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge) warningCodes.push("BODY_FALLBACK_USED_FOR_COVER_BADGE");
  if (metadataAuditFalsePositiveCount === 0 && !coverBadgeAudit.bodyMentionFallbackUsedForCoverBadge) warningCodes.push("METADATA_FALSE_POSITIVES_ZERO");
  else warningCodes.push("METADATA_FALSE_POSITIVE_DETECTED");
  if (staleCoverBadge) warningCodes.push("EXPORT_COVER_BADGE_STALE");

  return {
    exportTitleMentions9D,
    exportMainIdIs9D,
    exportMainCurrentVersionVisible,
    exportCurrentDataAttributeVisible,
    exportCoverBadgeMentions9D: coverBadgeAudit.exportCoverBadgeMentions9D,
    exportCoverBadgeCorrect: coverBadgeAudit.exportCoverBadgeCorrect,
    exportBodyMentions9D: exportHtml.includes("9D"),
    exportHistoricalMarkersPreservedAsDataAttributes,
    exportHistoricalSectionsPreserved,
    exportMainIdStillCompressedExport9C,
    exportMainIdStillCompressedExport9B,
    exportMainIdStillCompressedExport9A,
    exportMainIdStillCompressedExport8Z,
    exportCoverBadgeStillMentions9C: coverBadgeAudit.exportCoverBadgeMentions9C,
    exportCoverBadgeStillMentions9B: coverBadgeAudit.exportCoverBadgeMentions9B,
    exportCoverBadgeStillMentions9A: coverBadgeAudit.exportCoverBadgeMentions9A,
    exportCoverBadgeStillMentions8Z: coverBadgeAudit.exportCoverBadgeMentions8Z,
    metadataAuditFalsePositiveCount,
    metadataWarningCodes: warningCodes,
    recommendation: exportTitleMentions9D && exportMainIdIs9D && exportCurrentDataAttributeVisible && coverBadgeAudit.exportCoverBadgeCorrect && !staleCoverBadge && metadataAuditFalsePositiveCount === 0
      ? "KEEP_EXPORT_METADATA_BADGE_CLEANUP"
      : "REVIEW_EXPORT_METADATA_BADGE_AUDIT",
  };
}

