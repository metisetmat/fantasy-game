import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles } from "../sharePack";

type RouteEconomyMonitoringStatus = "PASS" | "FAIL";

interface RouteEconomyMonitoringCheck {
  readonly label: string;
  readonly status: RouteEconomyMonitoringStatus;
  readonly detail: string;
}

export interface RouteEconomyMonitoringValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly RouteEconomyMonitoringCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): RouteEconomyMonitoringCheck {
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
  readonly checks: readonly RouteEconomyMonitoringCheck[];
  readonly shareFileCount: number;
  readonly sterileDangerPhases: number;
  readonly projectedSterileDangerRate: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Route Economy Monitoring Validation",
    "",
    `Status: ${status}`,
    "",
    "## Source Reports Consolidated",
    "- post-resolution-route-economy-monitoring.md",
    "- danger-phase-conversion-economy.md",
    "",
    "## Counts",
    `- share file count: ${input.shareFileCount}`,
    `- sterile danger phases: ${input.sterileDangerPhases}`,
    `- projected sterile danger rate after continuation payoff calibration: ${input.projectedSterileDangerRate}%`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateRouteEconomyMonitoring(input: {
  readonly reportDirectory: string;
}): RouteEconomyMonitoringValidationResult {
  const report = readIfExists(join(input.reportDirectory, "route-economy-monitoring.md"));
  const postValidation = readIfExists(join(input.reportDirectory, "validation.post-resolution-route-economy-monitoring.md"));
  const dangerValidation = readIfExists(join(input.reportDirectory, "validation.danger-phase-conversion-economy.md"));
  const continuationValidation = readIfExists(join(input.reportDirectory, "validation.continuation-payoff-calibration.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const scoringValueLeakage =
    /SHOT_GOAL = (?!3 points)\d+ points/.test(report) ||
    /TRY_TOUCHDOWN = (?!5 points)\d+ points/.test(report) ||
    /CONVERSION_GOAL = (?!2 points)\d+ points/.test(report) ||
    /DROP_GOAL = (?!2 points)\d+ points/.test(report);
  const checks: readonly RouteEconomyMonitoringCheck[] = [
    check("route-economy-monitoring.md exists", report.includes("# Route Economy Monitoring"), "report generated"),
    check("Route Point Share Monitoring section exists", report.includes("## Route Point Share Monitoring"), "point share visible"),
    check("Scoreline Health section exists", report.includes("## Scoreline Health"), "scoreline visible"),
    check("Route Diversity section exists", report.includes("## Route Diversity"), "diversity visible"),
    check("Sterile Danger Phase Decomposition section exists", report.includes("## Sterile Danger Phase Decomposition"), "sterile danger visible"),
    check("Continuation Route Payoff section exists", report.includes("## Continuation Route Payoff"), "continuation payoff visible"),
    check("Style Impact section exists", report.includes("## Style Impact"), "style visible"),
    check("Try Attrition Calibration section exists", report.includes("## Try Attrition Calibration"), "try attrition visible"),
    check("Try Attrition Guardrails section exists", report.includes("## Try Attrition Guardrails"), "try guardrails visible"),
    check("match volume projection visible", report.includes("projected 0-0 draw rate after full-match volume calibration"), "match volume visible"),
    check("calibrated possession volume visible", report.includes("calibrated offensive possessions per match"), "possession volume visible"),
    check("calibrated danger volume visible", report.includes("calibrated danger phases per match"), "danger volume visible"),
    check("full-match observed 0-0 visible", report.includes("observed 0-0 draw rate in full-match economy validation"), "full-match 0-0 visible"),
    check("full-match scoreline diversity visible", report.includes("full-match unique final scores"), "full-match scoreline diversity visible"),
    check(
      "match volume recommendation visible",
      report.includes("ONLY_REBALANCE_SCORING_AFTER_MATCH_VOLUME_CALIBRATION") || report.includes("projected 0-0 draw rate after full-match volume calibration"),
      "match-volume recommendation visible",
    ),
    check("source post-resolution route economy validation PASS", postValidation.includes("Status: PASS"), "post-resolution PASS"),
    check("source danger phase economy validation PASS", dangerValidation.includes("Status: PASS"), "danger economy PASS"),
    check("continuation payoff validation PASS", continuationValidation.includes("Status: PASS"), "continuation payoff PASS"),
    check("scoring values unchanged", !scoringValueLeakage && report.includes("scoring values unchanged"), "values unchanged"),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && !/PENALTY_SHOT.*active: YES/.test(report), "PENALTY inactive"),
    check("live score from active ScoringEvents only", report.includes("live score comes only from active ScoringEvents") && scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live guarded"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("no global route rebalance", report.includes("no global route success buff applied") && report.includes("no global shot nerf applied"), "monitoring only"),
    check("source reports remain consolidated for share", report.includes("source reports consolidated for share"), "consolidation note visible"),
    check("share pack <= 20 files", expectedSharePackFiles(input.reportDirectory).length <= 20, `${expectedSharePackFiles(input.reportDirectory).length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.route-economy-monitoring.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      shareFileCount: expectedSharePackFiles(input.reportDirectory).length,
      sterileDangerPhases: numberField(report, "sterile danger phases"),
      projectedSterileDangerRate: numberField(report, "projected sterile danger rate after continuation payoff calibration"),
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
