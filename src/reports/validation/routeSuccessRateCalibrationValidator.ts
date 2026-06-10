import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type RouteSuccessStatus = "PASS" | "FAIL";

interface RouteSuccessCheck {
  readonly label: string;
  readonly status: RouteSuccessStatus;
  readonly detail: string;
}

export interface RouteSuccessRateCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly RouteSuccessCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): RouteSuccessCheck {
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

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function renderMarkdown(input: {
  readonly checks: readonly RouteSuccessCheck[];
  readonly candidateRowsPersisted: number;
  readonly strongerScoreWordingCount: number;
  readonly tryRows: number;
  readonly shotRows: number;
  readonly dropRows: number;
  readonly recommendations: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Route Success Rate Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- candidate rows persisted: ${input.candidateRowsPersisted}`,
    `- stronger-score wording count: ${input.strongerScoreWordingCount}`,
    `- try decomposition rows: ${input.tryRows}`,
    `- shot decomposition rows: ${input.shotRows}`,
    `- drop decomposition rows: ${input.dropRows}`,
    `- recommendations: ${input.recommendations}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateRouteSuccessRateCalibration(input: {
  readonly reportDirectory: string;
}): RouteSuccessRateCalibrationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "route-success-rate-calibration.md"));
  const routeBalance = readIfExists(join(input.reportDirectory, "route-balance-post-ranking-monitoring.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const tieBreaking = readIfExists(join(input.reportDirectory, "validation.candidate-tie-breaking-decision-explainability.md"));
  const candidateExecuted = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const unifiedLiveScoring = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const candidateRowsPersisted = numberField(report, "candidate rows persisted");
  const strongerScoreWordingCount = numberField(report, "equal-score stronger-score wording");
  const tryRows = countMatches(report, /\| match-\d+-try-\d+ \|/g);
  const shotRows = countMatches(report, /\| match-\d+-shot-\d+ \|/g);
  const dropRows = countMatches(report, /\| match-\d+-drop-/g);
  const recommendationLine = /- recommendations: ([A-Z_, ]+)/.exec(report)?.[1] ?? "missing";
  const allowedRecommendations = [
    "KEEP_SUCCESS_RATES",
    "REVIEW_TRY_GROUNDING_DIFFICULTY",
    "REVIEW_CONTACT_PRESSURE_ON_TRIES",
    "REVIEW_CLEAN_SHOT_SUCCESS",
    "REVIEW_DROP_VISIBILITY",
    "REVIEW_CONVERSION_OPPORTUNITY_VOLUME",
    "ONLY_REBALANCE_SCORING_AFTER_SUCCESS_CALIBRATION",
  ];
  const recommendationsAllowed = recommendationLine
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .every((item) => allowedRecommendations.includes(item));
  const scoringValueLeakageCount =
    countMatches(report + scoringEvents + routeBalance, /SHOT_GOAL = (?!3 points)\d+ points/g) +
    countMatches(report + scoringEvents + routeBalance, /TRY_TOUCHDOWN = (?!5 points)\d+ points/g) +
    countMatches(report + scoringEvents + routeBalance, /CONVERSION_GOAL = (?!2 points)\d+ points/g) +
    countMatches(report + scoringEvents + routeBalance, /DROP_GOAL = (?!2 points)\d+ points/g);
  const penaltyShotActiveLeakageCount = countMatches(report + scoringEvents + routeBalance, /PENALTY_SHOT.*active: YES/g);

  const checks: readonly RouteSuccessCheck[] = [
    check("route success report exists", report.includes("Route Success Rate Calibration"), "report generated"),
    check("Try Success Decomposition section exists", report.includes("## Try Success Decomposition"), "try section visible"),
    check("Shot Success Decomposition section exists", report.includes("## Shot Success Decomposition"), "shot section visible"),
    check("Drop Success Decomposition section exists", report.includes("## Drop Success Decomposition"), "drop section visible"),
    check("Conversion Opportunity Analysis section exists", report.includes("## Conversion Opportunity Analysis"), "conversion section visible"),
    check("try rows include required failure classes", ["LOST_FORWARD", "HELD_UP", "TACKLED_SHORT", "SUPPORT_TOO_LATE", "DEFENDER_DOMINANCE"].some((token) => report.includes(token)), "failure taxonomy visible"),
    check("shot rows include goal classification", ["CLEAN_DESERVED_GOAL", "KEEPER_BEATEN_FAIRLY", "LOW_QUALITY_OVERREWARDED_SHOT", "THRESHOLD_EDGE_CASE"].some((token) => report.includes(token)), "goal taxonomy visible"),
    check("drop rows include tactical choice", report.includes("good tactical choice"), "drop tactical choice visible"),
    check("scoring values unchanged", scoringValueLeakageCount === 0, `${scoringValueLeakageCount}`),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && penaltyShotActiveLeakageCount === 0, "PENALTY inactive"),
    check("live score from active ScoringEvents only", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS") && unifiedLiveScoring.includes("Status: PASS"), "live stream PASS"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("candidate rows remain persisted", candidateRowsPersisted >= 180, `${candidateRowsPersisted}`),
    check("tie-break explanations remain present", report.includes("tie-breaking active: YES") && tieBreaking.includes("Status: PASS"), "tie-breaking PASS"),
    check("equal-score stronger-score wording remains 0", strongerScoreWordingCount === 0, `${strongerScoreWordingCount}`),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("candidate/executed consistency PASS", candidateExecuted.includes("Status: PASS"), "candidate/executed PASS"),
    check("route balance report links success calibration", routeBalance.includes("route success calibration"), "route balance line visible"),
    check("scoring events summary exposes route success calibration", scoringEvents.includes("route success calibration"), "scoring line visible"),
    check("tactical evidence exposes route success calibration", tacticalEvidence.includes("route success calibration"), "tactical line visible"),
    check("coach summary exposes route success calibration", coachSummary.includes("route success calibration"), "coach line visible"),
    check("recommendations are allowed", recommendationsAllowed, recommendationLine),
  ];
  const reportPath = join(input.reportDirectory, "validation.route-success-rate-calibration.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      candidateRowsPersisted,
      strongerScoreWordingCount,
      tryRows,
      shotRows,
      dropRows,
      recommendations: recommendationLine,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
