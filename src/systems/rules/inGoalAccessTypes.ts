export type InGoalAccessLaneCategory =
  | "CENTRAL_GOAL_AREA"
  | "OUTER_CHANNEL_ACCESS"
  | "OUTER_HALF_SPACE_ACCESS"
  | "GOAL_AREA_HALF_SPACE"
  | "FRONTAL_ACCESS"
  | "REBOUND_OR_SCRAMBLE_ACCESS"
  | "INVALID_ACCESS";

export interface InGoalAccessRoute {
  readonly previousZone: string;
  readonly currentZone: string;
  readonly category: InGoalAccessLaneCategory;
  readonly legal: boolean;
  readonly reason: string;
}
