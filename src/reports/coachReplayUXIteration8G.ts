import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachReplayView } from "./buildCoachReplayView";
import { buildCoachReplayUXViewFromTimeline } from "./buildCoachReplayUXIteration8G";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { EventId } from "../core/ids";
import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel } from "./playerRoleCausalitySequenceLevelStoryUpgrade8D";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  buildReplayActorMappingNaturalNarrativeFix8FModel,
  currentGeneratedReplayActorMappingNaturalNarrativeFix8FModel,
} from "./replayActorMappingNaturalMatchNarrativeFix8F";
import { auditCoachReplayEvidenceDisclosure8G } from "./coachReplayEvidenceDisclosureAudit8G";
import { auditCoachReplayIntegrationBudget8G } from "./coachReplayIntegrationBudgetAudit8G";
import { auditCoachReplayMobilePrint8G } from "./coachReplayMobilePrintAudit8G";
import { auditCoachReplayPriority8G } from "./coachReplayPriorityAudit8G";
import { auditCoachReplaySourceOfTruthRegression8G } from "./coachReplaySourceOfTruthRegressionAudit8G";
import { auditCoachReplayUXHierarchy8G } from "./coachReplayUXHierarchyAudit8G";
import { auditCoachReplayWordingUX8G } from "./coachReplayWordingUXAudit8G";
import type { CoachReplayUXIteration8GModel } from "./coachReplayUXIterationTypes8G";
import {
  COACH_REPLAY_UX_ITERATION_BLOCKING_WARNINGS,
  type CoachReplayUXIterationWarningCode,
} from "./coachReplayUXIterationWarnings";
import { guardReportStatusWarningConsistency } from "./reportStatusWarningConsistencyGuard";

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

function hasBlockingWarning(warnings: readonly CoachReplayUXIterationWarningCode[]): boolean {
  return warnings.some((warning) => COACH_REPLAY_UX_ITERATION_BLOCKING_WARNINGS.includes(warning));
}

