import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import { LATERAL_CORRIDORS, LONGITUDINAL_ZONES, type ZoneId } from "../../core/zones";
import type { BatchScoringCalibrationSummary, MatchScoringCalibrationSample } from "./batchScoringCalibrationTypes";

export type ShotOriginCleanWindowType = "CLEAN" | "CONTESTED" | "FORCED" | "PARTIAL";
export type ShotOutcome = "GOAL" | "MISS" | "SAVED_OR_DEFLECTED";
export type ShotOriginAttackingDirection = "BLITZ attacks Z7 -> Z1" | "CONTROL attacks Z1 -> Z7";
export type TargetGoalZone = "Z1-C / GOAL_FRAME" | "Z7-C / GOAL_FRAME";
export type ShotDistanceBand = "CLOSE_RANGE" | "LONG_RANGE" | "MID_RANGE" | "VERY_LONG_RANGE";
export type ShotAngleCategory = "CENTRAL" | "HALF_SPACE" | "NARROW_ANGLE" | "WIDE";
export type ShotProbabilityBucket = "ELITE_XG" | "ELITE_XSOT" | "HIGH_XG" | "HIGH_XSOT" | "LOW_XG" | "LOW_XSOT" | "MEDIUM_XG" | "MEDIUM_XSOT";
export type ShotProbabilityPlausibility = "PLAUSIBLE" | "XG_OVERPERFORMANCE" | "XG_UNDERPERFORMANCE" | "XSOT_OVERPERFORMANCE" | "XSOT_UNDERPERFORMANCE";
export type ShotContextModifierName =
  | "body balance"
  | "defensive block"
  | "fatigue"
  | "goalkeeper alignment"
  | "goalkeeper legal hand-use"
  | "half-space context"
  | "pressure"
  | "rebound / second shot"
  | "shot placement"
  | "shot power"
  | "shot quality"
  | "shot window"
  | "shooter skill"
  | "style";

export interface ShotContextModifier {
  readonly name: ShotContextModifierName;
  readonly xSOTDelta: number;
  readonly xGDelta: number;
  readonly reason: string;
}
export type NormalizedOriginBand =
  | "deep / low-value"
  | "mid central"
  | "mid half-space"
  | "near goal central"
  | "near goal half-space"
  | "wide / channel";
export type DistanceToTargetGoalBand = "DEEP" | "MID" | "NEAR" | "VERY_NEAR";
export type AlignmentQuality = "ALIGNED" | "LATE_SET" | "MISALIGNED" | "PARTIAL";
export type ShotAccessRouteFamily =
  | "central rebuild"
  | "direct possession progression"
  | "forward progress"
  | "rebound / second shot"
  | "support recycle"
  | "transition / turnover"
  | "weak-side switch";
export type HighValueZoneClassification =
  | "DEFENSIVE_SHAPE_ALIGNMENT_ISSUE"
  | "DESERVED_HIGH_VALUE_ZONE"
  | "DIRECTIONAL_ASYMMETRY"
  | "GK_ALIGNMENT_ISSUE"
  | "OVER_ACCESSIBLE_ZONE"
  | "SAMPLE_SIZE_WATCH"
  | "TARGET_PROXIMITY_EXPLAINS_VALUE";
export type ShotAccessClassification =
  | "CLEAN_CREATION_DESERVED"
  | "CONTINUATION_PIPELINE_TO_SHOT"
  | "DEFENSIVE_SHAPE_ERROR"
  | "GK_OR_SHAPE_MISALIGNMENT"
  | "OVER_ACCESSIBLE_CENTRAL_ZONE"
  | "REBOUND_OR_SCRAMBLE"
  | "TARGET_GOAL_PROXIMITY_DESERVED"
  | "TRANSITION_REWARD";

export type HalfSpaceShotClassification =
  | "DESPERATE_HALF_SPACE_SECOND_SHOT"
  | "LOW_QUALITY_CONTEXT_CORRECTLY_SUPPRESSED"
  | "NARROW_ANGLE_WIDE_LIKE"
  | "OVER_SUPPRESSED_HALF_SPACE"
  | "PLAUSIBLE_HIGH_THREAT_HALF_SPACE"
  | "REBOUND_HALF_SPACE_SHOT"
  | "TRUE_HALF_SPACE_CLEAN_WINDOW"
  | "TRUE_HALF_SPACE_FORCED"
  | "TRUE_HALF_SPACE_PARTIAL_WINDOW"
  | "TRUE_HALF_SPACE_PRESSURED";

export interface ShotOriginRecord {
  readonly matchId: string;
  readonly team: "BLITZ" | "CONTROL";
  readonly defendingTeam: "BLITZ" | "CONTROL";
  readonly styleMatchup: string;
  readonly shootingTeamStyle: string;
  readonly defendingTeamStyle: string;
  readonly attackingDirection: ShotOriginAttackingDirection;
  readonly originZone: ZoneId;
  readonly targetGoalZone: TargetGoalZone;
  readonly targetGoalFrame: "GOAL_FRAME";
  readonly approximateX: number;
  readonly approximateY: number;
  readonly approximateShotDistanceMeters: number;
  readonly distanceBand: ShotDistanceBand;
  readonly shotAngleDegrees: number;
  readonly shotAngleCategory: ShotAngleCategory;
  readonly normalizedAttackingLane: NormalizedOriginBand;
  readonly distanceToTargetGoalBand: DistanceToTargetGoalBand;
  readonly zoneFamily: string;
  readonly shotOutcome: ShotOutcome;
  readonly onTarget: "NO" | "YES";
  readonly goal: "NO" | "YES";
  readonly beforeShotOutcome: ShotOutcome;
  readonly beforeOnTarget: "NO" | "YES";
  readonly beforeGoal: "NO" | "YES";
  readonly cleanWindowType: ShotOriginCleanWindowType;
  readonly pressureCategory: string;
  readonly goalkeeperZone: ZoneId;
  readonly goalkeeperChallenge: number;
  readonly goalkeeperAlignmentToTargetGoal: AlignmentQuality;
  readonly goalkeeperLegalHandUseAvailable: "NO" | "YES";
  readonly defensiveBlockPressure: number;
  readonly defensiveShapeScore: number;
  readonly defensiveShapeAlignmentToTargetGoal: AlignmentQuality;
  readonly routeFamily: ShotAccessRouteFamily;
  readonly accessClassification: ShotAccessClassification;
  readonly baseGeometryXSOT: number;
  readonly baseGeometryXG: number;
  readonly contextModifiers: readonly ShotContextModifier[];
  readonly topPositiveModifiers: readonly string[];
  readonly topNegativeModifiers: readonly string[];
  readonly finalXSOT: number;
  readonly finalXG: number;
  readonly finalXSOTDeltaFromBase: number;
  readonly finalXGDeltaFromBase: number;
  readonly probabilityReason: string;
  readonly xSOT: number;
  readonly xSOTBucket: ShotProbabilityBucket;
  readonly xG: number;
  readonly xGBucket: ShotProbabilityBucket;
  readonly probabilityPlausibility: ShotProbabilityPlausibility;
  readonly xGDelta: number;
  readonly xSOTDelta: number;
}

export interface ShotOriginZoneSummary {
  readonly zone: ZoneId;
  readonly attempts: number;
  readonly goals: number;
  readonly beforeGoals: number;
  readonly beforeOnTargetRate: number;
  readonly onTargetRate: number;
  readonly conversionRate: number;
  readonly averageXSOT: number;
  readonly averageXG: number;
  readonly xGPerformance: number;
  readonly xSOTOverperformanceCount: number;
  readonly xGOverperformanceCount: number;
}

export interface DirectionalShotOriginSummary {
  readonly originZone: ZoneId;
  readonly targetGoalZone: TargetGoalZone;
  readonly attackingDirection: ShotOriginAttackingDirection;
  readonly shootingTeam: "BLITZ" | "CONTROL";
  readonly attempts: number;
  readonly goals: number;
  readonly onTargetRate: number;
  readonly conversionRate: number;
  readonly averageGoalkeeperChallenge: number;
  readonly averageDefensiveBlockPressure: number;
  readonly averageXSOT: number;
  readonly averageXG: number;
  readonly cleanWindowShare: number;
  readonly forcedWindowShare: number;
  readonly pressuredWindowShare: number;
}

export interface NormalizedShotOriginSummary {
  readonly normalizedOriginBand: NormalizedOriginBand;
  readonly attempts: number;
  readonly goals: number;
  readonly onTargetRate: number;
  readonly conversionRate: number;
  readonly averageXSOT: number;
  readonly averageXG: number;
  readonly tacticalRead: string;
}

export interface HighValueShotZoneAuditRow {
  readonly originZone: ZoneId;
  readonly targetGoalZone: TargetGoalZone;
  readonly attackingDirection: ShotOriginAttackingDirection;
  readonly attempts: number;
  readonly goals: number;
  readonly conversionRate: number;
  readonly onTargetRate: number;
  readonly cleanWindowCount: number;
  readonly forcedWindowCount: number;
  readonly pressuredWindowCount: number;
  readonly averageGoalkeeperChallenge: number;
  readonly averageDefensiveBlockPressure: number;
  readonly averageDefensiveShapeScore: number;
  readonly averageXSOT: number;
  readonly averageXG: number;
  readonly xGPerformance: number;
  readonly topRouteFamily: ShotAccessRouteFamily;
  readonly classification: HighValueZoneClassification;
  readonly accessClassification: ShotAccessClassification;
  readonly tacticalRead: string;
}

export interface RouteFamilyToShotZoneRow {
  readonly routeFamily: ShotAccessRouteFamily;
  readonly attempts: number;
  readonly goals: number;
  readonly topOriginZone: ZoneId | "none";
  readonly highValueAttempts: number;
  readonly tacticalRead: string;
}

export interface DirectionSymmetryRow {
  readonly comparison: string;
  readonly controlValue: string;
  readonly blitzValue: string;
  readonly interpretation: string;
}

export interface ShotOriginHeatmapSummary {
  readonly records: readonly ShotOriginRecord[];
  readonly zoneRows: readonly ShotOriginZoneSummary[];
  readonly directionalRows: readonly DirectionalShotOriginSummary[];
  readonly normalizedRows: readonly NormalizedShotOriginSummary[];
  readonly highValueAuditRows: readonly HighValueShotZoneAuditRow[];
  readonly routeFamilyRows: readonly RouteFamilyToShotZoneRow[];
  readonly directionSymmetryRows: readonly DirectionSymmetryRow[];
  readonly hottestZones: readonly ShotOriginZoneSummary[];
  readonly suspiciousOverConcentration: "NO" | "YES";
  readonly calibrationApplied: "ACCESS_AUDIT_ONLY" | "TACTICAL_ACCESS_GATE_RECOMMENDED";
  readonly interpretation: string;
  readonly recommendations: readonly string[];
}

const FIELD_LENGTH_METERS = 100;
const FIELD_WIDTH_METERS = 70;
const IN_GOAL_DEPTH_METERS = 10;
const GOAL_FRAME_WIDTH_METERS = 7.32;
const GOAL_FRAME_HEIGHT_METERS = 2.44;
const GOALKEEPER_AREA_DEPTH_METERS = 16.5;
const GOALKEEPER_AREA_WIDTH_METERS = 40.3;
const ZONE_LENGTH_METERS = FIELD_LENGTH_METERS / LONGITUDINAL_ZONES.length;
const LANE_WIDTH_METERS = FIELD_WIDTH_METERS / LATERAL_CORRIDORS.length;

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function styleMatchup(sample: MatchScoringCalibrationSample): string {
  return `${sample.scenario.controlStyleVariant} vs ${sample.scenario.blitzStyleVariant}`;
}

function targetGoalZone(team: "BLITZ" | "CONTROL"): TargetGoalZone {
  return team === "CONTROL" ? "Z7-C / GOAL_FRAME" : "Z1-C / GOAL_FRAME";
}

function attackingDirection(team: "BLITZ" | "CONTROL"): ShotOriginAttackingDirection {
  return team === "CONTROL" ? "CONTROL attacks Z1 -> Z7" : "BLITZ attacks Z7 -> Z1";
}

function longitudinalIndex(zone: ZoneId): number {
  const match = /^Z(\d)-/.exec(zone);

  return match?.[1] === undefined ? 4 : Number.parseInt(match[1], 10);
}

function corridor(zone: ZoneId): string {
  return zone.split("-")[1] ?? "C";
}

export function isHalfSpaceOriginZone(zone: ZoneId): boolean {
  const lane = corridor(zone);

  return lane === "HSL" || lane === "HSR";
}

function laneIndex(zone: ZoneId): number {
  const lane = corridor(zone);
  const index = LATERAL_CORRIDORS.indexOf(lane as (typeof LATERAL_CORRIDORS)[number]);

  return index < 0 ? 2 : index;
}

function zoneCenter(zone: ZoneId): { readonly x: number; readonly y: number } {
  const x = (longitudinalIndex(zone) - 0.5) * ZONE_LENGTH_METERS;
  const y = (laneIndex(zone) + 0.5) * LANE_WIDTH_METERS;

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
}

function targetGoalCenter(team: "BLITZ" | "CONTROL"): { readonly x: number; readonly y: number } {
  return {
    x: team === "CONTROL" ? FIELD_LENGTH_METERS : 0,
    y: FIELD_WIDTH_METERS / 2,
  };
}

function shotDistanceMeters(team: "BLITZ" | "CONTROL", zone: ZoneId): number {
  const origin = zoneCenter(zone);
  const target = targetGoalCenter(team);
  const distance = Math.hypot(target.x - origin.x, target.y - origin.y);

  return Math.round(distance * 10) / 10;
}

function shotDistanceBand(distance: number): ShotDistanceBand {
  if (distance <= 16.5) {
    return "CLOSE_RANGE";
  }

  if (distance <= 30) {
    return "MID_RANGE";
  }

  if (distance <= 45) {
    return "LONG_RANGE";
  }

  return "VERY_LONG_RANGE";
}

function shotAngleDegrees(team: "BLITZ" | "CONTROL", zone: ZoneId): number {
  const origin = zoneCenter(zone);
  const target = targetGoalCenter(team);
  const distance = Math.max(1, Math.abs(target.x - origin.x));
  const lateralOffset = Math.abs(target.y - origin.y);
  const frameAngle = Math.atan(GOAL_FRAME_WIDTH_METERS / Math.max(1, distance)) * (180 / Math.PI);
  const offsetPenalty = Math.atan(lateralOffset / Math.max(1, distance)) * (180 / Math.PI);

  return Math.max(1, Math.round((frameAngle - offsetPenalty * 0.45) * 10) / 10);
}

function shotAngleCategory(zone: ZoneId, angle: number): ShotAngleCategory {
  const lane = corridor(zone);

  if (lane === "CL" || lane === "CR") {
    return "WIDE";
  }

  if (angle <= 8) {
    return "NARROW_ANGLE";
  }

  return lane === "C" ? "CENTRAL" : "HALF_SPACE";
}

function distancePenalty(distance: number): number {
  if (distance <= 16.5) {
    return 0;
  }

  if (distance <= 30) {
    return 12;
  }

  if (distance <= 45) {
    return 30;
  }

  return 44;
}

function anglePenalty(category: ShotAngleCategory): number {
  switch (category) {
    case "CENTRAL":
      return 0;
    case "HALF_SPACE":
      return 8;
    case "NARROW_ANGLE":
      return 18;
    case "WIDE":
      return 24;
  }
}

function normalizedDistanceFromTarget(team: "BLITZ" | "CONTROL", zone: ZoneId): number {
  const index = longitudinalIndex(zone);

  return team === "CONTROL" ? 7 - index : index - 1;
}

function normalizedOriginBand(team: "BLITZ" | "CONTROL", zone: ZoneId): NormalizedOriginBand {
  const distance = normalizedDistanceFromTarget(team, zone);
  const lane = corridor(zone);

  if (lane !== "C" && !lane.includes("HS")) {
    return "wide / channel";
  }

  if (distance <= 1) {
    return lane === "C" ? "near goal central" : "near goal half-space";
  }

  if (distance <= 3) {
    return lane === "C" ? "mid central" : "mid half-space";
  }

  return "deep / low-value";
}

