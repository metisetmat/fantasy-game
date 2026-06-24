import {
  buildFullMatchRouteEconomyRecheckAfterSelectivityFixModel,
  renderFullMatchRouteEconomyRecheckAfterSelectivityFix6QDoc,
  renderFullMatchRouteEconomyRecheckAfterSelectivityFix6QValidation,
} from "./fullMatchRouteEconomyRecheckAfterSelectivityFix";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchRouteEconomyRecheckAfterSelectivityFixModel();
const doc = renderFullMatchRouteEconomyRecheckAfterSelectivityFix6QDoc(model);
const validation = renderFullMatchRouteEconomyRecheckAfterSelectivityFix6QValidation(model);

assertTest(model.scope === "FULL_MATCH_ROUTE_ECONOMY_RECHECK_AFTER_SELECTIVITY_FIX", "6Q model scope must be official.");
assertTest(model.version === "ROUTE_ECONOMY_RECHECK_6Q", "6Q model version must be stable.");
assertTest(model.baselineVersion === "GATE_SELECTIVITY_VOLUME_6P", "6Q must use 6P as baseline.");
assertTest(model.matchCount >= 50, "6Q calibration must run at least 50 matches.");
assertTest(model.routeEconomyAudit.routeEconomyWindowCount > 0, "6Q must observe real route economy windows.");
assertTest(model.routeEconomyAudit.dangerQualityDistribution.length > 0, "6Q must measure danger quality.");
assertTest(model.routeEconomyAudit.dangerOutcomeDistribution.length > 0, "6Q must measure danger outcomes.");
assertTest(model.earnedDangerRateAfter > 0, "6Q must keep earned danger alive.");
assertTest(model.automaticDangerSuspicionRateAfter <= 10, "6Q must not restore automatic danger.");
assertTest(model.borderlineDangerToScoringOpportunityRateAfter < model.borderlineDangerToScoringOpportunityRateBefore, "6Q must reduce borderline danger auto-opportunities.");
assertTest(model.continuationToScoringOpportunityRateAfter < model.continuationToScoringOpportunityRateBefore, "6Q must reduce continuation auto-opportunities.");
assertTest(model.halfChanceRateAfter > 0, "6Q must add a half-chance layer.");
assertTest(model.forcedDefensiveActionRateAfter > 0, "6Q must add a forced-defensive-action layer.");
assertTest(model.territorialGainRateAfter > 0, "6Q must add a territorial-gain layer.");
assertTest(model.scoringOpportunitiesPerMatchAfter >= 15 && model.scoringOpportunitiesPerMatchAfter <= 17, "6Q must keep scoring opportunities around 15-17.");
assertTest(model.averageTotalPointsAfter >= 22 || model.status === "PARTIAL", "6Q must either preserve average points or surface PARTIAL status.");
assertTest(model.averageTotalPointsAfter <= 28, "6Q must not re-inflate average points.");
assertTest(model.severeBlowoutRateAfter <= 8, "6Q must keep severe blowouts low.");
assertTest(model.routeFamilyDiversityPreserved, "6Q must preserve route family diversity.");
assertTest(model.scoreFromScoreChangeAllRuns, "6Q official score must come from score_change consequences.");
assertTest(model.officialPathConnectedAllRuns, "6Q official path must stay connected.");
assertTest(model.calibrationsAppliedAllRuns, "6Q calibration must be connected in every run.");
assertTest(!model.scoreCapApplied, "6Q must not apply score caps.");
assertTest(!model.postHocRewriteApplied, "6Q must not rewrite scores.");
assertTest(!model.scoringEventsDeleted, "6Q must not delete scoring events.");
assertTest(!model.forcedOpponentScoreApplied, "6Q must not force opponent scores.");
assertTest(!model.forcedTrailingTeamScoreApplied, "6Q must not force trailing-team scores.");
assertTest(!model.MatchBonusEventChanged, "6Q must not mutate MatchBonusEvent.");
assertTest(model.batchLiveSeparationPreserved, "6Q batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "6Q persistence and SQLite must not score.");
assertTest(model.unknownScoringFamilyCount === 0, "6Q UNKNOWN scoring family must not leak.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "6Q PENALTY_SHOT must not leak.");
assertTest(doc.includes("Baseline 6P Summary"), "6Q doc must include 6P baseline.");
assertTest(doc.includes("Route Economy Audit Summary"), "6Q doc must include route economy audit.");
assertTest(doc.includes("Danger Quality Distribution"), "6Q doc must include danger quality distribution.");
assertTest(doc.includes("Danger Outcome Distribution"), "6Q doc must include danger outcome distribution.");
assertTest(doc.includes("Danger-To-Opportunity Metrics"), "6Q doc must include danger-to-opportunity metrics.");
assertTest(validation.includes("Status: PASS"), "6Q validation must pass.");
assertTest(validation.includes("Explicit Exhaustive Test Command"), "6Q validation must include exhaustive command.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");

console.log("fullMatchRouteEconomyRecheckAfterSelectivityFix tests passed.");
