export enum UtilityActionType {
  Carry = "carry",
  Pass = "pass",
  Kick = "kick",
  GoalAttempt = "goal_attempt",
  DropAttempt = "drop_attempt",
  Press = "press",
  Cover = "cover",
  Support = "support",
  AttackSpace = "attack_space",
  ProtectZone = "protect_zone",
  ContestLooseBall = "contest_loose_ball",
}

export interface UtilityActionIntent {
  readonly action: UtilityActionType;
  readonly intent: string;
}
