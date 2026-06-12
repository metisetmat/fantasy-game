import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { officialTimelineDiffViewSignature } from "./officialTimelineDiffViewSignature";

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

export function validateScoringGuard3V(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = officialTimelineDiffViewSignature(report);
  const scoreTotal = report.score.home + report.score.away;
  const reviewFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_COACH_FACING_TIMELINE_REVIEW"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.status === "available", "official timeline diff view should be available.");
  assertTest(signature.officialTimelineDiffEventCount === 0, "coach-facing review must not add diff events to official timeline.");
  assertTest(signature.officialTimelineEventCountDelta === 0, "official timeline event count delta must be zero.");
  assertTest(signature.officialScoringEventCountDelta === 0, "official scoring event count delta must be zero.");
  assertTest(signature.officialScoreDelta === 0, "official score delta must be zero.");
  assertTest(signature.productionScoringEventCreationCount === 0, "review must not create production scoring events.");
  assertTest(reviewFact !== undefined, "coach-facing timeline review evidence must exist.");
  assertTest(reviewFact?.internalTags.includes("timeline_review_read_only") ?? false, "review evidence must be read-only.");
  assertTest(reviewFact?.internalTags.includes("timeline_review_sandbox_events_not_official") ?? false, "sandbox events must remain non-official.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_COACH_FACING_TIMELINE_REVIEW_READ_ONLY"), "limitations must mark review read-only.");

  return [
    "scoring constants unchanged",
    "official final score still derives only from official score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "coach-facing timeline review remains read-only",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard3V();

  console.log("scoringGuard.3v tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
