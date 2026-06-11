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
  assertTest(analysis.spatialContextAdapterExists, "spatial context adapter must be reported as available.");
  assertTest(analysis.rosterCanBecomeSpatialContext, "TeamSnapshot.roster must be reported as convertible to SpatialTeamContext.");
  assertTest(analysis.workbenchPositionsCanSeedSpatialContext, "workbench positions must be reported as able to seed spatial context.");
  assertTest(analysis.miniMatchConsumesSpatialContextMetadata === "PARTIAL", "mini-match spatial context consumption must be PARTIAL.");
  assertTest(analysis.rosterDrivesMiniMatchPlayerPositions, "TeamSnapshot.roster must now drive adapter-level spatial player context.");
  assertTest(analysis.startersDriveActivePlayers, "TeamSnapshot.starters must now drive adapter-level active player IDs.");
  assertTest(!analysis.playerRolesDriveActionResolution, "PlayerSnapshot.role must not be reported as driving action resolution yet.");
  assertTest(analysis.attributeInfluenceLayerExists, "attribute influence layer must be reported as available.");
  assertTest(analysis.routeRankingAttributeInfluenceMode === "candidate_modifier", "attribute influence mode must be candidate_modifier.");
  assertTest(analysis.visibleAttributesDriveRouteRanking === "PARTIAL", "visible attributes must reduce ranking gap to PARTIAL.");
  assertTest(analysis.remainingPrototypeDominance === "HIGH", "remaining prototype dominance must be reported honestly.");
  assertTest(analysis.prototypesStillDominant, "CONTROL/BLITZ prototypes must be identified as dominant.");
  assertTest(analysis.lostPlayerIdentity.length > 0, "lost official player identity must be reported.");

  return [
    "roster-to-mini-match gap is PARTIAL",
    "TeamSnapshot roster and starters now drive adapter-level spatial context",
    "workbench positions can seed spatial context",
    "route attribute influence layer exists",
    "visible attributes drive candidate_modifier route ranking partially",
    "prototype dominance is still documented",
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
