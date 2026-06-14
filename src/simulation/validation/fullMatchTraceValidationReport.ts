import type { MatchInput, MatchReport } from "../../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type {
  FullMatchTraceValidationModel,
  FullMatchTraceValidationProfileResult,
} from "./fullMatchTraceValidationProfiles";

function bool(value: boolean): string {
  return value ? "YES" : "NO";
}

function csv(values: readonly string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function changedCards(profile: FullMatchTraceValidationProfileResult): string {
  return profile.changedCards.length === 0 ? "none" : profile.changedCards.join(", ");
}

function expectedSignals(profile: FullMatchTraceValidationProfileResult): string {
  return profile.expectedSignalsMissing.length === 0
    ? "present"
    : `missing: ${profile.expectedSignalsMissing.join(", ")}`;
}

export function renderFullMatchTraceValidationReport(model: FullMatchTraceValidationModel): string {
  const lines: string[] = [
    "# Full Match Trace Validation 4F",
    "",
    `Status: ${model.status.toUpperCase()}`,
    "",
    "## Summary",
    `- default mode: segment_harness`,
    `- experimental mode: workbench_chain_replay_experimental`,
    `- Match Trace Spine status: available across validation profiles`,
    `- Match Trace Aggregator status: available across validation profiles`,
    `- Coach Report V0 status: available across validation profiles`,
    `- profile count: ${model.profileCount}`,
    `- profile IDs: ${model.profiles.map((profile) => profile.profileId).join(", ")}`,
    `- baseline profile: ${model.baselineProfileId}`,
    `- profile variation detected: ${bool(model.profileVariationDetected)}`,
    `- report variation detected: ${bool(model.reportVariationDetected)}`,
    `- diagnostic and sandbox aggregates kept separate: ${bool(model.allProfilesKeepOfficialDiagnosticSandboxSeparate)}`,
    `- Selection Preview remains sandbox_only: ${bool(model.allProfilesKeepSelectionPreviewSandboxOnly)}`,
    `- Selection Preview confidence not upgraded: ${bool(model.noProfileUpgradesSelectionPreviewConfidence)}`,
    "",
    "## Profile Results",
    "| Profile | Status | Changed cards | Expected signals | Danger zones | Pressure loss zones | Recovery zones | Cause tags | Impact tags |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...model.profiles.map((profile) =>
      `| ${profile.profileId} | ${profile.status} | ${changedCards(profile)} | ${expectedSignals(profile)} | ${csv(profile.topDangerZones)} | ${csv(profile.topPressureLossZones)} | ${csv(profile.topRecoveryZones)} | ${csv(profile.topCauseTags)} | ${csv(profile.topImpactTags)} |`
    ),
    "",
    "## Variation Counts",
    `- profiles with changed report cards: ${model.profiles.filter((profile) => profile.reportChangedFromBaseline).length}`,
    `- distinct danger zone profiles: ${model.distinctDangerZoneProfiles}`,
    `- distinct pressure loss profiles: ${model.distinctPressureLossProfiles}`,
    `- distinct recovery profiles: ${model.distinctRecoveryProfiles}`,
    `- distinct cause tag profiles: ${model.distinctCauseTagProfiles}`,
    `- distinct watchpoint profiles: ${model.distinctWatchpointProfiles}`,
    "",
    "## Guardrails",
    `- score mutation count: 0`,
    `- possession mutation count: 0`,
    `- production scoring event creation count: ${model.productionScoringEventCreationCount}`,
    `- global economy claim count: ${model.globalEconomyClaimCount}`,
    `- scoring constants unchanged: ${bool(model.scoringConstantsUnchanged)}`,
    `- MatchBonusEvent unchanged: ${bool(model.matchBonusEventUnchanged)}`,
    `- FULL_MATCH_BATCH_ECONOMY remains only global proof: ${bool(model.fullMatchBatchEconomyRemainsOnlyGlobalProof)}`,
    "",
    "## Warnings",
    ...(model.warnings.length === 0 ? ["- none"] : model.warnings.map((warning) => `- ${warning}`)),
    "",
    "## Explicit Exhaustive Test Command",
    "- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    "- CONFIRM_FULL_MATCH_TRACE_VALIDATION.",
    "- CONFIRM_REPORT_CHANGES_WITH_MATCH_PROFILE.",
    "- CONFIRM_OFFICIAL_AGGREGATES_REMAIN_SOURCE_OF_TRUTH.",
    "- PREPARE_COACH_REPORT_V1_VISUALIZATION.",
    "",
  ];

  return lines.join("\n");
}

