import type {
  EarnedDangerGateAuditRow,
  FullMatchEarnedDangerGateAudit,
} from "./fullMatchEarnedDangerGateAudit";
import type { EarnedDangerGateReasonCode } from "./earnedDangerGate";

export interface FullMatchEarnedDangerGateTuningAudit {
  readonly gateAllowedEarnedDangerCount: number;
  readonly gateAllowedBorderlineDangerCount: number;
  readonly gateBlockedAutomaticDangerCount: number;
  readonly dangerDowngradedToNeutralCount: number;
  readonly dangerDowngradedToSafePossessionCount: number;
  readonly rebuildPhaseInsertionCount: number;
  readonly gateTooStrictSuspicionCount: number;
  readonly gateTooLooseSuspicionCount: number;
  readonly earnedDangerLostByTooStrictGateCount: number;
  readonly borderlineDangerLostByTooStrictGateCount: number;
  readonly automaticDangerAllowedByTooLooseGateCount: number;
  readonly allowedReasonDistribution: readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[];
  readonly deniedReasonDistribution: readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[];
}

function countReasonCodes(rows: readonly EarnedDangerGateAuditRow[]): readonly { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number }[] {
  const counts = new Map<EarnedDangerGateReasonCode, number>();
  for (const row of rows) {
    for (const reasonCode of row.gateReasonCodes) {
      counts.set(reasonCode, (counts.get(reasonCode) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([reasonCode, count]) => ({ reasonCode, count }));
}

function positiveEdgeCount(row: EarnedDangerGateAuditRow): number {
  return [
    row.attackingSupportScore >= 58,
    row.attackingSpacingScore >= 56,
    row.tacticalEdgeScore >= 58,
    row.attributeEdgeScore >= 58,
    row.fatigueEdgeScore >= 50,
    row.pressureEdgeScore >= 54,
    row.mistakeEdgeScore >= 34,
  ].filter(Boolean).length;
}

function tooStrict(row: EarnedDangerGateAuditRow): boolean {
  return !row.dangerGenerated &&
    row.earnedDangerScore >= 43 &&
    row.scoringOpportunityCreated &&
    positiveEdgeCount(row) >= 3;
}

function tooLoose(row: EarnedDangerGateAuditRow): boolean {
  return row.dangerGenerated &&
    (
      row.earnedDangerClassification === "AUTOMATIC_SUSPECTED" ||
      row.attackingSupportScore < 50 ||
      row.tacticalEdgeScore < 54 ||
      row.attributeEdgeScore < 54
    );
}

export function summarizeFullMatchEarnedDangerGateTuningAudit(
  audits: readonly FullMatchEarnedDangerGateAudit[],
): FullMatchEarnedDangerGateTuningAudit {
  const rows = audits.flatMap((audit) => audit.rows);
  const allowedRows = rows.filter((row) => row.dangerGenerated);
  const deniedRows = rows.filter((row) => !row.dangerGenerated);
  const tooStrictRows = rows.filter(tooStrict);
  const tooLooseRows = rows.filter(tooLoose);
  return {
    gateAllowedEarnedDangerCount: rows.filter((row) => row.earnedDangerClassification === "EARNED").length,
    gateAllowedBorderlineDangerCount: rows.filter((row) => row.earnedDangerClassification === "BORDERLINE").length,
    gateBlockedAutomaticDangerCount: rows.filter((row) => row.earnedDangerClassification === "BLOCKED_BY_GATE").length,
    dangerDowngradedToNeutralCount: rows.filter((row) => row.earnedDangerClassification === "DOWNGRADED_TO_NEUTRAL").length,
    dangerDowngradedToSafePossessionCount: rows.filter((row) => row.earnedDangerClassification === "DOWNGRADED_TO_SAFE_POSSESSION").length,
    rebuildPhaseInsertionCount: rows.filter((row) => row.gateDecision === "FORCE_REBUILD_PHASE").length,
    gateTooStrictSuspicionCount: tooStrictRows.length,
    gateTooLooseSuspicionCount: tooLooseRows.length,
    earnedDangerLostByTooStrictGateCount: tooStrictRows.filter((row) => row.earnedDangerScore >= 55).length,
    borderlineDangerLostByTooStrictGateCount: tooStrictRows.filter((row) => row.earnedDangerScore < 55).length,
    automaticDangerAllowedByTooLooseGateCount: tooLooseRows.length,
    allowedReasonDistribution: countReasonCodes(allowedRows),
    deniedReasonDistribution: countReasonCodes(deniedRows),
  };
}
