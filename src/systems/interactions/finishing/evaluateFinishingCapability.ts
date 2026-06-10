import { PlayerRole } from "../../../models/player";
import type { SpatialTeamContext } from "../../spatial";
import { clampInteractionRating } from "../shared/ratings";
import { FinishingDecision, type FinishingCapabilityEvaluation, type FinishingChoiceEvaluation } from "./types";

export interface FinishingCapabilityInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly choice: FinishingChoiceEvaluation;
}

function getRoleBias(role: PlayerRole, decision: FinishingDecision): number {
  if (decision === FinishingDecision.DropAttempt && (role === PlayerRole.Playmaker || role === PlayerRole.TempoHalf)) {
    return 8;
  }

  if (decision === FinishingDecision.TryAttempt && (role === PlayerRole.SpaceHunter || role === PlayerRole.PowerRunner)) {
    return 8;
  }

  if (decision === FinishingDecision.GoalAttempt && role === PlayerRole.ForwardLeader) {
    return 6;
  }

  return 0;
}

function getFallbackFinisherRole(decision: FinishingDecision): PlayerRole {
  if (decision === FinishingDecision.TryAttempt) {
    return PlayerRole.SpaceHunter;
  }

  if (decision === FinishingDecision.DropAttempt) {
    return PlayerRole.Playmaker;
  }

  return PlayerRole.Playmaker;
}

export function evaluateFinishingCapability(input: FinishingCapabilityInput): FinishingCapabilityEvaluation {
  const actor =
    input.offensiveTeam.players.find((player) => player.role === input.choice.primaryFinisherRole) ??
    input.offensiveTeam.players.find((player) => player.role === getFallbackFinisherRole(input.choice.decision)) ??
    input.offensiveTeam.players[0];
  const technicalExecution = clampInteractionRating(
    (actor?.attributes.footPlayPassingShooting ?? 0) * 0.3 +
      (actor?.attributes.handPlay ?? 0) * 0.16 +
      (actor?.attributes.agility ?? 0) * 0.16 +
      (actor?.attributes.speed ?? 0) * 0.12 +
      (actor?.attributes.power ?? 0) * 0.1 +
      (actor?.derivedAttributes?.finishingComposure ?? 0) * 0.14 +
      getRoleBias(actor?.role ?? input.choice.primaryFinisherRole, input.choice.decision),
  );
  const composure = clampInteractionRating(
    (actor?.attributes.intelligence ?? 0) * 0.28 +
      (actor?.attributes.mental ?? 0) * 0.28 +
      (actor?.fatigue.freshness ?? 0) * 0.2 +
      (actor?.derivedAttributes?.finishingComposure ?? 0) * 0.12 +
      input.offensiveTeam.collectiveProperties.cohesion * 0.12,
  );
  const finishingCapability = clampInteractionRating(
    technicalExecution * 0.38 +
      composure * 0.24 +
      input.offensiveTeam.collectiveProperties.collectiveReading * 0.16 +
      input.offensiveTeam.collectiveProperties.offensiveTransition * 0.1 +
      input.choice.choiceConfidence * 0.12,
  );

  return {
    finishingCapability,
    technicalExecution,
    composure,
    actorInitials: actor?.roleInitials ?? "??",
    actorRole: actor?.role ?? input.choice.primaryFinisherRole,
    breakdown: [
      { label: `${actor?.roleInitials ?? "??"} Foot Play`, value: actor?.visibleAttributes?.footPlay ?? actor?.attributes.footPlayPassingShooting ?? 0 },
      { label: `${actor?.roleInitials ?? "??"} Hand Play`, value: actor?.visibleAttributes?.handPlay ?? actor?.attributes.handPlay ?? 0 },
      { label: `${actor?.roleInitials ?? "??"} Composure`, value: actor?.visibleAttributes?.composure ?? actor?.attributes.mental ?? 0 },
      { label: `${actor?.roleInitials ?? "??"} finishingComposure`, value: actor?.derivedAttributes?.finishingComposure ?? 0 },
      { label: "technical execution", value: technicalExecution },
      { label: "composure", value: composure },
      { label: "collective reading", value: input.offensiveTeam.collectiveProperties.collectiveReading },
      { label: "choice confidence", value: input.choice.choiceConfidence },
    ],
  };
}
