import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type DropGoalOutcome = "DROP_GOAL" | "DROP_MISSED" | "DROP_BLOCKED" | "DROP_INVALID";
export type DropGoalTacticalReason =
  | "DEFENSE_SET_LOW"
  | "ADVANTAGE_STATE"
  | "BROKEN_PLAY_WINDOW"
  | "END_OF_PHASE"
  | "LOW_TRY_ACCESS"
  | "LOW_SHOT_QUALITY"
  | "CENTRAL_PRESSURE_RELEASE"
  | "UNKNOWN";

export interface DropGoalScoringRule {
  readonly actionType: DropGoalOutcome;
  readonly pointValue: number;
  readonly activeInVersion: "V2_DROP_FOUNDATION";
}

export interface DropGoalAttemptContext {
  readonly actionId: string;
  readonly matchId: string;
  readonly sequenceId: string;
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly kickerId: PlayerId;
  readonly kickerRole: string;
  readonly ballZone: ZoneId;
  readonly ballLane: string;
  readonly attackingDirection: string;
  readonly phase: string;
  readonly possessionQuality: number;
  readonly ballControlScore: number;
  readonly dropSetupScore: number;
  readonly footSkill: number;
  readonly kickingPower: number;
  readonly kickingAccuracy: number;
  readonly kickingComposure: number;
  readonly pressureLevel: string;
  readonly defenderRushPressure: number;
  readonly blockPressure: number;
  readonly fatiguePenalty: number;
  readonly distanceToPosts: number;
  readonly angleDifficulty: number;
  readonly bodyShapeScore: number;
  readonly timeWindowScore: number;
  readonly candidateScore: number;
  readonly tacticalReason: DropGoalTacticalReason;
  readonly tryAccessQuality: number;
  readonly shotQuality: number;
  readonly recycleSafety: number;
  readonly phaseMomentum: number;
  readonly teamStyle: string;
  readonly scoreContext: string;
  readonly opportunityType: string;
}

export interface DropGoalAttemptResult {
  readonly context: DropGoalAttemptContext;
  readonly resolved: boolean;
  readonly outcome: DropGoalOutcome;
  readonly executionScore: number;
  readonly difficultyThreshold: number;
  readonly scoringAction: "DROP_GOAL" | "NONE";
  readonly pointValue: number;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly possessionAfter: TeamId | "OUT_OF_PLAY" | "CONTESTED";
  readonly restartType: "OPEN_PLAY_CONTINUES" | "RESTART_AFTER_SCORE" | "OUT_OF_PLAY_RESTART" | "CONTESTED_REBOUND";
  readonly legal: boolean;
  readonly legalityReason: string;
  readonly reason: string;
}

export interface DropGoalFoundationSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly batchAttempts: readonly DropGoalAttemptResult[];
  readonly liveAttempts: readonly DropGoalAttemptResult[];
  readonly batchDropOpportunities: number;
  readonly batchDropCandidatesGenerated: number;
  readonly batchDropCandidatesSelected: number;
  readonly batchDropCandidatesRejected: number;
  readonly batchDropAttempts: number;
  readonly batchDropGoals: number;
  readonly batchDropMissed: number;
  readonly batchDropBlocked: number;
  readonly batchDropInvalid: number;
  readonly batchDropSuccessRate: number;
  readonly batchDropPoints: number;
  readonly liveDropOpportunities: number;
  readonly liveDropCandidatesGenerated: number;
  readonly liveDropCandidatesSelected: number;
  readonly liveDropCandidatesRejected: number;
  readonly liveDropAttempts: number;
  readonly liveDropGoals: number;
  readonly liveDropMissed: number;
  readonly liveDropBlocked: number;
  readonly liveDropInvalid: number;
  readonly liveDropPoints: number;
  readonly candidatesByOpportunityType: readonly {
    readonly opportunityType: string;
    readonly count: number;
  }[];
  readonly selectedDropCandidateScoreRange: string;
  readonly rejectedDropCandidateScoreRange: string;
  readonly commonRejectionReasons: readonly string[];
  readonly dropInvalidCount: number;
  readonly recommendation:
    | "KEEP_DROP_MODEL"
    | "KEEP_DROP_MODEL_BUT_MONITOR"
    | "INCREASE_DROP_DIFFICULTY"
    | "REDUCE_DROP_DIFFICULTY"
    | "INCREASE_BLOCKED_DROPS"
    | "REDUCE_BLOCKED_DROPS"
    | "FIX_DROP_LEGALITY"
    | "FIX_DROP_CANDIDATE_SELECTION"
    | "FIX_DROP_SCORING_LINK"
    | "NEEDS_MORE_SAMPLE";
}
