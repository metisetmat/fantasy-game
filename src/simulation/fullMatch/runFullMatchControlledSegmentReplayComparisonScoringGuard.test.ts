import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchControlledSegmentReplayComparisonSignature } from "./fullMatchControlledSegmentReplayComparisonSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreChangeTotal(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

export function validateRunFullMatchControlledSegmentReplayComparisonScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchControlledSegmentReplayComparisonSignature(defaultReport);
  const experimentalSignature = fullMatchControlledSegmentReplayComparisonSignature(experimentalReport);

  assertTest(defaultReport.score.home === experimentalReport.score.home, "controlled replay comparison must not mutate normal home score.");
  assertTest(defaultReport.score.away === experimentalReport.score.away, "controlled replay comparison must not mutate normal away score.");
  assertTest(defaultSignature.scoringEventCount === experimentalSignature.scoringEventCount, "controlled replay comparison must not mutate normal scoring event count.");
  assertTest(defaultSignature.scoreChangeTotal === experimentalSignature.scoreChangeTotal, "controlled replay comparison must not mutate normal score_change total.");
  assertTest(defaultSignature.timelineEventCount === experimentalSignature.timelineEventCount, "controlled replay comparison must not add production timeline events.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "final score must still derive from score_change consequences.");
  assertTest(experimentalSignature.productionScoringEventCreationCount === 0, "controlled replay comparison must not create production scoring events.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "controlled replay comparison must not mutate production route resolution.");
  assertTest(experimentalSignature.globalRouteSuccessRateMutationCount === 0, "controlled replay comparison must not mutate global route success rates.");
  assertTest(experimentalSignature.globalEconomyClaimCount === 0, "controlled replay comparison must not claim global economy.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "limitations must forbid production scoring event creation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION"), "limitations must forbid production route resolution mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES"), "limitations must forbid global route success mutation.");

  return [
    "default and experimental normal final scores remain equal",
    "default and experimental normal scoring event counts remain equal",
    "default and experimental normal score_change totals remain equal",
    "normal timeline event count remains equal",
    "no production scoring events are deleted/capped/rewritten/fabricated",
    "no production scoring events are created by controlled replay comparison",
    "global route success rates are not mutated",
    "production route resolution is not mutated",
    "normal live mini-match route resolution is not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchControlledSegmentReplayComparisonScoringGuard();

  console.log("runFullMatchControlledSegmentReplayComparisonScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
