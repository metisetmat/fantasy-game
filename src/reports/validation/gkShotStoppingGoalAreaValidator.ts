import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { LateralCorridor } from "../../core/zones";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import { scoringRuleLabel, SCORING_VERSION } from "../../systems/scoring";
import { goalAreaForTeam, validateGoalkeeperHandRules } from "../../systems/rules";
import type { SnapshotReference } from "../visualization";

type GKValidationStatus = "PASS" | "FAIL";

interface GKValidationCheck {
  readonly label: string;
  readonly status: GKValidationStatus;
  readonly detail: string;
}

export interface GKShotStoppingGoalAreaValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly GKValidationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): GKValidationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function compactGKReport(input: {
  readonly result: MiniMatchResult;
  readonly outcomes: readonly ShotOutcomeContract[];
}): string {
  return [
    "# GK Shot-Stopping & Goal-Area Rules",
    "",
    "## Goal-Area Rule Summary",
    `- CONTROL defensive goal area: ${goalAreaForTeam(input.result.state.context.teamA.id).goalAreaZones.join(", ")}`,
    `- BLITZ defensive goal area: ${goalAreaForTeam(input.result.state.context.teamB.id).goalAreaZones.join(", ")}`,
    "- hand-use rule: only the defending goalkeeper can deliberately catch/handle with hands inside their own goal area.",
    "- outfield rule: outfield players may block with body/feet but cannot catch with hands in the goal area.",
    "",
    "## Shot-Stopping Summary",
    `- shot actions checked: ${input.outcomes.length}`,
    `- on-target shots: ${input.outcomes.filter((outcome) => outcome.shotOnTarget).length}`,
    `- goalkeeper evaluated count: ${input.outcomes.filter((outcome) => outcome.gkShotStopping.goalkeeperEvaluated).length}`,
    `- goalkeeper involved count: ${input.outcomes.filter((outcome) => outcome.gkShotStopping.goalkeeperInvolved).length}`,
    `- goals with goalkeeper evaluated: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL" && outcome.gkShotStopping.goalkeeperEvaluated).length}`,
    `- goals without goalkeeper evaluated: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL" && !outcome.gkShotStopping.goalkeeperEvaluated).length}`,
    `- caught by GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "CAUGHT_BY_GK").length}`,
    `- saved by GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "SAVED_BY_GK").length}`,
    `- deflected by GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "DEFLECTED_BY_GK").length}`,
    `- blocked by defender count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "BLOCKED_BY_DEFENDER").length}`,
    `- missed wide/high count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "MISSED_WIDE" || outcome.ballOutcome === "MISSED_HIGH").length}`,
    "",
    "## Shot Rows",
    "",
    "| action | shooter | goalkeeper | on target | goalkeeper evaluated | goalkeeper action | ball outcome | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...input.outcomes.map(
      (outcome) =>
        `| ${outcome.actionId} | ${outcome.shooterInitials} | ${outcome.goalkeeperInitials}@${outcome.goalkeeperZone} | ${outcome.shotOnTarget ? "YES" : "NO"} | ${outcome.gkShotStopping.goalkeeperEvaluated ? "YES" : "NO"} | ${outcome.goalkeeperAction} | ${outcome.ballOutcome} | ${outcome.gkShotStopping.gkOutcomeReason} |`,
    ),
    "",
  ].join("\n");
}

