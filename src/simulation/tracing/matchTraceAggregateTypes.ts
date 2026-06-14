import type {
  MatchTraceActionType,
  MatchTraceCauseTag,
  MatchTraceEvent,
  MatchTraceImpactTag,
  MatchTracePhase,
  MatchTraceSource,
} from "./matchTraceEvent";

export type MatchTraceAggregateScope =
  | "official"
  | "diagnostic"
  | "sandbox";

export type MatchTraceAggregateStatus =
  | "not_available"
  | "available"
  | "partial"
  | "blocked"
  | "failed";

export type MatchTraceDeduplicationStrategy =
  | "source_priority"
  | "event_identity"
  | "sequence_minute_team_action"
  | "none";

export type MatchTraceAggregateBucket = {
  readonly scope: MatchTraceAggregateScope;
  readonly traceCount: number;
  readonly deduplicatedTraceCount: number;
  readonly duplicateTraceCount: number;
  readonly sourceCounts: Readonly<Record<MatchTraceSource, number>>;
  readonly officialTruthTrueCount: number;
  readonly officialTruthFalseCount: number;
  readonly phaseCounts: Partial<Record<MatchTracePhase, number>>;
  readonly actionTypeCounts: Partial<Record<MatchTraceActionType, number>>;
  readonly causeTagCounts: Partial<Record<MatchTraceCauseTag, number>>;
  readonly impactTagCounts: Partial<Record<MatchTraceImpactTag, number>>;
  readonly dangerByZone: Readonly<Record<string, number>>;
  readonly possessionLossByZone: Readonly<Record<string, number>>;
  readonly pressureLossByZone: Readonly<Record<string, number>>;
  readonly recoveryByZone: Readonly<Record<string, number>>;
  readonly shotCreatedByZone: Readonly<Record<string, number>>;
  readonly secondChanceByZone: Readonly<Record<string, number>>;
  readonly goalkeeperActionByZone: Readonly<Record<string, number>>;
  readonly playerInvolvement: Readonly<Record<string, number>>;
  readonly playerPositiveImpact: Readonly<Record<string, number>>;
  readonly playerNegativeImpact: Readonly<Record<string, number>>;
  readonly fatigueImpactTotal: number;
  readonly highPressureTraceCount: number;
  readonly coachVisibleTraceCount: number;
};

export type MatchTraceAggregateModel = {
  readonly status: MatchTraceAggregateStatus;
  readonly traceSpineStatus: string;
  readonly totalInputTraceCount: number;
  readonly totalDeduplicatedTraceCount: number;
  readonly totalDuplicateTraceCount: number;
  readonly deduplicationStrategy: MatchTraceDeduplicationStrategy;
  readonly sourcePriority: readonly MatchTraceSource[];
  readonly official: MatchTraceAggregateBucket;
  readonly diagnostic: MatchTraceAggregateBucket;
  readonly sandbox: MatchTraceAggregateBucket;
  readonly topOfficialDangerZones: readonly string[];
  readonly topOfficialPressureLossZones: readonly string[];
  readonly topOfficialRecoveryZones: readonly string[];
  readonly topOfficialPlayerInvolvement: readonly string[];
  readonly topOfficialCauseTags: readonly MatchTraceCauseTag[];
  readonly topOfficialImpactTags: readonly MatchTraceImpactTag[];
  readonly diagnosticSummary: string;
  readonly coachSummarySeed: string;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type MatchTraceDeduplicationResult = {
  readonly deduplicatedTraces: readonly MatchTraceEvent[];
  readonly duplicateTraces: readonly MatchTraceEvent[];
  readonly duplicateCount: number;
  readonly strategy: MatchTraceDeduplicationStrategy;
};

