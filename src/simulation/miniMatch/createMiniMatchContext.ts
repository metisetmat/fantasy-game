import type { ZoneId } from "../../core/zones";
import { createZoneId, LateralCorridor, LongitudinalZone } from "../../core/zones";
import { PrototypeTeamId, type PrototypeTeamDefinition } from "../../data/prototypeTeams";
import {
  BLITZ_ROSTER,
  CONTROL_ROSTER,
  createBlitzPlayerStates,
  createControlPlayerStates,
  validateBlitzRoster,
  validateControlRoster,
} from "../../data/teams";
import { PlayerRole, type PlayerAttributes, type PlayerState } from "../../models/player";
import { deriveTeamProfileFromRoster } from "../../systems/teams";
import type { SpatialTeamContext } from "../../systems/spatial";
import { assignMiniMatchAttackingDirections } from "../../systems/spatial/intention";
import { createTacticalMemory } from "../../systems/tacticalMemory";
import { createInitialRecoverySaturation, type RecoverySaturationState } from "../../systems/structure";
import { createInitialOffensiveMomentum, type OffensiveMomentumState } from "../../systems/offense/momentum";
import { DEFAULT_SIMULATION_CONFIG } from "../../systems/matchLoop";
import type { MiniMatchContext, MiniMatchInput, MiniMatchState } from "./types";

const STANDARD_ROLES: readonly PlayerRole[] = [
  PlayerRole.LeftAnchor,
  PlayerRole.RightAnchor,
  PlayerRole.HookLink,
  PlayerRole.MobileLock,
  PlayerRole.ForwardLeader,
  PlayerRole.TempoHalf,
  PlayerRole.Playmaker,
  PlayerRole.PowerRunner,
  PlayerRole.SpaceHunter,
  PlayerRole.FreeSafety,
];

function clampRating(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createAttributes(base: number): PlayerAttributes {
  return {
    speed: base,
    agility: base,
    endurance: base,
    power: base,
    handPlay: base,
    footPlayDribble: base,
    footPlayPassingShooting: base,
    intelligence: base,
    mental: base,
  };
}

function getRoleAttributeBase(team: PrototypeTeamDefinition, role: PlayerRole): number {
  if (team.id === PrototypeTeamId.Control && (role === PlayerRole.TempoHalf || role === PlayerRole.HookLink)) {
    return 95;
  }

  if (team.id === PrototypeTeamId.Control && (role === PlayerRole.FreeSafety || role === PlayerRole.Playmaker)) {
    return 88;
  }

  if (
    team.id === PrototypeTeamId.Blitz &&
    (role === PlayerRole.MobileLock || role === PlayerRole.SpaceHunter || role === PlayerRole.PowerRunner)
  ) {
    return 84;
  }

  if (role === PlayerRole.FreeSafety || role === PlayerRole.Playmaker) {
    return 74;
  }

  return 68;
}

function getBaseFreshness(team: PrototypeTeamDefinition): number {
  if (team.id === PrototypeTeamId.Blitz) {
    return 72;
  }

  if (team.id === PrototypeTeamId.ChaosHunters) {
    return 76;
  }

  return 90;
}

function createPrototypePlayers(
  team: PrototypeTeamDefinition,
  zones: readonly ZoneId[],
  sequenceIndex: number,
): readonly PlayerState[] {
  if (team.id === PrototypeTeamId.Control) {
    return createControlPlayerStates({ zones, sequenceIndex });
  }

  if (team.id === PrototypeTeamId.Blitz) {
    return createBlitzPlayerStates({ zones, sequenceIndex });
  }

  const fallbackZone = createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis);
  const sequenceFreshnessAdjustment = sequenceIndex * 2;
  const freshness = clampRating(getBaseFreshness(team) - sequenceFreshnessAdjustment);

  return STANDARD_ROLES.map((role, index) => ({
    id: `${team.id}-${role}`,
    teamId: team.id,
    name: `${team.displayName} ${role}`,
    role,
    attributes: createAttributes(getRoleAttributeBase(team, role)),
    fatigue: {
      accumulatedFatigue: clampRating(100 - freshness),
      freshness,
    },
    currentZone: zones[index] ?? zones[0] ?? fallbackZone,
    momentum: 50,
  }));
}

