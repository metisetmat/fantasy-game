import type { TeamId } from "../../core/ids";
import type { LateralCorridor } from "../../core/zones";
import { isInsideInGoalZone } from "./inGoalZoneRules";
import type { InGoalAccessRoute } from "./inGoalAccessTypes";

function normalizedTeam(teamId: TeamId): string {
  return String(teamId).toLowerCase();
}

function zoneBand(zone: string): number {
  const match = /^Z(\d+)-/.exec(zone);
  return match === null ? -1 : Number.parseInt(match[1] ?? "-1", 10);
}

function lane(zone: string): LateralCorridor | "UNKNOWN" {
  const parts = zone.split("-");
  return parts.length === 2 ? (parts[1] as LateralCorridor) : "UNKNOWN";
}

export function isInsideGoalAreaSegment(zone: string, accessLane: string, attackingTeamId: TeamId): boolean {
  const controlAttacking = normalizedTeam(attackingTeamId).includes("control");
  const goalAreaBand = controlAttacking ? 7 : 1;

  return zoneBand(zone) === goalAreaBand && (accessLane === "HSL" || accessLane === "HSR" || accessLane === "C");
}

export function isOuterHalfSpaceAccess(zone: string, accessLane: string, attackingTeamId: TeamId): boolean {
  return (accessLane === "HSL" || accessLane === "HSR") && !isInsideGoalAreaSegment(zone, accessLane, attackingTeamId);
}

export function isLegalInGoalAccessZone(zone: string, accessLane: string, attackingTeamId: TeamId): boolean {
  return accessLane === "CL" || accessLane === "CR" || isOuterHalfSpaceAccess(zone, accessLane, attackingTeamId);
}

export function isCentralFrontalInGoalAccess(previousZone: string, currentZone: string, attackingTeamId: TeamId): boolean {
  return isInsideInGoalZone(currentZone, attackingTeamId) && lane(previousZone) === "C";
}

export function classifyInGoalAccessRoute(previousZone: string, currentZone: string, attackingTeamId: TeamId): InGoalAccessRoute {
  if (!isInsideInGoalZone(currentZone, attackingTeamId)) {
    return {
      previousZone,
      currentZone,
      category: "INVALID_ACCESS",
      legal: false,
      reason: `${currentZone} is not the attacking in-goal grounding zone for ${attackingTeamId}.`,
    };
  }

  const accessLane = lane(previousZone);

  if (accessLane === "CL" || accessLane === "CR") {
    return {
      previousZone,
      currentZone,
      category: "OUTER_CHANNEL_ACCESS",
      legal: true,
      reason: `${previousZone} gives legal lateral channel access before grounding in ${currentZone}.`,
    };
  }

  if (accessLane === "HSL" || accessLane === "HSR") {
    if (isInsideGoalAreaSegment(previousZone, accessLane, attackingTeamId)) {
      return {
        previousZone,
        currentZone,
        category: "GOAL_AREA_HALF_SPACE",
        legal: false,
        reason: `${previousZone} is the goal-area half-space segment, so it cannot be used as the legal try access route.`,
      };
    }

    return {
      previousZone,
      currentZone,
      category: "OUTER_HALF_SPACE_ACCESS",
      legal: true,
      reason: `${previousZone} is an outer half-space route before grounding in ${currentZone}.`,
    };
  }

  if (accessLane === "C") {
    return {
      previousZone,
      currentZone,
      category: "CENTRAL_GOAL_AREA",
      legal: false,
      reason: `${previousZone} is frontal central access; tries require lateral channel or outer half-space access.`,
    };
  }

  return {
    previousZone,
    currentZone,
    category: "INVALID_ACCESS",
    legal: false,
    reason: `${previousZone} does not provide a recognized legal access route.`,
  };
}
