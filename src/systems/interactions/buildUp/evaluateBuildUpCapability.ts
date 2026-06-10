import type { Rating } from "../../../core/ratings";
import { PlayerRole } from "../../../models/player";
import type { SpatialTeamContext, WeakSideEvaluation } from "../../spatial/types";
import { LaneAvailability } from "../../spatial/types";
import type { InteractionScoreBreakdown } from "../shared/types";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import type { SupportEvaluation } from "./evaluateSupport";
import { UtilityActionType, selectUtilityRole } from "../../ai/utility";

export interface BuildUpCapabilityInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly support: SupportEvaluation;
  readonly weakSide: WeakSideEvaluation;
}

export interface BuildUpCapabilityEvaluation {
  readonly buildUpCapability: Rating;
  readonly ballCarrierQuality: Rating;
  readonly weakSideOpportunity: Rating;
  readonly pressureResistance: Rating;
  readonly keyBallCarrierRole: PlayerRole;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

const BUILD_UP_ROLES: readonly PlayerRole[] = [
  PlayerRole.TempoHalf,
  PlayerRole.HookLink,
  PlayerRole.FreeSafety,
  PlayerRole.ForwardLeader,
];

function evaluateBallCarrierQuality(input: BuildUpCapabilityInput): Rating {
  const candidatePlayers = input.offensiveTeam.players.filter((player) =>
    BUILD_UP_ROLES.includes(player.role),
  );

  return averageInteractionRatings(
    candidatePlayers.map((player) =>
      clampInteractionRating(
        player.attributes.intelligence * 0.28 +
          player.attributes.handPlay * 0.22 +
          player.attributes.footPlayDribble * 0.18 +
          player.attributes.agility * 0.14 +
          player.attributes.mental * 0.13 +
          player.fatigue.freshness * 0.05,
      ),
    ),
  );
}

function selectKeyBallCarrierRole(input: BuildUpCapabilityInput): PlayerRole {
  return selectUtilityRole({
    players: input.offensiveTeam.players,
    actions: [UtilityActionType.Pass, UtilityActionType.Carry, UtilityActionType.Support, UtilityActionType.Kick],
    tacticalStyle: input.offensiveTeam.tacticalStyle,
    spatialAffordance: input.weakSide.exposure,
    tacticalIntent: input.support.supportQuality,
    pressure: 72,
    risk: input.offensiveTeam.tacticalInstructions.offensive.riskLevel,
    cohesion: input.offensiveTeam.collectiveProperties.cohesion,
  });
}

function evaluateWeakSideOpportunity(weakSide: WeakSideEvaluation): Rating {
  const laneScore =
    weakSide.switchPlayOpportunity === LaneAvailability.Open
      ? 90
      : weakSide.switchPlayOpportunity === LaneAvailability.Contested
        ? 55
        : 20;

  return clampInteractionRating(laneScore * 0.55 + weakSide.exposure * 0.45);
}

export function evaluateBuildUpCapability(
  input: BuildUpCapabilityInput,
): BuildUpCapabilityEvaluation {
  const ballCarrierQuality = evaluateBallCarrierQuality(input);
  const weakSideOpportunity = evaluateWeakSideOpportunity(input.weakSide);
  const pressureResistance = clampInteractionRating(
    input.offensiveTeam.collectiveProperties.cohesion * 0.28 +
      input.offensiveTeam.collectiveProperties.collectiveMobility * 0.18 +
      input.offensiveTeam.collectiveProperties.collectiveReading * 0.2 +
      input.offensiveTeam.collectiveProperties.tacticalDiscipline * 0.18 +
      input.offensiveTeam.collectiveProperties.resilience * 0.16,
  );
  const buildUpCapability = clampInteractionRating(
    ballCarrierQuality * 0.26 +
      pressureResistance * 0.24 +
      input.support.supportQuality * 0.25 +
      weakSideOpportunity * 0.17 +
      (100 - input.offensiveTeam.tacticalInstructions.offensive.riskLevel) * 0.08,
  );
  const breakdown: readonly InteractionScoreBreakdown[] = [
    { label: "ball carrier quality", value: ballCarrierQuality },
    { label: "pressure resistance", value: pressureResistance },
    { label: "support quality", value: input.support.supportQuality },
    { label: "weak side opportunity", value: weakSideOpportunity },
    { label: "risk control", value: 100 - input.offensiveTeam.tacticalInstructions.offensive.riskLevel },
  ];

  return {
    buildUpCapability,
    ballCarrierQuality,
    weakSideOpportunity,
    pressureResistance,
    keyBallCarrierRole: selectKeyBallCarrierRole(input),
    breakdown,
  };
}
