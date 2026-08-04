import type {
  ManualReviewStatusWarningConsistencyEvaluation8Z,
  ManualReviewStatusWarningConsistencyRule8Z,
  ManualReviewValidationContractAuditConsistencyRepairStrongStatus8Z,
} from "./manualReviewValidationContractAuditConsistencyRepairTypes8Z";
import type { ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z } from "./manualReviewValidationContractAuditConsistencyRepairWarnings8Z";

interface ManualReviewStatusWarningConsistencyInput8Z {
  readonly wordingScore: number;
  readonly passThreshold: number;
  readonly passStrongThreshold: number;
  readonly integrationFalseNegativeCount: number;
  readonly criticalGuardrailViolationCount: number;
  readonly exportReadTimeSeconds: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly existingWarnings: readonly ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z[];
}

export function buildManualReviewStatusWarningConsistencyRules8Z(): readonly ManualReviewStatusWarningConsistencyRule8Z[] {
  const rows: readonly (readonly [
    string,
    string,
    string,
    string,
    ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z,
    "PASS" | "PARTIAL" | "FAIL",
    boolean,
    boolean,
  ])[] = [
    ["wording_below_90_prevents_pass", "Wording below 90 prevents PASS", "wordingReadabilityScore", "wordingReadabilityScore < 90", "WORDING_SCORE_BELOW_PASS_THRESHOLD", "PARTIAL", true, true],
    ["wording_below_95_prevents_pass_strong", "Wording below 95 prevents PASS_STRONG", "wordingReadabilityScore", "wordingReadabilityScore < 95", "WORDING_SCORE_BELOW_PASS_STRONG_THRESHOLD", "PASS", false, true],
    ["integration_section_false_prevents_pass_strong", "Missing integration section prevents PASS_STRONG", "integration selectors", "product/export action plan or tactical maps false", "INTEGRATION_FALSE_NEGATIVE_STILL_PRESENT", "PARTIAL", true, true],
    ["warning_none_requires_no_failed_audits", "Warnings none requires no failed audits", "warningCodes", "any failed audit with no warning", "WARNINGS_NONE_WITH_FAILED_AUDIT_DETECTED", "PARTIAL", true, true],
    ["threshold_boolean_must_match_numeric_value", "Threshold booleans must match numbers", "numeric thresholds", "export boolean mismatch", "EXPORT_UNDER_900_BOOLEAN_MISMATCH", "FAIL", true, true],
    ["share_pack_pass_requires_current_sprint_docs", "Share pack PASS requires current sprint docs", "share pack", "8Z docs missing or stale standalone docs copied", "REQUIRED_WARNING_MISSING", "PARTIAL", true, true],
    ["validation_pass_requires_no_critical_guardrail_violation", "PASS requires no critical guardrail violation", "guardrails", "runtime, payload, preview, persistence, truth, selection, or scoring mutation detected", "PASS_WITH_FAILED_CRITICAL_AUDIT_DETECTED", "FAIL", true, true],
  ];
  return rows.map(([ruleId, label, appliesToMetric, failCondition, requiredWarningCode, requiredMaxStatus, preventsPass, preventsPassStrong]) => ({
    ruleId,
    label,
    appliesToMetric,
    failCondition,
    requiredWarningCode,
    requiredMaxStatus,
    preventsPass,
    preventsPassStrong,
    activeIn8Z: true,
    visibleInProduct: true,
    visibleInExport: true,
  }));
}

function uniqueWarnings(
  warnings: readonly ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z[],
): readonly ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z[] {
  return [...new Set(warnings)];
}

export function evaluateManualReviewStatusWarningConsistency8Z(
  input: ManualReviewStatusWarningConsistencyInput8Z,
): ManualReviewStatusWarningConsistencyEvaluation8Z {
  const requiredWarnings: ManualReviewValidationContractAuditConsistencyRepairWarningCode8Z[] = [];
  if (input.wordingScore < input.passThreshold) requiredWarnings.push("WORDING_SCORE_BELOW_PASS_THRESHOLD");
  if (input.wordingScore < input.passStrongThreshold) requiredWarnings.push("WORDING_SCORE_BELOW_PASS_STRONG_THRESHOLD");
  if (input.integrationFalseNegativeCount > 0) requiredWarnings.push("INTEGRATION_FALSE_NEGATIVE_STILL_PRESENT");
  if (input.criticalGuardrailViolationCount > 0) requiredWarnings.push("PASS_WITH_FAILED_CRITICAL_AUDIT_DETECTED");
  if (input.exportReadTimeSeconds > 900) requiredWarnings.push("EXPORT_OVER_900");
  if (input.exportUnder900Seconds !== (input.exportReadTimeSeconds <= 900)) requiredWarnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (input.exportUnder800Seconds !== (input.exportReadTimeSeconds <= 800)) requiredWarnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");

  const warningCodes = uniqueWarnings([...input.existingWarnings, ...requiredWarnings]);
  const missingWarningCount = requiredWarnings.filter((warning) => !warningCodes.includes(warning)).length;
  const anyFailedAudit = requiredWarnings.length > 0;
  const warningNoneWithFailedAuditCount = anyFailedAudit && warningCodes.length === 0 ? 1 : 0;
  const passWithFailedThresholdCount = input.wordingScore < input.passThreshold ? 1 : 0;
  const passStrongWithFailedStrongThresholdCount = input.wordingScore < input.passStrongThreshold ? 1 : 0;
  const passWithFailedCriticalAuditCount = input.criticalGuardrailViolationCount > 0 ? 1 : 0;
  const contradictoryPassWarningCount =
    warningNoneWithFailedAuditCount + passWithFailedThresholdCount + passWithFailedCriticalAuditCount;
  const statusWarningContradictionCount =
    missingWarningCount + warningNoneWithFailedAuditCount + passWithFailedCriticalAuditCount;

  let statusRecommendation: ManualReviewValidationContractAuditConsistencyRepairStrongStatus8Z = "PASS_STRONG";
  if (input.criticalGuardrailViolationCount > 0 || input.exportReadTimeSeconds > 900) {
    statusRecommendation = "FAIL";
  } else if (input.wordingScore < input.passThreshold || input.integrationFalseNegativeCount > 0) {
    statusRecommendation = "PARTIAL";
  } else if (input.wordingScore < input.passStrongThreshold || input.exportReadTimeSeconds > 800 || warningCodes.length > 0) {
    statusRecommendation = "PASS";
  }

  return {
    statusRecommendation,
    requiredWarnings: uniqueWarnings(requiredWarnings),
    missingWarningCount,
    contradictoryPassWarningCount,
    passWithFailedThresholdCount: input.wordingScore < input.passThreshold && statusRecommendation === "PASS" ? passWithFailedThresholdCount : 0,
    passStrongWithFailedStrongThresholdCount:
      input.wordingScore < input.passStrongThreshold && statusRecommendation === "PASS_STRONG" ? passStrongWithFailedStrongThresholdCount : 0,
    passWithFailedCriticalAuditCount: statusRecommendation === "PASS" || statusRecommendation === "PASS_STRONG" ? passWithFailedCriticalAuditCount : 0,
    statusWarningContradictionCount,
    warningNoneWithFailedAuditCount,
    warningCodes,
  };
}
