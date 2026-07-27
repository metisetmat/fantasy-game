import type { CoachDecisionLayerAudit8K, CoachDecisionCard8K } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { CoachReportDecisionLayerNextMatchObservationPlanWarningCode } from "./coachReportDecisionLayerNextMatchObservationPlanWarnings";

export function auditCoachDecisionLayer8K(input: {
  readonly productHtml: string;
  readonly decisionCards: readonly CoachDecisionCard8K[];
}): CoachDecisionLayerAudit8K {
  const warnings: CoachReportDecisionLayerNextMatchObservationPlanWarningCode[] = [];
  const decisionLayerVisible = input.productHtml.includes('id="coach-decision-layer-8k"') &&
    input.productHtml.includes("Decider quoi observer au prochain match");
  const decisionCardCount = input.decisionCards.length;
  const primaryDecisionPresent = input.decisionCards.some((card) => card.priorityLevel === "primary");
  const secondaryDecisionPresent = input.decisionCards.some((card) => card.priorityLevel === "secondary");
  const watchDecisionPresent = input.decisionCards.some((card) => card.priorityLevel === "watch");
  const decisionCardsWithQuestionCount = input.decisionCards.filter((card) => card.decisionQuestion.length > 0).length;
  const decisionCardsWithObservationFocusCount = input.decisionCards.filter((card) => card.observationFocus.length > 0).length;
  const decisionCardsWithConfirmationSignalCount = input.decisionCards.filter((card) => card.confirmationSignal.length > 0).length;
  const decisionCardsWithDisconfirmationSignalCount = input.decisionCards.filter((card) => card.disconfirmationSignal.length > 0).length;
  const decisionCardsWithRiskCount = input.decisionCards.filter((card) => card.riskToWatch.length > 0).length;
  const decisionCardsWithDoNotOverInterpretCount = input.decisionCards.filter((card) => card.doNotOverInterpret.length > 0).length;
  const decisionCardsLinkedToReplayCount = input.decisionCards.filter((card) => card.linkedReplayMomentIds.length > 0).length;
  const decisionCardsLinkedToActionPlanCount = input.decisionCards.filter((card) => card.linkedActionPlanCardIds.length > 0).length;
  const decisionCardsLinkedToTacticalMapOrTrendCount = input.decisionCards.filter((card) => card.linkedTacticalMapCardIds.length > 0 || card.linkedTrendIds.length > 0).length;
  const decisionCardsWithEvidenceBoundaryCount = input.decisionCards.filter((card) => card.evidenceBoundary.length > 0).length;

  if (!decisionLayerVisible) warnings.push("DECISION_LAYER_MISSING");
  if (decisionCardCount !== 3) warnings.push("DECISION_CARD_COUNT_INVALID");
  if (decisionCardsWithConfirmationSignalCount !== 3) warnings.push("CONFIRMATION_CRITERIA_MISSING");
  if (decisionCardsWithDisconfirmationSignalCount !== 3) warnings.push("DISCONFIRMATION_CRITERIA_MISSING");
  if (decisionCardsWithDoNotOverInterpretCount !== 3) warnings.push("DO_NOT_OVERINTERPRET_MISSING");
  if (decisionCardsLinkedToReplayCount !== 3) warnings.push("DECISION_REPLAY_LINK_MISSING");
  if (decisionCardsLinkedToActionPlanCount !== 3) warnings.push("DECISION_ACTION_PLAN_LINK_MISSING");
  if (decisionCardsLinkedToTacticalMapOrTrendCount !== 3) warnings.push("DECISION_TACTICAL_MAP_LINK_MISSING");

  return {
    decisionLayerVisible,
    decisionCardCount,
    primaryDecisionPresent,
    secondaryDecisionPresent,
    watchDecisionPresent,
    decisionCardsWithQuestionCount,
    decisionCardsWithObservationFocusCount,
    decisionCardsWithConfirmationSignalCount,
    decisionCardsWithDisconfirmationSignalCount,
    decisionCardsWithRiskCount,
    decisionCardsWithDoNotOverInterpretCount,
    decisionCardsLinkedToReplayCount,
    decisionCardsLinkedToActionPlanCount,
    decisionCardsLinkedToTacticalMapOrTrendCount,
    decisionCardsWithEvidenceBoundaryCount,
    decisionLayerWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_DECISION_LAYER_READY" : "REPAIR_DECISION_LAYER_LINKS",
  };
}
