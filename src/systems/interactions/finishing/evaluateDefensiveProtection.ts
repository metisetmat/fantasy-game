import { PlayerRole } from "../../../models/player";
import type { ZoneId } from "../../../core/zones";
import type { CompactnessEvaluation, DensityEvaluation, SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import { applyRecoverySaturationImpact } from "../../structure/recoverySaturation";
import type { DefensiveProtectionEvaluation } from "./types";

const PROTECTION_ROLES: readonly PlayerRole[] = [
  PlayerRole.FreeSafety,
  PlayerRole.LeftAnchor,
  PlayerRole.RightAnchor,
  PlayerRole.MobileLock,
];

export interface DefensiveProtectionInput {
  readonly defensiveTeam: SpatialTeamContext;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly density: DensityEvaluation;
  readonly activeZone: ZoneId;
  readonly weakSide: WeakSideEvaluation;
}

export function evaluateDefensiveProtection(input: DefensiveProtectionInput): DefensiveProtectionEvaluation {
  const saturationImpact = applyRecoverySaturationImpact(input.defensiveTeam.recoverySaturation);
  const protectors = input.defensiveTeam.players.filter((player) => PROTECTION_ROLES.includes(player.role));
  const anchorProtection = averageInteractionRatings(
    protectors.map((player) =>
      clampInteractionRating(
        player.attributes.intelligence * 0.24 +
          player.attributes.agility * 0.16 +
          player.attributes.speed * 0.16 +
          player.attributes.mental * 0.16 +
          player.attributes.power * 0.14 +
          player.fatigue.freshness * 0.14,
      ),
    ),
  );
  const scoringZoneDensity = input.density.densityMap[input.activeZone]?.defensiveDensity ?? 0;
  const protectionQuality = clampInteractionRating(
    Math.max(0, input.defensiveCompactness.overallCompactness - saturationImpact.compactnessPenalty) * 0.24 +
      input.defensiveTeam.collectiveProperties.defensiveTransition * 0.16 +
      input.defensiveTeam.collectiveProperties.tacticalDiscipline * 0.18 +
      input.defensiveTeam.collectiveProperties.resilience * 0.16 +
      anchorProtection * 0.16 +
      scoringZoneDensity * 0.1 -
      input.weakSide.exposure * 0.14 -
      saturationImpact.recoveryQualityPenalty,
  );

  return {
    protectionQuality,
    scoringZoneDensity,
    anchorProtection,
    breakdown: [
      { label: "defensive compactness", value: input.defensiveCompactness.overallCompactness },
      { label: "scoring-zone density", value: scoringZoneDensity },
      { label: "anchor protection", value: anchorProtection },
      { label: "weak side exposure penalty", value: input.weakSide.exposure },
      { label: "recovery saturation penalty", value: -saturationImpact.recoveryQualityPenalty },
    ],
  };
}
