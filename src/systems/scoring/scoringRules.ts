import type { ResolvedShotBallOutcome } from "../actions";
import type { ScoringActionType, ScoringRuleSet, ScoringVersion } from "./scoringRuleTypes";

export const SCORING_VERSION: ScoringVersion = "V1";

export const V1_SCORING_RULES: ScoringRuleSet = {
  version: SCORING_VERSION,
  scoreUnit: "POINTS",
  rules: [
    { actionType: "SHOT_GOAL", pointValue: 3, activeInVersion: SCORING_VERSION },
    { actionType: "SHOT_MISSED", pointValue: 0, activeInVersion: SCORING_VERSION },
    { actionType: "SHOT_SAVED", pointValue: 0, activeInVersion: SCORING_VERSION },
    { actionType: "SHOT_BLOCKED", pointValue: 0, activeInVersion: SCORING_VERSION },
    { actionType: "SHOT_OUT_OF_PLAY", pointValue: 0, activeInVersion: SCORING_VERSION },
    { actionType: "TRY_TOUCHDOWN", pointValue: 5, activeInVersion: "V2_DROP_FOUNDATION" },
    { actionType: "CONVERSION_GOAL", pointValue: 2, activeInVersion: "V2_DROP_FOUNDATION" },
    { actionType: "CONVERSION_MISSED", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
    { actionType: "CONVERSION_BLOCKED", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
    { actionType: "CONVERSION_INVALID", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
    { actionType: "DROP_GOAL", pointValue: 2, activeInVersion: "V2_DROP_FOUNDATION" },
    { actionType: "DROP_MISSED", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
    { actionType: "DROP_BLOCKED", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
    { actionType: "DROP_INVALID", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
  ],
};

export function scoringActionTypeForShotOutcome(outcome: ResolvedShotBallOutcome): ScoringActionType {
  switch (outcome) {
    case "GOAL":
      return "SHOT_GOAL";
    case "SAVED":
    case "SAVED_BY_GK":
    case "CAUGHT_BY_GK":
    case "DEFLECTED_BY_GK":
      return "SHOT_SAVED";
    case "BLOCKED":
    case "BLOCKED_BY_DEFENDER":
    case "REBOUND":
    case "REBOUND_CONTESTED":
      return "SHOT_BLOCKED";
    case "MISSED":
    case "MISSED_WIDE":
    case "MISSED_HIGH":
    case "OUT_OF_PLAY":
    case "PENDING":
      return outcome === "OUT_OF_PLAY" ? "SHOT_OUT_OF_PLAY" : "SHOT_MISSED";
  }
}

export function pointValueForScoringActionType(actionType: ScoringActionType): number {
  return V1_SCORING_RULES.rules.find((rule) => rule.actionType === actionType)?.pointValue ?? 0;
}

export function scoringRuleLabel(actionType: ScoringActionType): string {
  return `${actionType} = ${pointValueForScoringActionType(actionType)} points`;
}
