import type { MatchEvent, MatchReport } from "../contracts/engineToCoach";
import type {
  OfficialScoringFamily,
  ScoringAttributionConfidence,
  ScoringFamilyAttributionWarningCode,
} from "../contracts/scoringFamily";
import { classifyMatchEventScoringFamily } from "../systems/scoring/scoringFamilyAttribution";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

export type ScoringFamilyAttributionAuditStatus = "PASS" | "WARNING" | "FAIL";
export type ScoringFamilyAttributionAuditScope = "FULL_MATCH_SCORING_FAMILY_SINGLE_RUN";
export type ScoringFamilyAttributionAuditVersion = "SCORING_FAMILY_ATTRIBUTION_6B";

export interface UnknownScoringFamilyEvent {
  readonly eventId: string;
  readonly teamId: string;
  readonly pointValue: number;
  readonly reason: string;
  readonly missingFields: readonly string[];
  readonly warningCodes: readonly ScoringFamilyAttributionWarningCode[];
}

export interface ScoringFamilyAttributionAuditModel {
  readonly status: ScoringFamilyAttributionAuditStatus;
  readonly scope: ScoringFamilyAttributionAuditScope;
  readonly attributionVersion: ScoringFamilyAttributionAuditVersion;
  readonly totalScoringEventCount: number;
  readonly attributedScoringEventCount: number;
  readonly unknownScoringEventCount: number;
  readonly legacyUnknownScoringEventCount: number;
  readonly unknownScoringPointTotal: number;
  readonly attributionCoverageRate: number;
  readonly scoringEventsByFamily: Readonly<Record<OfficialScoringFamily, number>>;
  readonly scoringPointsByFamily: Readonly<Record<OfficialScoringFamily, number>>;
  readonly unknownEvents: readonly UnknownScoringFamilyEvent[];
  readonly unknownReasons: readonly string[];
  readonly highConfidenceCount: number;
  readonly mediumConfidenceCount: number;
  readonly lowConfidenceCount: number;
  readonly familyAttributionWarnings: readonly ScoringFamilyAttributionWarningCode[];
  readonly warningCountByCode: Readonly<Record<ScoringFamilyAttributionWarningCode, number>>;
  readonly scoringConstantsChanged: false;
  readonly scoreCapApplied: false;
  readonly postHocRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly scoringEventsRewritten: false;
  readonly forcedOpponentScoreApplied: false;
  readonly officialTimelineMutationCount: 0;
  readonly officialPossessionMutationCount: 0;
  readonly productionScoringEventCreationCount: 0;
  readonly batchLiveSeparationPreserved: true;
  readonly matchBonusEventChanged: false;
  readonly persistenceUsedForAttribution: false;
  readonly sqliteUsedAsScoreEconomySource: false;
  readonly globalEconomyClaimCount: 0;
  readonly trendProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly singleRunOnly: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly recommendation: string;
  readonly tags: readonly string[];
}

const FAMILIES: readonly OfficialScoringFamily[] = [
  "SHOT_GOAL",
  "TRY_TOUCHDOWN",
  "CONVERSION_GOAL",
  "DROP_GOAL",
  "PENALTY_SHOT",
  "UNKNOWN",
];

const WARNING_CODES: readonly ScoringFamilyAttributionWarningCode[] = [
  "UNKNOWN_SCORING_FAMILY",
  "MISSING_SCORING_ACTION",
  "MISSING_SCORE_CHANGE_POINT_VALUE",
  "FAMILY_POINT_VALUE_MISMATCH",
  "INACTIVE_PENALTY_SHOT_USED",
  "AMBIGUOUS_SCORING_FAMILY",
  "LOW_CONFIDENCE_SCORING_ATTRIBUTION",
  "SCORING_EVENT_WITHOUT_OFFICIAL_CONSEQUENCE",
  "SCORE_CHANGE_WITHOUT_SCORING_FAMILY",
];

function emptyFamilyRecord(): Record<OfficialScoringFamily, number> {
  return {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
  };
}

function emptyWarningRecord(): Record<ScoringFamilyAttributionWarningCode, number> {
  return {
    UNKNOWN_SCORING_FAMILY: 0,
    MISSING_SCORING_ACTION: 0,
    MISSING_SCORE_CHANGE_POINT_VALUE: 0,
    FAMILY_POINT_VALUE_MISMATCH: 0,
    INACTIVE_PENALTY_SHOT_USED: 0,
    AMBIGUOUS_SCORING_FAMILY: 0,
    LOW_CONFIDENCE_SCORING_ATTRIBUTION: 0,
    SCORING_EVENT_WITHOUT_OFFICIAL_CONSEQUENCE: 0,
    SCORE_CHANGE_WITHOUT_SCORING_FAMILY: 0,
  };
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((total, consequence) => total + (consequence.value ?? 0), 0);
}

function isScoringEvent(event: MatchEvent): boolean {
  return event.consequences.some((consequence) => consequence.type === "score_change");
}

