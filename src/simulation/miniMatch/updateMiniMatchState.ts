import { BuildUpPressingOutcome } from "../../systems/interactions/shared";
import type { TeamId } from "../../core/ids";
import { createZoneId, LateralCorridor, LongitudinalZone, type ZoneId } from "../../core/zones";
import { FinishingOutcome } from "../../systems/interactions/finishing";
import { ConstructionOutcome } from "../../systems/interactions/construction";
import { TransitionOutcome } from "../../systems/interactions/transition";
import { SecondChanceOutcome } from "../../systems/interactions/secondChance";
import {
  updateRecoverySaturation,
  type RecoverySaturationState,
} from "../../systems/structure";
import { updateOffensiveMomentum, type OffensiveMomentumState } from "../../systems/offense/momentum";
import type { SequenceResult } from "../../systems/sequences";
import {
  getTeamAttackingDirection,
  type SpatialMoveType,
  updateBallContext,
} from "../../systems/spatial/intention";
import { SideType, classifySideContext } from "../../systems/spatial/sides";
import {
  TacticalMemoryInteraction,
  classifyTacticalPattern,
  updateTacticalMemory,
  type TacticalMemoryState,
} from "../../systems/tacticalMemory";
import type {
  MiniMatchScoringEvent,
  MiniMatchSequenceRecord,
  MiniMatchSequenceSetup,
  MiniMatchState,
  MiniMatchTeamCount,
  MiniMatchTeamRecoverySaturation,
  MiniMatchTeamOffensiveMomentum,
} from "./types";

function incrementTeamCount(
  current: MiniMatchTeamCount,
  teamId: string,
  teamAId: string,
): MiniMatchTeamCount {
  if (teamId === teamAId) {
    return {
      teamA: current.teamA + 1,
      teamB: current.teamB,
    };
  }

  return {
    teamA: current.teamA,
    teamB: current.teamB + 1,
  };
}

function createScoringEvent(
  state: MiniMatchState,
  setup: MiniMatchSequenceSetup,
  result: SequenceResult,
): MiniMatchScoringEvent | null {
  const scoreUpdate = result.secondChanceResult?.scoreUpdate ?? result.finishingResult?.scoreUpdate ?? null;
  if (scoreUpdate === null) {
    return null;
  }

  const teamName =
    scoreUpdate.scoringTeamId === state.context.teamA.id
      ? state.context.teamA.displayName
      : state.context.teamB.displayName;

  return {
    sequenceNumber: setup.sequenceNumber,
    teamId: scoreUpdate.scoringTeamId,
    teamName,
    scoringType: scoreUpdate.scoringType,
    points: scoreUpdate.points,
  };
}

function updateScore(state: MiniMatchState, scoringEvent: MiniMatchScoringEvent | null) {
  if (scoringEvent === null) {
    return state.score;
  }

  if (scoringEvent.teamId === state.context.teamA.id) {
    return {
      teamA: state.score.teamA + scoringEvent.points,
      teamB: state.score.teamB,
    };
  }

  return {
    teamA: state.score.teamA,
    teamB: state.score.teamB + scoringEvent.points,
  };
}

function getNextPossessionTeamId(setup: MiniMatchSequenceSetup, result: SequenceResult): TeamId {
  if (result.secondChanceResult?.scoreUpdate !== null && result.secondChanceResult?.scoreUpdate !== undefined) {
    return setup.pressingTeam.teamId;
  }

  if (result.secondChanceResult?.outcome === SecondChanceOutcome.ScrambleTurnover) {
    return setup.pressingTeam.teamId;
  }

  if (result.finishingResult?.scoreUpdate !== null && result.finishingResult?.scoreUpdate !== undefined) {
    return setup.pressingTeam.teamId;
  }

  if (
    result.buildUpResult?.outcome === BuildUpPressingOutcome.DangerousTurnover ||
    result.buildUpResult?.outcome === BuildUpPressingOutcome.ForcedClearance
  ) {
    return setup.pressingTeam.teamId;
  }

  const finishingOutcome = result.finishingResult?.outcome ?? null;

  if (
    finishingOutcome === FinishingOutcome.SavedAttempt ||
    finishingOutcome === FinishingOutcome.BlockedAttempt ||
    finishingOutcome === FinishingOutcome.MissedAttempt ||
    finishingOutcome === FinishingOutcome.SecondChance ||
    finishingOutcome === FinishingOutcome.EmergencyClearance ||
    finishingOutcome === FinishingOutcome.LastDefenderSave ||
    finishingOutcome === FinishingOutcome.DefensiveRecovery
  ) {
    return setup.pressingTeam.teamId;
  }

  return result.finishingResult?.event.offensiveTeamId ?? setup.possessionTeam.teamId;
}

