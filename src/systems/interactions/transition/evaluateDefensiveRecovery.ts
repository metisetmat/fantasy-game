import { PlayerRole } from "../../../models/player";
import type { CompactnessEvaluation, SpatialTeamContext } from "../../spatial/types";
import type { DefensiveParticipationEvaluation } from "../../structure";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import { applyRecoverySaturationImpact } from "../../structure/recoverySaturation";
import type { DefensiveRecoveryEvaluation, TransitionWindow } from "./types";

const RECOVERY_ROLES: readonly PlayerRole[] = [
  PlayerRole.MobileLock,
  PlayerRole.FreeSafety,
  PlayerRole.LeftAnchor,
  PlayerRole.RightAnchor,
  PlayerRole.ForwardLeader,
];

export interface DefensiveRecoveryInput {
  readonly defensiveTeam: SpatialTeamContext;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly transitionWindow: TransitionWindow;
  readonly defensiveParticipation: DefensiveParticipationEvaluation;
}

function selectRecoveryRole(team: SpatialTeamContext): PlayerRole {
  const role = RECOVERY_ROLES.find((candidateRole) =>
    team.players.some((player) => player.role === candidateRole),
  );

  return role ?? PlayerRole.MobileLock;
}

export function evaluateDefensiveRecovery(input: DefensiveRecoveryInput): DefensiveRecoveryEvaluation {
  const saturationImpact = applyRecoverySaturationImpact(input.defensiveTeam.recoverySaturation);
  const recoveryPlayers = input.defensiveTeam.players.filter((player) =>
    RECOVERY_ROLES.includes(player.role),
  );
  const recoveryPlayerQuality = averageInteractionRatings(
    recoveryPlayers.map((player) =>
      clampInteractionRating(
        player.attributes.speed * 0.25 +
          player.attributes.intelligence * 0.25 +
          player.attributes.agility * 0.18 +
          player.attributes.mental * 0.17 +
          player.fatigue.freshness * 0.15,
      ),
    ),
  );
  const shapeRecovery = clampInteractionRating(
    input.defensiveTeam.collectiveProperties.defensiveTransition * 0.28 +
      input.defensiveTeam.collectiveProperties.tacticalDiscipline * 0.22 +
      input.defensiveTeam.collectiveProperties.collectiveMobility * 0.18 +
      input.defensiveTeam.collectiveProperties.resilience * 0.17 +
      Math.max(0, input.defensiveCompactness.overallCompactness - saturationImpact.compactnessPenalty) * 0.15,
  );
  const recoveryQuality = clampInteractionRating(
    recoveryPlayerQuality * 0.42 +
      shapeRecovery * 0.24 +
      input.defensiveParticipation.structuralRecoveryScore * 0.24 +
      (100 - input.transitionWindow.instability) * 0.1 -
      saturationImpact.recoveryQualityPenalty,
  );
  const defensiveInstability = clampInteractionRating(
    input.transitionWindow.instability * 0.45 +
      (100 - input.defensiveCompactness.overallCompactness) * 0.25 +
      (100 - recoveryQuality) * 0.18 +
      input.defensiveParticipation.delayedDefenders * 6 +
      input.defensiveParticipation.eliminatedDefenders * 8,
  );
  const delayedDefenders = Math.min(
    8,
    input.defensiveParticipation.delayedDefenders + Math.round(defensiveInstability / 45),
  );

  return {
    recoveryQuality,
    defensiveInstability,
    delayedDefenders,
    keyRecoveryRole: selectRecoveryRole(input.defensiveTeam),
    recoveryExplanation:
      input.defensiveParticipation.coveringDefenders > 0
        ? "covering defenders delay the transition without fully restoring the block"
        : "recovery depends on late runners returning to structure",
    breakdown: [
      { label: "recovery player quality", value: recoveryPlayerQuality },
      { label: "shape recovery", value: shapeRecovery },
      { label: "defensive transition", value: input.defensiveTeam.collectiveProperties.defensiveTransition },
      { label: "defensive compactness", value: input.defensiveCompactness.overallCompactness },
      { label: "structural recovery", value: input.defensiveParticipation.structuralRecoveryScore },
      { label: "window instability", value: input.transitionWindow.instability },
      { label: "recovery saturation penalty", value: -saturationImpact.recoveryQualityPenalty },
    ],
  };
}
