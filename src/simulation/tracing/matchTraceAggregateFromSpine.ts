import type { MatchTraceSpineModel } from "./matchTraceSpine";
import type {
  MatchTraceActionType,
  MatchTraceCauseTag,
  MatchTraceEvent,
  MatchTraceImpactTag,
  MatchTracePhase,
  MatchTraceSource,
} from "./matchTraceEvent";
import {
  DEFAULT_MATCH_TRACE_SOURCE_PRIORITY,
  deduplicateMatchTraces,
} from "./deduplicateMatchTraces";
import type {
  MatchTraceAggregateBucket,
  MatchTraceAggregateModel,
  MatchTraceAggregateScope,
} from "./matchTraceAggregateTypes";

type MutableCountRecord<T extends string> = Partial<Record<T, number>>;

function increment<T extends string>(record: MutableCountRecord<T>, key: T, amount = 1): void {
  record[key] = (record[key] ?? 0) + amount;
}

function incrementString(record: Record<string, number>, key: string, amount = 1): void {
  record[key] = (record[key] ?? 0) + amount;
}

function sourceCounts(traces: readonly MatchTraceEvent[]): Readonly<Record<MatchTraceSource, number>> {
  return {
    official_match_event: traces.filter((trace) => trace.source === "official_match_event").length,
    mini_match_record: traces.filter((trace) => trace.source === "mini_match_record").length,
    sandbox_event: traces.filter((trace) => trace.source === "sandbox_event").length,
  };
}

function isDangerTrace(trace: MatchTraceEvent): boolean {
  return trace.impactTags.some((tag) =>
    tag === "danger_created" ||
    tag === "line_broken" ||
    tag === "second_chance_allowed" ||
    tag === "chance_conceded"
  );
}

function isPossessionLossTrace(trace: MatchTraceEvent): boolean {
  return trace.impactTags.includes("possession_lost") || trace.outcome === "TURNOVER_CONCEDED";
}

function isPressureLossTrace(trace: MatchTraceEvent): boolean {
  return trace.pressureLevel === "HIGH" &&
    (trace.outcome === "FAILURE" || trace.outcome === "TURNOVER_CONCEDED" || isPossessionLossTrace(trace));
}

function isRecoveryTrace(trace: MatchTraceEvent): boolean {
  return trace.actionType === "RECOVERY" || trace.actionType === "INTERCEPTION" || trace.outcome === "RECOVERY_WON";
}

function isShotCreatedTrace(trace: MatchTraceEvent): boolean {
  return trace.actionType === "SHOT" ||
    trace.outcome === "SHOT_CREATED" ||
    (trace.phase === "FINAL_ZONE_ATTACK" && trace.impactTags.includes("danger_created"));
}

function isSecondChanceTrace(trace: MatchTraceEvent): boolean {
  return trace.actionType === "SECOND_BALL_CONTEST" ||
    trace.outcome === "SECOND_CHANCE_CREATED" ||
    trace.impactTags.includes("second_chance_allowed");
}

function isGoalkeeperTrace(trace: MatchTraceEvent): boolean {
  return trace.actionType === "GOALKEEPER_SAVE" ||
    trace.actionType === "GOALKEEPER_DISTRIBUTION" ||
    trace.phase === "GOALKEEPER_SEQUENCE";
}

function positiveImpact(trace: MatchTraceEvent): boolean {
  return trace.impactTags.some((tag) =>
    tag === "danger_created" ||
    tag === "line_broken" ||
    tag === "possession_secured" ||
    tag === "shot_prevented" ||
    tag === "second_chance_allowed"
  );
}

function negativeImpact(trace: MatchTraceEvent): boolean {
  return trace.impactTags.some((tag) =>
    tag === "possession_lost" ||
    tag === "chance_conceded" ||
    tag === "rest_defense_exposed"
  ) || trace.outcome === "TURNOVER_CONCEDED";
}

function primaryPlayerKey(trace: MatchTraceEvent): string | undefined {
  return trace.primaryPlayerId ?? trace.secondaryPlayerId ?? trace.goalkeeperId ?? trace.opponentPlayerId;
}

function sortedKeys(record: Readonly<Record<string, number>>, limit: number): readonly string[] {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key]) => key);
}

