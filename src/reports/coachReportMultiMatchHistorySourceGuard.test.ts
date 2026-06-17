import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchHistorySourceGuard(): readonly string[] {
  const { comparison, historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(historyView.origin === "coach_report_multi_match_phase_comparison", "history view must consume multi-match phase comparison only.");
  assertTest(historyView.singleSourceOfTruth, "history view must not create a second source of truth.");
  assertTest(historyView.sandboxEventsPromotedToOfficialCount === 0, "sandbox-only events must not be promoted to official.");
  assertTest(historyView.inventedStatisticCount === 0, "invented statistic count must remain zero.");
  assertTest(historyView.productExportScoreMatches && comparison.productExportScoreMatches, "product/export score must match.");
  assertTest(historyView.candidateComparisonMatchesProduct && comparison.candidateComparisonMatchesProduct, "candidate comparison must match.");
  assertTest(historyView.interpretationGuardMatchesProduct && comparison.interpretationGuardMatchesProduct, "interpretation guard must remain visible.");

  return [
    "history view consumes multi-match phase comparison only",
    "no second source of truth is created",
    "sandbox-only events are not promoted to official",
    "invented statistic count is 0",
    "product/export score matches",
    "candidate comparison matches",
    "interpretation guard remains visible",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchHistorySourceGuard();
  console.log("coachReportMultiMatchHistorySourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
