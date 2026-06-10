import type { PlayerId, TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { LateralCorridor, LongitudinalZone, ZoneId } from "../../core/zones";
import type { PlayerRole, PlayerState } from "../../models/player";
import type { RecoverySaturationState } from "../structure/recoverySaturation";
import type { OffensiveMomentumState } from "../offense/momentum";
import type {
  CollectiveProperties,
  OffensiveProgressionPhilosophy,
  TacticalInstructions,
  TacticalStyle,
} from "../../models/tactics";

export enum SpatialPhase {
  Offensive = "offensive",
  Defensive = "defensive",
}

export enum SpatialLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export enum LaneAvailability {
  Closed = "CLOSED",
  Contested = "CONTESTED",
  Open = "OPEN",
}

export enum DensityStatus {
  Isolated = "isolated",
  Balanced = "balanced",
  Overloaded = "overloaded",
}

export enum PitchSide {
  Left = "left",
  Center = "center",
  Right = "right",
}

export interface SpatialTeamContext {
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly tacticalStyle: TacticalStyle;
  readonly offensiveProgressionPhilosophy: OffensiveProgressionPhilosophy;
  readonly players: readonly PlayerState[];
  readonly tacticalInstructions: TacticalInstructions;
  readonly collectiveProperties: CollectiveProperties;
  readonly structuralShiftDelay: Rating;
  readonly recoverySaturation: RecoverySaturationState;
  readonly offensiveMomentum: OffensiveMomentumState;
}

export interface RoleInfluence {
  readonly role: PlayerRole;
  readonly playerId: PlayerId;
  readonly influence: Rating;
}

export interface CellOccupation {
  readonly zoneId: ZoneId;
  readonly phase: SpatialPhase;
  readonly influence: Rating;
  readonly playerIds: readonly PlayerId[];
  readonly roleInfluences: readonly RoleInfluence[];
}

export type OccupationMap = Partial<Record<ZoneId, CellOccupation>>;

export interface TeamOccupation {
  readonly teamId: TeamId;
  readonly phase: SpatialPhase;
  readonly cells: readonly CellOccupation[];
  readonly occupationMap: OccupationMap;
}

export interface SpatialCellDensity {
  readonly zoneId: ZoneId;
  readonly attackingDensity: Rating;
  readonly defensiveDensity: Rating;
  readonly totalDensity: Rating;
  readonly pressure: Rating;
  readonly status: DensityStatus;
}

export type SpatialDensityMap = Partial<Record<ZoneId, SpatialCellDensity>>;

export interface DensityEvaluation {
  readonly cells: readonly SpatialCellDensity[];
  readonly densityMap: SpatialDensityMap;
  readonly overloadedZones: readonly ZoneId[];
  readonly isolatedZones: readonly ZoneId[];
}

export interface CompactnessEvaluation {
  readonly horizontalCompactness: Rating;
  readonly verticalCompactness: Rating;
  readonly overallCompactness: Rating;
  readonly label: SpatialLevel;
}

export interface OffensiveSpreadEvaluation {
  readonly widthOccupation: Rating;
  readonly verticalStretch: Rating;
  readonly spread: Rating;
  readonly label: SpatialLevel;
}

export interface SideOccupation {
  readonly side: PitchSide;
  readonly attackingInfluence: Rating;
  readonly defensiveInfluence: Rating;
  readonly density: Rating;
}

export interface WeakSideEvaluation {
  readonly overloadedSide: PitchSide;
  readonly weakSide: PitchSide;
  readonly exposure: Rating;
  readonly exposureLabel: SpatialLevel;
  readonly switchPlayOpportunity: LaneAvailability;
  readonly switchTargetZones: readonly ZoneId[];
}

export interface CorridorBand {
  readonly longitudinalZones: readonly LongitudinalZone[];
  readonly lateralCorridors: readonly LateralCorridor[];
}
