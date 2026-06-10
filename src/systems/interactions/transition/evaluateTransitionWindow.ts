import type { Rating } from "../../../core/ratings";
import type { CompactnessEvaluation, WeakSideEvaluation } from "../../spatial/types";
import { LaneAvailability } from "../../spatial/types";
import { BuildUpPressingOutcome } from "../shared/types";
import { clampInteractionRating } from "../shared/ratings";
import { TransitionTrigger, type TransitionWindow } from "./types";

export interface TransitionWindowInput {
  readonly trigger: TransitionTrigger;
  readonly previousOutcome: BuildUpPressingOutcome | null;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly weakSide: WeakSideEvaluation;
}

function getTriggerInstability(trigger: TransitionTrigger): Rating {
  switch (trigger) {
    case TransitionTrigger.Turnover:
      return 80;
    case TransitionTrigger.BrokenPress:
      return 70;
    case TransitionTrigger.DestabilizedStructure:
      return 60;
  }
}

function getOutcomeInstability(outcome: BuildUpPressingOutcome | null): Rating {
  if (outcome === BuildUpPressingOutcome.DangerousTurnover) {
    return 90;
  }

  if (outcome === BuildUpPressingOutcome.PressBroken || outcome === BuildUpPressingOutcome.WeakSideExposed) {
    return 75;
  }

  if (outcome === BuildUpPressingOutcome.ForcedClearance) {
    return 55;
  }

  return 45;
}

export function evaluateTransitionWindow(input: TransitionWindowInput): TransitionWindow {
  const weakSideBonus = input.weakSide.switchPlayOpportunity === LaneAvailability.Open ? 15 : 0;
  const compactnessPenalty = input.defensiveCompactness.overallCompactness * 0.35;
  const instability = clampInteractionRating(
    getTriggerInstability(input.trigger) * 0.35 +
      getOutcomeInstability(input.previousOutcome) * 0.35 +
      input.weakSide.exposure * 0.25 +
      weakSideBonus -
      compactnessPenalty,
  );
  const durationTicks = Math.max(2, Math.min(6, Math.round(2 + instability / 25)));
  const delayedDefenders = Math.max(1, Math.min(5, Math.round(instability / 22)));

  return {
    durationTicks,
    instability,
    chaos: clampInteractionRating(instability * 0.8 + weakSideBonus),
    delayedDefenders,
  };
}
