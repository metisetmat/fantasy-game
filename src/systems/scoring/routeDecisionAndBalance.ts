import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import {
  summarizeNonShotCandidateRankingCalibration,
  type NonShotCandidateRow,
  type NonShotCandidateType,
} from "./nonShotCandidateRankingCalibration";
import { summarizeRouteBalancePostRankingMonitoring } from "./routeBalancePostRankingMonitoring";
import { summarizeRouteSuccessRateCalibration } from "./routeSuccessRateCalibration";
import { summarizeTryGroundingPressureCalibration } from "./tryGroundingPressureCalibration";
import { summarizeCleanShotSuccessCalibration } from "./cleanShotSuccessCalibration";
import { summarizeContinuationPayoffCalibration } from "./continuationPayoffCalibration";
import { summarizeDangerPhaseConversionEconomy } from "./dangerPhaseConversionEconomy";
import { summarizeFullMatchEconomyValidation } from "./fullMatchEconomyValidation";
import { summarizeMatchDurationPossessionVolumeCalibration } from "./matchDurationPossessionVolumeCalibration";
import { summarizePostResolutionRouteEconomyMonitoring } from "./postResolutionRouteEconomyMonitoring";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function candidateTypeRows(rows: readonly NonShotCandidateRow[]): readonly string[] {
  const candidateTypes: readonly NonShotCandidateType[] = [
    "SHOT",
    "TRY_TOUCHDOWN_ATTEMPT",
    "DROP_GOAL_ATTEMPT",
    "CARRY_OR_HOLD",
    "SAFE_RECYCLE",
    "FORWARD_PROGRESS",
    "WEAK_SIDE_SWITCH",
    "CENTRAL_REBUILD",
    "SUPPORT_CLUSTER_RECYCLE",
  ];

  return candidateTypes.map((candidateType) => {
    const typedRows = rows.filter((row) => row.candidateType === candidateType);
    const selectedRows = typedRows.filter((row) => row.selected === "YES");

    return `| ${candidateType} | ${typedRows.length} | ${selectedRows.length} | ${percent(selectedRows.length, typedRows.length)}% |`;
  });
}

function selectedTieRows(rows: readonly NonShotCandidateRow[]): readonly string[] {
  return rows
    .filter((row) => row.selected === "YES" && row.tieBreakNeeded === "YES")
    .slice(0, 12)
    .map(
      (row) =>
        `| ${row.actionId} | ${row.team} | ${row.candidateType} | ${row.candidateScore} | ${row.nextBestCandidateScore} | ${row.rawGap} | ${row.tieBreakReason} | ${row.tieBreakerFieldsUsed} |`,
    );
}

function rejectedTieRows(rows: readonly NonShotCandidateRow[]): readonly string[] {
  return rows
    .filter((row) => row.selected === "NO" && row.tieBreakNeeded === "YES")
    .slice(0, 12)
    .map(
      (row) =>
        `| ${row.actionId} | ${row.candidateType} | ${row.candidateScore} | ${row.selectedCandidateScore} | ${row.rawGap} | ${row.tieBreakReason} | ${row.rejectionReason} |`,
    );
}

function recommendationLine(recommendations: readonly string[]): string {
  return recommendations.length === 0 ? "KEEP_SCORING_VALUES" : recommendations.join(", ");
}

export function createRouteDecisionAndBalanceReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const ranking = summarizeNonShotCandidateRankingCalibration(input.batchCalibration);
  const routeBalance = summarizeRouteBalancePostRankingMonitoring(input);
  const routeSuccess = summarizeRouteSuccessRateCalibration(input);
  const tryGrounding = summarizeTryGroundingPressureCalibration(input);
  const cleanShot = summarizeCleanShotSuccessCalibration(input);
  const routeEconomy = summarizePostResolutionRouteEconomyMonitoring(input);
  const dangerEconomy = summarizeDangerPhaseConversionEconomy(input);
  const continuationPayoff = summarizeContinuationPayoffCalibration(input);
  const matchVolume = summarizeMatchDurationPossessionVolumeCalibration(input);
  const fullMatch = summarizeFullMatchEconomyValidation(input);
  const tieRecommendation = ranking.equalOrNearTieDecisionCount > 0 ? "MONITOR_EQUAL_SCORE_DECISIONS" : "KEEP_RANKING_CALIBRATION";
  const currentRecommendations = [
    "KEEP_SCORING_VALUES",
    ranking.recommendation,
    tieRecommendation,
    routeBalance.recommendation,
    ...routeSuccess.recommendations,
  ];

  return [
    "# Route Decision and Balance",
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
    "- live score still comes only from active ScoringEvents",
    "- batch/live separation preserved",
    `- candidate rows persisted: ${ranking.candidateRowsPersisted}`,
    `- post-calibration shot-to-try/drop selected ratio: ${ranking.shotToTryDropSelectedRatio}:1`,
    `- equal-score stronger-score wording: ${ranking.strongerScoreWordingOnEqualScoreCount}`,
    `- route balance recommendation: ${routeBalance.recommendation}`,
    `- route success recommendations: ${routeSuccess.recommendations.join(", ")}`,
    `- clean shot success calibration: active; CLEAN_SHOT ${cleanShot.cleanShotSuccessRate}%, overall SHOT ${cleanShot.overallShotSuccessRate}%, FORCED_SHOT ${cleanShot.forcedShotSuccessRate}%; recommendation ${cleanShot.recommendations.join(", ")}`,
    `- try grounding pressure calibration: active; TRY ${tryGrounding.trySuccessRate}%, contested TRY ${tryGrounding.contestedTrySuccessRate}%; recommendation ${tryGrounding.recommendations.join(", ")}`,
    `- post-resolution route economy monitoring: active; average total points ${routeEconomy.scorelineHealth.averageTotalPoints}, 0-0 draw rate ${routeEconomy.scorelineHealth.nilNilDrawRate}%, risks ${routeEconomy.metaRisks.join(", ") || "none"}; recommendation ${routeEconomy.recommendations.join(", ")}`,
    `- danger phase conversion economy: active; sterile danger phases ${dangerEconomy.sterileDangerPhaseCount}, danger-to-score conversion ${dangerEconomy.dangerToScoreConversionRate}%, recommendations ${dangerEconomy.recommendations.join(", ")}`,
    `- continuation payoff calibration: active; projected sterile danger rate ${continuationPayoff.projectedSterileDangerRate}%, SUPPORT_CLUSTER_RECYCLE payoff ${continuationPayoff.supportClusterRecyclePayoffRate}%, FORWARD_PROGRESS payoff ${continuationPayoff.forwardProgressPayoffRate}%; recommendation ${continuationPayoff.recommendations.join(", ")}`,
    `- match duration possession volume calibration: active; projected 0-0 draw rate ${matchVolume.scorelineHealth.nilNilDrawRate}%, calibrated possessions ${matchVolume.possessionVolume.calibratedOffensivePossessionsPerMatch}; recommendation ${matchVolume.recommendations.join(", ")}`,
    `- full-match economy validation: active; observed 0-0 draw rate ${fullMatch.scorelineHealth.nilNilDrawRate}%, average total points ${fullMatch.scorelineHealth.averageTotalPoints}, unique final scores ${fullMatch.scorelineHealth.uniqueFinalScores}; recommendation ${fullMatch.recommendations.join(", ")}`,
    "",
    "## Candidate Ranking Calibration",
    `- danger decisions instrumented: ${ranking.dangerDecisionsInstrumented}`,
    `- candidate rows persisted: ${ranking.candidateRowsPersisted}`,
    `- selected SHOT actions: ${ranking.selectedShotActions}`,
    `- selected TRY_TOUCHDOWN_ATTEMPT rows: ${ranking.selectedTryAttempts}`,
    `- selected DROP_GOAL_ATTEMPT rows: ${ranking.selectedDropAttempts}`,
    `- selected carry/switch/progression rows: ${ranking.selectedCarrySwitchProgression}`,
    `- selected safe continuity rows: ${ranking.selectedSafeContinuity}`,
    `- shot dominance improving at ranking level: ${ranking.shotDominanceImprovingAtRankingLevel ? "YES" : "NO"}`,
    `- recommendation: ${ranking.recommendation}`,
    "",
    "| candidate type | rows persisted | selected rows | selection share |",
    "| --- | --- | --- | --- |",
    ...candidateTypeRows(ranking.rows),
    "",
    "## Candidate Tie-Breaking and Decision Explainability",
    `- equal or near-tie selected decisions: ${ranking.equalOrNearTieDecisionCount}`,
    `- equal-score rejected candidates: ${ranking.equalScoreRejectionCount}`,
    `- stronger-score wording on equal-score rejections: ${ranking.strongerScoreWordingOnEqualScoreCount}`,
    `- recommendation: ${tieRecommendation}`,
    "",
    "### Tie-Breaker Stack",
    "1. legality",
    "2. direct scoring probability",
    "3. expected points",
    "4. tactical value",
    "5. chain value",
    "6. next-action potential",
    "7. risk score",
    "8. fatigue impact",
    "9. pressure impact",
    "10. style fit",
    "11. team-shape fit",
    "12. rest-defense cost",
    "13. loss-channel risk",
    "14. phase context",
    "15. current score context",
    "16. action variety / anti-repetition",
    "17. coach intent / team identity",
    "",
    "| selected action | team | selected candidate | candidate score | next-best score | raw gap | tie-break reason | fields used |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...selectedTieRows(ranking.rows),
    "",
    "| rejected action | candidate | candidate score | selected score | raw gap | tie-break reason | rejection reason |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rejectedTieRows(ranking.rows),
    "",
    "## Route Balance Post-Ranking Monitoring",
    `- selected SHOT actions: ${routeBalance.selectedShotActions}`,
    `- selected TRY_TOUCHDOWN_ATTEMPT actions: ${routeBalance.selectedTryAttempts}`,
    `- selected DROP_GOAL_ATTEMPT actions: ${routeBalance.selectedDropAttempts}`,
    `- selected carry/switch/progression actions: ${routeBalance.selectedAdvanceContinuationActions}`,
    `- selected safe continuity actions: ${routeBalance.selectedSafeContinuityActions}`,
    `- shot-to-try/drop selected ratio: ${routeBalance.shotToTryDropSelectedRatio}:1`,
    `- meta-risks: ${routeBalance.metaRisks.join(", ") || "none"}`,
    `- recommendation: ${routeBalance.recommendation}`,
    "",
    "| route family | selected count | selected share | tactical read |",
    "| --- | --- | --- | --- |",
    ...routeBalance.routeSelectionBalance.map(
      (row) => `| ${row.routeFamily} | ${row.selectedCount} | ${row.selectedShare}% | ${row.tacticalRead} |`,
    ),
    "",
    "| route family | points | points share | scoring events | tactical read |",
    "| --- | --- | --- | --- | --- |",
    ...routeBalance.routeScoringBalance.map(
      (row) => `| ${row.routeFamily} | ${row.points} | ${row.pointsShare}% | ${row.scoringEvents} | ${row.tacticalRead} |`,
    ),
    "",
    "## Route Success Rate Calibration",
    `- SHOT: ${routeSuccess.shotAttempts} attempts, ${routeSuccess.shotGoals} goals, ${routeSuccess.shotSuccessRate}%`,
    `- CLEAN_SHOT: ${routeSuccess.cleanShotAttempts} attempts, ${routeSuccess.cleanShotGoals} goals, ${routeSuccess.cleanShotSuccessRate}%`,
    `- FORCED_SHOT: ${routeSuccess.forcedShotAttempts} attempts, ${routeSuccess.forcedShotGoals} goals, ${routeSuccess.forcedShotSuccessRate}%`,
    `- TRY_TOUCHDOWN: ${routeSuccess.tryAttempts} attempts, ${routeSuccess.triesScored} tries, ${routeSuccess.trySuccessRate}%`,
    `- DROP_GOAL: ${routeSuccess.dropAttempts} attempts, ${routeSuccess.dropGoals} goals, ${routeSuccess.dropSuccessRate}%`,
    `- CONVERSION_GOAL: ${routeSuccess.conversionAttempts} attempts, ${routeSuccess.conversionsMade} goals, ${routeSuccess.conversionSuccessRate}%`,
    `- recommendation: ${routeSuccess.recommendations.join(", ")}`,
    "",
    "## Clean Shot Success Calibration",
    `- previous CLEAN_SHOT success rate: ${cleanShot.previousCleanShotSuccessRate}%`,
    `- calibrated CLEAN_SHOT success rate: ${cleanShot.cleanShotSuccessRate}%`,
    `- calibrated overall SHOT success rate: ${cleanShot.overallShotSuccessRate}%`,
    `- calibrated FORCED_SHOT success rate: ${cleanShot.forcedShotSuccessRate}%`,
    `- threshold-edge clean goals reduced: ${cleanShot.thresholdEdgeCleanGoalsReduced}`,
    `- strong GK influence count: ${cleanShot.strongGkInfluenceCount}`,
    `- recommendation: ${cleanShot.recommendations.join(", ")}`,
    "",
    "## Try Grounding Pressure Calibration",
    `- previous TRY_TOUCHDOWN success rate: ${tryGrounding.previousTrySuccessRate}%`,
    `- calibrated TRY_TOUCHDOWN success rate: ${tryGrounding.trySuccessRate}%`,
    `- calibrated contested try success rate: ${tryGrounding.contestedTrySuccessRate}%`,
    `- LOST_FORWARD count: ${tryGrounding.lostForwardCount}`,
    `- LOST_FORWARD with strong control count: ${tryGrounding.lostForwardWithStrongControlCount}`,
    `- HELD_UP count: ${tryGrounding.heldUpCount}`,
    `- TACKLED_SHORT count: ${tryGrounding.tackledShortCount}`,
    `- recommendation: ${tryGrounding.recommendations.join(", ")}`,
    "",
    "## Post-Resolution Route Economy Monitoring",
    `- average total points: ${routeEconomy.scorelineHealth.averageTotalPoints}`,
    `- median total points: ${routeEconomy.scorelineHealth.medianTotalPoints}`,
    `- 0-0 draw rate: ${routeEconomy.scorelineHealth.nilNilDrawRate}%`,
    `- scoring draw rate: ${routeEconomy.scorelineHealth.scoringDrawRate}%`,
    `- one-score game rate: ${routeEconomy.scorelineHealth.oneScoreGameRate}%`,
    `- blowout rate: ${routeEconomy.scorelineHealth.blowoutRate}%`,
    `- unique final scores: ${routeEconomy.scorelineHealth.uniqueFinalScores}`,
    `- route economy risks: ${routeEconomy.metaRisks.join(", ") || "none"}`,
    `- recommendation: ${routeEconomy.recommendations.join(", ")}`,
    "",
    "## Danger Phase Conversion Economy",
    `- sterile danger phases: ${dangerEconomy.sterileDangerPhaseCount}`,
    `- sterile danger rate: ${dangerEconomy.sterileDangerRate}%`,
    `- danger-to-score conversion rate: ${dangerEconomy.dangerToScoreConversionRate}%`,
    `- 0-0 draw rate: ${dangerEconomy.nilNilDrawRate}%`,
    `- meta-risks: ${dangerEconomy.metaRisks.join(", ") || "none"}`,
    `- recommendation: ${dangerEconomy.recommendations.join(", ")}`,
    "",
    "## Continuation Payoff Calibration",
    `- current sterile danger rate: ${continuationPayoff.currentSterileDangerRate}%`,
    `- projected sterile danger rate: ${continuationPayoff.projectedSterileDangerRate}%`,
    `- projected 0-0 draw rate: ${continuationPayoff.projectedNilNilDrawRate}%`,
    `- SUPPORT_CLUSTER_RECYCLE payoff rate: ${continuationPayoff.supportClusterRecyclePayoffRate}%`,
    `- FORWARD_PROGRESS payoff rate: ${continuationPayoff.forwardProgressPayoffRate}%`,
    `- recommendation: ${continuationPayoff.recommendations.join(", ")}`,
    "",
    "## Match Duration & Possession Volume Calibration",
    `- match length interpretation: ${matchVolume.matchLengthInterpretation}`,
    `- calibrated offensive possessions per match: ${matchVolume.possessionVolume.calibratedOffensivePossessionsPerMatch}`,
    `- calibrated danger phases per match: ${matchVolume.dangerPhaseVolume.calibratedDangerPhasesPerMatch}`,
    `- projected 0-0 draw rate: ${matchVolume.scorelineHealth.nilNilDrawRate}%`,
    `- recommendation: ${matchVolume.recommendations.join(", ")}`,
    "",
    "## Full-Match Economy Validation",
    `- matches simulated: ${fullMatch.matchesSimulated}`,
    `- observed 0-0 draw rate: ${fullMatch.scorelineHealth.nilNilDrawRate}%`,
    `- average total points: ${fullMatch.scorelineHealth.averageTotalPoints}`,
    `- median total points: ${fullMatch.scorelineHealth.medianTotalPoints}`,
    `- unique final scores: ${fullMatch.scorelineHealth.uniqueFinalScores}`,
    `- route economy risks: ${fullMatch.metaRisks.join(", ") || "none"}`,
    `- recommendation: ${fullMatch.recommendations.join(", ")}`,
    "",
    "## Current Route Recommendations",
    `- recommendations: ${recommendationLine([...new Set([...currentRecommendations, ...cleanShot.recommendations, ...routeEconomy.recommendations, ...dangerEconomy.recommendations, ...continuationPayoff.recommendations, ...matchVolume.recommendations, ...fullMatch.recommendations])])}`,
    "- interpretation: route decisions are monitored through candidate ranking, tie-breaking, route selection balance, and route success before any scoring-value rebalance.",
    "- guardrail: scoring values remain unchanged and PENALTY_SHOT remains inactive.",
    "- guardrail: source reports remain in reports/ and are consolidated only for reports/share.",
    "",
  ].join("\n");
}
