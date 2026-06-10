import { PlayerRole } from "../../../models/player";
import type { SpatialTeamContext } from "../../spatial";
import { clampInteractionRating } from "../shared/ratings";
import { applyRecoverySaturationImpact } from "../../structure/recoverySaturation";
import type { DefensiveProtectionEvaluation, GoalkeeperResponseEvaluation } from "./types";

export interface GoalkeeperResponseInput {
  readonly defensiveTeam: SpatialTeamContext;
  readonly defensiveProtection: DefensiveProtectionEvaluation;
}

export function evaluateGoalkeeperResponse(input: GoalkeeperResponseInput): GoalkeeperResponseEvaluation {
  const saturationImpact = applyRecoverySaturationImpact(input.defensiveTeam.recoverySaturation);
  const lastLineResponder = input.defensiveTeam.players.find((player) => player.role === PlayerRole.GoalkeeperFreeSafety) ??
    input.defensiveTeam.players.find((player) => player.role === PlayerRole.FreeSafety);
  const fallback = input.defensiveTeam.players[0];
  const responder = lastLineResponder ?? fallback;
  const derivedGoalkeeperResponse = responder?.derivedAttributes?.goalkeeperResponse ?? 0;
  const visibleInputs = {
    handPlay: responder?.visibleAttributes?.handPlay ?? responder?.attributes.handPlay ?? 0,
    vision: responder?.visibleAttributes?.vision ?? responder?.attributes.intelligence ?? 0,
    composure: responder?.visibleAttributes?.composure ?? responder?.attributes.mental ?? 0,
    speed: responder?.visibleAttributes?.speed ?? responder?.attributes.speed ?? 0,
  };
  const responseQuality =
    responder === undefined
      ? 0
      : clampInteractionRating(
          derivedGoalkeeperResponse * 0.42 +
            visibleInputs.vision * 0.18 +
            visibleInputs.composure * 0.16 +
            visibleInputs.handPlay * 0.14 +
            visibleInputs.speed * 0.08 +
            responder.fatigue.freshness * 0.1 +
            input.defensiveProtection.protectionQuality * 0.08 -
            saturationImpact.freeSafetyPenalty,
        );

  return {
    responseQuality,
    responderRole: responder?.role ?? PlayerRole.FreeSafety,
    responderInitials: responder?.roleInitials ?? "FS",
    responderIsGoalkeeper: responder?.role === PlayerRole.GoalkeeperFreeSafety || responder?.isGoalkeeper === true,
    visibleInputs,
    derivedGoalkeeperResponse,
    reactsLate: responseQuality < 58,
    breakdown: [
      { label: responder?.role === PlayerRole.GoalkeeperFreeSafety ? "goalkeeper response" : "last-line response", value: responseQuality },
      { label: "derived goalkeeperResponse", value: derivedGoalkeeperResponse },
      { label: "protection support", value: input.defensiveProtection.protectionQuality },
      { label: "recovery saturation penalty", value: -saturationImpact.freeSafetyPenalty },
    ],
  };
}
