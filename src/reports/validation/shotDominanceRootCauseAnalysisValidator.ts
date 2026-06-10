import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type ShotDominanceRootCauseStatus = "PASS" | "FAIL";

interface ShotDominanceRootCauseCheck {
  readonly label: string;
  readonly status: ShotDominanceRootCauseStatus;
  readonly detail: string;
}

export interface ShotDominanceRootCauseAnalysisValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ShotDominanceRootCauseCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ShotDominanceRootCauseCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function renderMarkdown(input: {
  readonly checks: readonly ShotDominanceRootCauseCheck[];
  readonly shotGoalPointValueLeakageCount: number;
  readonly tryPointValueLeakageCount: number;
  readonly conversionPointValueLeakageCount: number;
  readonly dropPointValueLeakageCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly shapeValidationPassCount: number;
  readonly shotPassVocabularyCount: number;
  readonly recommendationCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Shot Dominance Root Cause Analysis Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- shot goal point value leakage count: ${input.shotGoalPointValueLeakageCount}`,
    `- try point value leakage count: ${input.tryPointValueLeakageCount}`,
    `- conversion point value leakage count: ${input.conversionPointValueLeakageCount}`,
    `- drop point value leakage count: ${input.dropPointValueLeakageCount}`,
    `- penalty shot active leakage count: ${input.penaltyShotActiveLeakageCount}`,
    `- batch/live contamination count: ${input.batchLiveContaminationCount}`,
    `- shape validation PASS count: ${input.shapeValidationPassCount}`,
    `- shot blocks using pass vocabulary count: ${input.shotPassVocabularyCount}`,
    `- recommendation count: ${input.recommendationCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateShotDominanceRootCauseAnalysis(input: {
  readonly reportDirectory: string;
}): ShotDominanceRootCauseAnalysisValidationResult {
  const report = readIfExists(join(input.reportDirectory, "shot-dominance-root-cause-analysis.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const dropFoundation = readIfExists(join(input.reportDirectory, "validation.drop-goal-foundation.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const sharePack = readIfExists(join(input.reportDirectory, "validation.share-pack.md"));
  const shotGoalPointValueLeakageCount = countMatches(report + scoringEvents, /SHOT_GOAL = (?!3 points)\d+ points/g);
  const tryPointValueLeakageCount = countMatches(report + scoringEvents, /TRY_TOUCHDOWN = (?!5 points)\d+ points/g);
  const conversionPointValueLeakageCount = countMatches(report + scoringEvents, /CONVERSION_GOAL = (?!2 points)\d+ points/g);
  const dropPointValueLeakageCount = countMatches(report + scoringEvents, /DROP_GOAL = (?!2 points)\d+ points/g);
  const penaltyShotActiveLeakageCount = countMatches(report + scoringEvents, /PENALTY_SHOT.*active: YES/g);
  const batchLiveContaminationCount = report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate") ? 0 : 1;
  const shapeValidationPassCount = teamShape.includes("Status: PASS") ? 1 : 0;
  const shotPassVocabularyCount = shotSemantics.includes("shot blocks using pass vocabulary: 0") ? 0 : 1;
  const recommendationCount = countMatches(
    report,
    /REVIEW_SHOT_SELECTION_MODEL|REVIEW_SHOT_AFFORDANCE_GENERATION|REVIEW_REBOUND_SHOT_VOLUME|REVIEW_DEFENSIVE_SHAPE_PERMISSIVENESS|REVIEW_NON_SHOT_CANDIDATE_RANKING|KEEP_SCORING_VALUES|ONLY_REBALANCE_SCORING_AFTER_DECISION_FIXES/g,
  );
  const checks: readonly ShotDominanceRootCauseCheck[] = [
    check("shot-dominance-root-cause-analysis.md exists", report.includes("Shot Dominance Root Cause Analysis"), "report generated"),
    check("shot selection frequency section exists", report.includes("## Shot Selection Frequency"), "selection section visible"),
    check("shot window quality section exists", report.includes("## Shot Window Quality"), "window section visible"),
    check("team shape contribution section exists", report.includes("## Team Shape Contribution"), "shape section visible"),
    check("alternative route suppression section exists", report.includes("## Alternative Route Suppression"), "alternative section visible"),
    check("rebound contribution section exists", report.includes("## Rebound Contribution"), "rebound section visible"),
    check("resolution contribution section exists", report.includes("## Resolution Contribution"), "resolution section visible"),
    check("final diagnosis section exists", report.includes("## Final Diagnosis"), "diagnosis visible"),
    check("scoring values unchanged", shotGoalPointValueLeakageCount + tryPointValueLeakageCount + conversionPointValueLeakageCount + dropPointValueLeakageCount === 0, "point values canonical"),
    check("SHOT_GOAL remains 3 points", report.includes("SHOT_GOAL = 3 points"), "SHOT_GOAL 3"),
    check("TRY_TOUCHDOWN remains 5 points", report.includes("TRY_TOUCHDOWN = 5 points"), "TRY 5"),
    check("CONVERSION_GOAL remains 2 points", report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION 2"),
    check("DROP_GOAL remains 2 points", report.includes("DROP_GOAL = 2 points"), "DROP 2"),
    check("PENALTY_SHOT remains inactive", report.includes("PENALTY_SHOT inactive") && penaltyShotActiveLeakageCount === 0, "PENALTY inactive"),
    check("live score still comes from active ScoringEvents", report.includes("active live scoring events: 1") && scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS"), "live scoring source"),
    check("batch/live separation preserved", batchLiveContaminationCount === 0, "batch/live separated"),
    check("Team Shape Intent validation remains PASS", shapeValidationPassCount === 1, "team shape PASS"),
    check("candidate/executed consistency remains PASS", candidate.includes("Status: PASS"), "candidate PASS"),
    check("shot semantics remain shot-specific", shotSemantics.includes("Status: PASS") && shotPassVocabularyCount === 0, "shot semantics PASS"),
    check("try semantics remain try-specific", tryCandidate.includes("Status: PASS") && liveTry.includes("Status: PASS"), "try validations PASS"),
    check("no off-ball Z0/Z8 occupancy", teamShape.includes("illegal Z0/Z8 off-ball occupancy count: 0"), "Z0/Z8 0"),
    check("no central/frontal try path introduced", teamShape.includes("central/frontal try path count: 0"), "try path 0"),
    check("drop validation remains PASS", dropFoundation.includes("Status: PASS") && dropResolution.includes("Status: PASS"), "drop validations PASS"),
    check("conversion validation remains PASS", conversionResolution.includes("Status: PASS") && conversionDifficulty.includes("Status: PASS"), "conversion validations PASS"),
    check("share pack remains MINIMAL_REVIEW", sharePack.length === 0 || sharePack.includes("MINIMAL_REVIEW"), "MINIMAL_REVIEW"),
    check("allowed recommendation values are used", recommendationCount > 0, `${recommendationCount} recommendation tokens`),
    check("scoring values are not blamed as primary cause", report.includes("SCORING_VALUES_SUSPECT | NON_CAUSE"), "scoring values non-cause"),
  ];
  const reportPath = join(input.reportDirectory, "validation.shot-dominance-root-cause-analysis.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      shotGoalPointValueLeakageCount,
      tryPointValueLeakageCount,
      conversionPointValueLeakageCount,
      dropPointValueLeakageCount,
      penaltyShotActiveLeakageCount,
      batchLiveContaminationCount,
      shapeValidationPassCount,
      shotPassVocabularyCount,
      recommendationCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
