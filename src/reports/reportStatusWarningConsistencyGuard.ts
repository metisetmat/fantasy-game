import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";

export interface ReportStatusWarningConsistencyResult {
  readonly status: OfficialCausalityStatus;
  readonly warningCount: number;
  readonly failWarningCodeCount: number;
  readonly failTextCount: number;
  readonly passContainsFailWarning: boolean;
  readonly passContainsFailText: boolean;
  readonly statusWarningConsistencyReady: boolean;
  readonly sanitizedWarnings: readonly string[];
}

const failWarningPattern = /(?:_FAIL\b|\bFAIL\b|REGRESSION_FAIL|SOURCE_OF_TRUTH_FAIL|SCORE_MANIPULATION_DETECTED|SCORE_CLAIM_WITHOUT_SCORE_CHANGE|SANDBOX_REPLAY_PROMOTED|DIAGNOSTIC_REPLAY_PROMOTED|BATCH_REPLAY_PROMOTED)/u;

export function guardReportStatusWarningConsistency(input: {
  readonly status: OfficialCausalityStatus;
  readonly warnings: readonly string[];
  readonly validationText?: string;
}): ReportStatusWarningConsistencyResult {
  const failWarningCodeCount = input.warnings.filter((warning) => failWarningPattern.test(warning)).length;
  const failTextCount = input.validationText === undefined ? 0 : [...input.validationText.matchAll(/\bFAIL\b/gu)].length;
  const passContainsFailWarning = input.status === "PASS" && failWarningCodeCount > 0;
  const passContainsFailText = input.status === "PASS" && failTextCount > 0;
  const statusWarningConsistencyReady = !passContainsFailWarning && !passContainsFailText;
  const status: OfficialCausalityStatus = statusWarningConsistencyReady ? input.status : "FAIL";

  return {
    status,
    warningCount: input.warnings.length,
    failWarningCodeCount,
    failTextCount,
    passContainsFailWarning,
    passContainsFailText,
    statusWarningConsistencyReady,
    sanitizedWarnings: status === "PASS"
      ? input.warnings.filter((warning) => !failWarningPattern.test(warning))
      : input.warnings,
  };
}
