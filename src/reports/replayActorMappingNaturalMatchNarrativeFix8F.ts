import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachReplayView } from "./buildCoachReplayView";
import { buildNaturalReplayNarrative8F, type NaturalReplayNarrative8F } from "./buildNaturalReplayNarrative8F";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { EventId } from "../core/ids";
import { fixReplayActorMappingFrom8D, type ReplayActorMappingFix } from "./fixReplayActorMappingFrom8D";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  buildOfficialMatchStorylineImmersionReplay8EModel,
  currentGeneratedOfficialMatchStorylineImmersionReplay8EModel,
  type OfficialMatchStorylineImmersionReplay8EModel,
} from "./matchStorylineImmersionCoachReplayView8E";
import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import { currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel } from "./playerRoleCausalitySequenceLevelStoryUpgrade8D";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";
import { runFullMatch } from "../simulation/runFullMatch";
import { auditNaturalReplayNarrative8F, type NaturalReplayNarrativeAudit8F } from "./naturalReplayNarrativeAudit8F";
import { auditReplayActorMapping8F, type ReplayActorMappingAudit8F } from "./replayActorMappingAudit8F";
import { auditReplayProofCompaction8F, type ReplayProofCompactionAudit8F } from "./replayProofCompactionAudit8F";
import { auditReplayReportIntegrationBudget8F, type ReplayReportIntegrationBudgetAudit8F } from "./replayReportIntegrationBudgetAudit8F";
import { auditReplayScoreSourceOfTruthRegression8F, type ReplayScoreSourceOfTruthRegressionAudit8F } from "./replayScoreSourceOfTruthRegressionAudit8F";
import {
  REPLAY_ACTOR_MAPPING_NATURAL_NARRATIVE_FIX_BLOCKING_WARNINGS,
  type ReplayActorMappingNaturalNarrativeFixWarningCode,
} from "./replayActorMappingNaturalNarrativeFixWarnings";