function describeNextPossessionReason(setup: MiniMatchSequenceSetup, result: SequenceResult): string {
  if (result.secondChanceResult?.scoreUpdate !== null && result.secondChanceResult?.scoreUpdate !== undefined) {
    return "the second-chance score reset possession";
  }

  if (result.secondChanceResult?.outcome === SecondChanceOutcome.ScrambleTurnover) {
    return "a scramble turnover changed possession";
  }

  if (result.finishingResult?.scoreUpdate !== null && result.finishingResult?.scoreUpdate !== undefined) {
    return "the scoring sequence reset possession";
  }

  if (result.buildUpResult?.outcome === BuildUpPressingOutcome.DangerousTurnover) {
    return "an explicit turnover changed possession";
  }

  if (result.buildUpResult?.outcome === BuildUpPressingOutcome.ForcedClearance) {
    return "a forced clearance conceded possession";
  }

  const finishingOutcome = result.finishingResult?.outcome ?? null;
  if (
    finishingOutcome === FinishingOutcome.SavedAttempt ||
    finishingOutcome === FinishingOutcome.BlockedAttempt ||
    finishingOutcome === FinishingOutcome.MissedAttempt ||
    finishingOutcome === FinishingOutcome.SecondChance ||
    finishingOutcome === FinishingOutcome.EmergencyClearance ||
    finishingOutcome === FinishingOutcome.LastDefenderSave ||
    finishingOutcome === FinishingOutcome.DefensiveRecovery
  ) {
    return "a failed finishing attempt ended with defensive possession";
  }

  return `${setup.possessionTeam.teamName} retained possession`;
}

function getNextBallLocation(result: SequenceResult): ZoneId {
  if (
    (result.finishingResult?.scoreUpdate !== null && result.finishingResult?.scoreUpdate !== undefined) ||
    (result.secondChanceResult?.scoreUpdate !== null && result.secondChanceResult?.scoreUpdate !== undefined)
  ) {
    return createZoneId(LongitudinalZone.Midfield, LateralCorridor.LeftHalfSpace);
  }

  return result.finalContext.activeZone;
}

function getSideTypeForZone(input: {
  readonly setup: MiniMatchSequenceSetup;
  readonly result: SequenceResult;
  readonly interaction: TacticalMemoryInteraction;
  readonly targetZone: ZoneId;
}): SideType {
  const snapshot =
    input.interaction === TacticalMemoryInteraction.Transition
      ? input.setup.resolveInput.transitionSpatial
      : input.interaction === TacticalMemoryInteraction.Construction
        ? input.setup.resolveInput.constructionSpatial
        : input.setup.resolveInput.initialSpatial;
  const sideContext = classifySideContext({
    density: snapshot.density,
    pressingLocation: input.setup.resolveInput.ballContext.ballLocation,
    weakSide: snapshot.weakSide,
  });

  return sideContext.sideTypesByZone[input.targetZone] ?? SideType.BalancedSide;
}

