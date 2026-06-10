import type { MatchInput } from "../../contracts/engineToCoach";
import type { MiniMatchInputAdapterResult } from "../adapters/matchInputToMiniMatch";

export type RosterToMiniMatchGapAnalysis = {
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly spatialContextAdapterExists: boolean;
  readonly rosterCanBecomeSpatialContext: boolean;
  readonly workbenchPositionsCanSeedSpatialContext: boolean;
  readonly miniMatchConsumesSpatialContextMetadata: "YES" | "PARTIAL" | "NO";
  readonly rosterDrivesMiniMatchPlayerPositions: boolean;
  readonly startersDriveActivePlayers: boolean;
  readonly playerRolesDriveActionResolution: boolean;
  readonly visibleAttributesDriveRouteRanking: boolean;
  readonly tacticalPlanFullyDrivesTeamShape: boolean;
  readonly prototypesStillDominant: boolean;
  readonly lostPlayerIdentity: readonly string[];
  readonly documentedGaps: readonly string[];
  readonly recommendations: readonly string[];
};

export function analyzeRosterToMiniMatchGap(input: {
  readonly matchInput: MatchInput;
  readonly adapter: MiniMatchInputAdapterResult;
}): RosterToMiniMatchGapAnalysis {
  const rosterPlayerIds = [
    ...input.matchInput.homeTeam.roster.map((player) => player.playerId),
    ...input.matchInput.awayTeam.roster.map((player) => player.playerId),
  ];
  const miniMatchPrototypeIds = [String(input.adapter.homePrototype.id), String(input.adapter.awayPrototype.id)];

  return {
    status: "PARTIAL",
    spatialContextAdapterExists: true,
    rosterCanBecomeSpatialContext: true,
    workbenchPositionsCanSeedSpatialContext: true,
    miniMatchConsumesSpatialContextMetadata: "PARTIAL",
    rosterDrivesMiniMatchPlayerPositions: true,
    startersDriveActivePlayers: true,
    playerRolesDriveActionResolution: false,
    visibleAttributesDriveRouteRanking: false,
    tacticalPlanFullyDrivesTeamShape: false,
    prototypesStillDominant: true,
    lostPlayerIdentity: rosterPlayerIds.filter((playerId) => !miniMatchPrototypeIds.includes(playerId)),
    documentedGaps: [
      "adaptMatchInputToMiniMatch maps official teams to CONTROL/BLITZ PrototypeTeamDefinition objects.",
      "Sprint 2S can convert TeamSnapshot.roster into typed SpatialTeamContext.",
      "Sprint 2S can seed SpatialTeamContext positions from workbench truth.",
      "MiniMatchInput can carry SpatialMatchContext metadata, but normal action resolution remains prototype-driven.",
      "PlayerSnapshot roles and attributes do not yet drive route ranking.",
      "TacticalPlan contributes tags and context, but not full spatial team shape resolution.",
      "CONTROL/BLITZ prototype teams remain a dominant source of mini-match tactical behavior.",
    ],
    recommendations: [
      "CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER",
      "CONFIRM_MINIMATCH_SPATIAL_CONTEXT_PARTIAL",
      "CONFIRM_ROUTE_RANKING_ATTRIBUTE_GAP",
      "PREPARE_ATTRIBUTE_DRIVEN_ROUTE_RANKING",
    ],
  };
}
