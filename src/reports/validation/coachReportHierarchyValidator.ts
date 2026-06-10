import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type CoachHierarchyStatus = "PASS" | "FAIL";

interface CoachHierarchyCheck {
  readonly label: string;
  readonly status: CoachHierarchyStatus;
  readonly detail: string;
}

export interface CoachReportHierarchyResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly CoachHierarchyCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function countLines(markdown: string): number {
  return markdown.length === 0 ? 0 : markdown.split("\n").length;
}

function check(label: string, passed: boolean, detail: string): CoachHierarchyCheck {
  return {
    label,
    status: passed ? "PASS" : "FAIL",
    detail,
  };
}

function containsNone(markdown: string, tokens: readonly string[]): boolean {
  return tokens.every((token) => !markdown.includes(token));
}

function renderMarkdown(input: {
  readonly checks: readonly CoachHierarchyCheck[];
  readonly coachLineCount: number;
  readonly evidenceLineCount: number;
  readonly debugLineCount: number;
}): string {
  const status = input.checks.every((item) => item.status === "PASS") ? "PASS" : "FAIL";

  return [
    "# Coach Report Reading Hierarchy",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- coach summary line count: ${input.coachLineCount}`,
    `- tactical evidence line count: ${input.evidenceLineCount}`,
    `- debug full line count: ${input.debugLineCount}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateCoachReportHierarchy(input: { readonly reportDirectory: string }): CoachReportHierarchyResult {
  const coachPath = join(input.reportDirectory, "coach-summary.latest.md");
  const evidencePath = join(input.reportDirectory, "tactical-evidence.latest.md");
  const debugPath = join(input.reportDirectory, "debug-full.latest.md");
  const latestPath = join(input.reportDirectory, "latest-mini-match.md");
  const workbenchPath = join(input.reportDirectory, "workbench", "sequence-1-action-1.html");
  const coach = readIfExists(coachPath);
  const evidence = readIfExists(evidencePath);
  const debug = readIfExists(debugPath);
  const latest = readIfExists(latestPath);
  const workbench = readIfExists(workbenchPath);
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
  const coachLineCount = countLines(coach);
  const evidenceLineCount = countLines(evidence);
  const debugLineCount = countLines(debug);
  const coachForbiddenTokens = [
    "Dynamic Influence Map",
    "Perception State",
    "Trajectory State",
    "raw visible attribute total",
    "Candidate Ranking Debug",
    "DEBUG_FULL",
  ];
  const checks: readonly CoachHierarchyCheck[] = [
    check("coach-summary.latest.md exists", coach.length > 0, coachPath),
    check("tactical-evidence.latest.md exists", evidence.length > 0, evidencePath),
    check("debug-full.latest.md exists", debug.length > 0, debugPath),
    check(
      "latest-mini-match.md is coach-facing or index only",
      latest === coach || (latest.includes("Coach summary:") && latest.includes("Tactical evidence:")),
      latest === coach ? "latest-mini-match.md mirrors coach-summary.latest.md" : "latest-mini-match.md is an index",
    ),
    check("coach summary contains Match / Sequence Overview", coach.includes("## Match / Sequence Overview"), "overview visible"),
    check("coach summary contains Sequence Summary Table", coach.includes("## Sequence Summary Table"), "summary table visible"),
    check("coach summary contains Sequence 1 Action 1", coach.includes("Sequence 1 Action 1"), "action 1 visible"),
    check("coach summary contains Sequence 1 Action 2", coach.includes("Sequence 1 Action 2"), "action 2 visible"),
    check("coach summary contains Key Tactical Findings", coach.includes("## Key Tactical Findings"), "findings visible"),
    check("coach summary contains Open Coaching Questions", coach.includes("## Open Coaching Questions"), "questions visible"),
    check("tactical evidence contains Decision Target", evidence.includes("### Decision Target"), "decision target evidence visible"),
    check("tactical evidence contains Ball Transfer Result", evidence.includes("### Ball Transfer Result"), "transfer evidence visible"),
    check("tactical evidence contains Action Semantic Contract", evidence.includes("### Action Semantic Contract"), "semantic contract visible"),
    check("tactical evidence contains Decision Reasoning", evidence.includes("### Decision Reasoning"), "decision reasoning visible"),
    check("tactical evidence contains Reception Quality Summary", evidence.includes("Reception Quality Summary"), "reception summary visible"),
    check("debug full contains Dynamic Influence Map", debug.includes("Dynamic Influence Map"), "debug influence detail visible"),
    check("debug full contains Perception State", debug.includes("Perception State"), "debug perception detail visible"),
    check("debug full contains Trajectory State", debug.includes("Trajectory State"), "debug trajectory detail visible"),
    check("coach summary does not contain Dynamic Influence Map", !coach.includes("Dynamic Influence Map"), "debug influence omitted"),
    check("coach summary does not contain raw Perception State", !coach.includes("Perception State"), "debug perception omitted"),
    check("coach summary does not contain raw Trajectory State", !coach.includes("Trajectory State"), "debug trajectory omitted"),
    check("coach summary does not contain full utility debug", !coach.includes("raw visible attribute total"), "utility internals omitted"),
    check("debug-only sections are not in coach summary", containsNone(coach, coachForbiddenTokens), "debug-only tokens absent"),
    check(
      "links between reports are present",
      coach.includes("tactical-evidence.latest.md") &&
        coach.includes("debug-full.latest.md") &&
        workbench.includes("../coach-summary.latest.md") &&
        workbench.includes("../tactical-evidence.latest.md") &&
        workbench.includes("../debug-full.latest.md"),
      "coach summary and workbench link report levels",
    ),
    check(
      "coach summary is much shorter than debug full",
      coachLineCount < debugLineCount / 4,
      `${coachLineCount} coach lines vs ${debugLineCount} debug lines`,
    ),
    check(
      "tactical evidence is compact enough for human review",
      evidenceLineCount <= 3000,
      `${evidenceLineCount} tactical evidence lines`,
    ),
    check(
      "tactical evidence is meaningfully shorter than debug full",
      evidenceLineCount < debugLineCount / 2,
      `${evidenceLineCount} tactical evidence lines vs ${debugLineCount} debug lines`,
    ),
    check(
      "tactical evidence does not contain debug-only raw internals",
      !evidence.includes("Dynamic Influence Map") &&
        !evidence.includes("Perception State") &&
        !evidence.includes("Trajectory State") &&
        !evidence.includes("raw visible attribute total"),
      "debug-only raw internals omitted from tactical evidence",
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
    check("coach summary includes scenario variation line", coach.includes("scenario variation:"), "coach scenario variation visible"),
    check("tactical evidence includes scenario variation status", evidence.includes("scenario variation status:"), "tactical evidence scenario variation visible"),
    check("shot difficulty calibration validation passes", shotDifficultyValidation.includes("Status: PASS"), "validation.shot-difficulty-calibration.md passes"),
    check("coach summary includes shot difficulty calibration line", coach.includes("shot difficulty calibration:"), "coach shot difficulty visible"),
    check("tactical evidence includes shot difficulty calibration line", evidence.includes("shot difficulty calibration applied:"), "tactical evidence shot difficulty visible"),
    check("clean window style balance validation passes", cleanWindowStyleBalanceValidation.includes("Status: PASS"), "validation.clean-window-style-balance.md passes"),
    check("coach summary includes clean-window calibration line", coach.includes("clean-window calibration:"), "coach clean-window visible"),
    check("tactical evidence includes style balance status", evidence.includes("style balance status:"), "tactical evidence style balance visible"),
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
  const reportPath = join(input.reportDirectory, "validation.coach-report-hierarchy.md");

  writeFileSync(
    reportPath,
    renderMarkdown({
      checks,
      coachLineCount,
      evidenceLineCount,
      debugLineCount,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status === "PASS"),
    reportPath,
    checks,
  };
}
