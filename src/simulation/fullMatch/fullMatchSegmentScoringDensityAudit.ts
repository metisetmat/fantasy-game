import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../../contracts/scoringFamily";
import type { TeamId } from "../../core/ids";
import type { SegmentScoringDensityWarningCode } from "./segmentScoringDensityWarnings";

export type SegmentRouteFamilyMix = Readonly<Record<OfficialScoringFamily | "CONTINUATION", number>>;

export interface FullMatchSegmentScoringDensityAuditRow {
  readonly segmentLabel: string;
  readonly period: string;
  readonly startMinute: number;
  readonly sequenceCount: number;
  readonly possessionCount: number;
  readonly dangerPhaseCount: number;
  readonly scoringOpportunityCount: number;
  readonly scoringEventCount: number;
  readonly scoreChangeCount: number;
  readonly nonScoringOutcomeCount: number;
  readonly neutralPhaseCount: number;
  readonly turnoverCount: number;
  readonly defensiveRecoveryCount: number;
  readonly goalkeeperSecureCount: number;
  readonly resetPhaseCount: number;
  readonly continuationCount: number;
  readonly repeatedDangerPhaseCount: number;
  readonly consecutiveScoringOpportunityCount: number;
  readonly sameTeamConsecutiveOpportunityCount: number;
  readonly sameFamilyConsecutiveOpportunityCount: number;
  readonly routeFamilyMixBySegment: SegmentRouteFamilyMix;
  readonly pointsBySegment: number;
  readonly scoringDensityPerSequence: number;
  readonly scoringDensityPerPossession: number;
  readonly scoringDensityWarningCodes: readonly SegmentScoringDensityWarningCode[];
}

export interface FullMatchSegmentScoringDensityAudit {
  readonly rows: readonly FullMatchSegmentScoringDensityAuditRow[];
  readonly scoringOpportunityCount: number;
  readonly scoringEventCount: number;
  readonly scoreChangeCount: number;
  readonly dangerPhaseCount: number;
  readonly neutralPhaseCount: number;
  readonly turnoverCount: number;
  readonly defensiveRecoveryCount: number;
  readonly goalkeeperSecureCount: number;
  readonly resetPhaseCount: number;
  readonly continuationCount: number;
  readonly repeatedDangerPhaseCount: number;
  readonly consecutiveScoringOpportunityCount: number;
  readonly sameTeamConsecutiveOpportunityCount: number;
  readonly sameFamilyConsecutiveOpportunityCount: number;
}

type MutableSegment = {
  readonly segmentLabel: string;
  period: string;
  startMinute: number;
  sequenceIds: Set<string>;
  teamIds: Set<TeamId>;
  possessionCount: number;
  dangerPhaseCount: number;
  scoringOpportunityCount: number;
  scoringEventCount: number;
  scoreChangeCount: number;
  nonScoringOutcomeCount: number;
  neutralPhaseCount: number;
  turnoverCount: number;
  defensiveRecoveryCount: number;
  goalkeeperSecureCount: number;
  resetPhaseCount: number;
  continuationCount: number;
  repeatedDangerPhaseCount: number;
  consecutiveScoringOpportunityCount: number;
  sameTeamConsecutiveOpportunityCount: number;
  sameFamilyConsecutiveOpportunityCount: number;
  routeFamilyMixBySegment: Record<OfficialScoringFamily | "CONTINUATION", number>;
  pointsBySegment: number;
  previousOpportunityTeamId?: TeamId;
  previousOpportunityFamily?: OfficialScoringFamily | "CONTINUATION";
  previousWasOpportunity: boolean;
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

  const routeFamilyTag = event.tags.find((tag) => tag.startsWith("official_route_family_"));
  const routeFamily = routeFamilyTag?.replace("official_route_family_", "");

  switch (routeFamily) {
    case "SHOT_GOAL":
    case "TRY_TOUCHDOWN":
    case "CONVERSION_GOAL":
    case "DROP_GOAL":
    case "PENALTY_SHOT":
    case "UNKNOWN":
    case "CONTINUATION":
      return routeFamily;
    default:
      return null;
  }
}

function isRouteFamilyOpportunity(event: MatchEvent): boolean {
  const family = routeFamilyForEvent(event);
  return family !== null && family !== "CONTINUATION";
}

function isDangerPhase(event: MatchEvent): boolean {
  return isRouteFamilyOpportunity(event) ||
    event.eventType === "scoring";
}

function isNeutralPhase(event: MatchEvent): boolean {
  return event.outcome === "neutral" ||
    event.eventType === "progression" ||
    event.tags.includes("official_route_family_non_scoring_outcome") ||
    event.tags.includes("official_route_family_CONTINUATION");
}

