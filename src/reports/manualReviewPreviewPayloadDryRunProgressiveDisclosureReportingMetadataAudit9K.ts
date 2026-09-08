import type { ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadataAudit9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";
import { uniqueWarningCodes9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";

export function auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadata9K(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadataAudit9K {
  const exportMainTag = input.exportHtml.match(/<main\b[^>]*>/u)?.[0] ?? "";
  const exportHeader = input.exportHtml.match(/<header\b[\s\S]*?<\/header>/u)?.[0] ?? "";
  const exportCoverBadgeText =
    exportHeader.match(/<[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>(Export compact [^<]*)<\/[^>]+>/u)?.[1] ?? "";
  const productSectionVisible = input.productHtml.includes(
    'id="manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-9k"',
  );
  const exportSectionVisible = input.exportHtml.includes(
    'id="manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-export-9k"',
  );

  return {
    productSectionVisible,
    exportSectionVisible,
    exportTitleMentions9K: input.exportHtml.includes("<title>Rapport coach export compact 9K - progressive disclosure reporting consistency</title>"),
    exportMainIdIs9K: exportMainTag.includes('id="compressed-export-9k"'),
    exportCurrentDataAttributeVisible: exportMainTag.includes(
      'data-manual-review-preview-payload-dry-run-progressive-disclosure-reporting-consistency-repair-version="9K"',
    ),
    exportCoverBadgeText,
    exportCoverBadgeExpectedText: "Export compact 9K",
    exportCoverBadgeCorrect: exportCoverBadgeText === "Export compact 9K",
    historical9JPreserved: input.exportHtml.includes('data-manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-version="9J"'),
    historical9IPreserved: input.exportHtml.includes('data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I"'),
    historical9HPreserved: input.exportHtml.includes('data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H"'),
    historical9GPreserved: input.exportHtml.includes('data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G"'),
    historical9FPreserved: input.exportHtml.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-compaction-version="9F"'),
    historical9EPreserved: input.exportHtml.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E"'),
    metadataWarningCodes: uniqueWarningCodes9K([
      productSectionVisible && exportSectionVisible && exportCoverBadgeText === "Export compact 9K"
        ? "PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_READY"
        : "PROGRESSIVE_DISCLOSURE_REPORTING_PARTIAL",
    ]),
  };
}
