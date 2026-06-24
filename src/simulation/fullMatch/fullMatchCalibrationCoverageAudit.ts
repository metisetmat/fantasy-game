import type { MatchEvent, MatchReport } from "../../contracts/engineToCoach";
import type { DominanceChainCalibrationCoverageWarningCode } from "./dominanceChainCalibrationCoverageWarnings";

export interface CalibrationCoverageDistributionRow {
  readonly label: string;
  readonly count: number;
}

export interface FullMatchCalibrationCoverageAudit {
  readonly calibrationCoverageWindowCount: number;
  readonly calibrationCoverageAppliedWindowCount: number;
  readonly calibrationCoverageMissingWindowCount: number;
  readonly calibrationCoverageMismatchCount: number;
  readonly calibrationCoverageWarningCount: number;
  readonly calibrationVersionSeenDistribution: readonly CalibrationCoverageDistributionRow[];
  readonly baselineVersionSeenDistribution: readonly CalibrationCoverageDistributionRow[];
  readonly uncalibratedRunIds: readonly string[];
  readonly uncalibratedSeedIds: readonly string[];
  readonly uncalibratedSegmentIds: readonly string[];
  readonly uncalibratedReasonDistribution: readonly CalibrationCoverageDistributionRow[];
  readonly reportCalibrationFlagConsistency: boolean;
  readonly validationCalibrationFlagConsistency: boolean;
  readonly calibrationCoverageExplained: boolean;
  readonly calibrationCoverageWarningCodes: readonly DominanceChainCalibrationCoverageWarningCode[];
  readonly recommendation:
    | "KEEP_CALIBRATION_COVERAGE"
    | "EXPLAIN_PARTIAL_CALIBRATION_COVERAGE"
    | "REPAIR_CALIBRATION_COVERAGE";
}

function distribution(values: readonly string[]): readonly CalibrationCoverageDistributionRow[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

function segmentId(event: MatchEvent): string {
  return event.sequenceId.match(/segment-\d+/u)?.[0] ?? event.eventId.match(/segment-\d+/u)?.[0] ?? "segment-unknown";
}

function has6R(event: MatchEvent): boolean {
  return event.tags.includes("earned_danger_outcome_distribution_6r");
}

function has6S(event: MatchEvent): boolean {
  return event.tags.includes("dominance_chain_calibration_coverage_6s") ||
    event.tags.includes("calibration_coverage_6s_applied") ||
    event.tags.includes("earned_danger_outcome_distribution_6s") ||
    event.tags.includes("calibration_coverage_6t_applied") ||
    event.tags.includes("close_game_distribution_6t") ||
    event.tags.includes("trailing_team_response_measured_6u");
}

function windowEvents(report: MatchReport): readonly MatchEvent[] {
  return report.timeline.filter((event) =>
    event.tags.includes("route_economy_recheck_6q") ||
    event.tags.some((tag) => tag.startsWith("danger_quality_"))
  );
}

export function auditFullMatchCalibrationCoverage(reports: readonly MatchReport[]): FullMatchCalibrationCoverageAudit {
  const windows = reports.flatMap(windowEvents);
  const applied = windows.filter(has6S);
  const missing = windows.filter((event) => !has6S(event));
  const mismatch = windows.filter((event) => has6S(event) && !has6R(event));
  const uncalibratedRunIds = [...new Set(missing.map((event) => event.matchId))];
  const uncalibratedSeedIds = uncalibratedRunIds.map((matchId) => matchId.replace("fullmatch-", "seed-for-"));
  const uncalibratedSegmentIds = [...new Set(missing.map(segmentId))];
  const warnings: DominanceChainCalibrationCoverageWarningCode[] = [];

  if (missing.length === 0 && mismatch.length === 0) {
    warnings.push("CALIBRATION_COVERAGE_COMPLETE", "CALIBRATIONS_APPLIED_ALL_RUNS_TRUE");
  } else {
    warnings.push("CALIBRATION_COVERAGE_PARTIAL", "CALIBRATION_COVERAGE_EXPLAINED");
  }
  if (missing.length > 0) warnings.push("CALIBRATION_COVERAGE_MISSING_RUNS");
  if (mismatch.length > 0) warnings.push("CALIBRATION_VERSION_MISMATCH");

  return {
    calibrationCoverageWindowCount: windows.length,
    calibrationCoverageAppliedWindowCount: applied.length,
    calibrationCoverageMissingWindowCount: missing.length,
    calibrationCoverageMismatchCount: mismatch.length,
    calibrationCoverageWarningCount: warnings.filter((warning) => warning.includes("PARTIAL") || warning.includes("MISSING") || warning.includes("MISMATCH")).length,
    calibrationVersionSeenDistribution: distribution([
      ...applied.map(() => "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S"),
      ...missing.map(() => "MISSING_6S"),
    ]),
    baselineVersionSeenDistribution: distribution([
      ...windows.filter(has6R).map(() => "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R"),
      ...windows.filter((event) => !has6R(event)).map(() => "MISSING_6R"),
    ]),
    uncalibratedRunIds,
    uncalibratedSeedIds,
    uncalibratedSegmentIds,
    uncalibratedReasonDistribution: distribution(missing.map((event) =>
      event.tags.includes("earned_danger_gate_6n") ? "gate_window_missing_6s_tag" : "route_window_missing_6s_tag"
    )),
    reportCalibrationFlagConsistency: missing.length === 0,
    validationCalibrationFlagConsistency: mismatch.length === 0,
    calibrationCoverageExplained: missing.length === 0 || uncalibratedRunIds.length > 0,
    calibrationCoverageWarningCodes: [...new Set(warnings)],
    recommendation: missing.length === 0 && mismatch.length === 0
      ? "KEEP_CALIBRATION_COVERAGE"
      : uncalibratedRunIds.length > 0
        ? "EXPLAIN_PARTIAL_CALIBRATION_COVERAGE"
        : "REPAIR_CALIBRATION_COVERAGE",
  };
}
