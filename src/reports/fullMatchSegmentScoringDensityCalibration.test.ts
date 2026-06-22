import { buildFullMatchSegmentScoringDensityCalibrationModel } from "./fullMatchSegmentScoringDensityCalibration";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchSegmentScoringDensityCalibrationModel();
const scoringEventsByFamilyTotal = Object.values(model.scoringEventsByFamilyAfter).reduce((sum, value) => sum + value, 0);
const scoringPointsByFamilyTotal = Object.values(model.scoringPointsByFamilyAfter).reduce((sum, value) => sum + value, 0);
const scoringPointsAverage = Math.round((scoringPointsByFamilyTotal / model.matchCount) * 10) / 10;
const continuationMixCount = model.routeFamilyMixAfter.find((row) => row.routeFamily === "CONTINUATION")?.count ?? 0;

function scenarioInput(index: number): MatchInput {
  const base = engineToCoachPublicContractFixtures.matchInputFixture;
  const scoringBiases = ["try_first", "balanced", "drop_threat", "goal_first", "territory_first"] as const;

  return {
    ...base,
    matchId: `fullmatch-segment-scoring-density-order-test-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-segment-scoring-density-order-test-seed-${String(index + 1).padStart(3, "0")}`,
    homePlan: {
      ...base.homePlan,
      scoringBias: scoringBiases[index % scoringBiases.length] ?? base.homePlan.scoringBias,
      pressingIntensity: 35 + ((index * 19) % 55),
    },
    awayPlan: {
      ...base.awayPlan,
      scoringBias: scoringBiases[(index + 1) % scoringBiases.length] ?? base.awayPlan.scoringBias,
      pressingIntensity: 35 + ((index * 23) % 55),
    },
  };
}

function assertConversionsAfterTry(report: MatchReport): number {
  let checked = 0;

  for (const conversion of report.timeline.filter((event) => event.tags.includes("official_route_family_CONVERSION_GOAL"))) {
    const parentTry = report.timeline.find((event) =>
      event.sequenceId === conversion.sequenceId &&
      event.teamId === conversion.teamId &&
      event.tags.includes("official_route_family_TRY_TOUCHDOWN") &&
      event.consequences.some((consequence) => consequence.type === "score_change")
    );

    if (parentTry !== undefined) {
      checked += 1;
      assertTest(conversion.timestamp.tick > parentTry.timestamp.tick, "CONVERSION_GOAL must be timestamped after its parent TRY_TOUCHDOWN.");
    }
  }

  return checked;
}

let conversionOrderPairsChecked = 0;
for (let index = 0; index < 30 && conversionOrderPairsChecked === 0; index += 1) {
  conversionOrderPairsChecked += assertConversionsAfterTry(runFullMatch(scenarioInput(index)));
}

assertTest(model.scope === "FULL_MATCH_SEGMENT_SCORING_DENSITY_CALIBRATION", "6H model scope must be official.");
assertTest(model.version === "SEGMENT_SCORING_DENSITY_6H", "6H model version must be stable.");
assertTest(model.matchCount >= 50, "6H batch must cover at least 50 matches.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");
assertTest(model.batchAudit.segmentCount > 0, "segment density audit must exist.");
assertTest(model.batchAudit.scoringEventCount === scoringEventsByFamilyTotal, "6H scoring event total must come from the audited batch.");
assertTest(model.afterBatch.averageTotalPoints === scoringPointsAverage, "6H scoring point total must come from the audited batch.");
assertTest(continuationMixCount === model.batchAudit.continuationCount, "6H audit must count exact CONTINUATION route-family tags.");
assertTest(conversionOrderPairsChecked > 0, "6H conversion order test must observe at least one generated conversion.");
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
