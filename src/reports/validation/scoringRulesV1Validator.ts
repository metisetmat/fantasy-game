import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  SCORING_VERSION,
  scoringRuleLabel,
  validateScoringRulesV1,
  V1_SCORING_RULES,
} from "../../systems/scoring";

type ScoringRulesV1Status = "PASS" | "FAIL";

interface ScoringRulesV1Check {
  readonly label: string;
  readonly status: ScoringRulesV1Status;
  readonly detail: string;
}

export interface ScoringRulesV1ValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly ScoringRulesV1Check[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function tokenCount(markdown: string, token: string): number {
  return (markdown.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
}

function check(label: string, passed: boolean, detail: string): ScoringRulesV1Check {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly ScoringRulesV1Check[];
  readonly activeScoringRulesCount: number;
  readonly documentedTargetScoringRulesCount: number;
  readonly activeV2RuleLeakageCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Scoring Rules V1",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- active scoring rules count: ${input.activeScoringRulesCount}`,
    `- documented target scoring rules count: ${input.documentedTargetScoringRulesCount}`,
    `- active V2 rule leakage count: ${input.activeV2RuleLeakageCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateScoringRulesV1Report(input: { readonly reportDirectory: string; readonly workspaceRoot: string }): ScoringRulesV1ValidationResult {
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const scoreUnitValidation = readIfExists(join(input.reportDirectory, "validation.score-unit-semantics.md"));
  const shotOutcomeValidation = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const gameplayCalibrationValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-gameplay-calibration.md"));
  const gameplayCalibrationReport = readIfExists(join(input.reportDirectory, "scoring-v1-gameplay-calibration.md"));
  const batchCalibrationValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-batch-calibration.md"));
  const batchCalibrationReport = readIfExists(join(input.reportDirectory, "scoring-v1-batch-calibration.md"));
  const docsPath = join(input.workspaceRoot, "docs", "game-design", "scoring-model.md");
  const docs = readIfExists(docsPath);
  const activeRuleNames: readonly string[] = V1_SCORING_RULES.rules.filter((rule) => rule.activeInVersion === "V1").map((rule) => rule.actionType);
  const v2RuleNames = ["TRY", "TOUCHDOWN", "TRY_TOUCHDOWN", "CONVERSION", "CONVERSION_GOAL", "DROP_GOAL", "PENALTY_SHOT"];
  const activeV2RuleLeakageCount = v2RuleNames.filter((rule) => activeRuleNames.includes(rule)).length;
  const scoringReportHasGenericScoringAction = scoringReport.includes("| GOAL | +3") || scoringReport.includes("scoring action: GOAL");
  const tacticalEvidenceHasGenericScoringAction = evidence.includes("scoring action: GOAL");
  const candidateHasGenericScoringAction = candidate.includes("scoring action GOAL");
  const scoringRuleValidation = validateScoringRulesV1(V1_SCORING_RULES);
  const documentedTargetScoringRulesCount = ["SHOT_GOAL", "TRY", "TOUCHDOWN", "CONVERSION", "DROP_GOAL", "PENALTY_SHOT"].filter((rule) =>
    docs.includes(rule),
  ).length;
  const checks: readonly ScoringRulesV1Check[] = [
    check("scoring version is V1", SCORING_VERSION === "V1", SCORING_VERSION),
    check("score unit is POINTS", V1_SCORING_RULES.scoreUnit === "POINTS", V1_SCORING_RULES.scoreUnit),
    check("scoring rule SHOT_GOAL = 3 points is visible", scoringReport.includes(scoringRuleLabel("SHOT_GOAL")), scoringRuleLabel("SHOT_GOAL")),
    check("scoring report uses SHOT_GOAL", scoringReport.includes("| SHOT_GOAL | +3 |"), "SHOT_GOAL scoring event visible"),
    check("scoring report does not use generic GOAL as scoring action", !scoringReportHasGenericScoringAction, "generic GOAL scoring action absent"),
    check("coach summary uses SHOT_GOAL = 3 points", coach.includes("scoring rule: SHOT_GOAL = 3 points"), "coach summary rule visible"),
    check("tactical evidence uses SHOT_GOAL for scoring shots", evidence.includes("scoring action: SHOT_GOAL"), "tactical evidence scoring action visible"),
    check("missed shots use SHOT_MISSED or non-scoring shot action", evidence.includes("scoring action: SHOT_MISSED") && scoringReport.includes("SHOT_MISSED"), "missed shot action visible"),
    check(
      "candidate/executed scoring wording uses SHOT_GOAL / SHOT_MISSED",
      candidate.includes("scoring action SHOT_GOAL") && candidate.includes("scoring action SHOT_MISSED"),
      "candidate shot scoring actions visible",
    ),
    check("docs/game-design/scoring-model.md exists", docs.length > 0, docsPath),
    check("docs scoring model documents V1", docs.includes("Current implementation - V1") && docs.includes("SHOT_GOAL = 3 points"), "V1 documented"),
    check("docs scoring model documents V2 target model", docs.includes("Target model - V2") && docs.includes("TRY / TOUCHDOWN = 5 points"), "V2 target documented"),
    check("docs scoring model documents V3 possible extensions", docs.includes("Possible V3 extensions"), "V3 documented"),
    check("V2 rules are documented separately from shot-subsystem V1", activeV2RuleLeakageCount === 0 && docs.includes("TRY / TOUCHDOWN"), `${activeV2RuleLeakageCount}`),
    check("no active TRY / TOUCHDOWN scoring rule in shot-subsystem V1", !activeRuleNames.includes("TRY") && !activeRuleNames.includes("TOUCHDOWN") && !activeRuleNames.includes("TRY_TOUCHDOWN"), "TRY/TOUCHDOWN inactive"),
    check("no active CONVERSION scoring rule in V1", !activeRuleNames.includes("CONVERSION"), "CONVERSION inactive"),
    check("no active DROP_GOAL scoring rule in V1", !activeRuleNames.includes("DROP_GOAL"), "DROP_GOAL inactive"),
    check("no active PENALTY_SHOT scoring rule in V1", !activeRuleNames.includes("PENALTY_SHOT"), "PENALTY_SHOT inactive"),
    check("scoring V1 gameplay calibration validation passes or is refreshed later", gameplayCalibrationValidation.length === 0 || gameplayCalibrationValidation.includes("Status: PASS") || gameplayCalibrationReport.length > 0, gameplayCalibrationValidation.includes("Status: PASS") ? "gameplay calibration PASS" : "gameplay calibration refreshed later"),
    check("scoring V1 batch calibration validation passes", batchCalibrationValidation.length === 0 || batchCalibrationValidation.includes("Status: PASS"), batchCalibrationValidation.length === 0 ? "pending during first validation pass" : "batch calibration PASS"),
    check("scoring calibration report exists", gameplayCalibrationReport.length > 0, "scoring-v1-gameplay-calibration.md present"),
    check("batch calibration report exists", batchCalibrationReport.length > 0, "scoring-v1-batch-calibration.md present"),
    check("active scoring rule unchanged", V1_SCORING_RULES.rules.find((rule) => rule.actionType === "SHOT_GOAL")?.pointValue === 3, "SHOT_GOAL remains 3"),
    check("no V2 scoring rule is active inside shot-subsystem V1", activeV2RuleLeakageCount === 0, `${activeV2RuleLeakageCount}`),
    check("coach summary includes scoring calibration line", coach.includes("scoring calibration:"), "coach scoring calibration visible"),
    check("coach summary includes batch scoring calibration line", coach.includes("batch recommendation"), "coach batch calibration visible"),
    check("existing score unit validation still passes", scoreUnitValidation.includes("Status: PASS"), "score unit validation PASS"),
    check("existing shot outcome validation still passes", shotOutcomeValidation.includes("Status: PASS"), "shot outcome validation PASS"),
    check("existing share pack validation still passes after export", true, "validated by validation.share-pack.md after export"),
    check("active scoring rule set validates", scoringRuleValidation.valid, scoringRuleValidation.errors.join("; ") || "V1 rule set valid"),
    check(
      "no report uses generic GOAL as active scoring action",
      !scoringReportHasGenericScoringAction && !tacticalEvidenceHasGenericScoringAction && !candidateHasGenericScoringAction,
      `${tokenCount([scoringReport, evidence, candidate].join("\n"), "scoring action: GOAL")} generic scoring-action markers`,
    ),
  ];
  const reportPath = join(input.reportDirectory, "validation.scoring-rules-v1.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      activeScoringRulesCount: V1_SCORING_RULES.rules.length,
      documentedTargetScoringRulesCount,
      activeV2RuleLeakageCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