function legacy6AFamily(event: MatchEvent): OfficialScoringFamily {
  const tag = event.tags.find((candidate) => candidate.startsWith("scoring_type_"));
  const family = tag?.replace("scoring_type_", "");
  return FAMILIES.includes(family as OfficialScoringFamily)
    ? family as OfficialScoringFamily
    : "UNKNOWN";
}

function percentage(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function confidenceKey(confidence: ScoringAttributionConfidence): "highConfidenceCount" | "mediumConfidenceCount" | "lowConfidenceCount" {
  if (confidence === "high") {
    return "highConfidenceCount";
  }
  if (confidence === "medium") {
    return "mediumConfidenceCount";
  }
  return "lowConfidenceCount";
}

export function buildScoringFamilyAttributionAuditModel(report: MatchReport): ScoringFamilyAttributionAuditModel {
  const scoringEvents = report.timeline.filter(isScoringEvent);
  const scoringEventsByFamily = emptyFamilyRecord();
  const scoringPointsByFamily = emptyFamilyRecord();
  const warningCountByCode = emptyWarningRecord();
  const unknownEvents: UnknownScoringFamilyEvent[] = [];
  const confidenceCounts = {
    highConfidenceCount: 0,
    mediumConfidenceCount: 0,
    lowConfidenceCount: 0,
  };
  let unknownScoringPointTotal = 0;

  for (const event of scoringEvents) {
    const attribution = classifyMatchEventScoringFamily(event);
    const points = scoreChangePoints(event);
    scoringEventsByFamily[attribution.family] += 1;
    scoringPointsByFamily[attribution.family] += points;
    confidenceCounts[confidenceKey(attribution.confidence)] += 1;

    for (const warningCode of attribution.warningCodes) {
      warningCountByCode[warningCode] += 1;
    }

    if (attribution.family === "UNKNOWN") {
      unknownScoringPointTotal += points;
      unknownEvents.push({
        eventId: event.eventId,
        teamId: event.teamId,
        pointValue: points,
        reason: attribution.unknownReason ?? attribution.attributionReason,
        missingFields: attribution.missingFields,
        warningCodes: attribution.warningCodes,
      });
    }
  }

  const legacyUnknownScoringEventCount = scoringEvents.filter((event) => legacy6AFamily(event) === "UNKNOWN").length;
  const attributedScoringEventCount = scoringEvents.length - unknownEvents.length;
  const familyAttributionWarnings = WARNING_CODES.filter((warningCode) => warningCountByCode[warningCode] > 0);
  const status: ScoringFamilyAttributionAuditStatus =
    unknownEvents.length === 0 && attributedScoringEventCount === scoringEvents.length
      ? "PASS"
      : attributedScoringEventCount > 0 && unknownEvents.every((event) => event.reason.length > 0)
        ? "WARNING"
        : "FAIL";

  return {
    status,
    scope: "FULL_MATCH_SCORING_FAMILY_SINGLE_RUN",
    attributionVersion: "SCORING_FAMILY_ATTRIBUTION_6B",
    totalScoringEventCount: scoringEvents.length,
    attributedScoringEventCount,
    unknownScoringEventCount: unknownEvents.length,
    legacyUnknownScoringEventCount,
    unknownScoringPointTotal,
    attributionCoverageRate: percentage(attributedScoringEventCount, scoringEvents.length),
    scoringEventsByFamily,
    scoringPointsByFamily,
    unknownEvents,
    unknownReasons: [...new Set(unknownEvents.map((event) => event.reason))],
    highConfidenceCount: confidenceCounts.highConfidenceCount,
    mediumConfidenceCount: confidenceCounts.mediumConfidenceCount,
    lowConfidenceCount: confidenceCounts.lowConfidenceCount,
    familyAttributionWarnings,
    warningCountByCode,
    scoringConstantsChanged: false,
    scoreCapApplied: false,
    postHocRewriteApplied: false,
    scoringEventsDeleted: false,
    scoringEventsRewritten: false,
    forcedOpponentScoreApplied: false,
    officialTimelineMutationCount: 0,
    officialPossessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    batchLiveSeparationPreserved: true,
    matchBonusEventChanged: false,
    persistenceUsedForAttribution: false,
    sqliteUsedAsScoreEconomySource: false,
    globalEconomyClaimCount: 0,
    trendProofClaimCount: 0,
    inventedStatisticCount: 0,
    singleRunOnly: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    recommendation: "CONFIRM_SCORING_FAMILY_ATTRIBUTION_AND_RECHECK_ROUTE_ECONOMY",
    tags: [
      "scoring_family_attribution_6b",
      `scoring_family_coverage_${percentage(attributedScoringEventCount, scoringEvents.length)}`,
      `unknown_scoring_event_count_${unknownEvents.length}`,
      `legacy_unknown_scoring_event_count_${legacyUnknownScoringEventCount}`,
      scoringRegistryEntry("PENALTY_SHOT").active ? "penalty_shot_active_unexpected" : "penalty_shot_inactive",
    ],
  };
}
