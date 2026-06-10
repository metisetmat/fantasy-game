import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type GoalkeeperShotStoppingImpactCalibrationStatus = "PASS" | "FAIL";

interface GoalkeeperShotStoppingImpactCalibrationCheck {
  readonly label: string;
  readonly status: GoalkeeperShotStoppingImpactCalibrationStatus;
  readonly detail: string;
}

export interface GoalkeeperShotStoppingImpactCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly GoalkeeperShotStoppingImpactCalibrationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): GoalkeeperShotStoppingImpactCalibrationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function numberField(text: string, label: string): number {
  const match = new RegExp(`- ${label}: (-?\\d+)`).exec(text);

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
  readonly checks: readonly GoalkeeperShotStoppingImpactCalibrationCheck[];
  readonly shotRowsChecked: number;
  readonly failedSaveCount: number;
  readonly thresholdEdgeGoalCount: number;
  readonly gkUnderweightedGoalCount: number;
  readonly projectedShotSuccessRate: number;
  readonly projectedCleanShotSuccessRate: number;
  readonly projectedReboundConcessionDelta: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Goalkeeper Shot-Stopping Impact Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- shot rows checked: ${input.shotRowsChecked}`,
    `- failed save count: ${input.failedSaveCount}`,
    `- threshold-edge goal count: ${input.thresholdEdgeGoalCount}`,
    `- GK underweighted goal count: ${input.gkUnderweightedGoalCount}`,
    `- projected SHOT success after GK calibration: ${input.projectedShotSuccessRate}%`,
    `- projected CLEAN_SHOT success after GK calibration: ${input.projectedCleanShotSuccessRate}%`,
    `- projected rebound concession delta: ${input.projectedReboundConcessionDelta}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateGoalkeeperShotStoppingImpactCalibration(input: {
  readonly reportDirectory: string;
}): GoalkeeperShotStoppingImpactCalibrationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "goalkeeper-shot-stopping-impact-calibration.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const routeSuccess = readIfExists(join(input.reportDirectory, "route-success-rate-calibration.md"));
  const routeSuccessValidation = readIfExists(join(input.reportDirectory, "validation.route-success-rate-calibration.md"));
  const routeBalanceValidation = readIfExists(join(input.reportDirectory, "validation.route-balance-post-ranking-monitoring.md"));
  const nonShotRankingValidation = readIfExists(join(input.reportDirectory, "validation.non-shot-candidate-ranking-calibration.md"));
  const tieBreakingValidation = readIfExists(join(input.reportDirectory, "validation.candidate-tie-breaking-decision-explainability.md"));
  const candidateExecuted = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const unifiedLiveScoring = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const shotRowsChecked = numberField(report, "shot rows checked");
  const failedSaveCount = numberField(report, "failed save count");
  const thresholdEdgeGoalCount = numberField(report, "threshold-edge goal count");
  const gkUnderweightedGoalCount = numberField(report, "GK underweighted goal count");
  const projectedShotSuccessRate = percentField(report, "projected SHOT success after GK calibration");
  const projectedCleanShotSuccessRate = percentField(report, "projected CLEAN_SHOT success after GK calibration");
  const projectedReboundConcessionDelta = numberField(report, "projected rebound concession delta");
  const recommendationLine = /- recommendations: ([A-Z_, ]+)/.exec(report)?.[1] ?? "missing";
  const allowedRecommendations = [
    "KEEP_GK_MODEL",
    "REVIEW_GK_IMPACT_ON_CLEAN_SHOTS",
    "REVIEW_FAILED_SAVE_THRESHOLDS",
    "REVIEW_THRESHOLD_EDGE_GOALS",
    "INCREASE_STRONG_GK_SAVE_WEIGHT",
    "KEEP_SHOT_SUCCESS_GLOBAL_BUT_REBALANCE_GK_EFFECT",
    "ONLY_REBALANCE_SCORING_AFTER_GK_CALIBRATION",
    "NEXT_REVIEW_TRY_GROUNDING_PRESSURE",
  ];
  const recommendationsAllowed = recommendationLine
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .every((item) => allowedRecommendations.includes(item));
  const requiredFatigueFields = [
    "goalkeeper fatigue specialization",
    "physical fatigue",
    "mental fatigue",
    "readiness",
    "concentration load",
    "shots faced recently",
    "time since last action",
    "pressure context",
    "defensive organization",
    "previous error",
    "rebound control",
    "second-save recovery",
  ];
  const readinessStates = ["SET", "ALERT", "COLD", "UNDER_PRESSURE", "OVERLOADED"];
  const scoringValueLeakageCount =
    countMatches(report + routeSuccess + scoringEvents, /SHOT_GOAL = (?!3 points)\d+ points/g) +
    countMatches(report + routeSuccess + scoringEvents, /TRY_TOUCHDOWN = (?!5 points)\d+ points/g) +
    countMatches(report + routeSuccess + scoringEvents, /CONVERSION_GOAL = (?!2 points)\d+ points/g) +
    countMatches(report + routeSuccess + scoringEvents, /DROP_GOAL = (?!2 points)\d+ points/g);
  const penaltyShotActiveLeakageCount = countMatches(report + routeSuccess + scoringEvents, /PENALTY_SHOT.*active: YES/g);

