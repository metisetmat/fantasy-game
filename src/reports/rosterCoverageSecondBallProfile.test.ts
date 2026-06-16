import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRosterCoverageSecondBallProfile(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const view = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const calibration = view.playerMatchupView.calibration;
  const secondBallBlock = view.playerMatchupView.blocks.find((block) => block.profileId === "second_ball_presence_profile");

  assertTest(calibration !== undefined, "calibration must exist.");
  assertTest(secondBallBlock !== undefined, "second-ball profile block must exist.");
  assertTest(secondBallBlock.candidates.length >= 1 && secondBallBlock.candidates.length <= 3, "second-ball profile must show 1 to 3 visible candidates.");
  assertTest(secondBallBlock.candidates.some((candidate) => candidate.playerId === "rc-second-ball-chaser"), "second-ball chaser must appear.");
  assertTest(!secondBallBlock.candidates.some((candidate) => candidate.playerId === "rc-gk-specialist"), "goalkeeper must not appear in second-ball profile.");
  const lowEnduranceCreator = calibration.calibrationResults.find((result) => result.profileId === "second_ball_presence_profile" && result.playerId === "rc-low-endurance-creator");
  const intenseRecovery = calibration.calibrationResults.find((result) => result.profileId === "second_ball_presence_profile" && result.playerId === "rc-intense-recovery");

  assertTest(lowEnduranceCreator !== undefined && !lowEnduranceCreator.visibleAsCandidate, "low-endurance creator must not be visible in second-ball profile.");
  assertTest(intenseRecovery !== undefined && intenseRecovery.fitBand !== "not_compatible", "intense recovery player must remain relevant for second-ball profile.");

  return [
    "second-ball profile shows 1 to 3 visible candidates",
    "second-ball chaser appears",
    "goalkeeper is not visible in second-ball profile",
    "low-endurance creator is not visible where endurance is critical",
    "intense recovery player remains relevant",
  ];
}

if (require.main === module) {
  const checks = validateRosterCoverageSecondBallProfile();

  console.log("rosterCoverageSecondBallProfile tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
