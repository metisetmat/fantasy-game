import { TacticalActionType } from "./actionSemanticTypes";

export interface ActionSemanticReasonInput {
  readonly eventType: string;
  readonly selectedActionType: TacticalActionType | string;
  readonly selectedActionSubtype?: string | undefined;
  readonly decisionActorLabel: string;
  readonly receiverLabel?: string | undefined;
}

export interface ActionSemanticReasonValidation {
  readonly valid: boolean;
  readonly forbiddenTerms: readonly string[];
}

function receiverText(input: ActionSemanticReasonInput, fallback: string): string {
  return input.receiverLabel ?? fallback;
}

export function generateActionSemanticReason(input: ActionSemanticReasonInput): string {
  switch (input.selectedActionType) {
    case TacticalActionType.SupportClusterRecycle:
      return `${input.decisionActorLabel} plays a pressure-escape recycle into the support cluster; ${receiverText(input, "the receiver")} receives and becomes the next carrier.`;
    case TacticalActionType.ForwardProgress:
    case TacticalActionType.OffensiveConstructionPass:
      return `${input.decisionActorLabel} advances the attacking structure by finding ${receiverText(input, "the receiver")} in the next support line; ${receiverText(input, "the receiver")} receives and becomes the next carrier.`;
    case TacticalActionType.SafeRecycle:
      return `${input.decisionActorLabel} secures possession through a safe reset; ${receiverText(input, "the receiver")} receives while the team preserves rest defense.`;
    case TacticalActionType.CentralRecycle:
      return `${input.decisionActorLabel} rebuilds through the central support structure; ${receiverText(input, "the receiver")} receives and stabilizes the next phase.`;
    case TacticalActionType.Shot:
      return `${input.decisionActorLabel} converts the attacking window into a shot attempt.`;
    case TacticalActionType.CarryOrHold:
      return `${input.decisionActorLabel} holds or carries to stabilize the ball under pressure.`;
    case TacticalActionType.PressureEscape:
      return `${input.decisionActorLabel} escapes pressure by finding ${receiverText(input, "the receiver")} as the clean outlet; ${receiverText(input, "the receiver")} becomes the next carrier.`;
    case TacticalActionType.ContactPlatformPass:
      return `${input.decisionActorLabel} uses ${receiverText(input, "the receiver")} as a contact platform to keep the next action alive.`;
    case TacticalActionType.WeakSideSupport:
    case TacticalActionType.WeakSideSwitch:
      return `${input.decisionActorLabel} shifts the ball toward weak-side support; ${receiverText(input, "the receiver")} receives with the next phase opening.`;
    case TacticalActionType.WeakSideRupture:
      return `${input.decisionActorLabel} attacks the weak-side rupture window; ${receiverText(input, "the receiver")} receives beyond the compressed pressure.`;
    case TacticalActionType.SmallSideReset:
      return `${input.decisionActorLabel} resets through the small side; ${receiverText(input, "the receiver")} receives to keep possession connected.`;
    case TacticalActionType.ShortInteriorSupport:
      return `${input.decisionActorLabel} finds short interior support; ${receiverText(input, "the receiver")} receives inside the pressure shape.`;
    case TacticalActionType.KickPass:
      return `${input.decisionActorLabel} uses a kicked pass to access ${receiverText(input, "the receiver")} beyond the immediate pressure.`;
    case TacticalActionType.DefensiveClearance:
      return `${input.decisionActorLabel} clears the defensive pressure and moves the ball away from danger.`;
    case TacticalActionType.TurnoverRecovery:
      return `${input.decisionActorLabel} recovers the loose phase and becomes the first secure carrier.`;
  }

  return `${input.decisionActorLabel} executes ${input.selectedActionType}; ${receiverText(input, "the next carrier")} becomes responsible for the following phase.`;
}

export function forbiddenReasonTermsForActionType(actionType: TacticalActionType | string): readonly string[] {
  switch (actionType) {
    case TacticalActionType.ForwardProgress:
    case TacticalActionType.OffensiveConstructionPass:
      return ["pressure-escape recycle", "safe recycle", "safe reset"];
    case TacticalActionType.Shot:
      return ["recycle", "support cluster pass", "rebuild"];
    case TacticalActionType.SafeRecycle:
      return ["direct territorial progression", "attacks the weak-side rupture"];
    default:
      return [];
  }
}

export function validateActionSemanticReasonConsistency(input: {
  readonly selectedActionType: TacticalActionType | string;
  readonly reason: string;
}): ActionSemanticReasonValidation {
  const lowerReason = input.reason.toLowerCase();
  const forbiddenTerms = forbiddenReasonTermsForActionType(input.selectedActionType).filter((term) =>
    lowerReason.includes(term.toLowerCase()),
  );

  return {
    valid: forbiddenTerms.length === 0,
    forbiddenTerms,
  };
}