function updateMemoryForPattern(input: {
  readonly memory: TacticalMemoryState;
  readonly setup: MiniMatchSequenceSetup;
  readonly result: SequenceResult;
  readonly interaction: TacticalMemoryInteraction;
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly success: boolean;
  readonly targetZone: ZoneId;
  readonly moveType: SpatialMoveType;
}): TacticalMemoryState {
  const pattern = classifyTacticalPattern({
    interaction: input.interaction,
    moveType: input.moveType,
    targetZone: input.targetZone,
    sideType: getSideTypeForZone({
      setup: input.setup,
      result: input.result,
      interaction: input.interaction,
      targetZone: input.targetZone,
    }),
  });

  return updateTacticalMemory({
    memory: input.memory,
    attackingTeamId: input.attackingTeamId,
    defendingTeamId: input.defendingTeamId,
    pattern,
    success: input.success,
    sequenceNumber: input.setup.sequenceNumber,
  });
}

function updateMemoryFromSequence(
  state: MiniMatchState,
  setup: MiniMatchSequenceSetup,
  result: SequenceResult,
): TacticalMemoryState {
  let memory = state.tacticalMemory;

  if (result.buildUpResult !== null) {
    const buildUpSuccess =
      result.buildUpResult.outcome !== BuildUpPressingOutcome.DangerousTurnover &&
      result.buildUpResult.outcome !== BuildUpPressingOutcome.ForcedClearance;

    memory = updateMemoryForPattern({
      memory,
      setup,
      result,
      interaction: TacticalMemoryInteraction.BuildUp,
      attackingTeamId: setup.possessionTeam.teamId,
      defendingTeamId: setup.pressingTeam.teamId,
      success: buildUpSuccess,
      targetZone: result.buildUpResult.updatedContext.targetZone,
      moveType: result.buildUpResult.updatedContext.moveType,
    });
  }

  if (result.transitionResult !== null) {
    const transitionSuccess =
      result.transitionResult.outcome === TransitionOutcome.ExplosiveTransition ||
      result.transitionResult.outcome === TransitionOutcome.WeakSideAttack ||
      result.transitionResult.outcome === TransitionOutcome.ControlledProgression;

    memory = updateMemoryForPattern({
      memory,
      setup,
      result,
      interaction: TacticalMemoryInteraction.Transition,
      attackingTeamId: result.transitionResult.event.offensiveTeamId,
      defendingTeamId: result.transitionResult.event.defensiveTeamId,
      success: transitionSuccess,
      targetZone: result.transitionResult.updatedContext.targetZone,
      moveType: result.transitionResult.updatedContext.moveType,
    });
  }

  if (result.constructionResult !== null) {
    const constructionSuccess =
      result.constructionResult.outcome === ConstructionOutcome.BlockStretched ||
      result.constructionResult.outcome === ConstructionOutcome.TerritorialProgression ||
      result.constructionResult.outcome === ConstructionOutcome.WeakSideCreated;

    memory = updateMemoryForPattern({
      memory,
      setup,
      result,
      interaction: TacticalMemoryInteraction.Construction,
      attackingTeamId: result.constructionResult.event.offensiveTeamId,
      defendingTeamId: result.constructionResult.event.defensiveTeamId,
      success: constructionSuccess,
      targetZone: result.constructionResult.updatedContext.targetZone,
      moveType: result.constructionResult.updatedContext.moveType,
    });
  }

  return memory;
}

function getSaturationByTeamId(
  state: MiniMatchState,
  teamId: TeamId,
): RecoverySaturationState {
  return teamId === state.context.teamA.id ? state.recoverySaturation.teamA : state.recoverySaturation.teamB;
}

function assignSaturationByTeamId(input: {
  readonly state: MiniMatchState;
  readonly teamId: TeamId;
  readonly saturation: RecoverySaturationState;
}): MiniMatchTeamRecoverySaturation {
  if (input.teamId === input.state.context.teamA.id) {
    return {
      teamA: input.saturation,
      teamB: input.state.recoverySaturation.teamB,
    };
  }

  return {
    teamA: input.state.recoverySaturation.teamA,
    teamB: input.saturation,
  };
}

