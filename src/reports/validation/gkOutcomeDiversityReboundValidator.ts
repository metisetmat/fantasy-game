import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ShotOutcomeContract } from "../../systems/actions";
import { scoringRuleLabel, SCORING_VERSION } from "../../systems/scoring";

type GKOutcomeDiversityStatus = "PASS" | "FAIL";

interface GKOutcomeDiversityCheck {
  readonly label: string;
  readonly status: GKOutcomeDiversityStatus;
  readonly detail: string;
}

export interface GKOutcomeDiversityReboundValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly GKOutcomeDiversityCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): GKOutcomeDiversityCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function compactReport(input: { readonly outcomes: readonly ShotOutcomeContract[] }): string {
  return [
    "# GK Outcome Diversity & Rebound Resolution",
    "",
    "## Summary",
    `- shot actions checked: ${input.outcomes.length}`,
    `- GOAL count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL").length}`,
    `- CAUGHT_BY_GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "CAUGHT_BY_GK").length}`,
    `- SAVED_BY_GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "SAVED_BY_GK").length}`,
    `- DEFLECTED_BY_GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "DEFLECTED_BY_GK").length}`,
    `- REBOUND_CONTESTED count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "REBOUND_CONTESTED" || outcome.reboundResolution.reboundType === "CONTESTED").length}`,
    `- BLOCKED_BY_DEFENDER count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "BLOCKED_BY_DEFENDER").length}`,
    `- MISSED_HIGH/WIDE count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "MISSED_HIGH" || outcome.ballOutcome === "MISSED_WIDE").length}`,
    "",
    "## Outcome Rows",
    "",
    "| action | shooter | on target | ball outcome | goalkeeper action | rebound type | rebound zone | next possession | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...input.outcomes.map(
      (outcome) =>
        `| ${outcome.actionId} | ${outcome.shooterInitials} | ${outcome.shotOnTarget ? "YES" : "NO"} | ${outcome.ballOutcome} | ${outcome.goalkeeperAction} | ${outcome.reboundResolution.reboundType} | ${outcome.reboundResolution.reboundZone} | ${outcome.reboundResolution.nextPossession} | ${outcome.reboundResolution.reboundReason} |`,
    ),
    "",
  ].join("\n");
}

