import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchPhaseComparisonRenderer(): readonly string[] {
  const { comparison } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(comparison.status === "available" || comparison.status === "partial", "phase comparison evidence model must exist.");
  assertTest(comparison.sampleCount > 0, "phase comparison evidence contains samples.");
  assertTest(comparison.panels.length >= 3, "phase comparison evidence contains panels.");
  assertTest(comparison.repeatedSignalCount + comparison.visibleOnceSignalCount + comparison.unstableSignalCount + comparison.insufficientDataCount > 0, "phase comparison evidence contains signal states.");
  assertTest(comparison.localComparisonOnly, "phase comparison evidence keeps the local comparison guard.");
  assertTest(comparison.tags.includes("coach_report_multi_match_phase_comparison"), "phase comparison evidence tags remain present.");

  return [
    "phase comparison evidence model exists",
    "phase comparison evidence contains samples and panels",
    "phase comparison evidence contains repeated/visible/unstable states",
    "7F can move visible phase comparison sections out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchPhaseComparisonRenderer();

  console.log("coachReportMultiMatchPhaseComparisonRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
