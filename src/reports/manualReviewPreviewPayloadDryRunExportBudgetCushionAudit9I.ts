import { estimateManualReviewExportReadTimeSeconds9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F";
import type {
  ManualReviewPreviewPayloadDryRunExportBudgetAudit9I,
  ManualReviewPreviewPayloadDryRunExportBudgetCushionRisk9I,
  ManualReviewPreviewPayloadDryRunExportBudgetCushionStatusValue9I,
} from "./manualReviewPreviewPayloadDryRunExportBudgetCushionTypes9I";

function risk(seconds: number): ManualReviewPreviewPayloadDryRunExportBudgetCushionRisk9I {
  if (seconds > 790) return "critical";
  if (seconds > 780) return "high";
  if (seconds > 760) return "medium";
  return "low";
}

function status(seconds: number): ManualReviewPreviewPayloadDryRunExportBudgetCushionStatusValue9I {
  if (seconds > 900) return "failed_budget";
  if (seconds <= 780) return "cushion_created";
  if (seconds <= 800) return "minimal_cushion";
  return "no_cushion";
}

export function auditManualReviewPreviewPayloadDryRunExportBudgetCushion9I(input: {
  readonly exportHtmlBefore9I: string;
  readonly exportHtmlAfter9I: string;
  readonly baselineReadTimeSecondsBefore9I: number;
}): ManualReviewPreviewPayloadDryRunExportBudgetAudit9I {
  const exportReadTimeSecondsBefore9I = input.baselineReadTimeSecondsBefore9I;
  const exportReadTimeSecondsAfter9I = estimateManualReviewExportReadTimeSeconds9F(input.exportHtmlAfter9I);
  const exportUnder900Seconds = exportReadTimeSecondsAfter9I <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter9I <= 800;
  const exportUnder790Seconds = exportReadTimeSecondsAfter9I <= 790;
  const exportUnder780Seconds = exportReadTimeSecondsAfter9I <= 780;

  return {
    exportReadTimeSecondsBefore9I,
    exportReadTimeSecondsAfter9I,
    exportReadTimeDelta9I: exportReadTimeSecondsAfter9I - exportReadTimeSecondsBefore9I,
    exportBudgetCushionSeconds: 800 - exportReadTimeSecondsAfter9I,
    targetLowSeconds: 760,
    targetHighSeconds: 780,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder790Seconds,
    exportUnder780Seconds,
    exportInTargetWindow: exportReadTimeSecondsAfter9I >= 760 && exportReadTimeSecondsAfter9I <= 780,
    exportBudgetCushionStatus: status(exportReadTimeSecondsAfter9I),
    exportBudgetRiskBefore9I: risk(exportReadTimeSecondsBefore9I),
    exportBudgetRiskAfter9I: risk(exportReadTimeSecondsAfter9I),
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter9I <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter9I <= 800),
    exportUnder790BooleanCorrect: exportUnder790Seconds === (exportReadTimeSecondsAfter9I <= 790),
    exportUnder780BooleanCorrect: exportUnder780Seconds === (exportReadTimeSecondsAfter9I <= 780),
    exportBudgetPassStrongEligible: exportUnder800Seconds,
  };
}

export function auditManualReviewPreviewPayloadDryRunExportBudgetMetadata9I(exportHtml: string) {
  const mainTag = exportHtml.match(/<main\b[^>]*>/u)?.[0] ?? "";
  const header = exportHtml.match(/<header\b[\s\S]*?<\/header>/u)?.[0] ?? "";
  const exportCoverBadgeText =
    header.match(/<[^>]*class="[^"]*\bbadge\b[^"]*"[^>]*>(Export compact [^<]*)<\/[^>]+>/u)?.[1] ?? "";
  const metadataFalsePositiveCountAfter9I = [
    ...mainTag.matchAll(/id="compressed-export-9h"|Export compact 9H|id="compressed-export-9g"|Export compact 9G/gu),
  ].length;

  return {
    exportTitleMentions9I: exportHtml.includes("<title>Rapport coach export compact 9I - budget cushion</title>"),
    exportMainIdIs9I: mainTag.includes('id="compressed-export-9i"'),
    exportCurrentDataAttributeVisible: mainTag.includes(
      'data-manual-review-preview-payload-dry-run-export-budget-cushion-version="9I"',
    ),
    exportCoverBadgeText,
    exportCoverBadgeExpectedText: "Export compact 9I" as const,
    exportCoverBadgeCorrect: exportCoverBadgeText === "Export compact 9I",
    metadataFalsePositiveCountAfter9I,
    historical9HPreserved: mainTag.includes('data-manual-review-preview-payload-dry-run-error-copy-ux-grouping-version="9H"'),
    historical9GPreserved: mainTag.includes(
      'data-manual-review-preview-payload-dry-run-export-key-messages-warning-consistency-repair-version="9G"',
    ),
    historical9FPreserved: mainTag.includes(
      'data-manual-review-preview-payload-dry-run-coach-facing-error-copy-compaction-version="9F"',
    ),
    historical9EPreserved: mainTag.includes('data-manual-review-preview-payload-dry-run-coach-facing-error-copy-version="9E"'),
    historical9DPreserved: mainTag.includes('data-export-metadata-badge-cleanup-version="9D"'),
    historical9CPreserved: mainTag.includes('data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C"'),
    historical9BPreserved: mainTag.includes('data-manual-review-preview-payload-dry-run-result-renderer-version="9B"'),
    historical9APreserved: mainTag.includes('data-manual-review-preview-payload-dry-run-validator-version="9A"'),
    historical8Z8Y8X8WPreserved:
      mainTag.includes('data-manual-review-validation-contract-audit-consistency-repair-version="8Z"') &&
      mainTag.includes('data-manual-review-preview-payload-validation-contract-version="8Y"') &&
      mainTag.includes('data-manual-review-preview-payload-contract-version="8X"') &&
      mainTag.includes('data-manual-review-preview-activation-guards-version="8W"'),
  };
}
