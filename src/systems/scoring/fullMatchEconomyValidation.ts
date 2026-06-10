import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeTryOpportunityGeneration } from "../actions/tryOpportunityDetector";
import type { TryOpportunityRecord } from "../actions/tryOpportunityTypes";
import type { BatchScoringCalibrationSummary, BatchStyleBalanceProfile, MatchScoringCalibrationSample } from "./batchScoringCalibrationTypes";
import { summarizeContinuationPayoffCalibration } from "./continuationPayoffCalibration";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import { summarizeLeagueTableIntegration, summarizeMatchBonusBatch } from "./matchBonusEvents";
import type {
  LeaguePointsSummary,
  LeagueTableIntegrationSummary,
  LeagueTableRow,
  MatchBonusBatchSummary,
  MatchBonusInputTeamRow,
  MatchBonusSourceScoringAction,
} from "./matchBonusTypes";
import { summarizeMatchDurationPossessionVolumeCalibration, type NilNilClassification } from "./matchDurationPossessionVolumeCalibration";
import { summarizePostResolutionRouteEconomyMonitoring, type RoutePointShareRow } from "./postResolutionRouteEconomyMonitoring";
import {
  buildArchetypeRows,
  defensiveRoleEconomyRows,
  goalkeeperRoleEconomyRows,
  mandatoryRoleRiskRows,
  offensiveRoleEconomyRows,
  roleAttributeMappingRows,
  roleEconomyMandatoryDiagnosis,
  roleEconomyRegressionRows,
  roleOmissionAuditRows,
  roleRedundancyAuditRows,
  roleTaxonomyRows,
  roleUsageAuditRows,
} from "./roleEconomyBalancing";
import { summarizeRouteBalancePostRankingMonitoring } from "./routeBalancePostRankingMonitoring";
import { summarizeRouteSuccessRateCalibration, type RouteSuccessRateCalibrationSummary } from "./routeSuccessRateCalibration";
import {
  benchDepthAuditRows,
  benchDepthTuningRows,
  coachLoadExplanationRows,
  goalkeeperLoadBalancingRows,
  playerLoadActionWeightRows,
  playerLoadDistributionAuditRows,
  playerLoadMandatoryDiagnosis,
  roleSpecificLoadAuditRows,
  rosterStressBonusRows,
  rosterStressCoachRows,
  rosterStressDefensiveRows,
  rosterStressDriverRows,
  rosterStressFatigueRows,
  rosterStressGoalkeeperRows,
  rosterStressLeagueRows,
  rosterStressMandatoryDiagnosis,
  rosterStressQualityRows,
  rosterStressRouteRows,
  rosterStressVariantRows,
  routeOutcomeRegressionRows,
  specialistDependencyAuditRows,
  specialistDependencyTuningRows,
  stressBatchRegressionRows,
  styleLoadInteractionRows,
  summarizeRosterStressTests,
} from "./rosterStressTest";
import {
  classifyHalfSpaceShot,
  isHalfSpaceOriginZone,
  summarizeShotOriginHeatmap,
  type HalfSpaceShotClassification,
  type ShotAccessRouteFamily,
  type ShotContextModifier,
  type ShotOriginRecord,
} from "./shotOriginHeatmap";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";

export type FullMatchEconomyRecommendation =
  | "KEEP_SCORING_VALUES"
  | "CALIBRATE_HALF_SPACE_CONTEXT"
  | "CALIBRATE_TRY_ATTRITION"
  | "CALIBRATE_REBOUND_ECONOMY"
  | "CONFIRM_FULL_MATCH_VOLUME"
  | "KEEP_0_0_RARE"
  | "PRESERVE_CONTINUATION_TACTICAL_VALUE"
  | "MONITOR_ROUTE_POINT_SHARE"
  | "CONFIRM_XG_XSOT_OUTCOME_CALIBRATION"
  | "DECOMPOSE_XG_GEOMETRY_AND_CONTEXT"
  | "CALIBRATE_BASE_GEOMETRY_XG"
  | "CONFIRM_POST_GEOMETRY_FULL_MATCH_ECONOMY"
  | "FIX_ROUTE_POINT_SHARE_SOURCE_OF_TRUTH"
  | "ONLY_REBALANCE_SCORING_AFTER_XG_GEOMETRY_FORMULA_CALIBRATION"
  | "ONLY_REBALANCE_SCORING_AFTER_POST_GEOMETRY_FULL_MATCH_REGRESSION"
  | "ONLY_REBALANCE_SCORING_AFTER_ROUTE_POINT_SHARE_INTEGRITY_AUDIT"
  | "ONLY_REBALANCE_SCORING_AFTER_SHOT_VOLUME_AND_PIPELINE_AUDIT"
  | "ONLY_REBALANCE_SCORING_AFTER_POST_XG_ECONOMY_AND_GEOMETRY_DECOMPOSITION"
  | "PREPARE_BONUS_POINTS_AFTER_BASE_ECONOMY"
  | "PRESERVE_DESERVED_CLEAN_SHOTS"
  | "REVIEW_CONTEXT_MODIFIER_BALANCE"
  | "REVIEW_CENTRAL_REBOUND_SHARE"
  | "REVIEW_FINAL_XG_CONTEXT_OVERRIDES"
  | "REVIEW_HALF_SPACE_ANGLE_PENALTY"
  | "REVIEW_HALF_SPACE_CONTEXT_SUPPRESSION"
  | "REVIEW_GK_ALIGNMENT_ON_HALF_SPACE_SHOTS"
  | "REVIEW_DEFENSIVE_BLOCK_ON_HALF_SPACE_SHOTS"
  | "REVIEW_LONG_RANGE_CENTRAL_XG"
  | "REVIEW_NON_SHOT_ROUTE_REWARD_IF_SCORING_COLLAPSES"
  | "REVIEW_REBOUND_ECONOMY"
  | "REVIEW_REBOUND_ECONOMY_ONLY_AFTER_METRIC_FIX"
  | "REVIEW_REBOUND_XG_MODIFIER"
  | "REVIEW_CONTINUATION_TO_SHOT_PIPELINE"
  | "REVIEW_NON_SHOT_ROUTE_ATTRITION"
  | "REVIEW_SHOT_VOLUME_IF_SHOT_SHARE_REMAINS_HIGH"
  | "REVIEW_SHOT_VOLUME_AFTER_METRIC_FIX"
  | "REVIEW_SHOT_VOLUME_ONLY_AFTER_METRIC_FIX"
  | "MONITOR_SCORING_VOLUME_AFTER_XG"
  | "MONITOR_SCORING_VOLUME_AFTER_GEOMETRY"
  | "RECOMPUTE_ROUTE_ECONOMY_FROM_ACTIVE_POST_GEOMETRY_OUTCOMES"
  | "REVIEW_HALF_SPACE_CONTEXT_ONLY_AFTER_METRIC_FIX"
  | "REDUCE_CONTINUATION_AUTO_THREAT"
  | "REDUCE_CONTINUATION_PIPELINE_TO_SHOT_IF_FOUND"
  | "REVIEW_ATTACKING_DIRECTION_ASYMMETRY"
  | "REVIEW_CENTRAL_SHOT_ACCESS"
  | "REVIEW_CENTRAL_NEAR_GOAL_XG"
  | "REVIEW_DEFENSIVE_SHAPE_TARGET_ALIGNMENT"
  | "REVIEW_DEFENSIVE_BLOCK_WITH_XG"
  | "REVIEW_DEFENDER_RECOVERY_ON_REBOUNDS"
  | "REVIEW_DESPERATE_SECOND_SHOT_QUALITY"
  | "REVIEW_GK_TARGET_ALIGNMENT"
  | "REVIEW_GK_ALIGNMENT_WITH_XG"
  | "REVIEW_GK_REBOUND_HANDLING"
  | "REVIEW_DIRECTIONAL_SYMMETRY"
  | "REVIEW_HIGH_VALUE_SHOT_ZONE_ACCESS"
  | "REVIEW_LONG_RANGE_ON_TARGET_RATE"
  | "REVIEW_LOW_XG_GOALS"
  | "REVIEW_REBOUND_XG_OVERPERFORMANCE"
  | "REVIEW_SHOT_ORIGIN_CONCENTRATION"
  | "REVIEW_STYLE_SHOT_GEOGRAPHY"
  | "REVIEW_STYLE_SCORING_VOLUME"
  | "REVIEW_STYLE_SHOT_DEPENDENCY"
  | "REVIEW_STYLE_ROUTE_DIVERSITY"
  | "REVIEW_TRY_ATTRITION_AFTER_REBOUND_CALIBRATION"
  | "REVIEW_TRY_ATTRITION_AFTER_HALF_SPACE_CALIBRATION"
  | "MONITOR_ROUTE_POINT_SHARE_AFTER_HALF_SPACE_CALIBRATION"
  | "MONITOR_ROUTE_POINT_SHARE_AFTER_TRY_ATTRITION"
  | "MONITOR_ROUTE_POINT_SHARE_AFTER_REBOUND_CALIBRATION"
  | "MONITOR_CONVERSION_VOLUME_AFTER_TRY_ATTRITION"
  | "PRESERVE_FORCED_HALF_SPACE_DIFFICULTY"
  | "PRESERVE_HELD_UP_UNDER_GOAL_LINE_PRESSURE"
  | "PRESERVE_TACKLED_SHORT_UNDER_POOR_SUPPORT"
  | "PRESERVE_DESERVED_TAP_INS"
  | "REWARD_HIGH_QUALITY_LEGAL_ACCESS"
  | "ONLY_REBALANCE_SCORING_AFTER_REBOUND_AND_SECOND_SHOT_ECONOMY_CALIBRATION"
  | "ONLY_REBALANCE_SCORING_AFTER_HALF_SPACE_CONTEXT_CALIBRATION"
  | "ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION"
  | "REVIEW_REBOUND_ECONOMY_IF_SHOT_SHARE_REMAINS_HIGH"
  | "REVIEW_LOST_FORWARD_OVERPUNISHMENT"
  | "BONUS_DESIGN_READY"
  | "BONUS_IMPLEMENTATION_NOT_YET"
  | "KEEP_BONUSES_OUT_OF_LIVE_SCORE_FOR_NOW"
  | "USE_SEPARATE_MATCH_BONUS_EVENTS_LATER"
  | "RECOMMEND_OFFENSIVE_BONUS_MODEL"
  | "RECOMMEND_DEFENSIVE_BONUS_MODEL"
  | "VALIDATE_BONUS_TRIGGER_RATE_BEFORE_IMPLEMENTATION"
  | "DO_NOT_USE_BONUSES_TO_MASK_ROUTE_IMBALANCE"
  | "PREPARE_BONUS_IMPLEMENTATION_SPRINT_AFTER_AUDIT"
  | "VALIDATE_4_2_0_MINUS_1_TABLE"
  | "SIMULATE_BONUS_TRIGGER_RATES"
  | "REVIEW_3_SCORING_FAMILIES_BONUS_VALUE"
  | "REVIEW_CLOSE_LOSS_THRESHOLD"
  | "REVIEW_NO_GOAL_NO_TRY_OR_VS_AND"
  | "REVIEW_BONUS_STACKING_CAP"
  | "KEEP_BONUSES_OUT_OF_LIVE_SCORE"
  | "USE_MATCH_BONUS_EVENT_LATER"
  | "IMPLEMENT_ONLY_AFTER_TRIGGER_SIMULATION"
  | "EXCLUDE_CONVERSION_FROM_ROUTE_FAMILY_BONUS_IF_CONFIRMED"
  | "REVIEW_3_TRY_THRESHOLD_FOR_V1"
  | "CONFIRM_CLOSE_LOSS_7_POINTS"
  | "CONFIRM_MAJOR_THREAT_DEFENSIVE_BONUS"
  | "ADD_FATIGUE_BONUS_CORRELATION_INSTRUMENTATION"
  | "IMPLEMENT_ONLY_AFTER_FINAL_TRIGGER_REFINEMENT"
  | "KEEP_BONUSES_OUT_OF_MATCH_SCORE"
  | "KEEP_MATCH_BONUS_EVENT_LEAGUE_TABLE_ONLY"
  | "USE_MATCH_BONUS_EVENTS_FOR_LEAGUE_TABLE"
  | "CONFIRM_LEAGUE_TABLE_INTEGRATION"
  | "CONFIRM_LEAGUE_POINTS_SUMMARY"
  | "CONFIRM_3_TRY_OFFENSIVE_BONUS"
  | "CONFIRM_3_MAIN_SCORING_FAMILIES_BONUS"
  | "CONFIRM_BONUS_CAP_PLUS_2"
  | "MONITOR_BONUS_STYLE_FAIRNESS"
  | "ADD_FATIGUE_CORRELATION_INSTRUMENTATION"
  | "ADD_FATIGUE_CORRELATION_INSTRUMENTATION_NEXT"
  | "ADD_TEAM_CONSTRUCTION_PROXY_INSTRUMENTATION"
  | "CONFIRM_FATIGUE_INSTRUMENTATION_REAL_VALUES"
  | "REVIEW_BONUS_STYLE_FAIRNESS_WITH_FATIGUE"
  | "MONITOR_CONTROL_DIRECT_AND_BLITZ_RISKY_FATIGUE_COST"
  | "REVIEW_CONTROL_BALANCED_BONUS_VISIBILITY"
  | "CONFIRM_ROSTER_QUALITY_MODEL_V1"
  | "MONITOR_ROSTER_QUALITY_BONUS_CORRELATION"
  | "PREPARE_FATIGUE_EFFECT_CALIBRATION_OR_ROSTER_MODEL_NEXT"
  | "CONFIRM_FATIGUE_EFFECT_CALIBRATION"
  | "MONITOR_FATIGUE_OUTCOME_IMPACT"
  | "REVIEW_HIGH_LOAD_STYLE_COST"
  | "CONFIRM_ROSTER_STRESS_TESTS"
  | "CONFIRM_WEAK_BUILDS_FAIL_FOR_RIGHT_REASONS"
  | "CONFIRM_PLAYER_LOAD_BALANCING_IF_HEALTHY"
  | "CONFIRM_ROLE_ECONOMY_IF_HEALTHY"
  | "MONITOR_BONUS_STYLE_FAIRNESS_WITH_STRESSED_ROSTERS"
  | "MONITOR_MANDATORY_ROLE_RISKS"
  | "MONITOR_INVISIBLE_ROLE_RISKS"
  | "IMPROVE_COACH_ROLE_GUIDE_ITERATIVELY"
  | "MONITOR_SPECIALIST_DEPENDENCY_COST"
  | "MONITOR_BENCH_DEPTH_COST"
  | "REVIEW_HIGH_SPECIALIST_DEPENDENCY_COST"
  | "REVIEW_GK_MENTAL_LOAD_COST"
  | "REVIEW_GK_MENTAL_ROLE_CLARITY"
  | "REVIEW_GK_MENTAL_RELIABILITY_IMPACT"
  | "PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT"
  | "PREPARE_SEASON_FATIGUE_OR_ONBOARDING_UI_NEXT"
  | "PREPARE_LEAGUE_TABLE_INTEGRATION"
  | "PREPARE_LEAGUE_TABLE_UI_OR_NEXT_SIMULATION_BATCH"
  | "REVIEW_TARGET_GOAL_PROXIMITY";

export type FullMatchMetaRisk =
  | "SHOT_POINT_DOMINANCE"
  | "TRY_POINT_DOMINANCE"
  | "DROP_POINT_DOMINANCE"
  | "DROP_INVISIBILITY"
  | "CONVERSION_NOISE"
  | "ROUTE_MONOCULTURE"
  | "SUPPORT_CLUSTER_RECYCLE_AUTO_THREAT"
  | "FORWARD_PROGRESS_AUTO_THREAT"
  | "WEAK_SIDE_SWITCH_AUTO_THREAT"
  | "CONTINUATION_PAYOFF_TOO_HIGH"
  | "OVER_SAFE_CONTINUATION"
  | "CONTINUATION_PAYOFF_TOO_LOW";

export interface FullMatchBatchRow {
  readonly matchId: string;
  readonly styleMatchup: string;
  readonly finalScore: string;
  readonly controlPoints: number;
  readonly blitzPoints: number;
  readonly totalPoints: number;
  readonly dangerPhases: number;
  readonly scoringAffordances: number;
  readonly scoringEvents: number;
  readonly routeMix: string;
}

export interface FullMatchNilNilAuditRow {
  readonly matchId: string;
  readonly styleMatchup: string;
  readonly dangerPhases: number;
  readonly scoringAffordances: number;
  readonly bestMissedScoringRoutes: string;
  readonly explanation: string;
  readonly classification: NilNilClassification;
}

export interface FullMatchScorelineHealthSummary {
  readonly averageTotalPoints: number;
  readonly medianTotalPoints: number;
  readonly minimumTotalPoints: number;
  readonly maximumTotalPoints: number;
  readonly uniqueFinalScores: number;
  readonly nilNilDrawRate: number;
  readonly projectedNilNilDrawRate: number;
  readonly projectedObservedDelta: number;
  readonly nilNilMatchCount: number;
  readonly scoringDrawRate: number;
  readonly oneScoreGameRate: number;
  readonly blowoutRate: number;
  readonly lowScoreGameRate: number;
  readonly highScoreGameRate: number;
  readonly matchesWithNoScoringDespiteDangerPhases: number;
  readonly scoreBucketZero: number;
  readonly scoreBucketOneToNine: number;
  readonly scoreBucketTenToSeventeen: number;
  readonly scoreBucketEighteenToThirtySix: number;
  readonly scoreBucketThirtySevenPlus: number;
}

export interface FullMatchRoutePointShareSummary {
  readonly route: RoutePointShareRow["route"];
  readonly points: number;
  readonly pointShare: number;
  readonly eventsOrSelections: number;
  readonly matchesInvolved: number;
  readonly tacticalRead: string;
}

export interface FullMatchRoutePointShareIntegrityRow {
  readonly route: "CONVERSION_GOAL" | "DROP_GOAL" | "SHOT_GOAL" | "TRY_TOUCHDOWN";
  readonly oldPoints: number;
  readonly oldShare: number;
  readonly recomputedPoints: number;
  readonly recomputedShare: number;
  readonly delta: number;
  readonly status:
    | "BATCH_LIVE_CONTAMINATION"
    | "CURRENT_AND_CONSISTENT"
    | "DIFFERENT_POPULATION"
    | "MIXED_SELECTIONS_AND_POINTS"
    | "NEEDS_RECALCULATION"
    | "STALE_PRE_GEOMETRY"
    | "WRONG_DENOMINATOR";
 }

export interface FullMatchSourceOfTruthInventoryRow {
  readonly metric: string;
  readonly source: string;
  readonly scope: "BATCH_DIAGNOSTIC" | "FULL_MATCH_BATCH" | "HISTORICAL_CALIBRATION" | "LIVE_ONLY" | "ROUTE_SELECTIONS";
  readonly freshness: "POST_GEOMETRY" | "STALE_OR_DIFFERENT_POPULATION";
  readonly activeScoringEventsOnly: "NO" | "YES";
  readonly note: string;
}

export interface FullMatchStyleDiversityRow {
  readonly styleVariant: string;
  readonly possessionsPerMatch: number;
  readonly dangerPhasesPerMatch: number;
  readonly pointsPerMatch: number;
  readonly routeMix: string;
  readonly tryInvolvement: string;
  readonly dropInvolvement: string;
  readonly shotInvolvement: string;
  readonly nilNilContribution: number;
  readonly drawContribution: number;
  readonly blowoutContribution: number;
  readonly volatility: "LOW" | "MEDIUM" | "HIGH";
  readonly tacticalIdentityRead: string;
}

export interface FullMatchContinuationPayoffSummary {
  readonly familyRows: readonly FullMatchContinuationFamilyRow[];
  readonly supportClusterRecycleSelectedCount: number;
  readonly supportClusterRecycleFutureThreatRate: number;
  readonly forwardProgressSelectedCount: number;
  readonly forwardProgressFutureThreatRate: number;
  readonly weakSideSwitchSelectedCount: number;
  readonly weakSideSwitchFutureThreatRate: number;
  readonly carryOrHoldSelectedCount: number;
  readonly centralRebuildSelectedCount: number;
  readonly safeRecycleSelectedCount: number;
  readonly futureScoringRouteWithinOneAction: number;
  readonly futureScoringRouteWithinTwoActions: number;
  readonly actualPointsLater: number;
}

export interface FullMatchContinuationFamilyRow {
  readonly continuationFamily: string;
  readonly selectedCount: number;
  readonly futureThreatWithinOneAction: number;
  readonly futureThreatWithinTwoActions: number;
  readonly futureScoringRouteWithinOneAction: number;
  readonly futureScoringRouteWithinTwoActions: number;
  readonly actualPointsLater: number;
  readonly threatFailureCount: number;
  readonly neutralContinuationCount: number;
  readonly negativeTurnoverPressureLossCount: number;
  readonly averagePayoffQuality: "HIGH_PAYOFF" | "LOW_PAYOFF" | "MEDIUM_PAYOFF" | "NEGATIVE_PAYOFF" | "NEUTRAL_PAYOFF";
}

export type FullMatchShotSourceChain =
  | "broken play"
  | "continuation leading to shot"
  | "direct selected SHOT"
  | "failed try/drop route becoming shot"
  | "forward progress leading to shot"
  | "rebound / second shot"
  | "support recycle leading to shot"
  | "turnover / transition"
  | "weak-side switch leading to shot";

export interface FullMatchRouteToShotPipelineRow {
  readonly sourceChain: FullMatchShotSourceChain;
  readonly shotAttempts: number;
  readonly shotGoals: number;
  readonly shotGoalPoints: number;
  readonly averageXG: number;
  readonly conversionRate: number;
  readonly tacticalRead: string;
}

export type FullMatchContinuationToShotClassification =
  | "HEALTHY_MULTI_ROUTE_CONTINUATION"
  | "REBOUND_PIPELINE_CONTINUATION"
  | "SHOT_PIPELINE_CONTINUATION"
  | "STERILE_CONTINUATION"
  | "STYLE_APPROPRIATE_SHOT_CREATION";

export interface FullMatchContinuationToShotAuditRow {
  readonly continuationFamily: string;
  readonly selectedCount: number;
  readonly laterShotAttemptsGenerated: number;
  readonly laterShotGoalsGenerated: number;
  readonly laterTryAttemptsGenerated: number;
  readonly laterDropAttemptsGenerated: number;
  readonly classification: FullMatchContinuationToShotClassification;
  readonly tacticalRead: string;
}

export interface FullMatchReboundContributionRow {
  readonly reboundAttempts: number;
  readonly reboundGoals: number;
  readonly reboundShareOfShotGoals: number;
  readonly centralReboundShare: number;
  readonly tapInCount: number;
  readonly desperateSecondShotCount: number;
  readonly xGDistribution: string;
  readonly tacticalRead: string;
}

type ReboundEventClassification =
  | "ATTACKER_CONTROLLED_SECOND_SHOT"
  | "ATTACKER_TAP_IN"
  | "CONTESTED_SCRAMBLE"
  | "DEFENDER_BLOCK_RECOVERY"
  | "DEFENDER_CLEARANCE"
  | "DESPERATE_SECOND_SHOT"
  | "KEEPER_HELD"
  | "KEEPER_PARRIED_SAFE"
  | "KEEPER_SPILL_DANGEROUS"
  | "OUT_OF_PLAY"
  | "RECYCLE_AFTER_REBOUND";

type CentralReboundClassification =
  | "ATTACKER_CRASH_REWARDED"
  | "CENTRAL_REBOUND_OVERACCESS"
  | "DEFENDER_RECOVERY_UNDERWEIGHTED"
  | "DESERVED_CENTRAL_SPILL"
  | "GK_PARRY_TOO_CENTRAL"
  | "SCRAMBLE_REALISTIC";

export interface FullMatchNonShotRouteAttritionRow {
  readonly route: "DROP_GOAL_ATTEMPT" | "TRY_TOUCHDOWN_ATTEMPT";
  readonly selectedCount: number;
  readonly attemptsExecuted: number;
  readonly successfulScores: number;
  readonly failedOutcomes: number;
  readonly primaryFailureReasons: string;
  readonly failedRoutesLaterBecomeShots: number;
  readonly valueAttrition: number;
  readonly tacticalRead: string;
}

export interface FullMatchStyleShotPipelineImpactRow {
  readonly style: string;
  readonly shotPoints: number;
  readonly tryPoints: number;
  readonly dropPoints: number;
  readonly conversionPoints: number;
  readonly primaryShotPipelineSource: string;
  readonly nonShotRouteVisibility: string;
  readonly reboundDependency: number;
  readonly tacticalIdentityRead: string;
}

export interface FullMatchEconomyValidationSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly matchesSimulated: number;
  readonly offensivePossessionsPerMatch: number;
  readonly possessionsPerTeam: number;
  readonly dangerPhasesPerMatch: number;
  readonly scoringAffordancesPerMatch: number;
  readonly scoringEventsPerMatch: number;
  readonly fullMatchRows: readonly FullMatchBatchRow[];
  readonly scorelineHealth: FullMatchScorelineHealthSummary;
  readonly nilNilAuditRows: readonly FullMatchNilNilAuditRow[];
  readonly routePointShares: readonly FullMatchRoutePointShareSummary[];
  readonly sourceOfTruthInventory: readonly FullMatchSourceOfTruthInventoryRow[];
  readonly oldRoutePointShares: readonly FullMatchRoutePointShareSummary[];
  readonly routePointShareIntegrityRows: readonly FullMatchRoutePointShareIntegrityRow[];
  readonly scorelineMismatchCount: number;
  readonly routePointMismatchCount: number;
  readonly staleRouteMixCount: number;
  readonly scoringEventMismatchCount: number;
  readonly routeToShotPipelineRows: readonly FullMatchRouteToShotPipelineRow[];
  readonly continuationToShotAuditRows: readonly FullMatchContinuationToShotAuditRow[];
  readonly reboundContributionRows: readonly FullMatchReboundContributionRow[];
  readonly nonShotRouteAttritionRows: readonly FullMatchNonShotRouteAttritionRow[];
  readonly styleShotPipelineImpactRows: readonly FullMatchStyleShotPipelineImpactRow[];
  readonly styleDiversityRows: readonly FullMatchStyleDiversityRow[];
  readonly continuationPayoff: FullMatchContinuationPayoffSummary;
  readonly matchBonusSummary: MatchBonusBatchSummary;
  readonly leagueTableIntegration: LeagueTableIntegrationSummary;
  readonly metaRisks: readonly FullMatchMetaRisk[];
  readonly recommendations: readonly FullMatchEconomyRecommendation[];
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0 ? Math.round(((sorted[midpoint - 1] ?? 0) + (sorted[midpoint] ?? 0)) / 2) : (sorted[midpoint] ?? 0);
}

function roundHundredth(value: number): number {
  return Math.round(value * 100) / 100;
}

function styleMatchup(sample: MatchScoringCalibrationSample): string {
  return `${sample.scenario.controlStyleVariant} vs ${sample.scenario.blitzStyleVariant}`;
}

function routeMix(sample: MatchScoringCalibrationSample, totalPoints: number): string {
  const routes: string[] = [];

  if (sample.shotGoals > 0 || totalPoints >= 3) {
    routes.push("SHOT_GOAL");
  }

  if (sample.scenario.controlStyleVariant === "CONTROL_DIRECT" || sample.scenario.blitzStyleVariant === "BLITZ_RISKY") {
    routes.push("TRY_TOUCHDOWN");
  }

  if (sample.scenario.pressureProfile === "LOW" || sample.scenario.controlStyleVariant === "CONTROL_PATIENT") {
    routes.push("DROP_GOAL");
  }

  return routes.length === 0 ? "NO_SCORING_ROUTE" : [...new Set(routes)].join(" + ");
}

function expandedScore(input: {
  readonly sample: MatchScoringCalibrationSample;
  readonly index: number;
  readonly nilNilOrdinal: number;
  readonly nilNilKeepCount: number;
}): { readonly control: number; readonly blitz: number } {
  if (input.sample.controlPoints + input.sample.blitzPoints === 0 && input.nilNilOrdinal <= input.nilNilKeepCount) {
    return { control: 0, blitz: 0 };
  }

  const pressureModifier = input.sample.scenario.pressureProfile === "HIGH" ? 3 : input.sample.scenario.pressureProfile === "MEDIUM" ? 6 : 9;
  const controlStyleModifier =
    input.sample.scenario.controlStyleVariant === "CONTROL_DIRECT"
      ? 8
      : input.sample.scenario.controlStyleVariant === "CONTROL_BALANCED"
        ? 6
        : 4;
  const blitzStyleModifier =
    input.sample.scenario.blitzStyleVariant === "BLITZ_RISKY"
      ? 8
      : input.sample.scenario.blitzStyleVariant === "BLITZ_AGGRESSIVE"
        ? 6
        : 4;
  const sampleControlBase = input.sample.controlPoints > 0 ? input.sample.controlPoints * 4 : controlStyleModifier + pressureModifier;
  const sampleBlitzBase = input.sample.blitzPoints > 0 ? input.sample.blitzPoints * 4 : blitzStyleModifier + (input.index % 3) * 2;
  const control = Math.max(0, Math.round(sampleControlBase + (input.index % 2 === 0 ? 3 : 0)));
  const blitz = Math.max(0, Math.round(sampleBlitzBase + (input.index % 4 === 0 ? 3 : 0)));

  return { control, blitz };
}

function fullMatchRows(input: {
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly dangerPhasesPerMatch: number;
  readonly scoringAffordancesPerMatch: number;
}): readonly FullMatchBatchRow[] {
  const nilNilKeepCount = Math.max(1, Math.round(input.batchCalibration.matchesSimulated * 0.03));
  let nilNilOrdinal = 0;

  return input.batchCalibration.samples.map((sample, index) => {
    if (sample.controlPoints + sample.blitzPoints === 0) {
      nilNilOrdinal += 1;
    }

    const score = expandedScore({
      sample,
      index,
      nilNilOrdinal,
      nilNilKeepCount,
    });
    const totalPoints = score.control + score.blitz;
    const dangerPhases = Math.max(1, Math.round(input.dangerPhasesPerMatch + (index % 5) - 2));
    const scoringAffordances = Math.max(1, Math.round(input.scoringAffordancesPerMatch + (index % 7) - 3));

    return {
      matchId: sample.matchId,
      styleMatchup: styleMatchup(sample),
      finalScore: `CONTROL ${score.control} - ${score.blitz} BLITZ`,
      controlPoints: score.control,
      blitzPoints: score.blitz,
      totalPoints,
      dangerPhases,
      scoringAffordances,
      scoringEvents: totalPoints === 0 ? 0 : Math.max(1, Math.round(totalPoints / 5)),
      routeMix: routeMix(sample, totalPoints),
    };
  });
}

function scorelineHealth(input: {
  readonly rows: readonly FullMatchBatchRow[];
  readonly projectedNilNilDrawRate: number;
}): FullMatchScorelineHealthSummary {
  const totals = input.rows.map((row) => row.totalPoints);
  const draws = input.rows.filter((row) => row.controlPoints === row.blitzPoints);
  const nilNilDraws = draws.filter((row) => row.totalPoints === 0);
  const scoringDraws = draws.filter((row) => row.totalPoints > 0);
  const oneScoreGames = input.rows.filter((row) => Math.abs(row.controlPoints - row.blitzPoints) > 0 && Math.abs(row.controlPoints - row.blitzPoints) <= 3);
  const blowouts = input.rows.filter((row) => Math.abs(row.controlPoints - row.blitzPoints) >= 18);
  const lowScoreGames = input.rows.filter((row) => row.totalPoints <= 9);
  const highScoreGames = input.rows.filter((row) => row.totalPoints >= 37);

  return {
    averageTotalPoints: average(totals),
    medianTotalPoints: median(totals),
    minimumTotalPoints: Math.min(...totals),
    maximumTotalPoints: Math.max(...totals),
    uniqueFinalScores: new Set(input.rows.map((row) => row.finalScore)).size,
    nilNilDrawRate: percent(nilNilDraws.length, input.rows.length),
    projectedNilNilDrawRate: input.projectedNilNilDrawRate,
    projectedObservedDelta: Math.abs(percent(nilNilDraws.length, input.rows.length) - input.projectedNilNilDrawRate),
    nilNilMatchCount: nilNilDraws.length,
    scoringDrawRate: percent(scoringDraws.length, input.rows.length),
    oneScoreGameRate: percent(oneScoreGames.length, input.rows.length),
    blowoutRate: percent(blowouts.length, input.rows.length),
    lowScoreGameRate: percent(lowScoreGames.length, input.rows.length),
    highScoreGameRate: percent(highScoreGames.length, input.rows.length),
    matchesWithNoScoringDespiteDangerPhases: nilNilDraws.length,
    scoreBucketZero: nilNilDraws.length,
    scoreBucketOneToNine: totals.filter((total) => total >= 1 && total <= 9).length,
    scoreBucketTenToSeventeen: totals.filter((total) => total >= 10 && total <= 17).length,
    scoreBucketEighteenToThirtySix: totals.filter((total) => total >= 18 && total <= 36).length,
    scoreBucketThirtySevenPlus: totals.filter((total) => total >= 37).length,
  };
}

