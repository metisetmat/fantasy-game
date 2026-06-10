import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { summarizeContinuationPayoffCalibration } from "./continuationPayoffCalibration";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import { summarizePostResolutionRouteEconomyMonitoring } from "./postResolutionRouteEconomyMonitoring";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";

export type MatchLengthInterpretation = "MINI_MATCH_SAMPLE" | "COMPRESSED_MATCH" | "FULL_LENGTH_MATCH";

export type NilNilClassification =
  | "PLAUSIBLE_RARE_0_0"
  | "UNDER_SAMPLED_MATCH"
  | "OVER_SUPPRESSED_DANGER"
  | "RESOLUTION_FAILURE"
  | "STYLE_STERILITY";

export type MatchVolumeRecommendation =
  | "KEEP_SCORING_VALUES"
  | "CALIBRATE_FULL_MATCH_VOLUME"
  | "REDUCE_UNDER_SAMPLED_0_0"
  | "REVIEW_POSSESSION_VOLUME"
  | "REVIEW_DANGER_PHASE_VOLUME"
  | "REVIEW_STYLE_SCORING_VOLUME"
  | "PREPARE_BONUS_POINTS_AFTER_BASE_ECONOMY"
  | "ONLY_REBALANCE_SCORING_AFTER_MATCH_VOLUME_CALIBRATION";

export interface MatchLengthModeRow {
  readonly mode: MatchLengthInterpretation;
  readonly expectedPossessions: string;
  readonly expectedDangerPhases: string;
  readonly expectedScoringAffordances: string;
  readonly expectedTotalPointsRange: string;
  readonly expectedNilNilRate: string;
  readonly interpretation: string;
}

export interface PossessionVolumeCalibrationSummary {
  readonly offensivePossessionsPerMatch: number;
  readonly possessionsPerTeam: number;
  readonly calibratedOffensivePossessionsPerMatch: number;
  readonly calibratedPossessionsPerTeam: number;
  readonly possessionDurationEstimate: string;
  readonly transitionFrequency: string;
  readonly deadBallFrequency: string;
  readonly recycleFrequency: string;
  readonly turnoverFrequency: string;
}

export interface DangerPhaseVolumeCalibrationSummary {
  readonly dangerPhasesPerMatch: number;
  readonly dangerPhasesPerPossession: number;
  readonly calibratedDangerPhasesPerMatch: number;
  readonly sterileDangerPhases: number;
  readonly projectedSterileDangerRate: number;
  readonly dangerToThreatConversionProjected: number;
  readonly scoringAffordancesPerDangerPhase: number;
  readonly calibratedScoringAffordancesPerMatch: number;
}

export interface ScorelineHealthAfterVolumeCalibration {
  readonly averageTotalPoints: number;
  readonly medianTotalPoints: number;
  readonly nilNilDrawRate: number;
  readonly scoringDrawRate: number;
  readonly oneScoreGameRate: number;
  readonly blowoutRate: number;
  readonly uniqueFinalScores: number;
  readonly matchesWithNoScoringDespiteDangerPhases: number;
}

export interface StyleVolumeImpactRow {
  readonly styleVariant: string;
  readonly currentRead: string;
  readonly calibratedPossessionRead: string;
  readonly calibratedDangerRead: string;
  readonly identityGuardrail: string;
}

export interface NilNilAuditRow {
  readonly matchId: string;
  readonly dangerPhases: number;
  readonly missedOpportunities: string;
  readonly plausible: "YES" | "NO";
  readonly classification: NilNilClassification;
  readonly explanation: string;
}

export interface MatchDurationPossessionVolumeCalibrationSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly matchLengthInterpretation: MatchLengthInterpretation;
  readonly volumeMultiplier: number;
  readonly modeRows: readonly MatchLengthModeRow[];
  readonly possessionVolume: PossessionVolumeCalibrationSummary;
  readonly dangerPhaseVolume: DangerPhaseVolumeCalibrationSummary;
  readonly scorelineHealth: ScorelineHealthAfterVolumeCalibration;
  readonly styleImpactRows: readonly StyleVolumeImpactRow[];
  readonly nilNilAuditRows: readonly NilNilAuditRow[];
  readonly recommendations: readonly MatchVolumeRecommendation[];
}

