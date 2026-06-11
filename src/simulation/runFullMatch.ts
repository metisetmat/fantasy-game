import type { FatigueReport, MatchEvent, MatchInput, MatchReport, TacticalDiagnosis } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { MatchReportWarning } from "../contracts/matchReportWarnings";
import {
  coachFacingHarnessWarningSummary,
  coachFacingScoringDominanceSummary,
} from "../reports/coachFacingCopy";
import { runMiniMatch, type MiniMatchResult, type MiniMatchScore, type MiniMatchTeamCount } from "./miniMatch";
import { adaptMatchInputToMiniMatch } from "./adapters/matchInputToMiniMatch";
import {
  buildMatchReport,
  compareTimelineEvents,
  primaryReportZone,
  scoreFromTimeline,
  timelineFromMiniMatch,
  type MiniMatchTimelineSegment,
} from "./adapters/matchReportBuilder";
import {
  createTacticalPlanInfluence,
  primaryZoneFromPlanInfluence,
} from "./adapters/tacticalPlanInfluence";
import { analyzeFullMatchHarnessSanity } from "./diagnostics/fullMatchHarnessSanity";
import { analyzeFullMatchGroundingDiagnostics } from "./diagnostics/fullMatchGroundingDiagnostics";
import {
  buildHarnessWarningEvidenceFacts,
  buildMatchReportWarnings,
} from "./adapters/matchReportWarningsBuilder";
import {
  createInitialFullMatchSegmentState,
  type FullMatchSegmentState,
} from "./fullMatch/fullMatchSegmentState";
import {
  applySegmentFatigueToEvents,
  propagateFullMatchFatigue,
  type FullMatchFatiguePropagationResult,
} from "./fullMatch/fullMatchFatiguePropagation";
import {
  createFullMatchSegmentInfluence,
  type FullMatchSegmentInfluence,
} from "./fullMatch/fullMatchSegmentInfluence";
import {
  fullMatchRouteSelectionModeDiagnostics,
  resolveFullMatchRouteSelectionMode,
  type FullMatchOptions,
} from "./fullMatch/fullMatchRouteSelectionMode";
import { consumeWorkbenchChainForFullMatch } from "./fullMatch/consumeWorkbenchChainForFullMatch";
import type { FullMatchChainConsumptionResult } from "./fullMatch/fullMatchChainConsumption";
import {
  chainConsumptionToSegmentContext,
  type FullMatchChainSegmentContext,
} from "./fullMatch/fullMatchChainSegmentContext";
import {
  applyChainContextToRouteCandidates,
  buildDiagnosticRouteCandidatesForSegment,
} from "./fullMatch/applyChainContextToRouteCandidates";
import type { FullMatchChainRouteCandidateInfluenceResult } from "./fullMatch/fullMatchChainRouteCandidateInfluence";
import { selectShadowRouteFromInfluencedCandidates } from "./fullMatch/selectShadowRouteFromInfluencedCandidates";
import type { FullMatchShadowRouteSelectionResult } from "./fullMatch/fullMatchShadowRouteSelection";
import { controlledSegmentSelectionFromShadow } from "./fullMatch/controlledSegmentSelectionFromShadow";
import type { FullMatchControlledSegmentSelectionResult } from "./fullMatch/fullMatchControlledSegmentSelection";
import { segmentRouteInputFromControlledSelection } from "./fullMatch/segmentRouteInputFromControlledSelection";
import type { FullMatchSegmentRouteInput } from "./fullMatch/fullMatchSegmentRouteInput";
import { controlledMiniMatchRouteSourceFromSegmentRouteInput } from "./fullMatch/controlledMiniMatchRouteSourceFromSegmentRouteInput";
import type { FullMatchControlledMiniMatchRouteSource } from "./fullMatch/fullMatchControlledMiniMatchRouteSource";

interface FullMatchSegmentConfig {
  readonly label: string;
  readonly period: MiniMatchTimelineSegment["period"];
  readonly startMinute: number;
  readonly sequenceCount: number;
}

interface FullMatchSegmentResult {
  readonly config: FullMatchSegmentConfig;
  readonly miniMatch: MiniMatchResult;
  readonly stateBeforeSegment: FullMatchSegmentState;
  readonly segmentInfluence?: FullMatchSegmentInfluence;
  readonly fatiguePropagation: FullMatchFatiguePropagationResult;
}

const FULL_MATCH_SEGMENTS: readonly FullMatchSegmentConfig[] = [
  { label: "segment-1", period: "first_half", startMinute: 0, sequenceCount: 6 },
  { label: "segment-2", period: "first_half", startMinute: 10, sequenceCount: 6 },
  { label: "segment-3", period: "first_half", startMinute: 20, sequenceCount: 6 },
  { label: "segment-4", period: "first_half", startMinute: 30, sequenceCount: 6 },
  { label: "segment-5", period: "second_half", startMinute: 40, sequenceCount: 6 },
  { label: "segment-6", period: "second_half", startMinute: 50, sequenceCount: 6 },
  { label: "segment-7", period: "second_half", startMinute: 60, sequenceCount: 6 },
  { label: "segment-8", period: "second_half", startMinute: 70, sequenceCount: 6 },
];

function addScores(a: MiniMatchScore, b: MiniMatchScore): MiniMatchScore {
  return {
    teamA: a.teamA + b.teamA,
    teamB: a.teamB + b.teamB,
  };
}

function addCounts(a: MiniMatchTeamCount, b: MiniMatchTeamCount): MiniMatchTeamCount {
  return {
    teamA: a.teamA + b.teamA,
    teamB: a.teamB + b.teamB,
  };
}

function aggregateMiniMatchSegments(segments: readonly FullMatchSegmentResult[]): MiniMatchResult {
  const firstSegment = segments[0];

  if (firstSegment === undefined) {
    throw new Error("runFullMatch harness requires at least one mini-match segment.");
  }

  const emptyScore: MiniMatchScore = { teamA: 0, teamB: 0 };
  const emptyCount: MiniMatchTeamCount = { teamA: 0, teamB: 0 };
  const finalScore = segments.reduce(
    (score, segment) => addScores(score, segment.miniMatch.summary.finalScore),
    emptyScore,
  );
  const finishingOpportunities = segments.reduce(
    (count, segment) => addCounts(count, segment.miniMatch.summary.finishingOpportunities),
    emptyCount,
  );
  const turnovers = segments.reduce(
    (count, segment) => addCounts(count, segment.miniMatch.summary.turnovers),
    emptyCount,
  );
  const secondChanceCount = segments.reduce(
    (count, segment) => addCounts(count, segment.miniMatch.summary.secondChanceCount),
    emptyCount,
  );

  return {
    ...firstSegment.miniMatch,
    state: {
      ...firstSegment.miniMatch.state,
      score: finalScore,
      records: segments.flatMap((segment) => segment.miniMatch.state.records),
      scoringEvents: segments.flatMap((segment) => segment.miniMatch.state.scoringEvents),
      finishingOpportunities,
      turnovers,
      secondChanceCount,
    },
    summary: {
      ...firstSegment.miniMatch.summary,
      finalScore,
      sequencesPlayed: segments.reduce((total, segment) => total + segment.miniMatch.summary.sequencesPlayed, 0),
      scoringEvents: segments.flatMap((segment) => segment.miniMatch.summary.scoringEvents),
      liveTryEvents: segments.flatMap((segment) => segment.miniMatch.summary.liveTryEvents),
      finishingOpportunities,
      turnovers,
      secondChanceCount,
    },
    logs: segments.flatMap((segment) => segment.miniMatch.logs),
  };
}

