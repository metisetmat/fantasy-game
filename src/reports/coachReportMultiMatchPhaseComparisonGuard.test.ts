import {
  coachReportMultiMatchPhaseComparisonCannotDriveSelection,
  coachReportMultiMatchPhaseComparisonCannotMutateOfficialState,
} from "./coachReportMultiMatchPhaseComparison";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchPhaseComparisonGuard(): readonly string[] {
  const { comparison } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachReportMultiMatchPhaseComparisonCannotDriveSelection(comparison), "comparison cannot drive selection.");
  assertTest(coachReportMultiMatchPhaseComparisonCannotMutateOfficialState(comparison), "comparison cannot mutate official state.");
  assertTest(!comparison.canChangeLineup, "comparison cannot change lineup.");
  assertTest(!comparison.canChangeStarters, "comparison cannot change starters.");
  assertTest(!comparison.canChangeBench, "comparison cannot change bench.");
  assertTest(!comparison.canDriveCoachInstruction, "comparison cannot drive coach instruction.");
  assertTest(!comparison.canDriveLiveSelection, "comparison cannot drive live selection.");
  assertTest(!comparison.canDriveProductionRouteResolution, "comparison cannot drive production route resolution.");
  assertTest(!comparison.canMutateTimeline, "comparison cannot mutate official timeline.");
  assertTest(!comparison.canMutateScore, "comparison cannot mutate official score.");
  assertTest(!comparison.canMutatePossession, "comparison cannot mutate official possession.");
  assertTest(!comparison.canCreateScoringEvent, "comparison cannot create production scoring events.");
  assertTest(!comparison.canClaimGlobalEconomy, "comparison cannot claim global economy.");
  assertTest(comparison.confidenceUpgradeCount === 0, "comparison cannot upgrade confidence.");
  assertTest(comparison.playerSelectedCount === 0, "comparison cannot select a player.");

  return [
    "comparison layer cannot change lineup",
    "cannot change starters",
    "cannot change bench",
    "cannot drive coach instruction",
    "cannot drive live selection",
    "cannot drive production route resolution",
    "cannot mutate official timeline",
    "cannot mutate official score",
    "cannot mutate official possession",
    "cannot create production scoring events",
    "cannot claim global economy",
    "cannot upgrade confidence",
    "cannot select a player",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportMultiMatchPhaseComparisonGuard();

  console.log("coachReportMultiMatchPhaseComparisonGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
