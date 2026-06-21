import {
  coachReportControlledLocalReadOnlyDbModeCannotDriveSelection,
  coachReportControlledLocalReadOnlyDbModeCannotMutateOfficialState,
} from "./coachReportControlledLocalReadOnlyDbMode";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportControlledLocalReadOnlyDbModeGuard(): readonly string[] {
  const { controlledLocalReadOnlyDbMode: model } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachReportControlledLocalReadOnlyDbModeCannotDriveSelection(model), "controlled read-only DB mode cannot drive selection.");
  assertTest(coachReportControlledLocalReadOnlyDbModeCannotMutateOfficialState(model), "controlled read-only DB mode cannot mutate official state.");
  assertTest(!model.canDriveCoachInstruction, "cannot drive coach instruction.");
  assertTest(!model.canDriveLiveSelection, "cannot drive live selection.");
  assertTest(!model.canDriveProductionRouteResolution, "cannot drive production route resolution.");
  assertTest(!model.canMutateScore, "cannot mutate score.");
  assertTest(!model.canMutateTimeline, "cannot mutate timeline.");
  assertTest(!model.canMutatePossession, "cannot mutate possession.");
  assertTest(!model.canCreateProductionScoringEvents, "cannot create production scoring events.");
  assertTest(!model.canMutateLineup, "cannot mutate lineup.");
  assertTest(!model.canMutateStarters, "cannot mutate starters.");
  assertTest(!model.canMutateBench, "cannot mutate bench.");
  assertTest(!model.canClaimGlobalEconomy, "cannot claim global economy.");
  assertTest(model.trendProofClaimCount === 0, "trend proof claim count must be 0.");
  assertTest(model.inventedStatisticCount === 0, "invented statistic count must be 0.");
  assertTest(model.sandboxEventsPromotedToOfficialCount === 0, "sandbox promotion count must be 0.");

  return [
    "controlled local read-only DB mode cannot drive selection",
    "controlled local read-only DB mode cannot mutate official state",
    "trend proof, invented statistic, and sandbox promotion counts are 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportControlledLocalReadOnlyDbModeGuard();
  console.log("coachReportControlledLocalReadOnlyDbModeGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
