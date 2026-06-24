import {
  buildFullMatchEarnedDangerOutcomeDistributionModel,
  renderFullMatchEarnedDangerOutcomeDistribution6RDoc,
  renderFullMatchEarnedDangerOutcomeDistribution6RValidation,
} from "./fullMatchEarnedDangerOutcomeDistribution";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchEarnedDangerOutcomeDistributionModel();
const doc = renderFullMatchEarnedDangerOutcomeDistribution6RDoc(model);
const validation = renderFullMatchEarnedDangerOutcomeDistribution6RValidation(model);

assertTest(model.scope === "FULL_MATCH_EARNED_DANGER_OUTCOME_DISTRIBUTION_LONGITUDINAL_ROUTE_ECONOMY", "6R model scope must be official.");
assertTest(model.version === "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R", "6R model version must be stable.");
assertTest(model.baselineVersion === "ROUTE_ECONOMY_RECHECK_6Q", "6R must use 6Q as baseline.");
assertTest(model.matchCount >= 50, "6R calibration must run at least 50 matches.");
assertTest(model.audit.earnedDangerWindowCount + model.audit.borderlineDangerWindowCount > 0, "6R must observe earned/borderline danger windows.");
assertTest(model.audit.routeQualityScoreDistribution.length > 0, "6R must measure danger quality.");
assertTest(model.audit.opportunityQualityScoreDistribution.length > 0, "6R must measure danger outcomes.");
assertTest(model.earnedDangerToScoringOpportunityRateAfter < model.earnedDangerToScoringOpportunityRateBefore, "6R must reduce earned danger auto-opportunities.");
assertTest(model.mediumQualityDangerCountAfter > model.mediumQualityDangerCountBefore, "6R must reintroduce medium-quality danger.");
assertTest(model.lowQualityDangerCountAfter >= model.lowQualityDangerCountBefore, "6R must keep low-quality danger measurable.");
assertTest(model.halfChanceOutcomeCountAfter > model.halfChanceOutcomeCountBefore, "6R must expand half chances.");
assertTest(model.forcedDefensiveActionOutcomeCountAfter > model.forcedDefensiveActionOutcomeCountBefore, "6R must expand forced defensive actions.");
assertTest(model.territorialGainOutcomeCountAfter > model.territorialGainOutcomeCountBefore, "6R must expand territorial gains.");
assertTest(model.scoringOpportunitiesPerMatchAfter >= 15 && model.scoringOpportunitiesPerMatchAfter <= 17, "6R must preserve scoring opportunities around 15-17.");
assertTest(model.scoringEventsPerMatchAfter >= 6 && model.scoringEventsPerMatchAfter <= 8.5, "6R must preserve scoring event volume.");
assertTest(model.averageTotalPointsAfter >= 22 && model.averageTotalPointsAfter <= 28, "6R must preserve score economy.");
assertTest(model.severeBlowoutRateAfter <= 8, "6R must keep severe blowouts low.");
assertTest(model.routeEconomyLongitudinallyStable, "6R must validate longitudinal route economy stability.");
assertTest(model.gateSelectivityPreserved, "6R must preserve gate selectivity.");
assertTest(model.earnedDangerPreserved, "6R must keep earned danger alive.");
assertTest(model.automaticDangerStillBlocked, "6R must keep automatic danger blocked.");
assertTest(model.routeFamilyDiversityPreserved, "6R must preserve route family diversity.");
assertTest(model.scoreFromScoreChangeAllRuns, "6R official score must come from score_change consequences.");
assertTest(model.officialPathConnectedAllRuns, "6R official path must stay connected.");
assertTest(model.audit.earnedDangerWindowCount + model.audit.borderlineDangerWindowCount > 0, "6R calibration must be connected to the batch.");
assertTest(!model.scoreCapApplied, "6R must not apply score caps.");
assertTest(!model.postHocRewriteApplied, "6R must not rewrite scores.");
assertTest(!model.scoringEventsDeleted, "6R must not delete scoring events.");
assertTest(!model.forcedOpponentScoreApplied, "6R must not force opponent scores.");
assertTest(!model.forcedTrailingTeamScoreApplied, "6R must not force trailing-team scores.");
assertTest(!model.MatchBonusEventChanged, "6R must not mutate MatchBonusEvent.");
assertTest(model.batchLiveSeparationPreserved, "6R batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "6R persistence and SQLite must not score.");
assertTest(model.unknownScoringFamilyCount === 0, "6R UNKNOWN scoring family must not leak.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "6R PENALTY_SHOT must not leak.");
assertTest(doc.includes("Baseline 6Q Summary"), "6R doc must include 6Q baseline.");
assertTest(doc.includes("Earned Danger Outcome Distribution Audit"), "6R doc must include earned danger outcome audit.");
assertTest(doc.includes("Danger Quality Distribution"), "6R doc must include danger quality distribution.");
assertTest(doc.includes("Danger Outcome Distribution"), "6R doc must include danger outcome distribution.");
assertTest(doc.includes("Longitudinal Route Economy Validation"), "6R doc must include longitudinal validation.");
assertTest(validation.includes("Status: PASS"), "6R validation must pass.");
assertTest(validation.includes("Explicit Exhaustive Test Command"), "6R validation must include exhaustive command.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");

console.log("fullMatchEarnedDangerOutcomeDistribution tests passed.");
