import { TacticalStyle } from "../../../models/tactics";
import { TacticalPhaseState } from "../../tacticalState";
import { IntentOutcome, IntentTransition, IntentType, type IntentChange, type PlayerIntent } from "../intentTypes";

export function shouldResolveIntent(input: {
  readonly intent: PlayerIntent;
  readonly tick: number;
  readonly tacticalStyle: TacticalStyle;
  readonly phaseState?: TacticalPhaseState;
  readonly eventOutcome?: string;
}): { readonly resolve: boolean; readonly outcome: IntentOutcome; readonly reason: string } {
  const age = Math.max(0, input.tick - input.intent.startedTick);
  const outcome = input.eventOutcome ?? "";

  if (input.intent.type === IntentType.PrepareFinish && /SCORED|SAVED|MISSED|STOPPED|HELD|DROP_|GOAL_|TRY_/.test(outcome)) {
    return { resolve: true, outcome: IntentOutcome.Success, reason: "finishing action completed" };
  }

  if (input.intent.type === IntentType.PressBall && age >= (input.tacticalStyle === TacticalStyle.Blitz ? 3 : 5)) {
    return { resolve: true, outcome: IntentOutcome.PartialSuccess, reason: "pressing window closed" };
  }

  if (input.intent.type === IntentType.ContestLooseBall && /secured|cleared|turnover|scramble ended/i.test(outcome)) {
    return { resolve: true, outcome: IntentOutcome.Success, reason: "loose-ball contest resolved" };
  }

  if (input.phaseState === TacticalPhaseState.Settled && [IntentType.PressBall, IntentType.ContestLooseBall, IntentType.PrepareFinish].includes(input.intent.type)) {
    return { resolve: true, outcome: IntentOutcome.Interrupted, reason: "phase settled and emergency intent ended" };
  }

  return { resolve: false, outcome: IntentOutcome.PartialSuccess, reason: "intent remains tactically live" };
}

export function createResolutionChange(input: {
  readonly intent: PlayerIntent;
  readonly tick: number;
  readonly outcome: IntentOutcome;
  readonly reason: string;
}): IntentChange {
  return {
    playerId: input.intent.playerId,
    previousIntent: input.intent.type,
    nextIntent: null,
    changeType: "RESOLVED",
    transition: IntentTransition.Resolve,
    outcome: input.outcome,
    reason: input.reason,
    tick: input.tick,
    chainId: input.intent.chainId,
  };
}
