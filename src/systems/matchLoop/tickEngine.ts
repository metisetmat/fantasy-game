import { TacticalPhaseState } from "../tacticalState";
import { evolveIntent, selectPrimaryIntent, tickIntents, type IntentChange, type IntentChangeType, type PlayerIntent } from "../intent";
import { TacticalStyle } from "../../models/tactics";
import type { PlayerMatchState } from "../players";
import { resolvePlayerTrajectory } from "../movement";
import { tickPlayerPerceptions } from "../perception";
import { AttackingDirection } from "../spatial/intention";
import { nextDeterministicRoll } from "./deterministicSeed";
import { advanceMatchClock } from "./matchClock";
import type { TickResult } from "./tickResult";
import {
  MatchLoopEventType,
  type MatchLoopEvent,
  type MatchLoopTimelineEntry,
  type TeamTacticalTickState,
  type WorldState,
  summarizeWorldState,
} from "./worldState";

export interface TickEngineConfig {
  readonly tickRate: number;
}

export interface TickEngineResult {
  readonly world: WorldState;
  readonly timeline: readonly MatchLoopTimelineEntry[];
  readonly tickResults: readonly TickResult[];
}

function summarizeTeamIntents(players: readonly PlayerMatchState[]): readonly string[] {
  const byTeam = new Map<string, string[]>();
  for (const player of players) {
    const entries = byTeam.get(player.teamId) ?? [];
    entries.push(`${player.roleInitials}:${player.primaryIntent?.type ?? "NONE"}`);
    byTeam.set(player.teamId, entries);
  }

  return [...byTeam.entries()].map(([teamId, entries]) => `${teamId}: ${entries.join(", ")}`);
}

function updatePlayerIntents(world: WorldState, tick: number): {
  readonly players: readonly PlayerMatchState[];
  readonly events: readonly MatchLoopEvent[];
  readonly changes: readonly IntentChange[];
} {
  const changes: IntentChange[] = [];
  const movedPlayers = world.playerStates.map((player) => {
    const result = tickIntents({
      tick,
      intents: player.activeIntents,
    });
    changes.push(...result.changes);
    const tacticalStyle = player.teamId === "blitz" ? TacticalStyle.Blitz : TacticalStyle.Control;
    const evolvedIntents = result.intents.map((intent) => {
      const evolution = evolveIntent({
        intent,
        tick,
        role: player.role,
        tacticalStyle,
        phaseState: world.phaseState,
      });

      if (evolution.change !== null) {
        changes.push(evolution.change);
      }

      return evolution.intent;
    }).filter((intent): intent is PlayerIntent => intent !== null);
    const primaryIntent = selectPrimaryIntent(evolvedIntents);
    const attackingDirection = player.teamId === "blitz" ? AttackingDirection.Z7ToZ1 : AttackingDirection.Z1ToZ7;
    const movement = resolvePlayerTrajectory({
      playerId: player.playerId,
      role: player.role,
      originZone: player.zone,
      ballZone: world.ballZone,
      attackingDirection,
      tick,
      intent: primaryIntent,
      fatigue: player.fatigue,
      speedAttribute: player.visibleAttributes?.speed ?? 60,
    });

    return {
      ...player,
      activeIntents: evolvedIntents,
      previousIntent: player.primaryIntent,
      primaryIntent,
      currentIntent: primaryIntent?.type ?? player.currentIntent,
      intentStartedTick: primaryIntent?.startedTick ?? null,
      intentExpiresTick: primaryIntent?.expiresTick ?? null,
      intentAgeTicks: primaryIntent === null ? 0 : Math.max(0, tick - primaryIntent.startedTick),
      intentConfidence: primaryIntent?.confidence ?? 0,
      intentTargetZone: primaryIntent?.targetZone ?? null,
      intentOriginReason: primaryIntent?.tacticalReason ?? "no active intent",
      intentEvolutionStory: primaryIntent?.tacticalStory ?? "no intent evolution",
      intentUrgency: primaryIntent?.urgency ?? 0,
      intentEvolutionDirection: primaryIntent?.evolutionDirection ?? "STABLE",
      currentPosition: movement.currentPosition,
      targetPosition: movement.targetPosition,
      activeTrajectory: movement.activeTrajectory,
      velocity: movement.velocity,
      facingDirection: movement.facingDirection,
      movementState: movement.movementState,
      sprinting: movement.sprinting,
      recovering: movement.recovering,
      estimatedArrivalTick: movement.estimatedArrivalTick,
      movementVector: movement.movementVector,
    };
  });

  const players = tickPlayerPerceptions({
    players: movedPlayers,
    ballZone: world.ballZone,
    tick,
    chaos: world.tacticalPhaseState === TacticalPhaseState.BrokenPlay ? 78 : world.tacticalPhaseState === TacticalPhaseState.DangerPhase ? 66 : 38,
  });

  return {
    players,
    changes,
    events: [
      {
        tick,
        type: MatchLoopEventType.PlaceholderIntentUpdate,
        description: `player intents refreshed (${changes.length} lifecycle changes); movement trajectories and perception refreshed`,
      },
    ],
  };
}

function updatePlayerIntentsPlaceholder(world: WorldState): readonly MatchLoopEvent[] {
  return [
    {
      tick: world.tick + 1,
      type: MatchLoopEventType.PlaceholderIntentUpdate,
      description: "player intents placeholder evaluated",
    },
  ];
}