function segmentSeed(baseSeed: number | undefined, index: number): number | undefined {
  if (baseSeed === undefined) {
    return undefined;
  }

  return (baseSeed + index * 9973) >>> 0;
}

function miniMatchSeedInput(baseSeed: number | undefined, index: number): { readonly seed?: number } {
  const seed = segmentSeed(baseSeed, index);

  return seed === undefined ? {} : { seed };
}

function sequenceCountForSegment(config: FullMatchSegmentConfig, state: FullMatchSegmentState): number {
  const averageCondition = (state.home.condition + state.away.condition) / 2;
  const fatigueAdjustment = averageCondition < 88 ? -1 : 0;

  return Math.max(5, Math.min(6, config.sequenceCount + fatigueAdjustment));
}

function addScoreState(a: { readonly home: number; readonly away: number }, b: { readonly home: number; readonly away: number }): { readonly home: number; readonly away: number } {
  return {
    home: a.home + b.home,
    away: a.away + b.away,
  };
}

function fatigueReportFromPropagation(input: {
  readonly matchInput: MatchInput;
  readonly propagation: readonly FullMatchFatiguePropagationResult[];
}): FatigueReport {
  const last = input.propagation[input.propagation.length - 1];

  if (last === undefined) {
    return {
      teamSummaries: [
        {
          teamId: input.matchInput.homeTeam.teamId,
          averageConditionEnd: 100,
          highIntensityLoad: input.matchInput.homePlan.pressingIntensity,
          lateErrorCount: 0,
        },
        {
          teamId: input.matchInput.awayTeam.teamId,
          averageConditionEnd: 100,
          highIntensityLoad: input.matchInput.awayPlan.pressingIntensity,
          lateErrorCount: 0,
        },
      ],
      playerSummaries: [],
    };
  }

  const homeStart = input.propagation[0]?.home.conditionStart ?? last.home.conditionStart;
  const awayStart = input.propagation[0]?.away.conditionStart ?? last.away.conditionStart;
  const teamSummaries = [
    {
      teamId: input.matchInput.homeTeam.teamId,
      averageConditionEnd: last.home.conditionEnd,
      highIntensityLoad: last.home.highIntensityLoad,
      lateErrorCount: 0,
    },
    {
      teamId: input.matchInput.awayTeam.teamId,
      averageConditionEnd: last.away.conditionEnd,
      highIntensityLoad: last.away.highIntensityLoad,
      lateErrorCount: 0,
    },
  ];
  const playerSummaries = [...input.matchInput.homeTeam.roster, ...input.matchInput.awayTeam.roster].map((player) => {
    const isHomePlayer = input.matchInput.homeTeam.roster.some((candidate) => candidate.playerId === player.playerId);
    const teamStart = isHomePlayer ? homeStart : awayStart;
    const teamEnd = isHomePlayer ? last.home.conditionEnd : last.away.conditionEnd;
    const teamMentalEnd = isHomePlayer ? last.home.mentalFreshnessEnd : last.away.mentalFreshnessEnd;
    const teamDrop = teamStart - teamEnd;

    return {
      playerId: player.playerId,
      conditionStart: player.currentCondition,
      conditionEnd: Math.max(0, Math.min(100, Math.round(player.currentCondition - teamDrop))),
      mentalFreshnessEnd: Math.max(0, Math.min(100, Math.round(Math.min(player.mentalFreshness, teamMentalEnd)))),
    };
  });

  return {
    teamSummaries,
    playerSummaries,
  };
}

function withHarnessSanityDiagnosis(report: MatchReport, input: MatchInput): MatchReport {
  const sanity = analyzeFullMatchHarnessSanity(report);

  if (sanity.warnings.length <= 1) {
    return report;
  }

  const warningFacts = buildHarnessWarningEvidenceFacts({ report, sanity });
  const reportWithWarningFacts: MatchReport = {
    ...report,
    evidenceFacts: [...report.evidenceFacts, ...warningFacts],
  };
  const warnings = buildMatchReportWarnings({
    report: reportWithWarningFacts,
    sanity,
    evidenceFacts: reportWithWarningFacts.evidenceFacts,
  });
  const evidenceEvent = report.timeline.find((event) => event.eventType !== "kickoff") ?? report.timeline[0];
  const diagnosis: TacticalDiagnosis = {
    diagnosisId: `${input.matchId}-full-match-harness-sanity`,
    teamId: input.homeTeam.teamId,
    title: "Avertissement de harnais full-match",
    summary: coachFacingHarnessWarningSummary(sanity.warnings),
    evidenceEventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: report.zoneStats.map((stats) => stats.zone).slice(0, 3),
    confidence: "low",
  };
  const dominance = sanity.scoringDominance;
  const dominanceDiagnosis: TacticalDiagnosis | null = dominance.warnings.length === 0 || dominance.dominantTeamId === undefined
    ? null
    : {
        diagnosisId: `${input.matchId}-scoring-dominance-warning`,
        teamId: dominance.dominantTeamId,
        title: "Domination scoring single-run à surveiller",
        summary: coachFacingScoringDominanceSummary(dominance),
        evidenceEventIds: dominance.dominatedTeamEvidenceEventIds.length > 0
          ? dominance.dominatedTeamEvidenceEventIds
          : (evidenceEvent === undefined ? [] : [evidenceEvent.eventId]),
        affectedZones: dominance.affectedZones as TacticalDiagnosis["affectedZones"],
        confidence: dominance.warnings.length >= 3 ? "medium" : "low",
      };

  return {
    ...reportWithWarningFacts,
    warnings: [...report.warnings, ...warnings],
    tacticalReport: {
      diagnoses: [
        ...report.tacticalReport.diagnoses,
        diagnosis,
        ...(dominanceDiagnosis === null ? [] : [dominanceDiagnosis]),
      ],
    },
  };
}

function chainConsumptionLimitations(consumption: FullMatchChainConsumptionResult): readonly string[] {
  if (consumption.status === "not_requested") {
    return [
      "FULLMATCH_CHAIN_CONSUMPTION_DISABLED_BY_DEFAULT",
      "NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS",
    ];
  }

  return [
    "FULLMATCH_CHAIN_CONSUMPTION_EXPERIMENTAL",
    `FULLMATCH_CHAIN_CONSUMPTION_STATUS_${consumption.status.toUpperCase()}`,
    "FULLMATCH_CHAIN_CONSUMED_FOR_SEGMENT_1",
    "FULLMATCH_CHAIN_CONSUMPTION_DIAGNOSTIC_ONLY",
    "FULLMATCH_CHAIN_CONSUMPTION_DID_NOT_MUTATE_SCORE",
    "FULLMATCH_CHAIN_CONSUMPTION_DID_NOT_MUTATE_SCORING_EVENTS",
    ...(consumption.status === "partial" ? ["FULLMATCH_CHAIN_CONSUMPTION_PARTIAL"] : []),
    ...consumption.warnings,
  ];
}

