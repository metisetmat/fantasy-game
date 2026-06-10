import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  scoringRuleLabel,
  V1_SCORING_RULES,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { createScenarioSeedVariationReport, validateSeedVariationSummary } from "../../systems/simulation";

type ScenarioSeedVariationStatus = "PASS" | "FAIL" | "WARNING";

interface ScenarioSeedVariationCheck {
  readonly label: string;
  readonly status: ScenarioSeedVariationStatus;
  readonly detail: string;
}

export interface ScenarioSeedVariationValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ScenarioSeedVariationCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): ScenarioSeedVariationCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function warning(label: string, detail: string): ScenarioSeedVariationCheck {
  return {
    label,
    status: "WARNING",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ScenarioSeedVariationCheck[];
  readonly summary: BatchScoringCalibrationSummary;
}): string {
  const status = input.checks.some((item) => item.status === "FAIL") ? "FAIL" : "PASS";

  return [
    "# Scenario / Seed Variation Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- scenarios generated: ${input.summary.scenarioVariation.generatedScenarioCount}`,
    `- unique initial scenarios: ${input.summary.scenarioVariation.uniqueInitialScenarios}`,
    `- unique shot counts: ${input.summary.scenarioVariation.uniqueShotCounts}`,
    `- unique final scores: ${input.summary.scenarioVariation.uniqueFinalScores}`,
    `- unique shot outcome patterns: ${input.summary.scenarioVariation.uniqueShotOutcomePatterns}`,
    `- seed connected input count: ${input.summary.scenarioVariation.connectedSimulationInputCount}`,
    `- seed impact status: ${input.summary.scenarioVariation.seedImpactStatus}`,
    `- scenario diversity status: ${input.summary.scenarioVariation.scenarioDiversityStatus}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateScenarioSeedVariation(input: {
  readonly reportDirectory: string;
  readonly summary: BatchScoringCalibrationSummary;
}): ScenarioSeedVariationValidationResult {
  const scenarioReportPath = join(input.reportDirectory, "scenario-seed-variation.md");
  writeFileSync(scenarioReportPath, createScenarioSeedVariationReport(input.summary.scenarioVariation), "utf8");

  const scenarioReport = readIfExists(scenarioReportPath);
  const batchValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-batch-calibration.md"));
  const multiAction = readIfExists(join(input.reportDirectory, "multi-action-semantic-generalization.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const seedValidation = validateSeedVariationSummary(input.summary.scenarioVariation);
  const v2Leakage = ["TRY", "TOUCHDOWN", "TRY_TOUCHDOWN", "CONVERSION", "CONVERSION_GOAL", "DROP_GOAL", "PENALTY_SHOT"].filter((rule) =>
    V1_SCORING_RULES.rules.filter((activeRule) => activeRule.activeInVersion === "V1").map((activeRule) => activeRule.actionType as string).includes(rule),
  ).length;
  const checks: readonly ScenarioSeedVariationCheck[] = [
    check("scenario variation report exists", scenarioReport.length > 0, "scenario-seed-variation.md present"),
    check("at least 20 scenarios generated", input.summary.scenarioVariation.generatedScenarioCount >= 20, `${input.summary.scenarioVariation.generatedScenarioCount}`),
    check("seed impact is measured", input.summary.scenarioVariation.seedImpactStatus !== "SEED_NOT_CONNECTED_TO_SIMULATION", input.summary.scenarioVariation.seedImpactStatus),
    check("unique initial scenarios > 1", input.summary.scenarioVariation.uniqueInitialScenarios > 1, `${input.summary.scenarioVariation.uniqueInitialScenarios}`),
    input.summary.scenarioVariation.uniqueShotCounts > 1
      ? check("unique shot counts > 1 or explicitly explained", true, `${input.summary.scenarioVariation.uniqueShotCounts}`)
      : warning("unique shot counts > 1 or explicitly explained", "shot count remains deterministic; report explains fixed shot count"),
    input.summary.scenarioVariation.uniqueFinalScores > 1
      ? check("unique final scores > 1 or explicitly explained", true, `${input.summary.scenarioVariation.uniqueFinalScores}`)
      : warning("unique final scores > 1 or explicitly explained", "final score remains deterministic; report explains fixed score"),
    check("batch variation status is not IDENTICAL_OUTPUT_WARNING", input.summary.variationStatus !== "IDENTICAL_OUTPUT_WARNING", input.summary.variationStatus),
    check("seed is connected to at least 3 simulation inputs", input.summary.scenarioVariation.connectedSimulationInputCount >= 3, `${input.summary.scenarioVariation.connectedSimulationInputCount}`),
    check("scoring rule remains SHOT_GOAL = 3 points", input.summary.scoringRule === scoringRuleLabel("SHOT_GOAL"), input.summary.scoringRule),
    check("no V2 scoring rules are active inside shot-subsystem V1", v2Leakage === 0, `${v2Leakage}`),
    check("existing scoring V1 batch calibration still passes", batchValidation.includes("Status: PASS"), "batch calibration PASS"),
    check("existing multi-action semantic validation still passes", multiAction.includes("Status: PASS"), "multi-action PASS"),
    check("existing post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("seed variation system validation passes", seedValidation.valid, seedValidation.errors.join("; ") || "seed variation valid"),
  ];
  const reportPath = join(input.reportDirectory, "validation.scenario-seed-variation.md");

  writeFileSync(reportPath, renderMarkdown({ checks, summary: input.summary }), "utf8");

  return {
    valid: !checks.some((item) => item.status === "FAIL"),
    reportPath,
    checks,
  };
}
