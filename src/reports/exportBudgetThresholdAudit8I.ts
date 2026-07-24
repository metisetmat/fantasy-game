import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type {
  ExportBudgetThresholdAudit8I,
  NumericThresholdValidationRule,
  NumericThresholdOperator,
} from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import type { StoryFirstExportBudgetValidationThresholdFixWarningCode } from "./storyFirstExportBudgetValidationThresholdFixWarnings";
import { readTimeSeconds } from "./storyFirstAuditUtils8H";

function evaluate(actualValue: number, operator: NumericThresholdOperator, thresholdValue: number): boolean {
  switch (operator) {
    case "less_than": return actualValue < thresholdValue;
    case "less_than_or_equal": return actualValue <= thresholdValue;
    case "greater_than": return actualValue > thresholdValue;
    case "greater_than_or_equal": return actualValue >= thresholdValue;
    case "equal": return actualValue === thresholdValue;
    case "not_equal": return actualValue !== thresholdValue;
  }
}

function rule(input: {
  readonly ruleId: string;
  readonly metricName: string;
  readonly actualValue: number;
  readonly operator: NumericThresholdOperator;
  readonly thresholdValue: number;
  readonly severity: "blocking" | "partial" | "warning";
}): NumericThresholdValidationRule {
  const actualPass = evaluate(input.actualValue, input.operator, input.thresholdValue);
  return {
    ...input,
    expectedPass: true,
    actualPass,
    violation: !actualPass,
    failureMessage: `${input.metricName}=${input.actualValue} violates ${input.operator} ${input.thresholdValue}`,
    passMessage: `${input.metricName}=${input.actualValue} satisfies ${input.operator} ${input.thresholdValue}`,
  };
}

export function auditExportBudgetThreshold8I(input: {
  readonly exportHtmlBefore8I: string;
  readonly exportHtmlAfter8I: string;
}): ExportBudgetThresholdAudit8I {
  const exportReadTimeSecondsBefore8I = readTimeSeconds(input.exportHtmlBefore8I);
  const exportReadTimeSecondsAfter8I = readTimeSeconds(input.exportHtmlAfter8I);
  const numericRules = [
    rule({
      ruleId: "export-under-900-hard-limit",
      metricName: "exportReadTimeSecondsAfter8I",
      actualValue: exportReadTimeSecondsAfter8I,
      operator: "less_than_or_equal",
      thresholdValue: 900,
      severity: "blocking",
    }),
    rule({
      ruleId: "export-under-800-ideal-limit",
      metricName: "exportReadTimeSecondsAfter8I",
      actualValue: exportReadTimeSecondsAfter8I,
      operator: "less_than_or_equal",
      thresholdValue: 800,
      severity: "partial",
    }),
  ] as const;
  const hardRule = numericRules[0];
  const idealRule = numericRules[1];
  const exportUnder900Seconds = hardRule.actualPass;
  const exportUnder800Seconds = idealRule.actualPass;
  const hardLimitViolated = !exportUnder900Seconds;
  const idealLimitViolated = !exportUnder800Seconds;
  const warnings: StoryFirstExportBudgetValidationThresholdFixWarningCode[] = [];
  if (hardLimitViolated) warnings.push("EXPORT_OVER_900", "EXPORT_BUDGET_NOT_FIXED");
  if (idealLimitViolated) warnings.push("EXPORT_OVER_800");
  if (!hardLimitViolated) warnings.push("EXPORT_BUDGET_FIXED", "EXPORT_UNDER_900_READY");
  if (!idealLimitViolated) warnings.push("EXPORT_UNDER_800_READY");
  const status: OfficialCausalityStatus = hardLimitViolated ? "FAIL" : idealLimitViolated ? "PARTIAL" : "PASS";

  return {
    status,
    exportReadTimeSecondsBefore8I,
    exportReadTimeSecondsAfter8I,
    exportReadTimeDelta: exportReadTimeSecondsAfter8I - exportReadTimeSecondsBefore8I,
    hardLimitSeconds: 900,
    idealLimitSeconds: 800,
    exportUnder900Seconds,
    exportUnder800Seconds,
    hardLimitViolated,
    idealLimitViolated,
    mandatoryThresholdPass: exportUnder900Seconds,
    idealThresholdPass: exportUnder800Seconds,
    numericRules,
    exportBudgetWarningCodes: warnings,
    recommendation: status === "PASS"
      ? "KEEP_8I_EXPORT_BUDGET"
      : status === "PARTIAL"
        ? "MONITOR_IDEAL_EXPORT_BUDGET"
        : "REPAIR_8I_EXPORT_BUDGET",
  };
}
