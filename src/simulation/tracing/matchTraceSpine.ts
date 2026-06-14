import type { MatchInput, MatchReport } from "../../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type { MiniMatchSequenceRecord } from "../miniMatch";
import type { ControlledSegmentSandboxTimelineModel } from "../fullMatch/controlledSegmentSandboxTimeline";
import type { SelectionPreviewModel } from "../fullMatch/selectionPreviewFromCoachTestPlan";
import { matchTraceFromMatchEvent } from "./matchTraceFromMatchEvent";
import { matchTraceFromMiniMatchRecord } from "./matchTraceFromMiniMatchRecord";
import { matchTraceFromSandboxReplay } from "./matchTraceFromSandboxReplay";
import type {
  MatchTraceCauseTag,
  MatchTraceEvent,
  MatchTraceImpactTag,
  MatchTracePhase,
  MatchTraceActionType,
} from "./matchTraceEvent";

export type MatchTraceSpineStatus = "available" | "not_available";

export type MatchTraceSpineModel = {
  readonly status: MatchTraceSpineStatus;
  readonly traces: readonly MatchTraceEvent[];
  readonly totalTraceCount: number;
  readonly officialTraceCount: number;
  readonly miniMatchTraceCount: number;
  readonly sandboxTraceCount: number;
  readonly phaseCoverageCount: number;
  readonly actionTypeCoverageCount: number;
  readonly causeTagCoverageCount: number;
  readonly impactTagCoverageCount: number;
  readonly coachVisibleTraceCount: number;
  readonly officialTruthTrueCount: number;
  readonly officialTruthFalseCount: number;
  readonly traceMutationCount: 0;
  readonly scoreMutationCount: 0;
  readonly possessionMutationCount: 0;
  readonly productionScoringEventCreationCount: 0;
  readonly liveSelectionDriverCount: 0;
  readonly productionRouteResolutionDriverCount: 0;
  readonly globalEconomyClaimCount: 0;
  readonly selectionPreviewTraceBackingStatus: SelectionPreviewModel["selectionPreviewTraceBackingStatus"];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

function uniqueCount<T extends string>(values: readonly T[]): number {
  return new Set(values).size;
}

function traceTags(model: Omit<MatchTraceSpineModel, "tags">): readonly string[] {
  return [
    "match_event_trace_spine",
    "match_event_trace_spine_status_available",
    ...(model.officialTraceCount > 0 ? ["match_trace_source_official_match_event"] : []),
    ...(model.miniMatchTraceCount > 0 ? ["match_trace_source_mini_match_record"] : []),
    ...(model.sandboxTraceCount > 0 ? ["match_trace_source_sandbox_event"] : []),
    `match_trace_official_truth_true_count_${model.officialTruthTrueCount}`,
    `match_trace_official_truth_false_count_${model.officialTruthFalseCount}`,
    `match_trace_phase_coverage_${model.phaseCoverageCount}`,
    `match_trace_action_type_coverage_${model.actionTypeCoverageCount}`,
    `match_trace_cause_tag_coverage_${model.causeTagCoverageCount}`,
    `match_trace_impact_tag_coverage_${model.impactTagCoverageCount}`,
    `match_trace_coach_visible_count_${model.coachVisibleTraceCount}`,
    "match_trace_score_mutation_count_0",
    "match_trace_possession_mutation_count_0",
    "match_trace_production_scoring_event_creation_count_0",
    "match_trace_live_selection_driver_count_0",
    "match_trace_production_route_resolution_driver_count_0",
    "match_trace_global_economy_claim_forbidden",
    `selection_preview_trace_backing_status_${model.selectionPreviewTraceBackingStatus}`,
    "selection_preview_requires_match_trace_spine_true",
    "selection_preview_future_trace_consumer_true",
    "scoring_constants_unchanged",
  ];
}

export function buildMatchTraceSpine(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly miniMatchRecords: readonly MiniMatchSequenceRecord[];
  readonly controlledSegmentSandboxTimelineModel: ControlledSegmentSandboxTimelineModel;
  readonly selectionPreviewModel: SelectionPreviewModel;
}): MatchTraceSpineModel {
  const officialTraces = input.report.timeline.map((event) => matchTraceFromMatchEvent({ event }));
  const miniMatchTraces = input.miniMatchRecords.map((record) =>
    matchTraceFromMiniMatchRecord({
      record,
      matchId: input.matchInput.matchId,
      minute: record.setup.sequenceNumber,
      sequenceId: `mini-sequence-${record.sequenceNumber}`,
      teamId: input.matchInput.homeTeam.teamId,
      opponentTeamId: input.matchInput.awayTeam.teamId,
    })
  );
  const sandboxTraces = input.controlledSegmentSandboxTimelineModel.override.events.map((event) =>
    matchTraceFromSandboxReplay({
      event,
      matchId: input.matchInput.matchId,
      minute: event.sandboxMinuteOffset,
      sequenceId: event.sourceStepId,
      teamId: input.matchInput.homeTeam.teamId,
      opponentTeamId: input.matchInput.awayTeam.teamId,
    })
  );
  const traces = [...officialTraces, ...miniMatchTraces, ...sandboxTraces];
  const modelWithoutTags: Omit<MatchTraceSpineModel, "tags"> = {
    status: traces.length > 0 ? "available" : "not_available",
    traces,
    totalTraceCount: traces.length,
    officialTraceCount: officialTraces.length,
    miniMatchTraceCount: miniMatchTraces.length,
    sandboxTraceCount: sandboxTraces.length,
    phaseCoverageCount: uniqueCount(traces.map((trace) => trace.phase as MatchTracePhase)),
    actionTypeCoverageCount: uniqueCount(traces.map((trace) => trace.actionType as MatchTraceActionType)),
    causeTagCoverageCount: uniqueCount(traces.flatMap((trace) => trace.causeTags as readonly MatchTraceCauseTag[])),
    impactTagCoverageCount: uniqueCount(traces.flatMap((trace) => trace.impactTags as readonly MatchTraceImpactTag[])),
    coachVisibleTraceCount: traces.filter((trace) => trace.coachVisible).length,
    officialTruthTrueCount: traces.filter((trace) => trace.officialTruth).length,
    officialTruthFalseCount: traces.filter((trace) => !trace.officialTruth).length,
    traceMutationCount: 0,
    scoreMutationCount: 0,
    possessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    liveSelectionDriverCount: 0,
    productionRouteResolutionDriverCount: 0,
    globalEconomyClaimCount: 0,
    selectionPreviewTraceBackingStatus: input.selectionPreviewModel.selectionPreviewTraceBackingStatus,
    warnings: [
      ...(officialTraces.length === 0 ? ["MATCH_TRACE_NO_OFFICIAL_TRACES"] : []),
      ...(miniMatchTraces.length === 0 ? ["MATCH_TRACE_NO_MINI_MATCH_TRACES"] : []),
      ...(sandboxTraces.length === 0 ? ["MATCH_TRACE_NO_SANDBOX_TRACES"] : []),
    ],
  };

  return {
    ...modelWithoutTags,
    tags: traceTags(modelWithoutTags),
  };
}