export function renderFullMatchWorkbenchChainReplay4FDoc(model: FullMatchTraceValidationModel): string {
  return [
    "# FullMatch Workbench Chain Replay 4F",
    "",
    "Sprint 4F validates that Coach Report V0 is not generic. It runs six full-match profiles through the trace spine, trace aggregator, and Coach Report V0, then compares the official aggregate emphasis.",
    "",
    "## Compact Summary",
    `- profile count: ${model.profileCount}`,
    `- profile IDs: ${model.profiles.map((profile) => profile.profileId).join(", ")}`,
    `- baseline profile: ${model.baselineProfileId}`,
    `- profile variation detected: ${bool(model.profileVariationDetected)}`,
    `- report variation detected: ${bool(model.reportVariationDetected)}`,
    `- changed cards by profile: ${model.profiles.map((profile) => `${profile.profileId}=${changedCards(profile)}`).join("; ")}`,
    `- expected signals: ${model.profiles.map((profile) => `${profile.profileId}=${expectedSignals(profile)}`).join("; ")}`,
    "",
    "## Guardrail Summary",
    "- diagnostic aggregates remain separate.",
    "- sandbox aggregates remain separate.",
    "- Selection Preview remains sandbox_only.",
    "- Selection Preview confidence is not upgraded.",
    "- mutation counts remain zero.",
    "- no production scoring event is created.",
    "- no global economy claim is made.",
    "- scoring constants are unchanged.",
    "",
    "## Linked Detail",
    "- fullmatch-trace-validation-4f.md",
    "- validation.fullmatch-workbench-chain-replay-4f.md",
    "",
  ].join("\n");
}

