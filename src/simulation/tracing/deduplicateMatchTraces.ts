import type { MatchTraceEvent, MatchTraceSource } from "./matchTraceEvent";
import type { MatchTraceDeduplicationResult, MatchTraceDeduplicationStrategy } from "./matchTraceAggregateTypes";

export const DEFAULT_MATCH_TRACE_SOURCE_PRIORITY: readonly MatchTraceSource[] = [
  "official_match_event",
  "mini_match_record",
  "sandbox_event",
];

function sourceRank(source: MatchTraceSource, priority: readonly MatchTraceSource[]): number {
  const index = priority.indexOf(source);
  return index === -1 ? priority.length : index;
}

function traceIdentity(trace: MatchTraceEvent): string {
  const baseKey = trace.sourceEventId ?? [
    trace.minute,
    trace.sequenceId ?? "no-sequence",
    trace.teamId,
    trace.actionType,
    trace.zone,
    trace.primaryPlayerId ?? "none",
  ].join(":");

  return trace.source === "sandbox_event" ? `sandbox:${baseKey}` : baseKey;
}

function shouldReplaceTrace(input: {
  readonly current: MatchTraceEvent;
  readonly candidate: MatchTraceEvent;
  readonly priority: readonly MatchTraceSource[];
}): boolean {
  const currentRank = sourceRank(input.current.source, input.priority);
  const candidateRank = sourceRank(input.candidate.source, input.priority);

  if (candidateRank !== currentRank) {
    return candidateRank < currentRank;
  }

  if (input.candidate.officialTruth !== input.current.officialTruth) {
    return input.candidate.officialTruth;
  }

  return input.candidate.diagnosticWeight > input.current.diagnosticWeight;
}

export function deduplicateMatchTraces(input: {
  readonly traces: readonly MatchTraceEvent[];
  readonly sourcePriority?: readonly MatchTraceSource[];
}): MatchTraceDeduplicationResult {
  const sourcePriority = input.sourcePriority ?? DEFAULT_MATCH_TRACE_SOURCE_PRIORITY;
  const byIdentity = new Map<string, MatchTraceEvent>();
  const duplicateTraces: MatchTraceEvent[] = [];

  for (const trace of input.traces) {
    const key = traceIdentity(trace);
    const existing = byIdentity.get(key);

    if (existing === undefined) {
      byIdentity.set(key, trace);
      continue;
    }

    if (shouldReplaceTrace({ current: existing, candidate: trace, priority: sourcePriority })) {
      duplicateTraces.push(existing);
      byIdentity.set(key, trace);
    } else {
      duplicateTraces.push(trace);
    }
  }

  const strategy: MatchTraceDeduplicationStrategy = input.traces.some((trace) => trace.sourceEventId !== undefined)
    ? "event_identity"
    : "sequence_minute_team_action";

  return {
    deduplicatedTraces: [...byIdentity.values()],
    duplicateTraces,
    duplicateCount: duplicateTraces.length,
    strategy: duplicateTraces.length > 0 ? "source_priority" : strategy,
  };
}

