import type { OfficialMatchAttributeRoleFatigueCausalityModel } from "./officialMatchAttributeRoleFatigueCausalityTypes";

export interface OfficialRoleCausalityAudit {
  readonly roleCausalityCount: number;
  readonly roleFunctionCoverageCount: number;
  readonly playerRoleLinkedEventCount: number;
  readonly roleFitCausalityCount: number;
  readonly unsupportedRoleClaimCount: number;
  readonly roleClaimWithoutPlayerCount: number;
  readonly roleClaimWithoutEventCount: number;
  readonly roleImpactInNarrativeCount: number;
  readonly roleCausalityWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditOfficialRoleCausality(model: OfficialMatchAttributeRoleFatigueCausalityModel): OfficialRoleCausalityAudit {
  const roleClaimWithoutPlayerCount = model.roleCausalities.filter((role) => role.playerId.length === 0).length;
  const roleClaimWithoutEventCount = model.roleCausalities.filter((role) => role.linkedOfficialEventIds.length === 0).length;
  const functionCoverage = new Set(model.roleCausalities.map((role) => role.roleFunction)).size;

  return {
    roleCausalityCount: model.roleCausalities.length,
    roleFunctionCoverageCount: functionCoverage,
    playerRoleLinkedEventCount: model.roleCausalities.filter((role) => role.playerId.length > 0 && role.linkedOfficialEventIds.length > 0).length,
    roleFitCausalityCount: model.roleCausalities.filter((role) => role.roleFitSummary.length > 0).length,
    unsupportedRoleClaimCount: 0,
    roleClaimWithoutPlayerCount,
    roleClaimWithoutEventCount,
    roleImpactInNarrativeCount: model.roleCausalities.filter((role) => model.narrative.roleImpactSummary.includes(role.role)).length,
    roleCausalityWarningCodes: [
      ...(model.roleCausalities.length >= 3 ? [] : ["ROLE_CAUSALITY_NOT_PROVEN"]),
      ...(roleClaimWithoutPlayerCount === 0 ? [] : ["ROLE_CLAIM_WITHOUT_PLAYER"]),
      ...(roleClaimWithoutEventCount === 0 ? [] : ["ROLE_CLAIM_WITHOUT_EVENT"]),
    ],
    recommendation: model.roleCausalityReady ? "KEEP_ROLE_CAUSALITY" : "ROLE_CAUSALITY_FOLLOW_UP",
  };
}