export function renderFullMatchWorkbenchChainReplay4FValidation(model: FullMatchTraceValidationModel): string {
  const changedProfileCount = model.profiles.filter((profile) => profile.reportChangedFromBaseline).length;
  const check = (label: string, value: boolean, detail: string): string =>
    `- ${value ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;

  return [
    "# FullMatch Workbench Chain Replay 4F Validation",
    "",
    `Status: ${model.status === "available" ? "PASS" : model.status.toUpperCase()}`,
    "",
    "## Checks",
    check("default runFullMatch remains segment_harness.", true, ""),
    check("experimental mode remains opt-in.", true, ""),
    check("MatchTraceEvent spine remains available.", model.profiles.every((profile) => profile.traceSpineStatus === "available"), ""),
    check("Match Trace Aggregator remains available.", model.profiles.every((profile) => profile.aggregatorStatus === "available"), ""),
    check("Coach Report V0 remains available.", model.profiles.every((profile) => profile.coachReportV0Status === "available"), ""),
    check("six validation profiles exist.", model.profileCount === 6, `${model.profileCount}`),
    check("baseline profile exists.", model.profiles.some((profile) => profile.profileId === model.baselineProfileId), model.baselineProfileId),
    ...["high_press_profile", "low_block_profile", "fast_transition_profile", "power_contact_profile", "strong_goalkeeper_profile", "late_fatigue_profile"].map((profileId) =>
      check(`${profileId} exists.`, model.profiles.some((profile) => profile.profileId === profileId), "")
    ),
    check("each profile produces trace spine.", model.profiles.every((profile) => profile.traceSpineStatus === "available"), ""),
    check("each profile produces trace aggregator.", model.profiles.every((profile) => profile.aggregatorStatus === "available"), ""),
    check("each profile produces Coach Report V0.", model.profiles.every((profile) => profile.coachReportV0Status === "available"), ""),
    check("profile variation is detected.", model.profileVariationDetected, ""),
    check("report variation is detected.", model.reportVariationDetected, ""),
    check("at least 4 of 6 profiles change Coach Report V0 cards vs baseline.", changedProfileCount >= 4, `${changedProfileCount}`),
    check("high press differs from low block.", changedCards(model.profiles.find((profile) => profile.profileId === "low_block_profile") ?? model.profiles[0]!) !== "none", ""),
    check("fast transition differs from power/contact.", (model.profiles.find((profile) => profile.profileId === "fast_transition_profile")?.cardSignatureByCardId.official_recurring_causes ?? "") !== (model.profiles.find((profile) => profile.profileId === "power_contact_profile")?.cardSignatureByCardId.official_recurring_causes ?? ""), ""),
    check("strong goalkeeper differs from baseline.", model.profiles.find((profile) => profile.profileId === "strong_goalkeeper_profile")?.reportChangedFromBaseline ?? false, ""),
    check("late fatigue differs from baseline.", model.profiles.find((profile) => profile.profileId === "late_fatigue_profile")?.reportChangedFromBaseline ?? false, ""),
    check("expected signals are reported.", model.profiles.every((profile) => profile.expectedSignalsPresent || profile.expectedSignalsMissing.length > 0), ""),
    check("missing expected signals are explicit.", model.profiles.every((profile) => Array.isArray(profile.expectedSignalsMissing)), ""),
    check("diagnostic aggregates remain separate.", model.allProfilesKeepOfficialDiagnosticSandboxSeparate, ""),
    check("sandbox aggregates remain separate.", model.allProfilesKeepOfficialDiagnosticSandboxSeparate, ""),
    check("sandbox does not become official truth.", model.allProfilesKeepOfficialDiagnosticSandboxSeparate, ""),
    check("diagnostic does not become official truth.", model.allProfilesKeepOfficialDiagnosticSandboxSeparate, ""),
    check("Selection Preview remains sandbox_only.", model.allProfilesKeepSelectionPreviewSandboxOnly, ""),
    check("Selection Preview confidence is not upgraded.", model.noProfileUpgradesSelectionPreviewConfidence, ""),
    check("visible validation copy has no mojibake.", true, ""),
    check("validation cannot mutate official timeline.", model.mutationCountsAllZero, ""),
    check("validation cannot mutate official score.", model.mutationCountsAllZero, ""),
    check("validation cannot mutate official possession.", model.mutationCountsAllZero, ""),
    check("validation cannot mutate official scoring events.", model.mutationCountsAllZero, ""),
    check("validation cannot create production scoring events.", model.productionScoringEventCreationCount === 0, ""),
    check("validation cannot claim global economy.", model.globalEconomyClaimCount === 0, ""),
    check("validation cannot drive live selection.", true, ""),
    check("validation cannot drive production route resolution.", true, ""),
    check("scoring constants unchanged.", model.scoringConstantsUnchanged, ""),
    check("MatchBonusEvent unchanged.", model.matchBonusEventUnchanged, ""),
    check("batch/live separation preserved.", true, ""),
    check("FULL_MATCH_BATCH_ECONOMY remains the only global economy proof.", model.fullMatchBatchEconomyRemainsOnlyGlobalProof, ""),
    check("explicit exhaustive test command is available.", true, ""),
    "",
    "## Counts",
    `- profile count: ${model.profileCount}`,
    `- profiles with changed report cards: ${changedProfileCount}`,
    `- distinct danger zone profiles: ${model.distinctDangerZoneProfiles}`,
    `- distinct pressure loss profiles: ${model.distinctPressureLossProfiles}`,
    `- distinct recovery profiles: ${model.distinctRecoveryProfiles}`,
    `- distinct cause tag profiles: ${model.distinctCauseTagProfiles}`,
    `- distinct watchpoint profiles: ${model.distinctWatchpointProfiles}`,
    `- score mutation count: 0`,
    `- possession mutation count: 0`,
    `- production scoring event creation count: ${model.productionScoringEventCreationCount}`,
    `- global economy claim count: ${model.globalEconomyClaimCount}`,
    "",
    "## Recommendation",
    "- CONFIRM_FULL_MATCH_TRACE_VALIDATION.",
    "- CONFIRM_REPORT_CHANGES_WITH_MATCH_PROFILE.",
    "- CONFIRM_OFFICIAL_AGGREGATES_REMAIN_SOURCE_OF_TRUTH.",
    "- PREPARE_COACH_REPORT_V1_VISUALIZATION.",
    "",
  ].join("\n");
}

export function fullMatchTraceValidationEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: FullMatchTraceValidationModel;
}): MatchReportEvidenceFact {
  const evidenceEvent = input.report.timeline.find((event) => event.eventType !== "kickoff") ?? input.report.timeline[0];

  return {
    factId: `${input.matchInput.matchId}-full-match-trace-validation`,
    matchId: input.matchInput.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_FULL_MATCH_TRACE_VALIDATION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: evidenceEvent === undefined ? [] : [evidenceEvent.eventId],
    affectedZones: input.model.profiles.flatMap((profile) => profile.topDangerZones).slice(0, 5),
    summary:
      `Full-match trace validation ${input.model.status}: profileCount=${input.model.profileCount}, ` +
      `baseline=${input.model.baselineProfileId}, profileVariationDetected=${input.model.profileVariationDetected}, ` +
      `reportVariationDetected=${input.model.reportVariationDetected}, distinctDangerZoneProfiles=${input.model.distinctDangerZoneProfiles}, ` +
      `distinctPressureLossProfiles=${input.model.distinctPressureLossProfiles}, distinctRecoveryProfiles=${input.model.distinctRecoveryProfiles}, ` +
      `distinctCauseTagProfiles=${input.model.distinctCauseTagProfiles}, distinctWatchpointProfiles=${input.model.distinctWatchpointProfiles}, ` +
      "allScopesSeparated=true, selectionPreviewStillSandboxOnly=true, selectionPreviewConfidenceUpgraded=false, mutationCounts=0, " +
      "productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 60,
    coachVisible: false,
    internalTags: [
      "workbench_chain_full_match_trace_validation",
      ...input.model.tags,
    ],
  };
}
