import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { ScoringZoneId } from "../../core/scoringZones";

export interface GoalArea {
  readonly teamId: TeamId;
  readonly defensiveGoalZone: ZoneId;
  readonly goalAreaZones: readonly ZoneId[];
  readonly goalFrameZone: ScoringZoneId;
}
