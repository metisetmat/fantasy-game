import type { CoachReportExportLengthTrendCountCleanupWarningCode } from "./coachReportExportLengthTrendCountCleanupWarnings";

export interface CoachReportValidationStatusConsistencyAudit {
  readonly validationOverallStatus: "PASS" | "PARTIAL" | "FAIL" | "UNKNOWN";
  readonly validationFailLineCount: number;
  readonly validationPartialLineCount: number;
  readonly unexplainedFailInPassReportCount: number;
  readonly explainedFailInPassReportCount: number;
  readonly passReportContainsFail: boolean;
  readonly statusShouldBePartial: boolean;
  readonly statusShouldBeFail: boolean;
  readonly validationStatusConsistent: boolean;
  readonly validationStatusWarningCodes: readonly CoachReportExportLengthTrendCountCleanupWarningCode[];
  readonly recommendation: "KEEP_VALIDATION_STATUS" | "FIX_VALIDATION_STATUS";
}

function statusFromText(validationText: string): "PASS" | "PARTIAL" | "FAIL" | "UNKNOWN" {
  if (/^Status:\s*PASS\b/mu.test(validationText)) return "PASS";
  if (/^Status:\s*PARTIAL\b/mu.test(validationText)) return "PARTIAL";
  if (/^Status:\s*FAIL\b/mu.test(validationText)) return "FAIL";
  return "UNKNOWN";
}

export function auditCoachReportValidationStatusConsistency(validationText: string): CoachReportValidationStatusConsistencyAudit {
  const validationOverallStatus = statusFromText(validationText);
  const validationFailLineCount = (validationText.match(/^- FAIL:/gmu) ?? []).length;
  const validationPartialLineCount = (validationText.match(/^- PARTIAL:|WARNING:/gmu) ?? []).length;
  const passReportContainsFail = validationOverallStatus === "PASS" && validationFailLineCount > 0;
  const explainedFailInPassReportCount = (validationText.match(/FAIL[\s\S]{0,80}explained/giu) ?? []).length;
  const unexplainedFailInPassReportCount = passReportContainsFail
    ? Math.max(0, validationFailLineCount - explainedFailInPassReportCount)
    : 0;
  const statusShouldBeFail = validationFailLineCount > 0 && unexplainedFailInPassReportCount > 0;
  const statusShouldBePartial = validationFailLineCount > 0 && unexplainedFailInPassReportCount === 0;
  const validationStatusConsistent = !passReportContainsFail &&
    (validationFailLineCount === 0 || validationOverallStatus === "PARTIAL" || validationOverallStatus === "FAIL");

  return {
    validationOverallStatus,
    validationFailLineCount,
    validationPartialLineCount,
    unexplainedFailInPassReportCount,
    explainedFailInPassReportCount,
    passReportContainsFail,
    statusShouldBePartial,
    statusShouldBeFail,
    validationStatusConsistent,
    validationStatusWarningCodes: [
      ...(validationStatusConsistent ? ["VALIDATION_STATUS_CONSISTENT" as const] : ["VALIDATION_PASS_CONTAINS_FAIL" as const]),
      ...(unexplainedFailInPassReportCount === 0 ? ["NO_FAIL_INSIDE_PASS_REPORT" as const] : ["UNEXPLAINED_FAIL_IN_PASS_REPORT" as const]),
    ],
    recommendation: validationStatusConsistent ? "KEEP_VALIDATION_STATUS" : "FIX_VALIDATION_STATUS",
  };
}