function renderValidation(input: {
  readonly checks: readonly GKValidationCheck[];
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly illegalHandUseCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# GK Shot-Stopping & Goal-Area Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- shot actions checked: ${input.outcomes.length}`,
    `- on-target shots: ${input.outcomes.filter((outcome) => outcome.shotOnTarget).length}`,
    `- goalkeeper evaluated count: ${input.outcomes.filter((outcome) => outcome.gkShotStopping.goalkeeperEvaluated).length}`,
    `- goalkeeper involved count: ${input.outcomes.filter((outcome) => outcome.gkShotStopping.goalkeeperInvolved).length}`,
    `- goals with goalkeeper evaluated: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL" && outcome.gkShotStopping.goalkeeperEvaluated).length}`,
    `- goals without goalkeeper evaluated: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL" && !outcome.gkShotStopping.goalkeeperEvaluated).length}`,
    `- caught by GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "CAUGHT_BY_GK").length}`,
    `- saved by GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "SAVED_BY_GK").length}`,
    `- deflected by GK count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "DEFLECTED_BY_GK").length}`,
    `- blocked by defender count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "BLOCKED_BY_DEFENDER").length}`,
    `- missed wide/high count: ${input.outcomes.filter((outcome) => outcome.ballOutcome === "MISSED_WIDE" || outcome.ballOutcome === "MISSED_HIGH").length}`,
    `- illegal hand-use count: ${input.illegalHandUseCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateGKShotStoppingGoalArea(input: {
  readonly result: MiniMatchResult;
  readonly snapshots: readonly SnapshotReference[];
  readonly outcomes: readonly ShotOutcomeContract[];
  readonly reportDirectory: string;
}): GKShotStoppingGoalAreaValidationResult {
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const multiAction = readIfExists(join(input.reportDirectory, "multi-action-semantic-generalization.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const players = input.snapshots[0]?.beforeMetadata.playerStates ?? [];
  const controlGoalArea = goalAreaForTeam(input.result.state.context.teamA.id).goalAreaZones.find((zone) => zone.endsWith(`-${LateralCorridor.CentralAxis}`)) ?? goalAreaForTeam(input.result.state.context.teamA.id).defensiveGoalZone;
  const blitzGoalArea = goalAreaForTeam(input.result.state.context.teamB.id).goalAreaZones.find((zone) => zone.endsWith(`-${LateralCorridor.CentralAxis}`)) ?? goalAreaForTeam(input.result.state.context.teamB.id).defensiveGoalZone;
  const controlRules = validateGoalkeeperHandRules({ teamId: input.result.state.context.teamA.id, goalAreaZone: controlGoalArea, players });
  const blitzRules = validateGoalkeeperHandRules({ teamId: input.result.state.context.teamB.id, goalAreaZone: blitzGoalArea, players });
  const illegalHandUseCount = controlRules.illegalHandUseCount + blitzRules.illegalHandUseCount;
  const onTargetShots = input.outcomes.filter((outcome) => outcome.shotOnTarget);
  const goals = input.outcomes.filter((outcome) => outcome.ballOutcome === "GOAL");
  const goalsWithoutGkEvaluation = goals.filter((outcome) => !outcome.gkShotStopping.goalkeeperEvaluated).length;
  const expandedOutcomeCount = input.outcomes.filter((outcome) =>
    ["MISSED_WIDE", "MISSED_HIGH", "SAVED_BY_GK", "CAUGHT_BY_GK", "DEFLECTED_BY_GK", "BLOCKED_BY_DEFENDER", "REBOUND_CONTESTED"].includes(outcome.ballOutcome),
  ).length;
  const checks: readonly GKValidationCheck[] = [
    check("goal area rules exist", goalAreaForTeam(input.result.state.context.teamA.id).goalAreaZones.length > 0, "goal areas mapped"),
    check("goalkeeper rules exist", controlRules.valid && blitzRules.valid, "goalkeeper hand rules validate"),
    check("only goalkeeper can use hands in own goal area", controlRules.valid && blitzRules.valid, "GK-only hand privilege"),
    check("outfield players cannot catch/handle in goal area", illegalHandUseCount === 0, `${illegalHandUseCount}`),
    check("every on-target SHOT evaluates defending goalkeeper", onTargetShots.every((outcome) => outcome.gkShotStopping.goalkeeperEvaluated), `${onTargetShots.length}`),
    check("no on-target GOAL occurs without goalkeeper evaluation", goalsWithoutGkEvaluation === 0, `${goalsWithoutGkEvaluation}`),
    check("no shot block says goalkeeper involved: none modelled", !evidence.includes("goalkeeper involved: none modelled"), "legacy wording absent"),
    check("shot outcomes include expanded taxonomy", expandedOutcomeCount > 0, `${expandedOutcomeCount}`),
    check("scoring still uses SHOT_GOAL = 3 points", scoringReport.includes(`scoring rule: ${scoringRuleLabel("SHOT_GOAL")}`), scoringRuleLabel("SHOT_GOAL")),
    check("score unit remains POINTS", scoringReport.includes("score unit: POINTS"), "POINTS"),
    check("shot subsystem remains V1-compatible under conversion-active scoring", SCORING_VERSION === "V1" && !scoringReport.includes("| TRY |"), "V1-compatible shot subsystem"),
    check("scoring report includes goalkeeper action", scoringReport.includes("Goalkeeper action") || scoringReport.includes("goalkeeper action"), "goalkeeper action visible"),
    check("tactical evidence shot blocks include Goalkeeper Context", evidence.includes("#### Goalkeeper Context"), "Goalkeeper Context present"),
    check("coach summary includes goalkeeper model line", coach.includes("goalkeeper model:"), "coach GK line present"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("multi-action semantic validation still passes", multiAction.includes("Status: PASS"), "multi-action PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("coach summary remains below 120 lines", coach.split("\n").length < 120, `${coach.split("\n").length}`),
  ];
  const reportPath = join(input.reportDirectory, "validation.gk-shot-stopping-goal-area.md");

  writeFileSync(join(input.reportDirectory, "gk-shot-stopping-goal-area.md"), compactGKReport({ result: input.result, outcomes: input.outcomes }), "utf8");
  writeFileSync(reportPath, renderValidation({ checks, outcomes: input.outcomes, illegalHandUseCount }), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
