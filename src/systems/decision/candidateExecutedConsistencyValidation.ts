import type { CandidateExecutedConsistency } from "./candidateExecutedConsistencyTypes";

export interface CandidateExecutedConsistencyValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateCandidateExecutedConsistency(
  consistency: CandidateExecutedConsistency,
): CandidateExecutedConsistencyValidation {
  const errors = [
    ...(consistency.finalExecutedAction.length === 0 ? ["finalExecutedAction missing"] : []),
    ...(consistency.selectedActionType.length === 0 ? ["selectedActionType missing"] : []),
    ...(consistency.normalizedSelectedCandidateActionType.length === 0
      ? ["normalizedSelectedCandidateActionType missing"]
      : []),
    ...(consistency.consistencyStatus === "FAIL" ? [consistency.explanation] : []),
  ];

  return {
    valid: errors.length === 0,
    errors,
  };
}
