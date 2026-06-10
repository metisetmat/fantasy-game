import { IntentOutcome, IntentTransition, type IntentChain, type IntentType, type PlayerIntent } from "../intentTypes";

export function createIntentChainFromIntent(intent: PlayerIntent): IntentChain {
  return {
    chainId: intent.chainId,
    originatingIntent: intent.previousTypes[0] ?? intent.type,
    currentIntent: intent.type,
    previousIntents: intent.previousTypes,
    transitions: [],
    tacticalStory: intent.tacticalStory,
  };
}

export function appendIntentChainTransition(input: {
  readonly intent: PlayerIntent;
  readonly nextType: IntentType | null;
  readonly transition: IntentTransition;
  readonly outcome: IntentOutcome;
  readonly reason: string;
  readonly tick: number;
}): IntentChain {
  const previousIntents = input.nextType === null ? input.intent.previousTypes : [...input.intent.previousTypes, input.intent.type];

  return {
    chainId: input.intent.chainId,
    originatingIntent: input.intent.previousTypes[0] ?? input.intent.type,
    currentIntent: input.nextType,
    previousIntents,
    transitions: [
      {
        from: input.intent.type,
        to: input.nextType,
        transition: input.transition,
        outcome: input.outcome,
        reason: input.reason,
        tick: input.tick,
      },
    ],
    tacticalStory: `${input.intent.tacticalStory} -> ${input.transition}: ${input.reason}`,
  };
}
