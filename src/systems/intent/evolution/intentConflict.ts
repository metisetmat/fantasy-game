import { IntentTransition, IntentType, type IntentChange, type PlayerIntent } from "../intentTypes";

const CONFLICTS: ReadonlyArray<readonly IntentType[]> = [
  [IntentType.AttackDepth, IntentType.RecoverStructure],
  [IntentType.AttackDepth, IntentType.ProtectRestDefense],
  [IntentType.PrepareFinish, IntentType.SupportBall],
  [IntentType.PressBall, IntentType.ProtectFrame],
  [IntentType.OccupyWidth, IntentType.SupportBall],
];

export function intentsAreCompatible(left: IntentType, right: IntentType): boolean {
  return !CONFLICTS.some((group) => group.includes(left) && group.includes(right));
}

export function resolveIntentConflicts(input: {
  readonly playerId: string;
  readonly tick: number;
  readonly intents: readonly PlayerIntent[];
}): { readonly intents: readonly PlayerIntent[]; readonly changes: readonly IntentChange[] } {
  const sorted = [...input.intents].sort((left, right) => right.priority - left.priority);
  const accepted: PlayerIntent[] = [];
  const changes: IntentChange[] = [];

  for (const intent of sorted) {
    const conflicting = accepted.find((candidate) => !intentsAreCompatible(candidate.type, intent.type));

    if (conflicting === undefined) {
      accepted.push(intent);
    } else {
      changes.push({
        playerId: input.playerId,
        previousIntent: intent.type,
        nextIntent: conflicting.type,
        changeType: "SUPERSEDED",
        transition: IntentTransition.Cancel,
        reason: `${conflicting.type} outranked conflicting ${intent.type}`,
        tick: input.tick,
        chainId: intent.chainId,
      });
    }
  }

  return { intents: accepted, changes };
}
