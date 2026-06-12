import { MatchPhase, PressureLevel, type ScoreState } from "../../models/match";
import type {
  FatigueReport,
  MatchEvent,
  MatchInput,
  MatchReport,
  PlayerMatchStats,
  TacticalDiagnosis,
  TeamSnapshot,
} from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { MiniMatchResult, MiniMatchScoringEvent, MiniMatchSequenceRecord } from "../miniMatch";
import {
  officialTeamIdForPrototype,
  type MiniMatchInputAdapterResult,
} from "./matchInputToMiniMatch";
import {
  createEvidenceBasedTacticalDiagnoses,
  createEvidenceDrivenCoachInsights,
  eventTypeFromAdapterTags,
} from "./matchReportEvidence";
import { buildCanonicalMatchReportEvidenceFacts } from "./matchReportEvidenceBuilder";
import { suggestedFocusFromEvidence } from "./matchReportFocus";
import { selectKeyMoments } from "./matchReportMoments";
import { createTeamMatchStatsFromEvents, createZoneStatsFromEvents } from "./matchReportStats";
import type { TacticalPlanInfluence } from "./tacticalPlanInfluence";
import {
  scoreStateTags,
  teamStateForId,
  type FullMatchSegmentState,
} from "../fullMatch/fullMatchSegmentState";
import type { FullMatchSegmentInfluence } from "../fullMatch/fullMatchSegmentInfluence";
import type { FullMatchChainSegmentContext } from "../fullMatch/fullMatchChainSegmentContext";
import type { FullMatchChainRouteCandidateInfluenceResult } from "../fullMatch/fullMatchChainRouteCandidateInfluence";
import type { FullMatchShadowRouteSelectionResult } from "../fullMatch/fullMatchShadowRouteSelection";
import type { FullMatchControlledSegmentSelectionResult } from "../fullMatch/fullMatchControlledSegmentSelection";
import type { FullMatchSegmentRouteInput } from "../fullMatch/fullMatchSegmentRouteInput";
import type { FullMatchControlledMiniMatchRouteSource } from "../fullMatch/fullMatchControlledMiniMatchRouteSource";
import type { FullMatchLiveSelectionOverrideGuard } from "../fullMatch/fullMatchLiveSelectionOverrideGuard";
import type { FullMatchIsolatedMiniMatchOverrideExperiment } from "../fullMatch/fullMatchIsolatedMiniMatchOverrideExperiment";
import type { FullMatchControlledSegmentReplayComparison } from "../fullMatch/fullMatchControlledSegmentReplayComparison";
import type { FullMatchRealIsolatedSegmentReplay } from "../fullMatch/fullMatchRealIsolatedSegmentReplay";
import type { ControlledRouteResolutionSandbox } from "../fullMatch/controlledRouteResolutionSandbox";
import type { SandboxScoringOpportunityModel } from "../fullMatch/sandboxScoringOpportunityModel";
import type { SandboxScoringEventCandidateModel } from "../fullMatch/sandboxScoringEventCandidate";
import type { SandboxScoringEventResolutionModel } from "../fullMatch/sandboxScoringEventResolution";
import type { AttributeDrivenShotResolutionModel } from "../fullMatch/attributeDrivenShotResolutionSandbox";
import type { GoalkeeperResponseModel } from "../fullMatch/goalkeeperResponseModel";

const DEFAULT_REPORT_ZONE = "Z3-C" as ZoneId;

export interface MiniMatchTimelineSegment {
  readonly eventIdPrefix: string;
  readonly sequenceIdPrefix: string;
  readonly startMinute: number;
  readonly tickOffset: number;
  readonly period: MatchEvent["timestamp"]["period"];
  readonly includeKickoff: boolean;
  readonly segmentState?: FullMatchSegmentState;
  readonly segmentInfluence?: FullMatchSegmentInfluence;
  readonly chainSegmentContext?: FullMatchChainSegmentContext;
  readonly routeCandidateInfluence?: FullMatchChainRouteCandidateInfluenceResult;
  readonly shadowRouteSelection?: FullMatchShadowRouteSelectionResult;
  readonly controlledSegmentSelection?: FullMatchControlledSegmentSelectionResult;
  readonly segmentRouteInput?: FullMatchSegmentRouteInput;
  readonly controlledMiniMatchRouteSource?: FullMatchControlledMiniMatchRouteSource;
  readonly liveSelectionOverrideGuard?: FullMatchLiveSelectionOverrideGuard;
  readonly isolatedMiniMatchOverrideExperiment?: FullMatchIsolatedMiniMatchOverrideExperiment;
  readonly controlledSegmentReplayComparison?: FullMatchControlledSegmentReplayComparison;
  readonly realIsolatedSegmentReplay?: FullMatchRealIsolatedSegmentReplay;
  readonly controlledRouteResolutionSandbox?: ControlledRouteResolutionSandbox;
  readonly sandboxScoringOpportunityModel?: SandboxScoringOpportunityModel;
  readonly sandboxScoringEventCandidateModel?: SandboxScoringEventCandidateModel;
  readonly sandboxScoringEventResolutionModel?: SandboxScoringEventResolutionModel;
  readonly attributeDrivenShotResolutionModel?: AttributeDrivenShotResolutionModel;
  readonly goalkeeperResponseModel?: GoalkeeperResponseModel;
}

export interface MatchReportBuilderInput {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly score: ScoreState;
  readonly influence: TacticalPlanInfluence;
  readonly fatigueReport?: FatigueReport;
  readonly generatedFrom: "runMatch" | "runFullMatch";
  readonly reportScope: MatchReport["reportMeta"]["reportScope"];
  readonly limitations?: readonly string[];
}

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function opponentTeamId(teamId: TeamId, homeTeamId: TeamId, awayTeamId: TeamId): TeamId {
  return teamId === homeTeamId ? awayTeamId : homeTeamId;
}

function segmentInfluenceTags(influence: FullMatchSegmentInfluence | undefined): readonly string[] {
  if (influence === undefined) {
    return [];
  }

  const teamValues = [influence.home, influence.away];
  const tags = ["segment_influence_active"];

  if (teamValues.some((team) => team.conditionModifier !== 0 || team.mentalFreshnessModifier !== 0)) {
    tags.push("segment_influence_fatigue");
  }

  if (teamValues.some((team) => team.momentumModifier !== 0 || team.scoringConfidenceModifier !== 0)) {
    tags.push("segment_influence_momentum");
  }

  if (teamValues.some((team) => team.pressureLoadModifier !== 0 || team.defensiveStressModifier !== 0)) {
    tags.push("segment_influence_defensive_stress");
  }

  if (influence.global.repeatedPatternPressure !== 0) {
    tags.push("segment_influence_pattern_pressure");
  }

  return tags;
}

function chainSegmentContextTags(context: FullMatchChainSegmentContext | undefined): readonly string[] {
  if (context === undefined || context.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_context",
    "chain_context_diagnostic_only",
    "chain_context_segment_1",
    "chain_context_score_mutation_forbidden",
    "chain_context_scoring_events_mutation_forbidden",
    ...(context.chainId === undefined ? [] : [`chain_context_chain_id_${context.chainId}`]),
    ...(context.finalCarrierId === undefined ? [] : [`chain_context_final_carrier_${context.finalCarrierId}`]),
    ...(context.finalZone === undefined ? [] : [`chain_context_final_zone_${context.finalZone}`]),
    `chain_context_status_${context.status}`,
    `chain_context_consumed_steps_${context.consumedStepCount}`,
    `chain_context_spatial_steps_${context.spatialSelectionStepCount}`,
    ...context.tags,
  ];
}

function chainSegmentContextReason(context: FullMatchChainSegmentContext | undefined): string {
  if (context === undefined || context.status === "not_available") {
    return "";
  }

  return ` Experimental workbench-chain context available: final carrier ${context.finalCarrierId ?? "none"} at ${context.finalZone ?? "none"} after ${context.chainId ?? "unknown-chain"}. Diagnostic-only; does not mutate score.`;
}

function routeCandidateInfluenceTags(influence: FullMatchChainRouteCandidateInfluenceResult | undefined): readonly string[] {
  if (influence === undefined || influence.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_route_candidate_influence",
    "route_candidate_influence_diagnostic_only",
    "route_candidate_influence_segment_1",
    "route_candidate_influence_score_mutation_forbidden",
    "route_candidate_influence_scoring_events_mutation_forbidden",
    "route_candidate_influence_production_selection_forbidden",
    "route_candidate_influence_closed_override_blocked",
    "route_candidate_influence_unavailable_override_blocked",
    ...(influence.chainId === undefined ? [] : [`route_candidate_influence_chain_id_${influence.chainId}`]),
    ...(influence.finalCarrierId === undefined ? [] : [`route_candidate_influence_final_carrier_${influence.finalCarrierId}`]),
    ...(influence.finalZone === undefined ? [] : [`route_candidate_influence_final_zone_${influence.finalZone}`]),
    `route_candidate_influence_status_${influence.status}`,
    `route_candidate_influence_candidate_count_${influence.candidateCount}`,
    `route_candidate_influence_influenced_count_${influence.influencedCandidateCount}`,
  ];
}

function routeCandidateInfluenceReason(influence: FullMatchChainRouteCandidateInfluenceResult | undefined): string {
  if (influence === undefined || influence.status === "not_available") {
    return "";
  }

  return ` Experimental route-candidate influence available: ${influence.influencedCandidateCount}/${influence.candidateCount} diagnostic candidates receive bounded deltas; closed or unavailable routes remain blocked. Diagnostic-only; does not drive production selection.`;
}

function shadowRouteSelectionTags(selection: FullMatchShadowRouteSelectionResult | undefined): readonly string[] {
  if (selection === undefined || selection.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_shadow_route_selection",
    "shadow_route_selection_diagnostic_only",
    `shadow_route_selection_changed_${selection.shadowSelectionChangedFromProduction ? "true" : "false"}`,
    ...(selection.shadowSelectionCandidateId === undefined ? [] : [`shadow_route_selection_candidate_${selection.shadowSelectionCandidateId}`]),
    ...(selection.shadowSelectionActionType === undefined ? [] : [`shadow_route_selection_action_${selection.shadowSelectionActionType}`]),
    ...(selection.shadowSelectionReceiverId === undefined ? [] : [`shadow_route_selection_receiver_${selection.shadowSelectionReceiverId}`]),
    ...(selection.shadowSelectionTargetZone === undefined ? [] : [`shadow_route_selection_zone_${selection.shadowSelectionTargetZone}`]),
    "shadow_route_selection_production_forbidden",
    "shadow_route_selection_score_mutation_forbidden",
    "shadow_route_selection_scoring_events_mutation_forbidden",
    "shadow_route_selection_closed_candidates_rejected",
    "shadow_route_selection_unavailable_candidates_rejected",
    ...selection.tags,
  ];
}

