import type { OfficialMatchSequenceCausality } from "./officialPlayerRoleSequenceCausalityTypes";

export interface RoleFunctionSequenceAudit {
  readonly roleFunctionChainCount: number;
  readonly roleFunctionCoverageCount: number;
  readonly chainPatternCount: number;
  readonly scoreSequenceRoleChainCount: number;
  readonly dangerSequenceRoleChainCount: number;
  readonly recoverySequenceRoleChainCount: number;
  readonly stabilizationRoleChainCount: number;
  readonly roleFunctionWithoutEventCount: number;
  readonly roleFunctionWithoutPlayerCount: number;
  readonly genericRoleFunctionCount: number;
  readonly roleFunctionNarrativeCount: number;
  readonly roleFunctionWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditRoleFunctionSequence(sequences: readonly OfficialMatchSequenceCausality[]): RoleFunctionSequenceAudit {
  const chains = sequences.map((sequence) => sequence.roleChain);
  const roleFunctionWithoutEventCount = chains.filter((chain) => chain.linkedOfficialEventIds.length === 0).length;
  const roleFunctionWithoutPlayerCount = chains.filter((chain) => chain.playersInOrder.length === 0).length;
  const genericRoleFunctionCount = chains.flatMap((chain) => chain.functionsInOrder).filter((fn) => fn === "unknown_official_actor").length;
  const roleFunctionNarrativeCount = chains.filter((chain) => chain.coachReadableText.length > 0).length;
  const pass = chains.length >= 3 &&
    roleFunctionWithoutEventCount === 0 &&
    genericRoleFunctionCount === 0 &&
    roleFunctionNarrativeCount >= 3;

  return {
    roleFunctionChainCount: chains.length,
    roleFunctionCoverageCount: chains.filter((chain) => chain.functionsInOrder.length > 0).length,
    chainPatternCount: new Set(chains.map((chain) => chain.chainPattern)).size,
    scoreSequenceRoleChainCount: sequences.filter((sequence) => sequence.sequenceType === "scoring_sequence" && sequence.roleChain.rolesInOrder.length > 0).length,
    dangerSequenceRoleChainCount: sequences.filter((sequence) => sequence.sequenceType === "danger_sequence" && sequence.roleChain.rolesInOrder.length > 0).length,
    recoverySequenceRoleChainCount: sequences.filter((sequence) => sequence.sequenceType === "recovery_sequence" && sequence.roleChain.rolesInOrder.length > 0).length,
    stabilizationRoleChainCount: sequences.filter((sequence) => sequence.sequenceType === "stabilization_sequence" && sequence.roleChain.rolesInOrder.length > 0).length,
    roleFunctionWithoutEventCount,
    roleFunctionWithoutPlayerCount,
    genericRoleFunctionCount,
    roleFunctionNarrativeCount,
    roleFunctionWarningCodes: pass ? ["ROLE_FUNCTION_CHAIN_READY"] : ["ROLE_CHAIN_MISSING"],
    recommendation: pass ? "KEEP_ROLE_FUNCTION_CHAIN" : "ROLE_FUNCTION_DEPTH_FOLLOW_UP",
  };
}
