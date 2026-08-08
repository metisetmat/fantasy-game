import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadataAudit9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";

function headerHtml(exportHtml: string): string {
  return exportHtml.match(/<header\b[\s\S]*?<\/header>/u)?.[0] ?? "";
}

function coverBadge(exportHtml: string): string {
  const header = headerHtml(exportHtml);
  const badges = [...header.matchAll(/<span\b[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>([^<]*)<\/span>/gu)]
    .map((match) => match[1]?.trim() ?? "");
  return badges.find((badge) => badge.startsWith("Export compact")) ?? "";
}

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadata9F(
  exportHtml: string,
): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadataAudit9F {
  const badge = coverBadge(exportHtml);
  const exportTitleMentions9F = exportHtml.includes("<title>Rapport coach export compact 9F - error copy compaction</title>");
  const exportMainIdIs9F = exportHtml.includes('id="compressed-export-9f"');
  const exportCurrentDataAttributeVisible = exportHtml.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-compaction-version="9F"');
  const historical9EPreserved = exportHtml.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E"');
  const historical9DPreserved = exportHtml.includes('data-export-metadata-badge-cleanup-version="9D"');
  const historical9CPreserved = exportHtml.includes('data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C"');
  const historical9BPreserved = exportHtml.includes('data-manual-review-preview-payload-dry-run-result-renderer-version="9B"');
  const historical9APreserved = exportHtml.includes('data-manual-review-preview-payload-dry-run-validator-version="9A"');
  const historical8Z8Y8X8WPreserved =
    exportHtml.includes('data-manual-review-validation-contract-audit-consistency-repair-version="8Z"') &&
    exportHtml.includes('data-manual-review-preview-payload-validation-contract-version="8Y"') &&
    exportHtml.includes('data-manual-review-preview-payload-contract-version="8X"') &&
    exportHtml.includes('data-manual-review-preview-activation-guards-version="8W"');
  const exportCoverBadgeCorrect = badge === "Export compact 9F";
  const exportCoverBadgeStaleVersionCount = badge === "Export compact 9F" ? 0 : 1;
  const clean =
    exportTitleMentions9F &&
    exportMainIdIs9F &&
    exportCurrentDataAttributeVisible &&
    exportCoverBadgeCorrect &&
    historical9EPreserved &&
    historical9DPreserved &&
    historical9CPreserved &&
    historical9BPreserved &&
    historical9APreserved &&
    historical8Z8Y8X8WPreserved;
  return {
    exportTitleMentions9F,
    exportMainIdIs9F,
    exportMainCurrentVersionVisible: exportCurrentDataAttributeVisible,
    exportCurrentDataAttributeVisible,
    exportCoverBadgeText: badge,
    exportCoverBadgeExpectedText: "Export compact 9F",
    exportCoverBadgeMentions9F: badge === "Export compact 9F",
    exportCoverBadgeCorrect,
    exportCoverBadgeStaleVersionCount,
    metadataFalsePositiveCountAfter9F: clean ? 0 : 1,
    bodyMentionFallbackUsedForCoverBadge: false,
    historical9EPreserved,
    historical9DPreserved,
    historical9CPreserved,
    historical9BPreserved,
    historical9APreserved,
    historical8Z8Y8X8WPreserved,
    metadataWarningCodes: clean
      ? ["EXPORT_METADATA_9F_VISIBLE", "EXPORT_COVER_BADGE_9F_READY", "EXPORT_ID_CLEANED_FROM_9E"]
      : ["EXPORT_TITLE_MISSING_9F", "EXPORT_BADGE_MISSING_9F", "EXPORT_ID_STILL_COMPRESSED_EXPORT_9E"],
    recommendation: clean ? "KEEP_COACH_FACING_ERROR_COPY_EXPORT_COMPACTION" : "FIX_ERROR_COPY_EXPORT_BUDGET_SOURCE_OF_TRUTH",
  };
}

