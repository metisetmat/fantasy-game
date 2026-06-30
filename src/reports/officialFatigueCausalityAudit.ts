import type { OfficialMatchAttributeRoleFatigueCausalityModel } from "./officialMatchAttributeRoleFatigueCausalityTypes";

export interface OfficialFatigueCausalityAudit {
  readonly fatigueSignalsAvailable: boolean;
  readonly fatigueCausalityCount: number;
  readonly physicalFatigueCausalityCount: number;
  readonly mentalFreshnessCausalityCount: number;
  readonly goalkeeperMentalFatigueCausalityCount: number;
  readonly fatigueVisibleButNotCausalCount: number;
  readonly fatigueClaimWithoutSignalCount: number;
  readonly lateErrorCausalityCount: number;
  readonly highIntensityLoadCausalityCount: number;
  readonly fatigueInStoryCount: number;
  readonly fatigueInStoryWithoutEvidenceCount: number;
  readonly fatigueCausalityWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditOfficialFatigueCausality(model: OfficialMatchAttributeRoleFatigueCausalityModel): OfficialFatigueCausalityAudit {
  const fatigueSignalsAvailable = model.evidenceFacts.some((fact) => Object.keys(fact.fatigueSnapshot).length > 0);
  const fatigueInStoryCount = /fatigue|fraicheur|condition/iu.test(model.narrative.coachFacingCausalSummary) ? 1 : 0;
  const fatigueCausalityCount = model.fatigueCausalities.length;
  const fatigueVisibleButNotCausalCount = fatigueSignalsAvailable && fatigueCausalityCount === 0 ? 1 : 0;
  const fatigueClaimWithoutSignalCount = fatigueInStoryCount > 0 && !fatigueSignalsAvailable ? 1 : 0;

  return {
    fatigueSignalsAvailable,
    fatigueCausalityCount,
    physicalFatigueCausalityCount: model.fatigueCausalities.filter((fact) => fact.fatigueType === "physical_condition").length,
    mentalFreshnessCausalityCount: model.fatigueCausalities.filter((fact) => fact.fatigueType === "mental_freshness").length,
    goalkeeperMentalFatigueCausalityCount: model.fatigueCausalities.filter((fact) => fact.fatigueType === "goalkeeper_mental_fatigue").length,
    fatigueVisibleButNotCausalCount,
    fatigueClaimWithoutSignalCount,
    lateErrorCausalityCount: model.fatigueCausalities.filter((fact) => fact.fatigueType === "late_error").length,
    highIntensityLoadCausalityCount: model.fatigueCausalities.filter((fact) => fact.fatigueType === "high_intensity_load").length,
    fatigueInStoryCount,
    fatigueInStoryWithoutEvidenceCount: fatigueClaimWithoutSignalCount,
    fatigueCausalityWarningCodes: [
      ...(fatigueClaimWithoutSignalCount === 0 ? [] : ["FATIGUE_CLAIM_WITHOUT_SIGNAL"]),
      ...(fatigueVisibleButNotCausalCount === 0 ? [] : ["FATIGUE_VISIBLE_NOT_CAUSAL"]),
    ],
    recommendation: model.fatigueCausalityReady ? "KEEP_CAUSALITY_PRUDENCE" : "FATIGUE_CAUSALITY_FOLLOW_UP",
  };
}
