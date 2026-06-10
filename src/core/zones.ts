export enum LongitudinalZone {
  DefensiveTryZone = "Z1",
  DeepDefense = "Z2",
  BuildOut = "Z3",
  Midfield = "Z4",
  OffensivePressure = "Z5",
  FinishingZone = "Z6",
  OffensiveTryZone = "Z7",
}

export enum LateralCorridor {
  LeftCorridor = "CL",
  LeftHalfSpace = "HSL",
  CentralAxis = "C",
  RightHalfSpace = "HSR",
  RightCorridor = "CR",
}

export type ZoneId = `${LongitudinalZone}-${LateralCorridor}`;

export interface ZoneDefinition {
  readonly id: ZoneId;
  readonly longitudinalZone: LongitudinalZone;
  readonly lateralCorridor: LateralCorridor;
}

export const LONGITUDINAL_ZONES: readonly LongitudinalZone[] = [
  LongitudinalZone.DefensiveTryZone,
  LongitudinalZone.DeepDefense,
  LongitudinalZone.BuildOut,
  LongitudinalZone.Midfield,
  LongitudinalZone.OffensivePressure,
  LongitudinalZone.FinishingZone,
  LongitudinalZone.OffensiveTryZone,
];

export const LATERAL_CORRIDORS: readonly LateralCorridor[] = [
  LateralCorridor.LeftCorridor,
  LateralCorridor.LeftHalfSpace,
  LateralCorridor.CentralAxis,
  LateralCorridor.RightHalfSpace,
  LateralCorridor.RightCorridor,
];

export const TACTICAL_ZONE_COUNT = 35;

export function createZoneId(
  longitudinalZone: LongitudinalZone,
  lateralCorridor: LateralCorridor,
): ZoneId {
  return `${longitudinalZone}-${lateralCorridor}`;
}
