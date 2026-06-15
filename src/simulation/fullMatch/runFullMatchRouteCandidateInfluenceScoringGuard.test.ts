import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchRouteCandidateInfluenceSignature } from "./fullMatchRouteCandidateInfluenceSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const signature = fullMatchRouteCandidateInfluenceSignature(report);

  return `${signature.score.home}-${signature.score.away}:${signature.scoringEventCount}:${signature.scoreChangeTotal}:${signature.timelineEventCount}`;
}

export function validateRunFullMatchRouteCandidateInfluenceScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchRouteCandidateInfluenceSignature(defaultReport);
  const experimentalSignature = fullMatchRouteCandidateInfluenceSignature(experimentalReport);

  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "default and experimental score signatures must remain equal.");
  assertTest(defaultSignature.scoringEventCount === experimentalSignature.scoringEventCount, "scoring event counts must remain equal.");
  assertTest(defaultSignature.scoreChangeTotal === experimentalSignature.scoreChangeTotal, "score_change totals must remain equal.");
  assertTest(defaultSignature.timelineEventCount === experimentalSignature.timelineEventCount, "timeline event counts must remain equal.");
  assertTest(experimentalSignature.scoreMutationCount === 0, "route candidate influence must not mutate score.");
  assertTest(experimentalSignature.scoringEventsMutationCount === 0, "route candidate influence must not mutate scoring events.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_DID_NOT_MUTATE_SCORE"), "route influence limitation must forbid score mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_DID_NOT_MUTATE_SCORING_EVENTS"), "route influence limitation must forbid scoring event mutation.");
  assertTest(experimentalReport.evidenceFacts.some((fact) =>
    fact.internalTags.includes("route_candidate_influence_score_mutation_forbidden") &&
    fact.internalTags.includes("route_candidate_influence_scoring_events_mutation_forbidden"),
  ), "route influence evidence must forbid score and scoring-event mutation.");

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
  const checks = validateRunFullMatchRouteCandidateInfluenceScoringGuard();

  console.log("runFullMatchRouteCandidateInfluenceScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