function increaseSaturation(input: {
  readonly state: MiniMatchState;
  readonly saturation: MiniMatchTeamRecoverySaturation;
  readonly teamId: TeamId;
  readonly delta: number;
  readonly reasons: readonly string[];
}): MiniMatchTeamRecoverySaturation {
  const current =
    input.teamId === input.state.context.teamA.id ? input.saturation.teamA : input.saturation.teamB;
  const updated = updateRecoverySaturation({
    current,
    delta: input.delta,
    reasons: input.reasons,
  });

  return input.teamId === input.state.context.teamA.id
    ? { teamA: updated, teamB: input.saturation.teamB }
    : { teamA: input.saturation.teamA, teamB: updated };
}

function decaySaturation(
  state: MiniMatchState,
  result: SequenceResult,
): MiniMatchTeamRecoverySaturation {
  const calmSequence =
    result.finalContext.chaosLevel <= 42 ||
    result.finalContext.possessionStability === "HIGH";
  const decay = calmSequence ? -10 : -4;
  const reasons = calmSequence
    ? ["sequence settled calmly"]
    : ["partial recovery between sequences"];

  return {
    teamA: updateRecoverySaturation({
      current: state.recoverySaturation.teamA,
      delta: decay,
      reasons,
    }),
    teamB: updateRecoverySaturation({
      current: state.recoverySaturation.teamB,
      delta: decay,
      reasons,
    }),
  };
}

function updateRecoverySaturationFromSequence(
  state: MiniMatchState,
  setup: MiniMatchSequenceSetup,
  result: SequenceResult,
): MiniMatchTeamRecoverySaturation {
  let saturation = decaySaturation(state, result);

  if (
    result.buildUpResult?.outcome === BuildUpPressingOutcome.PressBroken ||
    result.buildUpResult?.outcome === BuildUpPressingOutcome.WeakSideExposed
  ) {
    saturation = increaseSaturation({
      state,
      saturation,
      teamId: setup.pressingTeam.teamId,
      delta: 12,
      reasons: ["pressing line was bypassed"],
    });
  }

  if (result.buildUpResult?.outcome === BuildUpPressingOutcome.DangerousTurnover) {
    saturation = increaseSaturation({
      state,
      saturation,
      teamId: setup.possessionTeam.teamId,
      delta: 10,
      reasons: ["build-up collapsed under pressure"],
    });
  }

  if (result.transitionResult !== null) {
    const defensiveTeamId = result.transitionResult.event.defensiveTeamId;
    const delayedLoad =
      result.transitionResult.defensiveParticipation.delayedDefenders * 4 +
      result.transitionResult.defensiveParticipation.eliminatedDefenders * 6;
    const explosionLoad =
      result.transitionResult.outcome === TransitionOutcome.ImmediateFinish ||
      result.transitionResult.outcome === TransitionOutcome.ChaoticFinish ||
      result.transitionResult.outcome === TransitionOutcome.ExplosiveTransition ||
      result.transitionResult.outcome === TransitionOutcome.WeakSideAttack
        ? 12
        : 0;
    const emergencyLoad =
      result.transitionResult.outcome === TransitionOutcome.LastDefenderRecovery ||
      result.transitionResult.outcome === TransitionOutcome.EmergencyBlock
        ? 10
        : 0;
    const load = delayedLoad + explosionLoad + emergencyLoad;

    if (load > 0) {
      saturation = increaseSaturation({
        state,
        saturation,
        teamId: defensiveTeamId,
        delta: load,
        reasons: [
          ...(delayedLoad > 0 ? ["defenders were late recovering"] : []),
          ...(explosionLoad > 0 ? ["transition explosion defended"] : []),
          ...(emergencyLoad > 0 ? ["emergency last-line recovery used"] : []),
        ],
      });
    }
  }

  if (result.finishingResult !== null) {
    const defendingTeamId = result.finishingResult.event.defensiveTeamId;
    const outcome = result.finishingResult.outcome;
    const finishingLoad =
      outcome === FinishingOutcome.LastDefenderSave
        ? 14
        : outcome === FinishingOutcome.EmergencyClearance
          ? 12
          : outcome === FinishingOutcome.ScrambleFinish
            ? 12
          : outcome === FinishingOutcome.SavedAttempt || outcome === FinishingOutcome.BlockedAttempt
            ? 8
            : outcome === FinishingOutcome.LiveRebound || outcome === FinishingOutcome.SecondChance
              ? 8
              : 0;

    if (finishingLoad > 0) {
      saturation = increaseSaturation({
        state,
        saturation,
        teamId: defendingTeamId,
        delta: finishingLoad,
        reasons: [
          outcome === FinishingOutcome.LastDefenderSave
            ? "last defender save in previous sequence"
            : "scoring danger protected under pressure",
        ],
      });
    }
  }

  if (result.secondChanceResult !== null) {
    saturation = increaseSaturation({
      state,
      saturation,
      teamId: result.secondChanceResult.event.defensiveTeamId,
      delta: result.secondChanceResult.scoreUpdate === null ? 6 : 14,
      reasons:
        result.secondChanceResult.scoreUpdate === null
          ? ["second-chance scramble defended"]
          : ["second-chance scramble broke the last line"],
    });
  }

  return saturation;
}

