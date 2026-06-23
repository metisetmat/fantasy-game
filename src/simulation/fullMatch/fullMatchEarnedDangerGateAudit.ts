import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type {
  EarnedDangerClassification,
  EarnedDangerGateDecision,
  EarnedDangerGateReasonCode,
  EarnedDangerGateWarningCode,
  EarnedDangerResetSourceType,
} from "./earnedDangerGate";

export interface EarnedDangerGateAuditRow {
  readonly matchId: string;
  readonly segmentId: string;
  readonly resetEventId: string;
  readonly resetMinute: number;
  readonly resetTeamId: TeamId;
  readonly dangerTeamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly resetSourceType: EarnedDangerResetSourceType;
  readonly dangerGenerated: boolean;
  readonly dangerGeneratedImmediately: boolean;
  readonly sequencesBetweenResetAndDanger: number;
  readonly possessionChangesBetweenResetAndDanger: number;
  readonly dangerZone: ZoneId;
  readonly dangerRouteFamily: string;
  readonly dangerActionType: string;
  readonly scoringOpportunityCreated: boolean;
  readonly scoringEventCreated: boolean;
  readonly scoreChangeCreated: boolean;
  readonly attackingSupportScore: number;
  readonly attackingSpacingScore: number;
  readonly attackingStructureScore: number;
  readonly attackingTransitionSpeedScore: number;
  readonly attackingTechnicalEdgeScore: number;
  readonly attackingPhysicalEdgeScore: number;
  readonly attackingFatigueState: number;
  readonly defendingRestDefenseScore: number;
  readonly defendingRecoveryScore: number;
  readonly defendingSpacingScore: number;
  readonly defendingFatigueState: number;
  readonly defendingPressureScore: number;
  readonly goalkeeperSecureContext: boolean;
  readonly postScoreContext: boolean;
  readonly tacticalEdgeScore: number;
  readonly attributeEdgeScore: number;
  readonly fatigueEdgeScore: number;
  readonly pressureEdgeScore: number;
  readonly mistakeEdgeScore: number;
  readonly earnedDangerScore: number;
  readonly earnedDangerClassification: EarnedDangerClassification;
  readonly gateDecision: EarnedDangerGateDecision;
  readonly gateReasonCodes: readonly EarnedDangerGateReasonCode[];
  readonly warningCodes: readonly EarnedDangerGateWarningCode[];
  readonly recommendation: string;
}

export interface FullMatchEarnedDangerGateAudit {
  readonly matchId: string;
  readonly gateConnectedCount: number;
  readonly resetToDangerGateRowCount: number;
  readonly earnedDangerCount: number;
  readonly borderlineDangerCount: number;
  readonly automaticDangerSuspicionCount: number;
  readonly dangerBlockedByGateCount: number;
  readonly dangerDowngradedToNeutralCount: number;
  readonly dangerDowngradedToSafePossessionCount: number;
  readonly resetToImmediateDangerCount: number;
  readonly resetToDangerWithoutSupportCount: number;
  readonly resetToDangerWithoutTacticalEdgeCount: number;
  readonly resetToDangerWithoutAttributeEdgeCount: number;
  readonly resetToDangerDespiteGoalkeeperSecureCount: number;
  readonly resetToDangerDespiteDefensiveRecoveryCount: number;
  readonly goalkeeperSecureToDangerAgainstCount: number;
  readonly goalkeeperSecureToDangerAgainstEarnedCount: number;
  readonly goalkeeperSecureToDangerAgainstAutomaticSuspicionCount: number;
  readonly goalkeeperSecureDangerDowngradedCount: number;
  readonly postScoreResetToDangerCount: number;
  readonly postScoreResetToEarnedDangerCount: number;
  readonly postScoreResetToAutomaticDangerCount: number;
  readonly scoringTeamPostScoreReattackEarnedCount: number;
  readonly scoringTeamPostScoreReattackAutomaticSuspicionCount: number;
  readonly decisionDistribution: Readonly<Record<EarnedDangerGateDecision, number>>;
  readonly classificationDistribution: Readonly<Record<EarnedDangerClassification, number>>;
  readonly reasonCodeDistribution: readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[];
  readonly warningCodeDistribution: readonly { readonly warningCode: EarnedDangerGateWarningCode; readonly count: number }[];
  readonly rows: readonly EarnedDangerGateAuditRow[];
}

