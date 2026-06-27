import type { OfficialMatchAttributeRoleFatigueCausalityModel } from "./officialMatchAttributeRoleFatigueCausalityTypes";

export interface OfficialStrategyPressureZoneCausalityAudit {
  readonly tacticalPlanCausalityCount: number;
  readonly pressureCausalityCount: number;
  readonly zoneAccessCausalityCount: number;
  readonly transitionStructureCausalityCount: number;
  readonly supportStructureCausalityCount: number;
  readonly restDefenseCausalityCount: number;
  readonly planClaimWithoutObservedEffectCount: number;
  readonly pressureClaimWithoutEventCount: number;
  readonly zoneClaimWithoutEventCount: number;
  readonly strategyImpactInNarrativeCount: number;
  readonly strategyPressureZoneWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditOfficialStrategyPressureZoneCausality(
  model: OfficialMatchAttributeRoleFatigueCausalityModel,
): OfficialStrategyPressureZoneCausalityAudit {
  const pressureFacts = model.evidenceFacts.filter((fact) => fact.causalityType === "pressure");
  const zoneFacts = model.evidenceFacts.filter((fact) => fact.causalityType === "zone_access" || fact.causalityType === "score_sequence");
  const planClaimWithoutObservedEffectCount = model.teamStrategyCausalities.filter((fact) => fact.observedEffect.length === 0).length;
  const pressureClaimWithoutEventCount = pressureFacts.filter((fact) => fact.linkedOfficialEventIds.length === 0).length;
  const zoneClaimWithoutEventCount = zoneFacts.filter((fact) => fact.linkedOfficialEventIds.length === 0).length;

  return {
    tacticalPlanCausalityCount: model.teamStrategyCausalities.length,
    pressureCausalityCount: pressureFacts.length,
    zoneAccessCausalityCount: zoneFacts.length,
    transitionStructureCausalityCount: model.evidenceFacts.filter((fact) => fact.causalityType === "transition_structure").length,
    supportStructureCausalityCount: model.evidenceFacts.filter((fact) => fact.causalityType === "support_structure").length,
    restDefenseCausalityCount: model.evidenceFacts.filter((fact) => fact.causalityType === "rest_defense").length,
    planClaimWithoutObservedEffectCount,
    pressureClaimWithoutEventCount,
    zoneClaimWithoutEventCount,
    strategyImpactInNarrativeCount: model.teamStrategyCausalities.filter((fact) => model.narrative.strategyImpactSummary.includes(fact.observedEffect)).length,
    strategyPressureZoneWarningCodes: [
      ...(model.teamStrategyCausalities.length >= 2 ? [] : ["STRATEGY_CAUSALITY_NOT_PROVEN"]),
      ...(zoneFacts.length >= 2 ? [] : ["ZONE_ACCESS_CAUSALITY_NOT_PROVEN"]),
      ...(planClaimWithoutObservedEffectCount === 0 ? [] : ["PLAN_CLAIM_WITHOUT_OBSERVED_EFFECT"]),
      ...(pressureClaimWithoutEventCount === 0 ? [] : ["PRESSURE_CLAIM_WITHOUT_EVENT"]),
      ...(zoneClaimWithoutEventCount === 0 ? [] : ["ZONE_CLAIM_WITHOUT_EVENT"]),
    ],
    recommendation: model.strategyCausalityReady ? "KEEP_STRATEGY_CAUSALITY" : "STRATEGY_CAUSALITY_FOLLOW_UP",
  };
}
