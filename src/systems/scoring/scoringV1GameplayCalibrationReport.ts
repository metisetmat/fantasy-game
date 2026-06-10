import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../actions";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { formatPercent, summarizeScoringV1GameplayCalibration } from "./scoringV1GameplayCalibration";

export function createScoringV1GameplayCalibrationReport(input: {
  readonly result: MiniMatchResult;
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly batchCalibration?: BatchScoringCalibrationSummary;
}): string {
  const calibration = summarizeScoringV1GameplayCalibration(input);

  return [
    "# Scoring V1 Gameplay Calibration",
    "",
    "## Summary",
    `- scoring version: ${calibration.scoringVersion}`,
    `- scoring rule: ${calibration.scoringRule}`,
    `- score unit: ${calibration.scoreUnit}`,
    `- final score: ${calibration.finalScore}`,
    `- total shots: ${calibration.totalShots}`,
    `- shot goals: ${calibration.shotGoals}`,
    `- conversion rate: ${formatPercent(calibration.conversionRate)}`,
    `- average shot quality: ${calibration.averageShotQuality}/100`,
    `- average goalkeeper challenge: ${calibration.averageGoalkeeperChallenge}/100`,
    `- average defensive block pressure: ${calibration.averageDefensiveBlockPressure}/100`,
    `- average finishing pressure: ${calibration.averageFinishingPressure}/100`,
    `- number of forced / low-quality shots: ${calibration.forcedLowQualityShots}`,
    `- number of high-quality shots missed: ${calibration.highQualityMisses}`,
    `- number of low-quality shots scored: ${calibration.lowQualityGoals}`,
    `- batch calibration available: ${input.batchCalibration === undefined ? "NO" : "YES"}`,
    `- batch recommendation: ${input.batchCalibration?.recommendation ?? "not available"}`,
    "- note: single-match recommendation remains NEEDS_MORE_SAMPLE if based on 5 shots.",
    "",
    "## Shot Event Table",
    "",
    "| Sequence/action | Team | Shooter | Origin zone | Shot quality | Goalkeeper challenge | Defensive block pressure | Finishing pressure | Ball outcome | Scoring action | Point value | Score after shot | Shot quality band | Tactical justification |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...calibration.events.map(
      (event) =>
        `| ${event.label} | ${event.team} | ${event.shooter} | ${event.originZone} | ${event.shotQuality} | ${event.goalkeeperChallenge} | ${event.defensiveBlockPressure} | ${event.finishingPressure} | ${event.ballOutcome} | ${event.scoringAction} | ${event.pointValue} | ${event.scoreAfterShot} | ${event.qualityBand} | ${event.tacticalJustification} |`,
    ),
    "",
    "## Team Shot Profile",
    "",
    ...calibration.teamProfiles.flatMap((profile) => [
      `### ${profile.teamName}`,
      `- shots: ${profile.shots}`,
      `- shot goals: ${profile.shotGoals}`,
      `- points from shots: ${profile.pointsFromShots}`,
      `- conversion rate: ${formatPercent(profile.conversionRate)}`,
      `- average shot quality: ${profile.averageShotQuality}/100`,
      `- average shot pressure: ${profile.averageShotPressure}/100`,
      `- best shot: ${profile.bestShot}`,
      `- worst shot: ${profile.worstShot}`,
      `- forced shot count: ${profile.forcedShotCount}`,
      `- tactical read: ${profile.tacticalRead}`,
      "",
    ]),
    "## Scoreline Plausibility",
    `- status: ${calibration.scorelinePlausibility}`,
    `- Is CONTROL 3-0 explained by one high-value shot? ${calibration.shotGoals === 1 ? "Yes, one SHOT_GOAL supplies all three points." : "Review required."}`,
    `- Did CONTROL create enough quality to deserve the score? ${calibration.teamProfiles[0]?.averageShotQuality ?? 0 >= 70 ? "Some evidence, but the sample is too small to overclaim." : "Not enough evidence yet."}`,
    `- Did BLITZ generate dangerous shots or mostly forced shots? ${(calibration.teamProfiles[1]?.forcedShotCount ?? 0) > 0 ? "BLITZ shows forced-shot indicators." : "BLITZ shots were non-scoring, but not enough to prove a tendency."}`,
    "- Is SHOT_GOAL = 3 too punitive/rewarding in this sample? Needs more sample before changing value.",
    "",
    "## Gameplay Calibration Flags",
    `- ${calibration.totalShots >= 3 && calibration.totalShots <= 18 ? "PASS" : "WARNING"}: total shots per match within expected range - ${calibration.totalShots}`,
    `- ${calibration.conversionRate >= 5 && calibration.conversionRate <= 35 ? "PASS" : "WARNING"}: shot conversion rate within expected range - ${formatPercent(calibration.conversionRate)}`,
    `- ${calibration.lowQualityGoals === 0 ? "PASS" : "WARNING"}: low-quality goals count = 0 - ${calibration.lowQualityGoals}`,
    `- ${calibration.highQualityMisses <= calibration.totalShots ? "PASS" : "WARNING"}: high-quality misses explained - ${calibration.highQualityMisses}`,
    `- ${(calibration.teamProfiles[1]?.forcedShotCount ?? 0) > 0 ? "PASS" : "WARNING"}: BLITZ forced-shot tendency observed or not - ${(calibration.teamProfiles[1]?.forcedShotCount ?? 0)} forced shots`,
    `- ${calibration.lowQualityGoals === 0 ? "PASS" : "WARNING"}: score not dominated by random low-quality shot - ${calibration.lowQualityGoals}`,
    `- ${calibration.shotGoals === 1 && calibration.totalShots === 5 ? "PASS" : "WARNING"}: SHOT_GOAL = 3 creates meaningful swing but not absurd blowout - ${calibration.finalScore}`,
    "",
    "## Recommendation",
    `- recommendation: ${calibration.recommendation}`,
    "- rationale: keep V1 active for now, but do not rebalance from a single five-shot mini-match.",
    "",
  ].join("\n");
}
