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
      reason: `Official tactical plans influence this adapter through sequence count, report zones, and event tags. ${input.influence.explanation}${chainSegmentContextReason(input.segment.chainSegmentContext)}${routeCandidateInfluenceReason(input.segment.routeCandidateInfluence)}`,
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
      reason: `${input.record.setup.openingLine} Final danger ${finalContext.currentDanger}, pressure ${finalContext.pressureLevel}, possession stability ${finalContext.possessionStability}. Score context ${input.segment.segmentState?.score.home ?? 0}-${input.segment.segmentState?.score.away ?? 0}; momentum ${teamState?.momentum ?? 50}. Plan influence: ${input.influence.explanation}${chainSegmentContextReason(input.segment.chainSegmentContext)}${routeCandidateInfluenceReason(input.segment.routeCandidateInfluence)}`,
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
        `Scoring summary converted into the official MatchEvent shape. Score context before segment ${input.segment.segmentState?.score.home ?? 0}-${input.segment.segmentState?.score.away ?? 0}; momentum ${teamState?.momentum ?? 50}. Plan influence: ${input.influence.explanation}${chainSegmentContextReason(input.segment.chainSegmentContext)}${routeCandidateInfluenceReason(input.segment.routeCandidateInfluence)}`,
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
