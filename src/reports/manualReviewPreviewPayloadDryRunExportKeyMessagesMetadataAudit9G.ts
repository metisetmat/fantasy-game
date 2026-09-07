import type { ManualReviewPreviewPayloadDryRunExportKeyMessagesMetadataAudit9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyTypes9G";

export function auditManualReviewPreviewPayloadDryRunExportKeyMessagesMetadata9G(
  exportHtmlAfter9G: string,
): ManualReviewPreviewPayloadDryRunExportKeyMessagesMetadataAudit9G {
  const mainTag = exportHtmlAfter9G.match(/<main\b[^>]*>/u)?.[0] ?? "";
  const header = exportHtmlAfter9G.match(/<header\b[\s\S]*?<\/header>/u)?.[0] ?? "";
  const exportCoverBadgeText =
    header.match(/<[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>(Export compact [^<]*)<\/[^>]+>/u)?.[1] ?? "";
  const exportTitleMentions9G = exportHtmlAfter9G.includes("<title>Rapport coach export compact 9G - key messages warning consistency</title>");
  const exportMainIdIs9G = mainTag.includes('id="compressed-export-9g"');
  const exportCurrentDataAttributeVisible = mainTag.includes(
    'data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G"',
  );
  const historical9FPreserved = mainTag.includes(
    'data-manual-review-preview-payload-dry-run-coach-facing-error-copy-compaction-version="9F"',
  );
  const historical9EPreserved = mainTag.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E"');
  const historical9DPreserved = mainTag.includes('data-export-metadata-badge-cleanup-version="9D"');
  const historical9CPreserved = mainTag.includes('data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C"');
  const historical9BPreserved = mainTag.includes('data-manual-review-preview-payload-dry-run-result-renderer-version="9B"');
  const historical9APreserved = mainTag.includes('data-manual-review-preview-payload-dry-run-validator-version="9A"');
  const historical8Z8Y8X8WPreserved =
    mainTag.includes('data-manual-review-validation-contract-audit-consistency-repair-version="8Z"') &&
    mainTag.includes('data-manual-review-preview-payload-validation-contract-version="8Y"') &&
    mainTag.includes('data-manual-review-preview-payload-contract-version="8X"') &&
    mainTag.includes('data-manual-review-preview-activation-guards-version="8W"');
  const staleCurrentVersionCount = [...mainTag.matchAll(/id="compressed-export-9f"|Export compact 9F/gu)].length;

  return {
    exportTitleMentions9G,
    exportMainIdIs9G,
    exportMainCurrentVersionVisible: exportCurrentDataAttributeVisible,
    exportCurrentDataAttributeVisible,
    exportCoverBadgeText,
    exportCoverBadgeExpectedText: "Export compact 9G",
    exportCoverBadgeCorrect: exportCoverBadgeText === "Export compact 9G",
    exportCoverBadgeStaleVersionCount: staleCurrentVersionCount,
    metadataFalsePositiveCountAfter9G: staleCurrentVersionCount,
    bodyMentionFallbackUsedForCoverBadge: false,
    historical9FPreserved,
    historical9EPreserved,
    historical9DPreserved,
    historical9CPreserved,
    historical9BPreserved,
    historical9APreserved,
    historical8Z8Y8X8WPreserved,
  };
}