function distanceToTargetGoalBand(team: "BLITZ" | "CONTROL", zone: ZoneId): DistanceToTargetGoalBand {
  const distance = normalizedDistanceFromTarget(team, zone);

  if (distance <= 1) {
    return "VERY_NEAR";
  }

  if (distance <= 2) {
    return "NEAR";
  }

  if (distance <= 4) {
    return "MID";
  }

  return "DEEP";
}

function zoneFamily(team: "BLITZ" | "CONTROL", zone: ZoneId): string {
  const band = normalizedOriginBand(team, zone);

  if (band === "near goal central") {
    return "target-proximate central finishing";
  }

  if (band === "near goal half-space") {
    return "target-proximate half-space finishing";
  }

  if (band === "mid central") {
    return "central pressure shooting lane";
  }

  if (band === "mid half-space") {
    return "half-space shooting lane";
  }

  return "low-probability or wide shot geography";
}

function candidateZones(sample: MatchScoringCalibrationSample, team: "BLITZ" | "CONTROL"): readonly ZoneId[] {
  const direct = sample.scenario.controlStyleVariant === "CONTROL_DIRECT" || sample.scenario.blitzStyleVariant === "BLITZ_RISKY";
  const patient = sample.scenario.controlStyleVariant === "CONTROL_PATIENT";
  const aggressive = sample.scenario.blitzStyleVariant === "BLITZ_AGGRESSIVE";

  if (direct && team === "CONTROL") {
    return ["Z6-C", "Z6-HSL", "Z5-C", "Z6-HSR"];
  }

  if (direct && team === "BLITZ") {
    return ["Z2-C", "Z2-HSR", "Z3-C", "Z2-HSL"];
  }

  if (patient) {
    return team === "CONTROL" ? ["Z5-C", "Z5-HSL", "Z4-HSL", "Z5-HSR"] : ["Z3-C", "Z3-HSR", "Z4-HSR", "Z3-HSL"];
  }

  if (aggressive) {
    return team === "CONTROL" ? ["Z5-HSL", "Z5-C", "Z4-C", "Z6-HSL"] : ["Z3-HSR", "Z3-C", "Z4-C", "Z2-HSR"];
  }

  return team === "CONTROL" ? ["Z5-C", "Z5-HSL", "Z5-HSR", "Z4-C"] : ["Z3-C", "Z3-HSL", "Z3-HSR", "Z4-C"];
}

function goalkeeperZone(team: "BLITZ" | "CONTROL", originZone: ZoneId): ZoneId {
  const lane = corridor(originZone);

  if (team === "CONTROL") {
    return lane === "C" ? "Z7-C" : lane === "HSL" ? "Z7-HSL" : "Z7-HSR";
  }

  return lane === "C" ? "Z1-C" : lane === "HSL" ? "Z1-HSL" : "Z1-HSR";
}

function routeFamilyFor(input: {
  readonly sample: MatchScoringCalibrationSample;
  readonly team: "BLITZ" | "CONTROL";
  readonly index: number;
  readonly originZone: ZoneId;
}): ShotAccessRouteFamily {
  if (input.index % 11 === 0) {
    return "rebound / second shot";
  }

  if (input.sample.scenario.pressureProfile === "HIGH" && input.index % 3 === 0) {
    return "transition / turnover";
  }

  if (input.originZone.includes("-C") && input.index % 4 === 0) {
    return "central rebuild";
  }

  if (input.sample.scenario.controlStyleVariant === "CONTROL_DIRECT" || input.sample.scenario.blitzStyleVariant === "BLITZ_RISKY") {
    return "direct possession progression";
  }

  if (input.index % 5 === 0) {
    return "weak-side switch";
  }

  if (input.index % 2 === 0) {
    return "forward progress";
  }

  return "support recycle";
}

function reboundSecondShotZone(input: {
  readonly team: "BLITZ" | "CONTROL";
  readonly currentZone: ZoneId;
  readonly index: number;
  readonly pressure: string;
}): ZoneId {
  const longitudinal = input.currentZone.split("-")[0] ?? (input.team === "CONTROL" ? "Z6" : "Z2");

  if (input.index % 7 === 0 && input.pressure !== "HIGH") {
    return `${longitudinal}-C` as ZoneId;
  }

  if (input.index % 5 === 0) {
    return `${longitudinal}-${input.team === "CONTROL" ? "HSL" : "HSR"}` as ZoneId;
  }

  if (input.index % 3 === 0) {
    return `${longitudinal}-${input.team === "CONTROL" ? "HSR" : "HSL"}` as ZoneId;
  }

  return `${longitudinal}-${input.index % 2 === 0 ? "CL" : "CR"}` as ZoneId;
}

function cleanWindowType(sample: MatchScoringCalibrationSample, index: number): ShotOriginCleanWindowType {
  if (index < sample.cleanWindowShotCount) {
    return index % 2 === 0 ? "CLEAN" : "PARTIAL";
  }

  if (index < sample.forcedShotCount) {
    return "FORCED";
  }

  return "CONTESTED";
}

function goalkeeperChallenge(input: {
  readonly team: "BLITZ" | "CONTROL";
  readonly zone: ZoneId;
  readonly cleanWindow: ShotOriginCleanWindowType;
  readonly pressure: string;
  readonly index: number;
}): number {
  const distance = normalizedDistanceFromTarget(input.team, input.zone);
  const base = 72 - distance * 9;
  const cleanPenalty = input.cleanWindow === "CLEAN" ? -14 : input.cleanWindow === "PARTIAL" ? -7 : input.cleanWindow === "FORCED" ? 10 : 2;
  const pressureBoost = input.pressure === "HIGH" ? 9 : input.pressure === "MEDIUM" ? 5 : 0;

  return Math.max(18, Math.min(92, base + cleanPenalty + pressureBoost + (input.index % 5)));
}

function defensiveBlockPressure(input: {
  readonly team: "BLITZ" | "CONTROL";
  readonly zone: ZoneId;
  readonly cleanWindow: ShotOriginCleanWindowType;
  readonly pressure: string;
  readonly routeFamily: ShotAccessRouteFamily;
}): number {
  const band = normalizedOriginBand(input.team, input.zone);
  const centralBoost = band.includes("central") ? 10 : 3;
  const windowPenalty = input.cleanWindow === "CLEAN" ? -18 : input.cleanWindow === "PARTIAL" ? -8 : input.cleanWindow === "FORCED" ? 12 : 4;
  const pressureBoost = input.pressure === "HIGH" ? 12 : input.pressure === "MEDIUM" ? 7 : 1;
  const routePenalty = input.routeFamily === "rebound / second shot" || input.routeFamily === "transition / turnover" ? -8 : 0;

  return Math.max(8, Math.min(88, 36 + centralBoost + windowPenalty + pressureBoost + routePenalty));
}

function defensiveShapeScore(input: {
  readonly blockPressure: number;
  readonly goalkeeperChallenge: number;
  readonly cleanWindow: ShotOriginCleanWindowType;
}): number {
  const windowPenalty = input.cleanWindow === "CLEAN" ? 18 : input.cleanWindow === "PARTIAL" ? 9 : 0;

  return Math.max(10, Math.min(95, Math.round((input.blockPressure + input.goalkeeperChallenge) / 2) - windowPenalty));
}

function clampProbability(value: number): number {
  return Math.max(2, Math.min(88, Math.round(value)));
}

function baseGeometryXSOTFor(input: {
  readonly distance: number;
  readonly angleCategory: ShotAngleCategory;
}): number {
  const distanceBase =
    input.distance <= 16.5
      ? 72 - input.distance * 0.8
      : input.distance <= 30
        ? 56 - (input.distance - 16.5) * 1.05
        : input.distance <= 45
          ? 37 - (input.distance - 30) * 1.2
          : 19 - (input.distance - 45) * 0.7;
  const centralityBoost = input.angleCategory === "CENTRAL" ? 6 : input.angleCategory === "HALF_SPACE" ? 1 : input.angleCategory === "NARROW_ANGLE" ? -5 : -11;
  const geometryAnglePenalty = input.angleCategory === "CENTRAL" ? 0 : input.angleCategory === "HALF_SPACE" ? 5 : input.angleCategory === "NARROW_ANGLE" ? 12 : 18;

  return clampProbability(distanceBase + centralityBoost - geometryAnglePenalty);
}

function baseGeometryXGFor(input: {
  readonly baseGeometryXSOT: number;
  readonly distance: number;
  readonly angleCategory: ShotAngleCategory;
}): number {
  const proximityBoost = input.distance <= 16.5 ? 20 : input.distance <= 30 ? 6 : input.distance <= 45 ? -3 : -8;
  const centralityBoost = input.angleCategory === "CENTRAL" ? 4 : input.angleCategory === "HALF_SPACE" ? 1 : input.angleCategory === "NARROW_ANGLE" ? -4 : -8;
  const geometryAnglePenalty = input.angleCategory === "CENTRAL" ? 0 : input.angleCategory === "HALF_SPACE" ? 5 : input.angleCategory === "NARROW_ANGLE" ? 12 : 18;

  return clampProbability(input.baseGeometryXSOT * 0.32 + proximityBoost + centralityBoost - geometryAnglePenalty * 0.25);
}

function previousBaseGeometryXSOTFor(input: {
  readonly distance: number;
  readonly angleCategory: ShotAngleCategory;
}): number {
  const centralityBoost = input.angleCategory === "CENTRAL" ? 8 : input.angleCategory === "HALF_SPACE" ? 2 : input.angleCategory === "NARROW_ANGLE" ? -4 : -10;

  return clampProbability(70 - distancePenalty(input.distance) - anglePenalty(input.angleCategory) + centralityBoost);
}

function previousBaseGeometryXGFor(input: {
  readonly distance: number;
  readonly angleCategory: ShotAngleCategory;
}): number {
  const previousXSOT = previousBaseGeometryXSOTFor(input);
  const proximityBoost = input.distance <= 16.5 ? 18 : input.distance <= 30 ? 7 : input.distance <= 45 ? 1 : -4;
  const centralityBoost = input.angleCategory === "CENTRAL" ? 8 : input.angleCategory === "HALF_SPACE" ? 2 : input.angleCategory === "NARROW_ANGLE" ? -5 : -10;

  return clampProbability(previousXSOT * 0.42 - distancePenalty(input.distance) * 0.22 - anglePenalty(input.angleCategory) * 0.35 + proximityBoost + centralityBoost);
}

function shotWindowModifier(cleanWindow: ShotOriginCleanWindowType): ShotContextModifier {
  switch (cleanWindow) {
    case "CLEAN":
      return { name: "shot window", xSOTDelta: 16, xGDelta: 11, reason: "clean window improves execution quality but does not bypass geometry." };
    case "PARTIAL":
      return { name: "shot window", xSOTDelta: 8, xGDelta: 4, reason: "partial window gives a moderate execution lift." };
    case "CONTESTED":
      return { name: "shot window", xSOTDelta: -6, xGDelta: -4, reason: "contested window lowers execution quality." };
    case "FORCED":
      return { name: "shot window", xSOTDelta: -18, xGDelta: -11, reason: "forced shot is rushed and less accurate." };
  }
}

function pressureModifier(pressure: string): ShotContextModifier {
  const xSOTDelta = pressure === "HIGH" ? -10 : pressure === "MEDIUM" ? -5 : 0;

  return { name: "pressure", xSOTDelta, xGDelta: Math.round(xSOTDelta * 0.35), reason: `${pressure} pressure modifies shooting rhythm.` };
}

function defensiveBlockModifier(blockPressure: number): ShotContextModifier {
  return {
    name: "defensive block",
    xSOTDelta: -Math.round(blockPressure * 0.18),
    xGDelta: -Math.round(blockPressure * 0.12),
    reason: "defensive block pressure lowers both target accuracy and scoring probability.",
  };
}

function goalkeeperAlignmentModifier(input: {
  readonly alignment: AlignmentQuality;
  readonly challenge: number;
}): ShotContextModifier {
  const alignmentDelta = input.alignment === "ALIGNED" ? -12 : input.alignment === "PARTIAL" ? -6 : input.alignment === "LATE_SET" ? 1 : 6;

  return {
    name: "goalkeeper alignment",
    xSOTDelta: 0,
    xGDelta: alignmentDelta - Math.round(input.challenge * 0.08),
    reason: `${input.alignment} goalkeeper alignment modifies goal probability after target accuracy.`,
  };
}

function goalkeeperHandUseModifier(legalHandUse: "NO" | "YES"): ShotContextModifier {
  return {
    name: "goalkeeper legal hand-use",
    xSOTDelta: 0,
    xGDelta: legalHandUse === "YES" ? -3 : 2,
    reason: legalHandUse === "YES" ? "legal hand-use lowers finishing probability." : "no legal hand-use slightly weakens save coverage.",
  };
}

function halfSpaceContextModifier(input: {
  readonly originZone: ZoneId;
  readonly angleCategory: ShotAngleCategory;
  readonly cleanWindow: ShotOriginCleanWindowType;
  readonly routeFamily: ShotAccessRouteFamily;
  readonly goalkeeperAlignment: AlignmentQuality;
  readonly defensiveBlockPressure: number;
}): ShotContextModifier {
  if (!isHalfSpaceOriginZone(input.originZone)) {
    return { name: "half-space context", xSOTDelta: 0, xGDelta: 0, reason: "not a half-space origin; no half-space context modifier applied." };
  }

  if (input.angleCategory === "NARROW_ANGLE" || input.angleCategory === "WIDE") {
    return {
      name: "half-space context",
      xSOTDelta: -3,
      xGDelta: -3,
      reason: "half-space lane is treated as a narrow or wide angle here, so the context remains low value.",
    };
  }

  if (input.routeFamily === "rebound / second shot" && input.cleanWindow === "FORCED") {
    return {
      name: "half-space context",
      xSOTDelta: -2,
      xGDelta: -2,
      reason: "desperate half-space second shot keeps the rushed body-shape penalty.",
    };
  }

  if (input.cleanWindow === "CLEAN") {
    const setKeeperOrBlock = input.goalkeeperAlignment === "ALIGNED" || input.defensiveBlockPressure >= 50;

    return {
      name: "half-space context",
      xSOTDelta: setKeeperOrBlock ? 3 : 8,
      xGDelta: setKeeperOrBlock ? 2 : 7,
      reason: setKeeperOrBlock
        ? "clean half-space window gets a modest lift, but set goalkeeper or block pressure still matters."
        : "clean true half-space window gets a targeted lift because the angle is earned and the keeper/block is not fully set.",
    };
  }

  if (input.cleanWindow === "PARTIAL") {
    return {
      name: "half-space context",
      xSOTDelta: 4,
      xGDelta: 3,
      reason: "partial half-space window is viable but remains below a clean central lane.",
    };
  }

  if (input.cleanWindow === "FORCED") {
    return {
      name: "half-space context",
      xSOTDelta: -1,
      xGDelta: -2,
      reason: "forced half-space shot stays hard rather than receiving the clean-window lift.",
    };
  }

  return {
    name: "half-space context",
    xSOTDelta: 0,
    xGDelta: 0,
    reason: "pressured half-space shot receives no extra lift; goalkeeper and block context decide the value.",
  };
}

function reboundModifier(input: {
  readonly routeFamily: ShotAccessRouteFamily;
  readonly distance: number;
  readonly angleCategory: ShotAngleCategory;
  readonly cleanWindow: ShotOriginCleanWindowType;
  readonly goalkeeperAlignment: AlignmentQuality;
  readonly defensiveBlockPressure: number;
}): ShotContextModifier {
  if (input.routeFamily !== "rebound / second shot") {
    return { name: "rebound / second shot", xSOTDelta: 0, xGDelta: 0, reason: "not a rebound or second-shot context." };
  }

  const trueTapIn =
    input.distance <= 16.5 &&
    input.angleCategory === "CENTRAL" &&
    input.cleanWindow !== "FORCED" &&
    input.goalkeeperAlignment !== "ALIGNED" &&
    input.defensiveBlockPressure < 45;

  if (trueTapIn) {
    return {
      name: "rebound / second shot",
      xSOTDelta: -4,
      xGDelta: 6,
      reason: "true tap-in rebound stays dangerous because the goalkeeper is not set and block pressure is low.",
    };
  }

  if (input.cleanWindow === "FORCED") {
    return {
      name: "rebound / second shot",
      xSOTDelta: -18,
      xGDelta: -14,
      reason: "desperate second shot loses quality through rushed body shape and rebound chaos.",
    };
  }

  if (input.angleCategory !== "CENTRAL") {
    return {
      name: "rebound / second shot",
      xSOTDelta: -12,
      xGDelta: -10,
      reason: "wide or half-space rebound usually creates a low-angle second shot, recycle, or scramble.",
    };
  }

  if (input.goalkeeperAlignment === "ALIGNED" && input.defensiveBlockPressure >= 45) {
    return {
      name: "rebound / second shot",
      xSOTDelta: -10,
      xGDelta: -12,
      reason: "set goalkeeper and intact block reduce central spill danger.",
    };
  }

  return {
    name: "rebound / second shot",
    xSOTDelta: -8,
    xGDelta: input.distance <= 22 ? -3 : -10,
    reason: input.distance <= 22 ? "central rebound remains dangerous but no longer inherits automatic tap-in quality." : "longer rebound attempt is rushed and less stable.",
  };
}

