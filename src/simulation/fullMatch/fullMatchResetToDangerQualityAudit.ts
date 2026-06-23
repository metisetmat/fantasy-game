import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type ResetToDangerSourceBreakType =
  | "POST_SCORE_RESET"
  | "GOALKEEPER_SECURE"
  | "DEFENSIVE_RECOVERY"
  | "TURNOVER"
  | "NEUTRAL_PHASE"
  | "OUT_OF_PLAY";

export type ResetToDangerQualityWarningCode =
  | "RESET_TO_IMMEDIATE_DANGER"
  | "RESET_TO_DANGER_WITHOUT_SUPPORT"
  | "RESET_TO_DANGER_WITHOUT_SPACING"
  | "RESET_TO_DANGER_WITHOUT_TACTICAL_EDGE"
  | "RESET_TO_DANGER_DESPITE_DEFENSIVE_RECOVERY"
  | "RESET_TO_DANGER_DESPITE_GOALKEEPER_SECURE"
  | "RESET_TO_DANGER_DESPITE_LOW_FATIGUE_EDGE"
  | "EARNED_RESET_TO_DANGER"
  | "AUTOMATIC_RESET_TO_DANGER_SUSPECTED";

export interface ResetToDangerQualityRow {
  readonly resetEventId: string;
  readonly resetTeamId: TeamId;
  readonly nextPossessionTeamId: TeamId;
  readonly dangerTeamId: TeamId;
  readonly resetType: string;
  readonly sourceBreakType: ResetToDangerSourceBreakType;
  readonly sequencesBetweenResetAndDanger: number;
  readonly dangerGeneratedImmediately: boolean;
  readonly dangerZone: ZoneId;
  readonly dangerFamily: string;
  readonly dangerRoute: string;
  readonly attackingTeamPressureRelief: number;
  readonly attackingTeamSupportScore: number;
  readonly attackingTeamSpacingScore: number;
  readonly attackingTeamFatigueState: number;
  readonly defendingTeamRecoveryScore: number;
  readonly defendingTeamRestDefenseScore: number;
  readonly defendingTeamFatigueState: number;
  readonly goalkeeperSecureFollowup: boolean;
  readonly tacticalJustificationScore: number;
  readonly attributeJustificationScore: number;
  readonly earnedDanger: boolean;
  readonly automaticDangerSuspicion: boolean;
  readonly dangerQualityWarningCodes: readonly ResetToDangerQualityWarningCode[];
}

export interface FullMatchResetToDangerQualityAudit {
  readonly matchId: string;
  readonly resetEventCount: number;
  readonly resetToDangerCount: number;
  readonly resetToImmediateDangerCount: number;
  readonly resetToImmediateDangerRate: number;
  readonly earnedDangerCount: number;
  readonly earnedDangerRate: number;
  readonly automaticDangerSuspicionCount: number;
  readonly automaticDangerSuspicionRate: number;
  readonly goalkeeperSecureFollowupDangerCount: number;
  readonly defensiveRecoveryFollowupDangerCount: number;
  readonly rows: readonly ResetToDangerQualityRow[];
  readonly warningCodes: readonly ResetToDangerQualityWarningCode[];
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : round((numerator / denominator) * 100);
}

function normalizedTags(event: MatchEvent): readonly string[] {
  return event.tags.map((tag) => tag.toLowerCase());
}