function getCollectiveProperties(team: PrototypeTeamDefinition) {
  const roster =
    team.id === PrototypeTeamId.Control ? CONTROL_ROSTER : team.id === PrototypeTeamId.Blitz ? BLITZ_ROSTER : null;

  if (roster === null) {
    return team.collectiveProperties;
  }

  const profile = deriveTeamProfileFromRoster({
    roster,
    instructions: team.tacticalInstructions,
    baseCollective: team.collectiveProperties,
    finishingIdentity: team.id === PrototypeTeamId.Blitz ? "CHAOTIC_AGGRESSION" : "CONTROLLED_EXECUTION",
  });

  return {
    ...team.collectiveProperties,
    cohesion: profile.cohesion,
    defensiveTransition: profile.recoveryStructure,
    collectiveMobility: Math.round((profile.recoveryStructure + team.collectiveProperties.collectiveMobility) / 2),
    tacticalDiscipline: profile.tacticalDiscipline,
    collectiveReading: profile.supportQuality,
    resilience: Math.round((profile.defensiveCompactness + team.collectiveProperties.resilience) / 2),
  };
}

function getStructuralShiftDelay(team: PrototypeTeamDefinition, sequenceIndex: number): number {
  if (team.id === PrototypeTeamId.Blitz) {
    return clampRating(32 + sequenceIndex * 4);
  }

  if (team.id === PrototypeTeamId.Control) {
    return 10;
  }

  return 18;
}

export function createMiniMatchContext(input: MiniMatchInput): MiniMatchState {
  const controlRosterValidation = validateControlRoster();
  const blitzRosterValidation = validateBlitzRoster();

  if (!controlRosterValidation.valid) {
    throw new Error(`CONTROL roster validation failed: ${controlRosterValidation.warnings.join("; ")}`);
  }

  if (!blitzRosterValidation.valid) {
    throw new Error(`BLITZ roster validation failed: ${blitzRosterValidation.warnings.join("; ")}`);
  }

  const context: MiniMatchContext = {
    teamA: input.teamA,
    teamB: input.teamB,
    requestedSequences: Math.max(1, Math.min(8, Math.round(input.numberOfSequences))),
    startTick: input.startTick ?? 10,
    seed: input.seed ?? DEFAULT_SIMULATION_CONFIG.seed,
    attackingDirections: assignMiniMatchAttackingDirections({
      teamAId: input.teamA.id,
      teamBId: input.teamB.id,
    }),
  };

  return {
    context,
    score: {
      teamA: 0,
      teamB: 0,
    },
    records: [],
    scoringEvents: [],
    liveTryEvents: [],
    finishingOpportunities: {
      teamA: 0,
      teamB: 0,
    },
    secondChanceCount: {
      teamA: 0,
      teamB: 0,
    },
    turnovers: {
      teamA: 0,
      teamB: 0,
    },
    continuity: {
      lastBallContext: null,
      lastPossessionTeamId: null,
      lastTerritorialPressure: 44,
      lastChaosLevel: 38,
      lastDangerLevel: "MEDIUM",
      lastPossessionReason: "initial mini-match setup",
    },
    tacticalMemory: createTacticalMemory([input.teamA.id, input.teamB.id]),
    recoverySaturation: {
      teamA: createInitialRecoverySaturation(input.teamA.id),
      teamB: createInitialRecoverySaturation(input.teamB.id),
    },
    offensiveMomentum: {
      teamA: createInitialOffensiveMomentum(input.teamA.id),
      teamB: createInitialOffensiveMomentum(input.teamB.id),
    },
  };
}

export function createMiniMatchTeamContext(
  team: PrototypeTeamDefinition,
  zones: readonly ZoneId[],
  sequenceIndex: number,
  recoverySaturation: RecoverySaturationState,
  offensiveMomentum: OffensiveMomentumState,
): SpatialTeamContext {
  return {
    teamId: team.id,
    teamName: team.displayName,
    tacticalStyle: team.tacticalStyle,
    offensiveProgressionPhilosophy: team.offensiveProgressionPhilosophy,
    players: createPrototypePlayers(team, zones, sequenceIndex),
    tacticalInstructions: team.tacticalInstructions,
    collectiveProperties: getCollectiveProperties(team),
    structuralShiftDelay: getStructuralShiftDelay(team, sequenceIndex),
    recoverySaturation,
    offensiveMomentum,
  };
}
