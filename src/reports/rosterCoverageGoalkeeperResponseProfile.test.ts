import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRosterCoverageGoalkeeperResponseProfile(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const view = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const calibration = view.playerMatchupView.calibration;
  const block = view.playerMatchupView.blocks.find((candidateBlock) => candidateBlock.profileId === "strong_goalkeeper_response_profile");

  assertTest(calibration !== undefined, "calibration must exist.");
  assertTest(block !== undefined, "strong-goalkeeper-response block must exist.");
  assertTest(block.candidates.length >= 1 && block.candidates.length <= 3, "goalkeeper-response profile must show 1 to 3 visible candidates.");
  assertTest(block.candidates.some((candidate) => candidate.playerId === "rc-rest-defense-anchor"), "rest-defense anchor must appear.");
  const goalkeeperResult = calibration.calibrationResults.find((result) => result.profileId === "strong_goalkeeper_response_profile" && result.playerId === "rc-gk-specialist");

  assertTest(goalkeeperResult !== undefined, "goalkeeper response calibration result must exist.");
  assertTest(goalkeeperResult.eligibilityStatus === "penalized" || goalkeeperResult.eligibilityStatus === "eligible", "goalkeeper may appear only in goalkeeper-response profile.");
  const goalkeeperCard = block.candidates.find((candidate) => candidate.playerId === "rc-gk-specialist");

  if (goalkeeperCard !== undefined) {
    assertTest(
      (goalkeeperCard.calibrationWhyVisible ?? goalkeeperCard.whyStudy).join(" ").toLocaleLowerCase("fr-FR").includes("defens"),
      "goalkeeper visible copy must frame the player as defensive stabilization.",
    );
  }

  return [
    "goalkeeper-response profile shows 1 to 3 visible candidates",
    "rest-defense anchor appears",
    "goalkeeper is only framed through defensive stabilization wording when visible",
  ];
}

if (require.main === module) {
  const checks = validateRosterCoverageGoalkeeperResponseProfile();

  console.log("rosterCoverageGoalkeeperResponseProfile tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