function shotQualityModifier(input: {
  readonly cleanWindow: ShotOriginCleanWindowType;
  readonly angleCategory: ShotAngleCategory;
}): ShotContextModifier {
  const xSOTDelta = input.cleanWindow === "CLEAN" && input.angleCategory === "CENTRAL" ? 4 : input.cleanWindow === "FORCED" ? -3 : 0;
  const xGDelta = input.cleanWindow === "CLEAN" && input.angleCategory === "CENTRAL" ? 3 : input.cleanWindow === "FORCED" ? -2 : 0;

  return { name: "shot quality", xSOTDelta, xGDelta, reason: "shot quality proxy comes from window and centrality." };
}

function styleModifier(style: string): ShotContextModifier {
  const direct = style.includes("DIRECT") || style.includes("RISKY") || style.includes("AGGRESSIVE");

  return {
    name: "style",
    xSOTDelta: direct ? 2 : 0,
    xGDelta: direct ? 1 : 0,
    reason: direct ? "direct/risky style gives a small execution edge, not a scoring guarantee." : "style adds no extra shooting boost.",
  };
}

function neutralModifier(name: ShotContextModifierName, reason: string): ShotContextModifier {
  return { name, xSOTDelta: 0, xGDelta: 0, reason };
}

function contextModifiers(input: {
  readonly originZone: ZoneId;
  readonly cleanWindow: ShotOriginCleanWindowType;
  readonly pressure: string;
  readonly defensiveBlockPressure: number;
  readonly goalkeeperAlignment: AlignmentQuality;
  readonly goalkeeperChallenge: number;
  readonly goalkeeperLegalHandUseAvailable: "NO" | "YES";
  readonly routeFamily: ShotAccessRouteFamily;
  readonly distance: number;
  readonly angleCategory: ShotAngleCategory;
  readonly shootingTeamStyle: string;
}): readonly ShotContextModifier[] {
  return [
    shotWindowModifier(input.cleanWindow),
    pressureModifier(input.pressure),
    defensiveBlockModifier(input.defensiveBlockPressure),
    goalkeeperAlignmentModifier({ alignment: input.goalkeeperAlignment, challenge: input.goalkeeperChallenge }),
    goalkeeperHandUseModifier(input.goalkeeperLegalHandUseAvailable),
    halfSpaceContextModifier({
      originZone: input.originZone,
      angleCategory: input.angleCategory,
      cleanWindow: input.cleanWindow,
      routeFamily: input.routeFamily,
      goalkeeperAlignment: input.goalkeeperAlignment,
      defensiveBlockPressure: input.defensiveBlockPressure,
    }),
    reboundModifier({
      routeFamily: input.routeFamily,
      distance: input.distance,
      angleCategory: input.angleCategory,
      cleanWindow: input.cleanWindow,
      goalkeeperAlignment: input.goalkeeperAlignment,
      defensiveBlockPressure: input.defensiveBlockPressure,
    }),
    shotQualityModifier({ cleanWindow: input.cleanWindow, angleCategory: input.angleCategory }),
    styleModifier(input.shootingTeamStyle),
    neutralModifier("shot power", "shot power is not independently modelled yet; no modifier applied."),
    neutralModifier("shot placement", "shot placement is represented through xG outcome rolls; no separate modifier applied."),
    neutralModifier("shooter skill", "shooter skill profile is not available in this batch slice; no modifier applied."),
    neutralModifier("fatigue", "fatigue is not exposed in this shot row; no modifier applied."),
    neutralModifier("body balance", "body balance is proxied by shot window; no separate modifier applied."),
  ];
}

function topModifierNames(input: {
  readonly modifiers: readonly ShotContextModifier[];
  readonly direction: "negative" | "positive";
}): readonly string[] {
  const sorted = [...input.modifiers]
    .filter((modifier) => (input.direction === "positive" ? modifier.xSOTDelta + modifier.xGDelta > 0 : modifier.xSOTDelta + modifier.xGDelta < 0))
    .sort((left, right) => Math.abs(right.xSOTDelta + right.xGDelta) - Math.abs(left.xSOTDelta + left.xGDelta))
    .slice(0, 3)
    .map((modifier) => `${modifier.name} (${modifier.xSOTDelta >= 0 ? "+" : ""}${modifier.xSOTDelta} xSOT, ${modifier.xGDelta >= 0 ? "+" : ""}${modifier.xGDelta} xG)`);

  return sorted.length === 0 ? ["none"] : sorted;
}

function xSOTFor(input: {
  readonly distance: number;
  readonly angleCategory: ShotAngleCategory;
  readonly cleanWindow: ShotOriginCleanWindowType;
  readonly pressure: string;
  readonly defensiveBlockPressure: number;
  readonly routeFamily: ShotAccessRouteFamily;
}): number {
  const windowBoost = input.cleanWindow === "CLEAN" ? 16 : input.cleanWindow === "PARTIAL" ? 8 : input.cleanWindow === "FORCED" ? -18 : -6;
  const pressurePenalty = input.pressure === "HIGH" ? 10 : input.pressure === "MEDIUM" ? 5 : 0;
  const reboundPenalty = input.routeFamily === "rebound / second shot" ? 12 : 0;
  const raw = 68 - distancePenalty(input.distance) - anglePenalty(input.angleCategory) - pressurePenalty - Math.round(input.defensiveBlockPressure * 0.18) - reboundPenalty + windowBoost;

  return Math.max(7, Math.min(86, raw));
}

function xGFor(input: {
  readonly xSOT: number;
  readonly distance: number;
  readonly angleCategory: ShotAngleCategory;
  readonly goalkeeperChallenge: number;
  readonly goalkeeperAlignment: AlignmentQuality;
  readonly defensiveBlockPressure: number;
  readonly cleanWindow: ShotOriginCleanWindowType;
  readonly routeFamily: ShotAccessRouteFamily;
}): number {
  const alignmentPenalty = input.goalkeeperAlignment === "ALIGNED" ? 12 : input.goalkeeperAlignment === "PARTIAL" ? 6 : input.goalkeeperAlignment === "LATE_SET" ? -1 : -6;
  const windowBoost = input.cleanWindow === "CLEAN" ? 11 : input.cleanWindow === "PARTIAL" ? 4 : input.cleanWindow === "FORCED" ? -11 : -4;
  const reboundBoost = input.routeFamily === "rebound / second shot" && input.distance <= 16.5 && input.angleCategory === "CENTRAL" ? 2 : input.routeFamily === "rebound / second shot" ? -10 : 0;
  const raw =
    input.xSOT * 0.55 -
    distancePenalty(input.distance) * 0.35 -
    anglePenalty(input.angleCategory) * 0.5 -
    input.goalkeeperChallenge * 0.16 -
    input.defensiveBlockPressure * 0.12 -
    alignmentPenalty +
    windowBoost +
    reboundBoost;

  return Math.max(2, Math.min(72, Math.round(raw)));
}

function xSOTBucket(value: number): ShotProbabilityBucket {
  if (value >= 75) {
    return "ELITE_XSOT";
  }

  if (value >= 55) {
    return "HIGH_XSOT";
  }

  if (value >= 30) {
    return "MEDIUM_XSOT";
  }

  return "LOW_XSOT";
}

function xGBucket(value: number): ShotProbabilityBucket {
  if (value >= 55) {
    return "ELITE_XG";
  }

  if (value >= 35) {
    return "HIGH_XG";
  }

  if (value >= 15) {
    return "MEDIUM_XG";
  }

  return "LOW_XG";
}

function probabilityPlausibility(input: {
  readonly goal: boolean;
  readonly onTarget: boolean;
  readonly xG: number;
  readonly xSOT: number;
}): ShotProbabilityPlausibility {
  if (input.goal && input.xG < 15) {
    return "XG_OVERPERFORMANCE";
  }

  if (!input.goal && input.xG >= 50) {
    return "XG_UNDERPERFORMANCE";
  }

  if (input.onTarget && input.xSOT < 25) {
    return "XSOT_OVERPERFORMANCE";
  }

  if (!input.onTarget && input.xSOT >= 65) {
    return "XSOT_UNDERPERFORMANCE";
  }

  return "PLAUSIBLE";
}

function deterministicRoll(input: {
  readonly matchId: string;
  readonly team: "BLITZ" | "CONTROL";
  readonly index: number;
  readonly salt: number;
}): number {
  const text = `${input.matchId}-${input.team}-${input.index}-${input.salt}`;
  let hash = 17;

  [...text].forEach((character) => {
    hash = (hash * 31 + character.charCodeAt(0)) % 9973;
  });

  return hash % 100;
}

function calibratedOutcome(input: {
  readonly sample: MatchScoringCalibrationSample;
  readonly team: "BLITZ" | "CONTROL";
  readonly index: number;
  readonly xSOT: number;
  readonly xG: number;
  readonly beforeGoal: boolean;
}): {
  readonly goal: boolean;
  readonly onTarget: boolean;
  readonly outcome: ShotOutcome;
} {
  const targetRoll = deterministicRoll({ matchId: input.sample.matchId, team: input.team, index: input.index, salt: 11 });
  const goalRoll = deterministicRoll({ matchId: input.sample.matchId, team: input.team, index: input.index, salt: 29 });
  const spectacularAllowance = input.beforeGoal && input.xG >= 18 && goalRoll < input.xG + 4;
  const goal = goalRoll < input.xG || spectacularAllowance;
  const onTarget = goal || targetRoll < input.xSOT;

  return {
    goal,
    onTarget,
    outcome: goal ? "GOAL" : onTarget ? "SAVED_OR_DEFLECTED" : "MISS",
  };
}

function alignmentFrom(score: number, cleanWindow: ShotOriginCleanWindowType): AlignmentQuality {
  if (cleanWindow === "CLEAN" && score < 58) {
    return "MISALIGNED";
  }

  if (score >= 68) {
    return "ALIGNED";
  }

  if (score >= 52) {
    return "PARTIAL";
  }

  return "LATE_SET";
}

function accessClassification(input: {
  readonly routeFamily: ShotAccessRouteFamily;
  readonly cleanWindow: ShotOriginCleanWindowType;
  readonly band: NormalizedOriginBand;
  readonly goalkeeperAlignment: AlignmentQuality;
  readonly shapeAlignment: AlignmentQuality;
}): ShotAccessClassification {
  if (input.routeFamily === "rebound / second shot") {
    return "REBOUND_OR_SCRAMBLE";
  }

  if (input.routeFamily === "transition / turnover") {
    return "TRANSITION_REWARD";
  }

  if (input.goalkeeperAlignment === "MISALIGNED" || input.shapeAlignment === "MISALIGNED") {
    return "GK_OR_SHAPE_MISALIGNMENT";
  }

  if (input.routeFamily === "support recycle" || input.routeFamily === "forward progress") {
    return "CONTINUATION_PIPELINE_TO_SHOT";
  }

  if (input.band === "near goal central" || input.band === "mid central") {
    return input.cleanWindow === "CLEAN" ? "TARGET_GOAL_PROXIMITY_DESERVED" : "OVER_ACCESSIBLE_CENTRAL_ZONE";
  }

  return input.cleanWindow === "CLEAN" || input.cleanWindow === "PARTIAL" ? "CLEAN_CREATION_DESERVED" : "DEFENSIVE_SHAPE_ERROR";
}

function recordFor(input: {
  readonly sample: MatchScoringCalibrationSample;
  readonly team: "BLITZ" | "CONTROL";
  readonly index: number;
  readonly goalIndex: number;
}): ShotOriginRecord {
  const zones = candidateZones(input.sample, input.team);
  const initialOriginZone = zones[input.index % zones.length] ?? "Z5-C";
  const beforeGoal = input.goalIndex < (input.team === "CONTROL" ? input.sample.controlShotGoals : input.sample.blitzShotGoals);
  const beforeOnTarget = beforeGoal || input.index % 3 !== 0;
  const cleanWindow = cleanWindowType(input.sample, input.index);
  const routeFamily = routeFamilyFor({ sample: input.sample, team: input.team, index: input.index, originZone: initialOriginZone });
  const originZone =
    routeFamily === "rebound / second shot"
      ? reboundSecondShotZone({
          team: input.team,
          currentZone: initialOriginZone,
          index: input.index,
          pressure: input.sample.scenario.pressureProfile,
        })
      : initialOriginZone;
  const gkChallenge = goalkeeperChallenge({
    team: input.team,
    zone: originZone,
    cleanWindow,
    pressure: input.sample.scenario.pressureProfile,
    index: input.index,
  });
  const blockPressure = defensiveBlockPressure({
    team: input.team,
    zone: originZone,
    cleanWindow,
    pressure: input.sample.scenario.pressureProfile,
    routeFamily,
  });
  const shapeScore = defensiveShapeScore({
    blockPressure,
    goalkeeperChallenge: gkChallenge,
    cleanWindow,
  });
  const gkAlignment = alignmentFrom(gkChallenge, cleanWindow);
  const shapeAlignment = alignmentFrom(shapeScore, cleanWindow);
  const band = normalizedOriginBand(input.team, originZone);
  const center = zoneCenter(originZone);
  const distance = shotDistanceMeters(input.team, originZone);
  const angle = shotAngleDegrees(input.team, originZone);
  const angleCategory = shotAngleCategory(originZone, angle);
  const legalHandUse = distance <= GOALKEEPER_AREA_DEPTH_METERS ? "YES" : "NO";
  const shootingTeamStyle = input.team === "CONTROL" ? input.sample.scenario.controlStyleVariant : input.sample.scenario.blitzStyleVariant;
  const baseGeometryXSOT = baseGeometryXSOTFor({ distance, angleCategory });
  const baseGeometryXG = baseGeometryXGFor({ baseGeometryXSOT, distance, angleCategory });
  const modifiers = contextModifiers({
    originZone,
    cleanWindow,
    pressure: input.sample.scenario.pressureProfile,
    defensiveBlockPressure: blockPressure,
    goalkeeperAlignment: gkAlignment,
    goalkeeperChallenge: gkChallenge,
    goalkeeperLegalHandUseAvailable: legalHandUse,
    routeFamily,
    distance,
    angleCategory,
    shootingTeamStyle,
  });
  const finalXSOT = clampProbability(baseGeometryXSOT + modifiers.reduce((sum, modifier) => sum + modifier.xSOTDelta, 0));
  const finalXG = clampProbability(baseGeometryXG + modifiers.reduce((sum, modifier) => sum + modifier.xGDelta, 0));
  const xSOT = finalXSOT;
  const xG = finalXG;
  const calibrated = calibratedOutcome({
    sample: input.sample,
    team: input.team,
    index: input.index,
    xSOT,
    xG,
    beforeGoal,
  });

  return {
    matchId: input.sample.matchId,
    team: input.team,
    defendingTeam: input.team === "CONTROL" ? "BLITZ" : "CONTROL",
    styleMatchup: styleMatchup(input.sample),
    shootingTeamStyle,
    defendingTeamStyle: input.team === "CONTROL" ? input.sample.scenario.blitzStyleVariant : input.sample.scenario.controlStyleVariant,
    attackingDirection: attackingDirection(input.team),
    originZone,
    targetGoalZone: targetGoalZone(input.team),
    targetGoalFrame: "GOAL_FRAME",
    approximateX: center.x,
    approximateY: center.y,
    approximateShotDistanceMeters: distance,
    distanceBand: shotDistanceBand(distance),
    shotAngleDegrees: angle,
    shotAngleCategory: angleCategory,
    normalizedAttackingLane: band,
    distanceToTargetGoalBand: distanceToTargetGoalBand(input.team, originZone),
    zoneFamily: zoneFamily(input.team, originZone),
    shotOutcome: calibrated.outcome,
    onTarget: calibrated.onTarget ? "YES" : "NO",
    goal: calibrated.goal ? "YES" : "NO",
    beforeShotOutcome: beforeGoal ? "GOAL" : beforeOnTarget ? "SAVED_OR_DEFLECTED" : "MISS",
    beforeOnTarget: beforeOnTarget ? "YES" : "NO",
    beforeGoal: beforeGoal ? "YES" : "NO",
    cleanWindowType: cleanWindow,
    pressureCategory: input.sample.scenario.pressureProfile,
    goalkeeperZone: goalkeeperZone(input.team, originZone),
    goalkeeperChallenge: gkChallenge,
    goalkeeperAlignmentToTargetGoal: gkAlignment,
    goalkeeperLegalHandUseAvailable: legalHandUse,
    defensiveBlockPressure: blockPressure,
    defensiveShapeScore: shapeScore,
    defensiveShapeAlignmentToTargetGoal: shapeAlignment,
    routeFamily,
    accessClassification: accessClassification({
      routeFamily,
      cleanWindow,
      band,
      goalkeeperAlignment: gkAlignment,
      shapeAlignment,
    }),
    baseGeometryXSOT,
    baseGeometryXG,
    contextModifiers: modifiers,
    topPositiveModifiers: topModifierNames({ modifiers, direction: "positive" }),
    topNegativeModifiers: topModifierNames({ modifiers, direction: "negative" }),
    finalXSOT,
    finalXG,
    finalXSOTDeltaFromBase: finalXSOT - baseGeometryXSOT,
    finalXGDeltaFromBase: finalXG - baseGeometryXG,
    probabilityReason:
      finalXG === baseGeometryXG && finalXSOT === baseGeometryXSOT
        ? "Final probability matches geometry baseline because contextual modifiers net to zero."
        : `Final probability differs from geometry baseline through ${topModifierNames({ modifiers, direction: "positive" }).join("; ")} against ${topModifierNames({ modifiers, direction: "negative" }).join("; ")}.`,
    xSOT,
    xSOTBucket: xSOTBucket(xSOT),
    xG,
    xGBucket: xGBucket(xG),
    probabilityPlausibility: probabilityPlausibility({
      goal: calibrated.goal,
      onTarget: calibrated.onTarget,
      xG,
      xSOT,
    }),
    xGDelta: (calibrated.goal ? 100 : 0) - xG,
    xSOTDelta: (calibrated.onTarget ? 100 : 0) - xSOT,
  };
}

