import { buildFullMatchDominanceChainCalibrationModel } from "./fullMatchDominanceChainCalibration";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import { auditFullMatchDominanceChains } from "../simulation/fullMatch/fullMatchDominanceChainAudit";
import { runFullMatch } from "../simulation/runFullMatch";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
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
  readonly pressure?: PressureLevel;
  readonly eventType?: MatchEvent["eventType"];
  readonly outcome?: MatchEvent["outcome"];
}): MatchEvent {
  const pressure = input.pressure ?? PressureLevel.Medium;
  return {
    eventId: input.eventId,
    matchId: "dominance-review-test",
    timestamp: { tick: input.tick, minute: input.tick, period: "first_half" },
    phase: MatchPhase.InProgress,
    sequenceId: `seq-${input.tick}`,
    teamId: input.teamId,
    opponentTeamId: input.teamId === "CONTROL" ? "BLITZ" : "CONTROL",
    eventType: input.eventType ?? "progression",
    zone: "Z5-C",
    tacticalContext: {
      pressureLevel: pressure,
      ballZone: "Z5-C",
      targetZone: "Z5-C",
      moveType: "TRY_TOUCHDOWN",
      attackingDirection: input.teamId === "CONTROL" ? "left_to_right" : "right_to_left",
      reason: "review regression fixture",
    },
    fatigueContext: {
      teamCondition: 72,
      primaryPlayerCondition: 72,
    },
    outcome: input.outcome ?? "success",
    consequences: [],
    tags: input.tags,
    narrativeWeight: 70,
  };
}

