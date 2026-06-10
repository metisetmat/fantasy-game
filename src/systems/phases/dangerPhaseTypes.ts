import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type DangerPhaseEntryReason =
  | "ZONE_ENTRY"
  | "SHOT_WINDOW"
  | "TRY_ACCESS_WINDOW"
  | "DROP_WINDOW"
  | "REBOUND_DANGER"
  | "SCRAMBLE_DANGER"
  | "PRESSURE_BREAK"
  | "FAST_TRANSITION"
  | "UNKNOWN";

export type DangerPhaseExitReason =
  | "SHOT_ATTEMPT"
  | "TRY_ATTEMPT"
  | "DROP_ATTEMPT"
  | "AFFORDANCE_REJECTED"
  | "RECYCLE"
  | "CARRY_OR_HOLD"
  | "TURNOVER"
  | "OUT_OF_PLAY"
  | "SCORE"
  | "UNKNOWN";

export type ScoringDangerRoute =
  | "SHOT_GOAL_ROUTE"
  | "TRY_TOUCHDOWN_ROUTE"
  | "DROP_GOAL_ROUTE"
  | "CONVERSION_ROUTE"
  | "NON_SHOT_SETUP_ROUTE";

export type PossessionDangerRecommendation =
  | "KEEP_INSTRUMENTATION"
  | "INCREASE_DANGER_PHASE_GENERATION"
  | "INCREASE_DANGER_TO_AFFORDANCE_CONVERSION"
  | "INCREASE_NON_SHOT_AFFORDANCES"
  | "INSTRUMENT_MISSING_POSSESSION_LINKS"
  | "INSTRUMENT_MISSING_DANGER_PHASE_LINKS"
  | "DIAGNOSE_CANDIDATE_SELECTION"
  | "NEEDS_MORE_SAMPLE";

export interface DangerPhase {
  readonly id: string;
  readonly matchId: string;
  readonly possessionId: string;
  readonly teamId: TeamId;
  readonly startSequenceId: string;
  readonly endSequenceId: string;
  readonly entryZone: ZoneId | "UNKNOWN";
  readonly peakZone: ZoneId | "UNKNOWN";
  readonly endZone: ZoneId | "UNKNOWN";
  readonly entryReason: DangerPhaseEntryReason;
  readonly exitReason: DangerPhaseExitReason;
  readonly dangerScore: number;
  readonly pressureLevel: string;
  readonly attackingMomentum: string;
  readonly restDefenseState: string;
  readonly affordancesGenerated: readonly string[];
  readonly candidatesGenerated: readonly string[];
  readonly selectedCandidates: readonly string[];
  readonly executedAttempts: readonly string[];
  readonly scoringEvents: readonly string[];
}

export interface PossessionFunnelRow {
  readonly metric: string;
  readonly count: number;
  readonly perMatch: number;
  readonly perTeamPerMatch: number;
  readonly interpretation: string;
}

export interface DangerPhaseExitDistributionRow {
  readonly exitReason: DangerPhaseExitReason;
  readonly count: number;
  readonly share: number;
  readonly interpretation: string;
}

export interface DangerPhaseRouteDistributionRow {
  readonly route: ScoringDangerRoute;
  readonly affordances: number;
  readonly candidates: number;
  readonly selected: number;
  readonly attempts: number;
  readonly scores: number;
  readonly dangerPhaseShare: number;
}

export interface OffensivePossessionDangerPhaseSnapshot {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly batchMatchesSimulated: number;
  readonly offensivePossessions: number;
  readonly offensivePossessionsPerMatch: number;
  readonly offensivePossessionsPerTeamPerMatch: number;
  readonly dangerPhases: number;
  readonly dangerPhasesPerMatch: number;
  readonly dangerPhasesPerTeamPerMatch: number;
  readonly possessionsReachingDangerPhase: number;
  readonly possessionToDangerRate: number;
  readonly dangerPhasesWithScoringAffordance: number;
  readonly dangerPhaseToScoringAffordanceRate: number;
  readonly dangerPhasesWithoutScoringAffordance: number;
  readonly dangerPhasesWithSelectedScoringCandidate: number;
  readonly dangerPhasesWithExecutedAttempt: number;
  readonly dangerPhasesWithScoringEvent: number;
  readonly shotAffordances: number;
  readonly tryAffordances: number;
  readonly dropAffordances: number;
  readonly conversionAffordances: number;
  readonly nonShotSetupAffordances: number;
  readonly nonShotAffordanceGenerationRecommendation: string;
  readonly shotDangerPhaseLinkCount: number;
  readonly tryDangerPhaseLinkCount: number;
  readonly dropDangerPhaseLinkCount: number;
  readonly affordancesWithPossessionLink: number;
  readonly affordancesMissingPossessionLink: number;
  readonly affordancesWithDangerPhaseLink: number;
  readonly affordancesMissingDangerPhaseLink: number;
  readonly liveOffensivePossessions: number;
  readonly liveDangerPhases: number;
  readonly liveDangerPhasesWithScoringAffordance: number;
  readonly liveShotAttempts: number;
  readonly liveTryAttempts: number;
  readonly liveDropAttempts: number;
  readonly liveScoringEvents: number;
  readonly liveScore: string;
  readonly dangerPhaseToShotAffordanceRate: number;
  readonly dangerPhaseToNonShotAffordanceRate: number;
  readonly recommendation: PossessionDangerRecommendation;
  readonly possessionFunnelRows: readonly PossessionFunnelRow[];
  readonly exitDistributionRows: readonly DangerPhaseExitDistributionRow[];
  readonly routeDistributionRows: readonly DangerPhaseRouteDistributionRow[];
  readonly mostCommonDangerWithoutAffordanceExitReasons: readonly string[];
  readonly mostCommonDangerWithoutAffordanceZones: readonly string[];
  readonly mostCommonDangerWithoutAffordancePressureLevels: readonly string[];
}
