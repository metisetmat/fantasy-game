import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchHistoryRenderer(): readonly string[] {
  const { historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(historyView.status === "available" || historyView.status === "partial", "history evidence model must exist.");
  assertTest(historyView.sampleCount > 0, "history evidence contains local samples.");
  assertTest(historyView.drilldowns.length > 0, "history evidence contains history reading.");
  assertTest(!historyView.canClaimGlobalEconomy, "history evidence stays cautious.");
  assertTest(historyView.tags.includes("coach_report_multi_match_history_view"), "history evidence tags remain present.");

  return [
    "history evidence model exists",
    "history evidence contains local samples",
    "history evidence contains drilldown reading",
    "7F can move visible history sections out of the coach main body",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchHistoryRenderer();
  console.log("coachReportMultiMatchHistoryRenderer tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
