import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRosterCoverageSupportProfile(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const view = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const calibration = view.playerMatchupView.calibration;
  const supportBlock = view.playerMatchupView.blocks.find((block) => block.profileId === "support_near_z4_hsr_profile");

  assertTest(calibration !== undefined, "calibration must exist.");
  assertTest(supportBlock !== undefined, "support profile block must exist.");
  assertTest(supportBlock.candidates.length >= 1 && supportBlock.candidates.length <= 3, "support profile must show 1 to 3 visible candidates.");
  assertTest(supportBlock.candidates.some((candidate) => candidate.playerId === "rc-mobile-connector"), "support connector must appear in support profile.");
  assertTest(!supportBlock.candidates.some((candidate) => candidate.playerId === "rc-gk-specialist"), "goalkeeper must not appear in support profile.");
  const goalkeeperSupport = calibration.calibrationResults.find((result) => result.profileId === "support_near_z4_hsr_profile" && result.playerId === "rc-gk-specialist");
  const lowBlockSupport = calibration.calibrationResults.find((result) => result.profileId === "support_near_z4_hsr_profile" && result.playerId === "rc-low-block-specialist");
  const pureFinisherSupport = calibration.calibrationResults.find((result) => result.profileId === "support_near_z4_hsr_profile" && result.playerId === "rc-pure-finisher");

  assertTest(goalkeeperSupport?.eligibilityStatus === "excluded", "goalkeeper must be excluded from support profile.");
  assertTest(lowBlockSupport !== undefined && lowBlockSupport.eligibilityStatus !== "eligible", "low-block specialist must be penalized or excluded from support profile.");
  assertTest(pureFinisherSupport !== undefined && pureFinisherSupport.fitBand !== "high", "pure finisher must not be high fit for support profile.");

  return [
    "support profile shows 1 to 3 visible candidates",
    "support connector appears",
    "goalkeeper is excluded from support profile",
    "low-block specialist is penalized or excluded",
    "pure finisher is not a high-fit support candidate",
  ];
}

if (require.main === module) {
  const checks = validateRosterCoverageSupportProfile();

  console.log("rosterCoverageSupportProfile tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
