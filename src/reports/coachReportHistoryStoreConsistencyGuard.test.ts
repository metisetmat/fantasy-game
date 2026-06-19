import {
  coachReportHistoryStoreConsistencyCannotDriveSelection,
  coachReportHistoryStoreConsistencyCannotMutateOfficialState,
} from "./coachReportHistoryStoreConsistency";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportHistoryStoreConsistencyGuard(): readonly string[] {
  const { historyStoreConsistency } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachReportHistoryStoreConsistencyCannotDriveSelection(historyStoreConsistency), "history-store consistency cannot drive selection.");
  assertTest(coachReportHistoryStoreConsistencyCannotMutateOfficialState(historyStoreConsistency), "history-store consistency cannot mutate official state.");
  assertTest(historyStoreConsistency.trendProofClaimCount === 0, "trend proof claim count is 0.");
  assertTest(historyStoreConsistency.globalProofClaimCount === 0, "global proof claim count is 0.");
  assertTest(historyStoreConsistency.fullMatchBatchEconomyRemainsOnlyGlobalProof, "batch economy remains only global proof.");

  return [
    "history-store consistency cannot drive selection",
    "history-store consistency cannot mutate official state",
    "trend proof claim count is 0",
    "global proof claim count is 0",
    "batch economy remains only global proof",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportHistoryStoreConsistencyGuard();
  console.log("coachReportHistoryStoreConsistencyGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
