import { ScoringEndZone } from "./scoringZones";
import { AttackingDirection } from "../systems/spatial/intention/types";

export const GOAL_WIDTH_METERS = 8;
export const POST_HEIGHT_METERS = 10;
export const CROSSBAR_HEIGHT_METERS = 2.5;

export interface GoalFrame {
  readonly inGoalZone: ScoringEndZone;
  readonly centerLane: "C";
  readonly widthMeters: typeof GOAL_WIDTH_METERS;
  readonly postHeightMeters: typeof POST_HEIGHT_METERS;
  readonly crossbarHeightMeters: typeof CROSSBAR_HEIGHT_METERS;
  readonly lineDescription: string;
}

export function getGoalFrameForDirection(attackingDirection: AttackingDirection): GoalFrame {
  const inGoalZone =
    attackingDirection === AttackingDirection.Z1ToZ7
      ? ScoringEndZone.RightInGoal
      : ScoringEndZone.LeftInGoal;

  return {
    inGoalZone,
    centerLane: "C",
    widthMeters: GOAL_WIDTH_METERS,
    postHeightMeters: POST_HEIGHT_METERS,
    crossbarHeightMeters: CROSSBAR_HEIGHT_METERS,
    lineDescription:
      inGoalZone === ScoringEndZone.LeftInGoal
        ? "between Z1-C and Z0-C"
        : "between Z7-C and Z8-C",
  };
}
