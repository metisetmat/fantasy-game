import { buildFullMatchRouteFamilyScoringRateCalibrationModel } from "./fullMatchRouteFamilyScoringRateCalibration";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchRouteFamilyScoringRateCalibrationModel();

assertTest(model.scope === "FULL_MATCH_ROUTE_FAMILY_SCORING_RATE_CALIBRATION", "6G model scope must be official.");
assertTest(model.version === "ROUTE_FAMILY_SCORING_RATE_6G", "6G model version must be stable.");
assertTest(model.matchCount >= 50, "6G batch must cover at least 50 matches.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");
assertTest(model.routeFamilyCompetitionCanSelectNonShot, "non-shot route competition must remain active.");
assertTest(model.routeFamilyCompetitionCanSelectContinuation, "continuation must remain selectable.");
assertTest(model.matchesWithTryOrDropAfter > 0, "TRY/DROP must remain present.");
assertTest(model.matchesWithMultipleScoringFamiliesAfter > 0, "multiple scoring families must remain present.");
assertTest(model.matchesWithOnlyShotGoalsAfter < model.matchCount, "6G must not roll back to SHOT_ONLY.");
assertTest(model.afterBatch.scoringEventsPerMatch < 14.8, "scoring events per match must decrease versus 6F.");
assertTest(model.averageTotalPointsAfter < model.averageTotalPointsBefore, "average total points must decrease versus 6F.");
assertTest(model.averageScoreDifferenceAfter < model.averageScoreDifferenceBefore, "average score difference must decrease versus 6F.");
assertTest(model.blowoutRateAfter < model.blowoutRateBefore, "blowout rate must decrease versus 6F.");
assertTest(model.severeBlowoutRateAfter < model.severeBlowoutRateBefore, "severe blowout rate must decrease versus 6F.");
assertTest(model.conversionSuccessRateAfter < 100, "conversion success rate must not remain automatic.");
assertTest(model.conversionGoalsAfter <= model.triesScoredAfter, "conversion goals cannot exceed scored tries.");
assertTest(model.scoreFromScoreChangeAllRuns, "score must derive from official score_change events.");
assertTest(model.officialPathConnectedAllRuns, "official scoring path must remain connected.");
assertTest(model.calibrationAppliedAllRuns, "calibration must apply in all runs.");
assertTest(!model.scoringConstantsChanged, "scoring constants must remain unchanged.");
assertTest(!model.scoreCapApplied && !model.postHocRewriteApplied && !model.scoringEventsDeleted && !model.forcedOpponentScoreApplied, "no cap/rewrite/delete/forced score guardrails must hold.");
assertTest(model.unknownScoringFamilyCount === 0, "UNKNOWN scoring family must not appear.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT leakage must not appear.");

console.log("fullMatchRouteFamilyScoringRateCalibration tests passed.");
