import type { PlayerState } from "../../models/player";

export function getIntentAbbreviation(intentType: string | undefined): string {
  switch (intentType) {
    case "ATTACK_DEPTH":
      return "AD";
    case "SUPPORT_BALL":
      return "SB";
    case "PROTECT_REST_DEFENSE":
      return "PRD";
    case "ANTICIPATE_REBOUND":
      return "AR";
    case "PREPARE_FINISH":
      return "PF";
    case "PRESS_BALL":
      return "PB";
    case "ORGANIZE_TEMPO":
      return "OT";
    case "OCCUPY_WIDTH":
      return "OW";
    case "RECOVER_STRUCTURE":
      return "RS";
    case "PROTECT_FRAME":
      return "PFM";
    default:
      return "HP";
  }
}

export function formatIntentTrace(players: readonly PlayerState[]): readonly string[] {
  return players.map((player) => {
    const primary = player.primaryIntent;

    return `${player.roleInitials ?? player.role} — ${primary?.type ?? "NONE"}, age ${player.intentAgeTicks ?? 0} ticks, priority ${primary?.priority ?? 0}, reason: ${player.intentOriginReason ?? "no active intent"}`;
  });
}
