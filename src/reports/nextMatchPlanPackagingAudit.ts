import type { CoachActionPlanCard } from "./coachActionPlanCards";
import type { CoachActionPlanCardsTrainingFocusPackagingWarningCode } from "./coachActionPlanCardsTrainingFocusPackagingWarnings";

export interface NextMatchPlanPackagingAudit {
  readonly nextMatchPriorityCount: number;
  readonly concretePriorityCount: number;
  readonly vaguePriorityCount: number;
  readonly priorityWithObservableSignalCount: number;
  readonly priorityWithRiskCount: number;
  readonly priorityWithConfidenceCount: number;
  readonly priorityWithSourceCount: number;
  readonly priorityWithSuccessIndicatorCount: number;
  readonly planTooLong: boolean;
  readonly planReadingTimeEstimate: number;
  readonly nextMatchPlanPackagingWarningCodes: readonly CoachActionPlanCardsTrainingFocusPackagingWarningCode[];
  readonly recommendation: "KEEP_NEXT_MATCH_PLAN_PACKAGING" | "CLARIFY_NEXT_MATCH_PLAN";
}

function words(value: string): number {
  return value.split(/\s+/u).filter((word) => word.length > 0).length;
}

function vague(card: CoachActionPlanCard): boolean {
  return /ameliorer globalement|faire mieux|etre meilleur/iu.test([
    card.title,
    card.nextMatchObservableSignal,
    card.successIndicator,
  ].join(" "));
}

export function auditNextMatchPlanPackaging(cards: readonly CoachActionPlanCard[]): NextMatchPlanPackagingAudit {
  const nextMatchPriorityCount = cards.length;
  const planWords = cards.reduce((total, card) =>
    total + words(card.title) + words(card.nextMatchObservableSignal) + words(card.successIndicator) + words(card.riskOrTradeoff), 0);
  const planReadingTimeEstimate = Math.ceil(planWords / 3.8);
  const vaguePriorityCount = cards.filter(vague).length;
  const planTooLong = nextMatchPriorityCount > 3 || planReadingTimeEstimate > 90;
  const ready = nextMatchPriorityCount >= 2 &&
    nextMatchPriorityCount <= 3 &&
    cards.filter((card) => card.priority === "primary").length === 1 &&
    vaguePriorityCount === 0 &&
    !planTooLong;

  return {
    nextMatchPriorityCount,
    concretePriorityCount: Math.max(0, nextMatchPriorityCount - vaguePriorityCount),
    vaguePriorityCount,
    priorityWithObservableSignalCount: cards.filter((card) => card.nextMatchObservableSignal.length > 0).length,
    priorityWithRiskCount: cards.filter((card) => card.riskOrTradeoff.length > 0).length,
    priorityWithConfidenceCount: cards.filter((card) => card.confidence.length > 0).length,
    priorityWithSourceCount: cards.filter((card) => card.sourceType.length > 0).length,
    priorityWithSuccessIndicatorCount: cards.filter((card) => card.successIndicator.length > 0).length,
    planTooLong,
    planReadingTimeEstimate,
    nextMatchPlanPackagingWarningCodes: ready
      ? ["NEXT_MATCH_PLAN_PACKAGED"]
      : ["NEXT_MATCH_PLAN_TOO_VAGUE"],
    recommendation: ready ? "KEEP_NEXT_MATCH_PLAN_PACKAGING" : "CLARIFY_NEXT_MATCH_PLAN",
  };
}