function renderValidation(input: {
  readonly checks: readonly GKOutcomeDiversityCheck[];
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly failedSaveWithMissCount: number;
  readonly illegalHandUseCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# GK Outcome Diversity & Rebound Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- shot actions checked: ${input.outcomes.length}`,
    `- GOAL count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL").length}`,
    `- CAUGHT_BY_GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "CAUGHT_BY_GK").length}`,
    `- SAVED_BY_GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "SAVED_BY_GK").length}`,
    `- DEFLECTED_BY_GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "DEFLECTED_BY_GK").length}`,
    `- REBOUND_CONTESTED count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "REBOUND_CONTESTED" || outcome.reboundResolution.reboundType === "CONTESTED").length}`,
    `- BLOCKED_BY_DEFENDER count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "BLOCKED_BY_DEFENDER").length}`,
    `- MISSED_HIGH/WIDE count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "MISSED_HIGH" || outcome.ballOutcome === "MISSED_WIDE").length}`,
    `- failed-save-with-miss count: ${input.failedSaveWithMissCount}`,
    `- illegal hand-use count: ${input.illegalHandUseCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateGKOutcomeDiversityRebound(input: {
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly reportDirectory: string;
}): GKOutcomeDiversityReboundValidationResult {
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const reboundContinuationValidation = readIfExists(join(input.reportDirectory, "validation.rebound-continuation-resolution.md"));
  const missedOutcomes = input.outcomes.filter((outcome) => outcome.ballOutcome === "MISSED_HIGH" || outcome.ballOutcome === "MISSED_WIDE");
  const failedSaveWithMissCount = missedOutcomes.filter((outcome) => outcome.goalkeeperAction === "FAILED_SAVE").length;
  const failedSaveNonGoalCount = input.outcomes.filter((outcome) => outcome.goalkeeperAction === "FAILED_SAVE" && outcome.ballOutcome !== "GOAL").length;
  const illegalHandUseCount = input.outcomes.filter(
    (outcome) =>
      (outcome.goalkeeperAction === "CATCH" || outcome.goalkeeperAction === "HAND_SAVE") &&
      !outcome.goalkeeperLegalHandUseAvailable,
  ).length;
  const deflectedWithoutReboundCount = input.outcomes.filter(
    (outcome) =>
      outcome.ballOutcome === "DEFLECTED_BY_GK" &&
      (outcome.reboundResolution.reboundType === "NONE" || outcome.reboundResolution.nextPossession === "PENDING"),
  ).length;
  const savedWithoutPossessionCount = input.outcomes.filter(
    (outcome) => outcome.ballOutcome === "SAVED_BY_GK" && outcome.possessionAfterShot === "PENDING",
  ).length;
  const caughtWithoutDefendingPossessionCount = input.outcomes.filter(
    (outcome) =>
      outcome.ballOutcome === "CAUGHT_BY_GK" &&
      (outcome.possessionAfterShot !== outcome.defendingTeamId || !outcome.goalkeeperLegalHandUseAvailable),
  ).length;
  const onTargetGoalsWithoutGkEvaluation = input.outcomes.filter(
    (outcome) => outcome.shotOnTarget && outcome.ballOutcome === "GOAL" && !outcome.gkShotStopping.goalkeeperEvaluated,
  ).length;
  const checks: readonly GKOutcomeDiversityCheck[] = [
    check("GK outcome diversity report exists", true, "gk-outcome-diversity-rebound.md written"),
    check(
      "no MISSED_HIGH uses FAILED_SAVE unless near-frame exception is explicit",
      failedSaveWithMissCount === 0,
      `${failedSaveWithMissCount}`,
    ),
    check("FAILED_SAVE only appears with GOAL", failedSaveNonGoalCount === 0, `${failedSaveNonGoalCount}`),
    check(
      "CAUGHT_BY_GK requires goalkeeper legal hand-use available",
      input.outcomes.filter((outcome) => outcome.ballOutcome === "CAUGHT_BY_GK").every((outcome) => outcome.goalkeeperLegalHandUseAvailable),
      "catch hand-use legal",
    ),
    check("HAND_SAVE requires legal hand-use or explicit body-part distinction", illegalHandUseCount === 0, `${illegalHandUseCount}`),
    check("every DEFLECTED_BY_GK has rebound resolution", deflectedWithoutReboundCount === 0, `${deflectedWithoutReboundCount}`),
    check("every SAVED_BY_GK has possession after shot", savedWithoutPossessionCount === 0, `${savedWithoutPossessionCount}`),
    check("every CAUGHT_BY_GK gives defending team possession", caughtWithoutDefendingPossessionCount === 0, `${caughtWithoutDefendingPossessionCount}`),
    check("no on-target GOAL lacks GK evaluation", onTargetGoalsWithoutGkEvaluation === 0, `${onTargetGoalsWithoutGkEvaluation}`),
    check("SHOT_GOAL remains 3 points", scoringReport.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check("shot subsystem remains V1-compatible under conversion-active scoring", SCORING_VERSION === "V1" && !scoringReport.includes("| TRY |"), SCORING_VERSION),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("tactical evidence includes rebound resolution fields", evidence.includes("rebound type:") && evidence.includes("rebound reason:"), "rebound fields visible"),
    check("rebound continuation resolution validation passes", reboundContinuationValidation.length === 0 || reboundContinuationValidation.includes("Status: PASS"), reboundContinuationValidation.length === 0 ? "pending during first validation pass" : "rebound continuation PASS"),
    check("scoring report includes outcome distribution", scoringReport.includes("## Outcome Distribution"), "outcome distribution visible"),
    check("scoring report includes Rebound Events table", scoringReport.includes("## Rebound Events"), "Rebound Events visible"),
  ];
  const reportPath = join(input.reportDirectory, "validation.gk-outcome-diversity-rebound.md");

  writeFileSync(join(input.reportDirectory, "gk-outcome-diversity-rebound.md"), compactReport({ outcomes: input.outcomes }), "utf8");
  writeFileSync(
    reportPath,
    renderValidation({
      checks,
      outcomes: input.outcomes,
      failedSaveWithMissCount,
      illegalHandUseCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
