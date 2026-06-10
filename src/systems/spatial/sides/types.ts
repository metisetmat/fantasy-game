import type { Rating } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import { PitchSide } from "../types";

export { PitchSide };

export enum SideType {
  OpenSide = "OPEN_SIDE",
  ClosedSide = "CLOSED_SIDE",
  OverloadedSide = "OVERLOADED_SIDE",
  WeakSide = "WEAK_SIDE",
  BalancedSide = "BALANCED_SIDE",
}

export interface SidePressureProfile {
  readonly side: PitchSide;
  readonly defensivePressure: Rating;
  readonly attackingPresence: Rating;
  readonly totalDensity: Rating;
}

export interface SideContextEvaluation {
  readonly openSide: PitchSide;
  readonly closedSide: PitchSide;
  readonly overloadedSide: PitchSide;
  readonly weakSide: PitchSide;
  readonly reason: string;
  readonly profiles: readonly SidePressureProfile[];
  readonly sideTypesByZone: Partial<Record<ZoneId, SideType>>;
}
