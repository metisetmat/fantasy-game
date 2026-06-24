import {
  buildFullMatchGateSelectivityVolumeRegressionFixModel,
  renderFullMatchGateSelectivityVolumeRegressionFix6PDoc,
  renderFullMatchGateSelectivityVolumeRegressionFix6PValidation,
} from "./fullMatchGateSelectivityVolumeRegressionFix";
import {
  NEGATIVE_GATE_CONTEXT_CODES,
  POSITIVE_GATE_REASON_CODES,
} from "../simulation/fullMatch/fullMatchGateSelectivityAudit";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchGateSelectivityVolumeRegressionFixModel();
const doc = renderFullMatchGateSelectivityVolumeRegressionFix6PDoc(model);
const validation = renderFullMatchGateSelectivityVolumeRegressionFix6PValidation(model);

assertTest(model.scope === "FULL_MATCH_GATE_SELECTIVITY_VOLUME_REGRESSION_FIX", "6P model scope must be official.");
assertTest(model.version === "GATE_SELECTIVITY_VOLUME_6P", "6P model version must be stable.");
assertTest(model.baselineVersion === "EARNED_DANGER_GATE_TUNING_6O", "6P must use 6O as the baseline.");
assertTest(model.matchCount >= 50, "6P calibration must run at least 50 matches.");
assertTest(model.gateSelectivityAudit.observedGateRowCount > 0, "6P must observe real gate rows.");
assertTest(model.earnedDangerRateAfter > 0, "6P must keep some earned danger alive.");
assertTest(model.earnedDangerRateAfter < model.earnedDangerRateBefore, "6P must reduce the 6O earned danger flood.");
assertTest(model.resetToDangerRateAfter < model.resetToDangerRateBefore, "6P must reduce reset-to-danger.");
assertTest(model.scoringOpportunitiesPerMatchAfter < model.scoringOpportunitiesPerMatchBefore, "6P must reduce opportunity volume.");
assertTest(model.scoringEventsPerMatchAfter < model.scoringEventsPerMatchBefore, "6P must reduce scoring-event volume.");
assertTest(model.averageTotalPointsAfter < model.averageTotalPointsBefore, "6P must reduce average points.");
assertTest(model.severeBlowoutRateAfter < model.severeBlowoutRateBefore, "6P must reduce severe blowouts.");
assertTest(model.blowoutRateAfter < model.blowoutRateBefore, "6P must reduce blowouts.");
assertTest(
  POSITIVE_GATE_REASON_CODES.every((reason) => !NEGATIVE_GATE_CONTEXT_CODES.includes(reason)),
  "6P positive and negative gate reason sets must remain disjoint.",
);
assertTest(!POSITIVE_GATE_REASON_CODES.includes("LOW_SPACING"), "LOW_SPACING must not be a positive reason.");
assertTest(!POSITIVE_GATE_REASON_CODES.includes("IMMEDIATE_AFTER_RESET"), "IMMEDIATE_AFTER_RESET must not be a positive reason.");
assertTest(!POSITIVE_GATE_REASON_CODES.includes("POST_SCORE_CONTEXT"), "POST_SCORE_CONTEXT must not be a positive reason.");
assertTest(!POSITIVE_GATE_REASON_CODES.includes("LEADING_TEAM_REATTACK"), "LEADING_TEAM_REATTACK must not be a positive reason.");
assertTest(model.scoreFromScoreChangeAllRuns, "6P official score must come from score_change consequences.");
assertTest(model.officialPathConnectedAllRuns, "6P official path must stay connected.");
assertTest(model.calibrationsAppliedAllRuns, "6P calibration must be connected in every run.");
assertTest(!model.scoreCapApplied, "6P must not apply score caps.");
assertTest(!model.postHocRewriteApplied, "6P must not rewrite scores.");
assertTest(!model.scoringEventsDeleted, "6P must not delete scoring events.");
assertTest(!model.forcedOpponentScoreApplied, "6P must not force opponent scores.");
assertTest(!model.forcedTrailingTeamScoreApplied, "6P must not force trailing-team scores.");
assertTest(!model.MatchBonusEventChanged, "6P must not mutate MatchBonusEvent.");
assertTest(model.batchLiveSeparationPreserved, "6P batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "6P persistence and SQLite must not score.");
assertTest(model.unknownScoringFamilyCount === 0, "6P UNKNOWN scoring family must not leak.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "6P PENALTY_SHOT must not leak.");
assertTest(doc.includes("Baseline 6O Summary"), "6P doc must include the 6O baseline.");
assertTest(doc.includes("Before / After Table"), "6P doc must include before/after metrics.");
assertTest(doc.includes("Positive vs Negative Gate Reason Separation"), "6P doc must include reason separation.");
assertTest(doc.includes("Positive Gate Reason Distribution"), "6P doc must include positive reason distribution.");
assertTest(doc.includes("Negative Gate Context Distribution"), "6P doc must include negative context distribution.");
assertTest(validation.includes("Status: PASS"), "6P validation must pass.");
assertTest(validation.includes("Explicit Exhaustive Test Command"), "6P validation must include exhaustive command.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");

console.log("fullMatchGateSelectivityVolumeRegressionFix tests passed.");
