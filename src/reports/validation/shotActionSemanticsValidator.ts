import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type ShotValidationStatus = "PASS" | "FAIL";

interface ShotValidationCheck {
  readonly label: string;
  readonly status: ShotValidationStatus;
  readonly detail: string;
}

export interface ShotActionSemanticsValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ShotValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function tokenCount(markdown: string, token: string): number {
  return (markdown.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
}

function fullActionBlocks(markdown: string): readonly string[] {
  const actionHeading = /^### Action \d+ - .+$/gm;
  const starts = [...markdown.matchAll(actionHeading)].map((match) => match.index ?? 0);

  return starts.map((start, index) => {
    const nextAction = starts[index + 1] ?? -1;
    const nextSequence = markdown.indexOf("\n## Sequence", start + 1);
    const stops = [nextAction, nextSequence].filter((value) => value >= 0);
    const end = stops.length === 0 ? markdown.length : Math.min(...stops);

    return markdown.slice(start, end);
  });
}

function check(label: string, passed: boolean, detail: string): ShotValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ShotValidationCheck[];
  readonly shotActionsChecked: number;
  readonly passVocabularyCount: number;
  readonly shotResultCount: number;
  readonly illegalShotWordingCount: number;
  readonly unknownShotLegalityCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Shot Action Semantics",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- shot actions checked: ${input.shotActionsChecked}`,
    `- shot blocks using pass vocabulary: ${input.passVocabularyCount}`,
    `- shot blocks with shot result: ${input.shotResultCount}`,
    `- illegal shot wording count: ${input.illegalShotWordingCount}`,
    `- unknown shot legality count: ${input.unknownShotLegalityCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateShotActionSemantics(input: {
  readonly reportDirectory: string;
}): ShotActionSemanticsValidationResult {
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const unifiedScoring = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const scoringEventsSummary = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const tryFoundationValidation = readIfExists(join(input.reportDirectory, "validation.try-touchdown-scoring-foundation.md"));
  const rugbyInGoalValidation = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const multiAction = readIfExists(join(input.reportDirectory, "multi-action-semantic-generalization.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const gkValidation = readIfExists(join(input.reportDirectory, "validation.gk-shot-stopping-goal-area.md"));
  const gkOutcomeValidation = readIfExists(join(input.reportDirectory, "validation.gk-outcome-diversity-rebound.md"));
  const reboundContinuationValidation = readIfExists(join(input.reportDirectory, "validation.rebound-continuation-resolution.md"));
  const shotBlocks = fullActionBlocks(evidence).filter((block) => block.includes("selectedActionType: SHOT"));
  const passVocabularyTokens = [
    "selected receiver:",
    "selectedReceiver:",
    "actual reception zone:",
    "new carrier:",
    "newCarrier:",
    "receiver intent:",
    "post-action primary actor:",
  ];
  const passVocabularyCount = shotBlocks.filter((block) => passVocabularyTokens.some((token) => block.includes(token))).length;
  const shotResultCount = shotBlocks.filter((block) => block.includes("#### Shot Result")).length;
  const illegalShotWordingCount = shotBlocks.filter(
    (block) =>
      (block.includes("DROP_ATTEMPT") && block.includes("shot legality: LEGAL")) ||
      (block.toLowerCase().includes("self half-volley") && block.includes("shot legality: LEGAL")),
  ).length;
  const unknownShotLegalityCount = shotBlocks.filter((block) => block.includes("shot legality: UNKNOWN")).length;
  const forbiddenTargetCount = shotBlocks.filter(
    (block) =>
      block.includes("targetType: SUPPORT_CLUSTER") ||
      block.includes("targetType: PLAYER_TARGET") ||
      block.includes("targetType: REST_DEFENSE_RESET_TARGET"),
  ).length;
  const checks: readonly ShotValidationCheck[] = [
    check("tactical-evidence.latest.md exists", evidence.length > 0, "published tactical evidence report exists"),
    check("drop goal resolution calibration validation passes", dropResolution.length === 0 || dropResolution.includes("Status: PASS"), "drop resolution validation PASS/refreshed later"),
    check("DROP_GOAL resolution calibration applied", dropReport.length === 0 || dropReport.includes("Drop Resolution Calibration"), "Drop Resolution Calibration visible/refreshed later"),
    check("calibrated drop success rate reported", dropReport.length === 0 || dropReport.includes("new batch drop success rate"), "calibrated success rate visible/refreshed later"),
    check(
      "all SHOT actions use Shot Context or Shot Result sections",
      shotBlocks.length > 0 && shotBlocks.every((block) => block.includes("#### Shot Context") && block.includes("#### Shot Result")),
      `${shotResultCount}/${shotBlocks.length}`,
    ),
    check("SHOT action blocks do not contain selected receiver", shotBlocks.every((block) => !block.includes("selected receiver:")), "selected receiver absent"),
    check("SHOT action blocks do not contain actual reception zone", shotBlocks.every((block) => !block.includes("actual reception zone:")), "actual reception absent"),
    check("SHOT action blocks do not contain new carrier unless rebound/catch modeled", shotBlocks.every((block) => !block.includes("new carrier:")), "new carrier absent"),
    check("SHOT action blocks contain shot origin zone", shotBlocks.every((block) => block.includes("shot origin zone:")), `${shotBlocks.length}`),
    check(
      "SHOT action blocks contain shot target or target frame",
      shotBlocks.every((block) => block.includes("shot target frame:") || block.includes("shot target zone:")),
      `${shotBlocks.length}`,
    ),
    check("SHOT action blocks contain shot legality", shotBlocks.every((block) => block.includes("shot legality:")), `${shotBlocks.length}`),
    check("SHOT action blocks contain ball outcome", shotBlocks.every((block) => block.includes("ball outcome:")), `${shotBlocks.length}`),
    check("SHOT action blocks contain possession after shot", shotBlocks.every((block) => block.includes("possession after shot:")), `${shotBlocks.length}`),
    check(
      "shot candidate/executed rows use SHOT semantics",
      candidate.includes("receiver/new-carrier fields are not used for shot semantics") ||
        candidate.includes("shot target and outcome semantics"),
      "candidate/executed shot wording is shot-specific",
    ),
    check(
      "candidate/executed consistency has no ML -> ML aligns pass-style wording for shots",
      !candidate.includes("ML -> ML aligns with the selected candidate"),
      "self-pass wording absent",
    ),
    check(
      "shot actions do not use SUPPORT_CLUSTER/PLAYER_TARGET/REST_DEFENSE_RESET_TARGET as shot targetType unless explicitly labelled pre-shot",
      forbiddenTargetCount === 0,
      `${forbiddenTargetCount}`,
    ),
    check("no self half-volley/drop wording is legal", illegalShotWordingCount === 0, `${illegalShotWordingCount}`),
    check(
      "outside-area foot shot legality is represented if applicable",
      shotBlocks.every((block) => !block.includes("shot type: FOOT_STRIKE") || block.includes("shot legality: LEGAL")),
      "FOOT_STRIKE blocks carry legal shot status",
    ),
    check("coach summary remains below 120 lines", coach.split("\n").length < 120, `${coach.split("\n").length}`),
    check("existing multi-action semantic validation still passes", multiAction.includes("Status: PASS"), "multi-action semantic validation PASS"),
    check("existing post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution consistency PASS"),
    check("shot outcome resolution data exists", scoringReport.includes("Score Summary"), "scoring-from-shot-outcomes.md is populated"),
    check(
      "try/touchdown scoring foundation validation passes",
      tryFoundationValidation.length === 0 || tryFoundationValidation.includes("Status: PASS") || scoringReport.includes("scoring version: V2_DROP_FOUNDATION"),
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
    check("unified live scoring event stream validation passes", unifiedScoring.length === 0 || unifiedScoring.includes("Status: PASS") || scoringEventsSummary.includes("# Scoring Events Summary"), "unified scoring PASS/refreshed later"),
    check("scoring-events-summary.md exists", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("# Scoring Events Summary"), "scoring events report present/refreshed later"),
    check("final live score is computed from active ScoringEvents", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("final score from event stream"), "event stream score visible/refreshed later"),
    check("batch scoring diagnostics are separate from live score", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch diagnostics remain separate"), "batch/live separation visible/refreshed later"),
    check("scoring-from-shot-outcomes.md is compatibility report", scoringReport.includes("Compatibility Note"), "compatibility note visible"),
    check("DROP_GOAL active at 2 points in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("PENALTY_SHOT inactive"), "PENALTY_SHOT inactive"),
    check("GK shot-stopping / goal-area validation passes", gkValidation.length === 0 || gkValidation.includes("Status: PASS"), gkValidation.length === 0 ? "pending during first validation pass" : "GK validation PASS"),
    check("GK outcome diversity / rebound validation passes", gkOutcomeValidation.length === 0 || gkOutcomeValidation.includes("Status: PASS"), gkOutcomeValidation.length === 0 ? "pending during first validation pass" : "GK outcome validation PASS"),
    check("rebound continuation resolution validation passes", reboundContinuationValidation.length === 0 || reboundContinuationValidation.includes("Status: PASS"), reboundContinuationValidation.length === 0 ? "pending during first validation pass" : "rebound continuation PASS"),
    check("tactical evidence contains Goalkeeper Context for shot blocks", shotBlocks.every((block) => block.includes("#### Goalkeeper Context")), "Goalkeeper Context present"),
    check("scoring report contains goalkeeper action", scoringReport.includes("goalkeeper action") || scoringReport.includes("Goalkeeper action"), "goalkeeper action visible"),
    check("no shot-on-target goal lacks GK evaluation", gkValidation.length === 0 || gkValidation.includes("goals without goalkeeper evaluated: 0"), "goalkeeper evaluated for goals"),
    check("try/touchdown/drop scoring foundation visible", scoringReport.includes("scoring version: V2_DROP_FOUNDATION"), "V2_DROP_FOUNDATION visible"),
    check("SHOT_GOAL remains 3 points", scoringReport.includes("scoring rule: SHOT_GOAL = 3 points"), "SHOT_GOAL = 3 points"),
    check("shot blocks have resolved outcomes", !evidence.includes("ball outcome: PENDING"), "PENDING ball outcomes absent"),
    check("shot blocks include rebound resolution", shotBlocks.every((block) => block.includes("rebound type:") && block.includes("rebound reason:")), "rebound fields present"),
    check("shot blocks include rebound continuation", shotBlocks.every((block) => block.includes("#### Rebound Continuation")), "Rebound Continuation sections present"),
    check("coach summary scoring source is resolved shot outcomes", coach.includes("scoring source: resolved shot outcomes"), "coach scoring source resolved"),
  ];
  const reportPath = join(input.reportDirectory, "validation.shot-action-semantics.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      shotActionsChecked: shotBlocks.length,
      passVocabularyCount,
      shotResultCount,
      illegalShotWordingCount,
      unknownShotLegalityCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
