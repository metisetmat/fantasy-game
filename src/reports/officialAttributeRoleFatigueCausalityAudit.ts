import type { OfficialMatchAttributeRoleFatigueCausalityModel } from "./officialMatchAttributeRoleFatigueCausalityTypes";

export interface OfficialAttributeRoleFatigueCausalityAudit {
  readonly officialCausalityLayerExists: boolean;
  readonly officialCausalityLinkCount: number;
  readonly attributeCausalityCount: number;
  readonly roleCausalityCount: number;
  readonly fatigueCausalityCount: number;
  readonly mentalFreshnessCausalityCount: number;
  readonly tacticalPlanCausalityCount: number;
  readonly pressureCausalityCount: number;
  readonly zoneAccessCausalityCount: number;
  readonly goalkeeperCausalityCount: number;
  readonly playerImpactCausalityCount: number;
  readonly teamStrategyCausalityCount: number;
  readonly weakCausalityCount: number;
  readonly mediumCausalityCount: number;
  readonly strongCausalityCount: number;
  readonly weakCausalityExplainedCount: number;
  readonly unsupportedCausalityClaimCount: number;
  readonly inventedCausalityClaimCount: number;
  readonly officialEventBackedCausalityCount: number;
  readonly causalityWithoutOfficialEventCount: number;
  readonly causalityAuditWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditOfficialAttributeRoleFatigueCausality(
  model: OfficialMatchAttributeRoleFatigueCausalityModel,
): OfficialAttributeRoleFatigueCausalityAudit {
  const facts = model.evidenceFacts;
  const causalityWithoutOfficialEventCount = facts.filter((fact) => fact.linkedOfficialEventIds.length === 0).length;
  const weakCausalityCount = facts.filter((fact) => fact.evidenceStrength === "weak").length;

  return {
    officialCausalityLayerExists: model.officialCausalityLayerReady,
    officialCausalityLinkCount: facts.length,
    attributeCausalityCount: facts.filter((fact) => fact.attributeNames.length > 0).length,
    roleCausalityCount: model.roleCausalities.length,
    fatigueCausalityCount: model.fatigueCausalities.length,
    mentalFreshnessCausalityCount: model.fatigueCausalities.filter((fact) => fact.fatigueType === "mental_freshness" || fact.fatigueType === "goalkeeper_mental_fatigue").length,
    tacticalPlanCausalityCount: facts.filter((fact) => fact.tacticalPlanFields.length > 0).length,
    pressureCausalityCount: facts.filter((fact) => fact.causalityType === "pressure").length,
    zoneAccessCausalityCount: facts.filter((fact) => fact.causalityType === "zone_access" || fact.causalityType === "score_sequence").length,
    goalkeeperCausalityCount: facts.filter((fact) => fact.causalityType === "goalkeeper_response" || fact.role === "goalkeeper_free_safety").length,
    playerImpactCausalityCount: model.playerImpactCausalities.length,
    teamStrategyCausalityCount: model.teamStrategyCausalities.length,
    weakCausalityCount,
    mediumCausalityCount: facts.filter((fact) => fact.evidenceStrength === "medium").length,
    strongCausalityCount: facts.filter((fact) => fact.evidenceStrength === "strong").length,
    weakCausalityExplainedCount: model.weakCausalityExplainedCount,
    unsupportedCausalityClaimCount: model.unsupportedCausalityClaimCount,
    inventedCausalityClaimCount: model.inventedCausalityClaimCount,
    officialEventBackedCausalityCount: facts.filter((fact) => fact.linkedOfficialEventIds.length > 0).length,
    causalityWithoutOfficialEventCount,
    causalityAuditWarningCodes: [
      ...(facts.length >= 6 ? [] : ["OFFICIAL_CAUSALITY_LAYER_MISSING"]),
      ...(causalityWithoutOfficialEventCount === 0 ? [] : ["CAUSALITY_WITHOUT_OFFICIAL_EVENT"]),
      ...(weakCausalityCount === model.weakCausalityExplainedCount ? [] : ["WEAK_CAUSALITY_NOT_EXPLAINED"]),
    ],
    recommendation: model.recommendation,
  };
}
