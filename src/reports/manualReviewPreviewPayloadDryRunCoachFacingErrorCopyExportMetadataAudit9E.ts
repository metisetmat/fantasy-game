import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadataAudit9E } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";

function headerHtml(exportHtml: string): string {
  return exportHtml.match(/<header\b[\s\S]*?<\/header>/u)?.[0] ?? "";
}

function coverBadge(exportHtml: string): string {
  const header = headerHtml(exportHtml);
  const badges = [...header.matchAll(/<span\b[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>([^<]*)<\/span>/gu)]
    .map((match) => match[1]?.trim() ?? "");
  return badges.find((badge) => badge.startsWith("Export compact")) ?? "";
}

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadata9E(
  exportHtml: string,
): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportMetadataAudit9E {
  const badge = coverBadge(exportHtml);
  const exportTitleMentions9E = exportHtml.includes("<title>Rapport coach export compact 9E - coach-facing error copy</title>");
  const exportMainIdIs9E = exportHtml.includes('id="compressed-export-9e"');
  const exportCurrentDataAttributeVisible = exportHtml.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E"');
  const exportCoverBadgeCorrect = badge === "Export compact 9E";
  const staleVersions = ["Export compact 9D", "Export compact 9C", "Export compact 9B", "Export compact 9A", "Export compact 8Z"];
  const exportCoverBadgeStaleVersionCount = staleVersions.filter((item) => badge === item).length;
  const historical9DPreserved = exportHtml.includes('data-export-metadata-badge-cleanup-version="9D"');
  const historical9CPreserved = exportHtml.includes('data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C"');
  const historical9BPreserved = exportHtml.includes('data-manual-review-preview-payload-dry-run-result-renderer-version="9B"');
  const historical9APreserved = exportHtml.includes('data-manual-review-preview-payload-dry-run-validator-version="9A"');
  const historical8Z8Y8X8WPreserved =
    exportHtml.includes('data-manual-review-validation-contract-audit-consistency-repair-version="8Z"') &&
    exportHtml.includes('data-manual-review-preview-payload-validation-contract-version="8Y"') &&
    exportHtml.includes('data-manual-review-preview-payload-contract-version="8X"') &&
    exportHtml.includes('data-manual-review-preview-activation-guards-version="8W"');
  const clean =
    exportTitleMentions9E &&
    exportMainIdIs9E &&
    exportCurrentDataAttributeVisible &&
    exportCoverBadgeCorrect &&
    exportCoverBadgeStaleVersionCount === 0 &&
    historical9DPreserved &&
    historical9CPreserved &&
    historical9BPreserved &&
    historical9APreserved &&
    historical8Z8Y8X8WPreserved;
  return {
    exportTitleMentions9E,
    exportMainIdIs9E,
    exportMainCurrentVersionVisible: exportCurrentDataAttributeVisible,
    exportCurrentDataAttributeVisible,
    exportCoverBadgeText: badge,
    exportCoverBadgeMentions9E: badge === "Export compact 9E",
    exportCoverBadgeCorrect,
    exportCoverBadgeStaleVersionCount,
    metadataFalsePositiveCountAfter9E: exportCoverBadgeCorrect && headerHtml(exportHtml).length > 0 ? 0 : 1,
    bodyMentionFallbackUsedForCoverBadge: false,
    historical9DPreserved,
    historical9CPreserved,
    historical9BPreserved,
    historical9APreserved,
    historical8Z8Y8X8WPreserved,
    metadataWarningCodes: clean
      ? ["EXPORT_METADATA_9E_VISIBLE", "EXPORT_COVER_BADGE_9E_READY", "EXPORT_ID_CLEANED_FROM_9D"]
      : ["EXPORT_TITLE_MISSING_9E", "EXPORT_BADGE_MISSING_9E", "EXPORT_ID_STILL_COMPRESSED_EXPORT_9D"],
    recommendation: clean ? "KEEP_COACH_FACING_ERROR_COPY" : "FIX_ERROR_COPY_RUNTIME_OR_SOURCE_OF_TRUTH",
  };
}
