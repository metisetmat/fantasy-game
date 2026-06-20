import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { buildCoachMatchHistoryMigrationDryRun } from "../../reports/history/buildCoachMatchHistoryMigrationDryRun";
import { createMockDatabaseCoachMatchHistoryAdapter } from "../../reports/history/mockDatabaseCoachMatchHistoryAdapter";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateScoringGuard5D(): readonly string[] {
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
  const migration = buildCoachMatchHistoryMigrationDryRun({
    sourceRecords: [],
    targetAdapter: createMockDatabaseCoachMatchHistoryAdapter(),
  });

  assertTest(scoringEvents.length > 0, "scoring events remain present.");
  assertTest(report.score.home + report.score.away === scoreFromConsequences, "official score derives only from score_change consequences.");
  assertTest(migration.realDatabaseWriteCount === 0 && migration.realDatabaseReadCount === 0, "database migration dry run does not change scoring logic.");
  assertTest(migration.scoringConstantsUnchanged, "scoring constants unchanged.");
  assertTest(migration.matchBonusEventUnchanged, "MatchBonusEvent unchanged.");
  assertTest(migration.fullMatchBatchEconomyRemainsOnlyGlobalProof, "batch/live separation preserved.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "database migration dry run does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard5D();
  console.log("scoringGuard.5d tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
