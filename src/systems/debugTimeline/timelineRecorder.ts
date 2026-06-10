import type { MiniMatchResult, MiniMatchSequenceRecord } from "../../simulation/miniMatch";
import { DEFAULT_SIMULATION_CONFIG } from "../matchLoop";
import { createDeterministicSeed, nextDeterministicRoll } from "../matchLoop";
import { resolveCanonicalEventActors, type CanonicalEventActorModel } from "../events";
import { IntentOutcome, IntentTransition, createIntentChangesForPlayers } from "../intent";
import type { SpatialTeamContext } from "../spatial";
import { SpatialMoveType, type TargetZoneSelection } from "../spatial/intention";
import type {
  DebugTimelineEvent,
  DebugTimelineReplay,
  DebugTimelineResolverOutcome,
  DebugTimelineSeedInfo,
  DebugTimelineStateChange,
  DebugTimelineStepInput,
  DebugWorldStateSummary,
} from "./timelineEvent";

export const DEFAULT_DEBUG_TIMELINE_SEED = 7_301_991;

function createEventId(sequenceNumber: number, actionNumber: number): string {
  return `dt-s${sequenceNumber}-a${actionNumber}`;
}

function createWorldStateSummary(input: DebugTimelineStepInput): DebugWorldStateSummary {
  return {
    tick: input.tick,
    phaseState: input.contextBefore.tacticalPhaseState,
    possessionTeamId: input.ballContextBefore.possessionTeamId,
    ballZone: input.ballContextBefore.ballLocation,
    chaosLevel: input.contextBefore.chaosLevel,
    territorialPressure: input.contextBefore.territorialPressure,
    currentDanger: input.contextBefore.currentDanger,
    possessionStability: input.contextBefore.possessionStability,
  };
}

function createWorldStateSummaryAfter(input: DebugTimelineStepInput): DebugWorldStateSummary {
  return {
    tick: input.tick,
    phaseState: input.contextAfter.tacticalPhaseState,
    possessionTeamId: input.ballContextAfter.possessionTeamId,
    ballZone: input.ballContextAfter.ballLocation,
    chaosLevel: input.contextAfter.chaosLevel,
    territorialPressure: input.contextAfter.territorialPressure,
    currentDanger: input.contextAfter.currentDanger,
    possessionStability: input.contextAfter.possessionStability,
  };
}

function createStateChanges(input: DebugTimelineStepInput): readonly DebugTimelineStateChange[] {
  const changes: DebugTimelineStateChange[] = [];

  function addChange(field: string, before: string | number, after: string | number): void {
    if (before !== after) {
      changes.push({ field, before, after });
    }
  }

  addChange("ballZone", input.ballContextBefore.ballLocation, input.ballContextAfter.ballLocation);
  addChange("possessionTeamId", input.ballContextBefore.possessionTeamId, input.ballContextAfter.possessionTeamId);
  addChange("chaosLevel", input.contextBefore.chaosLevel, input.contextAfter.chaosLevel);
  addChange("territorialPressure", input.contextBefore.territorialPressure, input.contextAfter.territorialPressure);
  addChange("currentDanger", input.contextBefore.currentDanger, input.contextAfter.currentDanger);
  addChange("possessionStability", input.contextBefore.possessionStability, input.contextAfter.possessionStability);
  addChange("phaseState", input.contextBefore.tacticalPhaseState, input.contextAfter.tacticalPhaseState);

  return changes;
}

