import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeTryOpportunityGeneration } from "../../systems/actions";
import {
  createConversionGeometryStorageReport,
  formatConversionGeometryLaneCounts,
  scoringRuleLabel,
  summarizeConversionGeometryStorage,
  tryTouchdownRuleLabel,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";

type ConversionGeometryStatus = "PASS" | "FAIL";

interface ConversionGeometryCheck {
  readonly label: string;
  readonly status: ConversionGeometryStatus;
  readonly detail: string;
}

export interface ConversionGeometryStorageValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ConversionGeometryCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ConversionGeometryCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function tokenCount(markdown: string, pattern: RegExp): number {
  return markdown.match(pattern)?.length ?? 0;
}

function renderMarkdown(input: {
  readonly checks: readonly ConversionGeometryCheck[];
  readonly triesScored: number;
  readonly rowsStored: number;
  readonly missingRows: number;
  readonly conversionActiveLeakageCount: number;
  readonly conversionPointsAwarded: number;
  readonly averageAngleDifficulty: number;
  readonly geometryByLane: string;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Conversion Geometry Storage Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- batch TRY_TOUCHDOWN scored: ${input.triesScored}`,
    `- batch conversion geometry rows stored: ${input.rowsStored}`,
    `- batch missing conversion geometry rows: ${input.missingRows}`,
    `- conversion active leakage count: ${input.conversionActiveLeakageCount}`,
    `- conversion points awarded: ${input.conversionPointsAwarded}`,
    `- average conversion angle difficulty: ${input.averageAngleDifficulty}/100`,
    `- conversion geometry by lane: ${input.geometryByLane}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateConversionGeometryStorage(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): ConversionGeometryStorageValidationResult {
  const reportPath = join(input.reportDirectory, "validation.conversion-geometry-storage.md");
  const conversionReportPath = join(input.reportDirectory, "conversion-geometry-storage.md");
  const trySummary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration.matchesSimulated,
    samples: input.batchCalibration.samples.map((sample) => ({
      matchId: sample.matchId,
      seed: sample.seed,
      scenario: sample.scenario,
      totalShots: sample.totalShots,
      reboundEventCount: sample.reboundEventCount,
      contestedReboundCount: sample.contestedReboundCount,
      scrambleReboundCount: sample.scrambleReboundCount,
    })),
  });
  const geometry = summarizeConversionGeometryStorage(trySummary.opportunities);
  const conversionReport = createConversionGeometryStorageReport({ opportunities: trySummary.opportunities });

  writeFileSync(conversionReportPath, conversionReport, "utf8");

  const foundation = readIfExists(join(input.reportDirectory, "try-touchdown-scoring-foundation.md"));
  const batch = readIfExists(join(input.reportDirectory, "try-touchdown-batch-diagnostics.md"));
  const scoring = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const tactical = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const tryAttempt = readIfExists(join(input.reportDirectory, "validation.try-attempt-resolution-calibration.md"));
  const tryOpportunity = readIfExists(join(input.reportDirectory, "validation.try-opportunity-generation.md"));
  const rugby = readIfExists(join(input.reportDirectory, "validation.rugby-style-lateral-in-goal-access.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const shareManifest = readIfExists(join(input.reportDirectory, "share", "manifest.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const combined = [conversionReport, foundation, batch, scoring, coach, tactical].join("\n");
  const activeLeakage = tokenCount(combined, /DROP_GOAL scoring active: YES|PENALTY_SHOT scoring active: YES/g);
  const hasAllGeometryFields = geometry.geometries.every(
    (item) =>
      item.groundingPoint.length > 0 &&
      item.groundingLane.length > 0 &&
      item.conversionLine.length > 0 &&
      item.recommendedConversionPoint.length > 0 &&
      item.conversionAngleDifficulty >= 0 &&
      item.defendingTeamBehindGoalLine,
  );
  const checks: readonly ConversionGeometryCheck[] = [
    check("conversion geometry report exists", conversionReport.includes("# Conversion Geometry Storage"), "conversion-geometry-storage.md generated"),
    check("CONVERSION scoring is active after TRY_TOUCHDOWN", conversionReport.includes("CONVERSION scoring active: YES"), "conversion active"),
    check("TRY_TOUCHDOWN remains 5 points", combined.includes(tryTouchdownRuleLabel()), tryTouchdownRuleLabel()),
    check("SHOT_GOAL remains 3 points", combined.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("every TRY_SCORED has conversion geometry stored", geometry.geometryRowsStored === geometry.tryScoredCount, `${geometry.geometryRowsStored}/${geometry.tryScoredCount}`),
    check("missing conversion geometry rows = 0", geometry.missingGeometryRows === 0, `${geometry.missingGeometryRows}`),
    check("grounding point stored", hasAllGeometryFields && conversionReport.includes("grounding point"), "grounding point visible"),
    check("grounding lane stored", hasAllGeometryFields && conversionReport.includes("grounding lane"), "grounding lane visible"),
    check("conversion line stored", hasAllGeometryFields && conversionReport.includes("conversion line"), "conversion line visible"),
    check("recommended conversion point stored", hasAllGeometryFields && conversionReport.includes("recommended conversion point"), "recommended point visible"),
    check("angle difficulty stored", hasAllGeometryFields && conversionReport.includes("angle difficulty"), "angle difficulty visible"),
    check("defending team behind goal line stored", hasAllGeometryFields && conversionReport.includes("defending team behind goal line"), "defending team setup visible"),
    check("geometry report does not award conversion points", geometry.conversionPointsAwarded === 0 && !/conversion points awarded: [1-9]/.test(conversionReport), `${geometry.conversionPointsAwarded}`),
    check("conversion resolution report is distinct from geometry storage", conversionReport.includes("conversion-resolution.md"), "resolution report linked"),
    check("try attempt resolution calibration still passes", tryAttempt.includes("Status: PASS"), "try attempt PASS"),
    check("try opportunity generation still passes", tryOpportunity.includes("Status: PASS"), "try opportunity PASS"),
    check("rugby-style lateral in-goal access still passes", rugby.includes("Status: PASS"), "rugby in-goal PASS"),
    check("shot outcome validation still passes", shotOutcome.includes("Status: PASS"), "shot outcome PASS"),
    check("shot action semantics validation still passes", shotSemantics.includes("Status: PASS"), "shot semantics PASS"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("coach summary exposes conversion geometry storage", coach.includes("conversion geometry: stored for"), "coach line visible"),
    check("tactical evidence exposes conversion geometry storage", tactical.includes("conversion geometry: stored for"), "tactical line visible"),
    check("terminology cleanup validation passes or is refreshed later", readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).includes("Status: PASS") || readIfExists(join(input.reportDirectory, "validation.try-report-terminology-cleanup.md")).length === 0, "terminology PASS/refreshed later"),
    check("current mini-match and batch try values not conflated", conversionReport.includes("scope: batch TRY_TOUCHDOWN events"), "batch scope visible"),
    check("try scoring rate replaces legacy conversion-rate wording", !combined.includes("try conversion rate"), "no legacy phrase"),
    check("conversion geometry and CONVERSION scoring distinct", conversionReport.includes("conversion geometry storage active: YES") && conversionReport.includes("CONVERSION scoring active: YES"), "geometry/scoring split visible"),
    check(
      "conversion difficulty calibration validation passes or is refreshed later",
      conversionDifficulty.length === 0 || conversionDifficulty.includes("Status: PASS"),
      "conversion difficulty PASS/refreshed later",
    ),
    check("conversion difficulty recommendation visible", batch.includes("conversion difficulty recommendation") || tactical.includes("conversion difficulty recommendation"), "conversion difficulty visible"),
    check("conversion success rate reported", batch.includes("batch conversion success rate"), "conversion success rate visible"),
    check(
      "conversion resolution validation passes or is refreshed later",
      readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).includes("Status: PASS") ||
        readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).length === 0,
      "conversion resolution PASS/refreshed later",
    ),
    check("share pack remains MINIMAL_REVIEW", shareManifest.length === 0 || shareManifest.includes("MINIMAL_REVIEW"), "MINIMAL_REVIEW or pending"),
  ];

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      triesScored: geometry.tryScoredCount,
      rowsStored: geometry.geometryRowsStored,
      missingRows: geometry.missingGeometryRows,
      conversionActiveLeakageCount: activeLeakage,
      conversionPointsAwarded: geometry.conversionPointsAwarded,
      averageAngleDifficulty: geometry.averageConversionAngleDifficulty,
      geometryByLane: formatConversionGeometryLaneCounts(geometry.conversionGeometryByLane),
      recommendation: geometry.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
