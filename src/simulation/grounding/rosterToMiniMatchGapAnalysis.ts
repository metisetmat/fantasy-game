import type { MatchInput } from "../../contracts/engineToCoach";
import type { MiniMatchInputAdapterResult } from "../adapters/matchInputToMiniMatch";

export type RosterToMiniMatchGapAnalysis = {
  readonly status: "PASS" | "PARTIAL" | "FAIL";
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
    rosterDrivesMiniMatchPlayerPositions: false,
    startersDriveActivePlayers: false,
    playerRolesDriveActionResolution: false,
    visibleAttributesDriveRouteRanking: false,
    tacticalPlanFullyDrivesTeamShape: false,
    prototypesStillDominant: true,
    lostPlayerIdentity: rosterPlayerIds.filter((playerId) => !miniMatchPrototypeIds.includes(playerId)),
    documentedGaps: [
      "adaptMatchInputToMiniMatch maps official teams to CONTROL/BLITZ PrototypeTeamDefinition objects.",
      "Official TeamSnapshot.roster is not converted into mini-match PlayerState positions.",
      "TeamSnapshot starters do not select active mini-match players.",
      "PlayerSnapshot roles and attributes do not yet drive route ranking.",
      "TacticalPlan contributes tags and context, but not full spatial team shape resolution.",
      "CONTROL/BLITZ prototype teams remain the dominant source of mini-match tactical behavior.",
    ],
    recommendations: [
      "CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_GAP",
      "PREPARE_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER",
      "PREPARE_REAL_PLAYER_STATS",
    ],
  };
}