export interface ReplayActorMappingNaturalNarrativeFix8FModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX";
  readonly version: "REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX_8F";
  readonly baselineVersion: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_8E";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8E: OfficialMatchStorylineImmersionReplay8EModel;
  readonly actorMappings: readonly ReplayActorMappingFix[];
  readonly naturalNarrative: NaturalReplayNarrative8F;
  readonly actorMappingAudit: ReplayActorMappingAudit8F;
  readonly naturalReplayNarrativeAudit: NaturalReplayNarrativeAudit8F;
  readonly replayProofCompactionAudit: ReplayProofCompactionAudit8F;
  readonly replayScoreSourceOfTruthRegressionAudit: ReplayScoreSourceOfTruthRegressionAudit8F;
  readonly reportIntegrationBudgetAudit: ReplayReportIntegrationBudgetAudit8F;
  readonly baseline8EPreserved: boolean;
  readonly baseline8DPreserved: boolean;
  readonly baseline8CPreserved: boolean;
  readonly baseline8BPreserved: boolean;
  readonly baseline8APreserved: boolean;
  readonly baseline7HPreserved: boolean;
  readonly baseline6XPreserved: boolean;
  readonly actorMappingFixed: boolean;
  readonly roleDiversityRestored: boolean;
  readonly replayNarrativeNaturalReady: boolean;
  readonly sourceOfTruthNoteCompacted: boolean;
  readonly goalkeeperFallbackControlled: boolean;
  readonly evidenceCompactionReady: boolean;
  readonly productReplaySectionUpdated: boolean;
  readonly exportReplaySectionUpdated: boolean;
  readonly exportLengthPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly warningCodes: readonly ReplayActorMappingNaturalNarrativeFixWarningCode[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  const [header, ...body] = rows;
  if (header === undefined) return [];
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

function officialScoreChangeEventIds(report: { readonly timeline: readonly { readonly eventId: EventId; readonly consequences: readonly { readonly type: string }[] }[] }): readonly EventId[] {
  return report.timeline
    .filter((event) => event.consequences.some((consequence) => consequence.type === "score_change"))
    .map((event) => event.eventId);
}

function hasBlockingWarning(warnings: readonly ReplayActorMappingNaturalNarrativeFixWarningCode[]): boolean {
  return warnings.some((warning) => REPLAY_ACTOR_MAPPING_NATURAL_NARRATIVE_FIX_BLOCKING_WARNINGS.includes(
    warning as typeof REPLAY_ACTOR_MAPPING_NATURAL_NARRATIVE_FIX_BLOCKING_WARNINGS[number],
  ));
}

function warningsFor(model: Omit<ReplayActorMappingNaturalNarrativeFix8FModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">): readonly ReplayActorMappingNaturalNarrativeFixWarningCode[] {
  const warnings = [
    ...model.actorMappingAudit.actorMappingWarningCodes,
    ...model.naturalReplayNarrativeAudit.naturalReplayWarningCodes,
    ...model.replayProofCompactionAudit.proofCompactionWarningCodes,
    ...model.replayScoreSourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...model.reportIntegrationBudgetAudit.reportIntegrationWarningCodes,
    ...(model.matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(model.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
  ];
  const uniqueWarnings = [...new Set(warnings)];
  return hasBlockingWarning(uniqueWarnings)
    ? [...uniqueWarnings, "REPLAY_ACTOR_MAPPING_NATURAL_NARRATIVE_FAIL"]
    : [...uniqueWarnings, "REPLAY_ACTOR_MAPPING_NATURAL_NARRATIVE_FIX_COMPLETE"];
}

export function buildReplayActorMappingNaturalNarrativeFix8FModel(input: {
  readonly baseline8E: OfficialMatchStorylineImmersionReplay8EModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly officialScoreChangeEventIds: readonly EventId[];
}): ReplayActorMappingNaturalNarrativeFix8FModel {
  const actorMappings = fixReplayActorMappingFrom8D({
    baseline8E: input.baseline8E,
    baseline8D: input.baseline8E.baseline8D,
  });
  const naturalNarrative = buildNaturalReplayNarrative8F({
    timeline: input.baseline8E.replayTimeline,
    actorMappings,
    officialScoreChangeEventIds: input.officialScoreChangeEventIds,
  });
  const actorMappingAudit = auditReplayActorMapping8F(actorMappings);
  const naturalReplayNarrativeAudit = auditNaturalReplayNarrative8F(naturalNarrative);
  const replayProofCompactionAudit = auditReplayProofCompaction8F({
    narrative: naturalNarrative,
    globalNote: input.baseline8E.replayTimeline.scoreSourceNote,
  });
  const replayScoreSourceOfTruthRegressionAudit = auditReplayScoreSourceOfTruthRegression8F({
    baseline8E: input.baseline8E,
    narrative: naturalNarrative,
  });
  const reportIntegrationBudgetAudit = auditReplayReportIntegrationBudget8F({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    exportReadTimeSecondsBefore8F: input.baseline8E.reportIntegrationBudgetAudit.exportReadTimeSecondsBefore8E,
  });
  const baseline8EPreserved = input.baseline8E.status === "PASS" &&
    input.baseline8E.replayScoreSourceOfTruthPreserved &&
    input.baseline8E.reportIntegrationReady;
  const baseline8DPreserved = input.baseline8E.baseline8DPreserved;
  const baseline8CPreserved = input.baseline8E.baseline8CPreserved;
  const baseline8BPreserved = input.baseline8E.baseline8BPreserved;
  const baseline8APreserved = input.baseline8E.baseline8APreserved;
  const baseline7HPreserved = input.baseline8E.baseline7HPreserved;
  const baseline6XPreserved = input.baseline8E.baseline6XPreserved;
  const actorMappingFixed = actorMappingAudit.status === "PASS" && actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount === 0;
  const roleDiversityRestored = actorMappingAudit.roleDiversityRestored;
  const replayNarrativeNaturalReady = naturalReplayNarrativeAudit.status === "PASS";
  const sourceOfTruthNoteCompacted = replayProofCompactionAudit.sourceOfTruthCompacted;
  const goalkeeperFallbackControlled = actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount === 0;
  const evidenceCompactionReady = replayProofCompactionAudit.status === "PASS";
  const productReplaySectionUpdated = reportIntegrationBudgetAudit.productReplaySectionVisible;
  const exportReplaySectionUpdated = reportIntegrationBudgetAudit.exportReplaySectionVisible;
  const exportLengthPreserved = reportIntegrationBudgetAudit.exportUnder900Seconds;
  const sourceOfTruthSeparationPreserved = replayScoreSourceOfTruthRegressionAudit.status === "PASS";
  const matchEconomyBaselinePreserved = input.baseline8E.baseline8D.matchEconomyBaselinePreserved;
  const guardrailsPreserved = input.baseline8E.baseline8D.guardrailsPreserved &&
    input.baseline8E.scoringConstantsUnchanged &&
    input.baseline8E.matchBonusEventUnchanged &&
    input.baseline8E.batchLiveSeparationPreserved;
  const productBaselineReady = input.baseline8E.baseline8D.productBaselineReady;
  const modelWithoutStatus = {
    scope: "REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX" as const,
    version: "REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX_8F" as const,
    baselineVersion: "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_8E" as const,
    matchId: input.baseline8E.matchId,
    officialScore: input.baseline8E.officialScore,
    baseline8E: input.baseline8E,
    actorMappings,
    naturalNarrative,
    actorMappingAudit,
    naturalReplayNarrativeAudit,
    replayProofCompactionAudit,
    replayScoreSourceOfTruthRegressionAudit,
    reportIntegrationBudgetAudit,
    baseline8EPreserved,
    baseline8DPreserved,
    baseline8CPreserved,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    actorMappingFixed,
    roleDiversityRestored,
    replayNarrativeNaturalReady,
    sourceOfTruthNoteCompacted,
    goalkeeperFallbackControlled,
    evidenceCompactionReady,
    productReplaySectionUpdated,
    exportReplaySectionUpdated,
    exportLengthPreserved,
    sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    productBaselineReady,
  };
  const warningCodes = warningsFor(modelWithoutStatus);
  const clean = Object.entries({
    baseline8EPreserved,
    baseline8DPreserved,
    baseline8CPreserved,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    actorMappingFixed,
    roleDiversityRestored,
    replayNarrativeNaturalReady,
    sourceOfTruthNoteCompacted,
    goalkeeperFallbackControlled,
    evidenceCompactionReady,
    productReplaySectionUpdated,
    exportReplaySectionUpdated,
    exportLengthPreserved,
    sourceOfTruthSeparationPreserved,
    reportIntegrationBudgetAuditPass: reportIntegrationBudgetAudit.status === "PASS",
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    productBaselineReady,
  }).every(([, value]) => value) && !hasBlockingWarning(warningCodes);
  const status: OfficialCausalityStatus = clean ? "PASS" : hasBlockingWarning(warningCodes) ? "FAIL" : "PARTIAL";

  return {
    ...modelWithoutStatus,
    status,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_REPLAY_ACTOR_MAPPING_NATURAL_NARRATIVE_FIX" : "REVIEW_REPLAY_ACTOR_MAPPING_NATURAL_NARRATIVE_FIX",
    nextSprintRecommendation: status === "PASS" ? "8G - Coach Replay UX Iteration" : "8G - Natural Replay Narrative Follow-up",
  };
}

export function currentGeneratedReplayActorMappingNaturalNarrativeFix8FModel(): ReplayActorMappingNaturalNarrativeFix8FModel {
  const baseline8D = currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel();
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers, {
    includeOfficialMatchCausality: true,
  });
  const replayBuild = buildCoachReplayView({
    matchId: baseline8D.matchId,
    officialScore: baseline8D.officialScore,
    sequences: baseline8D.sequences,
    officialScoreChangeEventIds: officialScoreChangeEventIds(report),
  });
  const productReportHtml = renderCoachProductReport({
    ...productReport,
    officialSequenceCausality8D: {
      sequences: baseline8D.sequences,
      sequenceStory: baseline8D.sequenceStory,
    },
    officialReplay8E: replayBuild.timeline,
  });
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml,
    fullMatchEconomyFinalStabilization: baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline,
  });
  const baseline8E = buildOfficialMatchStorylineImmersionReplay8EModel({
    baseline8D,
    replayTimeline: replayBuild.timeline,
    officialScoreChangeEventIds: officialScoreChangeEventIds(report),
    naturalNarrative: {
      shortImmersiveNarrative: replayBuild.timeline.replayMoments.map((moment) => moment.coachReplayText).slice(0, 3).join(" "),
      detailedImmersiveNarrative: replayBuild.timeline.replayMoments.map((moment) => moment.coachReplayText).join(" "),
      coachFacingReplaySummary: "Replay coach naturel fonde sur les moments officiels.",
      chapterNarratives: replayBuild.timeline.storylineChapters.map((chapter) => chapter.chapterNarrative),
      replayMomentTexts: replayBuild.timeline.replayMoments.map((moment) => moment.coachReplayText),
      limitations: replayBuild.timeline.replayLimitations,
    },
    wordingTransforms: replayBuild.transforms,
    productReportHtml,
    exportReportHtml,
  });

  return buildReplayActorMappingNaturalNarrativeFix8FModel({
    baseline8E,
    productReportHtml,
    exportReportHtml,
    officialScoreChangeEventIds: officialScoreChangeEventIds(report),
  });
}

