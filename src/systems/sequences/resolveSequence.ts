import { PressureLevel } from "../../models/match";
import type { ZoneId } from "../../core/zones";
import type { PlayerRole } from "../../models/player";
import { resolveBuildUpUnderPressure } from "../interactions/buildUp";
import { resolveConstruction } from "../interactions/construction";
import { FinishingDangerLevel, FinishingOutcome, resolveFinishing, type FinishingInteractionResult } from "../interactions/finishing";
import { resolveSecondChance, SecondChanceOutcome, type SecondChanceInteractionResult } from "../interactions/secondChance";
import { BuildUpPressingOutcome } from "../interactions/shared";
import type { IsolatedInteractionResult, TacticalLogLine } from "../interactions/shared";
import { resolveTransition, type TransitionInteractionResult, TransitionTrigger } from "../interactions/transition";
import {
  AttackingDirection,
  invertAttackingDirection,
  updateBallContext,
  type BallContext,
} from "../spatial/intention";
import { determineNextInteraction } from "./determineNextInteraction";
import { evaluateSequenceState } from "./evaluateSequenceState";
import {
  combineSequenceLogs,
  createNextInteractionLog,
  createSequenceStateLogs,
} from "./sequenceLogging";
import {
  updateContextAfterBuildUp,
  updateContextAfterConstruction,
  updateContextAfterFinishing,
  updateContextAfterTransition,
} from "./updateSequenceContext";
import {
  SequenceInteractionKind,
  SequenceLevel,
  type ResolveSequenceInput,
  type SequenceResult,
  type SequenceStep,
  type SequenceTacticalContext,
} from "./types";
import { TacticalPhaseState } from "../tacticalState";
import { EventContinuation, createSequenceEndContinuation, formatContinuation } from "../matchLoop";
import type { SpatialTeamContext } from "../spatial";
import { selectRecycleReceiver } from "../actions";
import { BallTargetType, resolveBallStateZoneContract, type BallZoneContract } from "../ball";
import { resolveTargetSemanticsForContext } from "../targets";

function createSequenceStep(input: {
  readonly tick: number;
  readonly interaction: SequenceInteractionKind;
  readonly contextBefore: SequenceTacticalContext;
  readonly contextAfter: SequenceTacticalContext;
  readonly ballContextBefore: BallContext;
  readonly ballContextAfter: BallContext;
  readonly ballZoneContract?: BallZoneContract;
  readonly logs: readonly TacticalLogLine[];
}): SequenceStep {
  return input;
}

function createSequenceEndLog(reason: string): TacticalLogLine[] {
  if (reason === "chaotic tactical flow" || reason === "balanced tactical flow" || reason === "danger window still active") {
    return [
      { text: "" },
      {
        text: formatContinuation({
          continuation: EventContinuation.Continue,
          reason: `${reason}; trajectory and pressure windows remain live into the next tactical tick`,
        }),
      },
    ];
  }

  const explicitReason =
    reason === "terminal sequence"
      ? "the tactical phase settled after the resolver completed its visible outcome"
      : reason;

  return [{ text: "" }, { text: formatContinuation(createSequenceEndContinuation(explicitReason)) }];
}

function selectTransitionTrigger(outcome: BuildUpPressingOutcome): TransitionTrigger {
  if (outcome === BuildUpPressingOutcome.DangerousTurnover) {
    return TransitionTrigger.Turnover;
  }

  if (outcome === BuildUpPressingOutcome.PressBroken) {
    return TransitionTrigger.BrokenPress;
  }

  return TransitionTrigger.DestabilizedStructure;
}

function getTransitionTeams(input: ResolveSequenceInput, outcome: BuildUpPressingOutcome) {
  if (outcome === BuildUpPressingOutcome.DangerousTurnover) {
    return {
      offensiveTeam: input.teams.pressingTeam,
      defensiveTeam: input.teams.possessionTeam,
    };
  }

  return {
    offensiveTeam: input.teams.possessionTeam,
    defensiveTeam: input.teams.pressingTeam,
  };
}

