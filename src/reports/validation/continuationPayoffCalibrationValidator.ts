import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles } from "../sharePack";

type ContinuationPayoffStatus = "PASS" | "FAIL";

interface ContinuationPayoffCheck {
  readonly label: string;
  readonly status: ContinuationPayoffStatus;
  readonly detail: string;
}

export interface ContinuationPayoffCalibrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ContinuationPayoffCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ContinuationPayoffCheck {
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
  readonly checks: readonly ContinuationPayoffCheck[];
  readonly currentSterileDangerRate: number;
  readonly projectedSterileDangerRate: number;
  readonly projectedNilNilDrawRate: number;
  readonly supportPayoffRate: number;
  readonly forwardPayoffRate: number;
  readonly shareFileCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Continuation Payoff Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- current sterile danger rate: ${input.currentSterileDangerRate}%`,
    `- projected sterile danger rate: ${input.projectedSterileDangerRate}%`,
    `- projected 0-0 draw rate: ${input.projectedNilNilDrawRate}%`,
    `- SUPPORT_CLUSTER_RECYCLE payoff rate: ${input.supportPayoffRate}%`,
    `- FORWARD_PROGRESS payoff rate: ${input.forwardPayoffRate}%`,
    `- planned share file count: ${input.shareFileCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Recommendation",
    "- KEEP_SCORING_VALUES",
    "- IMPROVE_CONTINUATION_PAYOFF",
    "- REVIEW_OVER_SAFE_CONTINUATION",
    "- REVIEW_STYLE_ROUTE_DIVERSITY",
    "- REVIEW_0_0_DRAW_RATE",
    "- MONITOR_DANGER_TO_SCORE_CONVERSION",
    "- ONLY_REBALANCE_SCORING_AFTER_CONTINUATION_PAYOFF",
    "",
  ].join("\n");
}

export function validateContinuationPayoffCalibration(input: {
  readonly reportDirectory: string;
}): ContinuationPayoffCalibrationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "continuation-payoff-calibration.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const routeDecision = readIfExists(join(input.reportDirectory, "validation.route-decision-and-balance.md"));
  const routeResolution = readIfExists(join(input.reportDirectory, "validation.route-resolution-calibrations.md"));
  const dangerEconomy = readIfExists(join(input.reportDirectory, "validation.danger-phase-conversion-economy.md"));
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
  const noGlobalBuff =
    report.includes("no global route success buff applied") &&
    report.includes("no global shot nerf applied") &&
    report.includes("no global try buff applied") &&
    report.includes("no global drop buff applied");
  const supportPayoffRate = numberField(report, "SUPPORT_CLUSTER_RECYCLE payoff rate");
  const forwardPayoffRate = numberField(report, "FORWARD_PROGRESS payoff rate");
  const checks: readonly ContinuationPayoffCheck[] = [
    check("continuation-payoff-calibration.md exists", report.includes("# Continuation Payoff Calibration"), "report generated"),
    check("Continuation Chain Tracking section exists", report.includes("## Continuation Chain Tracking"), "chain tracking visible"),
    check("Continuation Route Taxonomy section exists", report.includes("## Continuation Route Taxonomy"), "taxonomy visible"),
    check("Payoff Calibration section exists", report.includes("## Payoff Calibration"), "payoff rules visible"),
    check("Style-Specific Calibration section exists", report.includes("## Style-Specific Calibration"), "style calibration visible"),
    check("Anti-Sterility Checks section exists", report.includes("## Anti-Sterility Checks"), "anti-sterility visible"),
    check("scoring values unchanged", !scoringValueLeakage && report.includes("scoring values unchanged"), "values unchanged"),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && !/PENALTY_SHOT.*active: YES/.test(report), "PENALTY inactive"),
    check("live score from active ScoringEvents only", report.includes("live score comes only from active ScoringEvents") && scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live guarded"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("no global route success buff", noGlobalBuff, "calibration changes future opportunity quality only"),
    check("candidate ranking remains explainable", report.includes("candidate ranking remains explainable") && routeDecision.includes("Status: PASS"), "ranking explainable"),
    check("tie-breaking remains explainable", report.includes("tie-breaking remains explainable") && routeDecision.includes("Tie-Breaking Validation"), "tie-breaking explainable"),
    check("route resolution calibrations remain PASS", routeResolution.includes("Status: PASS"), "route resolution PASS"),
    check("danger phase economy validation remains PASS", dangerEconomy.includes("Status: PASS"), "danger economy PASS"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("SUPPORT_CLUSTER_RECYCLE payoff > 0", supportPayoffRate > 0, `${supportPayoffRate}%`),
    check("FORWARD_PROGRESS payoff > 0", forwardPayoffRate > 0, `${forwardPayoffRate}%`),
    check("share pack <= 20 files", expectedSharePackFiles(input.reportDirectory).length <= 20, `${expectedSharePackFiles(input.reportDirectory).length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.continuation-payoff-calibration.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      currentSterileDangerRate: numberField(report, "current sterile danger rate"),
      projectedSterileDangerRate: numberField(report, "projected sterile danger rate"),
      projectedNilNilDrawRate: numberField(report, "projected 0-0 draw rate"),
      supportPayoffRate,
      forwardPayoffRate,
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
