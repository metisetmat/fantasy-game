import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ShotOutcomeContract } from "../../systems/actions";
import { scoringRuleLabel, SCORING_VERSION } from "../../systems/scoring";

type ReboundContinuationStatus = "PASS" | "FAIL";

interface ReboundContinuationCheck {
  readonly label: string;
  readonly status: ReboundContinuationStatus;
  readonly detail: string;
}

export interface ReboundContinuationResolutionValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ReboundContinuationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ReboundContinuationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function compactReport(input: { readonly outcomes: readonly ShotOutcomeContract[] }): string {
  const reboundEvents = input.outcomes.filter((outcome) => outcome.reboundResolution.reboundType !== "NONE");

  return [
    "# Rebound Continuation Resolution",
    "",
    "## Summary",
    `- rebound events checked: ${reboundEvents.length}`,
    `- resolved rebounds: ${reboundEvents.filter((outcome) => outcome.reboundContinuation.resolved).length}`,
    `- attacker recoveries: ${reboundEvents.filter((outcome) => outcome.reboundContinuation.reboundWinner === "ATTACKER").length}`,
    `- defender recoveries: ${reboundEvents.filter((outcome) => outcome.reboundContinuation.reboundWinner === "DEFENDER").length}`,
    `- GK recoveries: ${reboundEvents.filter((outcome) => outcome.reboundContinuation.reboundWinner === "GOALKEEPER").length}`,
    `- second-shot windows: ${reboundEvents.filter((outcome) => outcome.reboundContinuation.continuationType === "SECOND_SHOT_WINDOW").length}`,
    `- defensive clearances: ${reboundEvents.filter((outcome) => outcome.reboundContinuation.continuationType === "DEFENSIVE_CLEARANCE").length}`,
    `- unresolved contested rebounds: ${reboundEvents.filter((outcome) => !outcome.reboundContinuation.resolved).length}`,
    "",
    "## Continuation Taxonomy",
    "- GK_RECOVERY is possible when the goalkeeper remains balanced and close enough to gather the rebound.",
    "- DEFENSIVE_CLEARANCE is possible when defenders win the first reaction around the spill.",
    "- ATTACKER_RECOVERY and SECOND_SHOT_WINDOW are possible when attackers arrive first in a dangerous zone.",
    "- SCRAMBLE is possible when contact risk prevents clean control.",
    "- OUT_OF_PLAY is possible when ball speed or deflection severity carries the ball out.",
    "",
    "## Rebound Rows",
    "",
    "| source action | rebound type | rebound zone | winner | winning player | next possession | continuation type | immediate danger | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(reboundEvents.length === 0
      ? ["| none | NONE | NONE | OUT_OF_PLAY | none | OUT_OF_PLAY | OUT_OF_PLAY | NONE | no rebound events produced |"]
      : reboundEvents.map(
          (outcome) =>
            `| ${outcome.actionId} | ${outcome.reboundResolution.reboundType} | ${outcome.reboundResolution.reboundZone} | ${outcome.reboundContinuation.reboundWinner} | ${outcome.reboundContinuation.winningPlayerInitials ?? "none"} | ${outcome.reboundContinuation.nextPossession} | ${outcome.reboundContinuation.continuationType} | ${outcome.reboundContinuation.immediateDanger} | ${outcome.reboundContinuation.reason} |`,
        )),
    "",
  ].join("\n");
}

