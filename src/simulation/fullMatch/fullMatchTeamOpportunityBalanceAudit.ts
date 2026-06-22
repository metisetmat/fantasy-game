import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../../contracts/scoringFamily";
import type { TeamId } from "../../core/ids";
import type { TeamOpportunityBalanceWarningCode } from "./teamOpportunityBalanceWarnings";

export type TeamBalanceRouteFamilyMix = Readonly<Record<OfficialScoringFamily | "CONTINUATION", number>>;

export interface TeamOpportunityBalanceSideMetrics {
  readonly dangerPhaseCount: number;
  readonly scoringOpportunityCount: number;
  readonly scoringEventCount: number;
  readonly scoreChangeCount: number;
  readonly points: number;
  readonly neutralPhaseCount: number;
  readonly defensiveRecoveryCount: number;
  readonly resetPhaseCount: number;
  readonly turnoverCount: number;
  readonly continuationCount: number;
  readonly routeFamilyMix: TeamBalanceRouteFamilyMix;
  readonly nonShotRouteCount: number;
  readonly possessionAfterResetCount: number;
  readonly dangerAfterResetCount: number;
  readonly responseAfterConcedingCount: number;
  readonly scorelessPossessionStreakMax: number;
  readonly dominanceChainMax: number;
}

export interface FullMatchTeamOpportunityBalanceAuditRow {
  readonly segmentLabel: string;
  readonly period: string;
  readonly startMinute: number;
  readonly home: TeamOpportunityBalanceSideMetrics;
  readonly away: TeamOpportunityBalanceSideMetrics;
  readonly opportunityBalanceIndex: number;
  readonly dangerBalanceIndex: number;
  readonly scoringBalanceIndex: number;
  readonly pointBalanceIndex: number;
  readonly oneSidedOpportunityRisk: boolean;
  readonly oneSidedScoringRisk: boolean;
  readonly dominanceAmplificationRisk: boolean;
  readonly responseSuppressionRisk: boolean;
  readonly recommendation:
    | "KEEP_MONITORING"
    | "IMPROVE_HOME_RESPONSE_ACCESS"
    | "IMPROVE_AWAY_RESPONSE_ACCESS"
    | "DAMPEN_HOME_DOMINANCE_CHAIN"
    | "DAMPEN_AWAY_DOMINANCE_CHAIN";
  readonly warningCodes: readonly TeamOpportunityBalanceWarningCode[];
}

export interface FullMatchTeamOpportunityBalanceAudit {
  readonly rows: readonly FullMatchTeamOpportunityBalanceAuditRow[];
  readonly home: TeamOpportunityBalanceSideMetrics;
  readonly away: TeamOpportunityBalanceSideMetrics;
  readonly opportunityBalanceIndex: number;
  readonly dangerBalanceIndex: number;
  readonly scoringBalanceIndex: number;
  readonly pointBalanceIndex: number;
  readonly oneSidedOpportunityRisk: boolean;
  readonly oneSidedScoringRisk: boolean;
  readonly dominanceAmplificationRisk: boolean;
  readonly responseSuppressionRisk: boolean;
  readonly dominantTeamOpportunityChainMax: number;
  readonly trailingTeamResponseRate: number;
  readonly resetToResponseRate: number;
  readonly defensiveRecoveryToDangerRate: number;
  readonly possessionAfterConcedingDangerRate: number;
  readonly warningCounts: readonly { readonly code: TeamOpportunityBalanceWarningCode; readonly count: number }[];
}

type MutableSide = {
  dangerPhaseCount: number;
  scoringOpportunityCount: number;
  scoringEventCount: number;
  scoreChangeCount: number;
  points: number;
  neutralPhaseCount: number;
  defensiveRecoveryCount: number;
  resetPhaseCount: number;
  turnoverCount: number;
  continuationCount: number;
  routeFamilyMix: Record<OfficialScoringFamily | "CONTINUATION", number>;
  nonShotRouteCount: number;
  possessionAfterResetCount: number;
  dangerAfterResetCount: number;
  responseAfterConcedingCount: number;
  scorelessPossessionStreakCurrent: number;
  scorelessPossessionStreakMax: number;
  dominanceChainCurrent: number;
  dominanceChainMax: number;
};