function chainSegmentContextLimitations(context: FullMatchChainSegmentContext): readonly string[] {
  if (context.status === "not_available") {
    return ["FULLMATCH_CHAIN_SEGMENT_CONTEXT_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_CHAIN_SEGMENT_CONTEXT_EXPERIMENTAL",
    `FULLMATCH_CHAIN_SEGMENT_CONTEXT_STATUS_${context.status.toUpperCase()}`,
    "FULLMATCH_CHAIN_SEGMENT_CONTEXT_ATTACHED_TO_SEGMENT_1",
    "FULLMATCH_CHAIN_SEGMENT_CONTEXT_DIAGNOSTIC_ONLY",
    "FULLMATCH_CHAIN_SEGMENT_CONTEXT_DID_NOT_MUTATE_SCORE",
    "FULLMATCH_CHAIN_SEGMENT_CONTEXT_DID_NOT_MUTATE_SCORING_EVENTS",
  ];
}

function routeCandidateInfluenceLimitations(influence: FullMatchChainRouteCandidateInfluenceResult): readonly string[] {
  if (influence.status === "not_available") {
    return ["FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_EXPERIMENTAL",
    `FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_STATUS_${influence.status.toUpperCase()}`,
    "FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_DIAGNOSTIC_ONLY",
    "FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_DID_NOT_MUTATE_SCORE",
    "FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_DID_NOT_MUTATE_SCORING_EVENTS",
    "FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_CANNOT_DRIVE_PRODUCTION_SELECTION",
    "FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_CANNOT_OVERRIDE_CLOSED_OR_UNAVAILABLE",
  ];
}

function shadowRouteSelectionLimitations(selection: FullMatchShadowRouteSelectionResult): readonly string[] {
  if (selection.status === "not_available") {
    return ["FULLMATCH_SHADOW_ROUTE_SELECTION_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_SHADOW_ROUTE_SELECTION_EXPERIMENTAL",
    `FULLMATCH_SHADOW_ROUTE_SELECTION_STATUS_${selection.status.toUpperCase()}`,
    "FULLMATCH_SHADOW_ROUTE_SELECTION_DIAGNOSTIC_ONLY",
    "FULLMATCH_SHADOW_ROUTE_SELECTION_DID_NOT_MUTATE_SCORE",
    "FULLMATCH_SHADOW_ROUTE_SELECTION_DID_NOT_MUTATE_SCORING_EVENTS",
    "FULLMATCH_SHADOW_ROUTE_SELECTION_CANNOT_DRIVE_PRODUCTION_SELECTION",
    "FULLMATCH_SHADOW_ROUTE_SELECTION_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function controlledSegmentSelectionLimitations(selection: FullMatchControlledSegmentSelectionResult): readonly string[] {
  if (selection.status === "not_available") {
    return ["FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_CONTROLLED_SEGMENT_SELECTION_EXPERIMENTAL",
    `FULLMATCH_CONTROLLED_SEGMENT_SELECTION_STATUS_${selection.status.toUpperCase()}`,
    "FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DIAGNOSTIC_ONLY",
    "FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DID_NOT_MUTATE_SCORE",
    "FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DID_NOT_MUTATE_SCORING_EVENTS",
    "FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DID_NOT_MUTATE_ROUTE_SUCCESS_RATES",
    "FULLMATCH_CONTROLLED_SEGMENT_SELECTION_CANNOT_DRIVE_PRODUCTION_FULLMATCH_SELECTION",
    "FULLMATCH_CONTROLLED_SEGMENT_SELECTION_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function segmentRouteInputLimitations(input: FullMatchSegmentRouteInput): readonly string[] {
  if (input.status === "not_available") {
    return ["FULLMATCH_SEGMENT_ROUTE_INPUT_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_SEGMENT_ROUTE_INPUT_EXPERIMENTAL",
    `FULLMATCH_SEGMENT_ROUTE_INPUT_STATUS_${input.status.toUpperCase()}`,
    "FULLMATCH_SEGMENT_ROUTE_INPUT_DIAGNOSTIC_ONLY",
    "FULLMATCH_SEGMENT_ROUTE_INPUT_DID_NOT_MUTATE_SCORE",
    "FULLMATCH_SEGMENT_ROUTE_INPUT_DID_NOT_MUTATE_SCORING_EVENTS",
    "FULLMATCH_SEGMENT_ROUTE_INPUT_DID_NOT_MUTATE_ROUTE_SUCCESS_RATES",
    "FULLMATCH_SEGMENT_ROUTE_INPUT_CANNOT_DRIVE_PRODUCTION_FULLMATCH_SELECTION",
    "FULLMATCH_SEGMENT_ROUTE_INPUT_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_SEGMENT_ROUTE_INPUT_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function controlledMiniMatchRouteSourceLimitations(source: FullMatchControlledMiniMatchRouteSource): readonly string[] {
  if (source.status === "not_available") {
    return ["FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_EXPERIMENTAL",
    `FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_STATUS_${source.status.toUpperCase()}`,
    "FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_DIAGNOSTIC_ONLY",
    "FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_DID_NOT_MUTATE_SCORE",
    "FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_DID_NOT_MUTATE_SCORING_EVENTS",
    "FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_DID_NOT_MUTATE_ROUTE_SUCCESS_RATES",
    "FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_CANNOT_DRIVE_PRODUCTION_FULLMATCH_SELECTION",
    "FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_CANNOT_DRIVE_LIVE_MINIMATCH_RESOLUTION",
    "FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function chainConsumptionEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly consumption: FullMatchChainConsumptionResult;
}): MatchReportEvidenceFact | null {
  if (input.consumption.status === "not_requested") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-consumption`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_CONSUMPTION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.consumption.finalPropagatedZone ?? "Z4-HSR"],
    summary:
      `Experimental chain consumption ${input.consumption.status}: chain ${input.consumption.chainId ?? "none"} ` +
      `on ${input.consumption.segmentLabel ?? "segment-1"} consumed ${input.consumption.consumedStepCount} step(s), ` +
      `${input.consumption.visualWorkbenchStepCount} visual step(s), ${input.consumption.spatialSelectionStepCount} spatial selection step(s), ` +
      `final carrier ${input.consumption.finalPropagatedCarrierId ?? "none"} at ${input.consumption.finalPropagatedZone ?? "none"}, ` +
      `scoreMutationCount=${input.consumption.scoreMutationCount}, scoringEventsMutationCount=${input.consumption.scoringEventsMutationCount}.`,
    confidence: input.consumption.status === "consumed" ? "medium" : "low",
    strength: input.consumption.status === "consumed" ? 65 : 35,
    coachVisible: false,
    internalTags: [
      "workbench_chain_consumption",
      "workbench_chain_experimental",
      "fullmatch_chain_consumed",
      "diagnostic_only_chain_consumption",
      `chain_id_${input.consumption.chainId ?? "none"}`,
      `segment_${input.consumption.segmentLabel ?? "segment-1"}`,
      `consumed_steps_${input.consumption.consumedStepCount}`,
      `visual_steps_${input.consumption.visualWorkbenchStepCount}`,
      `spatial_steps_${input.consumption.spatialSelectionStepCount}`,
      `mismatch_warnings_${input.consumption.mismatchWarningCount}`,
      "score_mutation_count_0",
      "scoring_events_mutation_count_0",
    ],
  };
}

function chainSegmentContextEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly context: FullMatchChainSegmentContext;
}): MatchReportEvidenceFact | null {
  if (input.context.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.eventId.includes(`${input.context.segmentLabel ?? "segment-1"}-`) &&
    event.tags.includes("workbench_chain_context")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-segment-context`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_SEGMENT_CONTEXT",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.context.finalZone ?? "Z4-HSR"],
    summary:
      `Experimental segment context ${input.context.status}: segment ${input.context.segmentLabel ?? "segment-1"} ` +
      `uses chain ${input.context.chainId ?? "none"}, final carrier ${input.context.finalCarrierId ?? "none"} ` +
      `at ${input.context.finalZone ?? "none"}, consumed steps ${input.context.consumedStepCount}, ` +
      `spatial steps ${input.context.spatialSelectionStepCount}, diagnosticOnly=${input.context.diagnosticOnly}, ` +
      `canMutateScore=${input.context.canMutateScore}, canMutateScoringEvents=${input.context.canMutateScoringEvents}.`,
    confidence: input.context.confidence === "none" ? "low" : input.context.confidence,
    strength: input.context.status === "available" ? 60 : 30,
    coachVisible: false,
    internalTags: [
      "workbench_chain_segment_context",
      "chain_context_segment_1",
      "chain_context_diagnostic_only",
      "chain_context_score_mutation_forbidden",
      "chain_context_scoring_events_mutation_forbidden",
      ...(input.context.chainId === undefined ? [] : [`chain_context_chain_id_${input.context.chainId}`]),
      ...(input.context.finalCarrierId === undefined ? [] : [`chain_context_final_carrier_${input.context.finalCarrierId}`]),
      ...(input.context.finalZone === undefined ? [] : [`chain_context_final_zone_${input.context.finalZone}`]),
      `chain_context_consumed_steps_${input.context.consumedStepCount}`,
      `chain_context_spatial_steps_${input.context.spatialSelectionStepCount}`,
      "score_mutation_count_0",
      "scoring_events_mutation_count_0",
    ],
  };
}

function routeCandidateInfluenceEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly influence: FullMatchChainRouteCandidateInfluenceResult;
}): MatchReportEvidenceFact | null {
  if (input.influence.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_route_candidate_influence")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-route-candidate-influence`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.influence.finalZone ?? "Z4-HSR"],
    summary:
      `Experimental route candidate influence ${input.influence.status}: segment ${input.influence.segmentLabel ?? "segment-1"} ` +
      `uses chain ${input.influence.chainId ?? "none"}, final carrier ${input.influence.finalCarrierId ?? "none"} ` +
      `at ${input.influence.finalZone ?? "none"}, candidates ${input.influence.candidateCount}, influenced ${input.influence.influencedCandidateCount}, ` +
      `positive deltas ${input.influence.positiveDeltaCount}, negative deltas ${input.influence.negativeDeltaCount}, ` +
      `closed boosts blocked ${input.influence.illegalCandidateBoostBlockedCount}, unavailable boosts blocked ${input.influence.unavailableCandidateBoostBlockedCount}, ` +
      `diagnostic selection ${input.influence.selectedCandidateBefore ?? "none"} -> ${input.influence.selectedCandidateAfterDiagnostic ?? "none"}, ` +
      `selectionChanged=${input.influence.diagnosticSelectionChanged}, diagnosticOnly=${input.influence.diagnosticOnly}, ` +
      `canMutateScore=${input.influence.canMutateScore}, canMutateScoringEvents=${input.influence.canMutateScoringEvents}, ` +
      `canDriveProductionSelection=${input.influence.canDriveProductionSelection}.`,
    confidence: input.influence.status === "available" ? "medium" : "low",
    strength: input.influence.status === "available" ? 58 : 28,
    coachVisible: false,
    internalTags: [
      "workbench_chain_route_candidate_influence",
      "route_candidate_influence_diagnostic_only",
      "route_candidate_influence_segment_1",
      "route_candidate_influence_score_mutation_forbidden",
      "route_candidate_influence_scoring_events_mutation_forbidden",
      "route_candidate_influence_production_selection_forbidden",
      "route_candidate_influence_closed_override_blocked",
      "route_candidate_influence_unavailable_override_blocked",
      ...(input.influence.chainId === undefined ? [] : [`route_candidate_influence_chain_id_${input.influence.chainId}`]),
      ...(input.influence.finalCarrierId === undefined ? [] : [`route_candidate_influence_final_carrier_${input.influence.finalCarrierId}`]),
      ...(input.influence.finalZone === undefined ? [] : [`route_candidate_influence_final_zone_${input.influence.finalZone}`]),
      `route_candidate_influence_candidate_count_${input.influence.candidateCount}`,
      `route_candidate_influence_influenced_count_${input.influence.influencedCandidateCount}`,
      `route_candidate_influence_positive_delta_count_${input.influence.positiveDeltaCount}`,
      `route_candidate_influence_negative_delta_count_${input.influence.negativeDeltaCount}`,
      `route_candidate_influence_illegal_boost_blocked_count_${input.influence.illegalCandidateBoostBlockedCount}`,
      `route_candidate_influence_unavailable_boost_blocked_count_${input.influence.unavailableCandidateBoostBlockedCount}`,
      `route_candidate_influence_selection_changed_${input.influence.diagnosticSelectionChanged ? "true" : "false"}`,
      "score_mutation_count_0",
      "scoring_events_mutation_count_0",
    ],
  };
}

function shadowRouteSelectionEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly selection: FullMatchShadowRouteSelectionResult;
}): MatchReportEvidenceFact | null {
  if (input.selection.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_shadow_route_selection")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-shadow-route-selection`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.selection.shadowSelectionTargetZone ?? "Z4-HSR"],
    summary:
      `Experimental shadow route selection ${input.selection.status}: production proxy ${input.selection.productionSelectionCandidateId ?? "none"} ` +
      `(${input.selection.productionSelectionActionType ?? "none"}) compared with shadow ${input.selection.shadowSelectionCandidateId ?? "none"} ` +
      `(${input.selection.shadowSelectionActionType ?? "none"}) to receiver ${input.selection.shadowSelectionReceiverId ?? "none"} ` +
      `in ${input.selection.shadowSelectionTargetZone ?? "none"}, baseScore=${input.selection.shadowSelectionBaseScore ?? 0}, ` +
      `influenceDelta=${input.selection.shadowSelectionInfluenceDelta ?? 0}, influencedScore=${input.selection.shadowSelectionInfluencedScore ?? 0}, ` +
      `selectionChanged=${input.selection.shadowSelectionChangedFromProduction}, closedRejected=${input.selection.closedCandidateRejectedCount}, ` +
      `unavailableRejected=${input.selection.unavailableCandidateRejectedCount}, diagnosticOnly=${input.selection.diagnosticOnly}, ` +
      `canMutateScore=${input.selection.canMutateScore}, canMutateScoringEvents=${input.selection.canMutateScoringEvents}, ` +
      `canDriveProductionSelection=${input.selection.canDriveProductionSelection}. ${input.selection.explanation}`,
    confidence: input.selection.status === "available" ? "medium" : "low",
    strength: input.selection.status === "available" ? 62 : 30,
    coachVisible: false,
    internalTags: [
      "workbench_chain_shadow_route_selection",
      "shadow_route_selection_diagnostic_only",
      "shadow_route_selection_production_forbidden",
      "shadow_route_selection_score_mutation_forbidden",
      "shadow_route_selection_scoring_events_mutation_forbidden",
      "shadow_route_selection_closed_candidates_rejected",
      "shadow_route_selection_unavailable_candidates_rejected",
      ...(input.selection.chainId === undefined ? [] : [`shadow_route_selection_chain_id_${input.selection.chainId}`]),
      ...(input.selection.productionSelectionCandidateId === undefined ? [] : [`shadow_route_selection_production_candidate_${input.selection.productionSelectionCandidateId}`]),
      ...(input.selection.shadowSelectionCandidateId === undefined ? [] : [`shadow_route_selection_candidate_${input.selection.shadowSelectionCandidateId}`]),
      ...(input.selection.shadowSelectionActionType === undefined ? [] : [`shadow_route_selection_action_${input.selection.shadowSelectionActionType}`]),
      ...(input.selection.shadowSelectionReceiverId === undefined ? [] : [`shadow_route_selection_receiver_${input.selection.shadowSelectionReceiverId}`]),
      ...(input.selection.shadowSelectionTargetZone === undefined ? [] : [`shadow_route_selection_zone_${input.selection.shadowSelectionTargetZone}`]),
      `shadow_route_selection_changed_${input.selection.shadowSelectionChangedFromProduction ? "true" : "false"}`,
      `shadow_route_selection_candidate_count_${input.selection.candidateCount}`,
      `shadow_route_selection_eligible_count_${input.selection.eligibleCandidateCount}`,
      `shadow_route_selection_blocked_count_${input.selection.blockedCandidateCount}`,
      `shadow_route_selection_closed_rejected_count_${input.selection.closedCandidateRejectedCount}`,
      `shadow_route_selection_unavailable_rejected_count_${input.selection.unavailableCandidateRejectedCount}`,
      "score_mutation_count_0",
      "scoring_events_mutation_count_0",
      ...input.selection.differenceReasons.map((reason) => `shadow_route_selection_reason_${reason}`),
    ],
  };
}

function controlledSegmentSelectionEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly selection: FullMatchControlledSegmentSelectionResult;
}): MatchReportEvidenceFact | null {
  if (input.selection.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_controlled_segment_selection")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-controlled-segment-selection`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.selection.selectedTargetZone ?? "Z4-HSR"],
    summary:
      `Experimental controlled segment selection ${input.selection.status}: shadow candidate ${input.selection.selectedCandidateId ?? "none"} ` +
      `(${input.selection.selectedActionType ?? "none"}) to receiver ${input.selection.selectedReceiverId ?? "none"} ` +
      `in ${input.selection.selectedTargetZone ?? "none"}, baseScore=${input.selection.selectedBaseScore ?? 0}, ` +
      `influenceDelta=${input.selection.selectedInfluenceDelta ?? 0}, influencedScore=${input.selection.selectedInfluencedScore ?? 0}, ` +
      `selectedLegal=${input.selection.selectedCandidateLegal}, selectedAvailable=${input.selection.selectedCandidateAvailable}, ` +
      `closedRejected=${input.selection.rejectedClosedCandidateCount}, unavailableRejected=${input.selection.rejectedUnavailableCandidateCount}, ` +
      `diagnosticOnly=${input.selection.diagnosticOnly}, experimentalControlledSelection=${input.selection.experimentalControlledSelection}, ` +
      `canMutateScore=${input.selection.canMutateScore}, canMutateScoringEvents=${input.selection.canMutateScoringEvents}, ` +
      `canMutateRouteSuccessRates=${input.selection.canMutateRouteSuccessRates}, ` +
      `canDriveProductionFullMatchSelection=${input.selection.canDriveProductionFullMatchSelection}.`,
    confidence: input.selection.status === "available" ? "medium" : "low",
    strength: input.selection.status === "available" ? 64 : 25,
    coachVisible: false,
    internalTags: [
      "workbench_chain_controlled_segment_selection",
      "controlled_segment_selection_experimental",
      "controlled_segment_selection_diagnostic_only",
      "controlled_segment_selection_score_mutation_forbidden",
      "controlled_segment_selection_scoring_events_mutation_forbidden",
      "controlled_segment_selection_route_success_mutation_forbidden",
      "controlled_segment_selection_production_fullmatch_forbidden",
      "controlled_segment_selection_closed_candidates_rejected",
      "controlled_segment_selection_unavailable_candidates_rejected",
      ...(input.selection.chainId === undefined ? [] : [`controlled_segment_selection_chain_id_${input.selection.chainId}`]),
      ...(input.selection.selectedCandidateId === undefined ? [] : [`controlled_segment_selection_candidate_${input.selection.selectedCandidateId}`]),
      ...(input.selection.selectedActionType === undefined ? [] : [`controlled_segment_selection_action_${input.selection.selectedActionType}`]),
      ...(input.selection.selectedReceiverId === undefined ? [] : [`controlled_segment_selection_receiver_${input.selection.selectedReceiverId}`]),
      ...(input.selection.selectedTargetZone === undefined ? [] : [`controlled_segment_selection_zone_${input.selection.selectedTargetZone}`]),
      `controlled_segment_selection_selected_legal_${input.selection.selectedCandidateLegal ? "true" : "false"}`,
      `controlled_segment_selection_selected_available_${input.selection.selectedCandidateAvailable ? "true" : "false"}`,
      `controlled_segment_selection_closed_rejected_count_${input.selection.rejectedClosedCandidateCount}`,
      `controlled_segment_selection_unavailable_rejected_count_${input.selection.rejectedUnavailableCandidateCount}`,
      "score_mutation_count_0",
      "scoring_events_mutation_count_0",
      "route_success_mutation_count_0",
      ...input.selection.tags,
    ],
  };
}

function segmentRouteInputEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly routeInput: FullMatchSegmentRouteInput;
}): MatchReportEvidenceFact | null {
  if (input.routeInput.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_segment_route_input")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-segment-route-input`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.routeInput.targetZone ?? "Z4-HSR"],
    summary:
      `Experimental segment route input ${input.routeInput.status}: source ${input.routeInput.source}, ` +
      `candidate ${input.routeInput.candidateId ?? "none"} (${input.routeInput.actionType ?? "none"}) ` +
      `to receiver ${input.routeInput.receiverId ?? "none"} in ${input.routeInput.targetZone ?? "none"}, ` +
      `sourceBaseScore=${input.routeInput.sourceBaseScore ?? 0}, sourceInfluenceDelta=${input.routeInput.sourceInfluenceDelta ?? 0}, ` +
      `sourceInfluencedScore=${input.routeInput.sourceInfluencedScore ?? 0}, candidateLegal=${input.routeInput.candidateLegal}, ` +
      `candidateAvailable=${input.routeInput.candidateAvailable}, closedRejected=${input.routeInput.rejectedClosedCandidateCount}, ` +
      `unavailableRejected=${input.routeInput.rejectedUnavailableCandidateCount}, diagnosticOnly=${input.routeInput.diagnosticOnly}, ` +
      `experimentalRouteInput=${input.routeInput.experimentalRouteInput}, canMutateScore=${input.routeInput.canMutateScore}, ` +
      `canMutateScoringEvents=${input.routeInput.canMutateScoringEvents}, canMutateRouteSuccessRates=${input.routeInput.canMutateRouteSuccessRates}, ` +
      `canDriveProductionFullMatchSelection=${input.routeInput.canDriveProductionFullMatchSelection}, ` +
      `canDriveProductionRouteResolution=${input.routeInput.canDriveProductionRouteResolution}.`,
    confidence: input.routeInput.status === "available" ? "medium" : "low",
    strength: input.routeInput.status === "available" ? 66 : 25,
    coachVisible: false,
    internalTags: [
      "workbench_chain_segment_route_input",
      "segment_route_input_experimental",
      "segment_route_input_diagnostic_only",
      "segment_route_input_score_mutation_forbidden",
      "segment_route_input_scoring_events_mutation_forbidden",
      "segment_route_input_route_success_mutation_forbidden",
      "segment_route_input_production_fullmatch_forbidden",
      "segment_route_input_production_resolution_forbidden",
      "segment_route_input_closed_candidates_rejected",
      "segment_route_input_unavailable_candidates_rejected",
      ...(input.routeInput.chainId === undefined ? [] : [`segment_route_input_chain_id_${input.routeInput.chainId}`]),
      ...(input.routeInput.candidateId === undefined ? [] : [`segment_route_input_candidate_${input.routeInput.candidateId}`]),
      ...(input.routeInput.actionType === undefined ? [] : [`segment_route_input_action_${input.routeInput.actionType}`]),
      ...(input.routeInput.receiverId === undefined ? [] : [`segment_route_input_receiver_${input.routeInput.receiverId}`]),
      ...(input.routeInput.targetZone === undefined ? [] : [`segment_route_input_zone_${input.routeInput.targetZone}`]),
      `segment_route_input_candidate_legal_${input.routeInput.candidateLegal ? "true" : "false"}`,
      `segment_route_input_candidate_available_${input.routeInput.candidateAvailable ? "true" : "false"}`,
      `segment_route_input_closed_rejected_count_${input.routeInput.rejectedClosedCandidateCount}`,
      `segment_route_input_unavailable_rejected_count_${input.routeInput.rejectedUnavailableCandidateCount}`,
      "score_mutation_count_0",
      "scoring_events_mutation_count_0",
      "route_success_mutation_count_0",
      "production_route_resolution_mutation_count_0",
      ...input.routeInput.tags,
    ],
  };
}

function controlledMiniMatchRouteSourceEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly routeSource: FullMatchControlledMiniMatchRouteSource;
}): MatchReportEvidenceFact | null {
  if (input.routeSource.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_controlled_minimatch_route_source")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-controlled-minimatch-route-source`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.routeSource.targetZone ?? "Z4-HSR"],
    summary:
      `Experimental controlled mini-match route source ${input.routeSource.status}: origin ${input.routeSource.origin}, ` +
      `candidate ${input.routeSource.candidateId ?? "none"} (${input.routeSource.actionType ?? "none"}) ` +
      `to receiver ${input.routeSource.receiverId ?? "none"} in ${input.routeSource.targetZone ?? "none"}, ` +
      `sourceBaseScore=${input.routeSource.sourceBaseScore ?? 0}, sourceInfluenceDelta=${input.routeSource.sourceInfluenceDelta ?? 0}, ` +
      `sourceInfluencedScore=${input.routeSource.sourceInfluencedScore ?? 0}, candidateLegal=${input.routeSource.candidateLegal}, ` +
      `candidateAvailable=${input.routeSource.candidateAvailable}, closedRejected=${input.routeSource.rejectedClosedCandidateCount}, ` +
      `unavailableRejected=${input.routeSource.rejectedUnavailableCandidateCount}, diagnosticOnly=${input.routeSource.diagnosticOnly}, ` +
      `experimentalControlledRouteSource=${input.routeSource.experimentalControlledRouteSource}, canMutateScore=${input.routeSource.canMutateScore}, ` +
      `canMutateScoringEvents=${input.routeSource.canMutateScoringEvents}, canMutateRouteSuccessRates=${input.routeSource.canMutateRouteSuccessRates}, ` +
      `canDriveProductionFullMatchSelection=${input.routeSource.canDriveProductionFullMatchSelection}, ` +
      `canDriveProductionRouteResolution=${input.routeSource.canDriveProductionRouteResolution}, ` +
      `canDriveLiveMiniMatchResolution=${input.routeSource.canDriveLiveMiniMatchResolution}.`,
    confidence: input.routeSource.status === "available" ? "medium" : "low",
    strength: input.routeSource.status === "available" ? 68 : 25,
    coachVisible: false,
    internalTags: [
      "workbench_chain_controlled_minimatch_route_source",
      "controlled_minimatch_route_source_experimental",
      "controlled_minimatch_route_source_diagnostic_only",
      "controlled_minimatch_route_source_score_mutation_forbidden",
      "controlled_minimatch_route_source_scoring_events_mutation_forbidden",
      "controlled_minimatch_route_source_route_success_mutation_forbidden",
      "controlled_minimatch_route_source_production_fullmatch_forbidden",
      "controlled_minimatch_route_source_production_resolution_forbidden",
      "controlled_minimatch_route_source_live_resolution_forbidden",
      "controlled_minimatch_route_source_closed_candidates_rejected",
      "controlled_minimatch_route_source_unavailable_candidates_rejected",
      ...(input.routeSource.chainId === undefined ? [] : [`controlled_minimatch_route_source_chain_id_${input.routeSource.chainId}`]),
      ...(input.routeSource.candidateId === undefined ? [] : [`controlled_minimatch_route_source_candidate_${input.routeSource.candidateId}`]),
      ...(input.routeSource.actionType === undefined ? [] : [`controlled_minimatch_route_source_action_${input.routeSource.actionType}`]),
      ...(input.routeSource.receiverId === undefined ? [] : [`controlled_minimatch_route_source_receiver_${input.routeSource.receiverId}`]),
      ...(input.routeSource.targetZone === undefined ? [] : [`controlled_minimatch_route_source_zone_${input.routeSource.targetZone}`]),
      `controlled_minimatch_route_source_candidate_legal_${input.routeSource.candidateLegal ? "true" : "false"}`,
      `controlled_minimatch_route_source_candidate_available_${input.routeSource.candidateAvailable ? "true" : "false"}`,
      `controlled_minimatch_route_source_closed_rejected_count_${input.routeSource.rejectedClosedCandidateCount}`,
      `controlled_minimatch_route_source_unavailable_rejected_count_${input.routeSource.rejectedUnavailableCandidateCount}`,
      "score_mutation_count_0",
      "scoring_events_mutation_count_0",
      "route_success_mutation_count_0",
      "production_route_resolution_mutation_count_0",
      "live_minimatch_resolution_mutation_count_0",
      ...input.routeSource.tags,
    ],
  };
}

