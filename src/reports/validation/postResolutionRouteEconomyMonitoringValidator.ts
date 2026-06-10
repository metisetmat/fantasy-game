import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type PostResolutionRouteEconomyStatus = "PASS" | "FAIL";

interface PostResolutionRouteEconomyCheck {
  readonly label: string;
  readonly status: PostResolutionRouteEconomyStatus;
  readonly detail: string;
}

export interface PostResolutionRouteEconomyValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly PostResolutionRouteEconomyCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): PostResolutionRouteEconomyCheck {
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
  readonly checks: readonly PostResolutionRouteEconomyCheck[];
  readonly matchesSimulated: number;
  readonly cleanShotSuccessRate: number;
  readonly trySuccessRate: number;
  readonly dropSuccessRate: number;
  readonly shareFileCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Post-Resolution Route Economy Monitoring Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matches simulated: ${input.matchesSimulated}`,
    `- clean shot success rate: ${input.cleanShotSuccessRate}%`,
    `- try success rate: ${input.trySuccessRate}%`,
    `- drop success rate: ${input.dropSuccessRate}%`,
    `- share file count: ${input.shareFileCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validatePostResolutionRouteEconomyMonitoring(input: {
  readonly reportDirectory: string;
}): PostResolutionRouteEconomyValidationResult {
  const report = readIfExists(join(input.reportDirectory, "post-resolution-route-economy-monitoring.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const cleanShotValidation = readIfExists(join(input.reportDirectory, "validation.clean-shot-success-calibration.md"));
  const tryGroundingValidation = readIfExists(join(input.reportDirectory, "validation.try-grounding-pressure-calibration.md"));
  const goalkeeperValidation = readIfExists(join(input.reportDirectory, "validation.goalkeeper-shot-stopping-impact-calibration.md"));
  const routeDecisionValidation = readIfExists(join(input.reportDirectory, "validation.route-decision-and-balance.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const shareDirectory = join(input.reportDirectory, "share");
  const shareFileCount = existsSync(shareDirectory) ? 0 : 0;
  const scoringValueLeakage =
    /SHOT_GOAL = (?!3 points)\d+ points/.test(report) ||
    /TRY_TOUCHDOWN = (?!5 points)\d+ points/.test(report) ||
    /CONVERSION_GOAL = (?!2 points)\d+ points/.test(report) ||
    /DROP_GOAL = (?!2 points)\d+ points/.test(report);
  const cleanShotSuccessRate = numberField(report, "clean shot success rate");
  const trySuccessRate = numberField(report, "try touchdown success rate");
  const dropSuccessRate = numberField(report, "drop goal success rate");
  const checks: readonly PostResolutionRouteEconomyCheck[] = [
    check("post-resolution-route-economy-monitoring.md exists", report.includes("# Post-Resolution Route Economy Monitoring"), "report generated"),
    check("Route Point Share Monitoring section exists", report.includes("## Route Point Share Monitoring"), "point share visible"),
    check("Scoreline Health section exists", report.includes("## Scoreline Health"), "scoreline health visible"),
    check("Route Diversity section exists", report.includes("## Route Diversity"), "route diversity visible"),
    check("Style Impact section exists", report.includes("## Style Impact"), "style impact visible"),
    check("Coach Readability section exists", report.includes("## Coach Readability"), "coach readability visible"),
    check("Meta-Risk Detection section exists", report.includes("## Meta-Risk Detection"), "meta-risk visible"),
    check("scoring values unchanged", !scoringValueLeakage && report.includes("scoring values unchanged"), "values unchanged"),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && !/PENALTY_SHOT.*active: YES/.test(report), "PENALTY inactive"),
    check("live score from active ScoringEvents only", report.includes("live score comes only from active ScoringEvents") && scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live scoring guarded"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("clean shot calibration remains PASS", cleanShotValidation.includes("Status: PASS"), "clean shot PASS"),
    check("try grounding calibration remains PASS", tryGroundingValidation.includes("Status: PASS"), "try grounding PASS"),
    check("goalkeeper impact validation remains PASS", goalkeeperValidation.includes("Status: PASS"), "GK PASS"),
    check("route decision and balance validation remains PASS", routeDecisionValidation.includes("Status: PASS"), "route decision PASS"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("recommendations are monitoring recommendations", report.includes("KEEP_SCORING_VALUES") && report.includes("ONLY_REBALANCE_SCORING_AFTER_ROUTE_ECONOMY_MONITORING"), "recommendations visible"),
  ];
  const reportPath = join(input.reportDirectory, "validation.post-resolution-route-economy-monitoring.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      matchesSimulated: numberField(report, "matches simulated"),
      cleanShotSuccessRate,
      trySuccessRate,
      dropSuccessRate,
      shareFileCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
