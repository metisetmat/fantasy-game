import { PlayerRole } from "../../../models/player";
import type { OffensiveSpreadEvaluation, SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import { LaneAvailability } from "../../spatial";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import type { ConstructionSupportEvaluation } from "./types";

const CONSTRUCTION_SUPPORT_ROLES: readonly PlayerRole[] = [
  PlayerRole.TempoHalf,
  PlayerRole.Playmaker,
  PlayerRole.HookLink,
  PlayerRole.ForwardLeader,
  PlayerRole.FreeSafety,
];

function selectSupportRole(team: SpatialTeamContext): PlayerRole {
  const role = CONSTRUCTION_SUPPORT_ROLES.find((candidateRole) =>
    team.players.some((player) => player.role === candidateRole),
  );

  return role ?? PlayerRole.TempoHalf;
}

export interface ConstructionSupportInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly offensiveSpread: OffensiveSpreadEvaluation;
  readonly weakSide: WeakSideEvaluation;
}

export function evaluateConstructionSupport(input: ConstructionSupportInput): ConstructionSupportEvaluation {
  const supportPlayers = input.offensiveTeam.players.filter((player) =>
    CONSTRUCTION_SUPPORT_ROLES.includes(player.role),
  );
  const roleSupport = averageInteractionRatings(
    supportPlayers.map((player) =>
      clampInteractionRating(
        player.attributes.intelligence * 0.28 +
          player.attributes.handPlay * 0.2 +
          player.attributes.footPlayPassingShooting * 0.18 +
          player.attributes.agility * 0.12 +
          player.attributes.mental * 0.12 +
          player.fatigue.freshness * 0.1,
      ),
    ),
  );
  const circulationQuality = clampInteractionRating(
    roleSupport * 0.34 +
      input.offensiveTeam.collectiveProperties.cohesion * 0.24 +
      input.offensiveTeam.collectiveProperties.tacticalDiscipline * 0.18 +
      input.offensiveSpread.widthOccupation * 0.16 +
      (input.weakSide.switchPlayOpportunity === LaneAvailability.Open ? 8 : 0),
  );
  const supportQuality = clampInteractionRating(
    circulationQuality * 0.5 +
      input.offensiveTeam.collectiveProperties.collectiveMobility * 0.2 +
      input.offensiveTeam.collectiveProperties.collectiveReading * 0.2 +
      input.offensiveTeam.tacticalInstructions.offensive.collectiveness * 0.1,
  );

  return {
    supportQuality,
    circulationQuality,
    supportRole: selectSupportRole(input.offensiveTeam),
    breakdown: [
      { label: "role support", value: roleSupport },
      { label: "circulation quality", value: circulationQuality },
      { label: "collective mobility", value: input.offensiveTeam.collectiveProperties.collectiveMobility },
      { label: "collective reading", value: input.offensiveTeam.collectiveProperties.collectiveReading },
      { label: "collectiveness", value: input.offensiveTeam.tacticalInstructions.offensive.collectiveness },
    ],
  };
}