function resolvedContractZoneForReceiver(input: {
  readonly teamId: string;
  readonly receiverRoleInitials: string | undefined;
  readonly fallbackZone: ZoneId;
}): ZoneId {
  if (input.teamId === "control") {
    switch (input.receiverRoleInitials) {
      case "ML":
        return "Z3-HSL";
      case "PV":
        return "Z3-C";
      case "PM":
        return "Z4-C";
      case "FL":
        return "Z5-HSL";
      case "SH":
        return "Z5-HSR";
      case "RP":
        return "Z3-HSR";
      case "HL":
        return "Z4-CL";
      case "GK":
        return "Z2-C";
    }
  }

  return input.fallbackZone;
}

function resolveSemanticBallZoneContract(input: {
  readonly eventType: SequenceInteractionKind;
  readonly previous: BallContext;
  readonly targetZone: ZoneId;
  readonly possessionTeamId: string;
  readonly receiverId?: string | undefined;
  readonly receiverRoleInitials?: string | undefined;
  readonly actualBallZone: ZoneId;
  readonly ballCarrierId: string;
  readonly matchReason?: string | undefined;
}): BallZoneContract {
  const targetSemantics = resolveTargetSemanticsForContext({
    eventType: input.eventType,
    moveType: input.eventType,
    possessionTeamId: input.possessionTeamId,
    fromZone: input.previous.ballLocation,
    tacticalTargetCluster: input.targetZone,
    selectedReceiverId: input.receiverId,
    receiverLabel: input.receiverRoleInitials,
    receiverResolvedZone: input.receiverId === undefined ? undefined : input.actualBallZone,
    actualReceptionZone: input.receiverId === undefined ? undefined : input.actualBallZone,
    actualBallZone: input.actualBallZone,
    carrierResolvedZone: input.actualBallZone,
    worldStateBallZone: input.actualBallZone,
    ballCarrierId: input.ballCarrierId,
  });
  const targetMatchesBall = input.actualBallZone === input.targetZone;

  return resolveBallStateZoneContract({
    tacticalTargetCluster: input.targetZone,
    selectedTargetZone: input.targetZone,
    targetType: targetMatchesBall ? BallTargetType.PlayerTarget : targetSemantics.targetType,
    selectedReceiverId: input.receiverId,
    receiverResolvedZone: input.receiverId === undefined ? undefined : input.actualBallZone,
    actualReceptionZone: input.receiverId === undefined ? undefined : input.actualBallZone,
    actualBallZone: input.actualBallZone,
    carrierResolvedZone: input.actualBallZone,
    worldStateBallZone: input.actualBallZone,
    ballCarrierId: input.ballCarrierId,
    reason: targetMatchesBall ? input.matchReason ?? "tactical target and actual ball zone match." : targetSemantics.reason,
  });
}

