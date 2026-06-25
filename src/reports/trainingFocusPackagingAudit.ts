import type { TrainingFocusPackage } from "./coachActionPlanCards";
import type { CoachActionPlanCardsTrainingFocusPackagingWarningCode } from "./coachActionPlanCardsTrainingFocusPackagingWarnings";

export interface TrainingFocusPackagingAudit {
  readonly trainingFocusCount: number;
  readonly primaryTrainingFocusCount: number;
  readonly secondaryTrainingFocusCount: number;
  readonly trainingFocusWithWhyCount: number;
  readonly trainingFocusWithCoachCueCount: number;
  readonly trainingFocusWithObservableSignalCount: number;
  readonly trainingFocusWithRiskCount: number;
  readonly trainingFocusWithEvidenceCount: number;
  readonly drillCueCount: number;
  readonly genericDrillCueCount: number;
  readonly unsupportedTrainingFocusCount: number;
  readonly trainingFocusTooBroadCount: number;
  readonly trainingFocusPackagingWarningCodes: readonly CoachActionPlanCardsTrainingFocusPackagingWarningCode[];
  readonly recommendation: "KEEP_TRAINING_FOCUS_PACKAGING" | "CLARIFY_TRAINING_FOCUS";
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function generic(value: string): boolean {
  return /travailler plus|etre meilleur|ameliorer globalement|faire mieux/iu.test(value);
}

export function auditTrainingFocusPackaging(focuses: readonly TrainingFocusPackage[]): TrainingFocusPackagingAudit {
  const genericDrillCueCount = focuses.filter((focus) => generic(focus.coachCue) || generic(focus.title)).length;
  const unsupportedTrainingFocusCount = focuses.filter((focus) => focus.evidenceSummary.length === 0).length;
  const trainingFocusTooBroadCount = focuses.filter((focus) => focus.title.split(/\s+/u).length > 18).length;
  const ready = focuses.length >= 1 &&
    focuses.length <= 2 &&
    focuses.filter((focus) => focus.priority === "primary").length === 1 &&
    genericDrillCueCount === 0 &&
    unsupportedTrainingFocusCount === 0 &&
    trainingFocusTooBroadCount === 0;

  return {
    trainingFocusCount: focuses.length,
    primaryTrainingFocusCount: focuses.filter((focus) => focus.priority === "primary").length,
    secondaryTrainingFocusCount: focuses.filter((focus) => focus.priority === "secondary").length,
    trainingFocusWithWhyCount: focuses.filter((focus) => hasText(focus.why)).length,
    trainingFocusWithCoachCueCount: focuses.filter((focus) => hasText(focus.coachCue)).length,
    trainingFocusWithObservableSignalCount: focuses.filter((focus) => hasText(focus.observableSignal)).length,
    trainingFocusWithRiskCount: focuses.filter((focus) => hasText(focus.riskToWatch)).length,
    trainingFocusWithEvidenceCount: focuses.filter((focus) => focus.evidenceSummary.length > 0).length,
    drillCueCount: focuses.filter((focus) => hasText(focus.coachCue)).length,
    genericDrillCueCount,
    unsupportedTrainingFocusCount,
    trainingFocusTooBroadCount,
    trainingFocusPackagingWarningCodes: ready
      ? ["TRAINING_FOCUS_PACKAGED"]
      : [
          "COACH_ACTION_PLAN_PACKAGING_PARTIAL",
          ...(genericDrillCueCount > 0 || trainingFocusTooBroadCount > 0 ? ["TRAINING_FOCUS_TOO_GENERIC" as const] : []),
        ],
    recommendation: ready ? "KEEP_TRAINING_FOCUS_PACKAGING" : "CLARIFY_TRAINING_FOCUS",
  };
}