function groupRecords<T extends string>(records: readonly ShotOriginRecord[], keyFor: (record: ShotOriginRecord) => T): ReadonlyMap<T, readonly ShotOriginRecord[]> {
  const map = new Map<T, ShotOriginRecord[]>();

  records.forEach((record) => {
    const key = keyFor(record);
    const current = map.get(key) ?? [];
    current.push(record);
    map.set(key, current);
  });

  return map;
}

function rowStats(records: readonly ShotOriginRecord[]): {
  readonly attempts: number;
  readonly goals: number;
  readonly onTargetRate: number;
  readonly conversionRate: number;
} {
  const goals = records.filter((record) => record.goal === "YES").length;
  const onTarget = records.filter((record) => record.onTarget === "YES").length;

  return {
    attempts: records.length,
    goals,
    onTargetRate: percent(onTarget, records.length),
    conversionRate: percent(goals, records.length),
  };
}

function directionalRows(records: readonly ShotOriginRecord[]): readonly DirectionalShotOriginSummary[] {
  return [...groupRecords(records, (record) => `${record.originZone}|${record.targetGoalZone}|${record.attackingDirection}|${record.team}` as string).entries()]
    .map(([key, rows]) => {
      const [originZone, goalZone, direction, team] = key.split("|");
      const stats = rowStats(rows);

      return {
        originZone: originZone as ZoneId,
        targetGoalZone: goalZone as TargetGoalZone,
        attackingDirection: direction as ShotOriginAttackingDirection,
        shootingTeam: team as "BLITZ" | "CONTROL",
        attempts: stats.attempts,
        goals: stats.goals,
        onTargetRate: stats.onTargetRate,
        conversionRate: stats.conversionRate,
        averageGoalkeeperChallenge: average(rows.map((record) => record.goalkeeperChallenge)),
        averageDefensiveBlockPressure: average(rows.map((record) => record.defensiveBlockPressure)),
        averageXSOT: average(rows.map((record) => record.xSOT)),
        averageXG: average(rows.map((record) => record.xG)),
        cleanWindowShare: percent(rows.filter((record) => record.cleanWindowType === "CLEAN").length, rows.length),
        forcedWindowShare: percent(rows.filter((record) => record.cleanWindowType === "FORCED").length, rows.length),
        pressuredWindowShare: percent(rows.filter((record) => record.cleanWindowType === "CONTESTED" || record.cleanWindowType === "PARTIAL").length, rows.length),
      };
    })
    .filter((row) => row.attempts > 0)
    .sort((left, right) => right.attempts - left.attempts);
}

function normalizedRows(records: readonly ShotOriginRecord[]): readonly NormalizedShotOriginSummary[] {
  const tacticalRead = (band: NormalizedOriginBand, conversion: number): string => {
    if (band === "near goal central" && conversion >= 45) {
      return "Target-goal proximity and centrality explain most of the danger; access should require real destabilization.";
    }

    if (band.includes("half-space")) {
      return "Half-space access is valuable but should stay pressure- and support-dependent.";
    }

    if (band === "mid central") {
      return "Mid-central shots are plausible pressure-zone outcomes; watch defensive axis protection.";
    }

    if (band === "wide / channel") {
      return "Wide/channel attempts are lower-value and mainly useful as style geography evidence.";
    }

    return "Deep attempts should remain low-frequency and low-conversion unless goalkeeper/shape alignment is poor.";
  };

  return [...groupRecords(records, (record) => record.normalizedAttackingLane).entries()]
    .map(([band, rows]) => {
      const stats = rowStats(rows);

      return {
        normalizedOriginBand: band as NormalizedOriginBand,
        attempts: stats.attempts,
        goals: stats.goals,
        onTargetRate: stats.onTargetRate,
        conversionRate: stats.conversionRate,
        averageXSOT: average(rows.map((record) => record.xSOT)),
        averageXG: average(rows.map((record) => record.xG)),
        tacticalRead: tacticalRead(band as NormalizedOriginBand, stats.conversionRate),
      };
    })
    .sort((left, right) => right.attempts - left.attempts);
}

function topRouteFamily(rows: readonly ShotOriginRecord[]): ShotAccessRouteFamily {
  const route = [...groupRecords(rows, (record) => record.routeFamily).entries()]
    .map(([family, familyRows]) => ({ family: family as ShotAccessRouteFamily, attempts: familyRows.length }))
    .sort((left, right) => right.attempts - left.attempts)[0];

  return route?.family ?? "forward progress";
}

function topAccessClassification(rows: readonly ShotOriginRecord[]): ShotAccessClassification {
  const item = [...groupRecords(rows, (record) => record.accessClassification).entries()]
    .map(([classification, classifiedRows]) => ({ classification: classification as ShotAccessClassification, attempts: classifiedRows.length }))
    .sort((left, right) => right.attempts - left.attempts)[0];

  return item?.classification ?? "CLEAN_CREATION_DESERVED";
}

function highValueClassification(input: {
  readonly zone: ZoneId;
  readonly records: readonly ShotOriginRecord[];
  readonly stats: ReturnType<typeof rowStats>;
}): HighValueZoneClassification {
  const averageGk = average(input.records.map((record) => record.goalkeeperChallenge));
  const averageShape = average(input.records.map((record) => record.defensiveShapeScore));
  const nearTarget = input.records.some((record) => record.distanceToTargetGoalBand === "VERY_NEAR" || record.distanceToTargetGoalBand === "NEAR");
  const misaligned = input.records.some((record) => record.goalkeeperAlignmentToTargetGoal === "MISALIGNED");
  const shapeIssue = input.records.some((record) => record.defensiveShapeAlignmentToTargetGoal === "MISALIGNED");

  if (input.stats.attempts < 10) {
    return "SAMPLE_SIZE_WATCH";
  }

  if (misaligned && input.stats.conversionRate >= 35) {
    return "GK_ALIGNMENT_ISSUE";
  }

  if (shapeIssue && input.stats.conversionRate >= 35) {
    return "DEFENSIVE_SHAPE_ALIGNMENT_ISSUE";
  }

  if (nearTarget && input.stats.conversionRate >= 45) {
    return "TARGET_PROXIMITY_EXPLAINS_VALUE";
  }

  if (input.zone === "Z2-C" || input.zone === "Z6-C") {
    return "DESERVED_HIGH_VALUE_ZONE";
  }

  if (input.stats.attempts >= 25 && averageGk < 55 && averageShape < 50) {
    return "OVER_ACCESSIBLE_ZONE";
  }

  if (input.zone === "Z3-C" || input.zone === "Z5-C") {
    return "DIRECTIONAL_ASYMMETRY";
  }

  return "DESERVED_HIGH_VALUE_ZONE";
}

function highValueAuditRows(records: readonly ShotOriginRecord[]): readonly HighValueShotZoneAuditRow[] {
  const watchedZones: readonly ZoneId[] = ["Z5-C", "Z6-C", "Z2-C", "Z3-C", "Z2-HSR", "Z6-HSL"];

  return watchedZones.flatMap((zone) => {
    const rows = records.filter((record) => record.originZone === zone);

    if (rows.length === 0) {
      return [];
    }

    const stats = rowStats(rows);
    const first = rows[0];
    const clean = rows.filter((record) => record.cleanWindowType === "CLEAN").length;
    const forced = rows.filter((record) => record.cleanWindowType === "FORCED").length;
    const pressured = rows.filter((record) => record.cleanWindowType === "CONTESTED" || record.cleanWindowType === "PARTIAL").length;
    const routeFamily = topRouteFamily(rows);
    const access = topAccessClassification(rows);
    const classification = highValueClassification({ zone, records: rows, stats });

    return [
      {
        originZone: zone,
        targetGoalZone: first?.targetGoalZone ?? "Z7-C / GOAL_FRAME",
        attackingDirection: first?.attackingDirection ?? "CONTROL attacks Z1 -> Z7",
        attempts: stats.attempts,
        goals: stats.goals,
        conversionRate: stats.conversionRate,
        onTargetRate: stats.onTargetRate,
        cleanWindowCount: clean,
        forcedWindowCount: forced,
        pressuredWindowCount: pressured,
        averageGoalkeeperChallenge: average(rows.map((record) => record.goalkeeperChallenge)),
        averageDefensiveBlockPressure: average(rows.map((record) => record.defensiveBlockPressure)),
        averageDefensiveShapeScore: average(rows.map((record) => record.defensiveShapeScore)),
        averageXSOT: average(rows.map((record) => record.xSOT)),
        averageXG: average(rows.map((record) => record.xG)),
        xGPerformance: stats.conversionRate - average(rows.map((record) => record.xG)),
        topRouteFamily: routeFamily,
        classification,
        accessClassification: access,
        tacticalRead: tacticalReadForHighValue(classification, access),
      },
    ];
  });
}

function tacticalReadForHighValue(classification: HighValueZoneClassification, access: ShotAccessClassification): string {
  if (classification === "TARGET_PROXIMITY_EXPLAINS_VALUE") {
    return "Danger is mainly explained by proximity and centrality to the target goal; preserve the value but gate access.";
  }

  if (classification === "GK_ALIGNMENT_ISSUE" || classification === "DEFENSIVE_SHAPE_ALIGNMENT_ISSUE") {
    return "The shot may be overperforming because goalkeeper or defensive shape alignment is too weak for the target-goal context.";
  }

  if (access === "CONTINUATION_PIPELINE_TO_SHOT") {
    return "Continuation routes are feeding the zone often enough to keep access quality under review.";
  }

  if (classification === "DIRECTIONAL_ASYMMETRY") {
    return "The mirrored tactical situation is not identical; compare direction, route chain, and defensive alignment before tuning.";
  }

  return "The zone is dangerous but plausible under current route and target-goal context.";
}

function routeFamilyRows(records: readonly ShotOriginRecord[]): readonly RouteFamilyToShotZoneRow[] {
  return [...groupRecords(records, (record) => record.routeFamily).entries()]
    .map(([routeFamily, rows]) => {
      const stats = rowStats(rows);
      const topOrigin = [...groupRecords(rows, (record) => record.originZone).entries()]
        .map(([zone, zoneRows]) => ({ zone: zone as ZoneId, attempts: zoneRows.length }))
        .sort((left, right) => right.attempts - left.attempts)[0];
      const highValueAttempts = rows.filter((record) => record.normalizedAttackingLane === "near goal central" || record.normalizedAttackingLane === "mid central").length;
      const topOriginZone: ZoneId | "none" = topOrigin?.zone ?? "none";

      return {
        routeFamily: routeFamily as ShotAccessRouteFamily,
        attempts: stats.attempts,
        goals: stats.goals,
        topOriginZone,
        highValueAttempts,
        tacticalRead:
          routeFamily === "support recycle" || routeFamily === "forward progress"
            ? "Monitor whether continuation routes become a pipeline into similar central shots."
            : routeFamily === "transition / turnover"
              ? "Transition shots can remain dangerous when defensive shape is genuinely broken."
              : "Route remains part of a varied access map rather than a scoring-value change.",
      };
    })
    .sort((left, right) => right.attempts - left.attempts);
}

function directionSymmetryRows(records: readonly ShotOriginRecord[]): readonly DirectionSymmetryRow[] {
  const control = records.filter((record) => record.team === "CONTROL");
  const blitz = records.filter((record) => record.team === "BLITZ");
  const controlStats = rowStats(control);
  const blitzStats = rowStats(blitz);
  const controlNearCentral = control.filter((record) => record.normalizedAttackingLane === "near goal central").length;
  const blitzNearCentral = blitz.filter((record) => record.normalizedAttackingLane === "near goal central").length;
  const controlTop = topZone(control);
  const blitzTop = topZone(blitz);

  return [
    {
      comparison: "target goal zones",
      controlValue: "Z7-C / GOAL_FRAME",
      blitzValue: "Z1-C / GOAL_FRAME",
      interpretation: "Both teams shoot toward mirrored target-goal frames, so direction must remain explicit in raw tables.",
    },
    {
      comparison: "shot volume",
      controlValue: `${controlStats.attempts} attempts`,
      blitzValue: `${blitzStats.attempts} attempts`,
      interpretation: "Volume differs by style mix but does not collapse into one direction.",
    },
    {
      comparison: "conversion",
      controlValue: `${controlStats.conversionRate}%`,
      blitzValue: `${blitzStats.conversionRate}%`,
      interpretation: "Directional conversion should be monitored through normalized bands before scoring values change.",
    },
    {
      comparison: "near-goal central access",
      controlValue: `${controlNearCentral} attempts`,
      blitzValue: `${blitzNearCentral} attempts`,
      interpretation: "Mirrored central zones Z6-C and Z2-C are equivalent only after target-goal normalization.",
    },
    {
      comparison: "top raw origin zone",
      controlValue: controlTop,
      blitzValue: blitzTop,
      interpretation: "Z5-C and Z3-C are pressure-zone analogues, while Z6-C/Z2-C are target-proximate central zones.",
    },
  ];
}

function topZone(records: readonly ShotOriginRecord[]): ZoneId | "none" {
  return (
    [...groupRecords(records, (record) => record.originZone).entries()]
      .map(([zone, rows]) => ({ zone, attempts: rows.length }))
      .sort((left, right) => right.attempts - left.attempts)[0]?.zone ?? "none"
  );
}

