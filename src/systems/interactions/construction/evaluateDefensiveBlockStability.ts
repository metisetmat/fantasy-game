import { LateralCorridor, type ZoneId } from "../../../core/zones";
import { PlayerRole } from "../../../models/player";
import { MarkingStyle } from "../../../models/tactics";
import type { CompactnessEvaluation, DensityEvaluation, SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import { getZoneParts } from "../../spatial";
import { averageInteractionRatings, clampInteractionRating } from "../shared/ratings";
import type { DefensiveBlockStabilityEvaluation } from "./types";

const BLOCK_DEFENDER_ROLES: readonly PlayerRole[] = [
  PlayerRole.MobileLock,
  PlayerRole.LeftAnchor,
  PlayerRole.RightAnchor,
  PlayerRole.FreeSafety,
  PlayerRole.ForwardLeader,
];

function selectKeyDefenderRole(team: SpatialTeamContext): PlayerRole {
  const role = BLOCK_DEFENDER_ROLES.find((candidateRole) =>
    team.players.some((player) => player.role === candidateRole),
  );

  return role ?? PlayerRole.MobileLock;
}

function getActiveZoneDensity(activeZone: ZoneId, density: DensityEvaluation): number {
  return density.densityMap[activeZone]?.defensiveDensity ?? 0;
}

function getMarkingStabilityModifier(team: SpatialTeamContext): number {
  switch (team.tacticalInstructions.defensive.markingStyle) {
    case MarkingStyle.Zonal:
      return 8;
    case MarkingStyle.Hybrid:
      return 3;
    case MarkingStyle.ManOriented:
      return -8;
  }
}

function isCentralZone(zoneId: ZoneId): boolean {
  return getZoneParts(zoneId).lateralCorridor === LateralCorridor.CentralAxis;
}

export interface DefensiveBlockStabilityInput {
  readonly defensiveTeam: SpatialTeamContext;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly density: DensityEvaluation;
  readonly activeZone: ZoneId;
  readonly weakSide: WeakSideEvaluation;
}

export function evaluateDefensiveBlockStability(
  input: DefensiveBlockStabilityInput,
): DefensiveBlockStabilityEvaluation {
  const defenders = input.defensiveTeam.players.filter((player) =>
    BLOCK_DEFENDER_ROLES.includes(player.role),
  );
  const defenderQuality = averageInteractionRatings(
    defenders.map((player) =>
      clampInteractionRating(
        player.attributes.intelligence * 0.28 +
          player.attributes.agility * 0.18 +
          player.attributes.speed * 0.12 +
          player.attributes.mental * 0.18 +
          player.attributes.power * 0.12 +
          player.fatigue.freshness * 0.12,
      ),
    ),
  );
  const activeZoneDensity = getActiveZoneDensity(input.activeZone, input.density);
  const centralResistance = clampInteractionRating(
    input.defensiveCompactness.overallCompactness * 0.35 +
      input.defensiveTeam.collectiveProperties.tacticalDiscipline * 0.22 +
      input.defensiveTeam.collectiveProperties.resilience * 0.18 +
      activeZoneDensity * 0.15 +
      (isCentralZone(input.activeZone) ? 10 : 0),
  );
  const slideMobility = clampInteractionRating(
    input.defensiveTeam.collectiveProperties.collectiveMobility * 0.35 +
      input.defensiveTeam.collectiveProperties.cohesion * 0.22 +
      input.defensiveTeam.collectiveProperties.defensiveTransition * 0.16 +
      defenderQuality * 0.17 +
      (100 - input.weakSide.exposure) * 0.1,
  );
  const blockStability = clampInteractionRating(
    input.defensiveCompactness.overallCompactness * 0.24 +
      centralResistance * 0.22 +
      slideMobility * 0.18 +
      defenderQuality * 0.16 +
      input.defensiveTeam.tacticalInstructions.defensive.blockHeight * 0.08 +
      getMarkingStabilityModifier(input.defensiveTeam) +
      (100 - input.weakSide.exposure) * 0.12,
  );

  return {
    blockStability,
    centralResistance,
    slideMobility,
    keyDefenderRole: selectKeyDefenderRole(input.defensiveTeam),
    breakdown: [
      { label: "defensive compactness", value: input.defensiveCompactness.overallCompactness },
      { label: "central resistance", value: centralResistance },
      { label: "slide mobility", value: slideMobility },
      { label: "defender quality", value: defenderQuality },
      { label: "active-zone density", value: activeZoneDensity },
    ],
  };
}
