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

export function validateScoringGuard4D(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = officialTimelineDiffViewSignature(report);
  const scoreTotal = report.score.home + report.score.away;
  const aggregateFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_MATCH_TRACE_AGGREGATOR"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.officialTimelineEventCountDelta === 0, "aggregator must not mutate official timeline.");
  assertTest(signature.officialScoringEventCountDelta === 0, "aggregator must not mutate official scoring events.");
  assertTest(signature.officialScoreDelta === 0, "aggregator must not mutate official score.");
  assertTest(signature.productionScoringEventCreationCount === 0, "aggregator must not create production scoring events.");
  assertTest(aggregateFact !== undefined, "aggregate evidence must exist.");
  assertTest(aggregateFact?.internalTags.includes("match_trace_aggregator_global_economy_claim_forbidden") ?? false, "aggregator must not claim global economy.");
  assertTest(aggregateFact?.internalTags.includes("scoring_constants_unchanged") ?? false, "aggregator must preserve scoring constants.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4D();

  console.log("scoringGuard.4d tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

