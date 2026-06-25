import type { CoachActionPlanCard } from "./coachActionPlanCards";
import type { CoachActionPlanCardsTrainingFocusPackagingWarningCode } from "./coachActionPlanCardsTrainingFocusPackagingWarnings";

export interface CoachActionPlanCardsAudit {
  readonly actionPlanCardCount: number;
  readonly primaryActionCardCount: number;
  readonly secondaryActionCardCount: number;
  readonly watchCardCount: number;
  readonly cardWithPriorityCount: number;
  readonly cardWithTrainingFocusCount: number;
  readonly cardWithCoachActionCount: number;
  readonly cardWithObservableSignalCount: number;
  readonly cardWithSuccessIndicatorCount: number;
  readonly cardWithRiskOrTradeoffCount: number;
  readonly cardWithEvidenceCount: number;
  readonly cardWithConfidenceCount: number;
  readonly cardWithSourceBadgeCount: number;
  readonly cardReadTimeUnder30sCount: number;
  readonly overlongActionCardCount: number;
  readonly vagueActionCardCount: number;
  readonly unsupportedActionCardCount: number;
  readonly forcedSelectionCardCount: number;
  readonly forcedTacticalPlanCardCount: number;
  readonly sandboxActionCardInOfficialBodyCount: number;
  readonly actionPlanCardsWarningCodes: readonly CoachActionPlanCardsTrainingFocusPackagingWarningCode[];
  readonly recommendation: "KEEP_ACTION_PLAN_CARD_STRUCTURE" | "CLARIFY_ACTION_PLAN_CARDS";
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("fr-FR");
}

function cardText(card: CoachActionPlanCard): string {
  return normalize([
    card.title,
    card.observation,
    card.coachingProblem,
    card.trainingFocus,
    card.coachAction,
    card.nextMatchObservableSignal,
    card.successIndicator,
    card.riskOrTradeoff,
    card.limitationNote ?? "",
    card.nonAppliedPreviewNote ?? "",
  ].join(" "));
}

function forcedSelection(card: CoachActionPlanCard): boolean {
  return /composition recommand|selection impose|doit selectionner|titulaire conseill/u.test(cardText(card));
}

function forcedPlan(card: CoachActionPlanCard): boolean {
  return /plan tactique impose|doit jouer|doit presser|doit attaquer/u.test(cardText(card));
}

function vague(card: CoachActionPlanCard): boolean {
  const text = cardText(card);
  return /ameliorer globalement|etre meilleur|faire mieux|travailler plus/u.test(text);
}

export function auditCoachActionPlanCards(cards: readonly CoachActionPlanCard[]): CoachActionPlanCardsAudit {
  const actionPlanCardCount = cards.length;
  const forcedSelectionCardCount = cards.filter(forcedSelection).length;
  const forcedTacticalPlanCardCount = cards.filter(forcedPlan).length;
  const overlongActionCardCount = cards.filter((card) => card.estimatedReadTimeSeconds > 30).length;
  const vagueActionCardCount = cards.filter(vague).length;
  const unsupportedActionCardCount = cards.filter((card) => card.evidenceSummary.length === 0).length;
  const sandboxActionCardInOfficialBodyCount = cards.filter((card) => card.sourceType === "sandbox").length;
  const ready = actionPlanCardCount >= 2 &&
    actionPlanCardCount <= 3 &&
    cards.filter((card) => card.priority === "primary").length === 1 &&
    overlongActionCardCount === 0 &&
    vagueActionCardCount === 0 &&
    unsupportedActionCardCount === 0 &&
    forcedSelectionCardCount === 0 &&
    forcedTacticalPlanCardCount === 0 &&
    sandboxActionCardInOfficialBodyCount === 0;

  return {
    actionPlanCardCount,
    primaryActionCardCount: cards.filter((card) => card.priority === "primary").length,
    secondaryActionCardCount: cards.filter((card) => card.priority === "secondary").length,
    watchCardCount: cards.filter((card) => card.priority === "watch").length,
    cardWithPriorityCount: cards.filter((card) => card.priority.length > 0).length,
    cardWithTrainingFocusCount: cards.filter((card) => hasText(card.trainingFocus)).length,
    cardWithCoachActionCount: cards.filter((card) => hasText(card.coachAction)).length,
    cardWithObservableSignalCount: cards.filter((card) => hasText(card.nextMatchObservableSignal)).length,
    cardWithSuccessIndicatorCount: cards.filter((card) => hasText(card.successIndicator)).length,
    cardWithRiskOrTradeoffCount: cards.filter((card) => hasText(card.riskOrTradeoff)).length,
    cardWithEvidenceCount: cards.filter((card) => card.evidenceSummary.length > 0).length,
    cardWithConfidenceCount: cards.filter((card) => card.confidence.length > 0).length,
    cardWithSourceBadgeCount: cards.filter((card) => card.sourceType.length > 0).length,
    cardReadTimeUnder30sCount: cards.filter((card) => card.estimatedReadTimeSeconds <= 30).length,
    overlongActionCardCount,
    vagueActionCardCount,
    unsupportedActionCardCount,
    forcedSelectionCardCount,
    forcedTacticalPlanCardCount,
    sandboxActionCardInOfficialBodyCount,
    actionPlanCardsWarningCodes: ready
      ? ["ACTION_PLAN_CARDS_VISIBLE", "ACTION_PLAN_CARDS_CONCRETE", "SUCCESS_INDICATORS_VISIBLE", "OBSERVABLE_SIGNALS_VISIBLE", "TRADEOFFS_VISIBLE"]
      : [
          "COACH_ACTION_PLAN_PACKAGING_PARTIAL",
          ...(overlongActionCardCount > 0 ? ["ACTION_CARDS_TOO_LONG" as const] : []),
          ...(vagueActionCardCount > 0 ? ["ACTION_CARDS_TOO_VAGUE" as const] : []),
          ...(unsupportedActionCardCount > 0 ? ["UNSUPPORTED_ACTION_CARD" as const] : []),
          ...(forcedSelectionCardCount > 0 ? ["FORCED_SELECTION_FROM_PREVIEW" as const] : []),
          ...(forcedTacticalPlanCardCount > 0 ? ["FORCED_TACTICAL_PLAN_RECOMMENDATION" as const] : []),
          ...(sandboxActionCardInOfficialBodyCount > 0 ? ["SANDBOX_CARD_IN_OFFICIAL_BODY" as const] : []),
        ],
    recommendation: ready ? "KEEP_ACTION_PLAN_CARD_STRUCTURE" : "CLARIFY_ACTION_PLAN_CARDS",
  };
}
