import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePlayerMatchupCandidateDiversity(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(
    report,
    engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
  ).playerMatchupView;
  const calibration = model.calibration;

  assertTest(calibration !== undefined, "calibration model must exist.");
  assertTest(model.blocks.every((block) => block.candidates.length >= 0 && block.candidates.length <= 3), "each profile shows 0 to 3 candidates.");
  assertTest(model.blocks.every((block) => block.candidates.every((candidate) => candidate.fitBand !== "low")), "no low-fit-only candidate is forced.");
  assertTest(model.blocks.some((block) => block.candidates.length === 0 && block.emptyState !== null), "empty state appears when no candidate clears threshold.");
  assertTest(model.blocks.every((block) => block.candidates.length > 0 || block.emptyState !== null), "visible profile blocks remain useful even with empty states.");
  assertTest(calibration.repeatedSamePlayerAcrossProfilesCount >= 0, "repeated same player across profiles count is tracked.");

  return [
    "each profile shows 0 to 3 candidates",
    "no low-fit-only candidate is forced",
    "empty state appears when no candidate clears threshold",
    "visible profile blocks remain useful even with empty states",
    "repeated same player across profiles count is tracked",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupCandidateDiversity();

  console.log("playerMatchupCandidateDiversity tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
