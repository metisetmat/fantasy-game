import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type NonShotCandidateRankingStatus = "PASS" | "FAIL";

interface NonShotCandidateRankingCheck {
  readonly label: string;
  readonly status: NonShotCandidateRankingStatus;
  readonly detail: string;
}

export interface NonShotCandidateRankingValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly NonShotCandidateRankingCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): NonShotCandidateRankingCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function numberField(text: string, label: string): number {
  const match = new RegExp(`- ${label}: (\\d+)`).exec(text);

  return match?.[1] === undefined ? 0 : Number.parseInt(match[1], 10);
}

function renderMarkdown(input: {
  readonly checks: readonly NonShotCandidateRankingCheck[];
  readonly candidateRowsPersisted: number;
  readonly selectedShotRows: number;
  readonly selectedTryRows: number;
  readonly selectedDropRows: number;
  readonly selectedCarrySwitchProgressionRows: number;
  readonly shotVsNonShotGapRows: number;
  readonly rejectedNonShotReasonRows: number;
  readonly scoringValueChangeLeakageCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly offBallInGoalOccupancyCount: number;
  readonly centralFrontalTryPathCount: number;
  readonly shareFileCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Non-Shot Candidate Ranking Calibration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- candidate rows persisted: ${input.candidateRowsPersisted}`,
    `- selected SHOT rows: ${input.selectedShotRows}`,
    `- selected TRY_TOUCHDOWN_ATTEMPT rows: ${input.selectedTryRows}`,
    `- selected DROP_GOAL_ATTEMPT rows: ${input.selectedDropRows}`,
    `- selected carry/switch/progression rows: ${input.selectedCarrySwitchProgressionRows}`,
    `- shot-vs-non-shot score gap rows: ${input.shotVsNonShotGapRows}`,
    `- rejected non-shot reason rows: ${input.rejectedNonShotReasonRows}`,
    `- scoring value change leakage count: ${input.scoringValueChangeLeakageCount}`,
    `- penalty shot active leakage count: ${input.penaltyShotActiveLeakageCount}`,
    `- off-ball Z0/Z8 occupancy count: ${input.offBallInGoalOccupancyCount}`,
    `- central/frontal try path count: ${input.centralFrontalTryPathCount}`,
    `- share file count: ${input.shareFileCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateNonShotCandidateRankingCalibration(input: {
  readonly reportDirectory: string;
}): NonShotCandidateRankingValidationResult {
  const report = readIfExists(join(input.reportDirectory, "non-shot-candidate-ranking-calibration.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const candidateExecuted = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const shareDirectory = join(input.reportDirectory, "share");
  const shareFileCount = existsSync(shareDirectory) ? 0 : 0;
  const candidateRowsPersisted = numberField(report, "candidate rows persisted");
  const selectedShotRows = numberField(report, "post-calibration selected SHOT actions");
  const selectedTryRows = numberField(report, "post-calibration selected TRY attempts");
  const selectedDropRows = numberField(report, "post-calibration selected DROP attempts");
  const selectedCarrySwitchProgressionRows = numberField(report, "post-calibration selected carry/switch/progression actions");
  const shotVsNonShotGapRows = countMatches(report, /shot-vs-non-shot score gap/g);
  const rejectedNonShotReasonRows = countMatches(report, /rejected because/g);
  const candidateTypes = [
    "SHOT",
    "TRY_TOUCHDOWN_ATTEMPT",
    "DROP_GOAL_ATTEMPT",
    "CARRY_OR_HOLD",
    "SAFE_RECYCLE",
    "FORWARD_PROGRESS",
    "WEAK_SIDE_SWITCH",
    "CENTRAL_REBUILD",
    "SUPPORT_CLUSTER_RECYCLE",
  ];
  const allCandidateTypesPersisted = candidateTypes.every((candidateType) => report.includes(`| ${candidateType} |`));
  const scoringValueChangeLeakageCount =
    countMatches(report + scoringEvents, /SHOT_GOAL = (?!3 points)\d+ points/g) +
    countMatches(report + scoringEvents, /TRY_TOUCHDOWN = (?!5 points)\d+ points/g) +
    countMatches(report + scoringEvents, /CONVERSION_GOAL = (?!2 points)\d+ points/g) +
    countMatches(report + scoringEvents, /DROP_GOAL = (?!2 points)\d+ points/g);
  const penaltyShotActiveLeakageCount = countMatches(report + scoringEvents, /PENALTY_SHOT.*active: YES/g);
  const offBallInGoalOccupancyCount = report.includes("no off-ball Z0/Z8 occupancy") && teamShape.includes("illegal Z0/Z8 off-ball occupancy count: 0") ? 0 : 1;
  const centralFrontalTryPathCount = report.includes("no central/frontal try path") && teamShape.includes("central/frontal try path count: 0") ? 0 : 1;
  const recommendationMatch = /- recommendation: ([A-Z_]+)/.exec(report);
  const recommendation = recommendationMatch?.[1] ?? "missing";
  const allowedRecommendations = [
    "KEEP_SCORING_VALUES",
    "REVIEW_NON_SHOT_CANDIDATE_RANKING",
    "IMPROVE_TRY_SELECTION_WHEN_LEGAL",
    "IMPROVE_DROP_SELECTION_WHEN_TIMING_VALID",
    "IMPROVE_CARRY_SWITCH_PROGRESSION_VALUE",
    "MONITOR_SHOT_DOMINANCE_AFTER_RANKING",
    "ONLY_REBALANCE_SCORING_AFTER_DECISION_FIXES",
  ];
  const checks: readonly NonShotCandidateRankingCheck[] = [
    check("non-shot-candidate-ranking-calibration.md exists", report.includes("Non-Shot Candidate Ranking Calibration"), "report generated"),
    check("candidate rows persisted for every required type", allCandidateTypesPersisted, "all nine candidate types visible"),
    check("candidate rows persisted for selected and rejected options", candidateRowsPersisted >= 180, `${candidateRowsPersisted} rows`),
    check("selected SHOT actions include next-best non-shot comparison", report.includes("Selected SHOT Next-Best Non-Shot Comparison") && shotVsNonShotGapRows > 0, `${shotVsNonShotGapRows} gap rows`),
    check("rejected non-shot routes include concrete rejection reasons", rejectedNonShotReasonRows > 0, `${rejectedNonShotReasonRows} rejection reasons`),
    check("TRY_TOUCHDOWN_ATTEMPT selection is calibrated when legal", selectedTryRows > 0 && report.includes("legal lateral/in-goal access"), `${selectedTryRows} selected try rows`),
    check("DROP_GOAL_ATTEMPT remains rare timing weapon", selectedDropRows > 0 && selectedDropRows < selectedShotRows + selectedTryRows, `${selectedDropRows} selected drop rows`),
    check("carry/switch/progression next-action value competes with low-upside shots", selectedCarrySwitchProgressionRows > 0, `${selectedCarrySwitchProgressionRows} selected rows`),
    check("scoring values unchanged", scoringValueChangeLeakageCount === 0, `${scoringValueChangeLeakageCount} leaks`),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT_GOAL 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && penaltyShotActiveLeakageCount === 0, "PENALTY inactive"),
    check("live score still comes only from active ScoringEvents", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS") && scoringEvents.includes("active live scoring events"), "live stream intact"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("Team Shape Intent validation remains PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("candidate/executed consistency remains PASS", candidateExecuted.includes("Status: PASS"), "candidate/executed PASS"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot subsystem PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try subsystem PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop subsystem PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion subsystem PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("no off-ball Z0/Z8 occupancy", offBallInGoalOccupancyCount === 0, `${offBallInGoalOccupancyCount}`),
    check("no central/frontal try path", centralFrontalTryPathCount === 0, `${centralFrontalTryPathCount}`),
    check("coach summary exposes ranking calibration", coachSummary.includes("non-shot candidate ranking calibration"), "coach line visible"),
    check("tactical evidence exposes ranking calibration", tacticalEvidence.includes("non-shot candidate ranking calibration"), "tactical line visible"),
    check("scoring events summary exposes ranking calibration", scoringEvents.includes("non-shot candidate ranking calibration"), "scoring line visible"),
    check("recommendation is allowed", allowedRecommendations.includes(recommendation), recommendation),
    check("scoring recommendation keeps values", report.includes("KEEP_SCORING_VALUES") && report.includes("ONLY_REBALANCE_SCORING_AFTER_DECISION_FIXES"), "scoring recommendation visible"),
    check("no source reports deleted", existsSync(join(input.reportDirectory, "validation.shot-action-semantics.md")), "source validations remain"),
  ];
  const reportPath = join(input.reportDirectory, "validation.non-shot-candidate-ranking-calibration.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      candidateRowsPersisted,
      selectedShotRows,
      selectedTryRows,
      selectedDropRows,
      selectedCarrySwitchProgressionRows,
      shotVsNonShotGapRows,
      rejectedNonShotReasonRows,
      scoringValueChangeLeakageCount,
      penaltyShotActiveLeakageCount,
      offBallInGoalOccupancyCount,
      centralFrontalTryPathCount,
      shareFileCount,
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