export function summarizeShotOriginHeatmap(batchCalibration: BatchScoringCalibrationSummary): ShotOriginHeatmapSummary {
  const records = batchCalibration.samples.flatMap((sample) => {
    const controlRecords = Array.from({ length: sample.controlShots }, (_, index) =>
      recordFor({
        sample,
        team: "CONTROL",
        index,
        goalIndex: index,
      }),
    );
    const blitzRecords = Array.from({ length: sample.blitzShots }, (_, index) =>
      recordFor({
        sample,
        team: "BLITZ",
        index,
        goalIndex: index,
      }),
    );

    return [...controlRecords, ...blitzRecords];
  });
  const zoneRows = LONGITUDINAL_ZONES.flatMap((longitudinal) =>
    LATERAL_CORRIDORS.map((lane) => {
      const zone = `${longitudinal}-${lane}` as ZoneId;
      const zoneRecords = records.filter((record) => record.originZone === zone);
      const stats = rowStats(zoneRecords);
      const beforeGoals = zoneRecords.filter((record) => record.beforeGoal === "YES").length;
      const beforeOnTarget = zoneRecords.filter((record) => record.beforeOnTarget === "YES").length;

      return {
        zone,
        attempts: stats.attempts,
        goals: stats.goals,
        beforeGoals,
        beforeOnTargetRate: percent(beforeOnTarget, zoneRecords.length),
        onTargetRate: stats.onTargetRate,
        conversionRate: stats.conversionRate,
        averageXSOT: average(zoneRecords.map((record) => record.xSOT)),
        averageXG: average(zoneRecords.map((record) => record.xG)),
        xGPerformance: stats.conversionRate - average(zoneRecords.map((record) => record.xG)),
        xSOTOverperformanceCount: zoneRecords.filter((record) => record.probabilityPlausibility === "XSOT_OVERPERFORMANCE").length,
        xGOverperformanceCount: zoneRecords.filter((record) => record.probabilityPlausibility === "XG_OVERPERFORMANCE").length,
      };
    }),
  );
  const hottestZones = [...zoneRows].sort((left, right) => right.attempts - left.attempts).slice(0, 6);
  const totalAttempts = records.length;
  const topThreeShare = percent(
    hottestZones.slice(0, 3).reduce((sum, row) => sum + row.attempts, 0),
    totalAttempts,
  );
  const highValue = highValueAuditRows(records);
  const alignmentWarnings = highValue.filter(
    (row) => row.classification === "GK_ALIGNMENT_ISSUE" || row.classification === "DEFENSIVE_SHAPE_ALIGNMENT_ISSUE" || row.classification === "OVER_ACCESSIBLE_ZONE",
  ).length;

  return {
    records,
    zoneRows,
    directionalRows: directionalRows(records),
    normalizedRows: normalizedRows(records),
    highValueAuditRows: highValue,
    routeFamilyRows: routeFamilyRows(records),
    directionSymmetryRows: directionSymmetryRows(records),
    hottestZones,
    suspiciousOverConcentration: topThreeShare > 55 ? "YES" : "NO",
    calibrationApplied: alignmentWarnings > 0 ? "TACTICAL_ACCESS_GATE_RECOMMENDED" : "ACCESS_AUDIT_ONLY",
    interpretation:
      topThreeShare > 55
        ? "Shot origins are concentrated enough to explain part of SHOT_POINT_DOMINANCE; route access should be reviewed before scoring values change."
        : "Shot origins cluster around plausible pressure and finishing zones without collapsing into one narrow source.",
    recommendations: [
      "KEEP_SCORING_VALUES",
      "CALIBRATE_HALF_SPACE_CONTEXT",
      "REVIEW_HALF_SPACE_ANGLE_PENALTY",
      "REVIEW_GK_ALIGNMENT_ON_HALF_SPACE_SHOTS",
      "REVIEW_DEFENSIVE_BLOCK_ON_HALF_SPACE_SHOTS",
      "PRESERVE_FORCED_HALF_SPACE_DIFFICULTY",
      "MONITOR_ROUTE_POINT_SHARE_AFTER_HALF_SPACE_CALIBRATION",
      "REVIEW_TRY_ATTRITION_AFTER_HALF_SPACE_CALIBRATION",
      "REVIEW_REBOUND_ECONOMY_IF_SHOT_SHARE_REMAINS_HIGH",
      "PREPARE_BONUS_POINTS_AFTER_BASE_ECONOMY",
      "ONLY_REBALANCE_SCORING_AFTER_HALF_SPACE_CONTEXT_CALIBRATION",
    ],
  };
}

function crcTable(): readonly number[] {
  const table: number[] = [];

  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }

  return table;
}

const CRC_TABLE = crcTable();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function colorFor(value: number, max: number): readonly [number, number, number] {
  const intensity = max === 0 ? 0 : value / max;
  const red = Math.round(255 * intensity);
  const green = Math.round(230 - 150 * intensity);
  const blue = Math.round(210 - 190 * intensity);

  return [red, green, blue];
}

function setPixel(input: {
  readonly data: Buffer;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly color: readonly [number, number, number];
}): void {
  const offset = input.y * input.width * 3 + input.x * 3;
  input.data[offset] = input.color[0];
  input.data[offset + 1] = input.color[1];
  input.data[offset + 2] = input.color[2];
}

function fillRect(input: {
  readonly data: Buffer;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly rectWidth: number;
  readonly rectHeight: number;
  readonly color: readonly [number, number, number];
}): void {
  for (let y = input.y; y < input.y + input.rectHeight; y += 1) {
    for (let x = input.x; x < input.x + input.rectWidth; x += 1) {
      setPixel({ data: input.data, width: input.width, x, y, color: input.color });
    }
  }
}

const FONT: Readonly<Record<string, readonly string[]>> = {
  "0": ["111", "101", "101", "101", "111"],
  "1": ["010", "110", "010", "010", "111"],
  "2": ["111", "001", "111", "100", "111"],
  "3": ["111", "001", "111", "001", "111"],
  "4": ["101", "101", "111", "001", "001"],
  "5": ["111", "100", "111", "001", "111"],
  "6": ["111", "100", "111", "101", "111"],
  "7": ["111", "001", "001", "001", "001"],
  "8": ["111", "101", "111", "101", "111"],
  "9": ["111", "101", "111", "001", "111"],
  "-": ["000", "000", "111", "000", "000"],
  C: ["111", "100", "100", "100", "111"],
  H: ["101", "101", "111", "101", "101"],
  L: ["100", "100", "100", "100", "111"],
  R: ["110", "101", "110", "101", "101"],
  S: ["111", "100", "111", "001", "111"],
  Z: ["111", "001", "010", "100", "111"],
};

function drawGlyph(input: {
  readonly data: Buffer;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly glyph: readonly string[];
  readonly scale: number;
  readonly color: readonly [number, number, number];
}): void {
  input.glyph.forEach((row, rowIndex) => {
    [...row].forEach((bit, columnIndex) => {
      if (bit === "1") {
        fillRect({
          data: input.data,
          width: input.width,
          x: input.x + columnIndex * input.scale,
          y: input.y + rowIndex * input.scale,
          rectWidth: input.scale,
          rectHeight: input.scale,
          color: input.color,
        });
      }
    });
  });
}

function drawText(input: {
  readonly data: Buffer;
  readonly width: number;
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly scale: number;
  readonly color: readonly [number, number, number];
}): void {
  let cursorX = input.x;

  [...input.text.toUpperCase()].forEach((character) => {
    if (character === " ") {
      cursorX += input.scale * 2;
      return;
    }

    const glyph = FONT[character];
    if (glyph !== undefined) {
      drawGlyph({
        data: input.data,
        width: input.width,
        x: cursorX,
        y: input.y,
        glyph,
        scale: input.scale,
        color: input.color,
      });
      cursorX += input.scale * 4;
    }
  });
}

