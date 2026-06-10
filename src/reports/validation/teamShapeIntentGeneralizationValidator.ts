import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SnapshotReference } from "../visualization";
import { buildTeamShapeIntentGeneralization } from "../shape/teamShapeIntentGeneralizationReport";

type TeamShapeGeneralizationStatus = "PASS" | "FAIL";

interface TeamShapeGeneralizationCheck {
  readonly label: string;
  readonly status: TeamShapeGeneralizationStatus;
  readonly detail: string;
}

export interface TeamShapeIntentGeneralizationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly TeamShapeGeneralizationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): TeamShapeGeneralizationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly TeamShapeGeneralizationCheck[];
  readonly actionCount: number;
  readonly sequenceOneActionOneShapeScore: number;
  readonly averageShapeScore: number;
  readonly structuralErrorCount: number;
  readonly illegalOffBallInGoalOccupancyCount: number;
  readonly centralFrontalTryPathCount: number;
  readonly scoringValuesChangedCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly candidateExecutedMismatchCount: number;
  readonly shotPassVocabularyCount: number;
  readonly tryPassVocabularyCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Team Shape Intent Generalization Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- action count: ${input.actionCount}`,
    `- Sequence 1 Action 1 shape score: ${input.sequenceOneActionOneShapeScore}`,
    `- average shape score: ${input.averageShapeScore}`,
    `- structural error count: ${input.structuralErrorCount}`,
    `- illegal Z0/Z8 off-ball occupancy count: ${input.illegalOffBallInGoalOccupancyCount}`,
    `- central/frontal try path count: ${input.centralFrontalTryPathCount}`,
    `- scoring values changed count: ${input.scoringValuesChangedCount}`,
    `- penalty shot active leakage count: ${input.penaltyShotActiveLeakageCount}`,
    `- batch/live contamination count: ${input.batchLiveContaminationCount}`,
    `- final score mismatch count: ${input.finalScoreMismatchCount}`,
    `- candidate/executed mismatch count: ${input.candidateExecutedMismatchCount}`,
    `- shot blocks using pass vocabulary count: ${input.shotPassVocabularyCount}`,
    `- try blocks using pass/new-carrier wording count: ${input.tryPassVocabularyCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateTeamShapeIntentGeneralization(input: {
  readonly snapshots: readonly SnapshotReference[];
  readonly reportDirectory: string;
}): TeamShapeIntentGeneralizationValidationResult {
  const report = readIfExists(join(input.reportDirectory, "team-shape-intent-generalization.md"));
  const s1Validation = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-calibration.md"));
  const workbenchValidation = readIfExists(join(input.reportDirectory, "validation.sequence-1-action-1-workbench.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const shotAction = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const dropFoundation = readIfExists(join(input.reportDirectory, "validation.drop-goal-foundation.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const sharePack = readIfExists(join(input.reportDirectory, "validation.share-pack.md"));
  const { evaluations, summary } = buildTeamShapeIntentGeneralization({ snapshots: input.snapshots });
  const allWeakSideClassified = evaluations.every((evaluation) =>
    ["INTENTIONAL_STYLE_TRADEOFF", "TEMPORARY_TRANSITION_RISK", "STRUCTURAL_ERROR"].includes(evaluation.weakSideRiskClassification),
  );
  const checks: readonly TeamShapeGeneralizationCheck[] = [
    check("team-shape-intent-generalization.md exists", report.includes("Team Shape Intent Generalization"), "report generated"),
    check("existing Sequence 1 Action 1 validation remains PASS", s1Validation.includes("Status: PASS"), "S1A1 calibration PASS"),
    check("Sequence 1 Action 1 shape score remains 100", summary.sequenceOneActionOneShapeScore === 100, `${summary.sequenceOneActionOneShapeScore}`),
    check("TH -> ML remains unchanged", report.includes("Sequence 1 Action 1 remains TH -> ML"), "TH -> ML invariant visible"),
    check("selected action remains SUPPORT_CLUSTER_RECYCLE", report.includes("SUPPORT_CLUSTER_RECYCLE"), "SUPPORT_CLUSTER_RECYCLE visible"),
    check("no position mismatch between tactical board and SVG/workbench data-real-zone", workbenchValidation.includes("Status: PASS"), "workbench position validation PASS"),
    check("candidate/executed consistency remains PASS", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("shot semantics remain shot-specific", shotAction.includes("Status: PASS") && shotAction.includes("shot blocks using pass vocabulary: 0"), "shot pass vocabulary 0"),
    check("try semantics remain try-specific", tryCandidate.includes("Status: PASS") && liveTry.includes("Status: PASS"), "try validations PASS"),
    check(
      "DROP_GOAL remains active at 2 points",
      dropFoundation.includes("Status: PASS") &&
        (dropFoundation.includes("DROP_GOAL remains 2 points") || dropFoundation.includes("DROP_GOAL = 2 points")),
      "DROP_GOAL 2 points",
    ),
    check("PENALTY_SHOT remains inactive", scoringEvents.includes("PENALTY_SHOT inactive") && !/PENALTY_SHOT.*active: YES/.test(scoringEvents), "PENALTY_SHOT inactive"),
    check("batch diagnostics remain separate from live score", summary.batchLiveContaminationCount === 0 && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("final live score still comes only from active live ScoringEvents", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS") && scoringEvents.includes("active live scoring events: 1"), "live scoring source visible"),
    check("no scoring values changed", summary.scoringValuesChangedCount === 0, `${summary.scoringValuesChangedCount}`),
    check("no off-ball Z0/Z8 occupancy", summary.illegalOffBallInGoalOccupancyCount === 0, `${summary.illegalOffBallInGoalOccupancyCount}`),
    check("no central/frontal try path introduced", summary.centralFrontalTryPathCount === 0, `${summary.centralFrontalTryPathCount}`),
    check("every weak-side exposure is classified", allWeakSideClassified, "all evaluations classified"),
    check("structural errors are listed when present", summary.structuralErrorCount === 0 || report.includes("## Structural Errors"), `${summary.structuralErrorCount}`),
    check("candidate/executed mismatch count remains 0", summary.candidateExecutedMismatchCount === 0, `${summary.candidateExecutedMismatchCount}`),
    check("shot blocks using pass vocabulary remains 0", summary.shotPassVocabularyCount === 0, `${summary.shotPassVocabularyCount}`),
    check("try blocks using pass/new-carrier wording remains 0", summary.tryPassVocabularyCount === 0, `${summary.tryPassVocabularyCount}`),
    check("share pack remains MINIMAL_REVIEW", sharePack.length === 0 || sharePack.includes("MINIMAL_REVIEW"), "MINIMAL_REVIEW"),
  ];
  const reportPath = join(input.reportDirectory, "validation.team-shape-intent-generalization.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      actionCount: summary.actionCount,
      sequenceOneActionOneShapeScore: summary.sequenceOneActionOneShapeScore,
      averageShapeScore: summary.averageShapeScore,
      structuralErrorCount: summary.structuralErrorCount,
      illegalOffBallInGoalOccupancyCount: summary.illegalOffBallInGoalOccupancyCount,
      centralFrontalTryPathCount: summary.centralFrontalTryPathCount,
      scoringValuesChangedCount: summary.scoringValuesChangedCount,
      penaltyShotActiveLeakageCount: summary.penaltyShotActiveLeakageCount,
      batchLiveContaminationCount: summary.batchLiveContaminationCount,
      finalScoreMismatchCount: summary.finalScoreMismatchCount,
      candidateExecutedMismatchCount: summary.candidateExecutedMismatchCount,
      shotPassVocabularyCount: summary.shotPassVocabularyCount,
      tryPassVocabularyCount: summary.tryPassVocabularyCount,
      recommendation: summary.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
