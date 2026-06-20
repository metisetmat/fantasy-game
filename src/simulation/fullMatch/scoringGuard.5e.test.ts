import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { buildCoachReportDatabaseAdapterSpike } from "../../reports/buildCoachReportDatabaseAdapterSpike";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "../../reports/coachReportMultiMatchPhaseComparisonTestUtils";
import { resolveDatabaseHistoryAdapterFeatureFlag } from "../../reports/history/databaseHistoryAdapterFeatureFlag";
import { createExperimentalDatabaseCoachMatchHistoryAdapter } from "../../reports/history/experimentalDatabaseCoachMatchHistoryAdapter";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateScoringGuard5E(): readonly string[] {
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
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const featureFlag = resolveDatabaseHistoryAdapterFeatureFlag();
  const spike = buildCoachReportDatabaseAdapterSpike({
    persistenceEvidenceSnapshot: context.persistenceEvidenceSnapshot,
    migrationPreparation: context.databaseMigrationPreparation,
    sourceRecords: [context.currentRecord],
    experimentalAdapter: createExperimentalDatabaseCoachMatchHistoryAdapter({ featureFlag }),
    featureFlag,
    productReportHtml: context.productHtml,
    exportReportHtml: context.exportHtml,
  });

  assertTest(scoringEvents.length > 0, "scoring events remain present.");
  assertTest(report.score.home + report.score.away === scoreFromConsequences, "official score derives only from score_change consequences.");
  assertTest(spike.realDatabaseReadCount === 0 && spike.realDatabaseWriteCount === 0, "database adapter spike does not perform real database IO.");
  assertTest(spike.scoreMutationCount === 0 && spike.productionScoringEventCreationCount === 0, "database adapter spike does not mutate score or scoring events.");
  assertTest(spike.scoringConstantsUnchanged, "scoring constants unchanged.");
  assertTest(spike.matchBonusEventUnchanged, "MatchBonusEvent unchanged.");
  assertTest(spike.fullMatchBatchEconomyRemainsOnlyGlobalProof, "batch/live separation preserved.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
    "database adapter spike does not change scoring logic",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard5E();
  console.log("scoringGuard.5e tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
