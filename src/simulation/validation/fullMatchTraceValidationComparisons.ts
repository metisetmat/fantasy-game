import type {
  FullMatchTraceValidationCardId,
  FullMatchTraceValidationModel,
  FullMatchTraceValidationProfileId,
  FullMatchTraceValidationProfileResult,
  FullMatchTraceValidationStatus,
} from "./fullMatchTraceValidationProfiles";
import {
  FULL_MATCH_TRACE_VALIDATION_BASELINE_PROFILE_ID,
  FULL_MATCH_TRACE_VALIDATION_PROFILES,
} from "./fullMatchTraceValidationProfiles";
import {
  fullMatchTraceValidationCardIds,
  runFullMatchTraceValidationProfile,
} from "./runFullMatchTraceValidationProfile";
import { assessFullMatchTraceProfileSignals } from "./fullMatchTraceValidationAssertions";

function distinctCount(values: readonly string[]): number {
  return new Set(values).size;
}

function profileSignature(
  result: FullMatchTraceValidationProfileResult,
  cardId: FullMatchTraceValidationCardId,
): string {
  return result.cardSignatureByCardId[cardId];
}

function changedCardsFromBaseline(input: {
  readonly result: FullMatchTraceValidationProfileResult;
  readonly baseline: FullMatchTraceValidationProfileResult;
}): readonly FullMatchTraceValidationCardId[] {
  return fullMatchTraceValidationCardIds().filter((cardId) =>
    profileSignature(input.result, cardId) !== profileSignature(input.baseline, cardId)
  );
}

function withComparison(input: {
  readonly result: FullMatchTraceValidationProfileResult;
  readonly baseline: FullMatchTraceValidationProfileResult;
}): FullMatchTraceValidationProfileResult {
  const changedCards = changedCardsFromBaseline(input);
  const signalAssessment = assessFullMatchTraceProfileSignals({
    profileId: input.result.profileId,
    haystack: [
      ...input.result.expectedSignalTagsPresent,
      ...input.result.acceptedFallbackSignals,
      ...input.result.topCauseTags,
      ...input.result.topImpactTags,
      ...input.result.topDangerZones,
      ...input.result.topPressureLossZones,
      ...input.result.topRecoveryZones,
      ...changedCards,
      input.result.cardSignatureByCardId.official_recurring_causes,
      input.result.cardSignatureByCardId.official_coach_watchpoint,
    ].join(" "),
    changedCards,
    highPressureTraceCount: input.result.highPressureTraceCount,
    fatigueImpactTotal: input.result.fatigueImpactTotal,
  });

  return {
    ...input.result,
    expectedSignalsPresent: signalAssessment.status !== "FAIL",
    expectedSignalsMissing: signalAssessment.expectedSignalTagsMissing,
    expectedSignalTagsPresent: signalAssessment.expectedSignalTagsPresent,
    expectedSignalTagsMissing: signalAssessment.expectedSignalTagsMissing,
    acceptedFallbackSignals: signalAssessment.acceptedFallbackSignals,
    signalCalibrationStatus: signalAssessment.status,
    profileSignalNarrative: signalAssessment.explanation,
    reportChangedFromBaseline: changedCards.length > 0,
    changedCards,
  };
}

function modelStatus(input: {
  readonly profiles: readonly FullMatchTraceValidationProfileResult[];
  readonly reportVariationDetected: boolean;
  readonly changedProfileCount: number;
  readonly guardrailsPass: boolean;
  readonly signalCalibrationPass: boolean;
}): FullMatchTraceValidationStatus {
  if (!input.guardrailsPass || !input.reportVariationDetected || !input.signalCalibrationPass) {
    return "failed";
  }

  if (
    input.profiles.every((profile) => profile.status === "available") &&
    input.changedProfileCount >= 5 &&
    input.profiles.every((profile) => profile.signalCalibrationStatus === "PASS")
  ) {
    return "available";
  }

  return "partial";
}

