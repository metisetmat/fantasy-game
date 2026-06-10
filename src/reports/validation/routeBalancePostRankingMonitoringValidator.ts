import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles } from "../sharePack";

type RouteBalanceStatus = "PASS" | "FAIL";

interface RouteBalanceCheck {
  readonly label: string;
  readonly status: RouteBalanceStatus;
  readonly detail: string;
}

export interface RouteBalancePostRankingMonitoringValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly RouteBalanceCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): RouteBalanceCheck {
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

function decimalField(text: string, label: string): number {
  const match = new RegExp(`- ${label}: ([0-9]+(?:\\.[0-9]+)?)`).exec(text);

  return match?.[1] === undefined ? 0 : Number.parseFloat(match[1]);
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function renderMarkdown(input: {
  readonly checks: readonly RouteBalanceCheck[];
  readonly selectedShotActions: number;
  readonly selectedTryAttempts: number;
  readonly selectedDropAttempts: number;
  readonly selectedContinuationActions: number;
  readonly selectedSafeContinuityActions: number;
  readonly shotToTryDropSelectedRatio: number;
  readonly metaRiskCount: number;
  readonly strongerScoreWordingCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Route Balance Post-Ranking Monitoring Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- selected SHOT actions: ${input.selectedShotActions}`,
    `- selected TRY_TOUCHDOWN_ATTEMPT actions: ${input.selectedTryAttempts}`,
    `- selected DROP_GOAL_ATTEMPT actions: ${input.selectedDropAttempts}`,
    `- selected carry/switch/progression actions: ${input.selectedContinuationActions}`,
    `- selected safe continuity actions: ${input.selectedSafeContinuityActions}`,
    `- shot-to-try/drop selected ratio: ${input.shotToTryDropSelectedRatio}:1`,
    `- meta-risk count: ${input.metaRiskCount}`,
    `- stronger-score wording count: ${input.strongerScoreWordingCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateRouteBalancePostRankingMonitoring(input: {
  readonly reportDirectory: string;
}): RouteBalancePostRankingMonitoringValidationResult {
  const report = readIfExists(join(input.reportDirectory, "route-balance-post-ranking-monitoring.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const nonShotRanking = readIfExists(join(input.reportDirectory, "non-shot-candidate-ranking-calibration.md"));
  const tieBreaking = readIfExists(join(input.reportDirectory, "candidate-tie-breaking-decision-explainability.md"));
  const tieBreakingValidation = readIfExists(join(input.reportDirectory, "validation.candidate-tie-breaking-decision-explainability.md"));
  const candidateExecuted = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const unifiedLiveScoring = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const selectedShotActions = numberField(report, "selected SHOT actions");
  const selectedTryAttempts = numberField(report, "selected TRY_TOUCHDOWN_ATTEMPT actions");
  const selectedDropAttempts = numberField(report, "selected DROP_GOAL_ATTEMPT actions");
  const selectedContinuationActions = numberField(report, "selected carry/switch/progression actions");
  const selectedSafeContinuityActions = numberField(report, "selected safe continuity actions");
  const shotToTryDropSelectedRatio = decimalField(report, "shot-to-try/drop selected ratio");
  const strongerScoreWordingCount = numberField(report, "equal-score stronger-score wording");
  const metaRiskLine = /- meta-risk flags: ([^\n]+)/.exec(report)?.[1] ?? "";
  const metaRiskCount = metaRiskLine === "none" || metaRiskLine.length === 0 ? 0 : metaRiskLine.split(",").length;
  const recommendation = /- recommendation: ([A-Z_]+)/.exec(report)?.[1] ?? "missing";
  const allowedRecommendations = [
    "KEEP_SCORING_VALUES",
    "KEEP_RANKING_CALIBRATION",
    "MONITOR_ROUTE_BALANCE",
    "REVIEW_TRY_SELECTION_VOLUME",
    "REVIEW_DROP_VISIBILITY",
    "REVIEW_SHOT_SELECTION_IF_TOO_LOW",
    "REVIEW_ROUTE_SUCCESS_RATES",
    "ONLY_REBALANCE_SCORING_AFTER_ROUTE_MONITORING",
  ];
  const scoringValueLeakageCount =
    countMatches(report + scoringEvents + nonShotRanking + tieBreaking, /SHOT_GOAL = (?!3 points)\d+ points/g) +
    countMatches(report + scoringEvents + nonShotRanking + tieBreaking, /TRY_TOUCHDOWN = (?!5 points)\d+ points/g) +
    countMatches(report + scoringEvents + nonShotRanking + tieBreaking, /CONVERSION_GOAL = (?!2 points)\d+ points/g) +
    countMatches(report + scoringEvents + nonShotRanking + tieBreaking, /DROP_GOAL = (?!2 points)\d+ points/g);
  const penaltyShotActiveLeakageCount = countMatches(report + scoringEvents + nonShotRanking + tieBreaking, /PENALTY_SHOT.*active: YES/g);
  const expectedShareFileCount = expectedSharePackFiles(input.reportDirectory).length;

  const checks: readonly RouteBalanceCheck[] = [
    check("route balance report exists", report.includes("Route Balance Post-Ranking Monitoring"), "report generated"),
    check("Route Selection Balance section exists", report.includes("## Route Selection Balance"), "selection section visible"),
    check("Route Scoring Balance section exists", report.includes("## Route Scoring Balance"), "scoring section visible"),
    check("Route Success Rates section exists", report.includes("## Route Success Rates"), "success section visible"),
    check("Meta-Risk Detection section exists", report.includes("## Meta-Risk Detection"), "risk section visible"),
    check("Style Impact section exists", report.includes("## Style Impact"), "style section visible"),
    check("Coach Readability section exists", report.includes("## Coach Readability"), "coach section visible"),
    check("scoring values unchanged", scoringValueLeakageCount === 0, `${scoringValueLeakageCount}`),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && penaltyShotActiveLeakageCount === 0, "PENALTY inactive"),
    check("live score from active ScoringEvents only", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS") && unifiedLiveScoring.includes("Status: PASS"), "live stream PASS"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("candidate rows remain persisted", numberField(report, "candidate rows persisted") >= 180, `${numberField(report, "candidate rows persisted")}`),
    check("tie-break explanations remain present", report.includes("tie-breaking active: YES") && tieBreakingValidation.includes("Status: PASS"), "tie-breaking PASS"),
    check("equal-score stronger-score wording remains 0", strongerScoreWordingCount === 0, `${strongerScoreWordingCount}`),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("candidate/executed consistency PASS", candidateExecuted.includes("Status: PASS"), "candidate/executed PASS"),
    check("coach summary exposes route monitoring", coachSummary.includes("route balance monitoring"), "coach line visible"),
    check("tactical evidence exposes route monitoring", tacticalEvidence.includes("route balance monitoring"), "tactical line visible"),
    check("scoring events summary exposes route monitoring", scoringEvents.includes("route balance monitoring"), "scoring line visible"),
    check("non-shot ranking report links route monitoring", nonShotRanking.includes("route balance monitoring"), "ranking line visible"),
    check("tie-breaking report links route monitoring", tieBreaking.includes("route balance monitoring"), "tie-breaking line visible"),
    check("route selection includes all required families", ["SHOT", "TRY_TOUCHDOWN", "DROP_GOAL", "ADVANCE_CONTINUATION", "SAFE_CONTINUITY"].every((token) => report.includes(`| ${token} |`)), "all route families visible"),
    check("route success includes requested rates", ["FORCED_SHOT", "CLEAN_SHOT", "CONTESTED_TRY", "BLOCKED_DROP"].every((token) => report.includes(`| ${token} |`)), "special rates visible"),
    check("recommendation is allowed", allowedRecommendations.includes(recommendation), recommendation),
    check("share pack <= 20 files", expectedShareFileCount <= 20, `${expectedShareFileCount}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.route-balance-post-ranking-monitoring.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      selectedShotActions,
      selectedTryAttempts,
      selectedDropAttempts,
      selectedContinuationActions,
      selectedSafeContinuityActions,
      shotToTryDropSelectedRatio,
      metaRiskCount,
      strongerScoreWordingCount,
      recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