  const checks: readonly GoalkeeperShotStoppingImpactCalibrationCheck[] = [
    check("goalkeeper shot-stopping impact report exists", report.includes("Goalkeeper Shot-Stopping Impact Calibration"), "report generated"),
    check("GK impact by shot window section exists", report.includes("## Goalkeeper Impact By Shot Window"), "shot-window table visible"),
    check("GK impact by goalkeeper quality section exists", report.includes("## Goalkeeper Impact By Goalkeeper Quality"), "quality table visible"),
    check("failed-save decomposition section exists", report.includes("## Failed-Save Decomposition"), "failed-save table visible"),
    check("threshold-edge analysis section exists", report.includes("## Threshold-Edge Analysis"), "threshold-edge table visible"),
    check("calibration proposal section exists", report.includes("## Calibration Proposal"), "proposal visible"),
    check("route economy impact section exists", report.includes("## Route Economy Impact After GK Calibration"), "route economy visible"),
    check("goalkeeper fatigue specialization section exists", report.includes("## Goalkeeper Fatigue Specialization"), "GK fatigue section visible"),
    check("goalkeeper fatigue fields are visible", requiredFatigueFields.every((token) => report.toLowerCase().includes(token)), "required fields visible"),
    check("goalkeeper readiness states are documented", readinessStates.every((token) => report.includes(token)), "readiness taxonomy visible"),
    check("all shot windows are reported", ["CLEAN", "PRESSED", "FORCED", "REBOUND", "TRANSITION"].every((token) => report.includes(token)), "window taxonomy visible"),
    check("all goalkeeper impact buckets are reported", ["LOW_GK_IMPACT", "AVERAGE_GK_IMPACT", "STRONG_GK_IMPACT", "ELITE_GK_IMPACT"].every((token) => report.includes(token)), "bucket taxonomy visible"),
    check("failed-save taxonomy is visible", report.includes("FAILED_SAVE"), "FAILED_SAVE visible"),
    check("threshold-edge taxonomy is visible", report.includes("THRESHOLD_EDGE_CASE"), "THRESHOLD_EDGE_CASE visible"),
    check("shot rows checked are persisted", shotRowsChecked >= 180, `${shotRowsChecked}`),
    check("projected clean shot success is computed", projectedCleanShotSuccessRate > 0, `${projectedCleanShotSuccessRate}%`),
    check("projected shot success is computed", projectedShotSuccessRate > 0, `${projectedShotSuccessRate}%`),
    check("scoring values unchanged", scoringValueLeakageCount === 0, `${scoringValueLeakageCount}`),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && penaltyShotActiveLeakageCount === 0, "PENALTY inactive"),
    check("live score from active ScoringEvents only", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS") && unifiedLiveScoring.includes("Status: PASS"), "live stream PASS"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("candidate rows remain persisted", routeSuccessValidation.includes("candidate rows persisted") && routeSuccessValidation.includes("Status: PASS"), "route success validation PASS"),
    check("tie-break explanations remain present", tieBreakingValidation.includes("Status: PASS"), "tie-breaking PASS"),
    check("equal-score stronger-score wording remains 0", routeSuccessValidation.includes("stronger-score wording count: 0") || routeSuccess.includes("equal-score stronger-score wording: 0"), "stronger-score wording 0"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("candidate ranking PASS", nonShotRankingValidation.includes("Status: PASS"), "non-shot ranking PASS"),
    check("candidate/executed consistency PASS", candidateExecuted.includes("Status: PASS"), "candidate/executed PASS"),
    check("route balance monitoring PASS", routeBalanceValidation.includes("Status: PASS"), "route balance PASS"),
    check("route success calibration PASS", routeSuccessValidation.includes("Status: PASS"), "route success PASS"),
    check("scoring events summary exposes GK calibration", scoringEvents.includes("goalkeeper shot-stopping impact calibration: active"), "scoring line visible"),
    check("tactical evidence exposes GK calibration", tacticalEvidence.includes("goalkeeper impact calibration: active"), "tactical line visible"),
    check("coach summary exposes GK calibration", coachSummary.includes("goalkeeper impact calibration: active"), "coach line visible"),
    check("tactical evidence exposes GK fatigue specialization", tacticalEvidence.includes("goalkeeper mental fatigue") && tacticalEvidence.includes("second-save recovery score"), "tactical GK fatigue visible"),
    check("coach summary exposes GK fatigue specialization", coachSummary.includes("goalkeeper fatigue specialization: active"), "coach GK fatigue line visible"),
    check("recommendations are allowed", recommendationsAllowed, recommendationLine),
  ];
  const reportPath = join(input.reportDirectory, "validation.goalkeeper-shot-stopping-impact-calibration.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      shotRowsChecked,
      failedSaveCount,
      thresholdEdgeGoalCount,
      gkUnderweightedGoalCount,
      projectedShotSuccessRate,
      projectedCleanShotSuccessRate,
      projectedReboundConcessionDelta,
      recommendation: recommendationLine,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
