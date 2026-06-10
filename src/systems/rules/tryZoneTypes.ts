import type { TeamId } from "../../core/ids";
import type { ScoringZoneId } from "../../core/scoringZones";

export interface TryZoneDefinition {
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly zones: readonly ScoringZoneId[];
  readonly tacticalMeaning: string;
}
