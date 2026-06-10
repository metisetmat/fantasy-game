import {
  SpatialMoveType,
  type SpatialIntentionContext,
  type ZoneAttractivenessEvaluation,
} from "../../spatial/intention/types";
import { evaluateLongPlayWindow, type LongPlayWindowEvaluation } from "./evaluateLongPlayWindow";

export interface LongPlayJumpResolution {
  readonly selected: ZoneAttractivenessEvaluation | null;
  readonly window: LongPlayWindowEvaluation;
}

export function resolveLongPlayJump(input: {
  readonly context: SpatialIntentionContext;
  readonly evaluations: readonly ZoneAttractivenessEvaluation[];
  readonly currentSelected: ZoneAttractivenessEvaluation | undefined;
}): LongPlayJumpResolution {
  const window = evaluateLongPlayWindow(input.context);
  const directCandidate = input.evaluations.find(
    (evaluation) => evaluation.moveType === SpatialMoveType.DirectVerticalAttack,
  );

  if (!window.isOpen || directCandidate === undefined || directCandidate.score < 40) {
    return {
      selected: null,
      window,
    };
  }

  const currentScore = input.currentSelected?.score ?? 0;
  const closeEnoughToRisk = currentScore - directCandidate.score <= 42;

  return {
    selected: closeEnoughToRisk ? directCandidate : null,
    window,
  };
}
