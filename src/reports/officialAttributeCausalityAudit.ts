import type { OfficialMatchAttributeRoleFatigueCausalityModel } from "./officialMatchAttributeRoleFatigueCausalityTypes";

export interface OfficialAttributeCausalityAudit {
  readonly attributeCausalityCount: number;
  readonly attributeSnapshotAvailable: boolean;
  readonly attributeClaimWithoutSnapshotCount: number;
  readonly attributeClaimWithoutEventCount: number;
  readonly attributeNameCoverageCount: number;
  readonly attributeImpactInNarrativeCount: number;
  readonly fallbackAttributeClaimCount: number;
  readonly unsupportedAttributeClaimCount: number;
  readonly attributeCausalityWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditOfficialAttributeCausality(model: OfficialMatchAttributeRoleFatigueCausalityModel): OfficialAttributeCausalityAudit {
  const attributeFacts = model.evidenceFacts.filter((fact) => fact.attributeNames.length > 0);
  const attributeSnapshotAvailable = attributeFacts.some((fact) => Object.keys(fact.attributeValuesSnapshot).length > 0);
  const attributeClaimWithoutSnapshotCount = attributeFacts.filter((fact) => Object.keys(fact.attributeValuesSnapshot).length === 0).length;
  const attributeClaimWithoutEventCount = attributeFacts.filter((fact) => fact.linkedOfficialEventIds.length === 0).length;
  const coveredNames = new Set(attributeFacts.flatMap((fact) => fact.attributeNames));

  return {
    attributeCausalityCount: attributeFacts.length,
    attributeSnapshotAvailable,
    attributeClaimWithoutSnapshotCount,
    attributeClaimWithoutEventCount,
    attributeNameCoverageCount: coveredNames.size,
    attributeImpactInNarrativeCount: attributeFacts.filter((fact) => fact.attributeNames.some((name) => model.narrative.playerImpactSummary.includes(name))).length,
    fallbackAttributeClaimCount: 0,
    unsupportedAttributeClaimCount: 0,
    attributeCausalityWarningCodes: [
      ...(attributeSnapshotAvailable ? [] : ["ATTRIBUTE_CAUSALITY_NOT_PROVEN"]),
      ...(attributeClaimWithoutSnapshotCount === 0 ? [] : ["ATTRIBUTE_CLAIM_WITHOUT_SNAPSHOT"]),
      ...(attributeClaimWithoutEventCount === 0 ? [] : ["ATTRIBUTE_CLAIM_WITHOUT_EVENT"]),
    ],
    recommendation: model.attributeCausalityReady ? "KEEP_ATTRIBUTE_CAUSALITY" : "ATTRIBUTE_CAUSALITY_FOLLOW_UP",
  };
}
