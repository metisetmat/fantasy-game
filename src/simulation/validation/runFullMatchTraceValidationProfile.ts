import type { MatchReport, MatchInput } from "../../contracts/engineToCoach";
import { runFullMatch } from "../runFullMatch";
import { assessFullMatchTraceProfileSignals } from "./fullMatchTraceValidationAssertions";
import type { FullMatchTraceValidationCardId, FullMatchTraceValidationProfile, FullMatchTraceValidationProfileResult } from "./fullMatchTraceValidationProfiles";

const CARD_IDS: readonly FullMatchTraceValidationCardId[] = [
  "official_danger_zones",
  "official_pressure_losses",
  "official_recoveries",
  "official_player_involvement",
  "official_recurring_causes",
  "official_coach_watchpoint",
];

function tagValue(tags: readonly string[], prefix: string): string | undefined {
  return tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length);
}

function numberTag(tags: readonly string[], prefix: string): number {
  const value = tagValue(tags, prefix);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function itemKeysFromTag(tags: readonly string[], prefix: string): readonly string[] {
  const value = tagValue(tags, prefix);
  if (value === undefined || value === "none") {
    return [];
  }

  return value
    .split("|")
    .map((item) => item.split(":")[0]?.trim() ?? "")
    .filter((item) => item.length > 0);
}

function textHaystack(input: {
  readonly report: MatchReport;
  readonly traceSummary: string;
  readonly aggregateSummary: string;
  readonly coachSummary: string;
  readonly traceTags: readonly string[];
  readonly aggregateTags: readonly string[];
  readonly coachTags: readonly string[];
}): string {
  return [
    input.traceSummary,
    input.aggregateSummary,
    input.coachSummary,
    ...input.traceTags,
    ...input.aggregateTags,
    ...input.coachTags,
    ...input.report.timeline.flatMap((event) => [
      event.eventType,
      event.tacticalContext.pressureLevel,
      event.tacticalContext.moveType ?? "",
      event.tacticalContext.reason ?? "",
      ...event.tags,
    ]),
  ].join(" ").toLowerCase();
}

function signalPresent(haystack: string, signal: string): boolean {
  const normalized = signal.toLowerCase();

  if (haystack.includes(normalized)) {
    return true;
  }

  switch (normalized) {
    case "high_pressure":
      return haystack.includes("pressure_high") || haystack.includes("pressing_high");
    case "low_block":
      return haystack.includes("low_block") || haystack.includes("line_low");
    case "rest_defense":
      return haystack.includes("rest_defense_high") || haystack.includes("secure_rest_defense");
    case "fast_break":
      return haystack.includes("transition_fast_break") || haystack.includes("tempo_fast");
    case "direct_pressure":
      return haystack.includes("attacking_direct_pressure");
    case "late_fatigue":
      return haystack.includes("late_fatigue_risk") || haystack.includes("fatigue");
    case "shot_prevented":
      return haystack.includes("shot_prevented") || haystack.includes("goalkeeper_quality");
    case "goalkeeper_profile_strong":
      return haystack.includes("goalkeeper_profile_strong");
    default:
      return false;
  }
}

function cardSignatures(coachTags: readonly string[]): Readonly<Record<FullMatchTraceValidationCardId, string>> {
  return {
    official_danger_zones: tagValue(coachTags, "coach_report_trace_aggregates_danger_zone_items_") ?? "none",
    official_pressure_losses: [
      tagValue(coachTags, "coach_report_trace_aggregates_pressure_loss_zone_items_") ?? "none",
      tagValue(coachTags, "coach_report_trace_aggregates_possession_loss_zone_items_") ?? "none",
      tagValue(coachTags, "coach_report_trace_aggregates_high_pressure_trace_count_") ?? "0",
    ].join(";"),
    official_recoveries: tagValue(coachTags, "coach_report_trace_aggregates_recovery_zone_items_") ?? "none",
    official_player_involvement: tagValue(coachTags, "coach_report_trace_aggregates_player_involvement_items_") ?? "none",
    official_recurring_causes: [
      tagValue(coachTags, "coach_report_trace_aggregates_cause_items_") ?? "none",
      tagValue(coachTags, "coach_report_trace_aggregates_impact_items_") ?? "none",
      tagValue(coachTags, "coach_report_trace_aggregates_fatigue_impact_total_") ?? "0",
    ].join(";"),
    official_coach_watchpoint: tagValue(coachTags, "coach_report_trace_aggregates_watchpoint_") ?? "none",
  };
}

function emptyResult(profile: FullMatchTraceValidationProfile): FullMatchTraceValidationProfileResult {
  return {
    profileId: profile.profileId,
    status: "failed",
    traceSpineStatus: "not_available",
    aggregatorStatus: "not_available",
    coachReportV0Status: "not_available",
    officialTraceCount: 0,
    officialAggregateTraceCount: 0,
    cardCount: 0,
    topDangerZones: [],
    topPressureLossZones: [],
    topRecoveryZones: [],
    topPlayerInvolvement: [],
    topCauseTags: [],
    topImpactTags: [],
    highPressureTraceCount: 0,
    fatigueImpactTotal: 0,
    expectedSignalsPresent: false,
    expectedSignalsMissing: [...profile.expectedSignals],
    expectedSignalTagsPresent: [],
    expectedSignalTagsMissing: [...profile.expectedSignals],
    acceptedFallbackSignals: [],
    signalCalibrationStatus: "FAIL",
    profileSignalNarrative: "Profile signal validation could not run because trace evidence was missing.",
    reportChangedFromBaseline: false,
    changedCards: [],
    cardSignatureByCardId: {
      official_danger_zones: "none",
      official_pressure_losses: "none",
      official_recoveries: "none",
      official_player_involvement: "none",
      official_recurring_causes: "none",
      official_coach_watchpoint: "none",
    },
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
  };
}

export function runFullMatchTraceValidationProfile(input: {
  readonly profile: FullMatchTraceValidationProfile;
  readonly matchInput?: MatchInput;
}): FullMatchTraceValidationProfileResult {
  const matchInput = input.matchInput ?? input.profile.createInput();
  const report = runFullMatch(matchInput, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const traceFact = report.evidenceFacts.find((fact) =>
    fact.internalTags.includes("workbench_chain_match_event_trace_spine")
  );
  const aggregateFact = report.evidenceFacts.find((fact) =>
    fact.internalTags.includes("workbench_chain_match_trace_aggregator")
  );
  const coachFact = report.evidenceFacts.find((fact) =>
    fact.internalTags.includes("workbench_chain_coach_report_from_trace_aggregates")
  );

  if (traceFact === undefined || aggregateFact === undefined || coachFact === undefined) {
    return emptyResult(input.profile);
  }

  const traceTags = traceFact.internalTags;
  const aggregateTags = aggregateFact.internalTags;
  const coachTags = coachFact.internalTags;
  const haystack = textHaystack({
    report,
    traceSummary: traceFact.summary,
    aggregateSummary: aggregateFact.summary,
    coachSummary: coachFact.summary,
    traceTags,
    aggregateTags,
    coachTags,
  });
  const legacyExpectedSignalsMissing = input.profile.expectedSignals.filter((signal) => !signalPresent(haystack, signal));
  const signatures = cardSignatures(coachTags);
  const preliminaryChangedCards: readonly FullMatchTraceValidationCardId[] = [];
  const signalAssessment = assessFullMatchTraceProfileSignals({
    profileId: input.profile.profileId,
    haystack,
    changedCards: preliminaryChangedCards,
    highPressureTraceCount: numberTag(coachTags, "coach_report_trace_aggregates_high_pressure_trace_count_"),
    fatigueImpactTotal: numberTag(coachTags, "coach_report_trace_aggregates_fatigue_impact_total_"),
  });
  const status = signalAssessment.status === "FAIL" && legacyExpectedSignalsMissing.length === input.profile.expectedSignals.length
    ? "partial"
    : "available";

  return {
    profileId: input.profile.profileId,
    status,
    traceSpineStatus: tagValue(traceTags, "match_event_trace_spine_status_") ?? "available",
    aggregatorStatus: tagValue(aggregateTags, "match_trace_aggregator_status_") ?? "available",
    coachReportV0Status: tagValue(coachTags, "coach_report_trace_aggregates_status_") ?? "available",
    officialTraceCount: numberTag(traceTags, "match_trace_official_truth_true_count_"),
    officialAggregateTraceCount: numberTag(coachTags, "coach_report_trace_aggregates_official_trace_count_"),
    cardCount: numberTag(coachTags, "coach_report_trace_aggregates_card_count_"),
    topDangerZones: itemKeysFromTag(coachTags, "coach_report_trace_aggregates_danger_zone_items_"),
    topPressureLossZones: itemKeysFromTag(coachTags, "coach_report_trace_aggregates_pressure_loss_zone_items_"),
    topRecoveryZones: itemKeysFromTag(coachTags, "coach_report_trace_aggregates_recovery_zone_items_"),
    topPlayerInvolvement: itemKeysFromTag(coachTags, "coach_report_trace_aggregates_player_involvement_items_"),
    topCauseTags: itemKeysFromTag(coachTags, "coach_report_trace_aggregates_cause_items_"),
    topImpactTags: itemKeysFromTag(coachTags, "coach_report_trace_aggregates_impact_items_"),
    highPressureTraceCount: numberTag(coachTags, "coach_report_trace_aggregates_high_pressure_trace_count_"),
    fatigueImpactTotal: numberTag(coachTags, "coach_report_trace_aggregates_fatigue_impact_total_"),
    expectedSignalsPresent: signalAssessment.status !== "FAIL",
    expectedSignalsMissing: signalAssessment.expectedSignalTagsMissing,
    expectedSignalTagsPresent: signalAssessment.expectedSignalTagsPresent,
    expectedSignalTagsMissing: signalAssessment.expectedSignalTagsMissing,
    acceptedFallbackSignals: signalAssessment.acceptedFallbackSignals,
    signalCalibrationStatus: signalAssessment.status,
    profileSignalNarrative: signalAssessment.explanation,
    reportChangedFromBaseline: false,
    changedCards: [],
    cardSignatureByCardId: signatures,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
  };
}

export function fullMatchTraceValidationCardIds(): readonly FullMatchTraceValidationCardId[] {
  return CARD_IDS;
}