function shadowRouteSelectionReason(selection: FullMatchShadowRouteSelectionResult | undefined): string {
  if (selection === undefined || selection.status === "not_available") {
    return "";
  }

  return ` Experimental shadow route selection available: production proxy ${selection.productionSelectionCandidateId ?? "none"} vs shadow ${selection.shadowSelectionCandidateId ?? "none"} (${selection.shadowSelectionActionType ?? "none"}). ${selection.explanation} Diagnostic-only; does not drive production selection.`;
}

function controlledSegmentSelectionTags(selection: FullMatchControlledSegmentSelectionResult | undefined): readonly string[] {
  if (selection === undefined || selection.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_controlled_segment_selection",
    "controlled_segment_selection_experimental",
    "controlled_segment_selection_diagnostic_only",
    ...(selection.selectedCandidateId === undefined ? [] : [`controlled_segment_selection_candidate_${selection.selectedCandidateId}`]),
    ...(selection.selectedActionType === undefined ? [] : [`controlled_segment_selection_action_${selection.selectedActionType}`]),
    ...(selection.selectedReceiverId === undefined ? [] : [`controlled_segment_selection_receiver_${selection.selectedReceiverId}`]),
    ...(selection.selectedTargetZone === undefined ? [] : [`controlled_segment_selection_zone_${selection.selectedTargetZone}`]),
    "controlled_segment_selection_score_mutation_forbidden",
    "controlled_segment_selection_scoring_events_mutation_forbidden",
    "controlled_segment_selection_route_success_mutation_forbidden",
    "controlled_segment_selection_production_fullmatch_forbidden",
    "controlled_segment_selection_closed_candidates_rejected",
    "controlled_segment_selection_unavailable_candidates_rejected",
    ...selection.tags,
  ];
}

function controlledSegmentSelectionReason(selection: FullMatchControlledSegmentSelectionResult | undefined): string {
  if (selection === undefined || selection.status === "not_available") {
    return "";
  }

  return ` Experimental controlled segment selection available: ${selection.selectedActionType ?? "none"} via ${selection.selectedCandidateId ?? "none"} to ${selection.selectedReceiverId ?? "none"} in ${selection.selectedTargetZone ?? "none"}. Diagnostic-only; does not drive production full-match selection, score, scoring events, or route success rates.`;
}

function segmentRouteInputTags(input: FullMatchSegmentRouteInput | undefined): readonly string[] {
  if (input === undefined || input.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_segment_route_input",
    "segment_route_input_experimental",
    "segment_route_input_diagnostic_only",
    ...(input.candidateId === undefined ? [] : [`segment_route_input_candidate_${input.candidateId}`]),
    ...(input.actionType === undefined ? [] : [`segment_route_input_action_${input.actionType}`]),
    ...(input.receiverId === undefined ? [] : [`segment_route_input_receiver_${input.receiverId}`]),
    ...(input.targetZone === undefined ? [] : [`segment_route_input_zone_${input.targetZone}`]),
    "segment_route_input_score_mutation_forbidden",
    "segment_route_input_scoring_events_mutation_forbidden",
    "segment_route_input_route_success_mutation_forbidden",
    "segment_route_input_production_fullmatch_forbidden",
    "segment_route_input_production_resolution_forbidden",
    "segment_route_input_closed_candidates_rejected",
    "segment_route_input_unavailable_candidates_rejected",
    ...input.tags,
  ];
}

function segmentRouteInputReason(input: FullMatchSegmentRouteInput | undefined): string {
  if (input === undefined || input.status === "not_available") {
    return "";
  }

  return ` Experimental segment route input available: ${input.actionType ?? "none"} to ${input.receiverId ?? "none"} in ${input.targetZone ?? "none"} from ${input.candidateId ?? "none"}. Diagnostic-only; does not drive production route resolution, score, scoring events, or route success rates.`;
}

function controlledMiniMatchRouteSourceTags(source: FullMatchControlledMiniMatchRouteSource | undefined): readonly string[] {
  if (source === undefined || source.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_controlled_minimatch_route_source",
    "controlled_minimatch_route_source_experimental",
    "controlled_minimatch_route_source_diagnostic_only",
    ...(source.candidateId === undefined ? [] : [`controlled_minimatch_route_source_candidate_${source.candidateId}`]),
    ...(source.actionType === undefined ? [] : [`controlled_minimatch_route_source_action_${source.actionType}`]),
    ...(source.receiverId === undefined ? [] : [`controlled_minimatch_route_source_receiver_${source.receiverId}`]),
    ...(source.targetZone === undefined ? [] : [`controlled_minimatch_route_source_zone_${source.targetZone}`]),
    "controlled_minimatch_route_source_score_mutation_forbidden",
    "controlled_minimatch_route_source_scoring_events_mutation_forbidden",
    "controlled_minimatch_route_source_route_success_mutation_forbidden",
    "controlled_minimatch_route_source_production_fullmatch_forbidden",
    "controlled_minimatch_route_source_production_resolution_forbidden",
    "controlled_minimatch_route_source_live_resolution_forbidden",
    "controlled_minimatch_route_source_closed_candidates_rejected",
    "controlled_minimatch_route_source_unavailable_candidates_rejected",
    ...source.tags,
  ];
}

function controlledMiniMatchRouteSourceReason(source: FullMatchControlledMiniMatchRouteSource | undefined): string {
  if (source === undefined || source.status === "not_available") {
    return "";
  }

  return ` Experimental controlled mini-match route source available: ${source.actionType ?? "none"} to ${source.receiverId ?? "none"} in ${source.targetZone ?? "none"} from ${source.candidateId ?? "none"}. Diagnostic-only; does not drive live mini-match resolution, production route resolution, score, scoring events, or route success rates.`;
}

function liveSelectionOverrideGuardTags(guard: FullMatchLiveSelectionOverrideGuard | undefined): readonly string[] {
  if (guard === undefined || guard.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_live_selection_override_guard",
    "live_selection_override_guard_experimental",
    "live_selection_override_guard_diagnostic_only",
    ...(guard.overrideCandidateId === undefined ? [] : [`live_selection_override_candidate_${guard.overrideCandidateId}`]),
    ...(guard.overrideActionType === undefined ? [] : [`live_selection_override_action_${guard.overrideActionType}`]),
    ...(guard.overrideReceiverId === undefined ? [] : [`live_selection_override_receiver_${guard.overrideReceiverId}`]),
    ...(guard.overrideTargetZone === undefined ? [] : [`live_selection_override_zone_${guard.overrideTargetZone}`]),
    `live_selection_override_applied_${guard.overrideAppliedToLiveSelection ? "true" : "false"}`,
    "live_selection_override_score_mutation_forbidden",
    "live_selection_override_scoring_events_mutation_forbidden",
    "live_selection_override_route_success_mutation_forbidden",
    "live_selection_override_production_fullmatch_forbidden",
    "live_selection_override_production_resolution_forbidden",
    "live_selection_override_normal_live_resolution_forbidden",
    "live_selection_override_scoring_event_creation_forbidden",
    "live_selection_override_closed_candidates_rejected",
    "live_selection_override_unavailable_candidates_rejected",
    ...guard.tags,
  ];
}

function liveSelectionOverrideGuardReason(guard: FullMatchLiveSelectionOverrideGuard | undefined): string {
  if (guard === undefined || guard.status === "not_available") {
    return "";
  }

  return ` Experimental live selection override guard available: ${guard.overrideActionType ?? "none"} to ${guard.overrideReceiverId ?? "none"} in ${guard.overrideTargetZone ?? "none"} from ${guard.overrideCandidateId ?? "none"}. Diagnostic-only and not applied; does not drive normal live mini-match resolution, production route resolution, score, scoring events, scoring-event creation, or route success rates.`;
}

function isolatedMiniMatchOverrideExperimentTags(experiment: FullMatchIsolatedMiniMatchOverrideExperiment | undefined): readonly string[] {
  if (experiment === undefined || experiment.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_isolated_minimatch_override_experiment",
    "isolated_minimatch_override_experiment",
    ...(experiment.baselineCandidateId === undefined ? [] : [`isolated_override_baseline_candidate_${experiment.baselineCandidateId}`]),
    ...(experiment.overrideCandidateId === undefined ? [] : [`isolated_override_candidate_${experiment.overrideCandidateId}`]),
    ...(experiment.overrideActionType === undefined ? [] : [`isolated_override_action_${experiment.overrideActionType}`]),
    ...(experiment.overrideReceiverId === undefined ? [] : [`isolated_override_receiver_${experiment.overrideReceiverId}`]),
    ...(experiment.overrideTargetZone === undefined ? [] : [`isolated_override_zone_${experiment.overrideTargetZone}`]),
    `isolated_override_applied_in_experiment_${experiment.overrideAppliedInIsolatedExperiment ? "true" : "false"}`,
    `isolated_override_applied_to_normal_live_${experiment.overrideAppliedToNormalLiveSelection ? "true" : "false"}`,
    "isolated_override_normal_score_mutation_forbidden",
    "isolated_override_normal_scoring_events_mutation_forbidden",
    "isolated_override_production_resolution_forbidden",
    "isolated_override_global_route_success_mutation_forbidden",
    "isolated_override_production_scoring_event_creation_forbidden",
    "isolated_override_global_economy_claim_forbidden",
    "isolated_override_closed_candidates_rejected",
    "isolated_override_unavailable_candidates_rejected",
    ...experiment.tags,
  ];
}

function isolatedMiniMatchOverrideExperimentReason(experiment: FullMatchIsolatedMiniMatchOverrideExperiment | undefined): string {
  if (experiment === undefined || experiment.status === "not_available") {
    return "";
  }

  return ` Isolated mini-match override experiment available: baseline ${experiment.baselineCandidateId ?? "none"} vs override ${experiment.overrideCandidateId ?? "none"} (${experiment.overrideActionType ?? "none"}) to ${experiment.overrideReceiverId ?? "none"} in ${experiment.overrideTargetZone ?? "none"}. Applied only inside isolated experiment; not applied to normal live selection and cannot mutate normal full-match score, official scoring events, production route resolution, or global route success rates.`;
}

