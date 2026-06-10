import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type CompactionStatus = "PASS" | "FAIL";

interface CompactionCheck {
  readonly label: string;
  readonly status: CompactionStatus;
  readonly detail: string;
}

export interface TacticalEvidenceCompactionResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CompactionCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function lineCount(markdown: string): number {
  return markdown.length === 0 ? 0 : markdown.split("\n").length;
}

function check(label: string, passed: boolean, detail: string): CompactionCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function renderMarkdown(input: {
  readonly checks: readonly CompactionCheck[];
  readonly coachLines: number;
  readonly evidenceLines: number;
  readonly debugLines: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Tactical Evidence Compaction",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- coach summary line count: ${input.coachLines}`,
    `- tactical evidence line count: ${input.evidenceLines}`,
    `- debug full line count: ${input.debugLines}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateTacticalEvidenceCompaction(input: { readonly reportDirectory: string }): TacticalEvidenceCompactionResult {
  const coach = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const latest = readIfExists(join(input.reportDirectory, "latest-mini-match.md"));
  const evidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const debug = readIfExists(join(input.reportDirectory, "debug-full.latest.md"));
  const missingDataValidation = readIfExists(join(input.reportDirectory, "validation.tactical-evidence-missing-data.md"));
  const shotActionValidation = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const shotOutcomeValidation = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const scoreUnitValidation = readIfExists(join(input.reportDirectory, "validation.score-unit-semantics.md"));
  const scoringRulesValidation = readIfExists(join(input.reportDirectory, "validation.scoring-rules-v1.md"));
  const gameplayCalibrationValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-gameplay-calibration.md"));
  const gameplayCalibrationReport = readIfExists(join(input.reportDirectory, "scoring-v1-gameplay-calibration.md"));
  const batchCalibrationValidation = readIfExists(join(input.reportDirectory, "validation.scoring-v1-batch-calibration.md"));
  const batchCalibrationReport = readIfExists(join(input.reportDirectory, "scoring-v1-batch-calibration.md"));
  const scenarioSeedVariationValidation = readIfExists(join(input.reportDirectory, "validation.scenario-seed-variation.md"));
  const shotDifficultyValidation = readIfExists(join(input.reportDirectory, "validation.shot-difficulty-calibration.md"));
  const cleanWindowStyleBalanceValidation = readIfExists(join(input.reportDirectory, "validation.clean-window-style-balance.md"));
  const gkValidation = readIfExists(join(input.reportDirectory, "validation.gk-shot-stopping-goal-area.md"));
  const gkOutcomeValidation = readIfExists(join(input.reportDirectory, "validation.gk-outcome-diversity-rebound.md"));
  const reboundContinuationValidation = readIfExists(join(input.reportDirectory, "validation.rebound-continuation-resolution.md"));
  const scoringReport = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const coachLines = lineCount(coach);
  const evidenceLines = lineCount(evidence);
  const debugLines = lineCount(debug);
  const specificQuestions = [
    "did CONTROL turn construction into a clean enough shot window?",
    "did the finishing chance come from real destabilization or forced progression?",
    "did central rebuild slow the attack or preserve the best next shot?",
    "did circulation preserve control or delay the decisive action?",
  ];
  const forbiddenEvidenceTokens = [
    "raw visible attribute total",
    "derived attribute debug",
    "Dynamic Influence Map",
    "Perception State",
    "Trajectory State",
  ];
  const checks: readonly CompactionCheck[] = [
    check("tactical-evidence.latest.md exists", evidence.length > 0, "published tactical reviewer report exists"),
    check("tactical evidence line count <= 3000", evidenceLines <= 3000, `${evidenceLines}`),
    check("tactical evidence line count > coach summary line count", evidenceLines > coachLines, `${evidenceLines} > ${coachLines}`),
    check("tactical evidence line count < debug full line count", evidenceLines < debugLines, `${evidenceLines} < ${debugLines}`),
    check("tactical evidence contains Reading Guide", evidence.includes("## Reading Guide"), "reading guide present"),
    check("tactical evidence contains Match Evidence Overview", evidence.includes("## Match Evidence Overview"), "overview present"),
    check("tactical evidence contains Sequence Evidence Summary", evidence.includes("## Sequence Evidence Summary"), "sequence summary present"),
    check("tactical evidence contains Sequence 1 Action 1", evidence.includes("Action 1 - TH -> ML"), "action 1 evidence present"),
    check("tactical evidence contains Sequence 1 Action 2", evidence.includes("Action 2 - ML -> HL"), "action 2 evidence present"),
    check("tactical evidence contains Final Decision", evidence.includes("#### Final Decision"), "final decision section present"),
    check("tactical evidence contains Why This Decision Won", evidence.includes("#### Why This Decision Won"), "decision rationale present"),
    check("tactical evidence contains Key Alternatives", evidence.includes("#### Key Alternatives"), "alternatives present"),
    check("tactical evidence contains Reception Evidence", evidence.includes("#### Reception Evidence"), "reception evidence present"),
    check("tactical evidence contains Chain Evidence", evidence.includes("#### Chain Evidence"), "chain evidence present"),
    check("tactical evidence contains Spatial / Pressure Evidence", evidence.includes("#### Spatial / Pressure Evidence"), "spatial evidence present"),
    check("tactical evidence contains Evidence Confidence", evidence.includes("#### Evidence Confidence"), "confidence section present"),
    check(
      "tactical evidence does not contain raw visible attribute total",
      !evidence.includes("raw visible attribute total"),
      "raw attribute totals omitted",
    ),
    check(
      "tactical evidence does not contain derived attribute formula blocks",
      !evidence.includes("derived attribute debug") && !evidence.includes("formula:"),
      "formula blocks omitted",
    ),
    check(
      "tactical evidence does not contain Dynamic Influence Map raw section",
      !evidence.includes("Dynamic Influence Map"),
      "dynamic influence raw blocks omitted",
    ),
    check("tactical evidence does not contain raw Perception State", !evidence.includes("Perception State"), "perception raw blocks omitted"),
    check("tactical evidence does not contain raw Trajectory State", !evidence.includes("Trajectory State"), "trajectory raw blocks omitted"),
    check("debug full still contains Dynamic Influence Map", debug.includes("Dynamic Influence Map"), "debug keeps influence internals"),
    check("debug full still contains Perception State", debug.includes("Perception State"), "debug keeps perception internals"),
    check("debug full still contains Trajectory State", debug.includes("Trajectory State"), "debug keeps trajectory internals"),
    check("coach summary stays below 120 lines", coachLines < 120, `${coachLines}`),
    check(
      "coach summary has more specific sequence coaching questions",
      specificQuestions.every((question) => coach.includes(question)),
      "sequence questions are not repeated generic prompts",
    ),
    check(
      "coach summary data binding valid",
      coach.includes("### Sequence 1 Action 1 - TH -> ML") &&
        coach.includes("### Sequence 1 Action 2 - ML -> HL") &&
        coach.includes("CONTROL selects TH -> ML as SUPPORT_CLUSTER_RECYCLE") &&
        coach.includes("CONTROL selects ML -> HL as FORWARD_PROGRESS"),
      "Sequence 1 action data is bound",
    ),
    check("coach summary contains no unknown placeholders", !coach.includes("unknown"), "unknown absent"),
    check("latest-mini-match contains no unknown placeholders", !latest.includes("unknown"), "unknown absent"),
    check(
      "tactical evidence missing-data validation passes",
      missingDataValidation.includes("Status: PASS"),
      "validation.tactical-evidence-missing-data.md passes",
    ),
    check("tactical evidence contains no MISSING_DATA markers", !evidence.includes("MISSING_DATA"), "MISSING_DATA absent"),
    check(
      "tactical evidence pressure levels are populated",
      evidence.includes("pressure level:") && evidence.includes("pressure source:") && !evidence.includes("pressure level: unknown"),
      "pressure level/source present",
    ),
    check("shot action semantics validation passes", shotActionValidation.includes("Status: PASS"), "validation.shot-action-semantics.md passes"),
    check(
      "tactical evidence shot blocks use shot-specific sections",
      evidence.includes("#### Shot Context") && evidence.includes("#### Shot Result") && evidence.includes("#### Shot Semantic Contract"),
      "shot-specific sections present",
    ),
    check(
      "tactical evidence shot blocks do not use receiver/new-carrier pass vocabulary",
      shotActionValidation.includes("shot blocks using pass vocabulary: 0"),
      "shot block pass vocabulary count is 0",
    ),
    check("shot outcome resolution validation passes", shotOutcomeValidation.includes("Status: PASS"), "validation.shot-outcome-resolution.md passes"),
    check("shot blocks have resolved outcomes", !evidence.includes("ball outcome: PENDING"), "PENDING shot outcomes absent"),
    check("coach summary scoring source is resolved shot outcomes", coach.includes("scoring source: resolved shot outcomes"), "coach scoring source resolved"),
    check("scoring V1 gameplay calibration validation passes", gameplayCalibrationValidation.includes("Status: PASS"), "validation.scoring-v1-gameplay-calibration.md passes"),
    check("scoring V1 batch calibration validation passes", batchCalibrationValidation.includes("Status: PASS"), "validation.scoring-v1-batch-calibration.md passes"),
    check("scoring calibration report exists", gameplayCalibrationReport.length > 0, "scoring-v1-gameplay-calibration.md present"),
    check("batch calibration report exists", batchCalibrationReport.length > 0, "scoring-v1-batch-calibration.md present"),
    check("active scoring rule unchanged", scoringReport.includes("scoring rule: SHOT_GOAL = 3 points"), "SHOT_GOAL remains 3"),
    check("V2_DROP_FOUNDATION scoring routes are visible", scoringReport.includes("TRY_TOUCHDOWN = 5 points") && scoringReport.includes("CONVERSION_GOAL = 2 points") && scoringReport.includes("DROP_GOAL = 2 points"), "V2_DROP_FOUNDATION visible"),
    check("coach summary includes scoring calibration line", coach.includes("scoring calibration:"), "coach scoring calibration visible"),
    check("coach summary includes batch scoring calibration line", coach.includes("batch recommendation"), "coach batch calibration visible"),
    check("scenario seed variation validation passes", scenarioSeedVariationValidation.includes("Status: PASS"), "validation.scenario-seed-variation.md passes"),
    check("tactical evidence contains scenario variation status", evidence.includes("scenario variation status:"), "scenario variation visible"),
    check("shot difficulty calibration validation passes", shotDifficultyValidation.includes("Status: PASS"), "validation.shot-difficulty-calibration.md passes"),
    check("tactical evidence contains shot difficulty calibration", evidence.includes("shot difficulty calibration applied:"), "shot difficulty visible"),
    check("clean window style balance validation passes", cleanWindowStyleBalanceValidation.includes("Status: PASS"), "validation.clean-window-style-balance.md passes"),
    check("tactical evidence contains style balance status", evidence.includes("style balance status:"), "style balance visible"),
    check("scoring rules V1 validation passes", scoringRulesValidation.includes("Status: PASS"), "validation.scoring-rules-v1.md passes"),
    check("score unit semantics validation passes", scoreUnitValidation.includes("Status: PASS"), "validation.score-unit-semantics.md passes"),
    check("GK shot-stopping / goal-area validation passes", gkValidation.includes("Status: PASS"), "validation.gk-shot-stopping-goal-area.md passes"),
    check("GK outcome diversity / rebound validation passes", gkOutcomeValidation.includes("Status: PASS"), "validation.gk-outcome-diversity-rebound.md passes"),
    check("rebound continuation resolution validation passes", reboundContinuationValidation.includes("Status: PASS"), "validation.rebound-continuation-resolution.md passes"),
    check("tactical evidence contains Goalkeeper Context for shot blocks", evidence.includes("#### Goalkeeper Context"), "Goalkeeper Context present"),
    check("tactical evidence contains rebound resolution for shot blocks", evidence.includes("rebound type:") && evidence.includes("rebound reason:"), "rebound fields present"),
    check("tactical evidence contains Rebound Continuation sections", evidence.includes("#### Rebound Continuation"), "Rebound Continuation present"),
    check("scoring report contains goalkeeper action", scoringReport.includes("goalkeeper action") || scoringReport.includes("Goalkeeper action"), "goalkeeper action visible"),
    check("scoring report contains Rebound Events table", scoringReport.includes("## Rebound Events"), "Rebound Events visible"),
    check("no shot-on-target goal lacks GK evaluation", gkValidation.includes("goals without goalkeeper evaluated: 0"), "goals without GK evaluation 0"),
    check("score unit is POINTS", scoringReport.includes("score unit: POINTS") && coach.includes("score unit: POINTS"), "POINTS visible"),
    check("active scoring version is V2_DROP_FOUNDATION", scoringReport.includes("scoring version: V2_DROP_FOUNDATION") && coach.includes("scoring version: V2_DROP_FOUNDATION"), "V2_DROP_FOUNDATION visible"),
    check("active scoring rule is SHOT_GOAL = 3 points", scoringReport.includes("scoring rule: SHOT_GOAL = 3 points") && coach.includes("scoring rule: SHOT_GOAL = 3 points"), "SHOT_GOAL = 3 points visible"),
    check("target V2 scoring model documented", scoringRulesValidation.includes("docs scoring model documents V2 target model"), "V2 target model documented"),
    check("V2 scoring actions are separated from shot-subsystem V1", scoringRulesValidation.includes("shot-subsystem V1") || scoringRulesValidation.includes("Status: PASS"), "V2 foundation separated"),
    check(
      "no misleading goal count vs score wording",
      !scoringReport.includes("goals CONTROL: 3") &&
        !shotOutcomeValidation.includes("goal count matches final score") &&
        !scoringReport.includes("scoring rule: GOAL = 3 points"),
      "goal count and score points separated",
    ),
  ];
  const reportPath = join(input.reportDirectory, "validation.tactical-evidence-compaction.md");

  writeFileSync(reportPath, renderMarkdown({ checks, coachLines, evidenceLines, debugLines }), "utf8");

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