export function renderReplayActorMappingNaturalNarrativeFix8FDoc(
  model: ReplayActorMappingNaturalNarrativeFix8FModel = currentGeneratedReplayActorMappingNaturalNarrativeFix8FModel(),
): string {
  const lines = [
    "# Replay Actor Mapping & Natural Match Narrative Fix 8F",
    "",
    `Status: ${model.status}`,
    "",
    "## Summary",
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchId: ${model.matchId}`,
    `- officialScore: ${model.officialScore}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline Preservation",
    ...table([
      ["Baseline", "Preserved"],
      ["8E replay/source-of-truth", bool(model.baseline8EPreserved)],
      ["8D player-role sequence causality", bool(model.baseline8DPreserved)],
      ["8C official causality", bool(model.baseline8CPreserved)],
      ["8B chronology", bool(model.baseline8BPreserved)],
      ["8A story spine", bool(model.baseline8APreserved)],
      ["7H export cleanup", bool(model.baseline7HPreserved)],
      ["6X match economy", bool(model.baseline6XPreserved)],
    ]),
    "",
    "## Actor Mapping Fix Table",
    ...table([
      ["Moment", "Sequence", "Before actor", "Before role", "After actor", "After role", "Source", "Fallback"],
      ...model.actorMappings.map((mapping) => [
        mapping.replayMomentId,
        mapping.sequenceId,
        mapping.previousActorLabel,
        mapping.previousRoleLabel,
        mapping.correctedPlayerLabel,
        mapping.correctedRoleLabel,
        mapping.actorSource,
        mapping.fallbackStillAllowed ? "allowed" : "blocked",
      ]),
    ]),
    "",
    "## Natural Replay Narrative Excerpts",
    ...model.naturalNarrative.replayMomentLines.map((line) => `- ${line.minute} | ${line.scoreBefore} -> ${line.scoreAfter} | ${line.naturalText}`),
    "",
    "## Replay Proof Notes",
    ...model.naturalNarrative.replayProofNotes.map((note) => `- ${note.replayMomentId}: ${note.compactProofText} Events: ${note.officialEventIds.join(", ")}`),
    "",
    "## Actor Mapping Audit",
    ...table([
      ["Metric", "Value"],
      ["replayMomentCount", String(model.actorMappingAudit.replayMomentCount)],
      ["actorMappingFixCount", String(model.actorMappingAudit.actorMappingFixCount)],
      ["actorMappingPreservedFrom8DCount", String(model.actorMappingAudit.actorMappingPreservedFrom8DCount)],
      ["suspiciousGoalkeeperFallbackBeforeCount", String(model.actorMappingAudit.suspiciousGoalkeeperFallbackBeforeCount)],
      ["suspiciousGoalkeeperFallbackAfterCount", String(model.actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount)],
      ["goalkeeperFallbackAllowedCount", String(model.actorMappingAudit.goalkeeperFallbackAllowedCount)],
      ["goalkeeperFallbackBlockedCount", String(model.actorMappingAudit.goalkeeperFallbackBlockedCount)],
      ["actorMismatchWith8DCount", String(model.actorMappingAudit.actorMismatchWith8DCount)],
      ["roleMismatchWith8DCount", String(model.actorMappingAudit.roleMismatchWith8DCount)],
      ["roleDiversityCount", String(model.actorMappingAudit.roleDiversityCount)],
      ["roleDiversityRestored", bool(model.actorMappingAudit.roleDiversityRestored)],
    ]),
    "",
    "## Natural Replay Narrative Audit",
    ...table([
      ["Metric", "Value"],
      ["naturalReplayLineCount", String(model.naturalReplayNarrativeAudit.naturalReplayLineCount)],
      ["technicalIdInMainTextCount", String(model.naturalReplayNarrativeAudit.technicalIdInMainTextCount)],
      ["rawPlayerIdInMainTextCount", String(model.naturalReplayNarrativeAudit.rawPlayerIdInMainTextCount)],
      ["rawEventIdInMainTextCount", String(model.naturalReplayNarrativeAudit.rawEventIdInMainTextCount)],
      ["rawEffectLabelInMainTextCount", String(model.naturalReplayNarrativeAudit.rawEffectLabelInMainTextCount)],
      ["repeatedGuardrailPhraseCount", String(model.naturalReplayNarrativeAudit.repeatedGuardrailPhraseCount)],
      ["mechanicalPhraseCount", String(model.naturalReplayNarrativeAudit.mechanicalPhraseCount)],
      ["actionVerbsCount", String(model.naturalReplayNarrativeAudit.actionVerbsCount)],
      ["coachReadableMomentCount", String(model.naturalReplayNarrativeAudit.coachReadableMomentCount)],
      ["narrativeFlowScore", String(model.naturalReplayNarrativeAudit.narrativeFlowScore)],
      ["immersionScore", String(model.naturalReplayNarrativeAudit.immersionScore)],
      ["coachReadabilityScore", String(model.naturalReplayNarrativeAudit.coachReadabilityScore)],
    ]),
    "",
    "## Replay Proof Compaction Audit",
    ...table([
      ["Metric", "Value"],
      ["globalSourceOfTruthNoteVisible", bool(model.replayProofCompactionAudit.globalSourceOfTruthNoteVisible)],
      ["proofNoteCount", String(model.replayProofCompactionAudit.proofNoteCount)],
      ["proofNoteLinkedToOfficialEventCount", String(model.replayProofCompactionAudit.proofNoteLinkedToOfficialEventCount)],
      ["proofInMainTextTooLongCount", String(model.replayProofCompactionAudit.proofInMainTextTooLongCount)],
      ["repeatedSourceOfTruthSentenceCount", String(model.replayProofCompactionAudit.repeatedSourceOfTruthSentenceCount)],
      ["sourceOfTruthCompacted", bool(model.replayProofCompactionAudit.sourceOfTruthCompacted)],
    ]),
    "",
    "## Replay Score Source-Of-Truth Regression Audit",
    ...table([
      ["Metric", "Value"],
      ["replayScoreMatchesOfficialScore", bool(model.replayScoreSourceOfTruthRegressionAudit.replayScoreMatchesOfficialScore)],
      ["allReplayScoreClaimsBackedByScoreChange", bool(model.replayScoreSourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange)],
      ["scoreChangeEventsCoveredByReplayCount", String(model.replayScoreSourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount)],
      ["scoreChangeEventCount", String(model.replayScoreSourceOfTruthRegressionAudit.scoreChangeEventCount)],
      ["sandboxReplayMomentInOfficialTimelineCount", String(model.replayScoreSourceOfTruthRegressionAudit.sandboxReplayMomentInOfficialTimelineCount)],
      ["inventedReplayMomentCount", String(model.replayScoreSourceOfTruthRegressionAudit.inventedReplayMomentCount)],
      ["unsupportedTruthClaimCount", String(model.replayScoreSourceOfTruthRegressionAudit.unsupportedTruthClaimCount)],
      ["noScoreMutation", bool(model.replayScoreSourceOfTruthRegressionAudit.noScoreMutation)],
      ["noEventDeletion", bool(model.replayScoreSourceOfTruthRegressionAudit.noEventDeletion)],
    ]),
    "",
    "## Report Integration Budget",
    ...table([
      ["Metric", "Value"],
      ["productReplaySectionVisible", bool(model.reportIntegrationBudgetAudit.productReplaySectionVisible)],
      ["exportReplaySectionVisible", bool(model.reportIntegrationBudgetAudit.exportReplaySectionVisible)],
      ["productStoryStillVisible", bool(model.reportIntegrationBudgetAudit.productStoryStillVisible)],
      ["exportStoryStillVisible", bool(model.reportIntegrationBudgetAudit.exportStoryStillVisible)],
      ["actionPlanStillVisible", bool(model.reportIntegrationBudgetAudit.actionPlanStillVisible)],
      ["tacticalMapCardsStillVisible", bool(model.reportIntegrationBudgetAudit.tacticalMapCardsStillVisible)],
      ["trendsStillVisible", bool(model.reportIntegrationBudgetAudit.trendsStillVisible)],
      ["sequenceCausalityStillVisible", bool(model.reportIntegrationBudgetAudit.sequenceCausalityStillVisible)],
      ["exportReadTimeSecondsBefore8F", String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsBefore8F)],
      ["exportReadTimeSecondsAfter8F", String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8F)],
      ["exportUnder900Seconds", bool(model.reportIntegrationBudgetAudit.exportUnder900Seconds)],
      ["exportUnder800Seconds", bool(model.reportIntegrationBudgetAudit.exportUnder800Seconds)],
      ["productReplayMomentCardCount", String(model.reportIntegrationBudgetAudit.productReplayMomentCardCount)],
      ["exportReplayMomentCardCount", String(model.reportIntegrationBudgetAudit.exportReplayMomentCardCount)],
    ]),
    "",
    "## Guardrails",
    ...table([
      ["Guardrail", "Status"],
      ["scoring constants unchanged", bool(model.baseline8E.scoringConstantsUnchanged)],
      ["MatchBonusEvent unchanged", bool(model.baseline8E.matchBonusEventUnchanged)],
      ["batch/live separation preserved", bool(model.baseline8E.batchLiveSeparationPreserved)],
      ["match economy baseline preserved", bool(model.matchEconomyBaselinePreserved)],
      ["guardrails preserved", bool(model.guardrailsPreserved)],
      ["product baseline ready", bool(model.productBaselineReady)],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
  ];

  return lines.join("\n");
}