type MutableSegment = {
  readonly segmentLabel: string;
  period: string;
  startMinute: number;
  home: MutableSide;
  away: MutableSide;
  previousOpportunityTeamId?: TeamId;
};

function emptyRouteFamilyMix(): Record<OfficialScoringFamily | "CONTINUATION", number> {
  return {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
    CONTINUATION: 0,
  };
}

function emptySide(): MutableSide {
  return {
    dangerPhaseCount: 0,
    scoringOpportunityCount: 0,
    scoringEventCount: 0,
    scoreChangeCount: 0,
    points: 0,
    neutralPhaseCount: 0,
    defensiveRecoveryCount: 0,
    resetPhaseCount: 0,
    turnoverCount: 0,
    continuationCount: 0,
    routeFamilyMix: emptyRouteFamilyMix(),
    nonShotRouteCount: 0,
    possessionAfterResetCount: 0,
    dangerAfterResetCount: 0,
    responseAfterConcedingCount: 0,
    scorelessPossessionStreakCurrent: 0,
    scorelessPossessionStreakMax: 0,
    dominanceChainCurrent: 0,
    dominanceChainMax: 0,
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

function balanceIndex(a: number, b: number): number {
  const total = a + b;
  if (total === 0) {
    return 100;
  }

  return Math.max(0, Math.round(100 - Math.abs(a - b) / total * 100));
}

function segmentLabelForEvent(event: MatchEvent): string {
  const fromSequence = event.sequenceId.match(/segment-\d+/u)?.[0];
  if (fromSequence !== undefined) {
    return fromSequence;
  }

  const fromEvent = event.eventId.match(/segment-\d+/u)?.[0];
  return fromEvent ?? "segment-unknown";
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function routeFamilyForEvent(event: MatchEvent): OfficialScoringFamily | "CONTINUATION" | null {
  if (event.scoringFamily !== undefined) {
    return event.scoringFamily;
  }

  const families: readonly (OfficialScoringFamily | "CONTINUATION")[] = [
    "SHOT_GOAL",
    "TRY_TOUCHDOWN",
    "CONVERSION_GOAL",
    "DROP_GOAL",
    "PENALTY_SHOT",
    "UNKNOWN",
    "CONTINUATION",
  ];

  return families.find((family) => event.tags.includes(`official_route_family_${family}`)) ?? null;
}

function isRouteFamilyOpportunity(event: MatchEvent): boolean {
  const family = routeFamilyForEvent(event);
  return family !== null && family !== "CONTINUATION";
}

function isDangerPhase(event: MatchEvent): boolean {
  return isRouteFamilyOpportunity(event) || event.eventType === "scoring";
}

function isResetPhase(event: MatchEvent): boolean {
  return event.tags.includes("official_route_family_non_scoring_outcome") ||
    event.tags.includes("official_scoring_resolution_non_scoring") ||
    event.tags.includes("official_route_family_CONTINUATION") ||
    event.eventType === "goalkeeper_action" ||
    event.eventType === "turnover";
}

function isNeutralPhase(event: MatchEvent): boolean {
  return event.outcome === "neutral" ||
    event.eventType === "progression" ||
    event.tags.includes("official_route_family_non_scoring_outcome") ||
    event.tags.includes("official_route_family_CONTINUATION");
}

function isDefensiveRecovery(event: MatchEvent): boolean {
  return event.eventType === "goalkeeper_action" ||
    event.tags.some((tag) => tag.includes("goalkeeper") || tag.includes("recovery") || tag.includes("blocked"));
}

function toSideMetrics(side: MutableSide): TeamOpportunityBalanceSideMetrics {
  return {
    dangerPhaseCount: side.dangerPhaseCount,
    scoringOpportunityCount: side.scoringOpportunityCount,
    scoringEventCount: side.scoringEventCount,
    scoreChangeCount: side.scoreChangeCount,
    points: side.points,
    neutralPhaseCount: side.neutralPhaseCount,
    defensiveRecoveryCount: side.defensiveRecoveryCount,
    resetPhaseCount: side.resetPhaseCount,
    turnoverCount: side.turnoverCount,
    continuationCount: side.continuationCount,
    routeFamilyMix: side.routeFamilyMix,
    nonShotRouteCount: side.nonShotRouteCount,
    possessionAfterResetCount: side.possessionAfterResetCount,
    dangerAfterResetCount: side.dangerAfterResetCount,
    responseAfterConcedingCount: side.responseAfterConcedingCount,
    scorelessPossessionStreakMax: side.scorelessPossessionStreakMax,
    dominanceChainMax: side.dominanceChainMax,
  };
}

function addSide(a: TeamOpportunityBalanceSideMetrics, b: TeamOpportunityBalanceSideMetrics): TeamOpportunityBalanceSideMetrics {
  const routeFamilyMix = emptyRouteFamilyMix();
  for (const family of Object.keys(routeFamilyMix) as readonly (keyof TeamBalanceRouteFamilyMix)[]) {
    routeFamilyMix[family] = a.routeFamilyMix[family] + b.routeFamilyMix[family];
  }

  return {
    dangerPhaseCount: a.dangerPhaseCount + b.dangerPhaseCount,
    scoringOpportunityCount: a.scoringOpportunityCount + b.scoringOpportunityCount,
    scoringEventCount: a.scoringEventCount + b.scoringEventCount,
    scoreChangeCount: a.scoreChangeCount + b.scoreChangeCount,
    points: a.points + b.points,
    neutralPhaseCount: a.neutralPhaseCount + b.neutralPhaseCount,
    defensiveRecoveryCount: a.defensiveRecoveryCount + b.defensiveRecoveryCount,
    resetPhaseCount: a.resetPhaseCount + b.resetPhaseCount,
    turnoverCount: a.turnoverCount + b.turnoverCount,
    continuationCount: a.continuationCount + b.continuationCount,
    routeFamilyMix,
    nonShotRouteCount: a.nonShotRouteCount + b.nonShotRouteCount,
    possessionAfterResetCount: a.possessionAfterResetCount + b.possessionAfterResetCount,
    dangerAfterResetCount: a.dangerAfterResetCount + b.dangerAfterResetCount,
    responseAfterConcedingCount: a.responseAfterConcedingCount + b.responseAfterConcedingCount,
    scorelessPossessionStreakMax: Math.max(a.scorelessPossessionStreakMax, b.scorelessPossessionStreakMax),
    dominanceChainMax: Math.max(a.dominanceChainMax, b.dominanceChainMax),
  };
}

function emptySideMetrics(): TeamOpportunityBalanceSideMetrics {
  return toSideMetrics(emptySide());
}

function warningsForRow(row: Omit<FullMatchTeamOpportunityBalanceAuditRow, "warningCodes">): readonly TeamOpportunityBalanceWarningCode[] {
  const warnings: TeamOpportunityBalanceWarningCode[] = [];
  if (row.opportunityBalanceIndex < 62) {
    warnings.push("TEAM_OPPORTUNITY_IMBALANCE" as TeamOpportunityBalanceWarningCode);
  }
  if (row.dangerBalanceIndex < 62) {
    warnings.push("TEAM_DANGER_PHASE_IMBALANCE" as TeamOpportunityBalanceWarningCode);
  }
  if (row.scoringBalanceIndex < 52) {
    warnings.push("TEAM_SCORING_EVENT_IMBALANCE" as TeamOpportunityBalanceWarningCode);
  }
  if (row.pointBalanceIndex < 50) {
    warnings.push("TEAM_POINTS_IMBALANCE" as TeamOpportunityBalanceWarningCode);
  }
  if (row.oneSidedOpportunityRisk) {
    warnings.push("ONE_SIDED_OPPORTUNITY_RISK" as TeamOpportunityBalanceWarningCode);
  }
  if (row.oneSidedScoringRisk) {
    warnings.push("ONE_SIDED_SCORING_RISK" as TeamOpportunityBalanceWarningCode);
  }
  if (row.dominanceAmplificationRisk) {
    warnings.push("DOMINANCE_CHAIN_TOO_LONG" as TeamOpportunityBalanceWarningCode);
  }
  if (row.responseSuppressionRisk) {
    warnings.push("TRAILING_TEAM_RESPONSE_STILL_TOO_WEAK");
  }
  return warnings;
}

function rowRecommendation(row: {
  readonly home: TeamOpportunityBalanceSideMetrics;
  readonly away: TeamOpportunityBalanceSideMetrics;
}): FullMatchTeamOpportunityBalanceAuditRow["recommendation"] {
  if (row.home.dominanceChainMax > row.away.dominanceChainMax + 1) {
    return "DAMPEN_HOME_DOMINANCE_CHAIN";
  }
  if (row.away.dominanceChainMax > row.home.dominanceChainMax + 1) {
    return "DAMPEN_AWAY_DOMINANCE_CHAIN";
  }
  if (row.home.responseAfterConcedingCount < row.away.responseAfterConcedingCount) {
    return "IMPROVE_HOME_RESPONSE_ACCESS";
  }
  if (row.away.responseAfterConcedingCount < row.home.responseAfterConcedingCount) {
    return "IMPROVE_AWAY_RESPONSE_ACCESS";
  }
  return "KEEP_MONITORING";
}

function toRow(segment: MutableSegment): FullMatchTeamOpportunityBalanceAuditRow {
  const home = toSideMetrics(segment.home);
  const away = toSideMetrics(segment.away);
  const base = {
    segmentLabel: segment.segmentLabel,
    period: segment.period,
    startMinute: segment.startMinute,
    home,
    away,
    opportunityBalanceIndex: balanceIndex(home.scoringOpportunityCount, away.scoringOpportunityCount),
    dangerBalanceIndex: balanceIndex(home.dangerPhaseCount, away.dangerPhaseCount),
    scoringBalanceIndex: balanceIndex(home.scoringEventCount, away.scoringEventCount),
    pointBalanceIndex: balanceIndex(home.points, away.points),
    oneSidedOpportunityRisk: home.scoringOpportunityCount === 0 || away.scoringOpportunityCount === 0,
    oneSidedScoringRisk: home.scoringEventCount === 0 !== (away.scoringEventCount === 0),
    dominanceAmplificationRisk: Math.max(home.dominanceChainMax, away.dominanceChainMax) >= 3,
    responseSuppressionRisk: home.responseAfterConcedingCount + away.responseAfterConcedingCount === 0 &&
      home.scoringEventCount + away.scoringEventCount > 0,
    recommendation: rowRecommendation({ home, away }),
  };

  return {
    ...base,
    warningCodes: warningsForRow(base),
  };
}

export function auditFullMatchTeamOpportunityBalance(report: MatchReport): FullMatchTeamOpportunityBalanceAudit {
  const homeTeamId = report.teamStats[0]?.teamId ?? report.timeline[0]?.teamId;
  const awayTeamId = report.teamStats[1]?.teamId ?? report.timeline.find((event) => event.teamId !== homeTeamId)?.teamId;
  if (homeTeamId === undefined || awayTeamId === undefined) {
    return {
      rows: [],
      home: emptySideMetrics(),
      away: emptySideMetrics(),
      opportunityBalanceIndex: 100,
      dangerBalanceIndex: 100,
      scoringBalanceIndex: 100,
      pointBalanceIndex: 100,
      oneSidedOpportunityRisk: false,
      oneSidedScoringRisk: false,
      dominanceAmplificationRisk: false,
      responseSuppressionRisk: false,
      dominantTeamOpportunityChainMax: 0,
      trailingTeamResponseRate: 0,
      resetToResponseRate: 0,
      defensiveRecoveryToDangerRate: 0,
      possessionAfterConcedingDangerRate: 0,
      warningCounts: [],
    };
  }
  const segments = new Map<string, MutableSegment>();
  let lastResetTeamId: TeamId | null = null;
  let lastScoringTeamId: TeamId | null = null;
  let previousOpportunityTeamId: TeamId | null = null;
  let currentGlobalOpportunityChain = 0;

  for (const event of [...report.timeline].sort((a, b) => a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick)) {
    const segmentLabel = segmentLabelForEvent(event);
    const segment = segments.get(segmentLabel) ?? {
      segmentLabel,
      period: event.timestamp.period,
      startMinute: event.timestamp.minute,
      home: emptySide(),
      away: emptySide(),
    };
    const side = event.teamId === homeTeamId ? segment.home : segment.away;
    const opponentSide = event.teamId === homeTeamId ? segment.away : segment.home;
    const family = routeFamilyForEvent(event);
    const scorePoints = scoreChangePoints(event);
    const opportunity = isRouteFamilyOpportunity(event);
    const danger = isDangerPhase(event);

    segment.period = event.timestamp.period;
    segment.startMinute = Math.min(segment.startMinute, event.timestamp.minute);

    if (family !== null) {
      side.routeFamilyMix[family] += 1;
      if (family !== "SHOT_GOAL" && family !== "CONTINUATION") {
        side.nonShotRouteCount += 1;
      }
    }
    if (danger) {
      side.dangerPhaseCount += 1;
      if (lastResetTeamId === event.teamId) {
        side.dangerAfterResetCount += 1;
      }
      if (lastScoringTeamId !== null && lastScoringTeamId !== event.teamId) {
        side.responseAfterConcedingCount += 1;
      }
    }
    if (opportunity) {
      side.scoringOpportunityCount += 1;
      if (previousOpportunityTeamId === event.teamId) {
        currentGlobalOpportunityChain += 1;
      } else {
        currentGlobalOpportunityChain = 1;
      }
      previousOpportunityTeamId = event.teamId;
      side.dominanceChainCurrent = currentGlobalOpportunityChain;
      side.dominanceChainMax = Math.max(side.dominanceChainMax, currentGlobalOpportunityChain);
      side.scorelessPossessionStreakCurrent = scorePoints > 0 ? 0 : side.scorelessPossessionStreakCurrent + 1;
      side.scorelessPossessionStreakMax = Math.max(side.scorelessPossessionStreakMax, side.scorelessPossessionStreakCurrent);
    }
    if (scorePoints > 0) {
      side.scoringEventCount += 1;
      side.scoreChangeCount += 1;
      side.points += scorePoints;
      side.scorelessPossessionStreakCurrent = 0;
      opponentSide.scorelessPossessionStreakCurrent += 1;
      opponentSide.scorelessPossessionStreakMax = Math.max(opponentSide.scorelessPossessionStreakMax, opponentSide.scorelessPossessionStreakCurrent);
      lastScoringTeamId = event.teamId;
    }
    if (isNeutralPhase(event)) {
      side.neutralPhaseCount += 1;
    }
    if (isDefensiveRecovery(event)) {
      side.defensiveRecoveryCount += 1;
    }
    if (event.eventType === "turnover" || event.tags.some((tag) => tag.includes("turnover") || tag.includes("lost_forward"))) {
      side.turnoverCount += 1;
    }
    if (family === "CONTINUATION") {
      side.continuationCount += 1;
    }
    if (isResetPhase(event)) {
      side.resetPhaseCount += 1;
      side.possessionAfterResetCount += 1;
      lastResetTeamId = event.teamId;
    }

    segments.set(segmentLabel, segment);
  }

  const rows = [...segments.values()].map(toRow);
  const home = rows.reduce((total, row) => addSide(total, row.home), emptySideMetrics());
  const away = rows.reduce((total, row) => addSide(total, row.away), emptySideMetrics());
  const warnings = new Map<TeamOpportunityBalanceWarningCode, number>();
  for (const row of rows) {
    for (const warning of row.warningCodes) {
      warnings.set(warning, (warnings.get(warning) ?? 0) + 1);
    }
  }
  const totalResponses = home.responseAfterConcedingCount + away.responseAfterConcedingCount;
  const totalScoringEvents = home.scoringEventCount + away.scoringEventCount;
  const totalResets = home.resetPhaseCount + away.resetPhaseCount;
  const totalDangerAfterReset = home.dangerAfterResetCount + away.dangerAfterResetCount;
  const totalRecoveries = home.defensiveRecoveryCount + away.defensiveRecoveryCount;

  return {
    rows,
    home,
    away,
    opportunityBalanceIndex: balanceIndex(home.scoringOpportunityCount, away.scoringOpportunityCount),
    dangerBalanceIndex: balanceIndex(home.dangerPhaseCount, away.dangerPhaseCount),
    scoringBalanceIndex: balanceIndex(home.scoringEventCount, away.scoringEventCount),
    pointBalanceIndex: balanceIndex(home.points, away.points),
    oneSidedOpportunityRisk: home.scoringOpportunityCount === 0 || away.scoringOpportunityCount === 0,
    oneSidedScoringRisk: home.scoringEventCount === 0 !== (away.scoringEventCount === 0),
    dominanceAmplificationRisk: Math.max(home.dominanceChainMax, away.dominanceChainMax) >= 4,
    responseSuppressionRisk: totalResponses < Math.max(1, Math.floor(totalScoringEvents * 0.25)),
    dominantTeamOpportunityChainMax: Math.max(home.dominanceChainMax, away.dominanceChainMax),
    trailingTeamResponseRate: percent(totalResponses, totalScoringEvents),
    resetToResponseRate: percent(totalDangerAfterReset, totalResets),
    defensiveRecoveryToDangerRate: percent(totalDangerAfterReset, totalRecoveries),
    possessionAfterConcedingDangerRate: percent(totalResponses, totalScoringEvents),
    warningCounts: [...warnings.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([code, count]) => ({ code, count })),
  };
}

export function summarizeTeamOpportunityBalanceAudit(audits: readonly FullMatchTeamOpportunityBalanceAudit[]): {
  readonly home: TeamOpportunityBalanceSideMetrics;
  readonly away: TeamOpportunityBalanceSideMetrics;
  readonly opportunityBalanceIndex: number;
  readonly dangerBalanceIndex: number;
  readonly scoringBalanceIndex: number;
  readonly pointBalanceIndex: number;
  readonly dominantTeamOpportunityChainMax: number;
  readonly trailingTeamResponseRate: number;
  readonly resetToResponseRate: number;
  readonly defensiveRecoveryToDangerRate: number;
  readonly possessionAfterConcedingDangerRate: number;
} {
  const home = audits.reduce((total, audit) => addSide(total, audit.home), emptySideMetrics());
  const away = audits.reduce((total, audit) => addSide(total, audit.away), emptySideMetrics());
  const averageAuditValue = (selector: (audit: FullMatchTeamOpportunityBalanceAudit) => number): number =>
    round(audits.reduce((sum, audit) => sum + selector(audit), 0) / Math.max(1, audits.length));

  return {
    home,
    away,
    opportunityBalanceIndex: balanceIndex(home.scoringOpportunityCount, away.scoringOpportunityCount),
    dangerBalanceIndex: balanceIndex(home.dangerPhaseCount, away.dangerPhaseCount),
    scoringBalanceIndex: balanceIndex(home.scoringEventCount, away.scoringEventCount),
    pointBalanceIndex: balanceIndex(home.points, away.points),
    dominantTeamOpportunityChainMax: Math.max(home.dominanceChainMax, away.dominanceChainMax),
    trailingTeamResponseRate: averageAuditValue((audit) => audit.trailingTeamResponseRate),
    resetToResponseRate: averageAuditValue((audit) => audit.resetToResponseRate),
    defensiveRecoveryToDangerRate: averageAuditValue((audit) => audit.defensiveRecoveryToDangerRate),
    possessionAfterConcedingDangerRate: averageAuditValue((audit) => audit.possessionAfterConcedingDangerRate),
  };
}
