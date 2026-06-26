import type { CoachReportMultiMatchComparisonTrendSignalsWarningCode } from "./coachReportMultiMatchComparisonTrendSignalsWarnings";

export interface CoachReport7GBaselineMetadataRepairAudit {
  readonly baseline6XStatus: string;
  readonly baseline7AReportedStatus: "PASS" | "CHECK_EXPLAINED" | "UNKNOWN_EXPLAINED";
  readonly baseline7AValidationStatus: "PASS" | "CHECK_EXPLAINED" | "UNKNOWN_EXPLAINED";
  readonly baseline7BStatus: string;
  readonly baseline7CStatus: string;
  readonly baseline7DStatus: string;
  readonly baseline7EStatus: string;
  readonly baseline7FStatus: string;
  readonly baseline7AFailCount: number;
  readonly baseline7ACheckCount: number;
  readonly baselineStatusMismatchCount: number;
  readonly unexplainedFailInPassReportCount: number;
  readonly baselineMetadataConsistent: boolean;
  readonly baselineMetadataRepairWarningCodes: readonly CoachReportMultiMatchComparisonTrendSignalsWarningCode[];
  readonly recommendation: "KEEP_BASELINE_METADATA_REPAIR" | "EXPLAIN_BASELINE_7A_CHECK" | "FIX_BASELINE_METADATA";
}

function statusFromValidation(validation: string): "PASS" | "CHECK_EXPLAINED" | "UNKNOWN_EXPLAINED" {
  if (validation.includes("Status: PASS")) return "PASS";
  if (validation.length === 0) return "UNKNOWN_EXPLAINED";
  return "CHECK_EXPLAINED";
}

function countUnexplainedFailInPass(text: string): number {
  if (!/Status:\s*PASS/iu.test(text)) return 0;

  return (text.match(/\bFAIL\b(?![^.\n]*(?:explained|explain|unavailable|not regressed|baseline not regressed))/giu) ?? []).length;
}

export function auditCoachReport7GBaselineMetadataRepair(input: {
  readonly baseline6XStatus: string;
  readonly baseline7AValidationText: string;
  readonly baseline7BValidationText: string;
  readonly baseline7CValidationText: string;
  readonly baseline7DValidationText: string;
  readonly baseline7EStatus: string;
  readonly baseline7FStatus: string;
  readonly passReportText: string;
}): CoachReport7GBaselineMetadataRepairAudit {
  const baseline7AValidationStatus = statusFromValidation(input.baseline7AValidationText);
  const baseline7AReportedStatus = baseline7AValidationStatus;
  const baseline7AFailCount = (input.baseline7AValidationText.match(/\bFAIL\b/giu) ?? []).length;
  const baseline7ACheckCount = baseline7AValidationStatus === "PASS" ? 0 : 1;
  const unexplainedFailInPassReportCount = countUnexplainedFailInPass(input.passReportText);
  const baselineStatusMismatchCount = baseline7AFailCount > 0 && baseline7AReportedStatus === "PASS" ? 1 : 0;
  const baselineMetadataConsistent = baselineStatusMismatchCount === 0 && unexplainedFailInPassReportCount === 0;

  return {
    baseline6XStatus: input.baseline6XStatus,
    baseline7AReportedStatus,
    baseline7AValidationStatus,
    baseline7BStatus: input.baseline7BValidationText.includes("Status: PASS") ? "PASS" : "CHECK_EXPLAINED",
    baseline7CStatus: input.baseline7CValidationText.includes("Status: PASS") ? "PASS" : "CHECK_EXPLAINED",
    baseline7DStatus: input.baseline7DValidationText.includes("Status: PASS") ? "PASS" : "CHECK_EXPLAINED",
    baseline7EStatus: input.baseline7EStatus,
    baseline7FStatus: input.baseline7FStatus,
    baseline7AFailCount,
    baseline7ACheckCount,
    baselineStatusMismatchCount,
    unexplainedFailInPassReportCount,
    baselineMetadataConsistent,
    baselineMetadataRepairWarningCodes: [
      ...(baselineMetadataConsistent ? ["BASELINE_METADATA_REPAIRED" as const, "NO_UNEXPLAINED_FAIL_IN_PASS_REPORT" as const] : ["BASELINE_METADATA_INCONSISTENT" as const]),
      ...(baseline7AValidationStatus === "PASS" ? ["BASELINE_7A_REPAIRED" as const] : ["BASELINE_7A_STILL_CHECK" as const]),
      ...(unexplainedFailInPassReportCount === 0 ? [] : ["UNEXPLAINED_FAIL_IN_PASS_REPORT" as const]),
    ],
    recommendation: baselineMetadataConsistent
      ? "KEEP_BASELINE_METADATA_REPAIR"
      : baseline7AValidationStatus !== "PASS"
        ? "EXPLAIN_BASELINE_7A_CHECK"
        : "FIX_BASELINE_METADATA",
  };
}
