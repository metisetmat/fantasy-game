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

export interface ControlRosterPlayer {
  readonly id: string;
  readonly teamId: PrototypeTeamId.Control;
  readonly displayName: string;
  readonly role: PlayerRole;
  readonly initials: string;
  readonly visibleAttributes: VisiblePlayerAttributes;
  readonly derivedAttributes: DerivedPlayerAttributes;
  readonly derivedAttributeDebug: readonly DerivedAttributeDebugEntry[];
  readonly isGoalkeeper: boolean;
}

const context = {
  tacticalStyle: TacticalStyle.Control,
  offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy.CollectiveStructuredProgression,
};

function player(input: {
  readonly id: string;
  readonly displayName: string;
  readonly role: PlayerRole;
  readonly initials: string;
  readonly visibleAttributes: VisiblePlayerAttributes;
}): ControlRosterPlayer {
  const archetype = getRoleArchetype(input.role);
  const derived = derivePlayerAttributesWithDebug({
    visible: input.visibleAttributes,
    role: input.role,
    context,
    isGoalkeeper: archetype.isGoalkeeper,
  });

  return {
    ...input,
    teamId: PrototypeTeamId.Control,
    derivedAttributes: derived.attributes,
    derivedAttributeDebug: derived.debug,
    isGoalkeeper: archetype.isGoalkeeper,
  };
}

export const CONTROL_ROSTER: readonly ControlRosterPlayer[] = [
  player({
    id: "control-tempo-half",
    displayName: "Tempo Half",
    role: PlayerRole.TempoHalf,
    initials: "TH",
    visibleAttributes: { speed: 62, power: 52, endurance: 84, handPlay: 90, footPlay: 82, ballCarrying: 66, vision: 97, composure: 97, creativity: 38 },
  }),
  player({
    id: "control-hook-link",
    displayName: "Hook Link",
    role: PlayerRole.HookLink,
    initials: "HL",
    visibleAttributes: { speed: 68, power: 78, endurance: 82, handPlay: 92, footPlay: 54, ballCarrying: 70, vision: 88, composure: 90, creativity: 42 },
  }),
  player({
    id: "control-forward-leader",
    displayName: "Forward Leader",
    role: PlayerRole.ForwardLeader,
    initials: "FL",
    visibleAttributes: { speed: 58, power: 88, endurance: 86, handPlay: 78, footPlay: 42, ballCarrying: 58, vision: 84, composure: 88, creativity: 30 },
  }),
  player({
    id: "control-goalkeeper-free-safety",
    displayName: "Goalkeeper / Free Safety",
    role: PlayerRole.GoalkeeperFreeSafety,
    initials: "GK",
    visibleAttributes: { speed: 64, power: 66, endurance: 78, handPlay: 86, footPlay: 88, ballCarrying: 54, vision: 92, composure: 94, creativity: 28 },
  }),
  player({
    id: "control-mobile-lock",
    displayName: "Mobile Lock",
    role: PlayerRole.MobileLock,
    initials: "ML",
    visibleAttributes: { speed: 72, power: 86, endurance: 84, handPlay: 72, footPlay: 50, ballCarrying: 68, vision: 78, composure: 82, creativity: 34 },
  }),
  player({
    id: "control-space-hunter",
    displayName: "Space Hunter",
    role: PlayerRole.SpaceHunter,
    initials: "SH",
    visibleAttributes: { speed: 84, power: 62, endurance: 78, handPlay: 76, footPlay: 62, ballCarrying: 82, vision: 80, composure: 78, creativity: 58 },
  }),
  player({
    id: "control-playmaker",
    displayName: "Playmaker",
    role: PlayerRole.Playmaker,
    initials: "PM",
    visibleAttributes: { speed: 76, power: 56, endurance: 76, handPlay: 88, footPlay: 78, ballCarrying: 84, vision: 92, composure: 86, creativity: 62 },
  }),
  player({
    id: "control-pivot",
    displayName: "Pivot",
    role: PlayerRole.Pivot,
    initials: "PV",
    visibleAttributes: { speed: 66, power: 74, endurance: 88, handPlay: 84, footPlay: 64, ballCarrying: 68, vision: 90, composure: 90, creativity: 34 },
  }),
  player({
    id: "control-left-piston",
    displayName: "Left Piston",
    role: PlayerRole.LeftPiston,
    initials: "LP",
    visibleAttributes: { speed: 74, power: 64, endurance: 84, handPlay: 80, footPlay: 68, ballCarrying: 76, vision: 84, composure: 84, creativity: 44 },
  }),
  player({
    id: "control-right-piston",
    displayName: "Right Piston",
    role: PlayerRole.RightPiston,
    initials: "RP",
    visibleAttributes: { speed: 74, power: 64, endurance: 84, handPlay: 80, footPlay: 68, ballCarrying: 76, vision: 84, composure: 84, creativity: 44 },
  }),
];

export const CONTROL_CALCULATED_VISIBLE_ATTRIBUTE_TOTAL = calculateVisibleAttributeTotal(CONTROL_ROSTER);
export const CONTROL_RAW_VISIBLE_ATTRIBUTE_TOTAL = 6594;

export function createControlPlayerStates(input: {
  readonly zones: readonly ZoneId[];
  readonly sequenceIndex: number;
}): readonly PlayerState[] {
  const fallbackZone = createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis);
  const freshness = Math.max(0, Math.min(100, 92 - input.sequenceIndex * 2));

  return CONTROL_ROSTER.map((rosterPlayer, index) => attachDefaultIntentState({
    tacticalStyle: TacticalStyle.Control,
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
    momentum: 54,
    },
  }));
}
