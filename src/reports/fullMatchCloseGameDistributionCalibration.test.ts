import {
  buildFullMatchCloseGameDistributionCalibrationModel,
  renderFullMatchCloseGameDistributionCalibration6TDoc,
  renderFullMatchCloseGameDistributionCalibration6TValidation,
} from "./fullMatchCloseGameDistributionCalibration";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchCloseGameDistributionCalibrationModel();
const doc = renderFullMatchCloseGameDistributionCalibration6TDoc(model);
const validation = renderFullMatchCloseGameDistributionCalibration6TValidation(model);

assertTest(model.scope === "FULL_MATCH_CLOSE_GAME_DISTRIBUTION_CALIBRATION", "6T model scope must be current.");
assertTest(model.version === "CLOSE_GAME_DISTRIBUTION_6T", "6T model version must be current.");
assertTest(model.baselineVersion === "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S", "6T baseline must be 6S.");
assertTest(model.matchCount >= 50, "6T batch must include at least 50 matches.");
assertTest(model.closeGameRateAfter >= 0, "6T close game rate must be measured.");
assertTest(model.competitiveGameRateAfter >= 0, "6T competitive game rate must be measured.");
assertTest(model.blowoutRateAfter >= 0, "6T blowout rate must be measured.");
assertTest(model.severeBlowoutRateAfter <= 8, "6T severe blowout rate must stay low.");
assertTest(model.chainMetricConsistencyAfter, "6T must fix or document chain average/max consistency.");
assertTest(model.dominantTeamOpportunityChainMaxAfter <= 4, "6T must preserve healthy dominance chains.");
assertTest(model.calibrationCoveragePreserved, "6T must preserve calibration coverage.");
assertTest(model.scoreFromScoreChangeAllRuns, "6T official score must remain derived from score_change events.");
assertTest(!model.scoreCapApplied, "6T must not apply a score cap.");
assertTest(!model.rubberBandingApplied, "6T must not apply rubber-banding.");
assertTest(!model.comebackForced, "6T must not force comebacks.");
assertTest(model.unknownScoringFamilyCount === 0, "6T must not leak UNKNOWN scoring families.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "6T must not leak active PENALTY_SHOT.");
assertTest(model.routeFamilyDiversityPreserved, "6T must preserve route family diversity.");
assertTest(doc.includes("Full-Match Close Game Distribution Calibration 6T"), "6T report title must render.");
assertTest(doc.includes("Score Gap Cause Audit"), "6T report must include score gap cause audit.");
assertTest(validation.includes("Status: PASS"), "6T validation report must pass.");
assertTest(
  validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"),
  "6T validation must include the exhaustive command.",
);

console.log("PASS fullMatchCloseGameDistributionCalibration");
