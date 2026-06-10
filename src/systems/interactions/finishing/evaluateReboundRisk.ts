import { clampInteractionRating } from "../shared/ratings";
import type { DefensiveProtectionEvaluation, FinishingCapabilityEvaluation, ReboundRiskEvaluation } from "./types";

export interface ReboundRiskInput {
  readonly finishingCapability: FinishingCapabilityEvaluation;
  readonly defensiveProtection: DefensiveProtectionEvaluation;
  readonly chaosLevel: number;
}

export function evaluateReboundRisk(input: ReboundRiskInput): ReboundRiskEvaluation {
  const reboundRisk = clampInteractionRating(
    input.chaosLevel * 0.35 +
      input.finishingCapability.technicalExecution * 0.18 +
      input.defensiveProtection.protectionQuality * 0.22 +
      (100 - input.finishingCapability.composure) * 0.25,
  );

  return {
    reboundRisk,
    remainsLive: reboundRisk >= 58,
    breakdown: [
      { label: "chaos level", value: clampInteractionRating(input.chaosLevel) },
      { label: "technical execution", value: input.finishingCapability.technicalExecution },
      { label: "defensive contact", value: input.defensiveProtection.protectionQuality },
      { label: "low composure", value: clampInteractionRating(100 - input.finishingCapability.composure) },
    ],
  };
}
