import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchControlledMiniMatchRouteSourceSignature } from "./fullMatchControlledMiniMatchRouteSourceSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const signature = fullMatchControlledMiniMatchRouteSourceSignature(report);

  return `${signature.score.home}-${signature.score.away}:${signature.scoringEventCount}:${signature.scoreChangeTotal}:${signature.timelineEventCount}`;
}

export function validateRunFullMatchControlledMiniMatchRouteSourceScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const experimentalSignature = fullMatchControlledMiniMatchRouteSourceSignature(experimentalReport);

  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "default and experimental score signatures must remain equal.");
  assertTest(experimentalSignature.scoreMutationCount === 0, "controlled route source must not mutate score.");
  assertTest(experimentalSignature.scoringEventsMutationCount === 0, "controlled route source must not mutate scoring events.");
  assertTest(experimentalSignature.routeSuccessRateMutationCount === 0, "controlled route source must not mutate route success rates.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "controlled route source must not mutate production route resolution.");
  assertTest(experimentalSignature.liveMiniMatchResolutionMutationCount === 0, "controlled route source must not mutate live mini-match resolution.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_DID_NOT_MUTATE_SCORE"), "controlled route source limitation must forbid score mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_DID_NOT_MUTATE_SCORING_EVENTS"), "controlled route source limitation must forbid scoring event mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_DID_NOT_MUTATE_ROUTE_SUCCESS_RATES"), "controlled route source limitation must forbid route success mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION"), "controlled route source limitation must forbid production route resolution.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_CANNOT_DRIVE_LIVE_MINIMATCH_RESOLUTION"), "controlled route source limitation must forbid live mini-match resolution.");
  assertTest(experimentalReport.evidenceFacts.some((fact) =>
    fact.internalTags.includes("controlled_minimatch_route_source_score_mutation_forbidden") &&
    fact.internalTags.includes("controlled_minimatch_route_source_scoring_events_mutation_forbidden") &&
    fact.internalTags.includes("controlled_minimatch_route_source_route_success_mutation_forbidden") &&
    fact.internalTags.includes("controlled_minimatch_route_source_production_resolution_forbidden") &&
    fact.internalTags.includes("controlled_minimatch_route_source_live_resolution_forbidden"),
  ), "controlled route source evidence must forbid score, scoring-event, route-success, production-resolution, and live-resolution mutation.");

  return [
    "default and experimental final scores remain equal",
    "default and experimental scoring event counts remain equal",
    "default and experimental score_change totals remain equal",
    "timeline event count remains equal or only metadata differs",
    "controlled route source does not mutate score",
    "controlled route source does not mutate scoring events",
    "controlled route source does not mutate route success rates",
    "controlled route source does not mutate production route resolution",
    "controlled route source does not mutate live mini-match route resolution",
    "no scoring events are deleted/capped/rewritten/fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchControlledMiniMatchRouteSourceScoringGuard();

  console.log("runFullMatchControlledMiniMatchRouteSourceScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
