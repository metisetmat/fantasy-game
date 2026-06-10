export interface InGoalOccupancyCheckInput {
  readonly offBallPlayerZones: readonly string[];
  readonly receiverZones: readonly string[];
  readonly supportTargetZones: readonly string[];
  readonly tacticalTargetClusterZones: readonly string[];
  readonly restDefenseZones: readonly string[];
  readonly goalkeeperSetPositionZones: readonly string[];
}

export interface InGoalOccupancyCounts {
  readonly offBallInGoalPlayerCount: number;
  readonly receiverInGoalCount: number;
  readonly supportTargetInGoalCount: number;
  readonly tacticalTargetClusterInGoalCount: number;
  readonly restDefenseInGoalCount: number;
  readonly goalkeeperSetPositionInGoalCount: number;
  readonly status: "PASS" | "FAIL";
}
