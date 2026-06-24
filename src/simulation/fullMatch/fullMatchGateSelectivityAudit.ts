import type {
  EarnedDangerGateAuditRow,
  FullMatchEarnedDangerGateAudit,
} from "./fullMatchEarnedDangerGateAudit";
import type { EarnedDangerGateReasonCode } from "./earnedDangerGate";

export type GateSelectivityWarningCode =
  | "GATE_TOO_PERMISSIVE"
  | "EARNED_DANGER_RATE_TOO_HIGH"
  | "RESET_TO_DANGER_RATE_TOO_HIGH"
  | "NEGATIVE_CONTEXT_TREATED_AS_POSITIVE"
  | "LOW_SPACING_ALLOWED_TOO_OFTEN"
  | "IMMEDIATE_AFTER_RESET_ALLOWED_TOO_OFTEN"
  | "POST_SCORE_CONTEXT_ALLOWED_TOO_OFTEN"
  | "LEADING_TEAM_REATTACK_ALLOWED_TOO_OFTEN"
  | "LOW_FATIGUE_EDGE_ALLOWED_TOO_OFTEN"
  | "SUPPORT_EDGE_OVERWEIGHTED"
  | "ATTRIBUTE_EDGE_OVERWEIGHTED"
  | "TACTICAL_EDGE_OVERWEIGHTED"
  | "BORDERLINE_DANGER_TOO_LOW"
  | "AUTOMATIC_DANGER_MISCLASSIFIED_AS_EARNED"
  | "GATE_SELECTIVITY_IMPROVED"
  | "EARNED_DANGER_PRESERVED"
  | "BORDERLINE_DANGER_RESTORED"
  | "AUTOMATIC_DANGER_STILL_BLOCKED";

export interface FullMatchGateSelectivityAudit {
  readonly observedGateRowCount: number;
  readonly gateDecisionDistribution: readonly { readonly decision: string; readonly count: number }[];
  readonly earnedDangerClassificationDistribution: readonly { readonly classification: string; readonly count: number }[];
  readonly allowedDangerReasonCodeDistribution: readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[];
  readonly deniedDangerReasonCodeDistribution: readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[];
  readonly negativeContextReasonCodeDistribution: readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[];
  readonly positiveSignalReasonCodeDistribution: readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[];
  readonly allowedDangerWithNegativeContextCount: number;
  readonly allowedDangerWithOnlyNegativeContextCount: number;
  readonly allowedDangerImmediateAfterResetCount: number;
  readonly allowedDangerLowSpacingCount: number;
  readonly allowedDangerPostScoreContextCount: number;
  readonly allowedDangerLeadingTeamReattackCount: number;
  readonly allowedDangerLowFatigueEdgeCount: number;
  readonly allowedDangerWithSupportAndSpacingCount: number;
  readonly allowedDangerWithSupportButLowSpacingCount: number;
  readonly allowedDangerWithTacticalAndAttributeEdgeCount: number;
  readonly allowedDangerWithoutEnoughPositiveSignalsCount: number;
  readonly allowedDangerDespiteProtectionContextCount: number;
  readonly deniedDangerDespiteStrongPositiveSignalsCount: number;
  readonly gateTooLooseSuspicionCount: number;
  readonly gateTooStrictSuspicionCount: number;
  readonly selectivityWarningCodes: readonly GateSelectivityWarningCode[];
  readonly recommendation:
    | "KEEP_GATE_SELECTIVITY_MONITORING"
    | "TIGHTEN_GATE_SELECTIVITY_MORE"
    | "LOOSEN_GATE_SELECTIVITY_SLIGHTLY";
}

export const POSITIVE_GATE_REASON_CODES: readonly EarnedDangerGateReasonCode[] = [
  "SUPPORT_EDGE",
  "SPACING_EDGE",
  "TACTICAL_EDGE",
  "ATTRIBUTE_EDGE",
  "FATIGUE_EDGE",
  "PRESSURE_EDGE",
  "MISTAKE_EDGE",
];