function isTurnover(event: MatchEvent): boolean {
  return event.eventType === "turnover" ||
    event.tags.some((tag) => tag.includes("turnover") || tag.includes("lost_forward"));
}

function isDefensiveRecovery(event: MatchEvent): boolean {
  return event.eventType === "goalkeeper_action" ||
    event.tags.some((tag) => tag.includes("goalkeeper") || tag.includes("recovery") || tag.includes("blocked"));
}

function warningsForSegment(segment: MutableSegment): readonly SegmentScoringDensityWarningCode[] {
  const warnings: SegmentScoringDensityWarningCode[] = [];

  if (segment.scoringOpportunityCount > 3) {
    warnings.push("SEGMENT_SCORING_DENSITY_TOO_HIGH");
  }
  if (segment.dangerPhaseCount > 4) {
    warnings.push("TOO_MANY_DANGER_PHASES");
  }
  if (segment.consecutiveScoringOpportunityCount > 1) {
    warnings.push("TOO_MANY_CONSECUTIVE_SCORING_OPPORTUNITIES");
  }
  if (segment.sameTeamConsecutiveOpportunityCount > 1) {
    warnings.push("SAME_TEAM_OPPORTUNITY_CHAIN_TOO_LONG");
  }
  if (segment.sameFamilyConsecutiveOpportunityCount > 1) {
    warnings.push("SAME_FAMILY_REPEAT_TOO_HIGH");
  }
  if (segment.neutralPhaseCount < 1) {
    warnings.push("TOO_FEW_NEUTRAL_PHASES");
  }
  if (segment.defensiveRecoveryCount < 1 && segment.scoringOpportunityCount > 2) {
    warnings.push("TOO_FEW_DEFENSIVE_RECOVERIES");
  }
  if (segment.resetPhaseCount < 1 && segment.scoringEventCount > 0) {
    warnings.push("TOO_FEW_RESET_PHASES");
  }

  return warnings;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function toRow(segment: MutableSegment): FullMatchSegmentScoringDensityAuditRow {
  const sequenceCount = segment.sequenceIds.size;
  const possessionCount = Math.max(segment.possessionCount, segment.teamIds.size);

  return {
    segmentLabel: segment.segmentLabel,
    period: segment.period,
    startMinute: segment.startMinute,
    sequenceCount,
    possessionCount,
    dangerPhaseCount: segment.dangerPhaseCount,
    scoringOpportunityCount: segment.scoringOpportunityCount,
    scoringEventCount: segment.scoringEventCount,
    scoreChangeCount: segment.scoreChangeCount,
    nonScoringOutcomeCount: segment.nonScoringOutcomeCount,
    neutralPhaseCount: segment.neutralPhaseCount,
    turnoverCount: segment.turnoverCount,
    defensiveRecoveryCount: segment.defensiveRecoveryCount,
    goalkeeperSecureCount: segment.goalkeeperSecureCount,
    resetPhaseCount: segment.resetPhaseCount,
    continuationCount: segment.continuationCount,
    repeatedDangerPhaseCount: segment.repeatedDangerPhaseCount,
    consecutiveScoringOpportunityCount: segment.consecutiveScoringOpportunityCount,
    sameTeamConsecutiveOpportunityCount: segment.sameTeamConsecutiveOpportunityCount,
    sameFamilyConsecutiveOpportunityCount: segment.sameFamilyConsecutiveOpportunityCount,
    routeFamilyMixBySegment: segment.routeFamilyMixBySegment,
    pointsBySegment: segment.pointsBySegment,
    scoringDensityPerSequence: round(segment.scoringOpportunityCount / Math.max(1, sequenceCount)),
    scoringDensityPerPossession: round(segment.scoringOpportunityCount / Math.max(1, possessionCount)),
    scoringDensityWarningCodes: warningsForSegment(segment),
  };
}

export function auditFullMatchSegmentScoringDensity(report: MatchReport): FullMatchSegmentScoringDensityAudit {
  const segments = new Map<string, MutableSegment>();

  for (const event of report.timeline) {
    const segmentLabel = segmentLabelForEvent(event);
    const segment = segments.get(segmentLabel) ?? {
      segmentLabel,
      period: event.timestamp.period,
      startMinute: event.timestamp.minute,
      sequenceIds: new Set<string>(),
      teamIds: new Set<TeamId>(),
      possessionCount: 0,
      dangerPhaseCount: 0,
      scoringOpportunityCount: 0,
      scoringEventCount: 0,
      scoreChangeCount: 0,
      nonScoringOutcomeCount: 0,
      neutralPhaseCount: 0,
      turnoverCount: 0,
      defensiveRecoveryCount: 0,
      goalkeeperSecureCount: 0,
      resetPhaseCount: 0,
      continuationCount: 0,
      repeatedDangerPhaseCount: 0,
      consecutiveScoringOpportunityCount: 0,
      sameTeamConsecutiveOpportunityCount: 0,
      sameFamilyConsecutiveOpportunityCount: 0,
      routeFamilyMixBySegment: emptyRouteFamilyMix(),
      pointsBySegment: 0,
      previousWasOpportunity: false,
    };

    segment.period = event.timestamp.period;
    segment.startMinute = Math.min(segment.startMinute, event.timestamp.minute);
    segment.sequenceIds.add(event.sequenceId);
    segment.teamIds.add(event.teamId);
    segment.possessionCount += 1;

    const family = routeFamilyForEvent(event);
    const scorePoints = scoreChangePoints(event);
    const opportunity = isRouteFamilyOpportunity(event);

    if (family !== null) {
      segment.routeFamilyMixBySegment[family] += 1;
    }
    if (isDangerPhase(event)) {
      segment.dangerPhaseCount += 1;
    }
    if (opportunity && family !== null) {
      segment.scoringOpportunityCount += 1;
      if (segment.previousWasOpportunity) {
        segment.consecutiveScoringOpportunityCount += 1;
      }
      if (segment.previousOpportunityTeamId === event.teamId) {
        segment.sameTeamConsecutiveOpportunityCount += 1;
      }
      if (segment.previousOpportunityFamily === family) {
        segment.sameFamilyConsecutiveOpportunityCount += 1;
      }
      segment.previousOpportunityTeamId = event.teamId;
      segment.previousOpportunityFamily = family;
      segment.previousWasOpportunity = true;
    } else {
      segment.previousWasOpportunity = false;
    }
    if (scorePoints > 0) {
      segment.scoringEventCount += 1;
      segment.scoreChangeCount += 1;
      segment.pointsBySegment += scorePoints;
    }
    if (event.tags.includes("official_route_family_non_scoring_outcome") || event.tags.includes("official_scoring_resolution_non_scoring")) {
      segment.nonScoringOutcomeCount += 1;
      segment.resetPhaseCount += 1;
    }
    if (isNeutralPhase(event)) {
      segment.neutralPhaseCount += 1;
    }
    if (isTurnover(event)) {
      segment.turnoverCount += 1;
      segment.resetPhaseCount += 1;
    }
    if (isDefensiveRecovery(event)) {
      segment.defensiveRecoveryCount += 1;
    }
    if (event.eventType === "goalkeeper_action" && scorePoints === 0) {
      segment.goalkeeperSecureCount += 1;
      segment.resetPhaseCount += 1;
    }
    if (event.tags.includes("official_route_family_CONTINUATION")) {
      segment.continuationCount += 1;
      segment.resetPhaseCount += 1;
    }
    if (segment.dangerPhaseCount > segment.scoringOpportunityCount) {
      segment.repeatedDangerPhaseCount = Math.max(0, segment.dangerPhaseCount - 1);
    }

    segments.set(segmentLabel, segment);
  }

  const rows = [...segments.values()].map(toRow);
  const sum = (selector: (row: FullMatchSegmentScoringDensityAuditRow) => number): number =>
    rows.reduce((total, row) => total + selector(row), 0);

  return {
    rows,
    scoringOpportunityCount: sum((row) => row.scoringOpportunityCount),
    scoringEventCount: sum((row) => row.scoringEventCount),
    scoreChangeCount: sum((row) => row.scoreChangeCount),
    dangerPhaseCount: sum((row) => row.dangerPhaseCount),
    neutralPhaseCount: sum((row) => row.neutralPhaseCount),
    turnoverCount: sum((row) => row.turnoverCount),
    defensiveRecoveryCount: sum((row) => row.defensiveRecoveryCount),
    goalkeeperSecureCount: sum((row) => row.goalkeeperSecureCount),
    resetPhaseCount: sum((row) => row.resetPhaseCount),
    continuationCount: sum((row) => row.continuationCount),
    repeatedDangerPhaseCount: sum((row) => row.repeatedDangerPhaseCount),
    consecutiveScoringOpportunityCount: sum((row) => row.consecutiveScoringOpportunityCount),
    sameTeamConsecutiveOpportunityCount: sum((row) => row.sameTeamConsecutiveOpportunityCount),
    sameFamilyConsecutiveOpportunityCount: sum((row) => row.sameFamilyConsecutiveOpportunityCount),
  };
}
