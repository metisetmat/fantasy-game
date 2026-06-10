import { PlayerRole } from "../../../models/player";
import type { OffensiveSpreadEvaluation, SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import { LaneAvailability } from "../../spatial";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import type { BlockManipulationEvaluation, ConstructionSupportEvaluation } from "./types";
import { UtilityActionType, selectUtilityRole } from "../../ai/utility";

const ORGANIZER_ROLES: readonly PlayerRole[] = [
  PlayerRole.TempoHalf,
  PlayerRole.Playmaker,
  PlayerRole.HookLink,
  PlayerRole.ForwardLeader,
];

function selectOrganizerRole(team: SpatialTeamContext): PlayerRole {
  return selectUtilityRole({
    players: team.players,
    actions: [UtilityActionType.Pass, UtilityActionType.Support, UtilityActionType.Carry],
    tacticalStyle: team.tacticalStyle,
    spatialAffordance: team.offensiveMomentum.score,
    tacticalIntent: team.tacticalInstructions.offensive.collectiveness,
    pressure: 46,
    risk: team.tacticalInstructions.offensive.riskLevel,
    cohesion: team.collectiveProperties.cohesion,
  });
}

export interface BlockManipulationInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly offensiveSpread: OffensiveSpreadEvaluation;
  readonly support: ConstructionSupportEvaluation;
  readonly weakSide: WeakSideEvaluation;
}

export function evaluateBlockManipulation(input: BlockManipulationInput): BlockManipulationEvaluation {
  const organizers = input.offensiveTeam.players.filter((player) =>
    ORGANIZER_ROLES.includes(player.role),
  );
  const organizerQuality = averageInteractionRatings(
    organizers.map((player) =>
      clampInteractionRating(
        player.attributes.intelligence * 0.32 +
          player.attributes.handPlay * 0.18 +
          player.attributes.footPlayPassingShooting * 0.22 +
          player.attributes.mental * 0.16 +
          player.fatigue.freshness * 0.12,
      ),
    ),
  );
  const widthUsage = clampInteractionRating(
    input.offensiveSpread.widthOccupation * 0.5 +
      input.offensiveTeam.tacticalInstructions.offensive.collectiveness * 0.22 +
      input.offensiveTeam.collectiveProperties.collectiveMobility * 0.18 +
      (input.weakSide.switchPlayOpportunity === LaneAvailability.Open ? 10 : 0),
  );
  const rhythmControl = clampInteractionRating(
    input.offensiveTeam.collectiveProperties.cohesion * 0.3 +
      input.offensiveTeam.collectiveProperties.tacticalDiscipline * 0.28 +
      input.support.circulationQuality * 0.24 +
      (100 - input.offensiveTeam.tacticalInstructions.offensive.riskLevel) * 0.18,
  );
  const manipulationQuality = clampInteractionRating(
    organizerQuality * 0.28 +
      widthUsage * 0.28 +
      rhythmControl * 0.24 +
      input.offensiveTeam.collectiveProperties.collectiveReading * 0.2,
  );

  return {
    manipulationQuality,
    widthUsage,
    rhythmControl,
    keyOrganizerRole: selectOrganizerRole(input.offensiveTeam),
    breakdown: [
      { label: "organizer quality", value: organizerQuality },
      { label: "width usage", value: widthUsage },
      { label: "rhythm control", value: rhythmControl },
      { label: "collective reading", value: input.offensiveTeam.collectiveProperties.collectiveReading },
    ],
  };
}
