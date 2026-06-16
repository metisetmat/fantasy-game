import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  playerMatchupViewCannotDriveSelection,
  playerMatchupViewCannotMutateOfficialState,
} from "./playerMatchupView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePlayerMatchupViewGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(
    report,
    engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
  ).playerMatchupView;

  assertTest(playerMatchupViewCannotDriveSelection(model), "matchup view cannot drive selection.");
  assertTest(playerMatchupViewCannotMutateOfficialState(model), "matchup view cannot mutate official state.");
  assertTest(!model.canChangeLineup, "matchup view cannot change lineup.");
  assertTest(!model.canChangeStarters, "matchup view cannot change starters.");
  assertTest(!model.canChangeBench, "matchup view cannot change bench.");
  assertTest(!model.canDriveCoachInstruction, "matchup view cannot drive coach instruction.");
  assertTest(!model.canDriveLiveSelection, "matchup view cannot drive live selection.");
  assertTest(!model.canDriveProductionRouteResolution, "matchup view cannot drive production route resolution.");
  assertTest(!model.canMutateTimeline, "matchup view cannot mutate official timeline.");
  assertTest(!model.canMutateScore, "matchup view cannot mutate official score.");
  assertTest(!model.canMutatePossession, "matchup view cannot mutate official possession.");
  assertTest(!model.canCreateScoringEvent, "matchup view cannot create production scoring events.");
  assertTest(!model.canClaimGlobalEconomy, "matchup view cannot claim global economy.");
  assertTest(model.confidenceUpgradeCount === 0, "matchup view cannot upgrade confidence.");
  assertTest(model.playerSelectedCount === 0, "matchup view cannot select a player.");

  return [
    "matchup view cannot change lineup, starters, or bench",
    "matchup view cannot drive coach instruction, live selection, or production route resolution",
    "matchup view cannot mutate timeline, score, possession, or scoring events",
    "matchup view cannot claim global economy",
    "matchup view cannot upgrade confidence or select a player",
  ];
}

if (require.main === module) {
  const checks = validatePlayerMatchupViewGuard();

  console.log("playerMatchupViewGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
