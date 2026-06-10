import type { Rating } from "../core/ratings";
import type { ZoneId } from "../core/zones";

export enum TacticalStyle {
  Control = "control",
  Blitz = "blitz",
  Fortress = "fortress",
  ChaosHunters = "chaos_hunters",
  Custom = "custom",
}

export enum MarkingStyle {
  Zonal = "zonal",
  Hybrid = "hybrid",
  ManOriented = "man_oriented",
}

export enum BallUsageStyle {
  FootOriented = "foot_oriented",
  Balanced = "balanced",
  HandOriented = "hand_oriented",
  Unbalanced = "unbalanced",
}

export enum OffensiveProgressionPhilosophy {
  CollectiveStructuredProgression = "COLLECTIVE_STRUCTURED_PROGRESSION",
  LongPlayLineBreaking = "LONG_PLAY_LINE_BREAKING",
  IndividualRupture = "INDIVIDUAL_RUPTURE",
  TerritorialSurvival = "TERRITORIAL_SURVIVAL",
}

export interface DefensiveInstructions {
  readonly blockHeight: Rating;
  readonly pressingIntensity: Rating;
  readonly aggressiveness: Rating;
  readonly markingStyle: MarkingStyle;
}

export interface OffensiveInstructions {
  readonly ballUsage: BallUsageStyle;
  readonly riskLevel: Rating;
  readonly verticality: Rating;
  readonly collectiveness: Rating;
}

export interface TacticalInstructions {
  readonly defensive: DefensiveInstructions;
  readonly offensive: OffensiveInstructions;
}

export interface CollectiveProperties {
  readonly cohesion: Rating;
  readonly offensiveTransition: Rating;
  readonly defensiveTransition: Rating;
  readonly collectiveMobility: Rating;
  readonly tacticalDiscipline: Rating;
  readonly collectiveReading: Rating;
  readonly resilience: Rating;
  readonly collectivePower: Rating;
}

export interface ShapeState {
  readonly compactness: Rating;
  readonly widthOccupation: Rating;
  readonly axisProtection: Rating;
  readonly diagonalSupport: Rating;
  readonly occupiedZones: readonly ZoneId[];
}

export interface ZoneDensity {
  readonly attackingDensity: Rating;
  readonly defensiveDensity: Rating;
  readonly pressure: Rating;
}

export type DensityMap = Partial<Record<ZoneId, ZoneDensity>>;

export interface TerritorialControl {
  readonly controlledZones: readonly ZoneId[];
  readonly contestedZones: readonly ZoneId[];
  readonly weakSideZones: readonly ZoneId[];
}

export interface TacticalState {
  readonly attackingShape: ShapeState;
  readonly defensiveShape: ShapeState;
  readonly densityMap: DensityMap;
  readonly weakSideExposure: Rating;
  readonly territorialControl: TerritorialControl;
}
