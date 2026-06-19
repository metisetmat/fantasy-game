import {
  coachReportPersistentHistoryAdapterCannotDriveSelection,
  coachReportPersistentHistoryAdapterCannotMutateOfficialState,
} from "./coachReportPersistentHistoryAdapter";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPersistentHistoryGuard(): readonly string[] {
  const { persistentHistoryAdapter } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachReportPersistentHistoryAdapterCannotDriveSelection(persistentHistoryAdapter), "persistent history adapter cannot drive selection.");
  assertTest(coachReportPersistentHistoryAdapterCannotMutateOfficialState(persistentHistoryAdapter), "persistent history adapter cannot mutate official state.");
  assertTest(!persistentHistoryAdapter.canChangeLineup, "persistent history adapter cannot change lineup.");
  assertTest(!persistentHistoryAdapter.canChangeStarters, "persistent history adapter cannot change starters.");
  assertTest(!persistentHistoryAdapter.canChangeBench, "persistent history adapter cannot change bench.");
  assertTest(!persistentHistoryAdapter.canDriveCoachInstruction, "persistent history adapter cannot drive coach instruction.");
  assertTest(!persistentHistoryAdapter.canDriveLiveSelection, "persistent history adapter cannot drive live selection.");
  assertTest(!persistentHistoryAdapter.canDriveProductionRouteResolution, "persistent history adapter cannot drive production route resolution.");
  assertTest(!persistentHistoryAdapter.canMutateTimeline, "persistent history adapter cannot mutate official timeline.");
  assertTest(!persistentHistoryAdapter.canMutateScore, "persistent history adapter cannot mutate official score.");
  assertTest(!persistentHistoryAdapter.canMutatePossession, "persistent history adapter cannot mutate official possession.");
  assertTest(!persistentHistoryAdapter.canCreateScoringEvent, "persistent history adapter cannot create production scoring events.");
  assertTest(!persistentHistoryAdapter.canClaimGlobalEconomy, "persistent history adapter cannot claim global economy.");
  assertTest(persistentHistoryAdapter.confidenceUpgradeCount === 0, "persistent history adapter cannot upgrade confidence.");
  assertTest(persistentHistoryAdapter.playerSelectedCount === 0, "persistent history adapter cannot select a player.");

  return [
    "persistent history adapter cannot change lineup",
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
  const checks = validateCoachReportPersistentHistoryGuard();
  console.log("coachReportPersistentHistoryGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