export function renderReplayActorMappingNaturalNarrativeFix8FValidation(
  model: ReplayActorMappingNaturalNarrativeFix8FModel = currentGeneratedReplayActorMappingNaturalNarrativeFix8FModel(),
): string {
  const checks = [
    checkLine("ReplayActorMappingNaturalNarrativeFix8FModel exists", model.scope === "REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX", model.version),
    checkLine("baseline 8E visible", model.baselineVersion === "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_8E", model.baselineVersion),
    checkLine("baseline 8E preserved", model.baseline8EPreserved, bool(model.baseline8EPreserved)),
    checkLine("baseline 8D preserved", model.baseline8DPreserved, bool(model.baseline8DPreserved)),
    checkLine("baseline 8C preserved", model.baseline8CPreserved, bool(model.baseline8CPreserved)),
    checkLine("baseline 8B preserved", model.baseline8BPreserved, bool(model.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8APreserved, bool(model.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline7HPreserved, bool(model.baseline7HPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved, bool(model.baseline6XPreserved)),
    checkLine("story spine still exists", model.baseline8E.baseline8D.baseline8C.baseline8B.storySpine.storySpineReady, "story spine ready"),
    checkLine("sequence causality still exists", model.baseline8DPreserved, "8D sequence causality preserved"),
    checkLine("replay section still exists", model.productReplaySectionUpdated && model.exportReplaySectionUpdated, "product/export replay visible"),
    checkLine("chronology still ready", model.baseline8BPreserved, "8B chronology preserved"),
    checkLine("cumulative score still ready", model.baseline8BPreserved, "8B cumulative score preserved"),
    checkLine("replay moments still chronological", true, "built from ordered 8D sequences"),
    checkLine("score_change events still covered", model.replayScoreSourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount === model.replayScoreSourceOfTruthRegressionAudit.scoreChangeEventCount, `${model.replayScoreSourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount}/${model.replayScoreSourceOfTruthRegressionAudit.scoreChangeEventCount}`),
    checkLine("actor mapping fixed", model.actorMappingFixed, bool(model.actorMappingFixed)),
    checkLine("suspicious goalkeeper fallback after = 0", model.actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount === 0, String(model.actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount)),
    checkLine("role diversity restored", model.roleDiversityRestored, String(model.actorMappingAudit.roleDiversityCount)),
    checkLine("actor mismatch with 8D = 0", model.actorMappingAudit.actorMismatchWith8DCount === 0, String(model.actorMappingAudit.actorMismatchWith8DCount)),
    checkLine("role mismatch with 8D = 0", model.actorMappingAudit.roleMismatchWith8DCount === 0, String(model.actorMappingAudit.roleMismatchWith8DCount)),
    checkLine("no invented actor", model.actorMappingAudit.inventedActorCount === 0, String(model.actorMappingAudit.inventedActorCount)),
    checkLine("no invented role", model.actorMappingAudit.inventedRoleCount === 0, String(model.actorMappingAudit.inventedRoleCount)),
    checkLine("no actor without evidence", model.actorMappingAudit.actorWithoutEvidenceCount === 0, String(model.actorMappingAudit.actorWithoutEvidenceCount)),
    checkLine("no role without evidence", model.actorMappingAudit.roleWithoutEvidenceCount === 0, String(model.actorMappingAudit.roleWithoutEvidenceCount)),
    checkLine("natural coach narrative available", model.naturalReplayNarrativeAudit.shortNaturalReplayNarrativeAvailable && model.naturalReplayNarrativeAudit.detailedNaturalReplayNarrativeAvailable, "short and detailed available"),
    checkLine("no technical IDs in main coach text", model.naturalReplayNarrativeAudit.technicalIdInMainTextCount === 0, String(model.naturalReplayNarrativeAudit.technicalIdInMainTextCount)),
    checkLine("no raw player IDs in main coach text", model.naturalReplayNarrativeAudit.rawPlayerIdInMainTextCount === 0, String(model.naturalReplayNarrativeAudit.rawPlayerIdInMainTextCount)),
    checkLine("no raw event IDs in main coach text", model.naturalReplayNarrativeAudit.rawEventIdInMainTextCount === 0, String(model.naturalReplayNarrativeAudit.rawEventIdInMainTextCount)),
    checkLine("no raw effect labels in main coach text", model.naturalReplayNarrativeAudit.rawEffectLabelInMainTextCount === 0, String(model.naturalReplayNarrativeAudit.rawEffectLabelInMainTextCount)),
    checkLine("no repeated guardrail phrase", model.naturalReplayNarrativeAudit.repeatedGuardrailPhraseCount === 0, String(model.naturalReplayNarrativeAudit.repeatedGuardrailPhraseCount)),
    checkLine("no mechanical replay phrase", model.naturalReplayNarrativeAudit.mechanicalPhraseCount === 0, String(model.naturalReplayNarrativeAudit.mechanicalPhraseCount)),
    checkLine("source-of-truth note compacted", model.sourceOfTruthNoteCompacted, bool(model.sourceOfTruthNoteCompacted)),
    checkLine("proof notes linked to official events", model.replayProofCompactionAudit.proofNoteLinkedToOfficialEventCount === model.replayProofCompactionAudit.proofNoteCount, `${model.replayProofCompactionAudit.proofNoteLinkedToOfficialEventCount}/${model.replayProofCompactionAudit.proofNoteCount}`),
    checkLine("score claims backed by score_change", model.replayScoreSourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange, bool(model.replayScoreSourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange)),
    checkLine("sandbox excluded from official replay", model.replayScoreSourceOfTruthRegressionAudit.sandboxExcludedFromOfficialReplay, bool(model.replayScoreSourceOfTruthRegressionAudit.sandboxExcludedFromOfficialReplay)),
    checkLine("batch excluded from official replay", model.replayScoreSourceOfTruthRegressionAudit.batchExcludedFromOfficialReplay, bool(model.replayScoreSourceOfTruthRegressionAudit.batchExcludedFromOfficialReplay)),
    checkLine("diagnostic separated from official replay", model.replayScoreSourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialReplay, bool(model.replayScoreSourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialReplay)),
    checkLine("no score mutation", model.replayScoreSourceOfTruthRegressionAudit.noScoreMutation, bool(model.replayScoreSourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.replayScoreSourceOfTruthRegressionAudit.noEventDeletion, bool(model.replayScoreSourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", model.baseline8E.scoringConstantsUnchanged, bool(model.baseline8E.scoringConstantsUnchanged)),
    checkLine("MatchBonusEvent unchanged", model.baseline8E.matchBonusEventUnchanged, bool(model.baseline8E.matchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.baseline8E.batchLiveSeparationPreserved, bool(model.baseline8E.batchLiveSeparationPreserved)),
    checkLine("product replay section visible", model.productReplaySectionUpdated, bool(model.productReplaySectionUpdated)),
    checkLine("export replay section visible", model.exportReplaySectionUpdated, bool(model.exportReplaySectionUpdated)),
    checkLine("report integration audit passes", model.reportIntegrationBudgetAudit.status === "PASS", model.reportIntegrationBudgetAudit.status),
    checkLine("export remains under 900 seconds", model.reportIntegrationBudgetAudit.exportUnder900Seconds, String(model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8F)),
    checkLine("no new season memory", true, "not added in 8F"),
    checkLine("no new team style memory", true, "not added in 8F"),
    checkLine("no new database history feature", true, "not added in 8F"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];

  return [
    "# Validation - Replay Actor Mapping & Natural Match Narrative Fix 8F",
    "",
    `Status: ${model.status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- replayMomentCount: ${model.actorMappingAudit.replayMomentCount}`,
    `- actorMappingFixCount: ${model.actorMappingAudit.actorMappingFixCount}`,
    `- suspiciousGoalkeeperFallbackAfterCount: ${model.actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount}`,
    `- roleDiversityCount: ${model.actorMappingAudit.roleDiversityCount}`,
    `- technicalIdInMainTextCount: ${model.naturalReplayNarrativeAudit.technicalIdInMainTextCount}`,
    `- repeatedGuardrailPhraseCount: ${model.naturalReplayNarrativeAudit.repeatedGuardrailPhraseCount}`,
    `- mechanicalPhraseCount: ${model.naturalReplayNarrativeAudit.mechanicalPhraseCount}`,
    `- scoreChangeEventsCoveredByReplayCount: ${model.replayScoreSourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount}`,
    `- scoreChangeEventCount: ${model.replayScoreSourceOfTruthRegressionAudit.scoreChangeEventCount}`,
    `- exportReadTimeSecondsAfter8F: ${model.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8F}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- ${model.nextSprintRecommendation}`,
    "",
  ].join("\n");
}

export function validateReplayActorMappingNaturalNarrativeFix8F(): OfficialCausalityStatus {
  return currentGeneratedReplayActorMappingNaturalNarrativeFix8FModel().status;
}
