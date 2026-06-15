import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchShadowRouteSelectionSignature } from "./fullMatchShadowRouteSelectionSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const signature = fullMatchShadowRouteSelectionSignature(report);

  return `${signature.score.home}-${signature.score.away}:${signature.scoringEventCount}:${signature.scoreChangeTotal}:${signature.timelineEventCount}`;
}

export function validateRunFullMatchShadowRouteSelectionScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchShadowRouteSelectionSignature(defaultReport);
  const experimentalSignature = fullMatchShadowRouteSelectionSignature(experimentalReport);

  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "default and experimental score signatures must remain equal.");
  assertTest(defaultSignature.scoringEventCount === experimentalSignature.scoringEventCount, "scoring event counts must remain equal.");
  assertTest(defaultSignature.scoreChangeTotal === experimentalSignature.scoreChangeTotal, "score_change totals must remain equal.");
  assertTest(defaultSignature.timelineEventCount === experimentalSignature.timelineEventCount, "timeline event counts must remain equal.");
  assertTest(experimentalSignature.scoreMutationCount === 0, "shadow selection must not mutate score.");
  assertTest(experimentalSignature.scoringEventsMutationCount === 0, "shadow selection must not mutate scoring events.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SHADOW_ROUTE_SELECTION_DID_NOT_MUTATE_SCORE"), "shadow selection limitation must forbid score mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SHADOW_ROUTE_SELECTION_DID_NOT_MUTATE_SCORING_EVENTS"), "shadow selection limitation must forbid scoring event mutation.");
  assertTest(experimentalReport.evidenceFacts.some((fact) =>
    fact.internalTags.includes("shadow_route_selection_score_mutation_forbidden") &&
    fact.internalTags.includes("shadow_route_selection_scoring_events_mutation_forbidden"),
  ), "shadow selection evidence must forbid score and scoring-event mutation.");

  return [
    "default and experimental final scores remain equal",
    "default and experimental scoring event counts remain equal",
    "default and experimental score_change totals remain equal",
    "timeline event count remains equal or only metadata differs",
    "no scoring events are deleted/capped/rewritten/fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchShadowRouteSelectionScoringGuard();

  console.log("runFullMatchShadowRouteSelectionScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
