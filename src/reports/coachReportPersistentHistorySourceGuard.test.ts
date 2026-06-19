import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPersistentHistorySourceGuard(): readonly string[] {
  const { comparison, historyView, realMatchHistoryIntegration, persistentHistoryAdapter } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(persistentHistoryAdapter.origin === "coach_report_real_match_history_store", "persistent adapter derives from match history records only.");
  assertTest(persistentHistoryAdapter.singleSourceOfTruth, "no second source of truth is created.");
  assertTest(persistentHistoryAdapter.sandboxEventsPromotedToOfficialCount === 0, "sandbox-only events are not promoted to official.");
  assertTest(persistentHistoryAdapter.inventedStatisticCount === 0, "invented statistic count is 0.");
  assertTest(persistentHistoryAdapter.productExportScoreMatches && realMatchHistoryIntegration.productExportScoreMatches && historyView.productExportScoreMatches && comparison.productExportScoreMatches, "product/export score matches.");
  assertTest(persistentHistoryAdapter.candidateComparisonMatchesProduct, "candidate comparison matches.");
  assertTest(persistentHistoryAdapter.interpretationGuardMatchesProduct, "interpretation guard remains visible.");

  return [
    "persistence adapter derives from match history records only",
    "no second source of truth is created",
    "sandbox-only events are not promoted to official",
    "invented statistic count is 0",
    "product/export score matches",
    "candidate comparison matches",
    "interpretation guard remains visible",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPersistentHistorySourceGuard();
  console.log("coachReportPersistentHistorySourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
