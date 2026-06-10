import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles } from "../sharePack";

type TryGroundingPressureCalibrationStatus = "PASS" | "FAIL";

interface TryGroundingPressureCalibrationCheck {
  readonly label: string;
  readonly status: TryGroundingPressureCalibrationStatus;
  readonly detail: string;
}

export interface TryGroundingPressureCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly TryGroundingPressureCalibrationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): TryGroundingPressureCalibrationCheck {
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
  readonly checks: readonly TryGroundingPressureCalibrationCheck[];
  readonly tryAttempts: number;
  readonly trySuccessRate: number;
  readonly contestedTrySuccessRate: number;
  readonly lostForwardCount: number;
  readonly lostForwardStrongControlCount: number;
  readonly heldUpCount: number;
  readonly tackledShortCount: number;
  readonly conversionAttempts: number;
  readonly shareFileCount: number;
  readonly recommendations: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Try Grounding Pressure Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- try attempts: ${input.tryAttempts}`,
    `- TRY_TOUCHDOWN success rate: ${input.trySuccessRate}%`,
    `- contested try success rate: ${input.contestedTrySuccessRate}%`,
    `- LOST_FORWARD count: ${input.lostForwardCount}`,
    `- LOST_FORWARD with strong control count: ${input.lostForwardStrongControlCount}`,
    `- HELD_UP count: ${input.heldUpCount}`,
    `- TACKLED_SHORT count: ${input.tackledShortCount}`,
    `- conversion attempts: ${input.conversionAttempts}`,
    `- share file count: ${input.shareFileCount}`,
    `- recommendations: ${input.recommendations}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateTryGroundingPressureCalibration(input: {
  readonly reportDirectory: string;
}): TryGroundingPressureCalibrationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "try-grounding-pressure-calibration.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const routeDecision = readIfExists(join(input.reportDirectory, "validation.route-decision-and-balance.md"));
  const goalkeeperImpact = readIfExists(join(input.reportDirectory, "validation.goalkeeper-shot-stopping-impact-calibration.md"));
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
  const tryAttempts = numberField(report, "try attempts");
  const trySuccessRate = percentField(report, "calibrated TRY_TOUCHDOWN success rate");
  const contestedTrySuccessRate = percentField(report, "calibrated contested try success rate");
  const lostForwardCount = numberField(report, "LOST_FORWARD count");
  const lostForwardStrongControlCount = numberField(report, "LOST_FORWARD with strong control count");
  const heldUpCount = numberField(report, "HELD_UP count");
  const tackledShortCount = numberField(report, "TACKLED_SHORT count");
  const conversionAttempts = numberField(report, "CONVERSION attempts");
  const recommendations = /- recommendations: ([A-Z_, ]+)/.exec(report)?.[1] ?? "missing";
  const scoringValueLeakageCount =
    countMatches(report + scoringEvents, /SHOT_GOAL = (?!3 points)\d+ points/g) +
    countMatches(report + scoringEvents, /TRY_TOUCHDOWN = (?!5 points)\d+ points/g) +
    countMatches(report + scoringEvents, /CONVERSION_GOAL = (?!2 points)\d+ points/g) +
    countMatches(report + scoringEvents, /DROP_GOAL = (?!2 points)\d+ points/g);
  const penaltyShotActiveLeakageCount = countMatches(report + scoringEvents, /PENALTY_SHOT.*active: YES/g);
  const allowedRecommendations = [
    "KEEP_SCORING_VALUES",
    "REVIEW_TRY_GROUNDING_PRESSURE",
    "REDUCE_LOST_FORWARD_OVERPUNISHMENT",
    "KEEP_HELD_UP_UNDER_GOAL_LINE_PRESSURE",
    "KEEP_TACKLED_SHORT_UNDER_POOR_SUPPORT",
    "MONITOR_CONVERSION_OPPORTUNITY_VOLUME",
    "MONITOR_SHOT_DOMINANCE_AFTER_TRY_CALIBRATION",
    "ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION",
  ];
  const recommendationsAllowed = recommendations
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .every((item) => allowedRecommendations.includes(item));
  const checks: readonly TryGroundingPressureCalibrationCheck[] = [
    check("try grounding pressure calibration report exists", report.includes("Try Grounding Pressure Calibration"), "report generated"),
    check("Try Attempt Taxonomy section exists", report.includes("## Try Attempt Taxonomy"), "taxonomy visible"),
    check("Failure Pressure Decomposition section exists", report.includes("## Failure Pressure Decomposition"), "failure decomposition visible"),
    check("Calibration Requirements section exists", report.includes("## Calibration Requirements"), "requirements visible"),
    check("Health Bands section exists", report.includes("## Health Bands"), "health bands visible"),
    check("Route Economy Impact section exists", report.includes("## Route Economy Impact"), "route economy visible"),
    check("all try taxonomy values are visible", ["OUTER_CHANNEL_ACCESS", "OUTER_HALF_SPACE_ACCESS", "WIDE_ACCESS", "SCRAMBLE_GROUNDING", "POWER_FINISH", "SUPPORT_FINISH"].every((token) => report.includes(token)), "taxonomy complete"),
    check("failure classes are visible", ["LOST_FORWARD", "HELD_UP", "TACKLED_SHORT", "SUPPORT_TOO_LATE", "DEFENDER_DOMINANCE"].every((token) => report.includes(token)), "failure classes visible"),
    check("TRY_TOUCHDOWN success target is visible", report.includes("TRY_TOUCHDOWN success target: 20%-28%"), "target visible"),
    check("contested try success target is visible", report.includes("contested try success target: 18%-25%"), "target visible"),
    check("TRY_TOUCHDOWN success is in target or explicitly reviewed", (trySuccessRate >= 20 && trySuccessRate <= 28) || recommendations.includes("REVIEW_TRY_GROUNDING_PRESSURE"), `${trySuccessRate}%`),
    check("contested try success is in target or explicitly reviewed", (contestedTrySuccessRate >= 18 && contestedTrySuccessRate <= 25) || recommendations.includes("REVIEW_TRY_GROUNDING_PRESSURE"), `${contestedTrySuccessRate}%`),
    check("LOST_FORWARD over-punishment is monitored", report.includes("LOST_FORWARD with strong control count"), `${lostForwardStrongControlCount}`),
    check("HELD_UP remains possible or watch is explicit", heldUpCount > 0 || report.includes("HELD_UP remains possible under goal-line pressure: WATCH"), `${heldUpCount}`),
    check("TACKLED_SHORT remains possible or watch is explicit", tackledShortCount > 0 || report.includes("TACKLED_SHORT remains possible under poor support or momentum: WATCH"), `${tackledShortCount}`),
    check("scoring values unchanged", scoringValueLeakageCount === 0, `${scoringValueLeakageCount}`),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && penaltyShotActiveLeakageCount === 0, "PENALTY inactive"),
    check("live score from active ScoringEvents only", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live scoring stream visible"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("candidate rows remain persisted", numberField(report, "candidate rows persisted") >= 180, "candidate rows persisted"),
    check("tie-break explanations remain present", routeDecision.includes("Tie-Breaking Validation") && routeDecision.includes("Status: PASS"), "route decision PASS"),
    check("equal-score stronger-score wording remains 0", routeDecision.includes("equal-score stronger-score wording: 0"), "stronger-score wording 0"),
    check(
      "no off-ball Z0/Z8 occupancy",
      report.includes("no off-ball Z0/Z8 occupancy is allowed") &&
        teamShape.includes("illegal Z0/Z8 off-ball occupancy count: 0"),
      "Z0/Z8 guard visible",
    ),
    check("no central/frontal try path", report.includes("no central/frontal try route is allowed") && routeDecision.includes("Status: PASS"), "central/frontal guard visible"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("route decision and balance validation PASS", routeDecision.includes("Status: PASS"), "route decision PASS"),
    check("goalkeeper impact validation PASS", goalkeeperImpact.includes("Status: PASS"), "GK impact PASS"),
    check(
      "coach summary exposes try grounding calibration",
      coachSummary.includes("try grounding pressure calibration: active") || coachSummary.includes("try attrition calibration: active"),
      "coach line visible",
    ),
    check(
      "tactical evidence exposes try grounding calibration",
      tacticalEvidence.includes("try grounding pressure calibration: active") || tacticalEvidence.includes("try attrition calibration: active"),
      "tactical line visible",
    ),
    check("recommendations are allowed", recommendationsAllowed, recommendations),
    check("share pack <= 20 files", shareFileCount <= 20 || shareFileCount === 0, `${shareFileCount}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.try-grounding-pressure-calibration.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      tryAttempts,
      trySuccessRate,
      contestedTrySuccessRate,
      lostForwardCount,
      lostForwardStrongControlCount,
      heldUpCount,
      tackledShortCount,
      conversionAttempts,
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