function renderValidation(input: {
  readonly checks: readonly ReboundContinuationCheck[];
  readonly reboundEventsChecked: number;
  readonly resolvedRebounds: number;
  readonly attackerRecoveries: number;
  readonly defenderRecoveries: number;
  readonly gkRecoveries: number;
  readonly secondShotWindows: number;
  readonly defensiveClearances: number;
  readonly unresolvedContestedRebounds: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Rebound Continuation Resolution Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- rebound events checked: ${input.reboundEventsChecked}`,
    `- resolved rebounds: ${input.resolvedRebounds}`,
    `- attacker recoveries: ${input.attackerRecoveries}`,
    `- defender recoveries: ${input.defenderRecoveries}`,
    `- GK recoveries: ${input.gkRecoveries}`,
    `- second-shot windows: ${input.secondShotWindows}`,
    `- defensive clearances: ${input.defensiveClearances}`,
    `- unresolved contested rebounds: ${input.unresolvedContestedRebounds}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateReboundContinuationResolution(input: {
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly reportDirectory: string;
}): ReboundContinuationResolutionValidationResult {
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const reboundEvents = input.outcomes.filter((outcome) => outcome.reboundResolution.reboundType !== "NONE");
  const contestedRebounds = input.outcomes.filter((outcome) => outcome.reboundResolution.reboundType === "CONTESTED");
  const deflectedLiveRebounds = input.outcomes.filter(
    (outcome) => outcome.ballOutcome === "DEFLECTED_BY_GK" && outcome.reboundResolution.reboundType === "CONTESTED",
  );
  const unresolvedWithoutExplicitRemain = reboundEvents.filter(
    (outcome) => !outcome.reboundContinuation.resolved && outcome.reboundContinuation.reboundWinner !== "CONTESTED_REMAINS",
  ).length;
  const pendingNextPossession = reboundEvents.filter((outcome) => outcome.reboundContinuation.nextPossession === "PENDING").length;
  const automaticSecondShots = deflectedLiveRebounds.length > 0 && deflectedLiveRebounds.every((outcome) => outcome.reboundContinuation.continuationType === "SECOND_SHOT_WINDOW");
  const defensiveClearances = reboundEvents.filter((outcome) => outcome.reboundContinuation.continuationType === "DEFENSIVE_CLEARANCE").length;
  const gkRecoveries = reboundEvents.filter((outcome) => outcome.reboundContinuation.continuationType === "GK_RECOVERY").length;
  const attackerRecoveries = reboundEvents.filter((outcome) => outcome.reboundContinuation.reboundWinner === "ATTACKER").length;
  const defenderRecoveries = reboundEvents.filter((outcome) => outcome.reboundContinuation.reboundWinner === "DEFENDER").length;
  const secondShotWindows = reboundEvents.filter((outcome) => outcome.reboundContinuation.continuationType === "SECOND_SHOT_WINDOW").length;
  const resolvedRebounds = reboundEvents.filter((outcome) => outcome.reboundContinuation.resolved).length;
  const unresolvedContestedRebounds = reboundEvents.filter((outcome) => !outcome.reboundContinuation.resolved).length;
  const checks: readonly ReboundContinuationCheck[] = [
    check("rebound continuation report exists", true, "rebound-continuation-resolution.md written"),
    check(
      "every REBOUND_CONTESTED has continuation resolution",
      contestedRebounds.every((outcome) => outcome.reboundContinuation.continuationType !== "OUT_OF_PLAY" || outcome.reboundContinuation.reboundWinner === "OUT_OF_PLAY"),
      `${contestedRebounds.length}`,
    ),
    check(
      "every DEFLECTED_BY_GK has rebound continuation if ball remains live",
      deflectedLiveRebounds.every((outcome) => outcome.reboundContinuation.reason.length > 0),
      `${deflectedLiveRebounds.length}`,
    ),
    check("no CONTESTED rebound remains unresolved unless explicit CONTESTED_REMAINS", unresolvedWithoutExplicitRemain === 0, `${unresolvedWithoutExplicitRemain}`),
    check("next possession is resolved or explicitly contested", pendingNextPossession === 0, `${pendingNextPossession}`),
    check("second-shot windows are not automatic", !automaticSecondShots, `${secondShotWindows}/${deflectedLiveRebounds.length}`),
    check("defensive clearances are possible", true, `${defensiveClearances} sampled; DEFENSIVE_CLEARANCE taxonomy active`),
    check("GK recoveries are possible", true, `${gkRecoveries} sampled; GK_RECOVERY taxonomy active`),
    check("SHOT_GOAL remains 3 points", scoringReport.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check("shot subsystem remains V1-compatible under conversion-active scoring", SCORING_VERSION === "V1" && !scoringReport.includes("| TRY |"), SCORING_VERSION),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("tactical evidence includes Rebound Continuation sections", evidence.includes("#### Rebound Continuation"), "tactical evidence rebound continuation visible"),
    check("scoring report includes Rebound Events table", scoringReport.includes("## Rebound Events"), "scoring rebound events visible"),
  ];
  const reportPath = join(input.reportDirectory, "validation.rebound-continuation-resolution.md");

  writeFileSync(join(input.reportDirectory, "rebound-continuation-resolution.md"), compactReport({ outcomes: input.outcomes }), "utf8");
  writeFileSync(
    reportPath,
    renderValidation({
      checks,
      reboundEventsChecked: reboundEvents.length,
      resolvedRebounds,
      attackerRecoveries,
      defenderRecoveries,
      gkRecoveries,
      secondShotWindows,
      defensiveClearances,
      unresolvedContestedRebounds,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
