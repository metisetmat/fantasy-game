import { buildFullMatchTeamOpportunityBalanceCalibrationModel } from "./fullMatchTeamOpportunityBalanceCalibration";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchTeamOpportunityBalanceCalibrationModel();

assertTest(model.scope === "FULL_MATCH_TEAM_OPPORTUNITY_BALANCE_CALIBRATION", "6I model scope must be official.");
assertTest(model.version === "TEAM_OPPORTUNITY_BALANCE_6I", "6I model version must be stable.");
assertTest(model.matchCount >= 50, "6I calibration must run at least 50 matches.");
assertTest(model.baselineVersion === "SEGMENT_SCORING_DENSITY_6H", "6I baseline must reference 6H.");
assertTest(model.audits.length >= 50, "6I team opportunity audits must exist for the batch.");
assertTest(model.teamOpportunityBalance.home.scoringOpportunityCount > 0, "home opportunities must be measured.");
assertTest(model.teamOpportunityBalance.away.scoringOpportunityCount > 0, "away opportunities must be measured.");
assertTest(model.teamOpportunityBalance.home.dangerPhaseCount > 0, "home danger phases must be measured.");
assertTest(model.teamOpportunityBalance.away.dangerPhaseCount > 0, "away danger phases must be measured.");
assertTest(model.opportunityBalanceIndexAfter >= 0, "opportunity balance index must be measured.");
assertTest(model.dangerBalanceIndexAfter >= 0, "danger balance index must be measured.");
assertTest(model.scoringBalanceIndexAfter >= 0, "scoring balance index must be measured.");
assertTest(model.pointBalanceIndexAfter >= 0, "point balance index must be measured.");
assertTest(model.status !== "PASS" || model.opportunityBalanceIndexAfter >= model.opportunityBalanceIndexBefore, "PASS requires opportunity balance improvement.");
assertTest(model.status !== "PASS" || model.dangerBalanceIndexAfter >= model.dangerBalanceIndexBefore, "PASS requires danger balance improvement.");
assertTest(model.status !== "PASS" || model.scoringBalanceIndexAfter >= model.scoringBalanceIndexBefore, "PASS requires scoring balance improvement.");
assertTest(model.status !== "PASS" || model.pointBalanceIndexAfter >= model.pointBalanceIndexBefore, "PASS requires point balance improvement.");
assertTest(model.status !== "PASS" || model.averageScoreDifferenceAfter < model.averageScoreDifferenceBefore, "PASS requires average score difference reduction.");
assertTest(model.status !== "PASS" || model.blowoutRateAfter < model.blowoutRateBefore, "PASS requires blowout reduction.");
assertTest(model.status !== "PASS" || model.oneSidedScoringRateAfter < model.oneSidedScoringRateBefore, "PASS requires one-sided scoring reduction.");
assertTest(model.trailingTeamResponseRateAfter >= 0, "trailing team response rate must be measured.");
assertTest(model.dominantTeamOpportunityChainAfter >= 0, "dominance chain must be measured.");
assertTest(model.densityCalibrationPreserved, "6I must preserve 6H density calibration.");
assertTest(model.routeFamilyDiversityPreserved, "6I must preserve route family diversity.");
assertTest(model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN > 0, "TRY route must remain available.");
assertTest(model.routeFamilyMixByTeam.home.DROP_GOAL + model.routeFamilyMixByTeam.away.DROP_GOAL > 0, "DROP route must remain available.");
assertTest(
  model.routeFamilyMixByTeam.home.CONVERSION_GOAL + model.routeFamilyMixByTeam.away.CONVERSION_GOAL <=
    model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN,
  "CONVERSION must only follow TRY.",
);
assertTest(model.routeFamilyMixByTeam.home.CONTINUATION + model.routeFamilyMixByTeam.away.CONTINUATION > 0, "CONTINUATION must remain available.");
assertTest(model.scoreFromScoreChangeAllRuns, "official score must come from score_change consequences.");
assertTest(model.officialPathConnectedAllRuns, "official route path must stay connected.");
assertTest(model.calibrationsAppliedAllRuns, "calibrations must be applied in all runs.");
assertTest(!model.scoreCapApplied, "6I must not apply score caps.");
assertTest(!model.postHocRewriteApplied, "6I must not rewrite scores.");
assertTest(!model.scoringEventsDeleted, "6I must not delete scoring events.");
assertTest(!model.forcedOpponentScoreApplied, "6I must not force opponent scores.");
assertTest(!model.forcedTrailingTeamScoreApplied, "6I must not force trailing-team scores.");
assertTest(!model.MatchBonusEventChanged, "6I must not mutate MatchBonusEvent.");
assertTest(model.batchLiveSeparationPreserved, "batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "persistence and SQLite must not score.");
assertTest(model.unknownScoringFamilyCount === 0, "UNKNOWN scoring family must not leak.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT must not leak.");
assertTest(model.noRollbackToShotOnly, "6I must not roll back to SHOT_ONLY.");
assertTest(
  !(model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") &&
    (model.warnings.includes("BLOWOUT_RATE_STILL_TOO_HIGH") || model.warnings.includes("TEAM_BALANCE_STILL_TOO_WEAK"))),
  "6I must not emit contradictory healthy warning.",
);
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");

console.log("fullMatchTeamOpportunityBalanceCalibration tests passed.");
