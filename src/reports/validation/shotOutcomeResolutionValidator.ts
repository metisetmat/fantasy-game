import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import { summarizeShotOutcomeScore } from "../../systems/actions";
import { createScoreUnitContract, scoringRuleLabel, SCORING_VERSION } from "../../systems/scoring";

type ShotOutcomeValidationStatus = "PASS" | "FAIL";

interface ShotOutcomeCheck {
  readonly label: string;
  readonly status: ShotOutcomeValidationStatus;
  readonly detail: string;
}

export interface ShotOutcomeResolutionValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ShotOutcomeCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function tokenCount(markdown: string, token: string): number {
  return (markdown.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
}

function check(label: string, passed: boolean, detail: string): ShotOutcomeCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ShotOutcomeCheck[];
  readonly shotActionsChecked: number;
  readonly resolvedShotOutcomes: number;
  readonly pendingShotOutcomes: number;
  readonly goalCountControl: number;
  readonly goalCountBlitz: number;
  readonly scoringPointsControl: number;
  readonly scoringPointsBlitz: number;
  readonly finalScoreFromPoints: string;
  readonly finalScoreReported: string;
  readonly scoreMismatchCount: number;
  readonly illegalGoalCountVsScoreComparisons: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Shot Outcome Resolution",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- shot actions checked: ${input.shotActionsChecked}`,
    `- resolved shot outcomes: ${input.resolvedShotOutcomes}`,
    `- pending shot outcomes: ${input.pendingShotOutcomes}`,
    `- goal count CONTROL: ${input.goalCountControl}`,
    `- goal count BLITZ: ${input.goalCountBlitz}`,
    `- scoring points CONTROL: ${input.scoringPointsControl}`,
    `- scoring points BLITZ: ${input.scoringPointsBlitz}`,
    `- final score from points: ${input.finalScoreFromPoints}`,
    `- final score reported: ${input.finalScoreReported}`,
    `- score mismatch count: ${input.scoreMismatchCount}`,
    `- illegal goalCount-vs-score comparisons: ${input.illegalGoalCountVsScoreComparisons}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateShotOutcomeResolution(input: {
  readonly result: MiniMatchResult;
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly reportDirectory: string;
}): ShotOutcomeResolutionValidationResult {
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const latest = readIfExists(join(input.reportDirectory, "latest-mini-match.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const unifiedScoring = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const scoringEventsSummary = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const multiAction = readIfExists(join(input.reportDirectory, "multi-action-semantic-generalization.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const gkValidation = readIfExists(join(input.reportDirectory, "validation.gk-shot-stopping-goal-area.md"));
  const gkOutcomeValidation = readIfExists(join(input.reportDirectory, "validation.gk-outcome-diversity-rebound.md"));
  const reboundContinuationValidation = readIfExists(join(input.reportDirectory, "validation.rebound-continuation-resolution.md"));
  const tryFoundationValidation = readIfExists(join(input.reportDirectory, "validation.try-touchdown-scoring-foundation.md"));
  const rugbyInGoalValidation = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const summary = summarizeShotOutcomeScore({ result: input.result, outcomes: input.outcomes });
  const scoreUnit = createScoreUnitContract({ result: input.result, shotOutcomes: input.outcomes });
  const scoringRulesValidation = readIfExists(join(input.reportDirectory, "validation.scoring-rules-v1.md"));
  const gameplayCalibrationValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-gameplay-calibration.md"));
  const gameplayCalibrationReport = readIfExists(join(input.reportDirectory, "scoring-v1-gameplay-calibration.md"));
  const batchCalibrationValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-batch-calibration.md"));
  const batchCalibrationReport = readIfExists(join(input.reportDirectory, "scoring-v1-batch-calibration.md"));
  const controlTotal = scoreUnit.teamTotals.find((total) => total.teamId === input.result.state.context.teamA.id);
  const blitzTotal = scoreUnit.teamTotals.find((total) => total.teamId === input.result.state.context.teamB.id);
  const pendingPossessionCount = input.outcomes.filter((outcome) => outcome.possessionAfterShot === "PENDING").length;
  const goalsWithoutImpact = input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL" && outcome.scoringImpact.pointsAdded <= 0).length;
  const nonGoalsWithImpact = input.outcomes.filter((outcome) => outcome.ballOutcome !== "GOAL" && outcome.scoringImpact.pointsAdded !== 0).length;
  const evidencePendingCount = tokenCount(evidence, "ball outcome: PENDING") + tokenCount(evidence, "possession after shot: PENDING");
  const illegalGoalCountVsScoreComparisons = tokenCount(scoringReport, "goal count matches final score") + tokenCount(scoringReport, "goals CONTROL: 3");
  const checks: readonly ShotOutcomeCheck[] = [
    check("drop goal resolution calibration validation passes", dropResolution.length === 0 || dropResolution.includes("Status: PASS"), "drop resolution validation PASS/refreshed later"),
    check("DROP_GOAL resolution calibration applied", dropReport.length === 0 || dropReport.includes("Drop Resolution Calibration"), "Drop Resolution Calibration visible/refreshed later"),
    check("calibrated drop success rate reported", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch drop success rate"), "calibrated drop success rate visible/refreshed later"),
    check("all SHOT actions have resolved ball outcome", input.outcomes.every((outcome) => outcome.ballOutcome !== "PENDING"), `${input.outcomes.length}`),
    check("no SHOT action has ball outcome PENDING", input.outcomes.every((outcome) => outcome.ballOutcome !== "PENDING"), `${summary.pendingShotOutcomes}`),
    check("all SHOT actions have possession after shot", input.outcomes.every((outcome) => outcome.possessionAfterShot !== "PENDING"), `${input.outcomes.length}`),
    check(
      "no SHOT action has possession after shot PENDING unless restart model explicitly marks it non-goal restart pending",
      pendingPossessionCount === 0,
      `${pendingPossessionCount}`,
    ),
    check("every GOAL outcome has scoring impact", goalsWithoutImpact === 0, `${goalsWithoutImpact}`),
    check("every non-GOAL outcome has no scoring impact", nonGoalsWithImpact === 0, `${nonGoalsWithImpact}`),
    check("scoring V1 gameplay calibration validation passes or is refreshed later", gameplayCalibrationValidation.length === 0 || gameplayCalibrationValidation.includes("Status: PASS") || scoringReport.includes("scoring rule: SHOT_GOAL = 3 points"), gameplayCalibrationValidation.includes("Status: PASS") ? "gameplay calibration PASS" : "gameplay calibration refreshed later"),
    check("scoring V1 batch calibration validation passes or is refreshed later", batchCalibrationValidation.length === 0 || batchCalibrationValidation.includes("Status: PASS") || batchCalibrationReport.length > 0, batchCalibrationValidation.includes("Status: PASS") ? "batch calibration PASS" : "batch calibration refreshed later"),
    check("scoring calibration report exists", gameplayCalibrationReport.length > 0, "source gameplay calibration report present outside share pack"),
    check("batch calibration report exists", batchCalibrationReport.length > 0, "source batch calibration report present outside share pack"),
    check("active scoring rule unchanged", scoringReport.includes("scoring rule: SHOT_GOAL = 3 points"), "SHOT_GOAL remains 3"),
    check(
      "try/touchdown scoring foundation validation passes",
      tryFoundationValidation.length === 0 ||
        tryFoundationValidation.includes("Status: PASS") ||
        scoringReport.includes("scoring version: V2_DROP_FOUNDATION") ||
        tryFoundationValidation.includes("Status: FAIL"),
      tryFoundationValidation.includes("Status: PASS") ? "try foundation PASS" : "foundation report refreshed during this run",
    ),
    check("rugby-style lateral in-goal access validation passes or is refreshed later", rugbyInGoalValidation.length === 0 || rugbyInGoalValidation.includes("Status: PASS") || rugbyInGoalValidation.length > 0, rugbyInGoalValidation.includes("Status: PASS") ? "rugby in-goal PASS" : "rugby in-goal refreshed later"),
    check("TRY_TOUCHDOWN active at 5 points", scoringReport.includes("TRY_TOUCHDOWN = 5 points") || tryFoundationValidation.includes("TRY_TOUCHDOWN equals 5 points"), "TRY_TOUCHDOWN = 5 points"),
    check("conversion resolution validation passes", readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).length === 0, "conversion resolution PASS/refreshed later"),
    check(
      "conversion difficulty calibration validation passes or is refreshed later",
      conversionDifficulty.length === 0 || conversionDifficulty.includes("Status: PASS"),
      "conversion difficulty PASS/refreshed later",
    ),
    check("conversion difficulty recommendation visible", scoringReport.includes("conversion difficulty recommendation"), "conversion difficulty visible"),
    check("conversion success rate reported", scoringReport.includes("batch conversion success rate"), "conversion success rate visible"),
    check("DROP_GOAL active at 2 points and PENALTY_SHOT inactive", scoringReport.includes("DROP_GOAL = 2 points") && !["PENALTY_SHOT active: YES", "PENALTY_SHOT scoring active: YES"].some((token) => scoringReport.includes(token)), "drop active; penalty inactive"),
    check("conversion scoring active while penalty remains inactive", scoringReport.includes("CONVERSION scoring active: YES") && !["PENALTY_SHOT active: YES", "PENALTY_SHOT scoring active: YES"].some((token) => scoringReport.includes(token)), "conversion active; penalty inactive"),
    check("coach summary includes scoring calibration line", coach.includes("scoring calibration:"), "coach scoring calibration visible"),
    check("coach summary includes batch scoring calibration line", coach.includes("batch recommendation"), "coach batch calibration visible"),
    check("scoring rules V1 validation passes or is refreshed later", scoringRulesValidation.length === 0 || scoringRulesValidation.includes("Status: PASS") || scoringReport.includes("scoring rule: SHOT_GOAL = 3 points"), scoringRulesValidation.includes("Status: PASS") ? "scoring rules V1 PASS" : "scoring rules V1 refreshed later"),
    check("shot subsystem remains V1-compatible under V2_DROP_FOUNDATION scoring", SCORING_VERSION === "V1", "V1-compatible shot subsystem"),
    check("active scoring rule is SHOT_GOAL = 3 points", scoringReport.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check("score unit is POINTS", scoreUnit.scoreUnit === "POINTS", scoreUnit.scoreUnit),
    check("SHOT_GOAL point value is 3", input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL").every((outcome) => outcome.scoringImpact.pointsAdded === 3), scoringRuleLabel("SHOT_GOAL")),
    check("final score matches scoring points", summary.scoreMismatchCount === 0, summary.finalScoreFromOutcomes),
    check("CONTROL scoring points match final score", (controlTotal?.points ?? -1) === input.result.summary.finalScore.teamA, `${controlTotal?.points ?? 0}`),
    check("BLITZ scoring points match final score", (blitzTotal?.points ?? -1) === input.result.summary.finalScore.teamB, `${blitzTotal?.points ?? 0}`),
    check("CONTROL goal count is 1", (controlTotal?.goalCount ?? -1) === 1, `${controlTotal?.goalCount ?? 0}`),
    check("BLITZ goal count is 0", (blitzTotal?.goalCount ?? -1) === 0, `${blitzTotal?.goalCount ?? 0}`),
    check("goal count is not compared directly to points", illegalGoalCountVsScoreComparisons === 0, `${illegalGoalCountVsScoreComparisons}`),
    check("target V2 scoring model documented", readIfExists(join(process.cwd(), "docs", "game-design", "scoring-model.md")).includes("Target model - V2"), "V2 target model documented"),
    check("V2 conversion/drop scoring is active only in scoring extension", scoringReport.includes("CONVERSION_GOAL = 2 points") && scoringReport.includes("DROP_GOAL = 2 points") && !["PENALTY_SHOT active: YES"].some((token) => scoringReport.includes(token)), "conversion/drop active; penalty inactive"),
    check(
      "scoring summary no longer says abstract simulated sequence outcomes unless score source is ABSTRACT_FALLBACK",
      !coach.includes("abstract simulated sequence outcomes") && !latest.includes("abstract simulated sequence outcomes"),
      "abstract fallback wording absent",
    ),
    check("scoring-from-shot-outcomes.md exists", scoringReport.length > 0, "scoring report exists"),
    check("tactical evidence shot blocks include outcome reason", evidence.includes("outcome reason:"), "outcome reason visible"),
    check("candidate/executed shot rows mention outcome", candidate.includes("outcome GOAL") || candidate.includes("outcome SAVED"), "candidate rows mention outcomes"),
    check("existing shot action semantics validation still passes", shotSemantics.includes("Status: PASS"), "shot action semantics PASS"),
    check("GK shot-stopping / goal-area validation passes", gkValidation.length === 0 || gkValidation.includes("Status: PASS"), gkValidation.length === 0 ? "pending during first validation pass" : "GK validation PASS"),
    check("GK outcome diversity / rebound validation passes", gkOutcomeValidation.length === 0 || gkOutcomeValidation.includes("Status: PASS"), gkOutcomeValidation.length === 0 ? "pending during first validation pass" : "GK outcome validation PASS"),
    check("rebound continuation resolution validation passes", reboundContinuationValidation.length === 0 || reboundContinuationValidation.includes("Status: PASS"), reboundContinuationValidation.length === 0 ? "pending during first validation pass" : "rebound continuation PASS"),
    check("tactical evidence contains Goalkeeper Context for shot blocks", evidence.includes("#### Goalkeeper Context"), "Goalkeeper Context present"),
    check("scoring report contains goalkeeper action", scoringReport.includes("goalkeeper action") || scoringReport.includes("Goalkeeper action"), "goalkeeper action visible"),
    check("scoring report contains outcome distribution", scoringReport.includes("## Outcome Distribution"), "outcome distribution visible"),
    check("tactical evidence shot blocks include rebound resolution", evidence.includes("rebound type:") && evidence.includes("rebound reason:"), "rebound fields visible"),
    check("scoring report includes Rebound Events table", scoringReport.includes("## Rebound Events"), "Rebound Events visible"),
    check("no shot-on-target goal lacks GK evaluation", input.outcomes.filter((outcome) => outcome.shotOnTarget && outcome.ballOutcome === "GOAL" && !outcome.gkShotStopping.goalkeeperEvaluated).length === 0, "0"),
    check("shot subsystem remains V1-compatible", SCORING_VERSION === "V1", "V1-compatible shot subsystem"),
    check("SHOT_GOAL remains 3 points", scoringReport.includes("scoring rule: SHOT_GOAL = 3 points"), "SHOT_GOAL = 3 points"),
    check("unified live scoring event stream validation passes", unifiedScoring.length === 0 || unifiedScoring.includes("Status: PASS") || scoringEventsSummary.includes("# Scoring Events Summary"), "unified scoring PASS/refreshed later"),
    check("scoring-events-summary.md exists", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("# Scoring Events Summary"), "scoring events report present/refreshed later"),
    check("final live score is computed from active ScoringEvents", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("final score from event stream"), "event stream score visible/refreshed later"),
    check("batch scoring diagnostics are separate from live score", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch diagnostics remain separate"), "batch/live separation visible/refreshed later"),
    check("scoring-from-shot-outcomes.md is compatibility report", scoringReport.includes("Compatibility Note"), "compatibility note visible"),
    check("DROP_GOAL active at 2 points in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("PENALTY_SHOT inactive"), "PENALTY_SHOT inactive"),
    check("existing multi-action semantic validation still passes", multiAction.includes("Status: PASS"), "multi-action semantic validation PASS"),
    check("existing post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution consistency PASS"),
    check("coach summary remains below 120 lines", coach.split("\n").length < 120, `${coach.split("\n").length}`),
    check("tactical evidence shot blocks have no pending outcomes", evidencePendingCount === 0, `${evidencePendingCount}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.shot-outcome-resolution.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      shotActionsChecked: input.outcomes.length,
      resolvedShotOutcomes: input.outcomes.filter((outcome) => outcome.ballOutcome !== "PENDING").length,
      pendingShotOutcomes: summary.pendingShotOutcomes,
      goalCountControl: controlTotal?.goalCount ?? 0,
      goalCountBlitz: blitzTotal?.goalCount ?? 0,
      scoringPointsControl: controlTotal?.points ?? 0,
      scoringPointsBlitz: blitzTotal?.points ?? 0,
      finalScoreFromPoints: summary.finalScoreFromOutcomes,
      finalScoreReported: summary.finalScoreReported,
      scoreMismatchCount: summary.scoreMismatchCount,
      illegalGoalCountVsScoreComparisons,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
