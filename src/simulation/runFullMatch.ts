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
import { liveSelectionOverrideGuardFromControlledRouteSource } from "./fullMatch/liveSelectionOverrideGuardFromControlledRouteSource";
import type { FullMatchLiveSelectionOverrideGuard } from "./fullMatch/fullMatchLiveSelectionOverrideGuard";
import { isolatedMiniMatchOverrideExperimentFromGuard } from "./fullMatch/isolatedMiniMatchOverrideExperimentFromGuard";
import type { FullMatchIsolatedMiniMatchOverrideExperiment } from "./fullMatch/fullMatchIsolatedMiniMatchOverrideExperiment";
import { controlledSegmentReplayComparisonFromExperiment } from "./fullMatch/controlledSegmentReplayComparisonFromExperiment";
import type { FullMatchControlledSegmentReplayComparison } from "./fullMatch/fullMatchControlledSegmentReplayComparison";
import { realIsolatedSegmentReplayFromComparison } from "./fullMatch/realIsolatedSegmentReplayFromComparison";
import type { FullMatchRealIsolatedSegmentReplay } from "./fullMatch/fullMatchRealIsolatedSegmentReplay";
import { controlledRouteResolutionSandboxFromReplay } from "./fullMatch/controlledRouteResolutionSandboxFromReplay";
import type { ControlledRouteResolutionSandbox } from "./fullMatch/controlledRouteResolutionSandbox";
import { sandboxScoringOpportunityModelFromResolution } from "./fullMatch/sandboxScoringOpportunityModelFromResolution";
import type { SandboxScoringOpportunityModel } from "./fullMatch/sandboxScoringOpportunityModel";
import { sandboxScoringEventCandidateModelFromOpportunity } from "./fullMatch/sandboxScoringEventCandidateModelFromOpportunity";
import type { SandboxScoringEventCandidateModel } from "./fullMatch/sandboxScoringEventCandidate";
import { sandboxScoringEventResolutionFromCandidate } from "./fullMatch/sandboxScoringEventResolutionFromCandidate";
import type { SandboxScoringEventResolutionModel } from "./fullMatch/sandboxScoringEventResolution";

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

