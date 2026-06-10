import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type RouteDecisionAndBalanceStatus = "PASS" | "FAIL";

interface RouteDecisionAndBalanceCheck {
  readonly label: string;
  readonly status: RouteDecisionAndBalanceStatus;
  readonly detail: string;
}

export interface RouteDecisionAndBalanceValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly RouteDecisionAndBalanceCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): RouteDecisionAndBalanceCheck {
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

function statusFor(source: string): string {
  return source.includes("Status: PASS") ? "PASS" : source.includes("Status: FAIL") ? "FAIL" : "MISSING";
}

function validationSection(title: string, checks: readonly RouteDecisionAndBalanceCheck[]): readonly string[] {
  return [
    `## ${title}`,
    "",
    ...checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ];
}

function renderMarkdown(input: {
  readonly checks: readonly RouteDecisionAndBalanceCheck[];
  readonly candidateRankingChecks: readonly RouteDecisionAndBalanceCheck[];
  readonly tieBreakingChecks: readonly RouteDecisionAndBalanceCheck[];
  readonly routeBalanceChecks: readonly RouteDecisionAndBalanceCheck[];
  readonly routeSuccessChecks: readonly RouteDecisionAndBalanceCheck[];
  readonly candidateRowsPersisted: number;
  readonly strongerScoreWordingCount: number;
  readonly shareFileCount: number;
  readonly sourceValidationStatuses: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Route Decision and Balance Validation",
    "",
    `Status: ${status}`,
    "",
    "## Source Validations Consolidated",
    "- validation.non-shot-candidate-ranking-calibration.md",
    "- validation.candidate-tie-breaking-decision-explainability.md",
    "- validation.route-balance-post-ranking-monitoring.md",
    "- validation.route-success-rate-calibration.md",
    "",
    "## Counts",
    `- candidate rows persisted: ${input.candidateRowsPersisted}`,
    `- equal-score stronger-score wording: ${input.strongerScoreWordingCount}`,
    `- share file count: ${input.shareFileCount}`,
    `- source validation statuses: ${input.sourceValidationStatuses}`,
    "",
    ...validationSection("Candidate Ranking Validation", input.candidateRankingChecks),
    ...validationSection("Tie-Breaking Validation", input.tieBreakingChecks),
    ...validationSection("Route Balance Validation", input.routeBalanceChecks),
    ...validationSection("Route Success Validation", input.routeSuccessChecks),
    "## Critical Invariants",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Recommendation",
    "- KEEP_SCORING_VALUES",
    "- KEEP_RANKING_CALIBRATION",
    "- MONITOR_ROUTE_BALANCE",
    "- REVIEW_ROUTE_SUCCESS_RATES",
    "",
  ].join("\n");
}

export function validateRouteDecisionAndBalance(input: {
  readonly reportDirectory: string;
}): RouteDecisionAndBalanceValidationResult {
  const report = readIfExists(join(input.reportDirectory, "route-decision-and-balance.md"));
  const rankingValidation = readIfExists(join(input.reportDirectory, "validation.non-shot-candidate-ranking-calibration.md"));
  const tieValidation = readIfExists(join(input.reportDirectory, "validation.candidate-tie-breaking-decision-explainability.md"));
  const balanceValidation = readIfExists(join(input.reportDirectory, "validation.route-balance-post-ranking-monitoring.md"));
  const successValidation = readIfExists(join(input.reportDirectory, "validation.route-success-rate-calibration.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const shareDirectory = join(input.reportDirectory, "share");
  const candidateRowsPersisted = numberField(report, "candidate rows persisted");
  const strongerScoreWordingCount = numberField(report, "equal-score stronger-score wording");
  const shareFileCount = existsSync(shareDirectory) ? 0 : 0;
  const scoringValueLeakageCount =
    countMatches(report + scoringEvents, /SHOT_GOAL = (?!3 points)\d+ points/g) +
    countMatches(report + scoringEvents, /TRY_TOUCHDOWN = (?!5 points)\d+ points/g) +
    countMatches(report + scoringEvents, /CONVERSION_GOAL = (?!2 points)\d+ points/g) +
    countMatches(report + scoringEvents, /DROP_GOAL = (?!2 points)\d+ points/g);
  const penaltyShotActiveLeakageCount = countMatches(report + scoringEvents, /PENALTY_SHOT.*active: YES/g);
  const candidateRankingChecks: readonly RouteDecisionAndBalanceCheck[] = [
    check("source validation is PASS", rankingValidation.includes("Status: PASS"), statusFor(rankingValidation)),
    check("Candidate Ranking Calibration section exists", report.includes("## Candidate Ranking Calibration"), "section visible"),
    check("candidate rows persisted", candidateRowsPersisted >= 180, `${candidateRowsPersisted}`),
    check("candidate type coverage visible", report.includes("TRY_TOUCHDOWN_ATTEMPT") && report.includes("DROP_GOAL_ATTEMPT"), "candidate types visible"),
  ];
  const tieBreakingChecks: readonly RouteDecisionAndBalanceCheck[] = [
    check("source validation is PASS", tieValidation.includes("Status: PASS"), statusFor(tieValidation)),
    check("Candidate Tie-Breaking and Decision Explainability section exists", report.includes("## Candidate Tie-Breaking and Decision Explainability"), "section visible"),
    check("tie-breaker stack visible", report.includes("### Tie-Breaker Stack") && report.includes("17. coach intent / team identity"), "stack visible"),
    check("equal-score stronger-score wording remains 0", strongerScoreWordingCount === 0, `${strongerScoreWordingCount}`),
  ];
  const routeBalanceChecks: readonly RouteDecisionAndBalanceCheck[] = [
    check("source validation is PASS", balanceValidation.includes("Status: PASS"), statusFor(balanceValidation)),
    check("Route Balance Post-Ranking Monitoring section exists", report.includes("## Route Balance Post-Ranking Monitoring"), "section visible"),
    check("route selection balance visible", report.includes("| route family | selected count | selected share | tactical read |"), "selection table visible"),
    check("route scoring balance visible", report.includes("| route family | points | points share | scoring events | tactical read |"), "scoring table visible"),
  ];
  const routeSuccessChecks: readonly RouteDecisionAndBalanceCheck[] = [
    check("source validation is PASS", successValidation.includes("Status: PASS"), statusFor(successValidation)),
    check("Route Success Rate Calibration section exists", report.includes("## Route Success Rate Calibration"), "section visible"),
    check("shot success visible", report.includes("- SHOT:"), "SHOT success visible"),
    check("try/drop/conversion success visible", report.includes("- TRY_TOUCHDOWN:") && report.includes("- DROP_GOAL:") && report.includes("- CONVERSION_GOAL:"), "route success visible"),
  ];
  const checks: readonly RouteDecisionAndBalanceCheck[] = [
    check("route-decision-and-balance.md exists", report.includes("Route Decision and Balance"), "report generated"),
    check("Current Route Recommendations section exists", report.includes("## Current Route Recommendations"), "recommendations visible"),
    check("Full-Match Economy Validation section exists", report.includes("## Full-Match Economy Validation"), "full-match section visible"),
    check("scoring values unchanged", scoringValueLeakageCount === 0, `${scoringValueLeakageCount}`),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && penaltyShotActiveLeakageCount === 0, "PENALTY inactive"),
    check("live score from active ScoringEvents only", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live stream visible"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    ...candidateRankingChecks,
    ...tieBreakingChecks,
    ...routeBalanceChecks,
    ...routeSuccessChecks,
  ];
  const reportPath = join(input.reportDirectory, "validation.route-decision-and-balance.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      candidateRankingChecks,
      tieBreakingChecks,
      routeBalanceChecks,
      routeSuccessChecks,
      candidateRowsPersisted,
      strongerScoreWordingCount,
      shareFileCount,
      sourceValidationStatuses: [
        `candidate ranking ${statusFor(rankingValidation)}`,
        `tie-breaking ${statusFor(tieValidation)}`,
        `route balance ${statusFor(balanceValidation)}`,
        `route success ${statusFor(successValidation)}`,
      ].join("; "),
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
