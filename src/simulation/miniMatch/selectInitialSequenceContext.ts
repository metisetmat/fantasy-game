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
import type { MiniMatchSequenceSetup, MiniMatchState, MiniMatchTeamSegmentInfluence } from "./types";

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

function clampContextRating(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function influenceForTeam(
  state: MiniMatchState,
  team: PrototypeTeamDefinition,
): MiniMatchTeamSegmentInfluence | undefined {
  const influence = state.context.segmentInfluence;

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

function sequenceLevelFromModifier(modifier: number): SequenceLevel {
  if (modifier >= 3) {
    return SequenceLevel.High;
  }

  if (modifier <= -3) {
    return SequenceLevel.Low;
  }

  return SequenceLevel.Medium;
}

function adjustPressureLevel(
  base: PressureLevel,
  influence: MiniMatchTeamSegmentInfluence | undefined,
): PressureLevel {
  const pressureModifier = influence?.pressureLoadModifier ?? 0;
  const defensiveStressModifier = influence?.defensiveStressModifier ?? 0;
  const combined = pressureModifier + Math.max(0, defensiveStressModifier);

  if (combined >= 4 && base === PressureLevel.Low) {
    return PressureLevel.Medium;
  }

  if (combined >= 6 && base === PressureLevel.Medium) {
    return PressureLevel.High;
  }

  if (combined <= -4 && base === PressureLevel.High) {
    return PressureLevel.Medium;
  }

  return base;
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
  const possessionInfluence = influenceForTeam(state, possessionTeamDefinition);
  const pressingInfluence = influenceForTeam(state, pressingTeamDefinition);
  const globalInfluence = state.context.segmentInfluence?.global;
  const activeZone = state.continuity.lastBallContext?.ballLocation ?? getCycleValue(ACTIVE_ZONE_CYCLE, sequenceIndex);
  const possessionTeam = createMiniMatchTeamContext(
    possessionTeamDefinition,
    createPossessionZones(sequenceIndex),
    sequenceIndex,
    getRecoverySaturationForTeam(state, possessionTeamDefinition),
    getOffensiveMomentumForTeam(state, possessionTeamDefinition),
    state.context.segmentInfluence,
  );
  const pressingTeam = createMiniMatchTeamContext(
    pressingTeamDefinition,
    createPressingZones(sequenceIndex),
    sequenceIndex,
    getRecoverySaturationForTeam(state, pressingTeamDefinition),
    getOffensiveMomentumForTeam(state, pressingTeamDefinition),
    state.context.segmentInfluence,
  );
  const pressureLevel = adjustPressureLevel(
    selectPressureLevel(pressingTeamDefinition, sequenceIndex),
    pressingInfluence,
  );
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
        chaosLevel: clampContextRating(
          state.continuity.lastChaosLevel +
            (sequenceIndex % 3) * 6 +
            (globalInfluence?.repeatedPatternPressure ?? 0) +
            Math.max(0, pressingInfluence?.defensiveStressModifier ?? 0),
        ),
        possessionStability: sequenceLevelFromModifier(possessionInfluence?.supportStabilityModifier ?? 0),
        territorialPressure: clampContextRating(
          state.continuity.lastTerritorialPressure +
            (sequenceIndex % 2) * 8 +
            (globalInfluence?.matchTempoAdjustment ?? 0) * 2 +
            Math.max(0, pressingInfluence?.pressureLoadModifier ?? 0) * 2,
        ),
        currentDanger: sequenceLevelFromModifier(
          (possessionInfluence?.routeRiskModifier ?? 0) +
            (possessionInfluence?.finalActionComposureModifier ?? 0) +
            (globalInfluence?.conversionVolatilityAdjustment ?? 0),
        ),
        activeZone,
        sequenceMomentum: clampContextRating(
          50 +
            (sequenceIndex % 2) * 6 +
            (possessionInfluence?.momentumModifier ?? 0) * 3 +
            (possessionInfluence?.scoringConfidenceModifier ?? 0) * 2,
        ),
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