function liveSelectionOverrideGuardLimitations(guard: FullMatchLiveSelectionOverrideGuard): readonly string[] {
  if (guard.status === "not_available") {
    return ["FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_EXPERIMENTAL",
    `FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_STATUS_${guard.status.toUpperCase()}`,
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DIAGNOSTIC_ONLY",
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_NOT_APPLIED_TO_LIVE_SELECTION",
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DID_NOT_MUTATE_SCORE",
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DID_NOT_MUTATE_SCORING_EVENTS",
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DID_NOT_CREATE_SCORING_EVENTS",
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DID_NOT_MUTATE_ROUTE_SUCCESS_RATES",
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_CANNOT_DRIVE_PRODUCTION_FULLMATCH_SELECTION",
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_CANNOT_DRIVE_NORMAL_LIVE_MINIMATCH_RESOLUTION",
    "FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function isolatedMiniMatchOverrideExperimentLimitations(
  experiment: FullMatchIsolatedMiniMatchOverrideExperiment,
): readonly string[] {
  if (experiment.status === "not_available") {
    return ["FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT_EXPERIMENTAL",
    `FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT_STATUS_${experiment.status.toUpperCase()}`,
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT_DIAGNOSTIC_ONLY",
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_APPLIED_ONLY_IN_ISOLATED_EXPERIMENT",
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_NORMAL_SCORE",
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_NORMAL_SCORING_EVENTS",
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES",
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_CANNOT_CLAIM_GLOBAL_ECONOMY",
    "FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function controlledSegmentReplayComparisonLimitations(
  comparison: FullMatchControlledSegmentReplayComparison,
): readonly string[] {
  if (comparison.status === "not_available") {
    return ["FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_EXPERIMENTAL",
    `FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_STATUS_${comparison.status.toUpperCase()}`,
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DIAGNOSTIC_ONLY",
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_APPLIED_ONLY_IN_ISOLATED_COMPARISON",
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_NORMAL_SCORE",
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_NORMAL_SCORING_EVENTS",
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES",
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_CANNOT_CLAIM_GLOBAL_ECONOMY",
    "FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function realIsolatedSegmentReplayLimitations(
  replay: FullMatchRealIsolatedSegmentReplay,
): readonly string[] {
  if (replay.status === "not_available") {
    return ["FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_EXPERIMENTAL",
    `FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_STATUS_${replay.status.toUpperCase()}`,
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DIAGNOSTIC_ONLY",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_EVENTS_EXPERIMENTAL_ONLY",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_EVENTS_NOT_OFFICIAL_MATCH_EVENTS",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_EVENTS_NOT_INSERTED_IN_OFFICIAL_TIMELINE",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_APPLIED_ONLY_IN_ISOLATED_ENGINE",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_MUTATE_OFFICIAL_SCORE",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_MUTATE_OFFICIAL_SCORING_EVENTS",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_CANNOT_CLAIM_GLOBAL_ECONOMY",
    "FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function controlledRouteResolutionSandboxLimitations(
  sandbox: ControlledRouteResolutionSandbox,
): readonly string[] {
  if (sandbox.status === "not_available") {
    return ["FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_EXPERIMENTAL",
    `FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_STATUS_${sandbox.status.toUpperCase()}`,
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_DIAGNOSTIC_ONLY",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_RESULTS_ISOLATED_ONLY",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_RESULTS_NOT_OFFICIAL_MATCH_EVENTS",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_NOT_INSERTED_IN_OFFICIAL_TIMELINE",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_APPLIED_ONLY_IN_ISOLATED_RESOLUTION",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_DID_NOT_MUTATE_OFFICIAL_SCORE",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_DID_NOT_MUTATE_OFFICIAL_SCORING_EVENTS",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_CANNOT_CLAIM_GLOBAL_ECONOMY",
    "FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function sandboxScoringOpportunityModelLimitations(
  model: SandboxScoringOpportunityModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_EXPERIMENTAL",
    `FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_STATUS_${model.status.toUpperCase()}`,
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_DIAGNOSTIC_ONLY",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_RESULTS_ISOLATED_ONLY",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_NOT_OFFICIAL_MATCH_EVENTS",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_NOT_INSERTED_IN_OFFICIAL_TIMELINE",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_APPLIED_ONLY_IN_SANDBOX",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_DID_NOT_MUTATE_OFFICIAL_SCORE",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_DID_NOT_MUTATE_OFFICIAL_SCORING_EVENTS",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_CANNOT_CLAIM_GLOBAL_ECONOMY",
    "FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function sandboxScoringEventCandidateModelLimitations(
  model: SandboxScoringEventCandidateModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_EXPERIMENTAL",
    `FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_STATUS_${model.status.toUpperCase()}`,
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_DIAGNOSTIC_ONLY",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_RESULTS_ISOLATED_ONLY",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_NOT_OFFICIAL_MATCH_EVENTS",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_NOT_INSERTED_IN_OFFICIAL_TIMELINE",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_APPLIED_ONLY_IN_SANDBOX",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_DID_NOT_MUTATE_OFFICIAL_SCORE",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_DID_NOT_MUTATE_OFFICIAL_SCORING_EVENTS",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_CANNOT_CLAIM_GLOBAL_ECONOMY",
    "FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
  ];
}

function sandboxScoringEventResolutionModelLimitations(
  model: SandboxScoringEventResolutionModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DISABLED_BY_DEFAULT"];
  }

  return [
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_EXPERIMENTAL",
    `FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_STATUS_${model.status.toUpperCase()}`,
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DIAGNOSTIC_ONLY",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_RESULTS_ISOLATED_ONLY",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_NOT_OFFICIAL_MATCH_EVENTS",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_NOT_INSERTED_IN_OFFICIAL_TIMELINE",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_APPLIED_ONLY_IN_SANDBOX",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DID_NOT_MUTATE_OFFICIAL_SCORE",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DID_NOT_MUTATE_OFFICIAL_SCORING_EVENTS",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_DID_NOT_MUTATE_GLOBAL_ROUTE_SUCCESS_RATES",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_CANNOT_CLAIM_GLOBAL_ECONOMY",
    "FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_CANNOT_SELECT_CLOSED_OR_UNAVAILABLE",
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

function liveSelectionOverrideGuardEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly guard: FullMatchLiveSelectionOverrideGuard;
}): MatchReportEvidenceFact | null {
  if (input.guard.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_live_selection_override_guard")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-live-selection-override-guard`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.guard.overrideTargetZone ?? "Z4-HSR"],
    summary:
      `Experimental live selection override guard ${input.guard.status}: origin ${input.guard.origin}, ` +
      `override candidate ${input.guard.overrideCandidateId ?? "none"} (${input.guard.overrideActionType ?? "none"}) ` +
      `to receiver ${input.guard.overrideReceiverId ?? "none"} in ${input.guard.overrideTargetZone ?? "none"}, ` +
      `sourceBaseScore=${input.guard.sourceBaseScore ?? 0}, sourceInfluenceDelta=${input.guard.sourceInfluenceDelta ?? 0}, ` +
      `sourceInfluencedScore=${input.guard.sourceInfluencedScore ?? 0}, candidateLegal=${input.guard.candidateLegal}, ` +
      `candidateAvailable=${input.guard.candidateAvailable}, closedRejected=${input.guard.rejectedClosedCandidateCount}, ` +
      `unavailableRejected=${input.guard.rejectedUnavailableCandidateCount}, experimentalOverridePrepared=${input.guard.experimentalOverridePrepared}, ` +
      `overrideAppliedToLiveSelection=${input.guard.overrideAppliedToLiveSelection}, diagnosticOnly=${input.guard.diagnosticOnly}, ` +
      `canMutateScore=${input.guard.canMutateScore}, canMutateScoringEvents=${input.guard.canMutateScoringEvents}, ` +
      `canMutateRouteSuccessRates=${input.guard.canMutateRouteSuccessRates}, canDriveProductionFullMatchSelection=${input.guard.canDriveProductionFullMatchSelection}, ` +
      `canDriveProductionRouteResolution=${input.guard.canDriveProductionRouteResolution}, ` +
      `canDriveNormalLiveMiniMatchResolution=${input.guard.canDriveNormalLiveMiniMatchResolution}, canCreateScoringEvents=${input.guard.canCreateScoringEvents}.`,
    confidence: input.guard.status === "available" ? "medium" : "low",
    strength: input.guard.status === "available" ? 66 : 22,
    coachVisible: false,
    internalTags: [
      "workbench_chain_live_selection_override_guard",
      "live_selection_override_guard_experimental",
      "live_selection_override_guard_diagnostic_only",
      "live_selection_override_guard_score_mutation_forbidden",
      "live_selection_override_guard_scoring_events_mutation_forbidden",
      "live_selection_override_guard_route_success_mutation_forbidden",
      "live_selection_override_guard_production_fullmatch_forbidden",
      "live_selection_override_guard_production_resolution_forbidden",
      "live_selection_override_guard_normal_live_resolution_forbidden",
      "live_selection_override_guard_scoring_event_creation_forbidden",
      "live_selection_override_guard_closed_candidates_rejected",
      "live_selection_override_guard_unavailable_candidates_rejected",
      ...(input.guard.chainId === undefined ? [] : [`live_selection_override_chain_id_${input.guard.chainId}`]),
      ...(input.guard.overrideCandidateId === undefined ? [] : [`live_selection_override_candidate_${input.guard.overrideCandidateId}`]),
      ...(input.guard.overrideActionType === undefined ? [] : [`live_selection_override_action_${input.guard.overrideActionType}`]),
      ...(input.guard.overrideReceiverId === undefined ? [] : [`live_selection_override_receiver_${input.guard.overrideReceiverId}`]),
      ...(input.guard.overrideTargetZone === undefined ? [] : [`live_selection_override_zone_${input.guard.overrideTargetZone}`]),
      `live_selection_override_candidate_legal_${input.guard.candidateLegal ? "true" : "false"}`,
      `live_selection_override_candidate_available_${input.guard.candidateAvailable ? "true" : "false"}`,
      `live_selection_override_closed_rejected_count_${input.guard.rejectedClosedCandidateCount}`,
      `live_selection_override_unavailable_rejected_count_${input.guard.rejectedUnavailableCandidateCount}`,
      `live_selection_override_applied_${input.guard.overrideAppliedToLiveSelection ? "true" : "false"}`,
      "score_mutation_count_0",
      "scoring_events_mutation_count_0",
      "scoring_event_creation_count_0",
      "route_success_mutation_count_0",
      "production_route_resolution_mutation_count_0",
      "normal_live_minimatch_resolution_mutation_count_0",
      ...input.guard.tags,
    ],
  };
}

function isolatedMiniMatchOverrideExperimentEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly experiment: FullMatchIsolatedMiniMatchOverrideExperiment;
}): MatchReportEvidenceFact | null {
  if (input.experiment.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_isolated_minimatch_override_experiment")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-isolated-minimatch-override-experiment`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.experiment.overrideTargetZone ?? "Z4-HSR"],
    summary:
      `Experimental isolated mini-match override experiment ${input.experiment.status}: origin ${input.experiment.origin}, ` +
      `baseline ${input.experiment.baselineCandidateId ?? "none"} (${input.experiment.baselineActionType ?? "none"}) ` +
      `to ${input.experiment.baselineReceiverId ?? "none"} in ${input.experiment.baselineTargetZone ?? "none"}, ` +
      `override ${input.experiment.overrideCandidateId ?? "none"} (${input.experiment.overrideActionType ?? "none"}) ` +
      `to ${input.experiment.overrideReceiverId ?? "none"} in ${input.experiment.overrideTargetZone ?? "none"}, ` +
      `overrideAppliedInIsolatedExperiment=${input.experiment.overrideAppliedInIsolatedExperiment}, ` +
      `overrideAppliedToNormalLiveSelection=${input.experiment.overrideAppliedToNormalLiveSelection}, ` +
      `candidateLegal=${input.experiment.candidateLegal}, candidateAvailable=${input.experiment.candidateAvailable}, ` +
      `closedRejected=${input.experiment.rejectedClosedCandidateCount}, unavailableRejected=${input.experiment.rejectedUnavailableCandidateCount}, ` +
      `selectionDivergence=${input.experiment.isolatedSelectionDivergenceObserved}, ` +
      `scoreDivergence=${input.experiment.isolatedScoreDivergenceObserved}, ` +
      `scoringEventDivergence=${input.experiment.isolatedScoringEventDivergenceObserved}, ` +
      `timelineDivergence=${input.experiment.isolatedTimelineDivergenceObserved}, diagnosticOnly=${input.experiment.diagnosticOnly}, ` +
      `canMutateNormalFullMatchScore=${input.experiment.canMutateNormalFullMatchScore}, ` +
      `canMutateNormalFullMatchScoringEvents=${input.experiment.canMutateNormalFullMatchScoringEvents}, ` +
      `canMutateProductionRouteResolution=${input.experiment.canMutateProductionRouteResolution}, ` +
      `canMutateGlobalRouteSuccessRates=${input.experiment.canMutateGlobalRouteSuccessRates}, ` +
      `canCreateProductionScoringEvents=${input.experiment.canCreateProductionScoringEvents}, ` +
      `canClaimGlobalEconomy=${input.experiment.canClaimGlobalEconomy}.`,
    confidence: input.experiment.status === "available" ? "medium" : "low",
    strength: input.experiment.status === "available" ? 68 : 24,
    coachVisible: false,
    internalTags: [
      "workbench_chain_isolated_minimatch_override_experiment",
      "isolated_minimatch_override_experiment",
      "isolated_override_diagnostic_only",
      ...(input.experiment.chainId === undefined ? [] : [`isolated_override_chain_id_${input.experiment.chainId}`]),
      ...(input.experiment.baselineCandidateId === undefined ? [] : [`isolated_override_baseline_candidate_${input.experiment.baselineCandidateId}`]),
      ...(input.experiment.overrideCandidateId === undefined ? [] : [`isolated_override_candidate_${input.experiment.overrideCandidateId}`]),
      ...(input.experiment.overrideActionType === undefined ? [] : [`isolated_override_action_${input.experiment.overrideActionType}`]),
      ...(input.experiment.overrideReceiverId === undefined ? [] : [`isolated_override_receiver_${input.experiment.overrideReceiverId}`]),
      ...(input.experiment.overrideTargetZone === undefined ? [] : [`isolated_override_zone_${input.experiment.overrideTargetZone}`]),
      `isolated_override_candidate_legal_${input.experiment.candidateLegal ? "true" : "false"}`,
      `isolated_override_candidate_available_${input.experiment.candidateAvailable ? "true" : "false"}`,
      `isolated_override_closed_rejected_count_${input.experiment.rejectedClosedCandidateCount}`,
      `isolated_override_unavailable_rejected_count_${input.experiment.rejectedUnavailableCandidateCount}`,
      `isolated_override_applied_in_experiment_${input.experiment.overrideAppliedInIsolatedExperiment ? "true" : "false"}`,
      `isolated_override_applied_to_normal_live_${input.experiment.overrideAppliedToNormalLiveSelection ? "true" : "false"}`,
      `isolated_override_selection_divergence_${input.experiment.isolatedSelectionDivergenceObserved ? "true" : "false"}`,
      `isolated_override_score_divergence_${input.experiment.isolatedScoreDivergenceObserved ? "true" : "false"}`,
      `isolated_override_scoring_event_divergence_${input.experiment.isolatedScoringEventDivergenceObserved ? "true" : "false"}`,
      `isolated_override_timeline_divergence_${input.experiment.isolatedTimelineDivergenceObserved ? "true" : "false"}`,
      "isolated_override_normal_score_mutation_forbidden",
      "isolated_override_normal_scoring_events_mutation_forbidden",
      "isolated_override_production_resolution_forbidden",
      "isolated_override_global_route_success_mutation_forbidden",
      "isolated_override_production_scoring_event_creation_forbidden",
      "isolated_override_global_economy_claim_forbidden",
      "isolated_override_closed_candidates_rejected",
      "isolated_override_unavailable_candidates_rejected",
      "normal_fullmatch_score_mutation_count_0",
      "normal_fullmatch_scoring_events_mutation_count_0",
      "production_scoring_event_creation_count_0",
      "production_route_resolution_mutation_count_0",
      "global_route_success_mutation_count_0",
      "global_economy_claim_count_0",
      ...input.experiment.tags,
    ],
  };
}

function controlledSegmentReplayComparisonEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly comparison: FullMatchControlledSegmentReplayComparison;
}): MatchReportEvidenceFact | null {
  if (input.comparison.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_controlled_segment_replay_comparison")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-controlled-segment-replay-comparison`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.comparison.baseline.targetZone ?? "Z2-HSL", input.comparison.override.targetZone ?? "Z4-HSR"],
    summary:
      `Experimental controlled segment replay comparison ${input.comparison.status}: origin ${input.comparison.origin}, ` +
      `baseline ${input.comparison.baseline.candidateId ?? "none"} (${input.comparison.baseline.actionType ?? "none"}) ` +
      `to ${input.comparison.baseline.receiverId ?? "none"} in ${input.comparison.baseline.targetZone ?? "none"}, ` +
      `override ${input.comparison.override.candidateId ?? "none"} (${input.comparison.override.actionType ?? "none"}) ` +
      `to ${input.comparison.override.receiverId ?? "none"} in ${input.comparison.override.targetZone ?? "none"}, ` +
      `baselinePossessionRetained=${input.comparison.baseline.possessionRetained}, overridePossessionRetained=${input.comparison.override.possessionRetained}, ` +
      `baselineResultingZone=${input.comparison.baseline.resultingZone ?? "none"}, overrideResultingZone=${input.comparison.override.resultingZone ?? "none"}, ` +
      `selectionDivergence=${input.comparison.selectionDivergenceObserved}, possessionContinuityDivergence=${input.comparison.possessionContinuityDivergenceObserved}, ` +
      `zoneProgressionDivergence=${input.comparison.zoneProgressionDivergenceObserved}, dangerCreationDivergence=${input.comparison.dangerCreationDivergenceObserved}, ` +
      `scoringOpportunityDivergence=${input.comparison.scoringOpportunityDivergenceObserved}, timelineDivergence=${input.comparison.timelineDivergenceObserved}, ` +
      `scoreDivergence=${input.comparison.scoreDivergenceObserved}, scoringEventDivergence=${input.comparison.scoringEventDivergenceObserved}, ` +
      `replayAppliedOnlyInIsolatedComparison=${input.comparison.replayAppliedOnlyInIsolatedComparison}, ` +
      `replayAppliedToNormalLiveSelection=${input.comparison.replayAppliedToNormalLiveSelection}, ` +
      `closedRejected=${input.comparison.rejectedClosedCandidateCount}, unavailableRejected=${input.comparison.rejectedUnavailableCandidateCount}, ` +
      `canMutateNormalFullMatchScore=${input.comparison.canMutateNormalFullMatchScore}, ` +
      `canMutateNormalFullMatchScoringEvents=${input.comparison.canMutateNormalFullMatchScoringEvents}, ` +
      `canMutateProductionRouteResolution=${input.comparison.canMutateProductionRouteResolution}, ` +
      `canMutateGlobalRouteSuccessRates=${input.comparison.canMutateGlobalRouteSuccessRates}, ` +
      `canCreateProductionScoringEvents=${input.comparison.canCreateProductionScoringEvents}, ` +
      `canClaimGlobalEconomy=${input.comparison.canClaimGlobalEconomy}.`,
    confidence: input.comparison.status === "available" ? "medium" : "low",
    strength: input.comparison.status === "available" ? 70 : 24,
    coachVisible: false,
    internalTags: [
      "workbench_chain_controlled_segment_replay_comparison",
      "controlled_segment_replay_comparison",
      ...(input.comparison.chainId === undefined ? [] : [`controlled_replay_chain_id_${input.comparison.chainId}`]),
      ...(input.comparison.baseline.candidateId === undefined ? [] : [`controlled_replay_baseline_candidate_${input.comparison.baseline.candidateId}`]),
      ...(input.comparison.baseline.actionType === undefined ? [] : [`controlled_replay_baseline_action_${input.comparison.baseline.actionType}`]),
      ...(input.comparison.baseline.receiverId === undefined ? [] : [`controlled_replay_baseline_receiver_${input.comparison.baseline.receiverId}`]),
      ...(input.comparison.baseline.targetZone === undefined ? [] : [`controlled_replay_baseline_zone_${input.comparison.baseline.targetZone}`]),
      ...(input.comparison.override.candidateId === undefined ? [] : [`controlled_replay_override_candidate_${input.comparison.override.candidateId}`]),
      ...(input.comparison.override.actionType === undefined ? [] : [`controlled_replay_override_action_${input.comparison.override.actionType}`]),
      ...(input.comparison.override.receiverId === undefined ? [] : [`controlled_replay_override_receiver_${input.comparison.override.receiverId}`]),
      ...(input.comparison.override.targetZone === undefined ? [] : [`controlled_replay_override_zone_${input.comparison.override.targetZone}`]),
      `controlled_replay_baseline_possession_retained_${input.comparison.baseline.possessionRetained ? "true" : "false"}`,
      `controlled_replay_override_possession_retained_${input.comparison.override.possessionRetained ? "true" : "false"}`,
      ...(input.comparison.baseline.resultingZone === undefined ? [] : [`controlled_replay_baseline_resulting_zone_${input.comparison.baseline.resultingZone}`]),
      ...(input.comparison.override.resultingZone === undefined ? [] : [`controlled_replay_override_resulting_zone_${input.comparison.override.resultingZone}`]),
      `controlled_replay_selection_divergence_${input.comparison.selectionDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_possession_continuity_divergence_${input.comparison.possessionContinuityDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_zone_progression_divergence_${input.comparison.zoneProgressionDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_danger_creation_divergence_${input.comparison.dangerCreationDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_scoring_opportunity_divergence_${input.comparison.scoringOpportunityDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_timeline_divergence_${input.comparison.timelineDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_score_divergence_${input.comparison.scoreDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_scoring_event_divergence_${input.comparison.scoringEventDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_applied_only_in_isolated_comparison_${input.comparison.replayAppliedOnlyInIsolatedComparison ? "true" : "false"}`,
      `controlled_replay_applied_to_normal_live_${input.comparison.replayAppliedToNormalLiveSelection ? "true" : "false"}`,
      "controlled_replay_normal_score_mutation_forbidden",
      "controlled_replay_normal_scoring_events_mutation_forbidden",
      "controlled_replay_production_resolution_forbidden",
      "controlled_replay_global_route_success_mutation_forbidden",
      "controlled_replay_production_scoring_event_creation_forbidden",
      "controlled_replay_global_economy_claim_forbidden",
      "controlled_replay_closed_candidates_rejected",
      "controlled_replay_unavailable_candidates_rejected",
      "normal_fullmatch_score_mutation_count_0",
      "normal_fullmatch_scoring_events_mutation_count_0",
      "production_scoring_event_creation_count_0",
      "production_route_resolution_mutation_count_0",
      "global_route_success_mutation_count_0",
      "global_economy_claim_count_0",
      ...input.comparison.tags,
    ],
  };
}

function realIsolatedSegmentReplayEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly replay: FullMatchRealIsolatedSegmentReplay;
}): MatchReportEvidenceFact | null {
  if (input.replay.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_real_isolated_segment_replay")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-real-isolated-segment-replay`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.replay.baseline.targetZone ?? "Z2-HSL", input.replay.override.targetZone ?? "Z4-HSR"],
    summary:
      `Experimental real isolated segment replay ${input.replay.status}: origin ${input.replay.origin}, ` +
      `baseline ${input.replay.baseline.candidateId ?? "none"} (${input.replay.baseline.actionType ?? "none"}) ` +
      `to ${input.replay.baseline.receiverId ?? "none"} in ${input.replay.baseline.targetZone ?? "none"} ` +
      `created ${input.replay.baselineEventCount} isolated event(s), resulting carrier ${input.replay.baseline.resultingCarrierId ?? "none"} ` +
      `at ${input.replay.baseline.resultingZone ?? "none"}; override ${input.replay.override.candidateId ?? "none"} ` +
      `(${input.replay.override.actionType ?? "none"}) to ${input.replay.override.receiverId ?? "none"} in ${input.replay.override.targetZone ?? "none"} ` +
      `created ${input.replay.overrideEventCount} isolated event(s), resulting carrier ${input.replay.override.resultingCarrierId ?? "none"} ` +
      `at ${input.replay.override.resultingZone ?? "none"}. ` +
      `selectionDivergence=${input.replay.selectionDivergenceObserved}, carrierDivergence=${input.replay.carrierDivergenceObserved}, ` +
      `zoneProgressionDivergence=${input.replay.zoneProgressionDivergenceObserved}, dangerCreationDivergence=${input.replay.dangerCreationDivergenceObserved}, ` +
      `isolatedTimelineDivergence=${input.replay.isolatedTimelineDivergenceObserved}, isolatedScoreDivergence=${input.replay.isolatedScoreDivergenceObserved}, ` +
      `isolatedScoringEventDivergence=${input.replay.isolatedScoringEventDivergenceObserved}, ` +
      `canInjectEventsIntoOfficialTimeline=${input.replay.canInjectEventsIntoOfficialTimeline}, ` +
      `canMutateOfficialScore=${input.replay.canMutateOfficialScore}, canMutateOfficialScoringEvents=${input.replay.canMutateOfficialScoringEvents}, ` +
      `canCreateProductionScoringEvents=${input.replay.canCreateProductionScoringEvents}, canClaimGlobalEconomy=${input.replay.canClaimGlobalEconomy}.`,
    confidence: input.replay.status === "available" ? "medium" : "low",
    strength: input.replay.status === "available" ? 72 : 24,
    coachVisible: false,
    internalTags: [
      "workbench_chain_real_isolated_segment_replay",
      "real_isolated_segment_replay",
      ...(input.replay.chainId === undefined ? [] : [`real_isolated_replay_chain_id_${input.replay.chainId}`]),
      ...(input.replay.baseline.candidateId === undefined ? [] : [`real_isolated_replay_baseline_candidate_${input.replay.baseline.candidateId}`]),
      ...(input.replay.baseline.actionType === undefined ? [] : [`real_isolated_replay_baseline_action_${input.replay.baseline.actionType}`]),
      ...(input.replay.baseline.receiverId === undefined ? [] : [`real_isolated_replay_baseline_receiver_${input.replay.baseline.receiverId}`]),
      ...(input.replay.baseline.targetZone === undefined ? [] : [`real_isolated_replay_baseline_zone_${input.replay.baseline.targetZone}`]),
      ...(input.replay.baseline.resultingCarrierId === undefined ? [] : [`real_isolated_replay_baseline_resulting_carrier_${input.replay.baseline.resultingCarrierId}`]),
      ...(input.replay.baseline.resultingZone === undefined ? [] : [`real_isolated_replay_baseline_resulting_zone_${input.replay.baseline.resultingZone}`]),
      `real_isolated_replay_baseline_event_count_${input.replay.baselineEventCount}`,
      ...(input.replay.override.candidateId === undefined ? [] : [`real_isolated_replay_override_candidate_${input.replay.override.candidateId}`]),
      ...(input.replay.override.actionType === undefined ? [] : [`real_isolated_replay_override_action_${input.replay.override.actionType}`]),
      ...(input.replay.override.receiverId === undefined ? [] : [`real_isolated_replay_override_receiver_${input.replay.override.receiverId}`]),
      ...(input.replay.override.targetZone === undefined ? [] : [`real_isolated_replay_override_zone_${input.replay.override.targetZone}`]),
      ...(input.replay.override.resultingCarrierId === undefined ? [] : [`real_isolated_replay_override_resulting_carrier_${input.replay.override.resultingCarrierId}`]),
      ...(input.replay.override.resultingZone === undefined ? [] : [`real_isolated_replay_override_resulting_zone_${input.replay.override.resultingZone}`]),
      `real_isolated_replay_override_event_count_${input.replay.overrideEventCount}`,
      ...(input.replay.baselineEventCount > 0 ? ["real_isolated_replay_baseline_events_present"] : []),
      ...(input.replay.overrideEventCount > 0 ? ["real_isolated_replay_override_events_present"] : []),
      `real_isolated_replay_selection_divergence_${input.replay.selectionDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_possession_continuity_divergence_${input.replay.possessionContinuityDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_carrier_divergence_${input.replay.carrierDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_zone_progression_divergence_${input.replay.zoneProgressionDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_danger_creation_divergence_${input.replay.dangerCreationDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_scoring_opportunity_divergence_${input.replay.scoringOpportunityDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_timeline_divergence_${input.replay.isolatedTimelineDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_score_divergence_${input.replay.isolatedScoreDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_scoring_event_divergence_${input.replay.isolatedScoringEventDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_applied_only_in_isolated_engine_${input.replay.replayAppliedOnlyInIsolatedEngine ? "true" : "false"}`,
      `real_isolated_replay_applied_to_normal_live_${input.replay.replayAppliedToNormalLiveSelection ? "true" : "false"}`,
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
      ...input.replay.tags,
    ],
  };
}

function controlledRouteResolutionSandboxEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly sandbox: ControlledRouteResolutionSandbox;
}): MatchReportEvidenceFact | null {
  if (input.sandbox.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_controlled_route_resolution_sandbox")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-controlled-route-resolution-sandbox`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.sandbox.baseline.targetZone ?? "Z2-HSL", input.sandbox.override.targetZone ?? "Z4-HSR"],
    summary:
      `Experimental controlled route resolution sandbox ${input.sandbox.status}: origin ${input.sandbox.origin}, ` +
      `baseline ${input.sandbox.baseline.candidateId ?? "none"} (${input.sandbox.baseline.actionType ?? "none"}) ` +
      `to ${input.sandbox.baseline.receiverId ?? "none"} in ${input.sandbox.baseline.targetZone ?? "none"} ` +
      `resolved=${input.sandbox.baselineResolved}, outcome=${input.sandbox.baseline.outcome}, ` +
      `defensivePressure=${input.sandbox.baseline.defensivePressure}, receptionQuality=${input.sandbox.baseline.receptionQuality}, ` +
      `turnoverRisk=${input.sandbox.baseline.turnoverRisk}, dangerProbability=${input.sandbox.baseline.dangerProbability}, ` +
      `scoringOpportunityProbability=${input.sandbox.baseline.scoringOpportunityProbability}; ` +
      `override ${input.sandbox.override.candidateId ?? "none"} (${input.sandbox.override.actionType ?? "none"}) ` +
      `to ${input.sandbox.override.receiverId ?? "none"} in ${input.sandbox.override.targetZone ?? "none"} ` +
      `resolved=${input.sandbox.overrideResolved}, outcome=${input.sandbox.override.outcome}, ` +
      `defensivePressure=${input.sandbox.override.defensivePressure}, receptionQuality=${input.sandbox.override.receptionQuality}, ` +
      `turnoverRisk=${input.sandbox.override.turnoverRisk}, dangerProbability=${input.sandbox.override.dangerProbability}, ` +
      `scoringOpportunityProbability=${input.sandbox.override.scoringOpportunityProbability}. ` +
      `selectionDivergence=${input.sandbox.selectionDivergenceObserved}, carrierDivergence=${input.sandbox.carrierDivergenceObserved}, ` +
      `zoneProgressionDivergence=${input.sandbox.zoneProgressionDivergenceObserved}, dangerCreationDivergence=${input.sandbox.dangerCreationDivergenceObserved}, ` +
      `scoringOpportunityDivergence=${input.sandbox.scoringOpportunityDivergenceObserved}, ` +
      `sandboxScoringEventDivergence=${input.sandbox.sandboxScoringEventDivergenceObserved}, sandboxScoreDivergence=${input.sandbox.sandboxScoreDivergenceObserved}, ` +
      `canInjectEventsIntoOfficialTimeline=${input.sandbox.canInjectEventsIntoOfficialTimeline}, ` +
      `canMutateOfficialScore=${input.sandbox.canMutateOfficialScore}, canMutateOfficialScoringEvents=${input.sandbox.canMutateOfficialScoringEvents}, ` +
      `canCreateProductionScoringEvents=${input.sandbox.canCreateProductionScoringEvents}, canClaimGlobalEconomy=${input.sandbox.canClaimGlobalEconomy}.`,
    confidence: input.sandbox.status === "available" ? "medium" : "low",
    strength: input.sandbox.status === "available" ? 74 : 24,
    coachVisible: false,
    internalTags: [
      "workbench_chain_controlled_route_resolution_sandbox",
      "controlled_route_resolution_sandbox",
      ...(input.sandbox.chainId === undefined ? [] : [`sandbox_chain_id_${input.sandbox.chainId}`]),
      ...(input.sandbox.baseline.candidateId === undefined ? [] : [`sandbox_baseline_candidate_${input.sandbox.baseline.candidateId}`]),
      ...(input.sandbox.baseline.actionType === undefined ? [] : [`sandbox_baseline_action_${input.sandbox.baseline.actionType}`]),
      ...(input.sandbox.baseline.receiverId === undefined ? [] : [`sandbox_baseline_receiver_${input.sandbox.baseline.receiverId}`]),
      ...(input.sandbox.baseline.targetZone === undefined ? [] : [`sandbox_baseline_zone_${input.sandbox.baseline.targetZone}`]),
      `sandbox_baseline_outcome_${input.sandbox.baseline.outcome}`,
      `sandbox_baseline_resolved_${input.sandbox.baselineResolved ? "true" : "false"}`,
      `sandbox_baseline_defensive_pressure_${input.sandbox.baseline.defensivePressure}`,
      `sandbox_baseline_reception_quality_${input.sandbox.baseline.receptionQuality}`,
      `sandbox_baseline_turnover_risk_${input.sandbox.baseline.turnoverRisk}`,
      `sandbox_baseline_danger_probability_${input.sandbox.baseline.dangerProbability}`,
      `sandbox_baseline_scoring_opportunity_probability_${input.sandbox.baseline.scoringOpportunityProbability}`,
      ...(input.sandbox.override.candidateId === undefined ? [] : [`sandbox_override_candidate_${input.sandbox.override.candidateId}`]),
      ...(input.sandbox.override.actionType === undefined ? [] : [`sandbox_override_action_${input.sandbox.override.actionType}`]),
      ...(input.sandbox.override.receiverId === undefined ? [] : [`sandbox_override_receiver_${input.sandbox.override.receiverId}`]),
      ...(input.sandbox.override.targetZone === undefined ? [] : [`sandbox_override_zone_${input.sandbox.override.targetZone}`]),
      `sandbox_override_outcome_${input.sandbox.override.outcome}`,
      `sandbox_override_resolved_${input.sandbox.overrideResolved ? "true" : "false"}`,
      `sandbox_override_defensive_pressure_${input.sandbox.override.defensivePressure}`,
      `sandbox_override_reception_quality_${input.sandbox.override.receptionQuality}`,
      `sandbox_override_turnover_risk_${input.sandbox.override.turnoverRisk}`,
      `sandbox_override_danger_probability_${input.sandbox.override.dangerProbability}`,
      `sandbox_override_scoring_opportunity_probability_${input.sandbox.override.scoringOpportunityProbability}`,
      `sandbox_selection_divergence_${input.sandbox.selectionDivergenceObserved ? "true" : "false"}`,
      `sandbox_carrier_divergence_${input.sandbox.carrierDivergenceObserved ? "true" : "false"}`,
      `sandbox_zone_progression_divergence_${input.sandbox.zoneProgressionDivergenceObserved ? "true" : "false"}`,
      `sandbox_danger_creation_divergence_${input.sandbox.dangerCreationDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_opportunity_divergence_${input.sandbox.scoringOpportunityDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_event_divergence_${input.sandbox.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
      `sandbox_score_divergence_${input.sandbox.sandboxScoreDivergenceObserved ? "true" : "false"}`,
      `sandbox_applied_only_in_isolated_resolution_${input.sandbox.sandboxAppliedOnlyInIsolatedResolution ? "true" : "false"}`,
      `sandbox_applied_to_normal_live_${input.sandbox.sandboxAppliedToNormalLiveSelection ? "true" : "false"}`,
      "sandbox_official_timeline_injection_forbidden",
      "sandbox_official_score_mutation_forbidden",
      "sandbox_official_scoring_events_mutation_forbidden",
      "sandbox_production_resolution_forbidden",
      "sandbox_global_route_success_mutation_forbidden",
      "sandbox_production_scoring_event_creation_forbidden",
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
      ...input.sandbox.tags,
    ],
  };
}

function sandboxScoringOpportunityModelEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: SandboxScoringOpportunityModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_sandbox_scoring_opportunity_model")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-sandbox-scoring-opportunity-model`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.model.baseline.targetZone ?? "Z2-HSL", input.model.override.targetZone ?? "Z4-HSR"],
    summary:
      `Experimental sandbox scoring opportunity model ${input.model.status}: origin ${input.model.origin}, ` +
      `baseline ${input.model.baseline.candidateId ?? "none"} (${input.model.baseline.actionType ?? "none"}) ` +
      `to ${input.model.baseline.receiverId ?? "none"} in ${input.model.baseline.targetZone ?? "none"} ` +
      `routeOutcome=${input.model.baseline.routeOutcome ?? "none"}, sourceDangerProbability=${input.model.baseline.sourceDangerProbability}, ` +
      `sourceScoringOpportunityProbability=${input.model.baseline.sourceScoringOpportunityProbability}, ` +
      `opportunityType=${input.model.baseline.opportunityType}, opportunityFamily=${input.model.baseline.opportunityFamily}, ` +
      `opportunityProbability=${input.model.baseline.opportunityProbability}, opportunityCreated=${input.model.baseline.opportunityCreated}; ` +
      `override ${input.model.override.candidateId ?? "none"} (${input.model.override.actionType ?? "none"}) ` +
      `to ${input.model.override.receiverId ?? "none"} in ${input.model.override.targetZone ?? "none"} ` +
      `routeOutcome=${input.model.override.routeOutcome ?? "none"}, sourceDangerProbability=${input.model.override.sourceDangerProbability}, ` +
      `sourceScoringOpportunityProbability=${input.model.override.sourceScoringOpportunityProbability}, ` +
      `opportunityType=${input.model.override.opportunityType}, opportunityFamily=${input.model.override.opportunityFamily}, ` +
      `opportunityProbability=${input.model.override.opportunityProbability}, opportunityCreated=${input.model.override.opportunityCreated}. ` +
      `typeDivergence=${input.model.opportunityTypeDivergenceObserved}, familyDivergence=${input.model.opportunityFamilyDivergenceObserved}, ` +
      `probabilityDivergence=${input.model.opportunityProbabilityDivergenceObserved}, creationDivergence=${input.model.opportunityCreationDivergenceObserved}, ` +
      `sandboxScoringEventDivergence=${input.model.sandboxScoringEventDivergenceObserved}, sandboxScoreDivergence=${input.model.sandboxScoreDivergenceObserved}, ` +
      `canInjectEventsIntoOfficialTimeline=${input.model.canInjectEventsIntoOfficialTimeline}, canMutateOfficialScore=${input.model.canMutateOfficialScore}, ` +
      `canMutateOfficialScoringEvents=${input.model.canMutateOfficialScoringEvents}, canCreateProductionScoringEvents=${input.model.canCreateProductionScoringEvents}, ` +
      `canClaimGlobalEconomy=${input.model.canClaimGlobalEconomy}.`,
    confidence: input.model.status === "available" ? "medium" : "low",
    strength: input.model.status === "available" ? 76 : 24,
    coachVisible: false,
    internalTags: [
      "workbench_chain_sandbox_scoring_opportunity_model",
      "sandbox_scoring_opportunity_model",
      ...(input.model.chainId === undefined ? [] : [`sandbox_opportunity_chain_id_${input.model.chainId}`]),
      ...input.model.tags,
    ],
  };
}

function sandboxScoringEventCandidateModelEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: SandboxScoringEventCandidateModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_sandbox_scoring_event_candidate")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-sandbox-scoring-event-candidate`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.model.baseline.targetZone ?? "Z2-HSL", input.model.override.targetZone ?? "Z4-HSR"],
    summary:
      `Experimental sandbox scoring event candidate ${input.model.status}: origin ${input.model.origin}, ` +
      `baseline opportunity=${input.model.baseline.sourceOpportunityType ?? "none"}, candidate=${input.model.baseline.scoringCandidateType}, ` +
      `family=${input.model.baseline.scoringCandidateFamily}, probability=${input.model.baseline.scoringCandidateProbability}, ` +
      `conversionProbability=${input.model.baseline.conversionProbability}, created=${input.model.baseline.scoringCandidateCreated}; ` +
      `override opportunity=${input.model.override.sourceOpportunityType ?? "none"}, candidate=${input.model.override.scoringCandidateType}, ` +
      `family=${input.model.override.scoringCandidateFamily}, probability=${input.model.override.scoringCandidateProbability}, ` +
      `conversionProbability=${input.model.override.conversionProbability}, created=${input.model.override.scoringCandidateCreated}. ` +
      `typeDivergence=${input.model.scoringCandidateTypeDivergenceObserved}, familyDivergence=${input.model.scoringCandidateFamilyDivergenceObserved}, ` +
      `probabilityDivergence=${input.model.scoringCandidateProbabilityDivergenceObserved}, creationDivergence=${input.model.scoringCandidateCreationDivergenceObserved}, ` +
      `conversionDivergence=${input.model.conversionProbabilityDivergenceObserved}, sandboxScoringEventDivergence=${input.model.sandboxScoringEventDivergenceObserved}, ` +
      `sandboxScoreDivergence=${input.model.sandboxScoreDivergenceObserved}, canInjectEventsIntoOfficialTimeline=${input.model.canInjectEventsIntoOfficialTimeline}, ` +
      `canMutateOfficialScore=${input.model.canMutateOfficialScore}, canMutateOfficialScoringEvents=${input.model.canMutateOfficialScoringEvents}, ` +
      `canCreateProductionScoringEvents=${input.model.canCreateProductionScoringEvents}, canClaimGlobalEconomy=${input.model.canClaimGlobalEconomy}.`,
    confidence: input.model.status === "available" ? "medium" : "low",
    strength: input.model.status === "available" ? 78 : 24,
    coachVisible: false,
    internalTags: [
      "workbench_chain_sandbox_scoring_event_candidate",
      "sandbox_scoring_event_candidate",
      ...(input.model.chainId === undefined ? [] : [`sandbox_scoring_candidate_chain_id_${input.model.chainId}`]),
      ...input.model.tags,
    ],
  };
}

function sandboxScoringEventResolutionModelEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: SandboxScoringEventResolutionModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  const evidenceEvent = input.report.timeline.find((event) =>
    event.tags.includes("workbench_chain_sandbox_scoring_event_resolution")
  ) ?? input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-workbench-chain-sandbox-scoring-event-resolution`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: [input.model.baseline.targetZone ?? "Z2-HSL", input.model.override.targetZone ?? "Z4-HSR"],
    summary:
      `Experimental sandbox scoring event resolution ${input.model.status}: origin ${input.model.origin}, ` +
      `baseline candidate=${input.model.baseline.sourceScoringCandidateType ?? "none"}, resolution=${input.model.baseline.resolutionType}, ` +
      `shotAttempt=${input.model.baseline.shotAttemptCreated}, shotQuality=${input.model.baseline.shotQuality}, ` +
      `goalkeeperResponse=${input.model.baseline.goalkeeperResponse}; override candidate=${input.model.override.sourceScoringCandidateType ?? "none"}, ` +
      `resolution=${input.model.override.resolutionType}, shotAttempt=${input.model.override.shotAttemptCreated}, ` +
      `shotQuality=${input.model.override.shotQuality}, goalkeeperResponse=${input.model.override.goalkeeperResponse}. ` +
      `resolutionDivergence=${input.model.scoringResolutionTypeDivergenceObserved}, shotAttemptDivergence=${input.model.shotAttemptCreationDivergenceObserved}, ` +
      `shotQualityDivergence=${input.model.shotQualityDivergenceObserved}, goalkeeperResponseDivergence=${input.model.goalkeeperResponseDivergenceObserved}, ` +
      `sandboxScoringEventDivergence=${input.model.sandboxScoringEventDivergenceObserved}, sandboxScoreDivergence=${input.model.sandboxScoreDivergenceObserved}, ` +
      `canInjectEventsIntoOfficialTimeline=${input.model.canInjectEventsIntoOfficialTimeline}, canMutateOfficialScore=${input.model.canMutateOfficialScore}, ` +
      `canMutateOfficialScoringEvents=${input.model.canMutateOfficialScoringEvents}, canCreateProductionScoringEvents=${input.model.canCreateProductionScoringEvents}, ` +
      `canClaimGlobalEconomy=${input.model.canClaimGlobalEconomy}.`,
    confidence: input.model.status === "available" ? "medium" : "low",
    strength: input.model.status === "available" ? 80 : 24,
    coachVisible: false,
    internalTags: [
      "workbench_chain_sandbox_scoring_event_resolution",
      "sandbox_scoring_event_resolution",
      ...(input.model.chainId === undefined ? [] : [`sandbox_scoring_resolution_chain_id_${input.model.chainId}`]),
      ...input.model.tags,
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
  liveSelectionOverrideGuard: FullMatchLiveSelectionOverrideGuard,
  isolatedMiniMatchOverrideExperiment: FullMatchIsolatedMiniMatchOverrideExperiment,
  controlledSegmentReplayComparison: FullMatchControlledSegmentReplayComparison,
  realIsolatedSegmentReplay: FullMatchRealIsolatedSegmentReplay,
  controlledRouteResolutionSandbox: ControlledRouteResolutionSandbox,
  sandboxScoringOpportunityModel: SandboxScoringOpportunityModel,
  sandboxScoringEventCandidateModel: SandboxScoringEventCandidateModel,
  sandboxScoringEventResolutionModel: SandboxScoringEventResolutionModel,
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
    fact.internalTags.includes("workbench_chain_controlled_minimatch_route_source") ||
    fact.internalTags.includes("workbench_chain_live_selection_override_guard") ||
    fact.internalTags.includes("workbench_chain_isolated_minimatch_override_experiment") ||
    fact.internalTags.includes("workbench_chain_controlled_segment_replay_comparison") ||
    fact.internalTags.includes("workbench_chain_real_isolated_segment_replay") ||
    fact.internalTags.includes("workbench_chain_controlled_route_resolution_sandbox") ||
    fact.internalTags.includes("workbench_chain_sandbox_scoring_opportunity_model") ||
    fact.internalTags.includes("workbench_chain_sandbox_scoring_event_candidate") ||
    fact.internalTags.includes("workbench_chain_sandbox_scoring_event_resolution")
  );
  const eventIds = groundingFacts.flatMap((fact) => fact.eventIds).slice(0, 6);
  const chainSummary = chainConsumption.status === "not_requested"
    ? "Le full-match normal reste en harnais segmente ; la chaine workbench n'est pas consommee par defaut."
    : `Le contexte workbench produit une selection shadow, puis une selection controlee experimentale, puis un input de route experimental SegmentRouteInput. Le moteur dispose maintenant d'une source de route controlee pour mini-match, en mode experimental, sur le premier segment : ${controlledMiniMatchRouteSource.actionType ?? segmentRouteInput.actionType ?? controlledSegmentSelection.selectedActionType ?? shadowRouteSelection.shadowSelectionActionType ?? "none"} vers ${controlledMiniMatchRouteSource.receiverId ?? segmentRouteInput.receiverId ?? controlledSegmentSelection.selectedReceiverId ?? shadowRouteSelection.shadowSelectionReceiverId ?? "none"} en ${controlledMiniMatchRouteSource.targetZone ?? segmentRouteInput.targetZone ?? controlledSegmentSelection.selectedTargetZone ?? shadowRouteSelection.shadowSelectionTargetZone ?? "none"}. La selection controlee experimentale ne pilote pas encore la resolution reelle du full-match. La source de route controlee pour mini-match ne pilote pas encore la resolution live du mini-match. Le moteur prepare maintenant un override de selection live experimental pour le premier segment : ${liveSelectionOverrideGuard.overrideActionType ?? controlledMiniMatchRouteSource.actionType ?? "none"} vers ${liveSelectionOverrideGuard.overrideReceiverId ?? controlledMiniMatchRouteSource.receiverId ?? "none"} en ${liveSelectionOverrideGuard.overrideTargetZone ?? controlledMiniMatchRouteSource.targetZone ?? "none"}. Il reste volontairement non applique a la selection live normale. Le moteur applique maintenant l'override uniquement dans une experience mini-match isolee : ${isolatedMiniMatchOverrideExperiment.overrideActionType ?? liveSelectionOverrideGuard.overrideActionType ?? "none"} vers ${isolatedMiniMatchOverrideExperiment.overrideReceiverId ?? liveSelectionOverrideGuard.overrideReceiverId ?? "none"} en ${isolatedMiniMatchOverrideExperiment.overrideTargetZone ?? liveSelectionOverrideGuard.overrideTargetZone ?? "none"}. Le moteur compare maintenant deux replays controles du premier segment : la reference ${controlledSegmentReplayComparison.baseline.actionType ?? isolatedMiniMatchOverrideExperiment.baselineActionType ?? "none"} vers ${controlledSegmentReplayComparison.baseline.receiverId ?? isolatedMiniMatchOverrideExperiment.baselineReceiverId ?? "none"} en ${controlledSegmentReplayComparison.baseline.targetZone ?? isolatedMiniMatchOverrideExperiment.baselineTargetZone ?? "none"} et l'override ${controlledSegmentReplayComparison.override.actionType ?? isolatedMiniMatchOverrideExperiment.overrideActionType ?? "none"} vers ${controlledSegmentReplayComparison.override.receiverId ?? isolatedMiniMatchOverrideExperiment.overrideReceiverId ?? "none"} en ${controlledSegmentReplayComparison.override.targetZone ?? isolatedMiniMatchOverrideExperiment.overrideTargetZone ?? "none"}. Le moteur genere aussi de vrais evenements de replay isole : ${realIsolatedSegmentReplay.baselineEventCount} pour la reference et ${realIsolatedSegmentReplay.overrideEventCount} pour l'override. Il resout maintenant ces deux routes dans une sandbox de resolution controlee : reference ${controlledRouteResolutionSandbox.baseline.outcome} avec danger ${controlledRouteResolutionSandbox.baseline.dangerProbability}/100, override ${controlledRouteResolutionSandbox.override.outcome} avec danger ${controlledRouteResolutionSandbox.override.dangerProbability}/100. Cette sandbox reste strictement isolee : ses resultats ne sont pas des MatchEvents officiels, ne sont pas injectes dans la timeline officielle, ne modifient pas le score officiel, les evenements de score officiels, la resolution de route production, ni la preuve d'economie globale. Cette comparaison montre une divergence de selection, de porteur, de progression territoriale et de danger, mais elle reste isolee : elle ne modifie pas le full-match normal. L'override n'est pas applique a la selection live normale. Les routes fermees ou indisponibles restent rejetees avant la comparaison et la sandbox. Cette source, ce garde, cette comparaison, ce replay reel isole et cette sandbox restent cantonnes au diagnostic sans modifier le score ni les evenements ; ils ne pilotent pas encore la resolution reelle du full-match. Influence candidates: ${routeCandidateInfluence.influencedCandidateCount}/${routeCandidateInfluence.candidateCount}.`;
  const opportunitySummary = sandboxScoringOpportunityModel.status === "not_available"
    ? ""
    : ` Le modele sandbox d'opportunite de scoring classe ensuite la reference en ${sandboxScoringOpportunityModel.baseline.opportunityType} (${sandboxScoringOpportunityModel.baseline.opportunityProbability}/100) et l'override en ${sandboxScoringOpportunityModel.override.opportunityType} (${sandboxScoringOpportunityModel.override.opportunityProbability}/100). Ce signal reste sandbox-only : il ne cree aucun MatchEvent officiel, aucun evenement de score production, ne modifie pas le score officiel, les evenements de score officiels, la resolution de route production, ni la preuve d'economie globale.`;
  const scoringCandidateSummary = sandboxScoringEventCandidateModel.status === "not_available"
    ? ""
    : ` Le candidat sandbox d'evenement de scoring transforme ensuite cette opportunite en ${sandboxScoringEventCandidateModel.override.scoringCandidateType} pour l'override, avec conversion ${sandboxScoringEventCandidateModel.override.conversionProbability}/100, tandis que la reference reste ${sandboxScoringEventCandidateModel.baseline.scoringCandidateType}. Ce candidat reste sandbox-only : il ne cree aucun MatchEvent officiel, aucun evenement de score production, ne modifie pas le score officiel, les evenements de score officiels, la resolution de route production, ni la preuve d'economie globale.`;
  const scoringResolutionSummary = sandboxScoringEventResolutionModel.status === "not_available"
    ? ""
    : ` La resolution sandbox d'evenement de scoring transforme enfin ce candidat en resultat ${sandboxScoringEventResolutionModel.override.resolutionType} pour l'override, avec qualite de tir ${sandboxScoringEventResolutionModel.override.shotQuality}/100 et reponse gardien ${sandboxScoringEventResolutionModel.override.goalkeeperResponse}; la reference reste ${sandboxScoringEventResolutionModel.baseline.resolutionType}. Cette resolution reste sandbox-only : elle ne cree aucun MatchEvent officiel, aucun evenement de score production, ne modifie pas le score officiel, les evenements de score officiels, la resolution de route production, ni la preuve d'economie globale.`;
  const coachSummary = `${chainSummary}${opportunitySummary}${scoringCandidateSummary}${scoringResolutionSummary}`;
  const warning: MatchReportWarning = {
    warningId: `${input.matchId}-tactical-grounding-gap`,
    type: "ADAPTER_LIMITATION",
    scope: "coach_visible",
    severity: "low",
    title: "Ancrage tactique full-match partiel",
    coachSummary,
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
    summary: coachSummary,
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
  const liveSelectionOverrideGuard = liveSelectionOverrideGuardFromControlledRouteSource({
    controlledRouteSource: controlledMiniMatchRouteSource,
  });
  const isolatedMiniMatchOverrideExperiment = isolatedMiniMatchOverrideExperimentFromGuard({
    liveSelectionOverrideGuard,
    ...(routeCandidateInfluence.selectedCandidateBefore === undefined ? {} : {
      baselineCandidateId: routeCandidateInfluence.selectedCandidateBefore,
    }),
    baselineActionType: "SAFE_RECYCLE",
    baselineReceiverId: "control-pivot",
    baselineTargetZone: "Z2-HSL",
  });
  const controlledSegmentReplayComparison = controlledSegmentReplayComparisonFromExperiment({
    experiment: isolatedMiniMatchOverrideExperiment,
  });
  const realIsolatedSegmentReplay = realIsolatedSegmentReplayFromComparison({
    comparison: controlledSegmentReplayComparison,
  });
  const controlledRouteResolutionSandbox = controlledRouteResolutionSandboxFromReplay({
    replay: realIsolatedSegmentReplay,
  });
  const sandboxScoringOpportunityModel = sandboxScoringOpportunityModelFromResolution({
    sandbox: controlledRouteResolutionSandbox,
  });
  const sandboxScoringEventCandidateModel = sandboxScoringEventCandidateModelFromOpportunity({
    opportunityModel: sandboxScoringOpportunityModel,
  });
  const sandboxScoringEventResolutionModel = sandboxScoringEventResolutionFromCandidate({
    candidateModel: sandboxScoringEventCandidateModel,
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
          ...(index === 0 && liveSelectionOverrideGuard.status !== "not_available" ? { liveSelectionOverrideGuard } : {}),
          ...(index === 0 && isolatedMiniMatchOverrideExperiment.status !== "not_available" ? { isolatedMiniMatchOverrideExperiment } : {}),
          ...(index === 0 && controlledSegmentReplayComparison.status !== "not_available" ? { controlledSegmentReplayComparison } : {}),
          ...(index === 0 && realIsolatedSegmentReplay.status !== "not_available" ? { realIsolatedSegmentReplay } : {}),
          ...(index === 0 && controlledRouteResolutionSandbox.status !== "not_available" ? { controlledRouteResolutionSandbox } : {}),
          ...(index === 0 && sandboxScoringOpportunityModel.status !== "not_available" ? { sandboxScoringOpportunityModel } : {}),
          ...(index === 0 && sandboxScoringEventCandidateModel.status !== "not_available" ? { sandboxScoringEventCandidateModel } : {}),
          ...(index === 0 && sandboxScoringEventResolutionModel.status !== "not_available" ? { sandboxScoringEventResolutionModel } : {}),
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
      ...liveSelectionOverrideGuardLimitations(liveSelectionOverrideGuard),
      ...isolatedMiniMatchOverrideExperimentLimitations(isolatedMiniMatchOverrideExperiment),
      ...controlledSegmentReplayComparisonLimitations(controlledSegmentReplayComparison),
      ...realIsolatedSegmentReplayLimitations(realIsolatedSegmentReplay),
      ...controlledRouteResolutionSandboxLimitations(controlledRouteResolutionSandbox),
      ...sandboxScoringOpportunityModelLimitations(sandboxScoringOpportunityModel),
      ...sandboxScoringEventCandidateModelLimitations(sandboxScoringEventCandidateModel),
      ...sandboxScoringEventResolutionModelLimitations(sandboxScoringEventResolutionModel),
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
  const liveSelectionOverrideGuardFact = liveSelectionOverrideGuardEvidenceFact({
    report,
    matchInput: input,
    guard: liveSelectionOverrideGuard,
  });
  const isolatedMiniMatchOverrideExperimentFact = isolatedMiniMatchOverrideExperimentEvidenceFact({
    report,
    matchInput: input,
    experiment: isolatedMiniMatchOverrideExperiment,
  });
  const controlledSegmentReplayComparisonFact = controlledSegmentReplayComparisonEvidenceFact({
    report,
    matchInput: input,
    comparison: controlledSegmentReplayComparison,
  });
  const realIsolatedSegmentReplayFact = realIsolatedSegmentReplayEvidenceFact({
    report,
    matchInput: input,
    replay: realIsolatedSegmentReplay,
  });
  const controlledRouteResolutionSandboxFact = controlledRouteResolutionSandboxEvidenceFact({
    report,
    matchInput: input,
    sandbox: controlledRouteResolutionSandbox,
  });
  const sandboxScoringOpportunityModelFact = sandboxScoringOpportunityModelEvidenceFact({
    report,
    matchInput: input,
    model: sandboxScoringOpportunityModel,
  });
  const sandboxScoringEventCandidateModelFact = sandboxScoringEventCandidateModelEvidenceFact({
    report,
    matchInput: input,
    model: sandboxScoringEventCandidateModel,
  });
  const sandboxScoringEventResolutionModelFact = sandboxScoringEventResolutionModelEvidenceFact({
    report,
    matchInput: input,
    model: sandboxScoringEventResolutionModel,
  });
  const chainEvidenceFacts = [
    ...(chainFact === null ? [] : [chainFact]),
    ...(chainContextFact === null ? [] : [chainContextFact]),
    ...(routeInfluenceFact === null ? [] : [routeInfluenceFact]),
    ...(shadowSelectionFact === null ? [] : [shadowSelectionFact]),
    ...(controlledSelectionFact === null ? [] : [controlledSelectionFact]),
    ...(segmentRouteInputFact === null ? [] : [segmentRouteInputFact]),
    ...(controlledRouteSourceFact === null ? [] : [controlledRouteSourceFact]),
    ...(liveSelectionOverrideGuardFact === null ? [] : [liveSelectionOverrideGuardFact]),
    ...(isolatedMiniMatchOverrideExperimentFact === null ? [] : [isolatedMiniMatchOverrideExperimentFact]),
    ...(controlledSegmentReplayComparisonFact === null ? [] : [controlledSegmentReplayComparisonFact]),
    ...(realIsolatedSegmentReplayFact === null ? [] : [realIsolatedSegmentReplayFact]),
    ...(controlledRouteResolutionSandboxFact === null ? [] : [controlledRouteResolutionSandboxFact]),
    ...(sandboxScoringOpportunityModelFact === null ? [] : [sandboxScoringOpportunityModelFact]),
    ...(sandboxScoringEventCandidateModelFact === null ? [] : [sandboxScoringEventCandidateModelFact]),
    ...(sandboxScoringEventResolutionModelFact === null ? [] : [sandboxScoringEventResolutionModelFact]),
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
    liveSelectionOverrideGuard,
    isolatedMiniMatchOverrideExperiment,
    controlledSegmentReplayComparison,
    realIsolatedSegmentReplay,
    controlledRouteResolutionSandbox,
    sandboxScoringOpportunityModel,
    sandboxScoringEventCandidateModel,
    sandboxScoringEventResolutionModel,
  );
}
