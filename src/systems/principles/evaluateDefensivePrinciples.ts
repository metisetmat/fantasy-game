import { LateralCorridor } from "../../core/zones";
import type { PressureLevel } from "../../models/match";
import { PitchSide, type CompactnessEvaluation, type SpatialTeamContext } from "../spatial";
import { getPitchSideForZone, type SideContextEvaluation } from "../spatial/sides";
import { getZoneParts } from "../spatial/utils";
import { PrincipleQuality, type DefensivePrinciples } from "./types";

function quality(value: number): PrincipleQuality {
  if (value >= 67) {
    return PrincipleQuality.Good;
  }

  if (value <= 34) {
    return PrincipleQuality.Poor;
  }

  return PrincipleQuality.Medium;
}

function countDefensiveCorridors(team: SpatialTeamContext): number {
  return new Set(team.players.map((player) => getZoneParts(player.currentZone).lateralCorridor)).size;
}

function centralPresence(team: SpatialTeamContext): number {
  return team.players.filter((player) => getZoneParts(player.currentZone).lateralCorridor === LateralCorridor.CentralAxis).length;
}

export function evaluateDefensivePrinciples(input: {
  readonly defendingTeam: SpatialTeamContext;
  readonly compactness: CompactnessEvaluation;
  readonly sideContext: SideContextEvaluation;
  readonly pressure: PressureLevel;
}): DefensivePrinciples {
  const compactnessCorridors = countDefensiveCorridors(input.defendingTeam);
  const axisScore = centralPresence(input.defendingTeam) * 18 + input.compactness.verticalCompactness * 0.28;
  const nearSideClosed = input.sideContext.closedSide !== PitchSide.Center ? 72 : 55;
  const pressureIntensity = input.defendingTeam.tacticalInstructions.defensive.pressingIntensity;
  const discipline = input.defendingTeam.collectiveProperties.tacticalDiscipline;
  const coverShadowScore = pressureIntensity * 0.35 + discipline * 0.35 + input.compactness.overallCompactness * 0.2;
  const trapScore = pressureIntensity * 0.45 + nearSideClosed * 0.25 + input.compactness.horizontalCompactness * 0.18;

  return {
    threeCorridorCompactness: compactnessCorridors <= 3 ? PrincipleQuality.Good : compactnessCorridors === 4 ? PrincipleQuality.Medium : PrincipleQuality.Poor,
    axisProtection: quality(axisScore),
    nearSideClosure: quality(nearSideClosed),
    coverShadow: quality(coverShadowScore),
    pressingTrapQuality: quality(trapScore),
    restDefenseIntegrity: quality(input.defendingTeam.collectiveProperties.defensiveTransition * 0.45 + discipline * 0.35),
    depthProtection: quality(input.defendingTeam.collectiveProperties.resilience * 0.4 + input.compactness.verticalCompactness * 0.32),
    counterpressReadiness: quality(pressureIntensity * 0.4 + input.defendingTeam.collectiveProperties.collectiveMobility * 0.28),
    defensiveFoldSpeed: quality(input.defendingTeam.collectiveProperties.defensiveTransition * 0.45 + input.defendingTeam.collectiveProperties.collectiveMobility * 0.3),
    numericalContainment: quality(input.compactness.overallCompactness * 0.45 + axisScore * 0.25),
    compactnessCorridors,
  };
}