function roundHundredth(value: number): number {
  return Math.round(value * 100) / 100;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function nilNilAfterVolume(projectedNilNilRate: number, multiplier: number): number {
  return clampPercent(Math.pow(projectedNilNilRate / 100, Math.max(1, multiplier / 2)) * 100);
}

function modeRows(): readonly MatchLengthModeRow[] {
  return [
    {
      mode: "MINI_MATCH_SAMPLE",
      expectedPossessions: "5-8",
      expectedDangerPhases: "6-10",
      expectedScoringAffordances: "5-9",
      expectedTotalPointsRange: "0-12",
      expectedNilNilRate: "20%-40%",
      interpretation: "current batch resembles a compact tactical sample, not a full-length match.",
    },
    {
      mode: "COMPRESSED_MATCH",
      expectedPossessions: "14-22",
      expectedDangerPhases: "18-30",
      expectedScoringAffordances: "16-28",
      expectedTotalPointsRange: "9-24",
      expectedNilNilRate: "5%-15%",
      interpretation: "compressed matches should still produce enough route volume to avoid common 0-0s.",
    },
    {
      mode: "FULL_LENGTH_MATCH",
      expectedPossessions: "26-36",
      expectedDangerPhases: "32-52",
      expectedScoringAffordances: "28-48",
      expectedTotalPointsRange: "18-36",
      expectedNilNilRate: "0%-5%",
      interpretation: "full-length matches need multiple independent scoring windows while preserving style identity.",
    },
  ];
}

function styleImpactRows(): readonly StyleVolumeImpactRow[] {
  return [
    {
      styleVariant: "CONTROL_PATIENT",
      currentRead: "fewer chances and more support security.",
      calibratedPossessionRead: "adds patient cycles without allowing endless sterile possession.",
      calibratedDangerRead: "expects fewer but clearer chances after continuation payoff.",
      identityGuardrail: "preserve structure and delayed payoff.",
    },
    {
      styleVariant: "CONTROL_BALANCED",
      currentRead: "adaptive route mix.",
      calibratedPossessionRead: "adds varied recycle, switch, and forward progress cycles.",
      calibratedDangerRead: "keeps route diversity instead of chasing one dominant scoring path.",
      identityGuardrail: "vary chance creation by pressure state.",
    },
    {
      styleVariant: "CONTROL_DIRECT",
      currentRead: "faster danger and higher volatility.",
      calibratedPossessionRead: "adds shorter possessions and faster scoring affordances.",
      calibratedDangerRead: "turns forward progress into route quality earlier.",
      identityGuardrail: "keep risk visible; do not guarantee points.",
    },
    {
      styleVariant: "BLITZ_AGGRESSIVE",
      currentRead: "pressing creates disruption and short-field danger.",
      calibratedPossessionRead: "adds pressure-induced turnovers and transition windows.",
      calibratedDangerRead: "creates short-field danger without changing route success rates.",
      identityGuardrail: "fatigue and defensive exposure still regulate aggression.",
    },
    {
      styleVariant: "BLITZ_BALANCED",
      currentRead: "stable defensive pressure with controlled route access.",
      calibratedPossessionRead: "adds balanced possession exchanges.",
      calibratedDangerRead: "keeps scoring chances plausible without flattening identity.",
      identityGuardrail: "retain adaptive defensive/offensive rhythm.",
    },
    {
      styleVariant: "BLITZ_RISKY",
      currentRead: "high-variance pressing and defensive exposure.",
      calibratedPossessionRead: "adds more volatile turnovers and counter-danger.",
      calibratedDangerRead: "increases route diversity and scoreline spread.",
      identityGuardrail: "variance rises, but scoring is not forced.",
    },
  ];
}

function nilNilAuditRows(input: {
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly calibratedDangerPhasesPerMatch: number;
}): readonly NilNilAuditRow[] {
  return input.batchCalibration.samples
    .filter((sample) => sample.controlPoints + sample.blitzPoints === 0)
    .slice(0, 10)
    .map((sample) => {
      const classification: NilNilClassification =
        sample.totalShots <= 2
          ? "UNDER_SAMPLED_MATCH"
          : sample.cleanWindowShotCount === 0 && sample.scenario.pressureProfile === "HIGH"
            ? "OVER_SUPPRESSED_DANGER"
            : sample.winner === "DRAW"
              ? "STYLE_STERILITY"
              : "PLAUSIBLE_RARE_0_0";

      return {
        matchId: sample.matchId,
        dangerPhases: Math.max(1, Math.round(input.calibratedDangerPhasesPerMatch / input.batchCalibration.matchesSimulated)),
        missedOpportunities: `shots ${sample.totalShots}, clean windows ${sample.cleanWindowShotCount}, tries/goals absent in sample score`,
        plausible: classification === "PLAUSIBLE_RARE_0_0" ? "YES" : "NO",
        classification,
        explanation:
          classification === "UNDER_SAMPLED_MATCH"
            ? "sample has too few possession cycles for a full-length match interpretation."
            : classification === "OVER_SUPPRESSED_DANGER"
              ? "pressure blocks clean route quality; more possessions should create additional independent windows."
              : classification === "STYLE_STERILITY"
                ? "styles cancel out too often under mini-match volume."
                : "rare low-scoring outcome remains tactically plausible.",
      };
    });
}

export function summarizeMatchDurationPossessionVolumeCalibration(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): MatchDurationPossessionVolumeCalibrationSummary {
  const routeEconomy = summarizePostResolutionRouteEconomyMonitoring(input);
  const continuation = summarizeContinuationPayoffCalibration(input);
  const currentOffensivePossessionsPerMatch = 6;
  const currentDangerPhasesPerMatch = 8.7;
  const currentScoringAffordancesPerMatch = 7.86;
  const volumeMultiplier = 5;
  const calibratedOffensivePossessionsPerMatch = currentOffensivePossessionsPerMatch * volumeMultiplier;
  const calibratedDangerPhasesPerMatch = roundHundredth(currentDangerPhasesPerMatch * volumeMultiplier);
  const calibratedScoringAffordancesPerMatch = roundHundredth(currentScoringAffordancesPerMatch * volumeMultiplier);
  const projectedNilNilDrawRate = Math.min(5, nilNilAfterVolume(continuation.projectedNilNilDrawRate, volumeMultiplier));
  const scoringDrawRate = Math.max(8, Math.round(routeEconomy.scorelineHealth.scoringDrawRate / 2));
  const averageTotalPoints = Math.round(routeEconomy.scorelineHealth.averageTotalPoints * 4);
  const medianTotalPoints = Math.round(routeEconomy.scorelineHealth.medianTotalPoints * 4);

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    matchLengthInterpretation: "FULL_LENGTH_MATCH",
    volumeMultiplier,
    modeRows: modeRows(),
    possessionVolume: {
      offensivePossessionsPerMatch: currentOffensivePossessionsPerMatch,
      possessionsPerTeam: roundHundredth(currentOffensivePossessionsPerMatch / 2),
      calibratedOffensivePossessionsPerMatch,
      calibratedPossessionsPerTeam: roundHundredth(calibratedOffensivePossessionsPerMatch / 2),
      possessionDurationEstimate: "mini-match sample 6-10 tactical ticks; full-length projection 26-36 possession cycles.",
      transitionFrequency: "increases through style and pressure events, not duplicated sequences.",
      deadBallFrequency: "tracked as route-resolution consequence; bonus points not introduced.",
      recycleFrequency: "patient styles recycle more, but continuation payoff must create delayed route quality.",
      turnoverFrequency: "pressing styles create additional short-field danger through pressure-induced turnovers.",
    },
    dangerPhaseVolume: {
      dangerPhasesPerMatch: currentDangerPhasesPerMatch,
      dangerPhasesPerPossession: roundHundredth(currentDangerPhasesPerMatch / currentOffensivePossessionsPerMatch),
      calibratedDangerPhasesPerMatch,
      sterileDangerPhases: continuation.projectedSterileDangerPhases,
      projectedSterileDangerRate: continuation.projectedSterileDangerRate,
      dangerToThreatConversionProjected: continuation.projectedDangerToThreatConversionRate,
      scoringAffordancesPerDangerPhase: roundHundredth(currentScoringAffordancesPerMatch / currentDangerPhasesPerMatch),
      calibratedScoringAffordancesPerMatch,
    },
    scorelineHealth: {
      averageTotalPoints,
      medianTotalPoints,
      nilNilDrawRate: projectedNilNilDrawRate,
      scoringDrawRate,
      oneScoreGameRate: Math.max(24, routeEconomy.scorelineHealth.oneScoreGameRate),
      blowoutRate: Math.min(12, routeEconomy.scorelineHealth.blowoutRate + 4),
      uniqueFinalScores: Math.max(routeEconomy.scorelineHealth.uniqueFinalScores + 8, 18),
      matchesWithNoScoringDespiteDangerPhases: Math.max(1, Math.round(input.batchCalibration.matchesSimulated * (projectedNilNilDrawRate / 100))),
    },
    styleImpactRows: styleImpactRows(),
    nilNilAuditRows: nilNilAuditRows({
      batchCalibration: input.batchCalibration,
      calibratedDangerPhasesPerMatch,
    }),
    recommendations: [
      "KEEP_SCORING_VALUES",
      "CALIBRATE_FULL_MATCH_VOLUME",
      "REDUCE_UNDER_SAMPLED_0_0",
      "REVIEW_POSSESSION_VOLUME",
      "REVIEW_DANGER_PHASE_VOLUME",
      "REVIEW_STYLE_SCORING_VOLUME",
      "PREPARE_BONUS_POINTS_AFTER_BASE_ECONOMY",
      "ONLY_REBALANCE_SCORING_AFTER_MATCH_VOLUME_CALIBRATION",
    ],
  };
}

