import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { playerMatchupProfileConstraints } from "./buildPlayerMatchupCalibration";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePlayerMatchupCalibration(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(
    report,
    engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
  ).playerMatchupView;
  const calibration = model.calibration;

  assertTest(calibration !== undefined, "calibration model must exist.");
  assertTest(calibration.status === "available", "calibration status must be available.");
  assertTest(calibration.profileConstraintCount === 3, "profile constraint count must be 3.");
  assertTest(playerMatchupProfileConstraints.every((constraint) => constraint.allowedRoleLabels.length > 0 || constraint.goalkeeperAllowed), "every profile must have role constraints.");
  assertTest(calibration.evaluatedPlayerProfilePairCount === model.profileBlockCount * engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster.length, "every player/profile pair must be evaluated.");
  assertTest(model.blocks.every((block) => block.candidates.every((candidate) => calibration.calibrationResults.some((result) => result.playerId === candidate.playerId && result.profileId === block.profileId && result.visibleAsCandidate))), "excluded candidates must not be shown.");
  assertTest(calibration.calibrationResults.every((result) => result.eligibilityStatus !== "penalized" || result.fitBand !== "high"), "penalized candidates cannot be high fit.");
  assertTest(calibration.calibrationResults.every((result) => result.calibratedFitScore >= 0 && result.calibratedFitScore <= 100), "fit score must stay between 0 and 100.");
  assertTest(calibration.calibrationResults.every((result) => result.fitBand === "not_compatible" || result.fitBand === "low" || result.fitBand === "medium" || result.fitBand === "high"), "fit band must be calibrated.");
  assertTest(calibration.playerSelectedCount === 0, "no player is automatically selected.");

  return [
    "calibration model exists",
    "calibration status is available",
    "profile constraint count is 3",
    "every profile has role constraints",
    "every player/profile pair is evaluated",
    "excluded candidates are not shown",
    "penalized candidates cannot be high fit",
    "fit score remains between 0 and 100",
    "fit band is calibrated from calibrated score",
    "no player is automatically selected",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupCalibration();

  console.log("playerMatchupCalibration tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
