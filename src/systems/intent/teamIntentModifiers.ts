import { TacticalStyle } from "../../models/tactics";
import { IntentType, type PlayerIntent } from "./intentTypes";

function styleModifier(style: TacticalStyle, type: IntentType): number {
  if (style === TacticalStyle.Control) {
    if ([IntentType.SupportBall, IntentType.SecureRecycle, IntentType.ProtectRestDefense, IntentType.ResetShape].includes(type)) {
      return 8;
    }
    if ([IntentType.AttackDepth, IntentType.ContestLooseBall].includes(type)) {
      return -6;
    }
  }

  if (style === TacticalStyle.Blitz) {
    if ([IntentType.AttackDepth, IntentType.AttackWeakSide, IntentType.AnticipateRebound, IntentType.ContestLooseBall, IntentType.PressBall].includes(type)) {
      return 10;
    }
    if ([IntentType.SecureRecycle, IntentType.ResetShape].includes(type)) {
      return -8;
    }
  }

  return 0;
}

export function applyTeamIntentModifier(intent: PlayerIntent, style: TacticalStyle): PlayerIntent {
  const modifier = styleModifier(style, intent.type);

  return {
    ...intent,
    priority: Math.max(0, Math.min(100, intent.priority + modifier)),
    tacticalReason: modifier === 0 ? intent.tacticalReason : `${intent.tacticalReason}; team philosophy ${modifier >= 0 ? "+" : ""}${modifier}`,
  };
}