function withFullMatchGroundingDiagnosis(
  report: MatchReport,
  input: MatchInput,
  chainConsumption: FullMatchChainConsumptionResult,
  chainSegmentContext: FullMatchChainSegmentContext,
  routeCandidateInfluence: FullMatchChainRouteCandidateInfluenceResult,
  shadowRouteSelection: FullMatchShadowRouteSelectionResult,
  controlledSegmentSelection: FullMatchControlledSegmentSelectionResult,
  segmentRouteInput: FullMatchSegmentRouteInput,
  controlledMiniMatchRouteSource: FullMatchControlledMiniMatchRouteSource,
): MatchReport {
  const grounding = analyzeFullMatchGroundingDiagnostics(report);
  const groundingFacts = report.evidenceFacts.filter((fact) => fact.internalTags.includes("tactical_grounding_gap"));
  const chainFacts = report.evidenceFacts.filter((fact) =>
    fact.internalTags.includes("workbench_chain_consumption") ||
    fact.internalTags.includes("workbench_chain_segment_context") ||
    fact.internalTags.includes("workbench_chain_route_candidate_influence") ||
    fact.internalTags.includes("workbench_chain_shadow_route_selection") ||
    fact.internalTags.includes("workbench_chain_controlled_segment_selection") ||
    fact.internalTags.includes("workbench_chain_segment_route_input") ||
    fact.internalTags.includes("workbench_chain_controlled_minimatch_route_source")
  );
  const eventIds = groundingFacts.flatMap((fact) => fact.eventIds).slice(0, 6);
  const chainSummary = chainConsumption.status === "not_requested"
    ? "Le full-match normal reste en harnais segmente ; la chaine workbench n'est pas consommee par defaut."
    : `Le contexte workbench produit une selection shadow, puis une selection controlee experimentale, puis un input de route experimental SegmentRouteInput. Le moteur dispose maintenant d'une source de route controlee pour mini-match experimental sur le premier segment : ${controlledMiniMatchRouteSource.actionType ?? segmentRouteInput.actionType ?? controlledSegmentSelection.selectedActionType ?? shadowRouteSelection.shadowSelectionActionType ?? "none"} vers ${controlledMiniMatchRouteSource.receiverId ?? segmentRouteInput.receiverId ?? controlledSegmentSelection.selectedReceiverId ?? shadowRouteSelection.shadowSelectionReceiverId ?? "none"} en ${controlledMiniMatchRouteSource.targetZone ?? segmentRouteInput.targetZone ?? controlledSegmentSelection.selectedTargetZone ?? shadowRouteSelection.shadowSelectionTargetZone ?? "none"}. Cette source vient du SegmentRouteInput, lui-meme issu de la selection controlee workbench. Elle reste cantonnee au diagnostic sans modifier le score ni les evenements et ne pilote pas encore la resolution live du mini-match, le score, les evenements de score, ni les taux de succes des routes ; elle ne pilote pas encore la resolution reelle du full-match. Les routes fermees ou indisponibles restent rejetees avant la creation de cette source controlee. Influence candidates: ${routeCandidateInfluence.influencedCandidateCount}/${routeCandidateInfluence.candidateCount}.`;
  const warning: MatchReportWarning = {
    warningId: `${input.matchId}-tactical-grounding-gap`,
    type: "ADAPTER_LIMITATION",
    scope: "coach_visible",
    severity: "low",
    title: "Ancrage tactique full-match partiel",
    coachSummary: chainSummary,
    technicalSummary: `Grounding warnings: ${grounding.warnings.join(", ")}. Scope: ${grounding.scope}. May invalidate global economy: false.`,
    evidenceFactIds: [...groundingFacts, ...chainFacts].map((fact) => fact.factId),
    eventIds: chainFacts.length > 0 ? [...eventIds, ...chainFacts.flatMap((fact) => fact.eventIds)].slice(0, 8) : eventIds,
    mayInvalidateGlobalScoringEconomy: false,
  };
  const evidenceEvent = report.timeline.find((event) => event.eventType !== "kickoff") ?? report.timeline[0];
  const diagnosis: TacticalDiagnosis = {
    diagnosisId: `${input.matchId}-tactical-grounding-gap`,
    teamId: input.homeTeam.teamId,
    title: "Ancrage workbench maintenant partiel",
    summary: chainSummary,
    evidenceEventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: report.zoneStats.map((stats) => stats.zone).slice(0, 3),
    confidence: "low",
  };

  return {
    ...report,
    warnings: [...report.warnings, warning],
    tacticalReport: {
      diagnoses: [...report.tacticalReport.diagnoses, diagnosis],
    },
  };
}

