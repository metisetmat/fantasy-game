import type { TeamId } from "../../core/ids";
import { createScoringZoneId, ScoringEndZone, type ScoringZoneId } from "../../core/scoringZones";
import { LateralCorridor } from "../../core/zones";
import type { InGoalZoneDefinition, InGoalZoneId } from "./inGoalZoneTypes";

const IN_GOAL_LANES: readonly LateralCorridor[] = [
  LateralCorridor.LeftCorridor,
  LateralCorridor.LeftHalfSpace,
  LateralCorridor.CentralAxis,
  LateralCorridor.RightHalfSpace,
  LateralCorridor.RightCorridor,
];

export const CONTROL_ATTACKING_IN_GOAL_ZONES: readonly InGoalZoneId[] = IN_GOAL_LANES.map((lane) =>
  createScoringZoneId(ScoringEndZone.RightInGoal, lane),
);

export const BLITZ_ATTACKING_IN_GOAL_ZONES: readonly InGoalZoneId[] = IN_GOAL_LANES.map((lane) =>
  createScoringZoneId(ScoringEndZone.LeftInGoal, lane),
);

function normalizedTeam(teamId: TeamId): string {
  return String(teamId).toLowerCase();
}

export function getDefendingTeamForInGoal(attackingTeamId: TeamId): TeamId {
  return normalizedTeam(attackingTeamId).includes("control") ? "blitz" : "control";
}

export function getAttackingInGoalZone(attackingTeamId: TeamId): InGoalZoneDefinition {
  const controlAttacking = normalizedTeam(attackingTeamId).includes("control");

  return {
    attackingTeamId,
    defendingTeamId: getDefendingTeamForInGoal(attackingTeamId),
    endZone: controlAttacking ? ScoringEndZone.RightInGoal : ScoringEndZone.LeftInGoal,
    zones: controlAttacking ? CONTROL_ATTACKING_IN_GOAL_ZONES : BLITZ_ATTACKING_IN_GOAL_ZONES,
    tacticalMeaning: controlAttacking
      ? "CONTROL attacks the Z8 in-goal grounding zone; Z7 remains the goal-area/close-shot zone."
      : "BLITZ attacks the Z0 in-goal grounding zone; Z1 remains the goal-area/close-shot zone.",
  };
}

export function isInGoalZone(zone: string): boolean {
  return /^Z(?:0|8)-(?:CL|HSL|C|HSR|CR)$/.test(zone);
}

export function isNormalPlayableZone(zone: string): boolean {
  return /^Z[1-7]-(?:CL|HSL|C|HSR|CR)$/.test(zone);
}

export function isInsideInGoalZone(zone: ScoringZoneId | string, attackingTeamId: TeamId): boolean {
  return getAttackingInGoalZone(attackingTeamId).zones.includes(zone as ScoringZoneId);
}
