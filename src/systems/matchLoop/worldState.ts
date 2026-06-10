import type { TeamId } from "../../core/ids";
import type { TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { ScoreState } from "../../models/match";
import type { PlayerMatchState } from "../players";
import type { TacticalPhaseState } from "../tacticalState";
import type { BallState } from "./ballState";
import { BallStateStatus } from "./ballState";
import type { ContinuationDecision } from "./continuation";
import type { IntentChange } from "../intent";
import type { DeterministicSeedState } from "./deterministicSeed";
import type { MatchClock } from "./matchClock";

export enum MatchLoopEventType {
  PlaceholderIntentUpdate = "PLACEHOLDER_INTENT_UPDATE",
  PlaceholderTeamTacticalUpdate = "PLACEHOLDER_TEAM_TACTICAL_UPDATE",
  PlaceholderSpatialUpdate = "PLACEHOLDER_SPATIAL_UPDATE",
  PlaceholderEventDetection = "PLACEHOLDER_EVENT_DETECTION",
  LegacyActionResolved = "LEGACY_ACTION_RESOLVED",
}

export interface TeamTacticalTickState {
  readonly teamId: TeamId;
  readonly possessionIntent: string;
  readonly defensiveIntent: string;
  readonly pressure: number;
  readonly structure: number;
}

export interface MatchLoopEvent {
  readonly tick: TacticalTick;
  readonly type: MatchLoopEventType;
  readonly description: string;
}

export interface MatchLoopTimelineEntry {
  readonly tick: TacticalTick;
  readonly timeSeconds: number;
  readonly phaseState: TacticalPhaseState;
  readonly ballStatus: BallState["status"];
  readonly possessionTeamId: TeamId | null;
  readonly steps: readonly string[];
}

export interface WorldState {
  readonly matchId: string;
  readonly seedValue: number;
  readonly tick: TacticalTick;
  readonly time: MatchClock;
  readonly elapsedMs: number;
  readonly score: ScoreState;
  readonly ballState: BallStateStatus;
  readonly ballZone: ZoneId;
  readonly ballCarrierId: string | null;
  readonly ball: BallState;
  readonly possessionTeamId: TeamId | null;
  readonly playerStates: readonly PlayerMatchState[];
  readonly players: readonly PlayerMatchState[];
  readonly teamStates: readonly TeamTacticalTickState[];
  readonly teamTacticalStates: readonly TeamTacticalTickState[];
  readonly tacticalPhaseState: TacticalPhaseState;
  readonly activeEvents: readonly MatchLoopEvent[];
  readonly pendingContinuations: readonly ContinuationDecision[];
  readonly phaseState: TacticalPhaseState;
  readonly seed: DeterministicSeedState;
  readonly lastResolvedEventId: string | null;
  readonly activeIntentCount: number;
  readonly teamIntentSummary: readonly string[];
  readonly recentlyResolvedIntents: readonly IntentChange[];
  readonly timeline: readonly MatchLoopTimelineEntry[];
}

export interface WorldStateSummary {
  readonly matchId: string;
  readonly tick: TacticalTick;
  readonly elapsedMs: number;
  readonly score: ScoreState;
  readonly possessionTeamId: TeamId | null;
  readonly ballState: BallStateStatus;
  readonly ballZone: ZoneId;
  readonly ballCarrierId: string | null;
  readonly tacticalPhaseState: TacticalPhaseState;
  readonly activeEventCount: number;
  readonly pendingContinuationCount: number;
  readonly lastResolvedEventId: string | null;
  readonly hash: string;
}

export function summarizeWorldState(world: WorldState): WorldStateSummary {
  const hashSource = [
    world.matchId,
    world.seedValue,
    world.tick,
    world.elapsedMs,
    world.score.home,
    world.score.away,
    world.possessionTeamId ?? "NONE",
    world.ballState,
    world.ballZone,
    world.ballCarrierId ?? "NONE",
    world.tacticalPhaseState,
    world.lastResolvedEventId ?? "NONE",
  ].join("|");

  let hash = 0;
  for (let index = 0; index < hashSource.length; index += 1) {
    hash = (hash * 31 + hashSource.charCodeAt(index)) >>> 0;
  }

  return {
    matchId: world.matchId,
    tick: world.tick,
    elapsedMs: world.elapsedMs,
    score: world.score,
    possessionTeamId: world.possessionTeamId,
    ballState: world.ballState,
    ballZone: world.ballZone,
    ballCarrierId: world.ballCarrierId,
    tacticalPhaseState: world.tacticalPhaseState,
    activeEventCount: world.activeEvents.length,
    pendingContinuationCount: world.pendingContinuations.length,
    lastResolvedEventId: world.lastResolvedEventId,
    hash: hash.toString(16).padStart(8, "0"),
  };
}

export function createInitialWorldState(input: {
  readonly matchId?: string;
  readonly clock: MatchClock;
  readonly score: ScoreState;
  readonly ball: BallState;
  readonly players: readonly PlayerMatchState[];
  readonly teamTacticalStates: readonly TeamTacticalTickState[];
  readonly phaseState: TacticalPhaseState;
  readonly seed: DeterministicSeedState;
}): WorldState {
  return {
    matchId: input.matchId ?? "mini-match",
    seedValue: input.seed.initialSeed,
    tick: 0,
    time: input.clock,
    elapsedMs: 0,
    score: input.score,
    ballState: input.ball.status,
    ballZone: input.ball.zone,
    ballCarrierId: input.ball.carrierPlayerId,
    ball: input.ball,
    possessionTeamId: input.ball.possessionTeamId,
    playerStates: input.players,
    players: input.players,
    teamStates: input.teamTacticalStates,
    teamTacticalStates: input.teamTacticalStates,
    tacticalPhaseState: input.phaseState,
    activeEvents: [],
    pendingContinuations: [],
    phaseState: input.phaseState,
    seed: input.seed,
    lastResolvedEventId: null,
    activeIntentCount: input.players.reduce((sum, player) => sum + (player.activeIntents?.length ?? 0), 0),
    teamIntentSummary: [],
    recentlyResolvedIntents: [],
    timeline: [],
  };
}
