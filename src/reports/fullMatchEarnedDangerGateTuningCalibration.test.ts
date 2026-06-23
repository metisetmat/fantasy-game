import {
  buildFullMatchEarnedDangerGateTuningModel,
  renderFullMatchEarnedDangerGateTuning6ODoc,
  renderFullMatchEarnedDangerGateTuning6OValidation,
} from "./fullMatchEarnedDangerGateTuningCalibration";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchEarnedDangerGateTuningModel();
const doc = renderFullMatchEarnedDangerGateTuning6ODoc(model);
const validation = renderFullMatchEarnedDangerGateTuning6OValidation(model);

assertTest(model.scope === "FULL_MATCH_EARNED_DANGER_GATE_TUNING", "6O model scope must be official.");
assertTest(model.version === "EARNED_DANGER_GATE_TUNING_6O", "6O model version must be stable.");
assertTest(model.baselineVersion === "EARNED_DANGER_GATE_6N", "6O must use 6N as the baseline.");
assertTest(model.matchCount >= 50, "6O calibration must run at least 50 matches.");
assertTest(model.observedGateRowCount > 0, "6O must observe real earned-danger gate rows.");
assertTest(model.earnedDangerRateAfter > 0, "6O must reintroduce some earned danger.");
assertTest(model.automaticDangerSuspicionRateAfter <= 5, "6O must not reopen automatic danger.");
assertTest(model.scoreFromScoreChangeAllRuns, "6O official score must come from score_change consequences.");
assertTest(model.officialPathConnectedAllRuns, "6O official path must stay connected.");
assertTest(model.calibrationsAppliedAllRuns, "6O calibration must be connected in every run.");
assertTest(!model.scoreCapApplied, "6O must not apply score caps.");
assertTest(!model.postHocRewriteApplied, "6O must not rewrite scores.");
assertTest(!model.scoringEventsDeleted, "6O must not delete scoring events.");
assertTest(!model.forcedOpponentScoreApplied, "6O must not force opponent scores.");
assertTest(!model.forcedTrailingTeamScoreApplied, "6O must not force trailing-team scores.");
assertTest(!model.MatchBonusEventChanged, "6O must not mutate MatchBonusEvent.");
assertTest(model.batchLiveSeparationPreserved, "6O batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "6O persistence and SQLite must not score.");
assertTest(model.unknownScoringFamilyCount === 0, "6O UNKNOWN scoring family must not leak.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "6O PENALTY_SHOT must not leak.");
assertTest(doc.includes("Baseline 6N Summary"), "6O doc must include the 6N baseline.");
assertTest(doc.includes("Gate Tuning Audit Summary"), "6O doc must include gate tuning audit summary.");
assertTest(doc.includes("Allowed Danger Reason Code Distribution"), "6O doc must include allowed reasons.");
assertTest(doc.includes("Denied Danger Reason Code Distribution"), "6O doc must include denied reasons.");
assertTest(doc.includes("Root Cause Audit Consistency"), "6O doc must include root-cause consistency.");
assertTest(validation.includes("Status: PASS"), "6O validation must pass.");
assertTest(validation.includes("Explicit Exhaustive Test Command"), "6O validation must include exhaustive command.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");

console.log("fullMatchEarnedDangerGateTuningCalibration tests passed.");
