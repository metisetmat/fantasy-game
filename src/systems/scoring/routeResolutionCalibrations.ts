import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { summarizeCleanShotSuccessCalibration } from "./cleanShotSuccessCalibration";
import { summarizeContinuationPayoffCalibration } from "./continuationPayoffCalibration";
import { summarizeDangerPhaseConversionEconomy } from "./dangerPhaseConversionEconomy";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import { summarizeFullMatchEconomyValidation } from "./fullMatchEconomyValidation";
import { summarizeGoalkeeperShotStoppingImpactCalibration } from "./goalkeeperShotStoppingImpactCalibration";
import { summarizeMatchDurationPossessionVolumeCalibration } from "./matchDurationPossessionVolumeCalibration";
import { summarizePostResolutionRouteEconomyMonitoring } from "./postResolutionRouteEconomyMonitoring";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";
import { summarizeTryGroundingPressureCalibration } from "./tryGroundingPressureCalibration";

export function createRouteResolutionCalibrationsReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const goalkeeper = summarizeGoalkeeperShotStoppingImpactCalibration(input);
  const tryGrounding = summarizeTryGroundingPressureCalibration(input);
  const cleanShot = summarizeCleanShotSuccessCalibration(input);
  const economy = summarizePostResolutionRouteEconomyMonitoring(input);
  const dangerEconomy = summarizeDangerPhaseConversionEconomy(input);
  const continuationPayoff = summarizeContinuationPayoffCalibration(input);
  const matchVolume = summarizeMatchDurationPossessionVolumeCalibration(input);
  const fullMatch = summarizeFullMatchEconomyValidation(input);
  const recommendations = [
    "KEEP_SCORING_VALUES",
    "KEEP_ROUTE_RESOLUTION_CALIBRATIONS",
    ...goalkeeper.recommendations,
    ...tryGrounding.recommendations,
    ...cleanShot.recommendations,
    ...economy.recommendations,
    ...dangerEconomy.recommendations,
    ...continuationPayoff.recommendations,
    ...matchVolume.recommendations,
    ...fullMatch.recommendations,
  ];

  return [
    "# Route Resolution Calibrations",
    "",
    "## Summary",
    `- scoring version: ${TRY_TOUCHDOWN_SCORING_VERSION}`,
    "- score unit: POINTS",
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- PENALTY_SHOT inactive",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    "",
    "## Goalkeeper Shot-Stopping Impact",
    `- source report: goalkeeper-shot-stopping-impact-calibration.md`,
    `- source validation: validation.goalkeeper-shot-stopping-impact-calibration.md`,
    `- shot rows checked: ${goalkeeper.shotRowsChecked}`,
    `- failed save count: ${goalkeeper.failedSaveCount}`,
    `- threshold-edge goal count: ${goalkeeper.thresholdEdgeGoalCount}`,
    `- GK underweighted goal count: ${goalkeeper.gkUnderweightedGoalCount}`,
    `- projected SHOT success after GK calibration: ${goalkeeper.projectedShotSuccessRateAfterGkCalibration}%`,
    `- projected CLEAN_SHOT success after GK calibration: ${goalkeeper.projectedCleanShotSuccessRateAfterGkCalibration}%`,
    "- goalkeeper fatigue specialization: active; physical fatigue, mental fatigue, readiness state, concentration load, rebound control, and second-save recovery are separated from outfield fatigue.",
    `- recommendation: ${goalkeeper.recommendations.join(", ")}`,
    "",
    "## Try Grounding Pressure",
    `- source report: try-grounding-pressure-calibration.md`,
    `- source validation: validation.try-grounding-pressure-calibration.md`,
    `- try attempts: ${tryGrounding.tryAttempts}`,
    `- tries scored: ${tryGrounding.triesScored}`,
    `- TRY_TOUCHDOWN success rate: ${tryGrounding.trySuccessRate}%`,
    `- contested TRY success rate: ${tryGrounding.contestedTrySuccessRate}%`,
    `- LOST_FORWARD count: ${tryGrounding.lostForwardCount}`,
    `- HELD_UP count: ${tryGrounding.heldUpCount}`,
    `- TACKLED_SHORT count: ${tryGrounding.tackledShortCount}`,
    `- recommendation: ${tryGrounding.recommendations.join(", ")}`,
    "",
    "## Clean Shot Success",
    `- source report: clean-shot-success-calibration.md`,
    `- source validation: validation.clean-shot-success-calibration.md`,
    `- previous CLEAN_SHOT success rate: ${cleanShot.previousCleanShotSuccessRate}%`,
    `- calibrated CLEAN_SHOT success rate: ${cleanShot.cleanShotSuccessRate}%`,
    `- calibrated overall SHOT success rate: ${cleanShot.overallShotSuccessRate}%`,
    `- calibrated FORCED_SHOT success rate: ${cleanShot.forcedShotSuccessRate}%`,
    `- threshold-edge clean goals reduced: ${cleanShot.thresholdEdgeCleanGoalsReduced}`,
    `- strong GK influence count: ${cleanShot.strongGkInfluenceCount}`,
    `- recommendation: ${cleanShot.recommendations.join(", ")}`,
    "",
    "## Route Economy Impact",
    `- source report: post-resolution-route-economy-monitoring.md`,
    `- source validation: validation.post-resolution-route-economy-monitoring.md`,
    `- average total points: ${economy.scorelineHealth.averageTotalPoints}`,
    `- 0-0 draw rate: ${economy.scorelineHealth.nilNilDrawRate}%`,
    `- scoring draw rate: ${economy.scorelineHealth.scoringDrawRate}%`,
    `- unique final scores: ${economy.scorelineHealth.uniqueFinalScores}`,
    `- route economy meta-risks: ${economy.metaRisks.join(", ") || "none"}`,
    `- recommendation: ${economy.recommendations.join(", ")}`,
    "",
    "## Danger Phase Conversion Economy",
    `- source report: danger-phase-conversion-economy.md`,
    `- source validation: validation.danger-phase-conversion-economy.md`,
    `- sterile danger phases: ${dangerEconomy.sterileDangerPhaseCount}`,
    `- sterile danger rate: ${dangerEconomy.sterileDangerRate}%`,
    `- danger-to-score conversion rate: ${dangerEconomy.dangerToScoreConversionRate}%`,
    `- 0-0 draw rate: ${dangerEconomy.nilNilDrawRate}%`,
    `- route economy meta-risks: ${dangerEconomy.metaRisks.join(", ") || "none"}`,
    `- recommendation: ${dangerEconomy.recommendations.join(", ")}`,
    "",
    "## Continuation Payoff Calibration",
    `- source report: continuation-payoff-calibration.md`,
    `- source validation: validation.continuation-payoff-calibration.md`,
    `- current sterile danger rate: ${continuationPayoff.currentSterileDangerRate}%`,
    `- projected sterile danger rate: ${continuationPayoff.projectedSterileDangerRate}%`,
    `- projected 0-0 draw rate: ${continuationPayoff.projectedNilNilDrawRate}%`,
    `- SUPPORT_CLUSTER_RECYCLE payoff rate: ${continuationPayoff.supportClusterRecyclePayoffRate}%`,
    `- FORWARD_PROGRESS payoff rate: ${continuationPayoff.forwardProgressPayoffRate}%`,
    `- recommendation: ${continuationPayoff.recommendations.join(", ")}`,
    "",
    "## Match Duration & Possession Volume",
    `- source report: match-duration-possession-volume-calibration.md`,
    `- source validation: validation.match-duration-possession-volume-calibration.md`,
    `- match length interpretation: ${matchVolume.matchLengthInterpretation}`,
    `- calibrated offensive possessions per match: ${matchVolume.possessionVolume.calibratedOffensivePossessionsPerMatch}`,
    `- calibrated danger phases per match: ${matchVolume.dangerPhaseVolume.calibratedDangerPhasesPerMatch}`,
    `- projected 0-0 draw rate: ${matchVolume.scorelineHealth.nilNilDrawRate}%`,
    `- recommendation: ${matchVolume.recommendations.join(", ")}`,
    "",
    "## Full-Match Economy Validation",
    `- source report: full-match-economy-validation.md`,
    `- source validation: validation.full-match-economy-validation.md`,
    `- matches simulated: ${fullMatch.matchesSimulated}`,
    `- observed 0-0 draw rate: ${fullMatch.scorelineHealth.nilNilDrawRate}%`,
    `- average total points: ${fullMatch.scorelineHealth.averageTotalPoints}`,
    `- unique final scores: ${fullMatch.scorelineHealth.uniqueFinalScores}`,
    `- recommendation: ${fullMatch.recommendations.join(", ")}`,
    "",
    "## Current Resolution Recommendations",
    `- recommendations: ${[...new Set(recommendations)].join(", ")}`,
    "- guardrail: keep scoring values unchanged until route economy monitoring proves a value-level imbalance.",
    "- guardrail: no global shot nerf, no global try buff, and no drop resolution change.",
    "",
  ].join("\n");
}
