import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "../../reports/coachReportMultiMatchPhaseComparisonTestUtils";
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateScoringGuard5G(): readonly string[] {
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
  const { controlledLocalReadOnlyDbMode: model } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(scoringEvents.length > 0, "scoring events remain present.");
  assertTest(report.score.home + report.score.away === scoreFromConsequences, "official score must derive only from score_change consequences.");
  assertTest(model.scoringConstantsUnchanged, "scoring constants must remain unchanged.");
  assertTest(model.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(model.fullMatchBatchEconomyRemainsOnlyGlobalProof, "batch/live separation must be preserved.");
  assertTest(!model.canMutateScore, "controlled read-only mode cannot mutate score.");
  assertTest(!model.canMutateTimeline, "controlled read-only mode cannot mutate timeline.");
  assertTest(!model.canMutatePossession, "controlled read-only mode cannot mutate possession.");
  assertTest(!model.canCreateProductionScoringEvents, "controlled read-only mode cannot create production scoring events.");
  assertTest(model.realDatabaseReadCount === 0, "default real DB read count must stay 0.");
  assertTest(model.realDatabaseWriteCount === 0, "real DB write count must stay 0.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "controlled local read-only DB mode does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard5G();
  console.log("scoringGuard.5g tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
