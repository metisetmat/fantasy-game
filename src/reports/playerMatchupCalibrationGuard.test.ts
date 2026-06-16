import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  playerMatchupCalibrationCannotDriveSelection,
  playerMatchupCalibrationCannotMutateOfficialState,
} from "./playerMatchupCalibration";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePlayerMatchupCalibrationGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const calibration = buildCoachProductReportViewFromMatchReport(
    report,
    engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
  ).playerMatchupView.calibration;

  assertTest(calibration !== undefined, "calibration model must exist.");
  assertTest(!calibration.canChangeLineup && calibration.lineupMutationCount === 0, "calibration cannot change lineup.");
  assertTest(!calibration.canChangeStarters && calibration.startersMutationCount === 0, "calibration cannot change starters.");
  assertTest(!calibration.canChangeBench && calibration.benchMutationCount === 0, "calibration cannot change bench.");
  assertTest(!calibration.canDriveCoachInstruction, "calibration cannot drive coach instruction.");
  assertTest(!calibration.canDriveLiveSelection, "calibration cannot drive live selection.");
  assertTest(!calibration.canDriveProductionRouteResolution, "calibration cannot drive production route resolution.");
  assertTest(playerMatchupCalibrationCannotMutateOfficialState(calibration), "calibration cannot mutate official state.");
  assertTest(!calibration.canMutateScore, "calibration cannot mutate official score.");
  assertTest(!calibration.canMutatePossession, "calibration cannot mutate official possession.");
  assertTest(!calibration.canCreateScoringEvent, "calibration cannot create production scoring events.");
  assertTest(!calibration.canClaimGlobalEconomy, "calibration cannot claim global economy.");
  assertTest(calibration.confidenceUpgradeCount === 0, "calibration cannot upgrade confidence.");
  assertTest(calibration.playerSelectedCount === 0, "calibration cannot select a player.");
  assertTest(playerMatchupCalibrationCannotDriveSelection(calibration), "calibration cannot drive selection.");

  return [
    "calibration cannot change lineup",
    "calibration cannot change starters",
    "calibration cannot change bench",
    "calibration cannot drive coach instruction",
    "calibration cannot drive live selection",
    "calibration cannot drive production route resolution",
    "calibration cannot mutate official timeline",
    "calibration cannot mutate official score",
    "calibration cannot mutate official possession",
    "calibration cannot create production scoring events",
    "calibration cannot claim global economy",
    "calibration cannot upgrade confidence",
    "calibration cannot select a player",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupCalibrationGuard();

  console.log("playerMatchupCalibrationGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
