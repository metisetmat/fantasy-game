import type { Rating } from "../../../core/ratings";
import { PlayerRole } from "../../../models/player";
import type { OffensiveSpreadEvaluation, SpatialTeamContext, WeakSideEvaluation } from "../../spatial/types";
import { LaneAvailability } from "../../spatial/types";
import type { InteractionScoreBreakdown } from "../shared/types";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import { UtilityActionType, selectUtilityRole } from "../../ai/utility";

export interface SupportEvaluationInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly offensiveSpread: OffensiveSpreadEvaluation;
  readonly weakSide: WeakSideEvaluation;
}

export interface SupportEvaluation {
  readonly supportQuality: Rating;
  readonly diagonalSupport: Rating;
  readonly weakSideSupport: Rating;
  readonly keySupportRole: PlayerRole;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

const SUPPORT_ROLES: readonly PlayerRole[] = [
  PlayerRole.HookLink,
  PlayerRole.TempoHalf,
  PlayerRole.ForwardLeader,
  PlayerRole.FreeSafety,
];

function evaluateRoleSupport(input: SupportEvaluationInput): Rating {
  const supportPlayers = input.offensiveTeam.players.filter((player) =>
    SUPPORT_ROLES.includes(player.role),
  );

  return averageInteractionRatings(
    supportPlayers.map((player) =>
      clampInteractionRating(
        player.attributes.intelligence * 0.35 +
          player.attributes.agility * 0.2 +
          player.attributes.speed * 0.15 +
          player.attributes.handPlay * 0.15 +
          player.fatigue.freshness * 0.15,
      ),
    ),
  );
}

function selectKeySupportRole(input: SupportEvaluationInput): PlayerRole {
  return selectUtilityRole({
    players: input.offensiveTeam.players,
    actions: [UtilityActionType.Support, UtilityActionType.ProtectZone, UtilityActionType.Pass],
    tacticalStyle: input.offensiveTeam.tacticalStyle,
    spatialAffordance: input.weakSide.exposure,
    tacticalIntent: input.offensiveTeam.tacticalInstructions.offensive.collectiveness,
    pressure: 64,
    risk: input.offensiveTeam.tacticalInstructions.offensive.riskLevel,
    cohesion: input.offensiveTeam.collectiveProperties.cohesion,
  });
}

export function evaluateSupport(input: SupportEvaluationInput): SupportEvaluation {
  const roleSupport = evaluateRoleSupport(input);
  const weakSideSupport =
    input.weakSide.switchPlayOpportunity === LaneAvailability.Open
      ? 85
      : input.weakSide.switchPlayOpportunity === LaneAvailability.Contested
        ? 55
        : 25;
  const diagonalSupport = clampInteractionRating(
    input.offensiveTeam.collectiveProperties.collectiveReading * 0.45 +
      input.offensiveTeam.collectiveProperties.collectiveMobility * 0.25 +
      input.offensiveSpread.widthOccupation * 0.3,
  );
  const supportQuality = clampInteractionRating(
    roleSupport * 0.35 +
      diagonalSupport * 0.3 +
      weakSideSupport * 0.2 +
      input.offensiveTeam.tacticalInstructions.offensive.collectiveness * 0.15,
  );
  const breakdown: readonly InteractionScoreBreakdown[] = [
    { label: "role support", value: roleSupport },
    { label: "diagonal support", value: diagonalSupport },
    { label: "weak side support", value: weakSideSupport },
    { label: "collectiveness", value: input.offensiveTeam.tacticalInstructions.offensive.collectiveness },
  ];

  return {
    supportQuality,
    diagonalSupport,
    weakSideSupport,
    keySupportRole: selectKeySupportRole(input),
    breakdown,
  };
}
