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

export function validateRosterCoverageMatchup(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const coverage = buildCoachProductReportViewFromMatchReport(
    report,
    rosterCoverageFixturePlayers,
  ).rosterCoverageMatchup;

  assertTest(coverage !== undefined, "roster coverage matchup must exist.");
  assertTest(coverage.status === "available", "roster coverage matchup must be available.");
  assertTest(coverage.rosterSize >= 10, "roster size must be at least 10.");
  assertTest(coverage.profileCount === 3, "profile count must be 3.");
  assertTest(coverage.evaluatedPairCount >= 30, "evaluated pair count must be at least 30.");
  assertTest(coverage.visibleCandidateCount >= 0, "visible candidate count must be tracked.");
  assertTest(coverage.credibleCandidateCount >= 0, "credible candidate count must be tracked.");
  assertTest(rosterCoverageMatchupCannotMutateOfficialState(coverage), "roster coverage matchup cannot mutate official state.");
  assertTest(rosterCoverageMatchupCannotDriveSelection(coverage), "roster coverage matchup cannot drive selection.");
  assertTest(coverage.playerSelectedCount === 0, "no player may be selected.");
  assertTest(coverage.automaticSelectionCount === 0, "automatic selection count must stay 0.");

  return [
    "roster coverage matchup exists",
    "roster size, profile count, and evaluated pair count are present",
    "visible and credible counts are tracked",
    "roster coverage matchup cannot drive selection or mutate official state",
  ];
}

if (require.main === module) {
  const checks = validateRosterCoverageMatchup();

  console.log("rosterCoverageMatchup tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