export function matchTraceSpineEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: MatchTraceSpineModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-match-event-trace-spine`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [...new Set(input.model.traces.map((trace) => trace.zone))].slice(0, 4),
    summary:
      `Match event trace spine ${input.model.status}: totalTraceCount=${input.model.totalTraceCount}, ` +
      `officialTraceCount=${input.model.officialTraceCount}, miniMatchTraceCount=${input.model.miniMatchTraceCount}, ` +
      `sandboxTraceCount=${input.model.sandboxTraceCount}, phaseCoverage=${input.model.phaseCoverageCount}, ` +
      `actionTypeCoverage=${input.model.actionTypeCoverageCount}, causeTagCoverage=${input.model.causeTagCoverageCount}, ` +
      `impactTagCoverage=${input.model.impactTagCoverageCount}, coachVisibleTraceCount=${input.model.coachVisibleTraceCount}, ` +
      `officialTruthTrueCount=${input.model.officialTruthTrueCount}, officialTruthFalseCount=${input.model.officialTruthFalseCount}, ` +
      `traceMutationCount=${input.model.traceMutationCount}, scoreMutationCount=${input.model.scoreMutationCount}, ` +
      `possessionMutationCount=${input.model.possessionMutationCount}, productionScoringEventCreationCount=${input.model.productionScoringEventCreationCount}, ` +
      `liveSelectionDriverCount=${input.model.liveSelectionDriverCount}, productionRouteResolutionDriverCount=${input.model.productionRouteResolutionDriverCount}, ` +
      `globalEconomyClaimCount=${input.model.globalEconomyClaimCount}, selectionPreviewTraceBackingStatus=${input.model.selectionPreviewTraceBackingStatus}, ` +
      "scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 52,
    coachVisible: false,
    internalTags: [
      "workbench_chain_match_event_trace_spine",
      ...input.model.tags,
    ],
  };
}

export function matchTraceSpineLimitations(model: MatchTraceSpineModel): readonly string[] {
  if (model.status === "not_available") {
    return ["MATCH_TRACE_SPINE_NOT_AVAILABLE"];
  }

  return [
    "MATCH_TRACE_SPINE_DIAGNOSTIC_ONLY",
    "MATCH_TRACE_SPINE_CANNOT_MUTATE_OFFICIAL_TIMELINE",
    "MATCH_TRACE_SPINE_CANNOT_MUTATE_OFFICIAL_SCORE",
    "MATCH_TRACE_SPINE_CANNOT_MUTATE_OFFICIAL_POSSESSION",
    "MATCH_TRACE_SPINE_CANNOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "MATCH_TRACE_SPINE_CANNOT_DRIVE_LIVE_SELECTION",
    "MATCH_TRACE_SPINE_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION",
    "MATCH_TRACE_SPINE_CANNOT_CLAIM_GLOBAL_ECONOMY",
  ];
}
