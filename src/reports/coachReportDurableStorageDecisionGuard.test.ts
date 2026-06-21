import {
  coachReportDurableStorageDecisionCannotDriveSelection,
  coachReportDurableStorageDecisionCannotMutateOfficialState,
} from "./coachReportDurableStorageDecision";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportDurableStorageDecisionGuard(): readonly string[] {
  const { durableStorageDecision } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachReportDurableStorageDecisionCannotDriveSelection(durableStorageDecision), "durable storage cannot drive selection.");
  assertTest(coachReportDurableStorageDecisionCannotMutateOfficialState(durableStorageDecision), "durable storage cannot mutate official state.");
  assertTest(durableStorageDecision.trendProofClaimCount === 0, "trend proof claim count is 0.");
  assertTest(durableStorageDecision.globalProofClaimCount === 0, "global proof claim count is 0.");
  assertTest(durableStorageDecision.inventedStatisticCount === 0, "invented statistic count is 0.");
  assertTest(durableStorageDecision.sandboxEventsPromotedToOfficialCount === 0, "sandbox promoted count is 0.");

  return [
    "durable storage cannot drive selection",
    "durable storage cannot mutate official state",
    "proof, invented-statistic, and sandbox-promotion counts are 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportDurableStorageDecisionGuard();
  console.log("coachReportDurableStorageDecisionGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
