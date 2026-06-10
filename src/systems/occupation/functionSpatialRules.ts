import { LateralCorridor, LongitudinalZone, createZoneId, type ZoneId } from "../../core/zones";
import { OccupationFunction } from "./occupationTypes";
import { zoneColumn, type FunctionalOccupationContext } from "./occupationContext";
import type { PlayerFunctionalOccupation } from "./occupationTypes";

const COLUMNS = [
  LongitudinalZone.DefensiveTryZone,
  LongitudinalZone.DeepDefense,
  LongitudinalZone.BuildOut,
  LongitudinalZone.Midfield,
  LongitudinalZone.OffensivePressure,
  LongitudinalZone.FinishingZone,
  LongitudinalZone.OffensiveTryZone,
] as const;

function clampColumn(column: number): number {
  return Math.max(1, Math.min(7, column));
}

function columnToLongitudinal(column: number): LongitudinalZone {
  return COLUMNS[clampColumn(column) - 1] ?? LongitudinalZone.Midfield;
}

function lane(zone: string): LateralCorridor {
  const value = zone.split("-")[1];

  return Object.values(LateralCorridor).includes(value as LateralCorridor)
    ? (value as LateralCorridor)
    : LateralCorridor.CentralAxis;
}

function zone(column: number, corridor: LateralCorridor): ZoneId {
  return createZoneId(columnToLongitudinal(column), corridor);
}

function attackingStep(context: FunctionalOccupationContext): 1 | -1 {
  return context.attackingDirection === "LEFT_TO_RIGHT" ? 1 : -1;
}

function ballSideWidth(ballLane: LateralCorridor): LateralCorridor {
  if (ballLane === LateralCorridor.LeftCorridor) {
    return LateralCorridor.LeftCorridor;
  }

  if (ballLane === LateralCorridor.LeftHalfSpace) {
    return LateralCorridor.LeftHalfSpace;
  }

  if (ballLane === LateralCorridor.RightCorridor) {
    return LateralCorridor.RightCorridor;
  }

  if (ballLane === LateralCorridor.RightHalfSpace) {
    return LateralCorridor.RightHalfSpace;
  }

  return LateralCorridor.LeftHalfSpace;
}

function weakSideHalfSpace(ballLane: LateralCorridor): LateralCorridor {
  if (ballLane === LateralCorridor.LeftCorridor || ballLane === LateralCorridor.LeftHalfSpace) {
    return LateralCorridor.RightHalfSpace;
  }

  if (ballLane === LateralCorridor.RightCorridor || ballLane === LateralCorridor.RightHalfSpace) {
    return LateralCorridor.LeftHalfSpace;
  }

  return LateralCorridor.RightHalfSpace;
}

function adjacentSupportLane(ballLane: LateralCorridor): LateralCorridor {
  if (ballLane === LateralCorridor.LeftCorridor) {
    return LateralCorridor.LeftHalfSpace;
  }

  if (ballLane === LateralCorridor.LeftHalfSpace) {
    return LateralCorridor.CentralAxis;
  }

  if (ballLane === LateralCorridor.RightCorridor) {
    return LateralCorridor.RightHalfSpace;
  }

  if (ballLane === LateralCorridor.RightHalfSpace) {
    return LateralCorridor.CentralAxis;
  }

  return LateralCorridor.LeftHalfSpace;
}

export function candidateZonesForFunction(input: {
  readonly occupation: PlayerFunctionalOccupation;
  readonly context: FunctionalOccupationContext;
}): readonly ZoneId[] {
  const ballColumn = zoneColumn(input.context.ballZone);
  const currentColumn = zoneColumn(input.occupation.zone);
  const ballLane = lane(input.context.ballZone);
  const step = attackingStep(input.context);
  const behind = ballColumn - step;
  const ahead = ballColumn + step;
  const functionType = input.occupation.primaryFunction;

  switch (functionType) {
    case OccupationFunction.WidthFixer:
      return [zone(ahead, ballSideWidth(ballLane)), zone(ahead, ballLane === LateralCorridor.LeftHalfSpace ? LateralCorridor.LeftCorridor : LateralCorridor.RightCorridor)];
    case OccupationFunction.DirectSupport:
    case OccupationFunction.PressureAbsorber:
    case OccupationFunction.TempoController:
      return [zone(ballColumn, adjacentSupportLane(ballLane)), zone(ballColumn, ballLane), zone(behind, adjacentSupportLane(ballLane))];
    case OccupationFunction.SafeRecycle:
    case OccupationFunction.SupportBehindBall:
      return [zone(behind, adjacentSupportLane(ballLane)), zone(behind, LateralCorridor.CentralAxis), zone(behind, weakSideHalfSpace(ballLane))];
    case OccupationFunction.RestDefenseAnchor:
      return [zone(Math.max(2, behind), LateralCorridor.CentralAxis), zone(Math.max(2, behind), LateralCorridor.LeftHalfSpace), zone(Math.max(2, behind), LateralCorridor.RightHalfSpace)];
    case OccupationFunction.HalfSpaceRecycle:
      return [zone(behind, ballLane === LateralCorridor.LeftHalfSpace ? LateralCorridor.LeftHalfSpace : LateralCorridor.RightHalfSpace), zone(behind, adjacentSupportLane(ballLane))];
    case OccupationFunction.ThirdManConnector:
      return [zone(ballColumn, LateralCorridor.CentralAxis), zone(ahead, adjacentSupportLane(ballLane)), zone(behind, weakSideHalfSpace(ballLane))];
    case OccupationFunction.WeakSideConnector:
    case OccupationFunction.SwitchReceiver:
      return [zone(ahead, weakSideHalfSpace(ballLane)), zone(ballColumn, weakSideHalfSpace(ballLane)), zone(behind, weakSideHalfSpace(ballLane))];
    case OccupationFunction.ContactPlatform:
    case OccupationFunction.ScreenSupport:
      return [zone(ahead, ballSideWidth(ballLane)), zone(ahead, LateralCorridor.CentralAxis), zone(ballColumn, adjacentSupportLane(ballLane))];
    case OccupationFunction.PressingTrap:
    case OccupationFunction.PressTrigger:
      return [zone(ballColumn, ballLane), zone(ballColumn, adjacentSupportLane(ballLane)), zone(ahead, ballSideWidth(ballLane))];
    case OccupationFunction.CoverShadowBlocker:
    case OccupationFunction.CounterpressBalancer:
      return [zone(ballColumn, adjacentSupportLane(ballLane)), zone(behind, LateralCorridor.CentralAxis), zone(behind, ballSideWidth(ballLane))];
    case OccupationFunction.TransitionHunter:
    case OccupationFunction.TempoAccelerator:
    case OccupationFunction.DepthThreat:
    case OccupationFunction.ChaosAttacker:
      return [zone(currentColumn, weakSideHalfSpace(ballLane)), zone(ahead, weakSideHalfSpace(ballLane)), zone(ahead, LateralCorridor.CentralAxis)];
    case OccupationFunction.OverloadSupport:
      return [zone(ballColumn, adjacentSupportLane(ballLane)), zone(ahead, ballSideWidth(ballLane))];
  }
}