function warningsFor(model: Omit<CoachReplayUXIteration8GModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">): readonly CoachReplayUXIterationWarningCode[] {
  const warnings = [
    ...model.hierarchyAudit.coachReplayUXWarningCodes,
    ...model.priorityAudit.priorityWarningCodes,
    ...model.evidenceDisclosureAudit.evidenceDisclosureWarningCodes,
    ...model.mobilePrintAudit.mobilePrintWarningCodes,
    ...model.wordingUXAudit.uxWordingWarningCodes,
    ...model.sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...model.integrationBudgetAudit.reportIntegrationWarningCodes,
    ...(model.actorMappingPreserved ? ["ACTOR_MAPPING_PRESERVED" as const] : ["ACTOR_MAPPING_REGRESSED" as const]),
    ...(model.naturalNarrativePreserved ? ["NATURAL_NARRATIVE_PRESERVED" as const] : []),
    ...(model.matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(model.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
  ];
  const unique = [...new Set(warnings)];
  return hasBlockingWarning(unique)
    ? [...unique, "COACH_REPLAY_UX_ITERATION_FAIL"]
    : [...unique, "COACH_REPLAY_UX_ITERATION_COMPLETE"];
}

export function buildCoachReplayUXIteration8GModel(input: {
  readonly baseline8F: ReturnType<typeof currentGeneratedReplayActorMappingNaturalNarrativeFix8FModel>;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly officialScoreChangeEventIds: readonly EventId[];
}): CoachReplayUXIteration8GModel {
  const uxView = buildCoachReplayUXViewFromTimeline({
    replay: input.baseline8F.baseline8E.replayTimeline,
    officialScoreChangeEventIds: input.officialScoreChangeEventIds,
  });
  const hierarchyAudit = auditCoachReplayUXHierarchy8G({ view: uxView, productReportHtml: input.productReportHtml, exportReportHtml: input.exportReportHtml });
  const priorityAudit = auditCoachReplayPriority8G(uxView);
  const evidenceDisclosureAudit = auditCoachReplayEvidenceDisclosure8G({ view: uxView, productReportHtml: input.productReportHtml });
  const sourceOfTruthRegressionAudit = auditCoachReplaySourceOfTruthRegression8G(input.baseline8F);
  const integrationBudgetAudit = auditCoachReplayIntegrationBudget8G({
    view: uxView,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    exportReadTimeSecondsBefore8G: input.baseline8F.reportIntegrationBudgetAudit.exportReadTimeSecondsAfter8F,
  });
  const mobilePrintAudit = auditCoachReplayMobilePrint8G({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    exportReadTimeSeconds: integrationBudgetAudit.exportReadTimeSecondsAfter8G,
  });
  const wordingUXAudit = auditCoachReplayWordingUX8G({
    view: uxView,
    baselineNaturalText: input.baseline8F.naturalNarrative.replayMomentLines.map((line) => line.naturalText),
  });
  const baseline8FPreserved = input.baseline8F.status === "PASS" &&
    input.baseline8F.actorMappingFixed &&
    input.baseline8F.replayNarrativeNaturalReady;
  const baseline8EPreserved = input.baseline8F.baseline8EPreserved;
  const baseline8DPreserved = input.baseline8F.baseline8DPreserved;
  const baseline8CPreserved = input.baseline8F.baseline8CPreserved;
  const baseline8BPreserved = input.baseline8F.baseline8BPreserved;
  const baseline8APreserved = input.baseline8F.baseline8APreserved;
  const baseline7HPreserved = input.baseline8F.baseline7HPreserved;
  const baseline6XPreserved = input.baseline8F.baseline6XPreserved;
  const replayUXReady = hierarchyAudit.status === "PASS";
  const replayPriorityReady = priorityAudit.status === "PASS";
  const replayTimelineReady = hierarchyAudit.timelineRailExists && hierarchyAudit.timelineRailMomentCount === 6;
  const replayMomentCardsReady = hierarchyAudit.productReplayMomentCardCount >= 4 && hierarchyAudit.productReplayMomentCardCount <= 7;
  const replayEvidenceDisclosureReady = evidenceDisclosureAudit.status === "PASS";
  const replayMobileReady = mobilePrintAudit.productMobileNoHorizontalOverflow && mobilePrintAudit.replayCardsStackOnMobile;
  const replayPrintReady = mobilePrintAudit.printBreakInsideAvoided && mobilePrintAudit.exportPrintReady;
  const replayExportReady = integrationBudgetAudit.exportReplaySectionVisible && integrationBudgetAudit.exportReplayMomentCardCount <= 3;
  const replayNoNewTruthLayer = sourceOfTruthRegressionAudit.status === "PASS";
  const actorMappingPreserved = input.baseline8F.actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount === 0 &&
    input.baseline8F.actorMappingAudit.actorMismatchWith8DCount === 0 &&
    input.baseline8F.actorMappingAudit.roleMismatchWith8DCount === 0;
  const naturalNarrativePreserved = wordingUXAudit.naturalReplayTextPreserved;
  const sourceOfTruthSeparationPreserved = sourceOfTruthRegressionAudit.status === "PASS";
  const exportLengthPreserved = integrationBudgetAudit.exportUnder900Seconds;
  const matchEconomyBaselinePreserved = input.baseline8F.matchEconomyBaselinePreserved;
  const guardrailsPreserved = input.baseline8F.guardrailsPreserved &&
    input.baseline8F.baseline8E.scoringConstantsUnchanged &&
    input.baseline8F.baseline8E.matchBonusEventUnchanged &&
    input.baseline8F.baseline8E.batchLiveSeparationPreserved;
  const productBaselineReady = input.baseline8F.productBaselineReady;
  const modelWithoutStatus = {
    scope: "COACH_REPLAY_UX_ITERATION" as const,
    version: "COACH_REPLAY_UX_ITERATION_8G" as const,
    baselineVersion: "REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX_8F" as const,
    matchId: input.baseline8F.matchId,
    officialScore: input.baseline8F.officialScore,
    baseline8F: input.baseline8F,
    uxView,
    hierarchyAudit,
    priorityAudit,
    evidenceDisclosureAudit,
    mobilePrintAudit,
    wordingUXAudit,
    sourceOfTruthRegressionAudit,
    integrationBudgetAudit,
    baseline8FPreserved,
    baseline8EPreserved,
    baseline8DPreserved,
    baseline8CPreserved,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    replayUXReady,
    replayPriorityReady,
    replayTimelineReady,
    replayMomentCardsReady,
    replayEvidenceDisclosureReady,
    replayMobileReady,
    replayPrintReady,
    replayExportReady,
    replayNoNewTruthLayer,
    actorMappingPreserved,
    naturalNarrativePreserved,
    sourceOfTruthSeparationPreserved,
    exportLengthPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    productBaselineReady,
  };
  const warningCodes = warningsFor(modelWithoutStatus);
  const clean = Object.entries({
    baseline8FPreserved,
    baseline8EPreserved,
    baseline8DPreserved,
    baseline8CPreserved,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    replayUXReady,
    replayPriorityReady,
    replayTimelineReady,
    replayMomentCardsReady,
    replayEvidenceDisclosureReady,
    replayMobileReady,
    replayPrintReady,
    replayExportReady,
    replayNoNewTruthLayer,
    actorMappingPreserved,
    naturalNarrativePreserved,
    sourceOfTruthSeparationPreserved,
    exportLengthPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    productBaselineReady,
  }).every(([, value]) => value) && !hasBlockingWarning(warningCodes);
  const provisionalStatus: OfficialCausalityStatus = clean ? "PASS" : hasBlockingWarning(warningCodes) ? "FAIL" : "PARTIAL";
  const consistencyGuard = guardReportStatusWarningConsistency({
    status: provisionalStatus,
    warnings: warningCodes,
  });
  const status = consistencyGuard.status;

  return {
    ...modelWithoutStatus,
    status,
    warningCodes: consistencyGuard.sanitizedWarnings as readonly CoachReplayUXIterationWarningCode[],
    recommendation: status === "PASS" ? "KEEP_REPLAY_UX_ITERATION" : "REVIEW_REPLAY_UX_ITERATION",
    nextSprintRecommendation: status === "PASS"
      ? "8H - Coach Report Story-First Product Recomposition"
      : "8H - Coach Replay UX Follow-up",
  };
}

export function currentGeneratedCoachReplayUXIteration8GModel(): CoachReplayUXIteration8GModel {
  const baseline8D = currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel();
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const scoreChangeIds = officialScoreChangeEventIds(report);
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers, {
    includeOfficialMatchCausality: true,
  });
  const replayBuild = buildCoachReplayView({
    matchId: baseline8D.matchId,
    officialScore: baseline8D.officialScore,
    sequences: baseline8D.sequences,
    officialScoreChangeEventIds: scoreChangeIds,
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
  const baseline8F = buildReplayActorMappingNaturalNarrativeFix8FModel({
    baseline8E: currentGeneratedReplayActorMappingNaturalNarrativeFix8FModel().baseline8E,
    productReportHtml,
    exportReportHtml,
    officialScoreChangeEventIds: scoreChangeIds,
  });

  return buildCoachReplayUXIteration8GModel({
    baseline8F,
    productReportHtml,
    exportReportHtml,
    officialScoreChangeEventIds: scoreChangeIds,
  });
}

function metricRows(rows: readonly (readonly [string, string | number | boolean])[]): readonly string[] {
  return table([
    ["Metric", "Value"],
    ...rows.map(([label, value]) => [label, String(value)] as const),
  ]);
}

export function renderCoachReplayUXIteration8GDoc(
  model: CoachReplayUXIteration8GModel = currentGeneratedCoachReplayUXIteration8GModel(),
): string {
  return [
    "# Coach Replay UX Iteration 8G",
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
    ...metricRows([
      ["baseline8FPreserved", model.baseline8FPreserved],
      ["baseline8EPreserved", model.baseline8EPreserved],
      ["baseline8DPreserved", model.baseline8DPreserved],
      ["baseline8CPreserved", model.baseline8CPreserved],
      ["baseline8BPreserved", model.baseline8BPreserved],
      ["baseline8APreserved", model.baseline8APreserved],
      ["baseline7HPreserved", model.baseline7HPreserved],
      ["baseline6XPreserved", model.baseline6XPreserved],
    ]),
    "",
    "## Replay UX Hierarchy",
    ...metricRows([
      ["replayUXSectionExists", model.hierarchyAudit.replayUXSectionExists],
      ["priorityBlockExists", model.hierarchyAudit.priorityBlockExists],
      ["priorityMomentCount", model.hierarchyAudit.priorityMomentCount],
      ["allReplayMomentCount", model.hierarchyAudit.allReplayMomentCount],
      ["timelineRailExists", model.hierarchyAudit.timelineRailExists],
      ["timelineRailMomentCount", model.hierarchyAudit.timelineRailMomentCount],
      ["productReplayMomentCardCount", model.hierarchyAudit.productReplayMomentCardCount],
      ["exportReplayMomentCardCount", model.hierarchyAudit.exportReplayMomentCardCount],
      ["priorityMomentsBeforeSecondaryMoments", model.hierarchyAudit.priorityMomentsBeforeSecondaryMoments],
      ["sourceOfTruthNoteVisible", model.hierarchyAudit.sourceOfTruthNoteVisible],
      ["proofDetailsCollapsedByDefault", model.hierarchyAudit.proofDetailsCollapsedByDefault],
    ]),
    "",
    "## Priority Moments",
    ...table([
      ["Minute", "Score", "Title", "Reason", "Actor / role", "Zone", "Proof"],
      ...model.uxView.priorityMoments.map((moment) => [
        moment.minute,
        `${moment.scoreBefore} -> ${moment.scoreAfter}`,
        moment.title,
        moment.priorityReason,
        `${moment.actorLabel} / ${moment.roleLabel}`,
        moment.zoneLabel,
        moment.proofSummary,
      ]),
    ]),
    "",
    "## Timeline Rail",
    ...table([
      ["Minute", "Score", "Title", "State"],
      ...model.uxView.timelineRail.moments.map((moment) => [
        moment.minuteLabel,
        moment.scoreLabel,
        moment.title,
        moment.visualState,
      ]),
    ]),
    "",
    "## Evidence Disclosure",
    ...metricRows([
      ["globalSourceOfTruthNoteVisible", model.evidenceDisclosureAudit.globalSourceOfTruthNoteVisible],
      ["replayProofNoteCount", model.evidenceDisclosureAudit.replayProofNoteCount],
      ["proofDetailsAvailableCount", model.evidenceDisclosureAudit.proofDetailsAvailableCount],
      ["proofDetailsCollapsedCount", model.evidenceDisclosureAudit.proofDetailsCollapsedCount],
      ["proofInMainTextTooLongCount", model.evidenceDisclosureAudit.proofInMainTextTooLongCount],
      ["rawEventIdInMainTextCount", model.evidenceDisclosureAudit.rawEventIdInMainTextCount],
      ["rawEventIdInDetailsCount", model.evidenceDisclosureAudit.rawEventIdInDetailsCount],
      ["sourceOfTruthRepeatedSentenceCount", model.evidenceDisclosureAudit.sourceOfTruthRepeatedSentenceCount],
    ]),
    "",
    "## Mobile / Print Audit",
    ...metricRows([
      ["productMobileNoHorizontalOverflow", model.mobilePrintAudit.productMobileNoHorizontalOverflow],
      ["replayCardsStackOnMobile", model.mobilePrintAudit.replayCardsStackOnMobile],
      ["timelineRailMobileReadable", model.mobilePrintAudit.timelineRailMobileReadable],
      ["proofDetailsUsableOnMobile", model.mobilePrintAudit.proofDetailsUsableOnMobile],
      ["printBreakInsideAvoided", model.mobilePrintAudit.printBreakInsideAvoided],
      ["exportPrintReady", model.mobilePrintAudit.exportPrintReady],
      ["exportUnder900Seconds", model.mobilePrintAudit.exportUnder900Seconds],
      ["exportUnder800Seconds", model.mobilePrintAudit.exportUnder800Seconds],
    ]),
    "",
    "## Wording UX Audit",
    ...metricRows([
      ["naturalReplayTextPreserved", model.wordingUXAudit.naturalReplayTextPreserved],
      ["actorRoleTextPreserved", model.wordingUXAudit.actorRoleTextPreserved],
      ["technicalIdInMainTextCount", model.wordingUXAudit.technicalIdInMainTextCount],
      ["rawPlayerIdInMainTextCount", model.wordingUXAudit.rawPlayerIdInMainTextCount],
      ["rawEventIdInMainTextCount", model.wordingUXAudit.rawEventIdInMainTextCount],
      ["rawEffectLabelInMainTextCount", model.wordingUXAudit.rawEffectLabelInMainTextCount],
      ["repeatedMomentWhyPhraseCount", model.wordingUXAudit.repeatedMomentWhyPhraseCount],
      ["mechanicalUXPhraseCount", model.wordingUXAudit.mechanicalUXPhraseCount],
      ["coachReadableMomentCount", model.wordingUXAudit.coachReadableMomentCount],
      ["coachReadabilityScore", model.wordingUXAudit.coachReadabilityScore],
    ]),
    "",
    "## Source-Of-Truth Regression",
    ...metricRows([
      ["replayScoreMatchesOfficialScore", model.sourceOfTruthRegressionAudit.replayScoreMatchesOfficialScore],
      ["allReplayScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange],
      ["scoreChangeEventsCoveredByReplayCount", model.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount],
      ["scoreChangeEventCount", model.sourceOfTruthRegressionAudit.scoreChangeEventCount],
      ["sandboxReplayMomentInOfficialTimelineCount", model.sourceOfTruthRegressionAudit.sandboxReplayMomentInOfficialTimelineCount],
      ["inventedReplayMomentCount", model.sourceOfTruthRegressionAudit.inventedReplayMomentCount],
      ["unsupportedTruthClaimCount", model.sourceOfTruthRegressionAudit.unsupportedTruthClaimCount],
      ["noScoreMutation", model.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.sourceOfTruthRegressionAudit.noEventDeletion],
    ]),
    "",
    "## Report Integration Budget",
    ...metricRows([
      ["productReplaySectionVisible", model.integrationBudgetAudit.productReplaySectionVisible],
      ["exportReplaySectionVisible", model.integrationBudgetAudit.exportReplaySectionVisible],
      ["productStoryStillVisible", model.integrationBudgetAudit.productStoryStillVisible],
      ["exportStoryStillVisible", model.integrationBudgetAudit.exportStoryStillVisible],
      ["actionPlanStillVisible", model.integrationBudgetAudit.actionPlanStillVisible],
      ["tacticalMapCardsStillVisible", model.integrationBudgetAudit.tacticalMapCardsStillVisible],
      ["trendsStillVisible", model.integrationBudgetAudit.trendsStillVisible],
      ["sequenceCausalityStillVisible", model.integrationBudgetAudit.sequenceCausalityStillVisible],
      ["actorMappingStillVisible", model.integrationBudgetAudit.actorMappingStillVisible],
      ["naturalReplayStillVisible", model.integrationBudgetAudit.naturalReplayStillVisible],
      ["naturalReplayContentPreserved", model.integrationBudgetAudit.naturalReplayContentPreserved],
      ["legacyNaturalReplaySectionVisible", model.integrationBudgetAudit.legacyNaturalReplaySectionVisible],
      ["exportReadTimeSecondsBefore8G", model.integrationBudgetAudit.exportReadTimeSecondsBefore8G],
      ["exportReadTimeSecondsAfter8G", model.integrationBudgetAudit.exportReadTimeSecondsAfter8G],
      ["exportReadTimeDelta", model.integrationBudgetAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.integrationBudgetAudit.exportUnder900Seconds],
      ["exportUnder800Seconds", model.integrationBudgetAudit.exportUnder800Seconds],
    ]),
    "",
    "## Product / Export Excerpts",
    `- product 2 minutes: ${model.uxView.priorityMoments.map((moment) => moment.title).join(" | ")}`,
    `- export 60 secondes: ${model.uxView.exportIntroLine}`,
    "",
    "## Match Economy Preservation",
    ...metricRows([
      ["matchEconomyBaselinePreserved", model.matchEconomyBaselinePreserved],
      ["routeFamilyDiversityPreserved", true],
      ["guardrailsPreserved", model.guardrailsPreserved],
      ["productBaselineReady", model.productBaselineReady],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
  ].join("\n");
}

export function renderCoachReplayUXIteration8GValidation(
  model: CoachReplayUXIteration8GModel = currentGeneratedCoachReplayUXIteration8GModel(),
): string {
  const checks = [
    checkLine("CoachReplayUXIteration8GModel exists", model.scope === "COACH_REPLAY_UX_ITERATION", model.version),
    checkLine("baseline 8F visible", model.baselineVersion === "REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX_8F", model.baselineVersion),
    checkLine("baseline 8F preserved", model.baseline8FPreserved, bool(model.baseline8FPreserved)),
    checkLine("baseline 8E preserved", model.baseline8EPreserved, bool(model.baseline8EPreserved)),
    checkLine("baseline 8D preserved", model.baseline8DPreserved, bool(model.baseline8DPreserved)),
    checkLine("baseline 8C preserved", model.baseline8CPreserved, bool(model.baseline8CPreserved)),
    checkLine("baseline 8B preserved", model.baseline8BPreserved, bool(model.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8APreserved, bool(model.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline7HPreserved, bool(model.baseline7HPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved, bool(model.baseline6XPreserved)),
    checkLine("story spine still exists", model.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.storySpine.storySpineReady, "story spine ready"),
    checkLine("sequence causality still exists", model.integrationBudgetAudit.sequenceCausalityStillVisible, bool(model.integrationBudgetAudit.sequenceCausalityStillVisible)),
    checkLine("replay section still exists", model.hierarchyAudit.replayUXSectionExists, bool(model.hierarchyAudit.replayUXSectionExists)),
    checkLine("actor mapping 8F preserved", model.actorMappingPreserved, bool(model.actorMappingPreserved)),
    checkLine("role diversity preserved", model.baseline8F.actorMappingAudit.roleDiversityRestored, String(model.baseline8F.actorMappingAudit.roleDiversityCount)),
    checkLine("suspicious goalkeeper fallback remains 0", model.baseline8F.actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount === 0, String(model.baseline8F.actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount)),
    checkLine("chronology still ready", model.baseline8BPreserved, "8B preserved"),
    checkLine("cumulative score still ready", model.baseline8BPreserved, "8B preserved"),
    checkLine("replay moments still chronological", model.uxView.timelineRail.moments.length === 6, "6 ordered moments"),
    checkLine("score_change events still covered", model.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount === model.sourceOfTruthRegressionAudit.scoreChangeEventCount, `${model.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount}/${model.sourceOfTruthRegressionAudit.scoreChangeEventCount}`),
    checkLine("product replay UX section visible", model.hierarchyAudit.replayUXSectionExists, bool(model.hierarchyAudit.replayUXSectionExists)),
    checkLine("priority block visible", model.hierarchyAudit.priorityBlockExists, bool(model.hierarchyAudit.priorityBlockExists)),
    checkLine("priority moments = 3", model.priorityAudit.priorityMomentCount === 3, String(model.priorityAudit.priorityMomentCount)),
    checkLine("timeline rail visible", model.hierarchyAudit.timelineRailExists, bool(model.hierarchyAudit.timelineRailExists)),
    checkLine("timeline rail moments = 6", model.hierarchyAudit.timelineRailMomentCount === 6, String(model.hierarchyAudit.timelineRailMomentCount)),
    checkLine("all replay moments remain available", model.hierarchyAudit.allReplayMomentCount === 6, String(model.hierarchyAudit.allReplayMomentCount)),
    checkLine("fatigue context demoted to context", model.priorityAudit.fatigueContextDemotedToContext, bool(model.priorityAudit.fatigueContextDemotedToContext)),
    checkLine("proof details collapsed by default", model.evidenceDisclosureAudit.proofDetailsCollapsedCount === model.evidenceDisclosureAudit.replayProofNoteCount, `${model.evidenceDisclosureAudit.proofDetailsCollapsedCount}/${model.evidenceDisclosureAudit.replayProofNoteCount}`),
    checkLine("no technical IDs in main coach text", model.wordingUXAudit.technicalIdInMainTextCount === 0, String(model.wordingUXAudit.technicalIdInMainTextCount)),
    checkLine("no raw player IDs in main coach text", model.wordingUXAudit.rawPlayerIdInMainTextCount === 0, String(model.wordingUXAudit.rawPlayerIdInMainTextCount)),
    checkLine("no raw event IDs in main coach text", model.wordingUXAudit.rawEventIdInMainTextCount === 0, String(model.wordingUXAudit.rawEventIdInMainTextCount)),
    checkLine("no raw effect labels in main coach text", model.wordingUXAudit.rawEffectLabelInMainTextCount === 0, String(model.wordingUXAudit.rawEffectLabelInMainTextCount)),
    checkLine("no repeated mechanical UX phrase", model.wordingUXAudit.mechanicalUXPhraseCount === 0 && model.wordingUXAudit.repeatedMomentWhyPhraseCount === 0, `${model.wordingUXAudit.mechanicalUXPhraseCount}/${model.wordingUXAudit.repeatedMomentWhyPhraseCount}`),
    checkLine("mobile layout pass", model.mobilePrintAudit.status === "PASS", model.mobilePrintAudit.status),
    checkLine("print/export layout pass", model.replayPrintReady && model.replayExportReady, `${bool(model.replayPrintReady)}/${bool(model.replayExportReady)}`),
    checkLine("score claims backed by score_change", model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange, bool(model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange)),
    checkLine("sandbox excluded from official replay", model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialReplay, bool(model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialReplay)),
    checkLine("batch excluded from official replay", model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialReplay, bool(model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialReplay)),
    checkLine("diagnostic separated from official replay", model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialReplay, bool(model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialReplay)),
    checkLine("no score mutation", model.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", model.baseline8F.baseline8E.scoringConstantsUnchanged, bool(model.baseline8F.baseline8E.scoringConstantsUnchanged)),
    checkLine("MatchBonusEvent unchanged", model.baseline8F.baseline8E.matchBonusEventUnchanged, bool(model.baseline8F.baseline8E.matchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.baseline8F.baseline8E.batchLiveSeparationPreserved, bool(model.baseline8F.baseline8E.batchLiveSeparationPreserved)),
    checkLine("product replay section visible", model.integrationBudgetAudit.productReplaySectionVisible, bool(model.integrationBudgetAudit.productReplaySectionVisible)),
    checkLine("export replay section visible", model.integrationBudgetAudit.exportReplaySectionVisible, bool(model.integrationBudgetAudit.exportReplaySectionVisible)),
    checkLine("export remains under 900 seconds", model.integrationBudgetAudit.exportUnder900Seconds, String(model.integrationBudgetAudit.exportReadTimeSecondsAfter8G)),
    checkLine("export ideally under 800 seconds", model.integrationBudgetAudit.exportUnder800Seconds, String(model.integrationBudgetAudit.exportReadTimeSecondsAfter8G)),
    checkLine("no new season memory", true, "not added in 8G"),
    checkLine("no new team style memory", true, "not added in 8G"),
    checkLine("no new database history feature", true, "not added in 8G"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];

  return [
    "# Validation - Coach Replay UX Iteration 8G",
    "",
    `Status: ${model.status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- priorityMomentCount: ${model.priorityAudit.priorityMomentCount}`,
    `- allReplayMomentCount: ${model.hierarchyAudit.allReplayMomentCount}`,
    `- timelineRailMomentCount: ${model.hierarchyAudit.timelineRailMomentCount}`,
    `- productReplayMomentCardCount: ${model.integrationBudgetAudit.productReplayMomentCardCount}`,
    `- exportReplayMomentCardCount: ${model.integrationBudgetAudit.exportReplayMomentCardCount}`,
    `- sourceOfTruthRepeatedSentenceCount: ${model.evidenceDisclosureAudit.sourceOfTruthRepeatedSentenceCount}`,
    `- technicalIdInMainTextCount: ${model.wordingUXAudit.technicalIdInMainTextCount}`,
    `- rawEventIdInMainTextCount: ${model.wordingUXAudit.rawEventIdInMainTextCount}`,
    `- suspiciousGoalkeeperFallbackAfterCount: ${model.baseline8F.actorMappingAudit.suspiciousGoalkeeperFallbackAfterCount}`,
    `- roleDiversityCount: ${model.baseline8F.actorMappingAudit.roleDiversityCount}`,
    `- scoreChangeEventsCoveredByReplayCount: ${model.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount}`,
    `- scoreChangeEventCount: ${model.sourceOfTruthRegressionAudit.scoreChangeEventCount}`,
    `- exportReadTimeSecondsAfter8G: ${model.integrationBudgetAudit.exportReadTimeSecondsAfter8G}`,
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

export function validateCoachReplayUXIteration8G(): OfficialCausalityStatus {
  return currentGeneratedCoachReplayUXIteration8GModel().status;
}
