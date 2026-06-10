import type { PlayerId, TeamId } from "../../core/ids";
import type { ScoringZoneId } from "../../core/scoringZones";
import type { TryZoneDefinition } from "./tryZoneTypes";
import {
  getAttackingInGoalZone,
  getDefendingTeamForInGoal,
  isInsideInGoalZone,
} from "./inGoalZoneRules";
import { classifyInGoalAccessRoute } from "./inGoalAccessRules";

function normalizedTeam(teamId: TeamId): string {
  return String(teamId).toLowerCase();
}

export function getTryZoneDefendingTeam(attackingTeamId: TeamId): TeamId {
  return getDefendingTeamForInGoal(attackingTeamId);
}

export function getAttackingTryZone(attackingTeamId: TeamId): TryZoneDefinition {
  const inGoal = getAttackingInGoalZone(attackingTeamId);

  return {
    attackingTeamId,
    defendingTeamId: inGoal.defendingTeamId,
    zones: inGoal.zones,
    tacticalMeaning: inGoal.tacticalMeaning,
  };
}

export function isInsideTryZone(zone: ScoringZoneId | string, attackingTeamId: TeamId): boolean {
  return isInsideInGoalZone(zone, attackingTeamId);
}

function zoneBand(zone: string): number {
  const match = /^Z(\d+)/.exec(zone);
  return match === null ? 0 : Number.parseInt(match[1] ?? "0", 10);
}

export function isTryLineEntry(previousZone: string, currentZone: ScoringZoneId | string, attackingTeamId: TeamId): boolean {
  if (!isInsideTryZone(currentZone, attackingTeamId)) {
    return false;
  }

  const controlAttacking = normalizedTeam(attackingTeamId).includes("control");
  const previousBand = zoneBand(previousZone);
  const currentBand = zoneBand(currentZone);

  return controlAttacking ? previousBand <= 7 && currentBand === 8 : previousBand >= 1 && currentBand === 0;
}

export function canAttemptGrounding(input: {
  readonly playerId: PlayerId;
  readonly zone: ScoringZoneId | string;
  readonly attackingTeamId: TeamId;
  readonly ballControlScore: number;
  readonly legalGroundingAvailable: boolean;
  readonly previousZone?: string;
}): boolean {
  const accessLegal =
    input.previousZone === undefined
      ? true
      : classifyInGoalAccessRoute(input.previousZone, input.zone, input.attackingTeamId).legal;

  return (
    input.playerId.length > 0 &&
    isInsideTryZone(input.zone, input.attackingTeamId) &&
    input.ballControlScore >= 50 &&
    input.legalGroundingAvailable &&
    accessLegal
  );
}
