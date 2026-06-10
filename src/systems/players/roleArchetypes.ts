import { PlayerRole } from "../../models/player";
import { DERIVED_ROLE_MODIFIERS, NEUTRAL_DERIVED_ROLE_MODIFIERS, type RoleDerivedAttributeModifiers } from "./derived";

export interface PlayerRoleArchetype {
  readonly role: PlayerRole;
  readonly displayName: string;
  readonly initials: string;
  readonly tacticalIdentity: string;
  readonly behaviors: readonly string[];
  readonly derivedModifiers: RoleDerivedAttributeModifiers;
  readonly isGoalkeeper: boolean;
}

function archetype(input: Omit<PlayerRoleArchetype, "derivedModifiers"> & { readonly modifiers?: Partial<RoleDerivedAttributeModifiers> }): PlayerRoleArchetype {
  return {
    ...input,
    derivedModifiers: { ...NEUTRAL_DERIVED_ROLE_MODIFIERS, ...input.modifiers },
  };
}

export const ROLE_ARCHETYPES: Readonly<Record<PlayerRole, PlayerRoleArchetype>> = {
  [PlayerRole.TempoHalf]: archetype({
    role: PlayerRole.TempoHalf,
    displayName: "Tempo Half",
    initials: "TH",
    tacticalIdentity: "primary organizer, tempo control, pressure reading, structured progression",
    behaviors: ["tempo control", "support orientation", "pressure reading"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.TempoHalf],
  }),
  [PlayerRole.HookLink]: archetype({
    role: PlayerRole.HookLink,
    displayName: "Hook Link",
    initials: "HL",
    tacticalIdentity: "possession stabilizer, secure receiver, phase connector, contact survival",
    behaviors: ["secure receiver", "phase connector", "contact survival"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.HookLink],
  }),
  [PlayerRole.ForwardLeader]: archetype({
    role: PlayerRole.ForwardLeader,
    displayName: "Forward Leader",
    initials: "FL",
    tacticalIdentity: "structural support anchor, pod organizer, pressure screen, gain-line stabilizer",
    behaviors: ["pod organizer", "pressure screen", "gain-line stabilizer"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.ForwardLeader],
  }),
  [PlayerRole.GoalkeeperFreeSafety]: archetype({
    role: PlayerRole.GoalkeeperFreeSafety,
    displayName: "Goalkeeper / Free Safety",
    initials: "GK",
    tacticalIdentity: "goalkeeper, last-line protector, rebound controller, depth organizer",
    behaviors: ["goal frame protection", "aerial control", "rebound control", "long distribution"],
    isGoalkeeper: true,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.GoalkeeperFreeSafety],
  }),
  [PlayerRole.MobileLock]: archetype({
    role: PlayerRole.MobileLock,
    displayName: "Mobile Lock",
    initials: "ML",
    tacticalIdentity: "emergency cover defender, transition firefighter, lane closer, contact stopper",
    behaviors: ["lane closing", "emergency cover", "contact stopping"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.MobileLock],
  }),
  [PlayerRole.SpaceHunter]: archetype({
    role: PlayerRole.SpaceHunter,
    displayName: "Space Hunter",
    initials: "SH",
    tacticalIdentity: "selective vertical threat, weak-side runner, depth attacker",
    behaviors: ["weak-side run", "depth attack", "selective rupture"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.SpaceHunter],
  }),
  [PlayerRole.Playmaker]: archetype({
    role: PlayerRole.Playmaker,
    displayName: "Playmaker",
    initials: "PM",
    tacticalIdentity: "creative unlocker, third-man creator, controlled improviser, red-zone unlocker",
    behaviors: ["third-man creation", "red-zone unlock", "controlled improvisation"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.Playmaker],
  }),
  [PlayerRole.Pivot]: archetype({
    role: PlayerRole.Pivot,
    displayName: "Pivot",
    initials: "PV",
    tacticalIdentity: "central balance player, rest-defense organizer, structural hinge",
    behaviors: ["rest defense", "central support", "structural hinge"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.Pivot],
  }),
  [PlayerRole.LeftPiston]: archetype({
    role: PlayerRole.LeftPiston,
    displayName: "Left Piston",
    initials: "LP",
    tacticalIdentity: "left-side progression piston, width provider, short-side protection",
    behaviors: ["left width", "flank progression", "short-side cover"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.LeftPiston],
  }),
  [PlayerRole.RightPiston]: archetype({
    role: PlayerRole.RightPiston,
    displayName: "Right Piston",
    initials: "RP",
    tacticalIdentity: "right-side progression piston, width provider, open-side reception",
    behaviors: ["right width", "flank progression", "open-side reception"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.RightPiston],
  }),
  [PlayerRole.LeftAnchor]: archetype({
    role: PlayerRole.LeftAnchor,
    displayName: "Left Piston",
    initials: "LA",
    tacticalIdentity: "legacy left rest-defense anchor",
    behaviors: ["rest defense"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.LeftAnchor],
  }),
  [PlayerRole.RightAnchor]: archetype({
    role: PlayerRole.RightAnchor,
    displayName: "Right Piston",
    initials: "RA",
    tacticalIdentity: "legacy right rest-defense anchor",
    behaviors: ["rest defense"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.RightAnchor],
  }),
  [PlayerRole.PowerRunner]: archetype({
    role: PlayerRole.PowerRunner,
    displayName: "Forward Leader",
    initials: "PR",
    tacticalIdentity: "legacy power carrier and rupture runner",
    behaviors: ["carry", "contact", "rupture"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.PowerRunner],
  }),
  [PlayerRole.FreeSafety]: archetype({
    role: PlayerRole.FreeSafety,
    displayName: "Free Safety",
    initials: "FS",
    tacticalIdentity: "legacy last-line protector",
    behaviors: ["depth protection"],
    isGoalkeeper: false,
    modifiers: DERIVED_ROLE_MODIFIERS[PlayerRole.FreeSafety],
  }),
};

export function getRoleArchetype(role: PlayerRole): PlayerRoleArchetype {
  return ROLE_ARCHETYPES[role];
}
