import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expectedSharePackFiles } from "../sharePack";

type DangerPhaseConversionEconomyStatus = "PASS" | "FAIL";

interface DangerPhaseConversionEconomyCheck {
  readonly label: string;
  readonly status: DangerPhaseConversionEconomyStatus;
  readonly detail: string;
}

export interface DangerPhaseConversionEconomyValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly DangerPhaseConversionEconomyCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): DangerPhaseConversionEconomyCheck {
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
  readonly checks: readonly DangerPhaseConversionEconomyCheck[];
  readonly sterileDangerPhases: number;
  readonly sterileDangerRate: number;
  readonly dangerToScoreConversionRate: number;
  readonly nilNilDrawRate: number;
  readonly expectedShareFileCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Danger Phase Conversion Economy Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- sterile danger phases: ${input.sterileDangerPhases}`,
    `- sterile danger rate: ${input.sterileDangerRate}%`,
    `- danger-to-score conversion rate: ${input.dangerToScoreConversionRate}%`,
    `- 0-0 draw rate: ${input.nilNilDrawRate}%`,
    `- expected share file count: ${input.expectedShareFileCount}`,
    `- planned share file count after export: ${input.expectedShareFileCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
    "## Recommendation",
    "- KEEP_SCORING_VALUES",
    "- REVIEW_STERILE_DANGER_PHASES",
    "- REVIEW_0_0_DRAW_RATE",
    "- REVIEW_STYLE_ROUTE_DIVERSITY",
    "- IMPROVE_CONTINUATION_PAYOFF",
    "- REVIEW_DANGER_TO_SCORE_CONVERSION",
    "- ONLY_REBALANCE_SCORING_AFTER_DANGER_PHASE_ECONOMY",
    "",
  ].join("\n");
}

export function validateDangerPhaseConversionEconomy(input: {
  readonly reportDirectory: string;
}): DangerPhaseConversionEconomyValidationResult {
  const report = readIfExists(join(input.reportDirectory, "danger-phase-conversion-economy.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const cleanShotValidation = readIfExists(join(input.reportDirectory, "validation.clean-shot-success-calibration.md"));
  const tryGroundingValidation = readIfExists(join(input.reportDirectory, "validation.try-grounding-pressure-calibration.md"));
  const goalkeeperValidation = readIfExists(join(input.reportDirectory, "validation.goalkeeper-shot-stopping-impact-calibration.md"));
  const routeDecisionValidation = readIfExists(join(input.reportDirectory, "validation.route-decision-and-balance.md"));
  const routeResolutionValidation = readIfExists(join(input.reportDirectory, "validation.route-resolution-calibrations.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const expectedShareFileCount = expectedSharePackFiles(input.reportDirectory).length;
  const scoringValueLeakage =
    /SHOT_GOAL = (?!3 points)\d+ points/.test(report) ||
    /TRY_TOUCHDOWN = (?!5 points)\d+ points/.test(report) ||
    /CONVERSION_GOAL = (?!2 points)\d+ points/.test(report) ||
    /DROP_GOAL = (?!2 points)\d+ points/.test(report);
  const noGlobalRebalance =
    report.includes("no global shot nerf applied") &&
    report.includes("no global try buff applied") &&
    report.includes("no global drop buff applied") &&
    report.includes("no global candidate ranking change applied");
  const checks: readonly DangerPhaseConversionEconomyCheck[] = [
    check("danger-phase-conversion-economy.md exists", report.includes("# Danger Phase Conversion Economy"), "report generated"),
    check("Sterile Danger Phase Decomposition section exists", report.includes("## Sterile Danger Phase Decomposition"), "sterile decomposition visible"),
    check("Style-Specific Danger Conversion section exists", report.includes("## Style-Specific Danger Conversion"), "style conversion visible"),
    check("Continuation Route Payoff section exists", report.includes("## Continuation Route Payoff"), "continuation payoff visible"),
    check("Route Quality Before Resolution section exists", report.includes("## Route Quality Before Resolution"), "route quality visible"),
    check("Anti-0-0 Recommendations section exists", report.includes("## Anti-0-0 Recommendations"), "anti-0-0 section visible"),
    check("scoring values unchanged", !scoringValueLeakage && report.includes("scoring values unchanged"), "values unchanged"),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && !/PENALTY_SHOT.*active: YES/.test(report), "PENALTY inactive"),
    check("live score from active ScoringEvents only", report.includes("live score comes only from active ScoringEvents") && scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live scoring guarded"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("no global route nerf or buff applied", noGlobalRebalance, "monitoring only"),
    check("clean shot calibration remains PASS", cleanShotValidation.includes("Status: PASS"), "clean shot PASS"),
    check("try grounding calibration remains PASS", tryGroundingValidation.includes("Status: PASS"), "try grounding PASS"),
    check("goalkeeper impact validation remains PASS", goalkeeperValidation.includes("Status: PASS"), "GK PASS"),
    check("route decision and balance validation remains PASS", routeDecisionValidation.includes("Status: PASS"), "route decision PASS"),
    check("route resolution calibrations validation remains PASS", routeResolutionValidation.includes("Status: PASS"), "route resolution PASS"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion PASS"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("share pack expected file count <= 20", expectedShareFileCount <= 20, `${expectedShareFileCount}`),
    check("recommendations are visible", report.includes("REVIEW_STERILE_DANGER_PHASES") && report.includes("ONLY_REBALANCE_SCORING_AFTER_DANGER_PHASE_ECONOMY"), "recommendations visible"),
  ];
  const reportPath = join(input.reportDirectory, "validation.danger-phase-conversion-economy.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      sterileDangerPhases: numberField(report, "sterile danger phases"),
      sterileDangerRate: numberField(report, "sterile danger rate"),
      dangerToScoreConversionRate: numberField(report, "danger-to-score conversion rate"),
      nilNilDrawRate: numberField(report, "0-0 draw rate"),
      expectedShareFileCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