function updateTeamTacticalStatePlaceholder(world: WorldState): readonly TeamTacticalTickState[] {
  return world.teamTacticalStates.map((teamState) => ({
    ...teamState,
    possessionIntent:
      world.possessionTeamId === teamState.teamId ? "maintain current event context" : teamState.possessionIntent,
    defensiveIntent:
      world.possessionTeamId === teamState.teamId ? teamState.defensiveIntent : "hold abstract structure",
  }));
}

function updateSpatialStatePlaceholder(world: WorldState): readonly MatchLoopEvent[] {
  return [
    {
      tick: world.tick + 1,
      type: MatchLoopEventType.PlaceholderSpatialUpdate,
      description: `spatial state placeholder retained ball in ${world.ball.zone}`,
    },
  ];
}

function detectEventsPlaceholder(world: WorldState, roll: number): readonly MatchLoopEvent[] {
  return [
    {
      tick: world.tick + 1,
      type: MatchLoopEventType.PlaceholderEventDetection,
      description: `event detection placeholder roll ${roll.toFixed(5)}`,
    },
  ];
}

function createTimelineEntry(world: WorldState, events: readonly MatchLoopEvent[]): MatchLoopTimelineEntry {
  return {
    tick: world.tick,
    timeSeconds: world.time.elapsedSeconds,
    phaseState: world.phaseState,
    ballStatus: world.ball.status,
    possessionTeamId: world.possessionTeamId,
    steps: [
      "match clock advanced",
      "player intents placeholder updated",
      "team tactical state placeholder updated",
      "spatial state placeholder updated",
      "event detection placeholder evaluated",
      ...events.map((event) => event.description),
    ],
  };
}

export function tickWorldState(world: WorldState): WorldState {
  return tickWorldStateWithResult(world).nextWorldState;
}

export function tickWorldStateWithResult(world: WorldState): TickResult & { readonly nextWorldState: WorldState } {
  const roll = nextDeterministicRoll(world.seed);
  const nextTick = world.tick + 1;
  const intentUpdate = updatePlayerIntents(world, nextTick);
  const playerIntentEvents = intentUpdate.events;
  const teamTacticalStates = updateTeamTacticalStatePlaceholder(world);
  const spatialEvents = updateSpatialStatePlaceholder(world);
  const detectionEvents = detectEventsPlaceholder(world, roll.value);
  const activeEvents = [...playerIntentEvents, ...spatialEvents, ...detectionEvents];
  const nextWorld: WorldState = {
    ...world,
    tick: nextTick,
    time: advanceMatchClock(world.time),
    elapsedMs: Math.round((nextTick / world.time.tickRate) * 1000),
    playerStates: intentUpdate.players,
    players: intentUpdate.players,
    teamStates: teamTacticalStates,
    teamTacticalStates,
    activeEvents,
    pendingContinuations: world.pendingContinuations,
    phaseState: world.phaseState ?? TacticalPhaseState.StablePossession,
    tacticalPhaseState: world.phaseState ?? TacticalPhaseState.StablePossession,
    seed: roll.seed,
    activeIntentCount: intentUpdate.players.reduce((sum, player) => sum + player.activeIntents.length, 0),
    teamIntentSummary: summarizeTeamIntents(intentUpdate.players),
    recentlyResolvedIntents: intentUpdate.changes,
  };
  const timelineEntry = createTimelineEntry(nextWorld, activeEvents);

  const nextWorldState = {
    ...nextWorld,
    timeline: [...world.timeline, timelineEntry],
  };
  const changesOfType = (changeType: IntentChangeType): readonly IntentChange[] =>
    intentUpdate.changes.filter((change) => change.changeType === changeType);

  return {
    tick: nextTick,
    previousWorldStateSummary: summarizeWorldState(world),
    nextWorldStateSummary: summarizeWorldState(nextWorldState),
    generatedEvents: activeEvents,
    resolvedEvents: [],
    newIntents: changesOfType("CREATED"),
    resolvedIntents: changesOfType("RESOLVED"),
    expiredIntents: changesOfType("EXPIRED"),
    supersededIntents: changesOfType("SUPERSEDED"),
    intentChanges: intentUpdate.changes,
    debugNotes: timelineEntry.steps,
    nextWorldState,
  };
}

export function runTickEngine(input: {
  readonly initialWorld: WorldState;
  readonly ticks: number;
}): TickEngineResult {
  const tickCount = Math.max(0, Math.trunc(input.ticks));
  let world = input.initialWorld;
  const tickResults: TickResult[] = [];

  for (let index = 0; index < tickCount; index += 1) {
    const result = tickWorldStateWithResult(world);
    tickResults.push(result);
    world = result.nextWorldState;
  }

  return {
    world,
    timeline: world.timeline,
    tickResults,
  };
}

export function createTimelineSignature(timeline: readonly MatchLoopTimelineEntry[]): string {
  return timeline
    .map((entry) =>
      [
        entry.tick,
        entry.timeSeconds.toFixed(2),
        entry.phaseState,
        entry.ballStatus,
        entry.possessionTeamId ?? "NONE",
        entry.steps.join("|"),
      ].join(":"),
    )
    .join("\n");
}
