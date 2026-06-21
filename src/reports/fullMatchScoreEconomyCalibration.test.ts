import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildFullMatchScoreEconomyCalibrationModel } from "./fullMatchScoreEconomyCalibration";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchScoreEconomyCalibration(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildFullMatchScoreEconomyCalibrationModel(report);
  const beforeTotal = report.score.home + report.score.away;
  const afterTotal = model.officialScoreAfterCalibration
    .split(" - ")
    .map((value) => Number.parseInt(value, 10))
    .reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);

  assertTest(model.status === "available", "score economy calibration model must be available.");
  assertTest(model.scope === "FULL_MATCH_SCORE_ECONOMY_SINGLE_RUN", "scope must be single-run score economy.");
  assertTest(model.calibrationVersion === "SCORE_ECONOMY_6A", "calibration version must be SCORE_ECONOMY_6A.");
  assertTest(model.rootCause.primaryCause !== "INSUFFICIENT_EVIDENCE", "root-cause classification must be available.");
  assertTest(model.scoringEventCountByFamily.SHOT_GOAL > 0, "legacy scoring_type_goal tags must map to SHOT_GOAL.");
  assertTest(model.scoringPointsByFamily.SHOT_GOAL > 0, "SHOT_GOAL points must be attributed before aggregation.");
  assertTest(model.scoringEventCountByFamily.UNKNOWN < model.scoringEventCount, "scoring families must not all aggregate as UNKNOWN.");
  assertTest(model.rootCause.limitations.some((limitation) => limitation.includes("Single-run")), "single-run limitation must be explicit.");
  assertTest(model.comparison.scoringEventsBefore >= model.comparison.scoringEventsAfter, "after comparison must not increase scoring events.");
  assertTest(afterTotal <= beforeTotal, "projected calibration score must be no more extreme than before.");
  assertTest(!model.scoringConstantsChanged, "scoring constants must remain unchanged.");
  assertTest(!model.scoreCapApplied, "score cap must not be applied.");
  assertTest(!model.postHocScoreRewriteApplied, "post-hoc score rewrite must not be applied.");
  assertTest(!model.scoringEventsDeleted, "official scoring events must not be deleted.");
  assertTest(!model.scoringEventsRewritten, "official scoring events must not be rewritten.");
  assertTest(!model.forcedOpponentScoreApplied, "opponent score must not be forced.");
  assertTest(model.officialTimelineMutationCount === 0, "official timeline mutation count must be 0.");
  assertTest(model.officialPossessionMutationCount === 0, "official possession mutation count must be 0.");
  assertTest(model.productionScoringEventCreationCount === 0, "production scoring event creation count must be 0.");
  assertTest(model.batchLiveSeparationPreserved, "batch/live separation must be preserved.");
  assertTest(!model.matchBonusEventChanged, "MatchBonusEvent must remain unchanged.");
  assertTest(!model.persistenceUsedForCalibration, "persistence must not be used for calibration.");
  assertTest(!model.sqliteUsedAsScoreEconomySource, "SQLite must not be used as score economy source.");
  assertTest(model.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY remains only global proof.");
  assertTest(model.inventedStatisticCount === 0, "invented statistic count must be 0.");
  assertTest(model.trendProofClaimCount === 0, "trend proof claim count must be 0.");
  assertTest(model.globalEconomyClaimCount === 0, "global economy claim count must be 0.");

  return [
    "full-match score economy calibration model is available",
    "legacy production scoring tags map before family aggregation",
    "root-cause classification and before/after comparison are available",
    "projected calibration is less extreme without score cap or post-hoc rewrite",
    "scoring constants, MatchBonusEvent, batch/live separation, and global proof boundary remain intact",
    "persistence and SQLite are not used for gameplay calibration",
  ];
}

const checks = validateFullMatchScoreEconomyCalibration();

console.log("fullMatchScoreEconomyCalibration tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}
