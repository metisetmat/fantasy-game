import { countMatches, readTimeSeconds } from "./storyFirstAuditUtils8H";
import type { LearningLoopExportBudgetAudit8L } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import type { CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerWarnings";

export function auditLearningLoopExportBudget8L(input: {
  readonly exportHtmlBefore8L: string;
  readonly exportHtmlAfter8L: string;
}): LearningLoopExportBudgetAudit8L {
  const exportReadTimeSecondsBefore8L = readTimeSeconds(input.exportHtmlBefore8L);
  const exportReadTimeSecondsAfter8L = readTimeSeconds(input.exportHtmlAfter8L);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8L <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8L <= 800;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (exportReadTimeSecondsAfter8L <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (exportReadTimeSecondsAfter8L <= 800);
  const exportTrackerVisible = input.exportHtmlAfter8L.includes('id="seasonless-learning-loop-export-8l"') &&
    input.exportHtmlAfter8L.includes("Grille de suivi apres prochain match");
  const exportTrackerCardCount = countMatches(input.exportHtmlAfter8L, /observation-outcome-export-card-8l/giu);
  const exportMandatorySectionsPreserved = [
    "Score officiel",
    "Lecture express",
    "Le match en 2 minutes",
    "Replay coach en 60 secondes",
    "Plan d'action coach",
    "A observer au prochain match",
    "Cartes tactiques essentielles",
    "Source-of-truth note",
  ].every((label) => input.exportHtmlAfter8L.includes(label));
  const exportNoFullTimeline = !/timeline complete|78 evenements|78 events|full timeline/iu.test(input.exportHtmlAfter8L);
  const exportNoSandboxPanel = !/sandbox panel|sandbox applique|sandbox appliqu/iu.test(input.exportHtmlAfter8L);
  const exportNoLongBatchDiagnostics = !/long batch diagnostics|diagnostics batch|50-match/iu.test(input.exportHtmlAfter8L);
  const warnings: CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[] = [];

  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900");
  if (!exportUnder900BooleanCorrect) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (!exportUnder800BooleanCorrect) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!exportTrackerVisible || exportTrackerCardCount !== 3 || !exportMandatorySectionsPreserved || !exportNoFullTimeline || !exportNoSandboxPanel || !exportNoLongBatchDiagnostics) {
    warnings.push("EXPORT_COMPACT_REGRESSED");
  }

  return {
    exportReadTimeSecondsBefore8L,
    exportReadTimeSecondsAfter8L,
    exportReadTimeDelta: exportReadTimeSecondsAfter8L - exportReadTimeSecondsBefore8L,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    exportTrackerVisible,
    exportTrackerCardCount,
    exportMandatorySectionsPreserved,
    exportNoFullTimeline,
    exportNoSandboxPanel,
    exportNoLongBatchDiagnostics,
    exportBudgetWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_LEARNING_LOOP_EXPORT_BUDGET" : "REPAIR_LEARNING_LOOP_EXPORT_BUDGET",
  };
}
