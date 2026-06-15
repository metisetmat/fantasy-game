import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchSegmentContextSignature } from "./fullMatchSegmentContextSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const signature = fullMatchSegmentContextSignature(report);

  return `${signature.score.home}-${signature.score.away}:${signature.scoringEventCount}:${signature.scoreChangeTotal}:${signature.timelineEventCount}`;
}

export function validateRunFullMatchSegmentContextScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchSegmentContextSignature(defaultReport);
  const experimentalSignature = fullMatchSegmentContextSignature(experimentalReport);

  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "default and experimental score signatures must remain equal.");
  assertTest(defaultSignature.scoringEventCount === experimentalSignature.scoringEventCount, "scoring event counts must remain equal.");
  assertTest(defaultSignature.scoreChangeTotal === experimentalSignature.scoreChangeTotal, "score_change totals must remain equal.");
  assertTest(defaultSignature.timelineEventCount === experimentalSignature.timelineEventCount, "timeline event counts must remain equal.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_SEGMENT_CONTEXT_DID_NOT_MUTATE_SCORE"), "segment context must not mutate score.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_SEGMENT_CONTEXT_DID_NOT_MUTATE_SCORING_EVENTS"), "segment context must not mutate scoring events.");
  assertTest(experimentalReport.evidenceFacts.some((fact) =>
    fact.internalTags.includes("chain_context_score_mutation_forbidden") &&
    fact.internalTags.includes("chain_context_scoring_events_mutation_forbidden"),
  ), "chain context evidence must forbid score and scoring-event mutation.");

  return [
    "default and experimental final scores are equal",
    "default and experimental scoring event counts are equal",
    "default and experimental score_change totals are equal",
    "default and experimental timeline event counts are equal",
    "no scoring event is deleted/capped/rewritten/fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchSegmentContextScoringGuard();

  console.log("runFullMatchSegmentContextScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
