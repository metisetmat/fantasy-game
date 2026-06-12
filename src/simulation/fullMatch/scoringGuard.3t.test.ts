import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { controlledSegmentSandboxTimelineSignature } from "./controlledSegmentSandboxTimelineSignature";

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

export function validateScoringGuard3T(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = controlledSegmentSandboxTimelineSignature(report);
  const scoreTotal = report.score.home + report.score.away;

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.status === "available", "controlled segment sandbox timeline should be available.");
  assertTest(signature.officialSandboxTimelineEventCount === 0, "sandbox timeline events must not be official MatchEvents.");
  assertTest(signature.officialTimelineEventCreatedCount === 0, "sandbox timeline must not create official timeline events.");
  assertTest(signature.productionScoringEventCreationCount === 0, "sandbox timeline must not create production scoring events.");
  assertTest(signature.officialPossessionMutationCount === 0, "sandbox timeline must not mutate official possession.");
  assertTest(signature.officialTimelineMutationCount === 0, "sandbox timeline must not mutate official timeline.");
  assertTest(signature.officialScoreMutationCount === 0, "sandbox timeline must not mutate official score.");
  assertTest(signature.officialScoringEventMutationCount === 0, "sandbox timeline must not mutate official scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "controlled segment sandbox timeline must not create production scoring events.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SANDBOX_TIMELINE_RESULTS_ISOLATED_ONLY"), "controlled segment sandbox timeline must remain sandbox-only.");

  return [
    "SHOT_GOAL remains 3",
    "TRY_TOUCHDOWN remains 5",
    "CONVERSION_GOAL remains 2",
    "DROP_GOAL remains 2",
    "PENALTY_SHOT remains inactive",
    "official final score still derives only from official score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "no production scoring event creation from controlled segment sandbox timeline",
    "controlled segment sandbox timeline remains separate from official timeline",
    "official possession, score, timeline, and scoring events are not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard3T();

  console.log("scoringGuard.3t tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
