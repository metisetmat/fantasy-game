import type { Rating } from "../../../core/ratings";
import { PlayerRole } from "../../../models/player";
import type { CompactnessEvaluation, SpatialTeamContext } from "../../spatial/types";
import type { InteractionScoreBreakdown } from "../shared/types";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import { applyRecoverySaturationImpact } from "../../structure/recoverySaturation";
import type { PressureEvaluation } from "./evaluatePressure";
import type { TrapEvaluation } from "./evaluateTrap";

export interface PressingEvaluationInput {
  readonly defensiveTeam: SpatialTeamContext;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly pressure: PressureEvaluation;
  readonly trap: TrapEvaluation;
}

export interface PressingEvaluation {
  readonly pressingCapability: Rating;
  readonly defensiveMobility: Rating;
  readonly presserQuality: Rating;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

const PRESSING_ROLES: readonly PlayerRole[] = [
  PlayerRole.MobileLock,
  PlayerRole.SpaceHunter,
  PlayerRole.PowerRunner,
  PlayerRole.ForwardLeader,
];

export function evaluatePressing(input: PressingEvaluationInput): PressingEvaluation {
  const pressingPlayers = input.defensiveTeam.players.filter((player) =>
    PRESSING_ROLES.includes(player.role),
  );
  const presserQuality = averageInteractionRatings(
    pressingPlayers.map((player) =>
      clampInteractionRating(
        player.attributes.intelligence * 0.25 +
          player.attributes.speed * 0.25 +
          player.attributes.agility * 0.2 +
          player.attributes.endurance * 0.15 +
          player.fatigue.freshness * 0.15,
      ),
    ),
  );
  const defensiveMobility = clampInteractionRating(
    input.defensiveTeam.collectiveProperties.collectiveMobility * 0.55 +
      input.defensiveTeam.collectiveProperties.defensiveTransition * 0.25 +
      averageInteractionRatings(pressingPlayers.map((player) => player.fatigue.freshness)) * 0.2,
  );
  const pressingCapability = clampInteractionRating(
    input.defensiveTeam.tacticalInstructions.defensive.pressingIntensity * 0.22 +
      input.defensiveCompactness.overallCompactness * 0.18 +
      defensiveMobility * 0.16 +
      presserQuality * 0.18 +
      input.trap.trapQuality * 0.16 +
      input.pressure.pressureScore * 0.1 -
      applyRecoverySaturationImpact(input.defensiveTeam.recoverySaturation).pressingPenalty,
  );
  const saturationImpact = applyRecoverySaturationImpact(input.defensiveTeam.recoverySaturation);
  const breakdown: readonly InteractionScoreBreakdown[] = [
    { label: "pressing intensity", value: input.defensiveTeam.tacticalInstructions.defensive.pressingIntensity },
    { label: "defensive compactness", value: input.defensiveCompactness.overallCompactness },
    { label: "defensive mobility", value: defensiveMobility },
    { label: "presser quality", value: presserQuality },
    { label: "trap quality", value: input.trap.trapQuality },
    { label: "active-zone pressure", value: input.pressure.pressureScore },
    { label: "recovery saturation penalty", value: -saturationImpact.pressingPenalty },
  ];

  return {
    pressingCapability,
    defensiveMobility,
    presserQuality,
    breakdown,
  };
}
