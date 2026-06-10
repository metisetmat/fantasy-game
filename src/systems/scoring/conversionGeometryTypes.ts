import type { ScoringZoneId } from "../../core/scoringZones";
import type { PlayerId, TeamId } from "../../core/ids";
import type { LateralCorridor } from "../../core/zones";
import type { InGoalAccessLaneCategory } from "../rules";

export interface ConversionGeometry {
  readonly sourceMatchId: string;
  readonly sourceActionId: string;
  readonly scoringTeamId: TeamId;
  readonly scoringTeamName: string;
  readonly groundingPlayerId: PlayerId;
  readonly groundingZone: ScoringZoneId;
  readonly groundingLane: LateralCorridor;
  readonly groundingPoint: string;
  readonly groundingRouteType: InGoalAccessLaneCategory | "EXAMPLE";
  readonly conversionLine: string;
  readonly conversionAttemptEligible: true;
  readonly conversionPointOptions: readonly string[];
  readonly recommendedConversionPoint: string;
  readonly conversionAngleDifficulty: number;
  readonly conversionDistanceOptions: readonly string[];
  readonly defendingTeamBehindGoalLine: true;
  readonly conversionActive: true;
  readonly conversionPointsAwarded: 0;
  readonly conversionProcessDocumented: true;
  readonly reason: string;
}

export interface ConversionGeometryStorageSummary {
  readonly tryScoredCount: number;
  readonly geometryRowsStored: number;
  readonly missingGeometryRows: number;
  readonly conversionActive: true;
  readonly conversionPointsAwarded: 0;
  readonly conversionGeometryByLane: Readonly<Record<LateralCorridor, number>>;
  readonly averageConversionAngleDifficulty: number;
  readonly recommendation: "KEEP_CONVERSION_MODEL";
  readonly geometries: readonly ConversionGeometry[];
}