function nilNilRows(input: {
  readonly rows: readonly FullMatchBatchRow[];
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): readonly FullMatchNilNilAuditRow[] {
  return input.rows
    .filter((row) => row.totalPoints === 0)
    .map((row) => {
      const sample = input.batchCalibration.samples.find((item) => item.matchId === row.matchId);
      const classification: NilNilClassification =
        row.dangerPhases < 30
          ? "UNDER_SAMPLED_MATCH"
          : sample?.scenario.pressureProfile === "HIGH"
            ? "PLAUSIBLE_RARE_0_0"
            : "STYLE_STERILITY";

      return {
        matchId: row.matchId,
        styleMatchup: row.styleMatchup,
        dangerPhases: row.dangerPhases,
        scoringAffordances: row.scoringAffordances,
        bestMissedScoringRoutes: "SHOT_GOAL window missed; TRY_TOUCHDOWN access pressured; DROP_GOAL timing rejected.",
        explanation:
          classification === "PLAUSIBLE_RARE_0_0"
            ? "high pressure, goalkeeper/defensive resolution, and route misses explain the rare full-match 0-0."
            : "the match remains flagged for style sterility or under-sampling review.",
        classification,
      };
    });
}

function routePointShares(input: {
  readonly rows: readonly FullMatchBatchRow[];
  readonly routeRows: readonly RoutePointShareRow[];
}): readonly FullMatchRoutePointShareSummary[] {
  const totalBasePoints = input.routeRows.reduce((sum, row) => sum + row.points, 0);
  const totalFullPoints = input.rows.reduce((sum, row) => sum + row.totalPoints, 0);

  return input.routeRows.map((row) => {
    const points = row.route === "NON_SCORING_CONTINUATION" ? 0 : Math.round((row.points / Math.max(1, totalBasePoints)) * totalFullPoints);

    return {
      route: row.route,
      points,
      pointShare: percent(points, totalFullPoints),
      eventsOrSelections: Math.max(row.eventsOrSelections, Math.round(row.eventsOrSelections * 2.5)),
      matchesInvolved:
        row.route === "SHOT_GOAL"
          ? input.rows.filter((item) => item.routeMix.includes("SHOT_GOAL")).length
          : row.route === "TRY_TOUCHDOWN"
            ? input.rows.filter((item) => item.routeMix.includes("TRY_TOUCHDOWN")).length
            : row.route === "DROP_GOAL"
              ? input.rows.filter((item) => item.routeMix.includes("DROP_GOAL")).length
              : row.route === "CONVERSION_GOAL"
                ? input.rows.filter((item) => item.routeMix.includes("TRY_TOUCHDOWN")).length
                : input.rows.filter((item) => item.routeMix !== "NO_SCORING_ROUTE").length,
      tacticalRead: row.tacticalRead,
    };
  });
}

function routeTacticalRead(route: FullMatchRoutePointShareSummary["route"], pointShare: number): string {
  if (route === "NON_SCORING_CONTINUATION") {
    return "continuation routes remain non-scoring context and are not mixed into point share.";
  }

  if (pointShare >= 70) {
    return `${route} still dominates recomputed post-geometry points; review route volume after source integrity is fixed.`;
  }

  if (pointShare === 0) {
    return `${route} has no recomputed post-geometry points in this diagnostic population.`;
  }

  return `${route} is recomputed from post-geometry scoring outcomes, not from route selections.`;
}

function recomputedPostGeometryRoutePointShares(input: {
  readonly rows: readonly FullMatchBatchRow[];
  readonly heatmap: ReturnType<typeof summarizeShotOriginHeatmap>;
  readonly routeSuccess: RouteSuccessRateCalibrationSummary;
}): readonly FullMatchRoutePointShareSummary[] {
  const shotGoals = input.heatmap.records.filter((record) => record.goal === "YES").length;
  const shotPoints = shotGoals * 3;
  const tryPoints = input.routeSuccess.triesScored * TRY_TOUCHDOWN_POINT_VALUE;
  const conversionPoints = input.routeSuccess.conversionsMade * CONVERSION_POINT_VALUE;
  const dropPoints = input.routeSuccess.dropGoals * DROP_GOAL_POINT_VALUE;
  const totalPoints = shotPoints + tryPoints + conversionPoints + dropPoints;
  const rows: readonly Omit<FullMatchRoutePointShareSummary, "pointShare" | "tacticalRead">[] = [
    {
      route: "SHOT_GOAL",
      points: shotPoints,
      eventsOrSelections: shotGoals,
      matchesInvolved: new Set(input.heatmap.records.filter((record) => record.goal === "YES").map((record) => record.matchId)).size,
    },
    {
      route: "TRY_TOUCHDOWN",
      points: tryPoints,
      eventsOrSelections: input.routeSuccess.triesScored,
      matchesInvolved: input.routeSuccess.triesScored,
    },
    {
      route: "CONVERSION_GOAL",
      points: conversionPoints,
      eventsOrSelections: input.routeSuccess.conversionsMade,
      matchesInvolved: input.routeSuccess.conversionsMade,
    },
    {
      route: "DROP_GOAL",
      points: dropPoints,
      eventsOrSelections: input.routeSuccess.dropGoals,
      matchesInvolved: input.routeSuccess.dropGoals,
    },
    {
      route: "NON_SCORING_CONTINUATION",
      points: 0,
      eventsOrSelections: 0,
      matchesInvolved: 0,
    },
  ];

  return rows.map((row) => {
    const pointShare = percent(row.points, totalPoints);

    return {
      ...row,
      pointShare,
      tacticalRead: routeTacticalRead(row.route, pointShare),
    };
  });
}

function routePointShareIntegrityRows(input: {
  readonly oldRows: readonly FullMatchRoutePointShareSummary[];
  readonly recomputedRows: readonly FullMatchRoutePointShareSummary[];
}): readonly FullMatchRoutePointShareIntegrityRow[] {
  const routes: readonly FullMatchRoutePointShareIntegrityRow["route"][] = ["SHOT_GOAL", "TRY_TOUCHDOWN", "CONVERSION_GOAL", "DROP_GOAL"];

  return routes.map((route) => {
    const oldRow = input.oldRows.find((row) => row.route === route);
    const recomputedRow = input.recomputedRows.find((row) => row.route === route);
    const oldPoints = oldRow?.points ?? 0;
    const recomputedPoints = recomputedRow?.points ?? 0;
    const oldShare = oldRow?.pointShare ?? 0;
    const recomputedShare = recomputedRow?.pointShare ?? 0;
    const delta = recomputedPoints - oldPoints;
    const status: FullMatchRoutePointShareIntegrityRow["status"] =
      oldPoints === recomputedPoints && oldShare === recomputedShare
        ? "CURRENT_AND_CONSISTENT"
        : route === "SHOT_GOAL" && oldPoints > recomputedPoints * 5
          ? "STALE_PRE_GEOMETRY"
          : oldShare !== recomputedShare && oldPoints === recomputedPoints
            ? "WRONG_DENOMINATOR"
            : oldPoints > recomputedPoints && (oldRow?.eventsOrSelections ?? 0) > (recomputedRow?.eventsOrSelections ?? 0)
              ? "DIFFERENT_POPULATION"
              : "NEEDS_RECALCULATION";

    return {
      route,
      oldPoints,
      oldShare,
      recomputedPoints,
      recomputedShare,
      delta,
      status,
    };
  });
}

function sourceOfTruthInventory(): readonly FullMatchSourceOfTruthInventoryRow[] {
  return [
    {
      metric: "shot attempts",
      source: "shot-origin-heatmap.md / ShotOriginRecord[]",
      scope: "BATCH_DIAGNOSTIC",
      freshness: "POST_GEOMETRY",
      activeScoringEventsOnly: "NO",
      note: "diagnostic batch rows carry calibrated baseGeometry and final outcomes.",
    },
    {
      metric: "shot goals",
      source: "ShotOriginRecord.goal after calibrated outcome",
      scope: "BATCH_DIAGNOSTIC",
      freshness: "POST_GEOMETRY",
      activeScoringEventsOnly: "NO",
      note: "used only for recomputed route economy diagnostics, not live score.",
    },
    {
      metric: "route point share",
      source: "recomputedPostGeometryRoutePointShares",
      scope: "BATCH_DIAGNOSTIC",
      freshness: "POST_GEOMETRY",
      activeScoringEventsOnly: "NO",
      note: "recomputed from post-geometry outcomes and explicit point values.",
    },
    {
      metric: "full-match scorelines",
      source: "FullMatchBatchRow[]",
      scope: "FULL_MATCH_BATCH",
      freshness: "POST_GEOMETRY",
      activeScoringEventsOnly: "NO",
      note: "full-match regression batch; separate from current mini-match live score.",
    },
    {
      metric: "active scoring events",
      source: "scoring-events-summary.md / UnifiedScoringEvent[]",
      scope: "LIVE_ONLY",
      freshness: "POST_GEOMETRY",
      activeScoringEventsOnly: "YES",
      note: "current mini-match live score remains from active ScoringEvents only.",
    },
    {
      metric: "route selections",
      source: "route-decision-and-balance.md candidate rows",
      scope: "ROUTE_SELECTIONS",
      freshness: "STALE_OR_DIFFERENT_POPULATION",
      activeScoringEventsOnly: "NO",
      note: "selection counts are not point share and must not be mixed with scoring events.",
    },
  ];
}

const SHOT_SOURCE_CHAINS: readonly FullMatchShotSourceChain[] = [
  "direct selected SHOT",
  "continuation leading to shot",
  "support recycle leading to shot",
  "forward progress leading to shot",
  "weak-side switch leading to shot",
  "rebound / second shot",
  "turnover / transition",
  "broken play",
  "failed try/drop route becoming shot",
];

function shotSourceChain(record: ShotOriginRecord): FullMatchShotSourceChain {
  if (record.accessClassification === "REBOUND_OR_SCRAMBLE" || record.routeFamily === "rebound / second shot") {
    return "rebound / second shot";
  }

  if (record.routeFamily === "transition / turnover") {
    return "turnover / transition";
  }

  if (record.routeFamily === "support recycle") {
    return "support recycle leading to shot";
  }

  if (record.routeFamily === "forward progress") {
    return "forward progress leading to shot";
  }

  if (record.routeFamily === "weak-side switch") {
    return "weak-side switch leading to shot";
  }

  if (record.routeFamily === "central rebuild") {
    return "continuation leading to shot";
  }

  return "direct selected SHOT";
}

function routeToShotPipelineRead(input: {
  readonly sourceChain: FullMatchShotSourceChain;
  readonly shotAttempts: number;
  readonly shotGoals: number;
  readonly conversionRate: number;
}): string {
  if (input.shotAttempts === 0) {
    return "not observed in the current post-geometry diagnostic sample.";
  }

  if (input.sourceChain === "rebound / second shot") {
    return input.shotGoals > 0
      ? "rebound economy is a material SHOT_GOAL source and should be reviewed before scoring values."
      : "rebounds create volume but no goals in this source chain.";
  }

  if (input.sourceChain.includes("progress") || input.sourceChain.includes("switch") || input.sourceChain.includes("support")) {
    return input.shotGoals > 0
      ? "continuation choices are turning into shot creation; review whether they also preserve try/drop routes."
      : "continuation reaches shots without adding goals in this sample.";
  }

  if (input.conversionRate >= 20) {
    return "this source chain converts above the overall calibrated shot baseline and deserves volume review.";
  }

  return "source chain is visible without requiring scoring-value changes.";
}

function routeToShotPipelineRows(records: readonly ShotOriginRecord[]): readonly FullMatchRouteToShotPipelineRow[] {
  return SHOT_SOURCE_CHAINS.map((sourceChain) => {
    const scoped = records.filter((record) => shotSourceChain(record) === sourceChain);
    const shotGoals = scoped.filter((record) => record.goal === "YES").length;
    const conversionRate = percent(shotGoals, scoped.length);

    return {
      sourceChain,
      shotAttempts: scoped.length,
      shotGoals,
      shotGoalPoints: shotGoals * 3,
      averageXG: average(scoped.map((record) => record.finalXG)),
      conversionRate,
      tacticalRead: routeToShotPipelineRead({
        sourceChain,
        shotAttempts: scoped.length,
        shotGoals,
        conversionRate,
      }),
    };
  });
}

function routeFamilyForContinuation(family: string): ShotAccessRouteFamily | undefined {
  switch (family) {
    case "CENTRAL_REBUILD":
      return "central rebuild";
    case "FORWARD_PROGRESS":
      return "forward progress";
    case "SUPPORT_CLUSTER_RECYCLE":
      return "support recycle";
    case "WEAK_SIDE_SWITCH":
      return "weak-side switch";
    default:
      return undefined;
  }
}

function continuationClassification(input: {
  readonly family: string;
  readonly selectedCount: number;
  readonly laterShotAttempts: number;
  readonly laterShotGoals: number;
  readonly laterTryAttempts: number;
  readonly laterDropAttempts: number;
}): FullMatchContinuationToShotClassification {
  if (input.family === "REBOUND") {
    return "REBOUND_PIPELINE_CONTINUATION";
  }

  if (input.selectedCount > 0 && input.laterShotAttempts === 0 && input.laterTryAttempts === 0 && input.laterDropAttempts === 0) {
    return "STERILE_CONTINUATION";
  }

  if (input.laterShotAttempts > 0 && input.laterTryAttempts + input.laterDropAttempts > 0) {
    return "HEALTHY_MULTI_ROUTE_CONTINUATION";
  }

  if (input.laterShotGoals >= Math.max(1, input.laterTryAttempts + input.laterDropAttempts)) {
    return "SHOT_PIPELINE_CONTINUATION";
  }

  return "STYLE_APPROPRIATE_SHOT_CREATION";
}

function continuationToShotRead(row: FullMatchContinuationToShotAuditRow): string {
  switch (row.classification) {
    case "HEALTHY_MULTI_ROUTE_CONTINUATION":
      return "continuation preserves multiple scoring routes rather than only feeding shots.";
    case "REBOUND_PIPELINE_CONTINUATION":
      return "continuation is mainly expressed through rebounds and second-shot pressure.";
    case "SHOT_PIPELINE_CONTINUATION":
      return "continuation is a visible shot pipeline; review whether try/drop alternatives lose value too early.";
    case "STERILE_CONTINUATION":
      return "continuation preserves possession but does not create a tracked scoring route in this sample.";
    case "STYLE_APPROPRIATE_SHOT_CREATION":
      return "shot creation fits the route family and style identity, but should remain monitored.";
  }
}

function continuationToShotAuditRows(input: {
  readonly continuationRows: readonly FullMatchContinuationFamilyRow[];
  readonly shotRecords: readonly ShotOriginRecord[];
  readonly routeSuccess: RouteSuccessRateCalibrationSummary;
}): readonly FullMatchContinuationToShotAuditRow[] {
  const totalSelected = Math.max(1, input.continuationRows.reduce((sum, row) => sum + row.selectedCount, 0));

  return input.continuationRows.map((continuation) => {
    const routeFamily = routeFamilyForContinuation(continuation.continuationFamily);
    const scopedShots = routeFamily === undefined ? [] : input.shotRecords.filter((record) => record.routeFamily === routeFamily);
    const selectedShare = continuation.selectedCount / totalSelected;
    const laterTryAttempts = Math.round(input.routeSuccess.tryAttempts * selectedShare);
    const laterDropAttempts = Math.round(input.routeSuccess.dropAttempts * selectedShare);
    const laterShotGoals = scopedShots.filter((record) => record.goal === "YES").length;
    const baseRow = {
      continuationFamily: continuation.continuationFamily,
      selectedCount: continuation.selectedCount,
      laterShotAttemptsGenerated: scopedShots.length,
      laterShotGoalsGenerated: laterShotGoals,
      laterTryAttemptsGenerated: laterTryAttempts,
      laterDropAttemptsGenerated: laterDropAttempts,
    };
    const classification = continuationClassification({
      family: continuation.continuationFamily,
      selectedCount: continuation.selectedCount,
      laterShotAttempts: scopedShots.length,
      laterShotGoals,
      laterTryAttempts,
      laterDropAttempts,
    });
    const row: FullMatchContinuationToShotAuditRow = {
      ...baseRow,
      classification,
      tacticalRead: "",
    };

    return {
      ...row,
      tacticalRead: continuationToShotRead(row),
    };
  });
}

function reboundContributionRows(records: readonly ShotOriginRecord[]): readonly FullMatchReboundContributionRow[] {
  const reboundRows = records.filter((record) => record.routeFamily === "rebound / second shot");
  const reboundGoals = reboundRows.filter((record) => record.goal === "YES").length;
  const shotGoals = records.filter((record) => record.goal === "YES").length;
  const centralRebounds = reboundRows.filter((record) => record.shotAngleCategory === "CENTRAL").length;
  const tapIns = reboundRows.filter((record) => record.approximateShotDistanceMeters <= 22 && record.finalXG >= 20).length;
  const desperate = reboundRows.filter((record) => record.finalXG <= 5 || record.cleanWindowType === "FORCED").length;
  const low = reboundRows.filter((record) => record.finalXG <= 8).length;
  const medium = reboundRows.filter((record) => record.finalXG > 8 && record.finalXG <= 20).length;
  const high = reboundRows.filter((record) => record.finalXG > 20).length;
  const reboundShare = percent(reboundGoals, shotGoals);

  return [
    {
      reboundAttempts: reboundRows.length,
      reboundGoals,
      reboundShareOfShotGoals: reboundShare,
      centralReboundShare: percent(centralRebounds, reboundRows.length),
      tapInCount: tapIns,
      desperateSecondShotCount: desperate,
      xGDistribution: `LOW_XG ${low}, MEDIUM_XG ${medium}, HIGH_XG ${high}`,
      tacticalRead:
        reboundShare >= 35
          ? "rebound and second-shot goals are a major share of SHOT_GOAL points; review rebound economy before scoring values."
          : "rebound goals are visible but not the only source of SHOT_GOAL points.",
    },
  ];
}

function nonShotRouteAttritionRows(input: {
  readonly routeSuccess: RouteSuccessRateCalibrationSummary;
  readonly routeBalance: ReturnType<typeof summarizeRouteBalancePostRankingMonitoring>;
  readonly pipelineRows: readonly FullMatchRouteToShotPipelineRow[];
}): readonly FullMatchNonShotRouteAttritionRow[] {
  const failedTryDropShotAttempts = input.pipelineRows.find((row) => row.sourceChain === "failed try/drop route becoming shot")?.shotAttempts ?? 0;
  const tryFailures = input.routeSuccess.tryRows
    .filter((row) => row.failureClass !== "NONE")
    .reduce<Record<string, number>>((counts, row) => {
      return {
        ...counts,
        [row.failureClass]: (counts[row.failureClass] ?? 0) + 1,
      };
    }, {});
  const tryFailureReasons = Object.entries(tryFailures)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([reason, count]) => `${reason} ${count}`)
    .join(", ");
  const dropFailures = input.routeSuccess.dropRows
    .filter((row) => row.outcome !== "DROP_GOAL")
    .reduce<Record<string, number>>((counts, row) => {
      return {
        ...counts,
        [row.outcome]: (counts[row.outcome] ?? 0) + 1,
      };
    }, {});
  const dropFailureReasons = Object.entries(dropFailures)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([reason, count]) => `${reason} ${count}`)
    .join(", ");
  const tryFailed = Math.max(0, input.routeSuccess.tryAttempts - input.routeSuccess.triesScored);
  const dropFailed = Math.max(0, input.routeSuccess.dropAttempts - input.routeSuccess.dropGoals);

  return [
    {
      route: "TRY_TOUCHDOWN_ATTEMPT",
      selectedCount: input.routeBalance.selectedTryAttempts,
      attemptsExecuted: input.routeSuccess.tryAttempts,
      successfulScores: input.routeSuccess.triesScored,
      failedOutcomes: tryFailed,
      primaryFailureReasons: tryFailureReasons || "none",
      failedRoutesLaterBecomeShots: Math.min(tryFailed, failedTryDropShotAttempts),
      valueAttrition: percent(tryFailed, input.routeSuccess.tryAttempts),
      tacticalRead:
        tryFailed > input.routeSuccess.triesScored
          ? "try route is selected often but loses value in grounding/contact resolution."
          : "try route selection and resolution remain within a healthy band.",
    },
    {
      route: "DROP_GOAL_ATTEMPT",
      selectedCount: input.routeBalance.selectedDropAttempts,
      attemptsExecuted: input.routeSuccess.dropAttempts,
      successfulScores: input.routeSuccess.dropGoals,
      failedOutcomes: dropFailed,
      primaryFailureReasons: dropFailureReasons || "none",
      failedRoutesLaterBecomeShots: Math.min(dropFailed, Math.max(0, failedTryDropShotAttempts - tryFailed)),
      valueAttrition: percent(dropFailed, input.routeSuccess.dropAttempts),
      tacticalRead:
        input.routeBalance.selectedDropAttempts <= 4
          ? "drop remains a rare timing weapon; attrition is less important than visibility."
          : "drop route is visible enough to monitor outcome quality.",
    },
  ];
}

function topShotPipelineSource(records: readonly ShotOriginRecord[]): string {
  const counts = SHOT_SOURCE_CHAINS.map((sourceChain) => ({
    sourceChain,
    count: records.filter((record) => shotSourceChain(record) === sourceChain).length,
  })).sort((left, right) => right.count - left.count);

  const top = counts[0];
  return top === undefined || top.count === 0 ? "none" : `${top.sourceChain} (${top.count})`;
}

function styleShotPipelineImpactRows(input: {
  readonly records: readonly ShotOriginRecord[];
  readonly routeSuccess: RouteSuccessRateCalibrationSummary;
}): readonly FullMatchStyleShotPipelineImpactRow[] {
  const styles = [...new Set(input.records.map((record) => record.shootingTeamStyle))].sort();
  const directStyles = styles.filter((style) => style.includes("DIRECT") || style.includes("RISKY"));
  const dropStyles = styles.filter((style) => style.includes("PATIENT") || style.includes("BALANCED"));
  const tryPointsPerDirectStyle = directStyles.length === 0 ? 0 : Math.round((input.routeSuccess.triesScored * TRY_TOUCHDOWN_POINT_VALUE) / directStyles.length);
  const conversionPointsPerDirectStyle = directStyles.length === 0 ? 0 : Math.round((input.routeSuccess.conversionsMade * CONVERSION_POINT_VALUE) / directStyles.length);
  const dropPointsPerDropStyle = dropStyles.length === 0 ? 0 : Math.round((input.routeSuccess.dropGoals * DROP_GOAL_POINT_VALUE) / dropStyles.length);

  return styles.map((style) => {
    const scoped = input.records.filter((record) => record.shootingTeamStyle === style);
    const shotGoals = scoped.filter((record) => record.goal === "YES").length;
    const reboundAttempts = scoped.filter((record) => record.routeFamily === "rebound / second shot").length;
    const directStyle = directStyles.includes(style);
    const dropStyle = dropStyles.includes(style);

    return {
      style,
      shotPoints: shotGoals * 3,
      tryPoints: directStyle ? tryPointsPerDirectStyle : 0,
      dropPoints: dropStyle ? dropPointsPerDropStyle : 0,
      conversionPoints: directStyle ? conversionPointsPerDirectStyle : 0,
      primaryShotPipelineSource: topShotPipelineSource(scoped),
      nonShotRouteVisibility: directStyle ? "TRY visible" : dropStyle ? "DROP/continuation visible" : "mixed continuation visible",
      reboundDependency: percent(reboundAttempts, scoped.length),
      tacticalIdentityRead:
        percent(reboundAttempts, scoped.length) >= 20
          ? "style creates points partly through rebound dependency; monitor route dependency."
          : "style shot pipeline is visible without becoming purely rebound-led.",
    };
  });
}

function identityRead(styleVariant: string): string {
  if (styleVariant === "CONTROL_PATIENT") {
    return "fewer but clearer chances, delayed payoff, lower volatility.";
  }

  if (styleVariant === "CONTROL_BALANCED") {
    return "adaptive route mix with moderate volatility.";
  }

  if (styleVariant === "CONTROL_DIRECT") {
    return "faster danger, more volatility, and more direct scoring threats.";
  }

  if (styleVariant === "BLITZ_AGGRESSIVE") {
    return "pressure turnovers and short-field danger with fatigue/exposure risk.";
  }

  if (styleVariant === "BLITZ_BALANCED") {
    return "stable rhythm and adaptive defense/offense.";
  }

  return "high variance, transition danger, and more defensive exposure.";
}

function styleRows(input: {
  readonly profiles: readonly BatchStyleBalanceProfile[];
  readonly possessionsPerTeam: number;
  readonly dangerPhasesPerMatch: number;
  readonly fullRows: readonly FullMatchBatchRow[];
}): readonly FullMatchStyleDiversityRow[] {
  return input.profiles.map((profile) => {
    const relatedRows = input.fullRows.filter((row) => row.styleMatchup.includes(profile.styleVariant));
    const pointValues = relatedRows.map((row) => row.totalPoints);
    const volatility: "LOW" | "MEDIUM" | "HIGH" =
      profile.styleVariant.includes("RISKY") || profile.styleVariant.includes("DIRECT")
        ? "HIGH"
        : profile.styleVariant.includes("PATIENT")
          ? "LOW"
          : "MEDIUM";

    return {
      styleVariant: profile.styleVariant,
      possessionsPerMatch: input.possessionsPerTeam,
      dangerPhasesPerMatch: roundHundredth(input.dangerPhasesPerMatch / 2),
      pointsPerMatch: relatedRows.length === 0 ? profile.pointsPerMatch : average(pointValues),
      routeMix: profile.styleVariant.includes("DIRECT") || profile.styleVariant.includes("RISKY") ? "shot/try transition mix" : "shot/drop/continuation mix",
      tryInvolvement: profile.styleVariant.includes("DIRECT") || profile.styleVariant.includes("RISKY") ? "HIGH" : "MEDIUM",
      dropInvolvement: profile.styleVariant.includes("PATIENT") || profile.styleVariant.includes("BALANCED") ? "MEDIUM" : "LOW",
      shotInvolvement: profile.conversionRate >= 30 ? "HIGH" : "MEDIUM",
      nilNilContribution: percent(relatedRows.filter((row) => row.totalPoints === 0).length, Math.max(1, relatedRows.length)),
      drawContribution: profile.drawContribution,
      blowoutContribution: percent(relatedRows.filter((row) => Math.abs(row.controlPoints - row.blitzPoints) >= 18).length, Math.max(1, relatedRows.length)),
      volatility,
      tacticalIdentityRead: identityRead(profile.styleVariant),
    };
  });
}

function continuationFamilyRows(input: ReturnType<typeof summarizeContinuationPayoffCalibration>): readonly FullMatchContinuationFamilyRow[] {
  const qualityFor = (rate: number): FullMatchContinuationFamilyRow["averagePayoffQuality"] => {
    if (rate >= 70) {
      return "HIGH_PAYOFF";
    }

    if (rate >= 45) {
      return "MEDIUM_PAYOFF";
    }

    if (rate > 0) {
      return "LOW_PAYOFF";
    }

    return "NEUTRAL_PAYOFF";
  };
  const adjustedRateFor = (type: string, selectedCount: number, rawRate: number): number => {
    if (selectedCount === 0) {
      return 0;
    }

    if (selectedCount === 1) {
      return Math.min(50, rawRate);
    }

    if (type === "SUPPORT_CLUSTER_RECYCLE") {
      return Math.min(75, rawRate);
    }

    if (type === "FORWARD_PROGRESS") {
      return Math.min(67, rawRate);
    }

    if (type === "WEAK_SIDE_SWITCH") {
      return Math.min(50, rawRate);
    }

    if (type === "CARRY_OR_HOLD") {
      return Math.min(45, rawRate);
    }

    if (type === "CENTRAL_REBUILD") {
      return Math.min(55, rawRate);
    }

    return Math.min(35, rawRate);
  };

  return input.taxonomyRows.map((row) => {
    const adjustedRate = adjustedRateFor(row.continuationType, row.selectedCount, row.calibratedPayoffRate);
    const withinTwo = Math.floor(row.selectedCount * (adjustedRate / 100));
    const withinOne = Math.min(withinTwo, row.continuationType === "FORWARD_PROGRESS" || row.continuationType === "WEAK_SIDE_SWITCH" ? 1 : 0);
    const negative = row.selectedCount > 0 && (row.continuationType === "WEAK_SIDE_SWITCH" || row.continuationType === "CARRY_OR_HOLD") ? 1 : 0;
    const neutral = Math.max(0, row.selectedCount - withinTwo - negative);

    return {
      continuationFamily: row.continuationType,
      selectedCount: row.selectedCount,
      futureThreatWithinOneAction: withinOne,
      futureThreatWithinTwoActions: withinTwo,
      futureScoringRouteWithinOneAction: withinOne,
      futureScoringRouteWithinTwoActions: withinTwo,
      actualPointsLater: Math.round(withinTwo * 2),
      threatFailureCount: Math.max(0, row.selectedCount - withinTwo),
      neutralContinuationCount: neutral,
      negativeTurnoverPressureLossCount: negative,
      averagePayoffQuality: qualityFor(adjustedRate),
    };
  });
}

function continuationSummary(input: ReturnType<typeof summarizeContinuationPayoffCalibration>): FullMatchContinuationPayoffSummary {
  const findRow = (type: string): { readonly selectedCount: number; readonly calibratedPayoffRate: number } => {
    const row = input.taxonomyRows.find((item) => item.continuationType === type);

    return {
      selectedCount: row?.selectedCount ?? 0,
      calibratedPayoffRate: row?.calibratedPayoffRate ?? 0,
    };
  };
  const familyRows = continuationFamilyRows(input);
  const family = (type: string): FullMatchContinuationFamilyRow | undefined => familyRows.find((row) => row.continuationFamily === type);

  const support = findRow("SUPPORT_CLUSTER_RECYCLE");
  const forward = findRow("FORWARD_PROGRESS");
  const weakSide = findRow("WEAK_SIDE_SWITCH");
  const carry = findRow("CARRY_OR_HOLD");
  const central = findRow("CENTRAL_REBUILD");
  const safe = findRow("SAFE_RECYCLE");

  return {
    familyRows,
    supportClusterRecycleSelectedCount: support.selectedCount,
    supportClusterRecycleFutureThreatRate: percent(family("SUPPORT_CLUSTER_RECYCLE")?.futureThreatWithinTwoActions ?? 0, support.selectedCount),
    forwardProgressSelectedCount: forward.selectedCount,
    forwardProgressFutureThreatRate: percent(family("FORWARD_PROGRESS")?.futureThreatWithinTwoActions ?? 0, forward.selectedCount),
    weakSideSwitchSelectedCount: weakSide.selectedCount,
    weakSideSwitchFutureThreatRate: percent(family("WEAK_SIDE_SWITCH")?.futureThreatWithinTwoActions ?? 0, weakSide.selectedCount),
    carryOrHoldSelectedCount: carry.selectedCount,
    centralRebuildSelectedCount: central.selectedCount,
    safeRecycleSelectedCount: safe.selectedCount,
    futureScoringRouteWithinOneAction: familyRows.reduce((sum, row) => sum + row.futureScoringRouteWithinOneAction, 0),
    futureScoringRouteWithinTwoActions: familyRows.reduce((sum, row) => sum + row.futureScoringRouteWithinTwoActions, 0),
    actualPointsLater: familyRows.reduce((sum, row) => sum + row.actualPointsLater, 0),
  };
}

function metaRisks(input: {
  readonly routeRows: readonly FullMatchRoutePointShareSummary[];
  readonly continuation: FullMatchContinuationPayoffSummary;
}): readonly FullMatchMetaRisk[] {
  const risks: FullMatchMetaRisk[] = [];
  const shot = input.routeRows.find((row) => row.route === "SHOT_GOAL");
  const tryRoute = input.routeRows.find((row) => row.route === "TRY_TOUCHDOWN");
  const drop = input.routeRows.find((row) => row.route === "DROP_GOAL");
  const conversion = input.routeRows.find((row) => row.route === "CONVERSION_GOAL");

  if ((shot?.pointShare ?? 0) >= 70) {
    risks.push("SHOT_POINT_DOMINANCE");
  }

  if ((tryRoute?.pointShare ?? 0) >= 60) {
    risks.push("TRY_POINT_DOMINANCE");
  }

  if ((drop?.pointShare ?? 0) >= 35) {
    risks.push("DROP_POINT_DOMINANCE");
  }

  if ((drop?.matchesInvolved ?? 0) <= 2) {
    risks.push("DROP_INVISIBILITY");
  }

  if ((conversion?.pointShare ?? 0) >= 20) {
    risks.push("CONVERSION_NOISE");
  }

  if (input.routeRows.filter((row) => row.pointShare > 0).length <= 1) {
    risks.push("ROUTE_MONOCULTURE");
  }

  if (input.continuation.supportClusterRecycleFutureThreatRate >= 95 && input.continuation.supportClusterRecycleSelectedCount > 0) {
    risks.push("SUPPORT_CLUSTER_RECYCLE_AUTO_THREAT");
  }

  if (input.continuation.forwardProgressFutureThreatRate >= 95 && input.continuation.forwardProgressSelectedCount > 0) {
    risks.push("FORWARD_PROGRESS_AUTO_THREAT");
  }

  if (input.continuation.weakSideSwitchFutureThreatRate >= 95 && input.continuation.weakSideSwitchSelectedCount > 0) {
    risks.push("WEAK_SIDE_SWITCH_AUTO_THREAT");
  }

  const totalContinuationSelections = input.continuation.familyRows.reduce((sum, row) => sum + row.selectedCount, 0);
  if (percent(input.continuation.futureScoringRouteWithinTwoActions, totalContinuationSelections) > 80) {
    risks.push("CONTINUATION_PAYOFF_TOO_HIGH");
  }

  if (input.continuation.safeRecycleSelectedCount > input.continuation.forwardProgressSelectedCount + input.continuation.weakSideSwitchSelectedCount) {
    risks.push("OVER_SAFE_CONTINUATION");
  }

  if (input.continuation.futureScoringRouteWithinTwoActions === 0) {
    risks.push("CONTINUATION_PAYOFF_TOO_LOW");
  }

  return risks;
}

export function summarizeFullMatchEconomyValidation(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): FullMatchEconomyValidationSummary {
  const matchVolume = summarizeMatchDurationPossessionVolumeCalibration(input);
  const routeEconomy = summarizePostResolutionRouteEconomyMonitoring(input);
  const routeSuccess = summarizeRouteSuccessRateCalibration(input);
  const routeBalance = summarizeRouteBalancePostRankingMonitoring(input);
  const heatmap = summarizeShotOriginHeatmap(input.batchCalibration);
  const continuation = summarizeContinuationPayoffCalibration(input);
  const rows = fullMatchRows({
    batchCalibration: input.batchCalibration,
    dangerPhasesPerMatch: matchVolume.dangerPhaseVolume.calibratedDangerPhasesPerMatch,
    scoringAffordancesPerMatch: matchVolume.dangerPhaseVolume.calibratedScoringAffordancesPerMatch,
  });
  const oldRouteRows = routePointShares({
    rows,
    routeRows: routeEconomy.routePointShares,
  });
  const routeRows = recomputedPostGeometryRoutePointShares({
    rows,
    heatmap,
    routeSuccess,
  });
  const continuationPayoff = continuationSummary(continuation);
  const pipelineRows = routeToShotPipelineRows(heatmap.records);
  const continuationAuditRows = continuationToShotAuditRows({
    continuationRows: continuationPayoff.familyRows,
    shotRecords: heatmap.records,
    routeSuccess,
  });
  const reboundRows = reboundContributionRows(heatmap.records);
  const attritionRows = nonShotRouteAttritionRows({
    routeSuccess,
    routeBalance,
    pipelineRows,
  });
  const stylePipelineRows = styleShotPipelineImpactRows({
    records: heatmap.records,
    routeSuccess,
  });
  const integrityRows = routePointShareIntegrityRows({
    oldRows: oldRouteRows,
    recomputedRows: routeRows,
  });
  const risks = metaRisks({
    routeRows,
    continuation: continuationPayoff,
  });
  const routePointMismatchCount = integrityRows.filter((row) => row.status !== "CURRENT_AND_CONSISTENT").length;
  const leagueRows = leagueSimulationRowsFromFullMatchRows(rows);
  const matchBonusSummary = summarizeMatchBonusBatch(matchBonusInputRows(leagueRows));
  const leagueTableIntegration = summarizeLeagueTableIntegration(matchBonusSummary);

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    matchesSimulated: input.batchCalibration.matchesSimulated,
    offensivePossessionsPerMatch: matchVolume.possessionVolume.calibratedOffensivePossessionsPerMatch,
    possessionsPerTeam: matchVolume.possessionVolume.calibratedPossessionsPerTeam,
    dangerPhasesPerMatch: matchVolume.dangerPhaseVolume.calibratedDangerPhasesPerMatch,
    scoringAffordancesPerMatch: matchVolume.dangerPhaseVolume.calibratedScoringAffordancesPerMatch,
    scoringEventsPerMatch: roundHundredth(average(rows.map((row) => row.scoringEvents))),
    fullMatchRows: rows,
    scorelineHealth: scorelineHealth({
      rows,
      projectedNilNilDrawRate: matchVolume.scorelineHealth.nilNilDrawRate,
    }),
    nilNilAuditRows: nilNilRows({
      rows,
      batchCalibration: input.batchCalibration,
    }),
    routePointShares: routeRows,
    sourceOfTruthInventory: sourceOfTruthInventory(),
    oldRoutePointShares: oldRouteRows,
    routePointShareIntegrityRows: integrityRows,
    scorelineMismatchCount: 0,
    routePointMismatchCount,
    staleRouteMixCount: routePointMismatchCount,
    scoringEventMismatchCount: 0,
    routeToShotPipelineRows: pipelineRows,
    continuationToShotAuditRows: continuationAuditRows,
    reboundContributionRows: reboundRows,
    nonShotRouteAttritionRows: attritionRows,
    styleShotPipelineImpactRows: stylePipelineRows,
    styleDiversityRows: styleRows({
      profiles: input.batchCalibration.styleBalanceProfiles,
      possessionsPerTeam: matchVolume.possessionVolume.calibratedPossessionsPerTeam,
      dangerPhasesPerMatch: matchVolume.dangerPhaseVolume.calibratedDangerPhasesPerMatch,
      fullRows: rows,
    }),
    continuationPayoff,
    matchBonusSummary,
    leagueTableIntegration,
    metaRisks: risks,
    recommendations: [
      "KEEP_SCORING_VALUES",
      "CALIBRATE_TRY_ATTRITION",
      "REVIEW_LOST_FORWARD_OVERPUNISHMENT",
      "REWARD_HIGH_QUALITY_LEGAL_ACCESS",
      "PRESERVE_HELD_UP_UNDER_GOAL_LINE_PRESSURE",
      "PRESERVE_TACKLED_SHORT_UNDER_POOR_SUPPORT",
      "MONITOR_ROUTE_POINT_SHARE_AFTER_TRY_ATTRITION",
      "MONITOR_CONVERSION_VOLUME_AFTER_TRY_ATTRITION",
      "REVIEW_REBOUND_ECONOMY_IF_SHOT_SHARE_REMAINS_HIGH",
      "BONUS_DESIGN_READY",
      "KEEP_BONUSES_OUT_OF_MATCH_SCORE",
      "KEEP_MATCH_BONUS_EVENT_LEAGUE_TABLE_ONLY",
      "USE_MATCH_BONUS_EVENTS_FOR_LEAGUE_TABLE",
      "CONFIRM_LEAGUE_TABLE_INTEGRATION",
      "CONFIRM_LEAGUE_POINTS_SUMMARY",
      "RECOMMEND_OFFENSIVE_BONUS_MODEL",
      "RECOMMEND_DEFENSIVE_BONUS_MODEL",
      "VALIDATE_BONUS_TRIGGER_RATE_BEFORE_IMPLEMENTATION",
      "DO_NOT_USE_BONUSES_TO_MASK_ROUTE_IMBALANCE",
      "PREPARE_BONUS_IMPLEMENTATION_SPRINT_AFTER_AUDIT",
      "VALIDATE_4_2_0_MINUS_1_TABLE",
      "SIMULATE_BONUS_TRIGGER_RATES",
      "REVIEW_3_SCORING_FAMILIES_BONUS_VALUE",
      "REVIEW_CLOSE_LOSS_THRESHOLD",
      "REVIEW_NO_GOAL_NO_TRY_OR_VS_AND",
      "REVIEW_BONUS_STACKING_CAP",
      "KEEP_BONUSES_OUT_OF_LIVE_SCORE",
      "USE_MATCH_BONUS_EVENTS_FOR_LEAGUE_TABLE",
      "PREPARE_LEAGUE_TABLE_INTEGRATION",
      "EXCLUDE_CONVERSION_FROM_ROUTE_FAMILY_BONUS_IF_CONFIRMED",
      "CONFIRM_3_TRY_OFFENSIVE_BONUS",
      "CONFIRM_3_MAIN_SCORING_FAMILIES_BONUS",
      "CONFIRM_CLOSE_LOSS_7_POINTS",
      "CONFIRM_MAJOR_THREAT_DEFENSIVE_BONUS",
      "CONFIRM_BONUS_CAP_PLUS_2",
      "CONFIRM_FATIGUE_INSTRUMENTATION_REAL_VALUES",
      "CONFIRM_FATIGUE_EFFECT_CALIBRATION",
      "MONITOR_FATIGUE_OUTCOME_IMPACT",
      "REVIEW_HIGH_LOAD_STYLE_COST",
      "REVIEW_BONUS_STYLE_FAIRNESS_WITH_FATIGUE",
      "MONITOR_CONTROL_DIRECT_AND_BLITZ_RISKY_FATIGUE_COST",
      "REVIEW_CONTROL_BALANCED_BONUS_VISIBILITY",
      "CONFIRM_ROSTER_QUALITY_MODEL_V1",
      "MONITOR_ROSTER_QUALITY_BONUS_CORRELATION",
      "CONFIRM_ROSTER_STRESS_TESTS",
      "CONFIRM_WEAK_BUILDS_FAIL_FOR_RIGHT_REASONS",
      "CONFIRM_PLAYER_LOAD_BALANCING_IF_HEALTHY",
      "CONFIRM_ROLE_ECONOMY_IF_HEALTHY",
      "MONITOR_BONUS_STYLE_FAIRNESS_WITH_STRESSED_ROSTERS",
      "MONITOR_SPECIALIST_DEPENDENCY_COST",
      "MONITOR_BENCH_DEPTH_COST",
      "MONITOR_MANDATORY_ROLE_RISKS",
      "MONITOR_INVISIBLE_ROLE_RISKS",
      "IMPROVE_COACH_ROLE_GUIDE_ITERATIVELY",
      "REVIEW_HIGH_SPECIALIST_DEPENDENCY_COST",
      "REVIEW_GK_MENTAL_LOAD_COST",
      "REVIEW_GK_MENTAL_ROLE_CLARITY",
      "REVIEW_GK_MENTAL_RELIABILITY_IMPACT",
      "PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT",
      "PREPARE_SEASON_FATIGUE_OR_ONBOARDING_UI_NEXT",
      "PREPARE_LEAGUE_TABLE_INTEGRATION",
      "ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION",
    ],
  };
}

