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
import type {
  MiniMatchContext,
  MiniMatchInput,
  MiniMatchSegmentInfluence,
  MiniMatchTeamSegmentInfluence,
  MiniMatchState,
} from "./types";

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

function influenceForTeam(
  influence: MiniMatchSegmentInfluence | undefined,
  team: PrototypeTeamDefinition,
): MiniMatchTeamSegmentInfluence | undefined {
  if (influence === undefined) {
    return undefined;
  }

  if (influence.home.teamId === team.id) {
    return influence.home;
  }

  if (influence.away.teamId === team.id) {
    return influence.away;
  }

  return undefined;
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
  influence: MiniMatchTeamSegmentInfluence | undefined,
): readonly PlayerState[] {
  if (team.id === PrototypeTeamId.Control) {
    return createControlPlayerStates({ zones, sequenceIndex }).map((player) => applyPlayerInfluence(player, influence));
  }

  if (team.id === PrototypeTeamId.Blitz) {
    return createBlitzPlayerStates({ zones, sequenceIndex }).map((player) => applyPlayerInfluence(player, influence));
  }

  const fallbackZone = createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis);
  const sequenceFreshnessAdjustment = sequenceIndex * 2;
  const freshness = clampRating(getBaseFreshness(team) - sequenceFreshnessAdjustment + (influence?.conditionModifier ?? 0));

  return STANDARD_ROLES.map((role, index) => applyPlayerInfluence({
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
  }, influence));
}

function applyPlayerInfluence(
  player: PlayerState,
  influence: MiniMatchTeamSegmentInfluence | undefined,
): PlayerState {
  if (influence === undefined) {
    return player;
  }

  const freshnessAdjustment = influence.conditionModifier + Math.round(influence.mentalFreshnessModifier / 2);

  return {
    ...player,
    fatigue: {
      accumulatedFatigue: clampRating(player.fatigue.accumulatedFatigue - freshnessAdjustment),
      freshness: clampRating(player.fatigue.freshness + freshnessAdjustment),
    },
    momentum: clampRating(player.momentum + influence.momentumModifier),
  };
}

function applyCollectiveInfluence<T extends {
  readonly cohesion: number;
  readonly defensiveTransition: number;
  readonly tacticalDiscipline: number;
  readonly collectiveReading: number;
  readonly resilience: number;
}>(
  properties: T,
  influence: MiniMatchTeamSegmentInfluence | undefined,
): T {
  if (influence === undefined) {
    return properties;
  }

  return {
    ...properties,
    cohesion: clampRating(properties.cohesion + influence.supportStabilityModifier),
    defensiveTransition: clampRating(
      properties.defensiveTransition - Math.max(0, influence.defensiveStressModifier),
    ),
    tacticalDiscipline: clampRating(properties.tacticalDiscipline + influence.finalActionComposureModifier),
    collectiveReading: clampRating(properties.collectiveReading + influence.supportStabilityModifier),
    resilience: clampRating(
      properties.resilience + influence.mentalFreshnessModifier - Math.max(0, influence.pressureLoadModifier),
    ),
  };
}

function getCollectiveProperties(
  team: PrototypeTeamDefinition,
  influence: MiniMatchTeamSegmentInfluence | undefined,
): PrototypeTeamDefinition["collectiveProperties"] {
  const roster =
    team.id === PrototypeTeamId.Control ? CONTROL_ROSTER : team.id === PrototypeTeamId.Blitz ? BLITZ_ROSTER : null;

  if (roster === null) {
    return applyCollectiveInfluence(team.collectiveProperties, influence);
  }

  const profile = deriveTeamProfileFromRoster({
    roster,
    instructions: team.tacticalInstructions,
    baseCollective: team.collectiveProperties,
    finishingIdentity: team.id === PrototypeTeamId.Blitz ? "CHAOTIC_AGGRESSION" : "CONTROLLED_EXECUTION",
  });
  const baseProperties: PrototypeTeamDefinition["collectiveProperties"] = {
    ...team.collectiveProperties,
    cohesion: profile.cohesion,
    defensiveTransition: profile.recoveryStructure,
    collectiveMobility: Math.round((profile.recoveryStructure + team.collectiveProperties.collectiveMobility) / 2),
    tacticalDiscipline: profile.tacticalDiscipline,
    collectiveReading: profile.supportQuality,
    resilience: Math.round((profile.defensiveCompactness + team.collectiveProperties.resilience) / 2),
  };

  return applyCollectiveInfluence(baseProperties, influence);
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
    ...(input.segmentInfluence === undefined ? {} : { segmentInfluence: input.segmentInfluence }),
    ...(input.spatialContext === undefined ? {} : { spatialContext: input.spatialContext }),
    ...(input.routeRankingAttributeMode === undefined ? {} : { routeRankingAttributeMode: input.routeRankingAttributeMode }),
    ...(input.routeSelectionSource === undefined ? {} : { routeSelectionSource: input.routeSelectionSource }),
    ...(input.routeSelectionWorkbench === undefined ? {} : { routeSelectionWorkbench: input.routeSelectionWorkbench }),
  };
  const influenceAverage = input.segmentInfluence === undefined
    ? 0
    : Math.round((input.segmentInfluence.home.supportStabilityModifier + input.segmentInfluence.away.supportStabilityModifier) / 2);
  const pressureAverage = input.segmentInfluence === undefined
    ? 0
    : Math.round((input.segmentInfluence.home.pressureLoadModifier + input.segmentInfluence.away.pressureLoadModifier) / 2);

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
      lastTerritorialPressure: clampRating(44 + pressureAverage + (input.segmentInfluence?.global.matchTempoAdjustment ?? 0)),
      lastChaosLevel: clampRating(38 + Math.max(0, pressureAverage) + (input.segmentInfluence?.global.repeatedPatternPressure ?? 0)),
      lastDangerLevel: "MEDIUM",
      lastPossessionReason: input.segmentInfluence === undefined
        ? input.spatialContext === undefined
          ? "initial mini-match setup"
          : `initial mini-match setup with spatial context active from ${input.spatialContext.sourceWorkbenchFrameId ?? "typed adapter"}`
        : `segment influence active with support stability ${influenceAverage} and pattern pressure ${input.segmentInfluence.global.repeatedPatternPressure}`,
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
  segmentInfluence?: MiniMatchSegmentInfluence,
): SpatialTeamContext {
  const teamInfluence = influenceForTeam(segmentInfluence, team);

  return {
    teamId: team.id,
    teamName: team.displayName,
    tacticalStyle: team.tacticalStyle,
    offensiveProgressionPhilosophy: team.offensiveProgressionPhilosophy,
    players: createPrototypePlayers(team, zones, sequenceIndex, teamInfluence),
    tacticalInstructions: team.tacticalInstructions,
    collectiveProperties: getCollectiveProperties(team, teamInfluence),
    structuralShiftDelay: getStructuralShiftDelay(team, sequenceIndex),
    recoverySaturation,
    offensiveMomentum,
  };
}
