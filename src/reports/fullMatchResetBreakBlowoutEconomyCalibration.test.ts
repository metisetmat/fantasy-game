import {
  buildFullMatchResetBreakBlowoutEconomyCalibrationModel,
  renderFullMatchResetBreakBlowoutEconomy6MDoc,
  renderFullMatchResetBreakBlowoutEconomy6MValidation,
} from "./fullMatchResetBreakBlowoutEconomyCalibration";
import { auditFullMatchBlowoutEconomy } from "../simulation/fullMatch/fullMatchBlowoutEconomyAudit";
import { auditFullMatchResetToDangerQuality } from "../simulation/fullMatch/fullMatchResetToDangerQualityAudit";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import type { MatchEvent, MatchReport } from "../contracts/engineToCoach";
import { MatchPhase, PressureLevel } from "../models/match";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function event(input: {
  readonly eventId: string;
  readonly tick: number;
  readonly teamId: string;
  readonly tags: readonly string[];
  readonly eventType?: MatchEvent["eventType"];
  readonly outcome?: MatchEvent["outcome"];
  readonly scoreValue?: number;
  readonly narrativeWeight?: number;
}): MatchEvent {
  const scoreValue = input.scoreValue ?? 0;
  return {
    eventId: input.eventId,
    matchId: "reset-break-blowout-6m-test",
    timestamp: { tick: input.tick, minute: input.tick, period: "first_half" },
    phase: MatchPhase.InProgress,
    sequenceId: `seq-${input.tick}`,
    teamId: input.teamId,
    opponentTeamId: input.teamId === "CONTROL" ? "BLITZ" : "CONTROL",
    eventType: input.eventType ?? (scoreValue > 0 ? "scoring" : "progression"),
    zone: "Z5-C",
    tacticalContext: {
      pressureLevel: PressureLevel.Medium,
      ballZone: "Z5-C",
      targetZone: "Z5-C",
      moveType: "CONTINUATION",
      attackingDirection: input.teamId === "CONTROL" ? "left_to_right" : "right_to_left",
      reason: "reset break blowout economy regression fixture",
    },
    fatigueContext: {
      teamCondition: 72,
      primaryPlayerCondition: 72,
    },
    outcome: input.outcome ?? (scoreValue > 0 ? "score" : "neutral"),
    consequences: scoreValue > 0
      ? [{ type: "score_change", description: "fixture score", value: scoreValue }]
      : [],
    tags: input.tags,
    narrativeWeight: input.narrativeWeight ?? 70,
  };
}

function reportWithTimeline(timeline: readonly MatchEvent[]): MatchReport {
  return {
    matchId: "reset-break-blowout-6m-test",
    score: { home: 9, away: 0 },
    evidenceFacts: [],
    warnings: [],
    reportMeta: {
      reportScope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      generatorVersion: "reset-break-blowout-6m-test",
      generatedFrom: "runFullMatch",
      sourceOfTruthNote: "reset break blowout economy regression fixture",
      limitations: [],
    },
    timeline,
    teamStats: [
      { teamId: "CONTROL", score: 9 },
      { teamId: "BLITZ", score: 0 },
    ],
    playerStats: [],
    zoneStats: [],
    fatigueReport: {
      teamSummaries: [],
      playerSummaries: [],
    },
    tacticalReport: {
      diagnoses: [],
    },
    keyMoments: [],
    coachInsights: [],
    suggestedFocus: [],
  };
}

const fixtureReport = reportWithTimeline([
  event({
    eventId: "score-1",
    tick: 1,
    teamId: "CONTROL",
    scoreValue: 3,
    tags: ["official_route_family_SHOT_GOAL"],
  }),
  event({
    eventId: "reset-1",
    tick: 2,
    teamId: "BLITZ",
    tags: ["official_route_family_CONTINUATION", "safe_restart", "neutral_phase_breaks_momentum"],
    outcome: "neutral",
  }),
  event({
    eventId: "danger-1",
    tick: 3,
    teamId: "CONTROL",
    tags: ["official_route_family_SHOT_GOAL"],
    eventType: "scoring",
    outcome: "success",
    narrativeWeight: 55,
  }),
]);

const resetQuality = auditFullMatchResetToDangerQuality(fixtureReport);
assertTest(resetQuality.resetToDangerCount > 0, "reset-to-danger quality audit must detect fixture danger.");
assertTest(resetQuality.resetToImmediateDangerCount > 0, "reset-to-danger quality audit must detect immediate danger.");
assertTest(resetQuality.automaticDangerSuspicionCount > 0, "low-justification immediate danger must be suspicious.");

const blowoutAudit = auditFullMatchBlowoutEconomy(fixtureReport, resetQuality);
assertTest(blowoutAudit.scoreDifference === 9, "blowout audit must measure score difference.");
assertTest(blowoutAudit.blowoutRootCauseCodes.includes("RESET_TO_DANGER_TOO_FAST"), "blowout audit must classify fast reset danger.");

const model = buildFullMatchResetBreakBlowoutEconomyCalibrationModel();
const doc = renderFullMatchResetBreakBlowoutEconomy6MDoc(model);
const validation = renderFullMatchResetBreakBlowoutEconomy6MValidation(model);

assertTest(model.scope === "FULL_MATCH_RESET_BREAK_BLOWOUT_ECONOMY_CALIBRATION", "6M model scope must be official.");
assertTest(model.version === "RESET_BREAK_BLOWOUT_ECONOMY_6M", "6M model version must be stable.");
assertTest(model.matchCount >= 50, "6M calibration must run at least 50 matches.");
assertTest(model.blowoutAudits.length >= 50, "6M blowout audits must exist.");
assertTest(model.resetToDangerQualityAudits.length >= 50, "6M reset-to-danger quality audits must exist.");
assertTest(model.scoreFromScoreChangeAllRuns, "6M official score must come from score_change consequences.");
assertTest(model.officialPathConnectedAllRuns, "6M official path must stay connected.");
assertTest(!model.scoreCapApplied, "6M must not apply score caps.");
assertTest(!model.postHocRewriteApplied, "6M must not rewrite scores.");
assertTest(!model.scoringEventsDeleted, "6M must not delete scoring events.");
assertTest(!model.forcedOpponentScoreApplied, "6M must not force opponent scores.");
assertTest(!model.forcedTrailingTeamScoreApplied, "6M must not force trailing-team scores.");
assertTest(!model.MatchBonusEventChanged, "6M must not mutate MatchBonusEvent.");
assertTest(model.batchLiveSeparationPreserved, "6M batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "6M persistence and SQLite must not score.");
assertTest(model.unknownScoringFamilyCount === 0, "6M UNKNOWN scoring family must not leak.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "6M PENALTY_SHOT must not leak.");
assertTest(doc.includes("Blowout Root Cause Audit Summary"), "6M doc must include root cause table.");
assertTest(doc.includes("Reset-To-Danger Quality Audit Summary"), "6M doc must include reset-to-danger table.");
assertTest(validation.includes("Explicit Exhaustive Test Command"), "6M validation must include exhaustive command.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");

console.log("fullMatchResetBreakBlowoutEconomyCalibration tests passed.");
