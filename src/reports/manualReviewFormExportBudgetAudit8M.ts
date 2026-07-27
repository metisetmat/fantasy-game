import { countMatches, readTimeSeconds } from "./storyFirstAuditUtils8H";
import type { ManualReviewFormExportBudgetAudit8M } from "./manualPostMatchObservationReviewFormTypes8M";
import type { ManualPostMatchObservationReviewFormWarningCode8M } from "./manualPostMatchObservationReviewFormWarnings";

export function auditManualReviewFormExportBudget8M(input: {
  readonly exportHtmlBefore8M: string;
  readonly exportHtmlAfter8M: string;
}): ManualReviewFormExportBudgetAudit8M {
  const exportReadTimeSecondsBefore8M = readTimeSeconds(input.exportHtmlBefore8M);
  const exportReadTimeSecondsAfter8M = readTimeSeconds(input.exportHtmlAfter8M);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8M <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8M <= 800;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (exportReadTimeSecondsAfter8M <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (exportReadTimeSecondsAfter8M <= 800);
  const exportFormVisible = input.exportHtmlAfter8M.includes('id="manual-post-match-review-form-export-8m"');
  const exportMiniCardCount = countMatches(input.exportHtmlAfter8M, /manual-review-export-card-8m/giu);
  const exportMetadataVersionVisible = input.exportHtmlAfter8M.includes('data-manual-review-form-version="8M"');
  const exportTitleMentions8M = /<title>[^<]*8M[^<]*<\/title>/iu.test(input.exportHtmlAfter8M);
  const exportTitleNotOnly8I = !/<title>\s*Rapport coach export compact 8I\s*<\/title>/iu.test(input.exportHtmlAfter8M);
  const warnings: ManualPostMatchObservationReviewFormWarningCode8M[] = [];

  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900");
  if (!exportUnder900BooleanCorrect) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (!exportUnder800BooleanCorrect) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!exportFormVisible || exportMiniCardCount !== 3 || !exportMetadataVersionVisible) warnings.push("EXPORT_METADATA_MISSING");
  if (!exportTitleMentions8M || !exportTitleNotOnly8I) warnings.push("EXPORT_TITLE_ONLY_8I");

  return {
    exportReadTimeSecondsBefore8M,
    exportReadTimeSecondsAfter8M,
    exportReadTimeDelta: exportReadTimeSecondsAfter8M - exportReadTimeSecondsBefore8M,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    exportFormVisible,
    exportMiniCardCount,
    exportMetadataVersionVisible,
    exportTitleMentions8M,
    exportTitleNotOnly8I,
    exportBudgetWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_REVIEW_EXPORT_BUDGET" : "REPAIR_MANUAL_REVIEW_EXPORT_BUDGET",
  };
}
