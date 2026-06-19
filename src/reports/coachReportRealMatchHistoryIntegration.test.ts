import { buildCoachReportRealMatchHistoryIntegration } from "./buildCoachReportRealMatchHistoryIntegration";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { createInMemoryCoachMatchHistoryStore } from "./history/inMemoryCoachMatchHistoryStore";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportRealMatchHistoryIntegration(): readonly string[] {
  const { report, productHtml, exportHtml, historyView, realMatchHistoryIntegration } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(realMatchHistoryIntegration.status === "available" || realMatchHistoryIntegration.status === "partial", "integration status is available or partial.");
  assertTest(realMatchHistoryIntegration.storeKind.length > 0, "store kind is present.");
  assertTest(realMatchHistoryIntegration.currentMatchRecordSaved, "current match record is saved.");
  assertTest(realMatchHistoryIntegration.storedRecordCount >= 1, "stored record count is present.");
  assertTest(realMatchHistoryIntegration.queriedRecordCount >= 1, "queried record count is present.");
  assertTest(realMatchHistoryIntegration.queriedSignalCount >= 1, "queried signal count is present.");
  assertTest(
    realMatchHistoryIntegration.controlledSampleRecordCount >= 0 &&
      realMatchHistoryIntegration.simulatedMatchHistoryRecordCount >= 0 &&
      realMatchHistoryIntegration.productHistoryRecordCount >= 0,
    "controlled, simulated, and product history counts are present.",
  );
  assertTest(!realMatchHistoryIntegration.canDriveLiveSelection, "history remains read-only.");
  assertTest(realMatchHistoryIntegration.trendProofClaimCount === 0, "trend proof claim count is zero.");
  assertTest(realMatchHistoryIntegration.globalProofClaimCount === 0, "global proof claim count is zero.");
  assertTest(realMatchHistoryIntegration.inventedStatisticCount === 0, "invented statistic count is zero.");
  assertTest(realMatchHistoryIntegration.sandboxEventsPromotedToOfficialCount === 0, "sandbox events promoted to official count is zero.");

  const failedUpstreamIntegration = buildCoachReportRealMatchHistoryIntegration({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
    multiMatchHistoryView: {
      ...historyView,
      status: "failed",
    },
    historyStore: createInMemoryCoachMatchHistoryStore(),
    runId: "failed-upstream-test",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });
  assertTest(failedUpstreamIntegration.status === "failed", "integration preserves an upstream failed history-view status.");

  return [
    "integration model exists",
    "status is available or partial",
    "store kind is present",
    "current match record is saved",
    "stored record count is present",
    "queried record count is present",
    "queried signal count is present",
    "controlled/simulated/product history counts are present",
    "history remains read-only",
    "failed upstream history view remains failed",
    "trend proof claim count is 0",
    "global proof claim count is 0",
    "invented statistic count is 0",
    "sandbox events promoted to official count is 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportRealMatchHistoryIntegration();
  console.log("coachReportRealMatchHistoryIntegration tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
