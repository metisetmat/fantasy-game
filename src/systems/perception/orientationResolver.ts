import type { Rating, TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import { getAllZoneCoordinates, getZoneCoordinate, getZoneDistance } from "../spatial/coordinates";
import { clampRating } from "../spatial/utils";
import { calculateBodyTurnSpeed, calculateOrientationDelayTicks } from "./bodyTurn";
import { facingDirectionFromVector, FacingDirection, vectorForFacingDirection } from "./facingDirection";
import type { PerceptionState, PlayerOrientation } from "./playerOrientation";
import { ScanningState } from "./playerOrientation";
import { updateAwarenessMemory } from "./awarenessMemory";
import { calculateScanQuality, getSeenPlayers, selectScanningState } from "./scanning";

function facingAngle(direction: FacingDirection): number {
  switch (direction) {
    case FacingDirection.East:
      return 0;
    case FacingDirection.NorthEast:
      return 45;
    case FacingDirection.North:
      return 90;
    case FacingDirection.NorthWest:
      return 135;
    case FacingDirection.West:
      return 180;
    case FacingDirection.SouthWest:
      return 225;
    case FacingDirection.South:
      return 270;
    case FacingDirection.SouthEast:
      return 315;
  }
}

function fallbackFacingDirection(player: PlayerMatchState, ballZone: ZoneId): FacingDirection {
  const playerCoordinate = getZoneCoordinate(player.zone);
  const ballCoordinate = getZoneCoordinate(ballZone);

  return facingDirectionFromVector({
    dx: ballCoordinate.x - playerCoordinate.x,
    dy: ballCoordinate.y - playerCoordinate.y,
    fallback: FacingDirection.East,
  });
}

function blindSideZones(input: {
  readonly player: PlayerMatchState;
  readonly direction: FacingDirection;
  readonly awarenessRadius: number;
}): readonly ZoneId[] {
  const origin = getZoneCoordinate(input.player.zone);
  const vector = vectorForFacingDirection(input.direction);

  return getAllZoneCoordinates()
    .filter((coordinate) => getZoneDistance(input.player.zone, coordinate.zone) <= input.awarenessRadius + 1)
    .filter((coordinate) => {
      const dx = coordinate.x - origin.x;
      const dy = coordinate.y - origin.y;
      const dot = dx * vector.dx + dy * vector.dy;

      return dot < -0.25;
    })
    .map((coordinate) => coordinate.zone);
}

function weakSideAwareness(input: {
  readonly scanningState: ScanningState;
  readonly scanQuality: Rating;
  readonly memoryCertainty: Rating;
  readonly pressure: Rating;
}): Rating {
  const stateBoost = input.scanningState === ScanningState.ScanningWeakSide ? 20 : input.scanningState === ScanningState.Overloaded ? -18 : 0;

  return clampRating(input.scanQuality * 0.52 + input.memoryCertainty * 0.34 + stateBoost - input.pressure * 0.08);
}

export function resolvePlayerPerception(input: {
  readonly player: PlayerMatchState;
  readonly allPlayers: readonly PlayerMatchState[];
  readonly ballZone: ZoneId;
  readonly tick: TacticalTick;
  readonly chaos: Rating;
  readonly previous?: PerceptionState | null;
}): PerceptionState {
  const visible = input.player.visibleAttributes;
  const derived = input.player.derivedAttributes;
  const vision = visible?.vision ?? 62;
  const composure = visible?.composure ?? 62;
  const speed = visible?.speed ?? 62;
  const discipline = derived?.tacticalDiscipline ?? composure;
  const scanQuality = calculateScanQuality({
    vision,
    composure,
    tacticalDiscipline: discipline,
    fatigue: input.player.fatigue,
    pressure: input.player.pressure,
    chaos: input.chaos,
  });
  const fallback = fallbackFacingDirection(input.player, input.ballZone);
  const movementFacing =
    input.player.movementVector === null
      ? fallback
      : facingDirectionFromVector({
          dx: input.player.movementVector.dx,
          dy: input.player.movementVector.dy,
          fallback,
        });
  const scanningState = selectScanningState({
    role: input.player.role,
    hasBall: input.player.hasBall,
    pressure: input.player.pressure,
    chaos: input.chaos,
    ballZone: input.ballZone,
    tick: input.tick,
  });
  const awarenessRadius = Math.max(1, Math.min(4, Math.round(1 + vision / 35 + composure / 70 - input.player.fatigue / 80)));
  const seenPlayers = getSeenPlayers({
    player: input.player,
    allPlayers: input.allPlayers,
    awarenessRadius,
    scanQuality,
  });
  const memory = updateAwarenessMemory({
    previous: input.previous?.orientation.memory ?? null,
    seenPlayers,
    ballZone: input.ballZone,
    threatZones: [input.ballZone],
    overloadZone: input.player.intentTargetZone,
    scanQuality,
    tick: input.tick,
    chaos: input.chaos,
  });
  const bodyTurnSpeed = calculateBodyTurnSpeed({
    speed,
    composure,
    fatigue: input.player.fatigue,
    sprinting: input.player.sprinting,
    movementVector: input.player.movementVector,
  });
  const reactionDelayTicks = calculateOrientationDelayTicks({
    bodyTurnSpeed,
    pressure: input.player.pressure,
    sprinting: input.player.sprinting,
    chaos: input.chaos,
  });
  const blindZones = blindSideZones({
    player: input.player,
    direction: movementFacing,
    awarenessRadius,
  });
  const missedRunnerIds = input.allPlayers
    .filter((candidate) => candidate.teamId !== input.player.teamId)
    .filter((candidate) => blindZones.includes(candidate.zone))
    .filter((candidate) => !seenPlayers.includes(candidate.playerId))
    .map((candidate) => candidate.playerId);
  const pressureRecognition = clampRating(scanQuality * 0.46 + memory.certainty * 0.32 + (input.player.pressure >= 70 ? -12 : 6));
  const weakAwareness = weakSideAwareness({
    scanningState,
    scanQuality,
    memoryCertainty: memory.certainty,
    pressure: input.player.pressure,
  });
  const blindSideExposure = clampRating(100 - weakAwareness * 0.46 - pressureRecognition * 0.24 + reactionDelayTicks * 8 + missedRunnerIds.length * 6);
  const orientationConfidence = clampRating(scanQuality * 0.48 + bodyTurnSpeed * 0.28 + memory.certainty * 0.24 - reactionDelayTicks * 4);
  const orientation: PlayerOrientation = {
    playerId: input.player.playerId,
    facingDirection: movementFacing,
    facingAngle: facingAngle(movementFacing),
    bodyTurnSpeed,
    currentFocus: input.ballZone,
    scanningState,
    awarenessRadius,
    blindSideZones: blindZones,
    recentSeenPlayers: seenPlayers,
    recentSeenBallState: input.ballZone,
    orientationConfidence,
    lastScanTick: input.tick,
    awarenessDecay: clampRating(100 - memory.certainty),
    memory,
  };
  const scanEvents = [
    `${input.player.roleInitials} ${scanningState} scan quality ${scanQuality}/100`,
    ...(missedRunnerIds.length === 0 ? [] : [`${input.player.roleInitials} blind-side missed ${missedRunnerIds.length} runner(s)`]),
    ...(reactionDelayTicks === 0 ? [] : [`${input.player.roleInitials} orientation delay ${reactionDelayTicks} tick(s)`]),
  ];

  return {
    orientation,
    scanFreshnessTicks: 0,
    perceptionConfidence: orientationConfidence,
    weakSideAwareness: weakAwareness,
    pressureRecognition,
    blindSideExposure,
    reactionDelayTicks,
    missedRunnerIds,
    scanEvents,
  };
}
