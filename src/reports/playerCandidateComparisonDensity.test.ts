import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { renderCoachProductReport } from "./renderCoachProductReport";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validatePlayerCandidateComparisonDensity(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(
    report,
    rosterCoverageFixturePlayers,
  );
  const comparison = model.playerCandidateComparisonView;
  const html = renderCoachProductReport(model);

  assertTest(comparison !== undefined, "comparison view must exist.");
  assertTest(comparison.profileBlocks.every((block) => block.compactCandidateCount <= 3), "no profile block may show more than 3 compact cards.");
  assertTest(comparison.detailOnlyCandidateCount > 0, "extra candidates must be moved to collapsed details.");
  assertTest(comparison.profileBlocks.every((block) => block.profileSummary.length > 0), "profile summaries must be present.");
  assertTest(comparison.profileBlocks.every((block) => block.comparisonSummary.length > 0), "comparison bullets must be present.");
  assertTest(comparison.profileBlocks.every((block) => block.cards.every((card) => card.detailsCollapsedByDefault)), "details must be collapsed by default.");
  assertTest(html.includes("<details class=\"comparison-details\">"), "renderer must expose collapsed detail blocks.");

  return [
    "compact cards are capped at 3 per profile",
    "extra candidates move into collapsed details",
    "profile summaries and comparison bullets are present",
    "details stay collapsed by default",
  ];
}

if (require.main === module) {
  const checks = validatePlayerCandidateComparisonDensity();

  console.log("playerCandidateComparisonDensity tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
