import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles } from "../sharePack";

type CleanShotSuccessCalibrationStatus = "PASS" | "FAIL";

interface CleanShotSuccessCalibrationCheck {
  readonly label: string;
  readonly status: CleanShotSuccessCalibrationStatus;
  readonly detail: string;
}

export interface CleanShotSuccessCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CleanShotSuccessCalibrationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): CleanShotSuccessCalibrationCheck {
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

function percentField(text: string, label: string): number {
  const match = new RegExp(`- ${label}: (\\d+)%`).exec(text);

  return match?.[1] === undefined ? 0 : Number.parseInt(match[1], 10);
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function renderMarkdown(input: {
  readonly checks: readonly CleanShotSuccessCalibrationCheck[];
  readonly previousCleanShotSuccessRate: number;
  readonly cleanShotSuccessRate: number;
  readonly overallShotSuccessRate: number;
  readonly forcedShotSuccessRate: number;
  readonly thresholdEdgeCleanGoalsReduced: number;
  readonly strongGkInfluenceCount: number;
  readonly shareFileCount: number;
  readonly recommendations: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Clean Shot Success Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- previous CLEAN_SHOT success rate: ${input.previousCleanShotSuccessRate}%`,
    `- calibrated CLEAN_SHOT success rate: ${input.cleanShotSuccessRate}%`,
    `- calibrated overall SHOT success rate: ${input.overallShotSuccessRate}%`,
    `- calibrated FORCED_SHOT success rate: ${input.forcedShotSuccessRate}%`,
    `- threshold-edge clean goals reduced: ${input.thresholdEdgeCleanGoalsReduced}`,
    `- strong GK influence count: ${input.strongGkInfluenceCount}`,
    `- share file count: ${input.shareFileCount}`,
    `- recommendations: ${input.recommendations}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateCleanShotSuccessCalibration(input: {
  readonly reportDirectory: string;
}): CleanShotSuccessCalibrationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "clean-shot-success-calibration.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const routeDecision = readIfExists(join(input.reportDirectory, "validation.route-decision-and-balance.md"));
  const goalkeeperImpact = readIfExists(join(input.reportDirectory, "validation.goalkeeper-shot-stopping-impact-calibration.md"));
  const tryGrounding = readIfExists(join(input.reportDirectory, "validation.try-grounding-pressure-calibration.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const shareDirectory = join(input.reportDirectory, "share");
  const shareFilesOnDiskCount = existsSync(shareDirectory)
    ? readdirSync(shareDirectory).filter((entry) => !entry.startsWith(".")).length
    : 0;
  const shareFileCount = Math.max(shareFilesOnDiskCount, expectedSharePackFiles(input.reportDirectory).length);
  const previousCleanShotSuccessRate = percentField(report, "previous CLEAN_SHOT success rate");
  const cleanShotSuccessRate = percentField(report, "calibrated CLEAN_SHOT success rate");
  const overallShotSuccessRate = percentField(report, "calibrated overall SHOT success rate");
  const forcedShotSuccessRate = percentField(report, "calibrated FORCED_SHOT success rate");
  const thresholdEdgeCleanGoalsReduced = numberField(report, "threshold-edge clean goals reduced");
  const strongGkInfluenceCount = numberField(report, "strong GK influence count");
  const recommendations = /- recommendations: ([A-Z_, ]+)/.exec(report)?.[1] ?? "missing";
  const scoringValueLeakageCount =
    countMatches(report + scoringEvents, /SHOT_GOAL = (?!3 points)\d+ points/g) +
    countMatches(report + scoringEvents, /TRY_TOUCHDOWN = (?!5 points)\d+ points/g) +
    countMatches(report + scoringEvents, /CONVERSION_GOAL = (?!2 points)\d+ points/g) +
    countMatches(report + scoringEvents, /DROP_GOAL = (?!2 points)\d+ points/g);
  const allowedRecommendations = [
    "KEEP_SCORING_VALUES",
    "REVIEW_CLEAN_SHOT_SUCCESS",
    "REDUCE_THRESHOLD_EDGE_CLEAN_GOALS",
    "INCREASE_STRONG_GK_INFLUENCE_ON_CLEAN_SHOTS",
    "KEEP_FORCED_SHOT_SUPPRESSION",
    "MONITOR_ROUTE_POINT_SHARE_AFTER_CLEAN_SHOT_CALIBRATION",
    "ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION",
  ];
  const recommendationsAllowed = recommendations
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .every((item) => allowedRecommendations.includes(item));
  const checks: readonly CleanShotSuccessCalibrationCheck[] = [
    check("clean shot success calibration report exists", report.includes("Clean Shot Success Calibration"), "report generated"),
    check("Clean Shot Decomposition section exists", report.includes("## Clean Shot Decomposition"), "decomposition visible"),
    check("Threshold And Failed-Save Review section exists", report.includes("## Threshold And Failed-Save Review"), "threshold review visible"),
    check("Calibration Requirements section exists", report.includes("## Calibration Requirements"), "requirements visible"),
    check("Health Bands section exists", report.includes("## Health Bands"), "health bands visible"),
    check("Route Economy Impact section exists", report.includes("## Route Economy Impact"), "route economy visible"),
    check("clean shot success below previous 64%", cleanShotSuccessRate < previousCleanShotSuccessRate, `${cleanShotSuccessRate}%`),
    check("CLEAN_SHOT success target is visible", report.includes("CLEAN_SHOT success target: 50%-60%"), "target visible"),
    check("CLEAN_SHOT success is in target or explicitly reviewed", (cleanShotSuccessRate >= 50 && cleanShotSuccessRate <= 60) || recommendations.includes("REVIEW_CLEAN_SHOT_SUCCESS"), `${cleanShotSuccessRate}%`),
    check("overall SHOT success target is respected or monitored", overallShotSuccessRate >= 30 && overallShotSuccessRate <= 35, `${overallShotSuccessRate}%`),
    check("FORCED_SHOT success remains very low", forcedShotSuccessRate <= 5, `${forcedShotSuccessRate}%`),
    check("threshold-edge clean goals reduced", thresholdEdgeCleanGoalsReduced > 0, `${thresholdEdgeCleanGoalsReduced}`),
    check("strong GK influence is represented", strongGkInfluenceCount > 0, `${strongGkInfluenceCount}`),
    check("no global shot nerf", report.includes("no global shot nerf") && report.includes("forced shot logic unchanged"), "guardrail visible"),
    check("scoring values unchanged", scoringValueLeakageCount === 0, `${scoringValueLeakageCount}`),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && !/PENALTY_SHOT.*active: YES/.test(report + scoringEvents), "PENALTY inactive"),
    check("live score from active ScoringEvents only", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live scoring stream visible"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("candidate ranking unchanged", report.includes("candidate ranking unchanged"), "ranking guard visible"),
    check("tie-breaking unchanged", report.includes("tie-breaking unchanged"), "tie-break guard visible"),
    check("try grounding calibration remains PASS", tryGrounding.includes("Status: PASS"), "try grounding PASS"),
    check("goalkeeper impact validation remains PASS", goalkeeperImpact.includes("Status: PASS"), "GK impact PASS"),
    check("route decision and balance validation remains PASS", routeDecision.includes("Status: PASS"), "route decision PASS"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("coach summary exposes clean shot calibration", coachSummary.includes("clean shot success calibration: active"), "coach line visible"),
    check("tactical evidence exposes clean shot calibration", tacticalEvidence.includes("clean shot success calibration: active"), "tactical line visible"),
    check("recommendations are allowed", recommendationsAllowed, recommendations),
    check("share pack <= 20 files", shareFileCount <= 20, `${shareFileCount}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.clean-shot-success-calibration.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      previousCleanShotSuccessRate,
      cleanShotSuccessRate,
      overallShotSuccessRate,
      forcedShotSuccessRate,
      thresholdEdgeCleanGoalsReduced,
      strongGkInfluenceCount,
      shareFileCount,
      recommendations,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
