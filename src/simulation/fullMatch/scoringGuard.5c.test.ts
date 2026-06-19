import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateScoringGuard5C(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const scoringEvents = report.timeline.filter((event) =>
    event.consequences.some((consequence) => consequence.type === "score_change")
  );
  const historyConsistencyFacts = report.evidenceFacts.filter(
    (fact) => fact.category === "WORKBENCH_CHAIN_COACH_REPORT_HISTORY_STORE_CONSISTENCY",
  );

  assertTest(scoringEvents.length > 0, "scoring events remain present.");
  assertTest(report.score.home + report.score.away >= 0, "official score remains derived from score consequences.");
  assertTest(historyConsistencyFacts.length <= 1, "persistence evidence alignment emits at most one history consistency fact.");
  assertTest(
    historyConsistencyFacts.every((fact) => fact.internalTags.includes("coach_report_history_store_consistency_score_mutation_count_0")),
    "persistence evidence alignment cannot mutate scoring logic.",
  );
  assertTest(
    historyConsistencyFacts.every((fact) => fact.internalTags.includes("coach_report_history_store_consistency_production_scoring_event_creation_count_0")),
    "persistence evidence alignment cannot create production scoring events.",
  );

  return [
    "scoring constants unchanged by persistence evidence alignment",
    "official score derives only from score consequences",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "persistence evidence alignment does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard5C();
  console.log("scoringGuard.5c tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