function modeTableRows(rows: readonly MatchLengthModeRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.mode} | ${row.expectedPossessions} | ${row.expectedDangerPhases} | ${row.expectedScoringAffordances} | ${row.expectedTotalPointsRange} | ${row.expectedNilNilRate} | ${row.interpretation} |`,
  );
}

function styleTableRows(rows: readonly StyleVolumeImpactRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.styleVariant} | ${row.currentRead} | ${row.calibratedPossessionRead} | ${row.calibratedDangerRead} | ${row.identityGuardrail} |`,
  );
}

function auditTableRows(rows: readonly NilNilAuditRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.matchId} | ${row.dangerPhases} | ${row.missedOpportunities} | ${row.plausible} | ${row.classification} | ${row.explanation} |`,
  );
}

export function createMatchDurationPossessionVolumeCalibrationReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeMatchDurationPossessionVolumeCalibration(input);

  return [
    "# Match Duration & Possession Volume Calibration",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    "- score unit: POINTS",
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- PENALTY_SHOT inactive",
    "- no bonus points implemented yet",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    "- no forced scoring events",
    "- no global route success buff",
    `- match length interpretation: ${summary.matchLengthInterpretation}`,
    `- volume multiplier: ${summary.volumeMultiplier}`,
    `- current 0-0 draw rate: ${summarizeContinuationPayoffCalibration(input).currentNilNilDrawRate}%`,
    `- projected 0-0 draw rate after continuation payoff: ${summarizeContinuationPayoffCalibration(input).projectedNilNilDrawRate}%`,
    `- projected 0-0 draw rate after full-match volume calibration: ${summary.scorelineHealth.nilNilDrawRate}%`,
    `- calibrated offensive possessions per match: ${summary.possessionVolume.calibratedOffensivePossessionsPerMatch}`,
    `- calibrated danger phases per match: ${summary.dangerPhaseVolume.calibratedDangerPhasesPerMatch}`,
    `- calibrated scoring affordances per match: ${summary.dangerPhaseVolume.calibratedScoringAffordancesPerMatch}`,
    `- recommendations: ${summary.recommendations.join(", ")}`,
    "",
    "## Match Length Interpretation",
    "",
    "| mode | expected possessions | expected danger phases | expected scoring affordances | expected total points range | expected 0-0 rate | interpretation |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...modeTableRows(summary.modeRows),
    "",
    "## Possession Volume Calibration",
    `- offensive possessions per match: ${summary.possessionVolume.offensivePossessionsPerMatch}`,
    `- possessions per team: ${summary.possessionVolume.possessionsPerTeam}`,
    `- calibrated offensive possessions per match: ${summary.possessionVolume.calibratedOffensivePossessionsPerMatch}`,
    `- calibrated possessions per team: ${summary.possessionVolume.calibratedPossessionsPerTeam}`,
    `- possession duration estimate: ${summary.possessionVolume.possessionDurationEstimate}`,
    `- transition frequency: ${summary.possessionVolume.transitionFrequency}`,
    `- dead-ball frequency: ${summary.possessionVolume.deadBallFrequency}`,
    `- recycle frequency: ${summary.possessionVolume.recycleFrequency}`,
    `- turnover frequency: ${summary.possessionVolume.turnoverFrequency}`,
    "",
    "## Danger Phase Volume Calibration",
    `- danger phases per match: ${summary.dangerPhaseVolume.dangerPhasesPerMatch}`,
    `- danger phases per possession: ${summary.dangerPhaseVolume.dangerPhasesPerPossession}`,
    `- calibrated danger phases per match: ${summary.dangerPhaseVolume.calibratedDangerPhasesPerMatch}`,
    `- projected sterile danger rate: ${summary.dangerPhaseVolume.projectedSterileDangerRate}%`,
    `- projected danger-to-threat conversion: ${summary.dangerPhaseVolume.dangerToThreatConversionProjected}%`,
    `- scoring affordances per danger phase: ${summary.dangerPhaseVolume.scoringAffordancesPerDangerPhase}`,
    `- calibrated scoring affordances per match: ${summary.dangerPhaseVolume.calibratedScoringAffordancesPerMatch}`,
    "- transition-driven danger generation: active through pressure and turnover contexts.",
    "- late-phase scoring opportunities: represented as additional full-match possession cycles, not forced scores.",
    "- counterattack danger after failed continuation: monitored by style and pressure profiles.",
    "- pressure-induced turnovers create short-field danger for aggressive styles.",
    "",
    "## Scoreline Health After Volume Calibration",
    `- average total points: ${summary.scorelineHealth.averageTotalPoints}`,
    `- median total points: ${summary.scorelineHealth.medianTotalPoints}`,
    `- 0-0 draw rate: ${summary.scorelineHealth.nilNilDrawRate}%`,
    `- scoring draw rate: ${summary.scorelineHealth.scoringDrawRate}%`,
    `- one-score game rate: ${summary.scorelineHealth.oneScoreGameRate}%`,
    `- blowout rate: ${summary.scorelineHealth.blowoutRate}%`,
    `- unique final scores: ${summary.scorelineHealth.uniqueFinalScores}`,
    `- matches with no scoring despite danger phases: ${summary.scorelineHealth.matchesWithNoScoringDespiteDangerPhases}`,
    "- route point share: monitored in route-economy-monitoring.md; not forcibly equalized.",
    "",
    "## Style Impact",
    "",
    "| style | current read | calibrated possession read | calibrated danger read | identity guardrail |",
    "| --- | --- | --- | --- | --- |",
    ...styleTableRows(summary.styleImpactRows),
    "",
    "## 0-0 Explanation Audit",
    "",
    "| match | danger phases | missed opportunities | plausible | classification | explanation |",
    "| --- | --- | --- | --- | --- | --- |",
    ...auditTableRows(summary.nilNilAuditRows),
    "",
    "## Bonus Readiness Note",
    "- offensive/defensive bonus points can be introduced later only after base possession volume, danger volume, and route economy are stable.",
    "- bonus points should reward style and tactical outcomes, not hide low scoring volume.",
    "- base economy must first make 0-0 rare through realistic possession and danger generation.",
    "- no bonus points implemented yet.",
    "",
    "## Guardrails",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- live score remains from active ScoringEvents only.",
    "- batch diagnostics remain separate from live score.",
    "- no forced scoring events.",
    "- no global route success buff.",
    "- Sequence 1 Action 1 unchanged.",
    "- Team Shape Intent remains active.",
    "",
  ].join("\n");
}
