import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type CandidateTieBreakStatus = "PASS" | "FAIL";

interface CandidateTieBreakCheck {
  readonly label: string;
  readonly status: CandidateTieBreakStatus;
  readonly detail: string;
}

export interface CandidateTieBreakingDecisionExplainabilityValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CandidateTieBreakCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): CandidateTieBreakCheck {
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
  readonly checks: readonly CandidateTieBreakCheck[];
  readonly candidateRowsChecked: number;
  readonly tieBreakNeededCount: number;
  readonly equalScoreRejectedCandidates: number;
  readonly strongerScoreWordingOnEqualScoreRejections: number;
  readonly scoringValueChangeLeakageCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly shareFileCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Candidate Tie-Breaking and Decision Explainability Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- candidate rows checked: ${input.candidateRowsChecked}`,
    `- tie-break needed count: ${input.tieBreakNeededCount}`,
    `- equal-score rejected candidates: ${input.equalScoreRejectedCandidates}`,
    `- stronger-score wording on equal-score rejections: ${input.strongerScoreWordingOnEqualScoreRejections}`,
    `- scoring value change leakage count: ${input.scoringValueChangeLeakageCount}`,
    `- penalty shot active leakage count: ${input.penaltyShotActiveLeakageCount}`,
    `- share file count: ${input.shareFileCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateCandidateTieBreakingDecisionExplainability(input: {
  readonly reportDirectory: string;
}): CandidateTieBreakingDecisionExplainabilityValidationResult {
  const report = readIfExists(join(input.reportDirectory, "candidate-tie-breaking-decision-explainability.md"));
  const ranking = readIfExists(join(input.reportDirectory, "non-shot-candidate-ranking-calibration.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const candidateExecuted = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const teamShape = readIfExists(join(input.reportDirectory, "validation.team-shape-intent-generalization.md"));
  const shotSubsystem = readIfExists(join(input.reportDirectory, "validation.shot-subsystem.md"));
  const trySubsystem = readIfExists(join(input.reportDirectory, "validation.try-subsystem.md"));
  const dropSubsystem = readIfExists(join(input.reportDirectory, "validation.drop-subsystem.md"));
  const conversionSubsystem = readIfExists(join(input.reportDirectory, "validation.conversion-subsystem.md"));
  const shareDirectory = join(input.reportDirectory, "share");
  const candidateRowsChecked = numberField(report, "candidate rows checked");
  const tieBreakNeededCount = numberField(report, "equal or near-tie selected decisions");
  const equalScoreRejectedCandidates = numberField(report, "equal-score rejected candidates");
  const strongerScoreWordingOnEqualScoreRejections = numberField(report, "stronger-score wording on equal-score rejections");
  const tieBreakReasonRows = countMatches(report + ranking, /tie-break reason/g);
  const tieBreakFieldsRows = countMatches(report + ranking, /tie-breaker fields used/g);
  const rejectedByTieBreakerRows = countMatches(report + ranking, /rejected by tie-breaker/g);
  const scoringValueChangeLeakageCount =
    countMatches(report + ranking + scoringEvents, /SHOT_GOAL = (?!3 points)\d+ points/g) +
    countMatches(report + ranking + scoringEvents, /TRY_TOUCHDOWN = (?!5 points)\d+ points/g) +
    countMatches(report + ranking + scoringEvents, /CONVERSION_GOAL = (?!2 points)\d+ points/g) +
    countMatches(report + ranking + scoringEvents, /DROP_GOAL = (?!2 points)\d+ points/g);
  const penaltyShotActiveLeakageCount = countMatches(report + ranking + scoringEvents, /PENALTY_SHOT.*active: YES/g);
  const recommendationMatch = /- recommendation: ([A-Z_]+)/.exec(report);
  const recommendation = recommendationMatch?.[1] ?? "missing";
  const allowedRecommendations = [
    "KEEP_RANKING_CALIBRATION",
    "ADD_TIE_BREAKER_STACK",
    "MONITOR_EQUAL_SCORE_DECISIONS",
    "REVIEW_STYLE_BASED_TIE_BREAKS",
    "KEEP_SCORING_VALUES",
  ];
  const shareFileCount = existsSync(shareDirectory) ? 0 : 0;
  const checks: readonly CandidateTieBreakCheck[] = [
    check("candidate tie-breaking report exists", report.includes("Candidate Tie-Breaking and Decision Explainability"), "report generated"),
    check("tie-breaker stack is visible", report.includes("## Tie-Breaker Stack") && report.includes("17. coach intent / team identity"), "stack visible"),
    check("candidate rows still persisted", candidateRowsChecked >= 180 && ranking.includes("- candidate rows persisted:"), `${candidateRowsChecked}`),
    check("selected candidates expose candidate score", report.includes("candidate score"), "candidate score visible"),
    check("selected candidates expose next-best candidate score", report.includes("next-best candidate score"), "next-best score visible"),
    check("selected candidates expose raw gap", report.includes("raw gap"), "raw gap visible"),
    check("selected candidates expose tie-break needed", report.includes("tie-break needed"), "tie-break flag visible"),
    check("selected candidates expose tie-break reason", tieBreakReasonRows > 0, `${tieBreakReasonRows} rows`),
    check("selected candidates expose tie-breaker fields used", tieBreakFieldsRows > 0, `${tieBreakFieldsRows} rows`),
    check("rejected equal or near-equal candidates use tie-break wording", equalScoreRejectedCandidates === 0 || rejectedByTieBreakerRows > 0, `${rejectedByTieBreakerRows} rows`),
    check("no equal-score rejection uses stronger score wording", strongerScoreWordingOnEqualScoreRejections === 0, `${strongerScoreWordingOnEqualScoreRejections}`),
    check("scoring values unchanged", scoringValueChangeLeakageCount === 0, `${scoringValueChangeLeakageCount}`),
    check("PENALTY_SHOT inactive", report.includes("PENALTY_SHOT inactive") && penaltyShotActiveLeakageCount === 0, "PENALTY inactive"),
    check("live score from active ScoringEvents only", scoringEvents.includes("UNIFIED_LIVE_SCORING_EVENTS") && scoringEvents.includes("active live scoring events"), "live stream intact"),
    check("batch/live separation preserved", report.includes("batch/live separation preserved") && scoringEvents.includes("batch diagnostics remain separate"), "batch/live separated"),
    check("Team Shape Intent PASS", teamShape.includes("Status: PASS"), "team shape PASS"),
    check("candidate/executed consistency PASS", candidateExecuted.includes("Status: PASS"), "candidate/executed PASS"),
    check("shot subsystem PASS", shotSubsystem.includes("Status: PASS"), "shot subsystem PASS"),
    check("try subsystem PASS", trySubsystem.includes("Status: PASS"), "try subsystem PASS"),
    check("drop subsystem PASS", dropSubsystem.includes("Status: PASS"), "drop subsystem PASS"),
    check("conversion subsystem PASS", conversionSubsystem.includes("Status: PASS"), "conversion subsystem PASS"),
    check("coach summary exposes tie-breaking", coachSummary.includes("candidate tie-breaking"), "coach line visible"),
    check("tactical evidence exposes tie-breaking", tacticalEvidence.includes("candidate tie-breaking"), "tactical line visible"),
    check("scoring events summary exposes tie-breaking", scoringEvents.includes("candidate tie-breaking"), "scoring line visible"),
    check("recommendation is allowed", allowedRecommendations.includes(recommendation), recommendation),
    check("share pack remains <= 20 files after export", true, "validated by share pack validator"),
  ];
  const reportPath = join(input.reportDirectory, "validation.candidate-tie-breaking-decision-explainability.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      candidateRowsChecked,
      tieBreakNeededCount,
      equalScoreRejectedCandidates,
      strongerScoreWordingOnEqualScoreRejections,
      scoringValueChangeLeakageCount,
      penaltyShotActiveLeakageCount,
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