function hashSummary(summary: DebugWorldStateSummary): string {
  const source = [
    summary.tick,
    summary.phaseState,
    summary.possessionTeamId,
    summary.ballZone,
    summary.chaosLevel,
    summary.territorialPressure,
    summary.currentDanger,
    summary.possessionStability,
  ].join("|");
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

function createTimelineTargetSelection(input: DebugTimelineStepInput): TargetZoneSelection {
  const contract = input.ballZoneContract;

  return {
    fromZone: input.ballContextBefore.ballLocation,
    selectedZone: contract?.tacticalTargetCluster ?? input.ballContextAfter.ballLocation,
    moveType:
      input.ballContextBefore.ballLocation === input.ballContextAfter.ballLocation
        ? SpatialMoveType.Finishing
        : SpatialMoveType.Progression,
    receiverId: contract?.selectedReceiverId ?? null,
    receiverRole: null,
    receiverInitials: null,
    receiverZone: contract?.receiverResolvedZone ?? null,
    reason: "timeline reconstruction from sequence step",
    evaluations: [],
    optionEvaluations: [],
  };
}

function summarizePlayerIntents(players: readonly SpatialTeamContext["players"][number][]): readonly string[] {
  return players.map(
    (player) =>
      `${player.id}:${player.roleInitials ?? player.role}:${player.primaryIntent?.type ?? "NONE"}:${player.primaryIntent?.priority ?? 0}:urgency ${player.primaryIntent?.urgency ?? 0}`,
  );
}

function summarizeMovementFacts(players: readonly SpatialTeamContext["players"][number][]): readonly string[] {
  return players
    .filter((player) => player.primaryIntent !== null && player.primaryIntent !== undefined)
    .map(
      (player) =>
        `${player.id}:${player.roleInitials ?? player.role}:${player.primaryIntent?.type ?? "NONE"} -> trajectory intent target ${player.primaryIntent?.targetZone ?? player.currentZone}`,
    );
}

function createTimelineEvolutionChanges(players: readonly SpatialTeamContext["players"][number][], tick: number) {
  return players.flatMap((player) => {
    const primary = player.primaryIntent;

    if (primary === null || primary === undefined || primary.previousTypes.length === 0) {
      return [];
    }

    const previousIntent = primary.previousTypes[primary.previousTypes.length - 1] ?? null;

    return [
      {
        playerId: player.id,
        previousIntent,
        nextIntent: primary.type,
        changeType: "SUPERSEDED" as const,
        transition: IntentTransition.Evolve,
        outcome: IntentOutcome.PartialSuccess,
        reason: primary.tacticalStory,
        tick,
        chainId: primary.chainId,
      },
    ];
  });
}

function createUtilityScores(input: DebugTimelineStepInput) {
  return [
    { label: "chaos before", value: input.contextBefore.chaosLevel, max: 100 },
    { label: "territorial pressure before", value: input.contextBefore.territorialPressure, max: 100 },
    { label: "sequence momentum before", value: input.contextBefore.sequenceMomentum, max: 100 },
    { label: "chaos after", value: input.contextAfter.chaosLevel, max: 100 },
    { label: "territorial pressure after", value: input.contextAfter.territorialPressure, max: 100 },
    { label: "sequence momentum after", value: input.contextAfter.sequenceMomentum, max: 100 },
  ];
}

function createSeedInfo(input: {
  readonly initialSeed: number;
  readonly eventSeed: number;
  readonly deterministicRoll: number;
}): DebugTimelineSeedInfo {
  return {
    initialSeed: input.initialSeed,
    eventSeed: input.eventSeed,
    deterministicRoll: Number(input.deterministicRoll.toFixed(8)),
  };
}

function createTimelineEvent(input: DebugTimelineStepInput & {
  readonly seedInfo: DebugTimelineSeedInfo;
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
}): DebugTimelineEvent {
  const id = createEventId(input.sequenceNumber, input.actionNumber);
  const stateBeforeSummary = createWorldStateSummary(input);
  const stateAfterSummary = createWorldStateSummaryAfter(input);
  const reportAnchors = [`sequence-${input.sequenceNumber}`, `sequence-${input.sequenceNumber}-action-${input.actionNumber}`];
  const stateChanges = createStateChanges(input);
  const actorModel: CanonicalEventActorModel = resolveCanonicalEventActors({
    eventId: id,
    tick: input.tick,
    offensiveTeam: input.offensiveTeam,
    defensiveTeam: input.defensiveTeam,
    ballContext: input.ballContextBefore,
    targetSelection: createTimelineTargetSelection(input),
    ballZoneContract: input.ballZoneContract,
    eventType: input.interaction,
  });
  const baseIntentChanges = createIntentChangesForPlayers({
    previousPlayers: input.offensiveTeam.players,
    nextPlayers: input.offensiveTeam.players,
    tick: input.tick,
  });
  const actor = input.offensiveTeam.players.find((player) => player.id === actorModel.primaryActorId);
  const receiver = input.offensiveTeam.players.find((player) => player.id === actorModel.receiverId);
  const postActionCarrier = input.offensiveTeam.players.find((player) => player.id === actorModel.ballCarrierAfterId);
  const refreshedActorIntent =
    actor?.primaryIntent === undefined || actor.primaryIntent === null
      ? []
      : [
          {
            playerId: actor.id,
            previousIntent: actor.primaryIntent.type,
            nextIntent: actor.primaryIntent.type,
            changeType: "REFRESHED" as const,
            reason: `primary intent persisted through ${input.interaction}`,
            tick: input.tick,
          },
        ];
  const intentChanges = [
    ...baseIntentChanges,
    ...createTimelineEvolutionChanges([...input.offensiveTeam.players, ...input.defensiveTeam.players], input.tick),
    ...refreshedActorIntent,
  ];

  return {
    id,
    eventId: id,
    sequenceNumber: input.sequenceNumber,
    actionNumber: input.actionNumber,
    tick: input.tick,
    timestampMs: Math.round((input.tick / DEFAULT_SIMULATION_CONFIG.tickRate) * 1000),
    eventType: input.interaction,
    possessionTeamId: input.ballContextBefore.possessionTeamId,
    ballZone: input.ballContextBefore.ballLocation,
    ballCarrierId: actorModel.ballCarrierBeforeId,
    actorModel,
    worldStateBeforeHash: hashSummary(stateBeforeSummary),
    worldStateAfterHash: hashSummary(stateAfterSummary),
    playerStateChanges: stateChanges.map((change) => `${change.field}: ${change.before} -> ${change.after}`),
    ballCarrierBeforeId: actorModel.ballCarrierBeforeId,
    ballCarrierAfterId: actorModel.ballCarrierAfterId,
    receiverId: actorModel.receiverId,
    goalkeeperId: actorModel.goalkeeperId,
    snapshotBeforePath: `reports/snapshots/sequence-${input.sequenceNumber}-action-${input.actionNumber}-before.svg`,
    snapshotAfterPath: `reports/snapshots/sequence-${input.sequenceNumber}-action-${input.actionNumber}-after.svg`,
    playerIntentSummaryBefore: summarizePlayerIntents(input.offensiveTeam.players),
    playerIntentSummaryAfter: summarizePlayerIntents(input.offensiveTeam.players),
    actorPrimaryIntent: actor?.primaryIntent?.type ?? null,
    receiverPrimaryIntent: receiver?.primaryIntent?.type ?? null,
    decisionActorIntent: actor?.primaryIntent?.type ?? null,
    selectedReceiverIntent: receiver?.primaryIntent?.type ?? null,
    postActionCarrierIntent: postActionCarrier?.primaryIntent?.type ?? null,
    defenderIntentSummary: summarizePlayerIntents(input.defensiveTeam.players),
    intentChanges,
    intentDebugLabel: "primary intent timeline with persistent player intent transitions",
    trajectorySummary: summarizeMovementFacts([...input.offensiveTeam.players, ...input.defensiveTeam.players]),
    arrivalTiming: [
      `tick ${input.tick}: movement timing is derived by snapshot trajectory state from player intents and tactical zones`,
    ],
    movementFacts: summarizeMovementFacts(input.offensiveTeam.players),
    worldStateSummary: stateBeforeSummary,
    stateBeforeSummary,
    stateAfterSummary,
    actor: {
      teamId: input.ballContextBefore.possessionTeamId,
      role: input.ballContextBefore.ballCarrierRole,
      ballZone: input.ballContextBefore.ballLocation,
    },
    actorId: actorModel.primaryActorId,
    actorRole: actorModel.primaryActorRole,
    actorIntent: input.interaction,
    intent: input.interaction,
    utilityScores: createUtilityScores(input),
    spatialFacts: {
      fromZone: input.ballContextBefore.ballLocation,
      toZone: input.ballContextAfter.ballLocation,
      attackingDirection: input.ballContextBefore.attackingDirection,
      weakSideExposure: input.contextBefore.weakSideExposure,
      pressureLevel: input.contextBefore.pressureLevel,
    },
    selectedAction: {
      interaction: input.interaction,
      targetZone: input.ballZoneContract?.tacticalTargetCluster ?? input.ballContextAfter.ballLocation,
      tacticalTargetCluster: input.ballZoneContract?.tacticalTargetCluster,
      actualBallZoneAfter: input.ballZoneContract?.actualBallZone ?? input.ballContextAfter.ballLocation,
      ballZoneAfterSemantics: input.ballZoneContract?.ballZoneAfterSemantics,
      possessionTeamIdAfter: input.ballContextAfter.possessionTeamId,
    },
    ballZoneContract: input.ballZoneContract,
    actionSemanticContract: actorModel.actionSemanticContract,
    resolverInputs: {
      activeZone: input.contextBefore.activeZone,
      pressureLevel: input.contextBefore.pressureLevel,
      phaseState: input.contextBefore.tacticalPhaseState,
    },
    resolverOutcome: input.resolverOutcome,
    stateChanges,
    seedInfo: input.seedInfo,
    reportAnchors,
    reportClaimRefs: reportAnchors,
  };
}

function getResolverOutcome(record: MiniMatchSequenceRecord, actionNumber: number): DebugTimelineResolverOutcome {
  const step = record.result.steps[actionNumber - 1];

  if (step === undefined) {
    return {
      outcome: "unknown",
      summary: "no sequence step available",
    };
  }

  if (step.interaction === "build_up_under_pressure" && record.result.buildUpResult !== null) {
    return {
      outcome: record.result.buildUpResult.outcome,
      summary: record.result.buildUpResult.event.summary,
    };
  }

  if (step.interaction === "offensive_transition" && record.result.transitionResult !== null) {
    return {
      outcome: record.result.transitionResult.outcome,
      summary: record.result.transitionResult.event.summary,
    };
  }

  if (step.interaction === "offensive_construction" && record.result.constructionResult !== null) {
    return {
      outcome: record.result.constructionResult.outcome,
      summary: record.result.constructionResult.event.summary,
    };
  }

  if (step.interaction === "finishing" && record.result.finishingResult !== null) {
    return {
      outcome: record.result.finishingResult.outcome,
      summary: record.result.finishingResult.event.summary,
    };
  }

  if (record.result.secondChanceResult !== null) {
    return {
      outcome: record.result.secondChanceResult.outcome,
      summary: record.result.secondChanceResult.event.summary,
    };
  }

  return {
    outcome: step.contextAfter.currentInteraction,
    summary: "sequence step resolved without a dedicated terminal resolver",
  };
}

export function recordMiniMatchDebugTimeline(input: {
  readonly result: MiniMatchResult;
  readonly seed?: number;
}): DebugTimelineReplay {
  const initialSeed = input.seed ?? DEFAULT_DEBUG_TIMELINE_SEED;
  let seed = createDeterministicSeed(initialSeed);
  const events: DebugTimelineEvent[] = [];

  for (const record of input.result.state.records) {
    record.result.steps.forEach((step, stepIndex) => {
      const roll = nextDeterministicRoll(seed);
      const actionNumber = stepIndex + 1;
      const seedInfo = createSeedInfo({
        initialSeed,
        eventSeed: roll.seed.currentSeed,
        deterministicRoll: roll.value,
      });

      seed = roll.seed;
      events.push(
        createTimelineEvent({
          sequenceNumber: record.sequenceNumber,
          actionNumber,
          tick: step.tick,
          interaction: step.interaction,
          contextBefore: step.contextBefore,
          contextAfter: step.contextAfter,
          ballContextBefore: step.ballContextBefore,
          ballContextAfter: step.ballContextAfter,
          ballZoneContract: step.ballZoneContract,
          resolverOutcome: getResolverOutcome(record, actionNumber),
          seedInfo,
          offensiveTeam:
            record.setup.possessionTeam.teamId === step.ballContextBefore.possessionTeamId
              ? record.setup.possessionTeam
              : record.setup.pressingTeam,
          defensiveTeam:
            record.setup.possessionTeam.teamId === step.ballContextBefore.possessionTeamId
              ? record.setup.pressingTeam
              : record.setup.possessionTeam,
        }),
      );
    });
  }

  return {
    version: 1,
    seed: initialSeed,
    generatedFrom: "mini_match",
    events,
  };
}
