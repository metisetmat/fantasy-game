import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  rosterCoverageMatchupCannotDriveSelection,
  rosterCoverageMatchupCannotMutateOfficialState,
} from "./rosterCoverageMatchup";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRosterCoverageGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const coverage = buildCoachProductReportViewFromMatchReport(
    report,
    rosterCoverageFixturePlayers,
  ).rosterCoverageMatchup;

  assertTest(coverage !== undefined, "roster coverage matchup must exist.");
  assertTest(rosterCoverageMatchupCannotMutateOfficialState(coverage), "roster coverage matchup cannot mutate official state.");
  assertTest(rosterCoverageMatchupCannotDriveSelection(coverage), "roster coverage matchup cannot drive selection.");
  assertTest(!coverage.canClaimGlobalEconomy, "roster coverage matchup cannot claim global economy.");
  assertTest(coverage.confidenceUpgradeCount === 0, "roster coverage matchup cannot upgrade confidence.");
  assertTest(coverage.officiallyConfirmedCount === 0, "roster coverage matchup cannot become officially confirmed.");

  return [
    "roster coverage matchup cannot mutate official state",
    "roster coverage matchup cannot drive selection",
    "roster coverage matchup cannot claim global economy",
    "roster coverage matchup cannot upgrade confidence or official confirmation",
  ];
}

if (require.main === module) {
  const checks = validateRosterCoverageGuard();

  console.log("rosterCoverageGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
