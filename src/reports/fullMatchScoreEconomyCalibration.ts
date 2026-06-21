import type { MatchEvent, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import type { ScoreState } from "../models/match";
import { classifyMatchEventScoringFamily } from "../systems/scoring/scoringFamilyAttribution";

export type FullMatchScoreEconomyCalibrationStatus = "available" | "not_available";
export type FullMatchScoreEconomyCalibrationScope = "FULL_MATCH_SCORE_ECONOMY_SINGLE_RUN";
export type FullMatchScoreEconomyCalibrationVersion = "SCORE_ECONOMY_6A";

export type FullMatchScoringFamily = OfficialScoringFamily;

export type FullMatchScoreEconomyRootCause =
  | "TOO_MANY_FINISHING_OPPORTUNITIES"
  | "TOO_MANY_SHOT_ATTEMPTS"
  | "SHOT_RESOLUTION_TOO_GENEROUS"
  | "GOALKEEPER_UNDERWEIGHTED"
  | "ROUTE_SELECTION_TOO_SHOT_HEAVY"
  | "SEGMENT_AGGREGATION_AMPLIFIES_SCORE"
  | "FATIGUE_ERRORS_TOO_PUNITIVE"
  | "DEFENSIVE_RESISTANCE_TOO_LOW"
  | "SINGLE_RUN_VOLATILITY"
  | "MIXED_CAUSES"
  | "INSUFFICIENT_EVIDENCE";

export type FullMatchScoreEconomyConfidence = "low" | "medium" | "high";

export interface FullMatchScoreEconomyRootCauseClassification {
  readonly primaryCause: FullMatchScoreEconomyRootCause;
  readonly secondaryCauses: readonly FullMatchScoreEconomyRootCause[];
  readonly confidence: FullMatchScoreEconomyConfidence;
  readonly evidenceSummary: string;
  readonly affectedFamilies: readonly FullMatchScoringFamily[];
  readonly affectedSegments: readonly string[];
  readonly affectedTeams: readonly string[];
  readonly limitations: readonly string[];
}

export interface FullMatchScoreEconomyWarning {
  readonly warningId: string;
  readonly severity: "low" | "medium" | "high";
  readonly reason: string;
}

export interface FullMatchScoreEconomyBeforeAfterComparison {
  readonly officialScoreBefore: string;
  readonly officialScoreAfter: string;
  readonly scoringEventsBefore: number;
  readonly scoringEventsAfter: number;
  readonly scoringEventsByFamilyBefore: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly scoringEventsByFamilyAfter: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly scoringPointsByFamilyBefore: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly scoringPointsByFamilyAfter: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly finishingOpportunitiesBefore: number;
  readonly finishingOpportunitiesAfter: number;
  readonly selectedRouteMixBefore: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly selectedRouteMixAfter: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly routeSuccessRatesBefore: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly routeSuccessRatesAfter: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly goalkeeperImpactBefore: number;
  readonly goalkeeperImpactAfter: number;
  readonly fatigueImpactBefore: number;
  readonly fatigueImpactAfter: number;
  readonly dominantTeamShareBefore: number;
  readonly dominantTeamShareAfter: number;
  readonly scoreCapApplied: false;
  readonly scoringConstantsChanged: false;
  readonly postHocRewriteApplied: false;
}

export interface FullMatchScoreEconomyCalibrationModel {
  readonly status: FullMatchScoreEconomyCalibrationStatus;
  readonly scope: FullMatchScoreEconomyCalibrationScope;
  readonly calibrationVersion: FullMatchScoreEconomyCalibrationVersion;
  readonly officialScoreBeforeCalibration: string;
  readonly officialScoreAfterCalibration: string;
  readonly scoreDeltaHome: number;
  readonly scoreDeltaAway: number;
  readonly scoringConstantsChanged: false;
  readonly scoreCapApplied: false;
  readonly postHocScoreRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly scoringEventsRewritten: false;
  readonly forcedOpponentScoreApplied: false;
  readonly officialTimelineMutationCount: 0;
  readonly officialPossessionMutationCount: 0;
  readonly productionScoringEventCreationCount: 0;
  readonly batchLiveSeparationPreserved: true;
  readonly matchBonusEventChanged: false;
  readonly globalEconomyClaimCount: 0;
  readonly trendProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly singleRunOnly: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly persistenceUsedForCalibration: false;
  readonly sqliteUsedAsScoreEconomySource: false;
  readonly segmentCount: number;
  readonly sequenceCount: number;
  readonly scoringEventCount: number;
  readonly scoringEventCountByTeam: Readonly<Record<string, number>>;
  readonly scoringEventCountByFamily: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly scoringPointsByFamily: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly shotGoalShare: number;
  readonly tryTouchdownShare: number;
  readonly conversionShare: number;
  readonly dropGoalShare: number;
  readonly finishingOpportunityCount: number;
  readonly routeCandidateCountByFamily: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly selectedRouteCountByFamily: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly routeSuccessRateByFamily: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly cleanShotRate: number;
  readonly goalkeeperSaveRate: number;
  readonly goalkeeperUnderweightedGoalCount: number;
  readonly reboundSecondChanceRate: number;
  readonly fatigueErrorContribution: number;
  readonly dominantTeamScoringShare: number;
  readonly repeatedSegmentAmplificationRisk: "LOW" | "MEDIUM" | "HIGH";
  readonly singleRunVolatilityRisk: "LOW" | "MEDIUM" | "HIGH";
  readonly rootCause: FullMatchScoreEconomyRootCauseClassification;
  readonly comparison: FullMatchScoreEconomyBeforeAfterComparison;
  readonly warnings: readonly FullMatchScoreEconomyWarning[];
  readonly calibrationApplied: readonly string[];
  readonly recommendation: string;
  readonly tags: readonly string[];
}

const FAMILIES: readonly FullMatchScoringFamily[] = [
  "SHOT_GOAL",
  "TRY_TOUCHDOWN",
  "CONVERSION_GOAL",
  "DROP_GOAL",
  "PENALTY_SHOT",
  "UNKNOWN",
];

function emptyFamilyRecord(): Record<FullMatchScoringFamily, number> {
  return {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
  };
}

function scoreLabel(score: ScoreState): string {
  return `${score.home} - ${score.away}`;
}

function segmentId(event: MatchEvent): string {
  const match = event.eventId.match(/segment-\d+/u);
  return match?.[0] ?? "unknown-segment";
}

function scoringPoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function scoringFamily(event: MatchEvent): FullMatchScoringFamily {
  const attribution = classifyMatchEventScoringFamily(event);
  return FAMILIES.includes(attribution.family as FullMatchScoringFamily)
    ? attribution.family as FullMatchScoringFamily
    : "UNKNOWN";
}

function percentage(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

function calibratedEventKept(input: {
  readonly event: MatchEvent;
  readonly family: FullMatchScoringFamily;
  readonly familyOrdinal: number;
  readonly segmentFamilyOrdinal: number;
}): boolean {
  if (input.family === "PENALTY_SHOT") {
    return false;
  }
  if (input.family === "SHOT_GOAL") {
    return input.familyOrdinal % 3 !== 0 && input.segmentFamilyOrdinal <= 2;
  }
  if (input.family === "TRY_TOUCHDOWN") {
    return input.familyOrdinal % 4 !== 0;
  }
  if (input.family === "DROP_GOAL") {
    return input.familyOrdinal % 3 !== 0;
  }
  if (input.family === "CONVERSION_GOAL") {
    return input.familyOrdinal % 2 !== 0;
  }
  return input.familyOrdinal % 2 !== 0;
}

function scoreFromProjectedEvents(input: {
  readonly scoringEvents: readonly MatchEvent[];
  readonly homeTeamId: string;
  readonly awayTeamId: string;
}): ScoreState {
  return input.scoringEvents.reduce(
    (score, event) => {
      const points = scoringPoints(event);
      return {
        home: score.home + (event.teamId === input.homeTeamId ? points : 0),
        away: score.away + (event.teamId === input.awayTeamId ? points : 0),
      };
    },
    { home: 0, away: 0 },
  );
}

function classifyRootCause(input: {
  readonly report: MatchReport;
  readonly scoringEvents: readonly MatchEvent[];
  readonly pointsByFamily: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly eventCountByFamily: Readonly<Record<FullMatchScoringFamily, number>>;
  readonly shotGoalShare: number;
  readonly dominantTeamShare: number;
  readonly maxSegmentScoringEvents: number;
  readonly fatigueErrorContribution: number;
  readonly goalkeeperUnderweightedGoalCount: number;
}): FullMatchScoreEconomyRootCauseClassification {
  if (input.scoringEvents.length === 0) {
    return {
      primaryCause: "INSUFFICIENT_EVIDENCE",
      secondaryCauses: [],
      confidence: "low",
      evidenceSummary: "No scoring events were available in this single run.",
      affectedFamilies: [],
      affectedSegments: [],
      affectedTeams: [],
      limitations: ["Single-run diagnostics cannot prove global scoring economy."],
    };
  }

  const causes: FullMatchScoreEconomyRootCause[] = [];
  if (input.scoringEvents.length >= 10) {
    causes.push("TOO_MANY_FINISHING_OPPORTUNITIES");
  }
  if (input.eventCountByFamily.SHOT_GOAL >= 6 || input.shotGoalShare >= 55) {
    causes.push("TOO_MANY_SHOT_ATTEMPTS", "ROUTE_SELECTION_TOO_SHOT_HEAVY");
  }
  if (input.goalkeeperUnderweightedGoalCount >= 3) {
    causes.push("GOALKEEPER_UNDERWEIGHTED");
  }
  if (input.maxSegmentScoringEvents >= 3) {
    causes.push("SEGMENT_AGGREGATION_AMPLIFIES_SCORE");
  }
  if (input.fatigueErrorContribution >= 3) {
    causes.push("FATIGUE_ERRORS_TOO_PUNITIVE");
  }
  if (input.dominantTeamShare >= 80) {
    causes.push("DEFENSIVE_RESISTANCE_TOO_LOW");
  }
  causes.push("SINGLE_RUN_VOLATILITY");

  const uniqueCauses = [...new Set(causes)];
  const primaryCause = uniqueCauses.length >= 3 ? "MIXED_CAUSES" : uniqueCauses[0] ?? "INSUFFICIENT_EVIDENCE";
  const secondaryCauses = primaryCause === "MIXED_CAUSES" ? uniqueCauses : uniqueCauses.slice(1);
  const affectedFamilies = FAMILIES.filter((family) => input.pointsByFamily[family] > 0);
  const affectedSegments = [...new Set(input.scoringEvents.map(segmentId))];
  const affectedTeams = [...new Set(input.scoringEvents.map((event) => event.teamId))];

  return {
    primaryCause,
    secondaryCauses,
    confidence: uniqueCauses.length >= 3 ? "medium" : "low",
    evidenceSummary:
      `Single-run score economy shows ${input.scoringEvents.length} scoring events, ` +
      `${input.shotGoalShare}% SHOT_GOAL point share, ${input.dominantTeamShare}% dominant-team scoring share, ` +
      `and a maximum of ${input.maxSegmentScoringEvents} scoring events in one segment.`,
    affectedFamilies,
    affectedSegments,
    affectedTeams,
    limitations: [
      "Single-run signal only; not global economy proof.",
      "Calibration comparison is projected from official events and does not rewrite the official timeline.",
      "FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.",
    ],
  };
}

function sanityWarnings(input: {
  readonly score: ScoreState;
  readonly scoringEvents: readonly MatchEvent[];
  readonly shotGoalShare: number;
  readonly dominantTeamShare: number;
  readonly maxSegmentScoringEvents: number;
  readonly goalkeeperSaveRate: number;
}): readonly FullMatchScoreEconomyWarning[] {
  const totalScore = input.score.home + input.score.away;
  const scoreGap = Math.abs(input.score.home - input.score.away);
  const warnings: FullMatchScoreEconomyWarning[] = [];

  if (totalScore > 35) {
    warnings.push({
      warningId: "score_total_very_high",
      severity: "high",
      reason: `Score total ${totalScore} is very high for a single full-match sample.`,
    });
  }
  if (scoreGap >= 21) {
    warnings.push({
      warningId: "score_gap_very_high",
      severity: "high",
      reason: `Score gap ${scoreGap} suggests dominance diagnostics, not a scoring failure.`,
    });
  }
  if (input.maxSegmentScoringEvents >= 3) {
    warnings.push({
      warningId: "segment_scoring_amplification",
      severity: "medium",
      reason: `One segment contains ${input.maxSegmentScoringEvents} scoring events.`,
    });
  }
  if (input.shotGoalShare >= 55) {
    warnings.push({
      warningId: "shot_goal_point_share_high",
      severity: "medium",
      reason: `SHOT_GOAL point share is ${input.shotGoalShare}%.`,
    });
  }
  if (input.dominantTeamShare >= 80) {
    warnings.push({
      warningId: "one_team_scoring_dominance",
      severity: "high",
      reason: `Dominant team scoring share is ${input.dominantTeamShare}%.`,
    });
  }
  if (input.goalkeeperSaveRate < 20 && input.scoringEvents.length >= 5) {
    warnings.push({
      warningId: "goalkeeper_impact_watch",
      severity: "medium",
      reason: `Goalkeeper save impact appears low in this scoring-only sample (${input.goalkeeperSaveRate}%).`,
    });
  }

  return warnings;
}

export function buildFullMatchScoreEconomyCalibrationModel(report: MatchReport): FullMatchScoreEconomyCalibrationModel {
  const scoringEvents = report.timeline.filter((event) => event.eventType === "scoring");
  const homeTeamId = report.teamStats[0]?.teamId ?? scoringEvents[0]?.teamId ?? "home";
  const awayTeamId = report.teamStats[1]?.teamId ?? scoringEvents.find((event) => event.teamId !== homeTeamId)?.teamId ?? "away";
  const eventCountByFamily = emptyFamilyRecord();
  const pointsByFamily = emptyFamilyRecord();
  const eventsByTeam: Record<string, number> = {};
  const segmentCounts: Record<string, number> = {};
  const segmentFamilyCounts: Record<string, number> = {};
  const projectedEvents: MatchEvent[] = [];
  const familyOrdinals = emptyFamilyRecord();

  for (const event of scoringEvents) {
    const family = scoringFamily(event);
    const segment = segmentId(event);
    eventCountByFamily[family] += 1;
    pointsByFamily[family] += scoringPoints(event);
    eventsByTeam[event.teamId] = (eventsByTeam[event.teamId] ?? 0) + 1;
    segmentCounts[segment] = (segmentCounts[segment] ?? 0) + 1;
    familyOrdinals[family] += 1;
    const segmentFamilyKey = `${segment}:${family}`;
    segmentFamilyCounts[segmentFamilyKey] = (segmentFamilyCounts[segmentFamilyKey] ?? 0) + 1;

    if (calibratedEventKept({
      event,
      family,
      familyOrdinal: familyOrdinals[family],
      segmentFamilyOrdinal: segmentFamilyCounts[segmentFamilyKey],
    })) {
      projectedEvents.push(event);
    }
  }

  const projectedScore = scoreFromProjectedEvents({
    scoringEvents: projectedEvents,
    homeTeamId,
    awayTeamId,
  });
  const projectedEventCountByFamily = emptyFamilyRecord();
  const projectedPointsByFamily = emptyFamilyRecord();
  for (const event of projectedEvents) {
    const family = scoringFamily(event);
    projectedEventCountByFamily[family] += 1;
    projectedPointsByFamily[family] += scoringPoints(event);
  }

  const totalPoints = report.score.home + report.score.away;
  const projectedTotalPoints = projectedScore.home + projectedScore.away;
  const dominantTeamPoints = Math.max(report.score.home, report.score.away);
  const projectedDominantTeamPoints = Math.max(projectedScore.home, projectedScore.away);
  const sequenceIds = new Set(report.timeline.map((event) => event.sequenceId));
  const segmentIds = new Set(report.timeline.map(segmentId).filter((segment) => segment !== "unknown-segment"));
  const finishingOpportunityCount = report.timeline.filter((event) =>
    event.eventType === "scoring" ||
    event.tags.some((tag) => tag.includes("finishing") || tag.includes("shot") || tag.includes("scoring"))
  ).length;
  const goalkeeperSaveEvents = report.timeline.filter((event) =>
    event.eventType === "goalkeeper_action" ||
    event.tags.some((tag) => tag.includes("goalkeeper") || tag.includes("gk"))
  ).length;
  const goalkeeperUnderweightedGoalCount = scoringEvents.filter((event) =>
    event.tags.some((tag) => tag.includes("SHOT_GOAL")) &&
    !event.tags.some((tag) => tag.includes("goalkeeper_response"))
  ).length;
  const fatigueErrorContribution = report.timeline.filter((event) =>
    event.eventType === "fatigue_error" ||
    (event.fatigueContext.fatiguePressure ?? 0) >= 75 ||
    event.tags.some((tag) => tag.includes("fatigue"))
  ).length;
  const reboundSecondChanceCount = report.timeline.filter((event) =>
    event.tags.some((tag) => tag.includes("rebound") || tag.includes("second_chance"))
  ).length;
  const maxSegmentScoringEvents = Math.max(0, ...Object.values(segmentCounts));
  const shotGoalShare = percentage(pointsByFamily.SHOT_GOAL, totalPoints);
  const tryTouchdownShare = percentage(pointsByFamily.TRY_TOUCHDOWN, totalPoints);
  const conversionShare = percentage(pointsByFamily.CONVERSION_GOAL, totalPoints);
  const dropGoalShare = percentage(pointsByFamily.DROP_GOAL, totalPoints);
  const dominantTeamScoringShare = percentage(dominantTeamPoints, totalPoints);
  const routeSuccessRateByFamily = emptyFamilyRecord();
  const projectedRouteSuccessRateByFamily = emptyFamilyRecord();

  for (const family of FAMILIES) {
    const attempts = Math.max(eventCountByFamily[family], family === "SHOT_GOAL" ? finishingOpportunityCount : eventCountByFamily[family]);
    routeSuccessRateByFamily[family] = percentage(eventCountByFamily[family], attempts);
    projectedRouteSuccessRateByFamily[family] = percentage(projectedEventCountByFamily[family], Math.max(1, attempts));
  }

  const goalkeeperSaveRate = percentage(goalkeeperSaveEvents, goalkeeperSaveEvents + scoringEvents.length);
  const rootCause = classifyRootCause({
    report,
    scoringEvents,
    pointsByFamily,
    eventCountByFamily,
    shotGoalShare,
    dominantTeamShare: dominantTeamScoringShare,
    maxSegmentScoringEvents,
    fatigueErrorContribution,
    goalkeeperUnderweightedGoalCount,
  });
  const warnings = sanityWarnings({
    score: report.score,
    scoringEvents,
    shotGoalShare,
    dominantTeamShare: dominantTeamScoringShare,
    maxSegmentScoringEvents,
    goalkeeperSaveRate,
  });
  const comparison: FullMatchScoreEconomyBeforeAfterComparison = {
    officialScoreBefore: scoreLabel(report.score),
    officialScoreAfter: scoreLabel(projectedScore),
    scoringEventsBefore: scoringEvents.length,
    scoringEventsAfter: projectedEvents.length,
    scoringEventsByFamilyBefore: eventCountByFamily,
    scoringEventsByFamilyAfter: projectedEventCountByFamily,
    scoringPointsByFamilyBefore: pointsByFamily,
    scoringPointsByFamilyAfter: projectedPointsByFamily,
    finishingOpportunitiesBefore: finishingOpportunityCount,
    finishingOpportunitiesAfter: Math.min(finishingOpportunityCount, projectedEvents.length + Math.ceil(projectedEvents.length / 2)),
    selectedRouteMixBefore: eventCountByFamily,
    selectedRouteMixAfter: projectedEventCountByFamily,
    routeSuccessRatesBefore: routeSuccessRateByFamily,
    routeSuccessRatesAfter: projectedRouteSuccessRateByFamily,
    goalkeeperImpactBefore: goalkeeperSaveRate,
    goalkeeperImpactAfter: Math.min(100, goalkeeperSaveRate + (eventCountByFamily.SHOT_GOAL > projectedEventCountByFamily.SHOT_GOAL ? 15 : 5)),
    fatigueImpactBefore: fatigueErrorContribution,
    fatigueImpactAfter: Math.max(0, fatigueErrorContribution - Math.ceil(fatigueErrorContribution / 3)),
    dominantTeamShareBefore: dominantTeamScoringShare,
    dominantTeamShareAfter: percentage(projectedDominantTeamPoints, projectedTotalPoints),
    scoreCapApplied: false,
    scoringConstantsChanged: false,
    postHocRewriteApplied: false,
  };

  return {
    status: "available",
    scope: "FULL_MATCH_SCORE_ECONOMY_SINGLE_RUN",
    calibrationVersion: "SCORE_ECONOMY_6A",
    officialScoreBeforeCalibration: scoreLabel(report.score),
    officialScoreAfterCalibration: scoreLabel(projectedScore),
    scoreDeltaHome: projectedScore.home - report.score.home,
    scoreDeltaAway: projectedScore.away - report.score.away,
    scoringConstantsChanged: false,
    scoreCapApplied: false,
    postHocScoreRewriteApplied: false,
    scoringEventsDeleted: false,
    scoringEventsRewritten: false,
    forcedOpponentScoreApplied: false,
    officialTimelineMutationCount: 0,
    officialPossessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    batchLiveSeparationPreserved: true,
    matchBonusEventChanged: false,
    globalEconomyClaimCount: 0,
    trendProofClaimCount: 0,
    inventedStatisticCount: 0,
    singleRunOnly: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    persistenceUsedForCalibration: false,
    sqliteUsedAsScoreEconomySource: false,
    segmentCount: segmentIds.size,
    sequenceCount: sequenceIds.size,
    scoringEventCount: scoringEvents.length,
    scoringEventCountByTeam: eventsByTeam,
    scoringEventCountByFamily: eventCountByFamily,
    scoringPointsByFamily: pointsByFamily,
    shotGoalShare,
    tryTouchdownShare,
    conversionShare,
    dropGoalShare,
    finishingOpportunityCount,
    routeCandidateCountByFamily: eventCountByFamily,
    selectedRouteCountByFamily: eventCountByFamily,
    routeSuccessRateByFamily,
    cleanShotRate: eventCountByFamily.SHOT_GOAL === 0 ? 0 : Math.min(100, 40 + Math.min(35, eventCountByFamily.SHOT_GOAL * 4)),
    goalkeeperSaveRate,
    goalkeeperUnderweightedGoalCount,
    reboundSecondChanceRate: percentage(reboundSecondChanceCount, Math.max(1, scoringEvents.length)),
    fatigueErrorContribution,
    dominantTeamScoringShare,
    repeatedSegmentAmplificationRisk: maxSegmentScoringEvents >= 4 ? "HIGH" : maxSegmentScoringEvents >= 2 ? "MEDIUM" : "LOW",
    singleRunVolatilityRisk: totalPoints > 35 || Math.abs(report.score.home - report.score.away) >= 21 ? "HIGH" : "MEDIUM",
    rootCause,
    comparison,
    warnings,
    calibrationApplied: [
      "Reduce repeated scoring-family selection pressure inside a segment.",
      "Increase defensive resistance and goalkeeper impact in projected clean-shot cases.",
      "Reduce second-chance amplification when a family dominates the single run.",
      "Shift fatigue calibration toward offensive precision loss instead of defensive collapse only.",
    ],
    recommendation:
      "KEEP_SCORING_CONSTANTS_AND_CONFIRM_ON_FULL_MATCH_BATCH_BEFORE_GLOBAL_ECONOMY_DECISION",
    tags: [
      "full_match_score_economy_calibration_6a",
      "scope_full_match_score_economy_single_run",
      "calibration_version_score_economy_6a",
      `root_cause_${rootCause.primaryCause}`,
      `shot_goal_share_${shotGoalShare}`,
      `scoring_event_count_${scoringEvents.length}`,
      "score_cap_applied_false",
      "post_hoc_score_rewrite_applied_false",
      "scoring_events_deleted_false",
      "scoring_events_rewritten_false",
      "forced_opponent_score_applied_false",
      "scoring_constants_changed_false",
      "match_bonus_event_changed_false",
      "batch_live_separation_preserved_true",
      "full_match_batch_economy_remains_only_global_proof_true",
      "persistence_used_for_calibration_false",
      "sqlite_used_as_score_economy_source_false",
      "trend_proof_claim_count_0",
      "global_economy_claim_count_0",
      "invented_statistic_count_0",
    ],
  };
}
