import { buildFullMatchRouteFamilyMixActivationModel } from "./fullMatchRouteFamilyMixActivation";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const model = buildFullMatchRouteFamilyMixActivationModel(8);

assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");
assertTest(model.routeFamilyCompetitionCanSelectNonShot, "route family competition must select non-shot routes.");
assertTest(model.routeFamilyCompetitionCanSelectContinuation, "route family competition must select continuation routes.");
assertTest(model.conversionGeneratedOnlyAfterTry, "conversion routes must be generated only after try routes.");
assertTest(model.conversionWithoutTryBlocked, "conversion without try must remain blocked.");
assertTest(model.batchProof.matchesWithTryOrDrop > 0, "try/drop routes must appear in official batch sample.");
assertTest(model.batchProof.matchesWithMultipleScoringFamilies > 0, "multiple scoring families must appear.");
assertTest(model.batchProof.matchesWithOnlyShotGoals < model.batchProof.matchCount, "route mix cannot remain 100% SHOT_ONLY.");
assertTest(model.batchProof.scoreFromScoreChangeAllRuns, "score must come from official score_change events.");
assertTest(model.batchProof.noUnknown, "UNKNOWN scoring family must not appear.");
assertTest(model.batchProof.noPenaltyLeakage, "PENALTY_SHOT leakage must not appear.");

console.log("fullMatchRouteFamilyMixActivation tests passed.");
