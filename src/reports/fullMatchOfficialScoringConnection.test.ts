import assert from "node:assert/strict";
import { test } from "node:test";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildFullMatchOfficialScoringCalibrationConnectionModel } from "./fullMatchOfficialScoringConnection";

function scoreChangeTotal(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

test("connects official full-match score_change emission to the calibrated path", () => {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
    enableCoachReportMultiMatchPhaseComparison: true,
  });
  const connection = buildFullMatchOfficialScoringCalibrationConnectionModel(report);

  assert.equal(connection.status, "PASS");
  assert.equal(connection.scope, "FULL_MATCH_OFFICIAL_SCORING_CONNECTION_SINGLE_RUN");
  assert.equal(connection.version, "OFFICIAL_SCORING_CONNECTION_6D");
  assert.equal(connection.officialScoreBeforeConnection, "45 - 0");
  assert.equal(connection.officialScoringEventsBeforeConnection, 15);
  assert.ok(connection.officialShotGoalEventsAfterConnection < connection.officialShotGoalEventsBeforeConnection);
  assert.ok(
    connection.routeFamilyMixAfterConnection.tryTouchdownEvents +
      connection.routeFamilyMixAfterConnection.conversionGoalEvents +
      connection.routeFamilyMixAfterConnection.dropGoalEvents >
      0,
  );
  assert.equal(connection.usesShotDifficultyCalibrationAfter, true);
  assert.equal(connection.usesScoringChoiceBalanceAfter, true);
  assert.equal(connection.usesAffordanceVolumeConstraintsAfter, true);
  assert.equal(connection.usesGoalkeeperCalibrationAfter, true);
  assert.equal(connection.usesReboundCalibrationAfter, true);
  assert.equal(connection.usesFatigueCalibrationAfter, true);
  assert.equal(connection.usesRouteFamilyMixAfter, true);
  assert.equal(connection.usesDefensiveResistanceAfter, true);
  assert.equal(connection.usesDangerPhaseGateAfter, true);
  assert.equal(connection.fullMatchUsesParallelScoringPathAfter, false);
  assert.equal(connection.fullMatchUsesLegacyShotPathAfter, false);
  assert.equal(connection.fullMatchUsesFallbackRoutePathAfter, false);
  assert.equal(connection.officialScoreComesFromScoreChangeEvents, true);
  assert.equal(scoreChangeTotal(report), report.score.home + report.score.away);
  assert.equal(connection.scoreCapApplied, false);
  assert.equal(connection.postHocScoreRewriteApplied, false);
  assert.equal(connection.scoringEventsDeleted, false);
  assert.equal(connection.forcedOpponentScoreApplied, false);
  assert.equal(connection.canClaimGlobalEconomyAfter, false);
  assert.ok(connection.warnings.includes("OFFICIAL_SCORING_PATH_CONNECTED"));
  assert.ok(connection.warnings.includes("FULL_MATCH_BATCH_REQUIRED"));
});
