import {
  coachReportMultiMatchHistoryViewCannotDriveSelection,
  coachReportMultiMatchHistoryViewCannotMutateOfficialState,
} from "./coachReportMultiMatchHistoryView";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportMultiMatchHistoryGuard(): readonly string[] {
  const { historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(coachReportMultiMatchHistoryViewCannotDriveSelection(historyView), "history view cannot drive selection.");
  assertTest(coachReportMultiMatchHistoryViewCannotMutateOfficialState(historyView), "history view cannot mutate official state.");
  assertTest(!historyView.canChangeLineup, "history view cannot change lineup.");
  assertTest(!historyView.canChangeStarters, "history view cannot change starters.");
  assertTest(!historyView.canChangeBench, "history view cannot change bench.");
  assertTest(!historyView.canDriveCoachInstruction, "history view cannot drive coach instruction.");
  assertTest(!historyView.canDriveLiveSelection, "history view cannot drive live selection.");
  assertTest(!historyView.canDriveProductionRouteResolution, "history view cannot drive production route resolution.");
  assertTest(!historyView.canMutateTimeline, "history view cannot mutate official timeline.");
  assertTest(!historyView.canMutateScore, "history view cannot mutate official score.");
  assertTest(!historyView.canMutatePossession, "history view cannot mutate official possession.");
  assertTest(!historyView.canCreateScoringEvent, "history view cannot create production scoring events.");
  assertTest(!historyView.canClaimGlobalEconomy, "history view cannot claim global economy.");
  assertTest(historyView.confidenceUpgradeCount === 0, "history view cannot upgrade confidence.");
  assertTest(historyView.playerSelectedCount === 0, "history view cannot select a player.");

  return [
    "history layer cannot change lineup",
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
  const checks = validateCoachReportMultiMatchHistoryGuard();
  console.log("coachReportMultiMatchHistoryGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
