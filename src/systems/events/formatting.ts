import { PlayerRole } from "../../models/player";

export function formatEventRole(role: PlayerRole): string {
  switch (role) {
    case PlayerRole.LeftAnchor:
      return "Left Piston";
    case PlayerRole.RightAnchor:
      return "Right Piston";
    case PlayerRole.HookLink:
      return "Hook Link";
    case PlayerRole.MobileLock:
      return "Mobile Lock";
    case PlayerRole.ForwardLeader:
      return "Forward Leader";
    case PlayerRole.TempoHalf:
      return "Tempo Half";
    case PlayerRole.Playmaker:
      return "Playmaker";
    case PlayerRole.PowerRunner:
      return "Forward Leader";
    case PlayerRole.SpaceHunter:
      return "Space Hunter";
    case PlayerRole.FreeSafety:
      return "Free Safety";
    case PlayerRole.GoalkeeperFreeSafety:
      return "Goalkeeper / Free Safety";
    case PlayerRole.Pivot:
      return "Pivot";
    case PlayerRole.LeftPiston:
      return "Left Piston";
    case PlayerRole.RightPiston:
      return "Right Piston";
  }
}

export function formatEventParticipant(input: {
  readonly teamName?: string;
  readonly initials: string | null;
  readonly role: PlayerRole | null;
}): string {
  const roleLabel = input.role === null ? "unknown player" : formatEventRole(input.role);
  const prefix = input.teamName === undefined ? "" : `${input.teamName} `;
  const initials = input.initials === null ? "" : `${input.initials} / `;

  return `${prefix}${initials}${roleLabel}`;
}
