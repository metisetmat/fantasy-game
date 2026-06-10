import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { adaptMatchInputToMiniMatch } from "../adapters/matchInputToMiniMatch";
import { analyzeRosterToMiniMatchGap } from "./rosterToMiniMatchGapAnalysis";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRosterToMiniMatchGapAnalysis(): readonly string[] {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const adapter = adaptMatchInputToMiniMatch(matchInput);
  const analysis = analyzeRosterToMiniMatchGap({ matchInput, adapter });

  assertTest(analysis.status === "PARTIAL", `roster-to-mini-match gap must be PARTIAL, received ${analysis.status}.`);
  assertTest(!analysis.rosterDrivesMiniMatchPlayerPositions, "TeamSnapshot.roster must not be reported as driving mini-match positions yet.");
  assertTest(!analysis.startersDriveActivePlayers, "TeamSnapshot.starters must not be reported as driving active players yet.");
  assertTest(!analysis.playerRolesDriveActionResolution, "PlayerSnapshot.role must not be reported as driving action resolution yet.");
  assertTest(analysis.prototypesStillDominant, "CONTROL/BLITZ prototypes must be identified as dominant.");
  assertTest(analysis.lostPlayerIdentity.length > 0, "lost official player identity must be reported.");

  return [
    "roster-to-mini-match gap is PARTIAL",
    "TeamSnapshot roster and starters do not yet drive mini-match spatial state",
    "prototype dominance is documented",
    "lost player identity is listed",
  ];
}

if (require.main === module) {
  const checks = validateRosterToMiniMatchGapAnalysis();

  console.log("rosterToMiniMatchGapAnalysis tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
