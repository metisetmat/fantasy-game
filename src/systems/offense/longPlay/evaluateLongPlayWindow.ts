import { OffensiveProgressionPhilosophy } from "../../../models/tactics";
import { SideType } from "../../spatial/sides/types";
import { ThreatLevel, type SpatialIntentionContext } from "../../spatial/intention/types";
import { evaluateExplosiveProjection } from "./evaluateExplosiveProjection";

export interface LongPlayWindowEvaluation {
  readonly isOpen: boolean;
  readonly score: number;
  readonly reasons: readonly string[];
}

export function evaluateLongPlayWindow(context: SpatialIntentionContext): LongPlayWindowEvaluation {
  if (context.team.offensiveProgressionPhilosophy !== OffensiveProgressionPhilosophy.LongPlayLineBreaking) {
    return {
      isOpen: false,
      score: 0,
      reasons: ["team is not using LONG_PLAY_LINE_BREAKING"],
    };
  }

  const explosiveProjection = evaluateExplosiveProjection(context);
  const openSideAvailable = Object.values(context.sideContext?.sideTypesByZone ?? {}).some(
    (sideType) => sideType === SideType.OpenSide || sideType === SideType.WeakSide,
  );
  const highDanger = context.tacticalDanger === ThreatLevel.High || context.scoringThreat === ThreatLevel.High;
  const supportAcceptable = context.team.tacticalInstructions.offensive.collectiveness >= 55;
  const score = Math.min(
    100,
    Math.round(
      explosiveProjection +
        (openSideAvailable ? 8 : 0) +
        (highDanger ? 12 : 0) +
        (supportAcceptable ? 6 : -10),
    ),
  );
  const reasons = [
    ...(openSideAvailable ? ["open side exposed"] : []),
    ...(highDanger ? ["tactical danger invites line-breaking"] : []),
    ...(supportAcceptable ? ["support quality acceptable"] : ["support structure fragile"]),
    `explosive projection ${explosiveProjection}`,
  ];

  return {
    isOpen: score >= 70,
    score,
    reasons,
  };
}
