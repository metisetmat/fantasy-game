import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchPhaseComparison(): readonly string[] {
  const { comparison } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(comparison.status === "available" || comparison.status === "partial", "comparison status must be available or partial.");
  assertTest(comparison.sampleCount > 0, "comparison sample count must be present.");
  assertTest(comparison.panelCount >= 3, "comparison panel count must be at least 3.");
  assertTest(comparison.comparedSignalCount >= 0, "comparison signal count must be present.");
  assertTest(comparison.repeatedSignalCount >= 0, "repeated signal count must be present.");
  assertTest(comparison.visibleOnceSignalCount >= 0, "visible-once signal count must be present.");
  assertTest(comparison.unstableSignalCount >= 0, "unstable signal count must be present.");
  assertTest(comparison.insufficientDataCount >= 0, "insufficient data count must be present.");
  assertTest(comparison.localComparisonOnly, "comparison must remain local comparison only.");
  assertTest(comparison.globalProofClaimCount === 0, "global proof claim count must remain zero.");
  assertTest(comparison.inventedStatisticCount === 0, "invented statistic count must remain zero.");
  assertTest(comparison.sandboxEventsPromotedToOfficialCount === 0, "sandbox events promoted to official count must remain zero.");

  return [
    "multi-match comparison model exists",
    "status is available or partial",
    "sample count is present",
    "panel count is at least 3",
    "compared signal count is present",
    "repeated signal count is present",
    "visible-once signal count is present",
    "unstable signal count is present",
    "insufficient data count is present",
    "local comparison only is true",
    "global proof claim count is 0",
    "invented statistic count is 0",
    "sandbox events promoted to official count is 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchPhaseComparison();

  console.log("coachReportMultiMatchPhaseComparison tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