function sortedTypedKeys<T extends string>(record: Partial<Record<T, number>>, limit: number): readonly T[] {
  return Object.entries(record)
    .sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key]) => key as T);
}

function emptyBucket(scope: MatchTraceAggregateScope): MatchTraceAggregateBucket {
  return {
    scope,
    traceCount: 0,
    deduplicatedTraceCount: 0,
    duplicateTraceCount: 0,
    sourceCounts: {
      official_match_event: 0,
      mini_match_record: 0,
      sandbox_event: 0,
    },
    officialTruthTrueCount: 0,
    officialTruthFalseCount: 0,
    phaseCounts: {},
    actionTypeCounts: {},
    causeTagCounts: {},
    impactTagCounts: {},
    dangerByZone: {},
    possessionLossByZone: {},
    pressureLossByZone: {},
    recoveryByZone: {},
    shotCreatedByZone: {},
    secondChanceByZone: {},
    goalkeeperActionByZone: {},
    playerInvolvement: {},
    playerPositiveImpact: {},
    playerNegativeImpact: {},
    fatigueImpactTotal: 0,
    highPressureTraceCount: 0,
    coachVisibleTraceCount: 0,
  };
}

function buildBucket(input: {
  readonly scope: MatchTraceAggregateScope;
  readonly traces: readonly MatchTraceEvent[];
  readonly deduplicatedTraces: readonly MatchTraceEvent[];
  readonly duplicateTraceCount: number;
}): MatchTraceAggregateBucket {
  const phaseCounts: Partial<Record<MatchTracePhase, number>> = {};
  const actionTypeCounts: Partial<Record<MatchTraceActionType, number>> = {};
  const causeTagCounts: Partial<Record<MatchTraceCauseTag, number>> = {};
  const impactTagCounts: Partial<Record<MatchTraceImpactTag, number>> = {};
  const dangerByZone: Record<string, number> = {};
  const possessionLossByZone: Record<string, number> = {};
  const pressureLossByZone: Record<string, number> = {};
  const recoveryByZone: Record<string, number> = {};
  const shotCreatedByZone: Record<string, number> = {};
  const secondChanceByZone: Record<string, number> = {};
  const goalkeeperActionByZone: Record<string, number> = {};
  const playerInvolvement: Record<string, number> = {};
  const playerPositiveImpact: Record<string, number> = {};
  const playerNegativeImpact: Record<string, number> = {};
  let fatigueImpactTotal = 0;

  for (const trace of input.deduplicatedTraces) {
    increment(phaseCounts, trace.phase);
    increment(actionTypeCounts, trace.actionType);
    for (const tag of trace.causeTags) {
      increment(causeTagCounts, tag);
    }
    for (const tag of trace.impactTags) {
      increment(impactTagCounts, tag);
    }

    const zone = String(trace.zone);
    if (isDangerTrace(trace)) {
      incrementString(dangerByZone, zone);
    }
    if (isPossessionLossTrace(trace)) {
      incrementString(possessionLossByZone, zone);
    }
    if (isPressureLossTrace(trace)) {
      incrementString(pressureLossByZone, zone);
    }
    if (isRecoveryTrace(trace)) {
      incrementString(recoveryByZone, zone);
    }
    if (isShotCreatedTrace(trace)) {
      incrementString(shotCreatedByZone, zone);
    }
    if (isSecondChanceTrace(trace)) {
      incrementString(secondChanceByZone, zone);
    }
    if (isGoalkeeperTrace(trace)) {
      incrementString(goalkeeperActionByZone, zone);
    }

    const playerKey = primaryPlayerKey(trace);
    if (playerKey !== undefined) {
      incrementString(playerInvolvement, playerKey);
      if (positiveImpact(trace)) {
        incrementString(playerPositiveImpact, playerKey);
      }
      if (negativeImpact(trace)) {
        incrementString(playerNegativeImpact, playerKey);
      }
    }

    fatigueImpactTotal += trace.fatigueImpact ?? 0;
  }

  return {
    scope: input.scope,
    traceCount: input.traces.length,
    deduplicatedTraceCount: input.deduplicatedTraces.length,
    duplicateTraceCount: input.duplicateTraceCount,
    sourceCounts: sourceCounts(input.deduplicatedTraces),
    officialTruthTrueCount: input.deduplicatedTraces.filter((trace) => trace.officialTruth).length,
    officialTruthFalseCount: input.deduplicatedTraces.filter((trace) => !trace.officialTruth).length,
    phaseCounts,
    actionTypeCounts,
    causeTagCounts,
    impactTagCounts,
    dangerByZone,
    possessionLossByZone,
    pressureLossByZone,
    recoveryByZone,
    shotCreatedByZone,
    secondChanceByZone,
    goalkeeperActionByZone,
    playerInvolvement,
    playerPositiveImpact,
    playerNegativeImpact,
    fatigueImpactTotal,
    highPressureTraceCount: input.deduplicatedTraces.filter((trace) => trace.pressureLevel === "HIGH").length,
    coachVisibleTraceCount: input.deduplicatedTraces.filter((trace) => trace.coachVisible).length,
  };
}

