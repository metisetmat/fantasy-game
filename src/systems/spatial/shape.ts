import { LongitudinalZone, LateralCorridor } from "../../core/zones";
import type { Rating } from "../../core/ratings";
import { PlayerRole } from "../../models/player";
import type { ShapeState } from "../../models/tactics";
import { TacticalStyle } from "../../models/tactics";
import type { CorridorBand, SpatialTeamContext } from "./types";
import { averageRatings, clampRating, createZones } from "./utils";

function getAverageFreshness(context: SpatialTeamContext): Rating {
  return averageRatings(context.players.map((player) => player.fatigue.freshness));
}

function getRoleSupport(context: SpatialTeamContext, roles: readonly PlayerRole[]): Rating {
  const supportedPlayers = context.players.filter((player) => roles.includes(player.role));
  return clampRating((supportedPlayers.length / Math.max(context.players.length, 1)) * 100);
}

function getOffensiveBand(context: SpatialTeamContext): CorridorBand {
  const verticality = context.tacticalInstructions.offensive.verticality;
  const usesWideTransitionLanes = verticality >= 70;

  const longitudinalZones =
    verticality >= 70
      ? [LongitudinalZone.Midfield, LongitudinalZone.OffensivePressure, LongitudinalZone.FinishingZone]
      : [LongitudinalZone.BuildOut, LongitudinalZone.Midfield, LongitudinalZone.OffensivePressure];

  const lateralCorridors =
    context.tacticalInstructions.offensive.collectiveness >= 65 || usesWideTransitionLanes
      ? [
          LateralCorridor.LeftCorridor,
          LateralCorridor.LeftHalfSpace,
          LateralCorridor.CentralAxis,
          LateralCorridor.RightHalfSpace,
          LateralCorridor.RightCorridor,
        ]
      : [LateralCorridor.LeftHalfSpace, LateralCorridor.CentralAxis, LateralCorridor.RightHalfSpace];

  return {
    longitudinalZones,
    lateralCorridors,
  };
}

function getDefensiveBand(context: SpatialTeamContext): CorridorBand {
  const blockHeight = context.tacticalInstructions.defensive.blockHeight;
  const discipline = context.collectiveProperties.tacticalDiscipline;
  const protectsFiveCorridors = discipline < 45 || context.tacticalStyle === TacticalStyle.ChaosHunters;

  const longitudinalZones =
    blockHeight >= 70
      ? [LongitudinalZone.Midfield, LongitudinalZone.OffensivePressure]
      : blockHeight <= 35
        ? [LongitudinalZone.DeepDefense, LongitudinalZone.BuildOut, LongitudinalZone.Midfield]
        : [LongitudinalZone.BuildOut, LongitudinalZone.Midfield, LongitudinalZone.OffensivePressure];

  const lateralCorridors = protectsFiveCorridors
    ? [
        LateralCorridor.LeftCorridor,
        LateralCorridor.LeftHalfSpace,
        LateralCorridor.CentralAxis,
        LateralCorridor.RightHalfSpace,
        LateralCorridor.RightCorridor,
      ]
    : [LateralCorridor.LeftHalfSpace, LateralCorridor.CentralAxis, LateralCorridor.RightHalfSpace];

  return {
    longitudinalZones,
    lateralCorridors,
  };
}

export function generateOffensiveShape(context: SpatialTeamContext): ShapeState {
  const band = getOffensiveBand(context);
  const freshness = getAverageFreshness(context);
  const creativeSupport = getRoleSupport(context, [
    PlayerRole.HookLink,
    PlayerRole.TempoHalf,
    PlayerRole.Playmaker,
    PlayerRole.SpaceHunter,
  ]);

  const widthOccupation = clampRating(
    context.tacticalInstructions.offensive.collectiveness * 0.35 +
      context.tacticalInstructions.offensive.verticality * 0.2 +
      context.collectiveProperties.collectiveMobility * 0.2 +
      creativeSupport * 0.15 +
      freshness * 0.1,
  );

  const compactness = clampRating(
    100 - widthOccupation * 0.55 + context.collectiveProperties.cohesion * 0.25,
  );

  return {
    compactness,
    widthOccupation,
    axisProtection: clampRating(context.collectiveProperties.tacticalDiscipline * 0.65),
    diagonalSupport: clampRating(
      context.collectiveProperties.collectiveReading * 0.45 +
        context.collectiveProperties.cohesion * 0.25 +
        creativeSupport * 0.3,
    ),
    occupiedZones: createZones(band.longitudinalZones, band.lateralCorridors),
  };
}

export function generateDefensiveShape(context: SpatialTeamContext): ShapeState {
  const band = getDefensiveBand(context);
  const freshness = getAverageFreshness(context);
  const defensiveRoleSupport = getRoleSupport(context, [
    PlayerRole.LeftAnchor,
    PlayerRole.RightAnchor,
    PlayerRole.MobileLock,
    PlayerRole.FreeSafety,
  ]);

  const compactness = clampRating(
    context.collectiveProperties.tacticalDiscipline * 0.3 +
      context.collectiveProperties.cohesion * 0.25 +
      context.collectiveProperties.defensiveTransition * 0.2 +
      defensiveRoleSupport * 0.15 +
      freshness * 0.1 -
      context.structuralShiftDelay * 0.2,
  );

  return {
    compactness,
    widthOccupation: clampRating(100 - compactness * 0.45 + context.tacticalInstructions.defensive.pressingIntensity * 0.2),
    axisProtection: clampRating(
      context.collectiveProperties.tacticalDiscipline * 0.35 +
        context.collectiveProperties.resilience * 0.3 +
        defensiveRoleSupport * 0.25 +
        freshness * 0.1,
    ),
    diagonalSupport: clampRating(context.collectiveProperties.collectiveReading * 0.4 + compactness * 0.35),
    occupiedZones: createZones(band.longitudinalZones, band.lateralCorridors),
  };
}
