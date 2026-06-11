import type { MatchInput } from "../../contracts/engineToCoach";
import type { MiniMatchInputAdapterResult } from "../adapters/matchInputToMiniMatch";

export type RosterToMiniMatchGapAnalysis = {
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly spatialContextAdapterExists: boolean;
  readonly rosterCanBecomeSpatialContext: boolean;
  readonly workbenchPositionsCanSeedSpatialContext: boolean;
  readonly miniMatchConsumesSpatialContextMetadata: "YES" | "PARTIAL" | "NO";
  readonly attributeInfluenceLayerExists: boolean;
  readonly routeRankingAttributeInfluenceMode: "metadata_only" | "candidate_modifier" | "selection_driving";
  readonly remainingPrototypeDominance: "HIGH" | "MEDIUM" | "LOW";
  readonly rosterDrivesMiniMatchPlayerPositions: boolean;
  readonly startersDriveActivePlayers: boolean;
  readonly playerRolesDriveActionResolution: boolean;
  readonly visibleAttributesDriveRouteRanking: "YES" | "PARTIAL" | "NO";
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
    attributeInfluenceLayerExists: true,
    routeRankingAttributeInfluenceMode: "metadata_only",
    remainingPrototypeDominance: "HIGH",
    rosterDrivesMiniMatchPlayerPositions: true,
    startersDriveActivePlayers: true,
    playerRolesDriveActionResolution: false,
    visibleAttributesDriveRouteRanking: "PARTIAL",
    tacticalPlanFullyDrivesTeamShape: false,
    prototypesStillDominant: true,
    lostPlayerIdentity: rosterPlayerIds.filter((playerId) => !miniMatchPrototypeIds.includes(playerId)),
    documentedGaps: [
      "adaptMatchInputToMiniMatch maps official teams to CONTROL/BLITZ PrototypeTeamDefinition objects.",
      "Sprint 2S can convert TeamSnapshot.roster into typed SpatialTeamContext.",
      "Sprint 2S can seed SpatialTeamContext positions from workbench truth.",
      "MiniMatchInput can carry SpatialMatchContext metadata and bounded route attribute influence summaries.",
      "PlayerSnapshot roles and attributes now adjust candidate metadata, but final selection is not yet end-to-end attribute-driven.",
      "TacticalPlan contributes tags and context, but not full spatial team shape resolution.",
      "CONTROL/BLITZ prototype teams remain a dominant source of mini-match tactical behavior.",
    ],
    recommendations: [
      "CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER",
      "CONFIRM_MINIMATCH_SPATIAL_CONTEXT_PARTIAL",
      "CONFIRM_ROUTE_ATTRIBUTE_INFLUENCE_LAYER",
      "CONFIRM_ROUTE_RANKING_ATTRIBUTE_GAP_REDUCED",
      "PREPARE_SELECTION_DRIVING_ATTRIBUTE_RANKING",
    ],
  };
}
