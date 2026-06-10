import type { TeamId } from "../../../core/ids";
import type { Rating, TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import { MovementType } from "../../movement";
import { RecoveryStatus, TacticalStatus, type PlayerMatchState } from "../../players";
import { getZonesBetween, getZoneDistance } from "../coordinates";
import { clampRating } from "../utils";
import type { InfluenceSourcePlayer, ProjectedArrival } from "./influenceCell";

export interface PlayerInfluenceProjection {
  readonly player: PlayerMatchState;
  readonly teamId: TeamId;
  readonly zone: ZoneId;
  readonly currentInfluence: Rating;
  readonly projectedInfluence: Rating;
  readonly pathInfluence: Rating;
  readonly projectedArrival: ProjectedArrival | null;
  readonly source: InfluenceSourcePlayer;
}

function arrivalWeight(deltaTicks: number): number {
  if (deltaTicks <= 0) {
    return 1;
  }

  if (deltaTicks === 1) {
    return 0.82;
  }

  if (deltaTicks <= 3) {
    return 0.52;
  }

  return 0.2;
}

function roleRadiusBoost(player: PlayerMatchState): number {
  if (player.tacticalStatus === TacticalStatus.Pressing) {
    return 12;
  }

  if (player.tacticalStatus === TacticalStatus.Covering) {
    return 10;
  }

  if (player.isAvailableReceiver) {
    return 8;
  }

  return 4;
}

function recoveryPenalty(player: PlayerMatchState): number {
  if (player.recoveryStatus === RecoveryStatus.Eliminated) {
    return 24;
  }

  if (player.recoveryStatus === RecoveryStatus.Delayed) {
    return 16;
  }

  if (player.recoveryStatus === RecoveryStatus.Recovering) {
    return 8;
  }

  return 0;
}

function movementProjectionBoost(player: PlayerMatchState): number {
  const movementType = player.activeTrajectory?.movementType;

  if (movementType === MovementType.DepthRun || movementType === MovementType.TransitionSprint) {
    return player.sprinting ? 16 : 10;
  }

  if (movementType === MovementType.PressStep || movementType === MovementType.LooseBallAttack) {
    return 12;
  }

  if (movementType === MovementType.RecoveryRun || movementType === MovementType.CoverStep) {
    return 8;
  }

  return 4;
}

function playerBaseInfluence(player: PlayerMatchState): number {
  const derived = player.derivedAttributes;
  const attributes =
    derived === undefined
      ? 0
      : derived.spacingQuality * 0.06 +
        derived.pressReading * 0.06 +
        derived.recoveryRange * 0.05 +
        derived.supportTiming * 0.04 +
        derived.tacticalDiscipline * 0.03;

  return (
    (player.hasBall ? 34 : 20) +
    roleRadiusBoost(player) +
    movementProjectionBoost(player) +
    player.intentUrgency * 0.08 +
    attributes -
    recoveryPenalty(player)
  );
}

function perceptionInfluenceMultiplier(player: PlayerMatchState, zone: ZoneId): number {
  const perception = player.perception;

  if (perception === null) {
    return 0.82;
  }

  const blindPenalty = player.blindSideZones.includes(zone) ? 0.34 : 0;
  const confidence = player.perceptionConfidence / 100;
  const recognition = player.pressureRecognition / 100;
  const delayPenalty = player.reactionDelayTicks * 0.08;

  return Math.max(0.28, Math.min(1.08, 0.36 + confidence * 0.38 + recognition * 0.26 - blindPenalty - delayPenalty));
}

export function projectPlayerInfluence(input: {
  readonly player: PlayerMatchState;
  readonly zone: ZoneId;
  readonly tick: TacticalTick;
}): PlayerInfluenceProjection {
  const currentDistance = getZoneDistance(input.player.zone, input.zone);
  const targetZone = input.player.activeTrajectory?.targetZone ?? input.player.zone;
  const targetDistance = getZoneDistance(targetZone, input.zone);
  const pathZones = input.player.activeTrajectory === null
    ? []
    : getZonesBetween({
        from: input.player.activeTrajectory.originZone,
        to: input.player.activeTrajectory.targetZone,
      });
  const onPath = pathZones.includes(input.zone);
  const arrivalTick = input.player.estimatedArrivalTick;
  const deltaTicks = arrivalTick === null ? 99 : Math.max(0, arrivalTick - input.tick);
  const base = playerBaseInfluence(input.player);
  const perceptionMultiplier = perceptionInfluenceMultiplier(input.player, input.zone);
  const currentInfluence = clampRating((base - currentDistance * 15) * perceptionMultiplier);
  const projectedInfluence = clampRating(((base + movementProjectionBoost(input.player)) * arrivalWeight(deltaTicks) - targetDistance * 12) * perceptionMultiplier);
  const pathInfluence = onPath ? clampRating((base * 0.55 + input.player.intentUrgency * 0.18) * arrivalWeight(deltaTicks + 1) * perceptionMultiplier) : 0;
  const projectedArrival =
    input.player.activeTrajectory === null
      ? null
      : {
          teamId: input.player.teamId,
          playerId: input.player.playerId,
          playerInitials: input.player.roleInitials,
          zone: input.player.activeTrajectory.targetZone,
          arrivalTick: input.player.activeTrajectory.expectedArrivalTick,
          arrivalDeltaTicks: deltaTicks,
          influenceValue: projectedInfluence,
          movementType: input.player.activeTrajectory.movementType,
          sprinting: input.player.sprinting,
        };

  return {
    player: input.player,
    teamId: input.player.teamId,
    zone: input.zone,
    currentInfluence,
    projectedInfluence,
    pathInfluence,
    projectedArrival,
    source: {
      playerId: input.player.playerId,
      teamId: input.player.teamId,
      initials: input.player.roleInitials,
      currentZone: input.player.zone,
      targetZone: input.player.activeTrajectory?.targetZone ?? null,
      intent: input.player.primaryIntent?.type ?? "NONE",
      movementType: input.player.activeTrajectory?.movementType ?? null,
      arrivalTick,
      currentInfluence,
      projectedInfluence,
      perceptionConfidence: input.player.perceptionConfidence,
      pressureRecognition: input.player.pressureRecognition,
      blindSideExposure: input.player.blindSideExposure,
      reactionDelayTicks: input.player.reactionDelayTicks,
    },
  };
}
