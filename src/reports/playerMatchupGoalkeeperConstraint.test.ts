import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePlayerMatchupGoalkeeperConstraint(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(
    report,
    engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
  ).playerMatchupView;
  const calibration = model.calibration;

  assertTest(calibration !== undefined, "calibration model must exist.");
  const supportGk = calibration.calibrationResults.find((result) => result.profileId === "support_near_z4_hsr_profile" && result.playerId === "control-gk");
  const secondBallGk = calibration.calibrationResults.find((result) => result.profileId === "second_ball_presence_profile" && result.playerId === "control-gk");
  const strongGk = calibration.calibrationResults.find((result) => result.profileId === "strong_goalkeeper_response_profile" && result.playerId === "control-gk");

  assertTest(supportGk !== undefined && supportGk.eligibilityStatus === "excluded", "goalkeeper is excluded or penalized for support-near-danger profile.");
  assertTest(secondBallGk !== undefined && secondBallGk.eligibilityStatus === "excluded", "goalkeeper is excluded or penalized for second-ball presence profile.");
  assertTest(strongGk !== undefined && strongGk.visibleAsCandidate && strongGk.eligibilityStatus === "penalized", "goalkeeper may be eligible for strong-goalkeeper-response only under defensive stabilization wording.");
  assertTest(calibration.calibrationResults.filter((result) => result.playerId === "control-gk" && result.fitBand === "high" && result.visibleAsCandidate).length < 3, "goalkeeper cannot appear as strong fit across all 3 profiles.");
  assertTest(calibration.goalkeeperOutfieldExclusionCount > 0, "goalkeeper outfield exclusion count is present.");

  return [
    "goalkeeper excluded or penalized for support-near-danger profile",
    "goalkeeper excluded or penalized for second-ball presence profile",
    "goalkeeper may be eligible only as defensive stabilization for strong-goalkeeper-response",
    "goalkeeper cannot appear as strong fit across all 3 profiles",
    "goalkeeper outfield exclusion count is present",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupGoalkeeperConstraint();

  console.log("playerMatchupGoalkeeperConstraint tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
