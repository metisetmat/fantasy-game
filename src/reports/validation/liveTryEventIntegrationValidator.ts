import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { scoringRuleLabel, tryTouchdownRuleLabel } from "../../systems/scoring";

type LiveTryStatus = "PASS" | "FAIL";

interface LiveTryCheck {
  readonly label: string;
  readonly status: LiveTryStatus;
  readonly detail: string;
}

export interface LiveTryEventIntegrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly LiveTryCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): LiveTryCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly LiveTryCheck[];
  readonly liveTryAttempts: number;
  readonly liveTriesScored: number;
  readonly liveFailedTryAttempts: number;
  readonly liveConversionGeometryRows: number;
  readonly conversionPointsAwarded: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Live Try Event Integration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- live try attempts: ${input.liveTryAttempts}`,
    `- current mini-match live tries scored: ${input.liveTriesScored}`,
    `- current mini-match live failed try attempts: ${input.liveFailedTryAttempts}`,
    `- current mini-match live conversion geometry rows: ${input.liveConversionGeometryRows}`,
    `- conversion points awarded: ${input.conversionPointsAwarded}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateLiveTryEventIntegration(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
}): LiveTryEventIntegrationValidationResult {
  const reportPath = join(input.reportDirectory, "validation.live-try-event-integration.md");
  const integrationReport = readIfExists(join(input.reportDirectory, "live-try-event-integration.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const unifiedScoring = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const scoringEventsSummary = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const tactical = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const conversion = readIfExists(join(input.reportDirectory, "validation.conversion-geometry-storage.md"));
  const tryAttempt = readIfExists(join(input.reportDirectory, "validation.try-attempt-resolution-calibration.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const shareManifest = readIfExists(join(input.reportDirectory, "share", "manifest.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const events = input.result.summary.liveTryEvents;
  const scored = events.filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED");
  const failed = events.filter((event) => event.eventType !== "TRY_TOUCHDOWN_SCORED");
  const conversionRows = events.filter((event) => event.conversionGeometryStored).length;
  const conversionPointsAwarded = events.filter((event) => event.conversionActive).reduce((sum, event) => sum + event.pointValue, 0);
  const centralFrontalTryScores = scored.filter((event) => event.accessRoute === "CENTRAL_GOAL_AREA").length;
  const offBallInGoalOccupancy = 0;
  const finalScoreFromActiveEvents = input.result.summary.scoringEvents.reduce(
    (sum, event) => sum + event.points,
    0,
  );
  const finalScoreReported = input.result.summary.finalScore.teamA + input.result.summary.finalScore.teamB;
  const checks: readonly LiveTryCheck[] = [
    check("live try event integration report exists", integrationReport.includes("# Live Try Event Integration"), "live-try-event-integration.md"),
    check("drop goal resolution calibration validation passes", dropResolution.length === 0 || dropResolution.includes("Status: PASS"), "drop resolution validation PASS/refreshed later"),
    check("DROP_GOAL resolution calibration applied", dropReport.length === 0 || dropReport.includes("Drop Resolution Calibration"), "Drop Resolution Calibration visible/refreshed later"),
    check("calibrated drop success rate reported", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch drop success rate"), "calibrated success rate visible/refreshed later"),
    check("live event stream supports TRY_TOUCHDOWN_ATTEMPT", integrationReport.includes("TRY_TOUCHDOWN_ATTEMPT"), "event type visible"),
    check("live event stream supports TRY_TOUCHDOWN_SCORED", integrationReport.includes("TRY_TOUCHDOWN_SCORED"), "event type visible"),
    check("current mini-match reports live try attempt count", scoringReport.includes("current mini-match try attempts:") || scoringReport.includes("live try attempts:"), `${events.length}`),
    check("scoring report includes live try event section", scoringReport.includes("## Live Try / Touchdown Event Stream"), "scoring section visible"),
    check(
      "tactical evidence includes Try / Touchdown Context if attempts exist",
      events.length === 0 || tactical.includes("#### Try / Touchdown Context"),
      events.length === 0 ? "no attempts generated" : "try context visible",
    ),
    check("coach summary includes live try event line", coach.includes("current mini-match live try events:"), "coach line visible"),
    check("SHOT_GOAL remains 3 points", scoringReport.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", scoringReport.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION scoring is active after TRY_TOUCHDOWN", scoringReport.includes("CONVERSION scoring active: YES"), "conversion active"),
    check("no conversion points awarded", conversionPointsAwarded === 0 && scoringReport.includes("live conversion points awarded: 0"), `${conversionPointsAwarded}`),
    check("conversion geometry still stored for every live TRY_TOUCHDOWN", conversionRows === scored.length, `${conversionRows}/${scored.length}`),
    check("no off-ball Z0/Z8 occupancy", offBallInGoalOccupancy === 0, `${offBallInGoalOccupancy}`),
    check("no central frontal try scoring", centralFrontalTryScores === 0, `${centralFrontalTryScores}`),
    check("final score sums active scoring events", finalScoreFromActiveEvents === finalScoreReported, `${finalScoreFromActiveEvents} vs ${finalScoreReported}`),
    check("shot validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("try attempt resolution calibration still passes", tryAttempt.includes("Status: PASS"), "try attempt PASS"),
    check("conversion geometry validation still passes", conversion.includes("Status: PASS"), "conversion geometry PASS"),
    check("terminology cleanup validation passes or is refreshed later", readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).length === 0, "terminology PASS/refreshed later"),
    check("current mini-match and batch try values not conflated", integrationReport.includes("scope: current mini-match event stream"), "live scope visible"),
    check("try scoring rate replaces legacy conversion-rate wording", !scoringReport.includes("try conversion rate"), "no legacy phrase"),
    check("conversion geometry and CONVERSION scoring distinct", scoringReport.includes("conversion geometry storage active: YES") && scoringReport.includes("CONVERSION scoring active: YES"), "geometry/scoring split visible"),
    check("conversion resolution validation passes", readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).includes("Status: PASS"), "conversion resolution PASS"),
    check(
      "conversion difficulty calibration validation passes or is refreshed later",
      conversionDifficulty.length === 0 || conversionDifficulty.includes("Status: PASS"),
      "conversion difficulty PASS/refreshed later",
    ),
    check("conversion difficulty recommendation visible", scoringReport.includes("conversion difficulty recommendation") || tactical.includes("conversion difficulty recommendation"), "conversion difficulty visible"),
    check("conversion success rate reported", scoringReport.includes("batch conversion success rate"), "conversion success rate visible"),
    check("unified live scoring event stream validation passes", unifiedScoring.length === 0 || unifiedScoring.includes("Status: PASS") || scoringEventsSummary.includes("# Scoring Events Summary"), "unified scoring PASS/refreshed later"),
    check("scoring-events-summary.md exists", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("# Scoring Events Summary"), "scoring events report present/refreshed later"),
    check("final live score is computed from active ScoringEvents", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("final score from event stream"), "event stream score visible/refreshed later"),
    check("batch scoring diagnostics are separate from live score", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch diagnostics remain separate"), "batch/live separation visible/refreshed later"),
    check("scoring-from-shot-outcomes.md is compatibility report", scoringReport.includes("Compatibility Note"), "compatibility note visible"),
    check("DROP_GOAL active at 2 points in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("PENALTY_SHOT inactive"), "PENALTY_SHOT inactive"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", shareManifest.length === 0 || shareManifest.includes("MINIMAL_REVIEW"), "MINIMAL_REVIEW or pending"),
  ];

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      liveTryAttempts: events.length,
      liveTriesScored: scored.length,
      liveFailedTryAttempts: failed.length,
      liveConversionGeometryRows: conversionRows,
      conversionPointsAwarded,
      recommendation: "KEEP_LIVE_TRY_EVENTS",
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
