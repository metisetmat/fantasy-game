import { createZoneId, LateralCorridor, LongitudinalZone, type ZoneId } from "../../core/zones";
import { PrototypeTeamId, type PrototypeTeamDefinition } from "../../data/prototypeTeams";
import { PressureLevel } from "../../models/match";
import {
  calculateDefensiveOccupation,
  calculateDensityValues,
  calculateOffensiveOccupation,
  evaluateDefensiveCompactness,
  evaluateOffensiveSpread,
  evaluateWeakSideExposure,
  generateDefensiveShape,
  generateOffensiveShape,
  type SpatialTeamContext,
} from "../../systems/spatial";
import {
  createBallContext,
  getTeamAttackingDirection,
} from "../../systems/spatial/intention";
import { SequenceInteractionKind, SequenceLevel, type SequenceSpatialSnapshot } from "../../systems/sequences";
import { TacticalPhaseState } from "../../systems/tacticalState";
import { createDeterministicSeed, seededRandom } from "../../systems/matchLoop";
import { createMiniMatchTeamContext } from "./createMiniMatchContext";
import type { MiniMatchSequenceSetup, MiniMatchState } from "./types";

const ACTIVE_ZONE_CYCLE: readonly ZoneId[] = [
  createZoneId(LongitudinalZone.Midfield, LateralCorridor.LeftHalfSpace),
  createZoneId(LongitudinalZone.Midfield, LateralCorridor.RightHalfSpace),
  createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.CentralAxis),
  createZoneId(LongitudinalZone.BuildOut, LateralCorridor.LeftHalfSpace),
  createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.RightCorridor),
  createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis),
];

function getCycleValue<T>(values: readonly T[], index: number): T {
  const value = values[index % values.length];
  if (value === undefined) {
    throw new Error("Mini-match setup cycle cannot be empty.");
  }

  return value;
}

function createPossessionZones(sequenceIndex: number): readonly ZoneId[] {
  const leftBias = sequenceIndex % 2 === 0;
  const wideCorridor = leftBias ? LateralCorridor.LeftCorridor : LateralCorridor.RightCorridor;
  const halfSpace = leftBias ? LateralCorridor.LeftHalfSpace : LateralCorridor.RightHalfSpace;
  const farCorridor = leftBias ? LateralCorridor.RightCorridor : LateralCorridor.LeftCorridor;

  return [
    createZoneId(LongitudinalZone.BuildOut, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.Midfield, halfSpace),
    createZoneId(LongitudinalZone.BuildOut, halfSpace),
    createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.Midfield, wideCorridor),
    createZoneId(LongitudinalZone.OffensivePressure, halfSpace),
    createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.OffensivePressure, farCorridor),
    createZoneId(LongitudinalZone.DeepDefense, LateralCorridor.CentralAxis),
  ];
}

function createPressingZones(sequenceIndex: number): readonly ZoneId[] {
  const rightBias = sequenceIndex % 2 === 0;
  const strongHalfSpace = rightBias ? LateralCorridor.RightHalfSpace : LateralCorridor.LeftHalfSpace;
  const strongCorridor = rightBias ? LateralCorridor.RightCorridor : LateralCorridor.LeftCorridor;
  const weakCorridor = rightBias ? LateralCorridor.LeftCorridor : LateralCorridor.RightCorridor;

  return [
    createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.Midfield, strongHalfSpace),
    createZoneId(LongitudinalZone.OffensivePressure, strongCorridor),
    createZoneId(LongitudinalZone.Midfield, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.OffensivePressure, LateralCorridor.CentralAxis),
    createZoneId(LongitudinalZone.Midfield, strongHalfSpace),
    createZoneId(LongitudinalZone.OffensivePressure, strongHalfSpace),
    createZoneId(LongitudinalZone.Midfield, weakCorridor),
    createZoneId(LongitudinalZone.OffensivePressure, weakCorridor),
    createZoneId(LongitudinalZone.DeepDefense, LateralCorridor.CentralAxis),
  ];
}

function createSpatialSnapshot(
  offensiveTeam: SpatialTeamContext,
  defensiveTeam: SpatialTeamContext,
): SequenceSpatialSnapshot {
  const offensiveShape = generateOffensiveShape(offensiveTeam);
  const defensiveShape = generateDefensiveShape(defensiveTeam);
  const offensiveOccupation = calculateOffensiveOccupation(offensiveTeam, offensiveShape);
  const defensiveOccupation = calculateDefensiveOccupation(defensiveTeam, defensiveShape);
  const density = calculateDensityValues(offensiveOccupation, defensiveOccupation);

  return {
    offensiveShape,
    defensiveShape,
    density,
    offensiveSpread: evaluateOffensiveSpread(offensiveShape),
    defensiveCompactness: evaluateDefensiveCompactness(defensiveShape, defensiveOccupation),
    weakSide: evaluateWeakSideExposure(density),
  };
}

function selectPossessionTeam(
  state: MiniMatchState,
  sequenceIndex: number,
): PrototypeTeamDefinition {
  if (state.continuity.lastPossessionTeamId !== null) {
    return state.continuity.lastPossessionTeamId === state.context.teamA.id
      ? state.context.teamA
      : state.context.teamB;
  }

  const roll = seededRandom(createDeterministicSeed(state.context.seed + sequenceIndex));

  return roll.value < 0.5 ? state.context.teamA : state.context.teamB;
}

