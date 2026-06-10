import type { TeamId } from "../../core/ids";
import { createScoringZoneId, ScoringEndZone } from "../../core/scoringZones";
import { createZoneId, LateralCorridor, LongitudinalZone, type ZoneId } from "../../core/zones";
import type { GoalArea } from "./goalAreaTypes";

const CONTROL_TEAM_ID = "control";
const BLITZ_TEAM_ID = "blitz";

const LEFT_GOAL_AREA_ZONES: readonly ZoneId[] = [
  createZoneId(LongitudinalZone.DefensiveTryZone, LateralCorridor.LeftCorridor),
  createZoneId(LongitudinalZone.DefensiveTryZone, LateralCorridor.LeftHalfSpace),
  createZoneId(LongitudinalZone.DefensiveTryZone, LateralCorridor.CentralAxis),
  createZoneId(LongitudinalZone.DefensiveTryZone, LateralCorridor.RightHalfSpace),
  createZoneId(LongitudinalZone.DefensiveTryZone, LateralCorridor.RightCorridor),
];

const RIGHT_GOAL_AREA_ZONES: readonly ZoneId[] = [
  createZoneId(LongitudinalZone.OffensiveTryZone, LateralCorridor.LeftCorridor),
  createZoneId(LongitudinalZone.OffensiveTryZone, LateralCorridor.LeftHalfSpace),
  createZoneId(LongitudinalZone.OffensiveTryZone, LateralCorridor.CentralAxis),
  createZoneId(LongitudinalZone.OffensiveTryZone, LateralCorridor.RightHalfSpace),
  createZoneId(LongitudinalZone.OffensiveTryZone, LateralCorridor.RightCorridor),
];

export function goalAreaForTeam(teamId: TeamId): GoalArea {
  const controlsLeftGoal = teamId === CONTROL_TEAM_ID;

  return {
    teamId,
    defensiveGoalZone: controlsLeftGoal
      ? createZoneId(LongitudinalZone.DefensiveTryZone, LateralCorridor.CentralAxis)
      : createZoneId(LongitudinalZone.OffensiveTryZone, LateralCorridor.CentralAxis),
    goalAreaZones: controlsLeftGoal ? LEFT_GOAL_AREA_ZONES : RIGHT_GOAL_AREA_ZONES,
    goalFrameZone: controlsLeftGoal
      ? createScoringZoneId(ScoringEndZone.LeftInGoal, LateralCorridor.CentralAxis)
      : createScoringZoneId(ScoringEndZone.RightInGoal, LateralCorridor.CentralAxis),
  };
}

export function isInsideGoalArea(zone: ZoneId, defendingTeamId: TeamId): boolean {
  return goalAreaForTeam(defendingTeamId).goalAreaZones.includes(zone);
}

export function nearestGoalAreaZone(defendingTeamId: TeamId, lateral: LateralCorridor = LateralCorridor.CentralAxis): ZoneId {
  const goalArea = goalAreaForTeam(defendingTeamId);
  const target = goalArea.goalAreaZones.find((zone) => zone.endsWith(`-${lateral}`));

  return target ?? goalArea.defensiveGoalZone;
}