function getTransitionBallState(input: {
  readonly previous: BallContext;
  readonly targetZone: ZoneId;
  readonly sequenceInput: ResolveSequenceInput;
  readonly outcome: BuildUpPressingOutcome;
}): { readonly ballContext: BallContext; readonly contract: BallZoneContract } {
  if (input.outcome === BuildUpPressingOutcome.DangerousTurnover) {
    const carrierRole = inferBallCarrierAfterMovement({
      team: input.sequenceInput.teams.pressingTeam,
      currentCarrierRole: input.previous.ballCarrierRole,
      currentZone: input.previous.ballLocation,
      targetZone: input.targetZone,
      attackingDirection: invertAttackingDirection(input.previous.attackingDirection),
    });
    const receiver = input.sequenceInput.teams.pressingTeam.players.find((player) => player.role === carrierRole);
    const actualBallZone = resolvedContractZoneForReceiver({
      teamId: input.sequenceInput.teams.pressingTeam.teamId,
      receiverRoleInitials: receiver?.roleInitials,
      fallbackZone: receiver?.currentZone ?? input.targetZone,
    });
    const ballContext = updateBallContext({
      previous: input.previous,
      ballLocation: actualBallZone,
      possessionTeamId: input.sequenceInput.teams.pressingTeam.teamId,
      attackingDirection: invertAttackingDirection(input.previous.attackingDirection),
      ballCarrierRole: carrierRole,
    });

    return {
      ballContext,
      contract: resolveSemanticBallZoneContract({
        eventType: SequenceInteractionKind.OffensiveTransition,
        previous: input.previous,
        targetZone: input.targetZone,
        possessionTeamId: input.sequenceInput.teams.pressingTeam.teamId,
        receiverId: receiver?.id,
        receiverRoleInitials: receiver?.roleInitials ?? String(carrierRole),
        actualBallZone,
        ballCarrierId: receiver?.id ?? String(input.previous.ballCarrierRole),
        matchReason: "tactical target and actual ball zone match after turnover.",
      }),
    };
  }

  const carrierRole = inferBallCarrierAfterMovement({
    team: input.sequenceInput.teams.possessionTeam,
    currentCarrierRole: input.previous.ballCarrierRole,
    currentZone: input.previous.ballLocation,
    targetZone: input.targetZone,
    attackingDirection: input.previous.attackingDirection,
  });
  const receiver = input.sequenceInput.teams.possessionTeam.players.find((player) => player.role === carrierRole);
  const actualBallZone = resolvedContractZoneForReceiver({
    teamId: input.sequenceInput.teams.possessionTeam.teamId,
    receiverRoleInitials: receiver?.roleInitials,
    fallbackZone: receiver?.currentZone ?? input.targetZone,
  });
  const ballContext = updateBallContext({
    previous: input.previous,
    ballLocation: actualBallZone,
    ballCarrierRole: carrierRole,
  });

  return {
    ballContext,
    contract: resolveSemanticBallZoneContract({
      eventType: SequenceInteractionKind.BuildUpUnderPressure,
      previous: input.previous,
      targetZone: input.targetZone,
      possessionTeamId: input.sequenceInput.teams.possessionTeam.teamId,
      receiverId: receiver?.id,
      receiverRoleInitials: receiver?.roleInitials ?? String(carrierRole),
      actualBallZone,
      ballCarrierId: receiver?.id ?? String(input.previous.ballCarrierRole),
    }),
  };
}

function resolveContinuedBallState(input: {
  readonly previous: BallContext;
  readonly team: SpatialTeamContext;
  readonly targetZone: ZoneId;
  readonly eventType: SequenceInteractionKind;
}): { readonly ballContext: BallContext; readonly contract: BallZoneContract } {
  const carrierRole = inferBallCarrierAfterMovement({
    team: input.team,
    currentCarrierRole: input.previous.ballCarrierRole,
    currentZone: input.previous.ballLocation,
    targetZone: input.targetZone,
    attackingDirection: input.previous.attackingDirection,
  });
  const receiver = input.team.players.find((player) => player.role === carrierRole);
  const actualBallZone = resolvedContractZoneForReceiver({
    teamId: input.team.teamId,
    receiverRoleInitials: receiver?.roleInitials,
    fallbackZone: receiver?.currentZone ?? input.targetZone,
  });
  const ballContext = updateBallContext({
    previous: input.previous,
    ballLocation: actualBallZone,
    ballCarrierRole: carrierRole,
  });

  return {
    ballContext,
    contract: resolveSemanticBallZoneContract({
      eventType: input.eventType,
      previous: input.previous,
      targetZone: input.targetZone,
      possessionTeamId: input.team.teamId,
      receiverId: receiver?.id,
      receiverRoleInitials: receiver?.roleInitials ?? String(carrierRole),
      actualBallZone,
      ballCarrierId: receiver?.id ?? String(input.previous.ballCarrierRole),
    }),
  };
}

