import { DEFAULT_TICKS_PER_SECOND } from "./matchClock";

export interface SimulationConfig {
  readonly tickRate: number;
  readonly miniMatchDurationTicks: number;
  readonly seed: number;
  readonly worldStateMode: "tick-based wrapper";
  readonly legacyActionAdapterEnabled: boolean;
}

export const DEFAULT_SIMULATION_SEED = 7_301_991;

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  tickRate: DEFAULT_TICKS_PER_SECOND,
  miniMatchDurationTicks: 60,
  seed: DEFAULT_SIMULATION_SEED,
  worldStateMode: "tick-based wrapper",
  legacyActionAdapterEnabled: true,
};
