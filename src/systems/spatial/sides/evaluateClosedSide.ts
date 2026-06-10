import { PitchSide } from "../types";
import type { SidePressureProfile } from "./types";

const SIDE_ORDER: readonly PitchSide[] = [PitchSide.Left, PitchSide.Center, PitchSide.Right];

export function evaluateClosedSide(profiles: readonly SidePressureProfile[]): PitchSide {
  const sorted = [...profiles].sort((left, right) => {
    const pressureGap = right.defensivePressure - left.defensivePressure;

    if (pressureGap !== 0) {
      return pressureGap;
    }

    return SIDE_ORDER.indexOf(left.side) - SIDE_ORDER.indexOf(right.side);
  });

  return sorted[0]?.side ?? PitchSide.Center;
}
