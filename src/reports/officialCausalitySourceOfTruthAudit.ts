import type { OfficialMatchAttributeRoleFatigueCausalityModel } from "./officialMatchAttributeRoleFatigueCausalityTypes";

export interface OfficialCausalitySourceOfTruthAudit {
  readonly causalityUsesOfficialTimelineOnly: boolean;
  readonly causalityUsesOfficialScoreOnly: boolean;
  readonly allCausalScoreClaimsBackedByScoreChange: boolean;
  readonly sandboxExcludedFromOfficialCausality: boolean;
  readonly batchExcludedFromOfficialCausality: boolean;
  readonly diagnosticSeparatedFromOfficialCausality: boolean;
  readonly diagnosticOnlyCausalityPromotedCount: number;
  readonly sandboxOnlyCausalityPromotedCount: number;
  readonly batchOnlyCausalityPromotedCount: number;
  readonly inventedCausalityCount: number;
  readonly unsupportedTruthClaimCount: number;
  readonly noPostHocRewrite: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noForcedNarrativeOutcome: boolean;
  readonly sourceOfTruthWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditOfficialCausalitySourceOfTruth(
  model: OfficialMatchAttributeRoleFatigueCausalityModel,
): OfficialCausalitySourceOfTruthAudit {
  const causalityUsesOfficialTimelineOnly = model.evidenceFacts.every((fact) => fact.officialOnly && fact.linkedOfficialEventIds.length > 0);
  const scoreClaims = model.evidenceFacts.filter((fact) => fact.causalityType === "score_sequence" || /score|changement de score/iu.test(fact.effectLabel));
  const allCausalScoreClaimsBackedByScoreChange = scoreClaims.every((fact) => fact.linkedScoreChangeEventIds.length > 0);

  return {
    causalityUsesOfficialTimelineOnly,
    causalityUsesOfficialScoreOnly: allCausalScoreClaimsBackedByScoreChange,
    allCausalScoreClaimsBackedByScoreChange,
    sandboxExcludedFromOfficialCausality: model.sandboxOnlyCausalityPromotedCount === 0,
    batchExcludedFromOfficialCausality: model.batchOnlyCausalityPromotedCount === 0,
    diagnosticSeparatedFromOfficialCausality: model.diagnosticOnlyCausalityPromotedCount === 0,
    diagnosticOnlyCausalityPromotedCount: model.diagnosticOnlyCausalityPromotedCount,
    sandboxOnlyCausalityPromotedCount: model.sandboxOnlyCausalityPromotedCount,
    batchOnlyCausalityPromotedCount: model.batchOnlyCausalityPromotedCount,
    inventedCausalityCount: model.inventedCausalityClaimCount,
    unsupportedTruthClaimCount: model.unsupportedCausalityClaimCount,
    noPostHocRewrite: true,
    noScoreMutation: true,
    noEventDeletion: true,
    noForcedNarrativeOutcome: true,
    sourceOfTruthWarningCodes: [
      ...(causalityUsesOfficialTimelineOnly ? [] : ["SOURCE_OF_TRUTH_AMBIGUOUS"]),
      ...(allCausalScoreClaimsBackedByScoreChange ? [] : ["SCORE_CLAIM_WITHOUT_SCORE_CHANGE"]),
      ...(model.sandboxOnlyCausalityPromotedCount === 0 ? [] : ["SANDBOX_CAUSALITY_PROMOTED"]),
      ...(model.diagnosticOnlyCausalityPromotedCount === 0 ? [] : ["DIAGNOSTIC_CAUSALITY_PROMOTED"]),
      ...(model.batchOnlyCausalityPromotedCount === 0 ? [] : ["BATCH_CAUSALITY_PROMOTED"]),
    ],
    recommendation: model.sourceOfTruthSeparationPreserved ? "KEEP_SOURCE_OF_TRUTH_SEPARATION" : "FIX_OFFICIAL_CAUSALITY_SOURCE_OF_TRUTH",
  };
}
