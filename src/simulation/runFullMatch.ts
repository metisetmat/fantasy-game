import type { FatigueReport, MatchEvent, MatchInput, MatchReport, TacticalDiagnosis } from "../contracts/engineToCoach";
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

function withFullMatchGroundingDiagnosis(report: MatchReport, input: MatchInput): MatchReport {
  const grounding = analyzeFullMatchGroundingDiagnostics(report);
  const groundingFacts = report.evidenceFacts.filter((fact) => fact.internalTags.includes("tactical_grounding_gap"));
  const eventIds = groundingFacts.flatMap((fact) => fact.eventIds).slice(0, 6);
  const warning: MatchReportWarning = {
    warningId: `${input.matchId}-tactical-grounding-gap`,
    type: "ADAPTER_LIMITATION",
    scope: "coach_visible",
    severity: "low",
    title: "Ancrage tactique full-match partiel",
    coachSummary:
      "Le moteur sait convertir le roster et une verite workbench en contexte spatial type, mais le full-match ne rejoue pas encore toute la chaine workbench.",
    technicalSummary: `Grounding warnings: ${grounding.warnings.join(", ")}. Scope: ${grounding.scope}. May invalidate global economy: false.`,
    evidenceFactIds: groundingFacts.map((fact) => fact.factId),
    eventIds,
    mayInvalidateGlobalScoringEconomy: false,
  };
  const evidenceEvent = report.timeline.find((event) => event.eventType !== "kickoff") ?? report.timeline[0];
  const diagnosis: TacticalDiagnosis = {
    diagnosisId: `${input.matchId}-tactical-grounding-gap`,
    teamId: input.homeTeam.teamId,
    title: "Ancrage workbench maintenant partiel",
    summary:
      "Le score du harnais doit etre lu avec prudence : les rosters et positions peuvent etre convertis en contexte spatial, mais les decisions visuelles ne pilotent pas encore toute la resolution mini-match.",
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
    ],
  });

  return withFullMatchGroundingDiagnosis(withHarnessSanityDiagnosis(report, input), input);
}
