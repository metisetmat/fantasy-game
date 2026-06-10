export enum EventContinuation {
  Continue = "CONTINUE",
  SecondPhase = "SECOND_PHASE",
  Scramble = "SCRAMBLE",
  Turnover = "TURNOVER",
  SetPiece = "SET_PIECE",
  Score = "SCORE",
  OutOfPlay = "OUT_OF_PLAY",
  SequenceEnd = "SEQUENCE_END",
}

export interface ContinuationDecision {
  readonly continuation: EventContinuation;
  readonly reason: string;
}

export function createSequenceEndContinuation(reason: string): ContinuationDecision {
  return {
    continuation: EventContinuation.SequenceEnd,
    reason,
  };
}

export function formatContinuation(decision: ContinuationDecision): string {
  return `Continuation: ${decision.continuation} because ${decision.reason}.`;
}
