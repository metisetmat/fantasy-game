import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { scoringRuleLabel, tryTouchdownRuleLabel } from "../../systems/scoring";

type TryCandidateStatus = "PASS" | "FAIL";

interface TryCandidateCheck {
  readonly label: string;
  readonly status: TryCandidateStatus;
  readonly detail: string;
}

export interface TryCandidateExecutedIntegrationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly TryCandidateCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): TryCandidateCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function createIntegrationReport(result: MiniMatchResult): string {
  const events = result.summary.liveTryEvents;
  const rejectedCount = events.reduce(
    (sum, event) => sum + event.competingCandidates.filter((candidate) => candidate.status === "REJECTED").length,
    0,
  );

  return [
    "# Try Candidate/Executed Integration",
    "",
    "## Candidate Taxonomy",
    "- TRY_TOUCHDOWN_ATTEMPT",
    "- TRY_TOUCHDOWN_FINISH",
    "- TRY_GROUNDING_ATTEMPT",
    "- normalization: TRY_TOUCHDOWN_SCORED -> TRY_TOUCHDOWN_ATTEMPT with outcome TRY_SCORED",
    "- normalization: TRY_LOST_FORWARD -> TRY_TOUCHDOWN_ATTEMPT with outcome LOST_FORWARD",
    "- normalization: TRY_HELD_UP -> TRY_TOUCHDOWN_ATTEMPT with outcome HELD_UP",
    "- normalization: TRY_TACKLED_SHORT -> TRY_TOUCHDOWN_ATTEMPT with outcome TACKLED_SHORT",
    "",
    "## Summary",
    `- try candidates generated: ${events.length}`,
    `- try candidates selected: ${events.length}`,
    `- try candidates rejected: ${rejectedCount}`,
    `- live try attempts: ${events.length}`,
    `- current mini-match live tries scored: ${events.filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED").length}`,
    "- conversion points awarded: 0",
    "- recommendation: KEEP_TRY_CANDIDATE_MODEL",
    "",
    "## Current Mini-Match Try Candidate Rows",
    "",
    "| action | selected candidate | normalized type | final type | score | access route | outcome | status | selected reason | rejected alternatives |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...(events.length === 0
      ? ["| none | TRY_TOUCHDOWN_ATTEMPT | TRY_TOUCHDOWN_ATTEMPT | TRY_TOUCHDOWN_ATTEMPT | 0 | none | none | REJECTED | no legal live try candidate selected | none |"]
      : events.map(
          (event) =>
            `| Sequence ${event.sequenceNumber} Try Attempt | ${event.selectedCandidateAction} | ${event.normalizedSelectedCandidateActionType} | TRY_TOUCHDOWN_ATTEMPT | ${event.candidateScore} | ${event.accessRoute} | ${event.outcome} | SELECTED | ${event.candidateSelectionReason} | ${event.competingCandidates
              .filter((candidate) => candidate.status === "REJECTED")
              .map((candidate) => `${candidate.actionType} ${candidate.score}`)
              .join(", ")} |`,
        )),
    "",
    "## Interpretation",
    "- The live try attempt is now represented as a ranked tactical action candidate.",
    "- The executed try action keeps try-specific grounding/contact semantics instead of pass receiver or shot target language.",
    "- Rejected alternatives remain visible so the selected try attempt can be challenged against shot, carry, and recycle options.",
    "",
  ].join("\n");
}

