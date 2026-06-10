export const DEFAULT_TICKS_PER_SECOND = 5;

export interface MatchClock {
  readonly tickRate: number;
  readonly elapsedSeconds: number;
}

export function createMatchClock(tickRate: number = DEFAULT_TICKS_PER_SECOND): MatchClock {
  if (!Number.isFinite(tickRate) || tickRate <= 0) {
    throw new Error("Match clock tick rate must be greater than zero.");
  }

  return {
    tickRate,
    elapsedSeconds: 0,
  };
}

export function advanceMatchClock(clock: MatchClock, ticks: number = 1): MatchClock {
  return {
    tickRate: clock.tickRate,
    elapsedSeconds: clock.elapsedSeconds + ticks / clock.tickRate,
  };
}