function increaseMomentum(input: {
  readonly state: MiniMatchState;
  readonly momentum: MiniMatchTeamOffensiveMomentum;
  readonly teamId: TeamId;
  readonly delta: number;
  readonly reasons: readonly string[];
}): MiniMatchTeamOffensiveMomentum {
  const current = input.teamId === input.state.context.teamA.id ? input.momentum.teamA : input.momentum.teamB;
  const updated = updateOffensiveMomentum({
    current,
    delta: input.delta,
    reasons: input.reasons,
  });

  return input.teamId === input.state.context.teamA.id
    ? { teamA: updated, teamB: input.momentum.teamB }
    : { teamA: input.momentum.teamA, teamB: updated };
}

function decayMomentum(state: MiniMatchState): MiniMatchTeamOffensiveMomentum {
  return {
    teamA: updateOffensiveMomentum({
      current: state.offensiveMomentum.teamA,
      delta: -5,
      reasons: ["attacking rhythm cools between sequences"],
    }),
    teamB: updateOffensiveMomentum({
      current: state.offensiveMomentum.teamB,
      delta: -5,
      reasons: ["attacking rhythm cools between sequences"],
    }),
  };
}

function updateOffensiveMomentumFromSequence(
  state: MiniMatchState,
  setup: MiniMatchSequenceSetup,
  result: SequenceResult,
): MiniMatchTeamOffensiveMomentum {
  let momentum = decayMomentum(state);
  const possessionTeamId = setup.possessionTeam.teamId;
  const transitionTeamId = result.transitionResult?.event.offensiveTeamId ?? null;
  const constructionTeamId = result.constructionResult?.event.offensiveTeamId ?? null;
  const finishingTeamId = result.finishingResult?.event.offensiveTeamId ?? null;
  const secondChanceTeamId = result.secondChanceResult?.event.offensiveTeamId ?? null;

  if (
    result.buildUpResult?.outcome === BuildUpPressingOutcome.PressBroken ||
    result.buildUpResult?.outcome === BuildUpPressingOutcome.WeakSideExposed
  ) {
    momentum = increaseMomentum({
      state,
      momentum,
      teamId: possessionTeamId,
      delta: 10,
      reasons: ["press was broken and attacking rhythm accelerated"],
    });
  }

  if (result.transitionResult !== null) {
    momentum = increaseMomentum({
      state,
      momentum,
      teamId: transitionTeamId ?? possessionTeamId,
      delta: result.transitionResult.dangerLevel === "HIGH" ? 14 : 8,
      reasons: ["transition created tactical danger"],
    });
  }

  if (result.constructionResult !== null && result.constructionResult.dangerLevel === "HIGH") {
    momentum = increaseMomentum({
      state,
      momentum,
      teamId: constructionTeamId ?? possessionTeamId,
      delta: 8,
      reasons: ["sustained construction created pressure"],
    });
  }

  if (result.finishingResult !== null) {
    momentum = increaseMomentum({
      state,
      momentum,
      teamId: finishingTeamId ?? possessionTeamId,
      delta: result.finishingResult.scoreUpdate === null ? -8 : 12,
      reasons: result.finishingResult.scoreUpdate === null ? ["finishing attempt failed"] : ["finishing converted pressure"],
    });
  }

  if (result.secondChanceResult !== null) {
    momentum = increaseMomentum({
      state,
      momentum,
      teamId: secondChanceTeamId ?? possessionTeamId,
      delta: result.secondChanceResult.scoreUpdate === null ? 8 : 16,
      reasons:
        result.secondChanceResult.scoreUpdate === null
          ? ["second chance kept pressure alive"]
          : ["second chance converted loose-ball pressure"],
    });
  }

  if (
    result.buildUpResult?.outcome === BuildUpPressingOutcome.DangerousTurnover ||
    result.buildUpResult?.outcome === BuildUpPressingOutcome.ForcedClearance
  ) {
    momentum = increaseMomentum({
      state,
      momentum,
      teamId: possessionTeamId,
      delta: -16,
      reasons: ["possession broke down"],
    });
  }

  return momentum;
}

