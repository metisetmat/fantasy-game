import type { TacticalTick } from "../../core/ratings";
import type { SequenceStep } from "../sequences";
import { BallStateStatus } from "./ballState";
import { EventContinuation, type ContinuationDecision } from "./continuation";
import type { MatchLoopEvent, WorldState } from "./worldState";
import { MatchLoopEventType, summarizeWorldState } from "./worldState";

export interface LegacyActionAdapterResult {
  readonly generatedEvents: readonly MatchLoopEvent[];
  readonly nextWorldState: WorldState;
  readonly continuation: ContinuationDecision;
}

function inferContinuation(step: SequenceStep): ContinuationDecision {
  if (step.ballContextBefore.possessionTeamId !== step.ballContextAfter.possessionTeamId) {
    return {
      continuation: EventContinuation.Turnover,
      reason: `possession changed from ${step.ballContextBefore.possessionTeamId} to ${step.ballContextAfter.possessionTeamId}`,
    };
  }

  if (step.interaction === "finishing") {
    return {
      continuation: EventContinuation.SequenceEnd,
      reason: "finishing resolver produced the current terminal tactical state",
    };
  }

  return {
    continuation: EventContinuation.Continue,
    reason: "legacy action resolved without terminal state",
  };
}

export function adaptLegacySequenceStepToWorldState(input: {
  readonly world: WorldState;
  readonly step: SequenceStep;
  readonly eventId: string;
  readonly tick: TacticalTick;
}): LegacyActionAdapterResult {
  const continuation = inferContinuation(input.step);
  const event: MatchLoopEvent = {
    tick: input.tick,
    type: MatchLoopEventType.LegacyActionResolved,
    description: `legacy ${input.step.interaction} resolved through tick wrapper`,
  };
  const nextWorldState: WorldState = {
    ...input.world,
    tick: input.tick,
    elapsedMs: input.tick * Math.round(1000 / input.world.time.tickRate),
    possessionTeamId: input.step.ballContextAfter.possessionTeamId,
    ballState: BallStateStatus.Controlled,
    ballZone: input.step.ballContextAfter.ballLocation,
    ballCarrierId: input.world.ballCarrierId,
    ball: {
      ...input.world.ball,
      status: BallStateStatus.Controlled,
      zone: input.step.ballContextAfter.ballLocation,
      possessionTeamId: input.step.ballContextAfter.possessionTeamId,
    },
    tacticalPhaseState: input.step.contextAfter.tacticalPhaseState,
    phaseState: input.step.contextAfter.tacticalPhaseState,
    activeEvents: [event],
    pendingContinuations: [continuation],
    lastResolvedEventId: input.eventId,
    timeline: [
      ...input.world.timeline,
      {
        tick: input.tick,
        timeSeconds: input.tick / input.world.time.tickRate,
        phaseState: input.step.contextAfter.tacticalPhaseState,
        ballStatus: BallStateStatus.Controlled,
        possessionTeamId: input.step.ballContextAfter.possessionTeamId,
        steps: [
          `timeline event ${input.eventId}`,
          `world before ${summarizeWorldState(input.world).hash}`,
          continuation.reason,
        ],
      },
    ],
  };

  return {
    generatedEvents: [event],
    nextWorldState,
    continuation,
  };
}
