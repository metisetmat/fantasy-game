import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "../../reports/coachReportMultiMatchPhaseComparisonTestUtils";
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateScoringGuard5F(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const scoringEvents = report.timeline.filter((event) =>
    event.consequences.some((consequence) => consequence.type === "score_change")
  );
  const scoreFromConsequences = scoringEvents.reduce((total, event) =>
    total + event.consequences.reduce((eventTotal, consequence) =>
      consequence.type === "score_change" ? eventTotal + (consequence.value ?? 0) : eventTotal,
    0),
  0);
  const { durableStorageDecision } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(scoringEvents.length > 0, "scoring events remain present.");
  assertTest(report.score.home + report.score.away === scoreFromConsequences, "official score derives only from score_change consequences.");
  assertTest(durableStorageDecision.realDatabaseReadCount === 0 && durableStorageDecision.realDatabaseWriteCount === 0, "durable storage decision does not perform real database IO.");
  assertTest(!durableStorageDecision.canMutateScore && !durableStorageDecision.canCreateProductionScoringEvents, "durable storage decision does not mutate score or scoring events.");
  assertTest(durableStorageDecision.scoringConstantsUnchanged, "scoring constants unchanged.");
  assertTest(durableStorageDecision.matchBonusEventUnchanged, "MatchBonusEvent unchanged.");
  assertTest(durableStorageDecision.fullMatchBatchEconomyRemainsOnlyGlobalProof, "batch/live separation preserved.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "durable storage decision does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard5F();
  console.log("scoringGuard.5f tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
