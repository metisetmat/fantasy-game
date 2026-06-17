import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchPhaseComparisonSourceGuard(): readonly string[] {
  const { comparison } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(comparison.origin === "coach_report_phase_visual_readability", "comparison must consume phase readability only.");
  assertTest(comparison.singleSourceOfTruth, "comparison must not create a second source of truth.");
  assertTest(comparison.sandboxEventsPromotedToOfficialCount === 0, "sandbox-only events must not be promoted to official.");
  assertTest(comparison.inventedStatisticCount === 0, "invented statistic count must remain zero.");
  assertTest(comparison.productExportScoreMatches, "product/export score must match.");
  assertTest(comparison.candidateComparisonMatchesProduct, "candidate comparison must match.");
  assertTest(comparison.interpretationGuardMatchesProduct, "interpretation guard must remain visible.");

  return [
    "comparison consumes phase readability only",
    "no second source of truth is created",
    "sandbox-only events are not promoted to official",
    "invented statistic count is 0",
    "product/export score matches",
    "candidate comparison matches",
    "interpretation guard remains visible",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchPhaseComparisonSourceGuard();

  console.log("coachReportMultiMatchPhaseComparisonSourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
