import type { MatchId, SequenceId, TeamId, PlayerId } from "../core/ids";
import type { Rating, TacticalTick } from "../core/ratings";
import type { ZoneId } from "../core/zones";
import type { MatchEvent } from "../reports/types";
import type { TeamState } from "./team";

export enum MatchPhase {
  NotStarted = "not_started",
  InProgress = "in_progress",
  Finished = "finished",
}

export enum SequenceType {
  BuildUpUnderPressure = "build_up_under_pressure",
  OffensiveConstruction = "offensive_construction",
  OffensiveTransition = "offensive_transition",
  CoordinatedPressing = "coordinated_pressing",
  Finishing = "finishing",
  Reset = "reset",
}

export enum PressureLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export interface ScoreState {
  readonly home: number;
  readonly away: number;
}

export interface MomentumState {
  readonly teamId: TeamId | null;
  readonly intensity: Rating;
  readonly chaos: Rating;
}

export interface SequenceState {
  readonly id: SequenceId;
  readonly type: SequenceType;
  readonly dangerLevel: Rating;
  readonly pressureLevel: PressureLevel;
  readonly activeZone: ZoneId;
  readonly involvedPlayerIds: readonly PlayerId[];
}

export interface MatchState {
  readonly id: MatchId;
  readonly phase: MatchPhase;
  readonly tick: TacticalTick;
  readonly score: ScoreState;
  readonly homeTeam: TeamState;
  readonly awayTeam: TeamState;
  readonly possessionTeamId: TeamId;
  readonly currentSequence: SequenceState;
  readonly tempo: Rating;
  readonly chaos: Rating;
  readonly momentum: MomentumState;
  readonly events: readonly MatchEvent[];
}