function controlledSegmentReplayComparisonTags(comparison: FullMatchControlledSegmentReplayComparison | undefined): readonly string[] {
  if (comparison === undefined || comparison.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_controlled_segment_replay_comparison",
    "controlled_segment_replay_comparison",
    ...(comparison.baseline.candidateId === undefined ? [] : [`controlled_replay_baseline_candidate_${comparison.baseline.candidateId}`]),
    ...(comparison.baseline.actionType === undefined ? [] : [`controlled_replay_baseline_action_${comparison.baseline.actionType}`]),
    ...(comparison.baseline.receiverId === undefined ? [] : [`controlled_replay_baseline_receiver_${comparison.baseline.receiverId}`]),
    ...(comparison.baseline.targetZone === undefined ? [] : [`controlled_replay_baseline_zone_${comparison.baseline.targetZone}`]),
    ...(comparison.override.candidateId === undefined ? [] : [`controlled_replay_override_candidate_${comparison.override.candidateId}`]),
    ...(comparison.override.actionType === undefined ? [] : [`controlled_replay_override_action_${comparison.override.actionType}`]),
    ...(comparison.override.receiverId === undefined ? [] : [`controlled_replay_override_receiver_${comparison.override.receiverId}`]),
    ...(comparison.override.targetZone === undefined ? [] : [`controlled_replay_override_zone_${comparison.override.targetZone}`]),
    `controlled_replay_selection_divergence_${comparison.selectionDivergenceObserved ? "true" : "false"}`,
    `controlled_replay_possession_continuity_divergence_${comparison.possessionContinuityDivergenceObserved ? "true" : "false"}`,
    `controlled_replay_zone_progression_divergence_${comparison.zoneProgressionDivergenceObserved ? "true" : "false"}`,
    `controlled_replay_danger_creation_divergence_${comparison.dangerCreationDivergenceObserved ? "true" : "false"}`,
    `controlled_replay_scoring_opportunity_divergence_${comparison.scoringOpportunityDivergenceObserved ? "true" : "false"}`,
    `controlled_replay_timeline_divergence_${comparison.timelineDivergenceObserved ? "true" : "false"}`,
    `controlled_replay_score_divergence_${comparison.scoreDivergenceObserved ? "true" : "false"}`,
    `controlled_replay_scoring_event_divergence_${comparison.scoringEventDivergenceObserved ? "true" : "false"}`,
    `controlled_replay_applied_only_in_isolated_comparison_${comparison.replayAppliedOnlyInIsolatedComparison ? "true" : "false"}`,
    `controlled_replay_applied_to_normal_live_${comparison.replayAppliedToNormalLiveSelection ? "true" : "false"}`,
    "controlled_replay_normal_score_mutation_forbidden",
    "controlled_replay_normal_scoring_events_mutation_forbidden",
    "controlled_replay_production_resolution_forbidden",
    "controlled_replay_global_route_success_mutation_forbidden",
    "controlled_replay_production_scoring_event_creation_forbidden",
    "controlled_replay_global_economy_claim_forbidden",
    "controlled_replay_closed_candidates_rejected",
    "controlled_replay_unavailable_candidates_rejected",
    ...comparison.tags,
  ];
}

function controlledSegmentReplayComparisonReason(comparison: FullMatchControlledSegmentReplayComparison | undefined): string {
  if (comparison === undefined || comparison.status === "not_available") {
    return "";
  }

  return ` Controlled segment replay comparison available: baseline ${comparison.baseline.actionType ?? "none"} to ${comparison.baseline.receiverId ?? "none"} in ${comparison.baseline.targetZone ?? "none"} versus override ${comparison.override.actionType ?? "none"} to ${comparison.override.receiverId ?? "none"} in ${comparison.override.targetZone ?? "none"}. Selection divergence ${comparison.selectionDivergenceObserved ? "observed" : "not observed"}; zone progression divergence ${comparison.zoneProgressionDivergenceObserved ? "observed" : "not observed"}; danger creation divergence ${comparison.dangerCreationDivergenceObserved ? "observed" : "not observed"}. Isolated comparison only; not applied to normal live selection and cannot mutate normal full-match score, official scoring events, production route resolution, or global route success rates.`;
}

function realIsolatedSegmentReplayTags(replay: FullMatchRealIsolatedSegmentReplay | undefined): readonly string[] {
  if (replay === undefined || replay.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_real_isolated_segment_replay",
    "real_isolated_segment_replay",
    ...(replay.baseline.candidateId === undefined ? [] : [`real_isolated_replay_baseline_candidate_${replay.baseline.candidateId}`]),
    ...(replay.baseline.actionType === undefined ? [] : [`real_isolated_replay_baseline_action_${replay.baseline.actionType}`]),
    ...(replay.baseline.receiverId === undefined ? [] : [`real_isolated_replay_baseline_receiver_${replay.baseline.receiverId}`]),
    ...(replay.baseline.targetZone === undefined ? [] : [`real_isolated_replay_baseline_zone_${replay.baseline.targetZone}`]),
    ...(replay.baseline.resultingCarrierId === undefined ? [] : [`real_isolated_replay_baseline_resulting_carrier_${replay.baseline.resultingCarrierId}`]),
    ...(replay.baseline.resultingZone === undefined ? [] : [`real_isolated_replay_baseline_resulting_zone_${replay.baseline.resultingZone}`]),
    `real_isolated_replay_baseline_event_count_${replay.baselineEventCount}`,
    ...(replay.override.candidateId === undefined ? [] : [`real_isolated_replay_override_candidate_${replay.override.candidateId}`]),
    ...(replay.override.actionType === undefined ? [] : [`real_isolated_replay_override_action_${replay.override.actionType}`]),
    ...(replay.override.receiverId === undefined ? [] : [`real_isolated_replay_override_receiver_${replay.override.receiverId}`]),
    ...(replay.override.targetZone === undefined ? [] : [`real_isolated_replay_override_zone_${replay.override.targetZone}`]),
    ...(replay.override.resultingCarrierId === undefined ? [] : [`real_isolated_replay_override_resulting_carrier_${replay.override.resultingCarrierId}`]),
    ...(replay.override.resultingZone === undefined ? [] : [`real_isolated_replay_override_resulting_zone_${replay.override.resultingZone}`]),
    `real_isolated_replay_override_event_count_${replay.overrideEventCount}`,
    ...(replay.baselineEventCount > 0 ? ["real_isolated_replay_baseline_events_present"] : []),
    ...(replay.overrideEventCount > 0 ? ["real_isolated_replay_override_events_present"] : []),
    `real_isolated_replay_selection_divergence_${replay.selectionDivergenceObserved ? "true" : "false"}`,
    `real_isolated_replay_possession_continuity_divergence_${replay.possessionContinuityDivergenceObserved ? "true" : "false"}`,
    `real_isolated_replay_carrier_divergence_${replay.carrierDivergenceObserved ? "true" : "false"}`,
    `real_isolated_replay_zone_progression_divergence_${replay.zoneProgressionDivergenceObserved ? "true" : "false"}`,
    `real_isolated_replay_danger_creation_divergence_${replay.dangerCreationDivergenceObserved ? "true" : "false"}`,
    `real_isolated_replay_scoring_opportunity_divergence_${replay.scoringOpportunityDivergenceObserved ? "true" : "false"}`,
    `real_isolated_replay_timeline_divergence_${replay.isolatedTimelineDivergenceObserved ? "true" : "false"}`,
    `real_isolated_replay_score_divergence_${replay.isolatedScoreDivergenceObserved ? "true" : "false"}`,
    `real_isolated_replay_scoring_event_divergence_${replay.isolatedScoringEventDivergenceObserved ? "true" : "false"}`,
    `real_isolated_replay_applied_only_in_isolated_engine_${replay.replayAppliedOnlyInIsolatedEngine ? "true" : "false"}`,
    `real_isolated_replay_applied_to_normal_live_${replay.replayAppliedToNormalLiveSelection ? "true" : "false"}`,
    "real_isolated_replay_official_timeline_injection_forbidden",
    "real_isolated_replay_official_score_mutation_forbidden",
    "real_isolated_replay_official_scoring_events_mutation_forbidden",
    "real_isolated_replay_production_resolution_forbidden",
    "real_isolated_replay_global_route_success_mutation_forbidden",
    "real_isolated_replay_production_scoring_event_creation_forbidden",
    "real_isolated_replay_global_economy_claim_forbidden",
    "isolated_events_injected_into_official_timeline_count_0",
    "official_score_mutation_count_0",
    "official_scoring_event_mutation_count_0",
    "production_scoring_event_creation_count_0",
    "production_route_resolution_mutation_count_0",
    "global_route_success_mutation_count_0",
    "global_economy_claim_count_0",
    ...replay.tags,
  ];
}

function realIsolatedSegmentReplayReason(replay: FullMatchRealIsolatedSegmentReplay | undefined): string {
  if (replay === undefined || replay.status === "not_available") {
    return "";
  }

  return ` Real isolated segment replay available: baseline generated ${replay.baselineEventCount} isolated event(s) for ${replay.baseline.actionType ?? "none"} to ${replay.baseline.receiverId ?? "none"} in ${replay.baseline.targetZone ?? "none"}; override generated ${replay.overrideEventCount} isolated event(s) for ${replay.override.actionType ?? "none"} to ${replay.override.receiverId ?? "none"} in ${replay.override.targetZone ?? "none"}. These isolated replay events are experimental-only metadata and are not official MatchEvents, not inserted into the official timeline, and cannot mutate official score, official scoring events, production route resolution, or global economy proof.`;
}