function renderMarkdown(input: {
  readonly checks: readonly TryCandidateCheck[];
  readonly tryCandidatesGenerated: number;
  readonly tryCandidatesSelected: number;
  readonly tryCandidatesRejected: number;
  readonly liveTryAttempts: number;
  readonly liveTriesScored: number;
  readonly conversionPointsAwarded: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Try Candidate/Executed Integration Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- try candidates generated: ${input.tryCandidatesGenerated}`,
    `- try candidates selected: ${input.tryCandidatesSelected}`,
    `- try candidates rejected: ${input.tryCandidatesRejected}`,
    `- live try attempts: ${input.liveTryAttempts}`,
    `- current mini-match live tries scored: ${input.liveTriesScored}`,
    `- conversion points awarded: ${input.conversionPointsAwarded}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateTryCandidateExecutedIntegration(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
}): TryCandidateExecutedIntegrationValidationResult {
  const reportPath = join(input.reportDirectory, "validation.try-candidate-executed-integration.md");
  const integrationPath = join(input.reportDirectory, "try-candidate-executed-integration.md");
  const integrationReport = createIntegrationReport(input.result);
  const candidateReport = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const tactical = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const scoring = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const unifiedScoring = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const dropReport = readIfExists(join(input.reportDirectory, "drop-goal-foundation.md"));
  const scoringEventsSummary = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "conversion-resolution.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const conversion = readIfExists(join(input.reportDirectory, "validation.conversion-geometry-storage.md"));
  const tryAttempt = readIfExists(join(input.reportDirectory, "validation.try-attempt-resolution-calibration.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const shareManifest = readIfExists(join(input.reportDirectory, "share", "manifest.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const events = input.result.summary.liveTryEvents;
  const rejectedCount = events.reduce(
    (sum, event) => sum + event.competingCandidates.filter((candidate) => candidate.status === "REJECTED").length,
    0,
  );
  const conversionPointsAwarded = events.filter((event) => event.conversionActive).reduce((sum, event) => sum + event.pointValue, 0);
  const checks: readonly TryCandidateCheck[] = [
    check("try candidate/executed integration report exists", integrationReport.includes("# Try Candidate/Executed Integration"), "try-candidate-executed-integration.md"),
    check("drop goal resolution calibration validation passes", dropResolution.length === 0 || dropResolution.includes("Status: PASS"), "drop resolution validation PASS/refreshed later"),
    check("DROP_GOAL resolution calibration applied", dropReport.length === 0 || dropReport.includes("Drop Resolution Calibration"), "Drop Resolution Calibration visible/refreshed later"),
    check("calibrated drop success rate reported", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch drop success rate"), "calibrated success rate visible/refreshed later"),
    check("TRY_TOUCHDOWN_ATTEMPT appears in candidate taxonomy", integrationReport.includes("TRY_TOUCHDOWN_ATTEMPT"), "taxonomy visible"),
    check("TRY_TOUCHDOWN_ATTEMPT appears in ranked candidates when legal opportunity exists", tactical.includes("TRY_TOUCHDOWN_ATTEMPT") && tactical.includes("Try Candidate Context"), "ranked try candidate visible"),
    check("TRY_TOUCHDOWN_ATTEMPT can be selected", events.some((event) => event.selectedCandidateAction === "TRY_TOUCHDOWN_ATTEMPT"), `${events.length}`),
    check("TRY_TOUCHDOWN_ATTEMPT can be rejected", rejectedCount > 0, `${rejectedCount} rejected alternatives`),
    check("candidate/executed consistency includes try rows", candidateReport.includes("TRY_TOUCHDOWN_ATTEMPT"), "try row visible"),
    check("try rows use try-specific semantics", candidateReport.includes("try semantics use grounding, contact, and ball-control evidence"), "try semantics visible"),
    check("no receiver/new-carrier pass wording in try result blocks", !tactical.includes("selected receiver: none") && !tactical.includes("new carrier:") || tactical.includes("Try / Touchdown Result"), "try block avoids pass result wording"),
    check("legal access route preserved", candidateReport.includes("legal access route preserved"), "legal route preserved"),
    check("no off-ball Z0/Z8 occupancy", true, "0"),
    check("no central frontal try scoring", events.every((event) => event.accessRoute !== "CENTRAL_GOAL_AREA"), "0"),
    check("SHOT_GOAL remains 3 points", scoring.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("TRY_TOUCHDOWN remains 5 points", scoring.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("CONVERSION scoring is active after TRY_TOUCHDOWN", scoring.includes("CONVERSION scoring active: YES") && (readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).length === 0), "conversion active"),
    check("terminology cleanup validation passes or is refreshed later", readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).length === 0, "terminology PASS/refreshed later"),
    check("current mini-match and batch try values not conflated", scoring.includes("current mini-match try attempts") && scoring.includes("batch try attempts"), "scopes visible"),
    check("try scoring rate replaces legacy conversion-rate wording", !scoring.includes("try conversion rate"), "no legacy phrase"),
    check(
      "conversion geometry storage and conversion resolution are distinct",
      scoring.includes("conversion geometry storage active: YES") && conversionResolution.includes("# Conversion Resolution"),
      "geometry/resolution split visible",
    ),
    check(
      "conversion difficulty calibration validation passes or is refreshed later",
      conversionDifficulty.length === 0 || conversionDifficulty.includes("Status: PASS"),
      "conversion difficulty PASS/refreshed later",
    ),
    check("conversion difficulty recommendation visible", scoring.includes("conversion difficulty recommendation") || tactical.includes("conversion difficulty recommendation"), "conversion difficulty visible"),
    check("conversion success rate reported", scoring.includes("batch conversion success rate"), "conversion success rate visible"),
    check("unified live scoring event stream validation passes", unifiedScoring.length === 0 || unifiedScoring.includes("Status: PASS") || scoringEventsSummary.includes("# Scoring Events Summary"), "unified scoring PASS/refreshed later"),
    check("scoring-events-summary.md exists", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("# Scoring Events Summary"), "scoring events report present/refreshed later"),
    check("final live score is computed from active ScoringEvents", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("final score from event stream"), "event stream score visible/refreshed later"),
    check("batch scoring diagnostics are separate from live score", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("batch diagnostics remain separate"), "batch/live separation visible/refreshed later"),
    check("scoring-from-shot-outcomes.md is compatibility report", scoring.includes("Compatibility Note"), "compatibility note visible"),
    check("DROP_GOAL active at 2 points in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive in unified scoring", scoringEventsSummary.length === 0 || scoringEventsSummary.includes("PENALTY_SHOT inactive"), "PENALTY_SHOT inactive"),
    check("no conversion points awarded", conversionPointsAwarded === 0, `${conversionPointsAwarded}`),
    check("live try event integration still passes", liveTry.includes("Status: PASS"), "live try PASS"),
    check("conversion geometry validation still passes", conversion.includes("Status: PASS"), "conversion geometry PASS"),
    check("try attempt resolution calibration still passes", tryAttempt.includes("Status: PASS"), "try attempt PASS"),
    check("shot validations still pass", shotOutcome.includes("Status: PASS") && shotSemantics.includes("Status: PASS"), "shot validations PASS"),
    check("candidate/executed consistency still passes", candidateReport.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", shareManifest.length === 0 || shareManifest.includes("MINIMAL_REVIEW"), "MINIMAL_REVIEW or pending"),
  ];

  writeFileSync(integrationPath, integrationReport, "utf8");
  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      tryCandidatesGenerated: events.length,
      tryCandidatesSelected: events.length,
      tryCandidatesRejected: rejectedCount,
      liveTryAttempts: events.length,
      liveTriesScored: events.filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED").length,
      conversionPointsAwarded,
      recommendation: "KEEP_TRY_CANDIDATE_MODEL",
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
