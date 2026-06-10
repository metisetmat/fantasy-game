import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type OffensivePossessionStartReason =
  | "KICKOFF"
  | "RESTART"
  | "TURNOVER"
  | "REBOUND_RECOVERY"
  | "SCRAMBLE_RECOVERY"
  | "GK_RECOVERY"
  | "OUT_OF_PLAY_RESTART"
  | "UNKNOWN";

export type OffensivePossessionEndReason =
  | "SHOT_ATTEMPT"
  | "TRY_ATTEMPT"
  | "DROP_ATTEMPT"
  | "SCORE"
  | "TURNOVER"
  | "RECYCLE_END"
  | "OUT_OF_PLAY"
  | "FAILED_PROGRESS"
  | "SIMULATION_END"
  | "UNKNOWN";

export interface OffensivePossession {
  readonly id: string;
  readonly matchId: string;
  readonly possessionTeamId: TeamId;
  readonly startSequenceId: string;
  readonly endSequenceId: string;
  readonly startZone: ZoneId | "UNKNOWN";
  readonly endZone: ZoneId | "UNKNOWN";
  readonly startReason: OffensivePossessionStartReason;
  readonly endReason: OffensivePossessionEndReason;
  readonly actionCount: number;
  readonly reachedDangerPhase: boolean;
  readonly dangerPhaseIds: readonly string[];
  readonly scoringAffordanceIds: readonly string[];
  readonly scoringCandidateIds: readonly string[];
  readonly selectedScoringCandidateIds: readonly string[];
  readonly executedAttemptIds: readonly string[];
  readonly scoringEventIds: readonly string[];
}