function reportWithTimeline(timeline: readonly MatchEvent[]): MatchReport {
  return {
    matchId: "dominance-review-test",
    score: { home: 0, away: 0 },
    evidenceFacts: [],
    warnings: [],
    reportMeta: {
      reportScope: "FULL_MATCH_HARNESS_SINGLE_RUN",
      generatorVersion: "dominance-review-test",
      generatedFrom: "runFullMatch",
      sourceOfTruthNote: "review regression fixture",
      limitations: [],
    },
    timeline,
    teamStats: [],
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

const highPressureAudit = auditFullMatchDominanceChains(reportWithTimeline([
  event({
    eventId: "high-pressure-try-1",
    tick: 1,
    teamId: "CONTROL",
    pressure: PressureLevel.High,
    tags: ["official_route_family_candidate", "official_route_family_TRY_TOUCHDOWN"],
  }),
  event({
    eventId: "high-pressure-try-2",
    tick: 2,
    teamId: "CONTROL",
    pressure: PressureLevel.High,
    tags: ["official_route_family_candidate", "official_route_family_TRY_TOUCHDOWN"],
  }),
]));

assertTest(
  highPressureAudit.dominantTeamOpportunityChainMax === 2,
  "high-pressure scoring opportunities must extend dominance chains instead of being pressure breaks.",
);
assertTest(
  highPressureAudit.pressureBreaksDominanceCount === 0,
  "high-pressure opportunity events must not be counted as pressure break events.",
);

const generatedReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
const nonDominanceContinuationTags = generatedReport.timeline.filter((item) =>
  item.tags.includes("official_route_family_CONTINUATION") &&
  !(item.tacticalContext.reason ?? "").includes("Dominance chain calibration")
);

assertTest(
  nonDominanceContinuationTags.length > 0,
  "fixture must include non-dominance continuations for 6J tag regression coverage.",
);
assertTest(
  nonDominanceContinuationTags.every((item) => !item.tags.includes("dominance_chain_calibration_6j") && !item.tags.includes("dominance_decay_applied")),
  "non-dominance continuations must not be tagged as 6J dominance decay.",
);

const model = buildFullMatchDominanceChainCalibrationModel();

assertTest(model.scope === "FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION", "6J model scope must be official.");
assertTest(model.version === "DOMINANCE_CHAIN_6J", "6J model version must be stable.");
assertTest(model.matchCount >= 50, "6J calibration must run at least 50 matches.");
assertTest(model.baselineVersion === "TEAM_OPPORTUNITY_BALANCE_6I", "6J baseline must reference 6I.");
assertTest(model.dominanceAudits.length >= 50, "6J dominance audits must exist.");
assertTest(model.dominantTeamOpportunityChainMaxAfter >= 0, "dominance opportunity chain must be measured.");
assertTest(model.dominantTeamDangerPhaseChainMaxAfter >= 0, "dominance danger chain must be measured.");
assertTest(model.dominantTeamScoringEventChainMaxAfter >= 0, "dominance scoring chain must be measured.");
assertTest(model.sameTeamConsecutiveOpportunityRateAfter >= 0 && model.sameTeamConsecutiveOpportunityRateAfter <= 100, "same-team opportunity rate must be bounded.");
assertTest(model.sameFamilyConsecutiveOpportunityRateAfter >= 0 && model.sameFamilyConsecutiveOpportunityRateAfter <= 100, "same-family opportunity rate must be bounded.");
assertTest(model.postScoreImmediateReattackRateAfter >= 0 && model.postScoreImmediateReattackRateAfter <= 100, "post-score reattack rate must be bounded.");
assertTest(model.resetBreaksDominanceRateAfter >= 0 && model.resetBreaksDominanceRateAfter <= 100, "reset break rate must be bounded.");
assertTest(model.defensiveRecoveryBreaksDominanceRateAfter >= 0 && model.defensiveRecoveryBreaksDominanceRateAfter <= 100, "defensive recovery break rate must be bounded.");
assertTest(model.goalkeeperSecureBreaksDominanceRateAfter >= 0 && model.goalkeeperSecureBreaksDominanceRateAfter <= 100, "goalkeeper secure break rate must be bounded.");
assertTest(model.dominanceDecayAppliedCount >= 0, "dominance decay application count must be measured.");
assertTest(model.status !== "PASS" || model.dominantTeamOpportunityChainMaxAfter < model.dominantTeamOpportunityChainMaxBefore, "PASS requires dominance chain reduction.");
assertTest(model.status !== "PASS" || model.sameTeamConsecutiveOpportunityRateAfter < model.sameTeamConsecutiveOpportunityRateBefore, "PASS requires same-team chain reduction.");
assertTest(model.status !== "PASS" || model.sameFamilyConsecutiveOpportunityRateAfter < model.sameFamilyConsecutiveOpportunityRateBefore, "PASS requires same-family repeat reduction.");
assertTest(model.densityCalibrationPreserved, "6J must preserve 6H/6I density calibration.");
assertTest(model.teamOpportunityBalancePreserved, "6J must preserve team opportunity balance.");
assertTest(model.routeFamilyDiversityPreserved, "6J must preserve route family diversity.");
assertTest(model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN > 0, "TRY route must remain available.");
assertTest(model.routeFamilyMixByTeam.home.DROP_GOAL + model.routeFamilyMixByTeam.away.DROP_GOAL > 0, "DROP route must remain available.");
assertTest(
  model.routeFamilyMixByTeam.home.CONVERSION_GOAL + model.routeFamilyMixByTeam.away.CONVERSION_GOAL <=
    model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN,
  "CONVERSION must only follow TRY.",
);
assertTest(model.routeFamilyMixByTeam.home.CONTINUATION + model.routeFamilyMixByTeam.away.CONTINUATION > 0, "CONTINUATION must remain available.");
assertTest(model.scoreFromScoreChangeAllRuns, "official score must come from score_change consequences.");
assertTest(model.officialPathConnectedAllRuns, "official route path must stay connected.");
assertTest(model.calibrationsAppliedAllRuns, "calibrations must be applied in all runs.");
assertTest(!model.scoreCapApplied, "6J must not apply score caps.");
assertTest(!model.postHocRewriteApplied, "6J must not rewrite scores.");
assertTest(!model.scoringEventsDeleted, "6J must not delete scoring events.");
assertTest(!model.forcedOpponentScoreApplied, "6J must not force opponent scores.");
assertTest(!model.forcedTrailingTeamScoreApplied, "6J must not force trailing-team scores.");
assertTest(!model.MatchBonusEventChanged, "6J must not mutate MatchBonusEvent.");
assertTest(model.batchLiveSeparationPreserved, "batch/live separation must remain preserved.");
assertTest(!model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "persistence and SQLite must not score.");
assertTest(model.unknownScoringFamilyCount === 0, "UNKNOWN scoring family must not leak.");
assertTest(model.penaltyShotActiveLeakageCount === 0, "PENALTY_SHOT must not leak.");
assertTest(model.noRollbackToShotOnly, "6J must not roll back to SHOT_ONLY.");
assertTest(
  !(model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") &&
    (model.warnings.includes("BLOWOUT_RATE_STILL_TOO_HIGH") ||
      model.warnings.includes("DOMINANCE_CHAIN_STILL_TOO_LONG") ||
      model.warnings.includes("TEAM_BALANCE_REGRESSED"))),
  "6J must not emit contradictory healthy warning.",
);
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3 points.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5 points.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2 points.");
assertTest(scoringRegistryEntry("PENALTY_SHOT").active === false, "PENALTY_SHOT must remain inactive.");

console.log("fullMatchDominanceChainCalibration tests passed.");
