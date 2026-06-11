import type { TacticalWorkbenchFrame } from "../grounding/tacticalWorkbenchTypes";
import type { SpatialMatchContext } from "../spatialContext";
import type { RouteCandidateAttributeContext } from "./routeAttributeInfluenceTypes";

export type AttributeDrivenSelectionBlockedReason =
  | "CLOSED_LANE_NOT_OVERRIDABLE"
  | "CANDIDATE_NOT_AVAILABLE_NOW"
  | "ATTRIBUTE_ADJUSTMENT_OUT_OF_BOUNDS"
  | "MISSING_ACTOR_IN_SPATIAL_CONTEXT"
  | "MISSING_RECEIVER_IN_SPATIAL_CONTEXT"
  | "WORKBENCH_TRUTH_VIOLATION";

export type AttributeDrivenSelectionGuardResult = {
  readonly valid: boolean;
  readonly blockedReasons: readonly AttributeDrivenSelectionBlockedReason[];
  readonly warnings: readonly string[];
};

function allPlayers(context: SpatialMatchContext) {
  return [...context.home.players, ...context.away.players];
}

function matchesWorkbenchTruth(
  candidate: RouteCandidateAttributeContext,
  workbench: TacticalWorkbenchFrame,
): boolean {
  return (
    candidate.actorId === workbench.selectedAction.actorId &&
    candidate.actionType === workbench.selectedAction.actionType &&
    candidate.receiverId === workbench.selectedAction.receiverId &&
    candidate.fromZone === workbench.selectedAction.fromZone &&
    candidate.targetZone === workbench.selectedAction.targetZone
  );
}

export function guardAttributeDrivenSelection(input: {
  readonly candidate: RouteCandidateAttributeContext;
  readonly spatialContext?: SpatialMatchContext;
  readonly baseSelectedCandidateId?: string;
  readonly workbench?: TacticalWorkbenchFrame;
  readonly maxAttributeAdjustment: number;
  readonly availability?: "AVAILABLE" | "NOT_AVAILABLE_NOW";
}): AttributeDrivenSelectionGuardResult {
  const blockedReasons: AttributeDrivenSelectionBlockedReason[] = [];
  const warnings: string[] = [];
  const adjustment = input.candidate.attributeAdjustedScore - input.candidate.baseScore;
  const isBaseSelection = input.baseSelectedCandidateId === input.candidate.candidateId;

  if (Math.abs(adjustment) > input.maxAttributeAdjustment) {
    blockedReasons.push("ATTRIBUTE_ADJUSTMENT_OUT_OF_BOUNDS");
  }

  if (!isBaseSelection && input.candidate.laneState === "CLOSED") {
    blockedReasons.push("CLOSED_LANE_NOT_OVERRIDABLE");
  }

  if (!isBaseSelection && input.availability === "NOT_AVAILABLE_NOW") {
    blockedReasons.push("CANDIDATE_NOT_AVAILABLE_NOW");
  }

  if (input.spatialContext !== undefined) {
    const players = allPlayers(input.spatialContext);
    const actor = players.find((player) => player.playerId === input.candidate.actorId);
    const receiver = players.find((player) => player.playerId === input.candidate.receiverId);

    if (actor === undefined) {
      blockedReasons.push("MISSING_ACTOR_IN_SPATIAL_CONTEXT");
    }

    if (input.candidate.receiverId !== undefined && receiver === undefined) {
      blockedReasons.push("MISSING_RECEIVER_IN_SPATIAL_CONTEXT");
    }
  }

  if (!isBaseSelection && input.workbench !== undefined && !matchesWorkbenchTruth(input.candidate, input.workbench)) {
    blockedReasons.push("WORKBENCH_TRUTH_VIOLATION");
  }

  if (input.candidate.laneState === "CLOSED") {
    warnings.push("CLOSED lane remains closed; attributes cannot open it.");
  }

  if (input.availability === "NOT_AVAILABLE_NOW") {
    warnings.push("Candidate is not available now and cannot be promoted by attributes.");
  }

  return {
    valid: blockedReasons.length === 0,
    blockedReasons,
    warnings,
  };
}
