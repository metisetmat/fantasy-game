import { buildFullMatchBreakEventPostScoreResetCalibrationModel } from "./fullMatchBreakEventPostScoreResetCalibration";
import { auditFullMatchPostScoreReset } from "../simulation/fullMatch/fullMatchPostScoreResetAudit";
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
    matchId: "post-score-reset-test",
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
      moveType: "TRY_TOUCHDOWN",
      attackingDirection: input.teamId === "CONTROL" ? "left_to_right" : "right_to_left",
      reason: "post-score reset regression fixture",
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
    matchId: "post-score-reset-test",
    score: { home: 3, away: 0 },
    evidenceFacts: [],
    warnings: [],
    reportMeta: {
      reportScope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      generatorVersion: "post-score-reset-test",
      generatedFrom: "runFullMatch",
      sourceOfTruthNote: "post-score reset regression fixture",
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

const immediateAudit = auditFullMatchPostScoreReset(reportWithTimeline([
  event({
    eventId: "score-1",
    tick: 1,
    teamId: "CONTROL",
    scoreValue: 3,
    tags: ["official_route_family_SHOT_GOAL"],
  }),
  event({
    eventId: "reattack-1",
    tick: 2,
    teamId: "CONTROL",
    tags: ["official_route_family_TRY_TOUCHDOWN"],
  }),
]));

assertTest(immediateAudit.postScoreImmediateReattackCount === 1, "same-team follow-up without reset must count as post-score immediate reattack.");
assertTest(immediateAudit.postScoreResetProtectedCount === 0, "unprotected reattack must not count as protected reset.");

const protectedAudit = auditFullMatchPostScoreReset(reportWithTimeline([
  event({
    eventId: "score-2",
    tick: 1,
    teamId: "CONTROL",
    scoreValue: 3,
    tags: ["official_route_family_SHOT_GOAL"],
  }),
  event({
    eventId: "reset-2",
    tick: 2,
    teamId: "CONTROL",
    tags: [
      "official_route_family_CONTINUATION",
      "official_route_family_non_scoring_outcome",
      "break_event_post_score_reset_6k",
      "post_score_reset_protected",
      "post_score_dominance_decay_applied",
    ],
  }),
  event({
    eventId: "reattack-2",
    tick: 3,
    teamId: "CONTROL",
    tags: ["official_route_family_TRY_TOUCHDOWN"],
  }),
]));

assertTest(protectedAudit.postScoreImmediateReattackCount === 0, "same-team follow-up after protected reset must not count as immediate reattack.");
assertTest(protectedAudit.postScoreResetProtectedCount === 1, "protected reset must be counted.");
assertTest(protectedAudit.dominanceDecayAppliedCount >= 1, "protected reset must count as applied dominance decay.");

const model = buildFullMatchBreakEventPostScoreResetCalibrationModel();

assertTest(model.scope === "FULL_MATCH_BREAK_EVENT_POST_SCORE_RESET_CALIBRATION", "6K model scope must be official.");
assertTest(model.version === "BREAK_EVENT_POST_SCORE_RESET_6K", "6K model version must be stable.");
assertTest(model.matchCount >= 50, "6K calibration must run at least 50 matches.");
assertTest(model.baselineVersion === "DOMINANCE_CHAIN_6J", "6K baseline must reference 6J.");
assertTest(model.postScoreAudits.length >= 50, "6K post-score audits must exist.");
assertTest(model.postScoreImmediateReattackRateAfter >= 0 && model.postScoreImmediateReattackRateAfter <= 100, "post-score reattack rate must be bounded.");
assertTest(model.postScoreResetProtectedCount > 0, "6K must create protected post-score reset evidence.");
assertTest(model.dominanceDecayAppliedCount > 0, "6K must apply dominance decay evidence.");
assertTest(model.densityCalibrationPreserved, "6K must preserve density calibration.");
assertTest(model.routeFamilyMixPreserved, "6K must preserve route family mix.");
assertTest(model.scoreFromScoreChangeAllRuns, "official score must come from score_change consequences.");
assertTest(model.officialPathConnectedAllRuns, "official route path must stay connected.");
assertTest(model.calibrationsAppliedAllRuns, "calibrations must be applied in all runs.");
assertTest(!model.scoreCapApplied, "6K must not apply score ceilings.");
assertTest(!model.postHocRewriteApplied, "6K must not rewrite scores.");
assertTest(!model.scoringEventsDeleted, "6K must not delete scoring events.");
assertTest(!model.forcedOpponentScoreApplied, "6K must not force opponent scores.");
assertTest(!model.forcedTrailingTeamScoreApplied, "6K must not force trailing-team scores.");
assertTest(!model.MatchBonusEventChanged, "6K must not mutate MatchBonusEvent.");
assertTest(model.batchLiveSeparationPreserved, "batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "persistence and SQLite must not score.");
assertTest(model.unknownScoringFamilyCount === 0, "UNKNOWN scoring family must not leak.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT must not leak.");
assertTest(model.noRollbackToShotOnly, "6K must not roll back to SHOT_ONLY.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");

console.log("fullMatchBreakEventPostScoreResetCalibration tests passed.");