export function runFullMatch(input: MatchInput, options?: FullMatchOptions): MatchReport {
  const routeSelectionMode = resolveFullMatchRouteSelectionMode(options);
  const chainConsumption = consumeWorkbenchChainForFullMatch({
    matchInput: input,
    routeSelectionMode,
    segmentLabel: "segment-1",
  });
  const chainSegmentContext = chainConsumptionToSegmentContext(chainConsumption);
  const routeCandidateInfluence = applyChainContextToRouteCandidates({
    segmentContext: chainSegmentContext,
    candidates: buildDiagnosticRouteCandidatesForSegment({
      segmentLabel: "segment-1",
      chainSegmentContext,
    }),
  });
  const shadowRouteSelection = selectShadowRouteFromInfluencedCandidates({
    influence: routeCandidateInfluence,
    ...(routeCandidateInfluence.selectedCandidateBefore === undefined ? {} : {
      productionSelectionCandidateId: routeCandidateInfluence.selectedCandidateBefore,
    }),
  });
  const controlledSegmentSelection = controlledSegmentSelectionFromShadow({
    shadowSelection: shadowRouteSelection,
  });
  const segmentRouteInput = segmentRouteInputFromControlledSelection({
    controlledSelection: controlledSegmentSelection,
  });
  const controlledMiniMatchRouteSource = controlledMiniMatchRouteSourceFromSegmentRouteInput({
    segmentRouteInput,
  });
  const adapter = adaptMatchInputToMiniMatch(input);
  const influence = createTacticalPlanInfluence(input);
  const zone = primaryZoneFromPlanInfluence({
    influence,
    fallbackZone: primaryReportZone(input),
  });
  let segmentState = createInitialFullMatchSegmentState(input);
  let cumulativeScore = { home: 0, away: 0 };
  let previousEventPattern = "";
  const segmentResults: FullMatchSegmentResult[] = [];
  const timelineSegments: MatchEvent[][] = [];
  const fatiguePropagation: FullMatchFatiguePropagationResult[] = [];

  for (const [index, config] of FULL_MATCH_SEGMENTS.entries()) {
    const sequenceCount = sequenceCountForSegment(config, segmentState);
    const segmentInfluence = index === 0 ? undefined : createFullMatchSegmentInfluence(segmentState);
    const miniMatch = runMiniMatch({
      ...adapter.miniMatchInput,
      numberOfSequences: sequenceCount,
      startTick: index * 100,
      ...miniMatchSeedInput((adapter.miniMatchInput.seed ?? 0) + segmentState.home.momentum + segmentState.away.defensiveStress, index),
      ...(segmentInfluence === undefined ? {} : { segmentInfluence }),
    });
    const rawSegmentEvents = timelineFromMiniMatch({
        matchInput: input,
        miniMatch,
        adapter,
        zone,
        influence,
        segment: {
          eventIdPrefix: config.label,
          sequenceIdPrefix: `full-match-${config.label}`,
          startMinute: config.startMinute,
          tickOffset: index * 100,
          period: config.period,
          includeKickoff: index === 0,
          segmentState,
          ...(segmentInfluence === undefined ? {} : { segmentInfluence }),
          ...(index === 0 && chainSegmentContext.status !== "not_available" ? { chainSegmentContext } : {}),
          ...(index === 0 && routeCandidateInfluence.status !== "not_available" ? { routeCandidateInfluence } : {}),
          ...(index === 0 && shadowRouteSelection.status !== "not_available" ? { shadowRouteSelection } : {}),
          ...(index === 0 && controlledSegmentSelection.status !== "not_available" ? { controlledSegmentSelection } : {}),
          ...(index === 0 && segmentRouteInput.status !== "not_available" ? { segmentRouteInput } : {}),
          ...(index === 0 && controlledMiniMatchRouteSource.status !== "not_available" ? { controlledMiniMatchRouteSource } : {}),
        },
      });
    const segmentScore = scoreFromTimeline({
      timeline: rawSegmentEvents,
      homeTeamId: input.homeTeam.teamId,
      awayTeamId: input.awayTeam.teamId,
    });
    const scoreAfterSegment = addScoreState(cumulativeScore, segmentScore);
    const eventPattern = rawSegmentEvents.map((event) => event.eventType).join(">");
    const repeatedPatternCount = previousEventPattern === eventPattern
      ? segmentState.repeatedPatternCount + 1
      : segmentState.repeatedPatternCount;
    const propagation = propagateFullMatchFatigue({
      matchInput: input,
      previousState: segmentState,
      segmentEvents: rawSegmentEvents,
      segmentIndex: index,
      minute: config.startMinute,
      scoreAfterSegment,
      repeatedPatternCount,
    });
    const segmentEvents = applySegmentFatigueToEvents({
      events: rawSegmentEvents,
      stateBeforeSegment: segmentState,
      stateAfterSegment: propagation.stateAfterSegment,
    });

    segmentResults.push({
      config,
      miniMatch,
      stateBeforeSegment: segmentState,
      ...(segmentInfluence === undefined ? {} : { segmentInfluence }),
      fatiguePropagation: propagation,
    });
    timelineSegments.push([...segmentEvents]);
    fatiguePropagation.push(propagation);
    segmentState = propagation.stateAfterSegment;
    cumulativeScore = scoreAfterSegment;
    previousEventPattern = eventPattern;
  }

  const timeline = timelineSegments.flat().sort(compareTimelineEvents);
  const score = scoreFromTimeline({
    timeline,
    homeTeamId: input.homeTeam.teamId,
    awayTeamId: input.awayTeam.teamId,
  });

  const report = buildMatchReport({
    matchInput: input,
    timeline,
    miniMatch: aggregateMiniMatchSegments(segmentResults),
    adapter,
    score,
    influence,
    fatigueReport: fatigueReportFromPropagation({
      matchInput: input,
      propagation: fatiguePropagation,
    }),
    generatedFrom: "runFullMatch",
    reportScope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    limitations: [
      "runFullMatch is a deterministic harness sample and cannot invalidate the 50-match economy.",
      "Harness warnings are warning-only and may not change scoring values.",
      `Full-match route selection mode: ${routeSelectionMode}.`,
      ...fullMatchRouteSelectionModeDiagnostics(routeSelectionMode),
      ...chainConsumptionLimitations(chainConsumption),
      ...chainSegmentContextLimitations(chainSegmentContext),
      ...routeCandidateInfluenceLimitations(routeCandidateInfluence),
      ...shadowRouteSelectionLimitations(shadowRouteSelection),
      ...controlledSegmentSelectionLimitations(controlledSegmentSelection),
      ...segmentRouteInputLimitations(segmentRouteInput),
      ...controlledMiniMatchRouteSourceLimitations(controlledMiniMatchRouteSource),
    ],
  });
  const chainFact = chainConsumptionEvidenceFact({
    report,
    matchInput: input,
    consumption: chainConsumption,
  });
  const chainContextFact = chainSegmentContextEvidenceFact({
    report,
    matchInput: input,
    context: chainSegmentContext,
  });
  const routeInfluenceFact = routeCandidateInfluenceEvidenceFact({
    report,
    matchInput: input,
    influence: routeCandidateInfluence,
  });
  const shadowSelectionFact = shadowRouteSelectionEvidenceFact({
    report,
    matchInput: input,
    selection: shadowRouteSelection,
  });
  const controlledSelectionFact = controlledSegmentSelectionEvidenceFact({
    report,
    matchInput: input,
    selection: controlledSegmentSelection,
  });
  const segmentRouteInputFact = segmentRouteInputEvidenceFact({
    report,
    matchInput: input,
    routeInput: segmentRouteInput,
  });
  const controlledRouteSourceFact = controlledMiniMatchRouteSourceEvidenceFact({
    report,
    matchInput: input,
    routeSource: controlledMiniMatchRouteSource,
  });
  const chainEvidenceFacts = [
    ...(chainFact === null ? [] : [chainFact]),
    ...(chainContextFact === null ? [] : [chainContextFact]),
    ...(routeInfluenceFact === null ? [] : [routeInfluenceFact]),
    ...(shadowSelectionFact === null ? [] : [shadowSelectionFact]),
    ...(controlledSelectionFact === null ? [] : [controlledSelectionFact]),
    ...(segmentRouteInputFact === null ? [] : [segmentRouteInputFact]),
    ...(controlledRouteSourceFact === null ? [] : [controlledRouteSourceFact]),
  ];
  const reportWithChainEvidence = chainEvidenceFacts.length === 0
    ? report
    : {
        ...report,
        evidenceFacts: [...report.evidenceFacts, ...chainEvidenceFacts],
      };

  return withFullMatchGroundingDiagnosis(
    withHarnessSanityDiagnosis(reportWithChainEvidence, input),
    input,
    chainConsumption,
    chainSegmentContext,
    routeCandidateInfluence,
    shadowRouteSelection,
    controlledSegmentSelection,
    segmentRouteInput,
    controlledMiniMatchRouteSource,
  );
}
