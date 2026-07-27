import type { NextMatchObservationPlan8K, NextMatchObservationPlanAudit8K } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { CoachReportDecisionLayerNextMatchObservationPlanWarningCode } from "./coachReportDecisionLayerNextMatchObservationPlanWarnings";

export function auditNextMatchObservationPlan8K(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly plan: NextMatchObservationPlan8K;
}): NextMatchObservationPlanAudit8K {
  const warnings: CoachReportDecisionLayerNextMatchObservationPlanWarningCode[] = [];
  const visibleText = `${input.productHtml}\n${input.exportHtml}`;
  const nextMatchObservationPlanVisible = visibleText.includes("Plan d'observation prochain match") ||
    visibleText.includes("A observer au prochain match");
  const observationItemCount = input.plan.observationItems.length;
  const observationItemsWithWhenToWatchCount = input.plan.observationItems.filter((item) => item.whenToWatch.length > 0).length;
  const observationItemsWithWhereToWatchCount = input.plan.observationItems.filter((item) => item.whereToWatch.length > 0).length;
  const observationItemsWithPositiveSignalCount = input.plan.observationItems.filter((item) => item.positiveSignal.length > 0).length;
  const observationItemsWithNegativeSignalCount = input.plan.observationItems.filter((item) => item.negativeSignal.length > 0).length;
  const observationItemsWithMinimumEvidenceCount = input.plan.observationItems.filter((item) => item.minimumEvidenceNeeded.length > 0).length;
  const observationItemsWithCautionNoteCount = input.plan.observationItems.filter((item) => item.cautionNote.length > 0).length;

  if (!nextMatchObservationPlanVisible) warnings.push("NEXT_MATCH_OBSERVATION_PLAN_MISSING");
  if (observationItemCount !== 3) warnings.push("OBSERVATION_ITEM_COUNT_INVALID");
  if (observationItemsWithPositiveSignalCount !== 3) warnings.push("CONFIRMATION_CRITERIA_MISSING");
  if (observationItemsWithNegativeSignalCount !== 3) warnings.push("DISCONFIRMATION_CRITERIA_MISSING");

  return {
    nextMatchObservationPlanVisible,
    observationItemCount,
    observationItemsWithWhenToWatchCount,
    observationItemsWithWhereToWatchCount,
    observationItemsWithPositiveSignalCount,
    observationItemsWithNegativeSignalCount,
    observationItemsWithMinimumEvidenceCount,
    observationItemsWithCautionNoteCount,
    planSaysNotSelectionRecommendation: input.plan.notASelectionRecommendation && visibleText.includes("pas consigne de selection"),
    planSaysNotTacticalInstruction: input.plan.notATacticalInstruction && visibleText.includes("pas une consigne a executer telle quelle"),
    planRequiresNoSeasonMemory: input.plan.noSeasonMemoryRequired,
    observationPlanWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_NEXT_MATCH_OBSERVATION_PLAN" : "REPAIR_OBSERVATION_PLAN",
  };
}
