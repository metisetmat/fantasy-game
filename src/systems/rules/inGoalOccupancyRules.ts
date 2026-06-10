import { isInGoalZone } from "./inGoalZoneRules";
import type { InGoalOccupancyCheckInput, InGoalOccupancyCounts } from "./inGoalOccupancyTypes";

function countInGoal(zones: readonly string[]): number {
  return zones.filter((zone) => isInGoalZone(zone)).length;
}

export function validateNoInGoalOccupancy(input: InGoalOccupancyCheckInput): InGoalOccupancyCounts {
  const counts = {
    offBallInGoalPlayerCount: countInGoal(input.offBallPlayerZones),
    receiverInGoalCount: countInGoal(input.receiverZones),
    supportTargetInGoalCount: countInGoal(input.supportTargetZones),
    tacticalTargetClusterInGoalCount: countInGoal(input.tacticalTargetClusterZones),
    restDefenseInGoalCount: countInGoal(input.restDefenseZones),
    goalkeeperSetPositionInGoalCount: countInGoal(input.goalkeeperSetPositionZones),
  };

  const total =
    counts.offBallInGoalPlayerCount +
    counts.receiverInGoalCount +
    counts.supportTargetInGoalCount +
    counts.tacticalTargetClusterInGoalCount +
    counts.restDefenseInGoalCount +
    counts.goalkeeperSetPositionInGoalCount;

  return {
    ...counts,
    status: total === 0 ? "PASS" : "FAIL",
  };
}