function describePossessionReason(state: MiniMatchState, possessionTeam: PrototypeTeamDefinition, sequenceIndex: number): string {
  if (state.continuity.lastPossessionTeamId === null) {
    return `${possessionTeam.displayName} starts with the ball by mini-match setup.`;
  }

  if (state.continuity.lastPossessionTeamId === possessionTeam.id) {
    if (!state.continuity.lastPossessionReason.includes("retained")) {
      return `${possessionTeam.displayName} receives possession because ${state.continuity.lastPossessionReason}.`;
    }

    return `${possessionTeam.displayName} keeps possession from the previous sequence.`;
  }

  return `${possessionTeam.displayName} receives possession because ${state.continuity.lastPossessionReason}.`;
}

function selectPressingTeam(
  state: MiniMatchState,
  possessionTeam: PrototypeTeamDefinition,
): PrototypeTeamDefinition {
  return possessionTeam.id === state.context.teamA.id ? state.context.teamB : state.context.teamA;
}

function selectPressureLevel(pressingTeam: PrototypeTeamDefinition, sequenceIndex: number): PressureLevel {
  if (pressingTeam.id === PrototypeTeamId.Blitz || pressingTeam.id === PrototypeTeamId.ChaosHunters) {
    return sequenceIndex % 3 === 1 ? PressureLevel.Medium : PressureLevel.High;
  }

  return sequenceIndex % 2 === 0 ? PressureLevel.Medium : PressureLevel.Low;
}

function getRecoverySaturationForTeam(state: MiniMatchState, team: PrototypeTeamDefinition) {
  return team.id === state.context.teamA.id ? state.recoverySaturation.teamA : state.recoverySaturation.teamB;
}

function getOffensiveMomentumForTeam(state: MiniMatchState, team: PrototypeTeamDefinition) {
  return team.id === state.context.teamA.id ? state.offensiveMomentum.teamA : state.offensiveMomentum.teamB;
}

function createOpeningLine(possessionTeam: PrototypeTeamDefinition, pressingTeam: PrototypeTeamDefinition): string {
  if (possessionTeam.id === PrototypeTeamId.Control) {
    return `${possessionTeam.displayName} attempts structured build-up.`;
  }

  if (possessionTeam.id === PrototypeTeamId.Blitz) {
    return `${possessionTeam.displayName} tries to turn possession into immediate territory.`;
  }

  return `${possessionTeam.displayName} starts a tactical sequence under pressure from ${pressingTeam.displayName}.`;
}

export function selectInitialSequenceContext(
  state: MiniMatchState,
  sequenceIndex: number,
): MiniMatchSequenceSetup {
  const possessionTeamDefinition = selectPossessionTeam(state, sequenceIndex);
  const pressingTeamDefinition = selectPressingTeam(state, possessionTeamDefinition);
  const activeZone = state.continuity.lastBallContext?.ballLocation ?? getCycleValue(ACTIVE_ZONE_CYCLE, sequenceIndex);
  const possessionTeam = createMiniMatchTeamContext(
    possessionTeamDefinition,
    createPossessionZones(sequenceIndex),
    sequenceIndex,
    getRecoverySaturationForTeam(state, possessionTeamDefinition),
    getOffensiveMomentumForTeam(state, possessionTeamDefinition),
  );
  const pressingTeam = createMiniMatchTeamContext(
    pressingTeamDefinition,
    createPressingZones(sequenceIndex),
    sequenceIndex,
    getRecoverySaturationForTeam(state, pressingTeamDefinition),
    getOffensiveMomentumForTeam(state, pressingTeamDefinition),
  );
  const pressureLevel = selectPressureLevel(pressingTeamDefinition, sequenceIndex);
  const attackingDirection = getTeamAttackingDirection(
    possessionTeam.teamId,
    state.context.attackingDirections,
  );
  const previousCarrierRole = state.continuity.lastBallContext?.ballCarrierRole;
  const ballContext =
    previousCarrierRole === undefined
      ? createBallContext({
          team: possessionTeam,
          ballLocation: activeZone,
          attackingDirection,
        })
      : createBallContext({
          team: possessionTeam,
          ballLocation: activeZone,
          attackingDirection,
          ballCarrierRole: previousCarrierRole,
        });
  const snapshot = createSpatialSnapshot(possessionTeam, pressingTeam);
  const startTick = state.context.startTick + sequenceIndex * 10;

  return {
    sequenceNumber: sequenceIndex + 1,
    possessionTeam,
    pressingTeam,
    activeZone,
    pressureDescription: pressureLevel.toUpperCase(),
    openingLine: createOpeningLine(possessionTeamDefinition, pressingTeamDefinition),
    possessionReason: describePossessionReason(state, possessionTeamDefinition, sequenceIndex),
    resolveInput: {
      startTick,
      teams: {
        possessionTeam,
        pressingTeam,
      },
      ballContext,
      initialContext: {
        chaosLevel: Math.max(20, Math.min(90, state.continuity.lastChaosLevel + (sequenceIndex % 3) * 6)),
        possessionStability: SequenceLevel.Medium,
        territorialPressure: Math.max(20, Math.min(90, state.continuity.lastTerritorialPressure + (sequenceIndex % 2) * 8)),
        currentDanger: SequenceLevel.Medium,
        activeZone,
        sequenceMomentum: 50 + (sequenceIndex % 2) * 6,
        weakSideExposure: SequenceLevel.Medium,
        currentInteraction: SequenceInteractionKind.BuildUpUnderPressure,
        pressureLevel,
        tacticalPhaseState: TacticalPhaseState.StablePossession,
      },
      initialSpatial: snapshot,
      transitionSpatial: snapshot,
      constructionSpatial: snapshot,
      finishingSpatial: snapshot,
      tacticalMemory: state.tacticalMemory,
    },
  };
}