function inferBallCarrierAfterMovement(input: {
  readonly team: SpatialTeamContext;
  readonly currentCarrierRole: PlayerRole;
  readonly currentZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
}): PlayerRole {
  const exactReceiver = input.team.players.find(
    (player) => player.currentZone === input.targetZone && player.role !== input.currentCarrierRole,
  );
  const currentColumn = Number.parseInt(input.currentZone.slice(1, 2), 10);
  const targetColumn = Number.parseInt(input.targetZone.slice(1, 2), 10);
  const backwardOrSame =
    input.attackingDirection === AttackingDirection.Z1ToZ7 ? targetColumn <= currentColumn : targetColumn >= currentColumn;
  const centralRecycle = input.targetZone.endsWith("-C") && backwardOrSame;

  if (exactReceiver !== undefined || centralRecycle) {
    const recycleReceiver = selectRecycleReceiver({
      players: input.team.players,
      teamId: input.team.teamId,
      targetZone: input.targetZone,
      currentCarrierRole: input.currentCarrierRole,
      tacticalStyle: input.team.tacticalStyle,
    });

    if (recycleReceiver.receiverRole !== null) {
      return recycleReceiver.receiverRole;
    }
  }

  return exactReceiver?.role ?? input.currentCarrierRole;
}

function createSettledSequenceResult(input: {
  readonly finalContext: SequenceTacticalContext;
  readonly steps: readonly SequenceStep[];
  readonly buildUpResult: IsolatedInteractionResult;
  readonly transitionResult: TransitionInteractionResult | null;
}): SequenceResult {
  const sequenceState = evaluateSequenceState(input.finalContext);

  return {
    finalContext: input.finalContext,
    steps: input.steps,
    buildUpResult: input.buildUpResult,
    transitionResult: input.transitionResult,
    constructionResult: null,
    finishingResult: null,
    secondChanceResult: null,
    logs: combineSequenceLogs([
      ...input.steps.map((step) => step.logs),
      createSequenceEndLog(sequenceState.readableState),
    ]),
  };
}

function createsSecondChance(finishingResult: FinishingInteractionResult): boolean {
  return (
    finishingResult.outcome === FinishingOutcome.LiveRebound ||
    finishingResult.outcome === FinishingOutcome.SecondChance ||
    finishingResult.outcome === FinishingOutcome.ScrambleFinish
  );
}

function updateContextAfterSecondChance(
  context: SequenceTacticalContext,
  result: SecondChanceInteractionResult,
): SequenceTacticalContext {
  const scored = result.scoreUpdate !== null;
  const attackingRecovery = result.outcome === SecondChanceOutcome.AttackingRecovery;

  return {
    ...context,
    chaosLevel: Math.max(0, Math.min(100, Math.round(context.chaosLevel + (scored ? 8 : attackingRecovery ? -6 : 5)))),
    possessionStability: scored || attackingRecovery ? SequenceLevel.Medium : SequenceLevel.Low,
    currentDanger: scored ? SequenceLevel.High : attackingRecovery ? SequenceLevel.Medium : SequenceLevel.Low,
    sequenceMomentum: Math.max(0, Math.min(100, Math.round(context.sequenceMomentum + (scored ? 12 : attackingRecovery ? 6 : -4)))),
    tacticalPhaseState: TacticalPhaseState.Settled,
  };
}

function maybeResolveSecondChance(input: {
  readonly sequenceInput: ResolveSequenceInput;
  readonly offensiveTeam: ResolveSequenceInput["teams"]["possessionTeam"];
  readonly defensiveTeam: ResolveSequenceInput["teams"]["pressingTeam"];
  readonly ballContext: BallContext;
  readonly previousSteps: readonly SequenceStep[];
  readonly contextBefore: SequenceTacticalContext;
  readonly finishingResult: FinishingInteractionResult;
  readonly tick: number;
}): {
  readonly steps: readonly SequenceStep[];
  readonly finalContext: SequenceTacticalContext;
  readonly secondChanceResult: SecondChanceInteractionResult | null;
} {
  if (!createsSecondChance(input.finishingResult)) {
    return {
      steps: input.previousSteps,
      finalContext: input.contextBefore,
      secondChanceResult: null,
    };
  }

  const secondChanceResult = resolveSecondChance({
    tick: input.tick,
    offensiveTeam: input.offensiveTeam,
    defensiveTeam: input.defensiveTeam,
    activeZone: input.finishingResult.event.activeZone,
    chaosLevel: input.contextBefore.chaosLevel,
    weakSide: input.sequenceInput.finishingSpatial.weakSide,
    finishingResult: input.finishingResult,
  });
  const contextAfter = updateContextAfterSecondChance(input.contextBefore, secondChanceResult);
  const secondChanceLogs = combineSequenceLogs([
    secondChanceResult.logs,
    createSequenceStateLogs({
      before: input.contextBefore,
      after: contextAfter,
      reason: secondChanceResult.event.summary,
    }),
    [createNextInteractionLog(SequenceInteractionKind.SequenceSettled)],
  ]);
  const secondChanceStep = createSequenceStep({
    tick: input.tick,
    interaction: SequenceInteractionKind.Finishing,
    contextBefore: input.contextBefore,
    contextAfter,
    ballContextBefore: input.ballContext,
    ballContextAfter: input.ballContext,
    logs: secondChanceLogs,
  });

  return {
    steps: [...input.previousSteps, secondChanceStep],
    finalContext: contextAfter,
    secondChanceResult,
  };
}

