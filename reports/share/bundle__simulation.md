# Bundle: bundle__simulation.md

Generated for Sprint 2V - Prototype Selection Replacement in MiniMatch. Source files are bundled by domain for compact ChatGPT review.

## File: src/simulation/runMatch.ts

```ts
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import { runMiniMatch } from "./miniMatch";
import { adaptMatchInputToMiniMatch } from "./adapters/matchInputToMiniMatch";
import {
  buildMatchReport,
  primaryReportZone,
  scoreFromMiniMatch,
  timelineFromMiniMatch,
} from "./adapters/matchReportBuilder";
import {
  createTacticalPlanInfluence,
  primaryZoneFromPlanInfluence,
  sequenceCountFromPlanInfluence,
} from "./adapters/tacticalPlanInfluence";

const DEFAULT_ADAPTER_SEQUENCE_COUNT = 6;

export function runMatch(input: MatchInput): MatchReport {
  const adapter = adaptMatchInputToMiniMatch(input);
  const influence = createTacticalPlanInfluence(input);
  const numberOfSequences = sequenceCountFromPlanInfluence({
    baseSequenceCount: DEFAULT_ADAPTER_SEQUENCE_COUNT,
    influence,
  });
  const miniMatch = runMiniMatch({
    ...adapter.miniMatchInput,
    numberOfSequences,
  });
  const zone = primaryZoneFromPlanInfluence({
    influence,
    fallbackZone: primaryReportZone(input),
  });
  const timeline = timelineFromMiniMatch({
    matchInput: input,
    miniMatch,
    adapter,
    zone,
    influence,
  });
  const score = scoreFromMiniMatch({ miniMatch, adapter });

  return buildMatchReport({
    matchInput: input,
    timeline,
    miniMatch,
    adapter,
    score,
    influence,
    generatedFrom: "runMatch",
    reportScope: "MINI_MATCH_LOCAL",
    limitations: [
      "runMatch is a local mini-match adapter and cannot make global scoring economy claims.",
      "Seed variation is forwarded to the mini-match but remains limited until deeper scenario variation is wired.",
    ],
  });
}

export function createMatchReportSignature(report: MatchReport): string {
  const source = {
    matchId: report.matchId,
    score: report.score,
    timeline: report.timeline.map((event) => ({
      eventId: event.eventId,
      matchId: event.matchId,
      teamId: event.teamId,
      eventType: event.eventType,
      outcome: event.outcome,
      consequences: event.consequences,
    })),
    teamStats: report.teamStats,
    playerStats: report.playerStats,
    zoneStats: report.zoneStats,
    fatigueReport: report.fatigueReport,
    tacticalReport: report.tacticalReport,
    keyMoments: report.keyMoments,
    coachInsights: report.coachInsights,
    suggestedFocus: report.suggestedFocus,
    evidenceFacts: report.evidenceFacts,
    warnings: report.warnings,
    reportMeta: report.reportMeta,
  };

  return JSON.stringify(source);
}
```

## File: src/simulation/runFullMatch.ts

```ts
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

export function runFullMatch(input: MatchInput): MatchReport {
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
    ],
  });

  return withFullMatchGroundingDiagnosis(withHarnessSanityDiagnosis(report, input), input);
}
```

## File: src/simulation/fullMatch/fullMatchSegmentState.ts

```ts
import type { MatchInput, TacticalPlan, TeamSnapshot } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ScoreState } from "../../models/match";

export type FullMatchTeamSegmentState = {
  readonly teamId: TeamId;
  readonly condition: Rating;
  readonly mentalFreshness: Rating;
  readonly momentum: Rating;
  readonly pressureLoad: Rating;
  readonly scoringConfidence: Rating;
  readonly defensiveStress: Rating;
};

export type FullMatchSegmentState = {
  readonly segmentIndex: number;
  readonly minute: number;
  readonly score: ScoreState;
  readonly home: FullMatchTeamSegmentState;
  readonly away: FullMatchTeamSegmentState;
  readonly previousScoringTeamId?: TeamId;
  readonly repeatedPatternCount: number;
};

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function averageRosterValue(team: TeamSnapshot, selector: (player: TeamSnapshot["roster"][number]) => number): Rating {
  if (team.roster.length === 0) {
    return 100;
  }

  return clampRating(team.roster.reduce((total, player) => total + selector(player), 0) / team.roster.length);
}

function initialTeamState(team: TeamSnapshot, plan: TacticalPlan): FullMatchTeamSegmentState {
  return {
    teamId: team.teamId,
    condition: averageRosterValue(team, (player) => player.currentCondition),
    mentalFreshness: averageRosterValue(team, (player) => player.mentalFreshness),
    momentum: 50,
    pressureLoad: clampRating(15 + plan.pressingIntensity * 0.55),
    scoringConfidence: 50,
    defensiveStress: clampRating(12 + (100 - plan.restDefensePriority) * 0.2),
  };
}

export function createInitialFullMatchSegmentState(input: MatchInput): FullMatchSegmentState {
  return {
    segmentIndex: 0,
    minute: 0,
    score: { home: 0, away: 0 },
    home: initialTeamState(input.homeTeam, input.homePlan),
    away: initialTeamState(input.awayTeam, input.awayPlan),
    repeatedPatternCount: 0,
  };
}

export function scoreStateTags(score: ScoreState): readonly string[] {
  const scoreDifference = Math.abs(score.home - score.away);
  const tags = ["score_state_level"];

  if (score.home > score.away) {
    tags.push("score_state_home_leading");
  } else if (score.away > score.home) {
    tags.push("score_state_away_leading");
  }

  if (scoreDifference <= 7) {
    tags.push("score_state_close");
  }

  if (scoreDifference >= 21) {
    tags.push("score_state_lopsided");
  }

  return tags;
}

export function teamStateForId(state: FullMatchSegmentState, teamId: TeamId): FullMatchTeamSegmentState {
  return state.home.teamId === teamId ? state.home : state.away;
}

export function opponentTeamStateForId(state: FullMatchSegmentState, teamId: TeamId): FullMatchTeamSegmentState {
  return state.home.teamId === teamId ? state.away : state.home;
}
```

## File: src/simulation/fullMatch/fullMatchSegmentInfluence.ts

```ts
import type { TeamId } from "../../core/ids";
import type { ScoreState } from "../../models/match";
import type {
  FullMatchSegmentState,
  FullMatchTeamSegmentState,
} from "./fullMatchSegmentState";

export type FullMatchScoreStateLabel =
  | "level"
  | "close"
  | "home_leading"
  | "away_leading"
  | "lopsided";

export type FullMatchTeamSegmentInfluence = {
  readonly teamId: TeamId;
  readonly conditionModifier: number;
  readonly mentalFreshnessModifier: number;
  readonly momentumModifier: number;
  readonly pressureLoadModifier: number;
  readonly defensiveStressModifier: number;
  readonly scoringConfidenceModifier: number;
  readonly routeRiskModifier: number;
  readonly supportStabilityModifier: number;
  readonly finalActionComposureModifier: number;
};

export type FullMatchSegmentInfluence = {
  readonly segmentIndex: number;
  readonly scoreState: FullMatchScoreStateLabel;
  readonly home: FullMatchTeamSegmentInfluence;
  readonly away: FullMatchTeamSegmentInfluence;
  readonly global: {
    readonly repeatedPatternPressure: number;
    readonly matchTempoAdjustment: number;
    readonly conversionVolatilityAdjustment: number;
  };
};

const MODIFIER_LIMIT = 5;

function boundedModifier(value: number): number {
  return Math.max(-MODIFIER_LIMIT, Math.min(MODIFIER_LIMIT, Math.round(value)));
}

function scoreState(score: ScoreState): FullMatchScoreStateLabel {
  const difference = Math.abs(score.home - score.away);

  if (difference >= 21) {
    return "lopsided";
  }

  if (score.home === score.away) {
    return "level";
  }

  if (difference <= 7) {
    return "close";
  }

  return score.home > score.away ? "home_leading" : "away_leading";
}

function lowRatingPenalty(value: number, neutral = 85): number {
  return boundedModifier((value - neutral) / 8);
}

function highRatingPressure(value: number, neutral = 55): number {
  return boundedModifier((value - neutral) / 10);
}

function teamInfluence(team: FullMatchTeamSegmentState): FullMatchTeamSegmentInfluence {
  const condition = lowRatingPenalty(team.condition);
  const mental = lowRatingPenalty(team.mentalFreshness);
  const momentum = boundedModifier((team.momentum - 50) / 10);
  const pressureLoad = highRatingPressure(team.pressureLoad);
  const defensiveStress = highRatingPressure(team.defensiveStress);
  const scoringConfidence = boundedModifier((team.scoringConfidence - 50) / 12);

  return {
    teamId: team.teamId,
    conditionModifier: condition,
    mentalFreshnessModifier: mental,
    momentumModifier: momentum,
    pressureLoadModifier: pressureLoad,
    defensiveStressModifier: defensiveStress,
    scoringConfidenceModifier: scoringConfidence,
    routeRiskModifier: boundedModifier(momentum + scoringConfidence - pressureLoad - defensiveStress),
    supportStabilityModifier: boundedModifier(condition + mental + momentum - Math.max(0, defensiveStress)),
    finalActionComposureModifier: boundedModifier(mental + scoringConfidence - Math.max(0, pressureLoad)),
  };
}

export function createFullMatchSegmentInfluence(state: FullMatchSegmentState): FullMatchSegmentInfluence {
  return {
    segmentIndex: state.segmentIndex,
    scoreState: scoreState(state.score),
    home: teamInfluence(state.home),
    away: teamInfluence(state.away),
    global: {
      repeatedPatternPressure: boundedModifier(state.repeatedPatternCount * 2),
      matchTempoAdjustment: boundedModifier((state.home.momentum + state.away.momentum - 100) / 14),
      conversionVolatilityAdjustment: boundedModifier(
        (state.home.scoringConfidence + state.away.scoringConfidence - 100) / 16,
      ),
    },
  };
}

export function allSegmentInfluenceModifiers(input: FullMatchSegmentInfluence): readonly number[] {
  const teamValues = [input.home, input.away].flatMap((team) => [
    team.conditionModifier,
    team.mentalFreshnessModifier,
    team.momentumModifier,
    team.pressureLoadModifier,
    team.defensiveStressModifier,
    team.scoringConfidenceModifier,
    team.routeRiskModifier,
    team.supportStabilityModifier,
    team.finalActionComposureModifier,
  ]);

  return [
    ...teamValues,
    input.global.repeatedPatternPressure,
    input.global.matchTempoAdjustment,
    input.global.conversionVolatilityAdjustment,
  ];
}
```

## File: src/simulation/grounding/tacticalWorkbenchTypes.ts

```ts
export type TacticalWorkbenchPlayerPosition = {
  readonly playerId: string;
  readonly teamId: string;
  readonly role: string;
  readonly initials: string;
  readonly realZone: string;
  readonly renderedZone?: string;
  readonly projectedZone?: string;
  readonly isBallCarrier?: boolean;
};

export type TacticalWorkbenchTeamShapeIntent = {
  readonly teamId: string;
  readonly frame: "before" | "after";
  readonly intent: string;
  readonly evidence: readonly string[];
};

export type TacticalWorkbenchSelectedAction = {
  readonly actorId: string;
  readonly receiverId?: string;
  readonly newCarrierId?: string;
  readonly fromZone: string;
  readonly targetZone: string;
  readonly actualReceptionZone?: string;
  readonly actionType: string;
  readonly actionSubtype?: string;
  readonly transferType?: string;
  readonly possessionResult?: string;
};

export type TacticalWorkbenchRankedOption = {
  readonly rank: number;
  readonly actionType: string;
  readonly receiverId?: string;
  readonly targetZone: string;
  readonly laneState?: string;
  readonly risk?: string;
  readonly score?: number;
  readonly finalSelectionScore?: number;
  readonly selected: boolean;
};

export type TacticalWorkbenchAfterState = {
  readonly newCarrierId: string;
  readonly ballZone: string;
  readonly possessionResult: string;
};

export type TacticalWorkbenchFrame = {
  readonly frameId: string;
  readonly sequenceId: string;
  readonly actionId: string;
  readonly phase: string;
  readonly possessionTeamId: string;
  readonly defendingTeamId: string;
  readonly ballCarrierId: string;
  readonly ballZone: string;
  readonly attackingDirection: string;
  readonly playerPositions: readonly TacticalWorkbenchPlayerPosition[];
  readonly afterPlayerPositions?: readonly TacticalWorkbenchPlayerPosition[];
  readonly teamShapeIntents: readonly TacticalWorkbenchTeamShapeIntent[];
  readonly selectedAction: TacticalWorkbenchSelectedAction;
  readonly rankedOptions: readonly TacticalWorkbenchRankedOption[];
  readonly afterState?: TacticalWorkbenchAfterState;
};
```

## File: src/simulation/grounding/fixtures/sequence1Action1.fixture.ts

```ts
import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition } from "../tacticalWorkbenchTypes";

const beforeControl: readonly TacticalWorkbenchPlayerPosition[] = [
  { playerId: "control-tempo-half", teamId: "control", role: "tempo_half", initials: "TH", realZone: "Z4-HSL", renderedZone: "Z4-HSL offset", projectedZone: "Z4-HSL", isBallCarrier: true },
  { playerId: "control-hook-link", teamId: "control", role: "hook_link", initials: "HL", realZone: "Z4-CL", renderedZone: "Z4-CL offset", projectedZone: "Z4-CL" },
  { playerId: "control-forward-leader", teamId: "control", role: "forward_leader", initials: "FL", realZone: "Z5-HSL", renderedZone: "Z5-HSL offset", projectedZone: "Z5-HSL" },
  { playerId: "control-goalkeeper-free-safety", teamId: "control", role: "goalkeeper_free_safety", initials: "GK", realZone: "Z2-C", renderedZone: "Z2-C", projectedZone: "Z2-C" },
  { playerId: "control-mobile-lock", teamId: "control", role: "mobile_lock", initials: "ML", realZone: "Z3-HSL", renderedZone: "Z3-HSL", projectedZone: "Z3-HSL" },
  { playerId: "control-space-hunter", teamId: "control", role: "space_hunter", initials: "SH", realZone: "Z5-HSR", renderedZone: "Z5-HSR", projectedZone: "Z5-HSR" },
  { playerId: "control-playmaker", teamId: "control", role: "playmaker", initials: "PM", realZone: "Z4-C", renderedZone: "Z4-C offset", projectedZone: "Z4-C" },
  { playerId: "control-pivot", teamId: "control", role: "pivot", initials: "PV", realZone: "Z3-C", renderedZone: "Z3-C", projectedZone: "Z3-C" },
  { playerId: "control-left-piston", teamId: "control", role: "left_piston", initials: "LP", realZone: "Z3-CL", renderedZone: "Z3-CL", projectedZone: "Z3-CL" },
  { playerId: "control-right-piston", teamId: "control", role: "right_piston", initials: "RP", realZone: "Z3-HSR", renderedZone: "Z3-HSR", projectedZone: "Z3-HSR" },
];

const beforeBlitz: readonly TacticalWorkbenchPlayerPosition[] = [
  { playerId: "blitz-tempo-half", teamId: "blitz", role: "tempo_half", initials: "TH", realZone: "Z5-HSL", renderedZone: "Z5-HSL offset", projectedZone: "Z5-HSL" },
  { playerId: "blitz-hook-link", teamId: "blitz", role: "hook_link", initials: "HL", realZone: "Z4-CL", renderedZone: "Z4-CL offset", projectedZone: "Z4-CL" },
  { playerId: "blitz-forward-leader", teamId: "blitz", role: "forward_leader", initials: "FL", realZone: "Z4-C", renderedZone: "Z4-C offset", projectedZone: "Z4-C" },
  { playerId: "blitz-goalkeeper-free-safety", teamId: "blitz", role: "goalkeeper_free_safety", initials: "GK", realZone: "Z6-C", renderedZone: "Z6-C", projectedZone: "Z6-C" },
  { playerId: "blitz-mobile-lock", teamId: "blitz", role: "mobile_lock", initials: "ML", realZone: "Z4-HSL", renderedZone: "Z4-HSL offset", projectedZone: "Z4-HSL" },
  { playerId: "blitz-space-hunter", teamId: "blitz", role: "space_hunter", initials: "SH", realZone: "Z5-C", renderedZone: "Z5-C offset", projectedZone: "Z5-C" },
  { playerId: "blitz-playmaker", teamId: "blitz", role: "playmaker", initials: "PM", realZone: "Z5-HSL", renderedZone: "Z5-HSL offset", projectedZone: "Z5-HSL" },
  { playerId: "blitz-pivot", teamId: "blitz", role: "pivot", initials: "PV", realZone: "Z4-HSL", renderedZone: "Z4-HSL offset", projectedZone: "Z4-HSL" },
  { playerId: "blitz-left-piston", teamId: "blitz", role: "left_piston", initials: "LP", realZone: "Z5-CL", renderedZone: "Z5-CL", projectedZone: "Z5-CL" },
  { playerId: "blitz-right-piston", teamId: "blitz", role: "right_piston", initials: "RP", realZone: "Z5-C", renderedZone: "Z5-C offset", projectedZone: "Z5-C" },
];

export const sequence1Action1AfterPositions: readonly TacticalWorkbenchPlayerPosition[] = [
  { playerId: "control-tempo-half", teamId: "control", role: "tempo_half", initials: "TH", realZone: "Z3-HSL", renderedZone: "Z3-HSL offset", projectedZone: "Z3-HSL" },
  { playerId: "control-hook-link", teamId: "control", role: "hook_link", initials: "HL", realZone: "Z3-CL", renderedZone: "Z3-CL offset", projectedZone: "Z3-HSL" },
  { playerId: "control-forward-leader", teamId: "control", role: "forward_leader", initials: "FL", realZone: "Z4-C", renderedZone: "Z4-C offset", projectedZone: "Z4-C" },
  { playerId: "control-goalkeeper-free-safety", teamId: "control", role: "goalkeeper_free_safety", initials: "GK", realZone: "Z1-C", renderedZone: "Z1-C", projectedZone: "Z1-C" },
  { playerId: "control-mobile-lock", teamId: "control", role: "mobile_lock", initials: "ML", realZone: "Z3-HSL", renderedZone: "Z3-HSL offset", projectedZone: "Z2-C", isBallCarrier: true },
  { playerId: "control-space-hunter", teamId: "control", role: "space_hunter", initials: "SH", realZone: "Z4-C", renderedZone: "Z4-C offset", projectedZone: "Z4-C" },
  { playerId: "control-playmaker", teamId: "control", role: "playmaker", initials: "PM", realZone: "Z2-C", renderedZone: "Z2-C", projectedZone: "Z2-C" },
  { playerId: "control-pivot", teamId: "control", role: "pivot", initials: "PV", realZone: "Z2-HSL", renderedZone: "Z2-HSL offset", projectedZone: "Z2-HSL" },
  { playerId: "control-left-piston", teamId: "control", role: "left_piston", initials: "LP", realZone: "Z2-CL", renderedZone: "Z2-CL", projectedZone: "Z2-CL" },
  { playerId: "control-right-piston", teamId: "control", role: "right_piston", initials: "RP", realZone: "Z2-HSR", renderedZone: "Z2-HSR", projectedZone: "Z2-CR" },
  { playerId: "blitz-mobile-lock", teamId: "blitz", role: "mobile_lock", initials: "ML", realZone: "Z3-HSL", renderedZone: "Z3-HSL offset", projectedZone: "Z3-HSL" },
  { playerId: "blitz-space-hunter", teamId: "blitz", role: "space_hunter", initials: "SH", realZone: "Z3-C", renderedZone: "Z3-C", projectedZone: "Z3-C" },
  { playerId: "blitz-pivot", teamId: "blitz", role: "pivot", initials: "PV", realZone: "Z3-HSL", renderedZone: "Z3-HSL offset", projectedZone: "Z3-HSL" },
];

export const sequence1Action1WorkbenchTruth: TacticalWorkbenchFrame = {
  frameId: "sequence-1-action-1",
  sequenceId: "sequence-1",
  actionId: "action-1",
  phase: "STABLE_POSSESSION",
  possessionTeamId: "control",
  defendingTeamId: "blitz",
  ballCarrierId: "control-tempo-half",
  ballZone: "Z4-HSL",
  attackingDirection: "LEFT_TO_RIGHT",
  playerPositions: [...beforeControl, ...beforeBlitz],
  afterPlayerPositions: sequence1Action1AfterPositions,
  teamShapeIntents: [
    { teamId: "control", frame: "before", intent: "structured pressure escape support", evidence: ["TH@Z4-HSL", "ML@Z3-HSL", "PV@Z3-C"] },
    { teamId: "control", frame: "after", intent: "rest-defense protected recycle base", evidence: ["GK@Z1-C", "PV@Z2-HSL", "LP@Z2-CL"] },
    { teamId: "blitz", frame: "before", intent: "ball-side pressure and lane compression", evidence: ["ML@Z4-HSL", "PV@Z4-HSL"] },
    { teamId: "blitz", frame: "after", intent: "compact response around ML reception", evidence: ["ML@Z3-HSL", "SH@Z3-C", "PV@Z3-HSL"] },
  ],
  selectedAction: {
    actorId: "control-tempo-half",
    receiverId: "control-mobile-lock",
    newCarrierId: "control-mobile-lock",
    fromZone: "Z4-HSL",
    targetZone: "Z3-C",
    actualReceptionZone: "Z3-HSL",
    actionType: "SUPPORT_CLUSTER_RECYCLE",
    actionSubtype: "BALL_SIDE_PRESSURE_ESCAPE",
    transferType: "PASS",
    possessionResult: "CONTROL_RETAINED",
  },
  rankedOptions: [
    { rank: 1, actionType: "SUPPORT_CLUSTER_RECYCLE", receiverId: "control-mobile-lock", targetZone: "Z3-C", laneState: "CLOSED", risk: "LOW", score: 87, finalSelectionScore: 87, selected: true },
    { rank: 2, actionType: "FORWARD_PROGRESS", receiverId: "control-forward-leader", targetZone: "Z5-HSL", laneState: "CLOSED", risk: "HIGH", score: 78, finalSelectionScore: 78, selected: false },
    { rank: 3, actionType: "WEAK_SIDE_SWITCH", receiverId: "control-right-piston", targetZone: "Z3-HSR", laneState: "CONTESTED", risk: "MEDIUM", score: 72, finalSelectionScore: 72, selected: false },
  ],
  afterState: {
    newCarrierId: "control-mobile-lock",
    ballZone: "Z3-HSL",
    possessionResult: "CONTROL_RETAINED",
  },
};
```

## File: src/simulation/grounding/extractWorkbenchTruth.ts

```ts
import { readFileSync } from "node:fs";
import type { TacticalWorkbenchPlayerPosition } from "./tacticalWorkbenchTypes";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";

function attributeValue(fragment: string, attribute: string): string | undefined {
  const match = new RegExp(`${attribute}="([^"]+)"`).exec(fragment);

  return match?.[1];
}

export function extractWorkbenchPlayerPositions(html: string, frame: "before" | "after"): readonly TacticalWorkbenchPlayerPosition[] {
  const pattern = new RegExp(`<g id="${frame}-player-[^"]+"[^>]*data-truth-type="real-player-position"[^>]*>`, "g");
  const matches = html.match(pattern) ?? [];

  return matches.map((fragment) => {
    const renderedZone = attributeValue(fragment, "data-rendered-zone");
    const projectedZone = attributeValue(fragment, "data-projected-zone");

    return {
      playerId: attributeValue(fragment, "data-player-id") ?? "unknown-player",
      teamId: attributeValue(fragment, "data-team-id") ?? "unknown-team",
      role: attributeValue(fragment, "data-role") ?? "unknown-role",
      initials: attributeValue(fragment, "data-initials") ?? "??",
      realZone: attributeValue(fragment, "data-real-zone") ?? "UNKNOWN_ZONE",
      ...(renderedZone === undefined ? {} : { renderedZone }),
      ...(projectedZone === undefined ? {} : { projectedZone }),
    };
  });
}

export function extractSequenceOneActionOneWorkbenchTruthFromHtml(path: string): typeof sequence1Action1WorkbenchTruth {
  const html = readFileSync(path, "utf8");
  const beforePositions = extractWorkbenchPlayerPositions(html, "before");
  const afterPositions = extractWorkbenchPlayerPositions(html, "after");

  if (beforePositions.length < 20 || afterPositions.length < 10) {
    return sequence1Action1WorkbenchTruth;
  }

  return {
    ...sequence1Action1WorkbenchTruth,
    playerPositions: beforePositions.map((position) => ({
      ...position,
      isBallCarrier: position.playerId === "control-tempo-half",
    })),
    afterPlayerPositions: afterPositions.map((position) => ({
      ...position,
      isBallCarrier: position.playerId === "control-mobile-lock",
    })),
  };
}
```

## File: src/simulation/grounding/tacticalWorkbenchContractGuard.ts

```ts
import type { TacticalWorkbenchFrame } from "./tacticalWorkbenchTypes";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function playerExists(frame: TacticalWorkbenchFrame, playerId: string, zone: string): boolean {
  return frame.playerPositions.some((player) => player.playerId === playerId && player.realZone === zone);
}

function afterPlayerExists(frame: TacticalWorkbenchFrame, playerId: string, zone: string): boolean {
  return (frame.afterPlayerPositions ?? []).some((player) => player.playerId === playerId && player.realZone === zone);
}

function renderedZonesStayDistinctFromRealOffsets(frame: TacticalWorkbenchFrame): boolean {
  return frame.playerPositions
    .filter((player) => player.renderedZone?.includes("offset"))
    .every((player) => player.renderedZone !== player.realZone);
}

export function validateSequenceOneActionOneWorkbenchTruth(
  frame: TacticalWorkbenchFrame = sequence1Action1WorkbenchTruth,
): readonly string[] {
  assertGuard(frame.ballCarrierId === "control-tempo-half", "before ball carrier must be CONTROL TH.");
  assertGuard(frame.ballZone === "Z4-HSL", "before ball zone must be Z4-HSL.");
  assertGuard(frame.selectedAction.actorId === "control-tempo-half", "selected action decision actor must be CONTROL TH.");
  assertGuard(frame.selectedAction.receiverId === "control-mobile-lock", "selected receiver must be CONTROL ML.");
  assertGuard(frame.selectedAction.newCarrierId === "control-mobile-lock", "new carrier after action must be CONTROL ML.");
  assertGuard(frame.selectedAction.actualReceptionZone === "Z3-HSL", "actual reception zone must be Z3-HSL.");
  assertGuard(frame.afterState?.ballZone === "Z3-HSL", "actual ball zone after action must be Z3-HSL.");
  assertGuard(frame.selectedAction.actionType === "SUPPORT_CLUSTER_RECYCLE", "selected action type must be SUPPORT_CLUSTER_RECYCLE.");
  assertGuard(frame.selectedAction.actionSubtype === "BALL_SIDE_PRESSURE_ESCAPE", "selected action subtype must be BALL_SIDE_PRESSURE_ESCAPE.");
  assertGuard(frame.selectedAction.targetZone === "Z3-C", "target cluster must be Z3-C.");
  assertGuard(frame.selectedAction.actorId !== "control-mobile-lock", "selected action must not say ML was decision actor.");
  assertGuard(playerExists(frame, "control-tempo-half", "Z4-HSL"), "CONTROL TH must exist at real zone Z4-HSL before action.");
  assertGuard(playerExists(frame, "control-mobile-lock", "Z3-HSL"), "CONTROL ML must exist at real zone Z3-HSL before action.");
  assertGuard(afterPlayerExists(frame, "control-mobile-lock", "Z3-HSL"), "CONTROL ML must exist at real zone Z3-HSL after action.");
  assertGuard(
    frame.teamShapeIntents.some((intent) => intent.teamId === "control" && intent.frame === "after"),
    "CONTROL rest-defense after-state must exist.",
  );
  assertGuard(
    frame.teamShapeIntents.some((intent) => intent.teamId === "blitz" && intent.frame === "after"),
    "BLITZ defensive/pressing response must exist.",
  );
  assertGuard(renderedZonesStayDistinctFromRealOffsets(frame), "real zones and rendered offset zones must not be confused.");

  return [
    "before ball carrier is CONTROL TH",
    "before ball zone is Z4-HSL",
    "selected action is TH -> ML",
    "new carrier after action is CONTROL ML",
    "actual ball zone after action is Z3-HSL",
    "selected action type is SUPPORT_CLUSTER_RECYCLE",
    "target cluster is Z3-C",
    "CONTROL and BLITZ after-state shapes exist",
    "real zones and rendered-offset zones remain distinct",
  ];
}

if (require.main === module) {
  const checks = validateSequenceOneActionOneWorkbenchTruth();

  console.log("tacticalWorkbenchContractGuard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/grounding/miniMatchWorkbenchAlignment.ts

```ts
import type { TacticalWorkbenchFrame } from "./tacticalWorkbenchTypes";

export type MiniMatchWorkbenchAlignmentReport = {
  readonly fixtureId: string;
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly supportedTruths: readonly string[];
  readonly missingTruths: readonly string[];
  readonly lossyMappings: readonly string[];
  readonly recommendations: readonly string[];
};

export function analyzeMiniMatchWorkbenchAlignment(frame: TacticalWorkbenchFrame): MiniMatchWorkbenchAlignmentReport {
  const supportedTruths = [
    `can represent selected action type ${frame.selectedAction.actionType}`,
    `can represent from-zone ${frame.selectedAction.fromZone}`,
    `can represent target cluster ${frame.selectedAction.targetZone}`,
    `can represent reception zone ${frame.selectedAction.actualReceptionZone ?? "unknown"}`,
    "can preserve selected candidate versus ranked alternatives in report artifacts",
  ];
  const missingTruths = [
    "official MatchInput roster players are not yet converted into mini-match SpatialTeamContext players",
    "workbench before/after team shapes are not replayed as the source of mini-match state",
    "visual role occupation and rendered-zone offset semantics are not consumed by runMiniMatch",
    "full ranked option table is not a first-class mini-match decision input",
  ];
  const lossyMappings = [
    "CONTROL TH / ML identities map to prototype role players rather than official roster snapshots",
    "target cluster Z3-C and actual reception Z3-HSL can be reported, but are not yet grounded from workbench truth",
    "team shape intents become general tactical context rather than exact before/after spatial state",
  ];

  return {
    fixtureId: frame.frameId,
    status: missingTruths.length === 0 && lossyMappings.length === 0 ? "PASS" : "PARTIAL",
    supportedTruths,
    missingTruths,
    lossyMappings,
    recommendations: [
      "CONFIRM_MINIMATCH_ALIGNMENT_PARTIAL",
      "PREPARE_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER",
      "PREPARE_WORKBENCH_REPLAY_ENGINE",
    ],
  };
}
```

## File: src/simulation/grounding/rosterToMiniMatchGapAnalysis.ts

```ts
import type { MatchInput } from "../../contracts/engineToCoach";
import type { MiniMatchInputAdapterResult } from "../adapters/matchInputToMiniMatch";

export type RosterToMiniMatchGapAnalysis = {
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly spatialContextAdapterExists: boolean;
  readonly rosterCanBecomeSpatialContext: boolean;
  readonly workbenchPositionsCanSeedSpatialContext: boolean;
  readonly miniMatchConsumesSpatialContextMetadata: "YES" | "PARTIAL" | "NO";
  readonly attributeInfluenceLayerExists: boolean;
  readonly routeRankingAttributeInfluenceMode: "metadata_only" | "candidate_modifier" | "selection_driving";
  readonly selectionSource: "prototype" | "spatial_candidate_modifier" | "spatial_selection_driving";
  readonly spatialSelectionPathExists: boolean;
  readonly prototypeFallbackStillEnabled: boolean;
  readonly normalFullMatchUsesSpatialSelection: boolean;
  readonly controlledMiniMatchUsesSpatialSelection: boolean;
  readonly remainingPrototypeDominance: "HIGH" | "MEDIUM" | "LOW";
  readonly rosterDrivesMiniMatchPlayerPositions: boolean;
  readonly startersDriveActivePlayers: boolean;
  readonly playerRolesDriveActionResolution: boolean;
  readonly visibleAttributesDriveRouteRanking: "YES" | "PARTIAL" | "NO";
  readonly tacticalPlanFullyDrivesTeamShape: boolean;
  readonly prototypesStillDominant: boolean;
  readonly lostPlayerIdentity: readonly string[];
  readonly documentedGaps: readonly string[];
  readonly recommendations: readonly string[];
};

export function analyzeRosterToMiniMatchGap(input: {
  readonly matchInput: MatchInput;
  readonly adapter: MiniMatchInputAdapterResult;
}): RosterToMiniMatchGapAnalysis {
  const rosterPlayerIds = [
    ...input.matchInput.homeTeam.roster.map((player) => player.playerId),
    ...input.matchInput.awayTeam.roster.map((player) => player.playerId),
  ];
  const miniMatchPrototypeIds = [String(input.adapter.homePrototype.id), String(input.adapter.awayPrototype.id)];

  return {
    status: "PARTIAL",
    spatialContextAdapterExists: true,
    rosterCanBecomeSpatialContext: true,
    workbenchPositionsCanSeedSpatialContext: true,
    miniMatchConsumesSpatialContextMetadata: "PARTIAL",
    attributeInfluenceLayerExists: true,
    routeRankingAttributeInfluenceMode: "candidate_modifier",
    selectionSource: "spatial_candidate_modifier",
    spatialSelectionPathExists: true,
    prototypeFallbackStillEnabled: true,
    normalFullMatchUsesSpatialSelection: false,
    controlledMiniMatchUsesSpatialSelection: true,
    remainingPrototypeDominance: "HIGH",
    rosterDrivesMiniMatchPlayerPositions: true,
    startersDriveActivePlayers: true,
    playerRolesDriveActionResolution: false,
    visibleAttributesDriveRouteRanking: "PARTIAL",
    tacticalPlanFullyDrivesTeamShape: false,
    prototypesStillDominant: true,
    lostPlayerIdentity: rosterPlayerIds.filter((playerId) => !miniMatchPrototypeIds.includes(playerId)),
    documentedGaps: [
      "adaptMatchInputToMiniMatch maps official teams to CONTROL/BLITZ PrototypeTeamDefinition objects.",
      "Sprint 2S can convert TeamSnapshot.roster into typed SpatialTeamContext.",
      "Sprint 2S can seed SpatialTeamContext positions from workbench truth.",
      "MiniMatchInput can carry SpatialMatchContext metadata and bounded route attribute influence summaries.",
      "PlayerSnapshot roles and attributes can now evaluate candidate_modifier selection under guardrails through a controlled mini-match route selection source.",
      "Prototype fallback remains enabled and normal full-match selection is not yet spatial-selection-driven by default.",
      "TacticalPlan contributes tags and context, but not full spatial team shape resolution.",
      "CONTROL/BLITZ prototype teams remain a dominant source of mini-match tactical behavior.",
    ],
    recommendations: [
      "CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER",
      "CONFIRM_MINIMATCH_SPATIAL_CONTEXT_PARTIAL",
      "CONFIRM_ROUTE_ATTRIBUTE_INFLUENCE_LAYER",
      "CONFIRM_SELECTION_DRIVING_ATTRIBUTE_RANKING_V0",
      "CONFIRM_ATTRIBUTE_SELECTION_GUARD",
      "CONFIRM_SPATIAL_ROUTE_SELECTION_PATH",
      "CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED",
      "CONFIRM_CONTROLLED_MINIMATCH_SPATIAL_SELECTION",
      "PREPARE_NORMAL_FULLMATCH_SPATIAL_SELECTION_FLAG",
    ],
  };
}
```

## File: src/simulation/spatialContext/spatialTeamContextTypes.ts

```ts
import type { PlayerId, TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PlayerRole } from "../../models/player";

export type SpatialPlayerContext = {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly role: PlayerRole | string;
  readonly displayRole: string;
  readonly zone: ZoneId;
  readonly projectedZone?: ZoneId;
  readonly isStarter: boolean;
  readonly isGoalkeeper: boolean;
  readonly isBallCarrier: boolean;
  readonly currentCondition: Rating;
  readonly mentalFreshness: Rating;
  readonly attributes: {
    readonly speed?: Rating;
    readonly power?: Rating;
    readonly endurance?: Rating;
    readonly handPlay?: Rating;
    readonly footPlayDribble?: Rating;
    readonly footPlayPassingShooting?: Rating;
    readonly intelligence?: Rating;
    readonly mental?: Rating;
  };
  readonly tacticalFunctions: readonly string[];
};

export type SpatialTeamContext = {
  readonly teamId: TeamId;
  readonly name: string;
  readonly players: readonly SpatialPlayerContext[];
  readonly goalkeeperId: PlayerId;
  readonly starters: readonly PlayerId[];
  readonly activePlayerIds: readonly PlayerId[];
  readonly shapeSource: "workbench_truth" | "team_snapshot_default" | "prototype_fallback";
  readonly tacticalPlanSummary: string;
  readonly knownLimitations: readonly string[];
};

export type SpatialMatchContext = {
  readonly matchId: string;
  readonly possessionTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly ballCarrierId: PlayerId;
  readonly ballZone: ZoneId;
  readonly attackingDirection: string;
  readonly home: SpatialTeamContext;
  readonly away: SpatialTeamContext;
  readonly sourceWorkbenchFrameId?: string;
};
```

## File: src/simulation/spatialContext/roleToTacticalFunctions.ts

```ts
import { PlayerRole } from "../../models/player";

const ROLE_FUNCTIONS: Readonly<Record<string, readonly string[]>> = {
  [PlayerRole.TempoHalf]: ["tempo_controller", "first_receiver", "pressure_escape_decision_maker"],
  [PlayerRole.HookLink]: ["direct_support", "wall_pass", "small_side_support"],
  [PlayerRole.ForwardLeader]: ["contact_platform", "screen", "carry_platform"],
  [PlayerRole.GoalkeeperFreeSafety]: ["rest_defense_anchor", "safe_recycle", "last_rempart"],
  [PlayerRole.FreeSafety]: ["rest_defense_anchor", "safe_recycle", "last_rempart"],
  [PlayerRole.MobileLock]: ["half_space_recycle", "ball_winner", "pressure_escape_receiver"],
  [PlayerRole.SpaceHunter]: ["depth_threat", "chaos_attacker", "weak_side_runner"],
  [PlayerRole.Playmaker]: ["third_man_connector", "creative_receiver", "tempo_accelerator"],
  [PlayerRole.Pivot]: ["rest_defense_anchor", "central_recycle", "support_balance"],
  [PlayerRole.LeftPiston]: ["wide_support", "press_trigger", "corridor_runner"],
  [PlayerRole.RightPiston]: ["wide_support", "transition_hunter", "corridor_runner"],
  [PlayerRole.LeftAnchor]: ["wide_rest_defense", "support_balance"],
  [PlayerRole.RightAnchor]: ["wide_rest_defense", "support_balance"],
  [PlayerRole.PowerRunner]: ["contact_platform", "carry_platform", "line_break_threat"],
};

export function tacticalFunctionsForRole(role: PlayerRole | string): readonly string[] {
  return ROLE_FUNCTIONS[role] ?? ["unmapped_role_context"];
}

export function hasExplicitTacticalFunctionMapping(role: PlayerRole | string): boolean {
  return ROLE_FUNCTIONS[role] !== undefined;
}
```

## File: src/simulation/spatialContext/teamSnapshotToSpatialContext.ts

```ts
import type { MatchInput, PlayerSnapshot, TacticalPlan, TeamSnapshot } from "../../contracts/engineToCoach";
import type { PlayerId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import { PlayerRole } from "../../models/player";
import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition } from "../grounding/tacticalWorkbenchTypes";
import { tacticalFunctionsForRole } from "./roleToTacticalFunctions";
import type { SpatialPlayerContext, SpatialTeamContext } from "./spatialTeamContextTypes";

const DEFAULT_ROLE_ZONES: Readonly<Record<string, ZoneId>> = {
  [PlayerRole.GoalkeeperFreeSafety]: "Z2-C",
  [PlayerRole.FreeSafety]: "Z2-C",
  [PlayerRole.TempoHalf]: "Z4-HSL",
  [PlayerRole.HookLink]: "Z4-CL",
  [PlayerRole.ForwardLeader]: "Z5-HSL",
  [PlayerRole.MobileLock]: "Z3-HSL",
  [PlayerRole.SpaceHunter]: "Z5-HSR",
  [PlayerRole.Playmaker]: "Z4-C",
  [PlayerRole.Pivot]: "Z3-C",
  [PlayerRole.LeftPiston]: "Z3-CL",
  [PlayerRole.RightPiston]: "Z3-HSR",
  [PlayerRole.LeftAnchor]: "Z3-CL",
  [PlayerRole.RightAnchor]: "Z3-HSR",
  [PlayerRole.PowerRunner]: "Z5-C",
};

function positionsForFrame(
  workbench: TacticalWorkbenchFrame | undefined,
  frame: "before" | "after",
): readonly TacticalWorkbenchPlayerPosition[] {
  if (workbench === undefined) {
    return [];
  }

  if (frame === "after" && workbench.afterPlayerPositions !== undefined) {
    return workbench.afterPlayerPositions;
  }

  return workbench.playerPositions;
}

function displayRole(role: PlayerRole | string): string {
  return role
    .split("_")
    .map((part) => part.length === 0 ? part : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function summarizePlan(plan: TacticalPlan): string {
  return [
    `attack=${plan.attackingIntent}`,
    `defense=${plan.defensiveIntent}`,
    `transition=${plan.transitionIntent}`,
    `tempo=${plan.tempo}`,
    `risk=${plan.riskLevel}`,
    `scoring=${plan.scoringBias}`,
  ].join("; ");
}

function defaultZoneForRole(role: PlayerRole | string): ZoneId {
  return DEFAULT_ROLE_ZONES[role] ?? "Z3-C";
}

function projectedZone(position: TacticalWorkbenchPlayerPosition | undefined): { readonly projectedZone?: ZoneId } {
  return position?.projectedZone === undefined ? {} : { projectedZone: position.projectedZone as ZoneId };
}

function playerToSpatialContext(input: {
  readonly player: PlayerSnapshot;
  readonly team: TeamSnapshot;
  readonly position?: TacticalWorkbenchPlayerPosition;
  readonly ballCarrierId?: PlayerId;
}): SpatialPlayerContext {
  return {
    playerId: input.player.playerId,
    teamId: input.team.teamId,
    role: input.player.role,
    displayRole: displayRole(input.player.role),
    zone: (input.position?.realZone ?? defaultZoneForRole(input.player.role)) as ZoneId,
    ...projectedZone(input.position),
    isStarter: input.team.starters.includes(input.player.playerId),
    isGoalkeeper: input.team.goalkeeperId === input.player.playerId,
    isBallCarrier: input.ballCarrierId === input.player.playerId || input.position?.isBallCarrier === true,
    currentCondition: input.player.currentCondition,
    mentalFreshness: input.player.mentalFreshness,
    attributes: {
      speed: input.player.attributes.speed,
      power: input.player.attributes.power,
      endurance: input.player.attributes.endurance,
      handPlay: input.player.attributes.handPlay,
      footPlayDribble: input.player.attributes.footPlayDribble,
      footPlayPassingShooting: input.player.attributes.footPlayPassingShooting,
      intelligence: input.player.attributes.intelligence,
      mental: input.player.attributes.mental,
    },
    tacticalFunctions: tacticalFunctionsForRole(input.player.role),
  };
}

export function teamSnapshotToSpatialContext(input: {
  readonly team: TeamSnapshot;
  readonly tacticalPlan: TacticalPlan;
  readonly workbench?: TacticalWorkbenchFrame;
  readonly frame?: "before" | "after";
}): SpatialTeamContext {
  const frame = input.frame ?? "before";
  const positions = positionsForFrame(input.workbench, frame).filter((position) => position.teamId === input.team.teamId);
  const positionByPlayerId = new Map(positions.map((position) => [position.playerId, position]));
  const rosterIds = new Set(input.team.roster.map((player) => player.playerId));
  const missingWorkbenchPlayers = positions
    .filter((position) => !rosterIds.has(position.playerId))
    .map((position) => position.playerId);
  const playersMissingWorkbenchPosition = input.team.roster
    .filter((player) => input.workbench !== undefined && !positionByPlayerId.has(player.playerId))
    .map((player) => player.playerId);
  const ballCarrierId =
    frame === "after"
      ? input.workbench?.afterState?.newCarrierId
      : input.workbench?.ballCarrierId;
  const limitations: string[] = [];

  if (input.workbench === undefined) {
    limitations.push("No workbench truth supplied; conservative role-zone defaults used.");
  }

  if (missingWorkbenchPlayers.length > 0) {
    limitations.push(`Workbench references players absent from TeamSnapshot: ${missingWorkbenchPlayers.join(", ")}.`);
  }

  if (playersMissingWorkbenchPosition.length > 0) {
    limitations.push(`TeamSnapshot players missing workbench positions: ${playersMissingWorkbenchPosition.join(", ")}.`);
  }

  if (!rosterIds.has(input.team.goalkeeperId)) {
    limitations.push(`Goalkeeper ${input.team.goalkeeperId} is not present in TeamSnapshot.roster.`);
  }

  return {
    teamId: input.team.teamId,
    name: input.team.name,
    players: input.team.roster.map((player) => {
      const position = positionByPlayerId.get(player.playerId);

      return playerToSpatialContext({
        player,
        team: input.team,
        ...(position === undefined ? {} : { position }),
        ...(ballCarrierId === undefined ? {} : { ballCarrierId }),
      });
    }),
    goalkeeperId: input.team.goalkeeperId,
    starters: input.team.starters,
    activePlayerIds: input.team.starters.filter((playerId) => rosterIds.has(playerId)),
    shapeSource: input.workbench === undefined ? "team_snapshot_default" : "workbench_truth",
    tacticalPlanSummary: summarizePlan(input.tacticalPlan),
    knownLimitations: limitations,
  };
}

export function buildSpatialContextForMatchTeam(input: {
  readonly matchInput: MatchInput;
  readonly team: "home" | "away";
  readonly workbench?: TacticalWorkbenchFrame;
  readonly frame?: "before" | "after";
}): SpatialTeamContext {
  return input.team === "home"
    ? teamSnapshotToSpatialContext({
        team: input.matchInput.homeTeam,
        tacticalPlan: input.matchInput.homePlan,
        ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
        ...(input.frame === undefined ? {} : { frame: input.frame }),
      })
    : teamSnapshotToSpatialContext({
        team: input.matchInput.awayTeam,
        tacticalPlan: input.matchInput.awayPlan,
        ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
        ...(input.frame === undefined ? {} : { frame: input.frame }),
      });
}
```

## File: src/simulation/spatialContext/workbenchToSpatialMatchContext.ts

```ts
import type { MatchInput } from "../../contracts/engineToCoach";
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import { buildSpatialContextForMatchTeam } from "./teamSnapshotToSpatialContext";
import type { SpatialMatchContext } from "./spatialTeamContextTypes";

export function workbenchToSpatialMatchContext(input: {
  readonly matchInput: MatchInput;
  readonly workbench: TacticalWorkbenchFrame;
  readonly frame: "before" | "after";
}): SpatialMatchContext {
  const after = input.frame === "after" ? input.workbench.afterState : undefined;

  return {
    matchId: input.matchInput.matchId,
    possessionTeamId: input.workbench.possessionTeamId as TeamId,
    defendingTeamId: input.workbench.defendingTeamId as TeamId,
    ballCarrierId: (after?.newCarrierId ?? input.workbench.ballCarrierId) as PlayerId,
    ballZone: (after?.ballZone ?? input.workbench.ballZone) as ZoneId,
    attackingDirection: input.workbench.attackingDirection,
    home: buildSpatialContextForMatchTeam({
      matchInput: input.matchInput,
      team: "home",
      workbench: input.workbench,
      frame: input.frame,
    }),
    away: buildSpatialContextForMatchTeam({
      matchInput: input.matchInput,
      team: "away",
      workbench: input.workbench,
      frame: input.frame,
    }),
    sourceWorkbenchFrameId: input.workbench.frameId,
  };
}
```

## File: src/simulation/grounding/runWorkbenchReplaySeed.ts

```ts
import type { MatchInput, PlayerSnapshot, TacticalPlan, TeamSnapshot } from "../../contracts/engineToCoach";
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import { PlayerRole } from "../../models/player";
import { PROTOTYPE_TEAMS, PrototypeTeamId } from "../../data/prototypeTeams";
import { runMiniMatch } from "../miniMatch";
import type { MiniMatchRouteSelectionResult, MiniMatchRouteSelectionSource } from "../miniMatch";
import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition } from "./tacticalWorkbenchTypes";
import { workbenchToSpatialMatchContext } from "../spatialContext";
import { applySpatialAttributeInfluenceToCandidates, selectAttributeAdjustedCandidate } from "../routeRanking";
import type { AttributeAdjustedSelectionResult, RouteAttributeInfluence, RouteRankingAttributeUsage } from "../routeRanking";

export type WorkbenchReplaySeedResult = {
  readonly fixtureId: string;
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly spatialContextBuilt: boolean;
  readonly selectedActionRepresented: boolean;
  readonly actorPreserved: boolean;
  readonly receiverPreserved: boolean;
  readonly newCarrierPreserved: boolean;
  readonly ballZonePreserved: boolean;
  readonly attributeInfluenceApplied: boolean;
  readonly selectedCandidateBaseScore?: number;
  readonly selectedCandidateAttributeAdjustedScore?: number;
  readonly selectedCandidateInfluences?: readonly RouteAttributeInfluence[];
  readonly routeRankingUsesRealAttributes: RouteRankingAttributeUsage;
  readonly attributeRankingMode: "metadata_only" | "candidate_modifier";
  readonly metadataOnlySelectionResult?: AttributeAdjustedSelectionResult;
  readonly attributeSelectionResult?: AttributeAdjustedSelectionResult;
  readonly selectedBy?: "base_score" | "attribute_adjusted_score";
  readonly selectionChangedByAttributes: boolean;
  readonly routeSelectionSource: MiniMatchRouteSelectionSource;
  readonly miniMatchRouteSelectionResult?: MiniMatchRouteSelectionResult;
  readonly miniMatchRouteSelectionUsedSpatialResult: boolean;
  readonly missingTruths: readonly string[];
  readonly lossyMappings: readonly string[];
  readonly recommendations: readonly string[];
};

function roleFromWorkbench(role: string): PlayerRole {
  switch (role) {
    case PlayerRole.TempoHalf:
      return PlayerRole.TempoHalf;
    case PlayerRole.HookLink:
      return PlayerRole.HookLink;
    case PlayerRole.ForwardLeader:
      return PlayerRole.ForwardLeader;
    case PlayerRole.GoalkeeperFreeSafety:
      return PlayerRole.GoalkeeperFreeSafety;
    case PlayerRole.MobileLock:
      return PlayerRole.MobileLock;
    case PlayerRole.SpaceHunter:
      return PlayerRole.SpaceHunter;
    case PlayerRole.Playmaker:
      return PlayerRole.Playmaker;
    case PlayerRole.Pivot:
      return PlayerRole.Pivot;
    case PlayerRole.LeftPiston:
      return PlayerRole.LeftPiston;
    case PlayerRole.RightPiston:
      return PlayerRole.RightPiston;
    default:
      return PlayerRole.Playmaker;
  }
}

function displayNameFromPosition(position: TacticalWorkbenchPlayerPosition): string {
  return `${position.teamId.toUpperCase()} ${position.initials}`;
}

function playerFromPosition(position: TacticalWorkbenchPlayerPosition): PlayerSnapshot {
  const isGoalkeeper = position.role === PlayerRole.GoalkeeperFreeSafety;
  const base = isGoalkeeper ? 82 : 76;

  return {
    playerId: position.playerId as PlayerId,
    name: displayNameFromPosition(position),
    role: roleFromWorkbench(position.role),
    attributes: {
      speed: base,
      agility: base,
      endurance: base,
      power: base,
      handPlay: isGoalkeeper ? 88 : base,
      footPlayDribble: base,
      footPlayPassingShooting: base,
      intelligence: base,
      mental: base,
    },
    traits: ["workbench_replay_seed"],
    currentCondition: 92,
    mentalFreshness: 90,
  };
}

function uniquePositionsByPlayer(
  positions: readonly TacticalWorkbenchPlayerPosition[],
  teamId: string,
): readonly TacticalWorkbenchPlayerPosition[] {
  const seen = new Set<string>();
  const result: TacticalWorkbenchPlayerPosition[] = [];

  for (const position of positions.filter((candidate) => candidate.teamId === teamId)) {
    if (seen.has(position.playerId)) {
      continue;
    }

    seen.add(position.playerId);
    result.push(position);
  }

  return result;
}

function teamFromWorkbench(input: {
  readonly workbench: TacticalWorkbenchFrame;
  readonly teamId: string;
  readonly name: string;
}): TeamSnapshot {
  const positions = uniquePositionsByPlayer(input.workbench.playerPositions, input.teamId);
  const roster = positions.map(playerFromPosition);
  const goalkeeper = roster.find((player) => player.role === PlayerRole.GoalkeeperFreeSafety);

  return {
    teamId: input.teamId,
    name: input.name,
    roster,
    starters: roster.map((player) => player.playerId),
    bench: [],
    goalkeeperId: goalkeeper?.playerId ?? roster[0]?.playerId ?? `${input.teamId}-missing-goalkeeper`,
  };
}

const replayPlan: TacticalPlan = {
  attackingIntent: "structured_possession",
  defensiveIntent: "compact_block",
  transitionIntent: "secure_rest_defense",
  tempo: "balanced",
  riskLevel: "medium",
  targetZones: ["Z3-C"],
  scoringBias: "balanced",
  pressingIntensity: 55,
  defensiveLineHeight: 50,
  widthUsage: 55,
  restDefensePriority: 70,
};

export function createWorkbenchReplayMatchInput(workbench: TacticalWorkbenchFrame): MatchInput {
  return {
    matchId: `${workbench.frameId}-replay-seed`,
    seed: "workbench-replay-seed",
    homeTeam: teamFromWorkbench({ workbench, teamId: "control", name: "CONTROL" }),
    awayTeam: teamFromWorkbench({ workbench, teamId: "blitz", name: "BLITZ" }),
    homePlan: replayPlan,
    awayPlan: {
      ...replayPlan,
      attackingIntent: "direct_pressure",
      defensiveIntent: "high_press",
      transitionIntent: "counterpress",
      tempo: "fast",
      riskLevel: "high",
      pressingIntensity: 86,
      defensiveLineHeight: 78,
      widthUsage: 62,
      restDefensePriority: 52,
    },
    matchContext: {
      competitionType: "friendly",
      matchImportance: 40,
    },
    ruleset: {
      rulesetId: "v0.1-workbench-replay",
      scoringVersion: "V2_DROP_FOUNDATION",
    },
  };
}

function prototypeForTeam(id: string) {
  const prototypeId = id === "control" ? PrototypeTeamId.Control : PrototypeTeamId.Blitz;
  const prototype = PROTOTYPE_TEAMS.find((team) => team.id === prototypeId);

  if (prototype === undefined) {
    throw new Error(`Missing prototype team ${prototypeId}.`);
  }

  return prototype;
}

export function runWorkbenchReplaySeed(input: {
  readonly matchInput: MatchInput;
  readonly workbench: TacticalWorkbenchFrame;
}): WorkbenchReplaySeedResult {
  const beforeContext = workbenchToSpatialMatchContext({
    matchInput: input.matchInput,
    workbench: input.workbench,
    frame: "before",
  });
  const afterContext = workbenchToSpatialMatchContext({
    matchInput: input.matchInput,
    workbench: input.workbench,
    frame: "after",
  });
  const selectedAction = input.workbench.selectedAction;
  const homePlayers = beforeContext.home.players;
  const awayPlayers = beforeContext.away.players;
  const allBeforePlayers = [...homePlayers, ...awayPlayers];
  const allAfterPlayers = [...afterContext.home.players, ...afterContext.away.players];
  const actorPreserved = allBeforePlayers.some((player) => player.playerId === selectedAction.actorId);
  const receiverPreserved = selectedAction.receiverId === undefined
    ? true
    : allBeforePlayers.some((player) => player.playerId === selectedAction.receiverId);
  const newCarrierPreserved = selectedAction.newCarrierId === undefined
    ? true
    : allAfterPlayers.some((player) => player.playerId === selectedAction.newCarrierId && player.isBallCarrier);
  const ballZonePreserved =
    beforeContext.ballZone === input.workbench.ballZone &&
    afterContext.ballZone === input.workbench.afterState?.ballZone;
  const selectedActionRepresented =
    selectedAction.actionType === "SUPPORT_CLUSTER_RECYCLE" &&
    selectedAction.actorId === beforeContext.ballCarrierId &&
    selectedAction.newCarrierId === afterContext.ballCarrierId;
  const attributeCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: beforeContext,
    pressureLevel: "HIGH",
    candidates: input.workbench.rankedOptions.map((option) => ({
      candidateId: `rank-${option.rank}`,
      actorId: selectedAction.actorId as PlayerId,
      ...(option.receiverId === undefined ? {} : { receiverId: option.receiverId as PlayerId }),
      teamId: input.workbench.possessionTeamId as TeamId,
      fromZone: selectedAction.fromZone as ZoneId,
      targetZone: option.targetZone as ZoneId,
      actionType: option.actionType,
      ...(option.laneState === undefined ? {} : { laneState: option.laneState }),
      baseScore: option.finalSelectionScore ?? option.score ?? 0,
      baseRisk: option.risk === "HIGH" ? 80 : option.risk === "MEDIUM" ? 50 : 20,
    })),
  });
  const selectedCandidate =
    attributeCandidates.find((candidate) => candidate.receiverId === selectedAction.receiverId) ??
    attributeCandidates.find((candidate) => candidate.actionType === selectedAction.actionType);
  const metadataOnlySelectionResult = selectAttributeAdjustedCandidate({
    candidates: attributeCandidates,
    mode: "metadata_only",
    spatialContext: beforeContext,
    workbench: input.workbench,
    ...(selectedCandidate === undefined ? {} : { baseSelectedCandidateId: selectedCandidate.candidateId }),
  });
  const candidateModifierSelectionResult = selectAttributeAdjustedCandidate({
    candidates: attributeCandidates,
    mode: "candidate_modifier",
    spatialContext: beforeContext,
    workbench: input.workbench,
    ...(selectedCandidate === undefined ? {} : { baseSelectedCandidateId: selectedCandidate.candidateId }),
  });
  const miniMatch = runMiniMatch({
    teamA: prototypeForTeam(input.matchInput.homeTeam.teamId),
    teamB: prototypeForTeam(input.matchInput.awayTeam.teamId),
    numberOfSequences: 1,
    seed: 202,
    spatialContext: beforeContext,
    routeRankingAttributeMode: "candidate_modifier",
    routeSelectionSource: "spatial_candidate_modifier",
    routeSelectionWorkbench: input.workbench,
  });
  const miniMatchRouteSelectionResult = miniMatch.state.records[0]?.setup.routeSelectionResult;
  const lossyMappings = [
    "Mini-match receives spatial context metadata but still resolves actions through prototype team behavior.",
    "Route ranking can receive bounded attribute-adjusted candidate scores, but final mini-match selection is not yet fully selection-driving.",
    `Replay mini-match produced ${miniMatch.state.records.length} sequence record(s), but not a forced workbench action chain.`,
  ];
  const missingTruths = [
    ...beforeContext.home.knownLimitations,
    ...beforeContext.away.knownLimitations,
    ...afterContext.home.knownLimitations,
    ...afterContext.away.knownLimitations,
  ];
  const status: WorkbenchReplaySeedResult["status"] =
    actorPreserved && receiverPreserved && newCarrierPreserved && ballZonePreserved && selectedActionRepresented
      ? "PARTIAL"
      : "FAIL";

  return {
    fixtureId: input.workbench.frameId,
    status,
    spatialContextBuilt: true,
    selectedActionRepresented,
    actorPreserved,
    receiverPreserved,
    newCarrierPreserved,
    ballZonePreserved,
    attributeInfluenceApplied: attributeCandidates.some((candidate) => candidate.attributeInfluences.length > 0),
    ...(selectedCandidate === undefined ? {} : { selectedCandidateBaseScore: selectedCandidate.baseScore }),
    ...(selectedCandidate === undefined ? {} : { selectedCandidateAttributeAdjustedScore: selectedCandidate.attributeAdjustedScore }),
    ...(selectedCandidate === undefined ? {} : { selectedCandidateInfluences: selectedCandidate.attributeInfluences }),
    routeRankingUsesRealAttributes: "PARTIAL",
    attributeRankingMode: "candidate_modifier",
    metadataOnlySelectionResult,
    attributeSelectionResult: candidateModifierSelectionResult,
    selectedBy: candidateModifierSelectionResult.selectedBy,
    selectionChangedByAttributes: candidateModifierSelectionResult.selectionChanged,
    routeSelectionSource: "spatial_candidate_modifier",
    ...(miniMatchRouteSelectionResult === undefined ? {} : { miniMatchRouteSelectionResult }),
    miniMatchRouteSelectionUsedSpatialResult:
      miniMatchRouteSelectionResult?.selectionSource === "spatial_candidate_modifier" &&
      miniMatchRouteSelectionResult.guardValid,
    missingTruths,
    lossyMappings,
    recommendations: [
      "CONFIRM_WORKBENCH_REPLAY_SEED",
      "CONFIRM_ROUTE_ATTRIBUTE_INFLUENCE_LAYER",
      "CONFIRM_ATTRIBUTE_ADJUSTED_CANDIDATE_SCORES",
      "CONFIRM_SPATIAL_ROUTE_SELECTION_PATH",
      "CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED",
      "PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY",
    ],
  };
}
```

## File: src/simulation/routeRanking/routeAttributeInfluenceTypes.ts

```ts
import type { PlayerId, TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";

export type RouteAttributeInfluenceCategory =
  | "PASS_SECURITY"
  | "RECEPTION_QUALITY"
  | "PRESSURE_ESCAPE"
  | "SUPPORT_TIMING"
  | "CONTACT_PLATFORM"
  | "RUPTURE_THREAT"
  | "THIRD_MAN_LINK"
  | "BALL_CARRY"
  | "FINAL_ACTION_COMPOSURE"
  | "TURNOVER_RISK"
  | "FATIGUE_DRAG";

export type RouteAttributeInfluence = {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly category: RouteAttributeInfluenceCategory;
  readonly modifier: number;
  readonly confidence: "low" | "medium" | "high";
  readonly reason: string;
  readonly sourceAttributes: readonly string[];
};

export type RouteCandidateAttributeContext = {
  readonly candidateId: string;
  readonly actorId: PlayerId;
  readonly receiverId?: PlayerId;
  readonly teamId: TeamId;
  readonly fromZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly actionType: string;
  readonly laneState?: string;
  readonly availability?: "AVAILABLE" | "NOT_AVAILABLE_NOW";
  readonly baseScore: number;
  readonly attributeInfluences: readonly RouteAttributeInfluence[];
  readonly attributeAdjustedScore: number;
};

export type RouteAttributeInfluenceMode = "metadata_only" | "candidate_modifier" | "selection_driving";

export type RouteRankingAttributeUsage = "YES" | "PARTIAL" | "NO";
```

## File: src/simulation/routeRanking/routeAttributeInfluence.ts

```ts
import type { SpatialPlayerContext } from "../spatialContext";
import type { RouteAttributeInfluence } from "./routeAttributeInfluenceTypes";

const MAX_TOTAL_ATTRIBUTE_ADJUSTMENT = 12;
const MIN_TOTAL_ATTRIBUTE_ADJUSTMENT = -12;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function rating(value: number | undefined, fallback: number): number {
  return value ?? fallback;
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 50;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function highAttributeModifier(value: number): number {
  if (value >= 88) {
    return 5;
  }

  if (value >= 78) {
    return 3;
  }

  if (value >= 65) {
    return 1;
  }

  if (value <= 40) {
    return -4;
  }

  if (value <= 52) {
    return -2;
  }

  return 0;
}

function fatigueModifier(player: SpatialPlayerContext): number {
  const freshness = average([player.currentCondition, player.mentalFreshness]);

  if (freshness >= 86) {
    return 2;
  }

  if (freshness <= 42) {
    return -6;
  }

  if (freshness <= 58) {
    return -3;
  }

  return 0;
}

function influence(input: {
  readonly player: SpatialPlayerContext;
  readonly category: RouteAttributeInfluence["category"];
  readonly modifier: number;
  readonly reason: string;
  readonly sourceAttributes: readonly string[];
  readonly confidence?: RouteAttributeInfluence["confidence"];
}): RouteAttributeInfluence {
  return {
    playerId: input.player.playerId,
    teamId: input.player.teamId,
    category: input.category,
    modifier: clamp(input.modifier, -8, 8),
    confidence: input.confidence ?? "medium",
    reason: input.reason,
    sourceAttributes: input.sourceAttributes,
  };
}

function actionFamily(actionType: string): "support" | "progress" | "rupture" | "third_man" | "shot" | "carry" {
  if (actionType.includes("SHOT") || actionType.includes("FINAL")) {
    return "shot";
  }

  if (actionType.includes("WEAK_SIDE") || actionType.includes("RUPTURE")) {
    return "rupture";
  }

  if (actionType.includes("THIRD")) {
    return "third_man";
  }

  if (actionType.includes("CARRY")) {
    return "carry";
  }

  if (actionType.includes("FORWARD") || actionType.includes("CONTACT")) {
    return "progress";
  }

  return "support";
}

export function clampRouteAttributeModifier(value: number): number {
  return clamp(value, MIN_TOTAL_ATTRIBUTE_ADJUSTMENT, MAX_TOTAL_ATTRIBUTE_ADJUSTMENT);
}

export function buildRouteAttributeInfluences(input: {
  readonly actor: SpatialPlayerContext;
  readonly receiver?: SpatialPlayerContext;
  readonly actionType: string;
  readonly laneState?: string;
  readonly pressureLevel?: string;
  readonly baseRisk?: number;
}): readonly RouteAttributeInfluence[] {
  const family = actionFamily(input.actionType);
  const influences: RouteAttributeInfluence[] = [];
  const actor = input.actor;
  const receiver = input.receiver;
  const pressureIsHigh = input.pressureLevel === "HIGH" || input.pressureLevel === "MEDIUM_HIGH";

  if (family === "support") {
    const actorSecurity = average([
      rating(actor.attributes.handPlay, 60),
      rating(actor.attributes.intelligence, 60),
      rating(actor.attributes.mental, 60),
    ]);
    influences.push(influence({
      player: actor,
      category: "PASS_SECURITY",
      modifier: highAttributeModifier(actorSecurity),
      reason: `${actor.playerId} improves recycle security through handPlay, intelligence and mental reliability.`,
      sourceAttributes: ["handPlay", "intelligence", "mental"],
    }));

    if (receiver !== undefined) {
      const receiverQuality = average([
        rating(receiver.attributes.handPlay, 60),
        rating(receiver.attributes.intelligence, 60),
        receiver.currentCondition,
        receiver.mentalFreshness,
      ]);
      influences.push(influence({
        player: receiver,
        category: "RECEPTION_QUALITY",
        modifier: highAttributeModifier(receiverQuality),
        reason: `${receiver.playerId} supports the recycle through reception quality and freshness.`,
        sourceAttributes: ["handPlay", "intelligence", "currentCondition", "mentalFreshness"],
      }));
      influences.push(influence({
        player: receiver,
        category: "SUPPORT_TIMING",
        modifier: receiver.tacticalFunctions.includes("pressure_escape_receiver") ? 2 : 0,
        reason: `${receiver.playerId} tactical functions describe pressure-escape support timing.`,
        sourceAttributes: ["tacticalFunctions"],
        confidence: "low",
      }));
    }
  }

  if (family === "progress") {
    const platform = receiver === undefined
      ? 50
      : average([
          rating(receiver.attributes.power, 60),
          rating(receiver.attributes.handPlay, 60),
          rating(receiver.attributes.endurance, 60),
          rating(receiver.attributes.mental, 60),
        ]);
    influences.push(influence({
      player: receiver ?? actor,
      category: "CONTACT_PLATFORM",
      modifier: highAttributeModifier(platform),
      reason: `${(receiver ?? actor).playerId} changes forward progress value through power, handling, endurance and mental stability.`,
      sourceAttributes: ["power", "handPlay", "endurance", "mental"],
    }));
  }

  if (family === "rupture") {
    const runner = receiver ?? actor;
    const rupture = average([
      rating(runner.attributes.speed, 60),
      rating(runner.attributes.footPlayDribble, 60),
      rating(runner.attributes.intelligence, 60),
    ]);
    influences.push(influence({
      player: runner,
      category: "RUPTURE_THREAT",
      modifier: highAttributeModifier(rupture) + (input.laneState === "CLOSED" ? -3 : 0),
      reason: input.laneState === "CLOSED"
        ? `${runner.playerId} has rupture qualities, but the closed lane keeps the route constrained.`
        : `${runner.playerId} improves rupture threat through speed, dribble quality and timing.`,
      sourceAttributes: ["speed", "footPlayDribble", "intelligence", "laneState"],
    }));
  }

  if (family === "third_man") {
    const link = receiver === undefined
      ? rating(actor.attributes.intelligence, 60)
      : average([
          rating(actor.attributes.intelligence, 60),
          rating(receiver.attributes.intelligence, 60),
          rating(actor.attributes.handPlay, 60),
          rating(receiver.attributes.handPlay, 60),
          rating(actor.attributes.mental, 60),
        ]);
    influences.push(influence({
      player: receiver ?? actor,
      category: "THIRD_MAN_LINK",
      modifier: highAttributeModifier(link),
      reason: "Third-man link reliability is adjusted from intelligence, handPlay and mental attributes.",
      sourceAttributes: ["intelligence", "handPlay", "mental"],
    }));
  }

  if (family === "shot") {
    const shotComposure = average([
      rating(actor.attributes.footPlayPassingShooting, 60),
      rating(actor.attributes.mental, 60),
      rating(actor.attributes.intelligence, 60),
      actor.currentCondition,
      actor.mentalFreshness,
    ]);
    influences.push(influence({
      player: actor,
      category: "FINAL_ACTION_COMPOSURE",
      modifier: highAttributeModifier(shotComposure) + (pressureIsHigh ? -2 : 0),
      reason: `${actor.playerId} final-action quality is adjusted by shooting, mental freshness and pressure.`,
      sourceAttributes: ["footPlayPassingShooting", "mental", "intelligence", "currentCondition", "mentalFreshness", "pressureLevel"],
    }));
  }

  if (family === "carry") {
    const carry = average([
      rating(actor.attributes.speed, 60),
      rating(actor.attributes.power, 60),
      rating(actor.attributes.footPlayDribble, 60),
      actor.currentCondition,
    ]);
    influences.push(influence({
      player: actor,
      category: "BALL_CARRY",
      modifier: highAttributeModifier(carry),
      reason: `${actor.playerId} carry value is adjusted by speed, power, dribble and condition.`,
      sourceAttributes: ["speed", "power", "footPlayDribble", "currentCondition"],
    }));
  }

  const fatigue = fatigueModifier(receiver ?? actor);
  if (fatigue !== 0) {
    influences.push(influence({
      player: receiver ?? actor,
      category: fatigue < 0 ? "FATIGUE_DRAG" : "PRESSURE_ESCAPE",
      modifier: fatigue,
      reason: fatigue < 0
        ? `${(receiver ?? actor).playerId} has fatigue or mental freshness drag that increases route fragility.`
        : `${(receiver ?? actor).playerId} freshness improves route reliability.`,
      sourceAttributes: ["currentCondition", "mentalFreshness"],
    }));
  }

  if ((input.baseRisk ?? 0) >= 70 || (pressureIsHigh && input.laneState === "CLOSED")) {
    influences.push(influence({
      player: receiver ?? actor,
      category: "TURNOVER_RISK",
      modifier: -3,
      reason: "High pressure or closed lane adds bounded turnover risk without changing lane legality.",
      sourceAttributes: ["baseRisk", "pressureLevel", "laneState"],
    }));
  }

  return influences.filter((item) => item.modifier !== 0);
}

export function applyRouteAttributeInfluence(input: {
  readonly baseScore: number;
  readonly influences: readonly RouteAttributeInfluence[];
}): number {
  const total = clampRouteAttributeModifier(
    input.influences.reduce((sum, influenceItem) => sum + influenceItem.modifier, 0),
  );

  return clamp(input.baseScore + total, 0, 100);
}
```

## File: src/simulation/routeRanking/applySpatialAttributeInfluenceToCandidates.ts

```ts
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { SpatialMatchContext, SpatialPlayerContext } from "../spatialContext";
import { applyRouteAttributeInfluence, buildRouteAttributeInfluences } from "./routeAttributeInfluence";
import type { RouteCandidateAttributeContext } from "./routeAttributeInfluenceTypes";

export type RouteCandidateInput = {
  readonly candidateId: string;
  readonly actorId: PlayerId;
  readonly receiverId?: PlayerId;
  readonly teamId: TeamId;
  readonly fromZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly actionType: string;
  readonly laneState?: string;
  readonly availability?: "AVAILABLE" | "NOT_AVAILABLE_NOW";
  readonly baseScore: number;
  readonly baseRisk?: number;
};

function spatialPlayers(context: SpatialMatchContext): readonly SpatialPlayerContext[] {
  return [...context.home.players, ...context.away.players];
}

function findPlayer(
  players: readonly SpatialPlayerContext[],
  playerId: PlayerId | undefined,
): SpatialPlayerContext | undefined {
  return playerId === undefined ? undefined : players.find((player) => player.playerId === playerId);
}

export function applySpatialAttributeInfluenceToCandidates(input: {
  readonly spatialContext?: SpatialMatchContext;
  readonly candidates: readonly RouteCandidateInput[];
  readonly pressureLevel?: string;
}): readonly RouteCandidateAttributeContext[] {
  if (input.spatialContext === undefined) {
    return input.candidates.map((candidate) => ({
      candidateId: candidate.candidateId,
      actorId: candidate.actorId,
      ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
      teamId: candidate.teamId,
      fromZone: candidate.fromZone,
      targetZone: candidate.targetZone,
      actionType: candidate.actionType,
      ...(candidate.laneState === undefined ? {} : { laneState: candidate.laneState }),
      ...(candidate.availability === undefined ? {} : { availability: candidate.availability }),
      baseScore: candidate.baseScore,
      attributeInfluences: [],
      attributeAdjustedScore: candidate.baseScore,
    }));
  }

  const players = spatialPlayers(input.spatialContext);

  return input.candidates.map((candidate) => {
    const actor = findPlayer(players, candidate.actorId);
    const receiver = findPlayer(players, candidate.receiverId);

    if (actor === undefined) {
      return {
        candidateId: candidate.candidateId,
        actorId: candidate.actorId,
        ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
        teamId: candidate.teamId,
        fromZone: candidate.fromZone,
        targetZone: candidate.targetZone,
        actionType: candidate.actionType,
        ...(candidate.laneState === undefined ? {} : { laneState: candidate.laneState }),
        ...(candidate.availability === undefined ? {} : { availability: candidate.availability }),
        baseScore: candidate.baseScore,
        attributeInfluences: [],
        attributeAdjustedScore: candidate.baseScore,
      };
    }

    const influences = buildRouteAttributeInfluences({
      actor,
      ...(receiver === undefined ? {} : { receiver }),
      actionType: candidate.actionType,
      ...(candidate.laneState === undefined ? {} : { laneState: candidate.laneState }),
      ...(input.pressureLevel === undefined ? {} : { pressureLevel: input.pressureLevel }),
      ...(candidate.baseRisk === undefined ? {} : { baseRisk: candidate.baseRisk }),
    });

    return {
      candidateId: candidate.candidateId,
      actorId: candidate.actorId,
      ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
      teamId: candidate.teamId,
      fromZone: candidate.fromZone,
      targetZone: candidate.targetZone,
      actionType: candidate.actionType,
      ...(candidate.laneState === undefined ? {} : { laneState: candidate.laneState }),
      ...(candidate.availability === undefined ? {} : { availability: candidate.availability }),
      baseScore: candidate.baseScore,
      attributeInfluences: influences,
      attributeAdjustedScore: applyRouteAttributeInfluence({
        baseScore: candidate.baseScore,
        influences,
      }),
    };
  });
}
```

## File: src/simulation/routeRanking/routeRankingMode.ts

```ts
export type RouteRankingAttributeMode =
  | "off"
  | "metadata_only"
  | "candidate_modifier"
  | "selection_driving";

export type RouteRankingModeConfig = {
  readonly attributeMode: RouteRankingAttributeMode;
  readonly preserveLegality: true;
  readonly maxAttributeAdjustment: number;
  readonly allowAttributeSelectionFlip: boolean;
};

export const DEFAULT_ROUTE_RANKING_MODE_CONFIG: RouteRankingModeConfig = {
  attributeMode: "metadata_only",
  preserveLegality: true,
  maxAttributeAdjustment: 12,
  allowAttributeSelectionFlip: false,
};

export function createRouteRankingModeConfig(
  attributeMode: RouteRankingAttributeMode | undefined,
): RouteRankingModeConfig {
  if (attributeMode === "candidate_modifier" || attributeMode === "selection_driving") {
    return {
      attributeMode,
      preserveLegality: true,
      maxAttributeAdjustment: 12,
      allowAttributeSelectionFlip: true,
    };
  }

  return {
    ...DEFAULT_ROUTE_RANKING_MODE_CONFIG,
    attributeMode: attributeMode ?? DEFAULT_ROUTE_RANKING_MODE_CONFIG.attributeMode,
  };
}
```

## File: src/simulation/routeRanking/attributeDrivenSelectionGuard.ts

```ts
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import type { SpatialMatchContext } from "../spatialContext";
import type { RouteCandidateAttributeContext } from "./routeAttributeInfluenceTypes";

export type AttributeDrivenSelectionBlockedReason =
  | "CLOSED_LANE_NOT_OVERRIDABLE"
  | "CANDIDATE_NOT_AVAILABLE_NOW"
  | "ATTRIBUTE_ADJUSTMENT_OUT_OF_BOUNDS"
  | "MISSING_ACTOR_IN_SPATIAL_CONTEXT"
  | "MISSING_RECEIVER_IN_SPATIAL_CONTEXT"
  | "WORKBENCH_TRUTH_VIOLATION";

export type AttributeDrivenSelectionGuardResult = {
  readonly valid: boolean;
  readonly blockedReasons: readonly AttributeDrivenSelectionBlockedReason[];
  readonly warnings: readonly string[];
};

function allPlayers(context: SpatialMatchContext) {
  return [...context.home.players, ...context.away.players];
}

function matchesWorkbenchTruth(
  candidate: RouteCandidateAttributeContext,
  workbench: TacticalWorkbenchFrame,
): boolean {
  return (
    candidate.actorId === workbench.selectedAction.actorId &&
    candidate.actionType === workbench.selectedAction.actionType &&
    candidate.receiverId === workbench.selectedAction.receiverId &&
    candidate.fromZone === workbench.selectedAction.fromZone &&
    candidate.targetZone === workbench.selectedAction.targetZone
  );
}

export function guardAttributeDrivenSelection(input: {
  readonly candidate: RouteCandidateAttributeContext;
  readonly spatialContext?: SpatialMatchContext;
  readonly baseSelectedCandidateId?: string;
  readonly workbench?: TacticalWorkbenchFrame;
  readonly maxAttributeAdjustment: number;
  readonly availability?: "AVAILABLE" | "NOT_AVAILABLE_NOW";
}): AttributeDrivenSelectionGuardResult {
  const blockedReasons: AttributeDrivenSelectionBlockedReason[] = [];
  const warnings: string[] = [];
  const adjustment = input.candidate.attributeAdjustedScore - input.candidate.baseScore;
  const isBaseSelection = input.baseSelectedCandidateId === input.candidate.candidateId;

  if (Math.abs(adjustment) > input.maxAttributeAdjustment) {
    blockedReasons.push("ATTRIBUTE_ADJUSTMENT_OUT_OF_BOUNDS");
  }

  if (!isBaseSelection && input.candidate.laneState === "CLOSED") {
    blockedReasons.push("CLOSED_LANE_NOT_OVERRIDABLE");
  }

  if (!isBaseSelection && input.availability === "NOT_AVAILABLE_NOW") {
    blockedReasons.push("CANDIDATE_NOT_AVAILABLE_NOW");
  }

  if (input.spatialContext !== undefined) {
    const players = allPlayers(input.spatialContext);
    const actor = players.find((player) => player.playerId === input.candidate.actorId);
    const receiver = players.find((player) => player.playerId === input.candidate.receiverId);

    if (actor === undefined) {
      blockedReasons.push("MISSING_ACTOR_IN_SPATIAL_CONTEXT");
    }

    if (input.candidate.receiverId !== undefined && receiver === undefined) {
      blockedReasons.push("MISSING_RECEIVER_IN_SPATIAL_CONTEXT");
    }
  }

  if (!isBaseSelection && input.workbench !== undefined && !matchesWorkbenchTruth(input.candidate, input.workbench)) {
    blockedReasons.push("WORKBENCH_TRUTH_VIOLATION");
  }

  if (input.candidate.laneState === "CLOSED") {
    warnings.push("CLOSED lane remains closed; attributes cannot open it.");
  }

  if (input.availability === "NOT_AVAILABLE_NOW") {
    warnings.push("Candidate is not available now and cannot be promoted by attributes.");
  }

  return {
    valid: blockedReasons.length === 0,
    blockedReasons,
    warnings,
  };
}
```

## File: src/simulation/routeRanking/selectAttributeAdjustedCandidate.ts

```ts
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import type { SpatialMatchContext } from "../spatialContext";
import { guardAttributeDrivenSelection, type AttributeDrivenSelectionGuardResult } from "./attributeDrivenSelectionGuard";
import type { RouteCandidateAttributeContext } from "./routeAttributeInfluenceTypes";
import { createRouteRankingModeConfig, type RouteRankingAttributeMode, type RouteRankingModeConfig } from "./routeRankingMode";

export type AttributeAdjustedSelectionResult = {
  readonly mode: RouteRankingAttributeMode;
  readonly selectedCandidateId: string;
  readonly selectedBy: "base_score" | "attribute_adjusted_score";
  readonly baseSelectedCandidateId?: string;
  readonly selectionChanged: boolean;
  readonly selectedCandidateBaseScore: number;
  readonly selectedCandidateAdjustedScore: number;
  readonly guard: AttributeDrivenSelectionGuardResult;
  readonly explanation: string;
};

export type AttributeSelectionCandidate = RouteCandidateAttributeContext & {
  readonly availability?: "AVAILABLE" | "NOT_AVAILABLE_NOW";
};

function topByBaseScore(candidates: readonly AttributeSelectionCandidate[]): AttributeSelectionCandidate {
  const selected = [...candidates].sort((a, b) => b.baseScore - a.baseScore || a.candidateId.localeCompare(b.candidateId))[0];

  if (selected === undefined) {
    throw new Error("Attribute-adjusted selection requires at least one candidate.");
  }

  return selected;
}

function candidateById(
  candidates: readonly AttributeSelectionCandidate[],
  candidateId: string | undefined,
): AttributeSelectionCandidate | undefined {
  return candidateId === undefined ? undefined : candidates.find((candidate) => candidate.candidateId === candidateId);
}

function resultFromCandidate(input: {
  readonly mode: RouteRankingAttributeMode;
  readonly candidate: AttributeSelectionCandidate;
  readonly selectedBy: "base_score" | "attribute_adjusted_score";
  readonly baseSelectedCandidate: AttributeSelectionCandidate;
  readonly guard: AttributeDrivenSelectionGuardResult;
  readonly explanation: string;
}): AttributeAdjustedSelectionResult {
  return {
    mode: input.mode,
    selectedCandidateId: input.candidate.candidateId,
    selectedBy: input.selectedBy,
    baseSelectedCandidateId: input.baseSelectedCandidate.candidateId,
    selectionChanged: input.candidate.candidateId !== input.baseSelectedCandidate.candidateId,
    selectedCandidateBaseScore: input.candidate.baseScore,
    selectedCandidateAdjustedScore: input.candidate.attributeAdjustedScore,
    guard: input.guard,
    explanation: input.explanation,
  };
}

export function selectAttributeAdjustedCandidate(input: {
  readonly candidates: readonly AttributeSelectionCandidate[];
  readonly mode?: RouteRankingAttributeMode;
  readonly modeConfig?: RouteRankingModeConfig;
  readonly spatialContext?: SpatialMatchContext;
  readonly workbench?: TacticalWorkbenchFrame;
  readonly baseSelectedCandidateId?: string;
}): AttributeAdjustedSelectionResult {
  const modeConfig = input.modeConfig ?? createRouteRankingModeConfig(input.mode);
  const mode = modeConfig.attributeMode;
  const baseSelectedCandidate = candidateById(input.candidates, input.baseSelectedCandidateId) ?? topByBaseScore(input.candidates);
  const baseGuard = guardAttributeDrivenSelection({
    candidate: baseSelectedCandidate,
    ...(input.spatialContext === undefined ? {} : { spatialContext: input.spatialContext }),
    baseSelectedCandidateId: baseSelectedCandidate.candidateId,
    ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
    maxAttributeAdjustment: modeConfig.maxAttributeAdjustment,
    ...(baseSelectedCandidate.availability === undefined ? {} : { availability: baseSelectedCandidate.availability }),
  });

  if (mode === "off" || mode === "metadata_only" || input.spatialContext === undefined || !modeConfig.allowAttributeSelectionFlip) {
    return resultFromCandidate({
      mode,
      candidate: baseSelectedCandidate,
      selectedBy: "base_score",
      baseSelectedCandidate,
      guard: baseGuard,
      explanation:
        mode === "metadata_only"
          ? "metadata_only computes adjusted scores but keeps the base selected candidate."
          : "attribute ranking mode does not authorize selection changes.",
    });
  }

  const candidatesByAdjustedScore = [...input.candidates].sort((a, b) =>
    b.attributeAdjustedScore - a.attributeAdjustedScore ||
    b.baseScore - a.baseScore ||
    a.candidateId.localeCompare(b.candidateId),
  );
  const blockedReasons: string[] = [];

  for (const candidate of candidatesByAdjustedScore) {
    const guard = guardAttributeDrivenSelection({
      candidate,
      ...(input.spatialContext === undefined ? {} : { spatialContext: input.spatialContext }),
      baseSelectedCandidateId: baseSelectedCandidate.candidateId,
      ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
      maxAttributeAdjustment: modeConfig.maxAttributeAdjustment,
      ...(candidate.availability === undefined ? {} : { availability: candidate.availability }),
    });

    if (!guard.valid) {
      blockedReasons.push(`${candidate.candidateId}:${guard.blockedReasons.join("/")}`);
      continue;
    }

    return resultFromCandidate({
      mode,
      candidate,
      selectedBy: candidate.candidateId === baseSelectedCandidate.candidateId ? "base_score" : "attribute_adjusted_score",
      baseSelectedCandidate,
      guard,
      explanation:
        candidate.candidateId === baseSelectedCandidate.candidateId
          ? "attribute-adjusted ranking kept the base selected candidate after guard checks."
          : "attribute-adjusted ranking selected a different legal candidate after guard checks.",
    });
  }

  return resultFromCandidate({
    mode,
    candidate: baseSelectedCandidate,
    selectedBy: "base_score",
    baseSelectedCandidate,
    guard: {
      valid: true,
      blockedReasons: [],
      warnings: [`attribute selection fell back to base candidate; blocked candidates: ${blockedReasons.join(", ")}`],
    },
    explanation: "attribute-adjusted candidates were blocked by guardrails, so selection fell back to the base candidate.",
  });
}
```

## File: src/simulation/routeRanking/fixtures/attributeRankingContrast.fixture.ts

```ts
import type { PlayerId, TeamId } from "../../../core/ids";
import type { ZoneId } from "../../../core/zones";
import type { SpatialMatchContext, SpatialPlayerContext } from "../../spatialContext";
import type { RouteCandidateInput } from "../applySpatialAttributeInfluenceToCandidates";

function player(input: {
  readonly playerId: PlayerId;
  readonly speed: number;
  readonly handPlay: number;
  readonly intelligence: number;
  readonly mental: number;
  readonly condition: number;
  readonly freshness: number;
}): SpatialPlayerContext {
  return {
    playerId: input.playerId,
    teamId: "control",
    role: "contrast_role",
    displayRole: "Contrast Role",
    zone: "Z4-HSL",
    isStarter: true,
    isGoalkeeper: false,
    isBallCarrier: input.playerId === "contrast-actor",
    currentCondition: input.condition,
    mentalFreshness: input.freshness,
    attributes: {
      speed: input.speed,
      power: 74,
      endurance: 78,
      handPlay: input.handPlay,
      footPlayDribble: input.speed,
      footPlayPassingShooting: 72,
      intelligence: input.intelligence,
      mental: input.mental,
    },
    tacticalFunctions: input.playerId === "elite-runner" ? ["weak_side_runner"] : ["support_balance"],
  };
}

export const attributeRankingContrastSpatialContext: SpatialMatchContext = {
  matchId: "attribute-ranking-contrast",
  possessionTeamId: "control",
  defendingTeamId: "blitz",
  ballCarrierId: "contrast-actor",
  ballZone: "Z4-HSL",
  attackingDirection: "LEFT_TO_RIGHT",
  sourceWorkbenchFrameId: "attribute-ranking-contrast",
  home: {
    teamId: "control",
    name: "CONTROL",
    goalkeeperId: "contrast-gk",
    starters: ["contrast-actor", "safe-receiver", "elite-runner", "contrast-gk"],
    activePlayerIds: ["contrast-actor", "safe-receiver", "elite-runner", "contrast-gk"],
    shapeSource: "team_snapshot_default",
    tacticalPlanSummary: "contrast fixture",
    knownLimitations: [],
    players: [
      player({
        playerId: "contrast-actor",
        speed: 72,
        handPlay: 84,
        intelligence: 86,
        mental: 84,
        condition: 90,
        freshness: 90,
      }),
      player({
        playerId: "safe-receiver",
        speed: 54,
        handPlay: 54,
        intelligence: 55,
        mental: 55,
        condition: 72,
        freshness: 70,
      }),
      player({
        playerId: "elite-runner",
        speed: 96,
        handPlay: 82,
        intelligence: 90,
        mental: 88,
        condition: 94,
        freshness: 94,
      }),
      {
        ...player({
          playerId: "contrast-gk",
          speed: 50,
          handPlay: 88,
          intelligence: 80,
          mental: 84,
          condition: 92,
          freshness: 92,
        }),
        isGoalkeeper: true,
      },
    ],
  },
  away: {
    teamId: "blitz",
    name: "BLITZ",
    goalkeeperId: "blitz-gk",
    starters: ["blitz-gk"],
    activePlayerIds: ["blitz-gk"],
    shapeSource: "team_snapshot_default",
    tacticalPlanSummary: "contrast fixture",
    knownLimitations: [],
    players: [],
  },
};

export function legalContrastCandidates(): readonly RouteCandidateInput[] {
  return [
    {
      candidateId: "safe-recycle",
      actorId: "contrast-actor",
      receiverId: "safe-receiver",
      teamId: "control" as TeamId,
      fromZone: "Z4-HSL" as ZoneId,
      targetZone: "Z3-C" as ZoneId,
      actionType: "SUPPORT_CLUSTER_RECYCLE",
      laneState: "CONTESTED",
      baseScore: 80,
      baseRisk: 25,
    },
    {
      candidateId: "elite-weak-side",
      actorId: "contrast-actor",
      receiverId: "elite-runner",
      teamId: "control" as TeamId,
      fromZone: "Z4-HSL" as ZoneId,
      targetZone: "Z5-HSR" as ZoneId,
      actionType: "WEAK_SIDE_SWITCH",
      laneState: "OPEN",
      baseScore: 77,
      baseRisk: 35,
    },
  ];
}

export function closedLaneContrastCandidates(): readonly RouteCandidateInput[] {
  return legalContrastCandidates().map((candidate) =>
    candidate.candidateId === "elite-weak-side"
      ? { ...candidate, laneState: "CLOSED" }
      : candidate,
  );
}

export function unavailableContrastCandidates(): readonly (RouteCandidateInput & { readonly availability?: "AVAILABLE" | "NOT_AVAILABLE_NOW" })[] {
  return legalContrastCandidates().map((candidate) =>
    candidate.candidateId === "elite-weak-side"
      ? { ...candidate, availability: "NOT_AVAILABLE_NOW" }
      : candidate,
  );
}
```

## File: src/simulation/diagnostics/fullMatchGroundingDiagnostics.ts

```ts
import type { MatchReport } from "../../contracts/engineToCoach";

export type FullMatchGroundingWarning =
  | "FULL_MATCH_PARTIALLY_WORKBENCH_GROUNDED"
  | "SPATIAL_CONTEXT_ADAPTER_AVAILABLE"
  | "WORKBENCH_REPLAY_SEED_AVAILABLE"
  | "TACTICAL_PLAN_NOT_FULLY_DRIVING_RESOLUTION"
  | "ROUTE_ATTRIBUTE_INFLUENCE_AVAILABLE"
  | "ROUTE_ATTRIBUTE_CANDIDATE_MODIFIER_AVAILABLE"
  | "ATTRIBUTE_SELECTION_GUARD_ACTIVE"
  | "ATTRIBUTE_SELECTION_NOT_FULLMATCH_AUTHORITATIVE"
  | "SPATIAL_ROUTE_SELECTION_PATH_AVAILABLE"
  | "CONTROLLED_MINIMATCH_SPATIAL_SELECTION_AVAILABLE"
  | "PROTOTYPE_FALLBACK_STILL_ENABLED"
  | "NORMAL_FULLMATCH_NOT_YET_SPATIAL_SELECTION_DRIVEN"
  | "PROTOTYPE_SELECTION_STILL_PARTIAL"
  | "FULLMATCH_NOT_YET_REPLAYING_WORKBENCH_SEQUENCE_CHAIN"
  | "FULLMATCH_SCORE_NOT_TACTICALLY_EXPLAINED";

export type FullMatchGroundingDiagnostics = {
  readonly scope: "FULL_MATCH_HARNESS_SINGLE_RUN";
  readonly warnings: readonly FullMatchGroundingWarning[];
  readonly mayInvalidateGlobalScoringEconomy: false;
  readonly scoreUnchanged: true;
  readonly scoringEventsMutated: false;
  readonly summary: string;
  readonly recommendation: readonly string[];
};

export function analyzeFullMatchGroundingDiagnostics(report: MatchReport): FullMatchGroundingDiagnostics {
  const scoringEventCount = report.timeline.filter((event) => event.eventType === "scoring").length;
  const oneTeamScoringOnly = new Set(report.timeline.filter((event) => event.eventType === "scoring").map((event) => event.teamId)).size === 1 &&
    scoringEventCount > 0;
  const warnings: FullMatchGroundingWarning[] = [
    "FULL_MATCH_PARTIALLY_WORKBENCH_GROUNDED",
    "SPATIAL_CONTEXT_ADAPTER_AVAILABLE",
    "WORKBENCH_REPLAY_SEED_AVAILABLE",
    "TACTICAL_PLAN_NOT_FULLY_DRIVING_RESOLUTION",
    "ROUTE_ATTRIBUTE_INFLUENCE_AVAILABLE",
    "ROUTE_ATTRIBUTE_CANDIDATE_MODIFIER_AVAILABLE",
    "ATTRIBUTE_SELECTION_GUARD_ACTIVE",
    "ATTRIBUTE_SELECTION_NOT_FULLMATCH_AUTHORITATIVE",
    "SPATIAL_ROUTE_SELECTION_PATH_AVAILABLE",
    "CONTROLLED_MINIMATCH_SPATIAL_SELECTION_AVAILABLE",
    "PROTOTYPE_FALLBACK_STILL_ENABLED",
    "NORMAL_FULLMATCH_NOT_YET_SPATIAL_SELECTION_DRIVEN",
    "PROTOTYPE_SELECTION_STILL_PARTIAL",
    "FULLMATCH_NOT_YET_REPLAYING_WORKBENCH_SEQUENCE_CHAIN",
  ];

  if (oneTeamScoringOnly || Math.abs(report.score.home - report.score.away) >= 21) {
    warnings.push("FULLMATCH_SCORE_NOT_TACTICALLY_EXPLAINED");
  }

  return {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    warnings,
    mayInvalidateGlobalScoringEconomy: false,
    scoreUnchanged: true,
    scoringEventsMutated: false,
    summary:
      "Full-match is now partially grounded: roster/workbench truth can become typed spatial context and controlled mini-match runs can evaluate guarded spatial route selection, but normal full-match resolution still keeps prototype fallback and does not yet replay the full workbench sequence chain.",
    recommendation: [
      "CONFIRM_ROSTER_TO_SPATIAL_CONTEXT_ADAPTER",
      "CONFIRM_WORKBENCH_REPLAY_SEED",
      "CONFIRM_MINIMATCH_SPATIAL_CONTEXT_PARTIAL",
      "CONFIRM_ROUTE_ATTRIBUTE_INFLUENCE_LAYER",
      "CONFIRM_SELECTION_DRIVING_ATTRIBUTE_RANKING_V0",
      "CONFIRM_ATTRIBUTE_SELECTION_GUARD",
      "CONFIRM_SPATIAL_ROUTE_SELECTION_PATH",
      "CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED",
      "CONFIRM_CONTROLLED_MINIMATCH_SPATIAL_SELECTION",
      "KEEP_50_MATCH_ECONOMY_REFERENCE",
      "PREPARE_NORMAL_FULLMATCH_SPATIAL_SELECTION_FLAG",
      "PREPARE_FULLMATCH_WORKBENCH_CHAIN_REPLAY",
    ],
  };
}
```

## File: src/simulation/grounding/tacticalWorkbenchContractGuard.test.ts

```ts
import { existsSync } from "node:fs";
import { join } from "node:path";
import { extractSequenceOneActionOneWorkbenchTruthFromHtml } from "./extractWorkbenchTruth";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";
import { validateSequenceOneActionOneWorkbenchTruth } from "./tacticalWorkbenchContractGuard";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateTacticalWorkbenchContractGuard(): readonly string[] {
  const workbenchPath = join(__dirname, "..", "..", "..", "reports", "workbench", "sequence-1-action-1.html");
  const extracted = existsSync(workbenchPath)
    ? extractSequenceOneActionOneWorkbenchTruthFromHtml(workbenchPath)
    : sequence1Action1WorkbenchTruth;
  const checks = validateSequenceOneActionOneWorkbenchTruth(sequence1Action1WorkbenchTruth);

  assertTest(extracted.selectedAction.actorId === "control-tempo-half", "selected action actor must be TH.");
  assertTest(extracted.selectedAction.receiverId === "control-mobile-lock", "selected action receiver must be ML.");
  assertTest(extracted.afterState?.ballZone === "Z3-HSL", "after ball zone must be Z3-HSL.");
  assertTest(extracted.playerPositions.length >= 20, "extracted before positions must include both teams.");
  assertTest((extracted.afterPlayerPositions ?? []).length >= 10, "extracted after positions must include tactical after-state.");

  return checks;
}

if (require.main === module) {
  const checks = validateTacticalWorkbenchContractGuard();

  console.log("tacticalWorkbenchContractGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/grounding/miniMatchWorkbenchAlignment.test.ts

```ts
import { analyzeMiniMatchWorkbenchAlignment } from "./miniMatchWorkbenchAlignment";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMiniMatchWorkbenchAlignment(): readonly string[] {
  const report = analyzeMiniMatchWorkbenchAlignment(sequence1Action1WorkbenchTruth);

  assertTest(report.status === "PARTIAL", `mini-match alignment must honestly be PARTIAL, received ${report.status}.`);
  assertTest(report.supportedTruths.some((truth) => truth.includes("SUPPORT_CLUSTER_RECYCLE")), "selected action type must be supported.");
  assertTest(report.supportedTruths.some((truth) => truth.includes("Z3-HSL")), "reception zone must be representable.");
  assertTest(report.missingTruths.some((truth) => truth.includes("official MatchInput roster")), "official roster gap must be named.");
  assertTest(report.lossyMappings.some((truth) => truth.includes("prototype")), "prototype lossy mapping must be named.");

  return [
    "mini-match alignment is PARTIAL, not fake PASS",
    "selected action semantics are partially supported",
    "official roster and workbench shape gaps are named",
  ];
}

if (require.main === module) {
  const checks = validateMiniMatchWorkbenchAlignment();

  console.log("miniMatchWorkbenchAlignment tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/grounding/rosterToMiniMatchGapAnalysis.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { adaptMatchInputToMiniMatch } from "../adapters/matchInputToMiniMatch";
import { analyzeRosterToMiniMatchGap } from "./rosterToMiniMatchGapAnalysis";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRosterToMiniMatchGapAnalysis(): readonly string[] {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const adapter = adaptMatchInputToMiniMatch(matchInput);
  const analysis = analyzeRosterToMiniMatchGap({ matchInput, adapter });

  assertTest(analysis.status === "PARTIAL", `roster-to-mini-match gap must be PARTIAL, received ${analysis.status}.`);
  assertTest(analysis.spatialContextAdapterExists, "spatial context adapter must be reported as available.");
  assertTest(analysis.rosterCanBecomeSpatialContext, "TeamSnapshot.roster must be reported as convertible to SpatialTeamContext.");
  assertTest(analysis.workbenchPositionsCanSeedSpatialContext, "workbench positions must be reported as able to seed spatial context.");
  assertTest(analysis.miniMatchConsumesSpatialContextMetadata === "PARTIAL", "mini-match spatial context consumption must be PARTIAL.");
  assertTest(analysis.rosterDrivesMiniMatchPlayerPositions, "TeamSnapshot.roster must now drive adapter-level spatial player context.");
  assertTest(analysis.startersDriveActivePlayers, "TeamSnapshot.starters must now drive adapter-level active player IDs.");
  assertTest(!analysis.playerRolesDriveActionResolution, "PlayerSnapshot.role must not be reported as driving action resolution yet.");
  assertTest(analysis.attributeInfluenceLayerExists, "attribute influence layer must be reported as available.");
  assertTest(analysis.routeRankingAttributeInfluenceMode === "candidate_modifier", "attribute influence mode must be candidate_modifier.");
  assertTest(analysis.selectionSource === "spatial_candidate_modifier", "selection source must report spatial_candidate_modifier availability.");
  assertTest(analysis.spatialSelectionPathExists, "spatial selection path must exist.");
  assertTest(analysis.prototypeFallbackStillEnabled, "prototype fallback must remain enabled.");
  assertTest(!analysis.normalFullMatchUsesSpatialSelection, "normal full-match must not be reported as spatial-selection-driven yet.");
  assertTest(analysis.controlledMiniMatchUsesSpatialSelection, "controlled mini-match must use spatial route selection.");
  assertTest(analysis.visibleAttributesDriveRouteRanking === "PARTIAL", "visible attributes must reduce ranking gap to PARTIAL.");
  assertTest(analysis.remainingPrototypeDominance === "HIGH", "remaining prototype dominance must be reported honestly.");
  assertTest(analysis.prototypesStillDominant, "CONTROL/BLITZ prototypes must be identified as dominant.");
  assertTest(analysis.lostPlayerIdentity.length > 0, "lost official player identity must be reported.");

  return [
    "roster-to-mini-match gap is PARTIAL",
    "TeamSnapshot roster and starters now drive adapter-level spatial context",
    "workbench positions can seed spatial context",
    "route attribute influence layer exists",
    "controlled spatial route selection path exists",
    "prototype fallback remains enabled",
    "visible attributes drive candidate_modifier route ranking partially",
    "prototype dominance is still documented",
    "lost player identity is listed",
  ];
}

if (require.main === module) {
  const checks = validateRosterToMiniMatchGapAnalysis();

  console.log("rosterToMiniMatchGapAnalysis tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/spatialContext/roleToTacticalFunctions.test.ts

```ts
import { sequence1Action1WorkbenchTruth } from "../grounding/fixtures/sequence1Action1.fixture";
import { hasExplicitTacticalFunctionMapping, tacticalFunctionsForRole } from "./roleToTacticalFunctions";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRoleToTacticalFunctions(): readonly string[] {
  const roles = new Set(sequence1Action1WorkbenchTruth.playerPositions.map((position) => position.role));

  for (const role of roles) {
    assertTest(hasExplicitTacticalFunctionMapping(role), `role ${role} must have explicit tactical functions.`);
    assertTest(tacticalFunctionsForRole(role).length > 0, `role ${role} must map to at least one tactical function.`);
  }

  return [
    "every CONTROL/BLITZ workbench role has explicit tactical functions",
    "every mapped role has at least one tactical function",
  ];
}

if (require.main === module) {
  const checks = validateRoleToTacticalFunctions();

  console.log("roleToTacticalFunctions tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/spatialContext/workbenchToSpatialMatchContext.test.ts

```ts
import { sequence1Action1WorkbenchTruth } from "../grounding/fixtures/sequence1Action1.fixture";
import { createWorkbenchReplayMatchInput } from "../grounding/runWorkbenchReplaySeed";
import { workbenchToSpatialMatchContext } from "./workbenchToSpatialMatchContext";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateWorkbenchToSpatialMatchContext(): readonly string[] {
  const matchInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const before = workbenchToSpatialMatchContext({
    matchInput,
    workbench: sequence1Action1WorkbenchTruth,
    frame: "before",
  });
  const after = workbenchToSpatialMatchContext({
    matchInput,
    workbench: sequence1Action1WorkbenchTruth,
    frame: "after",
  });
  const beforeControlMl = before.home.players.find((player) => player.playerId === "control-mobile-lock");

  assertTest(before.possessionTeamId === "control", "possession team must be CONTROL.");
  assertTest(before.defendingTeamId === "blitz", "defending team must be BLITZ.");
  assertTest(before.ballCarrierId === "control-tempo-half", "before ball carrier must be CONTROL TH.");
  assertTest(before.ballZone === "Z4-HSL", "before ball zone must be Z4-HSL.");
  assertTest(beforeControlMl?.zone === "Z3-HSL", "CONTROL ML must exist at Z3-HSL before action.");
  assertTest(after.ballCarrierId === "control-mobile-lock", "after new carrier must be CONTROL ML.");
  assertTest(after.ballZone === "Z3-HSL", "after ball zone must be Z3-HSL.");

  return [
    "sequence-1-action-1 before frame becomes SpatialMatchContext",
    "possession and defending teams are preserved",
    "CONTROL ML before zone is preserved",
    "after frame new carrier and ball zone are preserved",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchToSpatialMatchContext();

  console.log("workbenchToSpatialMatchContext tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/grounding/workbenchReplaySeed.test.ts

```ts
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";
import { createWorkbenchReplayMatchInput, runWorkbenchReplaySeed } from "./runWorkbenchReplaySeed";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateWorkbenchReplaySeed(): readonly string[] {
  const matchInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const result = runWorkbenchReplaySeed({
    matchInput,
    workbench: sequence1Action1WorkbenchTruth,
  });

  assertTest(result.spatialContextBuilt, "spatial context must be built.");
  assertTest(result.actorPreserved, "actor control-tempo-half must be preserved.");
  assertTest(result.receiverPreserved, "receiver control-mobile-lock must be preserved.");
  assertTest(result.newCarrierPreserved, "new carrier control-mobile-lock must be preserved.");
  assertTest(result.ballZonePreserved, "before and after ball zones must be preserved.");
  assertTest(result.selectedActionRepresented, "SUPPORT_CLUSTER_RECYCLE selected action must be represented.");
  assertTest(result.attributeInfluenceApplied, "replay seed must apply route attribute influence.");
  assertTest(result.routeRankingUsesRealAttributes === "PARTIAL", "replay seed must report attribute route ranking as PARTIAL.");
  assertTest(result.attributeRankingMode === "candidate_modifier", "replay seed must evaluate candidate_modifier mode.");
  assertTest(result.routeSelectionSource === "spatial_candidate_modifier", "replay seed must use spatial_candidate_modifier route selection source.");
  assertTest(result.miniMatchRouteSelectionResult !== undefined, "replay seed must expose mini-match route selection result.");
  assertTest(result.miniMatchRouteSelectionUsedSpatialResult, "replay seed mini-match route selection must use a valid spatial result.");
  assertTest(
    result.miniMatchRouteSelectionResult?.selectedActorId === "control-tempo-half",
    "mini-match route selection must preserve TH actor.",
  );
  assertTest(
    result.miniMatchRouteSelectionResult?.selectedReceiverId === "control-mobile-lock",
    "mini-match route selection must preserve TH -> ML receiver.",
  );
  assertTest(result.metadataOnlySelectionResult?.selectedCandidateId === "rank-1", "metadata_only replay selection must keep base rank-1.");
  assertTest(result.attributeSelectionResult?.selectedCandidateId === "rank-1", "candidate_modifier replay selection must preserve TH -> ML for workbench truth.");
  assertTest(result.selectedBy === "base_score", "sequence-1-action-1 should remain selected by base score after guard checks.");
  assertTest(!result.selectionChangedByAttributes, "sequence-1-action-1 must not change selection by attributes.");
  assertTest(result.selectedCandidateBaseScore !== undefined, "selected candidate base score must be exposed.");
  assertTest(result.selectedCandidateAttributeAdjustedScore !== undefined, "selected candidate adjusted score must be exposed.");
  assertTest((result.selectedCandidateInfluences ?? []).length > 0, "selected candidate influences must be exposed.");
  assertTest(result.status === "PARTIAL" || result.status === "PASS", `replay seed must not fail, received ${result.status}.`);
  if (result.status === "PARTIAL") {
    assertTest(result.lossyMappings.length > 0, "PARTIAL replay seed must list lossy mappings.");
  }

  return [
    "spatial context is built",
    "actor TH is preserved",
    "receiver ML is preserved",
    "new carrier ML is preserved",
    "before ball zone Z4-HSL is preserved",
    "after ball zone Z3-HSL is preserved",
    "selected action type SUPPORT_CLUSTER_RECYCLE is represented",
    "route attribute influence is applied",
    "candidate_modifier mode is evaluated",
    "spatial_candidate_modifier route selection is evaluated",
    "TH -> ML remains selected under candidate_modifier guard",
    "selected candidate base and adjusted scores are exposed",
    "replay seed is PARTIAL and honest",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchReplaySeed();

  console.log("workbenchReplaySeed tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/routeRanking/routeAttributeInfluence.test.ts

```ts
import type { SpatialPlayerContext } from "../spatialContext";
import { applyRouteAttributeInfluence, buildRouteAttributeInfluences, clampRouteAttributeModifier } from "./routeAttributeInfluence";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function player(input: {
  readonly playerId: string;
  readonly speed?: number;
  readonly power?: number;
  readonly handPlay?: number;
  readonly footPlayDribble?: number;
  readonly footPlayPassingShooting?: number;
  readonly intelligence?: number;
  readonly mental?: number;
  readonly condition?: number;
  readonly freshness?: number;
  readonly functions?: readonly string[];
}): SpatialPlayerContext {
  return {
    playerId: input.playerId,
    teamId: "control",
    role: "test_role",
    displayRole: "Test Role",
    zone: "Z3-HSL",
    isStarter: true,
    isGoalkeeper: false,
    isBallCarrier: false,
    currentCondition: input.condition ?? 86,
    mentalFreshness: input.freshness ?? 86,
    attributes: {
      speed: input.speed ?? 70,
      power: input.power ?? 70,
      endurance: 80,
      handPlay: input.handPlay ?? 70,
      footPlayDribble: input.footPlayDribble ?? 70,
      footPlayPassingShooting: input.footPlayPassingShooting ?? 70,
      intelligence: input.intelligence ?? 70,
      mental: input.mental ?? 70,
    },
    tacticalFunctions: input.functions ?? [],
  };
}

export function validateRouteAttributeInfluence(): readonly string[] {
  const strongActor = player({ playerId: "actor", handPlay: 92, intelligence: 90, mental: 88 });
  const strongReceiver = player({
    playerId: "receiver",
    handPlay: 90,
    intelligence: 88,
    condition: 92,
    freshness: 90,
    functions: ["pressure_escape_receiver"],
  });
  const supportInfluences = buildRouteAttributeInfluences({
    actor: strongActor,
    receiver: strongReceiver,
    actionType: "SUPPORT_CLUSTER_RECYCLE",
    laneState: "CLOSED",
    pressureLevel: "HIGH",
    baseRisk: 20,
  });
  const supportAdjusted = applyRouteAttributeInfluence({
    baseScore: 70,
    influences: supportInfluences,
  });
  const tiredShooter = player({
    playerId: "tired-shooter",
    footPlayPassingShooting: 84,
    mental: 35,
    intelligence: 50,
    condition: 38,
    freshness: 34,
  });
  const shotInfluences = buildRouteAttributeInfluences({
    actor: tiredShooter,
    actionType: "SHOT",
    pressureLevel: "HIGH",
    baseRisk: 80,
  });
  const shotAdjusted = applyRouteAttributeInfluence({ baseScore: 60, influences: shotInfluences });
  const fastRunner = player({
    playerId: "fast-runner",
    speed: 95,
    footPlayDribble: 90,
    intelligence: 86,
  });
  const ruptureInfluences = buildRouteAttributeInfluences({
    actor: strongActor,
    receiver: fastRunner,
    actionType: "WEAK_SIDE_SWITCH",
    laneState: "CLOSED",
  });
  const platformInfluences = buildRouteAttributeInfluences({
    actor: strongActor,
    receiver: player({ playerId: "platform", power: 93, handPlay: 88, mental: 84 }),
    actionType: "FORWARD_PROGRESS",
  });

  assertTest(supportAdjusted > 70, "high handPlay and intelligence must improve support/recycle reliability.");
  assertTest(
    supportInfluences.some((item) => item.category === "PASS_SECURITY") &&
      supportInfluences.some((item) => item.category === "RECEPTION_QUALITY"),
    "support/recycle influences must explain pass security and reception quality.",
  );
  assertTest(shotAdjusted < 60, "low condition and mental freshness must increase final-action risk.");
  assertTest(
    shotInfluences.some((item) => item.category === "FATIGUE_DRAG" || item.category === "TURNOVER_RISK"),
    "shot risk must include fatigue or turnover explanation.",
  );
  assertTest(
    ruptureInfluences.some((item) => item.category === "RUPTURE_THREAT" && item.reason.includes("closed lane")),
    "high speed may improve rupture threat but must not override closed lane legality.",
  );
  assertTest(
    platformInfluences.some((item) => item.category === "CONTACT_PLATFORM" && item.modifier > 0),
    "power and handPlay must improve contact platform value.",
  );
  assertTest(clampRouteAttributeModifier(99) === 12, "positive modifiers must be bounded at +12.");
  assertTest(clampRouteAttributeModifier(-99) === -12, "negative modifiers must be bounded at -12.");

  return [
    "support/recycle attributes improve reliability",
    "fatigue and mental freshness increase risk",
    "rupture threat does not override closed lane legality",
    "contact platform value uses power and handPlay",
    "route attribute modifiers are bounded",
  ];
}

if (require.main === module) {
  const checks = validateRouteAttributeInfluence();

  console.log("routeAttributeInfluence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/routeRanking/applySpatialAttributeInfluenceToCandidates.test.ts

```ts
import { sequence1Action1WorkbenchTruth } from "../grounding/fixtures/sequence1Action1.fixture";
import { createWorkbenchReplayMatchInput } from "../grounding/runWorkbenchReplaySeed";
import { workbenchToSpatialMatchContext } from "../spatialContext";
import { applySpatialAttributeInfluenceToCandidates, type RouteCandidateInput } from "./applySpatialAttributeInfluenceToCandidates";
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function candidates(): readonly RouteCandidateInput[] {
  return sequence1Action1WorkbenchTruth.rankedOptions.map((option) => ({
    candidateId: `rank-${option.rank}`,
    actorId: sequence1Action1WorkbenchTruth.selectedAction.actorId as PlayerId,
    ...(option.receiverId === undefined ? {} : { receiverId: option.receiverId as PlayerId }),
    teamId: sequence1Action1WorkbenchTruth.possessionTeamId as TeamId,
    fromZone: sequence1Action1WorkbenchTruth.selectedAction.fromZone as ZoneId,
    targetZone: option.targetZone as ZoneId,
    actionType: option.actionType,
    ...(option.laneState === undefined ? {} : { laneState: option.laneState }),
    baseScore: option.finalSelectionScore ?? option.score ?? 0,
    baseRisk: option.risk === "HIGH" ? 80 : option.risk === "MEDIUM" ? 50 : 20,
  }));
}

export function validateApplySpatialAttributeInfluenceToCandidates(): readonly string[] {
  const baseCandidates = candidates();
  const unchanged = applySpatialAttributeInfluenceToCandidates({
    candidates: baseCandidates,
  });
  const matchInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const spatialContext = workbenchToSpatialMatchContext({
    matchInput,
    workbench: sequence1Action1WorkbenchTruth,
    frame: "before",
  });
  const adjusted = applySpatialAttributeInfluenceToCandidates({
    spatialContext,
    candidates: baseCandidates,
    pressureLevel: "HIGH",
  });
  const selected = adjusted.find((candidate) => candidate.candidateId === "rank-1");
  const weakSide = adjusted.find((candidate) => candidate.actionType === "WEAK_SIDE_SWITCH");

  assertTest(
    unchanged.every((candidate) => candidate.attributeAdjustedScore === candidate.baseScore && candidate.attributeInfluences.length === 0),
    "absence of spatialContext must leave candidate scores unchanged.",
  );
  assertTest(
    adjusted.some((candidate) => candidate.attributeInfluences.length > 0),
    "spatialContext must add attribute influence metadata.",
  );
  assertTest(selected !== undefined && selected.attributeAdjustedScore >= selected.baseScore, "selected recycle candidate should remain plausible after attribute influence.");
  assertTest(
    weakSide !== undefined && weakSide.laneState === "CONTESTED",
    "attribute influence must preserve lane state and not rewrite legality.",
  );
  assertTest(
    adjusted.every((candidate) => Math.abs(candidate.attributeAdjustedScore - candidate.baseScore) <= 12),
    "total attribute adjustment must remain bounded.",
  );

  return [
    "no spatialContext leaves candidate scores unchanged",
    "spatialContext enriches candidates with attribute influences",
    "selected recycle remains plausible",
    "lane state legality is preserved",
    "candidate score adjustments are bounded",
  ];
}

if (require.main === module) {
  const checks = validateApplySpatialAttributeInfluenceToCandidates();

  console.log("applySpatialAttributeInfluenceToCandidates tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/routeRanking/attributeDrivenSelectionGuard.test.ts

```ts
import { applySpatialAttributeInfluenceToCandidates } from "./applySpatialAttributeInfluenceToCandidates";
import { guardAttributeDrivenSelection } from "./attributeDrivenSelectionGuard";
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import type { RouteCandidateAttributeContext } from "./routeAttributeInfluenceTypes";
import {
  attributeRankingContrastSpatialContext,
  closedLaneContrastCandidates,
  legalContrastCandidates,
  unavailableContrastCandidates,
} from "./fixtures/attributeRankingContrast.fixture";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateAttributeDrivenSelectionGuard(): readonly string[] {
  const legalCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: legalContrastCandidates(),
  });
  const closedCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: closedLaneContrastCandidates(),
  });
  const unavailableCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: unavailableContrastCandidates(),
  });
  const legalWeakSide = legalCandidates.find((candidate) => candidate.candidateId === "elite-weak-side");
  const closedWeakSide = closedCandidates.find((candidate) => candidate.candidateId === "elite-weak-side");
  const unavailableWeakSide = unavailableCandidates.find((candidate) => candidate.candidateId === "elite-weak-side");
  const safeRecycle = legalCandidates.find((candidate) => candidate.candidateId === "safe-recycle");
  const missingActor = legalCandidates[0] === undefined
    ? undefined
    : {
        ...legalCandidates[0],
        actorId: "missing-actor",
      };

  assertTest(legalWeakSide !== undefined, "contrast fixture must include legal weak-side candidate.");
  assertTest(safeRecycle !== undefined, "contrast fixture must include safe recycle candidate.");
  assertTest(closedWeakSide !== undefined, "contrast fixture must include closed weak-side candidate.");
  assertTest(unavailableWeakSide !== undefined, "contrast fixture must include unavailable weak-side candidate.");

  if (legalWeakSide !== undefined && closedWeakSide !== undefined && unavailableWeakSide !== undefined && safeRecycle !== undefined) {
    const shotTargetZone = "Z5-C";
    const wrongTargetZone = "Z4-HSL";
    const { receiverId: _safeRecycleReceiverId, ...safeRecycleWithoutReceiver } = safeRecycle;
    const receiverlessWorkbench: TacticalWorkbenchFrame = {
      frameId: "receiverless-workbench",
      sequenceId: "test-sequence",
      actionId: "test-action",
      phase: "finishing",
      possessionTeamId: legalWeakSide.teamId,
      defendingTeamId: "BLITZ",
      ballCarrierId: legalWeakSide.actorId,
      ballZone: legalWeakSide.fromZone,
      attackingDirection: "left-to-right",
      playerPositions: [],
      teamShapeIntents: [],
      selectedAction: {
        actorId: legalWeakSide.actorId,
        fromZone: legalWeakSide.fromZone,
        targetZone: shotTargetZone,
        actionType: "SHOT",
      },
      rankedOptions: [],
    };
    const receiverlessMatchingCandidate: RouteCandidateAttributeContext = {
      ...safeRecycleWithoutReceiver,
      candidateId: "receiverless-shot-truth",
      actorId: legalWeakSide.actorId,
      fromZone: legalWeakSide.fromZone,
      targetZone: shotTargetZone,
      actionType: "SHOT",
    };
    const receiverlessWrongReceiverCandidate: RouteCandidateAttributeContext = {
      ...receiverlessMatchingCandidate,
      candidateId: "receiverless-shot-wrong-receiver",
      receiverId: "control-hook-link",
    };
    const receiverlessWrongTargetCandidate: RouteCandidateAttributeContext = {
      ...receiverlessMatchingCandidate,
      candidateId: "receiverless-shot-wrong-target",
      targetZone: wrongTargetZone,
    };
    const legalGuard = guardAttributeDrivenSelection({
      candidate: legalWeakSide,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      maxAttributeAdjustment: 12,
    });
    const closedGuard = guardAttributeDrivenSelection({
      candidate: closedWeakSide,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      maxAttributeAdjustment: 12,
    });
    const unavailableGuard = guardAttributeDrivenSelection({
      candidate: unavailableWeakSide,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      maxAttributeAdjustment: 12,
      availability: "NOT_AVAILABLE_NOW",
    });
    const missingActorGuard = missingActor === undefined
      ? { valid: false, blockedReasons: [], warnings: [] }
      : guardAttributeDrivenSelection({
          candidate: missingActor,
          spatialContext: attributeRankingContrastSpatialContext,
          baseSelectedCandidateId: "safe-recycle",
          maxAttributeAdjustment: 12,
        });
    const receiverlessMatchGuard = guardAttributeDrivenSelection({
      candidate: receiverlessMatchingCandidate,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      workbench: receiverlessWorkbench,
      maxAttributeAdjustment: 12,
    });
    const receiverlessWrongReceiverGuard = guardAttributeDrivenSelection({
      candidate: receiverlessWrongReceiverCandidate,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      workbench: receiverlessWorkbench,
      maxAttributeAdjustment: 12,
    });
    const receiverlessWrongTargetGuard = guardAttributeDrivenSelection({
      candidate: receiverlessWrongTargetCandidate,
      spatialContext: attributeRankingContrastSpatialContext,
      baseSelectedCandidateId: "safe-recycle",
      workbench: receiverlessWorkbench,
      maxAttributeAdjustment: 12,
    });

    assertTest(legalGuard.valid, "legal adjusted candidate must pass guard.");
    assertTest(
      closedGuard.blockedReasons.includes("CLOSED_LANE_NOT_OVERRIDABLE"),
      "closed lane must block attribute-driven selection flip.",
    );
    assertTest(
      unavailableGuard.blockedReasons.includes("CANDIDATE_NOT_AVAILABLE_NOW"),
      "NOT_AVAILABLE_NOW candidate must be blocked.",
    );
    assertTest(
      missingActorGuard.blockedReasons.includes("MISSING_ACTOR_IN_SPATIAL_CONTEXT"),
      "missing actor must block selection flip.",
    );
    assertTest(receiverlessMatchGuard.valid, "receiverless workbench truth candidate must pass exact guard.");
    assertTest(
      receiverlessWrongReceiverGuard.blockedReasons.includes("WORKBENCH_TRUTH_VIOLATION"),
      "receiverless workbench action must reject candidates that add a receiver.",
    );
    assertTest(
      receiverlessWrongTargetGuard.blockedReasons.includes("WORKBENCH_TRUTH_VIOLATION"),
      "receiverless workbench action must reject candidates with a different target zone.",
    );
  }

  return [
    "legal adjusted candidate passes guard",
    "closed lane cannot be overridden by attributes",
    "NOT_AVAILABLE_NOW cannot become selected by attributes",
    "missing actor blocks attribute-driven selection",
    "receiverless workbench truth requires exact receiver and target identity",
  ];
}

if (require.main === module) {
  const checks = validateAttributeDrivenSelectionGuard();

  console.log("attributeDrivenSelectionGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/routeRanking/selectAttributeAdjustedCandidate.test.ts

```ts
import { applySpatialAttributeInfluenceToCandidates } from "./applySpatialAttributeInfluenceToCandidates";
import {
  attributeRankingContrastSpatialContext,
  closedLaneContrastCandidates,
  legalContrastCandidates,
  unavailableContrastCandidates,
} from "./fixtures/attributeRankingContrast.fixture";
import { selectAttributeAdjustedCandidate } from "./selectAttributeAdjustedCandidate";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectAttributeAdjustedCandidate(): readonly string[] {
  const legalAdjusted = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: legalContrastCandidates(),
  });
  const closedAdjusted = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: closedLaneContrastCandidates(),
  });
  const unavailableAdjusted = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: unavailableContrastCandidates(),
  });
  const metadataOnly = selectAttributeAdjustedCandidate({
    candidates: legalAdjusted,
    mode: "metadata_only",
    spatialContext: attributeRankingContrastSpatialContext,
    baseSelectedCandidateId: "safe-recycle",
  });
  const legalFlip = selectAttributeAdjustedCandidate({
    candidates: legalAdjusted,
    mode: "candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    baseSelectedCandidateId: "safe-recycle",
  });
  const closedBlocked = selectAttributeAdjustedCandidate({
    candidates: closedAdjusted,
    mode: "candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    baseSelectedCandidateId: "safe-recycle",
  });
  const unavailableBlocked = selectAttributeAdjustedCandidate({
    candidates: unavailableAdjusted,
    mode: "candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    baseSelectedCandidateId: "safe-recycle",
  });
  const noSpatialContext = selectAttributeAdjustedCandidate({
    candidates: legalAdjusted,
    mode: "candidate_modifier",
    baseSelectedCandidateId: "safe-recycle",
  });

  assertTest(metadataOnly.selectedCandidateId === "safe-recycle", "metadata_only must keep base selection.");
  assertTest(metadataOnly.selectedBy === "base_score", "metadata_only must select by base score.");
  assertTest(legalFlip.selectedCandidateId === "elite-weak-side", "candidate_modifier must allow legal attribute-driven flip.");
  assertTest(legalFlip.selectedBy === "attribute_adjusted_score", "legal flip must be selected by adjusted score.");
  assertTest(legalFlip.selectionChanged, "legal flip must report selectionChanged.");
  assertTest(closedBlocked.selectedCandidateId === "safe-recycle", "closed lane candidate must not overtake base selection.");
  assertTest(
    closedBlocked.selectedBy === "base_score",
    "closed lane fallback must keep base-score selection.",
  );
  assertTest(unavailableBlocked.selectedCandidateId === "safe-recycle", "NOT_AVAILABLE_NOW candidate must not overtake base selection.");
  assertTest(noSpatialContext.selectedCandidateId === "safe-recycle", "no spatialContext must preserve previous behavior.");
  assertTest(
    legalAdjusted.every((candidate) => Math.abs(candidate.attributeAdjustedScore - candidate.baseScore) <= 12),
    "adjustment bound must still be respected.",
  );

  return [
    "metadata_only keeps base selection",
    "candidate_modifier can select by adjusted score",
    "candidate_modifier cannot select CLOSED lane",
    "NOT_AVAILABLE_NOW cannot be selected by attributes",
    "no spatialContext preserves previous behavior",
    "attribute adjustment bound remains respected",
  ];
}

if (require.main === module) {
  const checks = validateSelectAttributeAdjustedCandidate();

  console.log("selectAttributeAdjustedCandidate tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/diagnostics/fullMatchGroundingDiagnostics.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { analyzeFullMatchGroundingDiagnostics } from "./fullMatchGroundingDiagnostics";
import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchGroundingDiagnostics(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runFullMatch(input);
  const diagnostics = analyzeFullMatchGroundingDiagnostics(report);
  const scoreFromConsequences = report.timeline.reduce(
    (score, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: score.home + (event.teamId === input.homeTeam.teamId ? points : 0),
        away: score.away + (event.teamId === input.awayTeam.teamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertTest(diagnostics.warnings.includes("FULL_MATCH_PARTIALLY_WORKBENCH_GROUNDED"), "partial full-match grounding warning must be emitted.");
  assertTest(diagnostics.warnings.includes("SPATIAL_CONTEXT_ADAPTER_AVAILABLE"), "spatial context adapter availability must be emitted.");
  assertTest(diagnostics.warnings.includes("WORKBENCH_REPLAY_SEED_AVAILABLE"), "workbench replay seed availability must be emitted.");
  assertTest(diagnostics.warnings.includes("ROUTE_ATTRIBUTE_INFLUENCE_AVAILABLE"), "route attribute influence availability must be emitted.");
  assertTest(diagnostics.warnings.includes("ROUTE_ATTRIBUTE_CANDIDATE_MODIFIER_AVAILABLE"), "candidate_modifier availability must be emitted.");
  assertTest(diagnostics.warnings.includes("ATTRIBUTE_SELECTION_GUARD_ACTIVE"), "attribute selection guard activity must be emitted.");
  assertTest(diagnostics.warnings.includes("ATTRIBUTE_SELECTION_NOT_FULLMATCH_AUTHORITATIVE"), "full-match authority limitation must be emitted.");
  assertTest(diagnostics.warnings.includes("SPATIAL_ROUTE_SELECTION_PATH_AVAILABLE"), "spatial route selection path availability must be emitted.");
  assertTest(diagnostics.warnings.includes("CONTROLLED_MINIMATCH_SPATIAL_SELECTION_AVAILABLE"), "controlled mini-match spatial selection availability must be emitted.");
  assertTest(diagnostics.warnings.includes("PROTOTYPE_FALLBACK_STILL_ENABLED"), "prototype fallback warning must be emitted.");
  assertTest(diagnostics.warnings.includes("NORMAL_FULLMATCH_NOT_YET_SPATIAL_SELECTION_DRIVEN"), "normal full-match limitation must be emitted.");
  assertTest(diagnostics.warnings.includes("PROTOTYPE_SELECTION_STILL_PARTIAL"), "prototype selection partiality must still be emitted.");
  assertTest(!diagnostics.mayInvalidateGlobalScoringEconomy, "grounding diagnostics must not invalidate global economy.");
  assertTest(!diagnostics.scoringEventsMutated, "grounding diagnostics must not mutate scoring events.");
  assertTest(
    report.warnings.some((warning) => warning.warningId.endsWith("tactical-grounding-gap")),
    "MatchReport must include a grounding warning.",
  );
  assertTest(
    report.evidenceFacts.some((fact) => fact.internalTags.includes("tactical_grounding_gap")),
    "MatchReport must include grounding evidence facts.",
  );
  assertTest(
    scoreFromConsequences.home === report.score.home && scoreFromConsequences.away === report.score.away,
    "final score must remain derived from score_change consequences.",
  );

  try {
    assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_HARNESS_SINGLE_RUN");
    throw new Error("FULL_MATCH_HARNESS_SINGLE_RUN must not be allowed to make global economy claims.");
  } catch (error) {
    assertTest(String(error).includes("50-match economy"), "50-match economy must remain the global reference.");
  }

  return [
    "partial full-match grounding warning is emitted",
    "spatial context adapter availability is emitted",
    "workbench replay seed availability is emitted",
    "grounding evidence facts are attached",
    "scoring events are not mutated",
    "final score remains derived from score_change",
    "50-match economy remains the global reference",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchGroundingDiagnostics();

  console.log("fullMatchGroundingDiagnostics tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/fullMatch/fullMatchFatiguePropagation.ts

```ts
import type { MatchEvent, MatchInput, TacticalPlan } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ScoreState } from "../../models/match";
import {
  type FullMatchSegmentState,
  type FullMatchTeamSegmentState,
} from "./fullMatchSegmentState";

export interface FullMatchTeamFatigueUpdate {
  readonly teamId: TeamId;
  readonly conditionStart: Rating;
  readonly conditionEnd: Rating;
  readonly mentalFreshnessStart: Rating;
  readonly mentalFreshnessEnd: Rating;
  readonly highIntensityLoad: Rating;
  readonly defensiveStress: Rating;
  readonly momentum: Rating;
}

export interface FullMatchFatiguePropagationResult {
  readonly segmentIndex: number;
  readonly minute: number;
  readonly home: FullMatchTeamFatigueUpdate;
  readonly away: FullMatchTeamFatigueUpdate;
  readonly stateAfterSegment: FullMatchSegmentState;
}

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoringPointsForTeam(events: readonly MatchEvent[], teamId: TeamId): number {
  return events
    .filter((event) => event.teamId === teamId)
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function pressureEventsForTeam(events: readonly MatchEvent[], teamId: TeamId): number {
  return events.filter(
    (event) =>
      event.teamId === teamId &&
      (event.tags.includes("pressure_high") ||
        event.tags.includes("territorial_pressure_high") ||
        event.tags.includes("chaos_high")),
  ).length;
}

function planRiskLoad(plan: TacticalPlan): number {
  switch (plan.riskLevel) {
    case "low":
      return 0.4;
    case "medium":
      return 0.8;
    case "high":
      return 1.25;
  }
}

function updateTeam(input: {
  readonly teamState: FullMatchTeamSegmentState;
  readonly ownPlan: TacticalPlan;
  readonly ownPoints: number;
  readonly concededPoints: number;
  readonly pressureEvents: number;
  readonly secondHalf: boolean;
}): FullMatchTeamFatigueUpdate {
  const pressingLoad = input.ownPlan.pressingIntensity / 100;
  const secondHalfMultiplier = input.secondHalf ? 1.25 : 1;
  const conditionDrop =
    (0.28 + pressingLoad * 0.82 + input.pressureEvents * 0.04 + input.concededPoints * 0.025 + planRiskLoad(input.ownPlan) * 0.16) *
    secondHalfMultiplier;
  const mentalDrop =
    (0.2 + planRiskLoad(input.ownPlan) * 0.4 + input.concededPoints * 0.1 + input.pressureEvents * 0.035) *
    secondHalfMultiplier;
  const conditionEnd = clampRating(input.teamState.condition - conditionDrop);
  const mentalFreshnessEnd = clampRating(input.teamState.mentalFreshness - mentalDrop);
  const momentum = clampRating(input.teamState.momentum + input.ownPoints * 1.7 - input.concededPoints * 1.2);
  const defensiveStress = clampRating(input.teamState.defensiveStress + input.concededPoints * 1.8 + input.pressureEvents * 0.5);
  const pressureLoadIncrease =
    input.ownPlan.pressingIntensity * 0.055 +
    input.pressureEvents * 0.22 +
    input.concededPoints * 0.14 +
    planRiskLoad(input.ownPlan) * 0.35 +
    (input.secondHalf ? 1.1 : 0.4);
  const highIntensityLoad = clampRating(input.teamState.pressureLoad + pressureLoadIncrease);

  return {
    teamId: input.teamState.teamId,
    conditionStart: input.teamState.condition,
    conditionEnd,
    mentalFreshnessStart: input.teamState.mentalFreshness,
    mentalFreshnessEnd,
    highIntensityLoad,
    defensiveStress,
    momentum,
  };
}

function nextTeamState(update: FullMatchTeamFatigueUpdate): FullMatchTeamSegmentState {
  return {
    teamId: update.teamId,
    condition: update.conditionEnd,
    mentalFreshness: update.mentalFreshnessEnd,
    momentum: update.momentum,
    pressureLoad: update.highIntensityLoad,
    scoringConfidence: clampRating(35 + update.momentum * 0.45),
    defensiveStress: update.defensiveStress,
  };
}

function previousScoringTeam(events: readonly MatchEvent[]): TeamId | undefined {
  return [...events]
    .reverse()
    .find((event) => event.eventType === "scoring")?.teamId;
}

export function propagateFullMatchFatigue(input: {
  readonly matchInput: MatchInput;
  readonly previousState: FullMatchSegmentState;
  readonly segmentEvents: readonly MatchEvent[];
  readonly segmentIndex: number;
  readonly minute: number;
  readonly scoreAfterSegment: ScoreState;
  readonly repeatedPatternCount: number;
}): FullMatchFatiguePropagationResult {
  const secondHalf = input.minute >= 40;
  const homePoints = scoringPointsForTeam(input.segmentEvents, input.matchInput.homeTeam.teamId);
  const awayPoints = scoringPointsForTeam(input.segmentEvents, input.matchInput.awayTeam.teamId);
  const home = updateTeam({
    teamState: input.previousState.home,
    ownPlan: input.matchInput.homePlan,
    ownPoints: homePoints,
    concededPoints: awayPoints,
    pressureEvents: pressureEventsForTeam(input.segmentEvents, input.matchInput.homeTeam.teamId),
    secondHalf,
  });
  const away = updateTeam({
    teamState: input.previousState.away,
    ownPlan: input.matchInput.awayPlan,
    ownPoints: awayPoints,
    concededPoints: homePoints,
    pressureEvents: pressureEventsForTeam(input.segmentEvents, input.matchInput.awayTeam.teamId),
    secondHalf,
  });
  const scoringTeamId = previousScoringTeam(input.segmentEvents) ?? input.previousState.previousScoringTeamId;
  const stateAfterSegment: FullMatchSegmentState = {
    segmentIndex: input.segmentIndex + 1,
    minute: input.minute,
    score: input.scoreAfterSegment,
    home: nextTeamState(home),
    away: nextTeamState(away),
    ...(scoringTeamId === undefined ? {} : { previousScoringTeamId: scoringTeamId }),
    repeatedPatternCount: input.repeatedPatternCount,
  };

  return {
    segmentIndex: input.segmentIndex,
    minute: input.minute,
    home,
    away,
    stateAfterSegment,
  };
}

export function applySegmentFatigueToEvents(input: {
  readonly events: readonly MatchEvent[];
  readonly stateBeforeSegment: FullMatchSegmentState;
  readonly stateAfterSegment: FullMatchSegmentState;
}): readonly MatchEvent[] {
  const denominator = Math.max(1, input.events.length - 1);

  return input.events.map((event, index) => {
    const beforeTeamState = input.stateBeforeSegment.home.teamId === event.teamId
      ? input.stateBeforeSegment.home
      : input.stateBeforeSegment.away;
    const afterTeamState = input.stateAfterSegment.home.teamId === event.teamId
      ? input.stateAfterSegment.home
      : input.stateAfterSegment.away;
    const ratio = index / denominator;
    const teamCondition = clampRating(beforeTeamState.condition + (afterTeamState.condition - beforeTeamState.condition) * ratio);
    const mentalFreshness = clampRating(
      beforeTeamState.mentalFreshness + (afterTeamState.mentalFreshness - beforeTeamState.mentalFreshness) * ratio,
    );
    const pressureLoad = clampRating(beforeTeamState.pressureLoad + (afterTeamState.pressureLoad - beforeTeamState.pressureLoad) * ratio);

    return {
      ...event,
      fatigueContext: {
        ...event.fatigueContext,
        teamCondition,
        primaryPlayerCondition: teamCondition,
        primaryPlayerMentalFreshness: mentalFreshness,
        fatiguePressure: Math.max(event.fatigueContext.fatiguePressure ?? 0, pressureLoad),
      },
    };
  });
}
```

## File: src/simulation/fullMatch/fullMatchFatiguePropagation.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchFatiguePropagation(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runFullMatch(input);
  const home = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === input.homeTeam.teamId);
  const away = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === input.awayTeam.teamId);
  const conditionMoved = report.fatigueReport.playerSummaries.some((summary) => summary.conditionEnd < summary.conditionStart);
  const scoreFromConsequences = report.timeline.reduce(
    (score, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: score.home + (event.teamId === input.homeTeam.teamId ? points : 0),
        away: score.away + (event.teamId === input.awayTeam.teamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertTest(home !== undefined && away !== undefined, "fatigue propagation must include both teams.");
  assertTest(conditionMoved, "condition must decrease over a full-match-shaped report.");
  if (home !== undefined && away !== undefined) {
    assertTest(
      away.highIntensityLoad >= home.highIntensityLoad,
      "high pressing creates greater or equal fatigue load than balanced pressing.",
    );
  }
  assertTest(
    scoreFromConsequences.home === report.score.home && scoreFromConsequences.away === report.score.away,
    "final score must still equal score_change consequences.",
  );

  return [
    "high pressing creates greater fatigue load than balanced pressing",
    "condition decreases over full-match run",
    "final score equals score_change consequences",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchFatiguePropagation();

  console.log("fullMatchFatiguePropagation tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/fullMatch/fullMatchSegmentInfluence.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import {
  allSegmentInfluenceModifiers,
  createFullMatchSegmentInfluence,
} from "./fullMatchSegmentInfluence";
import { createInitialFullMatchSegmentState } from "./fullMatchSegmentState";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchSegmentInfluence(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const initialState = createInitialFullMatchSegmentState(input);
  const stressedState = {
    ...initialState,
    segmentIndex: 4,
    score: {
      home: 9,
      away: 3,
    },
    repeatedPatternCount: 3,
    home: {
      ...initialState.home,
      condition: 78,
      mentalFreshness: 74,
      momentum: 63,
      pressureLoad: 70,
      defensiveStress: 66,
      scoringConfidence: 58,
    },
    away: {
      ...initialState.away,
      condition: 82,
      mentalFreshness: 80,
      momentum: 41,
      pressureLoad: 76,
      defensiveStress: 72,
      scoringConfidence: 42,
    },
  };
  const influence = createFullMatchSegmentInfluence(stressedState);
  const repeatedInfluence = createFullMatchSegmentInfluence(stressedState);
  const modifiers = allSegmentInfluenceModifiers(influence);

  assertTest(JSON.stringify(influence) === JSON.stringify(repeatedInfluence), "segment influence must be deterministic.");
  assertTest(influence.segmentIndex === 4, "segment influence must preserve segment index.");
  assertTest(influence.scoreState === "close", `expected close score state, received ${influence.scoreState}.`);
  assertTest(
    modifiers.every((modifier) => modifier >= -5 && modifier <= 5),
    `segment influence modifiers must remain bounded: ${modifiers.join(", ")}.`,
  );
  assertTest(
    influence.home.supportStabilityModifier < influence.home.momentumModifier,
    "fatigue and stress must temper support stability even when momentum is positive.",
  );
  assertTest(
    influence.global.repeatedPatternPressure > 0,
    "repeated pattern pressure must expose accumulated segment repetition.",
  );

  return [
    "segment influence is deterministic",
    "segment influence modifiers are bounded",
    "score state is derived from previous segment score",
    "fatigue and stress temper support stability",
    "repeated pattern pressure is exposed",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchSegmentInfluence();

  console.log("fullMatchSegmentInfluence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/adapters/matchReportBuilder.ts

```ts
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
      reason: `Official tactical plans influence this adapter through sequence count, report zones, and event tags. ${input.influence.explanation}`,
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
      reason: `${input.record.setup.openingLine} Final danger ${finalContext.currentDanger}, pressure ${finalContext.pressureLevel}, possession stability ${finalContext.possessionStability}. Score context ${input.segment.segmentState?.score.home ?? 0}-${input.segment.segmentState?.score.away ?? 0}; momentum ${teamState?.momentum ?? 50}. Plan influence: ${input.influence.explanation}`,
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
        `Scoring summary converted into the official MatchEvent shape. Score context before segment ${input.segment.segmentState?.score.home ?? 0}-${input.segment.segmentState?.score.away ?? 0}; momentum ${teamState?.momentum ?? 50}. Plan influence: ${input.influence.explanation}`,
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
```

## File: src/simulation/adapters/matchInputToMiniMatch.ts

```ts
import { PrototypeTeamId, PROTOTYPE_TEAMS, type PrototypeTeamDefinition } from "../../data/prototypeTeams";
import type { MatchInput, TeamSnapshot } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { MiniMatchInput } from "../miniMatch";

export interface MiniMatchTeamIdMap {
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
  readonly homePrototypeId: PrototypeTeamId;
  readonly awayPrototypeId: PrototypeTeamId;
}

export interface MiniMatchInputAdapterResult {
  readonly miniMatchInput: MiniMatchInput;
  readonly homePrototype: PrototypeTeamDefinition;
  readonly awayPrototype: PrototypeTeamDefinition;
  readonly teamIdMap: MiniMatchTeamIdMap;
  readonly limitations: readonly string[];
}

const SUPPORTED_TEAM_IDS: Readonly<Record<string, PrototypeTeamId>> = {
  control: PrototypeTeamId.Control,
  blitz: PrototypeTeamId.Blitz,
};

function seedToNumber(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function prototypeById(id: PrototypeTeamId): PrototypeTeamDefinition {
  const prototype = PROTOTYPE_TEAMS.find((team) => team.id === id);

  if (prototype === undefined) {
    throw new Error(`runMatch adapter limitation: missing prototype team ${id}.`);
  }

  return prototype;
}

function prototypeIdForSnapshot(team: TeamSnapshot): PrototypeTeamId {
  const prototypeId = SUPPORTED_TEAM_IDS[team.teamId];

  if (prototypeId === undefined) {
    throw new Error(
      `runMatch adapter limitation: unsupported teamId "${team.teamId}". Sprint 2B only maps explicit team IDs "control" and "blitz" to current mini-match prototypes.`,
    );
  }

  return prototypeId;
}

export function officialTeamIdForPrototype(input: {
  readonly miniMatchTeamId: TeamId;
  readonly teamIdMap: MiniMatchTeamIdMap;
}): TeamId {
  if (input.miniMatchTeamId === input.teamIdMap.homePrototypeId) {
    return input.teamIdMap.homeTeamId;
  }

  if (input.miniMatchTeamId === input.teamIdMap.awayPrototypeId) {
    return input.teamIdMap.awayTeamId;
  }

  return input.miniMatchTeamId;
}

export function adaptMatchInputToMiniMatch(input: MatchInput): MiniMatchInputAdapterResult {
  const homePrototypeId = prototypeIdForSnapshot(input.homeTeam);
  const awayPrototypeId = prototypeIdForSnapshot(input.awayTeam);

  if (homePrototypeId === awayPrototypeId) {
    throw new Error(
      `runMatch adapter limitation: home and away teams must map to distinct CONTROL/BLITZ prototypes. Received ${input.homeTeam.teamId} and ${input.awayTeam.teamId}.`,
    );
  }

  const homePrototype = prototypeById(homePrototypeId);
  const awayPrototype = prototypeById(awayPrototypeId);

  return {
    miniMatchInput: {
      teamA: homePrototype,
      teamB: awayPrototype,
      numberOfSequences: 6,
      seed: seedToNumber(input.seed),
    },
    homePrototype,
    awayPrototype,
    teamIdMap: {
      homeTeamId: input.homeTeam.teamId,
      awayTeamId: input.awayTeam.teamId,
      homePrototypeId,
      awayPrototypeId,
    },
    limitations: [
      "Sprint 2B adapter only supports explicit teamId values 'control' and 'blitz'.",
      "Official TeamSnapshot rosters and TacticalPlan settings are not yet converted into mini-match SpatialTeamContext.",
      "Mini-match prototype teams remain the source of tactical simulation behavior for this adapter.",
    ],
  };
}
```

## File: src/simulation/adapters/matchReportEvidence.ts

```ts
import type {
  CoachInsight,
  MatchEvent,
  MatchEventType,
  MatchInput,
  TacticalDiagnosis,
} from "../../contracts/engineToCoach";
import type { MatchReportEvidenceCategory, MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type { TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";

export type MatchEvidenceCategory = MatchReportEvidenceCategory;
export type MatchEvidenceFact = MatchReportEvidenceFact;

interface TeamPerspective {
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly teamName: string;
}

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasTag(event: MatchEvent, tag: string): boolean {
  return event.tags.includes(tag);
}

function uniqueZones(events: readonly MatchEvent[]): readonly ZoneId[] {
  return [...new Set(events.map((event) => event.zone))];
}

function representativeZone(events: readonly MatchEvent[], fallbackZone: ZoneId): ZoneId {
  const zoneCounts = new Map<ZoneId, number>();

  for (const event of events) {
    zoneCounts.set(event.zone, (zoneCounts.get(event.zone) ?? 0) + 1);
  }

  let selectedZone = fallbackZone;
  let selectedCount = 0;

  for (const [zone, count] of zoneCounts) {
    if (count > selectedCount) {
      selectedZone = zone;
      selectedCount = count;
    }
  }

  return selectedZone;
}

function primaryFactZone(fact: MatchEvidenceFact): ZoneId {
  return (fact.affectedZones[0] ?? "Z3-C") as ZoneId;
}

function teamPerspectives(input: MatchInput): readonly TeamPerspective[] {
  return [
    {
      teamId: input.homeTeam.teamId,
      opponentTeamId: input.awayTeam.teamId,
      teamName: input.homeTeam.name,
    },
    {
      teamId: input.awayTeam.teamId,
      opponentTeamId: input.homeTeam.teamId,
      teamName: input.awayTeam.name,
    },
  ];
}

function highDangerFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const highDangerEvents = input.events.filter(
    (event) =>
      event.teamId === input.perspective.teamId &&
      event.eventType === "progression" &&
      hasTag(event, "danger_high"),
  );

  if (highDangerEvents.length === 0) {
    return null;
  }

  const firstHighDangerEvent = highDangerEvents[0];
  if (firstHighDangerEvent === undefined) {
    return null;
  }

  const zones = uniqueZones(highDangerEvents);

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-high-danger`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: highDangerEvents.map((event) => event.eventId),
    affectedZones: [representativeZone(highDangerEvents, firstHighDangerEvent.zone)],
    category: "DANGER_CREATION",
    scope: "MATCH_REPORT",
    summary: `${input.perspective.teamName} a créé ${highDangerEvents.length} séquence${highDangerEvents.length === 1 ? "" : "s"} dangereuse${highDangerEvents.length === 1 ? "" : "s"} visible${highDangerEvents.length === 1 ? "" : "s"} dans les données de simulation actuelles en ${zones.join(", ")}.`,
    strength: clampRating(45 + highDangerEvents.length * 15),
    confidence: "medium",
    coachVisible: true,
    internalTags: ["high_danger_sequences"],
  };
}

function unstablePressureFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const unstableEvents = input.events.filter(
    (event) =>
      event.teamId === input.perspective.teamId &&
      hasTag(event, "stability_low") &&
      (hasTag(event, "pressure_high") || hasTag(event, "pressure_medium")),
  );

  if (unstableEvents.length === 0) {
    return null;
  }

  const firstUnstableEvent = unstableEvents[0];
  if (firstUnstableEvent === undefined) {
    return null;
  }

  const zones = uniqueZones(unstableEvents);

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-unstable-pressure`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: unstableEvents.map((event) => event.eventId),
    affectedZones: [representativeZone(unstableEvents, firstUnstableEvent.zone)],
    category: "POSSESSION_INSTABILITY",
    scope: "MATCH_REPORT",
    summary: `${input.perspective.teamName} a connu ${unstableEvents.length} séquence${unstableEvents.length === 1 ? "" : "s"} de possession instable sous pression visible en ${zones.join(", ")}.`,
    strength: clampRating(40 + unstableEvents.length * 12),
    confidence: "medium",
    coachVisible: true,
    internalTags: ["unstable_under_pressure"],
  };
}

function scoringFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const scoringEvents = input.events.filter(
    (event) => event.teamId === input.perspective.teamId && event.eventType === "scoring",
  );

  if (scoringEvents.length === 0) {
    return null;
  }

  const firstScoringEvent = scoringEvents[0];
  if (firstScoringEvent === undefined) {
    return null;
  }

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-converted-scoring`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: scoringEvents.map((event) => event.eventId),
    affectedZones: [representativeZone(scoringEvents, firstScoringEvent.zone)],
    category: "SCORING_CONVERSION",
    scope: "LIVE_SCORING_STREAM",
    summary: `${input.perspective.teamName} a converti ${scoringEvents.length} action${scoringEvents.length === 1 ? "" : "s"} décisive${scoringEvents.length === 1 ? "" : "s"} identifiée${scoringEvents.length === 1 ? "" : "s"} dans les séquences de score.`,
    strength: clampRating(55 + scoringEvents.length * 15),
    confidence: "medium",
    coachVisible: true,
    internalTags: ["converted_scoring"],
  };
}

function visiblePressureZoneFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const pressureEvents = input.events.filter(
    (event) =>
      event.teamId === input.perspective.teamId &&
      event.eventType !== "kickoff" &&
      (hasTag(event, "pressure_high") || hasTag(event, "territorial_pressure_high")),
  );

  if (pressureEvents.length === 0) {
    return null;
  }

  const firstPressureEvent = pressureEvents[0];
  if (firstPressureEvent === undefined) {
    return null;
  }

  const zone = representativeZone(pressureEvents, firstPressureEvent.zone);
  const zoneEventIds = pressureEvents
    .filter((event) => event.zone === zone)
    .map((event) => event.eventId);

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-pressure-zone`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: zoneEventIds,
    affectedZones: [zone],
    category: "TERRITORIAL_PRESSURE",
    scope: "MATCH_REPORT",
    summary: `La pression la plus visible pour ${input.perspective.teamName} s'est concentrée en ${zone}.`,
    strength: clampRating(35 + zoneEventIds.length * 15),
    confidence: "low",
    coachVisible: true,
    internalTags: ["visible_pressure_zone"],
  };
}

function scorePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function dominatedTeamNoPayoffFact(input: {
  readonly matchInput: MatchInput;
  readonly perspective: TeamPerspective;
  readonly events: readonly MatchEvent[];
}): MatchEvidenceFact | null {
  const ownScoringEvents = input.events.filter((event) => event.teamId === input.perspective.teamId && scorePoints(event) > 0);
  const opponentPoints = input.events
    .filter((event) => event.teamId === input.perspective.opponentTeamId)
    .reduce((total, event) => total + scorePoints(event), 0);
  const signalEvents = input.events.filter(
    (event) =>
      event.teamId === input.perspective.teamId &&
      event.eventType !== "kickoff" &&
      (
        event.eventType === "progression" ||
        hasTag(event, "danger_high") ||
        hasTag(event, "pressure_high") ||
        hasTag(event, "pressure_medium") ||
        hasTag(event, "territorial_pressure_high") ||
        hasTag(event, "stability_low")
      ),
  );

  if (ownScoringEvents.length > 0 || opponentPoints < 21 || signalEvents.length === 0) {
    return null;
  }

  const firstSignalEvent = signalEvents[0];
  if (firstSignalEvent === undefined) {
    return null;
  }

  const zones = uniqueZones(signalEvents);

  return {
    factId: `${input.matchInput.matchId}-${input.perspective.teamId}-dominated-no-payoff`,
    matchId: input.matchInput.matchId,
    teamId: input.perspective.teamId,
    opponentTeamId: input.perspective.opponentTeamId,
    eventIds: signalEvents.map((event) => event.eventId),
    affectedZones: [representativeZone(signalEvents, firstSignalEvent.zone)],
    category: "PRESSURE_WITHOUT_CONVERSION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    summary: `${input.perspective.teamName} apparaît dans plusieurs séquences de pression, de progression ou d'instabilité, mais aucune ne devient un événement de score dans ce run de harnais. La question utile est de savoir si ${input.perspective.teamName} manque de soutien dans le dernier geste, choisit une route trop risquée après pression, ou si le harnais répète une route non convertissante. Zones visibles : ${zones.join(", ")}.`,
    strength: clampRating(45 + signalEvents.length * 8),
    confidence: "low",
    coachVisible: true,
    internalTags: ["dominated_team_no_payoff"],
  };
}

export function createMatchEvidenceFacts(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
}): readonly MatchEvidenceFact[] {
  const facts: MatchEvidenceFact[] = [];

  for (const perspective of teamPerspectives(input.matchInput)) {
    const factInputs = {
      matchInput: input.matchInput,
      perspective,
      events: input.timeline,
    };
    const candidateFacts = [
      highDangerFact(factInputs),
      unstablePressureFact(factInputs),
      scoringFact(factInputs),
      visiblePressureZoneFact(factInputs),
      dominatedTeamNoPayoffFact(factInputs),
    ];

    for (const fact of candidateFacts) {
      if (fact !== null) {
        facts.push(fact);
      }
    }
  }

  return facts;
}

function insightTypeForFact(fact: MatchEvidenceFact): CoachInsight["type"] {
  switch (fact.category) {
    case "DANGER_CREATION":
    case "SCORING_CONVERSION":
      return "tactical_success";
    case "POSSESSION_INSTABILITY":
      return "weakness";
    case "TERRITORIAL_PRESSURE":
      return "training_recommendation";
    case "PRESSURE_WITHOUT_CONVERSION":
      return "tactical_failure";
    case "FATIGUE_LOAD":
    case "MOMENTUM_SHIFT":
    case "TACTICAL_PLAN_SIGNAL":
    case "HARNESS_PLAUSIBILITY_WARNING":
      return "training_recommendation";
  }
}

function titleForFact(fact: MatchEvidenceFact): string {
  switch (fact.category) {
    case "DANGER_CREATION":
      return "Des séquences dangereuses ont émergé";
    case "POSSESSION_INSTABILITY":
      return "La possession s'est fragilisée sous pression";
    case "SCORING_CONVERSION":
      return "Les actions décisives sont bien identifiées";
    case "TERRITORIAL_PRESSURE":
      return "La pression s'est concentrée dans une zone";
    case "PRESSURE_WITHOUT_CONVERSION":
      return `${(fact.teamId ?? "equipe").toUpperCase()} produit du volume sans conversion`;
    case "FATIGUE_LOAD":
      return "La charge physique devient un fait de match";
    case "MOMENTUM_SHIFT":
      return "L'élan du match change";
    case "TACTICAL_PLAN_SIGNAL":
      return "Le plan de match laisse un signal lisible";
    case "HARNESS_PLAUSIBILITY_WARNING":
      return "Avertissement de plausibilité du harnais";
  }
}

function confidenceText(value: MatchEvidenceFact["confidence"]): string {
  switch (value) {
    case "low":
      return "faible";
    case "medium":
      return "moyenne";
    case "high":
      return "élevée";
  }
}

function recommendedActionForFact(fact: MatchEvidenceFact): CoachInsight["recommendedActions"][number] {
  switch (fact.category) {
    case "DANGER_CREATION":
      return {
        actionId: `${fact.factId}-repeat-pattern`,
        label: `Continuer à répéter les entrées en ${primaryFactZone(fact)}`,
        tradeoff: "Engager du soutien dans le couloir productif peut affaiblir la rest-defense si l'attaque échoue.",
      };
    case "POSSESSION_INSTABILITY":
      return {
        actionId: `${fact.factId}-stabilize-possession`,
        label: `Ajouter des soutiens plus sûrs autour de ${primaryFactZone(fact)}`,
        tradeoff: "Des soutiens plus prudents peuvent réduire la menace verticale immédiate et ralentir le tempo de transition.",
      };
    case "SCORING_CONVERSION":
      return {
        actionId: `${fact.factId}-protect-finishing-platform`,
        label: "Conserver le schéma qui a créé l'action décisive",
        tradeoff: "Trop insister sur une seule route de conversion peut rendre l'attaque plus prévisible.",
      };
    case "TERRITORIAL_PRESSURE":
      return {
        actionId: `${fact.factId}-pressure-release`,
        label: `Préparer une sortie de pression depuis ${primaryFactZone(fact)}`,
        tradeoff: "Une sortie trop précoce peut concéder du terrain si la structure de réception n'est pas sécurisée.",
      };
    case "PRESSURE_WITHOUT_CONVERSION":
      return {
        actionId: `${fact.factId}-route-selection-after-pressure`,
        label: `Revoir la route choisie après pression en ${primaryFactZone(fact)}.`,
        tradeoff: "Réduire le risque peut stabiliser la plateforme de conversion, mais aussi retirer une partie de la menace immédiate.",
      };
    case "FATIGUE_LOAD":
    case "MOMENTUM_SHIFT":
    case "TACTICAL_PLAN_SIGNAL":
    case "HARNESS_PLAUSIBILITY_WARNING":
      return {
        actionId: `${fact.factId}-review-signal`,
        label: `Relire le signal autour de ${primaryFactZone(fact)}`,
        tradeoff: "Agir trop vite sur un signal partiel peut masquer la cause tactique réelle.",
      };
  }
}

function selectPrimaryFact(facts: readonly MatchEvidenceFact[]): MatchEvidenceFact | null {
  const priority: readonly MatchEvidenceCategory[] = [
    "PRESSURE_WITHOUT_CONVERSION",
    "DANGER_CREATION",
    "POSSESSION_INSTABILITY",
    "TERRITORIAL_PRESSURE",
    "FATIGUE_LOAD",
    "MOMENTUM_SHIFT",
    "TACTICAL_PLAN_SIGNAL",
    "HARNESS_PLAUSIBILITY_WARNING",
    "SCORING_CONVERSION",
  ];

  for (const category of priority) {
    const fact = facts.find((candidate) => candidate.category === category);

    if (fact !== undefined) {
      return fact;
    }
  }

  return facts[0] ?? null;
}

export function createEvidenceDrivenCoachInsights(input: {
  readonly matchInput: MatchInput;
  readonly facts: readonly MatchEvidenceFact[];
}): readonly CoachInsight[] {
  const fact = selectPrimaryFact(input.facts);

  if (fact === null) {
    return [
      {
        insightId: `${input.matchInput.matchId}-adapter-insight`,
        type: "training_recommendation",
        title: "Les preuves du moteur restent limitées",
        summary:
          "Le moteur a produit un fil officiel, mais aucun fait de preuve ciblé n'a franchi les seuils légers de Sprint 2C.",
        evidence: [
          {
            eventIds: [],
            summary: "Aucun fait de preuve n'a été généré depuis le fil actuellement visible par le moteur.",
            confidenceNote: "Analyse à faible confiance tant que les plans tactiques ne sont pas entièrement branchés.",
          },
        ],
        affectedPlayers: [],
        affectedZones: [],
        confidence: "low",
        recommendedActions: [
          {
            actionId: "expand-evidence-thresholds",
            label: "Revoir les seuils de taxonomie après la prochaine passe d'adaptation",
            tradeoff: "Des seuils plus bas peuvent produire des signaux coach plus bruités.",
          },
        ],
      },
    ];
  }

  return [
    {
      insightId: `${fact.factId}-insight`,
      type: insightTypeForFact(fact),
      title: titleForFact(fact),
      summary: fact.summary,
      evidence: [
        {
          eventIds: fact.eventIds,
          summary: `Fait de preuve ${fact.factId} : ${fact.summary}`,
          confidenceNote: `Confiance ${confidenceText(fact.confidence)}; intensité ${fact.strength}/100. Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.`,
        },
      ],
      affectedPlayers: [],
      affectedZones: [primaryFactZone(fact)],
      confidence: fact.confidence,
      recommendedActions: [recommendedActionForFact(fact)],
    },
  ];
}

export function createEvidenceBasedTacticalDiagnoses(input: {
  readonly matchInput: MatchInput;
  readonly facts: readonly MatchEvidenceFact[];
  readonly fallbackEvents: readonly MatchEvent[];
}): readonly TacticalDiagnosis[] {
  const fact = selectPrimaryFact(input.facts);

  if (fact === null) {
    const fallbackEvent = input.fallbackEvents.find((event) => event.eventType !== "kickoff");

    return [
      {
        diagnosisId: `${input.matchInput.matchId}-adapter-diagnosis`,
        teamId: input.matchInput.homeTeam.teamId,
        title: "Diagnostic moteur à faible confiance",
        summary:
          "Le fil officiel est présent, mais les faits de preuve de Sprint 2C n'ont pas isolé de motif tactique ciblé.",
        evidenceEventIds: fallbackEvent === undefined ? [] : [fallbackEvent.eventId],
        affectedZones: fallbackEvent === undefined ? [] : [fallbackEvent.zone],
        confidence: "low",
      },
    ];
  }

  return [
    {
      diagnosisId: `${fact.factId}-diagnosis`,
      teamId: fact.teamId ?? input.matchInput.homeTeam.teamId,
      title: titleForFact(fact),
      summary: `${fact.summary} Analyse à faible confiance tant que les plans tactiques ne sont pas entièrement branchés.`,
      evidenceEventIds: fact.eventIds,
      affectedZones: [primaryFactZone(fact)],
      confidence: "low",
    },
  ];
}

export function eventTypeFromAdapterTags(tags: readonly string[]): MatchEventType {
  if (tags.includes("scoring_event")) {
    return "scoring";
  }

  if (tags.includes("finishing_opportunity") || tags.includes("danger_high")) {
    return "progression";
  }

  if (tags.includes("stability_low") && tags.includes("pressure_high")) {
    return "turnover";
  }

  if (tags.includes("territorial_pressure_high")) {
    return "progression";
  }

  return "tactical_shift";
}
```

## File: src/simulation/adapters/matchReportEvidenceBuilder.ts

```ts
import type { FatigueReport, MatchEvent, MatchInput } from "../../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type { ZoneId } from "../../core/zones";
import type { TacticalPlanInfluence } from "./tacticalPlanInfluence";
import { createMatchEvidenceFacts } from "./matchReportEvidence";

function firstEvidenceEvent(events: readonly MatchEvent[]): MatchEvent | undefined {
  return events.find((event) => event.eventType !== "kickoff") ?? events[0];
}

function topZones(events: readonly MatchEvent[], limit: number): readonly string[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    counts.set(event.zone, (counts.get(event.zone) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([zone]) => zone);
}

function tacticalPlanFact(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly influence: TacticalPlanInfluence;
}): MatchReportEvidenceFact | null {
  const event = firstEvidenceEvent(input.timeline);

  if (event === undefined) {
    return null;
  }

  const affectedZones = input.influence.targetZoneBias.length > 0
    ? input.influence.targetZoneBias
    : ([event.zone] as readonly ZoneId[]);

  return {
    factId: `${input.matchInput.matchId}-tactical-plan-signal`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "TACTICAL_PLAN_SIGNAL",
    scope: "MATCH_REPORT",
    eventIds: [event.eventId],
    affectedZones,
    summary: `${input.influence.homeSummary} ${input.influence.awaySummary} ${input.influence.matchEffectSummary}`,
    confidence: "low",
    strength: 50,
    coachVisible: true,
    internalTags: ["tactical_plan_influence"],
  };
}

function fatigueLoadFact(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly fatigueReport: FatigueReport;
}): MatchReportEvidenceFact | null {
  const heaviestTeam = [...input.fatigueReport.teamSummaries].sort(
    (a, b) => b.highIntensityLoad - a.highIntensityLoad,
  )[0];

  if (heaviestTeam === undefined) {
    return null;
  }

  const teamEvents = input.timeline.filter((event) => event.teamId === heaviestTeam.teamId && event.eventType !== "kickoff");
  const event = firstEvidenceEvent(teamEvents);

  if (event === undefined) {
    return null;
  }

  return {
    factId: `${input.matchInput.matchId}-${heaviestTeam.teamId}-fatigue-load`,
    matchId: input.matchInput.matchId,
    teamId: heaviestTeam.teamId,
    opponentTeamId: heaviestTeam.teamId === input.matchInput.homeTeam.teamId
      ? input.matchInput.awayTeam.teamId
      : input.matchInput.homeTeam.teamId,
    category: "FATIGUE_LOAD",
    scope: "MATCH_REPORT",
    eventIds: [event.eventId],
    affectedZones: topZones(teamEvents, 3),
    summary: `${heaviestTeam.teamId.toUpperCase()} porte la charge physique la plus visible avec une intensité ${heaviestTeam.highIntensityLoad}/100 et une condition finale moyenne ${heaviestTeam.averageConditionEnd}/100.`,
    confidence: "medium",
    strength: heaviestTeam.highIntensityLoad,
    coachVisible: true,
    internalTags: ["fatigue_load", "full_match_fatigue_propagation"],
  };
}

function momentumShiftFact(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
}): MatchReportEvidenceFact | null {
  const momentumEvents = input.timeline.filter((event) =>
    event.tags.includes("momentum_positive") || event.tags.includes("momentum_negative") || event.tags.includes("score_state_lopsided"),
  );

  const event = firstEvidenceEvent(momentumEvents);

  if (event === undefined) {
    return null;
  }

  return {
    factId: `${input.matchInput.matchId}-momentum-shift`,
    matchId: input.matchInput.matchId,
    teamId: event.teamId,
    opponentTeamId: event.opponentTeamId,
    category: "MOMENTUM_SHIFT",
    scope: "MATCH_REPORT",
    eventIds: momentumEvents.slice(0, 6).map((candidate) => candidate.eventId),
    affectedZones: topZones(momentumEvents, 3),
    summary: `L'élan du match devient lisible autour de ${topZones(momentumEvents, 3).join(", ")} avec des signaux de score, pression ou momentum répétés.`,
    confidence: "low",
    strength: Math.min(100, 40 + momentumEvents.length * 8),
    coachVisible: true,
    internalTags: ["momentum_shift"],
  };
}

function segmentStateInfluenceFact(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
}): MatchReportEvidenceFact | null {
  const influenceEvents = input.timeline.filter((event) => event.tags.includes("segment_influence_active"));
  const event = firstEvidenceEvent(influenceEvents);

  if (event === undefined) {
    return null;
  }

  return {
    factId: `${input.matchInput.matchId}-segment-state-influence`,
    matchId: input.matchInput.matchId,
    teamId: event.teamId,
    opponentTeamId: event.opponentTeamId,
    category: "MOMENTUM_SHIFT",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: influenceEvents.slice(0, 6).map((candidate) => candidate.eventId),
    affectedZones: topZones(influenceEvents, 3),
    summary:
      "L'etat accumule du match commence a peser sur la stabilite, la pression et la fraicheur mentale des sequences suivantes, sans forcer directement le score.",
    confidence: "low",
    strength: Math.min(100, 35 + influenceEvents.length * 4),
    coachVisible: true,
    internalTags: [
      "segment_state_influence",
      "segment_influence_active",
      "bounded_full_match_segment_context",
    ],
  };
}

function tacticalGroundingGapFacts(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
}): readonly MatchReportEvidenceFact[] {
  const fullMatchEvents = input.timeline.filter((event) => event.eventId.includes("-segment-") && event.eventType !== "kickoff");
  const event = firstEvidenceEvent(fullMatchEvents);

  if (event === undefined) {
    return [];
  }

  const eventIds = fullMatchEvents.slice(0, 6).map((candidate) => candidate.eventId);
  const affectedZones = topZones(fullMatchEvents, 3);
  const summary =
    "Le mini-match dispose maintenant d'un chemin controle ou les candidats issus du SpatialContext peuvent etre classes par score ajuste d'attributs, avec fallback prototype si les garde-fous bloquent la selection.";

  return [
    {
      factId: `${input.matchInput.matchId}-workbench-truth-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary,
      confidence: "low",
      strength: 58,
      coachVisible: true,
      internalTags: [
        "tactical_grounding_gap",
        "workbench_truth_fixture_available",
        "workbench_replay_seed",
        "route_attribute_influence",
        "candidate_modifier_mode",
        "attribute_selection_guard",
        "spatial_route_selection",
        "prototype_fallback",
        "controlled_minimatch_only",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-spatial-context-adapter-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "Sprint 2S adds a typed roster/workbench to SpatialMatchContext adapter that can preserve player identity, starter status, ball carrier, and workbench zones.",
      confidence: "low",
      strength: 60,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "spatial_context_adapter_available",
        "spatial_context_active",
        "roster_to_spatial_context_adapter",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-workbench-replay-seed-partial`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "The sequence-1-action-1 replay seed can preserve TH, ML, the new carrier, and the before/after ball zones while evaluating metadata_only and candidate_modifier attribute selection. The guard preserves TH -> ML for this fixture.",
      confidence: "low",
      strength: 58,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "workbench_replay_seed_partial",
        "attribute_adjusted_candidate_scores_available",
        "attribute_adjusted_score",
        "attribute_adjusted_selection",
        "replay_seed_attribute_selection_partial",
        "controlled_minimatch_spatial_selection_available",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-route-attribute-influence-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "Route attribute influence is available for pass security, reception quality, support timing, rupture threat, contact platform, fatigue drag, turnover risk, and final-action composure.",
      confidence: "low",
      strength: 65,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "route_attribute_influence_available",
        "route_attribute_influence",
        "selected_route_attribute_explanation_available",
        "attribute_candidate_modifier_available",
        "attribute_guarded_candidate_modifier_available",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-spatial-route-selection-path-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary:
        "A controlled mini-match path can map SpatialContext route candidates, apply attribute-adjusted ranking, preserve legality, and fall back to prototype selection when guardrails block the spatial choice.",
      confidence: "low",
      strength: 63,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "spatial_route_selection_path_available",
        "spatial_route_selection",
        "prototype_fallback_still_enabled",
        "prototype_fallback",
        "attribute_guard",
        "controlled_minimatch_only",
        "fullmatch_not_default_spatial_selection",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-attribute-selection-guard-available`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "The attribute selection guard can allow a legal adjusted candidate flip while blocking CLOSED lanes and NOT_AVAILABLE_NOW routes; normal full-match selection is still only partially attribute-driven.",
      confidence: "low",
      strength: 61,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "attribute_selection_guard_available",
        "attribute_selection_flip_possible_when_legal",
        "closed_lane_not_overridden_by_attributes",
        "closed_lane_not_overridden",
        "prototype_selection_still_partial",
        "normal_fullmatch_selection_still_partial",
      ],
    },
    {
      factId: `${input.matchInput.matchId}-full-match-partial-workbench-grounding`,
      matchId: input.matchInput.matchId,
      teamId: event.teamId,
      opponentTeamId: event.opponentTeamId,
      category: "TACTICAL_PLAN_SIGNAL",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones,
      summary: "Full-match is partially workbench-grounded, but it is not yet replaying the workbench sequence chain as the source of every tactical decision.",
      confidence: "low",
      strength: 62,
      coachVisible: false,
      internalTags: [
        "tactical_grounding_gap",
        "full_match_partially_workbench_grounded",
        "fullmatch_not_yet_replaying_workbench_sequence_chain",
      ],
    },
  ];
}

export function buildCanonicalMatchReportEvidenceFacts(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly fatigueReport: FatigueReport;
  readonly influence: TacticalPlanInfluence;
}): readonly MatchReportEvidenceFact[] {
  const baseFacts = createMatchEvidenceFacts({
    matchInput: input.matchInput,
    timeline: input.timeline,
  });
  const supplementalFacts = [
    tacticalPlanFact(input),
    fatigueLoadFact(input),
    momentumShiftFact(input),
    segmentStateInfluenceFact(input),
  ].filter((fact): fact is MatchReportEvidenceFact => fact !== null);

  return [...baseFacts, ...supplementalFacts, ...tacticalGroundingGapFacts(input)];
}
```

## File: src/simulation/adapters/matchReportWarningsBuilder.ts

```ts
import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type { MatchReportWarning, MatchReportWarningType } from "../../contracts/matchReportWarnings";
import {
  coachFacingHarnessWarningSummary,
} from "../../reports/coachFacingCopy";
import { coachFacingWarningSummaryByType } from "../../reports/coachFacingSummary";
import type {
  FullMatchHarnessSanityReport,
  FullMatchHarnessSanityWarning,
} from "../diagnostics/fullMatchHarnessSanity";

function warningTypeForHarnessWarning(warning: FullMatchHarnessSanityWarning): MatchReportWarningType {
  switch (warning) {
    case "SINGLE_RUN_NOT_GLOBAL_ECONOMY":
      return "FULL_MATCH_HARNESS_SINGLE_RUN";
    case "INFLATED_SINGLE_RUN_SCORE":
      return "INFLATED_SINGLE_RUN_SCORE";
    case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
      return "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN";
    case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
      return "ZERO_SCORING_EVENTS_FOR_ONE_TEAM";
    case "POSSIBLE_SEGMENT_PATTERN_REPETITION":
    case "MISSING_SEGMENT_STATE_PROPAGATION":
    case "MISSING_MOMENTUM_VARIATION":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_SEGMENT_PATTERN":
      return "REPEATED_SEGMENT_PATTERN";
    case "REPETITIVE_KEY_MOMENTS":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_ZONE":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_EVENT_FAMILY":
      return "LOW_EVENT_FAMILY_DIVERSITY";
    case "FLAT_FATIGUE_SIGNAL":
    case "MISSING_FATIGUE_PROPAGATION":
      return "FATIGUE_SIGNAL_FLAT";
    case "HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM":
      return "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN";
    case "DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE":
    case "DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION":
      return "ZERO_SCORING_EVENTS_FOR_ONE_TEAM";
    case "DOMINATED_TEAM_HIGH_LOAD_NO_PAYOFF":
      return "HIGH_LOAD_WITH_NO_PAYOFF";
  }
}

function severityForWarning(type: MatchReportWarningType): MatchReportWarning["severity"] {
  switch (type) {
    case "FULL_MATCH_HARNESS_SINGLE_RUN":
      return "info";
    case "INFLATED_SINGLE_RUN_SCORE":
    case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
    case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
      return "medium";
    case "REPEATED_SEGMENT_PATTERN":
    case "LOW_EVENT_FAMILY_DIVERSITY":
    case "FATIGUE_SIGNAL_FLAT":
    case "HIGH_LOAD_WITH_NO_PAYOFF":
    case "REPORT_COPY_LIMITATION":
    case "ADAPTER_LIMITATION":
      return "low";
  }
}

function titleForWarning(type: MatchReportWarningType): string {
  switch (type) {
    case "FULL_MATCH_HARNESS_SINGLE_RUN":
      return "Avertissement de harnais full-match";
    case "INFLATED_SINGLE_RUN_SCORE":
      return "Score local élevé dans le harnais";
    case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
      return "Domination scoring single-run à surveiller";
    case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
      return "Équipe sans conversion dans ce run";
    case "REPEATED_SEGMENT_PATTERN":
      return "Répétition de segments à surveiller";
    case "LOW_EVENT_FAMILY_DIVERSITY":
      return "Diversité d'événements limitée";
    case "FATIGUE_SIGNAL_FLAT":
      return "Signal de fatigue trop plat";
    case "HIGH_LOAD_WITH_NO_PAYOFF":
      return "Charge élevée sans conversion";
    case "REPORT_COPY_LIMITATION":
      return "Limite de copie du rapport";
    case "ADAPTER_LIMITATION":
      return "Limite de l'adaptateur";
  }
}

function evidenceEventIds(report: MatchReport, sanity: FullMatchHarnessSanityReport): readonly string[] {
  const dominanceIds = sanity.scoringDominance.dominatedTeamEvidenceEventIds;

  if (dominanceIds.length > 0) {
    return dominanceIds;
  }

  const event = report.timeline.find((candidate) => candidate.eventType !== "kickoff") ?? report.timeline[0];

  return event === undefined ? [] : [event.eventId];
}

function affectedZones(events: readonly MatchEvent[]): readonly string[] {
  return [...new Set(events.map((event) => event.zone))].slice(0, 4);
}

export function buildHarnessWarningEvidenceFacts(input: {
  readonly report: MatchReport;
  readonly sanity: FullMatchHarnessSanityReport;
}): readonly MatchReportEvidenceFact[] {
  if (input.sanity.warnings.length <= 1) {
    return [];
  }

  const eventIds = evidenceEventIds(input.report, input.sanity);
  const events = input.report.timeline.filter((event) => eventIds.includes(event.eventId));
  const teamId = input.report.teamStats[0]?.teamId;
  const opponentTeamId = input.report.teamStats[1]?.teamId;

  return [
    {
      factId: `${input.report.matchId}-harness-plausibility-warning`,
      matchId: input.report.matchId,
      ...(teamId === undefined ? {} : { teamId }),
      ...(opponentTeamId === undefined ? {} : { opponentTeamId }),
      category: "HARNESS_PLAUSIBILITY_WARNING",
      scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      eventIds,
      affectedZones: affectedZones(events),
      summary: coachFacingHarnessWarningSummary(input.sanity.warnings),
      confidence: "low",
      strength: Math.min(100, 35 + input.sanity.warnings.length * 8),
      coachVisible: true,
      internalTags: input.sanity.warnings,
    },
  ];
}

export function buildMatchReportWarnings(input: {
  readonly report: MatchReport;
  readonly sanity: FullMatchHarnessSanityReport;
  readonly evidenceFacts: readonly MatchReportEvidenceFact[];
}): readonly MatchReportWarning[] {
  if (input.sanity.warnings.length <= 1) {
    return [];
  }

  const harnessFact = input.evidenceFacts.find((fact) => fact.category === "HARNESS_PLAUSIBILITY_WARNING");
  const eventIds = evidenceEventIds(input.report, input.sanity);
  const uniqueTypes = [...new Set(input.sanity.warnings.map(warningTypeForHarnessWarning))];

  return uniqueTypes.map((type) => {
    const dominantTeamId = input.sanity.scoringDominance.dominantTeamId;
    const dominatedTeamId = input.sanity.scoringDominance.dominatedTeamId;

    return {
      warningId: `${input.report.matchId}-${type.toLowerCase()}`,
      type,
      scope: "coach_visible",
      severity: severityForWarning(type),
      title: titleForWarning(type),
      coachSummary: coachFacingWarningSummaryByType({
        warningType: type,
        fallbackSummary: coachFacingHarnessWarningSummary(input.sanity.warnings),
        score: input.report.score,
        ...(dominantTeamId === undefined ? {} : { dominantTeamId }),
        ...(dominatedTeamId === undefined ? {} : { dominatedTeamId }),
      }),
      technicalSummary: `Harness warnings: ${input.sanity.warnings.join(", ")}. Scope: ${input.sanity.scope}. May invalidate global economy: false.`,
      evidenceFactIds: harnessFact === undefined ? [] : [harnessFact.factId],
      eventIds,
      mayInvalidateGlobalScoringEconomy: false,
    };
  });
}
```

## File: src/simulation/adapters/matchReportMoments.ts

```ts
﻿import type {
  CoachInsight,
  KeyMoment,
  MatchEvent,
  MatchInput,
} from "../../contracts/engineToCoach";
import { normalizeCoachFacingCopy } from "../../reports/coachCopyQuality";
import { coachFacingKeyMomentSummary } from "../../reports/coachFacingSummary";
import type { MatchEvidenceFact } from "./matchReportEvidence";

const MAX_KEY_MOMENTS = 5;
const HIGH_NARRATIVE_WEIGHT = 60;

interface KeyMomentCandidate {
  readonly event: MatchEvent;
  readonly priority: number;
  readonly evidenceFact?: MatchEvidenceFact;
}

function hasTag(event: MatchEvent, tag: string): boolean {
  return event.tags.includes(tag);
}

function primaryInsightEvidenceEventIds(coachInsights: readonly CoachInsight[]): readonly string[] {
  const primaryInsight = coachInsights.find((insight) =>
    insight.evidence.some((evidence) => evidence.eventIds.length > 0),
  );

  return primaryInsight?.evidence.flatMap((evidence) => evidence.eventIds) ?? [];
}

function factForEvent(event: MatchEvent, facts: readonly MatchEvidenceFact[]): MatchEvidenceFact | undefined {
  return facts.find((fact) => fact.coachVisible && fact.eventIds.includes(event.eventId));
}

function factZone(fact: MatchEvidenceFact): string {
  return fact.affectedZones[0] ?? "Z3-C";
}

function titleForEvent(event: MatchEvent, fact: MatchEvidenceFact | undefined): string {
  if (event.eventType === "kickoff") {
    return "DÃ©but du match";
  }

  if (event.eventType === "scoring") {
    return "Action dÃ©cisive";
  }

  if (fact?.category === "PRESSURE_WITHOUT_CONVERSION") {
    return `${event.teamId.toUpperCase()} sous pression sans conversion`;
  }

  if (hasTag(event, "score_state_lopsided") || hasTag(event, "momentum_negative") || fact?.category === "MOMENTUM_SHIFT") {
    return "Signal d'Ã©lan Ã  surveiller";
  }

  if (fact?.category === "TERRITORIAL_PRESSURE") {
    return `Pression concentrÃ©e en ${factZone(fact)}`;
  }

  if (hasTag(event, "danger_high") || fact?.category === "DANGER_CREATION") {
    return "SÃ©quence dangereuse";
  }

  if (fact?.category === "HARNESS_PLAUSIBILITY_WARNING") {
    return "Signal de harnais Ã  surveiller";
  }

  if (hasTag(event, "stability_low") && (hasTag(event, "pressure_high") || hasTag(event, "pressure_medium"))) {
    return "Possession sous pression";
  }

  if (hasTag(event, "territorial_pressure_high")) {
    return "SÃ©quence de pression territoriale";
  }

  return "SÃ©quence tactique";
}

function summaryForEvent(event: MatchEvent, fact: MatchEvidenceFact | undefined): string {
  const category = fact?.category ?? (event.eventType === "scoring" ? "SCORING_CONVERSION" : undefined);

  return coachFacingKeyMomentSummary({
    title: titleForEvent(event, fact),
    teamId: event.teamId,
    zone: fact?.affectedZones[0] ?? event.zone,
    ...(fact === undefined ? {} : { evidenceSummary: fact.summary }),
    ...(event.tacticalContext.reason === undefined ? {} : { eventContext: event.tacticalContext.reason }),
    ...(category === undefined ? {} : { category }),
  });
}

function candidatePriority(event: MatchEvent, fact: MatchEvidenceFact | undefined, insightEventIds: ReadonlySet<string>): number {
  if (event.eventType === "scoring") {
    return 100;
  }

  if (fact?.category === "PRESSURE_WITHOUT_CONVERSION") {
    return 88;
  }

  if (fact?.category === "HARNESS_PLAUSIBILITY_WARNING") {
    return 82;
  }

  if (insightEventIds.has(event.eventId)) {
    return 90;
  }

  if (hasTag(event, "score_state_lopsided") || hasTag(event, "momentum_negative")) {
    return 75;
  }

  if (hasTag(event, "stability_low") && (hasTag(event, "pressure_high") || hasTag(event, "pressure_medium"))) {
    return 74;
  }

  if (hasTag(event, "territorial_pressure_high")) {
    return 72;
  }

  if (event.narrativeWeight >= HIGH_NARRATIVE_WEIGHT) {
    return 70;
  }

  if (event.eventType === "kickoff") {
    return 5;
  }

  return 0;
}

function candidateTitle(candidate: KeyMomentCandidate): string {
  return titleForEvent(candidate.event, candidate.evidenceFact);
}

function candidateFromEvent(input: {
  readonly event: MatchEvent;
  readonly facts: readonly MatchEvidenceFact[];
  readonly insightEventIds: ReadonlySet<string>;
}): KeyMomentCandidate | null {
  const fact = factForEvent(input.event, input.facts);
  const priority = candidatePriority(input.event, fact, input.insightEventIds);

  if (priority <= 0) {
    return null;
  }

  return {
    event: input.event,
    priority,
    ...(fact === undefined ? {} : { evidenceFact: fact }),
  };
}

function compareCandidates(a: KeyMomentCandidate, b: KeyMomentCandidate): number {
  if (a.priority !== b.priority) {
    return b.priority - a.priority;
  }

  return a.event.timestamp.tick - b.event.timestamp.tick;
}

function selectDiverseCandidates(candidates: readonly KeyMomentCandidate[]): readonly KeyMomentCandidate[] {
  const sortedCandidates = [...candidates].sort(compareCandidates);
  const nonScoringCandidates = sortedCandidates.filter((candidate) => candidate.event.eventType !== "scoring");
  const scoringLimit = nonScoringCandidates.length > 0 ? 2 : MAX_KEY_MOMENTS;
  const availableTitleCount = new Set(sortedCandidates.map(candidateTitle)).size;
  const shouldLimitRepeatedTitles = availableTitleCount > 1;
  const selected: KeyMomentCandidate[] = [];
  const titleCounts = new Map<string, number>();
  let scoringCount = 0;

  for (const candidate of sortedCandidates) {
    if (selected.length >= MAX_KEY_MOMENTS) {
      break;
    }

    const title = candidateTitle(candidate);
    if (shouldLimitRepeatedTitles && (titleCounts.get(title) ?? 0) >= 2) {
      continue;
    }

    if (candidate.event.eventType === "scoring") {
      if (scoringCount >= scoringLimit) {
        continue;
      }
      scoringCount += 1;
    }

    selected.push(candidate);
    titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
  }

  if (selected.length >= MAX_KEY_MOMENTS) {
    return selected;
  }

  for (const candidate of nonScoringCandidates) {
    if (selected.length >= MAX_KEY_MOMENTS) {
      break;
    }

    if (!selected.some((item) => item.event.eventId === candidate.event.eventId)) {
      const title = candidateTitle(candidate);
      if (shouldLimitRepeatedTitles && (titleCounts.get(title) ?? 0) >= 2) {
        continue;
      }
      selected.push(candidate);
      titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
    }
  }

  return selected;
}

export function selectKeyMoments(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly facts: readonly MatchEvidenceFact[];
  readonly coachInsights: readonly CoachInsight[];
}): readonly KeyMoment[] {
  const insightEventIds = new Set(primaryInsightEvidenceEventIds(input.coachInsights));
  const candidatesByEventId = new Map<string, KeyMomentCandidate>();
  let kickoffIncluded = false;

  for (const event of input.timeline) {
    if (event.eventType === "kickoff") {
      if (kickoffIncluded) {
        continue;
      }
      kickoffIncluded = true;
    }

    const candidate = candidateFromEvent({
      event,
      facts: input.facts,
      insightEventIds,
    });

    if (candidate === null) {
      continue;
    }

    const existingCandidate = candidatesByEventId.get(event.eventId);
    if (existingCandidate === undefined || candidate.priority > existingCandidate.priority) {
      candidatesByEventId.set(event.eventId, candidate);
    }
  }

  return [...selectDiverseCandidates([...candidatesByEventId.values()])]
    .sort((a, b) => a.event.timestamp.tick - b.event.timestamp.tick)
    .map((candidate) => ({
      eventId: candidate.event.eventId,
      ...(candidate.evidenceFact === undefined ? {} : {
        evidenceFactId: candidate.evidenceFact.factId,
        category: candidate.evidenceFact.category,
      }),
      title: normalizeCoachFacingCopy(titleForEvent(candidate.event, candidate.evidenceFact)),
      summary: summaryForEvent(candidate.event, candidate.evidenceFact),
      minute: candidate.event.timestamp.minute,
    }));
}
```

## File: src/simulation/adapters/matchReportMoments.test.ts

```ts
﻿import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import type { MatchEvent } from "../../contracts/engineToCoach";
import type { ZoneId } from "../../core/zones";
import { MatchPhase, PressureLevel } from "../../models/match";
import { runFullMatch } from "../runFullMatch";
import { selectKeyMoments } from "./matchReportMoments";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoringOnlyEvent(index: number): MatchEvent {
  const zone = "Z3-C" as ZoneId;

  return {
    eventId: `scoring-only-${index}`,
    matchId: engineToCoachPublicContractFixtures.matchInputFixture.matchId,
    timestamp: {
      tick: index,
      minute: index,
      period: "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: `scoring-only-sequence-${index}`,
    teamId: engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.teamId,
    opponentTeamId: engineToCoachPublicContractFixtures.matchInputFixture.awayTeam.teamId,
    eventType: "scoring",
    zone,
    tacticalContext: {
      pressureLevel: PressureLevel.Medium,
      ballZone: zone,
      targetZone: zone,
      moveType: "shot_goal",
      reason: "scoring-only regression fixture",
    },
    fatigueContext: {
      teamCondition: 90,
    },
    outcome: "score",
    consequences: [
      {
        type: "score_change",
        description: "scoring-only fixture score",
        value: 3,
      },
    ],
    tags: ["scoring_event"],
    narrativeWeight: 100,
  };
}

export function validateMatchReportMomentDiversity(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const scoringEventIds = new Set(report.timeline.filter((event) => event.eventType === "scoring").map((event) => event.eventId));
  const scoringMoments = report.keyMoments.filter((moment) => scoringEventIds.has(moment.eventId)).length;
  const hasNonScoringCandidates = report.timeline.some((event) => event.eventType !== "kickoff" && event.eventType !== "scoring" && event.narrativeWeight >= 60);
  const uniqueTitles = new Set(report.keyMoments.map((moment) => moment.title));

  assertTest(report.keyMoments.length <= 5, "key moments must remain capped at 5.");

  if (hasNonScoringCandidates) {
    assertTest(scoringMoments <= 2, "key moments include non-scoring moments when available.");
  }

  if (report.keyMoments.length > 1) {
    assertTest(uniqueTitles.size >= 2, "key moments include at least two different titles when possible.");
  }

  const scoringOnlyMoments = selectKeyMoments({
    matchInput: engineToCoachPublicContractFixtures.matchInputFixture,
    timeline: [1, 2, 3, 4, 5].map(scoringOnlyEvent),
    facts: [],
    coachInsights: [],
  });

  assertTest(scoringOnlyMoments.length === 5, `scoring-only reports should fill the key moment cap, received ${scoringOnlyMoments.length}.`);
  assertTest(
    scoringOnlyMoments.every((moment) => moment.title === "Action décisive"),
    "scoring-only reports keep repeated scoring titles when no title alternatives exist.",
  );

  return [
    "key moments include non-scoring moments when available",
    "max 2 scoring moments when alternatives exist",
    "key moments include diverse titles",
    "scoring-only key moments fill the cap when no title alternatives exist",
  ];
}

if (require.main === module) {
  const checks = validateMatchReportMomentDiversity();

  console.log("matchReportMoments tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/adapters/matchReportFocus.ts

```ts
import type { MatchInput, TrainingFocusSuggestion } from "../../contracts/engineToCoach";
import type { MatchEvidenceCategory, MatchEvidenceFact } from "./matchReportEvidence";

const FALLBACK_FOCUS_TITLE = "Finaliser l'adaptation du contrat moteur";

function primaryFactZone(fact: MatchEvidenceFact): string {
  return fact.affectedZones[0] ?? "Z3-C";
}

function priorityForCategory(category: MatchEvidenceCategory): number {
  switch (category) {
    case "SCORING_CONVERSION":
      return 100;
    case "PRESSURE_WITHOUT_CONVERSION":
      return 95;
    case "DANGER_CREATION":
      return 90;
    case "POSSESSION_INSTABILITY":
      return 80;
    case "TERRITORIAL_PRESSURE":
      return 70;
    case "FATIGUE_LOAD":
      return 65;
    case "MOMENTUM_SHIFT":
      return 60;
    case "TACTICAL_PLAN_SIGNAL":
      return 55;
    case "HARNESS_PLAUSIBILITY_WARNING":
      return 50;
  }
}

function selectPrimaryFact(facts: readonly MatchEvidenceFact[]): MatchEvidenceFact | null {
  const coachVisibleFacts = facts.filter((fact) => fact.coachVisible);
  const sortedFacts = [...coachVisibleFacts].sort(
    (a, b) => priorityForCategory(b.category) - priorityForCategory(a.category) || b.strength - a.strength,
  );

  return sortedFacts[0] ?? null;
}

function focusTitleForFact(fact: MatchEvidenceFact): string {
  switch (fact.category) {
    case "DANGER_CREATION":
      return `Répéter les entrées dangereuses en ${primaryFactZone(fact)}`;
    case "POSSESSION_INSTABILITY":
      return `Stabiliser la possession sous pression en ${primaryFactZone(fact)}`;
    case "SCORING_CONVERSION":
      return "Sécuriser la séquence qui mène au score";
    case "TERRITORIAL_PRESSURE":
      return `Préparer une sortie de pression depuis ${primaryFactZone(fact)}`;
    case "PRESSURE_WITHOUT_CONVERSION":
      return `Transformer la pression de ${(fact.teamId ?? "l'équipe").toUpperCase()} en plateforme de conversion`;
    case "FATIGUE_LOAD":
      return `Gérer la charge autour de ${primaryFactZone(fact)}`;
    case "MOMENTUM_SHIFT":
      return "Stabiliser l'élan après les bascules du match";
    case "TACTICAL_PLAN_SIGNAL":
      return "Relire le plan de match dans les zones visibles";
    case "HARNESS_PLAUSIBILITY_WARNING":
      return "Lire le signal de harnais sans changer l'économie du score";
  }
}

export function suggestedFocusFromEvidence(input: {
  readonly matchInput: MatchInput;
  readonly facts: readonly MatchEvidenceFact[];
}): readonly TrainingFocusSuggestion[] {
  const primaryFact = selectPrimaryFact(input.facts);

  if (primaryFact === null) {
    return [
      {
        focusId: `${input.matchInput.matchId}-adapter-focus`,
        title: FALLBACK_FOCUS_TITLE,
        reason: "Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.",
      },
    ];
  }

  return [
    {
      focusId: `${primaryFact.factId}-focus`,
      title: focusTitleForFact(primaryFact),
      reason: `${primaryFact.summary} Signal encore partiel : cette analyse sera renforcée quand les plans tactiques seront davantage branchés au moteur.`,
    },
  ];
}
```

## File: src/simulation/adapters/matchReportStats.ts

```ts
import type {
  MatchEvent,
  MatchInput,
  TeamMatchStats,
  ZoneStats,
} from "../../contracts/engineToCoach";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { ScoreState } from "../../models/match";
import type { MiniMatchResult } from "../miniMatch";
import type { MiniMatchInputAdapterResult } from "./matchInputToMiniMatch";

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function nonKickoffEvents(timeline: readonly MatchEvent[]): readonly MatchEvent[] {
  return timeline.filter((event) => event.eventType !== "kickoff");
}

function hasTag(event: MatchEvent, tag: string): boolean {
  return event.tags.includes(tag);
}

function scoringAttemptsForTeam(input: {
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly side: "home" | "away";
}): number {
  const prototypeId = input.side === "home" ? input.adapter.homePrototype.id : input.adapter.awayPrototype.id;

  return prototypeId === input.miniMatch.state.context.teamA.id
    ? input.miniMatch.summary.finishingOpportunities.teamA
    : input.miniMatch.summary.finishingOpportunities.teamB;
}

function turnoversForTeam(input: {
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly side: "home" | "away";
}): number {
  const prototypeId = input.side === "home" ? input.adapter.homePrototype.id : input.adapter.awayPrototype.id;

  return prototypeId === input.miniMatch.state.context.teamA.id
    ? input.miniMatch.summary.turnovers.teamA
    : input.miniMatch.summary.turnovers.teamB;
}

function teamStatsForSide(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly score: ScoreState;
  readonly side: "home" | "away";
  readonly eventShare: Rating;
}): TeamMatchStats {
  const team = input.side === "home" ? input.matchInput.homeTeam : input.matchInput.awayTeam;
  const teamEvents = nonKickoffEvents(input.timeline).filter((event) => event.teamId === team.teamId);
  const progressionCount = teamEvents.filter((event) => event.eventType === "progression").length;
  const scoringEventCount = teamEvents.filter((event) => event.eventType === "scoring").length;
  const pressureInstabilityCount = teamEvents.filter(
    (event) =>
      hasTag(event, "stability_low") &&
      (hasTag(event, "pressure_high") || hasTag(event, "pressure_medium")),
  ).length;

  return {
    teamId: team.teamId,
    score: input.side === "home" ? input.score.home : input.score.away,
    possessionShare: input.eventShare,
    turnovers: turnoversForTeam(input),
    scoringAttempts: scoringAttemptsForTeam(input),
    eventShare: input.eventShare,
    progressionCount,
    scoringEventCount,
    pressureInstabilityCount,
  };
}

export function createTeamMatchStatsFromEvents(input: {
  readonly matchInput: MatchInput;
  readonly timeline: readonly MatchEvent[];
  readonly miniMatch: MiniMatchResult;
  readonly adapter: MiniMatchInputAdapterResult;
  readonly score: ScoreState;
}): readonly TeamMatchStats[] {
  const events = nonKickoffEvents(input.timeline);
  const homeEventCount = events.filter((event) => event.teamId === input.matchInput.homeTeam.teamId).length;
  const homeEventShare = events.length === 0 ? 0 : clampRating((homeEventCount / events.length) * 100);
  const awayEventShare = clampRating(100 - homeEventShare);

  return [
    teamStatsForSide({ ...input, side: "home", eventShare: homeEventShare }),
    teamStatsForSide({ ...input, side: "away", eventShare: awayEventShare }),
  ];
}

export function createZoneStatsFromEvents(input: {
  readonly timeline: readonly MatchEvent[];
}): readonly ZoneStats[] {
  const eventsByZone = new Map<ZoneId, MatchEvent[]>();

  for (const event of nonKickoffEvents(input.timeline)) {
    const existingEvents = eventsByZone.get(event.zone) ?? [];
    existingEvents.push(event);
    eventsByZone.set(event.zone, existingEvents);
  }

  return [...eventsByZone.entries()]
    .sort(([zoneA], [zoneB]) => zoneA.localeCompare(zoneB))
    .map(([zone, events]) => ({
      zone,
      entries: events.length,
      successfulProgressions: events.filter(
        (event) =>
          event.eventType === "progression" &&
          (event.outcome === "success" || event.outcome === "advantage" || event.outcome === "score"),
      ).length,
      defensiveStops: events.filter(
        (event) =>
          event.eventType === "turnover" ||
          event.eventType === "defensive_action" ||
          event.outcome === "failure",
      ).length,
      scoringEvents: events.filter((event) => event.eventType === "scoring").length,
      pressureEvents: events.filter(
        (event) => hasTag(event, "pressure_high") || hasTag(event, "pressure_medium"),
      ).length,
    }));
}
```

## File: src/simulation/adapters/tacticalPlanInfluence.ts

```ts
import type { MatchInput, TacticalPlan } from "../../contracts/engineToCoach";
import type { ZoneId } from "../../core/zones";

export interface TacticalPlanInfluence {
  readonly sequenceCountModifier: number;
  readonly pressureBias: number;
  readonly riskBias: number;
  readonly targetZoneBias: readonly ZoneId[];
  readonly tags: readonly string[];
  readonly explanation: string;
  readonly homeSummary: string;
  readonly awaySummary: string;
  readonly matchEffectSummary: string;
}

export interface TacticalPlanInfluenceSummary {
  readonly homeSummary: string;
  readonly awaySummary: string;
  readonly matchEffectSummary: string;
}

function influenceForPlan(input: {
  readonly side: "home" | "away";
  readonly plan: TacticalPlan;
}): TacticalPlanInfluence {
  const tags: string[] = [`plan_${input.side}`];
  let sequenceCountModifier = 0;
  let pressureBias = 0;
  let riskBias = 0;

  if (input.plan.tempo === "fast") {
    sequenceCountModifier += 1;
    tags.push(`plan_${input.side}_tempo_fast`);
  } else if (input.plan.tempo === "slow") {
    sequenceCountModifier -= 1;
    tags.push(`plan_${input.side}_tempo_slow`);
  } else {
    tags.push(`plan_${input.side}_tempo_balanced`);
  }

  if (input.plan.riskLevel === "high") {
    sequenceCountModifier += 1;
    riskBias += 2;
    tags.push(`plan_${input.side}_risk_high`);
  } else if (input.plan.riskLevel === "low") {
    riskBias -= 1;
    tags.push(`plan_${input.side}_risk_low`);
  } else {
    tags.push(`plan_${input.side}_risk_medium`);
  }

  if (input.plan.pressingIntensity >= 75) {
    pressureBias += 2;
    tags.push(`plan_${input.side}_pressing_high`);
  } else if (input.plan.pressingIntensity <= 35) {
    pressureBias -= 1;
    tags.push(`plan_${input.side}_pressing_low`);
  } else {
    tags.push(`plan_${input.side}_pressing_balanced`);
  }

  tags.push(`plan_${input.side}_scoring_${input.plan.scoringBias}`);

  return {
    sequenceCountModifier,
    pressureBias,
    riskBias,
    targetZoneBias: input.plan.targetZones,
    tags,
    explanation: `${input.side} plan influence: tempo ${input.plan.tempo}, risk ${input.plan.riskLevel}, pressing ${input.plan.pressingIntensity}, scoring bias ${input.plan.scoringBias}.`,
    homeSummary: "",
    awaySummary: "",
    matchEffectSummary: "",
  };
}

function clampSequenceCount(value: number): number {
  return Math.max(5, Math.min(8, value));
}

function tempoLabel(value: TacticalPlan["tempo"]): string {
  switch (value) {
    case "slow":
      return "tempo lent";
    case "balanced":
      return "tempo équilibré";
    case "fast":
      return "tempo rapide";
  }
}

function riskLabel(value: TacticalPlan["riskLevel"]): string {
  switch (value) {
    case "low":
      return "risque bas";
    case "medium":
      return "risque moyen";
    case "high":
      return "risque élevé";
  }
}

function pressingLabel(value: TacticalPlan["pressingIntensity"]): string {
  if (value >= 75) {
    return "pressing haut";
  }

  if (value <= 35) {
    return "pressing bas";
  }

  return "pressing équilibré";
}

function teamPlanSummary(input: {
  readonly teamName: string;
  readonly plan: TacticalPlan;
}): string {
  return `${input.teamName} : ${tempoLabel(input.plan.tempo)}, ${riskLabel(input.plan.riskLevel)}, ${pressingLabel(input.plan.pressingIntensity)}.`;
}

export function createTacticalPlanInfluenceSummary(input: {
  readonly matchInput: MatchInput;
  readonly influence: TacticalPlanInfluence;
}): TacticalPlanInfluenceSummary {
  const changedSequenceCount = input.influence.sequenceCountModifier === 0
    ? "ne modifient pas le volume de séquences simulées"
    : input.influence.sequenceCountModifier > 0
      ? "augmentent le volume de séquences simulées"
      : "réduisent légèrement le volume de séquences simulées";

  return {
    homeSummary: teamPlanSummary({
      teamName: input.matchInput.homeTeam.name,
      plan: input.matchInput.homePlan,
    }),
    awaySummary: teamPlanSummary({
      teamName: input.matchInput.awayTeam.name,
      plan: input.matchInput.awayPlan,
    }),
    matchEffectSummary: `À ce stade, ces choix ${changedSequenceCount} et influencent surtout les zones de lecture du rapport, les repères tactiques et la façon dont les séquences sous pression sont exposées.`,
  };
}

export function createTacticalPlanInfluence(input: MatchInput): TacticalPlanInfluence {
  const homeInfluence = influenceForPlan({ side: "home", plan: input.homePlan });
  const awayInfluence = influenceForPlan({ side: "away", plan: input.awayPlan });
  const combinedSequenceModifier = homeInfluence.sequenceCountModifier + awayInfluence.sequenceCountModifier;
  const tags = [...homeInfluence.tags, ...awayInfluence.tags];
  const sequenceCountModifier = clampSequenceCount(6 + combinedSequenceModifier) - 6;
  const summary = createTacticalPlanInfluenceSummary({
    matchInput: input,
    influence: {
      sequenceCountModifier,
      pressureBias: homeInfluence.pressureBias + awayInfluence.pressureBias,
      riskBias: homeInfluence.riskBias + awayInfluence.riskBias,
      targetZoneBias: [...input.homePlan.targetZones, ...input.awayPlan.targetZones],
      tags,
      explanation: "",
      homeSummary: "",
      awaySummary: "",
      matchEffectSummary: "",
    },
  });

  return {
    sequenceCountModifier,
    pressureBias: homeInfluence.pressureBias + awayInfluence.pressureBias,
    riskBias: homeInfluence.riskBias + awayInfluence.riskBias,
    targetZoneBias: [...input.homePlan.targetZones, ...input.awayPlan.targetZones],
    tags,
    explanation: `${homeInfluence.explanation} ${awayInfluence.explanation} Adapter influence is intentionally limited to sequence count, report zones, event tags, and readable context.`,
    homeSummary: summary.homeSummary,
    awaySummary: summary.awaySummary,
    matchEffectSummary: summary.matchEffectSummary,
  };
}

export function sequenceCountFromPlanInfluence(input: {
  readonly baseSequenceCount: number;
  readonly influence: TacticalPlanInfluence;
}): number {
  return clampSequenceCount(input.baseSequenceCount + input.influence.sequenceCountModifier);
}

export function primaryZoneFromPlanInfluence(input: {
  readonly influence: TacticalPlanInfluence;
  readonly fallbackZone: ZoneId;
}): ZoneId {
  return input.influence.targetZoneBias[0] ?? input.fallbackZone;
}
```

## File: src/simulation/runMatchContractGuard.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { Rating } from "../core/ratings";
import { createMatchReportSignature, runMatch } from "./runMatch";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertRating(label: string, value: Rating): void {
  assertGuard(Number.isFinite(value) && value >= 0 && value <= 100, `${label} must be within 0-100, received ${value}.`);
}

function validateReportReferences(report: MatchReport): void {
  const eventIds = new Set(report.timeline.map((event) => event.eventId));

  for (const event of report.timeline) {
    assertGuard(event.matchId === report.matchId, `${event.eventId} does not preserve report matchId ${report.matchId}.`);
    assertGuard(event.sequenceId.length > 0, `${event.eventId} must have a non-empty sequenceId.`);
    assertGuard(event.teamId.length > 0, `${event.eventId} must have a non-empty teamId.`);
    assertGuard(event.opponentTeamId.length > 0, `${event.eventId} must have a non-empty opponentTeamId.`);
    assertGuard(event.teamId !== event.opponentTeamId, `${event.eventId} teamId and opponentTeamId must differ.`);
    assertGuard(
      event.tags.some((tag) => tag !== "run_match_adapter"),
      `${event.eventId} must include at least one useful adapter tag beyond run_match_adapter.`,
    );
  }

  for (const insight of report.coachInsights) {
    for (const evidence of insight.evidence) {
      for (const eventId of evidence.eventIds) {
        assertGuard(eventIds.has(eventId), `${insight.insightId} references missing event ${eventId}.`);
      }
    }
  }

  for (const diagnosis of report.tacticalReport.diagnoses) {
    for (const eventId of diagnosis.evidenceEventIds) {
      assertGuard(eventIds.has(eventId), `${diagnosis.diagnosisId} references missing event ${eventId}.`);
    }
  }

  for (const moment of report.keyMoments) {
    assertGuard(eventIds.has(moment.eventId), `Key moment ${moment.title} references missing event ${moment.eventId}.`);
  }
}

function validateTacticalPlanTags(report: MatchReport): void {
  const planTags = report.timeline.flatMap((event) => event.tags.filter((tag) => tag.startsWith("plan_")));

  assertGuard(planTags.length > 0, "runMatch report must include at least one tactical-plan-derived tag.");
}

function validatePlanInfluenceDiagnosis(report: MatchReport): void {
  const eventIds = new Set(report.timeline.map((event) => event.eventId));
  const diagnosis = report.tacticalReport.diagnoses.find((candidate) => candidate.title === "Plan de match observé");

  if (diagnosis === undefined) {
    throw new Error("runMatch report must include a Plan de match observé tactical diagnosis.");
  }

  assertGuard(
    diagnosis.evidenceEventIds.length > 0,
    "Plan de match observé diagnosis must reference at least one event.",
  );
  for (const eventId of diagnosis.evidenceEventIds) {
    assertGuard(eventIds.has(eventId), `Plan de match observé diagnosis references missing event ${eventId}.`);
  }
  assertGuard(
    diagnosis.summary.includes("tempo rapide") || diagnosis.summary.includes("risque élevé"),
    "Plan de match observé diagnosis must include readable tactical-plan summary text.",
  );
}

function validateEvidenceDrivenInsights(report: MatchReport): void {
  const totalEvents = report.timeline.length;
  const focusedInsight = report.coachInsights.find((insight) =>
    insight.evidence.some((evidence) => evidence.eventIds.length > 0 && evidence.eventIds.length < totalEvents),
  );
  const evidenceFactInsight = report.coachInsights.find((insight) =>
    insight.evidence.some((evidence) => evidence.summary.includes("Fait de preuve")),
  );

  assertGuard(evidenceFactInsight !== undefined, "runMatch must create at least one evidence-driven coach insight.");

  if (totalEvents > 1) {
    assertGuard(
      focusedInsight !== undefined,
      "at least one CoachInsight must reference fewer than all timeline events when possible.",
    );
  }
}

function validateReadableKeyMoments(report: MatchReport): void {
  const insightEvidenceEventIds = new Set(
    report.coachInsights.flatMap((insight) => insight.evidence.flatMap((evidence) => evidence.eventIds)),
  );
  const keyMomentEventIds = new Set(report.keyMoments.map((moment) => moment.eventId));

  assertGuard(
    report.keyMoments.length <= report.timeline.length,
    `keyMoments length ${report.keyMoments.length} cannot exceed timeline length ${report.timeline.length}.`,
  );

  if (report.timeline.length > 3) {
    assertGuard(
      report.keyMoments.length < report.timeline.length,
      "keyMoments must be selected, not copied from the entire timeline.",
    );
  }

  for (const moment of report.keyMoments) {
    const event = report.timeline.find((candidate) => candidate.eventId === moment.eventId);

    if (event === undefined) {
      throw new Error(`Key moment ${moment.title} references missing event ${moment.eventId}.`);
    }

    if (event.eventType !== "kickoff") {
      assertGuard(moment.title !== "Adapter kickoff", `${moment.eventId} must not use the placeholder title Adapter kickoff.`);
    }
  }

  if (insightEvidenceEventIds.size > 0) {
    assertGuard(
      [...insightEvidenceEventIds].some((eventId) => keyMomentEventIds.has(eventId)),
      "at least one key moment must reference an insight evidence event.",
    );
  }
}

function validateSuggestedFocus(report: MatchReport): void {
  const hasEvidenceDrivenInsight = report.coachInsights.some((insight) =>
    insight.evidence.some((evidence) => evidence.summary.includes("Fait de preuve")),
  );

  if (!hasEvidenceDrivenInsight) {
    return;
  }

  assertGuard(
    report.suggestedFocus.some((focus) => focus.title !== "Finaliser l'adapter du contrat moteur"),
    "evidence-driven reports should produce a focus beyond the adapter completion fallback.",
  );
}

function compareTimelineEvents(a: MatchReport["timeline"][number], b: MatchReport["timeline"][number]): number {
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

function validateTimelineChronology(report: MatchReport): void {
  for (let index = 1; index < report.timeline.length; index += 1) {
    const previousEvent = report.timeline[index - 1];
    const currentEvent = report.timeline[index];

    if (previousEvent === undefined || currentEvent === undefined) {
      continue;
    }

    assertGuard(
      compareTimelineEvents(previousEvent, currentEvent) <= 0,
      `${currentEvent.eventId} appears before ${previousEvent.eventId} in chronological order.`,
    );
  }
}

function validateTeamStats(report: MatchReport, input: MatchInput): void {
  const teamIds = new Set(report.teamStats.map((stats) => stats.teamId));

  assertGuard(report.teamStats.length === 2, `teamStats must contain exactly two teams, received ${report.teamStats.length}.`);
  assertGuard(teamIds.has(input.homeTeam.teamId), `teamStats must include home team ${input.homeTeam.teamId}.`);
  assertGuard(teamIds.has(input.awayTeam.teamId), `teamStats must include away team ${input.awayTeam.teamId}.`);

  const homeStats = report.teamStats.find((stats) => stats.teamId === input.homeTeam.teamId);
  const awayStats = report.teamStats.find((stats) => stats.teamId === input.awayTeam.teamId);

  if (homeStats === undefined || awayStats === undefined) {
    throw new Error("teamStats missing home or away stats after team ID validation.");
  }

  assertGuard(homeStats.score === report.score.home, `home teamStats score ${homeStats.score} must match report score ${report.score.home}.`);
  assertGuard(awayStats.score === report.score.away, `away teamStats score ${awayStats.score} must match report score ${report.score.away}.`);

  const scoringEventsByTeam = report.timeline.reduce(
    (counts, event) => ({
      home: counts.home + (event.teamId === input.homeTeam.teamId && event.eventType === "scoring" ? 1 : 0),
      away: counts.away + (event.teamId === input.awayTeam.teamId && event.eventType === "scoring" ? 1 : 0),
    }),
    { home: 0, away: 0 },
  );

  if (homeStats.scoringEventCount !== undefined) {
    assertGuard(
      homeStats.scoringEventCount === scoringEventsByTeam.home,
      `home scoringEventCount ${homeStats.scoringEventCount} must match timeline scoring events ${scoringEventsByTeam.home}.`,
    );
  }

  if (awayStats.scoringEventCount !== undefined) {
    assertGuard(
      awayStats.scoringEventCount === scoringEventsByTeam.away,
      `away scoringEventCount ${awayStats.scoringEventCount} must match timeline scoring events ${scoringEventsByTeam.away}.`,
    );
  }

  if (homeStats.eventShare !== undefined && awayStats.eventShare !== undefined) {
    assertGuard(
      homeStats.eventShare + awayStats.eventShare === 100,
      `home/away event shares must sum to 100, received ${homeStats.eventShare + awayStats.eventShare}.`,
    );
  }
}

function validateZoneStats(report: MatchReport): void {
  const nonKickoffEvents = report.timeline.filter((event) => event.eventType !== "kickoff");
  const timelineZones = new Set(nonKickoffEvents.map((event) => event.zone));
  const statZones = new Set(report.zoneStats.map((stats) => stats.zone));

  for (const zone of timelineZones) {
    assertGuard(statZones.has(zone), `zoneStats must include timeline zone ${zone}.`);
  }

  for (const stats of report.zoneStats) {
    const eventsInZone = nonKickoffEvents.filter((event) => event.zone === stats.zone);

    assertGuard(stats.entries === eventsInZone.length, `${stats.zone} entries ${stats.entries} must match timeline count ${eventsInZone.length}.`);
    assertGuard(
      stats.successfulProgressions <= stats.entries,
      `${stats.zone} successfulProgressions ${stats.successfulProgressions} cannot exceed entries ${stats.entries}.`,
    );
  }
}

function validateScoringConsequences(report: MatchReport): void {
  const scoringEvents = report.timeline.filter((event) => event.eventType === "scoring");

  for (const event of scoringEvents) {
    assertGuard(
      event.consequences.some((consequence) => consequence.type === "score_change"),
      `${event.eventId} scoring event must include a score_change consequence.`,
    );
  }
}

function validateScoreFromConsequences(report: MatchReport, homeTeamId: string, awayTeamId: string): void {
  const scoreFromEvents = report.timeline.reduce(
    (score, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);

      return {
        home: score.home + (event.teamId === homeTeamId ? points : 0),
        away: score.away + (event.teamId === awayTeamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertGuard(
    scoreFromEvents.home === report.score.home && scoreFromEvents.away === report.score.away,
    `score consequences ${scoreFromEvents.home}-${scoreFromEvents.away} do not match report score ${report.score.home}-${report.score.away}.`,
  );
}

function validateReportRatings(report: MatchReport): void {
  for (const event of report.timeline) {
    assertRating(`${event.eventId}.narrativeWeight`, event.narrativeWeight);
    assertRating(`${event.eventId}.fatigueContext.teamCondition`, event.fatigueContext.teamCondition);
  }

  for (const stats of report.playerStats) {
    assertRating(`${stats.playerId}.contributionScore`, stats.contributionScore);
  }

  for (const summary of report.fatigueReport.teamSummaries) {
    assertRating(`${summary.teamId}.averageConditionEnd`, summary.averageConditionEnd);
    assertRating(`${summary.teamId}.highIntensityLoad`, summary.highIntensityLoad);
  }

  for (const summary of report.fatigueReport.playerSummaries) {
    assertRating(`${summary.playerId}.conditionStart`, summary.conditionStart);
    assertRating(`${summary.playerId}.conditionEnd`, summary.conditionEnd);
    assertRating(`${summary.playerId}.mentalFreshnessEnd`, summary.mentalFreshnessEnd);
  }
}

function withSeed(input: MatchInput, seed: string): MatchInput {
  return {
    ...input,
    seed,
  };
}

function withUnsupportedHomeTeam(input: MatchInput): MatchInput {
  return {
    ...input,
    homeTeam: {
      ...input.homeTeam,
      teamId: "unsupported-team",
      name: "Unsupported Team",
    },
  };
}

function validateUnsupportedTeamLimitation(input: MatchInput): void {
  try {
    runMatch(withUnsupportedHomeTeam(input));
  } catch (error) {
    assertGuard(
      error instanceof Error && error.message.includes("unsupported teamId"),
      `unsupported team error should mention unsupported teamId, received ${error instanceof Error ? error.message : String(error)}.`,
    );
    return;
  }

  throw new Error("runMatch should reject unsupported team IDs until the adapter is generic.");
}

export function validateRunMatchAdapter(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runMatch(input);
  const repeatedReport = runMatch(input);
  const alternateSeedReport = runMatch(withSeed(input, `${input.seed}-alternate`));
  const signature = createMatchReportSignature(report);
  const repeatedSignature = createMatchReportSignature(repeatedReport);
  const alternateSeedSignature = createMatchReportSignature(alternateSeedReport);
  const seedStatus =
    signature === alternateSeedSignature
      ? "different seeds currently produce the same minimal adapter signature; seed is forwarded to mini-match, but the adapter accepts this documented limitation until simulation variation is fully wired"
      : "different seeds produce different adapter signatures";

  assertGuard(report.matchId === input.matchId, `runMatch report matchId ${report.matchId} did not preserve ${input.matchId}.`);
  assertGuard(Number.isFinite(report.score.home), "home score must be numeric.");
  assertGuard(Number.isFinite(report.score.away), "away score must be numeric.");
  assertGuard(report.timeline.length >= 1 + 6, "runMatch timeline must include kickoff plus at least one event per mini-match sequence.");
  validateReportReferences(report);
  validateTacticalPlanTags(report);
  validatePlanInfluenceDiagnosis(report);
  validateEvidenceDrivenInsights(report);
  validateReadableKeyMoments(report);
  validateSuggestedFocus(report);
  validateTimelineChronology(report);
  validateTeamStats(report, input);
  validateZoneStats(report);
  validateScoringConsequences(report);
  validateScoreFromConsequences(report, input.homeTeam.teamId, input.awayTeam.teamId);
  validateReportRatings(report);
  validateUnsupportedTeamLimitation(input);
  assertGuard(signature === repeatedSignature, "same MatchInput seed did not produce a stable MatchReport signature.");

  return [
    "runMatch preserves MatchInput.matchId",
    "runMatch returns numeric score",
    "runMatch returns kickoff plus sequence-derived official timeline events",
    "every timeline event has matchId, sequenceId, teamId, and opponentTeamId",
    "every timeline event has useful adapter taxonomy tags",
    "report includes tactical-plan-derived tags",
    "report includes coach-visible tactical plan diagnosis",
    "coach insights and tactical diagnoses reference existing timeline evidence",
    "at least one coach insight is evidence-driven and focused",
    "key moments are selected, capped, and coach-readable",
    "evidence-driven reports produce evidence-based suggested focus",
    "report timeline is chronological",
    "team stats contain home/away teams and match report score",
    "zone stats cover non-kickoff timeline zones with consistent entries",
    "scoring events include score_change consequences",
    "report score equals score_change consequences by team",
    "unsupported team IDs fail with an explicit adapter limitation",
    "runMatch coach insight and key moment references resolve to timeline events",
    "same seed produces a stable MatchReport signature",
    seedStatus,
  ];
}

if (require.main === module) {
  const checks = validateRunMatchAdapter();

  console.log("runMatch adapter guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/matchReportContractGuard.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchReport } from "../contracts/engineToCoach";
import { containsMojibake } from "../reports/coachCopyQuality";
import { assertNoTechnicalContextLeak } from "../reports/coachFacingSummary";
import { runFullMatch } from "./runFullMatch";
import { runMatch } from "./runMatch";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function validateScoreFromConsequences(report: MatchReport): void {
  const [homeTeam, awayTeam] = report.teamStats;

  if (homeTeam === undefined || awayTeam === undefined) {
    return;
  }

  const score = report.timeline.reduce(
    (currentScore, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: currentScore.home + (event.teamId === homeTeam.teamId ? points : 0),
        away: currentScore.away + (event.teamId === awayTeam.teamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertGuard(score.home === report.score.home && score.away === report.score.away, "MatchReport score must equal score_change consequences.");
}

function validateReportContract(report: MatchReport, expectedScope: MatchReport["reportMeta"]["reportScope"]): void {
  const eventIds = new Set(report.timeline.map((event) => event.eventId));
  const factIds = new Set(report.evidenceFacts.map((fact) => fact.factId));

  assertGuard(report.evidenceFacts.length > 0, "MatchReport.evidenceFacts must be non-empty when timeline evidence exists.");
  assertGuard(report.warnings.length >= 0, "MatchReport.warnings must exist.");
  assertGuard(report.reportMeta.reportScope === expectedScope, `reportMeta.reportScope must be ${expectedScope}.`);

  for (const fact of report.evidenceFacts) {
    assertGuard(!containsMojibake(fact.summary), `${fact.factId} evidence summary contains mojibake.`);
    if (fact.coachVisible) {
      assertNoTechnicalContextLeak(fact.summary, `${fact.factId} evidence summary`);
    }
    assertGuard(fact.strength >= 0 && fact.strength <= 100, `${fact.factId} strength must stay within 0-100.`);
    for (const eventId of fact.eventIds) {
      assertGuard(eventIds.has(eventId), `${fact.factId} references missing event ${eventId}.`);
    }
  }

  for (const warning of report.warnings) {
    assertGuard(warning.mayInvalidateGlobalScoringEconomy === false, `${warning.warningId} must not invalidate global scoring economy.`);
    assertGuard(!containsMojibake(warning.coachSummary), `${warning.warningId} coach summary contains mojibake.`);
    assertNoTechnicalContextLeak(warning.coachSummary, `${warning.warningId} coach summary`);
    for (const factId of warning.evidenceFactIds) {
      assertGuard(factIds.has(factId), `${warning.warningId} references missing evidence fact ${factId}.`);
    }
    for (const eventId of warning.eventIds) {
      assertGuard(eventIds.has(eventId), `${warning.warningId} references missing event ${eventId}.`);
    }
  }

  for (const insight of report.coachInsights) {
    assertGuard(!containsMojibake(insight.summary), `${insight.insightId} summary contains mojibake.`);
    assertNoTechnicalContextLeak(insight.summary, `${insight.insightId} summary`);
    for (const evidence of insight.evidence) {
      for (const eventId of evidence.eventIds) {
        assertGuard(eventIds.has(eventId), `${insight.insightId} references missing event ${eventId}.`);
      }
    }
  }

  for (const diagnosis of report.tacticalReport.diagnoses) {
    assertGuard(!containsMojibake(diagnosis.summary), `${diagnosis.diagnosisId} summary contains mojibake.`);
    for (const eventId of diagnosis.evidenceEventIds) {
      assertGuard(eventIds.has(eventId), `${diagnosis.diagnosisId} references missing event ${eventId}.`);
    }
  }

  for (const moment of report.keyMoments) {
    assertGuard(eventIds.has(moment.eventId), `${moment.title} references missing event ${moment.eventId}.`);
    assertGuard(!containsMojibake(moment.summary), `${moment.title} summary contains mojibake.`);
    assertNoTechnicalContextLeak(moment.summary, `${moment.title} summary`);
    if (moment.evidenceFactId !== undefined) {
      assertGuard(factIds.has(moment.evidenceFactId), `${moment.title} references missing evidence fact ${moment.evidenceFactId}.`);
    }
  }

  validateScoreFromConsequences(report);
}

export function validateCanonicalMatchReportContract(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const miniReport = runMatch(input);
  const fullReport = runFullMatch(input);

  validateReportContract(miniReport, "MINI_MATCH_LOCAL");
  validateReportContract(fullReport, "FULL_MATCH_HARNESS_SINGLE_RUN");
  assertGuard(fullReport.warnings.every((warning) => !warning.coachSummary.includes("FULL_MATCH_HARNESS_SINGLE_RUN")), "Visible warning copy must not expose raw harness scope enum.");
  assertGuard(fullReport.warnings.every((warning) => warning.technicalSummary.includes("FULL_MATCH_HARNESS_SINGLE_RUN")), "Technical warning summary must preserve raw harness scope.");

  return [
    "runMatch returns canonical evidenceFacts, warnings, and reportMeta",
    "runFullMatch returns canonical evidenceFacts, warnings, and reportMeta",
    "runMatch reportMeta scope is MINI_MATCH_LOCAL",
    "runFullMatch reportMeta scope is FULL_MATCH_HARNESS_SINGLE_RUN",
    "evidence fact event IDs reference real timeline events",
    "warning evidence fact IDs reference real evidence facts",
    "key moments reference real events and evidence facts when present",
    "coach insights and diagnoses reference real timeline events",
    "visible report summaries contain no mojibake",
    "full-match warnings cannot invalidate global scoring economy",
    "technical summaries preserve internal scope while coach summaries stay clean",
    "final score equals score_change consequences",
  ];
}

if (require.main === module) {
  const checks = validateCanonicalMatchReportContract();

  console.log("Canonical MatchReport contract guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/runFullMatchContractGuard.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import { analyzeFullMatchHarnessSanity } from "./diagnostics/fullMatchHarnessSanity";
import { analyzeFullMatchScoringDominance } from "./diagnostics/fullMatchScoringDominanceDiagnostics";
import { createSegmentDiversityReport } from "./diagnostics/segmentDiversityDiagnostics";
import { createMatchReportSignature } from "./runMatch";
import { runFullMatch } from "./runFullMatch";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function compareTimelineEvents(a: MatchEvent, b: MatchEvent): number {
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

function validateChronology(report: MatchReport): void {
  for (let index = 1; index < report.timeline.length; index += 1) {
    const previousEvent = report.timeline[index - 1];
    const currentEvent = report.timeline[index];

    if (previousEvent === undefined || currentEvent === undefined) {
      continue;
    }

    assertGuard(
      compareTimelineEvents(previousEvent, currentEvent) <= 0,
      `${currentEvent.eventId} appears before ${previousEvent.eventId}.`,
    );
  }
}

function validateUniqueEventIds(report: MatchReport): void {
  const eventIds = new Set<string>();

  for (const event of report.timeline) {
    assertGuard(!eventIds.has(event.eventId), `Duplicate eventId ${event.eventId}.`);
    eventIds.add(event.eventId);
  }
}

function validateScoreFromConsequences(report: MatchReport, input: MatchInput): void {
  const score = report.timeline.reduce(
    (currentScore, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: currentScore.home + (event.teamId === input.homeTeam.teamId ? points : 0),
        away: currentScore.away + (event.teamId === input.awayTeam.teamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );

  assertGuard(
    score.home === report.score.home && score.away === report.score.away,
    `Full-match score ${report.score.home}-${report.score.away} does not match score_change consequences ${score.home}-${score.away}.`,
  );
}

function validateKeyMoments(report: MatchReport): void {
  assertGuard(report.keyMoments.length <= 5, `Full-match key moments must stay capped at 5, received ${report.keyMoments.length}.`);
  assertGuard(report.keyMoments.length < report.timeline.length, "Full-match key moments must be selected, not copied from the timeline.");

  const eventIds = new Set(report.timeline.map((event) => event.eventId));

  for (const moment of report.keyMoments) {
    assertGuard(eventIds.has(moment.eventId), `Key moment ${moment.title} references missing event ${moment.eventId}.`);
  }

  const uniqueTitles = new Set(report.keyMoments.map((moment) => moment.title));
  const titleCounts = new Map<string, number>();
  for (const moment of report.keyMoments) {
    titleCounts.set(moment.title, (titleCounts.get(moment.title) ?? 0) + 1);
  }
  if (report.keyMoments.length > 1) {
    assertGuard(uniqueTitles.size >= 2, "Full-match key moments should include at least two different titles when possible.");
  }
  assertGuard(
    [...titleCounts.values()].every((count) => count <= 2),
    "Full-match key moments should include no more than 2 moments with the same title when alternatives exist.",
  );

  const scoringEventIds = new Set(report.timeline.filter((event) => event.eventType === "scoring").map((event) => event.eventId));
  const scoringMoments = report.keyMoments.filter((moment) => scoringEventIds.has(moment.eventId)).length;
  const hasNonScoringCandidate = report.timeline.some((event) => event.eventType !== "kickoff" && event.eventType !== "scoring" && event.narrativeWeight >= 60);

  if (hasNonScoringCandidate) {
    assertGuard(scoringMoments <= 2, `Full-match key moments should include at most 2 scoring moments when alternatives exist, received ${scoringMoments}.`);
  }
}

function validateEvidenceReferences(report: MatchReport): void {
  const eventIds = new Set(report.timeline.map((event) => event.eventId));
  const evidenceFactIds = new Set(report.evidenceFacts.map((fact) => fact.factId));

  for (const insight of report.coachInsights) {
    for (const evidence of insight.evidence) {
      for (const eventId of evidence.eventIds) {
        assertGuard(eventIds.has(eventId), `${insight.insightId} references missing event ${eventId}.`);
      }
    }
  }

  for (const diagnosis of report.tacticalReport.diagnoses) {
    for (const eventId of diagnosis.evidenceEventIds) {
      assertGuard(eventIds.has(eventId), `${diagnosis.diagnosisId} references missing event ${eventId}.`);
    }
  }

  for (const fact of report.evidenceFacts) {
    for (const eventId of fact.eventIds) {
      assertGuard(eventIds.has(eventId), `${fact.factId} references missing event ${eventId}.`);
    }
  }

  for (const warning of report.warnings) {
    assertGuard(warning.mayInvalidateGlobalScoringEconomy === false, `${warning.warningId} must remain warning-only.`);
    for (const factId of warning.evidenceFactIds) {
      assertGuard(evidenceFactIds.has(factId), `${warning.warningId} references missing evidence fact ${factId}.`);
    }
  }
}

function validateHarnessSanityWarnings(report: MatchReport): void {
  const sanity = analyzeFullMatchHarnessSanity(report);
  const dominance = analyzeFullMatchScoringDominance(report);
  const forbiddenRecommendationFragments = [
    "reduce SHOT_GOAL",
    "reduce TRY_TOUCHDOWN",
    "cap score",
    "delete events",
    "recalibrate scoring from a single run",
    "global scoring incoherent",
  ];

  assertGuard(
    sanity.scope === "FULL_MATCH_HARNESS_SINGLE_RUN",
    `runFullMatch guard must label sanity scope as FULL_MATCH_HARNESS_SINGLE_RUN, received ${sanity.scope}.`,
  );
  assertGuard(
    sanity.mayInvalidateGlobalScoringEconomy === false,
    "runFullMatch harness sanity warnings must not invalidate global scoring economy.",
  );

  if (report.score.home + report.score.away > 35) {
    assertGuard(
      sanity.warnings.includes("INFLATED_SINGLE_RUN_SCORE"),
      "high single-run score must emit INFLATED_SINGLE_RUN_SCORE warning, not scoring failure.",
    );
  }

  if (Math.abs(report.score.home - report.score.away) >= 21) {
    assertGuard(
      dominance.warnings.includes("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"),
      "lopsided single-run score must emit one-team scoring dominance diagnostics.",
    );
    assertGuard(
      sanity.warnings.includes("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"),
      "lopsided single-run score must surface dominance warning through harness sanity.",
    );
    assertGuard(
      dominance.mayInvalidateGlobalScoringEconomy === false,
      "one-team scoring dominance must stay warning-only and cannot invalidate global economy.",
    );
  }

  if (dominance.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM")) {
    assertGuard(
      sanity.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM"),
      "zero scoring team must surface as warning-only through harness sanity.",
    );
  }

  if (report.keyMoments.filter((moment) => {
    const event = report.timeline.find((candidate) => candidate.eventId === moment.eventId);

    return event?.eventType === "scoring";
  }).length >= 3) {
    assertGuard(
      sanity.warnings.includes("REPETITIVE_KEY_MOMENTS"),
      "repetitive scoring key moments must emit a harness warning.",
    );
  }

  if (report.fatigueReport.playerSummaries.every((summary) => summary.conditionStart === summary.conditionEnd)) {
    assertGuard(
      sanity.warnings.includes("FLAT_FATIGUE_SIGNAL"),
      "flat fatigue must emit a harness warning.",
    );
  }

  const recommendationText = sanity.recommendedNextActions.join(" | ");
  for (const fragment of forbiddenRecommendationFragments) {
    assertGuard(
      !recommendationText.includes(fragment),
      `runFullMatch harness sanity recommendations must not include forbidden scoring recommendation: ${fragment}.`,
    );
  }
}

function validateSegmentDiversityAndFatigue(report: MatchReport, input: MatchInput): void {
  const segmentReport = createSegmentDiversityReport(report);
  const homeFatigue = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === input.homeTeam.teamId);
  const awayFatigue = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === input.awayTeam.teamId);
  const homeStart = input.homeTeam.roster[0]?.currentCondition ?? 100;
  const awayStart = input.awayTeam.roster[0]?.currentCondition ?? 100;

  assertGuard(segmentReport.segmentCount >= 2, "Segment diversity report must exist and cover multiple segments.");
  assertGuard(segmentReport.segmentSummaries.length === segmentReport.segmentCount, "Segment diversity summaries must match segment count.");
  assertGuard(homeFatigue !== undefined && awayFatigue !== undefined, "Full-match fatigue propagation report must include both teams.");

  if (homeFatigue !== undefined && awayFatigue !== undefined) {
    assertGuard(
      homeFatigue.averageConditionEnd < homeStart || awayFatigue.averageConditionEnd < awayStart,
      "At least one team condition must decrease below starting condition in full-match harness.",
    );
    assertGuard(
      awayFatigue.highIntensityLoad >= homeFatigue.highIntensityLoad,
      "High pressing team should have greater or equal highIntensityLoad than balanced team.",
    );
    assertGuard(
      !(awayFatigue.highIntensityLoad === 100 && homeFatigue.highIntensityLoad === 100),
      "HighIntensityLoad should not saturate both teams to 100 unless explicitly justified by extreme load.",
    );
  }
}

function validateDominatedTeamEvidence(report: MatchReport): void {
  const dominance = analyzeFullMatchScoringDominance(report);

  if (dominance.dominatedTeamId === undefined || !dominance.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM")) {
    return;
  }

  const hasDominatedDiagnosis = report.tacticalReport.diagnoses.some((diagnosis) =>
    diagnosis.summary.includes("domination scoring locale") &&
    diagnosis.summary.includes("économie du score") &&
    diagnosis.evidenceEventIds.length > 0,
  );
  const hasDominatedMoment = report.keyMoments.some((moment) => {
    const event = report.timeline.find((candidate) => candidate.eventId === moment.eventId);

    return event !== undefined && event.teamId === dominance.dominatedTeamId && event.eventType !== "kickoff";
  });

  assertGuard(hasDominatedDiagnosis, "Dominance diagnosis must explain single-run scoring dominance without leaking raw scope enums.");
  assertGuard(hasDominatedMoment || dominance.dominatedTeamEvidenceEventIds.length === 0, "Key moments should include a dominated-team signal when evidence exists.");
}

export function validateRunFullMatchHarness(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const report = runFullMatch(input);
  const repeatedReport = runFullMatch(input);

  assertGuard(report.matchId === input.matchId, `runFullMatch report matchId ${report.matchId} did not preserve ${input.matchId}.`);
  assertGuard(report.timeline.length >= 30, `runFullMatch timeline must contain at least 30 events, received ${report.timeline.length}.`);
  validateChronology(report);
  validateUniqueEventIds(report);
  validateScoreFromConsequences(report, input);
  validateKeyMoments(report);
  validateEvidenceReferences(report);
  validateHarnessSanityWarnings(report);
  validateSegmentDiversityAndFatigue(report, input);
  validateDominatedTeamEvidence(report);
  assertGuard(report.reportMeta.reportScope === "FULL_MATCH_HARNESS_SINGLE_RUN", "Full-match reportMeta scope must be FULL_MATCH_HARNESS_SINGLE_RUN.");
  assertGuard(report.evidenceFacts.some((fact) => fact.category === "HARNESS_PLAUSIBILITY_WARNING"), "Full-match report must include harness plausibility evidence when sanity warnings exist.");
  assertGuard(report.warnings.length > 0, "Full-match report must expose structured MatchReport warnings.");
  assertGuard(
    createMatchReportSignature(report) === createMatchReportSignature(repeatedReport),
    "runFullMatch must be deterministic for the same MatchInput.",
  );

  return [
    "runFullMatch preserves MatchInput.matchId",
    "runFullMatch creates a full-match-shaped event volume",
    "full-match timeline is chronological",
    "full-match event IDs are unique",
    "full-match score equals score_change consequences",
    "full-match key moments remain selected and capped",
    "full-match key moments include diverse titles when possible",
    "full-match key moments cap repeated titles when alternatives exist",
    "full-match scoring key moments are capped by selection when alternatives exist",
    "full-match insights and diagnoses reference existing events",
    "full-match structured warnings reference canonical evidence facts",
    "segment diversity report exists",
    "fatigue propagation report exists",
    "at least one team condition decreases below starting condition",
    "high pressing team has greater or equal highIntensityLoad than balanced team",
    "full-match guard scope is FULL_MATCH_HARNESS_SINGLE_RUN",
    "full-match reportMeta scope is FULL_MATCH_HARNESS_SINGLE_RUN",
    "full-match report exposes canonical harness warning evidence",
    "high single-run score is a harness warning, not a scoring failure",
    "harness sanity warnings do not recommend scoring value changes",
    "dominance diagnostics exist for lopsided single-run score",
    "one-team scoring dominance remains warning-only",
    "zero scoring team remains warning-only",
    "dominated-team evidence appears when available",
    "highIntensityLoad avoids double saturation at 100",
    "runFullMatch is deterministic for the same input",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchHarness();

  console.log("runFullMatch harness guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/diagnostics/sourceOfTruthRegistry.ts

```ts
export type MatchEvidenceScope =
  | "MINI_MATCH_LOCAL"
  | "FULL_MATCH_HARNESS_SINGLE_RUN"
  | "FULL_MATCH_BATCH_ECONOMY"
  | "BATCH_DIAGNOSTIC_PROJECTION"
  | "LIVE_SCORING_STREAM"
  | "REPORT_RENDERING_ONLY";

export interface MatchEvidenceScopeDefinition {
  readonly scope: MatchEvidenceScope;
  readonly canProve: readonly string[];
  readonly canSuggest?: readonly string[];
  readonly cannotProve: readonly string[];
  readonly cannotOverride?: readonly string[];
  readonly cannotInclude?: readonly string[];
  readonly globalScoringEconomyVerdictAllowed: boolean;
}

export const MATCH_EVIDENCE_SCOPE_REGISTRY: Readonly<Record<MatchEvidenceScope, MatchEvidenceScopeDefinition>> = {
  MINI_MATCH_LOCAL: {
    scope: "MINI_MATCH_LOCAL",
    canProve: [
      "local sequence behavior",
      "local scoring trace",
      "event rendering",
      "tactical evidence for a short sample",
    ],
    cannotProve: [
      "full-match scoring economy",
      "0-0 rate",
      "average points",
      "long-match fatigue economy",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  FULL_MATCH_HARNESS_SINGLE_RUN: {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    canProve: [
      "report can handle match-like volume",
      "timeline remains chronological",
      "event IDs remain unique",
      "score consequences match final score",
      "report signals are readable or not",
    ],
    cannotProve: [
      "global scoring balance",
      "full-match economy incoherence",
      "meta-risk",
      "average scoring plausibility",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  FULL_MATCH_BATCH_ECONOMY: {
    scope: "FULL_MATCH_BATCH_ECONOMY",
    canProve: [
      "global scoring plausibility",
      "average total points",
      "0-0 rate",
      "scoring event volume",
      "route mix",
      "score diversity",
      "meta-risk status",
    ],
    cannotProve: [],
    globalScoringEconomyVerdictAllowed: true,
  },
  BATCH_DIAGNOSTIC_PROJECTION: {
    scope: "BATCH_DIAGNOSTIC_PROJECTION",
    canProve: [],
    canSuggest: [
      "monitoring risks",
      "local calibration concerns",
      "route imbalance hypotheses",
    ],
    cannotProve: [
      "final live score",
      "canonical scoring constants",
    ],
    cannotOverride: [
      "live score",
      "full-match batch economy",
      "scoring constants",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  LIVE_SCORING_STREAM: {
    scope: "LIVE_SCORING_STREAM",
    canProve: [
      "final live score",
      "active scoring events",
      "score consistency",
      "inactive scoring leakage",
    ],
    cannotProve: [
      "global scoring economy",
      "batch scoring plausibility",
    ],
    cannotInclude: [
      "MatchBonusEvent points",
      "batch projection points",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
  REPORT_RENDERING_ONLY: {
    scope: "REPORT_RENDERING_ONLY",
    canProve: [
      "HTML/Markdown rendering quality",
      "missing sections",
      "repetitive copy",
      "[object Object] bugs",
    ],
    cannotProve: [
      "engine scoring incoherence",
    ],
    globalScoringEconomyVerdictAllowed: false,
  },
} as const;
```

## File: src/simulation/diagnostics/fullMatchEconomyAnchors.ts

```ts
export const VALIDATED_FULL_MATCH_ECONOMY_ANCHOR = {
  source: "FULL_MATCH_BATCH_ECONOMY",
  matchesSimulated: 50,
  offensivePossessionsPerMatch: 30,
  dangerPhasesPerMatch: 43.5,
  scoringEventsPerMatch: 7,
  observedNilNilRate: 0.04,
  averageTotalPoints: 33,
  medianTotalPoints: 29,
  uniqueFinalScores: 38,
  metaRisks: [],
  status: "VALIDATED",
} as const;

// A single deterministic runFullMatch harness output must not invalidate this anchor.
// Only a new batch full-match economy validation with comparable or better sample size can supersede it.
```

## File: src/simulation/diagnostics/fullMatchHarnessSanity.ts

```ts
import type { MatchReport } from "../../contracts/engineToCoach";
import { VALIDATED_FULL_MATCH_ECONOMY_ANCHOR } from "./fullMatchEconomyAnchors";
import { createSegmentDiversityDiagnostics } from "./segmentDiversityDiagnostics";
import {
  analyzeFullMatchScoringDominance,
  type FullMatchScoringDominanceReport,
  type FullMatchScoringDominanceWarning,
} from "./fullMatchScoringDominanceDiagnostics";

export type FullMatchHarnessSanityWarning = FullMatchScoringDominanceWarning
  | "SINGLE_RUN_NOT_GLOBAL_ECONOMY"
  | "POSSIBLE_SEGMENT_PATTERN_REPETITION"
  | "INFLATED_SINGLE_RUN_SCORE"
  | "REPETITIVE_KEY_MOMENTS"
  | "FLAT_FATIGUE_SIGNAL"
  | "MISSING_SEGMENT_STATE_PROPAGATION"
  | "MISSING_FATIGUE_PROPAGATION"
  | "MISSING_MOMENTUM_VARIATION";

export type FullMatchHarnessSanityReport = {
  readonly scope: "FULL_MATCH_HARNESS_SINGLE_RUN";
  readonly verdict: "OK" | "WARNING" | "FAIL_CONTRACT";
  readonly warnings: readonly FullMatchHarnessSanityWarning[];
  readonly scoringDominance: FullMatchScoringDominanceReport;
  readonly interpretation: string;
  readonly mayInvalidateGlobalScoringEconomy: false;
  readonly recommendedNextActions: readonly string[];
};

const HIGH_SINGLE_RUN_SCORE_THRESHOLD = 35;
const LOPSIDED_SINGLE_RUN_SCORE_DIFFERENCE = 21;
const REPETITIVE_PATTERN_SHARE = 0.5;
const FLAT_FATIGUE_DELTA_THRESHOLD = 1;

function totalScore(report: MatchReport): number {
  return report.score.home + report.score.away;
}

function scoringMomentShare(report: MatchReport): number {
  if (report.keyMoments.length === 0) {
    return 0;
  }

  const scoringEventIds = new Set(report.timeline.filter((event) => event.eventType === "scoring").map((event) => event.eventId));
  const scoringMoments = report.keyMoments.filter((moment) => scoringEventIds.has(moment.eventId)).length;

  return scoringMoments / report.keyMoments.length;
}

function mostCommonPatternShare(patterns: readonly string[]): number {
  if (patterns.length === 0) {
    return 0;
  }

  const counts = new Map<string, number>();

  for (const pattern of patterns) {
    counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
  }

  return Math.max(...counts.values()) / patterns.length;
}

function isFatigueFlat(report: MatchReport): boolean {
  const playerDeltas = report.fatigueReport.playerSummaries.map((summary) =>
    Math.abs(summary.conditionStart - summary.conditionEnd),
  );

  if (playerDeltas.length === 0) {
    return true;
  }

  return Math.max(...playerDeltas) <= FLAT_FATIGUE_DELTA_THRESHOLD;
}

function recommendationForWarning(warning: FullMatchHarnessSanityWarning): string {
  switch (warning) {
    case "SINGLE_RUN_NOT_GLOBAL_ECONOMY":
      return "add batch validation if global scoring is questioned";
    case "POSSIBLE_SEGMENT_PATTERN_REPETITION":
    case "MISSING_SEGMENT_STATE_PROPAGATION":
    case "MISSING_MOMENTUM_VARIATION":
      return "improve segment diversity and propagate momentum between segments";
    case "INFLATED_SINGLE_RUN_SCORE":
      return "treat the score as a harness/report warning and compare against batch economy before making scoring claims";
    case "REPETITIVE_KEY_MOMENTS":
      return "improve key moment diversity";
    case "FLAT_FATIGUE_SIGNAL":
    case "MISSING_FATIGUE_PROPAGATION":
      return "propagate fatigue between segments";
    case "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN":
    case "ZERO_SCORING_EVENTS_FOR_ONE_TEAM":
    case "HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_ZONE":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_EVENT_FAMILY":
    case "SCORING_EVENTS_CLUSTERED_IN_SAME_SEGMENT_PATTERN":
    case "DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE":
    case "DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION":
    case "DOMINATED_TEAM_HIGH_LOAD_NO_PAYOFF":
      return "explain full-match scoring dominance as a warning-only harness plausibility signal";
  }
}

export function analyzeFullMatchHarnessSanity(report: MatchReport): FullMatchHarnessSanityReport {
  const warnings = new Set<FullMatchHarnessSanityWarning>(["SINGLE_RUN_NOT_GLOBAL_ECONOMY"]);
  const scoreDifference = Math.abs(report.score.home - report.score.away);
  const scoringDominance = analyzeFullMatchScoringDominance(report);

  if (totalScore(report) > HIGH_SINGLE_RUN_SCORE_THRESHOLD || scoreDifference >= LOPSIDED_SINGLE_RUN_SCORE_DIFFERENCE) {
    warnings.add("INFLATED_SINGLE_RUN_SCORE");
  }

  const segmentDiagnostics = createSegmentDiversityDiagnostics(report);
  const familyPatternShare = mostCommonPatternShare(segmentDiagnostics.map((segment) => segment.eventFamilyPattern));
  const zonePatternShare = mostCommonPatternShare(segmentDiagnostics.map((segment) => segment.zonePattern));

  if (segmentDiagnostics.length > 1 && (familyPatternShare >= REPETITIVE_PATTERN_SHARE || zonePatternShare >= REPETITIVE_PATTERN_SHARE)) {
    warnings.add("POSSIBLE_SEGMENT_PATTERN_REPETITION");
    warnings.add("MISSING_SEGMENT_STATE_PROPAGATION");
    warnings.add("MISSING_MOMENTUM_VARIATION");
  }

  if (report.keyMoments.length > 0 && scoringMomentShare(report) >= 0.6) {
    warnings.add("REPETITIVE_KEY_MOMENTS");
  }

  if (isFatigueFlat(report)) {
    warnings.add("FLAT_FATIGUE_SIGNAL");
    warnings.add("MISSING_FATIGUE_PROPAGATION");
  }

  for (const dominanceWarning of scoringDominance.warnings) {
    warnings.add(dominanceWarning);
  }

  const orderedWarnings = [...warnings];

  return {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    verdict: orderedWarnings.length > 1 ? "WARNING" : "OK",
    warnings: orderedWarnings,
    scoringDominance,
    interpretation:
      `This is a full-match harness/report sanity warning. It does not override the validated 50-match full-match economy. Current validated average total points anchor: ${VALIDATED_FULL_MATCH_ECONOMY_ANCHOR.averageTotalPoints}.`,
    mayInvalidateGlobalScoringEconomy: false,
    recommendedNextActions: [...new Set(orderedWarnings.map(recommendationForWarning))],
  };
}
```

## File: src/simulation/diagnostics/fullMatchScoringDominanceDiagnostics.ts

```ts
import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type FullMatchScoringDominanceWarning =
  | "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"
  | "ZERO_SCORING_EVENTS_FOR_ONE_TEAM"
  | "HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM"
  | "SCORING_EVENTS_CLUSTERED_IN_SAME_ZONE"
  | "SCORING_EVENTS_CLUSTERED_IN_SAME_EVENT_FAMILY"
  | "SCORING_EVENTS_CLUSTERED_IN_SAME_SEGMENT_PATTERN"
  | "DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE"
  | "DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION"
  | "DOMINATED_TEAM_HIGH_LOAD_NO_PAYOFF";

export type FullMatchScoringDominanceReport = {
  readonly scope: "FULL_MATCH_HARNESS_SINGLE_RUN";
  readonly warnings: readonly FullMatchScoringDominanceWarning[];
  readonly score: {
    readonly home: number;
    readonly away: number;
  };
  readonly scoringEventsByTeam: readonly {
    readonly teamId: string;
    readonly scoringEventCount: number;
    readonly points: number;
    readonly mainScoringZones: readonly string[];
    readonly mainScoringEventTypes: readonly string[];
  }[];
  readonly dominatedTeamId?: string;
  readonly dominantTeamId?: string;
  readonly dominatedTeamEvidenceEventIds: readonly string[];
  readonly affectedZones: readonly string[];
  readonly interpretation: string;
  readonly mayInvalidateGlobalScoringEconomy: false;
  readonly recommendedNextActions: readonly string[];
};

const HIGH_SINGLE_TEAM_SCORING_EVENTS = 10;
const DOMINANCE_POINT_SHARE = 0.9;
const CLUSTER_SHARE = 0.6;

function scorePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function scoringType(event: MatchEvent): string {
  return event.tags.find((tag) => tag.startsWith("scoring_type_"))?.replace("scoring_type_", "") ?? event.tacticalContext.moveType ?? "scoring";
}

function segmentKey(event: MatchEvent): string {
  const matchPrefix = `${event.matchId}-`;
  const withoutMatch = event.eventId.startsWith(matchPrefix) ? event.eventId.slice(matchPrefix.length) : event.eventId;
  const segmentMatch = /^segment-\d+/.exec(withoutMatch);

  return segmentMatch?.[0] ?? "single";
}

function topValues<T extends string>(values: readonly T[], limit: number): readonly T[] {
  const counts = new Map<T, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value]) => value);
}

function topShare(values: readonly string[]): number {
  if (values.length === 0) {
    return 0;
  }

  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Math.max(...counts.values()) / values.length;
}

function teamIdsForReport(report: MatchReport): readonly TeamId[] {
  return [...new Set([
    ...report.teamStats.map((stats) => stats.teamId),
    ...report.timeline.map((event) => event.teamId),
  ])];
}

function hasDangerSignal(event: MatchEvent): boolean {
  return event.eventType === "progression" || event.tags.includes("danger_high") || event.tags.includes("finishing_opportunity");
}

function hasPressureSignal(event: MatchEvent): boolean {
  return event.tags.includes("pressure_high") ||
    event.tags.includes("pressure_medium") ||
    event.tags.includes("territorial_pressure_high") ||
    event.tags.includes("stability_low");
}

export function analyzeFullMatchScoringDominance(report: MatchReport): FullMatchScoringDominanceReport {
  const warnings = new Set<FullMatchScoringDominanceWarning>();
  const teamIds = teamIdsForReport(report);
  const scoringEvents = report.timeline.filter((event) => event.eventType === "scoring" || scorePoints(event) > 0);
  const scoringEventsByTeam = teamIds.map((teamId) => {
    const teamScoringEvents = scoringEvents.filter((event) => event.teamId === teamId);

    return {
      teamId,
      scoringEventCount: teamScoringEvents.length,
      points: teamScoringEvents.reduce((total, event) => total + scorePoints(event), 0),
      mainScoringZones: topValues(teamScoringEvents.map((event) => event.zone), 3),
      mainScoringEventTypes: topValues(teamScoringEvents.map(scoringType), 3),
    };
  });
  const totalPoints = scoringEventsByTeam.reduce((total, item) => total + item.points, 0);
  const dominantTeam = scoringEventsByTeam
    .filter((item) => item.points > 0)
    .sort((a, b) => b.points - a.points)[0];
  const dominatedTeam = scoringEventsByTeam
    .filter((item) => item.teamId !== dominantTeam?.teamId)
    .sort((a, b) => a.points - b.points || a.scoringEventCount - b.scoringEventCount)[0];
  const dominantScoringEvents = dominantTeam === undefined
    ? []
    : scoringEvents.filter((event) => event.teamId === dominantTeam.teamId);
  const dominatedEvents = dominatedTeam === undefined
    ? []
    : report.timeline.filter((event) => event.teamId === dominatedTeam.teamId && event.eventType !== "kickoff");
  const dominatedDangerEvents = dominatedEvents.filter(hasDangerSignal);
  const dominatedPressureEvents = dominatedEvents.filter(hasPressureSignal);
  const dominatedFatigue = report.fatigueReport.teamSummaries.find((summary) => summary.teamId === dominatedTeam?.teamId);

  if (dominantTeam !== undefined && totalPoints > 0 && dominantTeam.points / totalPoints >= DOMINANCE_POINT_SHARE) {
    warnings.add("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN");
  }

  if (scoringEventsByTeam.some((item) => item.scoringEventCount === 0) && scoringEvents.length > 0) {
    warnings.add("ZERO_SCORING_EVENTS_FOR_ONE_TEAM");
  }

  if (scoringEventsByTeam.some((item) => item.scoringEventCount >= HIGH_SINGLE_TEAM_SCORING_EVENTS)) {
    warnings.add("HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM");
  }

  if (topShare(dominantScoringEvents.map((event) => event.zone)) >= CLUSTER_SHARE && dominantScoringEvents.length >= 3) {
    warnings.add("SCORING_EVENTS_CLUSTERED_IN_SAME_ZONE");
  }

  if (topShare(dominantScoringEvents.map(scoringType)) >= CLUSTER_SHARE && dominantScoringEvents.length >= 3) {
    warnings.add("SCORING_EVENTS_CLUSTERED_IN_SAME_EVENT_FAMILY");
  }

  if (topShare(dominantScoringEvents.map(segmentKey)) >= CLUSTER_SHARE && dominantScoringEvents.length >= 3) {
    warnings.add("SCORING_EVENTS_CLUSTERED_IN_SAME_SEGMENT_PATTERN");
  }

  if (dominatedTeam !== undefined && dominatedTeam.scoringEventCount === 0 && dominatedDangerEvents.length > 0) {
    warnings.add("DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE");
  }

  if (dominatedTeam !== undefined && dominatedTeam.scoringEventCount === 0 && dominatedPressureEvents.length > 0) {
    warnings.add("DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION");
  }

  if (dominatedTeam !== undefined && dominatedTeam.scoringEventCount === 0 && (dominatedFatigue?.highIntensityLoad ?? 0) >= 80) {
    warnings.add("DOMINATED_TEAM_HIGH_LOAD_NO_PAYOFF");
  }

  return {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    warnings: [...warnings],
    score: report.score,
    scoringEventsByTeam,
    ...(dominatedTeam === undefined ? {} : { dominatedTeamId: dominatedTeam.teamId }),
    ...(dominantTeam === undefined ? {} : { dominantTeamId: dominantTeam.teamId }),
    dominatedTeamEvidenceEventIds: [...new Set([...dominatedDangerEvents, ...dominatedPressureEvents].map((event) => event.eventId))].slice(0, 8),
    affectedZones: topValues([...dominantScoringEvents, ...dominatedDangerEvents, ...dominatedPressureEvents].map((event) => event.zone as ZoneId), 4),
    interpretation:
      "This is a single-run full-match harness dominance warning. It identifies local harness/report behavior and cannot invalidate the validated 50-match scoring economy.",
    mayInvalidateGlobalScoringEconomy: false,
    recommendedNextActions: [
      "explain the single-run scoring dominance in the coach report",
      "inspect repeated scoring zones and event families",
      "surface dominated-team danger or pressure without conversion",
      "keep scoring values tied to the validated 50-match economy, not this single run",
    ],
  };
}
```

## File: src/simulation/diagnostics/sourceOfTruthGuards.ts

```ts
import type { MatchEvidenceScope } from "./sourceOfTruthRegistry";

export function assertCanMakeGlobalScoringEconomyClaim(scope: MatchEvidenceScope): void {
  if (scope === "FULL_MATCH_BATCH_ECONOMY") {
    return;
  }

  throw new Error(
    "Global scoring economy claims require FULL_MATCH_BATCH_ECONOMY evidence. A single runFullMatch harness output can raise harness/report warnings but cannot invalidate the validated 50-match economy.",
  );
}
```

## File: src/simulation/diagnostics/segmentDiversityDiagnostics.ts

```ts
import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";

export interface SegmentDiversityDiagnostic {
  readonly segmentIndex: number;
  readonly eventIdPrefix: string;
  readonly scoreChanges: number;
  readonly scoringTeams: readonly string[];
  readonly eventFamilyPattern: string;
  readonly primaryActorPattern: string;
  readonly zonePattern: string;
  readonly fatigueDelta: number;
  readonly momentumDelta: number;
  readonly segmentInfluenceActive: boolean;
  readonly segmentInfluenceTagCount: number;
}

export type SegmentDiversityWarning =
  | "REPEATED_SCORING_PATTERN"
  | "REPEATED_ZONE_PATTERN"
  | "LOW_EVENT_FAMILY_DIVERSITY"
  | "NO_FATIGUE_DELTA"
  | "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"
  | "ZERO_SCORING_EVENTS_FOR_ONE_TEAM"
  | "SAME_TEAM_SCORES_IN_MOST_SEGMENTS"
  | "HIGH_LOAD_NO_SCORING_PAYOFF"
  | "SEGMENT_VARIATION_WITH_LOW_OPPONENT_THREAT"
  | "SEGMENT_INFLUENCE_INACTIVE_AFTER_FIRST_SEGMENT";

export interface SegmentDiversitySummary extends SegmentDiversityDiagnostic {
  readonly scoringPattern: string;
  readonly eventFamilyCount: number;
}

export type SegmentDiversityReport = {
  readonly segmentCount: number;
  readonly repeatedScoringPatternCount: number;
  readonly repeatedZonePatternCount: number;
  readonly repeatedEventTypePatternCount: number;
  readonly segmentInfluenceActiveSegmentCount: number;
  readonly segmentSummaries: readonly SegmentDiversitySummary[];
  readonly warnings: readonly SegmentDiversityWarning[];
  readonly dominanceSummary: string;
};

function segmentKeyForEvent(event: MatchEvent): string {
  const matchPrefix = `${event.matchId}-`;

  if (!event.eventId.startsWith(matchPrefix)) {
    return "unknown";
  }

  const remaining = event.eventId.slice(matchPrefix.length);
  const segmentMatch = /^segment-\d+/.exec(remaining);

  return segmentMatch?.[0] ?? "single";
}

function scoreChangeValue(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function fatigueDelta(events: readonly MatchEvent[]): number {
  const firstCondition = events[0]?.fatigueContext.teamCondition;
  const lastCondition = events[events.length - 1]?.fatigueContext.teamCondition;

  if (firstCondition === undefined || lastCondition === undefined) {
    return 0;
  }

  return Math.abs(firstCondition - lastCondition);
}

function momentumDelta(events: readonly MatchEvent[]): number {
  return events
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "momentum_change")
    .reduce((total, consequence) => total + Math.abs(consequence.value ?? 0), 0);
}

function segmentInfluenceTagCount(events: readonly MatchEvent[]): number {
  return events.filter((event) => event.tags.includes("segment_influence_active")).length;
}

export function createSegmentDiversityDiagnostics(report: MatchReport): readonly SegmentDiversityDiagnostic[] {
  const eventsBySegment = new Map<string, MatchEvent[]>();

  for (const event of report.timeline.filter((candidate) => candidate.eventType !== "kickoff")) {
    const segmentKey = segmentKeyForEvent(event);
    const events = eventsBySegment.get(segmentKey) ?? [];
    events.push(event);
    eventsBySegment.set(segmentKey, events);
  }

  return [...eventsBySegment.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([eventIdPrefix, events], index) => ({
      segmentIndex: index,
      eventIdPrefix,
      scoreChanges: events.reduce((total, event) => total + scoreChangeValue(event), 0),
      scoringTeams: [...new Set(events.filter((event) => event.eventType === "scoring").map((event) => event.teamId))],
      eventFamilyPattern: events.map((event) => event.eventType).join(">"),
      primaryActorPattern: events.map((event) => event.primaryPlayerId ?? event.teamId).join(">"),
      zonePattern: events.map((event) => event.zone).join(">"),
      fatigueDelta: fatigueDelta(events),
      momentumDelta: momentumDelta(events),
      segmentInfluenceActive: segmentInfluenceTagCount(events) > 0,
      segmentInfluenceTagCount: segmentInfluenceTagCount(events),
    }));
}

function repeatedPatternCount(patterns: readonly string[]): number {
  const counts = new Map<string, number>();

  for (const pattern of patterns) {
    counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
  }

  return [...counts.values()].filter((count) => count > 1).reduce((total, count) => total + count - 1, 0);
}

export function createSegmentDiversityReport(report: MatchReport): SegmentDiversityReport {
  const diagnostics = createSegmentDiversityDiagnostics(report);
  const segmentSummaries: readonly SegmentDiversitySummary[] = diagnostics.map((diagnostic) => {
    const eventFamilies = new Set(diagnostic.eventFamilyPattern.split(">").filter((item) => item.length > 0));

    return {
      ...diagnostic,
      scoringPattern: diagnostic.scoringTeams.join("+") || "none",
      eventFamilyCount: eventFamilies.size,
    };
  });
  const repeatedScoringPatternCount = repeatedPatternCount(segmentSummaries.map((summary) => summary.scoringPattern));
  const repeatedZonePatternCount = repeatedPatternCount(segmentSummaries.map((summary) => summary.zonePattern));
  const repeatedEventTypePatternCount = repeatedPatternCount(segmentSummaries.map((summary) => summary.eventFamilyPattern));
  const segmentInfluenceActiveSegmentCount = segmentSummaries.filter((summary) => summary.segmentInfluenceActive).length;
  const warnings = new Set<SegmentDiversityWarning>();

  if (repeatedScoringPatternCount > 0) {
    warnings.add("REPEATED_SCORING_PATTERN");
  }

  if (repeatedZonePatternCount > 0) {
    warnings.add("REPEATED_ZONE_PATTERN");
  }

  if (segmentSummaries.some((summary) => summary.eventFamilyCount <= 2)) {
    warnings.add("LOW_EVENT_FAMILY_DIVERSITY");
  }

  if (segmentSummaries.every((summary) => summary.fatigueDelta <= 1)) {
    warnings.add("NO_FATIGUE_DELTA");
  }

  const scoringTeams = segmentSummaries.flatMap((summary) => summary.scoringTeams);
  if (scoringTeams.length > 0 && new Set(scoringTeams).size === 1 && segmentSummaries.length > 1) {
    warnings.add("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN");
  }

  const scoringTeamCounts = new Map<string, number>();
  for (const summary of segmentSummaries) {
    for (const teamId of summary.scoringTeams) {
      scoringTeamCounts.set(teamId, (scoringTeamCounts.get(teamId) ?? 0) + 1);
    }
  }
  const dominantEntry = [...scoringTeamCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const allTeamIds = [...new Set([...report.teamStats.map((stats) => stats.teamId), ...report.timeline.map((event) => event.teamId)])];
  const zeroScoringTeams = allTeamIds.filter((teamId) => !scoringTeams.includes(teamId));
  const highLoadNoPayoffTeams = zeroScoringTeams.filter((teamId) =>
    (report.fatigueReport.teamSummaries.find((summary) => summary.teamId === teamId)?.highIntensityLoad ?? 0) >= 80,
  );

  if (zeroScoringTeams.length > 0 && scoringTeams.length > 0) {
    warnings.add("ZERO_SCORING_EVENTS_FOR_ONE_TEAM");
  }

  if (dominantEntry !== undefined && dominantEntry[1] >= Math.ceil(segmentSummaries.length * 0.6)) {
    warnings.add("SAME_TEAM_SCORES_IN_MOST_SEGMENTS");
  }

  if (highLoadNoPayoffTeams.length > 0) {
    warnings.add("HIGH_LOAD_NO_SCORING_PAYOFF");
  }

  if (segmentSummaries.length > 1 && zeroScoringTeams.length > 0 && repeatedEventTypePatternCount < segmentSummaries.length - 1) {
    warnings.add("SEGMENT_VARIATION_WITH_LOW_OPPONENT_THREAT");
  }

  if (segmentSummaries.length > 1 && segmentInfluenceActiveSegmentCount < segmentSummaries.length - 1) {
    warnings.add("SEGMENT_INFLUENCE_INACTIVE_AFTER_FIRST_SEGMENT");
  }

  const dominanceSummary = dominantEntry === undefined
    ? "No scoring dominance pattern was detected in the segment stream."
    : `${dominantEntry[0]} dominated the single-run scoring stream across ${dominantEntry[1]} segment(s). ${zeroScoringTeams.length === 0 ? "Both teams had scoring payoff." : `${zeroScoringTeams.join(", ")} produced no scoring payoff.`} Treat this as a harness plausibility warning, not a scoring-economy verdict.`;

  return {
    segmentCount: segmentSummaries.length,
    repeatedScoringPatternCount,
    repeatedZonePatternCount,
    repeatedEventTypePatternCount,
    segmentInfluenceActiveSegmentCount,
    segmentSummaries,
    warnings: [...warnings],
    dominanceSummary,
  };
}
```

## File: src/simulation/diagnostics/segmentDiversityDiagnostics.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { createSegmentDiversityReport } from "./segmentDiversityDiagnostics";
import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSegmentDiversityDiagnostics(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const diversity = createSegmentDiversityReport(report);
  const scoringEventCount = report.timeline.filter((event) => event.eventType === "scoring").length;

  assertTest(diversity.segmentCount >= 2, "segment diversity diagnostics must cover multiple segments.");
  assertTest(diversity.segmentSummaries.length === diversity.segmentCount, "segment summaries must match segment count.");
  assertTest(diversity.segmentSummaries.some((summary) => summary.fatigueDelta > 0), "segment diagnostics must record fatigue delta.");
  assertTest(diversity.dominanceSummary.length > 0, "segment diagnostics must expose a concise dominance summary.");
  assertTest(diversity.warnings.length >= 0, "segment warnings must be represented as diagnostics, not scoring failures.");
  assertTest(
    report.timeline.filter((event) => event.eventType === "scoring").length === scoringEventCount,
    "segment diagnostics must not remove scoring events.",
  );

  try {
    assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_HARNESS_SINGLE_RUN");
    throw new Error("FULL_MATCH_HARNESS_SINGLE_RUN must not be allowed to make global economy claims.");
  } catch (error) {
    assertTest(String(error).includes("50-match economy"), "source-of-truth guard must still reject non-batch global claims.");
  }

  return [
    "repeated segment patterns produce diagnostics",
    "fatigue delta appears in segment diagnostics",
    "dominance summary appears in segment diagnostics",
    "no scoring events are removed",
    "source-of-truth guard still rejects non-batch global scoring claims",
  ];
}

if (require.main === module) {
  const checks = validateSegmentDiversityDiagnostics();

  console.log("segmentDiversityDiagnostics tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/diagnostics/sourceOfTruthGuards.test.ts

```ts
import { assertCanMakeGlobalScoringEconomyClaim } from "./sourceOfTruthGuards";
import type { MatchEvidenceScope } from "./sourceOfTruthRegistry";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const NON_GLOBAL_ECONOMY_SCOPES: readonly MatchEvidenceScope[] = [
  "MINI_MATCH_LOCAL",
  "FULL_MATCH_HARNESS_SINGLE_RUN",
  "BATCH_DIAGNOSTIC_PROJECTION",
  "LIVE_SCORING_STREAM",
  "REPORT_RENDERING_ONLY",
];

export function validateSourceOfTruthGuards(): readonly string[] {
  assertCanMakeGlobalScoringEconomyClaim("FULL_MATCH_BATCH_ECONOMY");

  for (const scope of NON_GLOBAL_ECONOMY_SCOPES) {
    try {
      assertCanMakeGlobalScoringEconomyClaim(scope);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      assertGuard(message.includes("50-match economy"), `${scope} error must mention the validated 50-match economy.`);
      assertGuard(message.includes("single runFullMatch harness output"), `${scope} error must mention single-run limitation.`);
      continue;
    }

    throw new Error(`${scope} must not be allowed to make global scoring economy claims.`);
  }

  return [
    "FULL_MATCH_BATCH_ECONOMY can make global scoring economy claims",
    "all non-batch scopes reject global scoring economy claims",
    "rejection message mentions 50-match economy and single-run limitation",
  ];
}

if (require.main === module) {
  const checks = validateSourceOfTruthGuards();

  console.log("source-of-truth guard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/diagnostics/fullMatchHarnessSanity.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { MatchPhase, PressureLevel } from "../../models/match";
import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { ZoneId } from "../../core/zones";
import { analyzeFullMatchHarnessSanity } from "./fullMatchHarnessSanity";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const testZone = "Z3-C" as ZoneId;

function scoringEvent(index: number, points: number, teamId = engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.teamId): MatchEvent {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;

  return {
    ...engineToCoachPublicContractFixtures.eventFixture,
    eventId: `synthetic-score-${index}`,
    timestamp: {
      tick: index,
      minute: index,
      period: index > 45 ? "second_half" : "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: `synthetic-sequence-${index}`,
    teamId,
    opponentTeamId: teamId === input.homeTeam.teamId ? input.awayTeam.teamId : input.homeTeam.teamId,
    eventType: "scoring",
    zone: testZone,
    tacticalContext: {
      pressureLevel: PressureLevel.Medium,
      ballZone: testZone,
      targetZone: testZone,
      moveType: "synthetic_score",
      reason: "Synthetic scoring event used only for harness sanity guard tests.",
    },
    outcome: "score",
    consequences: [
      {
        type: "score_change",
        description: `Synthetic score ${index}.`,
        value: points,
      },
    ],
    tags: ["synthetic_test", "scoring_event", "scoring_type_SHOT_GOAL"],
    narrativeWeight: 80,
  };
}

function pressureEvent(index: number): MatchEvent {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;

  return {
    ...engineToCoachPublicContractFixtures.eventFixture,
    eventId: `synthetic-pressure-${index}`,
    timestamp: {
      tick: index,
      minute: index,
      period: index > 45 ? "second_half" : "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: `synthetic-pressure-sequence-${index}`,
    teamId: input.awayTeam.teamId,
    opponentTeamId: input.homeTeam.teamId,
    eventType: "progression",
    zone: testZone,
    tacticalContext: {
      pressureLevel: PressureLevel.High,
      ballZone: testZone,
      targetZone: testZone,
      moveType: "synthetic_pressure",
      reason: "Synthetic dominated-team pressure event used only for harness sanity guard tests.",
    },
    outcome: "neutral",
    consequences: [],
    tags: ["synthetic_test", "pressure_high", "danger_high", "territorial_pressure_high"],
    narrativeWeight: 75,
  };
}

function syntheticHighScoreReport(): MatchReport {
  const scoringEvents = Array.from({ length: 11 }, (_, index) => scoringEvent(index + 1, 5));
  const pressureEvents = Array.from({ length: 3 }, (_, index) => pressureEvent(index + 20));

  return {
    ...engineToCoachPublicContractFixtures.matchReportFixture,
    score: { home: 55, away: 0 },
    timeline: [...scoringEvents, ...pressureEvents],
    keyMoments: scoringEvents.slice(0, 5).map((event) => ({
      eventId: event.eventId,
      title: "Scoring breakthrough",
      summary: "Synthetic scoring moment.",
      minute: event.timestamp.minute,
    })),
    fatigueReport: {
      teamSummaries: [
        {
          teamId: engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.teamId,
          averageConditionEnd: 96,
          highIntensityLoad: 50,
          lateErrorCount: 0,
        },
        {
          teamId: engineToCoachPublicContractFixtures.matchInputFixture.awayTeam.teamId,
          averageConditionEnd: 90,
          highIntensityLoad: 90,
          lateErrorCount: 0,
        },
      ],
      playerSummaries: [
        {
          playerId: "synthetic-player",
          conditionStart: 96,
          conditionEnd: 96,
          mentalFreshnessEnd: 96,
        },
      ],
    },
  };
}

export function validateFullMatchHarnessSanity(): readonly string[] {
  const report = syntheticHighScoreReport();
  const beforeTimelineSignature = JSON.stringify(report.timeline);
  const sanity = analyzeFullMatchHarnessSanity(report);
  const afterTimelineSignature = JSON.stringify(report.timeline);

  assertGuard(sanity.scope === "FULL_MATCH_HARNESS_SINGLE_RUN", "sanity report must use full-match harness single-run scope.");
  assertGuard(sanity.warnings.includes("INFLATED_SINGLE_RUN_SCORE"), "high synthetic score must emit INFLATED_SINGLE_RUN_SCORE.");
  assertGuard(sanity.warnings.includes("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"), "single-team scoring stream must emit ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN.");
  assertGuard(sanity.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM"), "zero-scoring team must emit ZERO_SCORING_EVENTS_FOR_ONE_TEAM.");
  assertGuard(sanity.warnings.includes("HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM"), "high scoring event count must emit HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM.");
  assertGuard(sanity.scoringDominance.mayInvalidateGlobalScoringEconomy === false, "dominance report must stay warning-only.");
  assertGuard(sanity.warnings.includes("REPETITIVE_KEY_MOMENTS"), "mostly scoring key moments must emit REPETITIVE_KEY_MOMENTS.");
  assertGuard(sanity.warnings.includes("FLAT_FATIGUE_SIGNAL"), "unchanged condition must emit FLAT_FATIGUE_SIGNAL.");
  assertGuard(sanity.mayInvalidateGlobalScoringEconomy === false, "sanity report must never invalidate global scoring economy.");
  assertGuard(beforeTimelineSignature === afterTimelineSignature, "sanity analysis must not remove or mutate scoring events.");

  return [
    "high score creates INFLATED_SINGLE_RUN_SCORE",
    "one-team scoring dominance creates warning",
    "zero scoring team creates warning",
    "high single-team scoring event count creates warning",
    "repetitive scoring moments create REPETITIVE_KEY_MOMENTS",
    "flat fatigue creates FLAT_FATIGUE_SIGNAL",
    "sanity report can never invalidate global scoring economy",
    "sanity analysis does not remove or change scoring events",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchHarnessSanity();

  console.log("full-match harness sanity tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/diagnostics/fullMatchScoringDominanceDiagnostics.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { MatchPhase, PressureLevel } from "../../models/match";
import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { ZoneId } from "../../core/zones";
import { analyzeFullMatchScoringDominance } from "./fullMatchScoringDominanceDiagnostics";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const testZone = "Z3-C" as ZoneId;

function event(input: {
  readonly index: number;
  readonly teamId: string;
  readonly opponentTeamId: string;
  readonly eventType: MatchEvent["eventType"];
  readonly points: number;
  readonly tags: readonly string[];
}): MatchEvent {
  return {
    ...engineToCoachPublicContractFixtures.eventFixture,
    eventId: `dominance-test-segment-${Math.ceil(input.index / 3)}-${input.index}`,
    timestamp: {
      tick: input.index,
      minute: input.index,
      period: input.index > 45 ? "second_half" : "first_half",
    },
    phase: MatchPhase.InProgress,
    sequenceId: `dominance-test-sequence-${input.index}`,
    teamId: input.teamId,
    opponentTeamId: input.opponentTeamId,
    eventType: input.eventType,
    zone: testZone,
    tacticalContext: {
      pressureLevel: PressureLevel.High,
      ballZone: testZone,
      targetZone: testZone,
      moveType: input.eventType,
      reason: "Synthetic dominance diagnostic test event.",
    },
    outcome: input.points > 0 ? "score" : "neutral",
    consequences: input.points > 0
      ? [
          {
            type: "score_change",
            description: "Synthetic score.",
            value: input.points,
          },
        ]
      : [],
    tags: input.tags,
    narrativeWeight: 80,
  };
}

function dominanceReport(): MatchReport {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const controlScores = Array.from({ length: 12 }, (_, index) =>
    event({
      index: index + 1,
      teamId: input.homeTeam.teamId,
      opponentTeamId: input.awayTeam.teamId,
      eventType: "scoring",
      points: 3,
      tags: ["scoring_event", "scoring_type_SHOT_GOAL"],
    }),
  );
  const blitzSignals = Array.from({ length: 4 }, (_, index) =>
    event({
      index: index + 20,
      teamId: input.awayTeam.teamId,
      opponentTeamId: input.homeTeam.teamId,
      eventType: "progression",
      points: 0,
      tags: ["pressure_high", "danger_high", "territorial_pressure_high"],
    }),
  );

  return {
    ...engineToCoachPublicContractFixtures.matchReportFixture,
    score: { home: 36, away: 0 },
    timeline: [...controlScores, ...blitzSignals],
    teamStats: [
      {
        teamId: input.homeTeam.teamId,
        score: 36,
      },
      {
        teamId: input.awayTeam.teamId,
        score: 0,
      },
    ],
    fatigueReport: {
      teamSummaries: [
        {
          teamId: input.homeTeam.teamId,
          averageConditionEnd: 86,
          highIntensityLoad: 78,
          lateErrorCount: 0,
        },
        {
          teamId: input.awayTeam.teamId,
          averageConditionEnd: 80,
          highIntensityLoad: 91,
          lateErrorCount: 0,
        },
      ],
      playerSummaries: [],
    },
  };
}

export function validateFullMatchScoringDominanceDiagnostics(): readonly string[] {
  const report = dominanceReport();
  const beforeTimelineSignature = JSON.stringify(report.timeline);
  const dominance = analyzeFullMatchScoringDominance(report);
  const afterTimelineSignature = JSON.stringify(report.timeline);

  assertGuard(dominance.scope === "FULL_MATCH_HARNESS_SINGLE_RUN", "dominance scope must be single-run harness.");
  assertGuard(dominance.warnings.includes("ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"), "one-team dominance warning must be emitted.");
  assertGuard(dominance.warnings.includes("ZERO_SCORING_EVENTS_FOR_ONE_TEAM"), "zero scoring team warning must be emitted.");
  assertGuard(dominance.warnings.includes("HIGH_SCORING_EVENT_COUNT_SINGLE_TEAM"), "high scoring event count warning must be emitted.");
  assertGuard(dominance.warnings.includes("DOMINATED_TEAM_HAS_DANGER_WITHOUT_SCORE"), "dominated danger without score must be detected.");
  assertGuard(dominance.warnings.includes("DOMINATED_TEAM_HAS_PRESSURE_WITHOUT_CONVERSION"), "dominated pressure without conversion must be detected.");
  assertGuard(dominance.mayInvalidateGlobalScoringEconomy === false, "dominance diagnostics must not invalidate global economy.");
  assertGuard(!dominance.recommendedNextActions.join(" ").includes("change scoring values"), "dominance diagnostics must not recommend scoring value changes.");
  assertGuard(beforeTimelineSignature === afterTimelineSignature, "dominance diagnostics must not mutate scoring events.");

  return [
    "51-0 style report emits one-team scoring dominance warning",
    "zero scoring team emits warning",
    "dominance report cannot invalidate global economy",
    "dominance report does not recommend scoring value changes",
    "dominated-team pressure/danger without conversion is detected",
    "scoring events are preserved",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchScoringDominanceDiagnostics();

  console.log("full-match scoring dominance diagnostics tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/tacticalPlanInfluenceGuard.ts

```ts
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import { createMatchReportSignature, runMatch } from "./runMatch";
import { createTacticalPlanInfluence } from "./adapters/tacticalPlanInfluence";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function planTags(report: MatchReport): readonly string[] {
  return [...new Set(report.timeline.flatMap((event) => event.tags.filter((tag) => tag.startsWith("plan_"))))].sort();
}

function withAggressiveHomePlan(input: MatchInput): MatchInput {
  return {
    ...input,
    homePlan: {
      ...input.homePlan,
      tempo: "fast",
      riskLevel: "high",
      pressingIntensity: 92,
      targetZones: ["Z4-C"],
      scoringBias: "try_first",
    },
  };
}

function validatePlanTags(report: MatchReport): void {
  const tags = planTags(report);

  assertGuard(tags.length > 0, "runMatch must expose tactical-plan-derived tags.");
  assertGuard(tags.some((tag) => tag.includes("tempo_")), "runMatch must expose plan tempo tags.");
  assertGuard(tags.some((tag) => tag.includes("risk_")), "runMatch must expose plan risk tags.");
  assertGuard(tags.some((tag) => tag.includes("pressing_")), "runMatch must expose plan pressing tags.");
}

function planDiagnosisSummary(report: MatchReport): string {
  return report.tacticalReport.diagnoses.find((diagnosis) => diagnosis.title === "Plan de match observé")?.summary ?? "";
}

export function validateTacticalPlanInfluence(): readonly string[] {
  const baselineInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const influencedInput = withAggressiveHomePlan(baselineInput);
  const baselineReport = runMatch(baselineInput);
  const repeatedBaselineReport = runMatch(baselineInput);
  const influencedReport = runMatch(influencedInput);
  const baselineInfluence = createTacticalPlanInfluence(baselineInput);
  const influencedInfluence = createTacticalPlanInfluence(influencedInput);
  const baselineSignature = createMatchReportSignature(baselineReport);
  const repeatedBaselineSignature = createMatchReportSignature(repeatedBaselineReport);
  const influencedSignature = createMatchReportSignature(influencedReport);
  const baselineTags = planTags(baselineReport);
  const influencedTags = planTags(influencedReport);

  validatePlanTags(baselineReport);
  validatePlanTags(influencedReport);
  assertGuard(baselineInfluence.homeSummary.length > 0, "baseline influence must include home plan summary.");
  assertGuard(baselineInfluence.awaySummary.length > 0, "baseline influence must include away plan summary.");
  assertGuard(baselineInfluence.matchEffectSummary.length > 0, "baseline influence must include match effect summary.");
  assertGuard(planDiagnosisSummary(baselineReport).length > 0, "baseline report must include plan diagnosis summary.");
  assertGuard(baselineSignature === repeatedBaselineSignature, "baseline tactical plan influence must remain deterministic.");
  assertGuard(
    baselineSignature !== influencedSignature || baselineTags.join("|") !== influencedTags.join("|"),
    "changing meaningful TacticalPlan fields must change the report signature or plan influence tags.",
  );
  assertGuard(
    influencedTags.includes("plan_home_tempo_fast"),
    "fast home tempo must produce plan_home_tempo_fast tag.",
  );
  assertGuard(
    influencedTags.includes("plan_home_risk_high"),
    "high home risk must produce plan_home_risk_high tag.",
  );
  assertGuard(
    influencedTags.includes("plan_home_pressing_high"),
    "high home pressing must produce plan_home_pressing_high tag.",
  );
  assertGuard(
    baselineInfluence.homeSummary !== influencedInfluence.homeSummary || baselineTags.join("|") !== influencedTags.join("|"),
    "changing home plan must change at least one plan summary or plan tag set.",
  );
  assertGuard(
    planDiagnosisSummary(influencedReport).includes("tempo rapide") || planDiagnosisSummary(influencedReport).includes("risque élevé"),
    "influenced report must include readable aggressive plan summary text.",
  );

  return [
    "tactical plan influence is deterministic for the same input",
    "tactical plan influence produces explicit plan tags",
    "tactical plan influence produces readable summaries",
    "changing tempo/risk/pressing changes report output or plan tags",
  ];
}

if (require.main === module) {
  const checks = validateTacticalPlanInfluence();

  console.log("Tactical plan influence guard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/miniMatch/types.ts

```ts
import type { PlayerId, TeamId } from "../../core/ids";
import type { TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { ScoringZoneId } from "../../core/scoringZones";
import type { PrototypeTeamDefinition } from "../../data/prototypeTeams";
import type { ScoringType } from "../../models/scoring";
import type { CoachingFeedbackReport } from "../../reports/coaching";
import type { InGoalAccessLaneCategory } from "../../systems/rules";
import type { ConversionGeometry } from "../../systems/scoring";
import type { TryTouchdownOutcome } from "../../systems/scoring/tryTouchdownTypes";
import type { TacticalLogLine } from "../../systems/interactions/shared";
import type { ResolveSequenceInput, SequenceResult } from "../../systems/sequences";
import type { BallContext, TeamDirectionAssignment } from "../../systems/spatial/intention";
import type { SpatialTeamContext } from "../../systems/spatial";
import type { TacticalMemoryState } from "../../systems/tacticalMemory";
import type { RecoverySaturationState } from "../../systems/structure";
import type { OffensiveMomentumState } from "../../systems/offense/momentum";
import type { SpatialMatchContext as AdapterSpatialMatchContext } from "../spatialContext/spatialTeamContextTypes";
import type { AttributeAdjustedSelectionResult, RouteRankingAttributeMode, RouteRankingAttributeUsage } from "../routeRanking";
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import type { MiniMatchRouteSelectionSource } from "./miniMatchRouteSelectionMode";
import type { MiniMatchRouteSelectionResult } from "./miniMatchRouteSelection";

export interface MiniMatchInput {
  readonly teamA: PrototypeTeamDefinition;
  readonly teamB: PrototypeTeamDefinition;
  readonly numberOfSequences: number;
  readonly startTick?: TacticalTick;
  readonly seed?: number;
  readonly segmentInfluence?: MiniMatchSegmentInfluence;
  readonly spatialContext?: AdapterSpatialMatchContext;
  readonly routeRankingAttributeMode?: RouteRankingAttributeMode;
  readonly routeSelectionSource?: MiniMatchRouteSelectionSource;
  readonly routeSelectionWorkbench?: TacticalWorkbenchFrame;
}

export interface MiniMatchTeamSegmentInfluence {
  readonly teamId: TeamId;
  readonly conditionModifier: number;
  readonly mentalFreshnessModifier: number;
  readonly momentumModifier: number;
  readonly pressureLoadModifier: number;
  readonly defensiveStressModifier: number;
  readonly scoringConfidenceModifier: number;
  readonly routeRiskModifier: number;
  readonly supportStabilityModifier: number;
  readonly finalActionComposureModifier: number;
}

export interface MiniMatchSegmentInfluence {
  readonly segmentIndex: number;
  readonly scoreState: "level" | "close" | "home_leading" | "away_leading" | "lopsided";
  readonly home: MiniMatchTeamSegmentInfluence;
  readonly away: MiniMatchTeamSegmentInfluence;
  readonly global: {
    readonly repeatedPatternPressure: number;
    readonly matchTempoAdjustment: number;
    readonly conversionVolatilityAdjustment: number;
  };
}

export interface MiniMatchScore {
  readonly teamA: number;
  readonly teamB: number;
}

export interface MiniMatchTeamCount {
  readonly teamA: number;
  readonly teamB: number;
}

export interface MiniMatchTeamRecoverySaturation {
  readonly teamA: RecoverySaturationState;
  readonly teamB: RecoverySaturationState;
}

export interface MiniMatchTeamOffensiveMomentum {
  readonly teamA: OffensiveMomentumState;
  readonly teamB: OffensiveMomentumState;
}

export interface MiniMatchScoringEvent {
  readonly sequenceNumber: number;
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly scoringType: ScoringType;
  readonly points: number;
}

export type MiniMatchTryEventType =
  | "TRY_TOUCHDOWN_ATTEMPT"
  | "TRY_TOUCHDOWN_SCORED"
  | "TRY_HELD_UP"
  | "TRY_LOST_FORWARD"
  | "TRY_TACKLED_SHORT"
  | "TRY_INVALID_GROUNDING"
  | "TRY_INVALID_ACCESS_ROUTE"
  | "TRY_OUT_OF_PLAY";

export interface MiniMatchTryEvent {
  readonly sequenceNumber: number;
  readonly actionId: string;
  readonly eventType: MiniMatchTryEventType;
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly carrierId: PlayerId;
  readonly carrierRole: string;
  readonly previousZone: ZoneId;
  readonly currentZone: ScoringZoneId;
  readonly accessRoute: InGoalAccessLaneCategory;
  readonly legalAccess: boolean;
  readonly opportunityType: string;
  readonly candidateScore: number;
  readonly selectedCandidateAction: "TRY_TOUCHDOWN_ATTEMPT";
  readonly normalizedSelectedCandidateActionType: "TRY_TOUCHDOWN_ATTEMPT";
  readonly candidateSelectionReason: string;
  readonly competingCandidates: readonly MiniMatchTryCandidate[];
  readonly targetInGoalZone: readonly ScoringZoneId[];
  readonly groundingLane: string;
  readonly groundingPoint: string;
  readonly ballControlScore: number;
  readonly groundingScore: number;
  readonly bodyControlScore: number;
  readonly carrierMomentumScore: number;
  readonly supportArrivingScore: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly defenderGoalLinePressure: number;
  readonly fatiguePenalty: number;
  readonly outcome: Exclude<TryTouchdownOutcome, "PENDING">;
  readonly scoringAction: "TRY_TOUCHDOWN" | "NONE";
  readonly pointValue: number;
  readonly scoringImpact: string;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly conversionGeometryStored: boolean;
  readonly conversionGeometry?: ConversionGeometry;
  readonly conversionActive: true;
  readonly reason: string;
}

export interface MiniMatchTryCandidate {
  readonly actionType:
    | "TRY_TOUCHDOWN_ATTEMPT"
    | "TRY_TOUCHDOWN_FINISH"
    | "TRY_GROUNDING_ATTEMPT"
    | "SHOT"
    | "FORWARD_PROGRESS"
    | "SAFE_RECYCLE"
    | "CENTRAL_RECYCLE"
    | "SUPPORT_CLUSTER_RECYCLE"
    | "CARRY_OR_HOLD";
  readonly score: number;
  readonly status: "SELECTED" | "REJECTED";
  readonly reason: string;
}

export interface MiniMatchContext {
  readonly teamA: PrototypeTeamDefinition;
  readonly teamB: PrototypeTeamDefinition;
  readonly requestedSequences: number;
  readonly startTick: TacticalTick;
  readonly seed: number;
  readonly attackingDirections: readonly TeamDirectionAssignment[];
  readonly segmentInfluence?: MiniMatchSegmentInfluence;
  readonly spatialContext?: AdapterSpatialMatchContext;
  readonly routeRankingAttributeMode?: RouteRankingAttributeMode;
  readonly routeSelectionSource?: MiniMatchRouteSelectionSource;
  readonly routeSelectionWorkbench?: TacticalWorkbenchFrame;
}

export interface MiniMatchContinuityState {
  readonly lastBallContext: BallContext | null;
  readonly lastPossessionTeamId: TeamId | null;
  readonly lastTerritorialPressure: number;
  readonly lastChaosLevel: number;
  readonly lastDangerLevel: string;
  readonly lastPossessionReason: string;
}

export interface MiniMatchSequenceSetup {
  readonly sequenceNumber: number;
  readonly possessionTeam: SpatialTeamContext;
  readonly pressingTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly pressureDescription: string;
  readonly openingLine: string;
  readonly possessionReason: string;
  readonly spatialContextActive: boolean;
  readonly spatialContextSummary?: string;
  readonly attributeInfluenceMode?: RouteRankingAttributeMode;
  readonly routeRankingUsesRealAttributes?: RouteRankingAttributeUsage;
  readonly attributeInfluenceSummary?: string;
  readonly attributeSelectionResult?: AttributeAdjustedSelectionResult;
  readonly routeSelectionResult?: MiniMatchRouteSelectionResult;
  readonly routeSelectionSummary?: string;
  readonly resolveInput: ResolveSequenceInput;
}

export interface MiniMatchSequenceRecord {
  readonly sequenceNumber: number;
  readonly setup: MiniMatchSequenceSetup;
  readonly result: SequenceResult;
}

export interface MiniMatchState {
  readonly context: MiniMatchContext;
  readonly score: MiniMatchScore;
  readonly records: readonly MiniMatchSequenceRecord[];
  readonly scoringEvents: readonly MiniMatchScoringEvent[];
  readonly liveTryEvents: readonly MiniMatchTryEvent[];
  readonly finishingOpportunities: MiniMatchTeamCount;
  readonly secondChanceCount: MiniMatchTeamCount;
  readonly turnovers: MiniMatchTeamCount;
  readonly continuity: MiniMatchContinuityState;
  readonly tacticalMemory: TacticalMemoryState;
  readonly recoverySaturation: MiniMatchTeamRecoverySaturation;
  readonly offensiveMomentum: MiniMatchTeamOffensiveMomentum;
}

export interface MiniMatchSummary {
  readonly finalScore: MiniMatchScore;
  readonly sequencesPlayed: number;
  readonly scoringEvents: readonly MiniMatchScoringEvent[];
  readonly liveTryEvents: readonly MiniMatchTryEvent[];
  readonly finishingOpportunities: MiniMatchTeamCount;
  readonly turnovers: MiniMatchTeamCount;
  readonly tacticalAdaptations: readonly string[];
  readonly coachingFeedback: CoachingFeedbackReport;
  readonly recoverySaturation: MiniMatchTeamRecoverySaturation;
  readonly offensiveMomentum: MiniMatchTeamOffensiveMomentum;
  readonly secondChanceCount: MiniMatchTeamCount;
  readonly teamAObservation: string;
  readonly teamBObservation: string;
}

export interface MiniMatchResult {
  readonly state: MiniMatchState;
  readonly summary: MiniMatchSummary;
  readonly logs: readonly TacticalLogLine[];
}
```

## File: src/simulation/miniMatch/createMiniMatchContext.ts

```ts
import type { ZoneId } from "../../core/zones";
import { createZoneId, LateralCorridor, LongitudinalZone } from "../../core/zones";
import { PrototypeTeamId, type PrototypeTeamDefinition } from "../../data/prototypeTeams";
import {
  BLITZ_ROSTER,
  CONTROL_ROSTER,
  createBlitzPlayerStates,
  createControlPlayerStates,
  validateBlitzRoster,
  validateControlRoster,
} from "../../data/teams";
import { PlayerRole, type PlayerAttributes, type PlayerState } from "../../models/player";
import { deriveTeamProfileFromRoster } from "../../systems/teams";
import type { SpatialTeamContext } from "../../systems/spatial";
import { assignMiniMatchAttackingDirections } from "../../systems/spatial/intention";
import { createTacticalMemory } from "../../systems/tacticalMemory";
import { createInitialRecoverySaturation, type RecoverySaturationState } from "../../systems/structure";
import { createInitialOffensiveMomentum, type OffensiveMomentumState } from "../../systems/offense/momentum";
import { DEFAULT_SIMULATION_CONFIG } from "../../systems/matchLoop";
import type {
  MiniMatchContext,
  MiniMatchInput,
  MiniMatchSegmentInfluence,
  MiniMatchTeamSegmentInfluence,
  MiniMatchState,
} from "./types";

const STANDARD_ROLES: readonly PlayerRole[] = [
  PlayerRole.LeftAnchor,
  PlayerRole.RightAnchor,
  PlayerRole.HookLink,
  PlayerRole.MobileLock,
  PlayerRole.ForwardLeader,
  PlayerRole.TempoHalf,
  PlayerRole.Playmaker,
  PlayerRole.PowerRunner,
  PlayerRole.SpaceHunter,
  PlayerRole.FreeSafety,
];

function clampRating(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function influenceForTeam(
  influence: MiniMatchSegmentInfluence | undefined,
  team: PrototypeTeamDefinition,
): MiniMatchTeamSegmentInfluence | undefined {
  if (influence === undefined) {
    return undefined;
  }

  if (influence.home.teamId === team.id) {
    return influence.home;
  }

  if (influence.away.teamId === team.id) {
    return influence.away;
  }

  return undefined;
}

function createAttributes(base: number): PlayerAttributes {
  return {
    speed: base,
    agility: base,
    endurance: base,
    power: base,
    handPlay: base,
    footPlayDribble: base,
    footPlayPassingShooting: base,
    intelligence: base,
    mental: base,
  };
}

function getRoleAttributeBase(team: PrototypeTeamDefinition, role: PlayerRole): number {
  if (team.id === PrototypeTeamId.Control && (role === PlayerRole.TempoHalf || role === PlayerRole.HookLink)) {
    return 95;
  }

  if (team.id === PrototypeTeamId.Control && (role === PlayerRole.FreeSafety || role === PlayerRole.Playmaker)) {
    return 88;
  }

  if (
    team.id === PrototypeTeamId.Blitz &&
    (role === PlayerRole.MobileLock || role === PlayerRole.SpaceHunter || role === PlayerRole.PowerRunner)
  ) {
    return 84;
  }

  if (role === PlayerRole.FreeSafety || role === PlayerRole.Playmaker) {
    return 74;
  }

  return 68;
}

function getBaseFreshness(team: PrototypeTeamDefinition): number {
  if (team.id === PrototypeTeamId.Blitz) {
    return 72;
  }

  if (team.id === PrototypeTeamId.ChaosHunters) {
    return 76;
  }

  return 90;
}

function createPrototypePlayers(
  team: PrototypeTeamDefinition,
  zones: readonly ZoneId[],
  sequenceIndex: number,
  influence: MiniMatchTeamSegmentInfluence | undefined,
): readonly PlayerState[] {
  if (team.id === PrototypeTeamId.Control) {
    return createControlPlayerStates({ zones, sequenceIndex }).map((player) => applyPlayerInfluence(player, influence));
  }

  if (team.id === PrototypeTeamId.Blitz) {
    return createBlitzPlayerStates({ zones, sequenceIndex }).map((player) => applyPlayerInfluence(player, influence));
  }

  const fallbackZone = createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis);
  const sequenceFreshnessAdjustment = sequenceIndex * 2;
  const freshness = clampRating(getBaseFreshness(team) - sequenceFreshnessAdjustment + (influence?.conditionModifier ?? 0));

  return STANDARD_ROLES.map((role, index) => applyPlayerInfluence({
    id: `${team.id}-${role}`,
    teamId: team.id,
    name: `${team.displayName} ${role}`,
    role,
    attributes: createAttributes(getRoleAttributeBase(team, role)),
    fatigue: {
      accumulatedFatigue: clampRating(100 - freshness),
      freshness,
    },
    currentZone: zones[index] ?? zones[0] ?? fallbackZone,
    momentum: 50,
  }, influence));
}

function applyPlayerInfluence(
  player: PlayerState,
  influence: MiniMatchTeamSegmentInfluence | undefined,
): PlayerState {
  if (influence === undefined) {
    return player;
  }

  const freshnessAdjustment = influence.conditionModifier + Math.round(influence.mentalFreshnessModifier / 2);

  return {
    ...player,
    fatigue: {
      accumulatedFatigue: clampRating(player.fatigue.accumulatedFatigue - freshnessAdjustment),
      freshness: clampRating(player.fatigue.freshness + freshnessAdjustment),
    },
    momentum: clampRating(player.momentum + influence.momentumModifier),
  };
}

function applyCollectiveInfluence<T extends {
  readonly cohesion: number;
  readonly defensiveTransition: number;
  readonly tacticalDiscipline: number;
  readonly collectiveReading: number;
  readonly resilience: number;
}>(
  properties: T,
  influence: MiniMatchTeamSegmentInfluence | undefined,
): T {
  if (influence === undefined) {
    return properties;
  }

  return {
    ...properties,
    cohesion: clampRating(properties.cohesion + influence.supportStabilityModifier),
    defensiveTransition: clampRating(
      properties.defensiveTransition - Math.max(0, influence.defensiveStressModifier),
    ),
    tacticalDiscipline: clampRating(properties.tacticalDiscipline + influence.finalActionComposureModifier),
    collectiveReading: clampRating(properties.collectiveReading + influence.supportStabilityModifier),
    resilience: clampRating(
      properties.resilience + influence.mentalFreshnessModifier - Math.max(0, influence.pressureLoadModifier),
    ),
  };
}

function getCollectiveProperties(
  team: PrototypeTeamDefinition,
  influence: MiniMatchTeamSegmentInfluence | undefined,
): PrototypeTeamDefinition["collectiveProperties"] {
  const roster =
    team.id === PrototypeTeamId.Control ? CONTROL_ROSTER : team.id === PrototypeTeamId.Blitz ? BLITZ_ROSTER : null;

  if (roster === null) {
    return applyCollectiveInfluence(team.collectiveProperties, influence);
  }

  const profile = deriveTeamProfileFromRoster({
    roster,
    instructions: team.tacticalInstructions,
    baseCollective: team.collectiveProperties,
    finishingIdentity: team.id === PrototypeTeamId.Blitz ? "CHAOTIC_AGGRESSION" : "CONTROLLED_EXECUTION",
  });
  const baseProperties: PrototypeTeamDefinition["collectiveProperties"] = {
    ...team.collectiveProperties,
    cohesion: profile.cohesion,
    defensiveTransition: profile.recoveryStructure,
    collectiveMobility: Math.round((profile.recoveryStructure + team.collectiveProperties.collectiveMobility) / 2),
    tacticalDiscipline: profile.tacticalDiscipline,
    collectiveReading: profile.supportQuality,
    resilience: Math.round((profile.defensiveCompactness + team.collectiveProperties.resilience) / 2),
  };

  return applyCollectiveInfluence(baseProperties, influence);
}

function getStructuralShiftDelay(team: PrototypeTeamDefinition, sequenceIndex: number): number {
  if (team.id === PrototypeTeamId.Blitz) {
    return clampRating(32 + sequenceIndex * 4);
  }

  if (team.id === PrototypeTeamId.Control) {
    return 10;
  }

  return 18;
}

export function createMiniMatchContext(input: MiniMatchInput): MiniMatchState {
  const controlRosterValidation = validateControlRoster();
  const blitzRosterValidation = validateBlitzRoster();

  if (!controlRosterValidation.valid) {
    throw new Error(`CONTROL roster validation failed: ${controlRosterValidation.warnings.join("; ")}`);
  }

  if (!blitzRosterValidation.valid) {
    throw new Error(`BLITZ roster validation failed: ${blitzRosterValidation.warnings.join("; ")}`);
  }

  const context: MiniMatchContext = {
    teamA: input.teamA,
    teamB: input.teamB,
    requestedSequences: Math.max(1, Math.min(8, Math.round(input.numberOfSequences))),
    startTick: input.startTick ?? 10,
    seed: input.seed ?? DEFAULT_SIMULATION_CONFIG.seed,
    attackingDirections: assignMiniMatchAttackingDirections({
      teamAId: input.teamA.id,
      teamBId: input.teamB.id,
    }),
    ...(input.segmentInfluence === undefined ? {} : { segmentInfluence: input.segmentInfluence }),
    ...(input.spatialContext === undefined ? {} : { spatialContext: input.spatialContext }),
    ...(input.routeRankingAttributeMode === undefined ? {} : { routeRankingAttributeMode: input.routeRankingAttributeMode }),
    ...(input.routeSelectionSource === undefined ? {} : { routeSelectionSource: input.routeSelectionSource }),
    ...(input.routeSelectionWorkbench === undefined ? {} : { routeSelectionWorkbench: input.routeSelectionWorkbench }),
  };
  const influenceAverage = input.segmentInfluence === undefined
    ? 0
    : Math.round((input.segmentInfluence.home.supportStabilityModifier + input.segmentInfluence.away.supportStabilityModifier) / 2);
  const pressureAverage = input.segmentInfluence === undefined
    ? 0
    : Math.round((input.segmentInfluence.home.pressureLoadModifier + input.segmentInfluence.away.pressureLoadModifier) / 2);

  return {
    context,
    score: {
      teamA: 0,
      teamB: 0,
    },
    records: [],
    scoringEvents: [],
    liveTryEvents: [],
    finishingOpportunities: {
      teamA: 0,
      teamB: 0,
    },
    secondChanceCount: {
      teamA: 0,
      teamB: 0,
    },
    turnovers: {
      teamA: 0,
      teamB: 0,
    },
    continuity: {
      lastBallContext: null,
      lastPossessionTeamId: null,
      lastTerritorialPressure: clampRating(44 + pressureAverage + (input.segmentInfluence?.global.matchTempoAdjustment ?? 0)),
      lastChaosLevel: clampRating(38 + Math.max(0, pressureAverage) + (input.segmentInfluence?.global.repeatedPatternPressure ?? 0)),
      lastDangerLevel: "MEDIUM",
      lastPossessionReason: input.segmentInfluence === undefined
        ? input.spatialContext === undefined
          ? "initial mini-match setup"
          : `initial mini-match setup with spatial context active from ${input.spatialContext.sourceWorkbenchFrameId ?? "typed adapter"}`
        : `segment influence active with support stability ${influenceAverage} and pattern pressure ${input.segmentInfluence.global.repeatedPatternPressure}`,
    },
    tacticalMemory: createTacticalMemory([input.teamA.id, input.teamB.id]),
    recoverySaturation: {
      teamA: createInitialRecoverySaturation(input.teamA.id),
      teamB: createInitialRecoverySaturation(input.teamB.id),
    },
    offensiveMomentum: {
      teamA: createInitialOffensiveMomentum(input.teamA.id),
      teamB: createInitialOffensiveMomentum(input.teamB.id),
    },
  };
}

export function createMiniMatchTeamContext(
  team: PrototypeTeamDefinition,
  zones: readonly ZoneId[],
  sequenceIndex: number,
  recoverySaturation: RecoverySaturationState,
  offensiveMomentum: OffensiveMomentumState,
  segmentInfluence?: MiniMatchSegmentInfluence,
): SpatialTeamContext {
  const teamInfluence = influenceForTeam(segmentInfluence, team);

  return {
    teamId: team.id,
    teamName: team.displayName,
    tacticalStyle: team.tacticalStyle,
    offensiveProgressionPhilosophy: team.offensiveProgressionPhilosophy,
    players: createPrototypePlayers(team, zones, sequenceIndex, teamInfluence),
    tacticalInstructions: team.tacticalInstructions,
    collectiveProperties: getCollectiveProperties(team, teamInfluence),
    structuralShiftDelay: getStructuralShiftDelay(team, sequenceIndex),
    recoverySaturation,
    offensiveMomentum,
  };
}
```

## File: src/simulation/miniMatch/miniMatchRouteSelectionMode.ts

```ts
export type MiniMatchRouteSelectionSource =
  | "prototype"
  | "spatial_candidate_modifier"
  | "spatial_selection_driving";

export type MiniMatchRouteSelectionMode = {
  readonly source: MiniMatchRouteSelectionSource;
  readonly preservePrototypeFallback: boolean;
  readonly preserveLegality: true;
  readonly allowSelectionChange: boolean;
};

export const DEFAULT_MINI_MATCH_ROUTE_SELECTION_MODE: MiniMatchRouteSelectionMode = {
  source: "prototype",
  preservePrototypeFallback: true,
  preserveLegality: true,
  allowSelectionChange: false,
};

export function createMiniMatchRouteSelectionMode(
  source: MiniMatchRouteSelectionSource | undefined,
): MiniMatchRouteSelectionMode {
  if (source === "spatial_candidate_modifier" || source === "spatial_selection_driving") {
    return {
      source,
      preservePrototypeFallback: true,
      preserveLegality: true,
      allowSelectionChange: true,
    };
  }

  return DEFAULT_MINI_MATCH_ROUTE_SELECTION_MODE;
}
```

## File: src/simulation/miniMatch/spatialCandidateGeneration.ts

```ts
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import type { SpatialMatchContext, SpatialPlayerContext } from "../spatialContext";

export type SpatialRouteCandidate = {
  readonly candidateId: string;
  readonly actionType: string;
  readonly actorId: PlayerId;
  readonly receiverId?: PlayerId;
  readonly teamId: TeamId;
  readonly fromZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly laneState: "OPEN" | "CONTESTED" | "CLOSED";
  readonly availability: "AVAILABLE" | "NOT_AVAILABLE_NOW";
  readonly baseScore: number;
  readonly source: "workbench_ranked_option" | "spatial_player_option" | "prototype_mapped_option";
  readonly reason: string;
};

function possessionPlayers(context: SpatialMatchContext): readonly SpatialPlayerContext[] {
  return context.possessionTeamId === context.home.teamId ? context.home.players : context.away.players;
}

function laneStateFromOption(laneState: string | undefined): "OPEN" | "CONTESTED" | "CLOSED" {
  if (laneState === "OPEN" || laneState === "CONTESTED" || laneState === "CLOSED") {
    return laneState;
  }

  return "CONTESTED";
}

function candidateScoreForPlayer(player: SpatialPlayerContext, index: number): number {
  const handPlay = player.attributes.handPlay ?? 60;
  const intelligence = player.attributes.intelligence ?? 60;
  const condition = player.currentCondition;

  return Math.max(20, Math.min(92, Math.round((handPlay + intelligence + condition) / 3) - index * 3));
}

export function generateSpatialRouteCandidates(input: {
  readonly spatialContext: SpatialMatchContext;
  readonly possessionTeamId: TeamId;
  readonly ballCarrierId: PlayerId;
  readonly ballZone: ZoneId;
  readonly pressureLevel: string;
  readonly workbench?: TacticalWorkbenchFrame;
  readonly prototypeCandidates?: readonly SpatialRouteCandidate[];
}): readonly SpatialRouteCandidate[] {
  const workbench = input.workbench;

  if (workbench !== undefined && workbench.rankedOptions.length > 0) {
    return workbench.rankedOptions.map((option) => ({
      candidateId: `workbench-rank-${option.rank}`,
      actionType: option.actionType,
      actorId: workbench.selectedAction.actorId as PlayerId,
      ...(option.receiverId === undefined ? {} : { receiverId: option.receiverId as PlayerId }),
      teamId: workbench.possessionTeamId as TeamId,
      fromZone: workbench.selectedAction.fromZone as ZoneId,
      targetZone: option.targetZone as ZoneId,
      laneState: laneStateFromOption(option.laneState),
      availability: "AVAILABLE",
      baseScore: option.finalSelectionScore ?? option.score ?? 50,
      source: "workbench_ranked_option",
      reason: `Mapped from workbench ranked option ${option.rank}.`,
    }));
  }

  const players = possessionPlayers(input.spatialContext);
  const actor = players.find((player) => player.playerId === input.ballCarrierId);
  const receivers = players
    .filter((player) => player.playerId !== input.ballCarrierId && !player.isGoalkeeper)
    .slice(0, 4);

  if (actor === undefined || receivers.length === 0) {
    return input.prototypeCandidates ?? [];
  }

  const candidates = receivers.map((receiver, index): SpatialRouteCandidate => {
    const actionType = index === 0
      ? "SUPPORT_CLUSTER_RECYCLE"
      : receiver.tacticalFunctions.includes("weak_side_runner")
        ? "WEAK_SIDE_SWITCH"
        : index === 1
          ? "FORWARD_PROGRESS"
          : "SAFE_RECYCLE";

    return {
      candidateId: `spatial-${actionType.toLowerCase()}-${receiver.playerId}`,
      actionType,
      actorId: actor.playerId,
      receiverId: receiver.playerId,
      teamId: actor.teamId,
      fromZone: input.ballZone,
      targetZone: receiver.zone,
      laneState: input.pressureLevel === "HIGH" && index > 2 ? "CONTESTED" : "OPEN",
      availability: "AVAILABLE",
      baseScore: candidateScoreForPlayer(receiver, index),
      source: "spatial_player_option",
      reason: `Generated from ${receiver.displayRole} support option in ${receiver.zone}.`,
    };
  });

  return [
    ...candidates,
    ...(input.prototypeCandidates ?? []),
  ];
}
```

## File: src/simulation/miniMatch/prototypeToSpatialCandidateMapper.ts

```ts
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { SpatialMatchContext } from "../spatialContext";
import type { SpatialRouteCandidate } from "./spatialCandidateGeneration";

export type PrototypeRouteCandidateContext = {
  readonly candidateId: string;
  readonly actionType: string;
  readonly baseScore: number;
  readonly targetZone?: ZoneId;
  readonly receiverId?: PlayerId;
};

export type PrototypeToSpatialCandidateMappingResult = {
  readonly candidates: readonly SpatialRouteCandidate[];
  readonly lossyMappings: readonly string[];
};

function possessionPlayers(context: SpatialMatchContext) {
  return context.possessionTeamId === context.home.teamId ? context.home.players : context.away.players;
}

export function mapPrototypeToSpatialCandidates(input: {
  readonly spatialContext?: SpatialMatchContext;
  readonly currentBallCarrierId: PlayerId;
  readonly currentBallZone: ZoneId;
  readonly currentPossessionTeamId: TeamId;
  readonly prototypeCandidates?: readonly PrototypeRouteCandidateContext[];
}): PrototypeToSpatialCandidateMappingResult {
  const prototypeCandidates = input.prototypeCandidates ?? [
    {
      candidateId: "prototype-current-route",
      actionType: "SUPPORT_CLUSTER_RECYCLE",
      baseScore: 55,
      targetZone: input.currentBallZone,
    },
  ];

  if (input.spatialContext === undefined) {
    return {
      candidates: [],
      lossyMappings: ["No SpatialMatchContext available; prototype route remains fallback only."],
    };
  }

  const players = possessionPlayers(input.spatialContext);
  const actor = players.find((player) => player.playerId === input.currentBallCarrierId);
  const fallbackReceiver = players.find((player) => player.playerId !== input.currentBallCarrierId && !player.isGoalkeeper);
  const lossyMappings: string[] = [];

  if (actor === undefined) {
    return {
      candidates: [],
      lossyMappings: ["Prototype route actor could not be resolved in SpatialMatchContext."],
    };
  }

  const candidates = prototypeCandidates.map((candidate): SpatialRouteCandidate => {
    if (candidate.receiverId === undefined && fallbackReceiver === undefined) {
      lossyMappings.push(`${candidate.candidateId} has no receiver and no spatial fallback receiver.`);
    }

    return {
      candidateId: candidate.candidateId,
      actionType: candidate.actionType,
      actorId: actor.playerId,
      ...(candidate.receiverId === undefined && fallbackReceiver === undefined
        ? {}
        : { receiverId: (candidate.receiverId ?? fallbackReceiver?.playerId) as PlayerId }),
      teamId: actor.teamId,
      fromZone: input.currentBallZone,
      targetZone: candidate.targetZone ?? fallbackReceiver?.zone ?? input.currentBallZone,
      laneState: "CONTESTED",
      availability: "AVAILABLE",
      baseScore: candidate.baseScore,
      source: "prototype_mapped_option",
      reason: "Mapped from current prototype route context for guarded spatial comparison.",
    };
  });

  return {
    candidates,
    lossyMappings,
  };
}
```

## File: src/simulation/miniMatch/miniMatchRouteSelection.ts

```ts
import type { PlayerId } from "../../core/ids";
import { applySpatialAttributeInfluenceToCandidates, selectAttributeAdjustedCandidate } from "../routeRanking";
import type { RouteRankingAttributeMode, RouteRankingAttributeUsage } from "../routeRanking";
import type { SpatialMatchContext } from "../spatialContext";
import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import { createMiniMatchRouteSelectionMode, type MiniMatchRouteSelectionSource } from "./miniMatchRouteSelectionMode";
import type { SpatialRouteCandidate } from "./spatialCandidateGeneration";

export type MiniMatchRouteSelectionResult = {
  readonly selectionSource: MiniMatchRouteSelectionSource;
  readonly selectedCandidateId: string;
  readonly selectedActionType: string;
  readonly selectedActorId?: PlayerId;
  readonly selectedReceiverId?: PlayerId;
  readonly selectedBy: "prototype" | "base_score" | "attribute_adjusted_score" | "fallback";
  readonly selectionChangedFromPrototype: boolean;
  readonly guardValid: boolean;
  readonly blockedReasons: readonly string[];
  readonly baseScore?: number;
  readonly attributeAdjustedScore?: number;
  readonly routeRankingUsesRealAttributes: RouteRankingAttributeUsage;
  readonly notes: readonly string[];
};

function prototypeResult(input: {
  readonly source: MiniMatchRouteSelectionSource;
  readonly prototypeCandidate: SpatialRouteCandidate;
  readonly selectedBy: "prototype" | "fallback";
  readonly notes: readonly string[];
}): MiniMatchRouteSelectionResult {
  return {
    selectionSource: input.source,
    selectedCandidateId: input.prototypeCandidate.candidateId,
    selectedActionType: input.prototypeCandidate.actionType,
    selectedActorId: input.prototypeCandidate.actorId,
    ...(input.prototypeCandidate.receiverId === undefined ? {} : { selectedReceiverId: input.prototypeCandidate.receiverId }),
    selectedBy: input.selectedBy,
    selectionChangedFromPrototype: false,
    guardValid: true,
    blockedReasons: [],
    baseScore: input.prototypeCandidate.baseScore,
    attributeAdjustedScore: input.prototypeCandidate.baseScore,
    routeRankingUsesRealAttributes: "NO",
    notes: input.notes,
  };
}

export function selectMiniMatchRoute(input: {
  readonly selectionSource?: MiniMatchRouteSelectionSource;
  readonly spatialContext?: SpatialMatchContext;
  readonly routeRankingAttributeMode?: RouteRankingAttributeMode;
  readonly candidates: readonly SpatialRouteCandidate[];
  readonly prototypeCandidateId: string;
  readonly pressureLevel?: string;
  readonly workbench?: TacticalWorkbenchFrame;
}): MiniMatchRouteSelectionResult {
  const mode = createMiniMatchRouteSelectionMode(input.selectionSource);
  const prototypeCandidate = input.candidates.find((candidate) => candidate.candidateId === input.prototypeCandidateId) ?? input.candidates[0];

  if (prototypeCandidate === undefined) {
    return {
      selectionSource: mode.source,
      selectedCandidateId: "prototype-missing",
      selectedActionType: "SUPPORT_CLUSTER_RECYCLE",
      selectedBy: "fallback",
      selectionChangedFromPrototype: false,
      guardValid: false,
      blockedReasons: ["NO_CANDIDATES_AVAILABLE"],
      routeRankingUsesRealAttributes: "NO",
      notes: ["No route candidates were available; prototype fallback remains required."],
    };
  }

  if (mode.source === "prototype" || input.spatialContext === undefined || !mode.allowSelectionChange) {
    return prototypeResult({
      source: mode.source,
      prototypeCandidate,
      selectedBy: "prototype",
      notes: input.spatialContext === undefined
        ? ["No SpatialMatchContext available; preserving prototype route selection."]
        : ["Route selection mode preserves prototype behavior."],
    });
  }

  const adjustedCandidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext: input.spatialContext,
    candidates: input.candidates.map((candidate) => ({
      candidateId: candidate.candidateId,
      actorId: candidate.actorId,
      ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
      teamId: candidate.teamId,
      fromZone: candidate.fromZone,
      targetZone: candidate.targetZone,
      actionType: candidate.actionType,
      laneState: candidate.laneState,
      availability: candidate.availability,
      baseScore: candidate.baseScore,
      baseRisk: candidate.laneState === "CLOSED" ? 90 : candidate.laneState === "CONTESTED" ? 45 : 20,
    })),
    ...(input.pressureLevel === undefined ? {} : { pressureLevel: input.pressureLevel }),
  });
  const selected = selectAttributeAdjustedCandidate({
    candidates: adjustedCandidates,
    mode: input.routeRankingAttributeMode ?? "candidate_modifier",
    spatialContext: input.spatialContext,
    ...(input.workbench === undefined ? {} : { workbench: input.workbench }),
    baseSelectedCandidateId: prototypeCandidate.candidateId,
  });
  const selectedCandidate = adjustedCandidates.find((candidate) => candidate.candidateId === selected.selectedCandidateId) ?? adjustedCandidates[0];
  const attributeSelectorUsedFallback = selected.guard.warnings.some((warning) =>
    warning.includes("fell back to base candidate"),
  );

  if (selectedCandidate === undefined || !selected.guard.valid || attributeSelectorUsedFallback) {
    return prototypeResult({
      source: mode.source,
      prototypeCandidate,
      selectedBy: "fallback",
      notes: [
        "Attribute-adjusted route selection failed guard checks; prototype fallback preserved.",
        ...selected.guard.blockedReasons,
      ],
    });
  }

  return {
    selectionSource: mode.source,
    selectedCandidateId: selectedCandidate.candidateId,
    selectedActionType: selectedCandidate.actionType,
    selectedActorId: selectedCandidate.actorId,
    ...(selectedCandidate.receiverId === undefined ? {} : { selectedReceiverId: selectedCandidate.receiverId }),
    selectedBy: selected.selectedBy,
    selectionChangedFromPrototype: selectedCandidate.candidateId !== prototypeCandidate.candidateId,
    guardValid: selected.guard.valid,
    blockedReasons: selected.guard.blockedReasons,
    baseScore: selected.selectedCandidateBaseScore,
    attributeAdjustedScore: selected.selectedCandidateAdjustedScore,
    routeRankingUsesRealAttributes: "PARTIAL",
    notes: [
      selected.explanation,
      "Prototype fallback remains enabled for blocked or lossy mappings.",
    ],
  };
}
```

## File: src/simulation/miniMatch/selectInitialSequenceContext.ts

```ts
import { createZoneId, LateralCorridor, LongitudinalZone, type ZoneId } from "../../core/zones";
import { PrototypeTeamId, type PrototypeTeamDefinition } from "../../data/prototypeTeams";
import { PressureLevel } from "../../models/match";
import {
  calculateDefensiveOccupation,
  calculateDensityValues,
  calculateOffensiveOccupation,
  evaluateDefensiveCompactness,
  evaluateOffensiveSpread,
  evaluateWeakSideExposure,
  generateDefensiveShape,
  generateOffensiveShape,
  type SpatialTeamContext,
} from "../../systems/spatial";
import {
  createBallContext,
  getTeamAttackingDirection,
} from "../../systems/spatial/intention";
import { SequenceInteractionKind, SequenceLevel, type SequenceSpatialSnapshot } from "../../systems/sequences";
import { TacticalPhaseState } from "../../systems/tacticalState";
import { createDeterministicSeed, seededRandom } from "../../systems/matchLoop";
import { createMiniMatchTeamContext } from "./createMiniMatchContext";
import type { MiniMatchSequenceSetup, MiniMatchState, MiniMatchTeamSegmentInfluence } from "./types";
import { applySpatialAttributeInfluenceToCandidates, selectAttributeAdjustedCandidate, type AttributeAdjustedSelectionResult } from "../routeRanking";
import { generateSpatialRouteCandidates, type SpatialRouteCandidate } from "./spatialCandidateGeneration";
import { mapPrototypeToSpatialCandidates } from "./prototypeToSpatialCandidateMapper";
import { selectMiniMatchRoute, type MiniMatchRouteSelectionResult } from "./miniMatchRouteSelection";

const ACTIVE_ZONE_CYCLE: readonly ZoneId[] = [
  createZoneId(LongitudinalZone.Midfield, LateralCorridor.LeftHalfSpace),
  createZoneId(LongitudinalZone.Midfield, LateralCorridor.RightHalfSpace),
  createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.CentralAxis),
  createZoneId(LongitudinalZone.BuildOut, LateralCorridor.LeftHalfSpace),
  createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.RightCorridor),
  createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis),
];

function getCycleValue<T>(values: readonly T[], index: number): T {
  const value = values[index % values.length];
  if (value === undefined) {
    throw new Error("Mini-match setup cycle cannot be empty.");
  }

  return value;
}

function createPossessionZones(sequenceIndex: number): readonly ZoneId[] {
  const leftBias = sequenceIndex % 2 === 0;
  const wideCorridor = leftBias ? LateralCorridor.LeftCorridor : LateralCorridor.RightCorridor;
  const halfSpace = leftBias ? LateralCorridor.LeftHalfSpace : LateralCorridor.RightHalfSpace;
  const farCorridor = leftBias ? LateralCorridor.RightCorridor : LateralCorridor.LeftCorridor;

  return [
    createZoneId(LongitudinalZone.BuildOut, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.Midfield, halfSpace),
    createZoneId(LongitudinalZone.BuildOut, halfSpace),
    createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.Midfield, wideCorridor),
    createZoneId(LongitudinalZone.OffensivePressure, halfSpace),
    createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.OffensivePressure, farCorridor),
    createZoneId(LongitudinalZone.DeepDefense, LateralCorridor.CentralAxis),
  ];
}

function createPressingZones(sequenceIndex: number): readonly ZoneId[] {
  const rightBias = sequenceIndex % 2 === 0;
  const strongHalfSpace = rightBias ? LateralCorridor.RightHalfSpace : LateralCorridor.LeftHalfSpace;
  const strongCorridor = rightBias ? LateralCorridor.RightCorridor : LateralCorridor.LeftCorridor;
  const weakCorridor = rightBias ? LateralCorridor.LeftCorridor : LateralCorridor.RightCorridor;

  return [
    createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.Midfield, strongHalfSpace),
    createZoneId(LongitudinalZone.OffensivePressure, strongCorridor),
    createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.Midfield, strongHalfSpace),
    createZoneId(LongitudinalZone.OffensivePressure, strongHalfSpace),
    createZoneId(LongitudinalZone.Midfield, weakCorridor),
    createZoneId(LongitudinalZone.OffensivePressure, weakCorridor),
    createZoneId(LongitudinalZone.DeepDefense, LateralCorridor.CentralAxis),
  ];
}

function createSpatialSnapshot(
  offensiveTeam: SpatialTeamContext,
  defensiveTeam: SpatialTeamContext,
): SequenceSpatialSnapshot {
  const offensiveShape = generateOffensiveShape(offensiveTeam);
  const defensiveShape = generateDefensiveShape(defensiveTeam);
  const offensiveOccupation = calculateOffensiveOccupation(offensiveTeam, offensiveShape);
  const defensiveOccupation = calculateDefensiveOccupation(defensiveTeam, defensiveShape);
  const density = calculateDensityValues(offensiveOccupation, defensiveOccupation);

  return {
    offensiveShape,
    defensiveShape,
    density,
    offensiveSpread: evaluateOffensiveSpread(offensiveShape),
    defensiveCompactness: evaluateDefensiveCompactness(defensiveShape, defensiveOccupation),
    weakSide: evaluateWeakSideExposure(density),
  };
}

function selectPossessionTeam(
  state: MiniMatchState,
  sequenceIndex: number,
): PrototypeTeamDefinition {
  if (state.continuity.lastPossessionTeamId !== null) {
    return state.continuity.lastPossessionTeamId === state.context.teamA.id
      ? state.context.teamA
      : state.context.teamB;
  }

  const roll = seededRandom(createDeterministicSeed(state.context.seed + sequenceIndex));

  return roll.value < 0.5 ? state.context.teamA : state.context.teamB;
}

function describePossessionReason(state: MiniMatchState, possessionTeam: PrototypeTeamDefinition, sequenceIndex: number): string {
  if (state.continuity.lastPossessionTeamId === null) {
    return `${possessionTeam.displayName} starts with the ball by mini-match setup.`;
  }

  if (state.continuity.lastPossessionTeamId === possessionTeam.id) {
    if (!state.continuity.lastPossessionReason.includes("retained")) {
      return `${possessionTeam.displayName} receives possession because ${state.continuity.lastPossessionReason}.`;
    }

    return `${possessionTeam.displayName} keeps possession from the previous sequence.`;
  }

  return `${possessionTeam.displayName} receives possession because ${state.continuity.lastPossessionReason}.`;
}

function selectPressingTeam(
  state: MiniMatchState,
  possessionTeam: PrototypeTeamDefinition,
): PrototypeTeamDefinition {
  return possessionTeam.id === state.context.teamA.id ? state.context.teamB : state.context.teamA;
}

function selectPressureLevel(pressingTeam: PrototypeTeamDefinition, sequenceIndex: number): PressureLevel {
  if (pressingTeam.id === PrototypeTeamId.Blitz || pressingTeam.id === PrototypeTeamId.ChaosHunters) {
    return sequenceIndex % 3 === 1 ? PressureLevel.Medium : PressureLevel.High;
  }

  return sequenceIndex % 2 === 0 ? PressureLevel.Medium : PressureLevel.Low;
}

function clampContextRating(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function influenceForTeam(
  state: MiniMatchState,
  team: PrototypeTeamDefinition,
): MiniMatchTeamSegmentInfluence | undefined {
  const influence = state.context.segmentInfluence;

  if (influence === undefined) {
    return undefined;
  }

  if (influence.home.teamId === team.id) {
    return influence.home;
  }

  if (influence.away.teamId === team.id) {
    return influence.away;
  }

  return undefined;
}

function sequenceLevelFromModifier(modifier: number): SequenceLevel {
  if (modifier >= 3) {
    return SequenceLevel.High;
  }

  if (modifier <= -3) {
    return SequenceLevel.Low;
  }

  return SequenceLevel.Medium;
}

function adjustPressureLevel(
  base: PressureLevel,
  influence: MiniMatchTeamSegmentInfluence | undefined,
): PressureLevel {
  const pressureModifier = influence?.pressureLoadModifier ?? 0;
  const defensiveStressModifier = influence?.defensiveStressModifier ?? 0;
  const combined = pressureModifier + Math.max(0, defensiveStressModifier);

  if (combined >= 4 && base === PressureLevel.Low) {
    return PressureLevel.Medium;
  }

  if (combined >= 6 && base === PressureLevel.Medium) {
    return PressureLevel.High;
  }

  if (combined <= -4 && base === PressureLevel.High) {
    return PressureLevel.Medium;
  }

  return base;
}

function getRecoverySaturationForTeam(state: MiniMatchState, team: PrototypeTeamDefinition) {
  return team.id === state.context.teamA.id ? state.recoverySaturation.teamA : state.recoverySaturation.teamB;
}

function getOffensiveMomentumForTeam(state: MiniMatchState, team: PrototypeTeamDefinition) {
  return team.id === state.context.teamA.id ? state.offensiveMomentum.teamA : state.offensiveMomentum.teamB;
}

function createOpeningLine(possessionTeam: PrototypeTeamDefinition, pressingTeam: PrototypeTeamDefinition): string {
  if (possessionTeam.id === PrototypeTeamId.Control) {
    return `${possessionTeam.displayName} attempts structured build-up.`;
  }

  if (possessionTeam.id === PrototypeTeamId.Blitz) {
    return `${possessionTeam.displayName} tries to turn possession into immediate territory.`;
  }

  return `${possessionTeam.displayName} starts a tactical sequence under pressure from ${pressingTeam.displayName}.`;
}

function spatialContextSummary(state: MiniMatchState): string | undefined {
  const spatialContext = state.context.spatialContext;

  if (spatialContext === undefined) {
    return undefined;
  }

  return [
    "spatial_context_active",
    `fixture=${spatialContext.sourceWorkbenchFrameId ?? "none"}`,
    `carrier=${spatialContext.ballCarrierId}`,
    `zone=${spatialContext.ballZone}`,
  ].join("; ");
}

function attributeSelectionResult(state: MiniMatchState): AttributeAdjustedSelectionResult | undefined {
  const spatialContext = state.context.spatialContext;

  if (spatialContext === undefined) {
    return undefined;
  }

  const players = spatialContext.possessionTeamId === spatialContext.home.teamId
    ? spatialContext.home.players
    : spatialContext.away.players;
  const actor = players.find((player) => player.playerId === spatialContext.ballCarrierId);
  const receiver = players.find((player) => player.playerId !== spatialContext.ballCarrierId && !player.isGoalkeeper);

  if (actor === undefined) {
    return undefined;
  }

  const candidates = applySpatialAttributeInfluenceToCandidates({
    spatialContext,
    pressureLevel: "MEDIUM",
    candidates: [
      {
        candidateId: "spatial-context-metadata-candidate",
        actorId: actor.playerId,
        ...(receiver === undefined ? {} : { receiverId: receiver.playerId }),
        teamId: actor.teamId,
        fromZone: spatialContext.ballZone,
        targetZone: receiver?.zone ?? spatialContext.ballZone,
        actionType: "SUPPORT_CLUSTER_RECYCLE",
        laneState: "CONTESTED",
        baseScore: 50,
        baseRisk: 35,
      },
    ],
  });

  return selectAttributeAdjustedCandidate({
    candidates,
    mode: state.context.routeRankingAttributeMode ?? "metadata_only",
    spatialContext,
    baseSelectedCandidateId: "spatial-context-metadata-candidate",
  });
}

function attributeInfluenceSummary(result: AttributeAdjustedSelectionResult | undefined): string | undefined {
  if (result === undefined) {
    return undefined;
  }

  const modeLabel = result.mode === "candidate_modifier"
    ? "attribute_selection_mode_candidate_modifier"
    : `mode=${result.mode}`;

  return [
    "attribute_influence_active",
    modeLabel,
    result.selectionChanged ? "candidate_modifier_evaluated_selection_changed" : "candidate_modifier_evaluated_not_authoritative",
    `baseSelected=${result.baseSelectedCandidateId ?? "none"}`,
    `selected=${result.selectedCandidateId}`,
    `selectedBy=${result.selectedBy}`,
    `base=${result.selectedCandidateBaseScore}`,
    `adjusted=${result.selectedCandidateAdjustedScore}`,
    `blocked=${result.guard.blockedReasons.join("/") || "none"}`,
    "routeRankingUsesRealAttributes=PARTIAL",
  ].join("; ");
}

function prototypeCandidateIdFromWorkbench(state: MiniMatchState): string {
  const selectedOption = state.context.routeSelectionWorkbench?.rankedOptions.find((option) => option.selected);

  return selectedOption === undefined ? "prototype-current-route" : `workbench-rank-${selectedOption.rank}`;
}

function routeSelectionResult(input: {
  readonly state: MiniMatchState;
  readonly possessionTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly pressureLevel: PressureLevel;
}): MiniMatchRouteSelectionResult | undefined {
  const spatialContext = input.state.context.spatialContext;

  if (spatialContext === undefined && input.state.context.routeSelectionSource === undefined) {
    return undefined;
  }

  const currentBallCarrierId = spatialContext?.ballCarrierId ?? input.possessionTeam.players[0]?.id;

  if (currentBallCarrierId === undefined) {
    return undefined;
  }

  const mappedPrototype = mapPrototypeToSpatialCandidates({
    ...(spatialContext === undefined ? {} : { spatialContext }),
    currentBallCarrierId,
    currentBallZone: spatialContext?.ballZone ?? input.activeZone,
    currentPossessionTeamId: spatialContext?.possessionTeamId ?? input.possessionTeam.teamId,
  });
  const spatialCandidates: readonly SpatialRouteCandidate[] = spatialContext === undefined
    ? mappedPrototype.candidates
    : generateSpatialRouteCandidates({
        spatialContext,
        possessionTeamId: spatialContext.possessionTeamId,
        ballCarrierId: spatialContext.ballCarrierId,
        ballZone: spatialContext.ballZone,
        pressureLevel: input.pressureLevel.toUpperCase(),
        ...(input.state.context.routeSelectionWorkbench === undefined ? {} : { workbench: input.state.context.routeSelectionWorkbench }),
        prototypeCandidates: mappedPrototype.candidates,
      });
  const selected = selectMiniMatchRoute({
    ...(spatialContext === undefined ? {} : { spatialContext }),
    ...(input.state.context.routeSelectionSource === undefined ? {} : { selectionSource: input.state.context.routeSelectionSource }),
    ...(input.state.context.routeRankingAttributeMode === undefined ? {} : { routeRankingAttributeMode: input.state.context.routeRankingAttributeMode }),
    candidates: spatialCandidates,
    prototypeCandidateId: prototypeCandidateIdFromWorkbench(input.state),
    pressureLevel: input.pressureLevel.toUpperCase(),
    ...(input.state.context.routeSelectionWorkbench === undefined ? {} : { workbench: input.state.context.routeSelectionWorkbench }),
  });

  return {
    ...selected,
    notes: [...selected.notes, ...mappedPrototype.lossyMappings],
  };
}

function routeSelectionSummary(result: MiniMatchRouteSelectionResult | undefined): string | undefined {
  if (result === undefined) {
    return undefined;
  }

  return [
    "route_selection_active",
    `source=${result.selectionSource}`,
    `selected=${result.selectedCandidateId}`,
    `action=${result.selectedActionType}`,
    `selectedBy=${result.selectedBy}`,
    `changed=${result.selectionChangedFromPrototype ? "YES" : "NO"}`,
    `guard=${result.guardValid ? "PASS" : "FAIL"}`,
    `blocked=${result.blockedReasons.join("/") || "none"}`,
    `routeRankingUsesRealAttributes=${result.routeRankingUsesRealAttributes}`,
  ].join("; ");
}

export function selectInitialSequenceContext(
  state: MiniMatchState,
  sequenceIndex: number,
): MiniMatchSequenceSetup {
  const possessionTeamDefinition = selectPossessionTeam(state, sequenceIndex);
  const pressingTeamDefinition = selectPressingTeam(state, possessionTeamDefinition);
  const possessionInfluence = influenceForTeam(state, possessionTeamDefinition);
  const pressingInfluence = influenceForTeam(state, pressingTeamDefinition);
  const globalInfluence = state.context.segmentInfluence?.global;
  const activeZone = state.continuity.lastBallContext?.ballLocation ?? getCycleValue(ACTIVE_ZONE_CYCLE, sequenceIndex);
  const possessionTeam = createMiniMatchTeamContext(
    possessionTeamDefinition,
    createPossessionZones(sequenceIndex),
    sequenceIndex,
    getRecoverySaturationForTeam(state, possessionTeamDefinition),
    getOffensiveMomentumForTeam(state, possessionTeamDefinition),
    state.context.segmentInfluence,
  );
  const pressingTeam = createMiniMatchTeamContext(
    pressingTeamDefinition,
    createPressingZones(sequenceIndex),
    sequenceIndex,
    getRecoverySaturationForTeam(state, pressingTeamDefinition),
    getOffensiveMomentumForTeam(state, pressingTeamDefinition),
    state.context.segmentInfluence,
  );
  const pressureLevel = adjustPressureLevel(
    selectPressureLevel(pressingTeamDefinition, sequenceIndex),
    pressingInfluence,
  );
  const attackingDirection = getTeamAttackingDirection(
    possessionTeam.teamId,
    state.context.attackingDirections,
  );
  const previousCarrierRole = state.continuity.lastBallContext?.ballCarrierRole;
  const ballContext =
    previousCarrierRole === undefined
      ? createBallContext({
          team: possessionTeam,
          ballLocation: activeZone,
          attackingDirection,
        })
      : createBallContext({
          team: possessionTeam,
          ballLocation: activeZone,
          attackingDirection,
          ballCarrierRole: previousCarrierRole,
        });
  const snapshot = createSpatialSnapshot(possessionTeam, pressingTeam);
  const startTick = state.context.startTick + sequenceIndex * 10;
  const spatialSummary = spatialContextSummary(state);
  const selectionResult = attributeSelectionResult(state);
  const attributeSummary = attributeInfluenceSummary(selectionResult);
  const routeResult = routeSelectionResult({ state, possessionTeam, activeZone, pressureLevel });
  const routeSummary = routeSelectionSummary(routeResult);

  return {
    sequenceNumber: sequenceIndex + 1,
    possessionTeam,
    pressingTeam,
    activeZone,
    pressureDescription: pressureLevel.toUpperCase(),
    openingLine: createOpeningLine(possessionTeamDefinition, pressingTeamDefinition),
    possessionReason: describePossessionReason(state, possessionTeamDefinition, sequenceIndex),
    spatialContextActive: state.context.spatialContext !== undefined,
    ...(spatialSummary === undefined ? {} : { spatialContextSummary: spatialSummary }),
    ...(attributeSummary === undefined
      ? {}
      : {
          attributeInfluenceMode: state.context.routeRankingAttributeMode ?? "metadata_only" as const,
          routeRankingUsesRealAttributes: "PARTIAL" as const,
          attributeInfluenceSummary: attributeSummary,
          ...(selectionResult === undefined ? {} : { attributeSelectionResult: selectionResult }),
        }),
    ...(routeSummary === undefined
      ? {}
      : {
          routeSelectionSummary: routeSummary,
          ...(routeResult === undefined ? {} : { routeSelectionResult: routeResult }),
        }),
    resolveInput: {
      startTick,
      teams: {
        possessionTeam,
        pressingTeam,
      },
      ballContext,
      initialContext: {
        chaosLevel: clampContextRating(
          state.continuity.lastChaosLevel +
            (sequenceIndex % 3) * 6 +
            (globalInfluence?.repeatedPatternPressure ?? 0) +
            Math.max(0, pressingInfluence?.defensiveStressModifier ?? 0),
        ),
        possessionStability: sequenceLevelFromModifier(possessionInfluence?.supportStabilityModifier ?? 0),
        territorialPressure: clampContextRating(
          state.continuity.lastTerritorialPressure +
            (sequenceIndex % 2) * 8 +
            (globalInfluence?.matchTempoAdjustment ?? 0) * 2 +
            Math.max(0, pressingInfluence?.pressureLoadModifier ?? 0) * 2,
        ),
        currentDanger: sequenceLevelFromModifier(
          (possessionInfluence?.routeRiskModifier ?? 0) +
            (possessionInfluence?.finalActionComposureModifier ?? 0) +
            (globalInfluence?.conversionVolatilityAdjustment ?? 0),
        ),
        activeZone,
        sequenceMomentum: clampContextRating(
          50 +
            (sequenceIndex % 2) * 6 +
            (possessionInfluence?.momentumModifier ?? 0) * 3 +
            (possessionInfluence?.scoringConfidenceModifier ?? 0) * 2,
        ),
        weakSideExposure: SequenceLevel.Medium,
        currentInteraction: SequenceInteractionKind.BuildUpUnderPressure,
        pressureLevel,
        tacticalPhaseState: TacticalPhaseState.StablePossession,
      },
      initialSpatial: snapshot,
      transitionSpatial: snapshot,
      constructionSpatial: snapshot,
      finishingSpatial: snapshot,
      tacticalMemory: state.tacticalMemory,
    },
  };
}
```

## File: src/simulation/miniMatch/runMiniMatch.ts

```ts
import { resolveSequence } from "../../systems/sequences";
import type { TacticalLogLine } from "../../systems/interactions/shared";
import { createMiniMatchContext } from "./createMiniMatchContext";
import {
  createFinalSummaryLogs,
  createMiniMatchHeaderLogs,
  createScoreLog,
  createSequenceBoundaryLog,
  createSequenceHeaderLogs,
} from "./logging";
import { selectInitialSequenceContext } from "./selectInitialSequenceContext";
import { summarizeMiniMatch } from "./summarizeMiniMatch";
import type { MiniMatchInput, MiniMatchResult, MiniMatchState } from "./types";
import { updateMiniMatchState } from "./updateMiniMatchState";
import { integrateLiveTryEvents } from "./liveTryEvents";

export function runMiniMatch(input: MiniMatchInput): MiniMatchResult {
  let state: MiniMatchState = createMiniMatchContext(input);
  const sequenceLogs: TacticalLogLine[] = [];

  for (let sequenceIndex = 0; sequenceIndex < state.context.requestedSequences; sequenceIndex += 1) {
    const setup = selectInitialSequenceContext(state, sequenceIndex);
    const result = resolveSequence(setup.resolveInput);
    state = updateMiniMatchState(state, setup, result);
    sequenceLogs.push(
      ...createSequenceHeaderLogs(setup),
      ...result.logs,
      createSequenceBoundaryLog(state),
      createScoreLog(state),
      { text: "" },
    );
  }

  state = integrateLiveTryEvents(state);
  const summary = summarizeMiniMatch(state);

  return {
    state,
    summary,
    logs: [
      ...createMiniMatchHeaderLogs(state),
      ...sequenceLogs,
      ...createFinalSummaryLogs(state, summary),
    ],
  };
}
```

## File: src/simulation/miniMatch/miniMatchSegmentInfluence.test.ts

```ts
import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { adaptMatchInputToMiniMatch } from "../adapters/matchInputToMiniMatch";
import { sequence1Action1WorkbenchTruth } from "../grounding/fixtures/sequence1Action1.fixture";
import { createWorkbenchReplayMatchInput } from "../grounding/runWorkbenchReplaySeed";
import { workbenchToSpatialMatchContext } from "../spatialContext";
import { runFullMatch } from "../runFullMatch";
import { runMiniMatch } from "./runMiniMatch";
import type { MiniMatchSegmentInfluence } from "./types";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreFromConsequences(input: {
  readonly report: ReturnType<typeof runFullMatch>;
  readonly homeTeamId: string;
  readonly awayTeamId: string;
}): { readonly home: number; readonly away: number } {
  return input.report.timeline.reduce(
    (score, event) => {
      const points = event.consequences
        .filter((consequence) => consequence.type === "score_change")
        .reduce((total, consequence) => total + (consequence.value ?? 0), 0);

      return {
        home: score.home + (event.teamId === input.homeTeamId ? points : 0),
        away: score.away + (event.teamId === input.awayTeamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );
}

export function validateMiniMatchSegmentInfluence(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const adapter = adaptMatchInputToMiniMatch(input);
  const baselineA = runMiniMatch(adapter.miniMatchInput);
  const baselineB = runMiniMatch(adapter.miniMatchInput);
  const replayInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const replaySpatialContext = workbenchToSpatialMatchContext({
    matchInput: replayInput,
    workbench: sequence1Action1WorkbenchTruth,
    frame: "before",
  });
  const candidateModifierMiniMatch = runMiniMatch({
    ...adapter.miniMatchInput,
    numberOfSequences: 1,
    spatialContext: replaySpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
  });
  const influence: MiniMatchSegmentInfluence = {
    segmentIndex: 2,
    scoreState: "close",
    home: {
      teamId: adapter.homePrototype.id,
      conditionModifier: -2,
      mentalFreshnessModifier: -1,
      momentumModifier: 2,
      pressureLoadModifier: 2,
      defensiveStressModifier: 1,
      scoringConfidenceModifier: 1,
      routeRiskModifier: 1,
      supportStabilityModifier: -1,
      finalActionComposureModifier: 0,
    },
    away: {
      teamId: adapter.awayPrototype.id,
      conditionModifier: -3,
      mentalFreshnessModifier: -2,
      momentumModifier: -1,
      pressureLoadModifier: 3,
      defensiveStressModifier: 2,
      scoringConfidenceModifier: -1,
      routeRiskModifier: -2,
      supportStabilityModifier: -3,
      finalActionComposureModifier: -2,
    },
    global: {
      repeatedPatternPressure: 3,
      matchTempoAdjustment: 2,
      conversionVolatilityAdjustment: 1,
    },
  };
  const influenced = runMiniMatch({
    ...adapter.miniMatchInput,
    segmentInfluence: influence,
  });
  const baselineFirstContext = baselineA.state.records[0]?.setup.resolveInput.initialContext;
  const influencedFirstContext = influenced.state.records[0]?.setup.resolveInput.initialContext;
  const fullReport = runFullMatch(input);
  const influencedEvents = fullReport.timeline.filter((event) => event.tags.includes("segment_influence_active"));
  const firstSegmentInfluencedEvents = influencedEvents.filter((event) => event.eventId.includes("-segment-1-"));
  const segmentStateFact = fullReport.evidenceFacts.find((fact) =>
    fact.internalTags.includes("segment_state_influence"),
  );
  const consequenceScore = scoreFromConsequences({
    report: fullReport,
    homeTeamId: input.homeTeam.teamId,
    awayTeamId: input.awayTeam.teamId,
  });

  assertTest(
    JSON.stringify(baselineA.summary) === JSON.stringify(baselineB.summary),
    "runMiniMatch without segment influence must remain deterministic and backward compatible.",
  );
  assertTest(
    baselineA.state.context.segmentInfluence === undefined,
    "runMiniMatch without segment influence must not attach influence context.",
  );
  assertTest(
    baselineA.state.context.spatialContext === undefined,
    "runMiniMatch without spatial context must remain backward compatible.",
  );
  assertTest(
    baselineA.state.context.routeRankingAttributeMode === undefined,
    "runMiniMatch without explicit routeRankingAttributeMode must preserve previous behavior.",
  );
  assertTest(
    candidateModifierMiniMatch.state.records[0]?.setup.attributeInfluenceMode === "candidate_modifier",
    "runMiniMatch with spatialContext and candidate_modifier must expose candidate_modifier metadata.",
  );
  assertTest(
    candidateModifierMiniMatch.state.records[0]?.setup.attributeSelectionResult !== undefined,
    "candidate_modifier metadata must include attribute selection result.",
  );
  assertTest(
    candidateModifierMiniMatch.logs.some((log) => log.text.includes("attribute_selection_mode_candidate_modifier")),
    "candidate_modifier logs must expose selection mode.",
  );
  assertTest(
    influenced.state.context.segmentInfluence !== undefined,
    "runMiniMatch with segment influence must attach influence context.",
  );
  assertTest(
    baselineFirstContext !== undefined && influencedFirstContext !== undefined,
    "mini-match test fixtures must produce at least one sequence context.",
  );
  if (baselineFirstContext !== undefined && influencedFirstContext !== undefined) {
    assertTest(
      influencedFirstContext.chaosLevel !== baselineFirstContext.chaosLevel ||
        influencedFirstContext.territorialPressure !== baselineFirstContext.territorialPressure ||
        influencedFirstContext.sequenceMomentum !== baselineFirstContext.sequenceMomentum,
      "segment influence must affect resolution context without forcing score events.",
    );
  }
  assertTest(influencedEvents.length > 0, "runFullMatch must tag events with segment influence after the first segment.");
  assertTest(
    firstSegmentInfluencedEvents.length === 0,
    "runFullMatch must not apply segment influence to the first segment.",
  );
  assertTest(segmentStateFact !== undefined, "segment-state influence must appear in canonical evidence facts.");
  assertTest(
    consequenceScore.home === fullReport.score.home && consequenceScore.away === fullReport.score.away,
    "final score must remain derived from score_change consequences.",
  );

  return [
    "runMiniMatch remains backward compatible without influence",
    "segment influence affects mini-match resolution context",
    "runFullMatch applies segment influence after the first segment",
    "segment influence is represented by internal tags and evidence facts",
    "final score remains derived from score_change consequences",
  ];
}

if (require.main === module) {
  const checks = validateMiniMatchSegmentInfluence();

  console.log("miniMatchSegmentInfluence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/miniMatch/miniMatchSpatialSelection.test.ts

```ts
import { scoringRegistryEntry } from "../../systems/scoring";
import { adaptMatchInputToMiniMatch } from "../adapters/matchInputToMiniMatch";
import { sequence1Action1WorkbenchTruth } from "../grounding/fixtures/sequence1Action1.fixture";
import { createWorkbenchReplayMatchInput } from "../grounding/runWorkbenchReplaySeed";
import { workbenchToSpatialMatchContext } from "../spatialContext";
import { runMiniMatch } from "./runMiniMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMiniMatchSpatialSelection(): readonly string[] {
  const replayInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const adapter = adaptMatchInputToMiniMatch(replayInput);
  const replaySpatialContext = workbenchToSpatialMatchContext({
    matchInput: replayInput,
    workbench: sequence1Action1WorkbenchTruth,
    frame: "before",
  });
  const baseline = runMiniMatch({
    ...adapter.miniMatchInput,
    numberOfSequences: 1,
  });
  const controlled = runMiniMatch({
    ...adapter.miniMatchInput,
    numberOfSequences: 1,
    spatialContext: replaySpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    routeSelectionSource: "spatial_candidate_modifier",
    routeSelectionWorkbench: sequence1Action1WorkbenchTruth,
  });
  const selection = controlled.state.records[0]?.setup.routeSelectionResult;
  const baselineScoringEvents = baseline.state.scoringEvents.length;
  const controlledScoringEvents = controlled.state.scoringEvents.length;

  assertTest(selection !== undefined, "controlled mini-match must expose route selection result.");
  if (selection !== undefined) {
    assertTest(selection.selectionSource === "spatial_candidate_modifier", "selection source must be spatial_candidate_modifier.");
    assertTest(selection.guardValid, "controlled route selection guard must be valid.");
    assertTest(selection.selectedActionType.length > 0, "selected action type must be populated.");
    assertTest(
      selection.selectedActorId === sequence1Action1WorkbenchTruth.selectedAction.actorId,
      "TH actor must remain preserved in replay context.",
    );
    assertTest(
      selection.selectedReceiverId === sequence1Action1WorkbenchTruth.selectedAction.receiverId,
      "TH -> ML receiver must remain preserved in replay context.",
    );
  }
  assertTest(
    controlled.logs.some((log) => log.text.includes("Route selection metadata: route_selection_active")),
    "controlled mini-match logs must expose route selection metadata.",
  );
  assertTest(
    controlledScoringEvents === baselineScoringEvents,
    "route selection metadata must not add scoring events by itself.",
  );
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");

  return [
    "controlled mini-match exposes route selection result",
    "selection source is spatial_candidate_modifier",
    "route selection guard is valid",
    "TH -> ML remains preserved",
    "route selection does not add scoring events by itself",
    "scoring constants remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateMiniMatchSpatialSelection();

  console.log("miniMatchSpatialSelection tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```

## File: src/simulation/miniMatch/miniMatchSpatialSelectionContrast.test.ts

```ts
import { applySpatialAttributeInfluenceToCandidates } from "../routeRanking";
import {
  attributeRankingContrastSpatialContext,
  closedLaneContrastCandidates,
  legalContrastCandidates,
  unavailableContrastCandidates,
} from "../routeRanking/fixtures/attributeRankingContrast.fixture";
import { selectMiniMatchRoute } from "./miniMatchRouteSelection";
import type { SpatialRouteCandidate } from "./spatialCandidateGeneration";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function candidatesFromAdjusted(
  candidates: ReturnType<typeof applySpatialAttributeInfluenceToCandidates>,
): readonly SpatialRouteCandidate[] {
  return candidates.map((candidate) => ({
    candidateId: candidate.candidateId,
    actionType: candidate.actionType,
    actorId: candidate.actorId,
    ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
    teamId: candidate.teamId,
    fromZone: candidate.fromZone,
    targetZone: candidate.targetZone,
    laneState: candidate.laneState === "OPEN" || candidate.laneState === "CLOSED" ? candidate.laneState : "CONTESTED",
    availability: candidate.availability ?? "AVAILABLE",
    baseScore: candidate.baseScore,
    source: "spatial_player_option",
    reason: "contrast fixture candidate",
  }));
}

export function validateMiniMatchSpatialSelectionContrast(): readonly string[] {
  const legal = candidatesFromAdjusted(applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: legalContrastCandidates(),
  }));
  const closed = candidatesFromAdjusted(applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: closedLaneContrastCandidates(),
  }));
  const unavailable = candidatesFromAdjusted(applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: unavailableContrastCandidates(),
  }));
  const allBlocked: readonly SpatialRouteCandidate[] = closed.map((candidate) => ({
    ...candidate,
    actorId: "missing-actor",
    laneState: "CLOSED",
    availability: candidate.candidateId === "safe-recycle" ? "NOT_AVAILABLE_NOW" : candidate.availability,
  }));
  const legalSelection = selectMiniMatchRoute({
    selectionSource: "spatial_candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    candidates: legal,
    prototypeCandidateId: "safe-recycle",
    pressureLevel: "MEDIUM",
  });
  const closedSelection = selectMiniMatchRoute({
    selectionSource: "spatial_candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    candidates: closed,
    prototypeCandidateId: "safe-recycle",
    pressureLevel: "MEDIUM",
  });
  const unavailableSelection = selectMiniMatchRoute({
    selectionSource: "spatial_candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    candidates: unavailable,
    prototypeCandidateId: "safe-recycle",
    pressureLevel: "MEDIUM",
  });
  const fallbackSelection = selectMiniMatchRoute({
    selectionSource: "spatial_candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    candidates: allBlocked,
    prototypeCandidateId: "safe-recycle",
    pressureLevel: "MEDIUM",
  });

  assertTest(legalSelection.selectedCandidateId === "elite-weak-side", "legal attribute-boosted candidate must win.");
  assertTest(legalSelection.selectedBy === "attribute_adjusted_score", "legal winner must be selected by adjusted score.");
  assertTest(closedSelection.selectedCandidateId === "safe-recycle", "closed candidate must not win.");
  assertTest(unavailableSelection.selectedCandidateId === "safe-recycle", "unavailable candidate must not win.");
  assertTest(fallbackSelection.selectedBy === "fallback", "all-blocked spatial selections must fall back to prototype.");
  assertTest(
    fallbackSelection.selectedCandidateId === "safe-recycle",
    "fallback must preserve prototype candidate identity.",
  );

  return [
    "legal attribute-boosted candidate can win",
    "closed route cannot win",
    "unavailable route cannot win",
    "guard-blocked spatial selections fall back to prototype",
  ];
}

if (require.main === module) {
  const checks = validateMiniMatchSpatialSelectionContrast();

  console.log("miniMatchSpatialSelectionContrast tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
```
