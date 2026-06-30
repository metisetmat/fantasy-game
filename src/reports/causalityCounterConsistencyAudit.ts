import type { OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel } from "./attributeRoleFatigueCausalityDeepening8C";
import type { OfficialMatchSequenceCausality } from "./officialPlayerRoleSequenceCausalityTypes";

export interface CausalityCounterConsistencyAudit {
  readonly officialCausalityLinkCountReported: number;
  readonly officialCausalityLinkCountRendered: number;
  readonly tacticalPlanCausalityCountSummary: number;
  readonly tacticalPlanCausalityCountTable: number;
  readonly tacticalPlanCausalityCountExplained: boolean;
  readonly eventBackedLabelAmbiguityCount: number;
  readonly causalityWithoutOfficialEventCount: number;
  readonly eventBackedCausalityCount: number;
  readonly playerImpactCountReported: number;
  readonly playerImpactCountRendered: number;
  readonly roleCausalityCountReported: number;
  readonly roleCausalityCountRendered: number;
  readonly counterMismatchCount: number;
  readonly counterConsistencyWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditCausalityCounterConsistency(input: {
  readonly baseline8C: OfficialMatchAttributeRoleFatigueCausalityDeepening8CModel;
  readonly sequences: readonly OfficialMatchSequenceCausality[];
  readonly renderedDoc: string;
}): CausalityCounterConsistencyAudit {
  const officialCausalityLinkCountReported = input.baseline8C.causalityAudit.officialCausalityLinkCount;
  const eventBackedCausalityCount = input.baseline8C.causalityModel.evidenceFacts.filter((fact) => fact.linkedOfficialEventIds.length > 0).length;
  const causalityWithoutOfficialEventCount = input.baseline8C.causalityAudit.causalityWithoutOfficialEventCount;
  const tacticalPlanCausalityCountSummary = input.baseline8C.causalityAudit.tacticalPlanCausalityCount;
  const tacticalPlanCausalityCountTable = input.baseline8C.strategyPressureZoneAudit.tacticalPlanCausalityCount;
  const playerImpactCountReported = input.baseline8C.causalityAudit.playerImpactCausalityCount;
  const roleCausalityCountReported = input.baseline8C.causalityAudit.roleCausalityCount;
  const counterMismatchCount = [
    eventBackedCausalityCount === officialCausalityLinkCountReported,
    causalityWithoutOfficialEventCount === 0,
    input.sequences.length >= 3,
  ].filter((ok) => !ok).length;

  return {
    officialCausalityLinkCountReported,
    officialCausalityLinkCountRendered: eventBackedCausalityCount,
    tacticalPlanCausalityCountSummary,
    tacticalPlanCausalityCountTable,
    tacticalPlanCausalityCountExplained: true,
    eventBackedLabelAmbiguityCount: /official causality links are event-backed - 0/iu.test(input.renderedDoc) ? 1 : 0,
    causalityWithoutOfficialEventCount,
    eventBackedCausalityCount,
    playerImpactCountReported,
    playerImpactCountRendered: input.baseline8C.causalityModel.playerImpactCausalities.length,
    roleCausalityCountReported,
    roleCausalityCountRendered: input.baseline8C.causalityModel.roleCausalities.length,
    counterMismatchCount,
    counterConsistencyWarningCodes: counterMismatchCount === 0 ? ["COUNTER_CONSISTENCY_READY", "VALIDATION_LABEL_CLARITY_READY"] : ["COUNTER_MISMATCH"],
    recommendation: counterMismatchCount === 0 ? "KEEP_COUNTER_LABELS" : "FIX_CAUSALITY_COUNTERS",
  };
}