function resolveConstructionAndFinishing(input: {
  readonly sequenceInput: ResolveSequenceInput;
  readonly buildUpResult: IsolatedInteractionResult;
  readonly transitionResult: TransitionInteractionResult | null;
  readonly previousSteps: readonly SequenceStep[];
  readonly constructionContextBefore: SequenceTacticalContext;
  readonly constructionTick: number;
  readonly ballContext: BallContext;
}): SequenceResult {
  const constructionOffensiveTeam =
    input.transitionResult?.event.offensiveTeamId === input.sequenceInput.teams.pressingTeam.teamId
      ? input.sequenceInput.teams.pressingTeam
      : input.sequenceInput.teams.possessionTeam;
  const constructionDefensiveTeam =
    constructionOffensiveTeam.teamId === input.sequenceInput.teams.possessionTeam.teamId
      ? input.sequenceInput.teams.pressingTeam
      : input.sequenceInput.teams.possessionTeam;
  const constructionResult = resolveConstruction({
    tick: input.constructionTick,
    offensiveTeam: constructionOffensiveTeam,
    defensiveTeam: constructionDefensiveTeam,
    activeZone: input.constructionContextBefore.activeZone,
    offensiveShape: input.sequenceInput.constructionSpatial.offensiveShape,
    defensiveShape: input.sequenceInput.constructionSpatial.defensiveShape,
    density: input.sequenceInput.constructionSpatial.density,
    offensiveSpread: input.sequenceInput.constructionSpatial.offensiveSpread,
    defensiveCompactness: input.sequenceInput.constructionSpatial.defensiveCompactness,
    weakSide: input.sequenceInput.constructionSpatial.weakSide,
    baseTerritorialPressure: input.constructionContextBefore.territorialPressure,
    ballContext: input.ballContext,
    chaosLevel: input.constructionContextBefore.chaosLevel,
    tacticalMemory: input.sequenceInput.tacticalMemory,
  });
  const finishingBallState = resolveContinuedBallState({
    previous: input.ballContext,
    team: constructionOffensiveTeam,
    targetZone: constructionResult.updatedContext.targetZone,
    eventType: SequenceInteractionKind.OffensiveConstruction,
  });
  const finishingBallContext = finishingBallState.ballContext;
  const constructionContextAfter = updateContextAfterConstruction(
    input.constructionContextBefore,
    constructionResult,
  );
  const nextAfterConstruction = determineNextInteraction({
    context: constructionContextAfter,
    buildUpResult: input.buildUpResult,
    transitionResult: input.transitionResult,
    constructionResult,
  });
  const constructionLogs = combineSequenceLogs([
    constructionResult.logs,
    createSequenceStateLogs({
      before: input.constructionContextBefore,
      after: constructionContextAfter,
      reason: constructionResult.event.summary,
    }),
    [createNextInteractionLog(nextAfterConstruction)],
  ]);
  const constructionStep = createSequenceStep({
    tick: input.constructionTick,
    interaction: SequenceInteractionKind.OffensiveConstruction,
    contextBefore: input.constructionContextBefore,
    contextAfter: constructionContextAfter,
    ballContextBefore: input.ballContext,
    ballContextAfter: finishingBallContext,
    ballZoneContract: finishingBallState.contract,
    logs: constructionLogs,
  });

  if (nextAfterConstruction !== SequenceInteractionKind.Finishing) {
    const sequenceState = evaluateSequenceState(constructionContextAfter);
    const steps = [...input.previousSteps, constructionStep];

    return {
      finalContext: constructionContextAfter,
      steps,
      buildUpResult: input.buildUpResult,
      transitionResult: input.transitionResult,
      constructionResult,
      finishingResult: null,
      secondChanceResult: null,
      logs: combineSequenceLogs([
        ...steps.map((step) => step.logs),
        createSequenceEndLog(sequenceState.readableState),
      ]),
    };
  }

  const finishingTick = input.constructionTick + 7;
  const finishingResult = resolveFinishing({
    tick: finishingTick,
    offensiveTeam: constructionOffensiveTeam,
    defensiveTeam: constructionDefensiveTeam,
    activeZone: constructionResult.updatedContext.targetZone,
    dangerLevel:
      constructionResult.updatedContext.finishingTrigger.scoringDanger,
    territorialPressure: constructionResult.territorialPressure,
    chaosLevel: constructionContextAfter.chaosLevel,
    weakSide: input.sequenceInput.finishingSpatial.weakSide,
    defensiveCompactness: input.sequenceInput.finishingSpatial.defensiveCompactness,
    density: input.sequenceInput.finishingSpatial.density,
    ballContext: finishingBallContext,
    allowedScoringTypes: constructionResult.updatedContext.finishingTrigger.possibleScoringTypes,
  });
  const finishingContextAfter = updateContextAfterFinishing(
    constructionContextAfter,
    finishingResult,
  );
  const finishingLogs = combineSequenceLogs([
    finishingResult.logs,
    createSequenceStateLogs({
      before: constructionContextAfter,
      after: finishingContextAfter,
      reason: finishingResult.event.summary,
    }),
    [createNextInteractionLog(SequenceInteractionKind.SequenceSettled)],
  ]);
  const finishingStep = createSequenceStep({
    tick: finishingTick,
    interaction: SequenceInteractionKind.Finishing,
    contextBefore: constructionContextAfter,
    contextAfter: finishingContextAfter,
    ballContextBefore: finishingBallContext,
    ballContextAfter: finishingBallContext,
    logs: finishingLogs,
  });
  const steps = [...input.previousSteps, constructionStep, finishingStep];
  const secondChance = maybeResolveSecondChance({
    sequenceInput: input.sequenceInput,
    offensiveTeam: constructionOffensiveTeam,
    defensiveTeam: constructionDefensiveTeam,
    ballContext: finishingBallContext,
    previousSteps: steps,
    contextBefore: finishingContextAfter,
    finishingResult,
    tick: finishingTick + 2,
  });
  const sequenceState = evaluateSequenceState(secondChance.finalContext);

  return {
    finalContext: secondChance.finalContext,
    steps: secondChance.steps,
    buildUpResult: input.buildUpResult,
    transitionResult: input.transitionResult,
    constructionResult,
    finishingResult,
    secondChanceResult: secondChance.secondChanceResult,
    logs: combineSequenceLogs([
      ...secondChance.steps.map((step) => step.logs),
      createSequenceEndLog(sequenceState.readableState),
    ]),
  };
}

