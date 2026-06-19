import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportRealMatchHistorySourceGuard(): readonly string[] {
  const { comparison, historyView, realMatchHistoryIntegration } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(realMatchHistoryIntegration.origin === "coach_report_multi_match_history_view", "history integration derives from the report/history chain only.");
  assertTest(realMatchHistoryIntegration.singleSourceOfTruth, "no second source of truth is created.");
  assertTest(realMatchHistoryIntegration.sandboxEventsPromotedToOfficialCount === 0, "sandbox-only events are not promoted to official.");
  assertTest(realMatchHistoryIntegration.inventedStatisticCount === 0, "invented statistic count remains zero.");
  assertTest(realMatchHistoryIntegration.productExportScoreMatches && historyView.productExportScoreMatches && comparison.productExportScoreMatches, "product/export score matches.");
  assertTest(realMatchHistoryIntegration.candidateComparisonMatchesProduct && historyView.candidateComparisonMatchesProduct, "candidate comparison matches.");
  assertTest(realMatchHistoryIntegration.interpretationGuardMatchesProduct, "interpretation guard remains visible.");

  return [
    "history record derives from product and match report only",
    "no second source of truth is created",
    "sandbox-only events are not promoted to official",
    "invented statistic count is 0",
    "product/export score matches",
    "candidate comparison matches",
    "interpretation guard remains visible",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportRealMatchHistorySourceGuard();
  console.log("coachReportRealMatchHistorySourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

