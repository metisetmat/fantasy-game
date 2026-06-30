import type { OfficialMatchSequenceCausality } from "./officialPlayerRoleSequenceCausalityTypes";

export interface SequenceFatigueSpecificityAudit {
  readonly sequenceFatigueSignalCount: number;
  readonly playerSpecificFatigueSignalCount: number;
  readonly teamLevelFatigueSignalCount: number;
  readonly fatigueVisibleButNotCausalCount: number;
  readonly fatigueEffectSpecificCount: number;
  readonly fatigueClaimWithoutSignalCount: number;
  readonly fatigueClaimWithoutEventCount: number;
  readonly fatigueStoryOverclaimCount: number;
  readonly goalkeeperMentalFatigueOfficialCount: number;
  readonly goalkeeperMentalFatigueSandboxOnlyCount: number;
  readonly fatigueSpecificityWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditSequenceFatigueSpecificity(sequences: readonly OfficialMatchSequenceCausality[]): SequenceFatigueSpecificityAudit {
  const effects = sequences.flatMap((sequence) => sequence.fatigueEffects);
  const fatigueVisibleButNotCausalCount = effects.filter((effect) => effect.observedEffect === "no_clear_effect").length;
  const fatigueClaimWithoutEventCount = effects.filter((effect) => effect.eventId.length === 0).length;
  const fatigueClaimWithoutSignalCount = effects.filter((effect) => effect.fatigueSignalType.length === 0).length;
  const fatigueStoryOverclaimCount = effects.filter((effect) => effect.observedEffect !== "no_clear_effect" && /score automatique|explique le score/iu.test(effect.coachReadableText)).length;
  const fatigueEffectSpecificCount = effects.filter((effect) => effect.observedEffect !== "no_clear_effect").length;
  const pass = fatigueClaimWithoutSignalCount === 0 &&
    fatigueClaimWithoutEventCount === 0 &&
    fatigueStoryOverclaimCount === 0 &&
    effects.length > 0;

  return {
    sequenceFatigueSignalCount: effects.length,
    playerSpecificFatigueSignalCount: effects.filter((effect) => effect.playerId !== undefined).length,
    teamLevelFatigueSignalCount: effects.filter((effect) => effect.playerId === undefined).length,
    fatigueVisibleButNotCausalCount,
    fatigueEffectSpecificCount,
    fatigueClaimWithoutSignalCount,
    fatigueClaimWithoutEventCount,
    fatigueStoryOverclaimCount,
    goalkeeperMentalFatigueOfficialCount: effects.filter((effect) => effect.fatigueSignalType === "goalkeeper_mental_load").length,
    goalkeeperMentalFatigueSandboxOnlyCount: 0,
    fatigueSpecificityWarningCodes: pass ? ["FATIGUE_EFFECT_SPECIFICITY_READY"] : ["FATIGUE_VISIBLE_NOT_CAUSAL"],
    recommendation: pass ? "KEEP_FATIGUE_SEQUENCE_LABELS" : "FATIGUE_SPECIFICITY_FOLLOW_UP",
  };
}
