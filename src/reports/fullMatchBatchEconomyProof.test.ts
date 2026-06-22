import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFullMatchBatchEconomyProofModel } from "./fullMatchBatchEconomyProof";

test("builds a full-match batch economy proof without changing scoring guardrails", () => {
  const model = buildFullMatchBatchEconomyProofModel(50);

  assert.equal(model.scope, "FULL_MATCH_BATCH_ECONOMY_PROOF");
  assert.equal(model.version, "FULL_MATCH_BATCH_ECONOMY_6E");
  assert.equal(model.matchCount, 50);
  assert.equal(model.uniqueSeeds, 50);
  assert.ok(model.uniqueScorelines > 0);
  assert.equal(model.officialScoringPathConnectedAllRuns, true);
  assert.equal(model.calibrationAppliedAllRuns, true);
  assert.equal(model.officialScoreFromScoreChangeAllRuns, true);
  assert.equal(model.scoreCapAppliedCount, 0);
  assert.equal(model.postHocRewriteCount, 0);
  assert.equal(model.scoringEventDeletionCount, 0);
  assert.equal(model.forcedOpponentScoreCount, 0);
  assert.equal(model.scoringConstantsChangedCount, 0);
  assert.equal(model.matchBonusEventChangedCount, 0);
  assert.equal(model.batchLiveContaminationCount, 0);
  assert.equal(model.persistenceUsedForScoringCount, 0);
  assert.equal(model.sqliteUsedForScoringCount, 0);
  assert.equal(model.unknownScoringFamilyCount, 0);
  assert.equal(model.penaltyShotActiveLeakageCount, 0);
  assert.notEqual(model.status, "FAIL");
});
