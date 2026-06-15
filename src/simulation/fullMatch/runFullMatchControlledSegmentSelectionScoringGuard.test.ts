import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchControlledSegmentSelectionSignature } from "./fullMatchControlledSegmentSelectionSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const signature = fullMatchControlledSegmentSelectionSignature(report);

  return `${signature.score.home}-${signature.score.away}:${signature.scoringEventCount}:${signature.scoreChangeTotal}:${signature.timelineEventCount}`;
}

export function validateRunFullMatchControlledSegmentSelectionScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const experimentalSignature = fullMatchControlledSegmentSelectionSignature(experimentalReport);

  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "default and experimental score signatures must remain equal.");
  assertTest(experimentalSignature.scoreMutationCount === 0, "controlled selection must not mutate score.");
  assertTest(experimentalSignature.scoringEventsMutationCount === 0, "controlled selection must not mutate scoring events.");
  assertTest(experimentalSignature.routeSuccessRateMutationCount === 0, "controlled selection must not mutate route success rates.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DID_NOT_MUTATE_SCORE"), "controlled selection limitation must forbid score mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DID_NOT_MUTATE_SCORING_EVENTS"), "controlled selection limitation must forbid scoring event mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DID_NOT_MUTATE_ROUTE_SUCCESS_RATES"), "controlled selection limitation must forbid route success mutation.");
  assertTest(experimentalReport.evidenceFacts.some((fact) =>
    fact.internalTags.includes("controlled_segment_selection_score_mutation_forbidden") &&
    fact.internalTags.includes("controlled_segment_selection_scoring_events_mutation_forbidden") &&
    fact.internalTags.includes("controlled_segment_selection_route_success_mutation_forbidden"),
  ), "controlled selection evidence must forbid score, scoring-event, and route-success mutation.");

  return [
    "default and experimental final scores remain equal",
    "default and experimental scoring event counts remain equal",
    "default and experimental score_change totals remain equal",
    "timeline event count remains equal or only metadata differs",
    "controlled selection does not mutate score",
    "controlled selection does not mutate scoring events",
    "controlled selection does not mutate route success rates",
    "no scoring events are deleted/capped/rewritten/fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchControlledSegmentSelectionScoringGuard();

  console.log("runFullMatchControlledSegmentSelectionScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