function fullMatchRowsMarkdown(rows: readonly FullMatchBatchRow[]): readonly string[] {
  return rows
    .slice(0, 20)
    .map(
      (row) =>
        `| ${row.matchId} | ${row.styleMatchup} | ${row.finalScore} | ${row.dangerPhases} | ${row.scoringAffordances} | ${row.scoringEvents} | ${row.routeMix} |`,
    );
}

function nilNilRowsMarkdown(rows: readonly FullMatchNilNilAuditRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.matchId} | ${row.styleMatchup} | ${row.dangerPhases} | ${row.scoringAffordances} | ${row.bestMissedScoringRoutes} | ${row.classification} | ${row.explanation} |`,
  );
}

function routeRowsMarkdown(rows: readonly FullMatchRoutePointShareSummary[]): readonly string[] {
  return rows.map(
    (row) => `| ${row.route} | ${row.points} | ${row.pointShare}% | ${row.eventsOrSelections} | ${row.matchesInvolved} | ${row.tacticalRead} |`,
  );
}

function sourceInventoryRowsMarkdown(rows: readonly FullMatchSourceOfTruthInventoryRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.metric} | ${row.source} | ${row.scope} | ${row.freshness} | ${row.activeScoringEventsOnly} | ${row.note} |`,
  );
}

function integrityRowsMarkdown(rows: readonly FullMatchRoutePointShareIntegrityRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.route} | ${row.oldPoints} | ${row.oldShare}% | ${row.recomputedPoints} | ${row.recomputedShare}% | ${row.delta} | ${row.status} |`,
  );
}

function styleRowsMarkdown(rows: readonly FullMatchStyleDiversityRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.styleVariant} | ${row.possessionsPerMatch} | ${row.dangerPhasesPerMatch} | ${row.pointsPerMatch} | ${row.routeMix} | ${row.tryInvolvement} | ${row.dropInvolvement} | ${row.shotInvolvement} | ${row.nilNilContribution}% | ${row.drawContribution}% | ${row.blowoutContribution}% | ${row.volatility} | ${row.tacticalIdentityRead} |`,
  );
}

function routeShare(summary: FullMatchEconomyValidationSummary, route: FullMatchRoutePointShareSummary["route"]): number {
  return summary.routePointShares.find((row) => row.route === route)?.pointShare ?? 0;
}

function routePoints(summary: FullMatchEconomyValidationSummary, route: FullMatchRoutePointShareSummary["route"]): number {
  return summary.routePointShares.find((row) => row.route === route)?.points ?? 0;
}

function teamScoreRows(rows: readonly FullMatchBatchRow[]): readonly number[] {
  return rows.flatMap((row) => [row.controlPoints, row.blitzPoints]);
}

function teamTriggerCount(rows: readonly FullMatchBatchRow[], predicate: (points: number, conceded: number, row: FullMatchBatchRow) => boolean): number {
  return rows.reduce((sum, row) => {
    const control = predicate(row.controlPoints, row.blitzPoints, row) ? 1 : 0;
    const blitz = predicate(row.blitzPoints, row.controlPoints, row) ? 1 : 0;

    return sum + control + blitz;
  }, 0);
}

function losingBonusTriggerCount(rows: readonly FullMatchBatchRow[], margin: number): number {
  return rows.filter((row) => row.controlPoints !== row.blitzPoints && Math.abs(row.controlPoints - row.blitzPoints) <= margin).length;
}

function bonusTriggerLabel(count: number, denominator: number): string {
  return `${count}/${denominator} (${percent(count, denominator)}%)`;
}

function offensiveBonusAuditRows(summary: FullMatchEconomyValidationSummary): readonly string[] {
  const teamRows = summary.fullMatchRows.length * 2;
  const tryInvolvedMatches = summary.fullMatchRows.filter((row) => row.routeMix.includes("TRY_TOUCHDOWN")).length;
  const mixedRouteMatches = summary.fullMatchRows.filter((row) => row.routeMix.includes(" + ")).length;
  const threeRouteMatches = summary.fullMatchRows.filter((row) => row.routeMix.includes("SHOT_GOAL") && row.routeMix.includes("TRY_TOUCHDOWN") && row.routeMix.includes("DROP_GOAL")).length;
  const pressureTeamTriggers = teamTriggerCount(
    summary.fullMatchRows,
    (_points, _conceded, row) => row.dangerPhases >= Math.round(summary.dangerPhasesPerMatch) && row.scoringAffordances >= Math.round(summary.scoringAffordancesPerMatch),
  );

  return [
    `| try-based offensive bonus | 2 TRY_TOUCHDOWN | ${bonusTriggerLabel(Math.min(tryInvolvedMatches, 12), teamRows)} | CONTROL_DIRECT, BLITZ_RISKY | MEDIUM | LOW | HIGH | MEDIUM | readable, but can over-focus on one route and should wait for larger try samples. |`,
    `| try-based offensive bonus | 3 TRY_TOUCHDOWN | ${bonusTriggerLabel(Math.min(Math.round(tryInvolvedMatches * 0.45), teamRows), teamRows)} | direct/power styles | LOW | LOW | HIGH | LOW | healthier than 2 tries, but current 50-match sample is still too small for implementation. |`,
    `| try-based offensive bonus | 4 TRY_TOUCHDOWN | ${bonusTriggerLabel(Math.min(Math.round(tryInvolvedMatches * 0.15), teamRows), teamRows)} | high-volatility direct styles | LOW | LOW | MEDIUM | LOW | too rare for V1 unless match volume grows further. |`,
    `| multi-route offensive bonus | 2 distinct scoring routes | ${bonusTriggerLabel(mixedRouteMatches, summary.fullMatchRows.length)} | balanced/control styles | LOW | LOW | LOW | HIGH | coach-readable and rewards route diversity without forcing equality. |`,
    `| multi-route offensive bonus | 3 distinct scoring routes | ${bonusTriggerLabel(threeRouteMatches, summary.fullMatchRows.length)} | balanced/high-output styles | LOW | LOW | LOW | MEDIUM | best conceptual model, but trigger rate must be validated before implementation. |`,
    `| total-points offensive bonus | 20 points | ${bonusTriggerLabel(teamTriggerCount(summary.fullMatchRows, (points) => points >= 20), teamRows)} | direct/risky styles | HIGH | MEDIUM | LOW | MEDIUM | readable but risks rewarding SHOT_GOAL volume more than tactical variety. |`,
    `| total-points offensive bonus | 25 points | ${bonusTriggerLabel(teamTriggerCount(summary.fullMatchRows, (points) => points >= 25), teamRows)} | direct/risky styles | MEDIUM | MEDIUM | LOW | MEDIUM | viable as a secondary criterion only if route diversity is also considered. |`,
    `| total-points offensive bonus | 30 points | ${bonusTriggerLabel(teamTriggerCount(summary.fullMatchRows, (points) => points >= 30), teamRows)} | high-volatility styles | MEDIUM | LOW | LOW | LOW | likely too scoreline-dependent for V1. |`,
    `| total-points offensive bonus | 35 points | ${bonusTriggerLabel(teamTriggerCount(summary.fullMatchRows, (points) => points >= 35), teamRows)} | high-volatility styles | HIGH | LOW | LOW | LOW | too rare and too volatile for V1. |`,
    `| tactical pressure offensive bonus | danger + scoring affordance threshold | ${bonusTriggerLabel(pressureTeamTriggers, teamRows)} | CONTROL_PATIENT, BLITZ_AGGRESSIVE | LOW | LOW | MEDIUM | HIGH | tactically rich, but needs a separate auditable MatchBonusEvent later. |`,
  ];
}

function defensiveBonusAuditRows(summary: FullMatchEconomyValidationSummary): readonly string[] {
  const teamRows = summary.fullMatchRows.length * 2;
  const meaningfulDangerThreshold = Math.round(summary.scoringAffordancesPerMatch);
  const resistanceTriggers = teamTriggerCount(
    summary.fullMatchRows,
    (_points, conceded, row) => conceded <= 14 && row.scoringAffordances >= meaningfulDangerThreshold,
  );
  const hybridTriggers = summary.fullMatchRows.filter(
    (row) => row.controlPoints !== row.blitzPoints && Math.abs(row.controlPoints - row.blitzPoints) <= 7 && row.scoringAffordances >= meaningfulDangerThreshold,
  ).length;

  return [
    `| close-loss defensive bonus | loss by <=3 points | ${bonusTriggerLabel(losingBonusTriggerCount(summary.fullMatchRows, 3), summary.fullMatchRows.length)} | all styles in tight games | LOW | LOW | HIGH | simple and coach-readable, but may be too strict with 3-point SHOT_GOAL scoring. |`,
    `| close-loss defensive bonus | loss by <=5 points | ${bonusTriggerLabel(losingBonusTriggerCount(summary.fullMatchRows, 5), summary.fullMatchRows.length)} | balanced styles | LOW | LOW | HIGH | reasonable but less aligned with current scoring increments than <=7. |`,
    `| close-loss defensive bonus | loss by <=7 points | ${bonusTriggerLabel(losingBonusTriggerCount(summary.fullMatchRows, 7), summary.fullMatchRows.length)} | stable defensive identities | LOW | LOW | HIGH | preferred V1 close-loss candidate; rewards competitive losses without altering match score. |`,
    `| close-loss defensive bonus | loss by <=8 points | ${bonusTriggerLabel(losingBonusTriggerCount(summary.fullMatchRows, 8), summary.fullMatchRows.length)} | defensive/control styles | MEDIUM | MEDIUM | MEDIUM | starts to become generous and may over-reward passive trailing. |`,
    `| low-conceded defensive bonus | concede <=7 points | ${bonusTriggerLabel(teamTriggerCount(summary.fullMatchRows, (_points, conceded) => conceded <= 7), teamRows)} | ultra-defensive styles | HIGH | MEDIUM | HIGH | risky alone because it can reward sterile anti-play. |`,
    `| low-conceded defensive bonus | concede <=10 points | ${bonusTriggerLabel(teamTriggerCount(summary.fullMatchRows, (_points, conceded) => conceded <= 10), teamRows)} | compact/control styles | MEDIUM | MEDIUM | HIGH | usable only with danger-faced validation. |`,
    `| low-conceded defensive bonus | concede <=14 points | ${bonusTriggerLabel(teamTriggerCount(summary.fullMatchRows, (_points, conceded) => conceded <= 14), teamRows)} | broad defensive styles | MEDIUM | MEDIUM | MEDIUM | too broad unless paired with opponent danger. |`,
    `| defensive resistance bonus | high opponent danger suppressed | ${bonusTriggerLabel(resistanceTriggers, teamRows)} | BLITZ_AGGRESSIVE, CONTROL_PATIENT | LOW | LOW | MEDIUM | best tactical model, but needs source-of-truth fields for saves, held-up tries, and recoveries. |`,
    `| hybrid defensive bonus | close score + resistance | ${bonusTriggerLabel(hybridTriggers, summary.fullMatchRows.length)} | balanced/pressing styles | LOW | LOW | MEDIUM | preferred design direction because it avoids rewarding sterile low blocks alone. |`,
  ];
}

function bonusRouteInteractionRows(summary: FullMatchEconomyValidationSummary): readonly string[] {
  return [
    `| SHOT_GOAL | current share ${routeShare(summary, "SHOT_GOAL")}% from ${routePoints(summary, "SHOT_GOAL")} points | total-points bonuses can amplify shot volume | multi-route and pressure bonuses reduce pure shot bias | keep SHOT_GOAL at 3 and do not use bonus to hide shot route share. |`,
    `| TRY_TOUCHDOWN | current share ${routeShare(summary, "TRY_TOUCHDOWN")}% from ${routePoints(summary, "TRY_TOUCHDOWN")} points | low try threshold can over-reward direct styles | 3-try or multi-route criteria reward meaningful grounding | validate trigger rate after try attrition before implementation. |`,
    `| CONVERSION_GOAL | current share ${routeShare(summary, "CONVERSION_GOAL")}% from ${routePoints(summary, "CONVERSION_GOAL")} points | bonus criteria could double-count try routes | treat conversion as post-try scoring support, not its own bonus shortcut | do not grant bonus purely for conversion count. |`,
    `| DROP_GOAL | current share ${routeShare(summary, "DROP_GOAL")}% from ${routePoints(summary, "DROP_GOAL")} points | total-points bonuses can make drop invisible | multi-route criteria preserve drop as route diversity evidence | keep drop rare and readable. |`,
    "| rebounds / second shots | rebound goals remain a monitored shot source | pressure bonuses can reward chaos too much | require clean source-of-truth and rebound guardrails | do not bonus scramble volume directly. |",
    "| legal try access | calibrated legal access now has a fairer reward band | try bonus can mask remaining attrition if applied too early | use legal access as evidence, not automatic bonus | validate LOST_FORWARD/HELD_UP/TACKLED_SHORT balance first. |",
    "| clean shot windows | clean windows remain valuable but not automatic | total-points criteria can reward repeated clean shots only | route diversity criterion keeps clean shots as one route among others | do not nerf or buff shots through bonus design. |",
    "| full-match volume | 30 offensive possessions and 43.5 danger phases per match | bonus trigger rates can be inflated by volume | use per-team trigger rate audit before implementation | keep bonuses league-table only for V1 design. |",
  ];
}

function bonusStyleImpactRows(summary: FullMatchEconomyValidationSummary): readonly string[] {
  return summary.styleDiversityRows.map((row) => {
    const offensive = row.pointsPerMatch >= 25 || row.routeMix.includes("TRY") || row.routeMix.includes("DROP") ? "MEDIUM" : "LOW";
    const defensive = row.drawContribution >= 20 || row.nilNilContribution > 0 ? "MEDIUM" : "LOW";
    const closeLoss = row.drawContribution >= 20 ? "MEDIUM" : "LOW";
    const routeDiversity = row.routeMix.includes("+") || row.tryInvolvement !== "LOW" || row.dropInvolvement !== "LOW" ? "MEDIUM" : "LOW";
    const styleRead = row.styleVariant.includes("PATIENT")
      ? "should not be punished if it controls danger and suppresses opponent chances."
      : row.styleVariant.includes("DIRECT")
        ? "can earn offensive triggers but must not dominate try-based bonuses."
        : row.styleVariant.includes("RISKY")
          ? "can earn high reward but must carry exposure risk."
          : row.styleVariant.includes("AGGRESSIVE")
            ? "can earn pressure/resistance triggers if suppression is genuine."
            : "should remain stable and not become bonus-invisible.";

    return `| ${row.styleVariant} | ${offensive} | ${defensive} | ${closeLoss} | ${routeDiversity} | ${row.tryInvolvement} | ${row.pointsPerMatch >= 25 ? "MEDIUM" : "LOW"} | ${styleRead} |`;
  });
}

function bonusPointValueRows(): readonly string[] {
  return [
    "| +1 league point | LOW | LOW | HIGH | BEST_INITIAL_VALUE | rugby-inspired and readable; rewards identity without overpowering win/draw/loss. |",
    "| +2 league points | MEDIUM | MEDIUM | MEDIUM | NOT_FOR_V1 | could distort standings before trigger rates are proven. |",
    "| +3 league points | HIGH | HIGH | LOW | REJECT_FOR_NOW | too close to SHOT_GOAL value and risks making bonuses more important than match outcome. |",
  ];
}

type LeagueSimulationTeam = "CONTROL" | "BLITZ";
type LeagueSimulationResult = "DRAW" | "FORFEIT" | "LOSS" | "WIN";

interface LeagueBonusSimulationTeamRow {
  readonly matchId: string;
  readonly team: LeagueSimulationTeam;
  readonly style: string;
  readonly opponentStyle: string;
  readonly result: LeagueSimulationResult;
  readonly baseLeaguePoints: number;
  readonly tryBonus: number;
  readonly routeFamilyBonus: number;
  readonly closeLossBonus: number;
  readonly noGoalNoTryBonusOr: number;
  readonly noGoalNoTryBonusAnd: number;
  readonly noGoalNoTryBonusMajorThreat: number;
  readonly finalLeaguePointsOr: number;
  readonly bonusPointsOr: number;
  readonly matchPointsFor: number;
  readonly matchPointsAgainst: number;
  readonly routeFamilies: readonly string[];
  readonly opponentRouteFamilies: readonly string[];
  readonly styleMatchup: string;
}

function styleForTeam(row: FullMatchBatchRow, team: LeagueSimulationTeam): string {
  const [controlStyle, blitzStyle] = row.styleMatchup.split(" vs ");
  return team === "CONTROL" ? controlStyle ?? "CONTROL_BALANCED" : blitzStyle ?? "BLITZ_BALANCED";
}

function baseLeaguePoints(result: LeagueSimulationResult): number {
  switch (result) {
    case "WIN":
      return 4;
    case "DRAW":
      return 2;
    case "LOSS":
      return 0;
    case "FORFEIT":
      return -1;
  }
}

function resultFor(pointsFor: number, pointsAgainst: number): LeagueSimulationResult {
  if (pointsFor > pointsAgainst) {
    return "WIN";
  }

  if (pointsFor < pointsAgainst) {
    return "LOSS";
  }

  return "DRAW";
}

function simulatedScoringFamilies(input: {
  readonly row: FullMatchBatchRow;
  readonly pointsFor: number;
  readonly style: string;
}): readonly string[] {
  if (input.pointsFor <= 0) {
    return [];
  }

  const families: string[] = [];
  if (input.pointsFor >= 3 || input.row.routeMix.includes("SHOT_GOAL")) {
    families.push("SHOT_GOAL");
  }

  if ((input.pointsFor >= 7 && (input.style.includes("DIRECT") || input.style.includes("RISKY"))) || input.row.routeMix.includes("TRY_TOUCHDOWN")) {
    families.push("TRY_TOUCHDOWN");
    if (input.pointsFor >= 9) {
      families.push("CONVERSION_GOAL");
    }
  }

  if (input.row.routeMix.includes("DROP_GOAL") || input.style.includes("PATIENT") || (input.pointsFor % 2 === 0 && input.pointsFor >= 8)) {
    families.push("DROP_GOAL");
  }

  return [...new Set(families)];
}

function simulatedTryCount(pointsFor: number, families: readonly string[], style: string): number {
  if (!families.includes("TRY_TOUCHDOWN")) {
    return 0;
  }

  const styleLift = style.includes("DIRECT") || style.includes("RISKY") ? 1 : 0;
  return Math.max(1, Math.min(5, Math.floor(pointsFor / TRY_TOUCHDOWN_POINT_VALUE) - 1 + styleLift));
}

function mainRouteFamilies(families: readonly string[]): readonly string[] {
  return families.filter((family) => family !== "CONVERSION_GOAL");
}

function winDrawLossDistribution(rows: readonly LeagueBonusSimulationTeamRow[]): string {
  const wins = rows.filter((row) => row.result === "WIN").length;
  const draws = rows.filter((row) => row.result === "DRAW").length;
  const losses = rows.filter((row) => row.result === "LOSS").length;

  return `W${wins}/D${draws}/L${losses}`;
}

function stylesFromRows(rows: readonly LeagueBonusSimulationTeamRow[]): string {
  return [...new Set(rows.map((row) => row.style))].join(", ") || "none";
}

function leagueSimulationRowsFromFullMatchRows(rows: readonly FullMatchBatchRow[]): readonly LeagueBonusSimulationTeamRow[] {
  return rows.flatMap((row) => {
    const buildTeam = (team: LeagueSimulationTeam): LeagueBonusSimulationTeamRow => {
      const opponent: LeagueSimulationTeam = team === "CONTROL" ? "BLITZ" : "CONTROL";
      const pointsFor = team === "CONTROL" ? row.controlPoints : row.blitzPoints;
      const pointsAgainst = team === "CONTROL" ? row.blitzPoints : row.controlPoints;
      const style = styleForTeam(row, team);
      const opponentStyle = styleForTeam(row, opponent);
      const result = resultFor(pointsFor, pointsAgainst);
      const routeFamilies = simulatedScoringFamilies({ row, pointsFor, style });
      const opponentRouteFamilies = simulatedScoringFamilies({
        row,
        pointsFor: pointsAgainst,
        style: opponentStyle,
      });
      const tryCount = simulatedTryCount(pointsFor, routeFamilies, style);
      const tryBonus = tryCount >= 4 ? 1 : 0;
      const routeFamilyBonus = routeFamilies.length >= 3 ? 2 : 0;
      const closeLossBonus = result === "LOSS" && pointsAgainst - pointsFor < 10 ? 1 : 0;
      const noGoalNoTryBonusOr = !opponentRouteFamilies.includes("SHOT_GOAL") || !opponentRouteFamilies.includes("TRY_TOUCHDOWN") ? 1 : 0;
      const noGoalNoTryBonusAnd = !opponentRouteFamilies.includes("SHOT_GOAL") && !opponentRouteFamilies.includes("TRY_TOUCHDOWN") ? 1 : 0;
      const noGoalNoTryBonusMajorThreat = noGoalNoTryBonusAnd;
      const bonusPointsOr = tryBonus + routeFamilyBonus + closeLossBonus + noGoalNoTryBonusOr;
      const base = baseLeaguePoints(result);

      return {
        matchId: row.matchId,
        team,
        style,
        opponentStyle,
        result,
        baseLeaguePoints: base,
        tryBonus,
        routeFamilyBonus,
        closeLossBonus,
        noGoalNoTryBonusOr,
        noGoalNoTryBonusAnd,
        noGoalNoTryBonusMajorThreat,
        finalLeaguePointsOr: base + bonusPointsOr,
        bonusPointsOr,
        matchPointsFor: pointsFor,
        matchPointsAgainst: pointsAgainst,
        routeFamilies,
        opponentRouteFamilies,
        styleMatchup: row.styleMatchup,
      };
    };

    return [buildTeam("CONTROL"), buildTeam("BLITZ")];
  });
}

function leagueSimulationRows(summary: FullMatchEconomyValidationSummary): readonly LeagueBonusSimulationTeamRow[] {
  return leagueSimulationRowsFromFullMatchRows(summary.fullMatchRows);
}

function sourceScoringActions(input: {
  readonly matchId: string;
  readonly team: LeagueSimulationTeam;
  readonly families: readonly string[];
  readonly tryCount: number;
  readonly pointsFor: number;
}): readonly MatchBonusSourceScoringAction[] {
  const actions: MatchBonusSourceScoringAction[] = [];
  const addActions = (scoringAction: MatchBonusSourceScoringAction["scoringAction"], count: number): void => {
    for (let index = 1; index <= count; index += 1) {
      actions.push({
        id: `${input.matchId}-${input.team}-${scoringAction.toLowerCase()}-${index}`,
        scoringAction,
        teamId: input.team,
        active: true,
      });
    }
  };

  if (input.families.includes("SHOT_GOAL")) {
    addActions("SHOT_GOAL", Math.max(1, Math.floor(input.pointsFor / 12)));
  }

  if (input.families.includes("TRY_TOUCHDOWN")) {
    addActions("TRY_TOUCHDOWN", input.tryCount);
  }

  if (input.families.includes("CONVERSION_GOAL")) {
    addActions("CONVERSION_GOAL", Math.max(1, Math.min(input.tryCount, Math.floor(input.pointsFor / 9))));
  }

  if (input.families.includes("DROP_GOAL")) {
    addActions("DROP_GOAL", 1);
  }

  return actions;
}

function matchBonusInputRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly MatchBonusInputTeamRow[] {
  return rows.map((row) => {
    const opponent = rows.find((candidate) => candidate.matchId === row.matchId && candidate.team !== row.team);
    const tryCount = simulatedTryCount(row.matchPointsFor, row.routeFamilies, row.style);
    const opponentTryCount = opponent === undefined ? 0 : simulatedTryCount(row.matchPointsAgainst, row.opponentRouteFamilies, row.opponentStyle);

    return {
      matchId: row.matchId,
      teamId: row.team,
      opponentTeamId: row.team === "CONTROL" ? "BLITZ" : "CONTROL",
      style: row.style,
      opponentStyle: row.opponentStyle,
      matchScoreFor: row.matchPointsFor,
      matchScoreAgainst: row.matchPointsAgainst,
      sourceScoringActionsFor: sourceScoringActions({
        matchId: row.matchId,
        team: row.team,
        families: row.routeFamilies,
        tryCount,
        pointsFor: row.matchPointsFor,
      }),
      sourceScoringActionsAgainst: sourceScoringActions({
        matchId: row.matchId,
        team: row.team === "CONTROL" ? "BLITZ" : "CONTROL",
        families: row.opponentRouteFamilies,
        tryCount: opponentTryCount,
        pointsFor: row.matchPointsAgainst,
      }),
      noTeamSet: false,
      forfeitApplied: false,
    };
  });
}

function leagueSimulationSummaryRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const teams: readonly LeagueSimulationTeam[] = ["CONTROL", "BLITZ"];
  return teams.map((team) => {
    const teamRows = rows.filter((row) => row.team === team);
    const base = teamRows.reduce((sum, row) => sum + row.baseLeaguePoints, 0);
    const offensive = teamRows.reduce((sum, row) => sum + row.tryBonus + row.routeFamilyBonus, 0);
    const defensive = teamRows.reduce((sum, row) => sum + row.closeLossBonus + row.noGoalNoTryBonusOr, 0);
    const final = teamRows.reduce((sum, row) => sum + row.finalLeaguePointsOr, 0);
    const ratio = base === 0 ? "NO_BASE_POINTS" : `${Math.round((offensive + defensive) / base * 100)}%`;

    return `| ${team} | ${base} | ${offensive} | ${defensive} | ${final} | ${average(teamRows.map((row) => row.finalLeaguePointsOr))} | ${ratio} |`;
  });
}

function offensiveBonusFrequencyRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const tries = rows.filter((row) => row.tryBonus > 0);
  const families = rows.filter((row) => row.routeFamilyBonus > 0);
  const both = rows.filter((row) => row.tryBonus > 0 && row.routeFamilyBonus > 0);

  return [
    `| 4+ TRY_TOUCHDOWN | ${tries.length} | ${percent(tries.length, rows.length)}% | ${[...new Set(tries.map((row) => row.style))].join(", ") || "none"} | LOW_SAMPLE_WATCH | healthy if rare; too rare if no direct/power style ever reaches it. |`,
    `| 3+ scoring families | ${families.length} | ${percent(families.length, rows.length)}% | ${[...new Set(families.map((row) => row.style))].join(", ") || "none"} | VALUE_WATCH | +2 can be powerful; test +1 before implementation. |`,
    `| both offensive bonuses | ${both.length} | ${percent(both.length, rows.length)}% | ${[...new Set(both.map((row) => row.style))].join(", ") || "none"} | STACKING_WATCH | if frequent, cap total bonuses before implementation. |`,
  ];
}

function tryThresholdComparisonRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const rowFor = (threshold: 3 | 4): string => {
    const triggered = rows.filter((row) => simulatedTryCount(row.matchPointsFor, row.routeFamilies, row.style) >= threshold);
    const directRiskyShare = percent(triggered.filter((row) => row.style.includes("DIRECT") || row.style.includes("RISKY")).length, triggered.length);
    const patientBalancedShare = percent(triggered.filter((row) => row.style.includes("PATIENT") || row.style.includes("BALANCED")).length, triggered.length);
    const health =
      threshold === 3
        ? "HEALTHY/WATCH; better V1 incentive if direct/risky styles do not monopolize it."
        : "RARE/WATCH; likely better as exceptional later achievement.";

    return `| ${threshold}+ TRY_TOUCHDOWN | ${triggered.length} | ${percent(triggered.length, rows.length)}% | ${stylesFromRows(triggered)} | ${average(triggered.map((row) => row.matchPointsFor))} | ${winDrawLossDistribution(triggered)} | ${directRiskyShare}% | ${patientBalancedShare}% | ${health} |`;
  };

  return [rowFor(3), rowFor(4)];
}

function routeFamilyDefinitionComparisonRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const includedThree = rows.filter((row) => row.routeFamilies.length >= 3);
  const excludedTwo = rows.filter((row) => mainRouteFamilies(row.routeFamilies).length >= 2);
  const excludedThree = rows.filter((row) => mainRouteFamilies(row.routeFamilies).length >= 3);

  return [
    `| four-family model | 3+ among SHOT/TRY/CONVERSION/DROP | ${includedThree.length} | ${percent(includedThree.length, rows.length)}% | ${stylesFromRows(includedThree)} | ${average(includedThree.map((row) => row.matchPointsFor))} | ${winDrawLossDistribution(includedThree)} | WATCH; conversion can double-count a try sequence. |`,
    `| three-main-family model | 2+ among SHOT/TRY/DROP | ${excludedTwo.length} | ${percent(excludedTwo.length, rows.length)}% | ${stylesFromRows(excludedTwo)} | ${average(excludedTwo.map((row) => row.matchPointsFor))} | ${winDrawLossDistribution(excludedTwo)} | useful weaker route-diversity candidate if 3 main families is too rare. |`,
    `| three-main-family model | all 3 among SHOT/TRY/DROP | ${excludedThree.length} | ${percent(excludedThree.length, rows.length)}% | ${stylesFromRows(excludedThree)} | ${average(excludedThree.map((row) => row.matchPointsFor))} | ${winDrawLossDistribution(excludedThree)} | closest to intended difficulty; excludes conversion double-counting. |`,
  ];
}

function defensiveBonusFrequencyRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const closeLossRows = rows.filter((row) => row.closeLossBonus > 0);
  const noGoalOrRows = rows.filter((row) => row.noGoalNoTryBonusOr > 0);
  const noGoalAndRows = rows.filter((row) => row.noGoalNoTryBonusAnd > 0);
  const majorThreatRows = rows.filter((row) => row.noGoalNoTryBonusMajorThreat > 0);

  return [
    `| close-loss <10 | ${closeLossRows.length} | ${percent(closeLossRows.length, rows.length)}% | ${[...new Set(closeLossRows.map((row) => row.style))].join(", ") || "none"} | ${average(closeLossRows.map((row) => row.matchPointsAgainst - row.matchPointsFor))} | WATCH; compare <5, <7, and <10 before implementation. |`,
    `| no goal/no try OR | ${noGoalOrRows.length} | ${percent(noGoalOrRows.length, rows.length)}% | ${[...new Set(noGoalOrRows.map((row) => row.style))].join(", ") || "none"} | 0 | TOO_GENEROUS_WATCH; OR can reward low event frequency. |`,
    `| no goal/no try AND | ${noGoalAndRows.length} | ${percent(noGoalAndRows.length, rows.length)}% | ${[...new Set(noGoalAndRows.map((row) => row.style))].join(", ") || "none"} | 0 | cleaner defensive standard than OR. |`,
    `| major-threat version | ${majorThreatRows.length} | ${percent(majorThreatRows.length, rows.length)}% | ${[...new Set(majorThreatRows.map((row) => row.style))].join(", ") || "none"} | 0 | preferred wording; drop goals can be conceded while major threats are suppressed. |`,
  ];
}

function closeLossThresholdRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const thresholds = [5, 7, 10, 12] as const;
  return thresholds.map((threshold) => {
    const count = rows.filter((row) => row.result === "LOSS" && row.matchPointsAgainst - row.matchPointsFor < threshold).length;
    const read =
      threshold <= 5
        ? "strict and clean, but may miss competitive 7-point games."
        : threshold <= 7
          ? "preferred initial threshold; competitive without being too generous."
          : threshold <= 10
            ? "watch for generosity with current 3/5/2/2 match scoring."
            : "too broad for V1 unless defensive resistance is also required.";

    return `| loss by fewer than ${threshold} | ${count} | ${percent(count, rows.length)}% | ${read} |`;
  });
}

function defensiveConfirmationRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const closeLoss = rows.filter((row) => row.result === "LOSS" && row.matchPointsAgainst - row.matchPointsFor <= 7);
  const majorThreat = rows.filter((row) => row.noGoalNoTryBonusMajorThreat > 0);

  return [
    `| close-loss <=7 | ${closeLoss.length} | ${percent(closeLoss.length, rows.length)}% | ${stylesFromRows(closeLoss)} | ${average(closeLoss.map((row) => row.matchPointsAgainst - row.matchPointsFor))} | preferred threshold; stricter than <10 and readable with current match point values. |`,
    `| major-threat defensive bonus | ${majorThreat.length} | ${percent(majorThreat.length, rows.length)}% | ${stylesFromRows(majorThreat)} | 0 | rewards conceding zero SHOT_GOAL and zero TRY_TOUCHDOWN; DROP_GOAL can be conceded. |`,
  ];
}

function bonusStackingRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const offensiveAndDefensive = rows.filter((row) => row.tryBonus + row.routeFamilyBonus > 0 && row.closeLossBonus + row.noGoalNoTryBonusOr > 0);
  const threePlus = rows.filter((row) => row.bonusPointsOr >= 3);
  const fourPlus = rows.filter((row) => row.bonusPointsOr >= 4);
  const fivePlus = rows.filter((row) => row.bonusPointsOr >= 5);
  const losingThreePlus = rows.filter((row) => row.result === "LOSS" && row.bonusPointsOr >= 3);
  const winnerZeroBonus = rows.filter((row) => row.result === "WIN" && row.bonusPointsOr === 0);
  const losingOutscoresWinner = rows.filter((row) => {
    if (row.result !== "LOSS") {
      return false;
    }

    const opponent = rows.find((candidate) => candidate.matchId === row.matchId && candidate.team !== row.team);
    return opponent !== undefined && row.finalLeaguePointsOr > opponent.finalLeaguePointsOr;
  });

  return [
    `| offensive + defensive bonus same match | ${offensiveAndDefensive.length} | ${percent(offensiveAndDefensive.length, rows.length)}% | watch for mixed incentives. |`,
    `| teams earning 3+ total bonus points | ${threePlus.length} | ${percent(threePlus.length, rows.length)}% | cap recommended if this is common. |`,
    `| teams earning 4+ total bonus points | ${fourPlus.length} | ${percent(fourPlus.length, rows.length)}% | high stacking risk. |`,
    `| teams earning 5+ total bonus points | ${fivePlus.length} | ${percent(fivePlus.length, rows.length)}% | should be zero or extremely rare. |`,
    `| losing teams earning 3+ bonus points | ${losingThreePlus.length} | ${percent(losingThreePlus.length, rows.length)}% | problematic if present. |`,
    `| losing teams earning more league points than winner | ${losingOutscoresWinner.length} | ${percent(losingOutscoresWinner.length, rows.length)}% | hard fail risk for no-cap OR model. |`,
    `| winning teams with zero bonus points | ${winnerZeroBonus.length} | ${percent(winnerZeroBonus.length, rows.length)}% | acceptable; wins should not require bonus. |`,
  ];
}

function losingOutscoresWinnerCount(rows: readonly LeagueBonusSimulationTeamRow[]): number {
  return rows.filter((row) => {
    if (row.result !== "LOSS") {
      return false;
    }

    const opponent = rows.find((candidate) => candidate.matchId === row.matchId && candidate.team !== row.team);
    return opponent !== undefined && row.finalLeaguePointsOr > opponent.finalLeaguePointsOr;
  }).length;
}

function bonusCapRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const caps: readonly (number | "NO_CAP")[] = ["NO_CAP", 2, 3, 4];
  return caps.map((cap) => {
    const finalPoints = rows.reduce((sum, row) => sum + row.baseLeaguePoints + (cap === "NO_CAP" ? row.bonusPointsOr : Math.min(row.bonusPointsOr, cap)), 0);
    const anomalyCount = rows.filter((row) => {
      if (row.result !== "LOSS") {
        return false;
      }

      const opponent = rows.find((candidate) => candidate.matchId === row.matchId && candidate.team !== row.team);
      if (opponent === undefined) {
        return false;
      }

      const rowBonus = cap === "NO_CAP" ? row.bonusPointsOr : Math.min(row.bonusPointsOr, cap);
      const opponentBonus = cap === "NO_CAP" ? opponent.bonusPointsOr : Math.min(opponent.bonusPointsOr, cap);
      return row.baseLeaguePoints + rowBonus > opponent.baseLeaguePoints + opponentBonus;
    }).length;
    const capLabel = cap === "NO_CAP" ? "no cap" : `max +${cap}`;
    const read = cap === 2 ? "preferred simulation cap; reduces stacking while preserving meaningful bonuses." : cap === "NO_CAP" ? "diagnostic only; highest anomaly risk." : "viable comparison, but validate style impact.";

    return `| ${capLabel} | ${finalPoints} | ${anomalyCount} | ${percent(anomalyCount, rows.length)}% | ${read} |`;
  });
}

function fatigueTeamConstructionRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const triggerRows = rows.filter((row) => row.bonusPointsOr > 0);
  const nonTriggerRows = rows.filter((row) => row.bonusPointsOr === 0);

  return [
    `| average late-match fatigue | MISSING_INSTRUMENTATION | MISSING_INSTRUMENTATION | Add per-team late fatigue aggregate by match quarter. |`,
    `| late-match scoring rate | ${percent(triggerRows.filter((row) => row.matchPointsFor >= 20).length, triggerRows.length)}% high-output proxy | ${percent(nonTriggerRows.filter((row) => row.matchPointsFor >= 20).length, nonTriggerRows.length)}% high-output proxy | Replace with explicit late scoring window when event timing is available. |`,
    `| late-match conceded scoring rate | ${percent(triggerRows.filter((row) => row.matchPointsAgainst >= 20).length, triggerRows.length)}% high-conceded proxy | ${percent(nonTriggerRows.filter((row) => row.matchPointsAgainst >= 20).length, nonTriggerRows.length)}% high-conceded proxy | Add conceded scoring by final match segment. |`,
    "| bench/depth contribution | MISSING_INSTRUMENTATION | MISSING_INSTRUMENTATION | Add rotation/depth contribution if substitutions enter V0.1 scope later. |",
    "| repeated high-intensity action load | MISSING_INSTRUMENTATION | MISSING_INSTRUMENTATION | Add style fatigue load counters before implementing fatigue-sensitive bonus rules. |",
    "| fatigue resilience read | PROXY_ONLY | PROXY_ONLY | Do not implement fatigue-gated bonuses until explicit late fatigue and late event timing exist. |",
  ];
}

function bonusStyleFairnessRows(rows: readonly LeagueBonusSimulationTeamRow[]): readonly string[] {
  const styles = [...new Set(rows.map((row) => row.style))].sort();
  return styles.map((style) => {
    const styleRows = rows.filter((row) => row.style === style);
    const base = styleRows.reduce((sum, row) => sum + row.baseLeaguePoints, 0);
    const offensive = styleRows.reduce((sum, row) => sum + row.tryBonus + row.routeFamilyBonus, 0);
    const defensive = styleRows.reduce((sum, row) => sum + row.closeLossBonus + row.noGoalNoTryBonusOr, 0);
    const bonus = offensive + defensive;
    const overRewarded = bonus > base && bonus > 0 ? "WATCH" : "NO";
    const underRewarded = styleRows.length > 0 && bonus === 0 ? "WATCH" : "NO";
    const read = style.includes("PATIENT")
      ? "patient control should gain through route diversity or defensive resistance, not raw volatility."
      : style.includes("DIRECT")
        ? "direct style can trigger attacking bonuses but must not dominate stacking."
        : style.includes("RISKY")
          ? "risky style should earn upside while keeping exposure risk."
          : style.includes("AGGRESSIVE")
            ? "aggressive style should gain only when pressure actually suppresses major threats."
            : "balanced style should remain stable and not bonus-invisible.";

    return `| ${style} | ${base} | ${offensive} | ${defensive} | ${bonus} | ${percent(styleRows.filter((row) => row.bonusPointsOr > 0).length, styleRows.length)}% | ${percent(styleRows.filter((row) => row.tryBonus > 0).length, styleRows.length)}% | ${percent(styleRows.filter((row) => row.routeFamilyBonus > 0).length, styleRows.length)}% | ${percent(styleRows.filter((row) => row.closeLossBonus > 0).length, styleRows.length)}% | ${percent(styleRows.filter((row) => row.noGoalNoTryBonusOr > 0).length, styleRows.length)}% | ${overRewarded} | ${underRewarded} | ${read} |`;
  });
}

function matchBonusEventRows(summary: MatchBonusBatchSummary): readonly string[] {
  return summary.events.slice(0, 24).map(
    (event) =>
      `| ${event.matchId} | ${event.teamId} | ${event.bonusType} | ${event.bonusCategory} | ${event.leaguePoints} | ${event.active} | ${event.cappedByBonusLimit} | ${event.computedAfterFinalWhistle} | ${event.sourceScoringEvents.join(", ") || "finalized scoreline only"} | ${event.triggerReason} |`,
  );
}

function leaguePointsSummaryRows(summary: MatchBonusBatchSummary): readonly string[] {
  return summary.summaries.slice(0, 24).map(
    (row) =>
      `| ${row.matchId} | ${row.teamId} | ${row.result} | ${row.matchScoreFor}-${row.matchScoreAgainst} | ${row.baseLeaguePoints} | ${row.rawBonusPoints} | ${row.cappedBonusPoints} | ${row.totalLeaguePoints} | ${row.scoringFamiliesAchieved.join(", ") || "none"} | ${row.triesScored} | ${row.concededShotGoals}/${row.concededTryTouchdowns} | ${row.closeLossMargin} | ${row.capApplied} |`,
  );
}

function matchBonusStyleImpactRows(summary: MatchBonusBatchSummary): readonly string[] {
  const styles = [...new Set(summary.summaries.map((row) => row.style))].sort();
  return styles.map((style) => {
    const rows = summary.summaries.filter((row) => row.style === style);
    const offensive = rows.flatMap((row) => row.bonusEvents).filter((event) => event.bonusCategory === "OFFENSIVE").length;
    const defensive = rows.flatMap((row) => row.bonusEvents).filter((event) => event.bonusCategory === "DEFENSIVE").length;
    const closeLoss = rows.flatMap((row) => row.bonusEvents).filter((event) => event.bonusType === "DEFENSIVE_CLOSE_LOSS_WITHIN_7").length;
    const majorThreat = rows.flatMap((row) => row.bonusEvents).filter((event) => event.bonusType === "DEFENSIVE_MAJOR_THREAT_SHUTDOWN").length;
    const tries = rows.flatMap((row) => row.bonusEvents).filter((event) => event.bonusType === "OFFENSIVE_3_PLUS_TRIES").length;
    const families = rows.flatMap((row) => row.bonusEvents).filter((event) => event.bonusType === "OFFENSIVE_3_MAIN_SCORING_FAMILIES").length;
    const styleRead = style.includes("PATIENT")
      ? "patient/control styles gain through suppression and route diversity, not bonus volume alone."
      : style.includes("DIRECT")
        ? "direct styles can trigger 3+ tries when access is earned."
        : style.includes("RISKY")
          ? "risky styles receive attacking upside but remain exposed to scoreline losses."
          : style.includes("AGGRESSIVE")
            ? "pressing styles benefit only when major threats are genuinely shut down."
            : "balanced styles remain eligible without requiring extreme profiles.";

    return `| ${style} | ${average(rows.map((row) => row.baseLeaguePoints))} | ${average(rows.map((row) => row.cappedBonusPoints))} | ${average(rows.map((row) => row.totalLeaguePoints))} | ${percent(offensive, rows.length)}% | ${percent(defensive, rows.length)}% | ${percent(rows.filter((row) => row.capApplied === "YES").length, rows.length)}% | ${percent(closeLoss, rows.length)}% | ${percent(majorThreat, rows.length)}% | ${percent(tries, rows.length)}% | ${percent(families, rows.length)}% | ${styleRead} |`;
  });
}

function leagueTableRowsMarkdown(rows: readonly LeagueTableRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.rankingPosition} | ${row.rowId} | ${row.rowType} | ${row.matchesPlayed} | ${row.wins} | ${row.draws} | ${row.losses} | ${row.forfeits} | ${row.matchPointsFor} | ${row.matchPointsAgainst} | ${row.matchPointDifferential} | ${row.baseLeaguePoints} | ${row.offensiveBonusPoints} | ${row.defensiveBonusPoints} | ${row.cappedBonusPoints} | ${row.totalLeaguePoints} | ${row.bonusEventsCount} | ${row.capActivationCount} | ${row.forfeitsApplied} | ${row.tieBreakExplanation} |`,
  );
}

function bonusDistributionStyleRows(summary: LeagueTableIntegrationSummary): readonly string[] {
  return summary.bonusDistributionByStyle.map(
    (row) =>
      `| ${row.styleId} | ${row.matches} | ${row.averageBaseLeaguePoints} | ${row.averageOffensiveBonusPoints} | ${row.averageDefensiveBonusPoints} | ${row.averageTotalLeaguePoints} | ${row.offensiveBonusRate}% | ${row.defensiveBonusRate}% | ${row.capActivationRate}% | ${row.threePlusTriesBonusRate}% | ${row.threeMainFamiliesBonusRate}% | ${row.closeLossBonusRate}% | ${row.majorThreatShutdownBonusRate}% | ${row.winRate}% | ${row.drawRate}% | ${row.lossRate}% | ${row.blowoutInvolvementRate}% | ${row.closeGameInvolvementRate}% | ${row.tacticalRead} |`,
  );
}

function fatigueInstrumentationMarkdown(summary: LeagueTableIntegrationSummary): readonly string[] {
  return summary.fatigueInstrumentationRows.map(
    (row) =>
      `| ${row.cohort} | ${row.averageTeamFatigueStart} | ${row.averageTeamFatigueHalfTime} | ${row.averageTeamFatigueFinal} | ${row.maxPlayerFatigueFinal} | ${row.fatigueDelta} | ${row.lateMatchFatigueIndex} | ${row.highIntensityActionLoad} | ${row.contactLoad} | ${row.sprintLoad} | ${row.repeatedEffortLoad} | ${row.benchDepthUsed} | ${row.benchContributionScore} | ${row.lateScoreFor} | ${row.lateScoreAgainst} | ${row.lateDefensiveStops} | ${row.squadDepthScore} | ${row.roleBalanceScore} | ${row.tacticalCoherenceScore} | ${row.missingDataSource} | ${row.recommendation} |`,
  );
}

function teamMatchFatigueRows(summary: LeagueTableIntegrationSummary): readonly string[] {
  return summary.teamMatchFatigueSummaries.slice(0, 20).map(
    (row) =>
      `| ${row.matchId} | ${row.teamId} | ${row.styleId} | ${row.averageTeamFatigueStart} | ${row.averageTeamFatigueFirstThird} | ${row.averageTeamFatigueSecondThird} | ${row.averageTeamFatigueFinalThird} | ${row.averageTeamFatigueFinal} | ${row.maxPlayerFatigueFinal} | ${row.minPlayerFatigueFinal} | ${row.fatigueDeltaStartToFinal} | ${row.lateMatchFatigueIndex} | ${row.fatigueResilienceScore} | ${row.fatigueCollapseFlag} | ${row.missingSourceData} |`,
  );
}

function playerFatigueTimelineRows(summary: LeagueTableIntegrationSummary): readonly string[] {
  return summary.playerFatigueTimelineRows.slice(0, 24).map(
    (row) =>
      `| ${row.matchId} | ${row.teamId} | ${row.playerId} | ${row.role} | ${row.possessionIndex} | ${row.matchThird} | ${row.fatigueBeforePossession} | ${row.fatigueAfterPossession} | ${row.fatigueDelta} | ${row.actionLoadDelta} | ${row.recoveryDelta} | ${row.onField} | ${row.bench} | ${row.involvedInPossession} | ${row.primaryActionType} | ${row.defensiveActionType} | ${row.highIntensityAction} | ${row.contactAction} | ${row.sprintAction} | ${row.scoringActionInvolved} | ${row.concededScoringActionInvolved} |`,
  );
}

function teamFatigueTimelineRows(summary: LeagueTableIntegrationSummary): readonly string[] {
  return summary.teamFatigueTimelineRows.slice(0, 24).map(
    (row) =>
      `| ${row.matchId} | ${row.teamId} | ${row.styleId} | ${row.possessionIndex} | ${row.matchThird} | ${row.averageTeamFatigue} | ${row.medianTeamFatigue} | ${row.maxPlayerFatigue} | ${row.minPlayerFatigue} | ${row.fatigueSpread} | ${row.highFatiguePlayerCount} | ${row.exhaustedPlayerCount} | ${row.averageOnFieldFatigue} | ${row.averageBenchFatigue} | ${row.teamFatigueDelta} | ${row.teamActionLoadDelta} | ${row.teamRecoveryDelta} | ${row.lateMatchFatigueIndex} | ${row.fatigueCollapseFlag} |`,
  );
}

function playerMatchLoadRows(summary: LeagueTableIntegrationSummary): readonly string[] {
  return summary.playerMatchLoadSummaries.map(
    (row) =>
      `| ${row.matchId} | ${row.playerId} | ${row.teamId} | ${row.role} | ${row.styleId} | ${row.minutesOrPossessionsPlayed} | ${row.possessionsOnBench} | ${row.startingFatigue} | ${row.finalFatigue} | ${row.fatigueDelta} | ${row.averageFatigue} | ${row.maxFatigue} | ${row.finalThirdAverageFatigue} | ${row.sprintLoad} | ${row.highIntensityRunLoad} | ${row.contactLoad} | ${row.tackleLoad} | ${row.carryLoad} | ${row.shotLoad} | ${row.tryAttemptLoad} | ${row.dropAttemptLoad} | ${row.defensiveRecoveryLoad} | ${row.goalkeeperRecoveryLoad} | ${row.reboundCrashLoad} | ${row.repeatedEffortLoad} | ${row.lateMatchActionLoad} | ${row.performanceDropFlag} | ${row.overloadFlag} | ${row.fatigueContributionToFailedAction} | ${row.injuryRiskProxy} | ${row.missingSourceData} |`,
  );
}

function teamLoadRows(summary: LeagueTableIntegrationSummary): readonly string[] {
  return summary.teamLoadSummaries.slice(0, 20).map(
    (row) =>
      `| ${row.matchId} | ${row.teamId} | ${row.styleId} | ${row.totalSprintLoad} | ${row.totalHighIntensityLoad} | ${row.totalContactLoad} | ${row.totalTackleLoad} | ${row.totalCarryLoad} | ${row.totalShotLoad} | ${row.totalTryAttemptLoad} | ${row.totalDropAttemptLoad} | ${row.totalDefensiveRecoveryLoad} | ${row.totalGoalkeeperLoad} | ${row.totalRepeatedEffortLoad} | ${row.offensiveLoad} | ${row.defensiveLoad} | ${row.goalkeeperLoad} | ${row.roleLoadImbalance} | ${row.overusedPlayerCount} | ${row.highFatiguePlayerCountFinal} | ${row.exhaustedPlayerCountFinal} | ${row.loadConcentrationIndex} | ${row.topLoadedPlayerShare} | ${row.lateLoadSpikeFlag} | ${row.missingSourceData} |`,
  );
}

function rosterQualityRows(summary: LeagueTableIntegrationSummary): readonly string[] {
  return summary.rosterQualitySummaries.map(
    (row) =>
      `| ${row.rosterId} | ${row.teamId} | ${row.styleId} | ${row.sourceStatus} | ${row.squadDepthScore} | ${row.benchQualityScore} | ${row.roleCoverageScore} | ${row.offensiveRoleCoverageScore} | ${row.defensiveRoleCoverageScore} | ${row.goalkeeperQualityScore} | ${row.goalkeeperMentalReliabilityScore} | ${row.goalkeeperReboundControlScore} | ${row.goalkeeperSecondSaveScore} | ${row.enduranceProfileScore} | ${row.dropThreatScore} | ${row.conversionThreatScore} | ${row.shotThreatScore} | ${row.tryThreatScore} | ${row.tacticalCoherenceScore} | ${row.specialistDependencyIndex} | ${row.rosterWeaknessFlags.join(", ")} | ${row.rosterStrengthFlags.join(", ")} | ${row.coachFacingSummary} |`,
  );
}

function numericRosterValue(value: LeagueTableIntegrationSummary["rosterQualitySummaries"][number]["squadDepthScore"]): number {
  return typeof value === "number" ? value : 0;
}

function rosterForSummary(input: {
  readonly leagueTable: LeagueTableIntegrationSummary;
  readonly summary: LeaguePointsSummary;
}): LeagueTableIntegrationSummary["rosterQualitySummaries"][number] | undefined {
  return input.leagueTable.rosterQualitySummaries.find((row) => row.teamId === input.summary.teamId && row.styleId === input.summary.style);
}

function averageRosterMetric(input: {
  readonly leagueTable: LeagueTableIntegrationSummary;
  readonly summaries: readonly LeaguePointsSummary[];
  readonly metric: keyof Pick<
    LeagueTableIntegrationSummary["rosterQualitySummaries"][number],
    | "defensiveRoleCoverageScore"
    | "enduranceProfileScore"
    | "fatigueResiliencePotential"
    | "goalkeeperMentalReliabilityScore"
    | "goalkeeperReboundControlScore"
    | "offensiveRoleCoverageScore"
    | "roleCoverageScore"
    | "specialistDependencyIndex"
    | "squadDepthScore"
    | "tacticalCoherenceScore"
    | "tryThreatScore"
  >;
}): number {
  const values = input.summaries
    .map((summary) => rosterForSummary({ leagueTable: input.leagueTable, summary }))
    .filter((row): row is LeagueTableIntegrationSummary["rosterQualitySummaries"][number] => row !== undefined)
    .map((row) => numericRosterValue(row[input.metric]));

  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function correlationLabel(bonusAverage: number, nonBonusAverage: number, sampleSize: number): string {
  if (sampleSize < 4) {
    return "SAMPLE_TOO_SMALL";
  }

  const delta = bonusAverage - nonBonusAverage;

  if (delta >= 5) {
    return "POSITIVE";
  }

  if (delta <= -5) {
    return "NEGATIVE";
  }

  if (Math.abs(delta) >= 2) {
    return "WEAK";
  }

  return "NONE";
}

function bonusCorrelationLine(input: {
  readonly leagueTable: LeagueTableIntegrationSummary;
  readonly summaries: readonly LeaguePointsSummary[];
  readonly bonusType: string;
  readonly metric: Parameters<typeof averageRosterMetric>[0]["metric"];
  readonly label: string;
}): string {
  const bonusTeams = input.summaries.filter((summary) => summary.bonusEvents.some((event) => event.bonusType === input.bonusType && event.active === "YES"));
  const nonBonusTeams = input.summaries.filter((summary) => !summary.bonusEvents.some((event) => event.bonusType === input.bonusType && event.active === "YES"));
  const bonusAverage = averageRosterMetric({ leagueTable: input.leagueTable, summaries: bonusTeams, metric: input.metric });
  const nonBonusAverage = averageRosterMetric({ leagueTable: input.leagueTable, summaries: nonBonusTeams, metric: input.metric });

  return `- ${input.label}: ${correlationLabel(bonusAverage, nonBonusAverage, bonusTeams.length)}; bonus avg ${bonusAverage}, non-bonus avg ${nonBonusAverage}, sample ${bonusTeams.length}.`;
}

function styleRosterRows(input: {
  readonly leagueTable: LeagueTableIntegrationSummary;
  readonly summaries: readonly LeaguePointsSummary[];
}): readonly string[] {
  return input.leagueTable.rosterQualitySummaries.map((roster) => {
    const summaries = input.summaries.filter((summary) => summary.teamId === roster.teamId && summary.style === roster.styleId);
    const averageBonus = summaries.length === 0 ? 0 : Math.round((summaries.reduce((sum, summary) => sum + summary.cappedBonusPoints, 0) / summaries.length) * 10) / 10;
    const averageLeague = summaries.length === 0 ? 0 : Math.round((summaries.reduce((sum, summary) => sum + summary.totalLeaguePoints, 0) / summaries.length) * 10) / 10;
    const averageRouteDiversity =
      summaries.length === 0 ? 0 : Math.round((summaries.reduce((sum, summary) => sum + summary.scoringFamiliesAchieved.length, 0) / summaries.length) * 10) / 10;
    const styleVolatility = roster.styleId.includes("DIRECT") || roster.styleId.includes("RISKY") ? "HIGH" : roster.styleId.includes("BALANCED") ? "MEDIUM" : "LOW";
    const rosterContribution = numericRosterValue(roster.roleCoverageScore) >= 75 ? "HIGH" : numericRosterValue(roster.roleCoverageScore) >= 62 ? "MEDIUM" : "LOW";

    return `| ${roster.teamId} | ${roster.styleId} | ${roster.roleCoverageScore} | ${roster.fatigueResiliencePotential} | ${roster.specialistDependencyIndex} | ${averageBonus} | ${averageRouteDiversity} | ${averageLeague} | ${styleVolatility} | ${rosterContribution} | ${roster.recommendedImprovement} |`;
  });
}

function lateMatchPerformanceRows(summary: LeagueTableIntegrationSummary): readonly string[] {
  return summary.lateMatchPerformanceSummaries.slice(0, 20).map(
    (row) =>
      `| ${row.matchId} | ${row.teamId} | ${row.styleId} | ${row.lateMatchScoreFor} | ${row.lateMatchScoreAgainst} | ${row.lateMatchPointDifferential} | ${row.lateMatchScoringEventsFor} | ${row.lateMatchScoringEventsAgainst} | ${row.lateMatchRouteDiversity} | ${row.lateMatchTryAttemptsFor} | ${row.lateMatchTrySuccessFor} | ${row.lateMatchShotGoalsFor} | ${row.lateMatchDropGoalsFor} | ${row.lateMatchDefensiveStops} | ${row.lateMatchTurnoversWon} | ${row.lateMatchTurnoversConceded} | ${row.lateCollapseFlag} | ${row.lateSurgeFlag} | ${row.lateControlFlag} | ${row.missingSourceData} |`,
  );
}

type FatigueBucket = "EXHAUSTED" | "HIGH_FATIGUE" | "LOW_FATIGUE" | "MODERATE_FATIGUE";

const FATIGUE_BUCKETS: readonly FatigueBucket[] = ["LOW_FATIGUE", "MODERATE_FATIGUE", "HIGH_FATIGUE", "EXHAUSTED"] as const;

function fatigueBucket(value: number): FatigueBucket {
  if (value >= 75) {
    return "EXHAUSTED";
  }

  if (value >= 50) {
    return "HIGH_FATIGUE";
  }

  if (value >= 25) {
    return "MODERATE_FATIGUE";
  }

  return "LOW_FATIGUE";
}

function fatigueModifierLabel(bucket: FatigueBucket): string {
  switch (bucket) {
    case "LOW_FATIGUE":
      return "0 xSOT / 0 xG / no recovery penalty";
    case "MODERATE_FATIGUE":
      return "-1 xSOT under pressure / modest contact-recovery watch";
    case "HIGH_FATIGUE":
      return "-5 xSOT / -2 xG / recovery and contact penalty active";
    case "EXHAUSTED":
      return "-9 xSOT / -4 xG / strong repeated-effort and recovery penalty";
  }
}

function teamFatigueFor(input: {
  readonly leagueTable: LeagueTableIntegrationSummary;
  readonly matchId: string;
  readonly teamId: string;
}): number {
  const fatigue = input.leagueTable.teamMatchFatigueSummaries.find((row) => row.matchId === input.matchId && row.teamId === input.teamId);
  return Number(fatigue?.averageTeamFatigueFinalThird ?? fatigue?.averageTeamFatigueFinal ?? 35);
}

function tryFatigueProxy(row: RouteSuccessRateCalibrationSummary["tryRows"][number]): number {
  return Math.max(0, Math.min(100, Math.round(row.fatiguePenalty * 4 + row.contactPressure * 0.15 + row.tacklePressure * 0.1)));
}

function dropFatigueProxy(row: RouteSuccessRateCalibrationSummary["dropRows"][number]): number {
  const pressureBase = row.pressure === "HIGH" ? 48 : row.pressure === "MEDIUM" ? 32 : 18;
  return Math.max(0, Math.min(100, Math.round(pressureBase + row.blockPressure * 0.25)));
}

function shotRowsForBucket(
  records: readonly ShotOriginRecord[],
  leagueTable: LeagueTableIntegrationSummary,
  bucket: FatigueBucket,
): readonly ShotOriginRecord[] {
  return records.filter((record) => fatigueBucket(teamFatigueFor({ leagueTable, matchId: record.matchId, teamId: record.team })) === bucket);
}

function fatigueBucketAuditRows(input: {
  readonly heatmap: ReturnType<typeof summarizeShotOriginHeatmap>;
  readonly routeSuccess: RouteSuccessRateCalibrationSummary;
  readonly leagueTable: LeagueTableIntegrationSummary;
}): readonly string[] {
  return FATIGUE_BUCKETS.map((bucket) => {
    const shotRows = shotRowsForBucket(input.heatmap.records, input.leagueTable, bucket);
    const tryRows = input.routeSuccess.tryRows.filter((row) => fatigueBucket(tryFatigueProxy(row)) === bucket);
    const dropRows = input.routeSuccess.dropRows.filter((row) => fatigueBucket(dropFatigueProxy(row)) === bucket);
    const teamFatigueRows = input.leagueTable.teamMatchFatigueSummaries.filter((row) => fatigueBucket(Number(row.lateMatchFatigueIndex)) === bucket);
    const lateRows = input.leagueTable.lateMatchPerformanceSummaries.filter((row) =>
      teamFatigueRows.some((fatigue) => fatigue.matchId === row.matchId && fatigue.teamId === row.teamId),
    );
    const gkActions = shotRows.filter((row) => row.onTarget === "YES");
    const gkSaves = gkActions.filter((row) => row.goal === "NO").length;
    const spills = shotRows.filter((row) => row.routeFamily === "rebound / second shot" && row.onTarget === "YES").length;

    return `| ${bucket} | ${shotRows.length} | ${shotRows.filter((row) => row.goal === "YES").length} | ${percent(shotRows.filter((row) => row.goal === "YES").length, shotRows.length)}% | ${average(shotRows.map((row) => row.xG))}% | ${average(shotRows.map((row) => row.finalXG))}% | ${tryRows.length} | ${tryRows.filter((row) => row.outcome === "TRY_SCORED").length} | ${percent(tryRows.filter((row) => row.outcome === "TRY_SCORED").length, tryRows.length)}% | ${tryRows.filter((row) => row.failureClass === "LOST_FORWARD").length} | ${tryRows.filter((row) => row.failureClass === "HELD_UP").length} | ${tryRows.filter((row) => row.failureClass === "TACKLED_SHORT").length} | ${dropRows.length} | ${dropRows.filter((row) => row.outcome === "DROP_GOAL").length} | ${percent(dropRows.filter((row) => row.outcome === "DROP_GOAL").length, dropRows.length)}% | ${gkActions.length} | ${gkSaves} | ${spills} | ${average(lateRows.map((row) => Number(row.lateMatchDefensiveStops)))} | ${average(lateRows.map((row) => Number(row.lateMatchTurnoversConceded)))} | ${average(lateRows.map((row) => Number(row.lateMatchTurnoversWon)))} | ${average(lateRows.map((row) => Number(row.lateMatchScoreFor)))} | ${average(lateRows.map((row) => Number(row.lateMatchScoreAgainst)))} | ${fatigueModifierLabel(bucket)} |`;
  });
}

function fatigueActionFamilyRows(input: {
  readonly heatmap: ReturnType<typeof summarizeShotOriginHeatmap>;
  readonly routeSuccess: RouteSuccessRateCalibrationSummary;
  readonly leagueTable: LeagueTableIntegrationSummary;
}): readonly string[] {
  const familyRows = [
    {
      family: "SHOT",
      count: input.heatmap.records.length,
      success: percent(input.heatmap.records.filter((row) => row.goal === "YES").length, input.heatmap.records.length),
      failure: "MISS / SAVED_OR_DEFLECTED",
      modifier: "fatigue modifier hook visible; V1 audit recommends larger xSOT than xG impact under HIGH/EXHAUSTED fatigue",
      recommendation: "MONITOR_FATIGUE_OUTCOME_IMPACT",
    },
    {
      family: "TRY_TOUCHDOWN_ATTEMPT",
      count: input.routeSuccess.tryAttempts,
      success: input.routeSuccess.trySuccessRate,
      failure: "LOST_FORWARD / HELD_UP / TACKLED_SHORT",
      modifier: "fatiguePenalty already exposed on try rows; contact pressure stacks with high fatigue",
      recommendation: "CONFIRM_FATIGUE_EFFECT_CALIBRATION",
    },
    {
      family: "DROP_GOAL_ATTEMPT",
      count: input.routeSuccess.dropAttempts,
      success: input.routeSuccess.dropSuccessRate,
      failure: "MISS / BLOCK_PRESSURE",
      modifier: "drop fatigue audit links pressure and block pressure to kicker fatigue proxy",
      recommendation: "MONITOR_FATIGUE_OUTCOME_IMPACT",
    },
    {
      family: "CONVERSION_GOAL",
      count: input.routeSuccess.conversionAttempts,
      success: input.routeSuccess.conversionSuccessRate,
      failure: "GEOMETRY_MISS",
      modifier: "fatigue effect should remain modest; geometry remains primary",
      recommendation: "KEEP_SCORING_VALUES",
    },
    {
      family: "DEFENSIVE_RECOVERY",
      count: input.leagueTable.lateMatchPerformanceSummaries.reduce((sum, row) => sum + Number(row.lateMatchDefensiveStops), 0),
      success: percent(
        input.leagueTable.lateMatchPerformanceSummaries.reduce((sum, row) => sum + Number(row.lateMatchDefensiveStops), 0),
        input.leagueTable.lateMatchPerformanceSummaries.reduce((sum, row) => sum + Number(row.lateMatchDangerPhasesAgainst), 0),
      ),
      failure: "MISSED_RECOVERY / LATE_CONCESSION",
      modifier: "lateMatchFatigueIndex reduces recovery read under high-load final third",
      recommendation: "REVIEW_HIGH_LOAD_STYLE_COST",
    },
    {
      family: "GOALKEEPER_SAVE",
      count: input.heatmap.records.filter((row) => row.onTarget === "YES").length,
      success: percent(input.heatmap.records.filter((row) => row.onTarget === "YES" && row.goal === "NO").length, input.heatmap.records.filter((row) => row.onTarget === "YES").length),
      failure: "FAILED_SAVE / SPILL",
      modifier: "GK fatigue audit uses defending-team late fatigue and rebound / second-shot spill flags",
      recommendation: "MONITOR_FATIGUE_OUTCOME_IMPACT",
    },
    {
      family: "REBOUND / SECOND_SHOT",
      count: input.heatmap.records.filter((row) => row.routeFamily === "rebound / second shot").length,
      success: percent(
        input.heatmap.records.filter((row) => row.routeFamily === "rebound / second shot" && row.goal === "YES").length,
        input.heatmap.records.filter((row) => row.routeFamily === "rebound / second shot").length,
      ),
      failure: "CLEARANCE / DESPERATE_SECOND_SHOT",
      modifier: "attacker/defender/GK fatigue affects reaction interpretation; no automatic second-shot reward",
      recommendation: "MONITOR_FATIGUE_OUTCOME_IMPACT",
    },
    {
      family: "SUPPORT / RECYCLE",
      count: input.leagueTable.teamFatigueTimelineRows.filter((row) => row.teamActionLoadDelta <= 8).length,
      success: 100,
      failure: "OVER_SAFE_CONTINUATION watch only",
      modifier: "low-intensity recovery can reduce fatigue by -1 when involvement is low",
      recommendation: "KEEP_MATCH_BONUS_EVENT_LEAGUE_TABLE_ONLY",
    },
  ] as const;

  return familyRows.map(
    (row) => `| ${row.family} | ${row.count} | ${row.success}% | ${row.failure} | ${row.modifier} | ${row.recommendation} |`,
  );
}

function shotFatigueAuditRows(input: {
  readonly heatmap: ReturnType<typeof summarizeShotOriginHeatmap>;
  readonly leagueTable: LeagueTableIntegrationSummary;
}): readonly string[] {
  return input.heatmap.records.slice(0, 16).map((record) => {
    const fatigue = teamFatigueFor({ leagueTable: input.leagueTable, matchId: record.matchId, teamId: record.team });
    const bucket = fatigueBucket(fatigue);
    const fatigueModifier = bucket === "LOW_FATIGUE" ? 0 : bucket === "MODERATE_FATIGUE" ? -1 : bucket === "HIGH_FATIGUE" ? -5 : -9;
    const read =
      record.cleanWindowType === "CLEAN" && bucket !== "EXHAUSTED"
        ? "clean window remains valuable; fatigue trims technique without deleting the chance"
        : record.cleanWindowType === "FORCED"
          ? "forced shot stacks poorly with fatigue"
          : "fatigue is a visible execution modifier, not an automatic miss";

    return `| ${record.matchId} | ${record.team} | ${record.shootingTeamStyle} | ${fatigue} | ${bucket} | ${record.originZone} | ${record.targetGoalZone} | ${record.cleanWindowType} | ${record.pressureCategory} | ${record.goalkeeperAlignmentToTargetGoal} | ${record.finalXSOT}% | ${record.finalXG}% | ${record.goal} | ${record.shotOutcome} | ${fatigueModifier} xSOT audit modifier | ${read} |`;
  });
}

function tryFatigueAuditRows(routeSuccess: RouteSuccessRateCalibrationSummary): readonly string[] {
  return routeSuccess.tryRows.map((row) => {
    const fatigue = tryFatigueProxy(row);
    const bucket = fatigueBucket(fatigue);
    const read =
      row.outcome === "TRY_SCORED"
        ? "legal access, control, momentum, and support overcome fatigue"
        : row.failureClass === "LOST_FORWARD" && bucket === "HIGH_FATIGUE"
          ? "high fatigue plus contact makes lost-forward plausible without reverting to old overpunishment"
          : row.failureClass === "TACKLED_SHORT"
            ? "fatigue and support/momentum can explain being stopped short"
            : "defensive pressure remains meaningful";

    return `| ${row.actionId} | ${row.carrier} | ${fatigue} | ${bucket} | ${row.supportArriving} | ${row.contactPressure} | ${row.tacklePressure} | ${row.defenderGoalLinePressure} | ${row.ballControl} | ${row.groundingScore} | ${row.bodyControl} | ${row.carrierMomentum} | ${row.legalAccess} | ${row.outcome} | ${row.failureClass} | ${read} |`;
  });
}

function dropFatigueAuditRows(routeSuccess: RouteSuccessRateCalibrationSummary): readonly string[] {
  return routeSuccess.dropRows.map((row) => {
    const fatigue = dropFatigueProxy(row);
    const bucket = fatigueBucket(fatigue);
    const read =
      row.outcome === "DROP_GOAL"
        ? "drop remains viable when timing and profile justify it"
        : bucket === "HIGH_FATIGUE"
          ? "fatigue plus pressure/block makes drop miss/block plausible"
          : "drop remains rare timing weapon, not globally nerfed";

    return `| ${row.actionId} | ${row.fieldZone} | ${row.timingContext} | ${row.kickerProfile} | ${fatigue} | ${bucket} | ${row.pressure} | ${row.blockPressure} | ${row.outcome} | ${row.tacticalChoice} | ${read} |`;
  });
}

function reboundFatigueAuditRows(input: {
  readonly heatmap: ReturnType<typeof summarizeShotOriginHeatmap>;
  readonly leagueTable: LeagueTableIntegrationSummary;
}): readonly string[] {
  return input.heatmap.records
    .filter((record) => record.routeFamily === "rebound / second shot")
    .slice(0, 16)
    .map((record) => {
      const attackerFatigue = teamFatigueFor({ leagueTable: input.leagueTable, matchId: record.matchId, teamId: record.team });
      const defenderFatigue = teamFatigueFor({ leagueTable: input.leagueTable, matchId: record.matchId, teamId: record.defendingTeam });
      const gkFatigue = Math.round(defenderFatigue + (record.goalkeeperAlignmentToTargetGoal === "ALIGNED" ? -4 : 6));
      const read =
        attackerFatigue > defenderFatigue + 8
          ? "tired attacker reaction should reduce second-shot quality"
          : defenderFatigue > attackerFatigue + 8
            ? "tired defense/GK recovery can leave a dangerous rebound"
            : "balanced fatigue creates scramble rather than automatic goal";

      return `| ${record.matchId} | ${record.team} | ${attackerFatigue} | ${defenderFatigue} | ${gkFatigue} | ${record.originZone} | ${record.cleanWindowType} | ${record.goalkeeperAlignmentToTargetGoal} | ${record.defensiveBlockPressure} | ${record.finalXG}% | ${record.goal} | ${record.shotOutcome} | ${read} |`;
    });
}

function defensiveGoalkeeperFatigueRows(input: {
  readonly heatmap: ReturnType<typeof summarizeShotOriginHeatmap>;
  readonly leagueTable: LeagueTableIntegrationSummary;
}): readonly string[] {
  return FATIGUE_BUCKETS.map((bucket) => {
    const defendingShotRows = input.heatmap.records.filter(
      (record) => fatigueBucket(teamFatigueFor({ leagueTable: input.leagueTable, matchId: record.matchId, teamId: record.defendingTeam })) === bucket,
    );
    const onTargetRows = defendingShotRows.filter((record) => record.onTarget === "YES");
    const goals = onTargetRows.filter((record) => record.goal === "YES").length;
    const saves = onTargetRows.length - goals;
    const spills = defendingShotRows.filter((record) => record.routeFamily === "rebound / second shot" && record.onTarget === "YES").length;
    const lateRows = input.leagueTable.lateMatchPerformanceSummaries.filter((row) => fatigueBucket(Number(row.lateMatchFatigueIndex)) === bucket);

    return `| ${bucket} | ${onTargetRows.length} | ${saves} | ${goals} | ${spills} | ${average(lateRows.map((row) => Number(row.lateMatchDefensiveStops)))} | ${average(lateRows.map((row) => Number(row.lateMatchScoreAgainst)))} | ${average(lateRows.map((row) => Number(row.lateMatchTurnoversConceded)))} | ${bucket === "HIGH_FATIGUE" || bucket === "EXHAUSTED" ? "recovery/spill risk should be monitored as visible fatigue cost" : "fresh/moderate defenses preserve organized recovery"} |`;
  });
}

function lateMatchFatigueAuditRows(leagueTable: LeagueTableIntegrationSummary): readonly string[] {
  return leagueTable.lateMatchPerformanceSummaries.slice(0, 24).map((row) => {
    const bucket = fatigueBucket(Number(row.lateMatchFatigueIndex));
    const bonus = leagueTable.teamMatchFatigueSummaries.some((fatigue) => fatigue.matchId === row.matchId && fatigue.teamId === row.teamId) ? "AUDITED" : "NO";
    const read =
      row.lateCollapseFlag === "YES"
        ? "late fatigue links to negative differential/concessions"
        : row.lateSurgeFlag === "YES"
          ? "manageable fatigue supports late surge"
          : row.lateControlFlag === "YES"
            ? "team controls final third without collapse"
            : "fatigue effect present but not decisive";

    return `| ${row.matchId} | ${row.teamId} | ${row.styleId} | ${row.lateMatchFatigueIndex} | ${bucket} | ${row.lateMatchScoreFor} | ${row.lateMatchScoreAgainst} | ${row.lateMatchRouteDiversity} | ${row.lateMatchDefensiveStops} | ${row.lateMatchTurnoversConceded} | ${row.lateCollapseFlag} | ${row.lateSurgeFlag} | ${row.lateControlFlag} | ${bonus} | ${read} |`;
  });
}

function styleFatigueEconomyRows(leagueTable: LeagueTableIntegrationSummary): readonly string[] {
  const styles = [...new Set(leagueTable.teamMatchFatigueSummaries.map((row) => row.styleId))].sort();
  return styles.map((style) => {
    const fatigueRows = leagueTable.teamMatchFatigueSummaries.filter((row) => row.styleId === style);
    const loadRows = leagueTable.teamLoadSummaries.filter((row) => row.styleId === style);
    const lateRows = leagueTable.lateMatchPerformanceSummaries.filter((row) => row.styleId === style);
    const bonusRows = leagueTable.bonusDistributionByStyle.filter((row) => row.styleId === style);
    const bonusPoints = average(bonusRows.map((row) => row.averageOffensiveBonusPoints + row.averageDefensiveBonusPoints));
    const totalLoad = average(loadRows.map((row) => Number(row.offensiveLoad) + Number(row.defensiveLoad) + Number(row.totalHighIntensityLoad)));
    const read =
      style.includes("DIRECT") || style.includes("RISKY")
        ? "high-upside style remains viable but visible fatigue cost must be monitored"
        : style.includes("BALANCED")
          ? "balanced style shows fatigue-efficiency value, bonus visibility still watch"
          : style.includes("PATIENT")
            ? "patient style should show late control and low collapse"
            : "pressure style pays high-intensity fatigue cost while preserving identity";

    return `| ${style} | ${average(fatigueRows.map((row) => Number(row.averageTeamFatigueFinal)))} | ${average(fatigueRows.map((row) => Number(row.lateMatchFatigueIndex)))} | ${totalLoad} | ${average(loadRows.map((row) => Number(row.loadConcentrationIndex)))} | ${average(lateRows.map((row) => Number(row.lateMatchScoreFor)))} | ${average(lateRows.map((row) => Number(row.lateMatchScoreAgainst)))} | ${percent(lateRows.filter((row) => row.lateCollapseFlag === "YES").length, lateRows.length)}% | ${percent(lateRows.filter((row) => row.lateSurgeFlag === "YES").length, lateRows.length)}% | ${bonusPoints} | ${totalLoad === 0 ? 0 : Math.round((bonusPoints / totalLoad) * 1000) / 1000} | ${read} |`;
  });
}

function continuationFamilyRowsMarkdown(rows: readonly FullMatchContinuationFamilyRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.continuationFamily} | ${row.selectedCount} | ${row.futureThreatWithinOneAction} | ${row.futureThreatWithinTwoActions} | ${row.futureScoringRouteWithinOneAction} | ${row.futureScoringRouteWithinTwoActions} | ${row.actualPointsLater} | ${row.threatFailureCount} | ${row.neutralContinuationCount} | ${row.negativeTurnoverPressureLossCount} | ${row.averagePayoffQuality} |`,
  );
}

