import type { PlayerId } from "../../core/ids";
import type { Rating, TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import { PlayerRole } from "../../models/player";
import type { PlayerMatchState } from "../players";
import { getZoneDistance } from "../spatial/coordinates";
import { clampRating } from "../spatial/utils";
import { ScanningState } from "./playerOrientation";

export function calculateScanQuality(input: {
  readonly vision: Rating;
  readonly composure: Rating;
  readonly tacticalDiscipline: Rating;
  readonly fatigue: Rating;
  readonly pressure: Rating;
  readonly chaos: Rating;
}): Rating {
  return clampRating(
    input.vision * 0.36 +
      input.composure * 0.26 +
      input.tacticalDiscipline * 0.18 +
      20 -
      input.fatigue * 0.14 -
      input.pressure * 0.12 -
      input.chaos * 0.1,
  );
}

export function selectScanningState(input: {
  readonly role: PlayerRole;
  readonly hasBall: boolean;
  readonly pressure: Rating;
  readonly chaos: Rating;
  readonly ballZone: ZoneId;
  readonly tick: TacticalTick;
}): ScanningState {
  if (input.pressure >= 76 || input.chaos >= 76) {
    return ScanningState.Overloaded;
  }

  if (input.hasBall) {
    return input.tick % 3 === 0 ? ScanningState.ScanningSupport : ScanningState.LockedOnBall;
  }

  if (input.role === PlayerRole.GoalkeeperFreeSafety) {
    return input.tick % 2 === 0 ? ScanningState.ScanningDepth : ScanningState.ScanningRebound;
  }

  if (input.role === PlayerRole.SpaceHunter || input.role === PlayerRole.LeftPiston || input.role === PlayerRole.RightPiston) {
    return input.tick % 2 === 0 ? ScanningState.ScanningWeakSide : ScanningState.ScanningDepth;
  }

  return input.tick % 4 === 0 ? ScanningState.ScanningWeakSide : ScanningState.LockedOnBall;
}

export function getSeenPlayers(input: {
  readonly player: PlayerMatchState;
  readonly allPlayers: readonly PlayerMatchState[];
  readonly awarenessRadius: number;
  readonly scanQuality: Rating;
}): readonly PlayerId[] {
  return input.allPlayers
    .filter((candidate) => candidate.playerId !== input.player.playerId)
    .filter((candidate) => getZoneDistance(input.player.zone, candidate.zone) <= input.awarenessRadius + (input.scanQuality >= 76 ? 1 : 0))
    .map((candidate) => candidate.playerId);
}
