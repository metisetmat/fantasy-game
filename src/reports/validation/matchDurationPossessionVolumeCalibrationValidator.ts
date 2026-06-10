import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles } from "../sharePack";

type MatchDurationStatus = "PASS" | "FAIL";

interface MatchDurationCheck {
  readonly label: string;
  readonly status: MatchDurationStatus;
  readonly detail: string;
}

export interface MatchDurationPossessionVolumeCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly MatchDurationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): MatchDurationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function numberField(text: string, label: string): number {
  const match = new RegExp(`- ${label}: (\\d+)`).exec(text);

  return match?.[1] === undefined ? 0 : Number.parseInt(match[1], 10);
}

function renderMarkdown(input: {
  readonly checks: readonly MatchDurationCheck[];
  readonly projectedNilNilRate: number;
  readonly calibratedPossessions: number;
  readonly calibratedDangerPhases: number;
  readonly shareFileCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Match Duration & Possession Volume Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- projected 0-0 draw rate: ${input.projectedNilNilRate}%`,
    `- calibrated offensive possessions per match: ${input.calibratedPossessions}`,
    `- calibrated danger phases per match: ${input.calibratedDangerPhases}`,
    `- planned share file count: ${input.shareFileCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Recommendation",
    "- KEEP_SCORING_VALUES",
    "- CALIBRATE_FULL_MATCH_VOLUME",
    "- REDUCE_UNDER_SAMPLED_0_0",
    "- REVIEW_POSSESSION_VOLUME",
    "- REVIEW_DANGER_PHASE_VOLUME",
    "- REVIEW_STYLE_SCORING_VOLUME",
    "- PREPARE_BONUS_POINTS_AFTER_BASE_ECONOMY",
    "- ONLY_REBALANCE_SCORING_AFTER_MATCH_VOLUME_CALIBRATION",
    "",
  ].join("\n");
}

export function validateMatchDurationPossessionVolumeCalibration(input: {
  readonly reportDirectory: string;
}): MatchDurationPossessionVolumeCalibrationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "match-duration-possession-volume-calibration.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const continuationPayoff = readIfExists(join(input.reportDirectory, "validation.continuation-payoff-calibration.md"));
  const routeEconomy = readIfExists(join(input.reportDirectory, "validation.route-economy-monitoring.md"));
  const routeResolution = readIfExists(join(input.reportDirectory, "validation.route-resolution-calibrations.md"));
  const routeDecision = readIfExists(join(input.reportDirectory, "validation.route-decision-and-balance.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const scoringValueLeakage =
    /SHOT_GOAL = (?!3 points)\d+ points/.test(report) ||
    /TRY_TOUCHDOWN = (?!5 points)\d+ points/.test(report) ||
    /CONVERSION_GOAL = (?!2 points)\d+ points/.test(report) ||
    /DROP_GOAL = (?!2 points)\d+ points/.test(report);
  const projectedNilNilRate = numberField(report, "projected 0-0 draw rate after full-match volume calibration");
  const checks: readonly MatchDurationCheck[] = [
    check("match-duration-possession-volume-calibration.md exists", report.includes("# Match Duration & Possession Volume Calibration"), "report generated"),
    check("Match Length Interpretation section exists", report.includes("## Match Length Interpretation"), "match length visible"),
    check("Possession Volume Calibration section exists", report.includes("## Possession Volume Calibration"), "possession volume visible"),
    check("Danger Phase Volume Calibration section exists", report.includes("## Danger Phase Volume Calibration"), "danger volume visible"),
    check("Scoreline Health After Volume Calibration section exists", report.includes("## Scoreline Health After Volume Calibration"), "scoreline health visible"),
    check("Style Impact section exists", report.includes("## Style Impact"), "style impact visible"),
    check("0-0 Explanation Audit section exists", report.includes("## 0-0 Explanation Audit"), "nil-nil audit visible"),
    check("Bonus Readiness Note section exists", report.includes("## Bonus Readiness Note"), "bonus readiness visible"),
    check("scoring values unchanged", !scoringValueLeakage && report.includes("scoring values unchanged"), "values unchanged"),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && !/PENALTY_SHOT.*active: YES/.test(report), "PENALTY inactive"),
    check("no bonus points implemented yet", report.includes("no bonus points implemented yet"), "bonus not active"),
    check("live score from active ScoringEvents only", report.includes("live score comes only from active ScoringEvents") && scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live guarded"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("no forced scoring events", report.includes("no forced scoring events"), "no forced scoring"),
    check("no global route success buff", report.includes("no global route success buff"), "no global route buff"),
    check("projected 0-0 rate inside temporary bound", projectedNilNilRate <= 8, `${projectedNilNilRate}%`),
    check("continuation payoff calibration remains PASS", continuationPayoff.includes("Status: PASS"), "continuation PASS"),
    check("route economy monitoring remains PASS", routeEconomy.includes("Status: PASS"), "route economy PASS"),
    check("route resolution calibrations remain PASS", routeResolution.includes("Status: PASS"), "route resolution PASS"),
    check("route decision and balance remains PASS", routeDecision.includes("Status: PASS"), "route decision PASS"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("share pack <= 20 files", expectedSharePackFiles(input.reportDirectory).length <= 20, `${expectedSharePackFiles(input.reportDirectory).length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.match-duration-possession-volume-calibration.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      projectedNilNilRate,
      calibratedPossessions: numberField(report, "calibrated offensive possessions per match"),
      calibratedDangerPhases: numberField(report, "calibrated danger phases per match"),
      shareFileCount: expectedSharePackFiles(input.reportDirectory).length,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
