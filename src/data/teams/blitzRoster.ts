import { PrototypeTeamId } from "../prototypeTeams";
import { PlayerRole, type PlayerState } from "../../models/player";
import { TacticalStyle, OffensiveProgressionPhilosophy } from "../../models/tactics";
import { createZoneId, LateralCorridor, LongitudinalZone, type ZoneId } from "../../core/zones";
import {
  calculateVisibleAttributeTotal,
  toLegacyPlayerAttributes,
  type VisiblePlayerAttributes,
} from "../../systems/players/visibleAttributes";
import {
  derivePlayerAttributesWithDebug,
  type DerivedPlayerAttributes,
  type DerivedAttributeDebugEntry,
} from "../../systems/players/derived";
import { getRoleArchetype } from "../../systems/players/roleArchetypes";
import { attachDefaultIntentState } from "../../systems/intent";

export interface BlitzRosterPlayer {
  readonly id: string;
  readonly teamId: PrototypeTeamId.Blitz;
  readonly displayName: string;
  readonly role: PlayerRole;
  readonly initials: string;
  readonly visibleAttributes: VisiblePlayerAttributes;
  readonly derivedAttributes: DerivedPlayerAttributes;
  readonly derivedAttributeDebug: readonly DerivedAttributeDebugEntry[];
  readonly isGoalkeeper: boolean;
}

const context = {
  tacticalStyle: TacticalStyle.Blitz,
  offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy.LongPlayLineBreaking,
};

function player(input: {
  readonly id: string;
  readonly displayName: string;
  readonly role: PlayerRole;
  readonly initials: string;
  readonly visibleAttributes: VisiblePlayerAttributes;
}): BlitzRosterPlayer {
  const archetype = getRoleArchetype(input.role);
  const derived = derivePlayerAttributesWithDebug({
    visible: input.visibleAttributes,
    role: input.role,
    context,
    isGoalkeeper: archetype.isGoalkeeper,
  });

  return {
    ...input,
    teamId: PrototypeTeamId.Blitz,
    derivedAttributes: derived.attributes,
    derivedAttributeDebug: derived.debug,
    isGoalkeeper: archetype.isGoalkeeper,
  };
}

export const BLITZ_ROSTER: readonly BlitzRosterPlayer[] = [
  player({
    id: "blitz-tempo-half",
    displayName: "Tempo Half",
    role: PlayerRole.TempoHalf,
    initials: "TH",
    visibleAttributes: { speed: 76, power: 58, endurance: 78, handPlay: 82, footPlay: 86, ballCarrying: 78, vision: 84, composure: 66, creativity: 78 },
  }),
  player({
    id: "blitz-hook-link",
    displayName: "Hook Link",
    role: PlayerRole.HookLink,
    initials: "HL",
    visibleAttributes: { speed: 74, power: 76, endurance: 76, handPlay: 80, footPlay: 62, ballCarrying: 78, vision: 72, composure: 62, creativity: 72 },
  }),
  player({
    id: "blitz-forward-leader",
    displayName: "Forward Leader",
    role: PlayerRole.ForwardLeader,
    initials: "FL",
    visibleAttributes: { speed: 68, power: 88, endurance: 78, handPlay: 70, footPlay: 48, ballCarrying: 66, vision: 68, composure: 58, creativity: 64 },
  }),
  player({
    id: "blitz-goalkeeper-free-safety",
    displayName: "Goalkeeper / Free Safety",
    role: PlayerRole.GoalkeeperFreeSafety,
    initials: "GK",
    visibleAttributes: { speed: 78, power: 64, endurance: 72, handPlay: 78, footPlay: 92, ballCarrying: 66, vision: 82, composure: 68, creativity: 70 },
  }),
  player({
    id: "blitz-mobile-lock",
    displayName: "Mobile Lock",
    role: PlayerRole.MobileLock,
    initials: "ML",
    visibleAttributes: { speed: 84, power: 82, endurance: 82, handPlay: 66, footPlay: 54, ballCarrying: 74, vision: 66, composure: 58, creativity: 68 },
  }),
  player({
    id: "blitz-space-hunter",
    displayName: "Space Hunter",
    role: PlayerRole.SpaceHunter,
    initials: "SH",
    visibleAttributes: { speed: 94, power: 64, endurance: 76, handPlay: 72, footPlay: 72, ballCarrying: 92, vision: 70, composure: 56, creativity: 88 },
  }),
  player({
    id: "blitz-playmaker",
    displayName: "Playmaker",
    role: PlayerRole.Playmaker,
    initials: "PM",
    visibleAttributes: { speed: 82, power: 54, endurance: 72, handPlay: 84, footPlay: 88, ballCarrying: 88, vision: 86, composure: 62, creativity: 92 },
  }),
  player({
    id: "blitz-pivot",
    displayName: "Pivot",
    role: PlayerRole.Pivot,
    initials: "PV",
    visibleAttributes: { speed: 72, power: 72, endurance: 80, handPlay: 72, footPlay: 68, ballCarrying: 70, vision: 72, composure: 64, creativity: 66 },
  }),
  player({
    id: "blitz-left-piston",
    displayName: "Left Piston",
    role: PlayerRole.LeftPiston,
    initials: "LP",
    visibleAttributes: { speed: 88, power: 62, endurance: 78, handPlay: 70, footPlay: 76, ballCarrying: 86, vision: 68, composure: 56, creativity: 82 },
  }),
  player({
    id: "blitz-right-piston",
    displayName: "Right Piston",
    role: PlayerRole.RightPiston,
    initials: "RP",
    visibleAttributes: { speed: 88, power: 62, endurance: 78, handPlay: 70, footPlay: 76, ballCarrying: 86, vision: 68, composure: 56, creativity: 82 },
  }),
];

export const BLITZ_CALCULATED_VISIBLE_ATTRIBUTE_TOTAL = calculateVisibleAttributeTotal(BLITZ_ROSTER);
export const BLITZ_RAW_VISIBLE_ATTRIBUTE_TOTAL = 6610;

export function createBlitzPlayerStates(input: {
  readonly zones: readonly ZoneId[];
  readonly sequenceIndex: number;
}): readonly PlayerState[] {
  const fallbackZone = createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis);
  const freshness = Math.max(0, Math.min(100, 82 - input.sequenceIndex * 4));

  return BLITZ_ROSTER.map((rosterPlayer, index) => attachDefaultIntentState({
    tacticalStyle: TacticalStyle.Blitz,
    tick: input.sequenceIndex * 10,
    player: {
    id: rosterPlayer.id,
    teamId: rosterPlayer.teamId,
    name: rosterPlayer.displayName,
    role: rosterPlayer.role,
    attributes: toLegacyPlayerAttributes(rosterPlayer.visibleAttributes),
    visibleAttributes: rosterPlayer.visibleAttributes,
    derivedAttributes: rosterPlayer.derivedAttributes,
    roleInitials: rosterPlayer.initials,
    isGoalkeeper: rosterPlayer.isGoalkeeper,
    fatigue: {
      accumulatedFatigue: 100 - freshness,
      freshness,
    },
    currentZone: input.zones[index] ?? input.zones[0] ?? fallbackZone,
    momentum: 58,
    },
  }));
}
