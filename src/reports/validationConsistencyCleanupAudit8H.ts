import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIteration8GModel } from "./coachReplayUXIterationTypes8G";
import { guardReportStatusWarningConsistency } from "./reportStatusWarningConsistencyGuard";
import type { CoachReportStoryFirstRecompositionWarningCode } from "./coachReportStoryFirstRecompositionWarnings";
import { countMatches } from "./storyFirstAuditUtils8H";

export interface ValidationConsistencyCleanupAudit8H {
  readonly status: OfficialCausalityStatus;
  readonly reportStatus: OfficialCausalityStatus;
  readonly validationStatus: OfficialCausalityStatus;
  readonly passReportContainsFailWarningCodeCount: number;
  readonly passReportContainsFailTextCount: number;
  readonly failWarningCodeInPassReportCount: number;
  readonly partialWarningCodeInPassReportCount: number;
  readonly contradictoryPositiveWarningCount: number;
  readonly contradictoryBooleanMetricCount: number;
  readonly naturalReplayVisibilityMetricConsistent: boolean;
  readonly naturalReplayContentPreserved: boolean;
  readonly legacyNaturalReplayMetricRenamed: boolean;
  readonly statusWarningConsistencyReady: boolean;
  readonly validationConsistencyWarningCodes: readonly CoachReportStoryFirstRecompositionWarningCode[];
  readonly recommendation: string;
}

export function auditValidationConsistencyCleanup8H(input: {
  readonly baseline8G: CoachReplayUXIteration8GModel;
  readonly baseline8GReportText: string;
  readonly baseline8GValidationText: string;
}): ValidationConsistencyCleanupAudit8H {
  const reportGuard = guardReportStatusWarningConsistency({
    status: input.baseline8G.status,
    warnings: input.baseline8G.warningCodes,
  });
  const validationStatus: OfficialCausalityStatus = input.baseline8GValidationText.includes("Status: PASS")
    ? "PASS"
    : input.baseline8GValidationText.includes("Status: FAIL")
      ? "FAIL"
      : "PARTIAL";
  const validationGuard = guardReportStatusWarningConsistency({
    status: validationStatus,
    warnings: [],
    validationText: input.baseline8GValidationText.replace(/no FAIL/gu, "no blocking"),
  });
  const passReportContainsFailTextCount = input.baseline8G.status === "PASS"
    ? countMatches(input.baseline8GReportText, /\bFAIL\b|_FAIL\b/gu)
    : 0;
  const failWarningCodeInPassReportCount = reportGuard.failWarningCodeCount;
  const partialWarningCodeInPassReportCount = input.baseline8G.status === "PASS"
    ? input.baseline8G.warningCodes.filter((warning) => warning.includes("_PARTIAL")).length
    : 0;
  const naturalReplayContentPreserved = input.baseline8G.wordingUXAudit.naturalReplayTextPreserved &&
    input.baseline8G.integrationBudgetAudit.naturalReplayContentPreserved;
  const naturalReplayVisibilityMetricConsistent = input.baseline8G.integrationBudgetAudit.naturalReplayStillVisible === naturalReplayContentPreserved;
  const contradictoryPositiveWarningCount = input.baseline8G.warningCodes.includes("NATURAL_NARRATIVE_PRESERVED") && !naturalReplayContentPreserved ? 1 : 0;
  const contradictoryBooleanMetricCount = naturalReplayVisibilityMetricConsistent ? 0 : 1;
  const legacyNaturalReplayMetricRenamed = "legacyNaturalReplaySectionVisible" in input.baseline8G.integrationBudgetAudit;
  const statusWarningConsistencyReady = reportGuard.statusWarningConsistencyReady &&
    validationGuard.statusWarningConsistencyReady &&
    passReportContainsFailTextCount === 0 &&
    contradictoryPositiveWarningCount === 0 &&
    contradictoryBooleanMetricCount === 0;
  const warningCodes: CoachReportStoryFirstRecompositionWarningCode[] = [];
  if (!statusWarningConsistencyReady) warningCodes.push("VALIDATION_CONSISTENCY_CLEANUP_MISSING");
  if (reportGuard.passContainsFailWarning) warningCodes.push("FAIL_WARNING_IN_PASS_REPORT");
  if (validationGuard.passContainsFailText) warningCodes.push("FAIL_TEXT_IN_PASS_VALIDATION");
  if (contradictoryPositiveWarningCount > 0) warningCodes.push("CONTRADICTORY_WARNING_STATE");
  if (!naturalReplayVisibilityMetricConsistent) warningCodes.push("NATURAL_REPLAY_VISIBILITY_CONTRADICTION");
  if (warningCodes.length === 0) {
    warningCodes.push(
      "VALIDATION_CONSISTENCY_CLEANUP_READY",
      "STATUS_WARNING_CONSISTENCY_READY",
      "NO_FAIL_WARNING_IN_PASS_REPORT",
      "NATURAL_REPLAY_VISIBILITY_RECONCILED",
    );
  }

  return {
    status: statusWarningConsistencyReady ? "PASS" : "FAIL",
    reportStatus: input.baseline8G.status,
    validationStatus,
    passReportContainsFailWarningCodeCount: reportGuard.passContainsFailWarning ? reportGuard.failWarningCodeCount : 0,
    passReportContainsFailTextCount,
    failWarningCodeInPassReportCount,
    partialWarningCodeInPassReportCount,
    contradictoryPositiveWarningCount,
    contradictoryBooleanMetricCount,
    naturalReplayVisibilityMetricConsistent,
    naturalReplayContentPreserved,
    legacyNaturalReplayMetricRenamed,
    statusWarningConsistencyReady,
    validationConsistencyWarningCodes: warningCodes,
    recommendation: statusWarningConsistencyReady ? "KEEP_VALIDATION_CONSISTENCY_CLEANUP" : "FIX_STATUS_WARNING_CONSISTENCY",
  };
}
