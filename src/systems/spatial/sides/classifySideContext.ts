import type { ZoneId } from "../../../core/zones";
import { LateralCorridor } from "../../../core/zones";
import type { DensityEvaluation, WeakSideEvaluation } from "../types";
import { PitchSide } from "../types";
import { getZoneParts } from "../utils";
import { evaluateClosedSide } from "./evaluateClosedSide";
import { evaluateOpenSide } from "./evaluateOpenSide";
import { SideType, type SideContextEvaluation, type SidePressureProfile } from "./types";

export function getPitchSideForZone(zone: ZoneId): PitchSide {
  const { lateralCorridor } = getZoneParts(zone);

  switch (lateralCorridor) {
    case LateralCorridor.LeftCorridor:
    case LateralCorridor.LeftHalfSpace:
      return PitchSide.Left;
    case LateralCorridor.RightHalfSpace:
    case LateralCorridor.RightCorridor:
      return PitchSide.Right;
    case LateralCorridor.CentralAxis:
      return PitchSide.Center;
  }
}

function createProfiles(density: DensityEvaluation): readonly SidePressureProfile[] {
  return [PitchSide.Left, PitchSide.Center, PitchSide.Right].map((side) => {
    const sideCells = density.cells.filter((cell) => getPitchSideForZone(cell.zoneId) === side);
    const divisor = Math.max(1, sideCells.length);

    return {
      side,
      defensivePressure: Math.round(
        sideCells.reduce((sum, cell) => sum + cell.defensiveDensity + cell.pressure * 0.3, 0) / divisor,
      ),
      attackingPresence: Math.round(
        sideCells.reduce((sum, cell) => sum + cell.attackingDensity, 0) / divisor,
      ),
      totalDensity: Math.round(sideCells.reduce((sum, cell) => sum + cell.totalDensity, 0) / divisor),
    };
  });
}

function getOverloadedSide(profiles: readonly SidePressureProfile[]): PitchSide {
  return [...profiles].sort((left, right) => {
    const rightLoad = right.defensivePressure + right.attackingPresence;
    const leftLoad = left.defensivePressure + left.attackingPresence;

    return rightLoad - leftLoad;
  })[0]?.side ?? PitchSide.Center;
}

function describeReason(input: {
  readonly pressingLocation: ZoneId;
  readonly closedSide: PitchSide;
  readonly openSide: PitchSide;
}): string {
  return `pressure concentrated around ${input.pressingLocation} on the ${input.closedSide.toUpperCase()} side; open side is ${input.openSide.toUpperCase()}`;
}

function getOppositeSide(side: PitchSide): PitchSide {
  switch (side) {
    case PitchSide.Left:
      return PitchSide.Right;
    case PitchSide.Right:
      return PitchSide.Left;
    case PitchSide.Center:
      return PitchSide.Center;
  }
}

export function classifySideContext(input: {
  readonly density: DensityEvaluation;
  readonly pressingLocation: ZoneId;
  readonly weakSide: WeakSideEvaluation;
}): SideContextEvaluation {
  const profiles = createProfiles(input.density);
  const pressureSide = getPitchSideForZone(input.pressingLocation);
  const closedSide = pressureSide === PitchSide.Center ? evaluateClosedSide(profiles) : pressureSide;
  const openSide = pressureSide === PitchSide.Center ? evaluateOpenSide(profiles) : getOppositeSide(pressureSide);
  const overloadedSide = getOverloadedSide(profiles);
  const weakSide = input.weakSide.weakSide;
  const sideTypesByZone = input.density.cells.reduce<Partial<Record<ZoneId, SideType>>>((accumulator, cell) => {
    const side = getPitchSideForZone(cell.zoneId);
    let sideType = SideType.BalancedSide;

    if (side === weakSide) {
      sideType = SideType.WeakSide;
    } else if (side === openSide) {
      sideType = SideType.OpenSide;
    } else if (side === closedSide) {
      sideType = SideType.ClosedSide;
    } else if (side === overloadedSide) {
      sideType = SideType.OverloadedSide;
    }

    return {
      ...accumulator,
      [cell.zoneId]: sideType,
    };
  }, {});

  return {
    openSide,
    closedSide,
    overloadedSide,
    weakSide,
    reason: describeReason({
      pressingLocation: input.pressingLocation,
      closedSide,
      openSide,
    }),
    profiles,
    sideTypesByZone,
  };
}