function hasTag(event: MatchEvent, value: string): boolean {
  return normalizedTags(event).some((tag) => tag.includes(value));
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function sortedTimeline(report: MatchReport): readonly MatchEvent[] {
  return [...report.timeline].sort((a, b) =>
    a.timestamp.minute - b.timestamp.minute || a.timestamp.tick - b.timestamp.tick
  );
}

function isReset(event: MatchEvent): boolean {
  return event.outcome === "neutral" ||
    hasTag(event, "official_route_family_continuation") ||
    hasTag(event, "reset") ||
    hasTag(event, "restart") ||
    hasTag(event, "recovery");
}

function isDanger(event: MatchEvent): boolean {
  return event.eventType === "scoring" ||
    scoreChangePoints(event) > 0 ||
    hasTag(event, "official_route_family_shot_goal") ||
    hasTag(event, "official_route_family_try_touchdown") ||
    hasTag(event, "official_route_family_drop_goal");
}

function sourceBreakType(event: MatchEvent): ResetToDangerSourceBreakType {
  if (hasTag(event, "goalkeeper_secure") || event.eventType === "goalkeeper_action") {
    return "GOALKEEPER_SECURE";
  }
  if (hasTag(event, "post_score") || hasTag(event, "restart")) {
    return "POST_SCORE_RESET";
  }
  if (hasTag(event, "recovery")) {
    return "DEFENSIVE_RECOVERY";
  }
  if (hasTag(event, "turnover") || event.eventType === "turnover") {
    return "TURNOVER";
  }
  if (hasTag(event, "out_of_play")) {
    return "OUT_OF_PLAY";
  }
  return "NEUTRAL_PHASE";
}

function dangerFamily(event: MatchEvent): string {
  const routeTag = event.tags.find((tag) => tag.startsWith("official_route_family_") && !tag.includes("candidate") && !tag.includes("outcome"));
  if (routeTag !== undefined) {
    return routeTag.replace("official_route_family_", "");
  }
  return event.scoringFamily ?? event.scoringAction ?? event.tacticalContext.moveType ?? "UNKNOWN";
}

function fatigueValue(event: MatchEvent): number {
  return event.fatigueContext.teamCondition ?? event.fatigueContext.primaryPlayerCondition ?? 70;
}

function supportScore(reset: MatchEvent, danger: MatchEvent): number {
  const base = danger.narrativeWeight >= 75 ? 74 : 62;
  const routeBonus = hasTag(danger, "try_touchdown") || hasTag(danger, "drop_goal") ? 8 : 0;
  const resetPenalty = sourceBreakType(reset) === "GOALKEEPER_SECURE" ? 4 : 0;
  return Math.max(0, Math.min(100, base + routeBonus - resetPenalty));
}

function spacingScore(danger: MatchEvent): number {
  const zone = danger.zone;
  const wideBonus = zone.includes("L") || zone.includes("R") ? 8 : 0;
  const centralPenalty = zone.includes("-C") ? 4 : 0;
  return Math.max(0, Math.min(100, 64 + wideBonus - centralPenalty + Math.round(danger.narrativeWeight / 12)));
}

function pressureRelief(reset: MatchEvent, danger: MatchEvent): number {
  const immediatePenalty = danger.timestamp.tick - reset.timestamp.tick <= 110 ? 8 : 0;
  const resetBonus = reset.outcome === "neutral" ? 12 : 4;
  return Math.max(0, Math.min(100, 58 + resetBonus - immediatePenalty));
}

function warningCodes(input: {
  readonly rowBase: Omit<ResetToDangerQualityRow, "earnedDanger" | "automaticDangerSuspicion" | "dangerQualityWarningCodes">;
  readonly earned: boolean;
}): readonly ResetToDangerQualityWarningCode[] {
  const warnings: ResetToDangerQualityWarningCode[] = [];
  if (input.rowBase.dangerGeneratedImmediately) {
    warnings.push("RESET_TO_IMMEDIATE_DANGER");
  }
  if (input.rowBase.attackingTeamSupportScore < 65) {
    warnings.push("RESET_TO_DANGER_WITHOUT_SUPPORT");
  }
  if (input.rowBase.attackingTeamSpacingScore < 65) {
    warnings.push("RESET_TO_DANGER_WITHOUT_SPACING");
  }
  if (input.rowBase.tacticalJustificationScore < 68) {
    warnings.push("RESET_TO_DANGER_WITHOUT_TACTICAL_EDGE");
  }
  if (input.rowBase.sourceBreakType === "DEFENSIVE_RECOVERY") {
    warnings.push("RESET_TO_DANGER_DESPITE_DEFENSIVE_RECOVERY");
  }
  if (input.rowBase.sourceBreakType === "GOALKEEPER_SECURE") {
    warnings.push("RESET_TO_DANGER_DESPITE_GOALKEEPER_SECURE");
  }
  if (input.rowBase.attackingTeamFatigueState <= input.rowBase.defendingTeamFatigueState + 3) {
    warnings.push("RESET_TO_DANGER_DESPITE_LOW_FATIGUE_EDGE");
  }
  warnings.push(input.earned ? "EARNED_RESET_TO_DANGER" : "AUTOMATIC_RESET_TO_DANGER_SUSPECTED");
  return [...new Set(warnings)];
}

export function auditFullMatchResetToDangerQuality(report: MatchReport): FullMatchResetToDangerQualityAudit {
  const timeline = sortedTimeline(report);
  const resetEvents = timeline.filter(isReset);
  const rows: ResetToDangerQualityRow[] = [];

  for (const reset of resetEvents) {
    const resetIndex = timeline.findIndex((event) => event.eventId === reset.eventId);
    const later = timeline.slice(resetIndex + 1);
    const nextPossession = later.find((event) => event.teamId !== reset.teamId || isDanger(event));
    const nextDanger = later.find(isDanger);
    if (nextPossession === undefined || nextDanger === undefined) {
      continue;
    }

    const sequencesBetween = Math.max(0, nextDanger.timestamp.tick - reset.timestamp.tick);
    const generatedImmediately = sequencesBetween <= 120;
    const attackingFatigue = fatigueValue(nextDanger);
    const defendingFatigue = fatigueValue(reset);
    const rowBase = {
      resetEventId: reset.eventId,
      resetTeamId: reset.teamId,
      nextPossessionTeamId: nextPossession.teamId,
      dangerTeamId: nextDanger.teamId,
      resetType: reset.tacticalContext.moveType ?? reset.eventType,
      sourceBreakType: sourceBreakType(reset),
      sequencesBetweenResetAndDanger: sequencesBetween,
      dangerGeneratedImmediately: generatedImmediately,
      dangerZone: nextDanger.zone,
      dangerFamily: dangerFamily(nextDanger),
      dangerRoute: nextDanger.tacticalContext.moveType ?? dangerFamily(nextDanger),
      attackingTeamPressureRelief: pressureRelief(reset, nextDanger),
      attackingTeamSupportScore: supportScore(reset, nextDanger),
      attackingTeamSpacingScore: spacingScore(nextDanger),
      attackingTeamFatigueState: attackingFatigue,
      defendingTeamRecoveryScore: reset.narrativeWeight,
      defendingTeamRestDefenseScore: sourceBreakType(reset) === "GOALKEEPER_SECURE" ? 78 : 66,
      defendingTeamFatigueState: defendingFatigue,
      goalkeeperSecureFollowup: sourceBreakType(reset) === "GOALKEEPER_SECURE",
      tacticalJustificationScore: 0,
      attributeJustificationScore: 0,
    };
    const tacticalJustificationScore = round((
      rowBase.attackingTeamPressureRelief +
      rowBase.attackingTeamSupportScore +
      rowBase.attackingTeamSpacingScore +
      (generatedImmediately ? 56 : 72)
    ) / 4);
    const attributeJustificationScore = round((
      attackingFatigue +
      Math.max(0, 100 - defendingFatigue) +
      nextDanger.narrativeWeight
    ) / 3);
    const earned = tacticalJustificationScore >= 68 &&
      attributeJustificationScore >= 58 &&
      (
        !generatedImmediately ||
        rowBase.attackingTeamSupportScore >= 70 ||
        rowBase.attackingTeamSpacingScore >= 70 ||
        attackingFatigue > defendingFatigue + 6
      );
    const completeBase = {
      ...rowBase,
      tacticalJustificationScore,
      attributeJustificationScore,
    };
    rows.push({
      ...completeBase,
      earnedDanger: earned,
      automaticDangerSuspicion: !earned,
      dangerQualityWarningCodes: warningCodes({ rowBase: completeBase, earned }),
    });
  }

  const resetToImmediateDangerCount = rows.filter((row) => row.dangerGeneratedImmediately).length;
  const earnedDangerCount = rows.filter((row) => row.earnedDanger).length;
  const automaticDangerSuspicionCount = rows.filter((row) => row.automaticDangerSuspicion).length;
  const goalkeeperSecureFollowupDangerCount = rows.filter((row) => row.sourceBreakType === "GOALKEEPER_SECURE").length;
  const defensiveRecoveryFollowupDangerCount = rows.filter((row) => row.sourceBreakType === "DEFENSIVE_RECOVERY").length;

  return {
    matchId: report.matchId,
    resetEventCount: resetEvents.length,
    resetToDangerCount: rows.length,
    resetToImmediateDangerCount,
    resetToImmediateDangerRate: percent(resetToImmediateDangerCount, rows.length),
    earnedDangerCount,
    earnedDangerRate: percent(earnedDangerCount, rows.length),
    automaticDangerSuspicionCount,
    automaticDangerSuspicionRate: percent(automaticDangerSuspicionCount, rows.length),
    goalkeeperSecureFollowupDangerCount,
    defensiveRecoveryFollowupDangerCount,
    rows,
    warningCodes: [...new Set(rows.flatMap((row) => row.dangerQualityWarningCodes))],
  };
}