export function updateMiniMatchState(
  state: MiniMatchState,
  setup: MiniMatchSequenceSetup,
  result: SequenceResult,
): MiniMatchState {
  const scoringEvent = createScoringEvent(state, setup, result);
  const record: MiniMatchSequenceRecord = {
    sequenceNumber: setup.sequenceNumber,
    setup,
    result,
  };
  const finishingTeamId = result.finishingResult?.event.offensiveTeamId ?? null;
  const secondChanceTeamId = result.secondChanceResult?.event.offensiveTeamId ?? null;
  const turnoverWinnerId =
    result.buildUpResult?.outcome === BuildUpPressingOutcome.DangerousTurnover
      ? setup.pressingTeam.teamId
      : null;
  const nextPossessionTeamId = getNextPossessionTeamId(setup, result);
  const nextBallContext = updateBallContext({
    previous: setup.resolveInput.ballContext,
    ballLocation: getNextBallLocation(result),
    possessionTeamId: nextPossessionTeamId,
    attackingDirection: getTeamAttackingDirection(
      nextPossessionTeamId,
      state.context.attackingDirections,
    ),
  });
  const tacticalMemory = updateMemoryFromSequence(state, setup, result);
  const recoverySaturation = updateRecoverySaturationFromSequence(state, setup, result);
  const offensiveMomentum = updateOffensiveMomentumFromSequence(state, setup, result);

  return {
    ...state,
    score: updateScore(state, scoringEvent),
    records: [...state.records, record],
    scoringEvents: scoringEvent === null ? state.scoringEvents : [...state.scoringEvents, scoringEvent],
    finishingOpportunities:
      finishingTeamId === null
        ? state.finishingOpportunities
        : incrementTeamCount(state.finishingOpportunities, finishingTeamId, state.context.teamA.id),
    secondChanceCount:
      secondChanceTeamId === null
        ? state.secondChanceCount
        : incrementTeamCount(state.secondChanceCount, secondChanceTeamId, state.context.teamA.id),
    turnovers:
      turnoverWinnerId === null
        ? state.turnovers
        : incrementTeamCount(state.turnovers, turnoverWinnerId, state.context.teamA.id),
    continuity: {
      lastBallContext: nextBallContext,
      lastPossessionTeamId: nextPossessionTeamId,
      lastTerritorialPressure: result.finalContext.territorialPressure,
      lastChaosLevel: result.finalContext.chaosLevel,
      lastDangerLevel: result.finalContext.currentDanger,
      lastPossessionReason: describeNextPossessionReason(setup, result),
    },
    tacticalMemory,
    recoverySaturation,
    offensiveMomentum,
  };
}