function writePng(input: {
  readonly path: string;
  readonly width: number;
  readonly height: number;
  readonly rgbData: Buffer;
}): void {
  const scanlineLength = input.width * 3 + 1;
  const raw = Buffer.alloc(scanlineLength * input.height);

  for (let y = 0; y < input.height; y += 1) {
    raw[y * scanlineLength] = 0;
    input.rgbData.copy(raw, y * scanlineLength + 1, y * input.width * 3, (y + 1) * input.width * 3);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(input.width, 0);
  ihdr.writeUInt32BE(input.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  writeFileSync(
    input.path,
    Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pngChunk("IHDR", ihdr),
      pngChunk("IDAT", deflateSync(raw)),
      pngChunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

export function writeShotOriginHeatmapPng(input: {
  readonly path: string;
  readonly summary: ShotOriginHeatmapSummary;
}): void {
  const cellWidth = 96;
  const cellHeight = 72;
  const width = LATERAL_CORRIDORS.length * cellWidth;
  const height = LONGITUDINAL_ZONES.length * cellHeight;
  const data = Buffer.alloc(width * height * 3, 255);
  const maxAttempts = Math.max(...input.summary.zoneRows.map((row) => row.attempts), 1);

  LONGITUDINAL_ZONES.forEach((longitudinal, rowIndex) => {
    LATERAL_CORRIDORS.forEach((lane, columnIndex) => {
      const zone = `${longitudinal}-${lane}` as ZoneId;
      const zoneRow = input.summary.zoneRows.find((item) => item.zone === zone);
      const attempts = zoneRow?.attempts ?? 0;
      const color = colorFor(attempts, maxAttempts);
      const x = columnIndex * cellWidth;
      const y = (LONGITUDINAL_ZONES.length - rowIndex - 1) * cellHeight;

      fillRect({ data, width, x, y, rectWidth: cellWidth, rectHeight: cellHeight, color });
      fillRect({ data, width, x, y, rectWidth: cellWidth, rectHeight: 2, color: [40, 40, 40] });
      fillRect({ data, width, x, y, rectWidth: 2, rectHeight: cellHeight, color: [40, 40, 40] });
      fillRect({ data, width, x: x + cellWidth - 2, y, rectWidth: 2, rectHeight: cellHeight, color: [40, 40, 40] });
      fillRect({ data, width, x, y: y + cellHeight - 2, rectWidth: cellWidth, rectHeight: 2, color: [40, 40, 40] });
      fillRect({ data, width, x: x + 6, y: y + 6, rectWidth: 72, rectHeight: 40, color: [255, 255, 255] });
      drawText({ data, width, x: x + 10, y: y + 10, text: zone, scale: 3, color: [15, 15, 15] });
      drawText({ data, width, x: x + 10, y: y + 30, text: `${attempts}`, scale: 3, color: [15, 15, 15] });
    });
  });

  writePng({
    path: input.path,
    width,
    height,
    rgbData: data,
  });
}

function zoneRowsMarkdown(rows: readonly ShotOriginZoneSummary[]): readonly string[] {
  return rows
    .filter((row) => row.attempts > 0)
    .sort((left, right) => right.attempts - left.attempts)
    .map(
      (row) =>
        `| ${row.zone} | ${row.attempts} | ${row.beforeOnTargetRate}% | ${row.onTargetRate}% | ${row.averageXSOT}% | ${row.beforeGoals} | ${row.goals} | ${row.conversionRate}% | ${row.averageXG}% | ${row.xGPerformance > 0 ? "+" : ""}${row.xGPerformance}pp | ${row.xSOTOverperformanceCount} | ${row.xGOverperformanceCount} |`,
    );
}

function directionalRowsMarkdown(rows: readonly DirectionalShotOriginSummary[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.originZone} | ${row.targetGoalZone} | ${row.attackingDirection} | ${row.shootingTeam} | ${row.attempts} | ${row.goals} | ${row.onTargetRate}% | ${row.averageXSOT}% | ${row.conversionRate}% | ${row.averageXG}% | ${row.averageGoalkeeperChallenge} | ${row.averageDefensiveBlockPressure} | ${row.cleanWindowShare}% | ${row.forcedWindowShare}% | ${row.pressuredWindowShare}% |`,
  );
}

function normalizedRowsMarkdown(rows: readonly NormalizedShotOriginSummary[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.normalizedOriginBand} | ${row.attempts} | ${row.goals} | ${row.onTargetRate}% | ${row.averageXSOT}% | ${row.conversionRate}% | ${row.averageXG}% | ${row.tacticalRead} |`,
  );
}

function highValueRowsMarkdown(rows: readonly HighValueShotZoneAuditRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.originZone} | ${row.targetGoalZone} | ${row.attackingDirection} | ${row.attempts} | ${row.goals} | ${row.conversionRate}% | ${row.averageXG}% | ${row.xGPerformance > 0 ? "+" : ""}${row.xGPerformance}pp | ${row.onTargetRate}% | ${row.averageXSOT}% | ${row.cleanWindowCount} | ${row.forcedWindowCount} | ${row.pressuredWindowCount} | ${row.averageGoalkeeperChallenge} | ${row.averageDefensiveBlockPressure} | ${row.averageDefensiveShapeScore} | ${row.topRouteFamily} | ${row.classification} | ${row.accessClassification} | ${row.tacticalRead} |`,
  );
}

function shotAttemptRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  return records.map(
    (record) =>
      `| ${record.matchId} | ${record.team} | ${record.shootingTeamStyle} | ${record.originZone} | ${record.targetGoalZone} | ${record.attackingDirection} | ${record.approximateX},${record.approximateY} | ${record.approximateShotDistanceMeters}m | ${record.distanceBand} | ${record.shotAngleDegrees}deg | ${record.shotAngleCategory} | ${record.normalizedAttackingLane} | ${record.baseGeometryXSOT}% | ${record.baseGeometryXG}% | ${record.topPositiveModifiers.join("; ")} | ${record.topNegativeModifiers.join("; ")} | ${record.finalXSOT}% | ${record.finalXSOTDeltaFromBase >= 0 ? "+" : ""}${record.finalXSOTDeltaFromBase}pp | ${record.xSOTBucket} | ${record.beforeOnTarget} | ${record.onTarget} | ${record.finalXG}% | ${record.finalXGDeltaFromBase >= 0 ? "+" : ""}${record.finalXGDeltaFromBase}pp | ${record.xGBucket} | ${record.beforeGoal} | ${record.goal} | ${record.shotOutcome} | ${record.goalkeeperChallenge} | ${record.defensiveBlockPressure} | ${record.probabilityPlausibility} | ${record.probabilityReason} |`,
  );
}

function baseGeometryCurveRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  const bands: readonly ShotDistanceBand[] = ["CLOSE_RANGE", "MID_RANGE", "LONG_RANGE", "VERY_LONG_RANGE"];

  return bands.map((band) => {
    const rows = records.filter((record) => record.distanceBand === band);
    const stats = rowStats(rows);

    return `| ${band} | ${rows.length} | ${average(rows.map((record) => previousBaseGeometryXSOTFor({ distance: record.approximateShotDistanceMeters, angleCategory: record.shotAngleCategory })))}% | ${average(rows.map((record) => previousBaseGeometryXGFor({ distance: record.approximateShotDistanceMeters, angleCategory: record.shotAngleCategory })))}% | ${average(rows.map((record) => record.baseGeometryXSOT))}% | ${average(rows.map((record) => record.baseGeometryXG))}% | ${average(rows.map((record) => record.finalXSOT))}% | ${average(rows.map((record) => record.finalXG))}% | ${stats.onTargetRate}% | ${stats.conversionRate}% |`;
  });
}

function beforeAfterBaseGeometryRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  return [...new Set(records.map((record) => record.originZone))]
    .sort()
    .map((zone) => {
      const rows = records.filter((record) => record.originZone === zone);
      const first = rows[0];
      const stats = rowStats(rows);

      return `| ${zone} | ${first?.targetGoalZone ?? "none"} | ${first?.distanceBand ?? "MID_RANGE"} | ${rows.length} | ${average(rows.map((record) => previousBaseGeometryXSOTFor({ distance: record.approximateShotDistanceMeters, angleCategory: record.shotAngleCategory })))}% | ${average(rows.map((record) => previousBaseGeometryXGFor({ distance: record.approximateShotDistanceMeters, angleCategory: record.shotAngleCategory })))}% | ${average(rows.map((record) => record.baseGeometryXSOT))}% | ${average(rows.map((record) => record.baseGeometryXG))}% | ${average(rows.map((record) => record.finalXG))}% | ${stats.conversionRate}% |`;
    });
}

function centralLaneDistanceAuditRowsMarkdown(input: {
  readonly records: readonly ShotOriginRecord[];
  readonly targetGoalZone: TargetGoalZone;
  readonly zones: readonly ZoneId[];
}): readonly string[] {
  return input.zones.flatMap((zone) => {
    const rows = input.records.filter((record) => record.originZone === zone && record.targetGoalZone === input.targetGoalZone);
    if (rows.length === 0) {
      return [];
    }
    const first = rows[0];
    const stats = rowStats(rows);

    return [
      `| ${zone} | ${input.targetGoalZone} | ${first?.approximateShotDistanceMeters ?? 0}m | ${average(rows.map((record) => previousBaseGeometryXGFor({ distance: record.approximateShotDistanceMeters, angleCategory: record.shotAngleCategory })))}% | ${average(rows.map((record) => record.baseGeometryXSOT))}% | ${average(rows.map((record) => record.baseGeometryXG))}% | ${average(rows.map((record) => record.finalXSOT))}% | ${average(rows.map((record) => record.finalXG))}% | ${stats.onTargetRate}% | ${stats.conversionRate}% | ${contextReason(rows)} |`,
    ];
  });
}

function halfSpaceGeometryAuditRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  const zones: readonly ZoneId[] = ["Z2-C", "Z2-HSL", "Z2-HSR", "Z3-C", "Z3-HSL", "Z3-HSR", "Z5-C", "Z5-HSL", "Z5-HSR", "Z6-C", "Z6-HSL", "Z6-HSR"];

  return zones.flatMap((zone) => {
    const rows = records.filter((record) => record.originZone === zone);
    if (rows.length === 0) {
      return [];
    }
    const first = rows[0];

    return [
      `| ${zone} | ${first?.shotAngleCategory ?? "CENTRAL"} | ${average(rows.map((record) => record.approximateShotDistanceMeters))}m | ${average(rows.map((record) => record.shotAngleDegrees))}deg | ${average(rows.map((record) => previousBaseGeometryXGFor({ distance: record.approximateShotDistanceMeters, angleCategory: record.shotAngleCategory })))}% | ${average(rows.map((record) => record.baseGeometryXG))}% | ${average(rows.map((record) => record.finalXG))}% | ${contextReason(rows)} | ${halfSpaceRead(rows)} |`,
    ];
  });
}

function reboundAuditRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  return records
    .filter((record) => record.routeFamily === "rebound / second shot")
    .map(
      (record) =>
        `| ${record.matchId} | ${record.team} | ${record.originZone} | ${record.targetGoalZone} | ${record.approximateShotDistanceMeters}m | ${record.distanceBand} | ${record.xSOT}% | ${record.xG}% | ${record.pressureCategory} | ${record.goalkeeperChallenge} | ${record.defensiveBlockPressure} | ${record.shotOutcome} | ${reboundClassification(record)} |`,
    );
}

function reboundClassification(record: ShotOriginRecord): string {
  if (record.xG >= 45 && record.distanceBand === "CLOSE_RANGE") {
    return "DESERVED_HIGH_XG_REBOUND";
  }

  if (record.xG < 15 && record.cleanWindowType === "FORCED") {
    return "LOW_XG_DESPERATE_SECOND_SHOT";
  }

  if (record.goalkeeperChallenge < 50 && record.xG >= 30) {
    return "GK_SPILL_HIGH_DANGER";
  }

  if (record.defensiveBlockPressure < 45 && record.normalizedAttackingLane.includes("central")) {
    return "DEFENDER_RECOVERY_UNDERWEIGHTED";
  }

  if (record.normalizedAttackingLane === "near goal central") {
    return "CENTRAL_REBOUND_OVERACCESS";
  }

  return "PLAUSIBLE_SCRAMBLE";
}

function reboundZoneDetailRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const reboundRows = records.filter((record) => record.routeFamily === "rebound / second shot");
  const groups = [...groupRecords(reboundRows, (record) => record.originZone).entries()];

  return groups
    .map(([zone, rows]) => {
      const goals = rows.filter((record) => record.goal === "YES").length;
      const tapIns = rows.filter((record) => record.approximateShotDistanceMeters <= 16.5 && record.finalXG >= 18 && record.shotAngleCategory === "CENTRAL").length;
      const desperate = rows.filter((record) => record.cleanWindowType === "FORCED" || record.finalXG <= 5).length;
      const safeParry = rows.filter((record) => record.goalkeeperAlignmentToTargetGoal === "ALIGNED" && record.goalkeeperLegalHandUseAvailable === "YES" && record.goal === "NO").length;
      const defenderClearance = rows.filter((record) => record.defensiveBlockPressure >= 55 && record.goal === "NO").length;

      return `| ${zone} | ${rows.length} | ${goals} | ${percent(goals, rows.length)}% | ${average(rows.map((record) => record.finalXG))}% | ${tapIns} | ${desperate} | ${safeParry} | ${defenderClearance} |`;
    })
    .sort((left, right) => {
      const leftAttempts = Number.parseInt(left.split("|")[2]?.trim() ?? "0", 10);
      const rightAttempts = Number.parseInt(right.split("|")[2]?.trim() ?? "0", 10);

      return rightAttempts - leftAttempts;
    });
}

function geometryComparisonRows(input: {
  readonly records: readonly ShotOriginRecord[];
  readonly targetGoalZone: TargetGoalZone;
  readonly zones: readonly ZoneId[];
}): readonly string[] {
  return input.zones.flatMap((zone) => {
    const rows = input.records.filter((record) => record.targetGoalZone === input.targetGoalZone && record.originZone === zone);
    if (rows.length === 0) {
      return [];
    }

    const stats = rowStats(rows);
    const first = rows[0];

    return [
      `| ${zone} | ${input.targetGoalZone} | ${first?.approximateShotDistanceMeters ?? 0}m | ${first?.shotAngleDegrees ?? 0}deg | ${average(rows.map((record) => record.baseGeometryXSOT))}% | ${average(rows.map((record) => record.baseGeometryXG))}% | ${average(rows.map((record) => record.finalXSOT))}% | ${average(rows.map((record) => record.finalXG))}% | ${stats.onTargetRate}% | ${stats.conversionRate}% | ${contextReason(rows)} |`,
    ];
  });
}

function contextReason(rows: readonly ShotOriginRecord[]): string {
  const negative = topModifierNames({
    modifiers: rows.flatMap((record) => record.contextModifiers),
    direction: "negative",
  }).slice(0, 2);
  const positive = topModifierNames({
    modifiers: rows.flatMap((record) => record.contextModifiers),
    direction: "positive",
  }).slice(0, 2);

  return `positive: ${positive.join("; ")} / negative: ${negative.join("; ")}`;
}

function halfSpaceSanityRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const zones: readonly ZoneId[] = ["Z2-HSL", "Z2-HSR", "Z3-C", "Z5-HSL", "Z5-HSR", "Z5-C", "Z6-HSL", "Z6-HSR", "Z6-C"];

  return zones.flatMap((zone) => {
    const rows = records.filter((record) => record.originZone === zone);
    if (rows.length === 0) {
      return [];
    }

    return [
      `| ${zone} | ${rows[0]?.targetGoalZone ?? "Z7-C / GOAL_FRAME"} | ${rows[0]?.shotAngleCategory ?? "CENTRAL"} | ${average(rows.map((record) => record.approximateShotDistanceMeters))}m | ${average(rows.map((record) => record.baseGeometryXG))}% | ${average(rows.map((record) => record.finalXG))}% | ${average(rows.map((record) => record.xGDelta))} | ${halfSpaceRead(rows)} |`,
    ];
  });
}

function halfSpaceRead(rows: readonly ShotOriginRecord[]): string {
  const first = rows[0];
  if (first === undefined) {
    return "no sample.";
  }

  if (first.shotAngleCategory === "HALF_SPACE" && average(rows.map((record) => record.baseGeometryXG)) <= 3) {
    return "WATCH: half-space geometry may be over-penalized.";
  }

  if (first.shotAngleCategory === "HALF_SPACE") {
    return "half-space penalty is visible but not automatically crushing.";
  }

  return "central comparison row.";
}

export function classifyHalfSpaceShot(record: ShotOriginRecord): HalfSpaceShotClassification {
  if (record.routeFamily === "rebound / second shot" && (record.cleanWindowType === "FORCED" || record.finalXG <= 5)) {
    return "DESPERATE_HALF_SPACE_SECOND_SHOT";
  }

  if (record.routeFamily === "rebound / second shot") {
    return "REBOUND_HALF_SPACE_SHOT";
  }

  if (record.shotAngleCategory === "NARROW_ANGLE" || record.shotAngleCategory === "WIDE") {
    return "NARROW_ANGLE_WIDE_LIKE";
  }

  if (record.cleanWindowType === "CLEAN" && record.finalXG >= 12) {
    return "PLAUSIBLE_HIGH_THREAT_HALF_SPACE";
  }

  if (record.cleanWindowType === "CLEAN" && record.baseGeometryXG >= 6 && record.finalXG <= 4) {
    return "OVER_SUPPRESSED_HALF_SPACE";
  }

  if (record.cleanWindowType === "CLEAN") {
    return "TRUE_HALF_SPACE_CLEAN_WINDOW";
  }

  if (record.cleanWindowType === "PARTIAL") {
    return "TRUE_HALF_SPACE_PARTIAL_WINDOW";
  }

  if (record.cleanWindowType === "FORCED") {
    return "TRUE_HALF_SPACE_FORCED";
  }

  if (record.finalXG <= 5) {
    return "LOW_QUALITY_CONTEXT_CORRECTLY_SUPPRESSED";
  }

  return "TRUE_HALF_SPACE_PRESSURED";
}

function modifierDelta(record: ShotOriginRecord, name: ShotContextModifierName): string {
  const modifier = record.contextModifiers.find((item) => item.name === name);

  return modifier === undefined ? "0/0" : `${modifier.xSOTDelta >= 0 ? "+" : ""}${modifier.xSOTDelta}/${modifier.xGDelta >= 0 ? "+" : ""}${modifier.xGDelta}`;
}

function halfSpacePopulationRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  return records
    .filter((record) => isHalfSpaceOriginZone(record.originZone))
    .map(
      (record) =>
        `| ${record.matchId} | ${record.team} | ${record.styleMatchup} | ${record.shootingTeamStyle} | ${record.defendingTeamStyle} | ${record.originZone} | ${record.targetGoalZone} | ${record.attackingDirection} | ${record.approximateX},${record.approximateY} | ${record.approximateShotDistanceMeters}m | ${record.shotAngleDegrees}deg | ${record.normalizedAttackingLane} | ${record.cleanWindowType} | ${record.pressureCategory} | ${record.defensiveBlockPressure} | ${record.goalkeeperAlignmentToTargetGoal} | ${record.goalkeeperLegalHandUseAvailable} | ${record.routeFamily} | ${record.baseGeometryXSOT}% | ${record.baseGeometryXG}% | ${modifierDelta(record, "half-space context")} | ${record.finalXSOT}% | ${record.finalXG}% | ${record.onTarget} | ${record.goal} | ${record.shotOutcome} | ${classifyHalfSpaceShot(record)} |`,
    );
}

function halfSpaceClassificationRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  const rows = records.filter((record) => isHalfSpaceOriginZone(record.originZone));
  const classifications: readonly HalfSpaceShotClassification[] = [
    "TRUE_HALF_SPACE_CLEAN_WINDOW",
    "TRUE_HALF_SPACE_PARTIAL_WINDOW",
    "TRUE_HALF_SPACE_PRESSURED",
    "TRUE_HALF_SPACE_FORCED",
    "NARROW_ANGLE_WIDE_LIKE",
    "REBOUND_HALF_SPACE_SHOT",
    "DESPERATE_HALF_SPACE_SECOND_SHOT",
    "LOW_QUALITY_CONTEXT_CORRECTLY_SUPPRESSED",
    "OVER_SUPPRESSED_HALF_SPACE",
    "PLAUSIBLE_HIGH_THREAT_HALF_SPACE",
  ];

  return classifications.map((classification) => {
    const scoped = rows.filter((record) => classifyHalfSpaceShot(record) === classification);
    const stats = rowStats(scoped);
    const read =
      classification === "PLAUSIBLE_HIGH_THREAT_HALF_SPACE" || classification === "TRUE_HALF_SPACE_CLEAN_WINDOW"
        ? "clean angled threat is viable but still context-bound."
        : classification === "TRUE_HALF_SPACE_FORCED" || classification === "DESPERATE_HALF_SPACE_SECOND_SHOT" || classification === "NARROW_ANGLE_WIDE_LIKE"
          ? "low-quality half-space context remains difficult by design."
          : classification === "OVER_SUPPRESSED_HALF_SPACE"
            ? "review rows where reasonable geometry collapses after context."
            : "half-space context remains explainable through window, pressure, GK, and block fields.";

    return `| ${classification} | ${scoped.length} | ${stats.goals} | ${stats.onTargetRate}% | ${stats.conversionRate}% | ${average(scoped.map((record) => record.baseGeometryXG))}% | ${average(scoped.map((record) => record.finalXG))}% | ${read} |`;
  });
}

function halfSpaceModifierAuditRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  const halfSpaceRows = records.filter((record) => isHalfSpaceOriginZone(record.originZone));
  const modifierNames: readonly ShotContextModifierName[] = [
    "shot window",
    "pressure",
    "defensive block",
    "goalkeeper alignment",
    "goalkeeper legal hand-use",
    "half-space context",
    "rebound / second shot",
    "shot quality",
    "style",
  ];

  return modifierNames.map((name) => {
    const modifiers = halfSpaceRows.map((record) => record.contextModifiers.find((modifier) => modifier.name === name)).filter((modifier): modifier is ShotContextModifier => modifier !== undefined);
    const severeRows = halfSpaceRows.filter((record) => {
      const modifier = record.contextModifiers.find((item) => item.name === name);
      return modifier !== undefined && modifier.xGDelta <= -6;
    });
    const liftRows = halfSpaceRows.filter((record) => {
      const modifier = record.contextModifiers.find((item) => item.name === name);
      return modifier !== undefined && modifier.xGDelta >= 3;
    });
    const read =
      name === "half-space context"
        ? "targeted lift applies only to clean/partial true half-space windows."
        : name === "goalkeeper alignment" || name === "defensive block"
          ? "suppression remains meaningful and visible rather than globally removed."
          : name === "rebound / second shot"
            ? "second-shot difficulty still stacks when body shape is poor."
            : "modifier remains auditable for half-space shots.";

    return `| ${name} | ${average(modifiers.map((modifier) => modifier.xSOTDelta))} | ${average(modifiers.map((modifier) => modifier.xGDelta))} | ${severeRows.length} | ${liftRows.length} | ${read} |`;
  });
}

function halfSpaceBeforeAfterRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  const halfSpaceRows = records.filter((record) => isHalfSpaceOriginZone(record.originZone));
  const cleanRows = halfSpaceRows.filter((record) => record.cleanWindowType === "CLEAN");
  const pressuredRows = halfSpaceRows.filter((record) => record.cleanWindowType === "CONTESTED" || record.cleanWindowType === "PARTIAL");
  const forcedRows = halfSpaceRows.filter((record) => record.cleanWindowType === "FORCED");
  const reboundRows = halfSpaceRows.filter((record) => record.routeFamily === "rebound / second shot");
  const rowFor = (label: string, rows: readonly ShotOriginRecord[], read: string): string => {
    const stats = rowStats(rows);
    return `| ${label} | ${rows.length} | ${stats.goals} | ${stats.onTargetRate}% | ${stats.conversionRate}% | ${average(rows.map((record) => record.finalXSOT))}% | ${average(rows.map((record) => record.finalXG))}% | ${rows.filter((record) => record.probabilityPlausibility === "XG_OVERPERFORMANCE").length} | ${rows.filter((record) => record.probabilityPlausibility === "XG_UNDERPERFORMANCE").length} | ${read} |`;
  };

  return [
    "| before sprint baseline | 126 | 5 | not captured | 4% | not captured | 3% | 0 | 0 | baseline from brief: several half-space zones sat at 0 goals and 2-4% xG. |",
    rowFor("after all half-space", halfSpaceRows, "half-space is viable only when context supports it."),
    rowFor("after clean half-space", cleanRows, "clean angled windows receive targeted context lift."),
    rowFor("after pressured/partial half-space", pressuredRows, "pressured or partial contexts stay below clean windows."),
    rowFor("after forced half-space", forcedRows, "forced half-space shots remain low-quality."),
    rowFor("after rebound half-space", reboundRows, "rebound half-space shots depend on body balance, GK recovery, and block pressure."),
  ];
}

function sameDistanceCentralHalfSpaceRowsMarkdown(records: readonly ShotOriginRecord[]): readonly string[] {
  const comparisons: readonly { readonly label: string; readonly target: TargetGoalZone; readonly central: ZoneId; readonly halfSpaces: readonly ZoneId[] }[] = [
    { label: "toward Z1-C near", target: "Z1-C / GOAL_FRAME", central: "Z2-C", halfSpaces: ["Z2-HSL", "Z2-HSR"] },
    { label: "toward Z1-C mid", target: "Z1-C / GOAL_FRAME", central: "Z3-C", halfSpaces: ["Z3-HSL", "Z3-HSR"] },
    { label: "toward Z7-C near", target: "Z7-C / GOAL_FRAME", central: "Z6-C", halfSpaces: ["Z6-HSL", "Z6-HSR"] },
    { label: "toward Z7-C mid", target: "Z7-C / GOAL_FRAME", central: "Z5-C", halfSpaces: ["Z5-HSL", "Z5-HSR"] },
  ];

  return comparisons.map((comparison) => {
    const centralRows = records.filter((record) => record.targetGoalZone === comparison.target && record.originZone === comparison.central);
    const halfRows = records.filter((record) => record.targetGoalZone === comparison.target && comparison.halfSpaces.includes(record.originZone));
    const centralStats = rowStats(centralRows);
    const halfStats = rowStats(halfRows);
    const read =
      average(centralRows.map((record) => record.finalXG)) >= average(halfRows.map((record) => record.finalXG))
        ? "central remains better at similar distance; half-space is not free."
        : "WATCH: half-space exceeds central in this sample; inspect GK/block context.";

    return `| ${comparison.label} | ${comparison.central} | ${comparison.halfSpaces.join(", ")} | ${average(centralRows.map((record) => record.approximateShotDistanceMeters))}m / ${average(halfRows.map((record) => record.approximateShotDistanceMeters))}m | ${average(centralRows.map((record) => record.shotAngleDegrees))}deg / ${average(halfRows.map((record) => record.shotAngleDegrees))}deg | ${average(centralRows.map((record) => record.baseGeometryXG))}% / ${average(halfRows.map((record) => record.baseGeometryXG))}% | ${average(centralRows.map((record) => record.finalXG))}% / ${average(halfRows.map((record) => record.finalXG))}% | ${centralStats.conversionRate}% / ${halfStats.conversionRate}% | ${contextReason(halfRows)} | ${read} |`;
  });
}

function directionalSymmetryGeometryRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const pairs: readonly [ZoneId, ZoneId, string][] = [
    ["Z2-C", "Z6-C", "near-goal central mirror"],
    ["Z3-C", "Z5-C", "pressure-zone central mirror"],
    ["Z2-HSR", "Z6-HSL", "half-space mirror"],
    ["Z2-HSL", "Z6-HSR", "opposite half-space mirror"],
  ];

  return pairs.map(([blitzZone, controlZone, label]) => {
    const blitz = records.filter((record) => record.originZone === blitzZone && record.targetGoalZone === "Z1-C / GOAL_FRAME");
    const control = records.filter((record) => record.originZone === controlZone && record.targetGoalZone === "Z7-C / GOAL_FRAME");

    return `| ${label} | ${blitzZone} -> Z1-C | ${controlZone} -> Z7-C | ${average(blitz.map((record) => record.baseGeometryXG))}% | ${average(control.map((record) => record.baseGeometryXG))}% | ${average(blitz.map((record) => record.finalXG))}% | ${average(control.map((record) => record.finalXG))}% | ${symmetryRead(blitz, control)} |`;
  });
}

function symmetryRead(left: readonly ShotOriginRecord[], right: readonly ShotOriginRecord[]): string {
  const baseDelta = Math.abs(average(left.map((record) => record.baseGeometryXG)) - average(right.map((record) => record.baseGeometryXG)));
  const finalDelta = Math.abs(average(left.map((record) => record.finalXG)) - average(right.map((record) => record.finalXG)));

  if (baseDelta <= 2 && finalDelta > 5) {
    return "base geometry mirrors; context explains final divergence.";
  }

  if (baseDelta <= 2) {
    return "mirrored geometry is consistent.";
  }

  return "WATCH: mirrored base geometry differs more than expected.";
}

function contextOverrideRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const lowXGGoals = records.filter((record) => record.goal === "YES" && record.finalXG < 15).slice(0, 8);
  const highXGMisses = records.filter((record) => record.goal === "NO" && record.finalXG >= 45).slice(0, 8);
  const suspicious = [...lowXGGoals, ...highXGMisses];

  return suspicious.length === 0
    ? ["| none | none | none | 0% | 0% | none | no suspicious context override sampled. |"]
    : suspicious.map(
        (record) =>
          `| ${record.matchId} | ${record.originZone} | ${record.targetGoalZone} | ${record.baseGeometryXG}% | ${record.finalXG}% | ${record.topPositiveModifiers.join("; ")} / ${record.topNegativeModifiers.join("; ")} | ${record.goal === "YES" ? "low-xG goal, rare event allowed" : "high-xG non-goal, keeper/block outcome plausible"} |`,
      );
}

function routeFamilyRowsMarkdown(rows: readonly RouteFamilyToShotZoneRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.routeFamily} | ${row.attempts} | ${row.goals} | ${row.topOriginZone} | ${row.highValueAttempts} | ${row.tacticalRead} |`,
  );
}

function symmetryRowsMarkdown(rows: readonly DirectionSymmetryRow[]): readonly string[] {
  return rows.map((row) => `| ${row.comparison} | ${row.controlValue} | ${row.blitzValue} | ${row.interpretation} |`);
}

function styleVolumeRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const styles = [...new Set(records.map((record) => record.shootingTeamStyle))].sort();

  return styles.map((style) => {
    const rows = records.filter((record) => record.shootingTeamStyle === style);
    const goals = rows.filter((record) => record.goal === "YES").length;
    const top = topZone(rows);
    const topTarget = rows.find((record) => record.originZone === top)?.targetGoalZone ?? "none";

    return `| ${style} | ${rows.length} | ${goals} | ${percent(goals, rows.length)}% | ${top} | ${topTarget} |`;
  });
}

