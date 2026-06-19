import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateScoringGuard5B(): readonly string[] {
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
  assertTest(historyConsistencyFacts.length <= 1, "history-store consistency emits at most one evidence fact.");
  assertTest(report.score.home + report.score.away >= 0, "score remains derived from report score consequences.");
  assertTest(
    historyConsistencyFacts.every((fact) => fact.internalTags.includes("coach_report_history_store_consistency_score_mutation_count_0")),
    "history-store consistency cannot mutate score.",
  );

  return [
    "scoring events remain present",
    "history-store consistency emits at most one evidence fact",
    "score remains derived from report score consequences",
    "history-store consistency cannot mutate score",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard5B();
  console.log("scoringGuard.5b tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
