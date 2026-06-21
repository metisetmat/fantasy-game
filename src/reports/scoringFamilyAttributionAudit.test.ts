import assert from "node:assert/strict";
import { test } from "node:test";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildScoringFamilyAttributionAuditModel } from "./scoringFamilyAttributionAudit";

test("builds a PASS scoring family attribution audit for the full-match fixture", () => {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const audit = buildScoringFamilyAttributionAuditModel(report);

  assert.equal(audit.status, "PASS");
  assert.equal(audit.totalScoringEventCount > 0, true);
  assert.equal(audit.unknownScoringEventCount, 0);
  assert.equal(audit.unknownScoringPointTotal, 0);
  assert.equal(audit.attributionCoverageRate, 100);
  assert.equal(audit.legacyUnknownScoringEventCount > audit.unknownScoringEventCount, true);
  assert.equal(audit.scoringEventsByFamily.UNKNOWN, 0);
  assert.equal(audit.scoringPointsByFamily.UNKNOWN, 0);
  assert.equal(audit.scoringEventsByFamily.SHOT_GOAL > 0, true);
  assert.equal(audit.scoringPointsByFamily.SHOT_GOAL > 0, true);
});

test("keeps Sprint 6B attribution as a report-only audit without score mutation", () => {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const audit = buildScoringFamilyAttributionAuditModel(report);

  assert.equal(audit.scoringConstantsChanged, false);
  assert.equal(audit.scoreCapApplied, false);
  assert.equal(audit.postHocRewriteApplied, false);
  assert.equal(audit.scoringEventsDeleted, false);
  assert.equal(audit.scoringEventsRewritten, false);
  assert.equal(audit.forcedOpponentScoreApplied, false);
  assert.equal(audit.batchLiveSeparationPreserved, true);
  assert.equal(audit.matchBonusEventChanged, false);
  assert.equal(audit.persistenceUsedForAttribution, false);
  assert.equal(audit.sqliteUsedAsScoreEconomySource, false);
  assert.equal(audit.fullMatchBatchEconomyRemainsOnlyGlobalProof, true);
});
