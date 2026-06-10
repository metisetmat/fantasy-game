import type { PlayerRole } from "../../../models/player";
import { TacticalStyle } from "../../../models/tactics";
import type { TacticalPhaseState } from "../../tacticalState";
import { IntentOutcome, IntentSource, IntentTransition, type IntentChain, type IntentChange, type PlayerIntent } from "../intentTypes";
import { createIntent } from "../playerIntent";
import { appendIntentChainTransition } from "./intentChain";
import { evaluateIntentEvolutionRule } from "./intentEvolutionRules";
import { createResolutionChange, shouldResolveIntent } from "./intentResolution";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function evolveUrgency(input: {
  readonly intent: PlayerIntent;
  readonly tick: number;
  readonly tacticalStyle: TacticalStyle;
  readonly outcome: IntentOutcome;
}): { readonly urgency: number; readonly confidence: number; readonly direction: "ESCALATING" | "DECAYING" | "STABLE" } {
  const age = Math.max(0, input.tick - input.intent.startedTick);
  const aggressiveStyle = input.tacticalStyle === TacticalStyle.Blitz;
  const urgencyGrowth = aggressiveStyle ? age * 7 : age * 4;
  const confidenceDecay = aggressiveStyle ? age * 3 : age * 2;
  const urgency = input.outcome === IntentOutcome.Failure ? input.intent.urgency - 12 : input.intent.urgency + urgencyGrowth;
  const confidence = input.outcome === IntentOutcome.Failure ? input.intent.confidence - 14 : input.intent.confidence - confidenceDecay;

  return {
    urgency: clamp(urgency),
    confidence: clamp(confidence),
    direction: urgencyGrowth >= 10 ? "ESCALATING" : confidenceDecay >= 8 ? "DECAYING" : "STABLE",
  };
}

export function evolveIntent(input: {
  readonly intent: PlayerIntent;
  readonly tick: number;
  readonly role: PlayerRole;
  readonly tacticalStyle: TacticalStyle;
  readonly phaseState?: TacticalPhaseState;
  readonly eventOutcome?: string;
}): {
  readonly intent: PlayerIntent | null;
  readonly change: IntentChange | null;
  readonly chain: IntentChain | null;
} {
  const resolution = shouldResolveIntent(input);

  if (resolution.resolve) {
    return {
      intent: null,
      change: createResolutionChange({
        intent: input.intent,
        tick: input.tick,
        outcome: resolution.outcome,
        reason: resolution.reason,
      }),
      chain: appendIntentChainTransition({
        intent: input.intent,
        nextType: null,
        transition: IntentTransition.Resolve,
        outcome: resolution.outcome,
        reason: resolution.reason,
        tick: input.tick,
      }),
    };
  }

  const rule = evaluateIntentEvolutionRule(input);
  const evolved = evolveUrgency({
    intent: input.intent,
    tick: input.tick,
    tacticalStyle: input.tacticalStyle,
    outcome: rule.outcome,
  });

  if (rule.transition === IntentTransition.Evolve && rule.nextType !== null) {
    const nextIntent = createIntent({
      playerId: input.intent.playerId,
      teamId: input.intent.teamId,
      type: rule.nextType,
      trigger: "intent_evolution",
      priority: clamp(input.intent.priority + (input.tacticalStyle === TacticalStyle.Blitz ? 8 : 4)),
      confidence: evolved.confidence,
      startedTick: input.tick,
      minDurationTicks: input.intent.minDurationTicks,
      maxDurationTicks: input.tacticalStyle === TacticalStyle.Blitz ? Math.max(3, input.intent.maxDurationTicks - 2) : input.intent.maxDurationTicks,
      tacticalReason: rule.reason,
      source: IntentSource.TacticalTrigger,
      parentEventId: input.intent.parentEventId,
    });
    const chainedIntent: PlayerIntent = {
      ...nextIntent,
      chainId: input.intent.chainId,
      urgency: evolved.urgency,
      evolutionDirection: evolved.direction,
      previousTypes: [...input.intent.previousTypes, input.intent.type],
      tacticalStory: `${input.intent.tacticalStory} -> ${rule.nextType}: ${rule.reason}`,
    };

    return {
      intent: chainedIntent,
      change: {
        playerId: input.intent.playerId,
        previousIntent: input.intent.type,
        nextIntent: rule.nextType,
        changeType: "SUPERSEDED",
        transition: IntentTransition.Evolve,
        outcome: rule.outcome,
        reason: rule.reason,
        tick: input.tick,
        chainId: input.intent.chainId,
      },
      chain: appendIntentChainTransition({
        intent: input.intent,
        nextType: rule.nextType,
        transition: IntentTransition.Evolve,
        outcome: rule.outcome,
        reason: rule.reason,
        tick: input.tick,
      }),
    };
  }

  return {
    intent: {
      ...input.intent,
      urgency: evolved.urgency,
      confidence: evolved.confidence,
      evolutionDirection: evolved.direction,
      tacticalStory: `${input.intent.tacticalStory} -> ${rule.transition}: ${rule.reason}`,
    },
    change: {
      playerId: input.intent.playerId,
      previousIntent: input.intent.type,
      nextIntent: input.intent.type,
      changeType: "REFRESHED",
      transition: IntentTransition.Continue,
      outcome: rule.outcome,
      reason: rule.reason,
      tick: input.tick,
      chainId: input.intent.chainId,
    },
    chain: null,
  };
}
