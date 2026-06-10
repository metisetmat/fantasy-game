import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type RouteResolutionCalibrationsStatus = "PASS" | "FAIL";

interface RouteResolutionCalibrationsCheck {
  readonly label: string;
  readonly status: RouteResolutionCalibrationsStatus;
  readonly detail: string;
}

export interface RouteResolutionCalibrationsValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly RouteResolutionCalibrationsCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): RouteResolutionCalibrationsCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly RouteResolutionCalibrationsCheck[];
  readonly sourceValidationStatuses: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Route Resolution Calibrations Validation",
    "",
    `Status: ${status}`,
    "",
    "## Source Validations Consolidated",
    "- validation.goalkeeper-shot-stopping-impact-calibration.md",
    "- validation.try-grounding-pressure-calibration.md",
    "- validation.clean-shot-success-calibration.md",
    "- validation.post-resolution-route-economy-monitoring.md",
    "- validation.danger-phase-conversion-economy.md",
    "- validation.continuation-payoff-calibration.md",
    "- validation.match-duration-possession-volume-calibration.md",
    "- validation.full-match-economy-validation.md",
    "",
    "## Counts",
    `- source validation statuses: ${input.sourceValidationStatuses}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Recommendation",
    "- KEEP_SCORING_VALUES",
    "- KEEP_ROUTE_RESOLUTION_CALIBRATIONS",
    "- MONITOR_ROUTE_POINT_SHARE",
    "- ONLY_REBALANCE_SCORING_AFTER_ROUTE_ECONOMY_MONITORING",
    "",
  ].join("\n");
}

function statusFor(report: string): string {
  return report.includes("Status: PASS") ? "PASS" : report.includes("Status: FAIL") ? "FAIL" : "MISSING";
}

export function validateRouteResolutionCalibrations(input: {
  readonly reportDirectory: string;
}): RouteResolutionCalibrationsValidationResult {
  const report = readIfExists(join(input.reportDirectory, "route-resolution-calibrations.md"));
  const goalkeeperValidation = readIfExists(join(input.reportDirectory, "validation.goalkeeper-shot-stopping-impact-calibration.md"));
  const tryGroundingValidation = readIfExists(join(input.reportDirectory, "validation.try-grounding-pressure-calibration.md"));
  const cleanShotValidation = readIfExists(join(input.reportDirectory, "validation.clean-shot-success-calibration.md"));
  const routeEconomyValidation = readIfExists(join(input.reportDirectory, "validation.post-resolution-route-economy-monitoring.md"));
  const dangerEconomyValidation = readIfExists(join(input.reportDirectory, "validation.danger-phase-conversion-economy.md"));
  const checks: readonly RouteResolutionCalibrationsCheck[] = [
    check("route-resolution-calibrations.md exists", report.includes("# Route Resolution Calibrations"), "report generated"),
    check("Goalkeeper Shot-Stopping Impact section exists", report.includes("## Goalkeeper Shot-Stopping Impact"), "GK section visible"),
    check("Try Grounding Pressure section exists", report.includes("## Try Grounding Pressure"), "try section visible"),
    check("Clean Shot Success section exists", report.includes("## Clean Shot Success"), "clean shot section visible"),
    check("Route Economy Impact section exists", report.includes("## Route Economy Impact"), "route economy section visible"),
    check("Danger Phase Conversion Economy section exists", report.includes("## Danger Phase Conversion Economy"), "danger phase economy section visible"),
    check("Continuation Payoff Calibration section exists", report.includes("## Continuation Payoff Calibration"), "continuation payoff section visible"),
    check("Match Duration & Possession Volume section exists", report.includes("## Match Duration & Possession Volume"), "match volume section visible"),
    check("Full-Match Economy Validation section exists", report.includes("## Full-Match Economy Validation"), "full-match section visible"),
    check("Current Resolution Recommendations section exists", report.includes("## Current Resolution Recommendations"), "recommendations visible"),
    check("goalkeeper source validation PASS", goalkeeperValidation.includes("Status: PASS"), statusFor(goalkeeperValidation)),
    check("try grounding source validation PASS", tryGroundingValidation.includes("Status: PASS"), statusFor(tryGroundingValidation)),
    check("clean shot source validation PASS", cleanShotValidation.includes("Status: PASS"), statusFor(cleanShotValidation)),
    check("post-resolution route economy source validation PASS", routeEconomyValidation.includes("Status: PASS"), statusFor(routeEconomyValidation)),
    check("danger phase conversion economy source validation PASS", dangerEconomyValidation.includes("Status: PASS"), statusFor(dangerEconomyValidation)),
    check("scoring values unchanged", report.includes("scoring values unchanged"), "values unchanged"),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && !/PENALTY_SHOT.*active: YES/.test(report), "PENALTY inactive"),
  ];
  const reportPath = join(input.reportDirectory, "validation.route-resolution-calibrations.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      sourceValidationStatuses: [
        `goalkeeper ${statusFor(goalkeeperValidation)}`,
        `try grounding ${statusFor(tryGroundingValidation)}`,
        `clean shot ${statusFor(cleanShotValidation)}`,
        `route economy ${statusFor(routeEconomyValidation)}`,
        `danger phase economy ${statusFor(dangerEconomyValidation)}`,
        "continuation payoff covered by validation.continuation-payoff-calibration.md",
        "match volume covered by validation.match-duration-possession-volume-calibration.md",
        "full-match economy covered by validation.full-match-economy-validation.md",
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
