import type { TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import { PressureLevel } from "../../../models/match";
import type { ShapeState } from "../../../models/tactics";
import type {
  CompactnessEvaluation,
  DensityEvaluation,
  OffensiveSpreadEvaluation,
  SpatialTeamContext,
  WeakSideEvaluation,
} from "../../spatial/types";
import { LaneAvailability } from "../../spatial/types";
import {
  selectTargetZone,
  SpatialMoveType,
  ThreatLevel,
  createOffensiveUrgencyLogs,
  evaluateOffensiveUrgency,
  getDirectionalDistance,
  type BallContext,
  type TargetZoneSelection,
} from "../../spatial/intention";
import { getZoneParts } from "../../spatial/utils";
import { classifySideContext, createSideContextLogs } from "../../spatial/sides";
import { createOffensivePhilosophyLogs } from "../../offense";
import { createOffensiveMomentumLogs } from "../../offense/momentum";
import { createPrincipleEvaluationLogs, evaluateTacticalPrinciples } from "../../principles";
import {
  DangerMetricLevel,
  createDangerMetricsLogs,
  evaluateDangerMetrics,
  type DangerMetricsEvaluation,
} from "../../danger";
import { UtilityActionType, createUtilityDebugLogs, selectUtilityActor } from "../../ai/utility";
import {
  evaluateDefensiveParticipation,
  evaluateOffensiveParticipation,
  createRecoverySaturationLogs,
  type DefensiveParticipationEvaluation,
  type OffensiveParticipationEvaluation,
} from "../../structure";
import { createPlayerMatchStates, deriveNumericalPressureFromPlayers } from "../../players";
import {
  ChaosOutcome,
  applyChaosAdvantage,
  createChaosAdvantageLogs,
  createChaosLogs,
  evaluateChaosAdvantage,
  evaluateChaosOutcome,
} from "../../chaos";
import {
  applyTacticalStateEffects,
  createDecisionDimensionLogs,
  createTacticalPhaseLogs,
  evaluateDecisionDimensions,
  evaluateTransitionTacticalPhase,
  TacticalPhaseState,
} from "../../tacticalState";
import {
  TacticalMemoryInteraction,
  createTacticalMemoryLogs,
  createTargetSelectionMemoryModifiers,
  type TacticalMemoryState,
} from "../../tacticalMemory";
import { BuildUpPressingOutcome } from "../shared/types";
import { evaluateFinishingTrigger, FinishingDangerLevel, type FinishingTriggerEvaluation } from "../finishing";
import { InteractionType } from "../types";
import { createTransitionInteractionEvent } from "./events";
import { evaluateDefensiveRecovery } from "./evaluateDefensiveRecovery";
import { evaluateProjection } from "./evaluateProjection";
import { evaluateTransitionDanger } from "./evaluateTransitionDanger";
import { evaluateTransitionSupport } from "./evaluateTransitionSupport";
import { evaluateTransitionWindow } from "./evaluateTransitionWindow";
import { createTransitionLogs } from "./logging";
import {
  DangerLevel,
  TransitionContextUpdateType,
  TransitionOutcome,
  TransitionTrigger,
  type TransitionWindow,
  type TransitionInteractionResult,
  type UpdatedTransitionContext,
} from "./types";

export interface ResolveTransitionInput {
  readonly tick: TacticalTick;
  readonly trigger: TransitionTrigger;
  readonly previousOutcome: BuildUpPressingOutcome | null;
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly offensiveShape: ShapeState;
  readonly defensiveShape: ShapeState;
  readonly density: DensityEvaluation;
  readonly offensiveSpread: OffensiveSpreadEvaluation;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly weakSide: WeakSideEvaluation;
  readonly contextualPressure: PressureLevel;
  readonly ballContext: BallContext;
  readonly chaosLevel: number;
  readonly territorialPressure: number;
  readonly tacticalMemory: TacticalMemoryState;
}

function chooseTransitionOutcome(input: {
  readonly dangerScore: number;
  readonly projectionQuality: number;
  readonly recoveryQuality: number;
  readonly supportAvailability: number;
  readonly weakSideOpen: boolean;
  readonly targetMoveType: SpatialMoveType;
  readonly defensiveParticipation: DefensiveParticipationEvaluation;
  readonly offensiveParticipation: OffensiveParticipationEvaluation;
  readonly chaosOutcome: ChaosOutcome;
  readonly finishingTriggered: boolean;
  readonly forwardDistance: number;
  readonly dangerMetrics: DangerMetricsEvaluation;
}): TransitionOutcome {
  const finishingCanResolve =
    input.finishingTriggered &&
    (input.dangerMetrics.hasViableFinishing ||
      (input.dangerMetrics.hasUsableScoringLane && input.dangerMetrics.finalDanger >= 60));

  if (input.targetMoveType === SpatialMoveType.Finishing && finishingCanResolve) {
    return input.chaosOutcome === ChaosOutcome.None
      ? TransitionOutcome.ImmediateFinish
      : TransitionOutcome.ChaoticFinish;
  }

  if (
    input.chaosOutcome === ChaosOutcome.ForcedTurnover ||
    input.chaosOutcome === ChaosOutcome.TransitionReversal ||
    input.chaosOutcome === ChaosOutcome.TechnicalError ||
    input.chaosOutcome === ChaosOutcome.RushedClearance
  ) {
    return TransitionOutcome.TransitionCollapse;
  }

  if (
    input.chaosOutcome === ChaosOutcome.SupportFailure ||
    (input.chaosOutcome === ChaosOutcome.PoorDecision && input.targetMoveType === SpatialMoveType.DirectVerticalAttack)
  ) {
    return finishingCanResolve ? TransitionOutcome.OverextendedAttack : TransitionOutcome.DelayedTransition;
  }

  if (input.projectionQuality < 38 || input.supportAvailability < 32) {
    return TransitionOutcome.TransitionCollapse;
  }

  const manyLateDefenders =
    input.defensiveParticipation.delayedDefenders + input.defensiveParticipation.eliminatedDefenders >= 4;
  const conservativeTarget =
    input.targetMoveType === SpatialMoveType.LateralCirculation ||
    input.targetMoveType === SpatialMoveType.BackwardRecycle ||
    input.offensiveParticipation.conservativeSupport;
  const meaningfulCover =
    input.defensiveParticipation.coveringDefenders >= 2 ||
    input.defensiveParticipation.centralCoverRole !== null;
  const transitionExplosion =
    input.dangerMetrics.finalDanger >= 72 &&
    input.supportAvailability >= 48 &&
    input.forwardDistance >= 1 &&
    input.targetMoveType !== SpatialMoveType.LateralCirculation &&
    input.targetMoveType !== SpatialMoveType.BackwardRecycle;

  if (finishingCanResolve && transitionExplosion && !meaningfulCover) {
    return input.dangerMetrics.finalDanger >= 84 ? TransitionOutcome.ChaoticFinish : TransitionOutcome.ImmediateFinish;
  }

  if (finishingCanResolve && transitionExplosion && meaningfulCover) {
    return input.defensiveParticipation.centralCoverRole === null
      ? TransitionOutcome.EmergencyBlock
      : TransitionOutcome.LastDefenderRecovery;
  }

  if (
    manyLateDefenders &&
    !meaningfulCover &&
    !conservativeTarget &&
    input.supportAvailability >= 40 &&
    (input.dangerMetrics.hasRealNumericalAdvantage || input.dangerMetrics.hasViableFinishing)
  ) {
    return input.weakSideOpen ? TransitionOutcome.WeakSideAttack : TransitionOutcome.ExplosiveTransition;
  }

  if (input.recoveryQuality >= 45 && input.dangerMetrics.finalDanger < 85) {
    return TransitionOutcome.ControlledProgression;
  }

  if (
    input.dangerMetrics.finalDanger >= 72 &&
    input.weakSideOpen &&
    (input.dangerMetrics.hasRealNumericalAdvantage || input.dangerMetrics.hasViableFinishing)
  ) {
    return TransitionOutcome.WeakSideAttack;
  }

  if (
    input.dangerMetrics.finalDanger >= 68 &&
    (input.dangerMetrics.hasRealNumericalAdvantage || input.dangerMetrics.hasViableFinishing)
  ) {
    return TransitionOutcome.ExplosiveTransition;
  }

  if (input.recoveryQuality >= input.projectionQuality + 12) {
    return TransitionOutcome.EmergencyDefensiveRecovery;
  }

  if (input.dangerMetrics.finalDanger >= 50) {
    return TransitionOutcome.ControlledProgression;
  }

  if (input.dangerMetrics.finalDanger >= 35) {
    return TransitionOutcome.DelayedTransition;
  }

  return TransitionOutcome.StabilizedPossession;
}

function createUpdates(outcome: TransitionOutcome): readonly TransitionContextUpdateType[] {
  switch (outcome) {
    case TransitionOutcome.ExplosiveTransition:
      return [TransitionContextUpdateType.TemporaryChaos, TransitionContextUpdateType.DefensiveBlockBroken];
    case TransitionOutcome.WeakSideAttack:
      return [TransitionContextUpdateType.TemporaryChaos, TransitionContextUpdateType.WeakSideThreatened];
    case TransitionOutcome.ImmediateFinish:
    case TransitionOutcome.ChaoticFinish:
    case TransitionOutcome.LiveRebound:
      return [TransitionContextUpdateType.TemporaryChaos, TransitionContextUpdateType.DefensiveBlockBroken];
    case TransitionOutcome.LastDefenderRecovery:
    case TransitionOutcome.EmergencyBlock:
      return [TransitionContextUpdateType.EmergencyRecovery, TransitionContextUpdateType.WeakSideThreatened];
    case TransitionOutcome.OverextendedAttack:
      return [TransitionContextUpdateType.TransitionLost];
    case TransitionOutcome.ControlledProgression:
      return [TransitionContextUpdateType.WeakSideThreatened];
    case TransitionOutcome.DelayedTransition:
      return [TransitionContextUpdateType.EmergencyRecovery];
    case TransitionOutcome.EmergencyDefensiveRecovery:
      return [TransitionContextUpdateType.EmergencyRecovery];
    case TransitionOutcome.TransitionCollapse:
      return [TransitionContextUpdateType.TransitionLost];
    case TransitionOutcome.StabilizedPossession:
      return [TransitionContextUpdateType.PossessionStabilized];
  }
}

function describeOutcome(outcome: TransitionOutcome): string {
  switch (outcome) {
    case TransitionOutcome.ExplosiveTransition:
      return "Explosive transition. Danger created before the block can reset.";
    case TransitionOutcome.WeakSideAttack:
      return "Weak side attack. The open corridor becomes the immediate danger.";
    case TransitionOutcome.ImmediateFinish:
      return "Transition explosion triggered. The attack reaches an immediate finishing action.";
    case TransitionOutcome.ChaoticFinish:
      return "Chaotic finish created before the defensive block can recover.";
    case TransitionOutcome.LiveRebound:
      return "Live rebound created. The scramble remains terminal for now.";
    case TransitionOutcome.LastDefenderRecovery:
      return "Last defender recovery prevents a clean finish.";
    case TransitionOutcome.EmergencyBlock:
      return "Emergency block stops the first explosive action.";
    case TransitionOutcome.OverextendedAttack:
      return "Overextended attack. The long-play risk outruns support.";
    case TransitionOutcome.ControlledProgression:
      return "Defensive recovery slows the attack. Possession stabilizes before a finishing phase.";
    case TransitionOutcome.DelayedTransition:
      return "Delayed transition. The first wave slows down.";
    case TransitionOutcome.EmergencyDefensiveRecovery:
      return "Emergency defensive recovery. The block buys enough time.";
    case TransitionOutcome.TransitionCollapse:
      return "Transition collapse. The attack loses its window.";
    case TransitionOutcome.StabilizedPossession:
      return "Stabilized possession. The team calms the chaos.";
  }
}

function createUpdatedContext(
  input: ResolveTransitionInput,
  outcome: TransitionOutcome,
  dangerLevel: DangerLevel,
  transitionWindow: TransitionWindow,
  targetSelection: TargetZoneSelection,
  finishingTrigger: FinishingTriggerEvaluation | null,
): UpdatedTransitionContext {
  return {
    activeZone: targetSelection.selectedZone,
    targetZone: targetSelection.selectedZone,
    moveType: targetSelection.moveType,
    pressureLevel: input.contextualPressure,
    dangerLevel,
    transitionWindow,
    outcome,
    finishingTrigger,
    updates: createUpdates(outcome),
    targetZones: [targetSelection.selectedZone, ...input.weakSide.switchTargetZones],
  };
}

function mapScoringThreat(level: FinishingDangerLevel): ThreatLevel {
  switch (level) {
    case FinishingDangerLevel.High:
      return ThreatLevel.High;
    case FinishingDangerLevel.Medium:
      return ThreatLevel.Medium;
    case FinishingDangerLevel.Low:
      return ThreatLevel.Low;
  }
}

function mapDangerMetricLevel(level: DangerMetricLevel): DangerLevel {
  switch (level) {
    case DangerMetricLevel.Critical:
    case DangerMetricLevel.High:
      return DangerLevel.High;
    case DangerMetricLevel.Medium:
      return DangerLevel.Medium;
    case DangerMetricLevel.Low:
      return DangerLevel.Low;
  }
}

export function resolveTransition(input: ResolveTransitionInput): TransitionInteractionResult {
  const transitionWindow = evaluateTransitionWindow({
    trigger: input.trigger,
    previousOutcome: input.previousOutcome,
    defensiveCompactness: input.defensiveCompactness,
    weakSide: input.weakSide,
  });
  const projection = evaluateProjection({
    offensiveTeam: input.offensiveTeam,
    offensiveSpread: input.offensiveSpread,
    weakSide: input.weakSide,
    transitionWindow,
  });
  const support = evaluateTransitionSupport({
    offensiveTeam: input.offensiveTeam,
    weakSide: input.weakSide,
  });
  const offensiveParticipation = evaluateOffensiveParticipation(input.offensiveTeam);
  const sideContext = classifySideContext({
    density: input.density,
    pressingLocation: input.ballContext.ballLocation,
    weakSide: input.weakSide,
  });
  const memoryBiases = createTargetSelectionMemoryModifiers({
    memory: input.tacticalMemory,
    attackingTeamId: input.offensiveTeam.teamId,
    defendingTeamId: input.defensiveTeam.teamId,
    attackingTeamName: input.offensiveTeam.teamName,
    defendingTeamName: input.defensiveTeam.teamName,
    interaction: TacticalMemoryInteraction.Transition,
  });
  const principles = evaluateTacticalPrinciples({
    attackingTeam: input.offensiveTeam,
    defendingTeam: input.defensiveTeam,
    ballContext: input.ballContext,
    sideContext,
    weakSide: input.weakSide,
    defensiveCompactness: input.defensiveCompactness,
    pressure: input.contextualPressure,
    territorialPressure: input.territorialPressure,
    chaosLevel: input.chaosLevel + transitionWindow.chaos * 0.2,
  });
  const provisionalTacticalDanger = transitionWindow.chaos >= 62 ? ThreatLevel.High : ThreatLevel.Medium;
  const currentFinishingThreat = evaluateFinishingTrigger({
    teamName: input.offensiveTeam.teamName,
    activeZone: input.ballContext.ballLocation,
    attackingDirection: input.ballContext.attackingDirection,
    territorialPressure: input.territorialPressure,
    tacticalDanger:
      provisionalTacticalDanger === ThreatLevel.High ? FinishingDangerLevel.High : FinishingDangerLevel.Medium,
    offensiveInstructions: input.offensiveTeam.tacticalInstructions.offensive,
    weakSideExposure: input.weakSide.exposure,
  });
  const offensiveUrgency = evaluateOffensiveUrgency({
    team: input.offensiveTeam,
    opponentTeam: input.defensiveTeam,
    ballContext: input.ballContext,
    currentPressure: input.contextualPressure,
    chaosLevel: input.chaosLevel + transitionWindow.chaos * 0.2,
    territorialPressure: input.territorialPressure,
    weakSide: input.weakSide,
    defensiveCompactness: input.defensiveCompactness,
    interactionIntent: TacticalMemoryInteraction.Transition,
    sideContext,
    memoryBiases,
    tacticalDanger: provisionalTacticalDanger,
    scoringThreat: mapScoringThreat(currentFinishingThreat.scoringDanger),
    principles,
    ...(currentFinishingThreat.possibleScoringTypes[0] === undefined
      ? {}
      : { finishingOptionLabel: `${currentFinishingThreat.possibleScoringTypes[0].toUpperCase()}_ATTEMPT` }),
  });
  const targetSelection = selectTargetZone({
    context: {
      team: input.offensiveTeam,
      opponentTeam: input.defensiveTeam,
      ballContext: input.ballContext,
      currentPressure: input.contextualPressure,
      chaosLevel: input.chaosLevel + transitionWindow.chaos * 0.2,
      territorialPressure: input.territorialPressure,
      weakSide: input.weakSide,
      defensiveCompactness: input.defensiveCompactness,
      interactionIntent: TacticalMemoryInteraction.Transition,
      sideContext,
      memoryBiases,
      tacticalDanger: provisionalTacticalDanger,
      scoringThreat: mapScoringThreat(currentFinishingThreat.scoringDanger),
      offensiveUrgency,
      principles,
      ...(currentFinishingThreat.possibleScoringTypes[0] === undefined
        ? {}
        : { finishingOptionLabel: `${currentFinishingThreat.possibleScoringTypes[0].toUpperCase()}_ATTEMPT` }),
    },
    allowedMoveTypes: [
      SpatialMoveType.DirectVerticalAttack,
      SpatialMoveType.Progression,
      SpatialMoveType.WeakSideSwitch,
      SpatialMoveType.LateralCirculation,
      SpatialMoveType.Finishing,
    ],
  });
  const averageComposure = Math.round(
    input.offensiveTeam.players.reduce((sum, player) => sum + player.attributes.mental, 0) /
      Math.max(1, input.offensiveTeam.players.length),
  );
  const averageFreshness = Math.round(
    input.offensiveTeam.players.reduce((sum, player) => sum + player.fatigue.freshness, 0) /
      Math.max(1, input.offensiveTeam.players.length),
  );
  const rawChaos = evaluateChaosOutcome({
    chaosLevel: input.chaosLevel + transitionWindow.chaos * 0.25,
    pressureLevel: input.contextualPressure,
    riskLevel: input.offensiveTeam.tacticalInstructions.offensive.riskLevel,
    tacticalDiscipline: input.offensiveTeam.collectiveProperties.tacticalDiscipline,
    cohesion: input.offensiveTeam.collectiveProperties.cohesion,
    mental: averageComposure,
    freshness: averageFreshness,
    supportQuality: support.supportAvailability,
  });
  const defensiveParticipation = evaluateDefensiveParticipation({
    defensiveTeam: input.defensiveTeam,
    activeZone: input.activeZone,
    targetZone: targetSelection.selectedZone,
    ballLocation: input.ballContext.ballLocation,
    attackingDirection: input.ballContext.attackingDirection,
    defensiveCompactness: input.defensiveCompactness,
    moveType: targetSelection.moveType,
  });
  const attackingPlayerStates = createPlayerMatchStates({
    players: input.offensiveTeam.players,
    isPossessionTeam: true,
    ballContext: input.ballContext,
    attackingDirection: input.ballContext.attackingDirection,
    targetRole: projection.primaryRunnerRole,
    targetZone: targetSelection.selectedZone,
  });
  const defendingPlayerStates = createPlayerMatchStates({
    players: input.defensiveTeam.players,
    isPossessionTeam: false,
    ballContext: input.ballContext,
    attackingDirection: input.ballContext.attackingDirection,
    structuralParticipation: defensiveParticipation.players,
  });
  const playerDerivedNumericalPressure = deriveNumericalPressureFromPlayers({
    attackingPlayers: attackingPlayerStates,
    defendingPlayers: defendingPlayerStates,
  });
  const chaosAdvantage = evaluateChaosAdvantage({
    weakSideExposure: input.weakSide.exposure,
    transitionDanger: provisionalTacticalDanger,
    moveType: targetSelection.moveType,
    supportQuality: support.supportAvailability,
    defensiveParticipation,
    projectionQuality: projection.projectionQuality,
  });
  const chaosAfterAdvantage = applyChaosAdvantage({
    chaos: rawChaos,
    advantage: chaosAdvantage,
  });
  const targetFinishingThreat =
    targetSelection.moveType === SpatialMoveType.Finishing
      ? currentFinishingThreat
      : evaluateFinishingTrigger({
          teamName: input.offensiveTeam.teamName,
          activeZone: targetSelection.selectedZone,
          attackingDirection: input.ballContext.attackingDirection,
          territorialPressure: input.territorialPressure,
          tacticalDanger:
            provisionalTacticalDanger === ThreatLevel.High ? FinishingDangerLevel.High : FinishingDangerLevel.Medium,
          offensiveInstructions: input.offensiveTeam.tacticalInstructions.offensive,
          weakSideExposure: input.weakSide.exposure,
        });
  const fromParts = getZoneParts(input.ballContext.ballLocation);
  const toParts = getZoneParts(targetSelection.selectedZone);
  const targetForwardDistance = getDirectionalDistance(
    fromParts.longitudinalZone,
    toParts.longitudinalZone,
    input.ballContext.attackingDirection,
  );
  const defensiveRecovery = evaluateDefensiveRecovery({
    defensiveTeam: input.defensiveTeam,
    defensiveCompactness: input.defensiveCompactness,
    transitionWindow,
    defensiveParticipation,
  });
  const laneAccess = Math.max(
    0,
    Math.min(
      100,
      input.weakSide.exposure * 0.42 +
        projection.projectionQuality * 0.28 +
        (input.weakSide.switchPlayOpportunity === LaneAvailability.Open ? 18 : 4) +
        Math.max(0, targetForwardDistance) * 8 -
        defensiveParticipation.coveringDefenders * 5,
    ),
  );
  const dangerMetrics = evaluateDangerMetrics({
    chaosLevel: input.chaosLevel + transitionWindow.chaos * 0.25,
    territorialPressure: input.territorialPressure,
    structuralBreak: Math.max(
      defensiveRecovery.defensiveInstability,
      transitionWindow.instability,
      defensiveParticipation.delayedDefenders * 12 + defensiveParticipation.eliminatedDefenders * 18,
    ),
    laneAccess,
    supportQuality: support.supportAvailability,
    goalkeeperExposure: Math.max(
      0,
      100 -
        defensiveRecovery.recoveryQuality +
        defensiveParticipation.delayedDefenders * 6 +
        defensiveParticipation.eliminatedDefenders * 8 -
        defensiveParticipation.coveringDefenders * 5,
    ),
    finishingTrigger: targetFinishingThreat.triggered ? targetFinishingThreat : null,
    attackingPlayers: attackingPlayerStates,
    playerDerivedNumericalPressure,
  });
  const tacticalPhase = evaluateTransitionTacticalPhase({
    moveType: targetSelection.moveType,
    chaosAdvantage: chaosAdvantage.advantage,
    finishingTrigger: targetFinishingThreat.triggered ? targetFinishingThreat : null,
    weakSideExposure: input.weakSide.exposure,
    defensiveParticipation,
    offensiveParticipation,
    supportQuality: support.supportAvailability,
    cleanReception: support.supportAvailability >= 55 && projection.projectionQuality >= 62,
    dangerMetrics,
  });
  const chaos = applyTacticalStateEffects({
    phase: tacticalPhase.phase,
    chaos: chaosAfterAdvantage,
  });
  const decisionDimensions = evaluateDecisionDimensions({
    moveType: targetSelection.moveType,
    chaosOutcome: chaos.outcome,
    supportQuality: support.supportAvailability,
    tacticalDangerHigh: provisionalTacticalDanger === ThreatLevel.High,
  });
  const danger = evaluateTransitionDanger({
    transitionWindow,
    projection,
    support,
    defensiveRecovery,
    defensiveParticipation,
    weakSide: input.weakSide,
    density: input.density,
  });
  const rawOutcome = chooseTransitionOutcome({
    dangerScore: dangerMetrics.finalDanger,
    projectionQuality: projection.projectionQuality,
    recoveryQuality: defensiveRecovery.recoveryQuality,
    supportAvailability: support.supportAvailability,
    weakSideOpen: input.weakSide.switchPlayOpportunity === LaneAvailability.Open,
    targetMoveType: targetSelection.moveType,
    defensiveParticipation,
    offensiveParticipation,
    chaosOutcome: chaos.outcome,
    finishingTriggered: targetFinishingThreat.triggered,
    forwardDistance: targetForwardDistance,
    dangerMetrics,
  });
  const outcome =
    tacticalPhase.phase === TacticalPhaseState.DangerPhase &&
    dangerMetrics.dangerPhaseAllowed &&
    (rawOutcome === TransitionOutcome.ControlledProgression ||
      rawOutcome === TransitionOutcome.DelayedTransition ||
      rawOutcome === TransitionOutcome.StabilizedPossession)
      ? TransitionOutcome.LastDefenderRecovery
      : rawOutcome;
  const updatedContext: UpdatedTransitionContext = createUpdatedContext(
    input,
    outcome,
    mapDangerMetricLevel(dangerMetrics.finalDangerLevel),
    transitionWindow,
    targetSelection,
    targetFinishingThreat.triggered &&
      dangerMetrics.dangerPhaseAllowed &&
      (tacticalPhase.phase === TacticalPhaseState.DangerPhase ||
        targetSelection.moveType === SpatialMoveType.Finishing ||
        outcome === TransitionOutcome.ImmediateFinish ||
        outcome === TransitionOutcome.ChaoticFinish)
      ? targetFinishingThreat
      : null,
  );
  const event = createTransitionInteractionEvent({
    tick: input.tick,
    type: InteractionType.OffensiveTransition,
    trigger: input.trigger,
    offensiveTeamId: input.offensiveTeam.teamId,
    defensiveTeamId: input.defensiveTeam.teamId,
    activeZone: input.activeZone,
    involvedRoles: [
      projection.primaryRunnerRole,
      support.keySupportRole,
      defensiveRecovery.keyRecoveryRole,
    ],
    outcome,
    dangerLevel: mapDangerMetricLevel(dangerMetrics.finalDangerLevel),
    tacticalConsequences: updatedContext.updates,
    summary: describeOutcome(outcome),
  });
  const resultWithoutLogs = {
    outcome,
    dangerLevel: mapDangerMetricLevel(dangerMetrics.finalDangerLevel),
    dangerScore: dangerMetrics.finalDanger,
    transitionWindow,
    projection,
    support,
    offensiveParticipation,
    defensiveParticipation,
    defensiveRecovery,
    danger,
    updatedContext,
    event,
  };
  const utilitySelection = selectUtilityActor({
    players: input.offensiveTeam.players,
    actions: [UtilityActionType.AttackSpace, UtilityActionType.Carry, UtilityActionType.Support, UtilityActionType.ContestLooseBall],
    tacticalStyle: input.offensiveTeam.tacticalStyle,
    spatialAffordance: dangerMetrics.laneAccess,
    tacticalIntent: input.offensiveTeam.tacticalInstructions.offensive.verticality,
    pressure: input.contextualPressure === PressureLevel.High ? 78 : input.contextualPressure === PressureLevel.Medium ? 54 : 30,
    risk: input.offensiveTeam.tacticalInstructions.offensive.riskLevel,
    cohesion: input.offensiveTeam.collectiveProperties.cohesion,
  });

  return {
    ...resultWithoutLogs,
    logs: createTransitionLogs({
      result: resultWithoutLogs,
      offensiveTeamName: input.offensiveTeam.teamName,
      defensiveTeamName: input.defensiveTeam.teamName,
      ballContext: input.ballContext,
      targetSelection,
      defensiveParticipation,
      offensiveParticipation,
      playerDerivedNumericalPressure,
      contextLogs: [
        ...createOffensivePhilosophyLogs({
          teamName: input.offensiveTeam.teamName,
          tacticalStyle: input.offensiveTeam.tacticalStyle,
          philosophy: input.offensiveTeam.offensiveProgressionPhilosophy,
        }),
        ...createOffensiveMomentumLogs({
          teamName: input.offensiveTeam.teamName,
          momentum: input.offensiveTeam.offensiveMomentum,
        }),
        ...createRecoverySaturationLogs({
          teamName: input.defensiveTeam.teamName,
          saturation: input.defensiveTeam.recoverySaturation,
        }),
        ...createSideContextLogs(sideContext),
        ...createTacticalMemoryLogs(memoryBiases),
        ...createPrincipleEvaluationLogs({
          principles,
          localAdvantage: targetSelection.evaluations[0]?.localAdvantage,
          attackingTeamName: input.offensiveTeam.teamName,
          defendingTeamName: input.defensiveTeam.teamName,
        }),
        ...createOffensiveUrgencyLogs(offensiveUrgency),
        ...createDangerMetricsLogs(dangerMetrics),
        ...createUtilityDebugLogs({
          label: `${input.offensiveTeam.teamName} transition actor`,
          selection: utilitySelection,
        }),
        ...createChaosAdvantageLogs(chaosAdvantage, {
          attackingTeamName: input.offensiveTeam.teamName,
          playerDerivedNumericalPressure,
        }),
        ...createTacticalPhaseLogs(tacticalPhase),
        ...createDecisionDimensionLogs(decisionDimensions),
        ...createChaosLogs(chaos, {
          teamName: input.offensiveTeam.teamName,
          actor: utilitySelection.selected.player.roleInitials ?? utilitySelection.selected.player.role,
        }),
      ],
    }),
  };
}
