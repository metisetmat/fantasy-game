import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildPlayerCandidateComparisonView } from "./buildPlayerCandidateComparisonView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePlayerCandidateComparisonView(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const comparison = buildCoachProductReportViewFromMatchReport(
    report,
    rosterCoverageFixturePlayers,
  ).playerCandidateComparisonView;

  assertTest(comparison !== undefined, "comparison view model must exist.");
  assertTest(comparison.status === "available", "comparison view status must be available.");
  assertTest(comparison.profileBlockCount === 3, "comparison view profile block count must be 3.");
  assertTest(comparison.maxCompactCandidatesPerProfile === 3, "max compact candidates per profile must be 3.");
  assertTest(comparison.totalCandidateCount > 0, "total candidate count must be present.");
  assertTest(comparison.compactVisibleCandidateCount > 0, "compact visible candidate count must be present.");
  assertTest(comparison.detailOnlyCandidateCount >= 0, "detail-only candidate count must be present.");
  assertTest(comparison.primaryCandidateCount > 0, "primary candidate count must be present.");
  assertTest(comparison.alternativeCandidateCount > 0, "alternative candidate count must be present.");
  assertTest(comparison.complementaryCandidateCount >= 0, "complementary candidate count must be present.");
  assertTest(comparison.noAutomaticSelection, "comparison view must keep no automatic selection true.");
  assertTest(comparison.playerSelectedCount === 0, "comparison view must not select a player.");
  const failedComparison = buildPlayerCandidateComparisonView({
    rosterCoverage: {
      ...buildCoachProductReportViewFromMatchReport(
        report,
        rosterCoverageFixturePlayers,
      ).rosterCoverageMatchup!,
      status: "failed",
      warnings: ["synthetic failed coverage for test"],
    },
  });
  assertTest(failedComparison.status === "failed", "failed roster coverage status must be preserved.");
  assertTest(failedComparison.profileBlockCount === 0, "failed comparison view must not emit profile blocks.");
  assertTest(failedComparison.totalCandidateCount === 0, "failed comparison view must not emit candidate counts as available.");

  return [
    "comparison view model exists",
    "status is available",
    "profile block count is 3",
    "compact limit per profile is 3",
    "candidate counts are present",
    "no automatic selection remains true",
    "no player is selected",
    "failed roster coverage stays failed downstream",
  ];
}

if (require.main === module) {
  const checks = validatePlayerCandidateComparisonView();

  console.log("playerCandidateComparisonView tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
