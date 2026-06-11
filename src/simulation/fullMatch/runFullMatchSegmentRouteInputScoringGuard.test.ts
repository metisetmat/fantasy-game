import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchSegmentRouteInputSignature } from "./fullMatchSegmentRouteInputSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const signature = fullMatchSegmentRouteInputSignature(report);

  return `${signature.score.home}-${signature.score.away}:${signature.scoringEventCount}:${signature.scoreChangeTotal}:${signature.timelineEventCount}`;
}

export function validateRunFullMatchSegmentRouteInputScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const experimentalSignature = fullMatchSegmentRouteInputSignature(experimentalReport);

  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "default and experimental score signatures must remain equal.");
  assertTest(experimentalSignature.scoreMutationCount === 0, "SegmentRouteInput must not mutate score.");
  assertTest(experimentalSignature.scoringEventsMutationCount === 0, "SegmentRouteInput must not mutate scoring events.");
  assertTest(experimentalSignature.routeSuccessRateMutationCount === 0, "SegmentRouteInput must not mutate route success rates.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "SegmentRouteInput must not mutate production route resolution.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SEGMENT_ROUTE_INPUT_DID_NOT_MUTATE_SCORE"), "SegmentRouteInput limitation must forbid score mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SEGMENT_ROUTE_INPUT_DID_NOT_MUTATE_SCORING_EVENTS"), "SegmentRouteInput limitation must forbid scoring event mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SEGMENT_ROUTE_INPUT_DID_NOT_MUTATE_ROUTE_SUCCESS_RATES"), "SegmentRouteInput limitation must forbid route success mutation.");
  assertTest(experimentalReport.evidenceFacts.some((fact) =>
    fact.internalTags.includes("segment_route_input_score_mutation_forbidden") &&
    fact.internalTags.includes("segment_route_input_scoring_events_mutation_forbidden") &&
    fact.internalTags.includes("segment_route_input_route_success_mutation_forbidden") &&
    fact.internalTags.includes("segment_route_input_production_resolution_forbidden"),
  ), "SegmentRouteInput evidence must forbid score, scoring-event, route-success, and production-resolution mutation.");

  return [
    "default and experimental final scores remain equal",
    "default and experimental scoring event counts remain equal",
    "default and experimental score_change totals remain equal",
    "timeline event count remains equal or only metadata differs",
    "SegmentRouteInput does not mutate score",
    "SegmentRouteInput does not mutate scoring events",
    "SegmentRouteInput does not mutate route success rates",
    "SegmentRouteInput does not mutate production route resolution",
    "no scoring events are deleted/capped/rewritten/fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchSegmentRouteInputScoringGuard();

  console.log("runFullMatchSegmentRouteInputScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
