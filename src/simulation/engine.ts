import type { MatchState } from "../models/match";
import type { TeamState } from "../models/team";

export interface MatchSetup {
  readonly homeTeam: TeamState;
  readonly awayTeam: TeamState;
}

export interface EngineConfiguration {
  readonly tacticalTicksPerMatch: number;
  readonly enableNarrativeEvents: boolean;
}

export interface FantasyGameEngine {
  readonly configuration: EngineConfiguration;
  createInitialMatchState(setup: MatchSetup): MatchState;
}