const DECISIONS: readonly EarnedDangerGateDecision[] = [
  "ALLOW_DANGER",
  "ALLOW_BORDERLINE_DANGER",
  "DOWNGRADE_TO_NEUTRAL",
  "DOWNGRADE_TO_SAFE_POSSESSION",
  "FORCE_REBUILD_PHASE",
  "KEEP_RESET",
];

const CLASSIFICATIONS: readonly EarnedDangerClassification[] = [
  "EARNED",
  "BORDERLINE",
  "AUTOMATIC_SUSPECTED",
  "BLOCKED_BY_GATE",
  "DOWNGRADED_TO_NEUTRAL",
  "DOWNGRADED_TO_SAFE_POSSESSION",
];

function emptyRecord<T extends string>(values: readonly T[]): Record<T, number> {
  return values.reduce<Record<T, number>>((record, value) => {
    record[value] = 0;
    return record;
  }, {} as Record<T, number>);
}

function countValues<T extends string>(values: readonly T[], keyName: string): readonly { readonly [key: string]: string | number }[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([value, count]) => ({ [keyName]: value, count }));
}

function sortedTimeline(report: MatchReport): readonly MatchEvent[] {
  return [...report.timeline].sort((left, right) =>
    left.timestamp.minute - right.timestamp.minute || left.timestamp.tick - right.timestamp.tick
  );
}

function tags(event: MatchEvent): readonly string[] {
  return event.tags.map((tag) => tag.toLowerCase());
}

