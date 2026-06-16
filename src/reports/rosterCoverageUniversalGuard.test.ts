import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRosterCoverageUniversalGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const coverage = buildCoachProductReportViewFromMatchReport(
    report,
    rosterCoverageFixturePlayers,
  ).rosterCoverageMatchup;

  assertTest(coverage !== undefined, "roster coverage matchup must exist.");
  assertTest(coverage.maxVisibleProfilesPerPlayer === 2, "max visible profiles per player must remain 2.");
  assertTest(coverage.playerStrongFitAllProfilesCount === 0, "no player may appear as strong fit across all profiles.");
  assertTest(coverage.goalkeeperStrongFitAllProfilesCount === 0, "no goalkeeper may appear as strong fit across all profiles.");

  return [
    "max visible profiles per player remains 2",
    "no player appears as strong fit across all profiles",
    "no goalkeeper appears as strong fit across all profiles",
  ];
}

if (require.main === module) {
  const checks = validateRosterCoverageUniversalGuard();

  console.log("rosterCoverageUniversalGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
