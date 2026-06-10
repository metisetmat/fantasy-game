import type { MatchReport } from "../../contracts/engineToCoach";
import { VALIDATED_FULL_MATCH_ECONOMY_ANCHOR } from "./fullMatchEconomyAnchors";
import { createSegmentDiversityDiagnostics } from "./segmentDiversityDiagnostics";

export type FullMatchHarnessSanityWarning =
  | "SINGLE_RUN_NOT_GLOBAL_ECONOMY"
  | "POSSIBLE_SEGMENT_PATTERN_REPETITION"
  | "INFLATED_SINGLE_RUN_SCORE"
  | "REPETITIVE_KEY_MOMENTS"
  | "FLAT_FATIGUE_SIGNAL"
  | "MISSING_SEGMENT_STATE_PROPAGATION"
  | "MISSING_FATIGUE_PROPAGATION"
  | "MISSING_MOMENTUM_VARIATION";

export type FullMatchHarnessSanityReport = {
  readonly scope: "FULL_MATCH_HARNESS_SINGLE_RUN";
  readonly verdict: "OK" | "WARNING" | "FAIL_CONTRACT";
  readonly warnings: readonly FullMatchHarnessSanityWarning[];
  readonly interpretation: string;
  readonly mayInvalidateGlobalScoringEconomy: false;
  readonly recommendedNextActions: readonly string[];
};

const HIGH_SINGLE_RUN_SCORE_THRESHOLD = 35;
const LOPSIDED_SINGLE_RUN_SCORE_DIFFERENCE = 21;
const REPETITIVE_PATTERN_SHARE = 0.5;
const FLAT_FATIGUE_DELTA_THRESHOLD = 1;

function totalScore(report: MatchReport): number {
  return report.score.home + report.score.away;
}

function scoringMomentShare(report: MatchReport): number {
  if (report.keyMoments.length === 0) {
    return 0;
  }

  const scoringEventIds = new Set(report.timeline.filter((event) => event.eventType === "scoring").map((event) => event.eventId));
  const scoringMoments = report.keyMoments.filter((moment) => scoringEventIds.has(moment.eventId)).length;

  return scoringMoments / report.keyMoments.length;
}

function mostCommonPatternShare(patterns: readonly string[]): number {
  if (patterns.length === 0) {
    return 0;
  }

  const counts = new Map<string, number>();

  for (const pattern of patterns) {
    counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
  }

  return Math.max(...counts.values()) / patterns.length;
}

function isFatigueFlat(report: MatchReport): boolean {
  const playerDeltas = report.fatigueReport.playerSummaries.map((summary) =>
    Math.abs(summary.conditionStart - summary.conditionEnd),
  );

  if (playerDeltas.length === 0) {
    return true;
  }

  return Math.max(...playerDeltas) <= FLAT_FATIGUE_DELTA_THRESHOLD;
}

function recommendationForWarning(warning: FullMatchHarnessSanityWarning): string {
  switch (warning) {
    case "SINGLE_RUN_NOT_GLOBAL_ECONOMY":
      return "add batch validation if global scoring is questioned";
    case "POSSIBLE_SEGMENT_PATTERN_REPETITION":
    case "MISSING_SEGMENT_STATE_PROPAGATION":
    case "MISSING_MOMENTUM_VARIATION":
      return "improve segment diversity and propagate momentum between segments";
    case "INFLATED_SINGLE_RUN_SCORE":
      return "treat the score as a harness/report warning and compare against batch economy before making scoring claims";
    case "REPETITIVE_KEY_MOMENTS":
      return "improve key moment diversity";
    case "FLAT_FATIGUE_SIGNAL":
    case "MISSING_FATIGUE_PROPAGATION":
      return "propagate fatigue between segments";
  }
}

export function analyzeFullMatchHarnessSanity(report: MatchReport): FullMatchHarnessSanityReport {
  const warnings = new Set<FullMatchHarnessSanityWarning>(["SINGLE_RUN_NOT_GLOBAL_ECONOMY"]);
  const scoreDifference = Math.abs(report.score.home - report.score.away);

  if (totalScore(report) > HIGH_SINGLE_RUN_SCORE_THRESHOLD || scoreDifference >= LOPSIDED_SINGLE_RUN_SCORE_DIFFERENCE) {
    warnings.add("INFLATED_SINGLE_RUN_SCORE");
  }

  const segmentDiagnostics = createSegmentDiversityDiagnostics(report);
  const familyPatternShare = mostCommonPatternShare(segmentDiagnostics.map((segment) => segment.eventFamilyPattern));
  const zonePatternShare = mostCommonPatternShare(segmentDiagnostics.map((segment) => segment.zonePattern));

  if (segmentDiagnostics.length > 1 && (familyPatternShare >= REPETITIVE_PATTERN_SHARE || zonePatternShare >= REPETITIVE_PATTERN_SHARE)) {
    warnings.add("POSSIBLE_SEGMENT_PATTERN_REPETITION");
    warnings.add("MISSING_SEGMENT_STATE_PROPAGATION");
    warnings.add("MISSING_MOMENTUM_VARIATION");
  }

  if (report.keyMoments.length > 0 && scoringMomentShare(report) >= 0.6) {
    warnings.add("REPETITIVE_KEY_MOMENTS");
  }

  if (isFatigueFlat(report)) {
    warnings.add("FLAT_FATIGUE_SIGNAL");
    warnings.add("MISSING_FATIGUE_PROPAGATION");
  }

  const orderedWarnings = [...warnings];

  return {
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    verdict: orderedWarnings.length > 1 ? "WARNING" : "OK",
    warnings: orderedWarnings,
    interpretation:
      `This is a full-match harness/report sanity warning. It does not override the validated 50-match full-match economy. Current validated average total points anchor: ${VALIDATED_FULL_MATCH_ECONOMY_ANCHOR.averageTotalPoints}.`,
    mayInvalidateGlobalScoringEconomy: false,
    recommendedNextActions: [...new Set(orderedWarnings.map(recommendationForWarning))],
  };
}