function hasTag(event: MatchEvent, fragment: string): boolean {
  return tags(event).some((tag) => tag.includes(fragment));
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function isReset(event: MatchEvent): boolean {
  return event.outcome === "neutral" ||
    hasTag(event, "continuation") ||
    hasTag(event, "reset") ||
    hasTag(event, "restart") ||
    hasTag(event, "recovery");
}

function resetSourceType(event: MatchEvent): EarnedDangerResetSourceType {
  if (event.eventType === "goalkeeper_action" || hasTag(event, "goalkeeper") || hasTag(event, "keeper")) {
    return "GOALKEEPER_SECURE";
  }
  if (hasTag(event, "post_score") || hasTag(event, "restart")) {
    return "POST_SCORE_RESET";
  }
  if (hasTag(event, "recovery")) {
    return "DEFENSIVE_RECOVERY";
  }
  if (event.eventType === "turnover" || hasTag(event, "turnover")) {
    return "TURNOVER";
  }
  if (hasTag(event, "out_of_play")) {
    return "OUT_OF_PLAY";
  }
  if (event.outcome === "neutral") {
    return "NEUTRAL_PHASE";
  }
  return "SAFE_POSSESSION";
}

function routeFamily(event: MatchEvent): string {
  const routeTag = event.tags.find((tag) =>
    tag.startsWith("official_route_family_") &&
    !tag.includes("candidate") &&
    !tag.includes("outcome") &&
    !tag.includes("mix") &&
    !tag.includes("non_")
  );
  if (routeTag !== undefined) {
    return routeTag.replace("official_route_family_", "");
  }
  return event.scoringFamily ?? event.scoringAction ?? event.tacticalContext.moveType ?? "UNKNOWN";
}

function numberFromReason(reason: string, label: string, fallback: number): number {
  const match = new RegExp(`${label} ([0-9]+(?:\\.[0-9]+)?)`, "u").exec(reason);
  return match === null ? fallback : Number(match[1]);
}

function classificationFromReason(reason: string, event: MatchEvent): EarnedDangerClassification {
  if (reason.includes("classification DOWNGRADED_TO_SAFE_POSSESSION")) {
    return "DOWNGRADED_TO_SAFE_POSSESSION";
  }
  if (reason.includes("classification DOWNGRADED_TO_NEUTRAL")) {
    return "DOWNGRADED_TO_NEUTRAL";
  }
  if (reason.includes("classification BLOCKED_BY_GATE")) {
    return "BLOCKED_BY_GATE";
  }
  if (hasTag(event, "borderline_danger_allowed")) {
    return "BORDERLINE";
  }
  if (hasTag(event, "earned_danger_confirmed")) {
    return "EARNED";
  }
  return "AUTOMATIC_SUSPECTED";
}

function decisionFromEvent(event: MatchEvent): EarnedDangerGateDecision {
  const reason = event.tacticalContext.reason ?? "";
  if (reason.includes("DOWNGRADE_TO_SAFE_POSSESSION")) {
    return "DOWNGRADE_TO_SAFE_POSSESSION";
  }
  if (reason.includes("DOWNGRADE_TO_NEUTRAL")) {
    return "DOWNGRADE_TO_NEUTRAL";
  }
  if (reason.includes("FORCE_REBUILD_PHASE")) {
    return "FORCE_REBUILD_PHASE";
  }
  if (hasTag(event, "borderline_danger_allowed")) {
    return "ALLOW_BORDERLINE_DANGER";
  }
  if (hasTag(event, "earned_danger_confirmed")) {
    return "ALLOW_DANGER";
  }
  return "KEEP_RESET";
}

function reasonCodesFromReason(reason: string): readonly EarnedDangerGateReasonCode[] {
  const match = /reasons ([A-Z0-9_+]+)/u.exec(reason);
  if (match?.[1] === undefined) {
    return [];
  }
  return match[1].split("+") as EarnedDangerGateReasonCode[];
}

function warningCodesForRow(row: Omit<EarnedDangerGateAuditRow, "warningCodes">): readonly EarnedDangerGateWarningCode[] {
  const warnings: EarnedDangerGateWarningCode[] = [];
  if (row.dangerGeneratedImmediately) warnings.push("RESET_TO_IMMEDIATE_DANGER");
  if (row.attackingSupportScore < 65) warnings.push("RESET_TO_DANGER_WITHOUT_SUPPORT");
  if (row.attackingSpacingScore < 65) warnings.push("RESET_TO_DANGER_WITHOUT_SPACING");
  if (row.tacticalEdgeScore < 65) warnings.push("RESET_TO_DANGER_WITHOUT_TACTICAL_EDGE");
  if (row.attributeEdgeScore < 65) warnings.push("RESET_TO_DANGER_WITHOUT_ATTRIBUTE_EDGE");
  if (row.fatigueEdgeScore < 55) warnings.push("RESET_TO_DANGER_WITHOUT_FATIGUE_EDGE");
  if (row.goalkeeperSecureContext) warnings.push("RESET_TO_DANGER_DESPITE_GOALKEEPER_SECURE");
  if (row.resetSourceType === "DEFENSIVE_RECOVERY") warnings.push("RESET_TO_DANGER_DESPITE_DEFENSIVE_RECOVERY");
  if (row.postScoreContext && row.dangerGeneratedImmediately) warnings.push("RESET_TO_DANGER_TOO_FAST_AFTER_SCORE");
  if (row.earnedDangerClassification === "EARNED") warnings.push("EARNED_DANGER_CONFIRMED");
  if (row.earnedDangerClassification === "BORDERLINE") warnings.push("BORDERLINE_DANGER_ALLOWED");
  if (row.earnedDangerClassification === "AUTOMATIC_SUSPECTED") warnings.push("AUTOMATIC_RESET_TO_DANGER_SUSPECTED");
  if (row.gateDecision === "DOWNGRADE_TO_NEUTRAL" || row.gateDecision === "DOWNGRADE_TO_SAFE_POSSESSION") {
    warnings.push("DANGER_DOWNGRADED_BY_GATE");
  }
  if (row.gateDecision === "FORCE_REBUILD_PHASE") {
    warnings.push("DANGER_BLOCKED_BY_GATE", "RESET_REBUILD_REQUIRED");
  }
  return [...new Set(warnings)];
}

function fatigue(event: MatchEvent): number {
  return event.fatigueContext.teamCondition ?? event.fatigueContext.primaryPlayerCondition ?? 70;
}

function buildRow(report: MatchReport, timeline: readonly MatchEvent[], event: MatchEvent): EarnedDangerGateAuditRow {
  const index = timeline.findIndex((item) => item.eventId === event.eventId);
  const previousReset = [...timeline.slice(0, Math.max(0, index))]
    .reverse()
    .find(isReset) ?? event;
  const sequencesBetween = Math.max(0, event.timestamp.tick - previousReset.timestamp.tick);
  const decision = decisionFromEvent(event);
  const reason = event.tacticalContext.reason ?? "";
  const classification = classificationFromReason(reason, event);
  const generated = decision === "ALLOW_DANGER" || decision === "ALLOW_BORDERLINE_DANGER";
  const reasonCodes = reasonCodesFromReason(reason);
  const earnedScore = numberFromReason(reason, "score", generated ? 68 : 42);
  const support = reasonCodes.includes("SUPPORT_EDGE") ? 72 : 52;
  const spacing = reasonCodes.includes("SPACING_EDGE") ? 72 : 54;
  const tactical = reasonCodes.includes("TACTICAL_EDGE") ? 71 : 53;
  const attribute = reasonCodes.includes("ATTRIBUTE_EDGE") ? 71 : 52;
  const fatigueEdge = reasonCodes.includes("FATIGUE_EDGE") ? 62 : 42;
  const pressureEdge = reasonCodes.includes("PRESSURE_EDGE") ? 66 : 48;
  const mistakeEdge = reasonCodes.includes("MISTAKE_EDGE") ? 58 : 24;
  const resetType = resetSourceType(previousReset);
  const rowBase = {
    matchId: report.matchId,
    segmentId: event.sequenceId,
    resetEventId: previousReset.eventId,
    resetMinute: previousReset.timestamp.minute,
    resetTeamId: previousReset.teamId,
    dangerTeamId: event.teamId,
    opponentTeamId: event.opponentTeamId,
    resetSourceType: resetType,
    dangerGenerated: generated,
    dangerGeneratedImmediately: sequencesBetween <= 160,
    sequencesBetweenResetAndDanger: sequencesBetween,
    possessionChangesBetweenResetAndDanger: timeline.slice(Math.max(0, timeline.findIndex((item) => item.eventId === previousReset.eventId)), index + 1)
      .filter((item, itemIndex, items) => itemIndex > 0 && item.teamId !== items[itemIndex - 1]?.teamId)
      .length,
    dangerZone: event.zone,
    dangerRouteFamily: routeFamily(event),
    dangerActionType: event.tacticalContext.moveType ?? event.eventType,
    scoringOpportunityCreated: generated,
    scoringEventCreated: event.eventType === "scoring",
    scoreChangeCreated: scoreChangePoints(event) > 0,
    attackingSupportScore: support,
    attackingSpacingScore: spacing,
    attackingStructureScore: Math.round((support + tactical) / 2),
    attackingTransitionSpeedScore: sequencesBetween <= 160 ? 64 : 46,
    attackingTechnicalEdgeScore: attribute,
    attackingPhysicalEdgeScore: Math.round((attribute + fatigue(event)) / 2),
    attackingFatigueState: fatigue(event),
    defendingRestDefenseScore: resetType === "GOALKEEPER_SECURE" ? 82 : resetType === "POST_SCORE_RESET" ? 76 : 66,
    defendingRecoveryScore: previousReset.narrativeWeight,
    defendingSpacingScore: resetType === "GOALKEEPER_SECURE" ? 78 : 64,
    defendingFatigueState: fatigue(previousReset),
    defendingPressureScore: previousReset.tacticalContext.pressureLevel === "high" ? 74 : previousReset.tacticalContext.pressureLevel === "medium" ? 62 : 48,
    goalkeeperSecureContext: resetType === "GOALKEEPER_SECURE",
    postScoreContext: resetType === "POST_SCORE_RESET",
    tacticalEdgeScore: tactical,
    attributeEdgeScore: attribute,
    fatigueEdgeScore: fatigueEdge,
    pressureEdgeScore: pressureEdge,
    mistakeEdgeScore: mistakeEdge,
    earnedDangerScore: earnedScore,
    earnedDangerClassification: classification,
    gateDecision: decision,
    gateReasonCodes: reasonCodes,
    recommendation: generated ? "KEEP_FAST_TRANSITION_WHEN_JUSTIFIED" : "DOWNGRADE_UNEARNED_RESET_DANGER",
  };
  return {
    ...rowBase,
    warningCodes: warningCodesForRow(rowBase),
  };
}

export function auditFullMatchEarnedDangerGate(report: MatchReport): FullMatchEarnedDangerGateAudit {
  const timeline = sortedTimeline(report);
  const gateEvents = timeline.filter((event) => hasTag(event, "earned_danger_gate_6n"));
  const rows = gateEvents.map((event) => buildRow(report, timeline, event));
  const decisionDistribution = emptyRecord(DECISIONS);
  const classificationDistribution = emptyRecord(CLASSIFICATIONS);
  for (const row of rows) {
    decisionDistribution[row.gateDecision] += 1;
    classificationDistribution[row.earnedDangerClassification] += 1;
  }
  const gateConnectedCount = rows.length;
  const earnedDangerCount = rows.filter((row) => row.earnedDangerClassification === "EARNED").length;
  const borderlineDangerCount = rows.filter((row) => row.earnedDangerClassification === "BORDERLINE").length;
  const automaticDangerSuspicionCount = rows.filter((row) => row.earnedDangerClassification === "AUTOMATIC_SUSPECTED").length;
  const dangerBlockedByGateCount = rows.filter((row) => row.gateDecision === "FORCE_REBUILD_PHASE").length;
  const dangerDowngradedToNeutralCount = rows.filter((row) => row.gateDecision === "DOWNGRADE_TO_NEUTRAL").length;
  const dangerDowngradedToSafePossessionCount = rows.filter((row) => row.gateDecision === "DOWNGRADE_TO_SAFE_POSSESSION").length;
  const goalkeeperRows = rows.filter((row) => row.goalkeeperSecureContext);
  const postScoreRows = rows.filter((row) => row.postScoreContext);
  return {
    matchId: report.matchId,
    gateConnectedCount,
    resetToDangerGateRowCount: rows.length,
    earnedDangerCount,
    borderlineDangerCount,
    automaticDangerSuspicionCount,
    dangerBlockedByGateCount,
    dangerDowngradedToNeutralCount,
    dangerDowngradedToSafePossessionCount,
    resetToImmediateDangerCount: rows.filter((row) => row.dangerGeneratedImmediately && row.dangerGenerated).length,
    resetToDangerWithoutSupportCount: rows.filter((row) => row.dangerGenerated && row.attackingSupportScore < 65).length,
    resetToDangerWithoutTacticalEdgeCount: rows.filter((row) => row.dangerGenerated && row.tacticalEdgeScore < 65).length,
    resetToDangerWithoutAttributeEdgeCount: rows.filter((row) => row.dangerGenerated && row.attributeEdgeScore < 65).length,
    resetToDangerDespiteGoalkeeperSecureCount: goalkeeperRows.filter((row) => row.dangerGenerated).length,
    resetToDangerDespiteDefensiveRecoveryCount: rows.filter((row) => row.resetSourceType === "DEFENSIVE_RECOVERY" && row.dangerGenerated).length,
    goalkeeperSecureToDangerAgainstCount: goalkeeperRows.filter((row) => row.dangerGenerated).length,
    goalkeeperSecureToDangerAgainstEarnedCount: goalkeeperRows.filter((row) => row.earnedDangerClassification === "EARNED" || row.earnedDangerClassification === "BORDERLINE").length,
    goalkeeperSecureToDangerAgainstAutomaticSuspicionCount: goalkeeperRows.filter((row) => row.earnedDangerClassification === "AUTOMATIC_SUSPECTED").length,
    goalkeeperSecureDangerDowngradedCount: goalkeeperRows.filter((row) => !row.dangerGenerated).length,
    postScoreResetToDangerCount: postScoreRows.filter((row) => row.dangerGenerated).length,
    postScoreResetToEarnedDangerCount: postScoreRows.filter((row) => row.earnedDangerClassification === "EARNED" || row.earnedDangerClassification === "BORDERLINE").length,
    postScoreResetToAutomaticDangerCount: postScoreRows.filter((row) => row.earnedDangerClassification === "AUTOMATIC_SUSPECTED").length,
    scoringTeamPostScoreReattackEarnedCount: postScoreRows.filter((row) => row.dangerGenerated && row.earnedDangerClassification === "EARNED").length,
    scoringTeamPostScoreReattackAutomaticSuspicionCount: postScoreRows.filter((row) => row.earnedDangerClassification === "AUTOMATIC_SUSPECTED").length,
    decisionDistribution,
    classificationDistribution,
    reasonCodeDistribution: countValues(rows.flatMap((row) => row.gateReasonCodes), "reasonCode") as readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[],
    warningCodeDistribution: countValues(rows.flatMap((row) => row.warningCodes), "warningCode") as readonly { readonly warningCode: EarnedDangerGateWarningCode; readonly count: number }[],
    rows,
  };
}
