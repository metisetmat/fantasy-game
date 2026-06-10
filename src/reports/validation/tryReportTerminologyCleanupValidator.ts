import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TRY_REPORT_TERMINOLOGY_CONTRACT } from "../tryTerminologyContract";
import { resolveActiveSharePackConfig } from "../sharePack";

type TryReportTerminologyStatus = "PASS" | "FAIL";

interface TryReportTerminologyCheck {
  readonly label: string;
  readonly status: TryReportTerminologyStatus;
  readonly detail: string;
}

export interface TryReportTerminologyCleanupValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly TryReportTerminologyCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): TryReportTerminologyCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function countOccurrences(input: { readonly text: string; readonly token: string }): number {
  if (input.token.length === 0) {
    return 0;
  }

  return input.text.split(input.token).length - 1;
}

function countRegex(input: { readonly text: string; readonly pattern: RegExp }): number {
  return input.text.match(input.pattern)?.length ?? 0;
}

function renderMarkdown(input: {
  readonly checks: readonly TryReportTerminologyCheck[];
  readonly ambiguousTryAttemptLabels: number;
  readonly ambiguousTryScoredLabels: number;
  readonly tryConversionRateWordingCount: number;
  readonly tryScoringRateWordingCount: number;
  readonly currentMiniMatchLabelsCount: number;
  readonly liveEventLabelsCount: number;
  readonly batchLabelsCount: number;
  readonly conversionGeometryLabelsCount: number;
  readonly conversionScoringLabelsCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Try Report Terminology Cleanup",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- ambiguous try attempt labels found: ${input.ambiguousTryAttemptLabels}`,
    `- ambiguous try scored labels found: ${input.ambiguousTryScoredLabels}`,
    `- legacy conversion-rate wording count: ${input.tryConversionRateWordingCount}`,
    `- try scoring rate wording count: ${input.tryScoringRateWordingCount}`,
    `- current mini-match labels count: ${input.currentMiniMatchLabelsCount}`,
    `- live event labels count: ${input.liveEventLabelsCount}`,
    `- batch labels count: ${input.batchLabelsCount}`,
    `- conversion geometry labels count: ${input.conversionGeometryLabelsCount}`,
    `- conversion scoring labels count: ${input.conversionScoringLabelsCount}`,
    "- recommendation: KEEP_TRY_REPORT_TERMINOLOGY",
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateTryReportTerminologyCleanup(input: {
  readonly reportDirectory: string;
}): TryReportTerminologyCleanupValidationResult {
  const tryFoundation = readIfExists(join(input.reportDirectory, "try-touchdown-scoring-foundation.md"));
  const tryBatch = readIfExists(join(input.reportDirectory, "try-touchdown-batch-diagnostics.md"));
  const scoring = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const tactical = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "live-try-event-integration.md"));
  const conversionGeometry = readIfExists(join(input.reportDirectory, "conversion-geometry-storage.md"));
  const conversionDifficultyValidation = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const tryFoundationValidation = readIfExists(join(input.reportDirectory, "validation.try-touchdown-scoring-foundation.md"));
  const liveTryValidation = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const tryCandidateValidation = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const conversionGeometryValidation = readIfExists(join(input.reportDirectory, "validation.conversion-geometry-storage.md"));
  const tryAttemptValidation = readIfExists(join(input.reportDirectory, "validation.try-attempt-resolution-calibration.md"));
  const tryOpportunityValidation = readIfExists(join(input.reportDirectory, "validation.try-opportunity-generation.md"));
  const shotOutcomeValidation = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotActionValidation = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidateExecuted = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const sharePackConfig = resolveActiveSharePackConfig(input.reportDirectory);
  const combined = [
    tryFoundation,
    tryBatch,
    scoring,
    tactical,
    coach,
    liveTry,
    conversionGeometry,
    conversionDifficultyValidation,
    tryFoundationValidation,
    liveTryValidation,
    tryCandidateValidation,
    conversionGeometryValidation,
    tryAttemptValidation,
    tryOpportunityValidation,
  ].join("\n");
  const ambiguousTryAttemptLabels = countRegex({
    text: combined,
    pattern: /(?:^|\n)- try\/touchdown attempts:/g,
  });
  const ambiguousTryScoredLabels = countRegex({
    text: combined,
    pattern: /(?:^|\n)- try\/touchdowns scored:/g,
  });
  const tryConversionRateWordingCount = countOccurrences({ text: combined, token: "try conversion rate" });
  const tryScoringRateWordingCount = countOccurrences({ text: combined, token: "try scoring rate" });
  const currentMiniMatchLabelsCount = countOccurrences({ text: combined, token: "current mini-match" });
  const liveEventLabelsCount = countOccurrences({ text: combined, token: "live try" }) + countOccurrences({ text: combined, token: "live event stream" });
  const batchLabelsCount = countOccurrences({ text: combined, token: "batch try" }) + countOccurrences({ text: combined, token: "Batch diagnostics" });
  const conversionGeometryLabelsCount =
    countOccurrences({ text: combined, token: "conversion geometry storage" }) +
    countOccurrences({ text: combined, token: "conversion geometry stored" });
  const conversionScoringLabelsCount = countOccurrences({ text: combined, token: "CONVERSION scoring active: YES" });
  const requiredPresent = (token: string): boolean => combined.includes(token);
  const checks: readonly TryReportTerminologyCheck[] = [
    check("terminology cleanup validation exists", true, "validation.try-report-terminology-cleanup.md generated"),
    check(
      "try-touchdown-scoring-foundation.md distinguishes current mini-match, live event stream, batch diagnostics, and conversion geometry",
      tryFoundation.includes("## Current Mini-Match Try Summary") &&
        tryFoundation.includes("## Live Try Event Stream Summary") &&
        tryFoundation.includes("## Batch Try Diagnostics Summary") &&
        tryFoundation.includes("## Conversion Geometry Status"),
      "scoped sections visible",
    ),
    check("try-touchdown-batch-diagnostics.md labels values as batch values", tryBatch.includes("batch try attempts") && tryBatch.includes("batch try scoring rate"), "batch labels visible"),
    check(
      "scoring-from-shot-outcomes.md labels current mini-match try values separately from batch try values",
      scoring.includes("current mini-match try attempts") && scoring.includes("batch try attempts"),
      "current and batch labels visible",
    ),
    check(
      "tactical-evidence.latest.md labels live try events separately from batch try diagnostics",
      tactical.includes("current mini-match live try events") && tactical.includes("batch try diagnostics"),
      "tactical scope labels visible",
    ),
    check(
      "coach-summary.latest.md labels live try events separately from batch try diagnostics",
      coach.includes("current mini-match live try events") && coach.includes("batch try diagnostics"),
      "coach scope labels visible",
    ),
    check("live-try-event-integration.md declares current mini-match scope", liveTry.includes("scope: current mini-match event stream"), "scope visible"),
    check("conversion-geometry-storage.md declares batch TRY_TOUCHDOWN scope", conversionGeometry.includes("scope: batch TRY_TOUCHDOWN events"), "scope visible"),
    check("legacy conversion-rate wording no longer appears", tryConversionRateWordingCount === 0, `${tryConversionRateWordingCount}`),
    check("\"try scoring rate\" appears", tryScoringRateWordingCount > 0, `${tryScoringRateWordingCount}`),
    check("\"CONVERSION scoring active: YES\" appears", combined.includes("CONVERSION scoring active: YES"), `${conversionScoringLabelsCount}`),
    check("\"conversion geometry storage\" appears", conversionGeometryLabelsCount > 0, `${conversionGeometryLabelsCount}`),
    check("no ambiguous zero attempt label", ambiguousTryAttemptLabels === 0, `${ambiguousTryAttemptLabels}`),
    check("no ambiguous zero scored label", ambiguousTryScoredLabels === 0, `${ambiguousTryScoredLabels}`),
    check("SHOT_GOAL = 3", combined.includes("SHOT_GOAL = 3 points"), "SHOT_GOAL invariant visible"),
    check("TRY_TOUCHDOWN = 5", combined.includes("TRY_TOUCHDOWN = 5 points") || combined.includes("TRY_TOUCHDOWN active scoring rule: 5 points"), "TRY invariant visible"),
    check("CONVERSION active", combined.includes("CONVERSION scoring active: YES"), "CONVERSION active visible"),
    check("conversion resolution validation passes", readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md")).includes("Status: PASS"), "conversion resolution PASS"),
    check(
      "conversion difficulty calibration validation passes or is refreshed later",
      conversionDifficultyValidation.length === 0 || conversionDifficultyValidation.includes("Status: PASS"),
      "conversion difficulty PASS/refreshed later",
    ),
    check("conversion difficulty recommendation visible", combined.includes("conversion difficulty recommendation") || combined.includes("conversion difficulty:"), "conversion difficulty visible"),
    check("conversion success rate reported", combined.includes("batch conversion success rate"), "conversion success rate visible"),
    check("CONVERSION_GOAL active at 2 points", combined.includes("CONVERSION_GOAL = 2 points"), "CONVERSION rule visible"),
    check("DROP_GOAL active at 2 points", combined.includes("DROP_GOAL scoring active: YES") && combined.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive", combined.includes("PENALTY_SHOT scoring active: NO") || combined.includes("PENALTY_SHOT active: NO"), "PENALTY_SHOT inactive"),
    check("live try integration passes", liveTryValidation.includes("Status: PASS"), "live try PASS"),
    check("try candidate/executed passes", tryCandidateValidation.includes("Status: PASS"), "try candidate PASS"),
    check("conversion geometry passes", conversionGeometryValidation.includes("Status: PASS"), "conversion geometry PASS"),
    check("try attempt resolution passes", tryAttemptValidation.includes("Status: PASS"), "try attempt PASS"),
    check("try opportunity generation passes", tryOpportunityValidation.includes("Status: PASS"), "try opportunity PASS"),
    check("shot validations pass", shotOutcomeValidation.includes("Status: PASS") && shotActionValidation.includes("Status: PASS"), "shot validations PASS"),
    check("candidate/executed consistency passes", candidateExecuted.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack MINIMAL_REVIEW", sharePackConfig.mode === "MINIMAL_REVIEW", sharePackConfig.mode),
    ...TRY_REPORT_TERMINOLOGY_CONTRACT.requiredPhrases.map((phrase) =>
      check(`required terminology appears: ${phrase}`, requiredPresent(phrase), phrase),
    ),
  ];
  const reportPath = join(input.reportDirectory, "validation.try-report-terminology-cleanup.md");
  const markdown = renderMarkdown({
    checks,
    ambiguousTryAttemptLabels,
    ambiguousTryScoredLabels,
    tryConversionRateWordingCount,
    tryScoringRateWordingCount,
    currentMiniMatchLabelsCount,
    liveEventLabelsCount,
    batchLabelsCount,
    conversionGeometryLabelsCount,
    conversionScoringLabelsCount,
  });

  writeFileSync(reportPath, markdown, "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
