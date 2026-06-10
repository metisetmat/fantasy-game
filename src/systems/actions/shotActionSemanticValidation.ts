import type { ShotActionSemanticContract } from "./shotActionSemanticTypes";

export interface ShotActionSemanticValidation {
  readonly valid: boolean;
  readonly warnings: readonly string[];
}

export function validateShotActionSemanticContract(contract: ShotActionSemanticContract): ShotActionSemanticValidation {
  const warnings: string[] = [];

  if (contract.shotLegality === "UNKNOWN") {
    warnings.push("shot legality is unknown");
  }

  if (contract.shotType === "DROP_ATTEMPT" && contract.shotLegality === "LEGAL") {
    warnings.push("drop attempt cannot be legal without explicit modelling");
  }

  if (contract.ballOutcome === "UNKNOWN") {
    warnings.push("ball outcome is unknown");
  }

  return {
    valid: contract.semanticStatus === "PASS" && warnings.length === 0,
    warnings,
  };
}