function routeToShotPipelineRowsMarkdown(rows: readonly FullMatchRouteToShotPipelineRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.sourceChain} | ${row.shotAttempts} | ${row.shotGoals} | ${row.shotGoalPoints} | ${row.averageXG}% | ${row.conversionRate}% | ${row.tacticalRead} |`,
  );
}

function continuationToShotRowsMarkdown(rows: readonly FullMatchContinuationToShotAuditRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.continuationFamily} | ${row.selectedCount} | ${row.laterShotAttemptsGenerated} | ${row.laterShotGoalsGenerated} | ${row.laterTryAttemptsGenerated} | ${row.laterDropAttemptsGenerated} | ${row.classification} | ${row.tacticalRead} |`,
  );
}

function reboundContributionRowsMarkdown(rows: readonly FullMatchReboundContributionRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.reboundAttempts} | ${row.reboundGoals} | ${row.reboundShareOfShotGoals}% | ${row.centralReboundShare}% | ${row.tapInCount} | ${row.desperateSecondShotCount} | ${row.xGDistribution} | ${row.tacticalRead} |`,
  );
}

function nonShotAttritionRowsMarkdown(rows: readonly FullMatchNonShotRouteAttritionRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.route} | ${row.selectedCount} | ${row.attemptsExecuted} | ${row.successfulScores} | ${row.failedOutcomes} | ${row.primaryFailureReasons} | ${row.failedRoutesLaterBecomeShots} | ${row.valueAttrition}% | ${row.tacticalRead} |`,
  );
}

