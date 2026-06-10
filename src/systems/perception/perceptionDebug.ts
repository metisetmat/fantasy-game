import type { PlayerMatchState } from "../players";

export function describePerception(player: PlayerMatchState): string {
  const perception = player.perception;

  if (perception === null) {
    return `${player.roleInitials}: perception unavailable`;
  }

  return `${player.roleInitials} facing ${perception.orientation.facingDirection}, scan freshness ${perception.scanFreshnessTicks} tick(s), weak-side awareness ${perception.weakSideAwareness}/100, pressure recognition ${perception.pressureRecognition}/100, blind-side exposure ${perception.blindSideExposure}/100`;
}

export function describeScanEvents(players: readonly PlayerMatchState[]): readonly string[] {
  return players.flatMap((player) => player.perception?.scanEvents ?? []).slice(0, 8);
}
