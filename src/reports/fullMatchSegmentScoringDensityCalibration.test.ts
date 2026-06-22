import { buildFullMatchSegmentScoringDensityCalibrationModel } from "./fullMatchSegmentScoringDensityCalibration";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchSegmentScoringDensityCalibrationModel();

assertTest(model.scope === "FULL_MATCH_SEGMENT_SCORING_DENSITY_CALIBRATION", "6H model scope must be official.");
assertTest(model.version === "SEGMENT_SCORING_DENSITY_6H", "6H model version must be stable.");
assertTest(model.matchCount >= 50, "6H batch must cover at least 50 matches.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");
assertTest(model.batchAudit.segmentCount > 0, "segment density audit must exist.");
assertTest(model.beforeAfter.scoringOpportunitiesPerMatchAfter < model.beforeAfter.scoringOpportunitiesPerMatchBefore, "scoring opportunities per match must decrease versus 6G.");
assertTest(model.beforeAfter.scoringOpportunitiesPerSegmentAfter < model.beforeAfter.scoringOpportunitiesPerSegmentBefore, "scoring opportunities per segment must decrease versus 6G.");
assertTest(model.beforeAfter.dangerPhasesPerMatchAfter < model.beforeAfter.dangerPhasesPerMatchBefore, "danger phases per match must decrease versus 6G.");
assertTest(model.beforeAfter.scoringEventsPerMatchAfter < model.beforeAfter.scoringEventsPerMatchBefore, "scoring events per match must decrease versus 6G.");
assertTest(model.beforeAfter.averageTotalPointsAfter < model.beforeAfter.averageTotalPointsBefore, "average total points must decrease versus 6G.");
assertTest(model.beforeAfter.averageScoreDifferenceAfter < model.beforeAfter.averageScoreDifferenceBefore, "average score difference must decrease versus 6G.");
assertTest(model.beforeAfter.blowoutRateAfter < model.beforeAfter.blowoutRateBefore, "blowout rate must decrease versus 6G.");
assertTest(model.beforeAfter.severeBlowoutRateAfter < model.beforeAfter.severeBlowoutRateBefore, "severe blowout rate must decrease versus 6G.");
assertTest(model.beforeAfter.neutralPhasesPerMatchAfter > model.beforeAfter.neutralPhasesPerMatchBefore, "neutral phases must increase.");
assertTest(model.beforeAfter.defensiveRecoveriesPerMatchAfter > model.beforeAfter.defensiveRecoveriesPerMatchBefore, "defensive recoveries must increase.");
assertTest(model.beforeAfter.resetPhasesPerMatchAfter > model.beforeAfter.resetPhasesPerMatchBefore, "reset phases must increase.");
assertTest(model.attemptedByFamilyAfter.SHOT_GOAL > 0, "SHOT route must remain available.");
assertTest(model.attemptedByFamilyAfter.TRY_TOUCHDOWN > 0, "TRY route must remain available.");
assertTest(model.attemptedByFamilyAfter.DROP_GOAL > 0, "DROP route must remain available.");
assertTest(model.attemptedByFamilyAfter.CONVERSION_GOAL > 0, "CONVERSION route must remain available after TRY.");
assertTest(model.batchAudit.continuationCount > 0, "CONTINUATION route must remain available.");
assertTest(model.noRollbackToShotOnly, "6H must not roll back to SHOT_ONLY.");
assertTest(model.conversionOnlyAfterTry, "CONVERSION must remain tied to TRY.");
assertTest(model.scoreFromScoreChangeAllRuns, "score must derive from official score_change events.");
assertTest(model.officialPathConnectedAllRuns, "official scoring path must remain connected.");
assertTest(model.calibrationAppliedAllRuns, "6H calibration must apply in all runs.");
assertTest(!model.scoringConstantsChanged, "scoring constants must remain unchanged.");
assertTest(!model.scoreCapApplied && !model.postHocRewriteApplied && !model.scoringEventsDeleted && !model.forcedOpponentScoreApplied, "no cap/rewrite/delete/forced score guardrails must hold.");
assertTest(!model.MatchBonusEventChanged, "MatchBonusEvent must remain unchanged.");
assertTest(model.batchLiveSeparationPreserved, "batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "persistence/SQLite must not be used for scoring.");
assertTest(model.unknownScoringFamilyCount === 0, "UNKNOWN scoring family must not appear.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT leakage must not appear.");
assertTest(model.status === "PASS" || model.status === "PARTIAL", "6H should pass guardrails or remain explicitly partial.");
assertTest(!(model.beforeAfter.blowoutRateAfter > 40 && model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY")), "6H must not claim healthy economy while blowouts remain high.");

console.log("fullMatchSegmentScoringDensityCalibration tests passed.");
