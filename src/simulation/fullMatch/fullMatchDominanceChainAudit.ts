import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../../contracts/scoringFamily";
import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { DominanceChainWarningCode } from "./dominanceChainWarnings";

export interface FullMatchDominanceChainSegmentAudit {
  readonly segmentLabel: string;
  readonly dominantTeamId: TeamId | "NONE";
  readonly dominantTeamOpportunityChainMax: number;
  readonly dominantTeamDangerPhaseChainMax: number;
  readonly dominantTeamScoringEventChainMax: number;
  readonly dominantTeamPointRunMax: number;
  readonly sameTeamConsecutiveOpportunityCount: number;
  readonly sameTeamConsecutiveDangerPhaseCount: number;
  readonly sameFamilyConsecutiveOpportunityCount: number;
  readonly sameZoneConsecutiveOpportunityCount: number;
  readonly postScoreImmediateReattackCount: number;
  readonly postResetDominantTeamReentryCount: number;
  readonly failedResetCount: number;
  readonly resetBreaksDominanceCount: number;
  readonly defensiveRecoveryBreaksDominanceCount: number;
  readonly goalkeeperSecureBreaksDominanceCount: number;
  readonly turnoverBreaksDominanceCount: number;
  readonly neutralPhaseBreaksDominanceCount: number;
  readonly fatigueBreaksDominanceCount: number;
  readonly pressureBreaksDominanceCount: number;
  readonly trailingTeamResponseAfterDominanceCount: number;
  readonly dominanceDecayAppliedCount: number;
  readonly warningCodes: readonly DominanceChainWarningCode[];
  readonly recommendation:
    | "KEEP_MONITORING"
    | "REDUCE_DOMINANCE_CHAINS_MORE"
    | "IMPROVE_BREAK_EVENTS"
    | "PRESERVE_ROUTE_FAMILY_MIX";
}

export interface FullMatchDominanceChainAudit {
  readonly segments: readonly FullMatchDominanceChainSegmentAudit[];
  readonly dominantTeamId: TeamId | "NONE";
  readonly dominantTeamOpportunityChainMax: number;
  readonly dominantTeamDangerPhaseChainMax: number;
  readonly dominantTeamScoringEventChainMax: number;
  readonly dominantTeamPointRunMax: number;
  readonly sameTeamConsecutiveOpportunityCount: number;
  readonly sameTeamConsecutiveOpportunityRate: number;
  readonly sameTeamConsecutiveDangerPhaseCount: number;
  readonly sameTeamConsecutiveDangerPhaseRate: number;
  readonly sameFamilyConsecutiveOpportunityCount: number;
  readonly sameFamilyConsecutiveOpportunityRate: number;
  readonly sameZoneConsecutiveOpportunityCount: number;
  readonly sameZoneConsecutiveOpportunityRate: number;
  readonly postScoreImmediateReattackCount: number;
  readonly postScoreImmediateReattackRate: number;
  readonly postResetDominantTeamReentryCount: number;
  readonly failedResetCount: number;
  readonly resetBreaksDominanceCount: number;
  readonly resetBreaksDominanceRate: number;
  readonly defensiveRecoveryBreaksDominanceCount: number;
  readonly defensiveRecoveryBreaksDominanceRate: number;
  readonly goalkeeperSecureBreaksDominanceCount: number;
  readonly goalkeeperSecureBreaksDominanceRate: number;
  readonly turnoverBreaksDominanceCount: number;
  readonly turnoverBreaksDominanceRate: number;
  readonly neutralPhaseBreaksDominanceCount: number;
  readonly neutralPhaseBreaksDominanceRate: number;
  readonly fatigueBreaksDominanceCount: number;
  readonly pressureBreaksDominanceCount: number;
  readonly trailingTeamResponseAfterDominanceCount: number;
  readonly trailingTeamResponseAfterDominanceRate: number;
  readonly dominanceDecayAppliedCount: number;
  readonly opportunityCount: number;
  readonly dangerPhaseCount: number;
  readonly resetCount: number;
  readonly defensiveRecoveryCount: number;
  readonly goalkeeperSecureCount: number;
  readonly turnoverCount: number;
  readonly neutralPhaseCount: number;
  readonly warningCounts: readonly { readonly code: DominanceChainWarningCode; readonly count: number }[];
  readonly recommendation:
    | "KEEP_DOMINANCE_CHAIN_MONITORING"
    | "REDUCE_DOMINANCE_CHAINS_MORE"
    | "IMPROVE_BREAK_EVENTS";
}

