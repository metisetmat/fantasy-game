import { PlayerRole } from "../../../models/player";
import type { SpatialTeamContext, WeakSideEvaluation } from "../../spatial/types";
import { LaneAvailability } from "../../spatial/types";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import type { TransitionSupportEvaluation } from "./types";
import { UtilityActionType, selectUtilityRole } from "../../ai/utility";

const SUPPORT_ROLES: readonly PlayerRole[] = [
  PlayerRole.ForwardLeader,
  PlayerRole.TempoHalf,
  PlayerRole.Playmaker,
  PlayerRole.PowerRunner,
  PlayerRole.HookLink,
];

export interface TransitionSupportInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly weakSide: WeakSideEvaluation;
}

function selectSupportRole(team: SpatialTeamContext): PlayerRole {
  return selectUtilityRole({
    players: team.players,
    actions: [UtilityActionType.Support, UtilityActionType.AttackSpace, UtilityActionType.ContestLooseBall],
    tacticalStyle: team.tacticalStyle,
    spatialAffordance: team.offensiveMomentum.score,
    tacticalIntent: team.tacticalInstructions.offensive.verticality,
    pressure: 58,
    risk: team.tacticalInstructions.offensive.riskLevel,
    cohesion: team.collectiveProperties.cohesion,
  });
}

export function evaluateTransitionSupport(input: TransitionSupportInput): TransitionSupportEvaluation {
  const supportPlayers = input.offensiveTeam.players.filter((player) =>
    SUPPORT_ROLES.includes(player.role),
  );
  const supportRunnerCount = supportPlayers.filter((player) => player.fatigue.freshness >= 55).length;
  const supportRunnerQuality = averageInteractionRatings(
    supportPlayers.map((player) =>
      clampInteractionRating(
        player.attributes.speed * 0.22 +
          player.attributes.agility * 0.18 +
          player.attributes.intelligence * 0.25 +
          player.attributes.handPlay * 0.15 +
          player.fatigue.freshness * 0.2,
      ),
    ),
  );
  const weakSideSupport = input.weakSide.switchPlayOpportunity === LaneAvailability.Open ? 75 : 45;
  const supportAvailability = clampInteractionRating(
    supportRunnerQuality * 0.35 +
      input.offensiveTeam.collectiveProperties.cohesion * 0.2 +
      input.offensiveTeam.collectiveProperties.collectiveMobility * 0.2 +
      supportRunnerCount * 5 +
      weakSideSupport * 0.1,
  );

  return {
    supportAvailability,
    supportRunnerCount,
    keySupportRole: selectSupportRole(input.offensiveTeam),
    breakdown: [
      { label: "support runner quality", value: supportRunnerQuality },
      { label: "support runner count", value: clampInteractionRating(supportRunnerCount * 10) },
      { label: "cohesion", value: input.offensiveTeam.collectiveProperties.cohesion },
      { label: "collective mobility", value: input.offensiveTeam.collectiveProperties.collectiveMobility },
      { label: "weak side support", value: weakSideSupport },
    ],
  };
}