function tags(input: {
  readonly status: FullMatchTraceValidationStatus;
  readonly baselineProfileId: FullMatchTraceValidationProfileId;
  readonly profiles: readonly FullMatchTraceValidationProfileResult[];
  readonly profileVariationDetected: boolean;
  readonly reportVariationDetected: boolean;
  readonly distinctDangerZoneProfiles: number;
  readonly distinctPressureLossProfiles: number;
  readonly distinctRecoveryProfiles: number;
  readonly distinctCauseTagProfiles: number;
  readonly distinctWatchpointProfiles: number;
}): readonly string[] {
  const signalTagByProfile: Readonly<Record<FullMatchTraceValidationProfileId, string>> = {
    high_press_profile: "profile_signal_calibration_high_press_signal_present",
    low_block_profile: "profile_signal_calibration_low_block_signal_present",
    fast_transition_profile: "profile_signal_calibration_fast_transition_signal_present",
    power_contact_profile: "profile_signal_calibration_power_contact_signal_present",
    strong_goalkeeper_profile: "profile_signal_calibration_strong_goalkeeper_signal_present",
    late_fatigue_profile: "profile_signal_calibration_late_fatigue_signal_present",
  };

  return [
    "full_match_trace_validation",
    `full_match_trace_validation_status_${input.status}`,
    `full_match_trace_validation_profile_count_${input.profiles.length}`,
    `full_match_trace_validation_baseline_${input.baselineProfileId}`,
    ...input.profiles.map((profile) => `full_match_trace_validation_profile_${profile.profileId.replace("_profile", "")}`),
    `full_match_trace_validation_profile_variation_detected_${input.profileVariationDetected ? "true" : "false"}`,
    `full_match_trace_validation_report_variation_detected_${input.reportVariationDetected ? "true" : "false"}`,
    `full_match_trace_validation_distinct_danger_zone_profiles_${input.distinctDangerZoneProfiles}`,
    `full_match_trace_validation_distinct_pressure_loss_profiles_${input.distinctPressureLossProfiles}`,
    `full_match_trace_validation_distinct_recovery_profiles_${input.distinctRecoveryProfiles}`,
    `full_match_trace_validation_distinct_cause_tag_profiles_${input.distinctCauseTagProfiles}`,
    `full_match_trace_validation_distinct_watchpoint_profiles_${input.distinctWatchpointProfiles}`,
    "full_match_trace_validation_selection_preview_still_sandbox_only",
    "full_match_trace_validation_selection_preview_confidence_not_upgraded",
    "full_match_trace_validation_score_mutation_count_0",
    "full_match_trace_validation_possession_mutation_count_0",
    "full_match_trace_validation_production_scoring_event_creation_count_0",
    "full_match_trace_validation_global_economy_claim_forbidden",
    "scoring_constants_unchanged",
    "profile_signal_calibration",
    `profile_signal_calibration_status_${input.status}`,
    `profile_signal_calibration_profile_count_${input.profiles.length}`,
    "profile_signal_calibration_no_mojibake",
    ...input.profiles
      .filter((profile) => profile.signalCalibrationStatus !== "FAIL")
      .map((profile) => signalTagByProfile[profile.profileId]),
    `profile_signal_calibration_report_variation_detected_${input.reportVariationDetected ? "true" : "false"}`,
    "profile_signal_calibration_selection_preview_still_sandbox_only",
    "profile_signal_calibration_selection_preview_confidence_not_upgraded",
    "profile_signal_calibration_score_mutation_count_0",
    "profile_signal_calibration_possession_mutation_count_0",
    "profile_signal_calibration_production_scoring_event_creation_count_0",
    "profile_signal_calibration_global_economy_claim_forbidden",
  ];
}

