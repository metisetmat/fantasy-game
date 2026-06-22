import assert from "node:assert/strict";
import { test } from "node:test";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildScoringFamilyAttributionAuditModel } from "./scoringFamilyAttributionAudit";
import { buildFullMatchCalibrationCarryoverReconciliationModel } from "./fullMatchCalibrationCarryoverReconciliation";

test("builds a diagnostic-only calibration carryover reconciliation model", () => {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
    enableCoachReportMultiMatchPhaseComparison: true,
  });
  const audit = buildScoringFamilyAttributionAuditModel(report);
  const reconciliation = buildFullMatchCalibrationCarryoverReconciliationModel(report, audit);

  assert.equal(reconciliation.status, "available");
  assert.equal(reconciliation.scope, "FULL_MATCH_CALIBRATION_CARRYOVER_SINGLE_RUN");
  assert.equal(reconciliation.version, "CALIBRATION_CARRYOVER_6C");
  assert.equal(reconciliation.officialFullMatchScoringEvents, audit.totalScoringEventCount);
  assert.equal(reconciliation.officialFullMatchShotGoalEvents, audit.scoringEventsByFamily.SHOT_GOAL);
  assert.equal(reconciliation.shotDifficultyCalibrationAppliedInBatch, true);
  assert.equal(reconciliation.shotDifficultyCalibrationAppliedInFullMatch, false);
  assert.equal(reconciliation.scoringChoiceBalanceAppliedInBatch, true);
  assert.equal(reconciliation.scoringChoiceBalanceAppliedInFullMatch, false);
  assert.equal(reconciliation.primaryRegressionCause, "FULLMATCH_PARALLEL_SCORING_PATH");
  assert.ok(reconciliation.warnings.includes("FULLMATCH_NOT_USING_SHOT_DIFFICULTY_CALIBRATION"));
  assert.ok(reconciliation.warnings.includes("CALIBRATION_DIAGNOSTIC_ONLY"));
  assert.ok(reconciliation.warnings.includes("GLOBAL_ECONOMY_NOT_PROVEN"));
  assert.equal(reconciliation.carryoverMatrix.length >= 8, true);
  assert.equal(reconciliation.scoringPathAuditRows.some((row) => row.pathType === "batch"), true);
  assert.equal(reconciliation.scoringPathAuditRows.some((row) => row.pathType === "fullmatch"), true);
});

test("keeps Sprint 6C as report-only diagnostics without gameplay mutation", () => {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const reconciliation = buildFullMatchCalibrationCarryoverReconciliationModel(report);

  assert.equal(reconciliation.scoringConstantsChanged, false);
  assert.equal(reconciliation.scoreCapApplied, false);
  assert.equal(reconciliation.postHocScoreRewriteApplied, false);
  assert.equal(reconciliation.scoringEventsDeleted, false);
  assert.equal(reconciliation.scoringEventsRewritten, false);
  assert.equal(reconciliation.forcedOpponentScoreApplied, false);
  assert.equal(reconciliation.officialTimelineMutationCount, 0);
  assert.equal(reconciliation.officialPossessionMutationCount, 0);
  assert.equal(reconciliation.batchLiveSeparationPreserved, true);
  assert.equal(reconciliation.matchBonusEventChanged, false);
  assert.equal(reconciliation.persistenceUsedForCalibration, false);
  assert.equal(reconciliation.sqliteUsedAsScoreEconomySource, false);
  assert.equal(reconciliation.globalEconomyClaimCount, 0);
  assert.equal(reconciliation.trendProofClaimCount, 0);
  assert.equal(reconciliation.inventedStatisticCount, 0);
  assert.equal(reconciliation.fullMatchBatchEconomyRemainsOnlyGlobalProof, true);
});
