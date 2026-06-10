import type { DecisionNarrative } from "./decisionNarrativeTypes";

export interface DecisionNarrativeValidation {
  readonly valid: boolean;
  readonly warnings: readonly string[];
}

export function validateDecisionNarrative(narrative: DecisionNarrative): DecisionNarrativeValidation {
  const warnings = [
    ...(narrative.rawTopCandidate === "none" ? ["raw top candidate missing"] : []),
    ...(narrative.finalExecutedAction === "none" ? ["final executed action missing"] : []),
    ...(narrative.selectedActionType.length === 0 ? ["selectedActionType missing"] : []),
    ...(narrative.targetType.length === 0 ? ["targetType missing"] : []),
    ...(narrative.actualReceptionZone.length === 0 ? ["actualReceptionZone missing"] : []),
    ...(narrative.consistencyStatus === "PASS" ? [] : ["contract alignment failed"]),
  ];

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
