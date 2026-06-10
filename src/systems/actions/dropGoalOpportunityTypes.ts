import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type DropGoalOpportunityType =
  | "SET_DEFENSE_DROP_WINDOW"
  | "PHASE_END_DROP_WINDOW"
  | "BROKEN_PLAY_DROP_WINDOW"
  | "LOW_TRY_ACCESS_DROP_WINDOW"
  | "LOW_SHOT_QUALITY_DROP_WINDOW"
  | "ADVANTAGE_STATE_DROP_WINDOW"
  | "CENTRAL_PRESSURE_RELEASE_DROP_WINDOW";

export type DropGoalCandidateStatus = "SELECTED" | "REJECTED";

export interface DropGoalOpportunityContext {
  readonly matchId: string;
  readonly sequenceId: string;
  readonly possessionTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly ballCarrierId: PlayerId;
  readonly potentialKickerId: PlayerId;
  readonly potentialKickerRole: string;
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
  readonly tryAccessQuality: number;
  readonly shotQuality: number;
  readonly recycleSafety: number;
  readonly phaseMomentum: number;
  readonly teamStyle: string;
  readonly scoreContext: string;
}

export interface DropGoalOpportunityRecord {
  readonly context: DropGoalOpportunityContext;
  readonly opportunityType: DropGoalOpportunityType;
  readonly opportunityScore: number;
  readonly candidateAction: "DROP_GOAL_ATTEMPT";
  readonly candidateScore: number;
  readonly candidateStatus: DropGoalCandidateStatus;
  readonly competingCandidate: string;
  readonly selectedReason: string;
  readonly rejectionReason: string;
}

export interface DropGoalOpportunitySummary {
  readonly detectorActive: true;
  readonly batchOpportunities: readonly DropGoalOpportunityRecord[];
  readonly liveOpportunities: readonly DropGoalOpportunityRecord[];
  readonly batchDropOpportunities: number;
  readonly batchDropCandidatesGenerated: number;
  readonly batchDropCandidatesSelected: number;
  readonly batchDropCandidatesRejected: number;
  readonly liveDropOpportunities: number;
  readonly liveDropCandidatesGenerated: number;
  readonly liveDropCandidatesSelected: number;
  readonly liveDropCandidatesRejected: number;
  readonly candidatesByOpportunityType: readonly {
    readonly opportunityType: DropGoalOpportunityType;
    readonly count: number;
  }[];
  readonly selectedDropCandidateScoreRange: string;
  readonly rejectedDropCandidateScoreRange: string;
  readonly commonRejectionReasons: readonly string[];
}