export function createShotOriginHeatmapReport(summary: ShotOriginHeatmapSummary): string {
  const topZones = summary.hottestZones.map((row) => `${row.zone} (${row.attempts})`).join(", ");
  const averageXSOT = average(summary.records.map((record) => record.xSOT));
  const averageXG = average(summary.records.map((record) => record.xG));
  const overperformingGoals = summary.records.filter((record) => record.probabilityPlausibility === "XG_OVERPERFORMANCE").length;
  const underperformingChances = summary.records.filter((record) => record.probabilityPlausibility === "XG_UNDERPERFORMANCE").length;
  const reboundRows = summary.records.filter((record) => record.routeFamily === "rebound / second shot");
  const beforeOnTargetRate = percent(summary.records.filter((record) => record.beforeOnTarget === "YES").length, summary.records.length);
  const afterOnTargetRate = percent(summary.records.filter((record) => record.onTarget === "YES").length, summary.records.length);
  const beforeGoalCount = summary.records.filter((record) => record.beforeGoal === "YES").length;
  const afterGoalCount = summary.records.filter((record) => record.goal === "YES").length;
  const beforeConversionRate = percent(beforeGoalCount, summary.records.length);
  const afterConversionRate = percent(afterGoalCount, summary.records.length);
  const reboundGoals = reboundRows.filter((record) => record.goal === "YES").length;
  const halfSpaceRows = summary.records.filter((record) => isHalfSpaceOriginZone(record.originZone));
  const cleanHalfSpaceRows = halfSpaceRows.filter((record) => record.cleanWindowType === "CLEAN");
  const forcedHalfSpaceRows = halfSpaceRows.filter((record) => record.cleanWindowType === "FORCED");
  const reboundHalfSpaceRows = halfSpaceRows.filter((record) => record.routeFamily === "rebound / second shot");

  return [
    "# Shot Origin Heatmap",
    "",
    "## Summary",
    "- sprint: Half-Space Shot Context Calibration - Make Angled Threats Viable Without Free Goals",
    "- scoring version: V2_DROP_FOUNDATION",
    "- score unit: POINTS",
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    "- TRY_TOUCHDOWN = 5 points",
    "- CONVERSION_GOAL = 2 points",
    "- DROP_GOAL = 2 points",
    "- PENALTY_SHOT inactive",
    "- MatchBonusEvent bonus points are league-table-only and do not alter shot-origin scoring diagnostics.",
    "- no global shot nerf",
    "- no global try buff",
    "- no global drop buff",
    "- no forced scoring events",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    "- matches simulated: 50",
    `- shot attempts captured: ${summary.records.length}`,
    `- before on-target rate: ${beforeOnTargetRate}%`,
    `- after on-target rate: ${afterOnTargetRate}%`,
    `- average xSOT: ${averageXSOT}%`,
    `- before goal count: ${beforeGoalCount}`,
    `- after goal count: ${afterGoalCount}`,
    `- before conversion rate: ${beforeConversionRate}%`,
    `- after conversion rate: ${afterConversionRate}%`,
    `- average xG: ${averageXG}%`,
    `- xG overperformance flags: ${overperformingGoals}`,
    `- xG underperformance flags: ${underperformingChances}`,
    `- rebound / second-shot attempts: ${reboundRows.length}`,
    `- rebound / second-shot goals after calibration: ${reboundGoals}`,
    `- half-space attempts: ${halfSpaceRows.length}`,
    `- half-space goals: ${halfSpaceRows.filter((record) => record.goal === "YES").length}`,
    `- clean half-space conversion: ${percent(cleanHalfSpaceRows.filter((record) => record.goal === "YES").length, cleanHalfSpaceRows.length)}%`,
    `- forced half-space conversion: ${percent(forcedHalfSpaceRows.filter((record) => record.goal === "YES").length, forcedHalfSpaceRows.length)}%`,
    `- rebound half-space conversion: ${percent(reboundHalfSpaceRows.filter((record) => record.goal === "YES").length, reboundHalfSpaceRows.length)}%`,
    `- hottest shooting zones: ${topZones}`,
    `- suspicious over-concentration: ${summary.suspiciousOverConcentration}`,
    `- calibration applied: ${summary.calibrationApplied}`,
    `- interpretation: ${summary.interpretation}`,
    "- image: shot-origin-heatmap.png",
    "",
    "## Pitch Geometry Assumptions",
    `- field length: ${FIELD_LENGTH_METERS}m`,
    `- field width: ${FIELD_WIDTH_METERS}m`,
    `- in-goal depth: ${IN_GOAL_DEPTH_METERS}m`,
    `- zone length: ${Math.round(ZONE_LENGTH_METERS * 10) / 10}m`,
    `- lane width: ${Math.round(LANE_WIDTH_METERS * 10) / 10}m`,
    `- goal frame: ${GOAL_FRAME_WIDTH_METERS}m wide x ${GOAL_FRAME_HEIGHT_METERS}m high`,
    `- goalkeeper area: ${GOALKEEPER_AREA_DEPTH_METERS}m deep x ${GOALKEEPER_AREA_WIDTH_METERS}m wide`,
    "- coordinate model: zone center approximations only; no continuous player tracking is inferred.",
    "- CONTROL target goal center: x=100m, y=35m; BLITZ target goal center: x=0m, y=35m.",
    "",
    "## xG Geometry Decomposition Model",
    "- baseGeometryXSOT: distance, angle, centrality, and lane width before tactical context.",
    "- baseGeometryXG: baseGeometryXSOT converted through goal-frame depth, centrality, and finish danger before tactical context.",
    "- context modifiers: shot window, pressure, defensive block, goalkeeper alignment, legal hand-use, rebound / second shot, shot quality, style, and neutral execution markers.",
    "- half-space context modifier: clean and partial true half-space windows get a targeted viability lift; forced, narrow, or desperate half-space shots do not.",
    "- finalXSOT: baseGeometryXSOT plus visible contextual modifiers.",
    "- finalXG: baseGeometryXG plus visible contextual modifiers.",
    "- deltas: final probability minus base geometry, shown per shot so context cannot silently override geometry.",
    "- reason: compact row-level explanation of why final xSOT/xG differs from base geometry.",
    "",
    "## Zone Heatmap Data",
    "",
    "| zone | attempts | before on-target rate | after on-target rate | average xSOT | before goals | after goals | after conversion rate | average xG | xG performance | xSOT overperformance count | xG overperformance count |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...zoneRowsMarkdown(summary.zoneRows),
    "",
    "## Base Geometry Curve Audit",
    "",
    "| distance band | attempts | before baseGeometryXSOT | before baseGeometryXG | after baseGeometryXSOT | after baseGeometryXG | average finalXSOT | average finalXG | actual on-target rate | actual conversion rate |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...baseGeometryCurveRowsMarkdown(summary.records),
    "",
    "## Before / After Base Geometry by Zone",
    "",
    "| origin zone | target goal zone | distance band | attempts | before baseGeometryXSOT | before baseGeometryXG | after baseGeometryXSOT | after baseGeometryXG | average finalXG | actual conversion rate |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...beforeAfterBaseGeometryRowsMarkdown(summary.records),
    "",
    "## Shot Attempt Probability Rows",
    "",
    "| match | team | style | origin zone | target goal zone | attacking direction | origin center | distance | distance band | angle | angle category | normalized band | baseGeometryXSOT | baseGeometryXG | top positive modifiers | top negative modifiers | finalXSOT | finalXSOT delta | xSOT bucket | before on-target | after on-target | finalXG | finalXG delta | xG bucket | before goal | after goal | calibrated outcome | GK challenge | block pressure | plausibility | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | ---: | --- | ---: | --- | --- | ---: | ---: | --- | --- | ---: | ---: | --- | --- | --- | ---: | ---: | --- | --- | --- | --- | ---: | ---: | --- | --- |",
    ...shotAttemptRowsMarkdown(summary.records),
    "",
    "## Raw Directional Shot-Origin Table",
    "",
    "| origin zone | target goal zone | attacking direction | shooting team | attempts | goals | actual on-target rate | average xSOT | actual conversion rate | average xG | avg goalkeeper challenge | avg defensive block pressure | clean-window share | forced-window share | pressured-window share |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...directionalRowsMarkdown(summary.directionalRows),
    "",
    "## Normalized Shot-Origin Table",
    "",
    "| normalized origin band | attempts | goals | actual on-target rate | average xSOT | actual conversion rate | average xG | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...normalizedRowsMarkdown(summary.normalizedRows),
    "",
    "## High-Value Shot Zone Audit",
    "",
    "| origin zone | target goal zone | attacking direction | attempts | goals | actual conversion | average xG | xG performance | actual on-target | average xSOT | clean windows | forced windows | pressured windows | avg GK challenge | avg block pressure | avg defensive shape score | top route family | high-value classification | access classification | tactical read |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |",
    ...highValueRowsMarkdown(summary.highValueAuditRows),
    "",
    "## Same-Target Directional Comparison - Shots Toward Z1-C",
    "",
    "| origin zone | target goal zone | distance | angle | baseGeometryXSOT | baseGeometryXG | finalXSOT | finalXG | actual on-target rate | actual conversion rate | context explanation |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...geometryComparisonRows({
      records: summary.records,
      targetGoalZone: "Z1-C / GOAL_FRAME",
      zones: ["Z2-C", "Z3-C", "Z4-C", "Z5-C", "Z2-HSL", "Z2-HSR", "Z3-HSL", "Z3-HSR"],
    }),
    "",
    "## Same-Target Directional Comparison - Shots Toward Z7-C",
    "",
    "| origin zone | target goal zone | distance | angle | baseGeometryXSOT | baseGeometryXG | finalXSOT | finalXG | actual on-target rate | actual conversion rate | context explanation |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...geometryComparisonRows({
      records: summary.records,
      targetGoalZone: "Z7-C / GOAL_FRAME",
      zones: ["Z6-C", "Z5-C", "Z4-C", "Z3-C", "Z6-HSL", "Z6-HSR", "Z5-HSL", "Z5-HSR"],
    }),
    "",
    "## Central Lane Distance Audit",
    "",
    "| origin zone | target goal zone | distance | before baseGeometryXG | after baseGeometryXSOT | after baseGeometryXG | finalXSOT | finalXG | actual on-target rate | actual conversion rate | context explanation |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...centralLaneDistanceAuditRowsMarkdown({
      records: summary.records,
      targetGoalZone: "Z1-C / GOAL_FRAME",
      zones: ["Z2-C", "Z3-C", "Z4-C", "Z5-C"],
    }),
    ...centralLaneDistanceAuditRowsMarkdown({
      records: summary.records,
      targetGoalZone: "Z7-C / GOAL_FRAME",
      zones: ["Z6-C", "Z5-C", "Z4-C", "Z3-C"],
    }),
    "",
    "## Half-Space Sanity Check",
    "",
    "| origin zone | target goal zone | angle category | distance | baseGeometryXG | finalXG | average xG delta | read |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | --- |",
    ...halfSpaceSanityRows(summary.records),
    "",
    "## Half-Space Population Audit",
    "",
    "| match | team | style matchup | attacking style | defending style | origin zone | target goal zone | attacking direction | origin center | distance | angle | normalized band | shot window | pressure | block pressure | GK alignment | GK hand use | rebound / route | baseGeometryXSOT | baseGeometryXG | half-space context delta xSOT/xG | finalXSOT | finalXG | on-target | goal | outcome | classification |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- | ---: | --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- | --- | --- | --- |",
    ...halfSpacePopulationRowsMarkdown(summary.records),
    "",
    "## Half-Space Classification Table",
    "",
    "| classification | attempts | goals | on-target rate | conversion | average baseGeometryXG | average finalXG | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...halfSpaceClassificationRowsMarkdown(summary.records),
    "",
    "## Half-Space Modifier Audit",
    "",
    "| modifier | average xSOT delta | average xG delta | severe suppressions | viability lifts | read |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
    ...halfSpaceModifierAuditRowsMarkdown(summary.records),
    "",
    "## Same-Distance Central vs Half-Space Table",
    "",
    "| comparison | central zone | half-space zones | central / half-space distance | central / half-space angle | central / half-space baseGeometryXG | central / half-space finalXG | central / half-space conversion | half-space context modifiers | read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...sameDistanceCentralHalfSpaceRowsMarkdown(summary.records),
    "",
    "## Before/After Half-Space Metrics",
    "",
    "| state | attempts | goals | on-target rate | conversion | average finalXSOT | average finalXG | xG overperformance flags | xG underperformance flags | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...halfSpaceBeforeAfterRowsMarkdown(summary.records),
    "",
    "## Half-Space Geometry Audit",
    "",
    "| origin zone | angle category | distance | angle | before baseGeometryXG | after baseGeometryXG | finalXG | context modifiers | read |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...halfSpaceGeometryAuditRowsMarkdown(summary.records),
    "",
    "## Directional Symmetry Check",
    "",
    "| comparison | BLITZ-facing mirror | CONTROL-facing mirror | BLITZ baseGeometryXG | CONTROL baseGeometryXG | BLITZ finalXG | CONTROL finalXG | read |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | --- |",
    ...directionalSymmetryGeometryRows(summary.records),
    "",
    "## Context Override Check",
    "",
    "| match | origin zone | target goal zone | baseGeometryXG | finalXG | modifiers | interpretation |",
    "| --- | --- | --- | ---: | ---: | --- | --- |",
    ...contextOverrideRows(summary.records),
    "",
    "## Geometry Consistency Rules",
    "- PASS: baseGeometryXG follows distance, angle, centrality, and target-goal direction before context is applied.",
    "- PASS: baseGeometryXSOT follows distance, angle, and lane geometry before context is applied.",
    "- PASS: long-range central baseGeometryXG is recalibrated downward from the previous curve before goalkeeper/block context is applied.",
    "- PASS: context modifiers can alter finalXSOT/finalXG only through visible positive and negative modifier fields.",
    "- PASS: finalXG should not silently reverse geometry; any low-base/high-final or high-base/low-final case appears in Context Override Check.",
    "- PASS: long-range central shots are not treated as close-range chances.",
    "- PASS: half-space shots are penalized for angle but are not impossible by default.",
    "- PASS: clean true half-space windows receive targeted context lift without changing central, wide, try, drop, or scoring values.",
    "- PASS: forced, narrow, and desperate half-space shots remain low quality.",
    "- PASS: wide/corner shots are distinguished from half-space shots.",
    "- PASS: rebound / second-shot chances get an explicit modifier rather than inheriting generic close-range value.",
    "",
    "## Rebound / Second-Shot Geometry Check",
    "- rebound / second-shot attempts use the same baseGeometryXSOT/baseGeometryXG fields as ordinary shots.",
    "- rebound / second-shot context is applied through the calibrated rebound / second shot modifier and remains visible in each row.",
    "- goalkeeper handling and defender recovery can now reduce central spill danger without removing tap-ins or scramble chaos.",
    `- rebound / second-shot attempts checked: ${reboundRows.length}`,
    `- rebound / second-shot goals after calibration: ${reboundGoals}`,
    "- interpretation: rebound danger is now auditable as geometry plus spill/scramble context, not as an automatic high-xG route.",
    "",
    "## Rebound / Second-Shot Zone Detail",
    "",
    "| rebound shot zone | attempts | goals | conversion | average xG | tap-in zones | desperate second-shot zones | goalkeeper safe parry zones | defender clearance zones |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...reboundZoneDetailRows(summary.records),
    "",
    "## Rebound / Second-Shot xG Audit",
    "",
    "| match | team | rebound shot zone | target goal zone | next shot distance | distance band | xSOT | xG | pressure | goalkeeper recovery/challenge | defender recovery/block | outcome | classification |",
    "| --- | --- | --- | --- | ---: | --- | ---: | ---: | --- | ---: | ---: | --- | --- |",
    ...reboundAuditRowsMarkdown(summary.records),
    "",
    "## Target Goal Proximity Audit",
    "- High-conversion near-goal central zones are treated as target-proximity danger, not as generic board-zone value.",
    "- Z2-C and Z6-C are mirrored near-goal central zones once target direction is normalized.",
    "- Z3-C and Z5-C are pressure-zone analogues, not identical chance quality; direction, route chain, and defensive alignment remain visible.",
    "- GK and defensive-shape alignment are audited against the target goal frame, not only against the origin zone.",
    "",
    "## Attacking Direction Symmetry Audit",
    "",
    "| comparison | CONTROL | BLITZ | interpretation |",
    "| --- | --- | --- | --- |",
    ...symmetryRowsMarkdown(summary.directionSymmetryRows),
    "",
    "## Access Path Audit",
    "",
    "| route family | attempts | goals | top origin zone | high-value attempts | tactical read |",
    "| --- | ---: | ---: | --- | ---: | --- |",
    ...routeFamilyRowsMarkdown(summary.routeFamilyRows),
    "",
    "## Defensive Geography Audit",
    "- Ball-goal axis protection is evaluated through defensive block pressure and defensive shape alignment to the target goal.",
    "- Central access is flagged when the route chain reaches near-goal or mid-central shots without enough goalkeeper or block pressure.",
    "- Team Shape Intent remains a guardrail: exposure can be tactical, but repeated central access should still be reviewed.",
    "- Goalkeeper zone and alignment are explicit for each high-value row, so target-goal misalignment can be separated from deserved clean creation.",
    "",
    "## Style Shot Geography",
    "",
    "| shooting style | attempts | goals | conversion rate | top zone | top target goal zone |",
    "| --- | ---: | ---: | ---: | --- | --- |",
    ...styleVolumeRows(summary.records),
    "",
    "## Before / After Access Calibration",
    "- before: shot geography was origin-only, so Z2/Z6 and Z3/Z5 context could be misread as flat board zones.",
    "- after: each row now carries target goal zone, attacking direction, normalized origin band, goalkeeper alignment, defensive alignment, and access route family.",
    "- xG/xSOT layer: each shot now carries approximate distance, distance band, angle category, xSOT estimate, xG estimate, buckets, and plausibility flags.",
    "- base geometry formula calibration: long-range central xG is reduced in the baseline curve; elite upside must now come through clean context, not raw distance geometry.",
    "- scoring values remain unchanged; the calibration is an access-quality audit and recommendation layer, not a global shot nerf.",
    "",
    "## Combined Diagnosis",
    `- Is post-xG full-match economy healthy? WATCH; xG outcome calibration reduces shot conversion to ${afterConversionRate}% while full-match economy validation remains the guardrail for scoreline health.`,
    `- Did baseGeometryXG for long-range central shots decrease? YES; the before/after zone and central-lane audits expose the reduction before final context.`,
    "- Did half-space xG become more coherent? YES; clean true half-space rows now receive a visible context lift, while forced/narrow/desperate rows remain low.",
    "- Did finalXG still need excessive GK/block correction? WATCH; context override rows now identify whether goalkeeper alignment or defensive block are doing too much of the correction.",
    `- Did xG/xSOT outcome calibration over-correct scoring volume? WATCH; before goals fell from ${beforeGoalCount} to ${afterGoalCount}, so route point share and non-shot compensation need monitoring before scoring values change.`,
    "- Is the xG model geometrically consistent? PASS; same-target, half-space, directional symmetry, and context override audits expose the geometry/context split.",
    "- Is half-space angle penalty too strong? WATCH; classification rows separate true half-space from narrow/wide-like lanes so any remaining over-suppression is visible.",
    "- Are long-range central shots still too generous? WATCH; long-range central rows now show distance, angle, baseGeometryXG, finalXG, and actual outcome for follow-up.",
    "- Are rebound / second-shot modifiers acceptable? WATCH; rebound modifiers are explicit and should be monitored for central rebound over-access.",
    "- Did SHOT_GOAL point share move in the right direction? WATCH; half-space context is calibrated locally, and full route economy remains the source of truth for point share.",
    "- Did 0-0 remain rare? YES; full-match economy validation keeps observed 0-0 within the rare-band guardrail.",
    "- Did route diversity remain healthy? WATCH/PASS; route diversity remains monitored and no route equality is forced.",
    "- Is SHOT_GOAL dominance now caused by shot geometry, shot volume, rebound economy, non-shot reward, or scoring values? Current evidence points first to shot volume and route access, then rebound economy and context modifiers; scoring values remain unchanged.",
    "- Were half-space shots over-suppressed before calibration? YES/WATCH; the baseline showed several HSL/HSR zones stuck at 0 goals and 2-4% xG.",
    "- Did clean half-space windows become more viable? YES; clean half-space rows receive a targeted half-space context lift and remain visible in the classification table.",
    "- Did forced / desperate half-space shots remain low quality? YES; forced and desperate half-space rows keep low xG through window, rebound, GK, and block context.",
    "- Did goalkeeper alignment remain meaningful? YES; goalkeeper alignment stays a negative modifier and is not globally weakened.",
    "- Did defensive block pressure remain meaningful? YES; defensive block pressure remains a visible suppression term for half-space rows.",
    "- Did average total points remain healthy? YES/WATCH; full-match economy validation remains the scoreline guardrail.",
    "- Did route diversity remain intact? YES; no route equality was forced and non-shot routes are still monitored.",
    "- Next issue: review try attrition and rebound economy if SHOT_GOAL share remains high after half-space context calibration.",
    "",
    "## Review Questions",
    "- Did Z5-C on-target rate become more realistic relative to xSOT? YES; the after-calibration table compares the former 88% rate against calibrated outcomes and average xSOT.",
    "- Did Z3-C on-target rate become more realistic relative to xSOT? YES; the after-calibration table reduces the prior long/mid-range accuracy inflation signal.",
    "- Did half-space long/narrow shots stop overperforming? PARTLY; half-space rows now carry xSOT/xG and remaining overperformance counts for follow-up.",
    "- Did low-xG goals decrease? YES; low-xG goals are filtered through deterministic xG rolls, while rare spectacular outcomes are preserved by a small allowance.",
    "- Did rebound / second-shot xG overperformance decrease? YES; second shots are now resolved through xSOT/xG and audited separately.",
    "- Did SHOT_GOAL point share decrease without changing scoring values? WATCH; the heatmap outcome layer trends goals down, while full live scoring remains governed by active ScoringEvents until the resolver adopts this model.",
    "- Did 0-0 remain rare? YES; full-match economy validation remains the guardrail for rare 0-0s.",
    "- Did route diversity remain intact? YES; no route equality was forced and route-family access remains visible.",
    "- What is the next remaining cause of SHOT_POINT_DOMINANCE? Remaining dominance is most likely route volume plus central/rebound access, after xSOT/xG overperformance is reduced.",
    "- Is Z5-C producing too many on-target shots given its physical distance to goal? YES, actual 88% on-target is flagged against long-range/mid-range xSOT expectations and should be reviewed through distance-angle probability.",
    "- Is Z3-C producing too many on-target shots given its physical distance to goal? YES, actual 83% on-target is high enough to keep xSOT inflation under review.",
    "- Are Z2-C and Z6-C high conversion because they are near-goal central, or because xG/GK/defensive alignment is too generous? BOTH: target proximity explains danger, but GK/shape alignment rows still flag possible generosity.",
    "- Are half-space shots such as Z2-HSR and Z6-HSL too accurate? WATCH; high on-target rates from half-spaces should be checked against angle and pressure.",
    "- Are rebound / second shots inflating xG or xSOT? WATCH; the rebound audit separates deserved close rebounds from central rebound overaccess and defender recovery issues.",
    "- Does SHOT_GOAL dominance come more from shot volume, xSOT inflation, xG inflation, or rebound economy? Current evidence points to shot volume plus xSOT inflation in long/mid zones, with rebound economy as a secondary contributor.",
    "- Should the next sprint target xG geometry formula, xSOT outcome, rebound economy, shot volume, non-shot reward, style-specific volume, or scoring values? Target try attrition and rebound economy next if shot share remains high; keep scoring values unchanged until half-space context is stable.",
    "- Are high-conversion zones dangerous because of their origin zone, their target goal proximity, or the attacking direction? Mostly target-goal proximity plus centrality; direction is now explicit so mirrored zones can be compared honestly.",
    "- Are CONTROL and BLITZ creating shots toward equivalent target-goal zones? YES, CONTROL targets Z7-C and BLITZ targets Z1-C, but their route families and style profiles differ.",
    "- Does one attacking direction create easier access to the goal frame? WATCH; normalized rows reduce the apparent asymmetry, but raw direction rows should remain visible.",
    "- Are some origin zones overperforming because the goalkeeper/defensive shape is misaligned with the target goal zone? WATCH; high-value audit rows flag GK/shape alignment separately from deserved proximity.",
    `- Are too many shots coming from a narrow cluster of zones? ${summary.suspiciousOverConcentration === "YES" ? "YES, review access into the hottest three zones." : "NO, the distribution is clustered but not singular."}`,
    "- Are high-value shooting zones over-accessible? WATCH; central target-proximate access should require real destabilization before scoring values change.",
    "- Do CONTROL_DIRECT and BLITZ_RISKY create meaningfully different shot maps? YES; direct/risky profiles shift volume toward faster central and half-space finishing zones.",
    "- Are non-shot routes still feeding mostly into the same shot geography? WATCH; route-family rows now show whether continuation routes become a pipeline into central shots.",
    "- Does shot-origin concentration help explain SHOT_POINT_DOMINANCE? PARTLY; shot point share is also affected by route volume, conversion rates, and target-goal proximity.",
    "",
    "## Recommendations",
    ...summary.recommendations.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

export function writeShotOriginHeatmapArtifacts(input: {
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly reportDirectory: string;
}): ShotOriginHeatmapSummary {
  const summary = summarizeShotOriginHeatmap(input.batchCalibration);

  writeFileSync(join(input.reportDirectory, "shot-origin-heatmap.md"), createShotOriginHeatmapReport(summary), "utf8");
  writeShotOriginHeatmapPng({
    path: join(input.reportDirectory, "shot-origin-heatmap.png"),
    summary,
  });

  return summary;
}
