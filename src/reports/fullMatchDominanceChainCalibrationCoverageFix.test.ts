import {
  buildFullMatchDominanceChainCalibrationCoverageFixModel,
  renderFullMatchDominanceChainCalibrationCoverageFix6SDoc,
  renderFullMatchDominanceChainCalibrationCoverageFix6SValidation,
} from "./fullMatchDominanceChainCalibrationCoverageFix";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchDominanceChainCalibrationCoverageFixModel();
const doc = renderFullMatchDominanceChainCalibrationCoverageFix6SDoc(model);
const validation = renderFullMatchDominanceChainCalibrationCoverageFix6SValidation(model);

assertTest(model.scope === "FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION_COVERAGE_FIX", "6S model scope must be current.");
assertTest(model.version === "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S", "6S model version must be current.");
assertTest(model.baselineVersion === "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R", "6S baseline must be 6R.");
assertTest(model.matchCount >= 50, "6S batch must include at least 50 matches.");
assertTest(model.dominantTeamOpportunityChainMaxAfter < model.dominantTeamOpportunityChainMaxBefore || model.status === "FAIL", "dominance chain max must decrease or fail.");
assertTest(model.calibrationCoverageWindowCount > 0, "calibration coverage windows must be measured.");
assertTest(model.calibrationsAppliedAllRuns || model.calibrationCoverageExplained, "missing calibration coverage must be explicitly explained.");
assertTest(model.scoreFromScoreChangeAllRuns, "score must remain derived from score_change events.");
assertTest(model.officialPathConnectedAllRuns, "official route path must remain connected.");
assertTest(!model.scoringConstantsChanged, "scoring constants must not change.");
assertTest(!model.scoreCapApplied, "score cap must not be applied.");
assertTest(!model.postHocRewriteApplied, "post-hoc rewrite must not be applied.");
assertTest(!model.scoringEventsDeleted, "scoring events must not be deleted.");
assertTest(!model.forcedOpponentScoreApplied, "opponent score must not be forced.");
assertTest(!model.forcedTrailingTeamScoreApplied, "trailing team score must not be forced.");
assertTest(model.unknownScoringFamilyCount === 0, "UNKNOWN scoring family must remain zero.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT leakage must remain zero.");
assertTest(doc.includes("Full-Match Dominance Chain Calibration Coverage Fix 6S"), "6S report title must render.");
assertTest(doc.includes("Calibration Coverage Audit"), "6S report must include calibration coverage audit.");
assertTest(validation.includes("Status: PASS"), "6S validation report must pass.");
assertTest(
  validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"),
  "6S validation must include the exhaustive command.",
);

console.log("PASS fullMatchDominanceChainCalibrationCoverageFix");
