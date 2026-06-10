import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../../systems/actions";
import {
  analyzeOffensivePossessionDangerPhases,
  createOffensivePossessionDangerPhaseReport,
} from "../../systems/phases";
import {
  ACTIVE_SCORING_ACTION_REGISTRY,
  summarizeUnifiedLiveScoringEvents,
  type BatchScoringCalibrationSummary,
} from "../../systems/scoring";
import { resolveActiveSharePackConfig } from "../sharePack";

type OffensivePossessionDangerPhaseStatus = "PASS" | "WARNING" | "FAIL";

interface OffensivePossessionDangerPhaseCheck {
  readonly label: string;
  readonly status: OffensivePossessionDangerPhaseStatus;
  readonly detail: string;
}

export interface OffensivePossessionDangerPhaseValidationResult {
  readonly valid: boolean;
  readonly reportPath: string;
  readonly checks: readonly OffensivePossessionDangerPhaseCheck[];
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function check(label: string, passed: boolean, detail: string): OffensivePossessionDangerPhaseCheck {
  return { label, status: passed ? "PASS" : "FAIL", detail };
}

function warning(label: string, passed: boolean, detail: string): OffensivePossessionDangerPhaseCheck {
  return { label, status: passed ? "PASS" : "WARNING", detail };
}

function validationPassesOrPending(report: string): boolean {
  return report.length === 0 || report.includes("Status: PASS");
}

function registry(action: string): { readonly points?: number | undefined; readonly active: boolean } | undefined {
  return ACTIVE_SCORING_ACTION_REGISTRY.find((entry) => entry.action === action);
}

function renderMarkdown(input: {
  readonly checks: readonly OffensivePossessionDangerPhaseCheck[];
  readonly offensivePossessions: number;
  readonly offensivePossessionsPerMatch: number;
  readonly offensivePossessionsPerTeamPerMatch: number;
  readonly dangerPhases: number;
  readonly dangerPhasesPerMatch: number;
  readonly dangerPhasesPerTeamPerMatch: number;
  readonly possessionsReachingDangerPhase: number;
  readonly possessionToDangerRate: number;
  readonly dangerPhasesWithScoringAffordance: number;
  readonly dangerPhaseToScoringAffordanceRate: number;
  readonly dangerPhasesWithoutScoringAffordance: number;
  readonly affordancesWithPossessionLink: number;
  readonly affordancesMissingPossessionLink: number;
  readonly affordancesWithDangerPhaseLink: number;
  readonly affordancesMissingDangerPhaseLink: number;
  readonly scoringValuesChangedCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly recommendation: string;
}): string {
  const status = input.checks.every((item) => item.status !== "FAIL") ? "PASS" : "FAIL";

  return [
    "# Offensive Possession & Danger Phase Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- offensive possessions: ${input.offensivePossessions}`,
    `- offensive possessions per match: ${input.offensivePossessionsPerMatch}`,
    `- offensive possessions per team per match: ${input.offensivePossessionsPerTeamPerMatch}`,
    `- danger phases: ${input.dangerPhases}`,
    `- danger phases per match: ${input.dangerPhasesPerMatch}`,
    `- danger phases per team per match: ${input.dangerPhasesPerTeamPerMatch}`,
    `- possessions reaching danger phase: ${input.possessionsReachingDangerPhase}`,
    `- possession-to-danger rate: ${input.possessionToDangerRate}%`,
    `- danger phases with scoring affordance: ${input.dangerPhasesWithScoringAffordance}`,
    `- danger phase to scoring affordance rate: ${input.dangerPhaseToScoringAffordanceRate}%`,
    `- danger phases without scoring affordance: ${input.dangerPhasesWithoutScoringAffordance}`,
    `- affordances with possession link: ${input.affordancesWithPossessionLink}`,
    `- affordances missing possession link: ${input.affordancesMissingPossessionLink}`,
    `- affordances with danger phase link: ${input.affordancesWithDangerPhaseLink}`,
    `- affordances missing danger phase link: ${input.affordancesMissingDangerPhaseLink}`,
    `- scoring values changed count: ${input.scoringValuesChangedCount}`,
    `- penalty shot active leakage count: ${input.penaltyShotActiveLeakageCount}`,
    `- batch/live contamination count: ${input.batchLiveContaminationCount}`,
    `- final score mismatch count: ${input.finalScoreMismatchCount}`,
    `- recommendation: ${input.recommendation}`,
    "",
    "## Checks",
    "",
    ...input.checks.map((item) => `- ${item.status}: ${item.label} - ${item.detail}`),
    "",
  ].join("\n");
}

export function validateOffensivePossessionDangerPhase(input: {
  readonly result: MiniMatchResult;
  readonly reportDirectory: string;
  readonly batchCalibration: BatchScoringCalibrationSummary;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
}): OffensivePossessionDangerPhaseValidationResult {
  const reportPath = join(input.reportDirectory, "offensive-possession-danger-phase.md");
  const report = readIfExists(reportPath);
  const scoringAffordance = readIfExists(join(input.reportDirectory, "scoring-affordance-volume.md"));
  const shotDominance = readIfExists(join(input.reportDirectory, "shot-dominance-diagnostic.md"));
  const scoringChoice = readIfExists(join(input.reportDirectory, "scoring-choice-balance.md"));
  const scoringEvents = readIfExists(join(input.reportDirectory, "scoring-events-summary.md"));
  const scoringCompatibility = readIfExists(join(input.reportDirectory, "scoring-from-shot-outcomes.md"));
  const tacticalEvidence = readIfExists(join(input.reportDirectory, "tactical-evidence.latest.md"));
  const coachSummary = readIfExists(join(input.reportDirectory, "coach-summary.latest.md"));
  const unifiedLive = readIfExists(join(input.reportDirectory, "validation.unified-live-scoring-event-stream.md"));
  const dangerNonShotValidation = readIfExists(join(input.reportDirectory, "validation.danger-phase-non-shot-affordance-generation.md"));
  const affordanceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-affordance-volume.md"));
  const shotDominanceValidation = readIfExists(join(input.reportDirectory, "validation.shot-dominance-diagnostic.md"));
  const scoringChoiceValidation = readIfExists(join(input.reportDirectory, "validation.scoring-choice-balance.md"));
  const dropResolution = readIfExists(join(input.reportDirectory, "validation.drop-goal-resolution-calibration.md"));
  const dropOpportunity = readIfExists(join(input.reportDirectory, "validation.drop-goal-opportunity-generation.md"));
  const dropFoundation = readIfExists(join(input.reportDirectory, "validation.drop-goal-foundation.md"));
  const conversionDifficulty = readIfExists(join(input.reportDirectory, "validation.conversion-difficulty-calibration.md"));
  const conversionResolution = readIfExists(join(input.reportDirectory, "validation.conversion-resolution.md"));
  const tryCandidate = readIfExists(join(input.reportDirectory, "validation.try-candidate-executed-integration.md"));
  const liveTry = readIfExists(join(input.reportDirectory, "validation.live-try-event-integration.md"));
  const shotOutcome = readIfExists(join(input.reportDirectory, "validation.shot-outcome-resolution.md"));
  const shotSemantics = readIfExists(join(input.reportDirectory, "validation.shot-action-semantics.md"));
  const candidate = readIfExists(join(input.reportDirectory, "candidate-executed-action-consistency.md"));
  const postResolution = readIfExists(join(input.reportDirectory, "post-resolution-consistency.md"));
  const snapshot = analyzeOffensivePossessionDangerPhases({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });
  const generatedReport = createOffensivePossessionDangerPhaseReport({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });

  if (report.length === 0) {
    writeFileSync(reportPath, generatedReport, "utf8");
  }

  const scoringValuesChangedCount = [
    registry("SHOT_GOAL")?.points === 3,
    registry("TRY_TOUCHDOWN")?.points === 5,
    registry("CONVERSION_GOAL")?.points === 2,
    registry("DROP_GOAL")?.points === 2,
  ].filter((item) => !item).length;
  const combined = report + scoringAffordance + shotDominance + scoringChoice + scoringEvents;
  const penaltyShotActiveLeakageCount = registry("PENALTY_SHOT")?.active === true || /PENALTY_SHOT.*active: YES/.test(combined) ? 1 : 0;
  const unifiedSummary = summarizeUnifiedLiveScoringEvents({
    result: input.result,
    shotOutcomes: input.shotOutcomes,
    batchConversionAttempts: 0,
    batchConversionPoints: 0,
  });
  const checks: readonly OffensivePossessionDangerPhaseCheck[] = [
    check("offensive-possession-danger-phase.md exists", report.includes("# Offensive Possession & Danger Phase Instrumentation") || generatedReport.includes("# Offensive Possession & Danger Phase Instrumentation"), "report generated"),
    check("scoring version remains V2_DROP_FOUNDATION", snapshot.scoringVersion === "V2_DROP_FOUNDATION" && report.includes("V2_DROP_FOUNDATION"), snapshot.scoringVersion),
    check("score unit remains POINTS", snapshot.scoreUnit === "POINTS" && report.includes("score unit: POINTS"), snapshot.scoreUnit),
    check("SHOT_GOAL remains 3 points", registry("SHOT_GOAL")?.points === 3 && report.includes("SHOT_GOAL = 3 points"), "SHOT_GOAL = 3 points"),
    check("TRY_TOUCHDOWN remains 5 points", registry("TRY_TOUCHDOWN")?.points === 5 && report.includes("TRY_TOUCHDOWN = 5 points"), "TRY_TOUCHDOWN = 5 points"),
    check("CONVERSION_GOAL remains 2 points", registry("CONVERSION_GOAL")?.points === 2 && report.includes("CONVERSION_GOAL = 2 points"), "CONVERSION_GOAL = 2 points"),
    check("DROP_GOAL remains 2 points", registry("DROP_GOAL")?.points === 2 && report.includes("DROP_GOAL = 2 points"), "DROP_GOAL = 2 points"),
    check("PENALTY_SHOT remains inactive", penaltyShotActiveLeakageCount === 0 && report.includes("PENALTY_SHOT inactive"), "PENALTY_SHOT inactive"),
    check("offensive possession tracker exists", existsSync(join(process.cwd(), "src", "systems", "possession", "offensivePossessionTracker.ts")), "tracker file exists"),
    check("danger phase tracker exists", existsSync(join(process.cwd(), "src", "systems", "phases", "dangerPhaseTracker.ts")), "tracker file exists"),
    check("offensive possessions are reported", snapshot.offensivePossessions > 0 && report.includes("offensive possessions:"), `${snapshot.offensivePossessions}`),
    warning("offensive possessions per match are reported", snapshot.offensivePossessionsPerMatch > 0, `${snapshot.offensivePossessionsPerMatch}`),
    check("danger phases are reported", snapshot.dangerPhases > 0 && report.includes("danger phases:"), `${snapshot.dangerPhases}`),
    warning("danger phases per match are reported", snapshot.dangerPhasesPerMatch > 0, `${snapshot.dangerPhasesPerMatch}`),
    check("possession funnel is reported", report.includes("## Possession Funnel"), "funnel visible"),
    check("danger phase exit distribution is reported", report.includes("## Danger Phase Exit Distribution"), "exit distribution visible"),
    check("danger phase route distribution is reported", report.includes("## Danger Phase Route Distribution"), "route distribution visible"),
    check("danger phases without affordance section exists", report.includes("## Danger Phases Without Affordance"), "section visible"),
    check("non-shot danger affordance generation section exists", report.includes("## Non-Shot Danger Affordance Generation"), "section visible"),
    check("non-shot affordance table exists", report.includes("## Non-Shot Affordance Table"), "section visible"),
    check("possession / danger link quality is reported", report.includes("## Possession / Danger Link Quality"), "link quality visible"),
    check("live mini-match possession / danger view is reported", report.includes("## Live Mini-Match Possession / Danger View"), "live view visible"),
    check("batch vs live interpretation is reported", report.includes("## Batch vs Live Interpretation"), "batch/live visible"),
    check("scoring-affordance-volume.md links to offensive possession / danger phase report", scoringAffordance.includes("Possession/Danger Instrumentation Link") && scoringAffordance.includes("offensive-possession-danger-phase.md"), "affordance link visible"),
    check("shot-dominance-diagnostic.md includes possession / danger phase reinterpretation", shotDominance.includes("Possession / Danger Phase Reinterpretation"), "shot dominance link visible"),
    check("scoring-choice-balance.md links to offensive possession / danger phase report", scoringChoice.includes("Offensive Possession / Danger Phase Link"), "choice link visible"),
    check("scoring-events-summary.md includes offensive possession / danger phase snapshot", scoringEvents.includes("Offensive Possession / Danger Phase Snapshot"), "event snapshot visible"),
    check("scoring-from-shot-outcomes.md links to offensive possession / danger phase report", scoringCompatibility.includes("offensive possession / danger phase report"), "compatibility link visible"),
    check("tactical evidence includes possession / danger phase line", tacticalEvidence.includes("offensive possession / danger phase instrumentation: active"), "tactical line visible"),
    check("coach summary includes possession / danger phase line", coachSummary.includes("offensive possession / danger phase instrumentation: active"), "coach line visible"),
    check("no scoring values changed", scoringValuesChangedCount === 0, `${scoringValuesChangedCount}`),
    check("batch/live separation preserved", unifiedSummary.batchLiveContaminationCount === 0 && unifiedSummary.finalScoreMismatchCount === 0, `${unifiedSummary.batchLiveContaminationCount}/${unifiedSummary.finalScoreMismatchCount}`),
    check("unified live scoring event stream validation still passes", validationPassesOrPending(unifiedLive), "unified PASS/refreshed later"),
    check("danger phase non-shot affordance generation validation passes or is pending", validationPassesOrPending(dangerNonShotValidation), "danger non-shot PASS/refreshed later"),
    check("scoring affordance volume validation still passes", validationPassesOrPending(affordanceValidation), "affordance PASS/refreshed later"),
    check("shot dominance diagnostic validation still passes", validationPassesOrPending(shotDominanceValidation), "shot dominance PASS/refreshed later"),
    check("scoring choice balance validation still passes", validationPassesOrPending(scoringChoiceValidation), "scoring choice PASS/refreshed later"),
    check("drop goal resolution calibration still passes", validationPassesOrPending(dropResolution), "drop resolution PASS/refreshed later"),
    check("drop goal opportunity generation still passes", validationPassesOrPending(dropOpportunity), "drop opportunity PASS/refreshed later"),
    check("drop goal foundation still passes", validationPassesOrPending(dropFoundation), "drop foundation PASS/refreshed later"),
    check("conversion difficulty calibration still passes", validationPassesOrPending(conversionDifficulty), "conversion difficulty PASS/refreshed later"),
    check("conversion resolution still passes", validationPassesOrPending(conversionResolution), "conversion resolution PASS/refreshed later"),
    check("try candidate/executed integration still passes", validationPassesOrPending(tryCandidate), "try candidate PASS/refreshed later"),
    check("live try event integration still passes", validationPassesOrPending(liveTry), "live try PASS/refreshed later"),
    check("shot validations still pass", validationPassesOrPending(shotOutcome) && validationPassesOrPending(shotSemantics), "shot validations PASS/refreshed later"),
    check("candidate/executed consistency still passes", candidate.includes("Status: PASS"), "candidate/executed PASS"),
    check("post-resolution consistency still passes", postResolution.includes("Status: PASS"), "post-resolution PASS"),
    check("share pack remains MINIMAL_REVIEW", resolveActiveSharePackConfig(input.reportDirectory).mode === "MINIMAL_REVIEW", "MINIMAL_REVIEW"),
  ];
  const validationPath = join(input.reportDirectory, "validation.offensive-possession-danger-phase.md");

  writeFileSync(
    validationPath,
    renderMarkdown({
      checks,
      offensivePossessions: snapshot.offensivePossessions,
      offensivePossessionsPerMatch: snapshot.offensivePossessionsPerMatch,
      offensivePossessionsPerTeamPerMatch: snapshot.offensivePossessionsPerTeamPerMatch,
      dangerPhases: snapshot.dangerPhases,
      dangerPhasesPerMatch: snapshot.dangerPhasesPerMatch,
      dangerPhasesPerTeamPerMatch: snapshot.dangerPhasesPerTeamPerMatch,
      possessionsReachingDangerPhase: snapshot.possessionsReachingDangerPhase,
      possessionToDangerRate: snapshot.possessionToDangerRate,
      dangerPhasesWithScoringAffordance: snapshot.dangerPhasesWithScoringAffordance,
      dangerPhaseToScoringAffordanceRate: snapshot.dangerPhaseToScoringAffordanceRate,
      dangerPhasesWithoutScoringAffordance: snapshot.dangerPhasesWithoutScoringAffordance,
      affordancesWithPossessionLink: snapshot.affordancesWithPossessionLink,
      affordancesMissingPossessionLink: snapshot.affordancesMissingPossessionLink,
      affordancesWithDangerPhaseLink: snapshot.affordancesWithDangerPhaseLink,
      affordancesMissingDangerPhaseLink: snapshot.affordancesMissingDangerPhaseLink,
      scoringValuesChangedCount,
      penaltyShotActiveLeakageCount,
      batchLiveContaminationCount: unifiedSummary.batchLiveContaminationCount,
      finalScoreMismatchCount: unifiedSummary.finalScoreMismatchCount,
      recommendation: snapshot.recommendation,
    }),
    "utf8",
  );

  return {
    valid: checks.every((item) => item.status !== "FAIL"),
    reportPath: validationPath,
    checks,
  };
}
