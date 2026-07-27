import { countMatches, readTimeSeconds } from "./storyFirstAuditUtils8H";
import type { DecisionLayerExportBudgetAudit8K } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { CoachReportDecisionLayerNextMatchObservationPlanWarningCode } from "./coachReportDecisionLayerNextMatchObservationPlanWarnings";

export function auditDecisionLayerExportBudget8K(input: {
  readonly exportHtmlBefore8K: string;
  readonly exportHtmlAfter8K: string;
}): DecisionLayerExportBudgetAudit8K {
  const exportReadTimeSecondsBefore8K = readTimeSeconds(input.exportHtmlBefore8K);
  const exportReadTimeSecondsAfter8K = readTimeSeconds(input.exportHtmlAfter8K);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8K <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8K <= 800;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (exportReadTimeSecondsAfter8K <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (exportReadTimeSecondsAfter8K <= 800);
  const exportedDecisionLayerVisible = input.exportHtmlAfter8K.includes('id="next-match-observation-export-8k"');
  const exportedObservationItemsCount = countMatches(input.exportHtmlAfter8K, /observation-export-card-8k/giu);
  const exportMandatorySectionsPreserved = [
    "Score officiel",
    "Lecture express",
    "Le match en 2 minutes",
    "Replay coach en 60 secondes",
    "Plan d'action coach",
    "Cartes tactiques essentielles",
    "Source-of-truth note",
  ].every((label) => input.exportHtmlAfter8K.includes(label));
  const exportNoFullTimeline = !/timeline complete|78 evenements|78 events|full timeline/iu.test(input.exportHtmlAfter8K);
  const exportNoSandboxPanel = !/sandbox panel|sandbox applique|sandbox appliqu/iu.test(input.exportHtmlAfter8K);
  const exportNoLongBatchDiagnostics = !/long batch diagnostics|diagnostics batch|50-match/iu.test(input.exportHtmlAfter8K);
  const warnings: CoachReportDecisionLayerNextMatchObservationPlanWarningCode[] = [];

  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900");
  if (!exportUnder900BooleanCorrect) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (!exportUnder800BooleanCorrect) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!exportedDecisionLayerVisible || !exportMandatorySectionsPreserved || !exportNoFullTimeline || !exportNoSandboxPanel || !exportNoLongBatchDiagnostics) {
    warnings.push("EXPORT_COMPACT_REGRESSED");
  }

  return {
    exportReadTimeSecondsBefore8K,
    exportReadTimeSecondsAfter8K,
    exportReadTimeDelta: exportReadTimeSecondsAfter8K - exportReadTimeSecondsBefore8K,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    exportedDecisionLayerVisible,
    exportedObservationItemsCount,
    exportMandatorySectionsPreserved,
    exportNoFullTimeline,
    exportNoSandboxPanel,
    exportNoLongBatchDiagnostics,
    exportBudgetWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_8K_EXPORT_BUDGET" : "REPAIR_8K_EXPORT_BUDGET",
  };
}