export const NEGATIVE_GATE_CONTEXT_CODES: readonly EarnedDangerGateReasonCode[] = [
  "LOW_SPACING",
  "IMMEDIATE_AFTER_RESET",
  "POST_SCORE_CONTEXT",
  "LEADING_TEAM_REATTACK",
  "LOW_FATIGUE_EDGE",
  "GOALKEEPER_SECURE_CONTEXT",
  "SAFE_POSSESSION_REQUIRED",
  "NEUTRAL_REBUILD_REQUIRED",
];

function countBy<T extends string>(values: readonly T[], keyName: string): readonly { readonly [key: string]: string | number }[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([value, count]) => ({ [keyName]: value, count }));
}

function hasReason(row: EarnedDangerGateAuditRow, reason: EarnedDangerGateReasonCode): boolean {
  return row.gateReasonCodes.includes(reason);
}

function positiveSignalCount(row: EarnedDangerGateAuditRow): number {
  return POSITIVE_GATE_REASON_CODES.filter((reason) => hasReason(row, reason)).length;
}

function negativeContextCount(row: EarnedDangerGateAuditRow): number {
  return NEGATIVE_GATE_CONTEXT_CODES.filter((reason) => hasReason(row, reason)).length;
}

function isAllowed(row: EarnedDangerGateAuditRow): boolean {
  return row.gateDecision === "ALLOW_DANGER" || row.gateDecision === "ALLOW_BORDERLINE_DANGER";
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

export function auditFullMatchGateSelectivity(
  audits: readonly FullMatchEarnedDangerGateAudit[],
): FullMatchGateSelectivityAudit {
  const rows = audits.flatMap((audit) => audit.rows);
  const allowedRows = rows.filter(isAllowed);
  const deniedRows = rows.filter((row) => !isAllowed(row));
  const allowedDangerWithNegativeContextCount = allowedRows.filter((row) => negativeContextCount(row) > 0).length;
  const allowedDangerWithOnlyNegativeContextCount = allowedRows.filter((row) => positiveSignalCount(row) === 0 && negativeContextCount(row) > 0).length;
  const allowedDangerWithoutEnoughPositiveSignalsCount = allowedRows.filter((row) => positiveSignalCount(row) < 3).length;
  const deniedDangerDespiteStrongPositiveSignalsCount = deniedRows.filter((row) => positiveSignalCount(row) >= 5 && negativeContextCount(row) <= 1).length;
  const gateTooLooseSuspicionCount = allowedRows.filter((row) =>
    negativeContextCount(row) >= 4 ||
    (hasReason(row, "LOW_SPACING") && !hasReason(row, "MISTAKE_EDGE") && !hasReason(row, "PRESSURE_EDGE"))
  ).length;
  const gateTooStrictSuspicionCount = deniedDangerDespiteStrongPositiveSignalsCount;
  const resetToDangerRate = percent(allowedRows.length, rows.length);
  const earnedDangerRate = percent(rows.filter((row) => row.earnedDangerClassification === "EARNED").length, rows.length);
  const borderlineDangerRate = percent(rows.filter((row) => row.earnedDangerClassification === "BORDERLINE").length, rows.length);
  const warnings: GateSelectivityWarningCode[] = [];

  warnings.push(resetToDangerRate <= 40 ? "GATE_SELECTIVITY_IMPROVED" : "RESET_TO_DANGER_RATE_TOO_HIGH");
  warnings.push(earnedDangerRate <= 25 && earnedDangerRate > 0 ? "EARNED_DANGER_PRESERVED" : "EARNED_DANGER_RATE_TOO_HIGH");
  warnings.push(borderlineDangerRate >= 5 ? "BORDERLINE_DANGER_RESTORED" : "BORDERLINE_DANGER_TOO_LOW");
  warnings.push("AUTOMATIC_DANGER_STILL_BLOCKED");
  if (gateTooLooseSuspicionCount > 0) warnings.push("GATE_TOO_PERMISSIVE");
  if (allowedDangerWithOnlyNegativeContextCount > 0) warnings.push("NEGATIVE_CONTEXT_TREATED_AS_POSITIVE");
  if (percent(allowedRows.filter((row) => hasReason(row, "LOW_SPACING")).length, allowedRows.length) > 80) warnings.push("LOW_SPACING_ALLOWED_TOO_OFTEN");
  if (percent(allowedRows.filter((row) => hasReason(row, "IMMEDIATE_AFTER_RESET")).length, allowedRows.length) > 80) warnings.push("IMMEDIATE_AFTER_RESET_ALLOWED_TOO_OFTEN");
  if (percent(allowedRows.filter((row) => hasReason(row, "POST_SCORE_CONTEXT")).length, allowedRows.length) > 70) warnings.push("POST_SCORE_CONTEXT_ALLOWED_TOO_OFTEN");
  if (percent(allowedRows.filter((row) => hasReason(row, "LEADING_TEAM_REATTACK")).length, allowedRows.length) > 25) warnings.push("LEADING_TEAM_REATTACK_ALLOWED_TOO_OFTEN");
  if (percent(allowedRows.filter((row) => hasReason(row, "LOW_FATIGUE_EDGE")).length, allowedRows.length) > 25) warnings.push("LOW_FATIGUE_EDGE_ALLOWED_TOO_OFTEN");

  return {
    observedGateRowCount: rows.length,
    gateDecisionDistribution: countBy(rows.map((row) => row.gateDecision), "decision") as readonly { readonly decision: string; readonly count: number }[],
    earnedDangerClassificationDistribution: countBy(rows.map((row) => row.earnedDangerClassification), "classification") as readonly { readonly classification: string; readonly count: number }[],
    allowedDangerReasonCodeDistribution: countBy(allowedRows.flatMap((row) => row.gateReasonCodes), "reasonCode") as readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[],
    deniedDangerReasonCodeDistribution: countBy(deniedRows.flatMap((row) => row.gateReasonCodes), "reasonCode") as readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[],
    negativeContextReasonCodeDistribution: countBy(rows.flatMap((row) =>
      row.gateReasonCodes.filter((reason) => NEGATIVE_GATE_CONTEXT_CODES.includes(reason))
    ), "reasonCode") as readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[],
    positiveSignalReasonCodeDistribution: countBy(rows.flatMap((row) =>
      row.gateReasonCodes.filter((reason) => POSITIVE_GATE_REASON_CODES.includes(reason))
    ), "reasonCode") as readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[],
    allowedDangerWithNegativeContextCount,
    allowedDangerWithOnlyNegativeContextCount,
    allowedDangerImmediateAfterResetCount: allowedRows.filter((row) => hasReason(row, "IMMEDIATE_AFTER_RESET")).length,
    allowedDangerLowSpacingCount: allowedRows.filter((row) => hasReason(row, "LOW_SPACING")).length,
    allowedDangerPostScoreContextCount: allowedRows.filter((row) => hasReason(row, "POST_SCORE_CONTEXT")).length,
    allowedDangerLeadingTeamReattackCount: allowedRows.filter((row) => hasReason(row, "LEADING_TEAM_REATTACK")).length,
    allowedDangerLowFatigueEdgeCount: allowedRows.filter((row) => hasReason(row, "LOW_FATIGUE_EDGE")).length,
    allowedDangerWithSupportAndSpacingCount: allowedRows.filter((row) => hasReason(row, "SUPPORT_EDGE") && hasReason(row, "SPACING_EDGE")).length,
    allowedDangerWithSupportButLowSpacingCount: allowedRows.filter((row) => hasReason(row, "SUPPORT_EDGE") && hasReason(row, "LOW_SPACING")).length,
    allowedDangerWithTacticalAndAttributeEdgeCount: allowedRows.filter((row) => hasReason(row, "TACTICAL_EDGE") && hasReason(row, "ATTRIBUTE_EDGE")).length,
    allowedDangerWithoutEnoughPositiveSignalsCount,
    allowedDangerDespiteProtectionContextCount: allowedRows.filter((row) => row.goalkeeperSecureContext || row.postScoreContext).length,
    deniedDangerDespiteStrongPositiveSignalsCount,
    gateTooLooseSuspicionCount,
    gateTooStrictSuspicionCount,
    selectivityWarningCodes: [...new Set(warnings)],
    recommendation: gateTooLooseSuspicionCount > allowedRows.length * 0.2
      ? "TIGHTEN_GATE_SELECTIVITY_MORE"
      : gateTooStrictSuspicionCount > rows.length * 0.2
        ? "LOOSEN_GATE_SELECTIVITY_SLIGHTLY"
        : "KEEP_GATE_SELECTIVITY_MONITORING",
  };
}
