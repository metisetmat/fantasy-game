import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchHistoryView(): readonly string[] {
  const { historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(historyView.status === "available" || historyView.status === "partial", "history view status must be available or partial.");
  assertTest(historyView.sampleCount > 0, "history sample count must be present.");
  assertTest(historyView.drilldownCount >= 0, "history drilldown count must be present.");
  assertTest(historyView.historySampleRowCount >= 0, "history sample row count must be present.");
  assertTest(historyView.localRepeatedDrilldownCount >= 0, "local repeated count must be present.");
  assertTest(historyView.localVisibleOnceDrilldownCount >= 0, "local visible-once count must be present.");
  assertTest(historyView.localUnstableDrilldownCount >= 0, "local unstable count must be present.");
  assertTest(historyView.insufficientDataDrilldownCount >= 0, "insufficient-data count must be present.");
  assertTest(historyView.trendProofClaimCount === 0, "trend proof claim count must remain zero.");
  assertTest(historyView.globalProofClaimCount === 0, "global proof claim count must remain zero.");
  assertTest(historyView.inventedStatisticCount === 0, "invented statistic count must remain zero.");
  assertTest(historyView.sandboxEventsPromotedToOfficialCount === 0, "sandbox events promoted to official count must remain zero.");

  return [
    "history view model exists",
    "status is available or partial",
    "sample count is present",
    "drilldown count is present",
    "history sample row count is present",
    "local repeated/visible-once/unstable/insufficient counts are present",
    "trend proof claim count is 0",
    "global proof claim count is 0",
    "invented statistic count is 0",
    "sandbox events promoted to official count is 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchHistoryView();
  console.log("coachReportMultiMatchHistoryView tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
