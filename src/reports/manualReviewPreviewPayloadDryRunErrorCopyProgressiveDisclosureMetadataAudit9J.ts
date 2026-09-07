import type { ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureMetadataAudit9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import { uniqueWarningCodes9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";

export function auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureMetadata9J(
  exportHtml: string,
): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureMetadataAudit9J {
  const mainTag = exportHtml.match(/<main\b[^>]*>/u)?.[0] ?? "";
  const header = exportHtml.match(/<header\b[\s\S]*?<\/header>/u)?.[0] ?? "";
  const exportCoverBadgeText =
    header.match(/<[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>(Export compact [^<]*)<\/[^>]+>/u)?.[1] ?? "";
  const metadataFalsePositiveCountAfter9J = [
    ...mainTag.matchAll(/id="compressed-export-9i"|id="compressed-export-9h"|Export compact 9I|Export compact 9H/gu),
  ].length;
  const historical9IPreserved = mainTag.includes(
    'data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I"',
  );
  const historical9HPreserved = mainTag.includes('data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H"');
  const historical9GPreserved = mainTag.includes(
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
  const exportTitleMentions9J = exportHtml.includes(
    "<title>Rapport coach export compact 9J - progressive disclosure</title>",
  );
  const exportMainIdIs9J = mainTag.includes('id="compressed-export-9j"');
  const exportCurrentDataAttributeVisible = mainTag.includes(
    'data-manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-version="9J"',
  );
  const exportCoverBadgeCorrect = exportCoverBadgeText === "Export compact 9J";
  const metadataWarningCodes = uniqueWarningCodes9J([
    exportTitleMentions9J && exportMainIdIs9J && exportCurrentDataAttributeVisible
      ? "EXPORT_METADATA_9J_VISIBLE"
      : "EXPORT_TITLE_MISSING_9J",
    exportCoverBadgeCorrect ? "EXPORT_COVER_BADGE_9J_READY" : "EXPORT_BADGE_MISSING_9J",
    !exportMainIdIs9J ? "EXPORT_ID_STILL_COMPRESSED_EXPORT_9I" : "EXPORT_METADATA_9J_VISIBLE",
    metadataFalsePositiveCountAfter9J === 0 ? "EXPORT_METADATA_9J_VISIBLE" : "METADATA_FALSE_POSITIVE_DETECTED",
  ]);

  return {
    exportTitleMentions9J,
    exportMainIdIs9J,
    exportMainCurrentVersionVisible: exportCurrentDataAttributeVisible,
    exportCurrentDataAttributeVisible,
    exportCoverBadgeText,
    exportCoverBadgeExpectedText: "Export compact 9J",
    exportCoverBadgeCorrect,
    exportCoverBadgeStaleVersionCount: metadataFalsePositiveCountAfter9J,
    metadataFalsePositiveCountAfter9J,
    bodyMentionFallbackUsedForCoverBadge: false,
    historical9IPreserved,
    historical9HPreserved,
    historical9GPreserved,
    historical9FPreserved,
    historical9EPreserved,
    historical9DPreserved,
    historical9CPreserved,
    historical9BPreserved,
    historical9APreserved,
    historical8Z8Y8X8WPreserved,
    metadataWarningCodes,
  };
}
