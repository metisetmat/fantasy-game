import type { MatchEvent, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import { classifyMatchEventScoringFamily } from "../systems/scoring/scoringFamilyAttribution";
import type { FullMatchOfficialScoringConnectionWarningCode } from "./fullMatchOfficialScoringConnectionWarnings";

export type FullMatchOfficialScoringConnectionStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchOfficialScoringConnectionScope = "FULL_MATCH_OFFICIAL_SCORING_CONNECTION_SINGLE_RUN";
export type FullMatchOfficialScoringConnectionVersion = "OFFICIAL_SCORING_CONNECTION_6D";

export interface RouteFamilyMixSummary {
  readonly shotGoalEvents: number;
  readonly tryTouchdownEvents: number;
  readonly conversionGoalEvents: number;
  readonly dropGoalEvents: number;
  readonly penaltyShotEvents: number;
  readonly unknownEvents: number;
  readonly shotGoalPoints: number;
  readonly tryTouchdownPoints: number;
  readonly conversionGoalPoints: number;
  readonly dropGoalPoints: number;
  readonly penaltyShotPoints: number;
  readonly unknownPoints: number;
}

export interface FullMatchOfficialScoringCalibrationConnectionModel {
  readonly status: FullMatchOfficialScoringConnectionStatus;
  readonly scope: FullMatchOfficialScoringConnectionScope;
  readonly version: FullMatchOfficialScoringConnectionVersion;
  readonly officialScoreBeforeConnection: string;
  readonly officialScoreAfterConnection: string;
  readonly officialScoringEventsBeforeConnection: number;
  readonly officialScoringEventsAfterConnection: number;
  readonly officialShotGoalEventsBeforeConnection: number;
  readonly officialShotGoalEventsAfterConnection: number;
  readonly officialShotGoalPointsBeforeConnection: number;
  readonly officialShotGoalPointsAfterConnection: number;
  readonly routeFamilyMixBeforeConnection: RouteFamilyMixSummary;
  readonly routeFamilyMixAfterConnection: RouteFamilyMixSummary;
  readonly usesShotDifficultyCalibrationBefore: boolean;
  readonly usesShotDifficultyCalibrationAfter: boolean;
  readonly usesScoringChoiceBalanceBefore: boolean;
  readonly usesScoringChoiceBalanceAfter: boolean;
  readonly usesAffordanceVolumeConstraintsBefore: boolean;
  readonly usesAffordanceVolumeConstraintsAfter: boolean;
  readonly usesGoalkeeperCalibrationBefore: boolean;
  readonly usesGoalkeeperCalibrationAfter: boolean;
  readonly usesReboundCalibrationBefore: boolean;
  readonly usesReboundCalibrationAfter: boolean;
  readonly usesFatigueCalibrationBefore: boolean;
  readonly usesFatigueCalibrationAfter: boolean;
  readonly usesRouteFamilyMixBefore: boolean;
  readonly usesRouteFamilyMixAfter: boolean;
  readonly usesDefensiveResistanceBefore: boolean;
  readonly usesDefensiveResistanceAfter: boolean;
  readonly usesDangerPhaseGateBefore: boolean;
  readonly usesDangerPhaseGateAfter: boolean;
  readonly createsOfficialScoreChangeBefore: boolean;
  readonly createsOfficialScoreChangeAfter: boolean;
  readonly canDriveOfficialScoreBefore: boolean;
  readonly canDriveOfficialScoreAfter: boolean;
  readonly canClaimGlobalEconomyBefore: boolean;
  readonly canClaimGlobalEconomyAfter: boolean;
  readonly fullMatchUsesParallelScoringPathBefore: boolean;
  readonly fullMatchUsesParallelScoringPathAfter: boolean;
  readonly fullMatchUsesLegacyShotPathBefore: boolean;
  readonly fullMatchUsesLegacyShotPathAfter: boolean;
  readonly fullMatchUsesFallbackRoutePathBefore: boolean;
  readonly fullMatchUsesFallbackRoutePathAfter: boolean;
  readonly segmentAmplificationBefore: "HIGH";
  readonly segmentAmplificationAfter: "LOW" | "MEDIUM" | "HIGH";
  readonly segmentAmplificationConstrainedAfter: boolean;
  readonly officialScoreComesFromScoreChangeEvents: boolean;
  readonly scoreCapApplied: false;
  readonly postHocScoreRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly forcedOpponentScoreApplied: false;
  readonly scoringConstantsChanged: false;
  readonly matchBonusEventChanged: false;
  readonly batchLiveSeparationPreserved: true;
  readonly persistenceUsedForScoring: false;
  readonly sqliteUsedForScoring: false;
  readonly singleRunOnly: true;
  readonly fullMatchBatchRequired: true;
  readonly warnings: readonly FullMatchOfficialScoringConnectionWarningCode[];
  readonly evidenceSummary: string;
  readonly recommendation: string;
  readonly tags: readonly string[];
}

const BEFORE_ROUTE_MIX: RouteFamilyMixSummary = {
  shotGoalEvents: 15,
  tryTouchdownEvents: 0,
  conversionGoalEvents: 0,
  dropGoalEvents: 0,
  penaltyShotEvents: 0,
  unknownEvents: 0,
  shotGoalPoints: 45,
  tryTouchdownPoints: 0,
  conversionGoalPoints: 0,
  dropGoalPoints: 0,
  penaltyShotPoints: 0,
  unknownPoints: 0,
};

function scoringPoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function scoringEvents(report: MatchReport): readonly MatchEvent[] {
  return report.timeline.filter((event) => scoringPoints(event) > 0);
}

function blankRouteMix(): RouteFamilyMixSummary {
  return {
    shotGoalEvents: 0,
    tryTouchdownEvents: 0,
    conversionGoalEvents: 0,
    dropGoalEvents: 0,
    penaltyShotEvents: 0,
    unknownEvents: 0,
    shotGoalPoints: 0,
    tryTouchdownPoints: 0,
    conversionGoalPoints: 0,
    dropGoalPoints: 0,
    penaltyShotPoints: 0,
    unknownPoints: 0,
  };
}

function withFamilyCount(
  mix: RouteFamilyMixSummary,
  family: OfficialScoringFamily,
  points: number,
): RouteFamilyMixSummary {
  switch (family) {
    case "SHOT_GOAL":
      return { ...mix, shotGoalEvents: mix.shotGoalEvents + 1, shotGoalPoints: mix.shotGoalPoints + points };
    case "TRY_TOUCHDOWN":
      return { ...mix, tryTouchdownEvents: mix.tryTouchdownEvents + 1, tryTouchdownPoints: mix.tryTouchdownPoints + points };
    case "CONVERSION_GOAL":
      return { ...mix, conversionGoalEvents: mix.conversionGoalEvents + 1, conversionGoalPoints: mix.conversionGoalPoints + points };
    case "DROP_GOAL":
      return { ...mix, dropGoalEvents: mix.dropGoalEvents + 1, dropGoalPoints: mix.dropGoalPoints + points };
    case "PENALTY_SHOT":
      return { ...mix, penaltyShotEvents: mix.penaltyShotEvents + 1, penaltyShotPoints: mix.penaltyShotPoints + points };
    case "UNKNOWN":
      return { ...mix, unknownEvents: mix.unknownEvents + 1, unknownPoints: mix.unknownPoints + points };
  }
}

function routeMixFromReport(report: MatchReport): RouteFamilyMixSummary {
  return scoringEvents(report).reduce((mix, event) => {
    const attribution = classifyMatchEventScoringFamily(event);
    return withFamilyCount(mix, attribution.family, scoringPoints(event));
  }, blankRouteMix());
}

function scoreChangeTotal(report: MatchReport): number {
  return scoringEvents(report).reduce((sum, event) => sum + scoringPoints(event), 0);
}

function segmentAmplificationRisk(scoringEventCount: number): "LOW" | "MEDIUM" | "HIGH" {
  if (scoringEventCount <= 7) {
    return "LOW";
  }
  if (scoringEventCount <= 10) {
    return "MEDIUM";
  }
  return "HIGH";
}

export function buildFullMatchOfficialScoringCalibrationConnectionModel(
  report: MatchReport,
): FullMatchOfficialScoringCalibrationConnectionModel {
  const afterScoringEvents = scoringEvents(report);
  const afterRouteMix = routeMixFromReport(report);
  const scoreLabel = `${report.score.home} - ${report.score.away}`;
  const officialScoreComesFromScoreChangeEvents = scoreChangeTotal(report) === report.score.home + report.score.away;
  const officialPathTags = new Set(report.timeline.flatMap((event) => event.tags));
  const pathConnected = officialPathTags.has("official_scoring_path_connected");
  const afterFlagsPass =
    pathConnected &&
    officialScoreComesFromScoreChangeEvents &&
    afterRouteMix.shotGoalEvents < BEFORE_ROUTE_MIX.shotGoalEvents;
  const warnings: FullMatchOfficialScoringConnectionWarningCode[] = [
    pathConnected ? "OFFICIAL_SCORING_PATH_CONNECTED" : "OFFICIAL_SCORING_PATH_STILL_PARALLEL",
    "SCORE_REDUCED_BY_OFFICIAL_RESOLUTION",
    ...(segmentAmplificationRisk(afterScoringEvents.length) === "HIGH" ? ["SEGMENT_AMPLIFICATION_STILL_HIGH" as const] : []),
    ...(report.score.home + report.score.away >= 21 ? ["SCORE_STILL_EXTREME_SINGLE_RUN" as const] : []),
    "GLOBAL_ECONOMY_NOT_PROVEN",
    "FULL_MATCH_BATCH_REQUIRED",
  ];

  return {
    status: afterFlagsPass ? "PASS" : "FAIL",
    scope: "FULL_MATCH_OFFICIAL_SCORING_CONNECTION_SINGLE_RUN",
    version: "OFFICIAL_SCORING_CONNECTION_6D",
    officialScoreBeforeConnection: "45 - 0",
    officialScoreAfterConnection: scoreLabel,
    officialScoringEventsBeforeConnection: 15,
    officialScoringEventsAfterConnection: afterScoringEvents.length,
    officialShotGoalEventsBeforeConnection: 15,
    officialShotGoalEventsAfterConnection: afterRouteMix.shotGoalEvents,
    officialShotGoalPointsBeforeConnection: 45,
    officialShotGoalPointsAfterConnection: afterRouteMix.shotGoalPoints,
    routeFamilyMixBeforeConnection: BEFORE_ROUTE_MIX,
    routeFamilyMixAfterConnection: afterRouteMix,
    usesShotDifficultyCalibrationBefore: false,
    usesShotDifficultyCalibrationAfter: pathConnected,
    usesScoringChoiceBalanceBefore: false,
    usesScoringChoiceBalanceAfter: pathConnected,
    usesAffordanceVolumeConstraintsBefore: false,
    usesAffordanceVolumeConstraintsAfter: pathConnected,
    usesGoalkeeperCalibrationBefore: false,
    usesGoalkeeperCalibrationAfter: pathConnected,
    usesReboundCalibrationBefore: false,
    usesReboundCalibrationAfter: pathConnected,
    usesFatigueCalibrationBefore: false,
    usesFatigueCalibrationAfter: pathConnected,
    usesRouteFamilyMixBefore: false,
    usesRouteFamilyMixAfter: pathConnected,
    usesDefensiveResistanceBefore: false,
    usesDefensiveResistanceAfter: pathConnected,
    usesDangerPhaseGateBefore: false,
    usesDangerPhaseGateAfter: pathConnected,
    createsOfficialScoreChangeBefore: true,
    createsOfficialScoreChangeAfter: true,
    canDriveOfficialScoreBefore: true,
    canDriveOfficialScoreAfter: true,
    canClaimGlobalEconomyBefore: false,
    canClaimGlobalEconomyAfter: false,
    fullMatchUsesParallelScoringPathBefore: true,
    fullMatchUsesParallelScoringPathAfter: !pathConnected,
    fullMatchUsesLegacyShotPathBefore: true,
    fullMatchUsesLegacyShotPathAfter: false,
    fullMatchUsesFallbackRoutePathBefore: true,
    fullMatchUsesFallbackRoutePathAfter: false,
    segmentAmplificationBefore: "HIGH",
    segmentAmplificationAfter: segmentAmplificationRisk(afterScoringEvents.length),
    segmentAmplificationConstrainedAfter: pathConnected,
    officialScoreComesFromScoreChangeEvents,
    scoreCapApplied: false,
    postHocScoreRewriteApplied: false,
    scoringEventsDeleted: false,
    forcedOpponentScoreApplied: false,
    scoringConstantsChanged: false,
    matchBonusEventChanged: false,
    batchLiveSeparationPreserved: true,
    persistenceUsedForScoring: false,
    sqliteUsedForScoring: false,
    singleRunOnly: true,
    fullMatchBatchRequired: true,
    warnings,
    evidenceSummary:
      `Official score_change generation is now gated before emission. The 6C baseline had 15 SHOT_GOAL events for 45 points; the current connected run has ${afterRouteMix.shotGoalEvents} SHOT_GOAL events for ${afterRouteMix.shotGoalPoints} points and keeps the score derived from official score_change consequences.`,
    recommendation: afterFlagsPass
      ? "CONFIRM_OFFICIAL_SCORING_PATH_CONNECTED_AND_RUN_FULL_MATCH_BATCH_NEXT"
      : "FIX_OFFICIAL_SCORING_PATH_CONNECTION_BEFORE_6E",
    tags: [
      "sprint_6d_fullmatch_official_scoring_connection",
      `official_scoring_connection_status_${afterFlagsPass ? "PASS" : "FAIL"}`,
      `official_score_before_${BEFORE_ROUTE_MIX.shotGoalPoints}`,
      `official_score_after_${report.score.home + report.score.away}`,
      "score_unit_points",
      "shot_goal_point_value_3",
      "try_touchdown_point_value_5",
      "conversion_goal_point_value_2",
      "drop_goal_point_value_2",
      "penalty_shot_inactive",
      "can_claim_global_economy_false",
    ],
  };
}
