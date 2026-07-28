import { readTimeSeconds } from "./storyFirstAuditUtils8H";
import type {
  ManualReviewResultIntakeExportBudgetAudit8N,
  ManualReviewResultIntakeExportMetadataAudit8N,
} from "./manualReviewResultIntakeBoundaryTypes8N";
import type { ManualReviewResultIntakeBoundaryWarningCode8N } from "./manualReviewResultIntakeBoundaryWarnings8N";

export function auditManualReviewResultIntakeExportBudget8N(input: {
  readonly exportHtmlBefore8N: string;
  readonly exportHtmlAfter8N: string;
  readonly metadataAudit: ManualReviewResultIntakeExportMetadataAudit8N;
}): ManualReviewResultIntakeExportBudgetAudit8N {
  const exportReadTimeSecondsBefore8N = readTimeSeconds(input.exportHtmlBefore8N);
  const exportReadTimeSecondsAfter8N = readTimeSeconds(input.exportHtmlAfter8N);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8N <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8N <= 800;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (exportReadTimeSecondsAfter8N <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (exportReadTimeSecondsAfter8N <= 800);
  const exportManualIntakeBoundaryVisible = input.exportHtmlAfter8N.includes('id="manual-review-result-intake-boundary-export-8n"');
  const exportMandatorySectionsPreserved = input.exportHtmlAfter8N.includes("Le match en 2 minutes") &&
    input.exportHtmlAfter8N.includes("Replay coach en 60 secondes") &&
    input.exportHtmlAfter8N.includes("Plan d'action coach") &&
    input.exportHtmlAfter8N.includes("Formulaire post-match a remplir");
  const exportNoFullTimeline = !/timeline complete|full timeline|chronologie complete/iu.test(input.exportHtmlAfter8N);
  const exportNoSandboxPanel = !/sandbox panel|sandbox applique/iu.test(input.exportHtmlAfter8N);
  const exportNoLongBatchDiagnostics = !/long batch diagnostics|diagnostics batch longs/iu.test(input.exportHtmlAfter8N);
  const exportMetadataClean = input.metadataAudit.exportTitleMentions8N &&
    !input.metadataAudit.exportTitleStillOnly8I &&
    !input.metadataAudit.exportTitleStillOnly8M &&
    input.metadataAudit.exportMainCurrentVersionVisible &&
    !input.metadataAudit.exportMainIdStillCompressedExport8I &&
    !input.metadataAudit.exportVisibleBadgeStillOnly8I &&
    input.metadataAudit.exportVisibleBadgeMentionsCurrentSprint;
  const warnings: ManualReviewResultIntakeBoundaryWarningCode8N[] = [];

  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900");
  if (!exportUnder900BooleanCorrect) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (!exportUnder800BooleanCorrect) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!exportManualIntakeBoundaryVisible) warnings.push("EXPORT_MANUAL_INTAKE_BOUNDARY_MISSING");
  if (!exportMandatorySectionsPreserved || !exportNoFullTimeline || !exportNoSandboxPanel || !exportNoLongBatchDiagnostics) warnings.push("EXPORT_COMPACT_REGRESSED");
  if (!exportMetadataClean) warnings.push(...input.metadataAudit.metadataWarningCodes);

  return {
    exportReadTimeSecondsBefore8N,
    exportReadTimeSecondsAfter8N,
    exportReadTimeDelta: exportReadTimeSecondsAfter8N - exportReadTimeSecondsBefore8N,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    exportManualIntakeBoundaryVisible,
    exportMandatorySectionsPreserved,
    exportNoFullTimeline,
    exportNoSandboxPanel,
    exportNoLongBatchDiagnostics,
    exportMetadataClean,
    exportBudgetWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_INTAKE_EXPORT_BUDGET" : "REPAIR_MANUAL_INTAKE_EXPORT_BUDGET",
  };
}
