import {
  buildFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel,
  renderFullMatchGoalkeeperSecureResetBreakSpecificity6LDoc,
  renderFullMatchGoalkeeperSecureResetBreakSpecificity6LValidation,
} from "./fullMatchGoalkeeperSecureResetBreakSpecificityCalibration";
import { auditFullMatchGoalkeeperSecureBreak } from "../simulation/fullMatch/fullMatchGoalkeeperSecureBreakAudit";
import { auditFullMatchResetBreakSpecificity } from "../simulation/fullMatch/fullMatchResetBreakSpecificityAudit";
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
}): MatchEvent {
  const scoreValue = input.scoreValue ?? 0;
  return {
    eventId: input.eventId,
    matchId: "goalkeeper-secure-reset-6l-test",
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
      reason: "goalkeeper secure reset regression fixture",
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
    narrativeWeight: 70,
  };
}

function reportWithTimeline(timeline: readonly MatchEvent[]): MatchReport {
  return {
    matchId: "goalkeeper-secure-reset-6l-test",
    score: { home: 3, away: 0 },
    evidenceFacts: [],
    warnings: [],
    reportMeta: {
      reportScope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      generatorVersion: "goalkeeper-secure-reset-6l-test",
      generatedFrom: "runFullMatch",
      sourceOfTruthNote: "goalkeeper secure reset regression fixture",
      limitations: [],
    },
    timeline,
    teamStats: [
      { teamId: "CONTROL", score: 3 },
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
    eventId: "gk-reset-1",
    tick: 2,
    teamId: "BLITZ",
    tags: [
      "official_route_family_CONTINUATION",
      "goalkeeper_secure_reset_break_6l",
      "GOALKEEPER_SECURE_BREAKS_CHAIN",
      "GOALKEEPER_SECURE_POSSESSION_RESET",
      "GOALKEEPER_SECURE_SAFE_RESTART",
      "GOALKEEPER_SECURE_NEUTRAL_RESTART",
      "neutral_phase_breaks_momentum",
      "reset_breaks_dominance",
    ],
  }),
  event({
    eventId: "blitz-next-1",
    tick: 3,
    teamId: "BLITZ",
    tags: ["official_route_family_CONTINUATION"],
  }),
]);

const goalkeeperAudit = auditFullMatchGoalkeeperSecureBreak(fixtureReport);
assertTest(goalkeeperAudit.goalkeeperSecureOfficialEventCount === 1, "6L goalkeeper secure reset must be official.");
assertTest(goalkeeperAudit.goalkeeperSecureBreaksDominanceRate === 100, "6L goalkeeper secure reset must break dominance in fixture.");
assertTest(goalkeeperAudit.goalkeeperSecureToSafePossessionRate === 100, "6L goalkeeper secure reset must lead to safe possession in fixture.");

const resetAudit = auditFullMatchResetBreakSpecificity(fixtureReport);
assertTest(resetAudit.protectedResetCount === 1, "6L reset must protect the post-score restart fixture.");
assertTest(resetAudit.concedingTeamFirstPossessionCount === 1, "6L reset must give the conceding team first possession in fixture.");
assertTest(resetAudit.scoringTeamImmediateReattackCount === 0, "6L reset must block immediate scoring-team reattack in fixture.");

const model = buildFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel();
const doc = renderFullMatchGoalkeeperSecureResetBreakSpecificity6LDoc(model);
const validation = renderFullMatchGoalkeeperSecureResetBreakSpecificity6LValidation(model);

assertTest(model.scope === "FULL_MATCH_GOALKEEPER_SECURE_RESET_BREAK_SPECIFICITY_CALIBRATION", "6L model scope must be official.");
assertTest(model.version === "GOALKEEPER_SECURE_RESET_BREAK_6L", "6L model version must be stable.");
assertTest(model.matchCount >= 50, "6L calibration must run at least 50 matches.");
assertTest(model.goalkeeperSecureAudits.length >= 50, "6L goalkeeper secure audits must exist.");
assertTest(model.resetBreakSpecificityAudits.length >= 50, "6L reset specificity audits must exist.");
assertTest(model.goalkeeperSecureBreakCountAfter >= 0, "6L must measure goalkeeper secure breaks.");
assertTest(model.goalkeeperSecureBreaksDominanceRateAfter >= 0, "6L must measure goalkeeper secure break dominance rate.");
assertTest(model.postScoreImmediateReattackRateAfter >= 0, "6L must measure post-score immediate reattack.");
assertTest(model.postScoreResetProtectedRateAfter >= 0, "6L must measure protected reset.");
assertTest(model.concedingTeamFirstPossessionRateAfter >= 0, "6L must measure conceding-team first possession.");
assertTest(model.dominanceDecayApplicationsPerEligibleWindow >= 0, "6L must clarify dominance decay frequency.");
assertTest(model.scoreFromScoreChangeAllRuns, "6L official score must come from score_change consequences.");
assertTest(model.officialPathConnectedAllRuns, "6L official path must stay connected.");
assertTest(!model.scoreCapApplied, "6L must not apply score ceilings.");
assertTest(!model.postHocRewriteApplied, "6L must not rewrite scores.");
assertTest(!model.scoringEventsDeleted, "6L must not delete scoring events.");
assertTest(!model.forcedOpponentScoreApplied, "6L must not force opponent scores.");
assertTest(!model.forcedTrailingTeamScoreApplied, "6L must not force trailing-team scores.");
assertTest(!model.MatchBonusEventChanged, "6L must not mutate MatchBonusEvent.");
assertTest(model.batchLiveSeparationPreserved, "6L batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "6L persistence and SQLite must not score.");
assertTest(model.unknownScoringFamilyCount === 0, "6L UNKNOWN scoring family must not leak.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "6L PENALTY_SHOT must not leak.");
assertTest(doc.includes("Dominance Decay Clarified Metrics"), "6L doc must clarify dominance decay metrics.");
assertTest(validation.includes("Explicit Exhaustive Test Command"), "6L validation must include exhaustive command.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");

console.log("fullMatchGoalkeeperSecureResetBreakSpecificityCalibration tests passed.");
