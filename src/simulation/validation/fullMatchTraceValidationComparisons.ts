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

  return {
    ...input.result,
    reportChangedFromBaseline: changedCards.length > 0,
    changedCards,
  };
}

function modelStatus(input: {
  readonly profiles: readonly FullMatchTraceValidationProfileResult[];
  readonly reportVariationDetected: boolean;
  readonly changedProfileCount: number;
  readonly guardrailsPass: boolean;
}): FullMatchTraceValidationStatus {
  if (!input.guardrailsPass || !input.reportVariationDetected) {
    return "failed";
  }

  if (input.profiles.every((profile) => profile.status === "available") && input.changedProfileCount >= 4) {
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
  const status = modelStatus({
    profiles,
    reportVariationDetected,
    changedProfileCount,
    guardrailsPass,
  });

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
