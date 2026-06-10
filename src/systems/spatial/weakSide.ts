import type { Rating } from "../../core/ratings";
import { LateralCorridor } from "../../core/zones";
import type { ZoneId } from "../../core/zones";
import type { DensityEvaluation, SideOccupation, WeakSideEvaluation } from "./types";
import { LaneAvailability, PitchSide } from "./types";
import { clampRating, getZoneParts, labelRating } from "./utils";

const LEFT_CORRIDORS: readonly LateralCorridor[] = [
  LateralCorridor.LeftCorridor,
  LateralCorridor.LeftHalfSpace,
];

const RIGHT_CORRIDORS: readonly LateralCorridor[] = [
  LateralCorridor.RightHalfSpace,
  LateralCorridor.RightCorridor,
];

function getPitchSide(zoneId: ZoneId): PitchSide {
  const { lateralCorridor } = getZoneParts(zoneId);
  if (LEFT_CORRIDORS.includes(lateralCorridor)) {
    return PitchSide.Left;
  }

  if (RIGHT_CORRIDORS.includes(lateralCorridor)) {
    return PitchSide.Right;
  }

  return PitchSide.Center;
}

function averageBySide(values: readonly Rating[], cellCount: number): Rating {
  if (cellCount === 0) {
    return 0;
  }

  return clampRating(values.reduce((sum, value) => sum + value, 0) / cellCount);
}

export function calculateSideOccupation(density: DensityEvaluation): readonly SideOccupation[] {
  const sides: readonly PitchSide[] = [PitchSide.Left, PitchSide.Center, PitchSide.Right];

  return sides.map((side) => {
    const sideCells = density.cells.filter((cell) => getPitchSide(cell.zoneId) === side);

    return {
      side,
      attackingInfluence: averageBySide(
        sideCells.map((cell) => cell.attackingDensity),
        sideCells.length,
      ),
      defensiveInfluence: averageBySide(
        sideCells.map((cell) => cell.defensiveDensity),
        sideCells.length,
      ),
      density: averageBySide(
        sideCells.map((cell) => cell.totalDensity),
        sideCells.length,
      ),
    };
  });
}

export function detectOverloadedSide(sideOccupations: readonly SideOccupation[]): PitchSide {
  return sideOccupations.reduce((current, candidate) =>
    candidate.density > current.density ? candidate : current,
  ).side;
}

export function detectWeakSide(sideOccupations: readonly SideOccupation[]): PitchSide {
  const wideSides = sideOccupations.filter((sideOccupation) => sideOccupation.side !== PitchSide.Center);
  return wideSides.reduce((current, candidate) =>
    candidate.defensiveInfluence < current.defensiveInfluence ? candidate : current,
  ).side;
}

function evaluateLaneAvailability(exposure: Rating): LaneAvailability {
  if (exposure >= 60) {
    return LaneAvailability.Open;
  }

  if (exposure >= 35) {
    return LaneAvailability.Contested;
  }

  return LaneAvailability.Closed;
}

function getSwitchTargetZones(density: DensityEvaluation, weakSide: PitchSide): readonly ZoneId[] {
  return density.cells
    .filter((cell) => getPitchSide(cell.zoneId) === weakSide)
    .filter((cell) => cell.defensiveDensity < 45)
    .sort((first, second) => second.attackingDensity - first.attackingDensity)
    .slice(0, 3)
    .map((cell) => cell.zoneId);
}

export function evaluateWeakSideExposure(density: DensityEvaluation): WeakSideEvaluation {
  const sideOccupations = calculateSideOccupation(density);
  const overloadedSide = detectOverloadedSide(sideOccupations);
  const weakSide = detectWeakSide(sideOccupations);
  const weakSideOccupation = sideOccupations.find((sideOccupation) => sideOccupation.side === weakSide);
  const overloadedSideOccupation = sideOccupations.find(
    (sideOccupation) => sideOccupation.side === overloadedSide,
  );
  const weakDefensiveInfluence = weakSideOccupation?.defensiveInfluence ?? 0;
  const overloadedDensity = overloadedSideOccupation?.density ?? 0;
  const exposure = clampRating((100 - weakDefensiveInfluence) * 0.65 + overloadedDensity * 0.35);

  return {
    overloadedSide,
    weakSide,
    exposure,
    exposureLabel: labelRating(exposure),
    switchPlayOpportunity: evaluateLaneAvailability(exposure),
    switchTargetZones: getSwitchTargetZones(density, weakSide),
  };
}