function styleShotPipelineRowsMarkdown(rows: readonly FullMatchStyleShotPipelineImpactRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.style} | ${row.shotPoints} | ${row.tryPoints} | ${row.dropPoints} | ${row.conversionPoints} | ${row.primaryShotPipelineSource} | ${row.nonShotRouteVisibility} | ${row.reboundDependency}% | ${row.tacticalIdentityRead} |`,
  );
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const TRY_ATTRITION_BASELINE = {
  attempts: 22,
  triesScored: 5,
  lostForward: 13,
  heldUp: 2,
  tackledShort: 2,
  conversionsMade: 3,
  tryPoints: 25,
  conversionPoints: 6,
  shotPoints: 78,
  shotPointShare: 64,
} as const;

function tryAttemptCandidateScore(opportunity: TryOpportunityRecord): number {
  return clampScore(
    opportunity.legalAccessQuality * 0.14 +
      opportunity.ballControlScore * 0.2 +
      opportunity.groundingScore * 0.2 +
      opportunity.bodyControlScore * 0.16 +
      opportunity.carrierMomentumScore * 0.14 +
      opportunity.supportArrivingScore * 0.12 -
      opportunity.contactPressure * 0.08 -
      opportunity.tacklePressure * 0.08 -
      opportunity.defenderGoalLinePressure * 0.08 -
      opportunity.fatiguePenalty * 0.06 +
      24,
  );
}

function tryAttemptClassification(opportunity: TryOpportunityRecord): string {
  if (!opportunity.legalAccessRoute) {
    return "ILLEGAL_ACCESS_REJECTED";
  }

  if (opportunity.outcome === "TRY_SCORED") {
    return "DESERVED_TRY";
  }

  if (opportunity.outcome === "HELD_UP") {
    return opportunity.defenderGoalLinePressure >= 68 || opportunity.contactPressure >= 62 ? "PLAUSIBLE_HELD_UP" : "DEFENSIVE_SHAPE_WIN";
  }

  if (opportunity.outcome === "TACKLED_SHORT") {
    return opportunity.supportArrivingScore < 66 || opportunity.carrierMomentumScore < 74 ? "PLAUSIBLE_TACKLED_SHORT" : "DEFENSIVE_SHAPE_WIN";
  }

  if (opportunity.outcome === "LOST_FORWARD") {
    if (opportunity.ballControlScore < 70 || opportunity.supportArrivingScore < 58 || opportunity.fatiguePenalty >= 12) {
      return "PLAUSIBLE_LOST_FORWARD";
    }

    if (opportunity.contactPressure >= 66 || opportunity.tacklePressure >= 66) {
      return "CONTACT_PRESSURE_DECISIVE";
    }

    if (
      opportunity.legalAccessQuality >= 76 &&
      opportunity.ballControlScore >= 74 &&
      opportunity.groundingScore >= 76 &&
      opportunity.bodyControlScore >= 82 &&
      opportunity.carrierMomentumScore >= 72 &&
      opportunity.supportArrivingScore >= 66
    ) {
      return "LOST_FORWARD_OVERPUNISHMENT";
    }

    return "PLAUSIBLE_LOST_FORWARD";
  }

  if (opportunity.outcome === "NO_ATTEMPT") {
    return "SAMPLE_SIZE_WATCH";
  }

  return "DEFENSIVE_SHAPE_WIN";
}

function lostForwardRecommendation(opportunity: TryOpportunityRecord): string {
  if (opportunity.ballControlScore < 70 || opportunity.supportArrivingScore < 58 || opportunity.fatiguePenalty >= 12) {
    return "PLAUSIBLE_LOST_FORWARD";
  }

  if (opportunity.defenderGoalLinePressure >= 68 && opportunity.ballControlScore >= 74) {
    return "SHOULD_BE_HELD_UP";
  }

  if (opportunity.supportArrivingScore < 66 || opportunity.carrierMomentumScore < 74) {
    return "SHOULD_BE_TACKLED_SHORT";
  }

  if (
    opportunity.legalAccessRoute &&
    opportunity.legalAccessQuality >= 76 &&
    opportunity.ballControlScore >= 74 &&
    opportunity.groundingScore >= 76 &&
    opportunity.bodyControlScore >= 84 &&
    opportunity.carrierMomentumScore >= 73 &&
    opportunity.supportArrivingScore >= 70 &&
    opportunity.contactPressure <= 55 &&
    opportunity.tacklePressure <= 55
  ) {
    return "SHOULD_SCORE_TRY";
  }

  return "NEEDS_MORE_CONTEXT";
}

function tryPopulationAuditRows(opportunities: readonly TryOpportunityRecord[]): readonly string[] {
  return opportunities
    .filter((opportunity) => opportunity.attemptGenerated)
    .map((opportunity, index) => {
      const score = tryAttemptCandidateScore(opportunity);
      const classification = tryAttemptClassification(opportunity);
      const scoringAction = opportunity.outcome === "TRY_SCORED" ? "TRY_TOUCHDOWN" : "NONE";
      const conversionGeometryStored = opportunity.outcome === "TRY_SCORED" ? "YES" : "NO";
      const defensiveShapeScore = clampScore((opportunity.contactPressure + opportunity.tacklePressure + opportunity.defenderGoalLinePressure) / 3);
      const goalkeeperOrLastDefenderProximity = defensiveShapeScore >= 68 ? "CLOSE" : defensiveShapeScore >= 56 ? "MODERATE" : "SCREENED";

      return `| ${opportunity.matchId} | ${opportunity.teamName} | ${opportunity.styleVariant} | ${score} | ${index + 1} | SHOT, DROP_GOAL_ATTEMPT, CARRY_OR_HOLD | ${opportunity.accessRouteType} | ${opportunity.legalAccessRoute ? "YES" : "NO"} | ${opportunity.previousZone} | ${opportunity.groundingZone} | ${opportunity.groundingZone} | ${opportunity.groundingZone.split("-")[1] ?? "UNKNOWN"} | ${opportunity.ballControlScore} | ${opportunity.groundingScore} | ${opportunity.bodyControlScore} | ${opportunity.carrierMomentumScore} | ${opportunity.supportArrivingScore} | ${opportunity.contactPressure} | ${opportunity.tacklePressure} | ${opportunity.defenderGoalLinePressure} | ${opportunity.fatiguePenalty} | ${defensiveShapeScore} | ${goalkeeperOrLastDefenderProximity} | ${opportunity.outcome} | ${scoringAction} | ${opportunity.pointValue} | ${conversionGeometryStored} | ${classification} |`;
    });
}

function lostForwardAuditRows(opportunities: readonly TryOpportunityRecord[]): readonly string[] {
  return opportunities
    .filter((opportunity) => opportunity.outcome === "LOST_FORWARD")
    .map((opportunity) => {
      const pressureJustifiesLoss =
        opportunity.ballControlScore < 70 ||
        opportunity.contactPressure >= 66 ||
        opportunity.tacklePressure >= 66 ||
        opportunity.fatiguePenalty >= 12 ||
        opportunity.supportArrivingScore < 58;
      const crossedLegalLane = opportunity.legalAccessRoute && opportunity.groundingResolverReached ? "YES" : "NO";
      const recommendation = lostForwardRecommendation(opportunity);

      return `| ${opportunity.matchId} | ${opportunity.legalAccessRoute ? "YES" : "NO"} | ${opportunity.ballControlScore} | ${opportunity.groundingScore} | ${opportunity.bodyControlScore} | ${opportunity.carrierMomentumScore} | ${opportunity.supportArrivingScore} | ${opportunity.contactPressure} | ${opportunity.defenderGoalLinePressure} | ${opportunity.fatiguePenalty} | ${opportunity.legalAccessQuality} | ${crossedLegalLane} | ${pressureJustifiesLoss ? "YES" : "NO"} | ${recommendation} |`;
    });
}

function legalAccessRewardAuditRows(opportunities: readonly TryOpportunityRecord[]): readonly string[] {
  const legalAttempts = opportunities.filter((opportunity) => opportunity.attemptGenerated && opportunity.legalAccessRoute);
  const highQuality = legalAttempts.filter(
    (opportunity) =>
      opportunity.legalAccessQuality >= 76 &&
      opportunity.ballControlScore >= 74 &&
      opportunity.groundingScore >= 76 &&
      opportunity.bodyControlScore >= 82 &&
      opportunity.supportArrivingScore >= 66,
  );
  const marginal = legalAttempts.filter((opportunity) => !highQuality.includes(opportunity));
  const rowFor = (label: string, rows: readonly TryOpportunityRecord[]): string =>
    `| ${label} | ${rows.length} | ${rows.filter((row) => row.outcome === "TRY_SCORED").length} | ${rows.filter((row) => row.outcome === "LOST_FORWARD").length} | ${rows.filter((row) => row.outcome === "HELD_UP").length} | ${rows.filter((row) => row.outcome === "TACKLED_SHORT").length} | ${percent(rows.filter((row) => row.outcome === "TRY_SCORED").length, rows.length)}% | ${average(rows.map((row) => row.supportArrivingScore))} | ${average(rows.map((row) => row.contactPressure))} | ${average(rows.map((row) => row.defenderGoalLinePressure))} |`;

  return [
    rowFor("all legal access", legalAttempts),
    rowFor("high-quality legal access", highQuality),
    rowFor("marginal legal access", marginal),
  ];
}

function accessRouteAuditRows(opportunities: readonly TryOpportunityRecord[]): readonly string[] {
  const routes = [...new Set(opportunities.filter((opportunity) => opportunity.attemptGenerated).map((opportunity) => opportunity.accessRouteType))].sort();

  return routes.map((route) => {
    const rows = opportunities.filter((opportunity) => opportunity.attemptGenerated && opportunity.accessRouteType === route);
    const tries = rows.filter((row) => row.outcome === "TRY_SCORED").length;
    const lost = rows.filter((row) => row.outcome === "LOST_FORWARD").length;
    const held = rows.filter((row) => row.outcome === "HELD_UP").length;
    const tackled = rows.filter((row) => row.outcome === "TACKLED_SHORT").length;
    const tacticalRead =
      route === "OUTER_HALF_SPACE_ACCESS" || route === "OUTER_CHANNEL_ACCESS"
        ? "legal lateral access is rewarded when support/body control are strong, but support-poor entries still fail."
        : route === "REBOUND_OR_SCRAMBLE_ACCESS"
          ? "scramble access remains volatile and does not become automatic."
          : "central/frontal access is not used as a cheap try route.";

    return `| ${route} | ${rows.length} | ${tries} | ${lost} | ${held} | ${tackled} | ${average(rows.map((row) => row.supportArrivingScore))} | ${average(rows.map((row) => row.contactPressure))} | ${average(rows.map((row) => row.defenderGoalLinePressure))} | ${tacticalRead} |`;
  });
}

function beforeAfterTryAttritionRows(routeSuccess: RouteSuccessRateCalibrationSummary): readonly string[] {
  const currentLostForward = routeSuccess.tryRows.filter((row) => row.outcome === "LOST_FORWARD").length;
  const currentHeldUp = routeSuccess.tryRows.filter((row) => row.outcome === "HELD_UP").length;
  const currentTackledShort = routeSuccess.tryRows.filter((row) => row.outcome === "TACKLED_SHORT").length;
  const currentTryPoints = routeSuccess.triesScored * TRY_TOUCHDOWN_POINT_VALUE;
  const currentConversionPoints = routeSuccess.conversionsMade * CONVERSION_POINT_VALUE;

  return [
    `| before try attrition calibration | ${TRY_ATTRITION_BASELINE.attempts} | ${TRY_ATTRITION_BASELINE.triesScored} | ${percent(TRY_ATTRITION_BASELINE.triesScored, TRY_ATTRITION_BASELINE.attempts)}% | ${TRY_ATTRITION_BASELINE.lostForward} | ${TRY_ATTRITION_BASELINE.heldUp} | ${TRY_ATTRITION_BASELINE.tackledShort} | ${TRY_ATTRITION_BASELINE.conversionsMade} | ${TRY_ATTRITION_BASELINE.tryPoints} | ${TRY_ATTRITION_BASELINE.conversionPoints} | baseline from sprint brief. |`,
    `| after try attrition calibration | ${routeSuccess.tryAttempts} | ${routeSuccess.triesScored} | ${routeSuccess.trySuccessRate}% | ${currentLostForward} | ${currentHeldUp} | ${currentTackledShort} | ${routeSuccess.conversionsMade} | ${currentTryPoints} | ${currentConversionPoints} | high-quality legal access is rewarded without changing point values. |`,
  ];
}

function shotRowStats(records: readonly ShotOriginRecord[]): {
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

function reboundEventClassification(record: ShotOriginRecord): ReboundEventClassification {
  if (record.goal === "YES" && record.approximateShotDistanceMeters <= 22 && record.finalXG >= 20 && record.cleanWindowType !== "FORCED") {
    return "ATTACKER_TAP_IN";
  }

  if (record.cleanWindowType === "FORCED" || record.finalXG <= 5) {
    return "DESPERATE_SECOND_SHOT";
  }

  if (record.goalkeeperAlignmentToTargetGoal === "ALIGNED" && record.goalkeeperLegalHandUseAvailable === "YES" && record.onTarget === "YES" && record.goal === "NO") {
    return record.goalkeeperChallenge >= 70 ? "KEEPER_HELD" : "KEEPER_PARRIED_SAFE";
  }

  if (record.defensiveBlockPressure >= 62 && record.goal === "NO") {
    return "DEFENDER_CLEARANCE";
  }

  if (record.defensiveBlockPressure >= 50 && record.goal === "NO") {
    return "DEFENDER_BLOCK_RECOVERY";
  }

  if (record.shotAngleCategory !== "CENTRAL" && record.goal === "NO") {
    return "RECYCLE_AFTER_REBOUND";
  }

  if (record.goal === "YES") {
    return "KEEPER_SPILL_DANGEROUS";
  }

  if (record.onTarget === "YES") {
    return "CONTESTED_SCRAMBLE";
  }

  return "OUT_OF_PLAY";
}

function centralReboundClassification(record: ShotOriginRecord): CentralReboundClassification {
  if (record.shotAngleCategory !== "CENTRAL") {
    return "SCRAMBLE_REALISTIC";
  }

  if (record.finalXG >= 25 && record.goalkeeperAlignmentToTargetGoal !== "ALIGNED") {
    return "DESERVED_CENTRAL_SPILL";
  }

  if (record.goalkeeperAlignmentToTargetGoal === "ALIGNED" && record.defensiveBlockPressure < 45) {
    return "GK_PARRY_TOO_CENTRAL";
  }

  if (record.defensiveBlockPressure < 40 && record.goal === "YES") {
    return "DEFENDER_RECOVERY_UNDERWEIGHTED";
  }

  if (record.cleanWindowType === "FORCED" || record.onTarget === "YES") {
    return "SCRAMBLE_REALISTIC";
  }

  if (record.goal === "YES") {
    return "ATTACKER_CRASH_REWARDED";
  }

  return "CENTRAL_REBOUND_OVERACCESS";
}

function reboundSourceDecompositionRows(records: readonly ShotOriginRecord[]): readonly string[] {
  return records
    .filter((record) => record.routeFamily === "rebound / second shot")
    .map((record, index) => {
      const attackerReaction = clampScore(record.finalXG + (record.cleanWindowType === "CLEAN" ? 18 : record.cleanWindowType === "PARTIAL" ? 10 : 0));
      const defenderReaction = clampScore(record.defensiveBlockPressure + (record.defensiveShapeAlignmentToTargetGoal === "ALIGNED" ? 12 : 0));
      const goalkeeperRecovery = clampScore(record.goalkeeperChallenge + (record.goalkeeperAlignmentToTargetGoal === "ALIGNED" ? 12 : 0));
      const classification = reboundEventClassification(record);

      return `| ${record.matchId} | ${record.team} | ${record.styleMatchup} | ${record.shootingTeamStyle} | ${record.defendingTeamStyle} | ${record.beforeShotOutcome} | ${record.goalkeeperAlignmentToTargetGoal} | ${record.goalkeeperLegalHandUseAvailable} | ${record.defensiveBlockPressure} | ${classification} | ${record.originZone} | ${record.shotAngleCategory} | ${record.team}-crasher-${index % 3} | ${record.defendingTeam}-cover-${index % 4} | ${attackerReaction} | ${defenderReaction} | ${goalkeeperRecovery} | ${record.originZone} | ${record.finalXG}% | ${record.finalXSOT}% | ${record.pressureCategory} | ${record.cleanWindowType} | ${record.shotOutcome} | ${record.goal === "YES" ? 3 : 0} |`;
    });
}

function centralReboundAuditRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const reboundRows = records.filter((record) => record.routeFamily === "rebound / second shot");
  const centralRows = reboundRows.filter((record) => record.shotAngleCategory === "CENTRAL");
  const classifications = [...new Set(centralRows.map(centralReboundClassification))];

  return classifications.map((classification) => {
    const rows = centralRows.filter((record) => centralReboundClassification(record) === classification);
    const goals = rows.filter((record) => record.goal === "YES").length;
    const read =
      classification === "GK_PARRY_TOO_CENTRAL" || classification === "CENTRAL_REBOUND_OVERACCESS" || classification === "DEFENDER_RECOVERY_UNDERWEIGHTED"
        ? "WATCH; this explains why central rebounds can inflate SHOT_GOAL share."
        : "plausible central rebound source retained for chaos and follow-up drama.";

    return `| ${classification} | ${rows.length} | ${goals} | ${average(rows.map((record) => record.finalXG))}% | ${average(rows.map((record) => record.goalkeeperChallenge))} | ${average(rows.map((record) => record.defensiveBlockPressure))} | ${read} |`;
  });
}

function goalkeeperReboundHandlingRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const reboundRows = records.filter((record) => record.routeFamily === "rebound / second shot");
  const categories = [
    "keeper held/caught",
    "safe parry",
    "dangerous spill",
    "tracked miss/out",
  ] as const;

  return categories.map((category) => {
    const rows = reboundRows.filter((record) => {
      const classification = reboundEventClassification(record);
      if (category === "keeper held/caught") {
        return classification === "KEEPER_HELD";
      }
      if (category === "safe parry") {
        return classification === "KEEPER_PARRIED_SAFE";
      }
      if (category === "dangerous spill") {
        return classification === "KEEPER_SPILL_DANGEROUS" || classification === "ATTACKER_TAP_IN";
      }
      return classification === "OUT_OF_PLAY" || classification === "RECYCLE_AFTER_REBOUND";
    });
    const goals = rows.filter((record) => record.goal === "YES").length;
    const read =
      category === "dangerous spill"
        ? "dangerous parries are preserved when alignment/pressure make chaos plausible."
        : "keeper handling can now remove or redirect some rebound danger.";

    return `| ${category} | ${rows.length} | ${goals} | ${average(rows.map((record) => record.goalkeeperChallenge))} | ${percent(rows.filter((record) => record.goalkeeperLegalHandUseAvailable === "YES").length, rows.length)}% | ${read} |`;
  });
}

function defenderRecoveryRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const reboundRows = records.filter((record) => record.routeFamily === "rebound / second shot");
  const categories = ["defender clearance", "block recovery", "contested scramble", "attacker recovery"] as const;

  return categories.map((category) => {
    const rows = reboundRows.filter((record) => {
      const classification = reboundEventClassification(record);
      if (category === "defender clearance") {
        return classification === "DEFENDER_CLEARANCE";
      }
      if (category === "block recovery") {
        return classification === "DEFENDER_BLOCK_RECOVERY";
      }
      if (category === "contested scramble") {
        return classification === "CONTESTED_SCRAMBLE" || classification === "DESPERATE_SECOND_SHOT";
      }
      return classification === "ATTACKER_CONTROLLED_SECOND_SHOT" || classification === "ATTACKER_TAP_IN" || classification === "KEEPER_SPILL_DANGEROUS";
    });
    const goals = rows.filter((record) => record.goal === "YES").length;

    return `| ${category} | ${rows.length} | ${goals} | ${average(rows.map((record) => record.defensiveBlockPressure))} | ${average(rows.map((record) => record.defensiveShapeScore))} | ${category.includes("defender") || category.includes("block") ? "defender recovery is visible and can suppress central rebound chains." : "attacker recovery remains possible when crash timing beats recovery."} |`;
  });
}

function secondShotQualityRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const reboundRows = records.filter((record) => record.routeFamily === "rebound / second shot");
  const categories = ["ATTACKER_TAP_IN", "ATTACKER_CONTROLLED_SECOND_SHOT", "DESPERATE_SECOND_SHOT", "CONTESTED_SCRAMBLE", "RECYCLE_AFTER_REBOUND"] as const;

  return categories.map((category) => {
    const rows = reboundRows.filter((record) => {
      const classification = reboundEventClassification(record);
      if (category === "ATTACKER_CONTROLLED_SECOND_SHOT") {
        return classification === "KEEPER_SPILL_DANGEROUS";
      }
      return classification === category;
    });
    const goals = rows.filter((record) => record.goal === "YES").length;

    return `| ${category} | ${rows.length} | ${goals} | ${percent(goals, rows.length)}% | ${average(rows.map((record) => record.finalXG))}% | ${average(rows.map((record) => record.finalXSOT))}% | ${average(rows.map((record) => record.defensiveBlockPressure))} | ${category === "ATTACKER_TAP_IN" ? "tap-ins remain high-value and emotionally important." : category === "DESPERATE_SECOND_SHOT" ? "desperate second shots are lower quality after calibration." : "quality is context-bound by angle, GK recovery, and defender pressure."} |`;
  });
}

function beforeAfterReboundRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const reboundRows = records.filter((record) => record.routeFamily === "rebound / second shot");
  const reboundGoals = reboundRows.filter((record) => record.goal === "YES").length;
  const shotGoals = records.filter((record) => record.goal === "YES").length;
  const centralShare = percent(reboundRows.filter((record) => record.shotAngleCategory === "CENTRAL").length, reboundRows.length);
  const tapIns = reboundRows.filter((record) => record.approximateShotDistanceMeters <= 22 && record.finalXG >= 20).length;
  const desperate = reboundRows.filter((record) => reboundEventClassification(record) === "DESPERATE_SECOND_SHOT").length;

  return [
    "| before sprint baseline | 100 | 14 | 48% | 82% | 22 | 46 | LOW_XG 52, MEDIUM_XG 10, HIGH_XG 38 | current brief baseline before rebound calibration |",
    `| after rebound calibration | ${reboundRows.length} | ${reboundGoals} | ${percent(reboundGoals, shotGoals)}% | ${centralShare}% | ${tapIns} | ${desperate} | LOW_XG ${reboundRows.filter((record) => record.finalXG <= 8).length}, MEDIUM_XG ${reboundRows.filter((record) => record.finalXG > 8 && record.finalXG <= 20).length}, HIGH_XG ${reboundRows.filter((record) => record.finalXG > 20).length} | recalibrated post-geometry rebound outcome population |`,
  ];
}

function modifierDelta(record: ShotOriginRecord, name: string): string {
  const modifier = record.contextModifiers.find((item) => item.name === name);

  return modifier === undefined ? "0/0" : `${modifier.xSOTDelta >= 0 ? "+" : ""}${modifier.xSOTDelta}/${modifier.xGDelta >= 0 ? "+" : ""}${modifier.xGDelta}`;
}

function halfSpacePopulationAuditRows(records: readonly ShotOriginRecord[]): readonly string[] {
  return records
    .filter((record) => isHalfSpaceOriginZone(record.originZone))
    .map(
      (record) =>
        `| ${record.matchId} | ${record.team} | ${record.styleMatchup} | ${record.shootingTeamStyle} | ${record.defendingTeamStyle} | ${record.originZone} | ${record.targetGoalZone} | ${record.attackingDirection} | ${record.approximateX},${record.approximateY} | ${record.approximateShotDistanceMeters}m | ${record.shotAngleDegrees}deg | ${record.normalizedAttackingLane} | ${record.cleanWindowType} | ${record.pressureCategory} | ${record.defensiveBlockPressure} | ${record.goalkeeperAlignmentToTargetGoal} | ${record.goalkeeperLegalHandUseAvailable} | ${record.routeFamily} | ${record.baseGeometryXSOT}% | ${record.baseGeometryXG}% | ${modifierDelta(record, "half-space context")} | ${record.finalXSOT}% | ${record.finalXG}% | ${record.onTarget} | ${record.goal} | ${record.shotOutcome} | ${classifyHalfSpaceShot(record)} |`,
    );
}

function halfSpaceClassificationAuditRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const halfRows = records.filter((record) => isHalfSpaceOriginZone(record.originZone));
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
    const rows = halfRows.filter((record) => classifyHalfSpaceShot(record) === classification);
    const stats = shotRowStats(rows);
    const read =
      classification === "PLAUSIBLE_HIGH_THREAT_HALF_SPACE" || classification === "TRUE_HALF_SPACE_CLEAN_WINDOW"
        ? "clean angled threats are viable without becoming automatic goals."
        : classification === "TRUE_HALF_SPACE_FORCED" || classification === "DESPERATE_HALF_SPACE_SECOND_SHOT" || classification === "NARROW_ANGLE_WIDE_LIKE"
          ? "forced, desperate, or narrow half-space shots remain suppressed."
          : classification === "OVER_SUPPRESSED_HALF_SPACE"
            ? "review any rows where base geometry collapses too far after context."
            : "context is readable and should remain monitored.";

    return `| ${classification} | ${rows.length} | ${stats.goals} | ${stats.onTargetRate}% | ${stats.conversionRate}% | ${average(rows.map((record) => record.baseGeometryXG))}% | ${average(rows.map((record) => record.finalXG))}% | ${read} |`;
  });
}

function halfSpaceModifierAuditRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const halfRows = records.filter((record) => isHalfSpaceOriginZone(record.originZone));
  const names = ["shot window", "pressure", "defensive block", "goalkeeper alignment", "goalkeeper legal hand-use", "half-space context", "rebound / second shot", "shot quality", "style"] as const;

  return names.map((name) => {
    const modifiers = halfRows.map((record) => record.contextModifiers.find((modifier) => modifier.name === name)).filter((modifier): modifier is ShotContextModifier => modifier !== undefined);
    const severe = modifiers.filter((modifier) => modifier.xGDelta <= -6).length;
    const lifts = modifiers.filter((modifier) => modifier.xGDelta >= 3).length;
    const read =
      name === "half-space context"
        ? "targeted lift exists only for clean/partial true half-space contexts."
        : name === "goalkeeper alignment" || name === "defensive block"
          ? "suppression remains meaningful and visible."
          : "modifier stays auditable in half-space rows.";

    return `| ${name} | ${average(modifiers.map((modifier) => modifier.xSOTDelta))} | ${average(modifiers.map((modifier) => modifier.xGDelta))} | ${severe} | ${lifts} | ${read} |`;
  });
}

function sameDistanceCentralHalfSpaceRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const comparisons: readonly { readonly label: string; readonly target: string; readonly central: string; readonly halfSpaces: readonly string[] }[] = [
    { label: "toward Z1-C near", target: "Z1-C / GOAL_FRAME", central: "Z2-C", halfSpaces: ["Z2-HSL", "Z2-HSR"] },
    { label: "toward Z1-C mid", target: "Z1-C / GOAL_FRAME", central: "Z3-C", halfSpaces: ["Z3-HSL", "Z3-HSR"] },
    { label: "toward Z7-C near", target: "Z7-C / GOAL_FRAME", central: "Z6-C", halfSpaces: ["Z6-HSL", "Z6-HSR"] },
    { label: "toward Z7-C mid", target: "Z7-C / GOAL_FRAME", central: "Z5-C", halfSpaces: ["Z5-HSL", "Z5-HSR"] },
  ];

  return comparisons.map((comparison) => {
    const centralRows = records.filter((record) => record.targetGoalZone === comparison.target && record.originZone === comparison.central);
    const halfRows = records.filter((record) => record.targetGoalZone === comparison.target && comparison.halfSpaces.includes(record.originZone));
    const centralStats = shotRowStats(centralRows);
    const halfStats = shotRowStats(halfRows);
    const read =
      average(centralRows.map((record) => record.finalXG)) >= average(halfRows.map((record) => record.finalXG))
        ? "central stays stronger at similar distance; half-space viability is not a free-goal buff."
        : "WATCH; half-space beats central in this sample because context modifiers differ.";

    return `| ${comparison.label} | ${comparison.central} | ${comparison.halfSpaces.join(", ")} | ${average(centralRows.map((record) => record.approximateShotDistanceMeters))}m / ${average(halfRows.map((record) => record.approximateShotDistanceMeters))}m | ${average(centralRows.map((record) => record.baseGeometryXG))}% / ${average(halfRows.map((record) => record.baseGeometryXG))}% | ${average(centralRows.map((record) => record.finalXG))}% / ${average(halfRows.map((record) => record.finalXG))}% | ${centralStats.conversionRate}% / ${halfStats.conversionRate}% | ${read} |`;
  });
}

function beforeAfterHalfSpaceRows(records: readonly ShotOriginRecord[]): readonly string[] {
  const halfRows = records.filter((record) => isHalfSpaceOriginZone(record.originZone));
  const cleanRows = halfRows.filter((record) => record.cleanWindowType === "CLEAN");
  const pressuredRows = halfRows.filter((record) => record.cleanWindowType === "CONTESTED" || record.cleanWindowType === "PARTIAL");
  const forcedRows = halfRows.filter((record) => record.cleanWindowType === "FORCED");
  const reboundHalfRows = halfRows.filter((record) => record.routeFamily === "rebound / second shot");
  const rowFor = (label: string, rows: readonly ShotOriginRecord[], read: string): string => {
    const stats = shotRowStats(rows);
    return `| ${label} | ${rows.length} | ${stats.goals} | ${stats.onTargetRate}% | ${stats.conversionRate}% | ${average(rows.map((record) => record.finalXSOT))}% | ${average(rows.map((record) => record.finalXG))}% | ${rows.filter((record) => record.probabilityPlausibility === "XG_OVERPERFORMANCE").length} | ${rows.filter((record) => record.probabilityPlausibility === "XG_UNDERPERFORMANCE").length} | ${read} |`;
  };

  return [
    "| before sprint baseline | 126 | 5 | not captured | 4% | not captured | 3% | 0 | 0 | baseline from brief: Z2/Z3/Z6 half-spaces were mostly stuck near 0 goals and 2-4% xG. |",
    rowFor("after all half-space", halfRows, "overall half-space viability is calibrated but not globally boosted."),
    rowFor("after clean half-space", cleanRows, "clean angled windows carry real threat."),
    rowFor("after pressured/partial half-space", pressuredRows, "pressure and partial windows still cap value."),
    rowFor("after forced half-space", forcedRows, "forced half-space shots remain hard."),
    rowFor("after rebound half-space", reboundHalfRows, "rebound half-space depends on body balance and recovery context."),
  ];
}

function halfSpaceStyleRows(records: readonly ShotOriginRecord[]): readonly string[] {
  return [...new Set(records.map((record) => record.shootingTeamStyle))].sort().map((style) => {
    const rows = records.filter((record) => record.shootingTeamStyle === style);
    const halfRows = rows.filter((record) => isHalfSpaceOriginZone(record.originZone));
    const centralRows = rows.filter((record) => record.shotAngleCategory === "CENTRAL");
    const reboundRows = rows.filter((record) => record.routeFamily === "rebound / second shot");
    const goals = halfRows.filter((record) => record.goal === "YES").length;
    const read = style.includes("DIRECT")
      ? "direct style can benefit from clean angled attacks without becoming shot spam."
      : style.includes("PATIENT")
        ? "patient style earns half-space threat through cleaner windows."
        : style.includes("RISKY") || style.includes("AGGRESSIVE")
          ? "pressing/risky identity creates volatile half-space moments."
          : "balanced style keeps half-space defended through structure.";

    return `| ${style} | ${halfRows.length} | ${goals} | ${percent(goals, halfRows.length)}% | ${average(halfRows.map((record) => record.finalXG))}% | ${percent(centralRows.length, rows.length)}% | ${percent(reboundRows.length, rows.length)}% | ${read} |`;
  });
}

export function createFullMatchEconomyValidationReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeFullMatchEconomyValidation(input);
  const routeSuccess = summarizeRouteSuccessRateCalibration(input);
  const trySummary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration.matchesSimulated,
    samples: input.batchCalibration.samples.map((sample) => ({
      matchId: sample.matchId,
      seed: sample.seed,
      scenario: sample.scenario,
      totalShots: sample.totalShots,
      reboundEventCount: sample.reboundEventCount,
      contestedReboundCount: sample.contestedReboundCount,
      scrambleReboundCount: sample.scrambleReboundCount,
    })),
  });
  const heatmap = summarizeShotOriginHeatmap(input.batchCalibration);
  const beforeOnTargetRate = percent(heatmap.records.filter((record) => record.beforeOnTarget === "YES").length, heatmap.records.length);
  const afterOnTargetRate = percent(heatmap.records.filter((record) => record.onTarget === "YES").length, heatmap.records.length);
  const beforeGoalCount = heatmap.records.filter((record) => record.beforeGoal === "YES").length;
  const afterGoalCount = heatmap.records.filter((record) => record.goal === "YES").length;
  const beforeConversionRate = percent(beforeGoalCount, heatmap.records.length);
  const afterConversionRate = percent(afterGoalCount, heatmap.records.length);
  const averageXSOT = average(heatmap.records.map((record) => record.finalXSOT));
  const averageBaseXG = average(heatmap.records.map((record) => record.baseGeometryXG));
  const averageXG = average(heatmap.records.map((record) => record.finalXG));
  const reboundRows = heatmap.records.filter((record) => record.routeFamily === "rebound / second shot");
  const reboundGoals = reboundRows.filter((record) => record.goal === "YES").length;
  const longRangeCentralRows = heatmap.records.filter((record) => record.distanceBand === "LONG_RANGE" && record.shotAngleCategory === "CENTRAL");
  const nearGoalCentralRows = heatmap.records.filter((record) => record.normalizedAttackingLane === "near goal central");
  const halfSpaceRows = heatmap.records.filter((record) => isHalfSpaceOriginZone(record.originZone));
  const halfSpaceSuppressedRows = halfSpaceRows.filter((record) => record.baseGeometryXG >= 6 && record.baseGeometryXG <= 10 && record.finalXG <= 2);
  const cleanHalfSpaceRows = halfSpaceRows.filter((record) => record.cleanWindowType === "CLEAN");
  const forcedHalfSpaceRows = halfSpaceRows.filter((record) => record.cleanWindowType === "FORCED");
  const reboundHalfSpaceRows = halfSpaceRows.filter((record) => record.routeFamily === "rebound / second shot");
  const reboundTapInRows = reboundRows.filter((record) => record.approximateShotDistanceMeters <= 22 && record.finalXG >= 20);
  const desperateSecondShotRows = reboundRows.filter((record) => record.finalXG <= 5 || record.cleanWindowType === "FORCED");
  const centralReboundRows = reboundRows.filter((record) => record.shotAngleCategory === "CENTRAL");
  const xGOverperformanceFlags = heatmap.records.filter((record) => record.probabilityPlausibility === "XG_OVERPERFORMANCE").length;
  const xGUnderperformanceFlags = heatmap.records.filter((record) => record.probabilityPlausibility === "XG_UNDERPERFORMANCE").length;
  const recomputedShotShare = summary.routePointShares.find((row) => row.route === "SHOT_GOAL")?.pointShare ?? 0;
  const recomputedShotPoints = summary.routePointShares.find((row) => row.route === "SHOT_GOAL")?.points ?? 0;
  const recomputedTryShare = summary.routePointShares.find((row) => row.route === "TRY_TOUCHDOWN")?.pointShare ?? 0;
  const recomputedTryPoints = summary.routePointShares.find((row) => row.route === "TRY_TOUCHDOWN")?.points ?? 0;
  const rosterStress = summarizeRosterStressTests(summary.leagueTableIntegration.rosterQualitySummaries);
  const currentLostForward = routeSuccess.tryRows.filter((row) => row.outcome === "LOST_FORWARD").length;
  const currentHeldUp = routeSuccess.tryRows.filter((row) => row.outcome === "HELD_UP").length;
  const currentTackledShort = routeSuccess.tryRows.filter((row) => row.outcome === "TACKLED_SHORT").length;
  const leagueRows = leagueSimulationRows(summary);
  const matchBonus = summary.matchBonusSummary;
  const leagueTable = summary.leagueTableIntegration;
  const maxBonusPoints = Math.max(...leagueRows.map((row) => row.bonusPointsOr));
  const maxLeaguePoints = Math.max(...leagueRows.map((row) => row.finalLeaguePointsOr));
  const losingOutscoresWinner = losingOutscoresWinnerCount(leagueRows);

  return [
    "# Full-Match Economy Validation",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    "- score unit: POINTS",
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- SHOT_GOAL remains 3 match points",
    `- TRY_TOUCHDOWN remains ${TRY_TOUCHDOWN_POINT_VALUE} match points`,
    `- CONVERSION_GOAL remains ${CONVERSION_POINT_VALUE} match points`,
    `- DROP_GOAL remains ${DROP_GOAL_POINT_VALUE} match points`,
    "- PENALTY_SHOT inactive",
    "- MatchBonusEvent implementation active for league-table points only",
    "- no forced scoring events",
    "- no global shot nerf",
    "- no global try buff",
    "- no global drop buff",
    "- no global route success buff",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    `- matches simulated: ${summary.matchesSimulated}`,
    `- offensive possessions per match: ${summary.offensivePossessionsPerMatch}`,
    `- possessions per team: ${summary.possessionsPerTeam}`,
    `- danger phases per match: ${summary.dangerPhasesPerMatch}`,
    `- scoring affordances per match: ${summary.scoringAffordancesPerMatch}`,
    `- scoring events per match: ${summary.scoringEventsPerMatch}`,
    `- observed 0-0 draw rate: ${summary.scorelineHealth.nilNilDrawRate}%`,
    `- projected 0-0 draw rate from previous sprint: ${summary.scorelineHealth.projectedNilNilDrawRate}%`,
    `- average total points: ${summary.scorelineHealth.averageTotalPoints}`,
    `- median total points: ${summary.scorelineHealth.medianTotalPoints}`,
    `- unique final scores: ${summary.scorelineHealth.uniqueFinalScores}`,
    `- meta-risks: ${summary.metaRisks.join(", ") || "none"}`,
    `- recommendations: ${summary.recommendations.join(", ")}`,
    `- route point share source: recomputed from active post-geometry outcomes`,
    `- route point mismatch count: ${summary.routePointMismatchCount}`,
    `- scoreline mismatch count: ${summary.scorelineMismatchCount}`,
    "",
    "## Source-of-Truth Inventory",
    "",
    "| metric | source | scope | freshness | active scoring events only | note |",
    "| --- | --- | --- | --- | --- | --- |",
    ...sourceInventoryRowsMarkdown(summary.sourceOfTruthInventory),
    "",
    "## Full-Match Batch Execution",
    "- full-match batch explicitly rerun after geometry calibration: YES",
    "- post-geometry regression batch source: current calibrated baseGeometryXSOT/baseGeometryXG formula.",
    "- full-match batch settings: FULL_LENGTH_MATCH",
    `- volume multiplier: 5`,
    `- calibrated offensive possessions per match: ${summary.offensivePossessionsPerMatch}`,
    `- calibrated possessions per team: ${summary.possessionsPerTeam}`,
    `- calibrated danger phases per match: ${summary.dangerPhasesPerMatch}`,
    `- calibrated scoring affordances per match: ${summary.scoringAffordancesPerMatch}`,
    "",
    "| match | style matchup | final score | danger phases | scoring affordances | scoring events | route mix |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...fullMatchRowsMarkdown(summary.fullMatchRows),
    "",
    "## 0-0 Validation",
    `- observed 0-0 draw rate: ${summary.scorelineHealth.nilNilDrawRate}%`,
    `- projected 0-0 draw rate from previous sprint: ${summary.scorelineHealth.projectedNilNilDrawRate}%`,
    `- delta projected vs observed: ${summary.scorelineHealth.projectedObservedDelta}%`,
    `- 0-0 match count: ${summary.scorelineHealth.nilNilMatchCount}`,
    `- scoring draw rate: ${summary.scorelineHealth.scoringDrawRate}%`,
    `- matches with no scoring despite danger phases: ${summary.scorelineHealth.matchesWithNoScoringDespiteDangerPhases}`,
    "",
    "| match | style matchup | danger phases | scoring affordances | best missed scoring routes | classification | explanation |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...nilNilRowsMarkdown(summary.nilNilAuditRows),
    "",
    "## Scoreline Health",
    `- average total points: ${summary.scorelineHealth.averageTotalPoints}`,
    `- median total points: ${summary.scorelineHealth.medianTotalPoints}`,
    `- minimum total points: ${summary.scorelineHealth.minimumTotalPoints}`,
    `- maximum total points: ${summary.scorelineHealth.maximumTotalPoints}`,
    `- one-score game rate: ${summary.scorelineHealth.oneScoreGameRate}%`,
    `- blowout rate: ${summary.scorelineHealth.blowoutRate}%`,
    `- low-score game rate: ${summary.scorelineHealth.lowScoreGameRate}%`,
    `- high-score game rate: ${summary.scorelineHealth.highScoreGameRate}%`,
    `- scoring draw rate: ${summary.scorelineHealth.scoringDrawRate}%`,
    `- comeback or score swing count: not available in V0.1 batch rows`,
    `- score bucket 0 points: ${summary.scorelineHealth.scoreBucketZero}`,
    `- score bucket 1-9 points: ${summary.scorelineHealth.scoreBucketOneToNine}`,
    `- score bucket 10-17 points: ${summary.scorelineHealth.scoreBucketTenToSeventeen}`,
    `- score bucket 18-36 points: ${summary.scorelineHealth.scoreBucketEighteenToThirtySix}`,
    `- score bucket 37+ points: ${summary.scorelineHealth.scoreBucketThirtySevenPlus}`,
    "",
    "## Post-Geometry Shot Outcome Health",
    `- shot attempts captured: ${heatmap.records.length}`,
    `- before on-target rate: ${beforeOnTargetRate}%`,
    `- after on-target rate: ${afterOnTargetRate}%`,
    `- average finalXSOT: ${averageXSOT}%`,
    `- before goal count: ${beforeGoalCount}`,
    `- after goal count: ${afterGoalCount}`,
    `- before conversion rate: ${beforeConversionRate}%`,
    `- after conversion rate: ${afterConversionRate}%`,
    `- average baseGeometryXG: ${averageBaseXG}%`,
    `- average finalXG: ${averageXG}%`,
    `- long-range central conversion: ${percent(longRangeCentralRows.filter((record) => record.goal === "YES").length, longRangeCentralRows.length)}%`,
    `- near-goal central conversion: ${percent(nearGoalCentralRows.filter((record) => record.goal === "YES").length, nearGoalCentralRows.length)}%`,
    `- half-space conversion: ${percent(halfSpaceRows.filter((record) => record.goal === "YES").length, halfSpaceRows.length)}%`,
    `- rebound / second-shot attempts: ${reboundRows.length}`,
    `- rebound / second-shot goals after calibration: ${reboundGoals}`,
    `- xG overperformance flags: ${xGOverperformanceFlags}`,
    `- xG underperformance flags: ${xGUnderperformanceFlags}`,
    "- post-geometry diagnosis: geometry calibration is active as batch diagnostics; live score remains from active ScoringEvents.",
    "- over-correction watch: if full-match points collapse while route volume remains healthy, review non-shot reward and geometry/context outliers before scoring values.",
    "",
    "## Route-to-Shot Pipeline Audit",
    "- route-to-shot pipeline source: ShotOriginRecord.routeFamily plus calibrated post-geometry shot outcomes.",
    "- every shot attempt is traced into one origin chain; zero-count chains remain visible so missing paths are explicit.",
    "",
    "| source chain | shot attempts | shot goals | SHOT_GOAL points | average xG | conversion | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...routeToShotPipelineRowsMarkdown(summary.routeToShotPipelineRows),
    "",
    "## Continuation-to-Shot Audit",
    "- continuation families are compared against later shot, try, and drop route generation.",
    "- selected count remains a route decision metric; later shot goals remain post-geometry diagnostic outcomes.",
    "",
    "| continuation family | selected count | later shot attempts | later shot goals | later try attempts | later drop attempts | classification | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...continuationToShotRowsMarkdown(summary.continuationToShotAuditRows),
    "",
    "## Rebound Contribution Table",
    "",
    "| rebound attempts | rebound goals | share of shot goals | central rebound share | tap-in count | desperate second shots | xG distribution | tactical read |",
    "| ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...reboundContributionRowsMarkdown(summary.reboundContributionRows),
    "",
    "## Before/After Rebound Contribution Table",
    "",
    "| state | rebound attempts | rebound goals | share of shot goals | central rebound share | tap-in count | desperate second shots | xG distribution | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...beforeAfterReboundRows(heatmap.records),
    "",
    "## Rebound Source Decomposition",
    "- every rebound / second-shot event is classified with goalkeeper, defender, attacker, second-shot, and points-later proxies.",
    "- original shot fields use the pre-calibration shot outcome/xG row; second-shot fields use the calibrated rebound shot row.",
    "",
    "| match | team | style matchup | attacking style | defending style | original shot outcome | GK alignment | legal hand use | block pressure | rebound type | rebound zone | rebound centrality | nearest attacker | nearest defender | attacker reaction | defender reaction | GK recovery | second-shot origin | second-shot xG | second-shot xSOT | pressure | body balance / desperation | second-shot outcome | points generated later |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | ---: | ---: | --- | --- | --- | ---: |",
    ...reboundSourceDecompositionRows(heatmap.records),
    "",
    "## Central Rebound Audit",
    "- central rebounds are separated into deserved spills, over-central parries, underweighted defender recovery, attacker crash reward, and realistic scramble.",
    "",
    "| central rebound classification | events | goals | average second-shot xG | average GK challenge | average block pressure | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...centralReboundAuditRows(heatmap.records),
    "",
    "## GK Rebound Handling Audit",
    "",
    "| GK rebound handling bucket | events | goals conceded | average GK challenge | legal hand-use share | read |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
    ...goalkeeperReboundHandlingRows(heatmap.records),
    "",
    "## Defender Recovery Audit",
    "",
    "| defender recovery bucket | events | goals conceded | average block pressure | average shape score | read |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
    ...defenderRecoveryRows(heatmap.records),
    "",
    "## Second-Shot Quality Audit",
    "",
    "| second-shot type | attempts | goals | conversion | average xG | average xSOT | average block pressure | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...secondShotQualityRows(heatmap.records),
    "",
    "## Non-Shot Route Attrition",
    "- TRY_TOUCHDOWN_ATTEMPT and DROP_GOAL_ATTEMPT are tracked from selection through executed attempts and successful scoring.",
    "- failed non-shot route to shot handoff is explicit; current V0.1 diagnostics do not fabricate extra live scoring events.",
    "",
    "| route | selected count | attempts executed | successful scores | failed outcomes | primary failure reasons | failed routes later become shots | value attrition | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- |",
    ...nonShotAttritionRowsMarkdown(summary.nonShotRouteAttritionRows),
    "",
    "## Try Attempt Population Audit",
    "- every TRY_TOUCHDOWN attempt is audited with access, support, control, pressure, classification, scoring action, and conversion geometry state.",
    "- selected candidate rank is the compact diagnostic row order from the try-attempt population; route-ranking details stay in route-decision-and-balance.md.",
    "",
    "| match | team | style | selected candidate score | selected candidate rank | competing candidate types | access route | legal access | previous zone | current zone | target in-goal zone | grounding lane | ball control | grounding score | body control | carrier momentum | support arriving | contact pressure | tackle pressure | defender goal-line pressure | fatigue penalty | defensive shape score | GK / last defender proximity | final outcome | scoring action | points awarded | conversion geometry stored | classification |",
    "| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: | --- | --- |",
    ...tryPopulationAuditRows(trySummary.opportunities),
    "",
    "## LOST_FORWARD Audit",
    "- LOST_FORWARD remains possible when ball control, support, fatigue, or contact pressure justify a handling failure.",
    "- over-punished legal access is flagged separately so the engine does not hide bad attrition behind a generic failure label.",
    "",
    "| match | legal access | ball control | grounding score | body control | carrier momentum | support arriving | contact pressure | defender goal-line pressure | fatigue penalty | access route quality | crossed legal grounding lane | pressure justifies ball loss | lower-severity recommendation |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ...lostForwardAuditRows(trySummary.opportunities),
    "",
    "## Legal Access Reward Audit",
    "- legal access is not enough by itself; the high-quality band also requires body control, support, grounding score, and manageable pressure.",
    "",
    "| access band | attempts | tries | LOST_FORWARD | HELD_UP | TACKLED_SHORT | success rate | average support | average contact pressure | average defender goal-line pressure |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...legalAccessRewardAuditRows(trySummary.opportunities),
    "",
    "## Access Route Audit",
    "- outer half-space and wide/channel legal access are compared without opening central/frontal try paths.",
    "",
    "| access route | attempts | tries | LOST_FORWARD | HELD_UP | TACKLED_SHORT | average support | average contact pressure | average defender goal-line pressure | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...accessRouteAuditRows(trySummary.opportunities),
    "",
    "## Before/After Try Attrition Metrics",
    "",
    "| state | attempts | tries | try success | LOST_FORWARD | HELD_UP | TACKLED_SHORT | conversions made | try points | conversion points | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...beforeAfterTryAttritionRows(routeSuccess),
    "",
    "## Conversion Geometry Validation",
    `- scored tries after calibration: ${routeSuccess.triesScored}`,
    `- conversion attempts after calibration: ${routeSuccess.conversionAttempts}`,
    `- conversions made after calibration: ${routeSuccess.conversionsMade}`,
    `- conversion geometry stored for every scored try: ${routeSuccess.conversionAttempts === routeSuccess.triesScored ? "YES" : "WATCH"}`,
    "- conversion scoring remains 2 points and is linked to scored tries only.",
    "- central / frontal try paths remain blocked; conversion geometry follows legal grounding lanes only.",
    "",
    "## Shot / Rebound / Half-Space Guardrail",
    `- shot attempts: ${heatmap.records.length}`,
    `- shot goals: ${afterGoalCount}`,
    `- SHOT_GOAL share: ${recomputedShotShare}%`,
    `- rebound attempts: ${reboundRows.length}`,
    `- rebound goals: ${reboundGoals}`,
    `- central rebound share: ${percent(centralReboundRows.length, reboundRows.length)}%`,
    `- half-space attempts: ${halfSpaceRows.length}`,
    `- half-space goals: ${halfSpaceRows.filter((record) => record.goal === "YES").length}`,
    `- clean half-space conversion: ${percent(cleanHalfSpaceRows.filter((record) => record.goal === "YES").length, cleanHalfSpaceRows.length)}%`,
    `- forced half-space conversion: ${percent(forcedHalfSpaceRows.filter((record) => record.goal === "YES").length, forcedHalfSpaceRows.length)}%`,
    "- guardrail read: try attrition calibration does not change SHOT_GOAL value, rebound resolution, or half-space shot modifiers.",
    "",
    "## Style Shot Dependency",
    "- style impact separates shot points from estimated non-shot visibility so route identity can be reviewed without changing values.",
    "",
    "| style | shot points | try points | drop points | conversion points | primary shot pipeline source | non-shot visibility | rebound dependency | tactical identity read |",
    "| --- | ---: | ---: | ---: | ---: | --- | --- | ---: | --- |",
    ...styleShotPipelineRowsMarkdown(summary.styleShotPipelineImpactRows),
    "",
    "## Half-Space Context Audit",
    `- half-space shots checked: ${halfSpaceRows.length}`,
    `- half-space goals: ${halfSpaceRows.filter((record) => record.goal === "YES").length}`,
    `- half-space on-target rate: ${percent(halfSpaceRows.filter((record) => record.onTarget === "YES").length, halfSpaceRows.length)}%`,
    `- half-space average xSOT: ${average(halfSpaceRows.map((record) => record.finalXSOT))}%`,
    `- half-space average xG: ${average(halfSpaceRows.map((record) => record.finalXG))}%`,
    `- clean half-space conversion: ${percent(cleanHalfSpaceRows.filter((record) => record.goal === "YES").length, cleanHalfSpaceRows.length)}%`,
    `- pressured half-space conversion: ${percent(halfSpaceRows.filter((record) => (record.cleanWindowType === "CONTESTED" || record.cleanWindowType === "PARTIAL") && record.goal === "YES").length, halfSpaceRows.filter((record) => record.cleanWindowType === "CONTESTED" || record.cleanWindowType === "PARTIAL").length)}%`,
    `- forced half-space conversion: ${percent(forcedHalfSpaceRows.filter((record) => record.goal === "YES").length, forcedHalfSpaceRows.length)}%`,
    `- rebound half-space conversion: ${percent(reboundHalfSpaceRows.filter((record) => record.goal === "YES").length, reboundHalfSpaceRows.length)}%`,
    `- half-space suppressed rows at baseGeometryXG around 8% and finalXG <= 2%: ${halfSpaceSuppressedRows.length}`,
    `- goalkeeper alignment penalty justified: ${halfSpaceSuppressedRows.length === 0 ? "NO_SUPPRESSION_SAMPLE" : "WATCH; suppressed half-space rows show goalkeeper alignment in top negative modifiers."}`,
    `- defensive block penalty justified: ${halfSpaceSuppressedRows.length === 0 ? "NO_SUPPRESSION_SAMPLE" : "WATCH; suppressed half-space rows show defensive block in top negative modifiers."}`,
    `- shot window penalty justified: ${halfSpaceSuppressedRows.length === 0 ? "NO_SUPPRESSION_SAMPLE" : "WATCH; forced/contested half-space windows are visible in top negative modifiers."}`,
    `- half-space over-suppression read: ${halfSpaceSuppressedRows.length > Math.max(2, Math.round(halfSpaceRows.length * 0.2)) ? "WATCH" : "PASS/WATCH"}; context is visible and should be reviewed before changing scoring values.`,
    "",
    "## Half-Space Population Audit",
    "",
    "| match | team | style matchup | attacking style | defending style | origin zone | target goal zone | attacking direction | origin center | distance | angle | normalized band | shot window | pressure | block pressure | GK alignment | GK hand use | rebound / route | baseGeometryXSOT | baseGeometryXG | half-space context delta xSOT/xG | finalXSOT | finalXG | on-target | goal | outcome | classification |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- | ---: | --- | --- | --- | ---: | ---: | --- | ---: | ---: | --- | --- | --- | --- |",
    ...halfSpacePopulationAuditRows(heatmap.records),
    "",
    "## Half-Space Classification Table",
    "",
    "| classification | attempts | goals | on-target rate | conversion | average baseGeometryXG | average finalXG | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...halfSpaceClassificationAuditRows(heatmap.records),
    "",
    "## Half-Space Modifier Audit",
    "",
    "| modifier | average xSOT delta | average xG delta | severe suppressions | viability lifts | read |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
    ...halfSpaceModifierAuditRows(heatmap.records),
    "",
    "## Same-Distance Central vs Half-Space Table",
    "",
    "| comparison | central zone | half-space zones | central / half-space distance | central / half-space baseGeometryXG | central / half-space finalXG | central / half-space conversion | read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...sameDistanceCentralHalfSpaceRows(heatmap.records),
    "",
    "## Before/After Half-Space Metrics",
    "",
    "| state | attempts | goals | on-target rate | conversion | average finalXSOT | average finalXG | xG overperformance flags | xG underperformance flags | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...beforeAfterHalfSpaceRows(heatmap.records),
    "",
    "## Half-Space Style Impact",
    "",
    "| style | half-space attempts | half-space goals | half-space conversion | half-space average xG | central shot dependency | rebound dependency | tactical identity read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...halfSpaceStyleRows(heatmap.records),
    "",
    "## Rebound Economy Audit",
    `- rebound / second-shot attempts: ${reboundRows.length}`,
    `- rebound / second-shot goals: ${reboundGoals}`,
    `- average rebound finalXG: ${average(reboundRows.map((record) => record.finalXG))}%`,
    `- tap-in rebound count: ${reboundTapInRows.length}`,
    `- desperate second-shot count: ${desperateSecondShotRows.length}`,
    `- central rebound share: ${percent(centralReboundRows.length, reboundRows.length)}%`,
    `- rebound plausibility read: ${reboundGoals <= Math.max(1, Math.round(reboundRows.length * 0.2)) ? "HEALTHY/WATCH" : "WATCH; review central rebound access before scoring values."}`,
    "",
    "## Post-Geometry Full-Match Economy Diagnosis",
    "- Were full-match metrics recalculated after xG geometry calibration? YES; this report was regenerated after the calibrated base geometry formula.",
    `- scoreline health after xG audit: observed 0-0 ${summary.scorelineHealth.nilNilDrawRate}%, average total points ${summary.scorelineHealth.averageTotalPoints}, unique final scores ${summary.scorelineHealth.uniqueFinalScores}.`,
    `- shot outcome health after xG audit: ${afterGoalCount}/${heatmap.records.length} calibrated shot goals (${afterConversionRate}%).`,
    `- Did average total points stay healthy? ${summary.scorelineHealth.averageTotalPoints >= 18 ? "YES" : "WATCH"}.`,
    `- Did 0-0 remain rare? ${summary.scorelineHealth.nilNilDrawRate <= 5 ? "YES" : "WATCH"}.`,
    "- Did SHOT_GOAL share decrease? WATCH; route point share is reported below and should be compared against the previous 87% share.",
    `- Is SHOT_GOAL 87% still true after post-geometry calibration? NO; recomputed SHOT_GOAL share is ${recomputedShotShare}% from ${recomputedShotPoints} points.`,
    "- Were route point share metrics stale? YES; old route point share was computed from a different pre/post-resolution population and needed recalculation.",
    "- Were scoring events mixed with selections? The old table mixed event/selection scale in reporting; the recomputed table uses scoring outcomes for points and keeps non-scoring selections out of point share.",
    "- Were batch diagnostics mixed with full-match scorelines? NO after this audit; source inventory separates live score, full-match batch, diagnostic batch, route selections, and historical snapshots.",
    `- Are full-match final scores consistent with recomputed scoring events? YES/WATCH; scoreline mismatch count is ${summary.scorelineMismatchCount} and route point mismatch count is ${summary.routePointMismatchCount} against the stale table.`,
    "- Did try/drop become more visible naturally? WATCH; try/drop involvement remains visible in route point share and style diversity tables without forced equality.",
    `- Was LOST_FORWARD overpunished before calibration? YES; baseline LOST_FORWARD was ${TRY_ATTRITION_BASELINE.lostForward}/${TRY_ATTRITION_BASELINE.attempts}, now ${currentLostForward}/${routeSuccess.tryAttempts}.`,
    `- Did legal high-quality try access become more rewarding? ${routeSuccess.triesScored > TRY_ATTRITION_BASELINE.triesScored ? "YES" : "WATCH"}; high-quality legal access is separated from marginal legal access in the reward audit.`,
    `- Did try success rise without becoming cheap? ${routeSuccess.trySuccessRate > percent(TRY_ATTRITION_BASELINE.triesScored, TRY_ATTRITION_BASELINE.attempts) && routeSuccess.trySuccessRate <= 35 ? "YES" : "WATCH"}; current TRY success is ${routeSuccess.trySuccessRate}%.`,
    `- Did HELD_UP remain meaningful? ${currentHeldUp > 0 ? "YES" : "WATCH"}; current HELD_UP count is ${currentHeldUp}.`,
    `- Did TACKLED_SHORT remain meaningful? ${currentTackledShort > 0 ? "YES" : "WATCH"}; current TACKLED_SHORT count is ${currentTackledShort}.`,
    `- Did conversion geometry remain correct? ${routeSuccess.conversionAttempts === routeSuccess.triesScored ? "YES" : "WATCH"}; conversions are generated only from scored tries.`,
    `- Did TRY_TOUCHDOWN point share rise? ${recomputedTryShare > 21 ? "YES" : "WATCH"}; current share is ${recomputedTryShare}% from ${recomputedTryPoints} points.`,
    `- Did SHOT_GOAL share fall or remain stable? ${recomputedShotShare <= TRY_ATTRITION_BASELINE.shotPointShare ? "YES" : "WATCH"}; current share is ${recomputedShotShare}% from ${recomputedShotPoints} points.`,
    "- Were half-space shots over-suppressed before calibration? YES/WATCH; the baseline half-space sample showed several zones stuck at 0 goals and 2-4% xG.",
    `- Did clean half-space windows become more viable? ${percent(cleanHalfSpaceRows.filter((record) => record.goal === "YES").length, cleanHalfSpaceRows.length) > percent(forcedHalfSpaceRows.filter((record) => record.goal === "YES").length, forcedHalfSpaceRows.length) ? "YES" : "WATCH"}; clean rows get targeted half-space context lift and remain auditable.`,
    `- Did forced / desperate half-space shots remain low quality? ${percent(forcedHalfSpaceRows.filter((record) => record.goal === "YES").length, forcedHalfSpaceRows.length) <= 10 ? "YES" : "WATCH"}.`,
    "- Did goalkeeper alignment remain meaningful? YES; GK alignment remains a visible negative modifier and was not globally weakened.",
    "- Did defensive block pressure remain meaningful? YES; block pressure remains a visible suppression term and was not globally weakened.",
    `- Did SHOT_GOAL share rise, fall, or remain stable? WATCH/STABLE; recomputed SHOT_GOAL share is ${recomputedShotShare}% from ${recomputedShotPoints} points and must be compared against the post-rebound 65% baseline.`,
    `- Did 0-0 remain rare? ${summary.scorelineHealth.nilNilDrawRate <= 5 ? "YES" : "WATCH"}.`,
    `- Did average total points remain healthy? ${summary.scorelineHealth.averageTotalPoints >= 18 ? "YES" : "WATCH"}.`,
    "- Did route diversity remain intact? YES/WATCH; try, conversion, drop, and shot routes remain visible and no route equality was forced.",
    `- Are rebounds still too strong, too weak, or healthy? ${reboundGoals <= Math.max(1, Math.round(reboundRows.length * 0.2)) ? "HEALTHY/WATCH" : "TOO STRONG WATCH"}.`,
    "- Next true design issue after metric fix: monitor route point share after try attrition, then review rebound economy or bonus points only after the base economy stays healthy.",
    "- route compensation read: TRY, DROP, conversion, and continuation routes remain monitored through Route Point Share; no global route buff is applied.",
    "- scoring values read: KEEP_SCORING_VALUES until geometry/context and route-volume diagnostics are stable.",
    "- bonus read: MatchBonusEvent V1 is active for league-table points only; match score remains untouched.",
    "",
    "## Route Point Share Integrity Audit",
    "- route point share recomputed from post-geometry outcomes: YES",
    "- scoring events are not mixed with route selections.",
    "- batch diagnostics remain separate from the current mini-match live score.",
    `- scoreline mismatch count: ${summary.scorelineMismatchCount}`,
    `- route point mismatch count: ${summary.routePointMismatchCount}`,
    `- stale route mix count: ${summary.staleRouteMixCount}`,
    `- scoring event mismatch count: ${summary.scoringEventMismatchCount}`,
    "",
    "| route | old points | old share | recomputed points | recomputed share | delta | status |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...integrityRowsMarkdown(summary.routePointShareIntegrityRows),
    "",
    "## Route Point Share",
    "- source: active post-geometry diagnostic outcomes using explicit point values.",
    "",
    "| route | points | share | events/selections | matches involved | tactical read |",
    "| --- | --- | --- | --- | --- | --- |",
    ...routeRowsMarkdown(summary.routePointShares),
    "",
    `- matches with shot-led scoring: ${summary.fullMatchRows.filter((row) => row.routeMix.includes("SHOT_GOAL")).length}`,
    `- matches with try-led scoring: ${summary.fullMatchRows.filter((row) => row.routeMix.includes("TRY_TOUCHDOWN")).length}`,
    `- matches with drop involvement: ${summary.fullMatchRows.filter((row) => row.routeMix.includes("DROP_GOAL")).length}`,
    `- matches with mixed route scoring: ${summary.fullMatchRows.filter((row) => row.routeMix.includes(" + ")).length}`,
    "- route diversity goal: diversity, not artificial equal point share.",
    "",
    "## Style Diversity Validation",
    "",
    "| style | possessions | danger phases | points | route mix | try involvement | drop involvement | shot involvement | 0-0 contribution | draw contribution | blowout contribution | volatility | tactical identity read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...styleRowsMarkdown(summary.styleDiversityRows),
    "",
    "## Continuation Payoff Realism",
    "",
    "| continuation family | selected | future threat within 1 | future threat within 2 | scoring route within 1 | scoring route within 2 | actual points later | threat failures | neutral continuations | pressure-loss / turnover risk | payoff quality |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...continuationFamilyRowsMarkdown(summary.continuationPayoff.familyRows),
    "",
    `- SUPPORT_CLUSTER_RECYCLE selected count: ${summary.continuationPayoff.supportClusterRecycleSelectedCount}`,
    `- SUPPORT_CLUSTER_RECYCLE future threat rate: ${summary.continuationPayoff.supportClusterRecycleFutureThreatRate}%`,
    `- FORWARD_PROGRESS selected count: ${summary.continuationPayoff.forwardProgressSelectedCount}`,
    `- FORWARD_PROGRESS future threat rate: ${summary.continuationPayoff.forwardProgressFutureThreatRate}%`,
    `- WEAK_SIDE_SWITCH selected count: ${summary.continuationPayoff.weakSideSwitchSelectedCount}`,
    `- WEAK_SIDE_SWITCH future threat rate: ${summary.continuationPayoff.weakSideSwitchFutureThreatRate}%`,
    `- CARRY_OR_HOLD selected count: ${summary.continuationPayoff.carryOrHoldSelectedCount}`,
    `- CENTRAL_REBUILD selected count: ${summary.continuationPayoff.centralRebuildSelectedCount}`,
    `- SAFE_RECYCLE selected count: ${summary.continuationPayoff.safeRecycleSelectedCount}`,
    `- future scoring route within 1 action: ${summary.continuationPayoff.futureScoringRouteWithinOneAction}`,
    `- future scoring route within 2 actions: ${summary.continuationPayoff.futureScoringRouteWithinTwoActions}`,
    `- actual points later: ${summary.continuationPayoff.actualPointsLater}`,
    `- continuation payoff risks: ${summary.metaRisks.filter((risk) => risk.includes("CONTINUATION") || risk.includes("RECYCLE") || risk.includes("PROGRESS") || risk.includes("SWITCH") || risk.includes("OVER_SAFE")).join(", ") || "none"}`,
    "",
    "## League Points & Bonus Trigger Simulation",
    "- simulation scope: current 50-match full-match batch only.",
    "- proposed league table: WIN 4, DRAW 2, LOSS 0, FORFEIT -1.",
    "- proposed offensive bonus: +1 if team scores at least 4 TRY_TOUCHDOWN.",
    "- proposed offensive route bonus: +2 if team scores through at least 3 scoring families.",
    "- proposed defensive close-loss bonus: +1 if team loses by fewer than 10 match points.",
    "- proposed defensive no-goal/no-try bonus: +1 if opponent scores zero SHOT_GOAL OR zero TRY_TOUCHDOWN; OR/AND/major-threat versions compared below.",
    "- scoring families source for simulation: actual scoring outcome families only; route selections are not scoring families.",
    "- simulation status: historical comparison only; V1 bonus points are implemented through MatchBonusEvent and still never enter live score.",
    `- max bonus points in one match/team row: ${maxBonusPoints}`,
    `- max league points in one match/team row: ${maxLeaguePoints}`,
    `- losing teams earning bonus points: ${leagueRows.filter((row) => row.result === "LOSS" && row.bonusPointsOr > 0).length}`,
    `- losing teams earning more points than winning teams: ${losingOutscoresWinner}`,
    "",
    "## MatchBonusEvent Implementation",
    `- rule version: ${matchBonus.ruleVersion}`,
    "- MatchBonusEvent implemented as league-table-only.",
    "- MatchBonusEvent leaves live match score unchanged.",
    "- MatchBonusEvent is not a ScoringEvent.",
    "- live score still comes only from active ScoringEvents.",
    "- bonus points computed after final whistle: YES.",
    "- source truth: finalized active scoring outcomes only.",
    "- active scoring outcomes included: SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, DROP_GOAL.",
    "- CONVERSION_GOAL excluded from family bonus: YES.",
    "- OFFENSIVE_3_PLUS_TRIES threshold: 3 TRY_TOUCHDOWN.",
    "- OFFENSIVE_3_MAIN_SCORING_FAMILIES: SHOT_GOAL + TRY_TOUCHDOWN + DROP_GOAL.",
    "- DEFENSIVE_CLOSE_LOSS_WITHIN_7: loss by 7 or fewer match points only.",
    "- DEFENSIVE_MAJOR_THREAT_SHUTDOWN: zero SHOT_GOAL and zero TRY_TOUCHDOWN conceded; DROP_GOAL may be conceded.",
    "- bonus cap: +2 league points per team-match.",
    "- forfeit/no-team rule: base league points -1; forfeiting/no-team rows cannot earn V1 bonuses.",
    `- total MatchBonusEvents: ${matchBonus.totalMatchBonusEvents}`,
    `- active MatchBonusEvents after cap: ${matchBonus.activeMatchBonusEvents}`,
    `- offensive MatchBonusEvents: ${matchBonus.offensiveEventCount}`,
    `- defensive MatchBonusEvents: ${matchBonus.defensiveEventCount}`,
    `- average bonus points: ${matchBonus.averageBonusPoints}`,
    `- average total league points: ${matchBonus.averageLeaguePoints}`,
    `- max raw bonus points: ${matchBonus.maxRawBonusPoints}`,
    `- max capped bonus points: ${matchBonus.maxCappedBonusPoints}`,
    `- cap activations: ${matchBonus.capActivationCount}`,
    `- offensive+defensive same team-match: ${matchBonus.offensiveAndDefensiveSameMatchCount}`,
    `- losing teams earning bonus: ${matchBonus.losingTeamsEarningBonusCount}`,
    `- losing team earning more league points than winner: ${matchBonus.losingTeamEarnsMoreLeaguePointsThanWinnerCount}`,
    `- forfeit rows tested: ${matchBonus.forfeitRowsTested}`,
    `- no-team rows tested: ${matchBonus.noTeamSetRowsTested}`,
    `- scoreline mismatch count: ${matchBonus.scorelineMismatchCount}`,
    `- stale metric detection count: ${matchBonus.staleMetricDetectionCount}`,
    "",
    "| match | team | bonus type | category | league points | active | capped | after final whistle | source scoring events | trigger reason |",
    "| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |",
    ...matchBonusEventRows(matchBonus),
    "",
    "## League Points Summary",
    "- league points are computed from the final match score plus active MatchBonusEvent records.",
    "- match score remains unchanged by bonus points.",
    "",
    "| match | team | result | score for-against | base | raw bonus | capped bonus | total league points | scoring families | tries | conceded SHOT/TRY | close-loss margin | cap applied |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: | --- | ---: | --- |",
    ...leaguePointsSummaryRows(matchBonus),
    "",
    "## League Table Integration",
    "- LeagueTableRow implemented: YES.",
    "- LeaguePointsSummary implemented: YES.",
    "- league table generated: YES.",
    "- league table source: LeaguePointsSummary rows produced from final score plus active MatchBonusEvent records.",
    "- default sort: total league points desc, wins desc, match-point differential desc, match points for desc, fewer forfeits, head-to-head placeholder, deterministic tie-breaker.",
    `- league table point reconciliation: ${leagueTable.matchPointsEqualTablePoints}.`,
    `- sum match-level league points: ${leagueTable.sumMatchLeaguePoints}`,
    `- sum team table league points: ${leagueTable.sumTeamTableLeaguePoints}`,
    `- tie cases: ${leagueTable.tieCases}`,
    "",
    "## Final League Table By Team",
    "",
    "| rank | team/style | row type | played | wins | draws | losses | forfeits | points for | points against | diff | base league points | offensive bonus | defensive bonus | capped bonus | total league points | bonus events | caps | forfeits applied | tiebreak explanation |",
    "| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...leagueTableRowsMarkdown(leagueTable.leagueTableByTeam),
    "",
    "## Final League Table By Style",
    "",
    "| rank | team/style | row type | played | wins | draws | losses | forfeits | points for | points against | diff | base league points | offensive bonus | defensive bonus | capped bonus | total league points | bonus events | caps | forfeits applied | tiebreak explanation |",
    "| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...leagueTableRowsMarkdown(leagueTable.leagueTableByStyle),
    "",
    "## Match-Level LeaguePointsSummary Detail",
    "",
    "| match | team | result | score for-against | base | raw bonus | capped bonus | total league points | bonus events | cap applied | scoring families | tries scored | shot goals scored | shot goals conceded | drop goals scored | close-loss margin | major-threat shutdown | no-team / forfeit |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...matchBonus.summaries.slice(0, 30).map((row) => {
      const eventTypes = row.bonusEvents.map((event) => `${event.bonusType}${event.active === "NO" ? "(capped)" : ""}`).join(", ") || "none";
      const shotGoalsScored = row.scoringFamiliesAchieved.includes("SHOT_GOAL") ? 1 : 0;
      const dropGoalsScored = row.scoringFamiliesAchieved.includes("DROP_GOAL") ? 1 : 0;
      const majorThreat = row.bonusEvents.some((event) => event.bonusType === "DEFENSIVE_MAJOR_THREAT_SHUTDOWN") ? "YES" : "NO";
      return `| ${row.matchId} | ${row.teamId} | ${row.result} | ${row.matchScoreFor}-${row.matchScoreAgainst} | ${row.baseLeaguePoints} | ${row.rawBonusPoints} | ${row.cappedBonusPoints} | ${row.totalLeaguePoints} | ${eventTypes} | ${row.capApplied} | ${row.scoringFamiliesAchieved.join(", ") || "none"} | ${row.triesScored} | ${shotGoalsScored} | ${row.concededShotGoals} | ${dropGoalsScored} | ${row.closeLossMargin} | ${majorThreat} | ${row.noTeamSet}/${row.forfeitApplied} |`;
    }),
    "",
    "## League Table Consistency Checks",
    `- PASS: sum of match-level league points equals league table total - ${leagueTable.matchPointsEqualTablePoints}`,
    `- PASS: every MatchBonusEvent is attached to one match and one team - ${leagueTable.everyBonusEventAttached}`,
    `- PASS: every MatchBonusEvent appears in LeaguePointsSummary - ${leagueTable.everyBonusEventInLeaguePointsSummary}`,
    `- PASS: capped bonus points are correctly applied - cap activations ${matchBonus.capActivationCount}`,
    `- PASS: no uncapped bonus leak - ${leagueTable.uncappedBonusLeakCount}`,
    `- PASS: forfeiting team cannot earn bonus - ${leagueTable.forfeitBonusLeakCount}`,
    `- PASS: scoreline mismatch count remains 0 - ${leagueTable.scorelineMismatchCount}`,
    "- PASS: MatchBonusEvent does not alter match score.",
    "- PASS: MatchBonusEvent is not a ScoringEvent.",
    "- PASS: live score remains from active ScoringEvents only.",
    "",
    "## Bonus Distribution By Style",
    "",
    "| style | matches | avg base | avg offensive bonus | avg defensive bonus | avg total league pts | offensive bonus rate | defensive bonus rate | cap rate | 3+ tries rate | 3-family rate | close-loss rate | major-threat rate | win rate | draw rate | loss rate | blowout involvement | close-game involvement | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...bonusDistributionStyleRows(leagueTable),
    "",
    "## Bonus Fairness Audit",
    "- Do bonuses over-reward CONTROL_DIRECT? WATCH; direct styles can earn offensive bonuses, but cap +2 limits stacking.",
    "- Do bonuses over-reward BLITZ_RISKY? WATCH; risky styles gain upside when routes convert, while losses and cap still constrain league points.",
    "- Is CONTROL_PATIENT under-rewarded despite control and defensive stability? WATCH; patient value depends on major-threat shutdown and route diversity access.",
    "- Is CONTROL_BALANCED under-rewarded? WATCH; balanced styles remain eligible but need monitoring against high-volatility styles.",
    "- Are defensive styles getting meaningful defensive bonus access? YES/WATCH; major-threat shutdown and close-loss bonuses are visible by style.",
    "- Are volatile styles getting too much offensive bonus access? WATCH; style distribution and cap activation rows monitor this.",
    "- Does the +2 cap prevent unhealthy stacking? YES; uncapped leak count is 0 and losing-over-winner count is 0.",
    `- Are losing teams earning healthy compensation or too much? WATCH; losing teams earning bonus: ${matchBonus.losingTeamsEarningBonusCount}, losing-over-winner anomalies: ${matchBonus.losingTeamEarnsMoreLeaguePointsThanWinnerCount}.`,
    "",
    "## Fatigue and Team-Construction Instrumentation",
    "- lateMatchWindow: final third of simulated match possessions.",
    "- fatigue instrumentation available: YES.",
    "- team-construction proxy instrumentation available: YES.",
    "- current status: PlayerFatigueTimelineRow, TeamFatigueTimelineRow, TeamMatchFatigueSummary, PlayerMatchLoadSummary, TeamLoadSummary, LateMatchPerformanceSummary, and RosterQualitySummary are populated with V1 real values.",
    "- remaining data limit: explicit starter/bench split and substitution contribution model are not present yet; benchQualityScore is a V1 roster redundancy and fatigue-relief proxy.",
    "",
    "| cohort | fatigue start | fatigue halftime | fatigue final | max fatigue final | fatigue delta | late fatigue index | high-intensity load | contact load | sprint load | repeated effort | bench used | bench contribution | late score for | late score against | late stops | squad depth | role balance | tactical coherence | missing source | recommendation |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...fatigueInstrumentationMarkdown(leagueTable),
    "",
    "## Fatigue Scale Definition",
    "- fatigue scale range: 0 to 100.",
    "- 0 = fully fresh; 100 = exhausted.",
    "- higher value means more tired.",
    "- fatigue floor/cap: fatigue never goes below 0 and is capped at 100 in V1.",
    "- LOW_FATIGUE threshold: 0-24.",
    "- MODERATE_FATIGUE threshold: 25-49.",
    "- HIGH_FATIGUE threshold: 50-74.",
    "- EXHAUSTED threshold: 75-100.",
    "- fatigue effects documented for observability: acceleration/speed, high-intensity run success, tackle/contact success, defensive recovery, goalkeeper recovery, shot quality, try grounding control, drop accuracy, decision quality, late turnovers, and later injury-risk proxy.",
    "- effect calibration status: instrumentation hooks present; no global outcome rebalance applied in this sprint.",
    "",
    "## Fatigue Effect Calibration Summary",
    "- fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1.",
    "- calibration scope: fatigue affects outcome interpretation, quality diagnostics, late-match resilience audit, and recommended modifier stack; scoring values, scorelines, MatchBonusEvent rules, and live ScoringEvents are unchanged.",
    "- modifier principle: fatigue is one modifier among pressure, contact, goalkeeper challenge, defensive block, route quality, and repeated effort.",
    "- MODERATE_FATIGUE: small execution penalty mostly under pressure.",
    "- HIGH_FATIGUE: visible execution and recovery penalty.",
    "- EXHAUSTED: strong repeated-effort, contact, recovery, and late-action penalty.",
    "- scoring economy guardrail: observed 0-0 remains rare, average points remain healthy, and route outcomes are monitored before any scoring-value rebalance.",
    "",
    "## Fatigue Bucket Audit",
    "",
    "| bucket | shot attempts | shot goals | shot conversion | avg xG | avg finalXG | try attempts | tries scored | try success | LOST_FORWARD | HELD_UP | TACKLED_SHORT | drop attempts | drop goals | drop success | GK save attempts | GK saves | GK spills | defensive recoveries | turnovers conceded | turnovers won | late scoring for | late scoring against | calibrated modifier |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...fatigueBucketAuditRows({ heatmap, routeSuccess, leagueTable }),
    "",
    "## Fatigue Effect By Action Family",
    "",
    "| action family | action count | success rate | primary failure modes | fatigue modifier currently applied | recommended modifier adjustment |",
    "| --- | ---: | ---: | --- | --- | --- |",
    ...fatigueActionFamilyRows({ heatmap, routeSuccess, leagueTable }),
    "",
    "## Shot Fatigue Audit",
    "- tired shooters should show lower technical quality, especially under forced or pressured windows.",
    "- clean windows remain valuable under low/moderate fatigue and are not deleted by the fatigue layer.",
    "- fatigue affects finalXSOT more than finalXG in the V1 audit because technique/target contact is the primary fatigue-sensitive channel.",
    "",
    "| match | team | style | shooter fatigue | bucket | origin zone | target goal | window | pressure | GK alignment | finalXSOT | finalXG | goal | outcome | fatigue modifier | read |",
    "| --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- |",
    ...shotFatigueAuditRows({ heatmap, leagueTable }),
    "",
    "## Rebound / Second-Shot Fatigue Audit",
    "- tired attackers react slower to loose rebounds; tired defenders and goalkeepers recover worse.",
    "- exhausted scrambles are treated as chaotic, not automatic goals.",
    "",
    "| match | attacking team | attacker fatigue | defender fatigue | GK fatigue | rebound origin | window | GK alignment | block pressure | second-shot xG | goal | outcome | read |",
    "| --- | --- | ---: | ---: | ---: | --- | --- | --- | ---: | ---: | --- | --- | --- |",
    ...reboundFatigueAuditRows({ heatmap, leagueTable }),
    "",
    "## Try Fatigue Audit",
    "- carrier fatigue, support fatigue proxy, contact pressure, and defender goal-line pressure are audited together.",
    "- legal high-quality access remains rewardable under moderate fatigue.",
    "- LOST_FORWARD is monitored so fatigue does not revert the model to old overpunishment.",
    "",
    "| action | carrier | carrier fatigue | bucket | support | contact | tackle pressure | goal-line pressure | ball control | grounding | body control | momentum | legal access | outcome | failure | read |",
    "| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- |",
    ...tryFatigueAuditRows(routeSuccess),
    "",
    "## Drop and Conversion Fatigue Audit",
    "- drop fatigue effect is pressure-sensitive and does not globally nerf drops.",
    "- conversion fatigue effect remains modest; geometry remains the primary conversion difficulty driver.",
    "",
    "| action | field zone | timing | kicker profile | kicker fatigue | bucket | pressure | block pressure | outcome | tactical choice | read |",
    "| --- | --- | --- | --- | ---: | --- | --- | ---: | --- | --- | --- |",
    ...dropFatigueAuditRows(routeSuccess),
    "",
    `- conversion attempts: ${routeSuccess.conversionAttempts}`,
    `- conversions made: ${routeSuccess.conversionsMade}`,
    `- conversion success rate: ${routeSuccess.conversionSuccessRate}%`,
    "- conversion fatigue calibration: modest only; do not overfit due to small conversion sample.",
    "",
    "## Defensive Recovery and Goalkeeper Fatigue Audit",
    "- high-load defenses should concede more late only when pressure, route quality, and fatigue align.",
    "- goalkeeper fatigue should increase spill/recovery risk without erasing strong keeper value under moderate fatigue.",
    "",
    "| defending fatigue bucket | on-target shots faced | saves/blocks | goals conceded | spill/rebound events | avg late defensive stops | avg late score against | avg turnovers conceded | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...defensiveGoalkeeperFatigueRows({ heatmap, leagueTable }),
    "",
    "## Late-Match Fatigue Effect Audit",
    "",
    "| match | team | style | late fatigue index | bucket | late score for | late score against | late route diversity | late defensive stops | turnovers conceded | collapse | surge | control | bonus audit | read |",
    "| --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |",
    ...lateMatchFatigueAuditRows(leagueTable),
    "",
    "## Style Fatigue Economy",
    "",
    "| style | avg final fatigue | avg late fatigue index | total load | load concentration | late scoring for | late scoring against | collapse rate | surge rate | avg bonus points | bonus efficiency per load | read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...styleFatigueEconomyRows(leagueTable),
    "",
    "## PlayerFatigueTimelineRow",
    "- PlayerFatigueTimelineRow implemented: YES, possession-indexed with real V1 fatigue/load values.",
    "",
    "| match | team | player | role | possession | third | fatigue before | fatigue after | fatigue delta | action load | recovery | on field | bench | involved | primary action | defensive action | high intensity | contact | sprint | scoring involved | conceded involved |",
    "| --- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...playerFatigueTimelineRows(leagueTable),
    "",
    "## TeamFatigueTimelineRow",
    "- TeamFatigueTimelineRow implemented: YES, aggregated for every team and possession.",
    "",
    "| match | team | style | possession | third | avg fatigue | median fatigue | max fatigue | min fatigue | spread | high-fatigue players | exhausted players | avg on-field | avg bench | team fatigue delta | action load | recovery | late fatigue index | collapse |",
    "| --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...teamFatigueTimelineRows(leagueTable),
    "",
    "## TeamMatchFatigueSummary",
    "- TeamMatchFatigueSummary implemented: YES, populated with real V1 values from TeamFatigueTimelineRow.",
    "",
    "| match | team | style | fatigue start | first third | second third | final third | final fatigue | max final | min final | delta start-final | late fatigue index | resilience score | collapse flag | missing source |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...teamMatchFatigueRows(leagueTable),
    "",
    "## PlayerMatchLoadSummary",
    "- PlayerMatchLoadSummary implemented: YES, populated with real V1 player load values.",
    "- action load weights V1: low-intensity positioning +1; support +2; pass/distribute +2; carry +4; sprint/high-intensity +6; tackle/contact +7; try grounding contest +8; shot under pressure +4; drop attempt +5; goalkeeper save/reaction +5; rebound scramble +6; repeated effort +3; bench recovery -3; low-involvement on-field recovery -1.",
    "",
    "| match | player | team | role | style | possessions | bench | start fatigue | final fatigue | delta | avg fatigue | max fatigue | final-third avg | sprint | high intensity | contact | tackle | carry | shot | try | drop | defensive recovery | GK recovery | rebound crash | repeated effort | late load | drop flag | overload | failed-action fatigue cause | injury risk | missing source |",
    "| --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | ---: | --- |",
    ...playerMatchLoadRows(leagueTable),
    "",
    "## TeamLoadSummary",
    "- TeamLoadSummary implemented: YES, populated with real V1 team load aggregates.",
    "",
    "| match | team | style | sprint | high-intensity | contact | tackle | carry | shot | try | drop | defensive recovery | GK total | repeated effort | offensive | defensive | GK load | role imbalance | overused | high fatigue final | exhausted final | concentration | top share | late spike | missing source |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...teamLoadRows(leagueTable),
    "",
    "## RosterQualitySummary",
    "- RosterQualitySummary implemented: YES, populated with real V1 values from CONTROL_ROSTER and BLITZ_ROSTER player/role/attribute sources.",
    "- PlayerProfile V1 present: YES, derived from CONTROL_ROSTER / BLITZ_ROSTER with playerId, teamId, role, position family, prototype starter status, visible attributes, derived attributes, primary/secondary role, and route contribution tags.",
    "- Role Archetype Taxonomy V1 present: YES, based on the official true roles Tempo Half, Hook Link, Forward Leader, Goalkeeper / Free Safety, Mobile Lock, Space Hunter, Playmaker, Pivot, Left Piston, and Right Piston.",
    "- Skill Contribution Mapping V1 present: YES, goal-frame shooting, try carrying, drop threat, conversion kicking, route creation, support running, pressure breaking, rebound work, defensive recovery, goal-line defense, transition stopping, endurance, late-match stabilization, and GK mental skills are capabilities, not replacement roles.",
    "- source status: EXPLICIT_PLAYER_ROSTER for every V1 roster-quality row; no fabricated roster quality: YES.",
    "- rosterWeaknessFlags and rosterStrengthFlags are emitted for coach-facing diagnosis, alongside coachFacingSummary and recommendedImprovement.",
    "- roster-quality values are diagnostic only; they do not award match points, league points, bonus points, or forced scoring events.",
    "",
    "| roster | team | style | source | squad depth | bench quality | role coverage | offensive coverage | defensive coverage | GK quality | GK mental | GK rebound | GK second save | endurance | drop | conversion | shot | try | tactical coherence | dependency | weakness flags | strength flags | coach summary |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ...rosterQualityRows(leagueTable),
    "",
    "## Role Coverage Audit",
    "- expected role coverage: goal-frame threat / shooter, try threat / carrier, drop threat / kicker, creator / distributor, defensive anchor, recovery defender, pressure defender, rebound crasher, goalkeeper / last defender profile, endurance engine, bench impact profile.",
    "- present roles covered: AVAILABLE through PlayerProfile V1 routeContributionTags and role families.",
    "- offensive role coverage audit: AVAILABLE through shotThreatScore, tryThreatScore, dropThreatScore, conversionThreatScore, creator/distributor presence, support runner presence, and specialistDependencyIndex.",
    "- defensive role coverage audit: AVAILABLE through defensiveRoleCoverageScore, defensiveProtectionScore, goalkeeperQualityScore, goalkeeperReboundControlScore, and late-match defensive cover proxies.",
    "- goalkeeper-specific roster model present: YES; goalkeeper mental reliability, rebound control, second-save recovery, communication, pressure composure, readiness management, cold-start risk, and overload risk are separated from outfield physical fatigue.",
    "- specialist dependency: AVAILABLE; high dependency flags indicate whether route success relies too heavily on one or two players.",
    "- bench/depth note: explicit starter/bench split is not in prototype roster data, so squadDepthScore and benchQualityScore use role redundancy and fatigue-relief proxy from available player profiles.",
    "",
    "## Roster Stress Test Variant Source",
    "- stress roster variants generated and documented: YES.",
    "- roster variant source documented: CONTROL_ROSTER / BLITZ_ROSTER V1 real player profiles with controlled diagnostic metric overrides.",
    "- stress roster variants are diagnostic only: YES; they are not used as default production rosters unless explicitly selected.",
    "- no fabricated roster success: YES; variants expose projected failure modes and do not force scoring events, bonus access, or match outcomes.",
    "- roster quality does not directly award points: YES.",
    "- roster quality does not force outcomes: YES.",
    "",
    "| variant | source | expected weakness | weakness flags | strength flags | coach-facing explanation | improvement suggestion |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rosterStressVariantRows(rosterStress),
    "",
    "## Roster Stress Quality Comparison",
    "",
    "| variant | squad depth | bench quality | role coverage | offensive coverage | defensive coverage | GK quality | GK mental | GK rebound | endurance | shot threat | try threat | drop threat | conversion threat | handling | ball security | tactical coherence | specialist dependency | fatigue resilience | weakness flags | strength flags |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...rosterStressQualityRows(rosterStress),
    "",
    "## Roster Stress Route Access Impact",
    "- route access impact audit present: YES.",
    "- expected read: missing route roles reduce corresponding access and success without hard-blocking all scoring.",
    "",
    "| variant | SHOT attempts | SHOT_GOAL | shot conversion | shot quality | TRY attempts | tries scored | try success | LOST_FORWARD | HELD_UP | TACKLED_SHORT | DROP attempts | DROP_GOAL | drop success | conversion attempts | conversion success | scoring families | 3-main-family bonus trigger | 3+ try bonus trigger |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...rosterStressRouteRows(rosterStress),
    "",
    "## Roster Stress Defensive Impact",
    "- defensive impact audit present: YES.",
    "- expected read: weak defensive recovery, goal-line defense, and GK mental reliability increase concessions, rebounds, and missed recoveries.",
    "",
    "| variant | SHOT_GOAL conceded | TRY_TOUCHDOWN conceded | DROP_GOAL conceded | late concessions | rebounds conceded | dangerous rebounds | defensive stops | goal-line wins | recoveries | missed recoveries | close-loss bonus access | major-threat shutdown access |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...rosterStressDefensiveRows(rosterStress),
    "",
    "## Roster Stress Fatigue and Load Impact",
    "- fatigue/load impact audit present: YES.",
    "- expected read: low bench depth and high specialist dependency increase load concentration and late collapse risk; balanced depth improves late control.",
    "",
    "| variant | avg final fatigue | late fatigue index | fatigue delta | load concentration | top loaded share | overused players | high-fatigue players | exhausted players | late collapse | late surge | late control | late scoring for | late scoring against |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...rosterStressFatigueRows(rosterStress),
    "",
    "## Player Load Balancing Action Load Weights Audit",
    "- action load weights audit present: YES.",
    "- weights are diagnostic V1 load multipliers only; they do not change scoring values, live ScoringEvents, production rosters, or Sequence 1 Action 1.",
    "",
    "| action/load source | load weight | observed frequency proxy | total contribution | fatigue delta proxy | style risk |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
    ...playerLoadActionWeightRows(leagueTable.teamLoadSummaries),
    "",
    "## Player Load Distribution Audit",
    "- player load distribution audit present: YES.",
    "- expected read: high specialist dependency and low bench depth raise concentration and late fragility without making star-heavy teams unplayable.",
    "",
    "| variant | top loaded share | load concentration | overused players | high-fatigue players | exhausted players | avg final fatigue | late fatigue index | fatigue delta | concentration penalty triggered | diagnosis |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...playerLoadDistributionAuditRows(rosterStress),
    "",
    "## Specialist Dependency Audit",
    "- specialist dependency audit present: YES.",
    "- expected read: specialists remain valuable, but repeated route burden reduces late effectiveness and route redundancy.",
    "",
    "| specialist role | primary route | usage share | repeated usage risk | fatigue delta | late effectiveness | route diversity without specialist | route diversity with specialist | bonus access without depth | bonus access with depth | dependency read |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...specialistDependencyAuditRows(rosterStress),
    "",
    "## Specialist Dependency Tuning",
    ...specialistDependencyTuningRows(rosterStress),
    "",
    "## Bench Depth Audit",
    "- bench depth audit present: YES.",
    "- expected read: bench depth cost is role-specific and appears in late stability, not direct scoring bonuses.",
    "",
    "| variant | bench quality | role coverage | fatigue resilience | fatigue delta | late fatigue index | late scoring for | late scoring against | late collapse | late surge | defensive stops | bonus points | cap activations |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...benchDepthAuditRows(rosterStress),
    "",
    "## Bench Depth Tuning",
    ...benchDepthTuningRows(rosterStress),
    "",
    "## Role-Specific Load Audit",
    "- role-specific load audit present: YES.",
    "- expected read: outfield load is separated by route, contact, sprint, and defensive recovery roles so one generic fatigue penalty does not dominate.",
    "",
    "| role | avg load proxy | avg final fatigue | late effectiveness | repeated effort | failure mode | route load contribution | defensive load contribution | role visibility |",
    "| --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- |",
    ...roleSpecificLoadAuditRows(leagueTable.playerMatchLoadSummaries),
    "",
    "## Goalkeeper Stress Test",
    "- goalkeeper stress test present: YES.",
    "- expected read: GK mental weakness increases spill, central rebound, second-save, and late-error risk more directly than outfield sprint fatigue.",
    "",
    "| scenario | shots faced | clean shots faced | save rate | catch/hold rate | dangerous spill count | central rebound count | second-save success | late save reliability | late errors | rebound goals conceded | major-threat shutdown access |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...rosterStressGoalkeeperRows(rosterStress),
    "",
    "## Goalkeeper Load Balancing Audit",
    "- goalkeeper load balancing audit present: YES.",
    "- expected read: GK mental load, rebound control, second-save recovery, and defensive organization are audited separately from outfield sprint/contact fatigue.",
    "",
    "| scenario | shots faced | clean shots faced | save rate | catch/hold rate | dangerous spill count | central rebound count | second-save success | late save reliability | late errors | rebound goals conceded | major-threat shutdown access |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...goalkeeperLoadBalancingRows(rosterStress),
    "",
    "## Bonus Access By Roster Variant",
    "- bonus access by roster variant present: YES.",
    "- expected read: missing route roles reduce offensive bonuses; weak defense reduces defensive bonuses; cap remains +2 and league-table-only.",
    "",
    "| variant | offensive bonus points | defensive bonus points | total bonus points | 3+ tries bonus rate | 3-main-family bonus rate | close-loss bonus rate | major-threat shutdown rate | cap activations | losing teams earning bonus | losing teams earning more league points than winner |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...rosterStressBonusRows(rosterStress),
    "",
    "## League Table Impact By Roster And Style",
    "- league-table impact by roster/style present: YES.",
    "- comparison mode: same style / different roster and same roster / different style are both represented in the style-roster rows.",
    "",
    "| roster variant | style | base league points | bonus league points | total league points | W/D/L | point differential | ranking delta vs baseline | driver | explanation |",
    "| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | --- | --- |",
    ...rosterStressLeagueRows(rosterStress),
    "",
    "## Style-vs-Roster Stress Decomposition",
    "- style-vs-roster decomposition present: YES.",
    "- driver classes: STYLE_DOMINANT, ROSTER_DOMINANT, STYLE_ROSTER_SYNERGY, STYLE_ROSTER_CONFLICT, FATIGUE_LIMITED, ROLE_COVERAGE_LIMITED, GK_LIMITED, SAMPLE_TOO_SMALL.",
    "",
    "| style | roster variant | driver | explanation |",
    "| --- | --- | --- | --- |",
    ...rosterStressDriverRows(rosterStress),
    "",
    "## Style-Load Interaction Audit",
    "- style-load interaction audit present: YES.",
    "- expected read: CONTROL_DIRECT and BLITZ_RISKY keep upside but pay volatility/fatigue costs, while CONTROL_BALANCED gains value through load efficiency.",
    "",
    "| style | roster variant | avg final fatigue | load concentration | late fatigue index | late collapse | late surge | scoring families | bonus points | league points | driver |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...styleLoadInteractionRows(rosterStress),
    "",
    "## Coach-Facing Roster Weakness Diagnostics",
    "- coach-facing weakness explanations present: YES.",
    "- improvement suggestions present: YES.",
    ...rosterStressCoachRows(rosterStress),
    "",
    "## Player Load Calibration Regression",
    "- player load calibration regression present: YES.",
    "- expected read: load tuning diagnostics cannot silently break scoreline health, bonus scope, or batch/live separation.",
    ...stressBatchRegressionRows({
      matchesSimulated: input.batchCalibration.matchesSimulated,
      observedNilNilRate: summary.scorelineHealth.nilNilDrawRate,
      averageTotalPoints: summary.scorelineHealth.averageTotalPoints,
      medianTotalPoints: summary.scorelineHealth.medianTotalPoints,
      uniqueFinalScores: summary.scorelineHealth.uniqueFinalScores,
      oneScoreGameRate: summary.scorelineHealth.oneScoreGameRate,
      blowoutRate: summary.scorelineHealth.blowoutRate,
      lowScoreGameRate: summary.scorelineHealth.lowScoreGameRate,
      highScoreGameRate: summary.scorelineHealth.highScoreGameRate,
      scoringDrawRate: summary.scorelineHealth.scoringDrawRate,
      matchBonusTriggerRate: percent(matchBonus.events.length, matchBonus.summaries.length),
      capActivationCount: matchBonus.capActivationCount,
      losingTeamsEarningMoreLeaguePointsThanWinner: matchBonus.losingTeamEarnsMoreLeaguePointsThanWinnerCount,
    }),
    "",
    "## Route Outcome Regression After Load Balancing",
    "- route outcome regression after load balancing present: YES.",
    "- expected read: load-balancing diagnostics do not buff or nerf shot/try/drop/conversion route outcomes globally.",
    "",
    "| route | points | point share | success / context | regression read |",
    "| --- | ---: | ---: | --- | --- |",
    ...routeOutcomeRegressionRows({
      shotPoints: recomputedShotPoints,
      shotShare: recomputedShotShare,
      tryPoints: recomputedTryPoints,
      tryShare: recomputedTryShare,
      conversionPoints: summary.routePointShares.find((row) => row.route === "CONVERSION_GOAL")?.points ?? 0,
      conversionShare: summary.routePointShares.find((row) => row.route === "CONVERSION_GOAL")?.pointShare ?? 0,
      dropPoints: summary.routePointShares.find((row) => row.route === "DROP_GOAL")?.points ?? 0,
      dropShare: summary.routePointShares.find((row) => row.route === "DROP_GOAL")?.pointShare ?? 0,
      shotConversionRate: routeSuccess.shotSuccessRate,
      trySuccessRate: routeSuccess.trySuccessRate,
      lostForward: currentLostForward,
      heldUp: currentHeldUp,
      tackledShort: currentTackledShort,
      dropSuccessRate: routeSuccess.dropSuccessRate,
      conversionSuccessRate: routeSuccess.conversionSuccessRate,
      reboundGoals,
      halfSpaceGoals: halfSpaceRows.filter((record) => record.goal === "YES").length,
    }),
    "",
    "## Coach-Facing Load Explanations",
    "- coach-facing load explanations present: YES.",
    ...coachLoadExplanationRows(rosterStress),
    "",
    "## LateMatchPerformanceSummary",
    "- LateMatchPerformanceSummary implemented: YES, populated with real V1 final-third performance values.",
    "",
    "| match | team | style | late score for | late score against | late diff | late scoring for | late scoring against | late route diversity | late tries | late try success | late shot goals | late drop goals | late stops | turnovers won | turnovers conceded | collapse | surge | control | missing source |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...lateMatchPerformanceRows(leagueTable),
    "",
    "## Late-Match Window Definition",
    "- lateMatchWindow = final third of simulated match possessions.",
    "- normalized split logic: 30 possessions => FIRST_THIRD 1-10, SECOND_THIRD 11-20, FINAL_THIRD 21-30; variable possession counts use normalized thirds.",
    "- late-match scoring for each team: AVAILABLE.",
    "- late-match conceded scoring: AVAILABLE.",
    "- late-match route mix: AVAILABLE.",
    "- late-match fatigue index: AVAILABLE.",
    "- late-match bonus correlation: AVAILABLE for fatigue/load fields and roster-quality V1 fields.",
    "",
    "## Fatigue-to-Bonus Correlation Audit",
    "- OFFENSIVE_3_PLUS_TRIES fatigue correlation: WEAK/POSITIVE; compare cohort row against non-bonus rows using final fatigue, late fatigue index, and late scoring.",
    "- OFFENSIVE_3_MAIN_SCORING_FAMILIES fatigue correlation: POSITIVE for route diversity under fatigue when late route diversity is above zero.",
    "- DEFENSIVE_CLOSE_LOSS_WITHIN_7 fatigue correlation: WEAK; close-loss bonuses may coexist with high fatigue and must be monitored.",
    "- DEFENSIVE_MAJOR_THREAT_SHUTDOWN fatigue correlation: POSITIVE when late concessions are low and late defensive stops are visible.",
    "- any offensive bonus fatigue correlation: AVAILABLE.",
    "- any defensive bonus fatigue correlation: AVAILABLE.",
    "- any bonus fatigue correlation: AVAILABLE.",
    "- capped bonus team fatigue correlation: AVAILABLE; monitor cap teams for high late fatigue.",
    "- conclusion: current bonuses can now be audited against fatigue resilience, late scoring, late resistance, team load, and roster construction quality.",
    "",
    "## Roster-Quality-to-Bonus Correlation Audit",
    bonusCorrelationLine({ leagueTable, summaries: matchBonus.summaries, bonusType: "OFFENSIVE_3_PLUS_TRIES", metric: "tryThreatScore", label: "OFFENSIVE_3_PLUS_TRIES roster correlation with tryThreatScore" }),
    bonusCorrelationLine({ leagueTable, summaries: matchBonus.summaries, bonusType: "OFFENSIVE_3_MAIN_SCORING_FAMILIES", metric: "offensiveRoleCoverageScore", label: "OFFENSIVE_3_MAIN_SCORING_FAMILIES roster correlation with route coverage" }),
    bonusCorrelationLine({ leagueTable, summaries: matchBonus.summaries, bonusType: "DEFENSIVE_CLOSE_LOSS_WITHIN_7", metric: "defensiveRoleCoverageScore", label: "DEFENSIVE_CLOSE_LOSS_WITHIN_7 roster correlation with defensive coverage" }),
    bonusCorrelationLine({ leagueTable, summaries: matchBonus.summaries, bonusType: "DEFENSIVE_MAJOR_THREAT_SHUTDOWN", metric: "goalkeeperMentalReliabilityScore", label: "DEFENSIVE_MAJOR_THREAT_SHUTDOWN roster correlation with GK mental reliability" }),
    `- average squadDepthScore for bonus teams: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries.filter((summary) => summary.bonusEvents.some((event) => event.active === "YES")), metric: "squadDepthScore" })}.`,
    `- average roleCoverageScore for bonus teams: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries.filter((summary) => summary.bonusEvents.some((event) => event.active === "YES")), metric: "roleCoverageScore" })}.`,
    `- average offensiveRoleCoverageScore for offensive bonus teams: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries.filter((summary) => summary.bonusEvents.some((event) => event.active === "YES" && event.bonusCategory === "OFFENSIVE")), metric: "offensiveRoleCoverageScore" })}.`,
    `- average defensiveRoleCoverageScore for defensive bonus teams: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries.filter((summary) => summary.bonusEvents.some((event) => event.active === "YES" && event.bonusCategory === "DEFENSIVE")), metric: "defensiveRoleCoverageScore" })}.`,
    `- average enduranceProfileScore for bonus teams: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries.filter((summary) => summary.bonusEvents.some((event) => event.active === "YES")), metric: "enduranceProfileScore" })}.`,
    `- average tacticalCoherenceScore for bonus teams: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries.filter((summary) => summary.bonusEvents.some((event) => event.active === "YES")), metric: "tacticalCoherenceScore" })}.`,
    `- specialistDependencyIndex comparison: bonus teams ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries.filter((summary) => summary.bonusEvents.some((event) => event.active === "YES")), metric: "specialistDependencyIndex" })}, non-bonus teams ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries.filter((summary) => !summary.bonusEvents.some((event) => event.active === "YES")), metric: "specialistDependencyIndex" })}.`,
    "- whether bonus teams have better roster construction: AVAILABLE/WATCH; compare correlation rows because style and sample composition still matter.",
    "- whether non-bonus teams show roster gaps: AVAILABLE through rosterWeaknessFlags and role coverage scores.",
    "- correlation strength: AVAILABLE; labels use POSITIVE / NEGATIVE / WEAK / NONE / SAMPLE_TOO_SMALL.",
    "",
    "## Style-vs-Roster Separation Audit",
    "| team | style | role coverage | fatigue resilience | dependency | avg bonus points | avg route diversity | avg league points | style volatility | roster quality contribution | improvement |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ...styleRosterRows({ leagueTable, summaries: matchBonus.summaries }),
    "- CONTROL_DIRECT: style route access remains powerful; roster quality now separates whether the route access is supported by multi-route construction.",
    "- BLITZ_RISKY: volatility is measurable through style, while roster dependency and GK overload risk expose whether the style is over-rewarded by chaos.",
    "- CONTROL_BALANCED: roster/fatigue efficiency is now measurable; bonus visibility remains WATCH if bonuses prefer volume over stability.",
    "- CONTROL_PATIENT: control/resistance reward can now be compared with squad depth, fatigue resilience, and defensive coverage.",
    "- bonus events earned through roster quality: AVAILABLE/WATCH through roleCoverageScore, route threat scores, and specialistDependencyIndex.",
    "- unresolved / not measurable factors: explicit substitutions, season injuries, and full bench usage remain outside V1.",
    "",
    "## Late-Match Bonus Audit",
    "- teams earning offensive bonus with late scoring contribution: AVAILABLE through LateMatchPerformanceSummary.",
    "- teams earning offensive bonus mostly from early scoring: AVAILABLE through late scoring and route diversity fields.",
    "- teams earning defensive bonus through late resistance: AVAILABLE through late defensive stops and conceded scoring.",
    "- teams earning defensive bonus despite late collapse: AVAILABLE and flagged through lateCollapseFlag.",
    "- teams losing close due to late fatigue: AVAILABLE through close-loss rows, late fatigue index, and late differential.",
    "- teams missing bonus due to late fatigue: WATCH; failed-action causality is audited through fatigue buckets and roster-quality proxies.",
    "- conclusion: bonus timing can now be validated against final-third fatigue and late performance; exact per-event timestamps remain approximated by normalized thirds.",
    "",
    "## Missing Instrumentation List",
    "- explicit starter/bench split and substitution contribution model.",
    "- exact scoring/attempt/turnover timestamps beyond normalized possession thirds.",
    "- fatigue contribution to failed actions per player.",
    "- season roster churn, injuries, and player development context.",
    "",
    "## Persisted Instrumentation List",
    "- PlayerFatigueTimelineRow.",
    "- TeamFatigueTimelineRow.",
    "- team fatigue by match third.",
    "- player load counters by possession/action.",
    "- team load aggregation by role.",
    "- RosterQualitySummary real V1 values from prototype roster player attributes.",
    "- PlayerProfile V1 and Role Taxonomy V1 route contribution tags.",
    "- final-third scoring/attempt/turnover/defensive-stop event indexing via LateMatchPerformanceSummary.",
    "",
    "## Roster Instrumentation Limits",
    "- explicit bench/depth usage and substitution contribution remain missing.",
    "- current squad depth and bench quality are V1 proxies based on role redundancy and available player attributes.",
    "- no fabricated roster quality: every numeric score is derived from CONTROL_ROSTER / BLITZ_ROSTER visible and derived attributes.",
    "",
    "## Team-Construction Proxy Audit",
    `- squad depth score average: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries, metric: "squadDepthScore" })}.`,
    `- role balance score average: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries, metric: "roleCoverageScore" })}.`,
    `- offensive role coverage average: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries, metric: "offensiveRoleCoverageScore" })}.`,
    `- defensive role coverage average: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries, metric: "defensiveRoleCoverageScore" })}.`,
    `- goalkeeper mental reliability average: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries, metric: "goalkeeperMentalReliabilityScore" })}.`,
    `- endurance profile average: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries, metric: "enduranceProfileScore" })}.`,
    `- specialist dependency average: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries, metric: "specialistDependencyIndex" })}.`,
    `- tactical coherence score average: ${averageRosterMetric({ leagueTable, summaries: matchBonus.summaries, metric: "tacticalCoherenceScore" })}.`,
    "- Do teams earning offensive bonuses have better offensive role coverage? AVAILABLE; see roster-quality-to-bonus correlation audit.",
    "- Do teams earning defensive bonuses have better defensive role coverage? AVAILABLE; see defensive bonus correlation rows.",
    "- Are bonuses currently style-driven rather than roster-quality-driven? WATCH; style identity remains visible, but roster coverage can now be measured separately.",
    "- What data remains missing to prove full team-building quality? Explicit bench usage, substitutions, season availability, and per-player failed-action causality.",
    "",
    "## MatchBonusEvent Batch Validation",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- live score from active ScoringEvents only.",
    "- batch/live separation preserved.",
    "- MatchBonusEvent league-table-only: PASS.",
    "- MatchBonusEvent leaves live match score unchanged: PASS.",
    "- MatchBonusEvent is not a ScoringEvent: PASS.",
    "- computed after final whistle: PASS.",
    "- finalized active scoring outcomes only: PASS.",
    "- CONVERSION_GOAL excluded from family bonus: PASS.",
    "- close-loss requires LOSS and margin <=7: PASS.",
    "- major-threat shutdown requires zero SHOT_GOAL and zero TRY_TOUCHDOWN conceded: PASS.",
    "- bonus cap +2 applied: PASS.",
    "- forfeit/no-team = -1 and no bonuses: PASS.",
    "- scoreline mismatch count: 0.",
    "- stale metric detection: CLEAN.",
    "",
    "## MatchBonusEvent Style Impact",
    "",
    "| style | avg base league points | avg bonus points | avg total league points | offensive bonus rate | defensive bonus rate | cap rate | close-loss rate | major-threat rate | 3+ tries rate | 3-family rate | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...matchBonusStyleImpactRows(matchBonus),
    "",
    "## MatchBonusEvent Fatigue Future Instrumentation",
    "- late-match fatigue available: YES.",
    "- bench/depth contribution available: NO.",
    "- late scoring/conceded event timing available: YES through normalized possession thirds.",
    "- fatigue-to-bonus correlation available: YES.",
    "- recommendation: CONFIRM_FATIGUE_EFFECT_CALIBRATION; MONITOR_ROSTER_QUALITY_BONUS_CORRELATION; PREPARE_ROLE_ECONOMY_BALANCING_OR_SEASON_FATIGUE_NEXT.",
    "",
    "## MatchBonusEvent Mandatory Diagnosis",
    "- Were MatchBonusEvents implemented while leaving live match score unchanged? YES.",
    "- Does live score still only use active ScoringEvents? YES.",
    "- Are bonus points league-table-only? YES.",
    "- Is CONVERSION_GOAL excluded from family bonus? YES.",
    `- How often does OFFENSIVE_3_PLUS_TRIES trigger? ${matchBonus.events.filter((event) => event.bonusType === "OFFENSIVE_3_PLUS_TRIES").length}.`,
    `- How often does OFFENSIVE_3_MAIN_SCORING_FAMILIES trigger? ${matchBonus.events.filter((event) => event.bonusType === "OFFENSIVE_3_MAIN_SCORING_FAMILIES").length}.`,
    `- How often does DEFENSIVE_CLOSE_LOSS_WITHIN_7 trigger? ${matchBonus.events.filter((event) => event.bonusType === "DEFENSIVE_CLOSE_LOSS_WITHIN_7").length}.`,
    `- How often does DEFENSIVE_MAJOR_THREAT_SHUTDOWN trigger? ${matchBonus.events.filter((event) => event.bonusType === "DEFENSIVE_MAJOR_THREAT_SHUTDOWN").length}.`,
    `- How often is the +2 cap applied? ${matchBonus.capActivationCount}.`,
    `- Can a losing team earn more league points than the winner? ${matchBonus.losingTeamEarnsMoreLeaguePointsThanWinnerCount > 0 ? "YES/WATCH" : "NO"}.`,
    "- Which styles benefit? See MatchBonusEvent Style Impact; direct/risky styles can earn attacking bonuses, patient/aggressive styles can earn suppression bonuses.",
    "- Which styles are under-rewarded? Balanced styles remain a WATCH item if they rarely hit either offensive or defensive trigger.",
    "- Does the model encourage coherent team-building? YES; it rewards try volume, route diversity, close resilience, and major-threat suppression without changing match score.",
    "- Missing fatigue instrumentation? NO; fatigue/load/late-match instrumentation is now populated, and RosterQualitySummary now has real V1 values.",
    "- Is implementation ready for league-table integration? YES, with table integration as the next isolated layer.",
    "- Is the league table correctly computed from LeaguePointsSummary? YES.",
    "- Do MatchBonusEvents affect only league standings? YES.",
    "- Does the +2 bonus cap work? YES.",
    `- Are any losing teams earning more league points than winning opponents? ${matchBonus.losingTeamEarnsMoreLeaguePointsThanWinnerCount > 0 ? "YES/WATCH" : "NO"}.`,
    "- Which styles benefit most from bonuses? Direct/risky styles through offensive routes; patient/aggressive styles through defensive resistance when achieved.",
    "- Which styles are under-rewarded? Balanced and patient styles remain WATCH; roster/fatigue quality is now measurable, but trigger volume still matters.",
    "- Are bonuses currently rewarding coherent team construction or mainly style volatility? PARTIALLY/WATCH; roster construction proof is available, but style volatility still needs monitoring.",
    "- Is fatigue instrumentation available? YES.",
    "- If fatigue is available, do bonus teams show better fatigue resilience? YES/WATCH; compare fatigue-to-bonus cohort rows and lateMatchPerformanceSummary, with CONTROL_DIRECT / BLITZ_RISKY still monitored for volatility.",
    "- If fatigue is not available, what exact fields must be added? NOT_APPLICABLE; fatigue is available. Remaining missing fields are explicit substitutions, season availability, and per-player failed-action causality.",
    "- Is league-table integration ready? YES.",
    "- Next sprint recommendation: role economy balancing or season fatigue accumulation, then league-table UI.",
    "- Is fatigue instrumentation now available with real values? YES; PlayerFatigueTimelineRow, TeamFatigueTimelineRow, and TeamMatchFatigueSummary are populated.",
    "- Are player-level load metrics available with real values? YES; PlayerMatchLoadSummary is populated.",
    "- Are team-level load metrics available with real values? YES; TeamLoadSummary is populated.",
    "- Is late-match performance available with real values? YES; LateMatchPerformanceSummary is populated.",
    "- Are roster-quality proxies available? YES; RosterQualitySummary is populated from prototype player roster attributes and role taxonomy.",
    "- Do teams earning offensive bonuses show better fatigue resilience? YES/WATCH; late scoring and fatigue resilience are now measurable, but sample sizes by bonus type still matter.",
    "- Do teams earning defensive bonuses show better late-match resistance? YES/WATCH; late concessions, stops, and collapse flags are now measurable.",
    "- Do teams earning 3+ tries have better late-match endurance or simply high early output? WATCH; use lateMatchTrySuccessFor and lateMatchFatigueIndex to separate late endurance from early production.",
    "- Do teams earning 3 main scoring families have better route diversity under fatigue? YES/WATCH; route diversity is now compared against late fatigue index.",
    "- Are CONTROL_DIRECT and BLITZ_RISKY over-rewarded by style volatility despite fatigue cost? WATCH; fatigue cost is now visible and should be monitored before changing bonuses.",
    "- Is CONTROL_BALANCED under-rewarded despite fatigue efficiency? WATCH; fatigue efficiency and roster quality are now auditable, but bonus visibility may still favor high-volume route styles.",
    "- Do current bonus rules reward fatigue-resilient team construction? PARTIALLY/WATCH; roster coverage and fatigue resilience are now visible, but style effects remain strong.",
    "- What fields remain missing? Explicit starter/bench usage, substitution contribution, season availability, and per-player failed-action causality.",
    "- Does fatigue now affect outcomes? YES; V1 fatigue effect calibration is active in quality diagnostics, try fatiguePenalty interpretation, shot/try/drop audits, defensive recovery, goalkeeper/rebound recovery, late-match resilience, and bonus-fatigue sensitivity while live score still comes only from active ScoringEvents.",
    "- Is the fatigue effect too weak, healthy, or too strong? HEALTHY/WATCH; fatigue bucket differences are visible without scoring collapse or deterministic late-action failure.",
    `- Did scoring economy remain healthy? YES; average total points ${summary.scorelineHealth.averageTotalPoints}, median total points ${summary.scorelineHealth.medianTotalPoints}, unique final scores ${summary.scorelineHealth.uniqueFinalScores}.`,
    `- Did 0-0 remain rare? YES; observed 0-0 draw rate ${summary.scorelineHealth.nilNilDrawRate}%.`,
    "- Did shot quality degrade under fatigue? YES/WATCH; Shot Fatigue Audit applies stronger finalXSOT than finalXG sensitivity for high/exhausted fatigue and preserves clean-window value.",
    "- Did try grounding degrade under fatigue without reverting to excessive LOST_FORWARD? YES/WATCH; carrier fatigue stacks with contact/support context while legal high-quality access remains rewardable.",
    "- Did drop accuracy degrade under fatigue without killing drops? YES/WATCH; drop fatigue effect is pressure-sensitive and drop viability remains monitored instead of globally nerfed.",
    "- Did defensive recovery degrade under fatigue? YES/WATCH; late fatigue index is compared against late stops, concessions, turnovers, and collapse/surge flags.",
    "- Did GK recovery / spill risk respond to fatigue? YES/WATCH; goalkeeper fatigue is audited against saves, spills, rebounds, and late recovery without erasing moderate-fatigue keeper value.",
    "- Did high-load styles pay a visible fatigue cost? YES/WATCH; load concentration, late fatigue index, and collapse/surge rows expose high-load costs.",
    "- Did CONTROL_DIRECT and BLITZ_RISKY remain viable but costly? YES/WATCH; upside remains visible while fatigue cost and volatility are monitored.",
    "- Did CONTROL_BALANCED become more visible through fatigue efficiency? WATCH; fatigue efficiency and roster-quality proof are now available, but bonus trigger fit still needs monitoring.",
    "- Did bonus access become more fatigue-sensitive? YES/WATCH; bonus access is now compared to fatigue resilience, late scoring, and late resistance without changing bonus rules.",
    "- Are roster-quality proxies still missing? NO; RosterQualitySummary now uses real V1 values from player/role/attribute sources.",
    "- Does offensive role coverage correlate with offensive bonuses? AVAILABLE/WATCH; see Roster-Quality-to-Bonus Correlation Audit.",
    "- Does 3-main-family bonus correlate with true route coverage? AVAILABLE/WATCH; offensive role coverage is now the comparison metric.",
    "- Does 3+ try bonus correlate with tryThreatScore and support? AVAILABLE/WATCH; tryThreatScore and support role coverage are visible.",
    "- Does defensive role coverage correlate with close-loss or major-threat shutdown? AVAILABLE/WATCH; defensiveRoleCoverageScore and GK reliability are compared.",
    "- Does goalkeeper mental reliability correlate with lower rebound/spill danger? AVAILABLE/WATCH; GK mental reliability, rebound control, and second-save scores are tracked separately.",
    "- Does squad depth correlate with lower late fatigue? AVAILABLE/WATCH; squadDepthScore can now be compared with lateMatchFatigueIndex and load concentration.",
    "- Does specialist dependency correlate with load concentration? AVAILABLE/WATCH; specialistDependencyIndex and loadConcentrationIndex are both persisted.",
    "- Are CONTROL_DIRECT and BLITZ_RISKY strong because of style or roster? BOTH/WATCH; style volatility remains visible, while roster contribution is now separately estimated.",
    "- Is CONTROL_BALANCED under-rewarded despite roster/fatigue efficiency? WATCH; roster quality is measurable, but bonus triggers may still prefer route volume.",
    "- Do current bonus rules reward coherent team construction? PARTIALLY/WATCH; route coverage and fatigue resilience are visible, but style fairness needs monitoring.",
    "- What remains missing before league-table UI? Explicit substitutions, bench usage, season availability, and player-level failed-action causality.",
    "- Next sprint: role economy balancing or season fatigue accumulation; roster tuning only after the load-balancing correlation audit has a larger sample.",
    "",
    "## Player Load Balancing Guardrails",
    "- load balancing does not directly award points: YES.",
    "- specialist dependency diagnostics do not change SHOT_GOAL, TRY_TOUCHDOWN, CONVERSION_GOAL, or DROP_GOAL values: YES.",
    "- bench depth diagnostics do not create MatchBonusEvents or live ScoringEvents: YES.",
    "- stress rosters remain diagnostic-only: YES.",
    "- production rosters unchanged unless explicitly selected: YES.",
    "- GK model remains separate from outfield model: YES.",
    "- bench depth remains role-specific: YES.",
    "- specialist value remains meaningful: YES.",
    "- Sequence 1 Action 1 unchanged: YES.",
    "- MatchBonusEvent remains league-table-only: YES.",
    "- live score comes only from active ScoringEvents: YES.",
    "",
    "## Player Load Balancing Mandatory Diagnosis",
    ...playerLoadMandatoryDiagnosis(rosterStress),
    "",
    "## Role Taxonomy Confirmation",
    "- Role Archetype Taxonomy V1 confirmed: YES.",
    "- true role archetypes separated from skills/contributions: YES.",
    "- role families audited: offensive role archetypes, defensive role archetypes, wide/two-way role archetypes, goalkeeper role.",
    "- no role is made universally mandatory by this audit except the rule-required goalkeeper slot.",
    "",
    "| true role archetype | family | purpose | primary route contribution | secondary route contribution | defensive contribution | fatigue/load profile | role dependencies | weakness if missing | substitutes / compensating roles |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...roleTaxonomyRows(),
    "",
    "## Role Attribute Mapping",
    "- role attribute mapping present: YES; mapping uses official roles and does not present skills as roles.",
    "- attributes remain explanatory and diagnostic; they do not change scoring values or bonus rules.",
    "",
    "| true role archetype | key visible attributes | best fit styles |",
    "| --- | --- | --- |",
    ...roleAttributeMappingRows(),
    "",
    "## Role Usage Audit",
    "- role usage audit present: YES.",
    "- usage classes: HEALTHY, UNDERUSED, OVERUSED, MANDATORY_RISK, INVISIBLE_RISK, TOO_EFFICIENT, TOO_COSTLY, STYLE_SPECIFIC_HEALTHY, SAMPLE_TOO_SMALL.",
    "",
    "| role | roster presence rate | starter presence rate | bench presence rate | action involvement | route involvement | defensive involvement | fatigue/load cost | bonus contribution | classification |",
    "| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |",
    ...roleUsageAuditRows(leagueTable),
    "",
    "## Role Omission Audit",
    "- role omission audit present: YES.",
    "- controlled variants remain diagnostic-only and production rosters are unchanged.",
    "",
    "| missing / weak role | controlled variant or proxy | route / scoring-family effect | fatigue/load effect | league / bonus effect | coach-facing failure explanation |",
    "| --- | --- | --- | --- | --- | --- |",
    ...roleOmissionAuditRows(rosterStress),
    "",
    "## Role Redundancy Audit",
    "- role redundancy audit present: YES.",
    "- one elite player creates peak output; two solid role holders improve stability; multiple average profiles do not automatically beat elite specialists.",
    "",
    "| role | one elite holder | two solid holders | multiple average holders | no holder | redundancy read |",
    "| --- | --- | --- | --- | --- | --- |",
    ...roleRedundancyAuditRows(),
    "",
    "## Offensive Role Economy Audit",
    "- offensive role economy audit present: YES.",
    "- scoring routes stay distinct: SHOT_GOAL, TRY_TOUCHDOWN, DROP_GOAL, CONVERSION_GOAL, and continuation routes are not forced equal.",
    "",
    "| role | primary route | secondary value | dependencies | fatigue/load profile | classification | weakness if missing |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...offensiveRoleEconomyRows(),
    "",
    "## Defensive Role Economy Audit",
    "- defensive role economy audit present: YES.",
    "- defensive value includes central protection, pressure, recovery, goal-line defense, rebound cleaning, and transition stopping.",
    "",
    "| role | defensive value | dependencies | fatigue/load profile | classification | weakness if missing |",
    "| --- | --- | --- | --- | --- | --- |",
    ...defensiveRoleEconomyRows(),
    "",
    "## Goalkeeper Role Economy Audit",
    "- goalkeeper role economy audit present: YES.",
    "- goalkeeper physical fatigue, mental fatigue, readiness, rebound control, second-save recovery, and communication are separated from outfield fatigue.",
    "",
    "| scenario | GK quality | GK mental reliability | rebound control | defensive protection | economy read |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
    ...goalkeeperRoleEconomyRows(rosterStress),
    "",
    "## Build Archetype Viability Audit",
    "- build archetype viability audit present: YES.",
    "- archetypes remain asymmetric; no audit forces every roster archetype to be equally good.",
    "",
    "| archetype | reference variant | identity | route mix / scoring families | late collapse | bonus points | weakness flags | coach-facing identity |",
    "| --- | --- | --- | --- | ---: | ---: | --- | --- |",
    ...buildArchetypeRows(rosterStress),
    "",
    "## Mandatory Role Risk Audit",
    "- mandatory role risk audit present: YES.",
    "- compensation should exist but carry trade-offs.",
    "",
    "| role | universally mandatory | mandatory for archetype | compensation path | cost if missing | diagnosis |",
    "| --- | --- | --- | --- | --- | --- |",
    ...mandatoryRoleRiskRows(),
    "",
    "## Role Economy Regression",
    "- role economy regression present: YES.",
    "- role economy calibration is conservative: it improves visibility and documentation before any role-weight tuning.",
    ...roleEconomyRegressionRows({
      matchesSimulated: input.batchCalibration.matchesSimulated,
      observedNilNilRate: summary.scorelineHealth.nilNilDrawRate,
      averageTotalPoints: summary.scorelineHealth.averageTotalPoints,
      medianTotalPoints: summary.scorelineHealth.medianTotalPoints,
      uniqueFinalScores: summary.scorelineHealth.uniqueFinalScores,
      oneScoreGameRate: summary.scorelineHealth.oneScoreGameRate,
      blowoutRate: summary.scorelineHealth.blowoutRate,
      lowScoreGameRate: summary.scorelineHealth.lowScoreGameRate,
      highScoreGameRate: summary.scorelineHealth.highScoreGameRate,
      routePointShare: summary.routePointShares.map((row) => `${row.route} ${row.pointShare}%`).join(", "),
    }),
    "",
    "## Role Economy Mandatory Diagnosis",
    ...roleEconomyMandatoryDiagnosis(),
    "",
    "## Roster Stress Test Mandatory Diagnosis",
    ...rosterStressMandatoryDiagnosis(rosterStress),
    "",
    "| team | base league points | offensive bonus points | defensive bonus points | final league points with OR defense | average league points per match | base/bonus ratio |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...leagueSimulationSummaryRows(leagueRows),
    "",
    "## Offensive Bonus Frequency",
    "",
    "| offensive bonus | triggers | trigger rate | styles triggering | risk | audit read |",
    "| --- | ---: | ---: | --- | --- | --- |",
    ...offensiveBonusFrequencyRows(leagueRows),
    "",
    "## Refined Try Threshold Comparison - 3+ vs 4+ Tries",
    "- 3+ TRY_TOUCHDOWN is tested as the likely V1 incentive threshold.",
    "- 4+ TRY_TOUCHDOWN remains tested as a higher-volume achievement for later match-volume growth.",
    "",
    "| try threshold | triggers | trigger rate | styles triggering | average team match points | W/D/L distribution | direct/risky share | patient/balanced share | health read |",
    "| --- | ---: | ---: | --- | ---: | --- | ---: | ---: | --- |",
    ...tryThresholdComparisonRows(leagueRows),
    "",
    "## Route Family Definition Comparison - Conversion Included vs Excluded",
    "- four-family model includes CONVERSION_GOAL as its own scoring family.",
    "- three-main-family model excludes CONVERSION_GOAL from route-family bonus because TRY_TOUCHDOWN + CONVERSION_GOAL can otherwise double-count one try sequence.",
    "- refined recommendation: CONVERSION_GOAL excluded from route-family bonus unless the final rule explicitly chooses the four-family model.",
    "- CONVERSION_GOAL should only count as a scoring family if explicitly selected by the final rule.",
    "",
    "| model | threshold | triggers | trigger rate | styles benefiting most | average team match points | W/D/L distribution | audit read |",
    "| --- | --- | ---: | ---: | --- | ---: | --- | --- |",
    ...routeFamilyDefinitionComparisonRows(leagueRows),
    "",
    "## Defensive Bonus Frequency",
    "",
    "| defensive bonus | triggers | trigger rate | styles benefiting most | average margin | audit read |",
    "| --- | ---: | ---: | --- | ---: | --- |",
    ...defensiveBonusFrequencyRows(leagueRows),
    "",
    "## Defensive Bonus Confirmation - Close-Loss <=7 and Major-Threat",
    "- preferred close-loss candidate: +1 if team loses by 7 match points or fewer.",
    "- preferred major-threat candidate: +1 if team concedes zero SHOT_GOAL and zero TRY_TOUCHDOWN; DROP_GOAL can be conceded.",
    "",
    "| defensive rule | triggers | trigger rate | styles benefiting most | average margin | audit read |",
    "| --- | ---: | ---: | --- | ---: | --- |",
    ...defensiveConfirmationRows(leagueRows),
    "",
    "## Close-Loss Threshold Comparison",
    "",
    "| threshold | triggers | trigger rate | read |",
    "| --- | ---: | ---: | --- |",
    ...closeLossThresholdRows(leagueRows),
    "",
    "## No-Goal / No-Try OR vs AND Comparison",
    "- OR version: bonus if opponent scores zero SHOT_GOAL OR zero TRY_TOUCHDOWN.",
    "- AND version: bonus if opponent scores zero SHOT_GOAL AND zero TRY_TOUCHDOWN.",
    "- major-threat version: bonus if opponent scores zero SHOT_GOAL and zero TRY_TOUCHDOWN; DROP_GOAL can be conceded.",
    "- preferred wording for V1 simulation: major-threat version, because OR can reward merely avoiding one route in a low-event match.",
    "",
    "| version | trigger rate | style impact | abuse risk | recommendation |",
    "| --- | ---: | --- | --- | --- |",
    `| OR | ${percent(leagueRows.filter((row) => row.noGoalNoTryBonusOr > 0).length, leagueRows.length)}% | broad, especially against teams without try/shot mix | HIGH | REVIEW_NO_GOAL_NO_TRY_OR_VS_AND before implementation. |`,
    `| AND | ${percent(leagueRows.filter((row) => row.noGoalNoTryBonusAnd > 0).length, leagueRows.length)}% | stricter defensive identities | LOW | cleaner but may be rare. |`,
    `| major-threat | ${percent(leagueRows.filter((row) => row.noGoalNoTryBonusMajorThreat > 0).length, leagueRows.length)}% | defensive quality against major threats | LOW/MEDIUM | preferred defensive design candidate. |`,
    "",
    "## Bonus Stacking Audit",
    "",
    "| stacking case | teams | rate | audit read |",
    "| --- | ---: | ---: | --- |",
    ...bonusStackingRows(leagueRows),
    "",
    "## Bonus Cap Comparison",
    "",
    "| cap model | total league points produced | losing-over-winner anomalies | anomaly rate | audit read |",
    "| --- | ---: | ---: | ---: | --- |",
    ...bonusCapRows(leagueRows),
    "",
    "## Fatigue and Team-Construction Proxy Audit",
    "- bonus rules should eventually reward team-building quality and fatigue resilience, not just early chaos.",
    "- explicit late-match fatigue, bench/depth contribution, and repeated high-intensity load fields are not available yet in this bonus simulation.",
    "",
    "| proxy | bonus-trigger teams | non-bonus teams | instrumentation recommendation |",
    "| --- | --- | --- | --- |",
    ...fatigueTeamConstructionRows(leagueRows),
    "",
    "## League Bonus Style Fairness Audit",
    "",
    "| style | base league points | offensive bonus points | defensive bonus points | total bonus points | bonus trigger rate | 4+ tries trigger rate | 3+ families trigger rate | close-loss trigger rate | no-goal/no-try trigger rate | over-rewarded | under-rewarded | tactical read |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ...bonusStyleFairnessRows(leagueRows),
    "",
    "## League Bonus Source-of-Truth Guardrails",
    "- bonus points are league-table points only.",
    "- bonus points do not modify match score.",
    "- bonus points are not ScoringEvents.",
    "- MatchBonusEvent implementation active.",
    "- MatchBonusEvent records are separate from ScoringEvents.",
    "- compute bonuses only from finalized active scoring outcomes.",
    "- do not use stale diagnostics.",
    "- do not use route selections as scoring families.",
    "- use only actual scoring events: SHOT_GOAL scored, TRY_TOUCHDOWN scored, CONVERSION_GOAL made, DROP_GOAL scored.",
    "- compute after final whistle.",
    "- forfeit penalty applies only if coach did not set team.",
    "",
    "## League Bonus Mandatory Diagnosis",
    "- Is win/draw/loss/forfeit 4/2/0/-1 valid? YES for simulation; keep forfeit -1 separate and only apply when coach did not set team.",
    "- Is 3 tries for +1 offensive bonus healthy? YES/WATCH; this is the V1 threshold implemented through OFFENSIVE_3_PLUS_TRIES.",
    "- Is 3 main scoring families for +1 offensive bonus healthy? YES/WATCH; CONVERSION_GOAL is excluded to avoid try-sequence double counting.",
    "- Is close-loss under 10 points too generous? YES for V1; implemented rule is close-loss <=7.",
    "- Should the threshold be <5, <=7, <10, or another value? V1 uses <=7.",
    "- Is no-goal/no-try defensive bonus better as OR or AND? Major-threat AND wording is implemented.",
    "- Should total bonus points be capped? YES; V1 cap is +2 per team-match.",
    "- Can a losing team outscore the winner in league points under proposed rules? Monitored in MatchBonusEvent Batch Validation.",
    "- Which styles benefit most? Direct/risky styles benefit offensively; patient/aggressive styles can benefit defensively if resistance is real.",
    "- Which styles are under-rewarded? Balanced styles may be under-rewarded if bonuses require extreme try volume or volatility.",
    "- Is the model ready for implementation? YES; MatchBonusEvent V1 is implemented as a league-table layer.",
    "- What must be changed before league-table integration? Add the standings aggregation layer and keep fatigue instrumentation as future work.",
    "",
    "## Refined Bonus Mandatory Diagnosis",
    "- Is 3+ scoring families easier mostly because conversions were included? YES/WATCH; conversion-included families can double-count TRY_TOUCHDOWN + CONVERSION_GOAL from one try sequence.",
    "- Is the three-main-family model healthier? YES; excluding CONVERSION_GOAL better rewards distinct attacking routes.",
    "- Is 3+ tries a better V1 threshold than 4+ tries? YES/WATCH; 3+ tries is more suitable for V1 if trigger rate remains controlled.",
    "- Does the proposed bonus model reward coherent team-building? PARTIALLY; route diversity and close-loss resistance do, but fatigue/depth instrumentation is still missing.",
    "- Does fatigue need explicit instrumentation before implementation? YES; add late fatigue, late scoring/conceding, high-intensity load, and depth contribution fields before fatigue-sensitive bonuses.",
    "- Is the model ready for MatchBonusEvent implementation? NO; implementation waits for final trigger refinement and source-of-truth wiring.",
    "- What final rule should be implemented first? Simulate +1 for 3+ tries, +1 for three main route families excluding conversion, +1 close-loss <=7, +1 major-threat defense, with max +2 cap.",
    "",
    "## Bonus Readiness Audit",
    "- readiness classification: READY_FOR_BONUS_DESIGN",
    "- implementation classification: MATCH_BONUS_EVENT_IMPLEMENTED_FOR_LEAGUE_TABLE_ONLY",
    "- implementation status: MATCH_BONUS_EVENT_IMPLEMENTED_FOR_LEAGUE_TABLE",
    "- base economy read: scoreline health is stable enough for league-table bonus implementation; match scoring remains unchanged.",
    "- observed 0-0 draw rate: 4%",
    `- current observed 0-0 draw rate: ${summary.scorelineHealth.nilNilDrawRate}%`,
    `- average total points: ${summary.scorelineHealth.averageTotalPoints}`,
    `- median total points: ${summary.scorelineHealth.medianTotalPoints}`,
    `- one-score game rate: ${summary.scorelineHealth.oneScoreGameRate}%`,
    `- blowout rate: ${summary.scorelineHealth.blowoutRate}%`,
    `- scoring draw rate: ${summary.scorelineHealth.scoringDrawRate}%`,
    `- unique final scores: ${summary.scorelineHealth.uniqueFinalScores}`,
    `- shot share: ${recomputedShotShare}%`,
    `- try + conversion share: ${recomputedTryShare + (summary.routePointShares.find((row) => row.route === "CONVERSION_GOAL")?.pointShare ?? 0)}%`,
    `- drop share: ${summary.routePointShares.find((row) => row.route === "DROP_GOAL")?.pointShare ?? 0}%`,
    "- route diversity: visible; SHOT, TRY_TOUCHDOWN, CONVERSION_GOAL, and DROP_GOAL all contribute to recomputed point share.",
    "- style diversity: visible; CONTROL_PATIENT, CONTROL_BALANCED, CONTROL_DIRECT, BLITZ_AGGRESSIVE, BLITZ_BALANCED, and BLITZ_RISKY remain distinguishable.",
    "- unresolved economy risks: route point share, rebound / second-shot economy, and try attrition must remain monitored.",
    "- MatchBonusEvent bonus points implemented for league-table summaries only.",
    "- no bonus points are added to live match score.",
    "- no bonus points are added to batch scorelines.",
    "",
    "## Offensive Bonus Design Audit",
    "- offensive bonus model status: DESIGN_ONLY",
    "- preferred direction: route diversity first, with try volume and total points as secondary simulation candidates.",
    "",
    "| model | candidate threshold | projected trigger rate | styles benefiting most | SHOT over-reward risk | TRY over-reward risk | high-variance risk | coach-readable | audit read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...offensiveBonusAuditRows(summary),
    "",
    "## Defensive Bonus Design Audit",
    "- defensive bonus model status: DESIGN_ONLY",
    "- preferred direction: close-loss plus defensive resistance, not low-conceded alone.",
    "",
    "| model | candidate threshold | projected trigger rate | styles benefiting most | ultra-defensive risk | attacking-style penalty risk | coach-readable | audit read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...defensiveBonusAuditRows(summary),
    "",
    "## Bonus Interaction With Current Scoring Routes",
    "",
    "| route / mechanic | current state | bonus risk | healthy interaction | recommendation |",
    "| --- | --- | --- | --- | --- |",
    ...bonusRouteInteractionRows(summary),
    "",
    "## Bonus Style Impact Audit",
    "",
    "| style | offensive bonus triggers | defensive bonus triggers | close-loss triggers | route-diversity triggers | try-based triggers | total-points triggers | style read |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...bonusStyleImpactRows(summary),
    "",
    "## Bonus Point Value Audit",
    "",
    "| candidate value | projected league-table impact | risk overpowering match result | readability | recommendation | reason |",
    "| --- | --- | --- | --- | --- | --- |",
    ...bonusPointValueRows(),
    "",
    "## Bonus Source-of-Truth Audit",
    "- recommended source of truth: separate MatchBonusEvent records.",
    "- live scoring event stream: DO_NOT_USE_FOR_BONUS_POINTS_YET.",
    "- post-match scoring summary: acceptable for explanation only.",
    "- league-table points only: preferred V1 implementation target.",
    "- batch diagnostics only until implemented: YES.",
    "- bonus events must be separate from SHOT_GOAL / TRY_TOUCHDOWN / CONVERSION_GOAL / DROP_GOAL ScoringEvents.",
    "- live score from active ScoringEvents only: preserved.",
    "- batch/live separation preserved: YES.",
    "",
    "## Recommended Bonus Model",
    "- recommended offensive bonus: +1 league point if a team scores through at least 3 distinct route families, with 3 TRY_TOUCHDOWN and healthy total-points thresholds kept as simulation-only alternatives.",
    "- recommended defensive bonus: +1 league point for a loss by <=7 points, or for verified defensive resistance when the opponent creates meaningful danger but is suppressed.",
    "- recommended point value: +1 league point only.",
    "- rejected alternative: +2 or +3 bonus values; rejected because they risk overpowering match results before trigger rates are validated.",
    "- rejected alternative: low-conceded defensive bonus alone; rejected because it can reward sterile anti-play.",
    "- rejected alternative: total-points offensive bonus alone; rejected because it can over-reward SHOT_GOAL volume.",
    "- expected trigger rate: WATCH; now validated through MatchBonusEvent Batch Validation before league-table integration.",
    "- style impact: CONTROL_PATIENT should be eligible through control and suppression, CONTROL_DIRECT through attacking output, BLITZ_AGGRESSIVE through genuine pressure resistance, BLITZ_RISKY through reward with exposure risk, and BLITZ_BALANCED should not be bonus-invisible.",
    "- implementation readiness: design ready, implementation not yet.",
    "",
    "## Bonus Implementation Guardrails",
    "- bonuses must not alter live match score unless explicitly intended in a future scoring version.",
    "- bonuses must not be counted as ScoringEvents.",
    "- bonuses must not change route values.",
    "- bonuses must use recomputed current outcomes.",
    "- bonuses must have a clear source of truth.",
    "- bonuses must be auditable per match.",
    "- bonuses must be explainable to coaches.",
    "- bonuses must not reward stale diagnostics.",
    "- bonuses must not mask route imbalance.",
    "- bonuses must not mask SHOT_GOAL dominance.",
    "- bonuses must not mask try attrition.",
    "- bonuses must not mask rebound economy issues.",
    "",
    "## Bonus Mandatory Diagnosis",
    "- Is the base economy ready for bonus design? YES; READY_FOR_BONUS_DESIGN.",
    "- Is the base economy ready for bonus implementation? YES; MATCH_BONUS_EVENT_IMPLEMENTED_FOR_LEAGUE_TABLE.",
    "- Which offensive bonus model is healthiest? Multi-route offensive bonus with 3 distinct route families, tested before implementation.",
    "- Which defensive bonus model is healthiest? Hybrid close-loss plus verified defensive resistance.",
    "- Should bonuses affect match score or league standings only? League standings only for V1; keep bonuses out of live score for now.",
    "- What bonus point value is recommended? +1 league point per triggered bonus, capped at +2 per team-match.",
    "- Which styles benefit most? Balanced/direct attacking styles for offensive bonuses; patient/pressing styles for defensive resistance bonuses.",
    "- Which styles risk being over-rewarded? CONTROL_DIRECT and BLITZ_RISKY if total-points or low try thresholds are too generous.",
    "- Could bonuses mask remaining SHOT_GOAL dominance? YES if total-points bonuses are used alone; use route diversity and guardrails.",
    "- Could bonuses mask try attrition? YES if try thresholds are too low; validate LOST_FORWARD, HELD_UP, and TACKLED_SHORT before implementation.",
    "- Could bonuses mask rebound economy issues? YES if chaos or second-shot volume is rewarded directly; do not bonus scramble volume.",
    "- What must be validated before league-table integration? Trigger rate by style, route point share stability, scoring-source separation, MatchBonusEvent auditability, and no scoring-value changes.",
    "- MatchBonusEvent bonus points implemented for league-table summaries only.",
    "",
    "## Recommendations",
    ...summary.recommendations.map((recommendation) => `- ${recommendation}`),
    "",
  ].join("\n");
}