function aggregateTags(model: Omit<MatchTraceAggregateModel, "tags">): readonly string[] {
  return [
    "match_trace_aggregator",
    `match_trace_aggregator_status_${model.status}`,
    "match_trace_aggregator_scope_official",
    "match_trace_aggregator_scope_diagnostic",
    "match_trace_aggregator_scope_sandbox",
    `match_trace_aggregator_input_trace_count_${model.totalInputTraceCount}`,
    `match_trace_aggregator_deduplicated_trace_count_${model.totalDeduplicatedTraceCount}`,
    `match_trace_aggregator_duplicate_trace_count_${model.totalDuplicateTraceCount}`,
    `match_trace_aggregator_official_trace_count_${model.official.deduplicatedTraceCount}`,
    `match_trace_aggregator_diagnostic_trace_count_${model.diagnostic.deduplicatedTraceCount}`,
    `match_trace_aggregator_sandbox_trace_count_${model.sandbox.deduplicatedTraceCount}`,
    `match_trace_aggregator_official_danger_zone_count_${model.topOfficialDangerZones.length}`,
    `match_trace_aggregator_pressure_loss_zone_count_${model.topOfficialPressureLossZones.length}`,
    `match_trace_aggregator_recovery_zone_count_${model.topOfficialRecoveryZones.length}`,
    `match_trace_aggregator_player_involvement_count_${model.topOfficialPlayerInvolvement.length}`,
    "match_trace_aggregator_score_mutation_count_0",
    "match_trace_aggregator_possession_mutation_count_0",
    "match_trace_aggregator_production_scoring_event_creation_count_0",
    "match_trace_aggregator_live_selection_driver_count_0",
    "match_trace_aggregator_production_route_resolution_driver_count_0",
    "match_trace_aggregator_global_economy_claim_forbidden",
    "selection_preview_trace_backing_status_sandbox_only",
    "selection_preview_confidence_not_upgraded_by_aggregator",
    "scoring_constants_unchanged",
  ];
}

function notAvailableModel(traceSpineStatus: string): MatchTraceAggregateModel {
  const official = emptyBucket("official");
  const diagnostic = emptyBucket("diagnostic");
  const sandbox = emptyBucket("sandbox");
  const modelWithoutTags: Omit<MatchTraceAggregateModel, "tags"> = {
    status: "not_available",
    traceSpineStatus,
    totalInputTraceCount: 0,
    totalDeduplicatedTraceCount: 0,
    totalDuplicateTraceCount: 0,
    deduplicationStrategy: "none",
    sourcePriority: DEFAULT_MATCH_TRACE_SOURCE_PRIORITY,
    official,
    diagnostic,
    sandbox,
    topOfficialDangerZones: [],
    topOfficialPressureLossZones: [],
    topOfficialRecoveryZones: [],
    topOfficialPlayerInvolvement: [],
    topOfficialCauseTags: [],
    topOfficialImpactTags: [],
    diagnosticSummary: "Match trace aggregator not available because the trace spine is unavailable.",
    coachSummarySeed: "No match trace aggregates are available yet.",
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: ["MATCH_TRACE_AGGREGATOR_NOT_AVAILABLE"],
  };

  return {
    ...modelWithoutTags,
    tags: aggregateTags(modelWithoutTags),
  };
}

