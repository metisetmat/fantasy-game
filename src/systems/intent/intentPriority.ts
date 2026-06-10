import { IntentType, type PlayerIntent } from "./intentTypes";

const CONFLICT_GROUPS: ReadonlyArray<readonly IntentType[]> = [
  [IntentType.AttackDepth, IntentType.ProtectRestDefense, IntentType.ResetShape],
  [IntentType.PressBall, IntentType.HoldPosition, IntentType.SweepDepth],
  [IntentType.PrepareFinish, IntentType.SecureRecycle],
];

export function intentsConflict(left: IntentType, right: IntentType): boolean {
  return CONFLICT_GROUPS.some((group) => group.includes(left) && group.includes(right));
}

export function selectPrimaryIntent(intents: readonly PlayerIntent[]): PlayerIntent | null {
  const active = intents.filter((intent) => intent.status === "ACTIVE");

  return [...active].sort((left, right) => {
    if (right.priority !== left.priority) {
      return right.priority - left.priority;
    }

    return right.confidence - left.confidence;
  })[0] ?? null;
}