export function resolveSequence(input: ResolveSequenceInput): SequenceResult {
  const buildUpContextBefore = input.initialContext;
  const buildUpResult = resolveBuildUpUnderPressure({
    tick: input.startTick,
    offensiveTeam: input.teams.possessionTeam,
    defensiveTeam: input.teams.pressingTeam,
    activeZone: input.initialContext.activeZone,
    offensiveShape: input.initialSpatial.offensiveShape,
    defensiveShape: input.initialSpatial.defensiveShape,
    density: input.initialSpatial.density,
    defensiveCompactness: input.initialSpatial.defensiveCompactness,
    offensiveSpread: input.initialSpatial.offensiveSpread,
    weakSide: input.initialSpatial.weakSide,
    contextualPressure: input.initialContext.pressureLevel,
    ballContext: input.ballContext,
    chaosLevel: input.initialContext.chaosLevel,
    territorialPressure: input.initialContext.territorialPressure,
    tacticalMemory: input.tacticalMemory,
  });
  const postBuildUpBallState = getTransitionBallState({
    previous: input.ballContext,
    targetZone: buildUpResult.updatedContext.targetZone,
    sequenceInput: input,
    outcome: buildUpResult.outcome,
  });
  const postBuildUpBallContext = postBuildUpBallState.ballContext;
  const buildUpContextAfter = updateContextAfterBuildUp(buildUpContextBefore, buildUpResult);
  const nextAfterBuildUp = determineNextInteraction({
    context: buildUpContextAfter,
    buildUpResult,
    transitionResult: null,
  });
  const buildUpLogs = combineSequenceLogs([
    buildUpResult.logs,
    createSequenceStateLogs({
      before: buildUpContextBefore,
      after: buildUpContextAfter,
      reason: buildUpResult.event.summary,
    }),
    [createNextInteractionLog(nextAfterBuildUp)],
  ]);
  const buildUpStep = createSequenceStep({
    tick: input.startTick,
    interaction: SequenceInteractionKind.BuildUpUnderPressure,
    contextBefore: buildUpContextBefore,
    contextAfter: buildUpContextAfter,
    ballContextBefore: input.ballContext,
    ballContextAfter: postBuildUpBallContext,
    ballZoneContract: postBuildUpBallState.contract,
    logs: buildUpLogs,
  });

  if (
    nextAfterBuildUp === SequenceInteractionKind.OffensiveConstruction ||
    nextAfterBuildUp === SequenceInteractionKind.OffensiveConstructionPending
  ) {
    return resolveConstructionAndFinishing({
      sequenceInput: input,
      buildUpResult,
      transitionResult: null,
      previousSteps: [buildUpStep],
      constructionContextBefore: buildUpContextAfter,
      constructionTick: input.startTick + 8,
      ballContext: postBuildUpBallContext,
    });
  }

  if (nextAfterBuildUp !== SequenceInteractionKind.OffensiveTransition) {
    return {
      finalContext: buildUpContextAfter,
      steps: [buildUpStep],
      buildUpResult,
      transitionResult: null,
      constructionResult: null,
      finishingResult: null,
      secondChanceResult: null,
      logs: buildUpLogs,
    };
  }

  const transitionTick = input.startTick + 2;
  const transitionTeams = getTransitionTeams(input, buildUpResult.outcome);
  const transitionResult = resolveTransition({
    tick: transitionTick,
    trigger: selectTransitionTrigger(buildUpResult.outcome),
    previousOutcome: buildUpResult.outcome,
    offensiveTeam: transitionTeams.offensiveTeam,
    defensiveTeam: transitionTeams.defensiveTeam,
    activeZone: buildUpContextAfter.activeZone,
    offensiveShape: input.transitionSpatial.offensiveShape,
    defensiveShape: input.transitionSpatial.defensiveShape,
    density: input.transitionSpatial.density,
    offensiveSpread: input.transitionSpatial.offensiveSpread,
    defensiveCompactness: input.transitionSpatial.defensiveCompactness,
    weakSide: input.transitionSpatial.weakSide,
    contextualPressure: PressureLevel.High,
    ballContext: postBuildUpBallContext,
    chaosLevel: buildUpContextAfter.chaosLevel,
    territorialPressure: buildUpContextAfter.territorialPressure,
    tacticalMemory: input.tacticalMemory,
  });
  const postTransitionBallState = resolveContinuedBallState({
    previous: postBuildUpBallContext,
    team: transitionTeams.offensiveTeam,
    targetZone: transitionResult.updatedContext.targetZone,
    eventType: SequenceInteractionKind.OffensiveTransition,
  });
  const postTransitionBallContext = updateBallContext({
    previous: postTransitionBallState.ballContext,
    ballLocation: postTransitionBallState.ballContext.ballLocation,
    possessionTeamId: transitionTeams.offensiveTeam.teamId,
    ballCarrierRole: postTransitionBallState.ballContext.ballCarrierRole,
  });
  const transitionContextAfter = updateContextAfterTransition(buildUpContextAfter, transitionResult);
  const nextAfterTransition = determineNextInteraction({
    context: transitionContextAfter,
    buildUpResult,
    transitionResult,
  });
  const transitionLogs = combineSequenceLogs([
    transitionResult.logs,
    createSequenceStateLogs({
      before: buildUpContextAfter,
      after: transitionContextAfter,
      reason: transitionResult.event.summary,
    }),
    [createNextInteractionLog(nextAfterTransition)],
  ]);
  const transitionStep = createSequenceStep({
    tick: transitionTick,
    interaction: SequenceInteractionKind.OffensiveTransition,
    contextBefore: buildUpContextAfter,
    contextAfter: transitionContextAfter,
    ballContextBefore: postBuildUpBallContext,
    ballContextAfter: postTransitionBallContext,
    ballZoneContract: postTransitionBallState.contract,
    logs: transitionLogs,
  });

  if (nextAfterTransition === SequenceInteractionKind.Finishing) {
    const finishingTick = transitionTick + 4;
    const finishingTrigger = transitionResult.updatedContext.finishingTrigger;
    const finishingResult = resolveFinishing({
      tick: finishingTick,
      offensiveTeam: transitionTeams.offensiveTeam,
      defensiveTeam: transitionTeams.defensiveTeam,
      activeZone: transitionResult.updatedContext.targetZone,
      dangerLevel: finishingTrigger?.scoringDanger ?? FinishingDangerLevel.Medium,
      territorialPressure: transitionContextAfter.territorialPressure,
      chaosLevel: transitionContextAfter.chaosLevel,
      weakSide: input.finishingSpatial.weakSide,
      defensiveCompactness: input.finishingSpatial.defensiveCompactness,
      density: input.finishingSpatial.density,
      ballContext: postTransitionBallContext,
      allowedScoringTypes: finishingTrigger?.possibleScoringTypes ?? [],
    });
    const finishingContextAfter = updateContextAfterFinishing(
      transitionContextAfter,
      finishingResult,
    );
    const finishingLogs = combineSequenceLogs([
      finishingResult.logs,
      createSequenceStateLogs({
        before: transitionContextAfter,
        after: finishingContextAfter,
        reason: finishingResult.event.summary,
      }),
      [createNextInteractionLog(SequenceInteractionKind.SequenceSettled)],
    ]);
    const finishingStep = createSequenceStep({
      tick: finishingTick,
      interaction: SequenceInteractionKind.Finishing,
      contextBefore: transitionContextAfter,
      contextAfter: finishingContextAfter,
      ballContextBefore: postTransitionBallContext,
      ballContextAfter: postTransitionBallContext,
      logs: finishingLogs,
    });
    const steps = [buildUpStep, transitionStep, finishingStep];
    const secondChance = maybeResolveSecondChance({
      sequenceInput: input,
      offensiveTeam: transitionTeams.offensiveTeam,
      defensiveTeam: transitionTeams.defensiveTeam,
      ballContext: postTransitionBallContext,
      previousSteps: steps,
      contextBefore: finishingContextAfter,
      finishingResult,
      tick: finishingTick + 2,
    });
    const sequenceState = evaluateSequenceState(secondChance.finalContext);

    return {
      finalContext: secondChance.finalContext,
      steps: secondChance.steps,
      buildUpResult,
      transitionResult,
      constructionResult: null,
      finishingResult,
      secondChanceResult: secondChance.secondChanceResult,
      logs: combineSequenceLogs([
        ...secondChance.steps.map((step) => step.logs),
        createSequenceEndLog(sequenceState.readableState),
      ]),
    };
  }

  if (nextAfterTransition !== SequenceInteractionKind.OffensiveConstruction) {
    return createSettledSequenceResult({
      finalContext: transitionContextAfter,
      steps: [buildUpStep, transitionStep],
      buildUpResult,
      transitionResult,
    });
  }

  return resolveConstructionAndFinishing({
    sequenceInput: input,
    buildUpResult,
    transitionResult,
    previousSteps: [buildUpStep, transitionStep],
    constructionContextBefore: transitionContextAfter,
    constructionTick: transitionTick + 12,
    ballContext: postTransitionBallContext,
  });
}
