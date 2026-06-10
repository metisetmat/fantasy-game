import { PlayerRole } from "../../../models/player";
import type { OffensiveSpreadEvaluation, SpatialTeamContext, WeakSideEvaluation } from "../../spatial/types";
import { LaneAvailability } from "../../spatial/types";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import type { TransitionWindow, ProjectionEvaluation } from "./types";
import { UtilityActionType, selectUtilityRole } from "../../ai/utility";

const PROJECTION_ROLES: readonly PlayerRole[] = [
  PlayerRole.SpaceHunter,
  PlayerRole.Playmaker,
  PlayerRole.ForwardLeader,
  PlayerRole.TempoHalf,
  PlayerRole.PowerRunner,
];

function selectPrimaryRunnerRole(team: SpatialTeamContext): PlayerRole {
  return selectUtilityRole({
    players: team.players,
    actions: [UtilityActionType.AttackSpace, UtilityActionType.Carry, UtilityActionType.ContestLooseBall],
    tacticalStyle: team.tacticalStyle,
    spatialAffordance: team.offensiveMomentum.score,
    tacticalIntent: team.tacticalInstructions.offensive.verticality,
    pressure: 52,
    risk: team.tacticalInstructions.offensive.riskLevel,
    cohesion: team.collectiveProperties.cohesion,
  });
}

export interface ProjectionInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly offensiveSpread: OffensiveSpreadEvaluation;
  readonly weakSide: WeakSideEvaluation;
  readonly transitionWindow: TransitionWindow;
}

export function evaluateProjection(input: ProjectionInput): ProjectionEvaluation {
  const projectionPlayers = input.offensiveTeam.players.filter((player) =>
    PROJECTION_ROLES.includes(player.role),
  );
  const runnerQuality = averageInteractionRatings(
    projectionPlayers.map((player) =>
      clampInteractionRating(
        player.attributes.speed * 0.3 +
          player.attributes.intelligence * 0.25 +
          player.attributes.agility * 0.2 +
          player.attributes.footPlayPassingShooting * 0.15 +
          player.fatigue.freshness * 0.1,
      ),
    ),
  );
  const transitionSpeed = clampInteractionRating(
    runnerQuality * 0.4 +
      input.offensiveTeam.collectiveProperties.offensiveTransition * 0.28 +
      input.offensiveTeam.tacticalInstructions.offensive.verticality * 0.2 +
      input.transitionWindow.instability * 0.12,
  );
  const weakSideBonus = input.weakSide.switchPlayOpportunity === LaneAvailability.Open ? 12 : 0;
  const projectionQuality = clampInteractionRating(
    transitionSpeed * 0.38 +
      input.offensiveTeam.collectiveProperties.collectiveReading * 0.18 +
      input.offensiveTeam.collectiveProperties.collectiveMobility * 0.18 +
      input.offensiveTeam.tacticalInstructions.offensive.riskLevel * 0.12 +
      input.offensiveSpread.widthOccupation * 0.08 +
      weakSideBonus,
  );

  return {
    projectionQuality,
    transitionSpeed,
    primaryRunnerRole: selectPrimaryRunnerRole(input.offensiveTeam),
    breakdown: [
      { label: "runner quality", value: runnerQuality },
      { label: "transition speed", value: transitionSpeed },
      { label: "offensive transition", value: input.offensiveTeam.collectiveProperties.offensiveTransition },
      { label: "verticality", value: input.offensiveTeam.tacticalInstructions.offensive.verticality },
      { label: "weak side bonus", value: weakSideBonus },
    ],
  };
}