type MutableSegment = {
  readonly segmentLabel: string;
  opportunityTeams: TeamId[];
  dangerTeams: TeamId[];
  scoringTeams: TeamId[];
  pointRuns: Map<TeamId, number>;
  opportunityChainMax: number;
  dangerChainMax: number;
  scoringEventChainMax: number;
  sameTeamOpportunity: number;
  sameTeamDanger: number;
  sameFamilyOpportunity: number;
  sameZoneOpportunity: number;
  postScoreImmediateReattack: number;
  postResetDominantTeamReentry: number;
  failedReset: number;
  resetBreaks: number;
  defensiveRecoveryBreaks: number;
  goalkeeperSecureBreaks: number;
  turnoverBreaks: number;
  neutralBreaks: number;
  fatigueBreaks: number;
  pressureBreaks: number;
  trailingResponseAfterDominance: number;
  dominanceDecayApplied: number;
  opportunityCount: number;
  dangerCount: number;
};

function emptySegment(segmentLabel: string): MutableSegment {
  return {
    segmentLabel,
    opportunityTeams: [],
    dangerTeams: [],
    scoringTeams: [],
    pointRuns: new Map<TeamId, number>(),
    opportunityChainMax: 0,
    dangerChainMax: 0,
    scoringEventChainMax: 0,
    sameTeamOpportunity: 0,
    sameTeamDanger: 0,
    sameFamilyOpportunity: 0,
    sameZoneOpportunity: 0,
    postScoreImmediateReattack: 0,
    postResetDominantTeamReentry: 0,
    failedReset: 0,
    resetBreaks: 0,
    defensiveRecoveryBreaks: 0,
    goalkeeperSecureBreaks: 0,
    turnoverBreaks: 0,
    neutralBreaks: 0,
    fatigueBreaks: 0,
    pressureBreaks: 0,
    trailingResponseAfterDominance: 0,
    dominanceDecayApplied: 0,
    opportunityCount: 0,
    dangerCount: 0,
  };
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function segmentLabelForEvent(event: MatchEvent): string {
  return event.sequenceId.match(/segment-\d+/u)?.[0] ?? event.eventId.match(/segment-\d+/u)?.[0] ?? "segment-unknown";
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

function isOpportunity(event: MatchEvent): boolean {
  const family = routeFamilyForEvent(event);
  return (family !== null && family !== "CONTINUATION") || event.eventType === "scoring";
}

function isDanger(event: MatchEvent): boolean {
  return isOpportunity(event) || event.tacticalContext.pressureLevel === "high";
}

function isReset(event: MatchEvent): boolean {
  return routeFamilyForEvent(event) === "CONTINUATION" ||
    event.eventType === "progression" ||
    event.outcome === "neutral" ||
    event.tags.includes("official_route_family_non_scoring_outcome");
}

function isDefensiveRecovery(event: MatchEvent): boolean {
  return event.eventType === "goalkeeper_action" ||
    event.eventType === "turnover" ||
    event.tags.some((tag) => tag.includes("recovery") || tag.includes("blocked") || tag.includes("goalkeeper"));
}

function isGoalkeeperSecure(event: MatchEvent): boolean {
  return event.eventType === "goalkeeper_action" ||
    event.tags.some((tag) => tag.includes("goalkeeper") || tag.includes("gk") || tag.includes("keeper"));
}

function isTurnover(event: MatchEvent): boolean {
  return event.eventType === "turnover" || event.tags.some((tag) => tag.includes("turnover") || tag.includes("lost_forward"));
}

function isFatigueBreak(event: MatchEvent): boolean {
  return event.tags.some((tag) => tag.includes("fatigue")) || event.fatigueContext.teamCondition < 55;
}

function isPressureBreak(event: MatchEvent): boolean {
  return event.tacticalContext.pressureLevel === "high" || event.tags.some((tag) => tag.includes("pressure"));
}

function chainMax(values: readonly TeamId[]): number {
  let max = 0;
  let current = 0;
  let previous: TeamId | null = null;
  for (const value of values) {
    current = value === previous ? current + 1 : 1;
    previous = value;
    max = Math.max(max, current);
  }
  return max;
}

function dominantTeam(values: readonly TeamId[]): TeamId | "NONE" {
  const counts = new Map<TeamId, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "NONE";
}

function warningCodesForSegment(segment: MutableSegment): readonly DominanceChainWarningCode[] {
  const warnings: DominanceChainWarningCode[] = [];
  if (segment.opportunityChainMax >= 4) {
    warnings.push("DOMINANCE_CHAIN_TOO_LONG" as DominanceChainWarningCode);
  }
  if (percent(segment.sameTeamOpportunity, Math.max(1, segment.opportunityCount)) > 55) {
    warnings.push("SAME_TEAM_OPPORTUNITY_CHAIN_TOO_HIGH");
  }
  if (percent(segment.sameFamilyOpportunity, Math.max(1, segment.opportunityCount)) > 45) {
    warnings.push("SAME_FAMILY_REPEAT_TOO_HIGH");
  }
  if (segment.resetBreaks + segment.defensiveRecoveryBreaks + segment.neutralBreaks === 0 && segment.opportunityCount > 2) {
    warnings.push("MOMENTUM_TOO_STICKY" as DominanceChainWarningCode);
  }
  return warnings;
}

function toSegmentAudit(segment: MutableSegment): FullMatchDominanceChainSegmentAudit {
  const warningCodes = warningCodesForSegment(segment);
  return {
    segmentLabel: segment.segmentLabel,
    dominantTeamId: dominantTeam(segment.opportunityTeams),
    dominantTeamOpportunityChainMax: segment.opportunityChainMax,
    dominantTeamDangerPhaseChainMax: segment.dangerChainMax,
    dominantTeamScoringEventChainMax: segment.scoringEventChainMax,
    dominantTeamPointRunMax: Math.max(0, ...segment.pointRuns.values()),
    sameTeamConsecutiveOpportunityCount: segment.sameTeamOpportunity,
    sameTeamConsecutiveDangerPhaseCount: segment.sameTeamDanger,
    sameFamilyConsecutiveOpportunityCount: segment.sameFamilyOpportunity,
    sameZoneConsecutiveOpportunityCount: segment.sameZoneOpportunity,
    postScoreImmediateReattackCount: segment.postScoreImmediateReattack,
    postResetDominantTeamReentryCount: segment.postResetDominantTeamReentry,
    failedResetCount: segment.failedReset,
    resetBreaksDominanceCount: segment.resetBreaks,
    defensiveRecoveryBreaksDominanceCount: segment.defensiveRecoveryBreaks,
    goalkeeperSecureBreaksDominanceCount: segment.goalkeeperSecureBreaks,
    turnoverBreaksDominanceCount: segment.turnoverBreaks,
    neutralPhaseBreaksDominanceCount: segment.neutralBreaks,
    fatigueBreaksDominanceCount: segment.fatigueBreaks,
    pressureBreaksDominanceCount: segment.pressureBreaks,
    trailingTeamResponseAfterDominanceCount: segment.trailingResponseAfterDominance,
    dominanceDecayAppliedCount: segment.dominanceDecayApplied,
    warningCodes,
    recommendation: warningCodes.length === 0
      ? "KEEP_MONITORING"
      : segment.resetBreaks + segment.defensiveRecoveryBreaks + segment.neutralBreaks === 0
        ? "IMPROVE_BREAK_EVENTS"
        : "REDUCE_DOMINANCE_CHAINS_MORE",
  };
}

export function auditFullMatchDominanceChains(report: MatchReport): FullMatchDominanceChainAudit {
  const segments = new Map<string, MutableSegment>();
  const sortedTimeline = [...report.timeline].sort((a, b) => a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick);
  let previousOpportunityTeamId: TeamId | null = null;
  let previousDangerTeamId: TeamId | null = null;
  let previousScoringEventTeamId: TeamId | null = null;
  let previousOpportunityFamily: OfficialScoringFamily | "CONTINUATION" | null = null;
  let previousOpportunityZone: ZoneId | null = null;
  let previousScoringTeamId: TeamId | null = null;
  let previousDominantTeamBeforeBreak: TeamId | null = null;
  let currentOpportunityChain = 0;
  let currentDangerChain = 0;
  let currentScoringEventChain = 0;
  let dominantTeamOpportunityChainMax = 0;
  let dominantTeamDangerPhaseChainMax = 0;
  let dominantTeamScoringEventChainMax = 0;
  let opportunityCount = 0;
  let dangerPhaseCount = 0;
  let sameTeamOpportunity = 0;
  let sameTeamDanger = 0;
  let sameFamilyOpportunity = 0;
  let sameZoneOpportunity = 0;
  let postScoreImmediateReattack = 0;
  let postResetDominantTeamReentry = 0;
  let failedReset = 0;
  let resetBreaks = 0;
  let defensiveRecoveryBreaks = 0;
  let goalkeeperSecureBreaks = 0;
  let turnoverBreaks = 0;
  let neutralBreaks = 0;
  let fatigueBreaks = 0;
  let pressureBreaks = 0;
  let trailingResponseAfterDominance = 0;
  let dominanceDecayApplied = 0;
  let resetCount = 0;
  let defensiveRecoveryCount = 0;
  let goalkeeperSecureCount = 0;
  let turnoverCount = 0;
  let neutralPhaseCount = 0;
  const opportunityTeams: TeamId[] = [];
  const dangerTeams: TeamId[] = [];
  const scoringTeams: TeamId[] = [];
  const pointRuns = new Map<TeamId, number>();
  const warningCounts = new Map<DominanceChainWarningCode, number>();

  for (const event of sortedTimeline) {
    const segmentLabel = segmentLabelForEvent(event);
    const segment = segments.get(segmentLabel) ?? emptySegment(segmentLabel);
    const family = routeFamilyForEvent(event);
    const opportunity = isOpportunity(event);
    const danger = isDanger(event);
    const reset = isReset(event);
    const defensiveRecovery = isDefensiveRecovery(event);
    const goalkeeperSecure = isGoalkeeperSecure(event);
    const turnover = isTurnover(event);
    const neutral = event.outcome === "neutral" || family === "CONTINUATION";
    const scorePoints = scoreChangePoints(event);
    const fatigueBreak = !opportunity && !danger && isFatigueBreak(event);
    const pressureBreak = !opportunity && !danger && isPressureBreak(event);
    const breakCandidate = !opportunity && (
      reset ||
      defensiveRecovery ||
      goalkeeperSecure ||
      turnover ||
      neutral ||
      fatigueBreak ||
      pressureBreak
    );

    if (breakCandidate && previousOpportunityTeamId !== null) {
      previousDominantTeamBeforeBreak = previousOpportunityTeamId;
      if (reset) {
        resetCount += 1;
        segment.resetBreaks += 1;
        resetBreaks += 1;
      }
      if (defensiveRecovery) {
        defensiveRecoveryCount += 1;
        segment.defensiveRecoveryBreaks += 1;
        defensiveRecoveryBreaks += 1;
      }
      if (goalkeeperSecure) {
        goalkeeperSecureCount += 1;
        segment.goalkeeperSecureBreaks += 1;
        goalkeeperSecureBreaks += 1;
      }
      if (turnover) {
        turnoverCount += 1;
        segment.turnoverBreaks += 1;
        turnoverBreaks += 1;
      }
      if (neutral) {
        neutralPhaseCount += 1;
        segment.neutralBreaks += 1;
        neutralBreaks += 1;
      }
      if (fatigueBreak) {
        segment.fatigueBreaks += 1;
        fatigueBreaks += 1;
      }
      if (pressureBreak) {
        segment.pressureBreaks += 1;
        pressureBreaks += 1;
      }
      previousOpportunityTeamId = null;
      previousOpportunityFamily = null;
      previousOpportunityZone = null;
      previousDangerTeamId = null;
      currentOpportunityChain = 0;
      currentDangerChain = 0;
    }

    if (event.tags.includes("dominance_decay_applied")) {
      segment.dominanceDecayApplied += 1;
      dominanceDecayApplied += 1;
    }

    if (danger) {
      segment.dangerCount += 1;
      dangerPhaseCount += 1;
      if (previousDangerTeamId === event.teamId) {
        segment.sameTeamDanger += 1;
        sameTeamDanger += 1;
        currentDangerChain += 1;
      } else {
        currentDangerChain = 1;
      }
      previousDangerTeamId = event.teamId;
      segment.dangerChainMax = Math.max(segment.dangerChainMax, currentDangerChain);
      dominantTeamDangerPhaseChainMax = Math.max(dominantTeamDangerPhaseChainMax, currentDangerChain);
      segment.dangerTeams.push(event.teamId);
      dangerTeams.push(event.teamId);
    }

    if (opportunity) {
      segment.opportunityCount += 1;
      opportunityCount += 1;
      if (previousOpportunityTeamId === event.teamId) {
        segment.sameTeamOpportunity += 1;
        sameTeamOpportunity += 1;
        currentOpportunityChain += 1;
      } else {
        currentOpportunityChain = 1;
      }
      if (previousOpportunityFamily !== null && previousOpportunityFamily === family) {
        segment.sameFamilyOpportunity += 1;
        sameFamilyOpportunity += 1;
      }
      if (previousOpportunityZone !== null && previousOpportunityZone === event.zone) {
        segment.sameZoneOpportunity += 1;
        sameZoneOpportunity += 1;
      }
      if (previousScoringTeamId === event.teamId) {
        segment.postScoreImmediateReattack += 1;
        postScoreImmediateReattack += 1;
      }
      previousScoringTeamId = null;
      if (previousDominantTeamBeforeBreak !== null) {
        if (previousDominantTeamBeforeBreak === event.teamId) {
          segment.postResetDominantTeamReentry += 1;
          segment.failedReset += 1;
          postResetDominantTeamReentry += 1;
          failedReset += 1;
        } else {
          segment.trailingResponseAfterDominance += 1;
          trailingResponseAfterDominance += 1;
        }
        previousDominantTeamBeforeBreak = null;
      }
      previousOpportunityTeamId = event.teamId;
      previousOpportunityFamily = family;
      previousOpportunityZone = event.zone;
      segment.opportunityChainMax = Math.max(segment.opportunityChainMax, currentOpportunityChain);
      dominantTeamOpportunityChainMax = Math.max(dominantTeamOpportunityChainMax, currentOpportunityChain);
      segment.opportunityTeams.push(event.teamId);
      opportunityTeams.push(event.teamId);
    }

    if (scorePoints > 0) {
      if (previousScoringEventTeamId === event.teamId) {
        currentScoringEventChain += 1;
      } else {
        currentScoringEventChain = 1;
      }
      scoringTeams.push(event.teamId);
      segment.scoringTeams.push(event.teamId);
      previousScoringEventTeamId = event.teamId;
      previousScoringTeamId = event.teamId;
      segment.scoringEventChainMax = Math.max(segment.scoringEventChainMax, currentScoringEventChain);
      dominantTeamScoringEventChainMax = Math.max(dominantTeamScoringEventChainMax, currentScoringEventChain);
      pointRuns.set(event.teamId, (pointRuns.get(event.teamId) ?? 0) + scorePoints);
      segment.pointRuns.set(event.teamId, (segment.pointRuns.get(event.teamId) ?? 0) + scorePoints);
    }

    segments.set(segmentLabel, segment);
  }

  const segmentAudits = [...segments.values()].map(toSegmentAudit);
  for (const segment of segmentAudits) {
    for (const warning of segment.warningCodes) {
      warningCounts.set(warning, (warningCounts.get(warning) ?? 0) + 1);
    }
  }
  const warningRows = [...warningCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([code, count]) => ({ code, count }));

  return {
    segments: segmentAudits,
    dominantTeamId: dominantTeam(opportunityTeams),
    dominantTeamOpportunityChainMax,
    dominantTeamDangerPhaseChainMax,
    dominantTeamScoringEventChainMax,
    dominantTeamPointRunMax: Math.max(0, ...pointRuns.values()),
    sameTeamConsecutiveOpportunityCount: sameTeamOpportunity,
    sameTeamConsecutiveOpportunityRate: percent(sameTeamOpportunity, Math.max(1, opportunityCount)),
    sameTeamConsecutiveDangerPhaseCount: sameTeamDanger,
    sameTeamConsecutiveDangerPhaseRate: percent(sameTeamDanger, Math.max(1, dangerPhaseCount)),
    sameFamilyConsecutiveOpportunityCount: sameFamilyOpportunity,
    sameFamilyConsecutiveOpportunityRate: percent(sameFamilyOpportunity, Math.max(1, opportunityCount)),
    sameZoneConsecutiveOpportunityCount: sameZoneOpportunity,
    sameZoneConsecutiveOpportunityRate: percent(sameZoneOpportunity, Math.max(1, opportunityCount)),
    postScoreImmediateReattackCount: postScoreImmediateReattack,
    postScoreImmediateReattackRate: percent(postScoreImmediateReattack, Math.max(1, scoringTeams.length)),
    postResetDominantTeamReentryCount: postResetDominantTeamReentry,
    failedResetCount: failedReset,
    resetBreaksDominanceCount: resetBreaks,
    resetBreaksDominanceRate: percent(resetBreaks, Math.max(1, resetCount)),
    defensiveRecoveryBreaksDominanceCount: defensiveRecoveryBreaks,
    defensiveRecoveryBreaksDominanceRate: percent(defensiveRecoveryBreaks, Math.max(1, defensiveRecoveryCount)),
    goalkeeperSecureBreaksDominanceCount: goalkeeperSecureBreaks,
    goalkeeperSecureBreaksDominanceRate: percent(goalkeeperSecureBreaks, Math.max(1, goalkeeperSecureCount)),
    turnoverBreaksDominanceCount: turnoverBreaks,
    turnoverBreaksDominanceRate: percent(turnoverBreaks, Math.max(1, turnoverCount)),
    neutralPhaseBreaksDominanceCount: neutralBreaks,
    neutralPhaseBreaksDominanceRate: percent(neutralBreaks, Math.max(1, neutralPhaseCount)),
    fatigueBreaksDominanceCount: fatigueBreaks,
    pressureBreaksDominanceCount: pressureBreaks,
    trailingTeamResponseAfterDominanceCount: trailingResponseAfterDominance,
    trailingTeamResponseAfterDominanceRate: percent(trailingResponseAfterDominance, Math.max(1, resetBreaks + defensiveRecoveryBreaks + neutralBreaks)),
    dominanceDecayAppliedCount: dominanceDecayApplied,
    opportunityCount,
    dangerPhaseCount,
    resetCount,
    defensiveRecoveryCount,
    goalkeeperSecureCount,
    turnoverCount,
    neutralPhaseCount,
    warningCounts: warningRows,
    recommendation: dominantTeamOpportunityChainMax >= 8
      ? "REDUCE_DOMINANCE_CHAINS_MORE"
      : resetBreaks + defensiveRecoveryBreaks + neutralBreaks === 0
        ? "IMPROVE_BREAK_EVENTS"
        : "KEEP_DOMINANCE_CHAIN_MONITORING",
  };
}
