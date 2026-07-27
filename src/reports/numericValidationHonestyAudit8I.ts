import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type {
  NumericThresholdValidationRule,
  NumericValidationHonestyAudit8I,
} from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import type { StoryFirstExportBudgetValidationThresholdFixWarningCode } from "./storyFirstExportBudgetValidationThresholdFixWarnings";

export function auditNumericValidationHonesty8I(input: {
  readonly numericRules: readonly NumericThresholdValidationRule[];
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly validationStatus: OfficialCausalityStatus;
}): NumericValidationHonestyAudit8I {
  const hardRule = input.numericRules.find((rule) => rule.ruleId === "export-under-900-hard-limit");
  const idealRule = input.numericRules.find((rule) => rule.ruleId === "export-under-800-ideal-limit");
  const numericRuleViolationCount = input.numericRules.filter((rule) => rule.violation).length;
  const numericRulePassCount = input.numericRules.filter((rule) => rule.actualPass).length;
  const passMessageOnFailedRuleCount = input.numericRules.filter((rule) => rule.violation && /^PASS:/iu.test(rule.failureMessage)).length;
  const failedRuleMarkedPassCount = input.numericRules.filter((rule) => rule.violation && rule.actualPass).length;
  const exportUnder900BooleanCorrect = hardRule === undefined ? false : input.exportUnder900Seconds === hardRule.actualPass;
  const exportUnder800BooleanCorrect = idealRule === undefined ? false : input.exportUnder800Seconds === idealRule.actualPass;
  const thresholdBooleanMismatchCount = [exportUnder900BooleanCorrect, exportUnder800BooleanCorrect].filter((value) => !value).length;
  const blockingViolation = input.numericRules.some((rule) => rule.violation && rule.severity === "blocking");
  const partialViolation = input.numericRules.some((rule) => rule.violation && rule.severity === "partial");
  const validationStatusMatchesThresholds = blockingViolation
    ? input.validationStatus === "FAIL"
    : partialViolation
      ? input.validationStatus === "PARTIAL"
      : input.validationStatus === "PASS";
  const warnings: StoryFirstExportBudgetValidationThresholdFixWarningCode[] = [];
  if (passMessageOnFailedRuleCount > 0) warnings.push("PASS_MESSAGE_ON_FAILED_NUMERIC_RULE");
  if (failedRuleMarkedPassCount > 0) warnings.push("FAILED_NUMERIC_RULE_MARKED_PASS");
  if (!exportUnder900BooleanCorrect) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (!exportUnder800BooleanCorrect) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!validationStatusMatchesThresholds) warnings.push("VALIDATION_STATUS_THRESHOLD_MISMATCH");
  if (warnings.length === 0) warnings.push("NUMERIC_THRESHOLD_GUARD_READY", "VALIDATION_HONESTY_READY");
  const pass = warnings.every((warning) =>
    warning === "NUMERIC_THRESHOLD_GUARD_READY" || warning === "VALIDATION_HONESTY_READY"
  );

  return {
    status: pass ? "PASS" : "FAIL",
    numericRuleCount: input.numericRules.length,
    numericRulePassCount,
    numericRuleViolationCount,
    passMessageOnFailedRuleCount,
    failedRuleMarkedPassCount,
    thresholdBooleanMismatchCount,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    validationStatusMatchesThresholds,
    validationHonestyWarningCodes: warnings,
    recommendation: pass ? "KEEP_NUMERIC_THRESHOLD_VALIDATION" : "REPAIR_NUMERIC_THRESHOLD_VALIDATION",
  };
}