export function matchTraceAggregateFromSpine(input: {
  readonly traceSpine: MatchTraceSpineModel;
}): MatchTraceAggregateModel {
  if (input.traceSpine.status === "not_available") {
    return notAvailableModel(input.traceSpine.status);
  }

  const officialInput = input.traceSpine.traces.filter((trace) =>
    trace.source === "official_match_event" && trace.officialTruth
  );
  const diagnosticInput = input.traceSpine.traces.filter((trace) =>
    trace.source === "mini_match_record"
  );
  const sandboxInput = input.traceSpine.traces.filter((trace) =>
    trace.source === "sandbox_event"
  );
  const officialDedup = deduplicateMatchTraces({ traces: officialInput });
  const diagnosticDedupScope = deduplicateMatchTraces({ traces: [...officialInput, ...diagnosticInput] });
  const diagnosticDeduplicated = diagnosticDedupScope.deduplicatedTraces.filter((trace) =>
    trace.source === "mini_match_record"
  );
  const sandboxDedup = deduplicateMatchTraces({ traces: sandboxInput });
  const official = buildBucket({
    scope: "official",
    traces: officialInput,
    deduplicatedTraces: officialDedup.deduplicatedTraces,
    duplicateTraceCount: officialDedup.duplicateCount,
  });
  const diagnostic = buildBucket({
    scope: "diagnostic",
    traces: diagnosticInput,
    deduplicatedTraces: diagnosticDeduplicated,
    duplicateTraceCount: Math.max(0, diagnosticInput.length - diagnosticDeduplicated.length),
  });
  const sandbox = buildBucket({
    scope: "sandbox",
    traces: sandboxInput,
    deduplicatedTraces: sandboxDedup.deduplicatedTraces,
    duplicateTraceCount: sandboxDedup.duplicateCount,
  });
  const totalDeduplicatedTraceCount = official.deduplicatedTraceCount + diagnostic.deduplicatedTraceCount + sandbox.deduplicatedTraceCount;
  const totalDuplicateTraceCount = input.traceSpine.totalTraceCount - totalDeduplicatedTraceCount;
  const modelWithoutTags: Omit<MatchTraceAggregateModel, "tags"> = {
    status: "available",
    traceSpineStatus: input.traceSpine.status,
    totalInputTraceCount: input.traceSpine.totalTraceCount,
    totalDeduplicatedTraceCount,
    totalDuplicateTraceCount,
    deduplicationStrategy: totalDuplicateTraceCount > 0 ? "source_priority" : "event_identity",
    sourcePriority: DEFAULT_MATCH_TRACE_SOURCE_PRIORITY,
    official,
    diagnostic,
    sandbox,
    topOfficialDangerZones: sortedKeys(official.dangerByZone, 5),
    topOfficialPressureLossZones: sortedKeys(official.pressureLossByZone, 5),
    topOfficialRecoveryZones: sortedKeys(official.recoveryByZone, 5),
    topOfficialPlayerInvolvement: sortedKeys(official.playerInvolvement, 5),
    topOfficialCauseTags: sortedTypedKeys(official.causeTagCounts, 5),
    topOfficialImpactTags: sortedTypedKeys(official.impactTagCounts, 5),
    diagnosticSummary:
      `Official=${official.deduplicatedTraceCount}, diagnostic=${diagnostic.deduplicatedTraceCount}, ` +
      `sandbox=${sandbox.deduplicatedTraceCount}, duplicates=${totalDuplicateTraceCount}.`,
    coachSummarySeed:
      "Selection Preview remains sandbox-backed. Match Trace Aggregator is the first step toward future trace-backed preview confidence, but no preview confidence is upgraded in this sprint.",
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: [
      ...(official.officialTruthFalseCount > 0 ? ["MATCH_TRACE_AGGREGATOR_OFFICIAL_SCOPE_HAS_NON_OFFICIAL_TRACE"] : []),
      ...(sandbox.officialTruthTrueCount > 0 ? ["MATCH_TRACE_AGGREGATOR_SANDBOX_SCOPE_HAS_OFFICIAL_TRACE"] : []),
      ...(diagnostic.officialTruthTrueCount > 0 ? ["MATCH_TRACE_AGGREGATOR_DIAGNOSTIC_SCOPE_HAS_OFFICIAL_TRUTH"] : []),
    ],
  };

  return {
    ...modelWithoutTags,
    tags: aggregateTags(modelWithoutTags),
  };
}

