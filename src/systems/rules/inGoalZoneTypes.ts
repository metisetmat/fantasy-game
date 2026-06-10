import type { TeamId } from "../../core/ids";
import type { ScoringEndZone, ScoringZoneId } from "../../core/scoringZones";

export type InGoalZoneId = ScoringZoneId;

export interface InGoalZoneDefinition {
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly endZone: ScoringEndZone;
  readonly zones: readonly InGoalZoneId[];
  readonly tacticalMeaning: string;
}