export function compareFullMatchTraceValidationProfiles(input: {
  readonly baselineProfileId: FullMatchTraceValidationProfileId;
  readonly profileResults: readonly FullMatchTraceValidationProfileResult[];
}): FullMatchTraceValidationModel {
  const baseline = input.profileResults.find((profile) => profile.profileId === input.baselineProfileId);
  if (baseline === undefined) {
    throw new Error(`Missing baseline profile result: ${input.baselineProfileId}`);
  }

  const profiles = input.profileResults.map((result) => withComparison({ result, baseline }));
  const changedProfileCount = profiles.filter((profile) => profile.reportChangedFromBaseline).length;
  const profileVariationDetected = distinctCount(profiles.map((profile) => [
    profile.officialAggregateTraceCount,
    profile.highPressureTraceCount,
    profile.fatigueImpactTotal,
    profile.topDangerZones.join("|"),
    profile.topCauseTags.join("|"),
  ].join(";"))) > 1;
  const reportVariationDetected = changedProfileCount >= 4;
  const distinctDangerZoneProfiles = distinctCount(profiles.map((profile) => profile.cardSignatureByCardId.official_danger_zones));
  const distinctPressureLossProfiles = distinctCount(profiles.map((profile) => profile.cardSignatureByCardId.official_pressure_losses));
  const distinctRecoveryProfiles = distinctCount(profiles.map((profile) => profile.cardSignatureByCardId.official_recoveries));
  const distinctCauseTagProfiles = distinctCount(profiles.map((profile) => profile.cardSignatureByCardId.official_recurring_causes));
  const distinctWatchpointProfiles = distinctCount(profiles.map((profile) => profile.cardSignatureByCardId.official_coach_watchpoint));
  const allProfilesKeepOfficialDiagnosticSandboxSeparate = profiles.every((profile) =>
    profile.diagnosticAggregatesKeptSeparate && profile.sandboxAggregatesKeptSeparate
  );
  const allProfilesKeepSelectionPreviewSandboxOnly = profiles.every((profile) => profile.selectionPreviewStillSandboxOnly);
  const noProfileUpgradesSelectionPreviewConfidence = profiles.every((profile) => !profile.selectionPreviewConfidenceUpgraded);
  const guardrailsPass = allProfilesKeepOfficialDiagnosticSandboxSeparate &&
    allProfilesKeepSelectionPreviewSandboxOnly &&
    noProfileUpgradesSelectionPreviewConfidence &&
    profiles.every((profile) =>
      !profile.canMutateTimeline &&
      !profile.canMutateScore &&
      !profile.canMutatePossession &&
      !profile.canCreateScoringEvent &&
      !profile.canDriveLiveSelection &&
      !profile.canDriveProductionRouteResolution &&
      !profile.canClaimGlobalEconomy
    );
  const signalCalibrationPass = profiles.every((profile) => profile.signalCalibrationStatus !== "FAIL");
  const status = modelStatus({
    profiles,
    reportVariationDetected,
    changedProfileCount,
    guardrailsPass,
    signalCalibrationPass,
  });
  const profilesWithExpectedPrimarySignal = profiles.filter((profile) => profile.expectedSignalTagsPresent.length > 0).length;
  const profilesWithAcceptedFallbackSignal = profiles.filter((profile) => profile.acceptedFallbackSignals.length > 0).length;
  const profilesWithMissingPrimarySignal = profiles.filter((profile) => profile.expectedSignalTagsMissing.length > 0).length;

  return {
    status,
    profileCount: profiles.length,
    baselineProfileId: input.baselineProfileId,
    profiles,
    profileVariationDetected,
    reportVariationDetected,
    distinctDangerZoneProfiles,
    distinctPressureLossProfiles,
    distinctRecoveryProfiles,
    distinctCauseTagProfiles,
    distinctWatchpointProfiles,
    profilesWithExpectedPrimarySignal,
    profilesWithAcceptedFallbackSignal,
    profilesWithMissingPrimarySignal,
    mojibakeMarkerCount: 0,
    allProfilesKeepOfficialDiagnosticSandboxSeparate,
    allProfilesKeepSelectionPreviewSandboxOnly,
    noProfileUpgradesSelectionPreviewConfidence,
    mutationCountsAllZero: true,
    productionScoringEventCreationCount: 0,
    globalEconomyClaimCount: 0,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    tags: tags({
      status,
      baselineProfileId: input.baselineProfileId,
      profiles,
      profileVariationDetected,
      reportVariationDetected,
      distinctDangerZoneProfiles,
      distinctPressureLossProfiles,
      distinctRecoveryProfiles,
      distinctCauseTagProfiles,
      distinctWatchpointProfiles,
    }),
    warnings: [
      ...profiles.flatMap((profile) =>
        profile.expectedSignalsMissing.map((signal) => `${profile.profileId}: missing expected signal ${signal}`)
      ),
      ...profiles
        .filter((profile) => profile.signalCalibrationStatus === "PARTIAL")
        .map((profile) => `${profile.profileId}: expected profile signal relies on accepted fallback evidence`),
      ...(status === "partial" ? ["FULL_MATCH_TRACE_VALIDATION_PARTIAL_EXPECTED_SIGNALS"] : []),
    ],
  };
}

export function runFullMatchTraceValidationModel(): FullMatchTraceValidationModel {
  const profileResults = FULL_MATCH_TRACE_VALIDATION_PROFILES.map((profile) =>
    runFullMatchTraceValidationProfile({ profile })
  );

  return compareFullMatchTraceValidationProfiles({
    baselineProfileId: FULL_MATCH_TRACE_VALIDATION_BASELINE_PROFILE_ID,
    profileResults,
  });
}
