import {
  coachReportRealMatchHistoryCannotDriveSelection,
  coachReportRealMatchHistoryCannotMutateOfficialState,
} from "./coachReportRealMatchHistoryIntegration";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportRealMatchHistoryGuard(): readonly string[] {
  const { realMatchHistoryIntegration } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachReportRealMatchHistoryCannotDriveSelection(realMatchHistoryIntegration), "history store cannot drive selection.");
  assertTest(coachReportRealMatchHistoryCannotMutateOfficialState(realMatchHistoryIntegration), "history store cannot mutate official state.");
  assertTest(!realMatchHistoryIntegration.canChangeLineup, "history store cannot change lineup.");
  assertTest(!realMatchHistoryIntegration.canChangeStarters, "history store cannot change starters.");
  assertTest(!realMatchHistoryIntegration.canChangeBench, "history store cannot change bench.");
  assertTest(!realMatchHistoryIntegration.canDriveCoachInstruction, "history store cannot drive coach instruction.");
  assertTest(!realMatchHistoryIntegration.canDriveLiveSelection, "history store cannot drive live selection.");
  assertTest(!realMatchHistoryIntegration.canDriveProductionRouteResolution, "history store cannot drive production route resolution.");
  assertTest(!realMatchHistoryIntegration.canMutateTimeline, "history store cannot mutate official timeline.");
  assertTest(!realMatchHistoryIntegration.canMutateScore, "history store cannot mutate official score.");
  assertTest(!realMatchHistoryIntegration.canMutatePossession, "history store cannot mutate official possession.");
  assertTest(!realMatchHistoryIntegration.canCreateScoringEvent, "history store cannot create production scoring events.");
  assertTest(!realMatchHistoryIntegration.canClaimGlobalEconomy, "history store cannot claim global economy.");
  assertTest(realMatchHistoryIntegration.confidenceUpgradeCount === 0, "history store cannot upgrade confidence.");
  assertTest(realMatchHistoryIntegration.playerSelectedCount === 0, "history store cannot select a player.");

  return [
    "history store cannot change lineup",
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
  const checks = validateCoachReportRealMatchHistoryGuard();
  console.log("coachReportRealMatchHistoryGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

