import { forbiddenTargetReasonTerms } from "./targetSemanticReason";
import type { TargetSemanticValidationResult } from "./targetSemanticTypes";
import { BallTargetType } from "../ball";

export function validateTargetSemanticReason(input: {
  readonly targetType: BallTargetType;
  readonly reason: string;
  readonly whyTargetDiffersFromReceiverZone: string;
}): TargetSemanticValidationResult {
  const combined = `${input.reason} ${input.whyTargetDiffersFromReceiverZone}`.toLowerCase();
  const forbiddenTerms = forbiddenTargetReasonTerms(input.targetType).filter((term) =>
    combined.includes(term.toLowerCase()),
  );

  return {
    valid: forbiddenTerms.length === 0,
    forbiddenTerms,
  };
}