function controlledRouteResolutionSandboxTags(
  sandbox: ControlledRouteResolutionSandbox | undefined,
): readonly string[] {
  if (sandbox === undefined || sandbox.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_controlled_route_resolution_sandbox",
    "controlled_route_resolution_sandbox",
    ...(sandbox.baseline.candidateId === undefined ? [] : [`sandbox_baseline_candidate_${sandbox.baseline.candidateId}`]),
    ...(sandbox.baseline.actionType === undefined ? [] : [`sandbox_baseline_action_${sandbox.baseline.actionType}`]),
    ...(sandbox.baseline.receiverId === undefined ? [] : [`sandbox_baseline_receiver_${sandbox.baseline.receiverId}`]),
    ...(sandbox.baseline.targetZone === undefined ? [] : [`sandbox_baseline_zone_${sandbox.baseline.targetZone}`]),
    `sandbox_baseline_outcome_${sandbox.baseline.outcome}`,
    ...(sandbox.override.candidateId === undefined ? [] : [`sandbox_override_candidate_${sandbox.override.candidateId}`]),
    ...(sandbox.override.actionType === undefined ? [] : [`sandbox_override_action_${sandbox.override.actionType}`]),
    ...(sandbox.override.receiverId === undefined ? [] : [`sandbox_override_receiver_${sandbox.override.receiverId}`]),
    ...(sandbox.override.targetZone === undefined ? [] : [`sandbox_override_zone_${sandbox.override.targetZone}`]),
    `sandbox_override_outcome_${sandbox.override.outcome}`,
    `sandbox_baseline_resolved_${sandbox.baselineResolved ? "true" : "false"}`,
    `sandbox_override_resolved_${sandbox.overrideResolved ? "true" : "false"}`,
    `sandbox_selection_divergence_${sandbox.selectionDivergenceObserved ? "true" : "false"}`,
    `sandbox_carrier_divergence_${sandbox.carrierDivergenceObserved ? "true" : "false"}`,
    `sandbox_zone_progression_divergence_${sandbox.zoneProgressionDivergenceObserved ? "true" : "false"}`,
    `sandbox_danger_creation_divergence_${sandbox.dangerCreationDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_opportunity_divergence_${sandbox.scoringOpportunityDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_event_divergence_${sandbox.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
    `sandbox_score_divergence_${sandbox.sandboxScoreDivergenceObserved ? "true" : "false"}`,
    `sandbox_applied_only_in_isolated_resolution_${sandbox.sandboxAppliedOnlyInIsolatedResolution ? "true" : "false"}`,
    `sandbox_applied_to_normal_live_${sandbox.sandboxAppliedToNormalLiveSelection ? "true" : "false"}`,
    "sandbox_official_timeline_injection_forbidden",
    "sandbox_official_score_mutation_forbidden",
    "sandbox_official_scoring_events_mutation_forbidden",
    "sandbox_production_scoring_event_creation_forbidden",
    "sandbox_production_resolution_forbidden",
    "sandbox_global_route_success_mutation_forbidden",
    "sandbox_global_economy_claim_forbidden",
    "sandbox_closed_candidates_rejected",
    "sandbox_unavailable_candidates_rejected",
    "sandbox_events_injected_into_official_timeline_count_0",
    "sandbox_official_score_mutation_count_0",
    "sandbox_official_scoring_event_mutation_count_0",
    "sandbox_production_scoring_event_creation_count_0",
    "sandbox_production_route_resolution_mutation_count_0",
    "sandbox_global_route_success_mutation_count_0",
    "sandbox_global_economy_claim_count_0",
    ...sandbox.tags,
  ];
}

function controlledRouteResolutionSandboxReason(
  sandbox: ControlledRouteResolutionSandbox | undefined,
): string {
  if (sandbox === undefined || sandbox.status === "not_available") {
    return "";
  }

  return ` Controlled route resolution sandbox available: baseline ${sandbox.baseline.outcome} for ${sandbox.baseline.actionType ?? "none"} to ${sandbox.baseline.receiverId ?? "none"} in ${sandbox.baseline.targetZone ?? "none"} with danger probability ${sandbox.baseline.dangerProbability}/100; override ${sandbox.override.outcome} for ${sandbox.override.actionType ?? "none"} to ${sandbox.override.receiverId ?? "none"} in ${sandbox.override.targetZone ?? "none"} with danger probability ${sandbox.override.dangerProbability}/100. Sandbox results are isolated-only, not official MatchEvents, not applied to normal live selection, and cannot mutate official score, official scoring events, production route resolution, route success rates, or global economy proof.`;
}

function sandboxScoringOpportunityModelTags(
  model: SandboxScoringOpportunityModel | undefined,
): readonly string[] {
  if (model === undefined || model.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_sandbox_scoring_opportunity_model",
    "sandbox_scoring_opportunity_model",
    ...(model.baseline.candidateId === undefined ? [] : [`sandbox_opportunity_baseline_candidate_${model.baseline.candidateId}`]),
    ...(model.baseline.actionType === undefined ? [] : [`sandbox_opportunity_baseline_action_${model.baseline.actionType}`]),
    ...(model.baseline.receiverId === undefined ? [] : [`sandbox_opportunity_baseline_receiver_${model.baseline.receiverId}`]),
    ...(model.baseline.targetZone === undefined ? [] : [`sandbox_opportunity_baseline_zone_${model.baseline.targetZone}`]),
    ...(model.baseline.routeOutcome === undefined ? [] : [`sandbox_opportunity_baseline_route_outcome_${model.baseline.routeOutcome}`]),
    `sandbox_opportunity_baseline_type_${model.baseline.opportunityType}`,
    `sandbox_opportunity_baseline_family_${model.baseline.opportunityFamily}`,
    `sandbox_opportunity_baseline_probability_${model.baseline.opportunityProbability}`,
    `sandbox_opportunity_baseline_created_${model.baseline.opportunityCreated ? "true" : "false"}`,
    `sandbox_opportunity_baseline_source_danger_probability_${model.baseline.sourceDangerProbability}`,
    `sandbox_opportunity_baseline_source_scoring_opportunity_probability_${model.baseline.sourceScoringOpportunityProbability}`,
    ...(model.override.candidateId === undefined ? [] : [`sandbox_opportunity_override_candidate_${model.override.candidateId}`]),
    ...(model.override.actionType === undefined ? [] : [`sandbox_opportunity_override_action_${model.override.actionType}`]),
    ...(model.override.receiverId === undefined ? [] : [`sandbox_opportunity_override_receiver_${model.override.receiverId}`]),
    ...(model.override.targetZone === undefined ? [] : [`sandbox_opportunity_override_zone_${model.override.targetZone}`]),
    ...(model.override.routeOutcome === undefined ? [] : [`sandbox_opportunity_override_route_outcome_${model.override.routeOutcome}`]),
    `sandbox_opportunity_override_type_${model.override.opportunityType}`,
    `sandbox_opportunity_override_family_${model.override.opportunityFamily}`,
    `sandbox_opportunity_override_probability_${model.override.opportunityProbability}`,
    `sandbox_opportunity_override_created_${model.override.opportunityCreated ? "true" : "false"}`,
    `sandbox_opportunity_override_source_danger_probability_${model.override.sourceDangerProbability}`,
    `sandbox_opportunity_override_source_scoring_opportunity_probability_${model.override.sourceScoringOpportunityProbability}`,
    `sandbox_opportunity_type_divergence_${model.opportunityTypeDivergenceObserved ? "true" : "false"}`,
    `sandbox_opportunity_family_divergence_${model.opportunityFamilyDivergenceObserved ? "true" : "false"}`,
    `sandbox_opportunity_probability_divergence_${model.opportunityProbabilityDivergenceObserved ? "true" : "false"}`,
    `sandbox_opportunity_creation_divergence_${model.opportunityCreationDivergenceObserved ? "true" : "false"}`,
    `sandbox_opportunity_scoring_event_divergence_${model.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
    `sandbox_opportunity_score_divergence_${model.sandboxScoreDivergenceObserved ? "true" : "false"}`,
    "sandbox_opportunity_scoring_event_created_false",
    "sandbox_opportunity_score_delta_0",
    `sandbox_opportunity_applied_only_in_sandbox_${model.modelAppliedOnlyInSandbox ? "true" : "false"}`,
    `sandbox_opportunity_applied_to_normal_live_${model.modelAppliedToNormalLiveSelection ? "true" : "false"}`,
    "sandbox_opportunity_official_timeline_injection_forbidden",
    "sandbox_opportunity_official_score_mutation_forbidden",
    "sandbox_opportunity_official_scoring_events_mutation_forbidden",
    "sandbox_opportunity_production_scoring_event_creation_forbidden",
    "sandbox_opportunity_global_economy_claim_forbidden",
    "sandbox_opportunity_closed_candidates_rejected",
    "sandbox_opportunity_unavailable_candidates_rejected",
    "sandbox_opportunity_injected_into_official_timeline_count_0",
    "sandbox_opportunity_official_score_mutation_count_0",
    "sandbox_opportunity_official_scoring_event_mutation_count_0",
    "sandbox_opportunity_production_scoring_event_creation_count_0",
    "sandbox_opportunity_production_route_resolution_mutation_count_0",
    "sandbox_opportunity_global_route_success_mutation_count_0",
    "sandbox_opportunity_global_economy_claim_count_0",
    ...model.tags,
  ];
}

function sandboxScoringOpportunityModelReason(
  model: SandboxScoringOpportunityModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return ` Sandbox scoring opportunity model available: baseline ${model.baseline.opportunityType} (${model.baseline.opportunityProbability}/100) from ${model.baseline.routeOutcome ?? "none"}; override ${model.override.opportunityType} (${model.override.opportunityProbability}/100) from ${model.override.routeOutcome ?? "none"}. The model is sandbox-only, is not an official MatchEvent, is not applied to normal live selection, creates no production scoring event, and cannot mutate official score, official scoring events, production route resolution, route success rates, or global economy proof.`;
}

function sandboxScoringEventCandidateModelTags(
  model: SandboxScoringEventCandidateModel | undefined,
): readonly string[] {
  if (model === undefined || model.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_sandbox_scoring_event_candidate",
    "sandbox_scoring_event_candidate",
    ...(model.baseline.candidateId === undefined ? [] : [`sandbox_scoring_candidate_baseline_candidate_${model.baseline.candidateId}`]),
    `sandbox_scoring_candidate_baseline_type_${model.baseline.scoringCandidateType}`,
    `sandbox_scoring_candidate_baseline_family_${model.baseline.scoringCandidateFamily}`,
    `sandbox_scoring_candidate_baseline_created_${model.baseline.scoringCandidateCreated ? "true" : "false"}`,
    `sandbox_scoring_candidate_baseline_probability_${model.baseline.scoringCandidateProbability}`,
    `sandbox_scoring_candidate_baseline_conversion_probability_${model.baseline.conversionProbability}`,
    ...(model.baseline.sourceOpportunityType === undefined ? [] : [`sandbox_scoring_candidate_baseline_source_opportunity_type_${model.baseline.sourceOpportunityType}`]),
    ...(model.override.candidateId === undefined ? [] : [`sandbox_scoring_candidate_override_candidate_${model.override.candidateId}`]),
    `sandbox_scoring_candidate_override_type_${model.override.scoringCandidateType}`,
    `sandbox_scoring_candidate_override_family_${model.override.scoringCandidateFamily}`,
    `sandbox_scoring_candidate_override_created_${model.override.scoringCandidateCreated ? "true" : "false"}`,
    `sandbox_scoring_candidate_override_probability_${model.override.scoringCandidateProbability}`,
    `sandbox_scoring_candidate_override_conversion_probability_${model.override.conversionProbability}`,
    ...(model.override.sourceOpportunityType === undefined ? [] : [`sandbox_scoring_candidate_override_source_opportunity_type_${model.override.sourceOpportunityType}`]),
    `sandbox_scoring_candidate_type_divergence_${model.scoringCandidateTypeDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_candidate_family_divergence_${model.scoringCandidateFamilyDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_candidate_probability_divergence_${model.scoringCandidateProbabilityDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_candidate_creation_divergence_${model.scoringCandidateCreationDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_candidate_conversion_probability_divergence_${model.conversionProbabilityDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_event_divergence_${model.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_candidate_score_divergence_${model.sandboxScoreDivergenceObserved ? "true" : "false"}`,
    "sandbox_scoring_event_created_false",
    "sandbox_scoring_candidate_score_delta_0",
    `sandbox_scoring_candidate_applied_only_in_sandbox_${model.modelAppliedOnlyInSandbox ? "true" : "false"}`,
    `sandbox_scoring_candidate_applied_to_normal_live_${model.modelAppliedToNormalLiveSelection ? "true" : "false"}`,
    "sandbox_scoring_candidate_official_timeline_injection_forbidden",
    "sandbox_scoring_candidate_official_score_mutation_forbidden",
    "sandbox_scoring_candidate_official_scoring_events_mutation_forbidden",
    "sandbox_scoring_candidate_production_scoring_event_creation_forbidden",
    "sandbox_scoring_candidate_global_economy_claim_forbidden",
    "sandbox_scoring_candidate_closed_candidates_rejected",
    "sandbox_scoring_candidate_unavailable_candidates_rejected",
    "sandbox_scoring_candidate_injected_into_official_timeline_count_0",
    "sandbox_scoring_candidate_official_score_mutation_count_0",
    "sandbox_scoring_candidate_official_scoring_event_mutation_count_0",
    "sandbox_scoring_candidate_production_scoring_event_creation_count_0",
    "sandbox_scoring_candidate_production_route_resolution_mutation_count_0",
    "sandbox_scoring_candidate_global_route_success_mutation_count_0",
    "sandbox_scoring_candidate_global_economy_claim_count_0",
    ...model.tags,
  ];
}

function sandboxScoringEventCandidateModelReason(
  model: SandboxScoringEventCandidateModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return ` Sandbox scoring event candidate model available: baseline ${model.baseline.scoringCandidateType} with conversion ${model.baseline.conversionProbability}/100; override ${model.override.scoringCandidateType} with conversion ${model.override.conversionProbability}/100. The candidate is sandbox-only, is not an official MatchEvent, is not applied to normal live selection, creates no production scoring event, and cannot mutate official score, official scoring events, production route resolution, route success rates, or global economy proof.`;
}

function sandboxScoringEventResolutionModelTags(
  model: SandboxScoringEventResolutionModel | undefined,
): readonly string[] {
  if (model === undefined || model.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_sandbox_scoring_event_resolution",
    "sandbox_scoring_event_resolution",
    ...(model.baseline.candidateId === undefined ? [] : [`sandbox_scoring_resolution_baseline_candidate_${model.baseline.candidateId}`]),
    `sandbox_scoring_resolution_baseline_source_candidate_type_${model.baseline.sourceScoringCandidateType ?? "none"}`,
    `sandbox_scoring_resolution_baseline_type_${model.baseline.resolutionType}`,
    `sandbox_scoring_resolution_baseline_shot_attempt_${model.baseline.shotAttemptCreated ? "true" : "false"}`,
    `sandbox_scoring_resolution_baseline_shot_quality_${model.baseline.shotQuality}`,
    `sandbox_scoring_resolution_baseline_goalkeeper_response_${model.baseline.goalkeeperResponse}`,
    `sandbox_scoring_resolution_baseline_score_delta_${model.baseline.sandboxScoreDelta}`,
    ...(model.override.candidateId === undefined ? [] : [`sandbox_scoring_resolution_override_candidate_${model.override.candidateId}`]),
    `sandbox_scoring_resolution_override_source_candidate_type_${model.override.sourceScoringCandidateType ?? "none"}`,
    `sandbox_scoring_resolution_override_type_${model.override.resolutionType}`,
    `sandbox_scoring_resolution_override_shot_attempt_${model.override.shotAttemptCreated ? "true" : "false"}`,
    `sandbox_scoring_resolution_override_shot_quality_${model.override.shotQuality}`,
    `sandbox_scoring_resolution_override_goalkeeper_response_${model.override.goalkeeperResponse}`,
    `sandbox_scoring_resolution_override_score_delta_${model.override.sandboxScoreDelta}`,
    `sandbox_scoring_resolution_type_divergence_${model.scoringResolutionTypeDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_resolution_shot_attempt_divergence_${model.shotAttemptCreationDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_resolution_shot_quality_divergence_${model.shotQualityDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_resolution_goalkeeper_response_divergence_${model.goalkeeperResponseDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_event_divergence_${model.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
    `sandbox_scoring_resolution_score_divergence_${model.sandboxScoreDivergenceObserved ? "true" : "false"}`,
    "sandbox_scoring_event_created_false",
    "sandbox_scoring_resolution_score_delta_0",
    `sandbox_scoring_resolution_applied_only_in_sandbox_${model.modelAppliedOnlyInSandbox ? "true" : "false"}`,
    `sandbox_scoring_resolution_applied_to_normal_live_${model.modelAppliedToNormalLiveSelection ? "true" : "false"}`,
    "sandbox_scoring_resolution_official_timeline_injection_forbidden",
    "sandbox_scoring_resolution_official_score_mutation_forbidden",
    "sandbox_scoring_resolution_official_scoring_events_mutation_forbidden",
    "sandbox_scoring_resolution_production_scoring_event_creation_forbidden",
    "sandbox_scoring_resolution_global_economy_claim_forbidden",
    "sandbox_scoring_resolution_closed_candidates_rejected",
    "sandbox_scoring_resolution_unavailable_candidates_rejected",
    "sandbox_scoring_resolution_injected_into_official_timeline_count_0",
    "sandbox_scoring_resolution_official_score_mutation_count_0",
    "sandbox_scoring_resolution_official_scoring_event_mutation_count_0",
    "sandbox_scoring_resolution_production_scoring_event_creation_count_0",
    "sandbox_scoring_resolution_production_route_resolution_mutation_count_0",
    "sandbox_scoring_resolution_global_route_success_mutation_count_0",
    "sandbox_scoring_resolution_global_economy_claim_count_0",
    ...model.tags,
  ];
}

function sandboxScoringEventResolutionModelReason(
  model: SandboxScoringEventResolutionModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return ` Sandbox scoring event resolution model available: baseline ${model.baseline.resolutionType} with shot quality ${model.baseline.shotQuality}/100; override ${model.override.resolutionType} with shot quality ${model.override.shotQuality}/100 and goalkeeper response ${model.override.goalkeeperResponse}. The resolution is sandbox-only, is not an official MatchEvent, is not applied to normal live selection, creates no production scoring event, and cannot mutate official score, official scoring events, production route resolution, route success rates, or global economy proof.`;
}

function attributeDrivenShotResolutionModelTags(
  model: AttributeDrivenShotResolutionModel | undefined,
): readonly string[] {
  if (model === undefined || model.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_attribute_driven_shot_resolution_sandbox",
    "attribute_driven_shot_resolution_sandbox",
    `attribute_driven_shot_model_status_${model.status}`,
    `attribute_driven_shot_model_origin_${model.origin}`,
    `attribute_driven_shot_resolution_baseline_outcome_${model.baseline.outcome}`,
    `attribute_driven_shot_resolution_baseline_shot_attempt_${model.baseline.shotAttemptCreated ? "true" : "false"}`,
    `attribute_driven_shot_resolution_baseline_adjusted_shot_quality_${model.baseline.attributeAdjustedShotQuality}`,
    `attribute_driven_shot_resolution_override_source_candidate_${model.override.sourceScoringCandidateType ?? "none"}`,
    `attribute_driven_shot_resolution_override_shooter_${model.override.shooter.playerId ?? "fallback"}`,
    `attribute_driven_shot_resolution_override_goalkeeper_${model.override.goalkeeper.playerId ?? "fallback"}`,
    `attribute_driven_shot_resolution_override_source_shot_quality_${model.override.sourceShotQuality}`,
    `attribute_driven_shot_resolution_override_adjusted_shot_quality_${model.override.attributeAdjustedShotQuality}`,
    `attribute_driven_shot_resolution_override_goalkeeper_quality_${model.override.attributeAdjustedGoalkeeperResponseQuality}`,
    `attribute_driven_shot_resolution_override_outcome_${model.override.outcome}`,
    `attribute_driven_shot_resolution_override_shooter_attribute_score_${model.override.shooterAttributeScore}`,
    `attribute_driven_shot_resolution_override_goalkeeper_attribute_score_${model.override.goalkeeperAttributeScore}`,
    `attribute_driven_shot_resolution_override_reception_quality_${model.override.receptionQuality}`,
    `attribute_driven_shot_resolution_override_defensive_pressure_${model.override.defensivePressure}`,
    `attribute_driven_shot_resolution_override_zone_modifier_${model.override.zoneShotModifier}`,
    `attribute_driven_shot_resolution_override_fatigue_modifier_${model.override.fatigueModifier}`,
    `attribute_driven_shot_resolution_override_mental_modifier_${model.override.mentalModifier}`,
    `attribute_driven_shot_outcome_divergence_${model.attributeDrivenOutcomeDivergenceObserved ? "true" : "false"}`,
    `attribute_driven_shot_quality_divergence_${model.shotQualityDivergenceObserved ? "true" : "false"}`,
    `attribute_driven_shot_goalkeeper_quality_divergence_${model.goalkeeperQualityDivergenceObserved ? "true" : "false"}`,
    `attribute_driven_shot_attribute_influence_${model.attributeInfluenceObserved ? "true" : "false"}`,
    `attribute_driven_shot_scoring_event_divergence_${model.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
    `attribute_driven_shot_score_divergence_${model.sandboxScoreDivergenceObserved ? "true" : "false"}`,
    "attribute_driven_shot_scoring_event_created_false",
    "attribute_driven_shot_score_delta_0",
    `attribute_driven_shot_model_applied_only_in_sandbox_${model.modelAppliedOnlyInSandbox ? "true" : "false"}`,
    `attribute_driven_shot_model_applied_to_normal_live_${model.modelAppliedToNormalLiveSelection ? "true" : "false"}`,
    "attribute_driven_shot_official_timeline_injection_forbidden",
    "attribute_driven_shot_official_score_mutation_forbidden",
    "attribute_driven_shot_official_scoring_events_mutation_forbidden",
    "attribute_driven_shot_production_scoring_event_creation_forbidden",
    "attribute_driven_shot_production_route_resolution_mutation_forbidden",
    "attribute_driven_shot_global_route_success_mutation_forbidden",
    "attribute_driven_shot_global_economy_claim_forbidden",
    "attribute_driven_shot_closed_candidates_rejected",
    "attribute_driven_shot_unavailable_candidates_rejected",
    "attribute_driven_shot_injected_into_official_timeline_count_0",
    "attribute_driven_shot_official_score_mutation_count_0",
    "attribute_driven_shot_official_scoring_event_mutation_count_0",
    "attribute_driven_shot_production_scoring_event_creation_count_0",
    "attribute_driven_shot_production_route_resolution_mutation_count_0",
    "attribute_driven_shot_global_route_success_mutation_count_0",
    "attribute_driven_shot_global_economy_claim_count_0",
    ...model.tags,
  ];
}

function attributeDrivenShotResolutionModelReason(
  model: AttributeDrivenShotResolutionModel | undefined,
): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return ` Attribute-driven shot resolution sandbox available: shooter ${model.override.shooter.playerId ?? "fallback"} produces adjusted shot quality ${model.override.attributeAdjustedShotQuality}/100 against goalkeeper ${model.override.goalkeeper.playerId ?? "fallback"} response ${model.override.attributeAdjustedGoalkeeperResponseQuality}/100, outcome ${model.override.outcome}. It uses attributes, reception, pressure, target zone, fatigue, and mental freshness, but remains sandbox-only: it is not an official MatchEvent, creates no production scoring event, changes no official score, and cannot claim global economy proof.`;
}

function goalkeeperResponseModelTags(model: GoalkeeperResponseModel | undefined): readonly string[] {
  if (model === undefined || model.status === "not_available") {
    return [];
  }

  return [
    "workbench_chain_goalkeeper_response_model_sandbox",
    "goalkeeper_response_model_sandbox",
    `goalkeeper_response_model_status_${model.status}`,
    `goalkeeper_response_model_origin_${model.origin}`,
    `goalkeeper_response_baseline_response_type_${model.baseline.responseType}`,
    `goalkeeper_response_baseline_rebound_state_${model.baseline.reboundState}`,
    `goalkeeper_response_override_shooter_${model.override.shooterId ?? "none"}`,
    `goalkeeper_response_override_goalkeeper_${model.override.goalkeeperId ?? "none"}`,
    `goalkeeper_response_override_shot_quality_faced_${model.override.shotQualityFaced}`,
    `goalkeeper_response_override_response_score_${model.override.goalkeeperResponseScore}`,
    `goalkeeper_response_override_save_margin_${model.override.saveMargin}`,
    `goalkeeper_response_override_positioning_${model.override.positioningScore}`,
    `goalkeeper_response_override_trajectory_reading_${model.override.trajectoryReadingScore}`,
    `goalkeeper_response_override_reaction_${model.override.reactionScore}`,
    `goalkeeper_response_override_handling_${model.override.handlingScore}`,
    `goalkeeper_response_override_rebound_control_${model.override.reboundControlScore}`,
    `goalkeeper_response_override_concentration_${model.override.concentrationScore}`,
    `goalkeeper_response_override_mental_fatigue_impact_${model.override.mentalFatigueImpact}`,
    `goalkeeper_response_override_response_type_${model.override.responseType}`,
    `goalkeeper_response_override_rebound_state_${model.override.reboundState}`,
    `goalkeeper_response_attribute_influence_${model.goalkeeperAttributeInfluenceObserved ? "true" : "false"}`,
    `goalkeeper_response_divergence_${model.goalkeeperResponseDivergenceObserved ? "true" : "false"}`,
    `goalkeeper_response_rebound_divergence_${model.reboundStateDivergenceObserved ? "true" : "false"}`,
    `goalkeeper_response_scoring_event_divergence_${model.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
    `goalkeeper_response_score_divergence_${model.sandboxScoreDivergenceObserved ? "true" : "false"}`,
    "goalkeeper_response_scoring_event_created_false",
    "goalkeeper_response_score_delta_0",
    `goalkeeper_response_model_applied_only_in_sandbox_${model.modelAppliedOnlyInSandbox ? "true" : "false"}`,
    `goalkeeper_response_model_applied_to_normal_live_${model.modelAppliedToNormalLiveSelection ? "true" : "false"}`,
    "goalkeeper_response_official_timeline_injection_forbidden",
    "goalkeeper_response_official_score_mutation_forbidden",
    "goalkeeper_response_official_scoring_events_mutation_forbidden",
    "goalkeeper_response_production_scoring_event_creation_forbidden",
    "goalkeeper_response_production_route_resolution_mutation_forbidden",
    "goalkeeper_response_global_route_success_mutation_forbidden",
    "goalkeeper_response_global_economy_claim_forbidden",
    "goalkeeper_response_closed_candidates_rejected",
    "goalkeeper_response_unavailable_candidates_rejected",
    "goalkeeper_response_injected_into_official_timeline_count_0",
    "goalkeeper_response_official_score_mutation_count_0",
    "goalkeeper_response_official_scoring_event_mutation_count_0",
    "goalkeeper_response_production_scoring_event_creation_count_0",
    "goalkeeper_response_production_route_resolution_mutation_count_0",
    "goalkeeper_response_global_route_success_mutation_count_0",
    "goalkeeper_response_global_economy_claim_count_0",
    ...model.tags,
  ];
}

function goalkeeperResponseModelReason(model: GoalkeeperResponseModel | undefined): string {
  if (model === undefined || model.status === "not_available") {
    return "";
  }

  return ` Goalkeeper response model sandbox available: goalkeeper ${model.override.goalkeeperId ?? "fallback"} faces shot quality ${model.override.shotQualityFaced}/100 with response score ${model.override.goalkeeperResponseScore}/100, save margin ${model.override.saveMargin}, response ${model.override.responseType}, rebound ${model.override.reboundState}. It explains positioning, trajectory reading, reaction, handling, rebound control, concentration, and mental fatigue, but remains sandbox-only: it is not an official MatchEvent, creates no production scoring event, changes no official score, and cannot claim global economy proof.`;
}

export function primaryReportZone(input: MatchInput): ZoneId {
  return input.homePlan.targetZones[0] ?? input.awayPlan.targetZones[0] ?? DEFAULT_REPORT_ZONE;
}

function averageCondition(team: TeamSnapshot): Rating {
  if (team.roster.length === 0) {
    // Placeholder until the adapter consumes real runtime player state from the official MatchInput roster.
    return 100;
  }

  return clampRating(team.roster.reduce((total, player) => total + player.currentCondition, 0) / team.roster.length);
}

function kickoffEvent(input: {
  readonly matchInput: MatchInput;
  readonly zone: ZoneId;
  readonly influence: TacticalPlanInfluence;
  readonly segment: MiniMatchTimelineSegment;
}): MatchEvent {
  const teamState = input.segment.segmentState === undefined
    ? undefined
    : teamStateForId(input.segment.segmentState, input.matchInput.homeTeam.teamId);
  return {
    eventId: `${input.matchInput.matchId}-${input.segment.eventIdPrefix}-start`,
    matchId: input.matchInput.matchId,
    timestamp: {
      tick: input.segment.tickOffset,
      minute: input.segment.startMinute,
      period: input.segment.period,
    },
    phase: MatchPhase.InProgress,
    sequenceId: `${input.segment.sequenceIdPrefix}-0`,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    eventType: "kickoff",
    zone: input.zone,
    tacticalContext: {
      pressureLevel: PressureLevel.Low,
      ballZone: input.zone,
      targetZone: input.zone,
      moveType: "adapter_bootstrap",
      reason: `Official tactical plans influence this adapter through sequence count, report zones, and event tags. ${input.influence.explanation}${chainSegmentContextReason(input.segment.chainSegmentContext)}${routeCandidateInfluenceReason(input.segment.routeCandidateInfluence)}${shadowRouteSelectionReason(input.segment.shadowRouteSelection)}${controlledSegmentSelectionReason(input.segment.controlledSegmentSelection)}${segmentRouteInputReason(input.segment.segmentRouteInput)}${controlledMiniMatchRouteSourceReason(input.segment.controlledMiniMatchRouteSource)}${liveSelectionOverrideGuardReason(input.segment.liveSelectionOverrideGuard)}${isolatedMiniMatchOverrideExperimentReason(input.segment.isolatedMiniMatchOverrideExperiment)}${controlledSegmentReplayComparisonReason(input.segment.controlledSegmentReplayComparison)}${realIsolatedSegmentReplayReason(input.segment.realIsolatedSegmentReplay)}${controlledRouteResolutionSandboxReason(input.segment.controlledRouteResolutionSandbox)}${sandboxScoringOpportunityModelReason(input.segment.sandboxScoringOpportunityModel)}${sandboxScoringEventCandidateModelReason(input.segment.sandboxScoringEventCandidateModel)}${sandboxScoringEventResolutionModelReason(input.segment.sandboxScoringEventResolutionModel)}${attributeDrivenShotResolutionModelReason(input.segment.attributeDrivenShotResolutionModel)}${goalkeeperResponseModelReason(input.segment.goalkeeperResponseModel)}`,
    },
    fatigueContext: {
      teamCondition: teamState?.condition ?? averageCondition(input.matchInput.homeTeam),
      ...(teamState === undefined ? {} : {
        primaryPlayerCondition: teamState.condition,
        primaryPlayerMentalFreshness: teamState.mentalFreshness,
        fatiguePressure: teamState.pressureLoad,
      }),
    },
    outcome: "neutral",
    consequences: [],
    tags: [
      "run_match_adapter",
      "adapter_kickoff",
      "temporary_control_blitz_mapping",
      ...input.influence.tags,
      ...(input.segment.segmentState === undefined ? [] : scoreStateTags(input.segment.segmentState.score)),
      ...chainSegmentContextTags(input.segment.chainSegmentContext),
      ...routeCandidateInfluenceTags(input.segment.routeCandidateInfluence),
      ...shadowRouteSelectionTags(input.segment.shadowRouteSelection),
      ...controlledSegmentSelectionTags(input.segment.controlledSegmentSelection),
      ...segmentRouteInputTags(input.segment.segmentRouteInput),
      ...controlledMiniMatchRouteSourceTags(input.segment.controlledMiniMatchRouteSource),
      ...liveSelectionOverrideGuardTags(input.segment.liveSelectionOverrideGuard),
      ...isolatedMiniMatchOverrideExperimentTags(input.segment.isolatedMiniMatchOverrideExperiment),
      ...controlledSegmentReplayComparisonTags(input.segment.controlledSegmentReplayComparison),
      ...realIsolatedSegmentReplayTags(input.segment.realIsolatedSegmentReplay),
      ...controlledRouteResolutionSandboxTags(input.segment.controlledRouteResolutionSandbox),
      ...sandboxScoringOpportunityModelTags(input.segment.sandboxScoringOpportunityModel),
      ...sandboxScoringEventCandidateModelTags(input.segment.sandboxScoringEventCandidateModel),
      ...sandboxScoringEventResolutionModelTags(input.segment.sandboxScoringEventResolutionModel),
      ...attributeDrivenShotResolutionModelTags(input.segment.attributeDrivenShotResolutionModel),
      ...goalkeeperResponseModelTags(input.segment.goalkeeperResponseModel),
    ],
    narrativeWeight: 5,
  };
}

function sequenceRecordTags(record: MiniMatchSequenceRecord): readonly string[] {
  const finalContext = record.result.finalContext;
  const tags = [
    "run_match_adapter",
    "mini_match_sequence",
    `interaction_${finalContext.currentInteraction}`,
    `danger_${finalContext.currentDanger.toLowerCase()}`,
    `stability_${finalContext.possessionStability.toLowerCase()}`,
    `pressure_${finalContext.pressureLevel}`,
  ];

  if (record.result.finishingResult !== null) {
    tags.push("finishing_opportunity");
  }

  if (finalContext.territorialPressure >= 60) {
    tags.push("territorial_pressure_high");
  }

  if (finalContext.chaosLevel >= 60) {
    tags.push("chaos_high");
  }

  return tags;
}

function sequenceRecordToMatchEvent(input: {
  readonly matchInput: MatchInput;
  readonly record: MiniMatchSequenceRecord;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly influence: TacticalPlanInfluence;
  readonly segment: MiniMatchTimelineSegment;
}): MatchEvent {
  const teamId = officialTeamIdForPrototype({
    miniMatchTeamId: input.record.setup.possessionTeam.teamId,
    teamIdMap: input.adapter.teamIdMap,
  });
  const finalContext = input.record.result.finalContext;
  const firstStep = input.record.result.steps[0];
  const ballZoneAfter = input.record.result.steps[input.record.result.steps.length - 1]?.ballContextAfter.ballLocation;
  const segmentStateTags = input.segment.segmentState === undefined ? [] : scoreStateTags(input.segment.segmentState.score);
  const teamState = input.segment.segmentState === undefined ? undefined : teamStateForId(input.segment.segmentState, teamId);
  const tags = [
    ...sequenceRecordTags(input.record),
    ...input.influence.tags,
    ...segmentStateTags,
    ...segmentInfluenceTags(input.segment.segmentInfluence),
    ...chainSegmentContextTags(input.segment.chainSegmentContext),
    ...routeCandidateInfluenceTags(input.segment.routeCandidateInfluence),
    ...shadowRouteSelectionTags(input.segment.shadowRouteSelection),
    ...controlledSegmentSelectionTags(input.segment.controlledSegmentSelection),
    ...segmentRouteInputTags(input.segment.segmentRouteInput),
    ...controlledMiniMatchRouteSourceTags(input.segment.controlledMiniMatchRouteSource),
    ...liveSelectionOverrideGuardTags(input.segment.liveSelectionOverrideGuard),
    ...isolatedMiniMatchOverrideExperimentTags(input.segment.isolatedMiniMatchOverrideExperiment),
    ...controlledSegmentReplayComparisonTags(input.segment.controlledSegmentReplayComparison),
    ...realIsolatedSegmentReplayTags(input.segment.realIsolatedSegmentReplay),
    ...controlledRouteResolutionSandboxTags(input.segment.controlledRouteResolutionSandbox),
    ...sandboxScoringOpportunityModelTags(input.segment.sandboxScoringOpportunityModel),
    ...sandboxScoringEventCandidateModelTags(input.segment.sandboxScoringEventCandidateModel),
    ...sandboxScoringEventResolutionModelTags(input.segment.sandboxScoringEventResolutionModel),
    ...attributeDrivenShotResolutionModelTags(input.segment.attributeDrivenShotResolutionModel),
    ...goalkeeperResponseModelTags(input.segment.goalkeeperResponseModel),
    ...(teamState === undefined ? [] : [`momentum_${teamState.momentum >= 55 ? "positive" : teamState.momentum <= 45 ? "negative" : "neutral"}`]),
  ];
  const timelineTick = input.segment.tickOffset + input.record.sequenceNumber;
  const momentumValue = teamState === undefined ? 0 : Math.round((teamState.momentum - 50) / 10);

  return {
    eventId: `${input.matchInput.matchId}-${input.segment.eventIdPrefix}-sequence-${input.record.sequenceNumber}`,
    matchId: input.matchInput.matchId,
    timestamp: {
      tick: timelineTick,
      minute: input.segment.startMinute + input.record.sequenceNumber,
      period: input.segment.period,
    },
    phase: MatchPhase.InProgress,
    sequenceId: `${input.segment.sequenceIdPrefix}-${input.record.sequenceNumber}`,
    teamId,
    opponentTeamId: opponentTeamId(teamId, input.matchInput.homeTeam.teamId, input.matchInput.awayTeam.teamId),
    eventType: eventTypeFromAdapterTags(tags),
    zone: finalContext.activeZone,
    tacticalContext: {
      pressureLevel: finalContext.pressureLevel,
      ballZone: finalContext.activeZone,
      targetZone: ballZoneAfter ?? finalContext.activeZone,
      moveType: finalContext.currentInteraction,
      reason: `${input.record.setup.openingLine} Final danger ${finalContext.currentDanger}, pressure ${finalContext.pressureLevel}, possession stability ${finalContext.possessionStability}. Score context ${input.segment.segmentState?.score.home ?? 0}-${input.segment.segmentState?.score.away ?? 0}; momentum ${teamState?.momentum ?? 50}. Plan influence: ${input.influence.explanation}${chainSegmentContextReason(input.segment.chainSegmentContext)}${routeCandidateInfluenceReason(input.segment.routeCandidateInfluence)}${shadowRouteSelectionReason(input.segment.shadowRouteSelection)}${controlledSegmentSelectionReason(input.segment.controlledSegmentSelection)}${segmentRouteInputReason(input.segment.segmentRouteInput)}${controlledMiniMatchRouteSourceReason(input.segment.controlledMiniMatchRouteSource)}${liveSelectionOverrideGuardReason(input.segment.liveSelectionOverrideGuard)}${isolatedMiniMatchOverrideExperimentReason(input.segment.isolatedMiniMatchOverrideExperiment)}${controlledSegmentReplayComparisonReason(input.segment.controlledSegmentReplayComparison)}${realIsolatedSegmentReplayReason(input.segment.realIsolatedSegmentReplay)}${controlledRouteResolutionSandboxReason(input.segment.controlledRouteResolutionSandbox)}${sandboxScoringOpportunityModelReason(input.segment.sandboxScoringOpportunityModel)}${sandboxScoringEventCandidateModelReason(input.segment.sandboxScoringEventCandidateModel)}${sandboxScoringEventResolutionModelReason(input.segment.sandboxScoringEventResolutionModel)}${attributeDrivenShotResolutionModelReason(input.segment.attributeDrivenShotResolutionModel)}${goalkeeperResponseModelReason(input.segment.goalkeeperResponseModel)}`,
    },
    fatigueContext: {
      teamCondition: teamState?.condition ?? (teamId === input.matchInput.homeTeam.teamId
        ? averageCondition(input.matchInput.homeTeam)
        : averageCondition(input.matchInput.awayTeam)),
      ...(teamState === undefined ? {} : {
        primaryPlayerCondition: teamState.condition,
        primaryPlayerMentalFreshness: teamState.mentalFreshness,
      }),
      fatiguePressure: Math.max(finalContext.territorialPressure, teamState?.pressureLoad ?? 0),
    },
    outcome: firstStep === undefined || input.record.result.finishingResult === null ? "neutral" : "success",
    consequences: momentumValue === 0
      ? []
      : [
          {
            type: "momentum_change",
            description: `Segment state momentum context changes tactical confidence by ${momentumValue}.`,
            value: momentumValue,
          },
        ],
    tags,
    narrativeWeight: clampRating(25 + finalContext.territorialPressure * 0.35 + finalContext.chaosLevel * 0.15),
  };
}

function scoringEventToMatchEvent(input: {
  readonly matchInput: MatchInput;
  readonly event: MiniMatchScoringEvent;
  readonly index: number;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly zone: ZoneId;
  readonly influence: TacticalPlanInfluence;
  readonly segment: MiniMatchTimelineSegment;
}): MatchEvent {
  const teamId = officialTeamIdForPrototype({
    miniMatchTeamId: input.event.teamId,
    teamIdMap: input.adapter.teamIdMap,
  });
  const teamState = input.segment.segmentState === undefined ? undefined : teamStateForId(input.segment.segmentState, teamId);
  const timelineTick = input.segment.tickOffset + input.event.sequenceNumber;

  return {
    eventId: `${input.matchInput.matchId}-${input.segment.eventIdPrefix}-score-${input.index + 1}`,
    matchId: input.matchInput.matchId,
    timestamp: {
      tick: timelineTick,
      minute: input.segment.startMinute + input.event.sequenceNumber,
      period: input.segment.period,
    },
    phase: MatchPhase.InProgress,
    sequenceId: `${input.segment.sequenceIdPrefix}-${input.event.sequenceNumber}`,
    teamId,
    opponentTeamId: opponentTeamId(teamId, input.matchInput.homeTeam.teamId, input.matchInput.awayTeam.teamId),
    eventType: "scoring",
    zone: input.zone,
    tacticalContext: {
      pressureLevel: PressureLevel.Medium,
      ballZone: input.zone,
      targetZone: input.zone,
      moveType: input.event.scoringType,
      reason:
        `Scoring summary converted into the official MatchEvent shape. Score context before segment ${input.segment.segmentState?.score.home ?? 0}-${input.segment.segmentState?.score.away ?? 0}; momentum ${teamState?.momentum ?? 50}. Plan influence: ${input.influence.explanation}${chainSegmentContextReason(input.segment.chainSegmentContext)}${routeCandidateInfluenceReason(input.segment.routeCandidateInfluence)}${shadowRouteSelectionReason(input.segment.shadowRouteSelection)}${controlledSegmentSelectionReason(input.segment.controlledSegmentSelection)}${segmentRouteInputReason(input.segment.segmentRouteInput)}${controlledMiniMatchRouteSourceReason(input.segment.controlledMiniMatchRouteSource)}${liveSelectionOverrideGuardReason(input.segment.liveSelectionOverrideGuard)}${isolatedMiniMatchOverrideExperimentReason(input.segment.isolatedMiniMatchOverrideExperiment)}${controlledSegmentReplayComparisonReason(input.segment.controlledSegmentReplayComparison)}${realIsolatedSegmentReplayReason(input.segment.realIsolatedSegmentReplay)}${controlledRouteResolutionSandboxReason(input.segment.controlledRouteResolutionSandbox)}${sandboxScoringOpportunityModelReason(input.segment.sandboxScoringOpportunityModel)}${sandboxScoringEventCandidateModelReason(input.segment.sandboxScoringEventCandidateModel)}${sandboxScoringEventResolutionModelReason(input.segment.sandboxScoringEventResolutionModel)}${attributeDrivenShotResolutionModelReason(input.segment.attributeDrivenShotResolutionModel)}${goalkeeperResponseModelReason(input.segment.goalkeeperResponseModel)}`,
    },
    fatigueContext: {
      teamCondition: teamState?.condition ?? (teamId === input.matchInput.homeTeam.teamId
        ? averageCondition(input.matchInput.homeTeam)
        : averageCondition(input.matchInput.awayTeam)),
      ...(teamState === undefined ? {} : {
        primaryPlayerCondition: teamState.condition,
        primaryPlayerMentalFreshness: teamState.mentalFreshness,
        fatiguePressure: teamState.pressureLoad,
      }),
    },
    outcome: "score",
    consequences: [
      {
        type: "score_change",
        description: `${input.event.teamName} scored ${input.event.points} points via ${input.event.scoringType}.`,
        value: input.event.points,
      },
    ],
    tags: [
      "run_match_adapter",
      "mini_match_scoring_event",
      "scoring_event",
      `scoring_type_${input.event.scoringType}`,
      ...input.influence.tags,
      ...(input.segment.segmentState === undefined ? [] : scoreStateTags(input.segment.segmentState.score)),
      ...segmentInfluenceTags(input.segment.segmentInfluence),
      ...chainSegmentContextTags(input.segment.chainSegmentContext),
      ...routeCandidateInfluenceTags(input.segment.routeCandidateInfluence),
      ...shadowRouteSelectionTags(input.segment.shadowRouteSelection),
      ...controlledSegmentSelectionTags(input.segment.controlledSegmentSelection),
      ...segmentRouteInputTags(input.segment.segmentRouteInput),
      ...controlledMiniMatchRouteSourceTags(input.segment.controlledMiniMatchRouteSource),
      ...liveSelectionOverrideGuardTags(input.segment.liveSelectionOverrideGuard),
      ...isolatedMiniMatchOverrideExperimentTags(input.segment.isolatedMiniMatchOverrideExperiment),
      ...controlledSegmentReplayComparisonTags(input.segment.controlledSegmentReplayComparison),
      ...realIsolatedSegmentReplayTags(input.segment.realIsolatedSegmentReplay),
      ...controlledRouteResolutionSandboxTags(input.segment.controlledRouteResolutionSandbox),
      ...sandboxScoringOpportunityModelTags(input.segment.sandboxScoringOpportunityModel),
      ...sandboxScoringEventCandidateModelTags(input.segment.sandboxScoringEventCandidateModel),
      ...sandboxScoringEventResolutionModelTags(input.segment.sandboxScoringEventResolutionModel),
      ...attributeDrivenShotResolutionModelTags(input.segment.attributeDrivenShotResolutionModel),
      ...goalkeeperResponseModelTags(input.segment.goalkeeperResponseModel),
    ],
    narrativeWeight: 70,
  };
}

export function compareTimelineEvents(a: MatchEvent, b: MatchEvent): number {
  if (a.timestamp.minute !== b.timestamp.minute) {
    return a.timestamp.minute - b.timestamp.minute;
  }

  if (a.timestamp.tick !== b.timestamp.tick) {
    return a.timestamp.tick - b.timestamp.tick;
  }

  if (a.eventType === "scoring" && b.eventType !== "scoring") {
    return 1;
  }

  if (a.eventType !== "scoring" && b.eventType === "scoring") {
    return -1;
  }

  return a.eventId.localeCompare(b.eventId);
}

export function timelineFromMiniMatch(input: {
  readonly matchInput: MatchInput;
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly zone: ZoneId;
  readonly influence: TacticalPlanInfluence;
  readonly segment?: MiniMatchTimelineSegment;
}): readonly MatchEvent[] {
  const segment = input.segment ?? {
    eventIdPrefix: "adapter",
    sequenceIdPrefix: "mini-match-sequence",
    startMinute: 0,
    tickOffset: 0,
    period: "first_half",
    includeKickoff: true,
  };

  return [
    ...(segment.includeKickoff ? [kickoffEvent({
      matchInput: input.matchInput,
      zone: input.zone,
      influence: input.influence,
      segment,
    })] : []),
    ...input.miniMatch.state.records.map((record) =>
      sequenceRecordToMatchEvent({
        matchInput: input.matchInput,
        record,
        adapter: input.adapter,
        influence: input.influence,
        segment,
      }),
    ),
    ...input.miniMatch.summary.scoringEvents.map((event, index) =>
      scoringEventToMatchEvent({
        matchInput: input.matchInput,
        event,
        index,
        adapter: input.adapter,
        zone: input.zone,
        influence: input.influence,
        segment,
      }),
    ),
  ].sort(compareTimelineEvents);
}

export function scoreFromMiniMatch(input: {
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
}): ScoreState {
  const homeScore =
    input.adapter.homePrototype.id === input.miniMatch.state.context.teamA.id
      ? input.miniMatch.summary.finalScore.teamA
      : input.miniMatch.summary.finalScore.teamB;
  const awayScore =
    input.adapter.awayPrototype.id === input.miniMatch.state.context.teamA.id
      ? input.miniMatch.summary.finalScore.teamA
      : input.miniMatch.summary.finalScore.teamB;

  return {
    home: homeScore,
    away: awayScore,
  };
}

export function scoreFromTimeline(input: {
  readonly timeline: readonly MatchEvent[];
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
}): ScoreState {
  return input.timeline.reduce(
    (score, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);

      return {
        home: score.home + (event.teamId === input.homeTeamId ? points : 0),
        away: score.away + (event.teamId === input.awayTeamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );
}

function playerStatsForTeam(team: TeamSnapshot): readonly PlayerMatchStats[] {
  return team.roster.map((player) => ({
    playerId: player.playerId,
    teamId: team.teamId,
    // Placeholder: mini-match currently uses prototype rosters internally, so official input players do not yet have runtime minutes.
    minutes: 0,
    actionsInvolved: 0,
    mistakes: 0,
    contributionScore: 0,
  }));
}

function fatigueReport(input: MatchInput): FatigueReport {
  return {
    teamSummaries: [
      {
        teamId: input.homeTeam.teamId,
        averageConditionEnd: averageCondition(input.homeTeam),
        highIntensityLoad: input.homePlan.pressingIntensity,
        lateErrorCount: 0,
      },
      {
        teamId: input.awayTeam.teamId,
        averageConditionEnd: averageCondition(input.awayTeam),
        highIntensityLoad: input.awayPlan.pressingIntensity,
        lateErrorCount: 0,
      },
    ],
    playerSummaries: [...input.homeTeam.roster, ...input.awayTeam.roster].map((player) => ({
      playerId: player.playerId,
      conditionStart: player.currentCondition,
      conditionEnd: player.currentCondition,
      mentalFreshnessEnd: player.mentalFreshness,
    })),
  };
}

function planInfluenceDiagnosis(input: {
  readonly matchInput: MatchInput;
  readonly influence: TacticalPlanInfluence;
  readonly timeline: readonly MatchEvent[];
}): TacticalDiagnosis {
  const evidenceEvent = input.timeline.find((event) => event.eventType !== "kickoff") ?? input.timeline[0];

  return {
    diagnosisId: `${input.matchInput.matchId}-plan-influence-diagnosis`,
    teamId: input.matchInput.homeTeam.teamId,
    title: "Plan de match observé",
    summary: `${input.influence.homeSummary} ${input.influence.awaySummary} ${input.influence.matchEffectSummary}`,
    evidenceEventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: input.influence.targetZoneBias.length > 0 ? input.influence.targetZoneBias : [DEFAULT_REPORT_ZONE],
    confidence: "low",
  };
}

export function buildMatchReport(input: MatchReportBuilderInput): MatchReport {
  const timeline = [...input.timeline].sort(compareTimelineEvents);
  const resolvedFatigueReport = input.fatigueReport ?? fatigueReport(input.matchInput);
  const evidenceFacts = buildCanonicalMatchReportEvidenceFacts({
    matchInput: input.matchInput,
    timeline,
    fatigueReport: resolvedFatigueReport,
    influence: input.influence,
  });
  const coachInsights = createEvidenceDrivenCoachInsights({
    matchInput: input.matchInput,
    facts: evidenceFacts,
  });

  return {
    matchId: input.matchInput.matchId,
    score: input.score,
    evidenceFacts,
    warnings: [],
    reportMeta: {
      reportScope: input.reportScope,
      generatorVersion: "match-report-contract-v2p",
      generatedFrom: input.generatedFrom,
      sourceOfTruthNote: "Final score is derived only from score_change consequences; 50-match economy remains the global scoring reference.",
      limitations: input.limitations ?? [
        "Current adapter still maps the prototype mini-match into the official MatchReport contract.",
      ],
    },
    timeline,
    teamStats: createTeamMatchStatsFromEvents({
      matchInput: input.matchInput,
      timeline,
      miniMatch: input.miniMatch,
      adapter: input.adapter,
      score: input.score,
    }),
    playerStats: [...playerStatsForTeam(input.matchInput.homeTeam), ...playerStatsForTeam(input.matchInput.awayTeam)],
    zoneStats: createZoneStatsFromEvents({ timeline }),
    fatigueReport: resolvedFatigueReport,
    tacticalReport: {
      diagnoses: [
        planInfluenceDiagnosis({
          matchInput: input.matchInput,
          influence: input.influence,
          timeline,
        }),
        ...createEvidenceBasedTacticalDiagnoses({
          matchInput: input.matchInput,
          facts: evidenceFacts,
          fallbackEvents: timeline,
        }),
      ],
    },
    keyMoments: selectKeyMoments({
      matchInput: input.matchInput,
      timeline,
      facts: evidenceFacts,
      coachInsights,
    }),
    coachInsights,
    suggestedFocus: suggestedFocusFromEvidence({
      matchInput: input.matchInput,
      facts: evidenceFacts,
    }),
  };
}
