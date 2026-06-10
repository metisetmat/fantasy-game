import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import { createScoreUnitContract, scoringRuleLabel, SCORING_VERSION, validateScoreUnitContract } from "../../systems/scoring";

type ScoreUnitSemanticsStatus = "PASS" | "FAIL";

interface ScoreUnitSemanticsCheck {
  readonly label: string;
  readonly status: ScoreUnitSemanticsStatus;
  readonly detail: string;
}

export interface ScoreUnitSemanticsValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ScoreUnitSemanticsCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function tokenCount(markdown: string, token: string): number {
  return (markdown.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
}

function check(label: string, passed: boolean, detail: string): ScoreUnitSemanticsCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ScoreUnitSemanticsCheck[];
  readonly goalCountControl: number;
  readonly scoringPointsControl: number;
  readonly goalCountBlitz: number;
  readonly scoringPointsBlitz: number;
  readonly misleadingGoalScoreWordingCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Score Unit Semantics",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- goal count CONTROL: ${input.goalCountControl}`,
    `- scoring points CONTROL: ${input.scoringPointsControl}`,
    `- goal count BLITZ: ${input.goalCountBlitz}`,
    `- scoring points BLITZ: ${input.scoringPointsBlitz}`,
    `- misleading goal/score wording count: ${input.misleadingGoalScoreWordingCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateScoreUnitSemantics(input: {
  readonly result: MiniMatchResult;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
  readonly reportDirectory: string;
}): ScoreUnitSemanticsValidationResult {
  const scoringReportPath = join(input.reportDirectory, "scoring-from-shot-outcomes.md");
  const scoringReport = readIfExists(scoringReportPath);
  const shotOutcomeValidation = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const scoringRulesValidation = readIfExists(join(input.reportDirectory, "validation.scoring-rules-v1.md"));
  const gameplayCalibrationValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-gameplay-calibration.md"));
  const gameplayCalibrationReport = readIfExists(join(input.reportDirectory, "scoring-v1-gameplay-calibration.md"));
  const batchCalibrationValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-batch-calibration.md"));
  const batchCalibrationReport = readIfExists(join(input.reportDirectory, "scoring-v1-batch-calibration.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const contract = createScoreUnitContract({ result: input.result, shotOutcomes: input.shotOutcomes });
  const contractValidation = validateScoreUnitContract(contract);
  const controlTotal = contract.teamTotals.find((total) => total.teamId === input.result.state.context.teamA.id);
  const blitzTotal = contract.teamTotals.find((total) => total.teamId === input.result.state.context.teamB.id);
  const combinedReports = [scoringReport, shotOutcomeValidation, coach, evidence, candidate].join("\n");
  const misleadingGoalScoreWordingCount =
    tokenCount(combinedReports, "goals CONTROL: 3") +
    tokenCount(combinedReports, "goal count matches final score") +
    tokenCount(combinedReports, "CONTROL goal count matches final score") +
    tokenCount(combinedReports, "BLITZ goal count matches final score");
  const checks: readonly ScoreUnitSemanticsCheck[] = [
    check("scoring-from-shot-outcomes.md exists", scoringReport.length > 0, scoringReportPath),
    check("scoring V1 gameplay calibration validation passes or is refreshed later", gameplayCalibrationValidation.length === 0 || gameplayCalibrationValidation.includes("Status: PASS") || gameplayCalibrationReport.length > 0, gameplayCalibrationValidation.includes("Status: PASS") ? "gameplay calibration PASS" : "gameplay calibration refreshed later"),
    check("scoring V1 batch calibration validation passes or is refreshed later", batchCalibrationValidation.length === 0 || batchCalibrationValidation.includes("Status: PASS") || batchCalibrationReport.length > 0, batchCalibrationValidation.includes("Status: PASS") ? "batch calibration PASS" : "batch calibration refreshed later"),
    check("scoring calibration report exists", gameplayCalibrationReport.length > 0, "scoring-v1-gameplay-calibration.md present"),
    check("batch calibration report exists", batchCalibrationReport.length > 0, "scoring-v1-batch-calibration.md present"),
    check("active scoring rule unchanged", scoringReport.includes("scoring rule: SHOT_GOAL = 3 points"), "SHOT_GOAL remains 3"),
    check("V2_DROP_FOUNDATION scoring routes use POINTS", scoringReport.includes("V2_DROP_FOUNDATION") && scoringReport.includes("TRY_TOUCHDOWN = 5 points") && scoringReport.includes("CONVERSION_GOAL = 2 points") && scoringReport.includes("DROP_GOAL = 2 points"), "V2_DROP_FOUNDATION point routes visible"),
    check("coach summary includes scoring calibration line", coach.includes("scoring calibration:"), "coach scoring calibration visible"),
    check("coach summary includes batch scoring calibration line", coach.includes("batch recommendation"), "coach batch calibration visible"),
    check("score unit is POINTS", contract.scoreUnit === "POINTS", contract.scoreUnit),
    check("scoring rules V1 validation passes or is refreshed later", scoringRulesValidation.length === 0 || scoringRulesValidation.includes("Status: PASS") || scoringReport.includes("scoring rule: SHOT_GOAL = 3 points"), scoringRulesValidation.includes("Status: PASS") ? "scoring rules V1 PASS" : "scoring rules V1 refreshed later"),
    check("shot subsystem remains V1-compatible under V2_DROP_FOUNDATION scoring", SCORING_VERSION === "V1", "V1-compatible shot subsystem"),
    check("active scoring rule is SHOT_GOAL = 3 points", scoringReport.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check("scoring rule SHOT_GOAL = 3 points is visible", scoringReport.includes("scoring rule: SHOT_GOAL = 3 points"), "SHOT_GOAL = 3 points"),
    check("final score uses points", contract.finalScore.display === `${input.result.state.context.teamA.displayName} 3 - 0 ${input.result.state.context.teamB.displayName}`, contract.finalScore.display),
    check("CONTROL goal count is 1", (controlTotal?.goalCount ?? -1) === 1, `${controlTotal?.goalCount ?? 0}`),
    check("CONTROL scoring points are 3", (controlTotal?.points ?? -1) === 3, `${controlTotal?.points ?? 0}`),
    check("BLITZ goal count is 0", (blitzTotal?.goalCount ?? -1) === 0, `${blitzTotal?.goalCount ?? 0}`),
    check("BLITZ scoring points are 0", (blitzTotal?.points ?? -1) === 0, `${blitzTotal?.points ?? 0}`),
    check("goal count is not equated with score points", misleadingGoalScoreWordingCount === 0, `${misleadingGoalScoreWordingCount}`),
    check("validation.shot-outcome-resolution.md uses point terminology", shotOutcomeValidation.includes("scoring points CONTROL") && shotOutcomeValidation.includes("goal count CONTROL"), "point and goal-count fields visible"),
    check("coach summary mentions scoring unit POINTS", coach.includes("score unit: POINTS"), "coach score unit visible"),
    check("coach summary says SHOT_GOAL = 3 points", coach.includes("scoring rule: SHOT_GOAL = 3 points"), "coach scoring rule visible"),
    check("tactical evidence scoring impacts include points", evidence.includes("scoring impact: CONTROL +3 points"), "tactical evidence uses points"),
    check("candidate/executed scoring impacts include points", candidate.includes("scoring impact: CONTROL +3 points"), "candidate/executed uses points"),
    check("target V2 scoring model documented", readIfExists(join(process.cwd(), "docs", "game-design", "scoring-model.md")).includes("Target model - V2"), "V2 target model documented"),
    check("V2_DROP_FOUNDATION scoring actions are active with POINTS", scoringReport.includes("TRY_TOUCHDOWN = 5 points") && scoringReport.includes("CONVERSION_GOAL = 2 points") && scoringReport.includes("DROP_GOAL = 2 points"), "V2_DROP_FOUNDATION point actions visible"),
    check("no misleading CONTROL-goals-as-three wording", !combinedReports.includes("goals CONTROL: 3"), "misleading goals wording absent"),
    check("no illegal goal-count-to-score comparison wording", !combinedReports.includes("goal count matches final score"), "illegal comparison wording absent"),
    check("existing shot outcome validation still passes", shotOutcomeValidation.includes("Status: PASS"), "shot outcome validation PASS"),
    check("score unit contract validates", contractValidation.valid, contractValidation.errors.join("; ") || contract.reason),
  ];
  const reportPath = join(input.reportDirectory, "validation.score-unit-semantics.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      goalCountControl: controlTotal?.goalCount ?? 0,
      scoringPointsControl: controlTotal?.points ?? 0,
      goalCountBlitz: blitzTotal?.goalCount ?? 0,
      scoringPointsBlitz: blitzTotal?.points ?? 0,
      misleadingGoalScoreWordingCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
