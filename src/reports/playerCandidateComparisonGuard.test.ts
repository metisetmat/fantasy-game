import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  playerCandidateComparisonViewCannotDriveSelection,
  playerCandidateComparisonViewCannotMutateOfficialState,
} from "./playerCandidateComparisonView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePlayerCandidateComparisonGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const comparison = buildCoachProductReportViewFromMatchReport(
    report,
    rosterCoverageFixturePlayers,
  ).playerCandidateComparisonView;

  assertTest(comparison !== undefined, "comparison view must exist.");
  assertTest(playerCandidateComparisonViewCannotDriveSelection(comparison), "comparison view cannot drive selection.");
  assertTest(playerCandidateComparisonViewCannotMutateOfficialState(comparison), "comparison view cannot mutate official state.");
  assertTest(!comparison.canChangeLineup, "comparison view cannot change lineup.");
  assertTest(!comparison.canChangeStarters, "comparison view cannot change starters.");
  assertTest(!comparison.canChangeBench, "comparison view cannot change bench.");
  assertTest(!comparison.canDriveCoachInstruction, "comparison view cannot drive coach instruction.");
  assertTest(!comparison.canDriveLiveSelection, "comparison view cannot drive live selection.");
  assertTest(!comparison.canDriveProductionRouteResolution, "comparison view cannot drive production route resolution.");
  assertTest(!comparison.canMutateTimeline, "comparison view cannot mutate official timeline.");
  assertTest(!comparison.canMutateScore, "comparison view cannot mutate official score.");
  assertTest(!comparison.canMutatePossession, "comparison view cannot mutate official possession.");
  assertTest(!comparison.canCreateScoringEvent, "comparison view cannot create production scoring events.");
  assertTest(!comparison.canClaimGlobalEconomy, "comparison view cannot claim global economy.");
  assertTest(comparison.confidenceUpgradeCount === 0, "comparison view cannot upgrade confidence.");
  assertTest(comparison.playerSelectedCount === 0, "comparison view cannot select a player.");

  return [
    "comparison view cannot change lineup, starters, or bench",
    "comparison view cannot drive coach instruction, live selection, or production route resolution",
    "comparison view cannot mutate timeline, score, possession, or scoring events",
    "comparison view cannot claim global economy",
    "comparison view cannot upgrade confidence or select a player",
  ];
}

if (require.main === module) {
  const checks = validatePlayerCandidateComparisonGuard();

  console.log("playerCandidateComparisonGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
