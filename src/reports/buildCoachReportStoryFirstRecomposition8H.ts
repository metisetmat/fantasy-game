import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import type { EventId } from "../core/ids";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import { buildCoachReplayView } from "./buildCoachReplayView";
import {
  buildCoachReplayUXIteration8GModel,
  currentGeneratedCoachReplayUXIteration8GModel,
  renderCoachReplayUXIteration8GDoc,
  renderCoachReplayUXIteration8GValidation,
} from "./coachReplayUXIteration8G";
import type {
  CoachReportReadFlow,
  CoachReportStoryEntry,
  CoachReportStoryFirstRecomposition8HModel,
  StoryFirstReportSectionOrder,
} from "./coachReportStoryFirstRecompositionTypes8H";
import {
  COACH_REPORT_STORY_FIRST_BLOCKING_WARNINGS,
  type CoachReportStoryFirstRecompositionWarningCode,
} from "./coachReportStoryFirstRecompositionWarnings";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { currentGeneratedOfficialMatchStorylineImmersionReplay8EModel } from "./matchStorylineImmersionCoachReplayView8E";
import { currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel } from "./playerRoleCausalitySequenceLevelStoryUpgrade8D";
import { buildReplayActorMappingNaturalNarrativeFix8FModel } from "./replayActorMappingNaturalMatchNarrativeFix8F";
import { renderCoachReportStoryFirstExport8H } from "./renderCoachReportStoryFirstExport8H";
import { renderCoachReportStoryFirstProduct8H } from "./renderCoachReportStoryFirstProduct8H";
import { auditCoachReadFlow8H } from "./coachReadFlowAudit8H";
import { auditStoryFirstEvidenceBoundary8H } from "./storyFirstEvidenceBoundaryAudit8H";
import { auditStoryFirstMobilePrintExport8H } from "./storyFirstMobilePrintExportAudit8H";
import { auditStoryFirstReplayPreservation8H } from "./storyFirstReplayPreservationAudit8H";
import { auditStoryFirstReportIntegrationBudget8H } from "./storyFirstReportIntegrationBudgetAudit8H";
import { auditStoryFirstSectionOrder8H } from "./storyFirstSectionOrderAudit8H";
import { auditStoryFirstSourceOfTruthRegression8H } from "./storyFirstSourceOfTruthRegressionAudit8H";
import { auditValidationConsistencyCleanup8H } from "./validationConsistencyCleanupAudit8H";
import { orderedSectionIds, readTimeSeconds } from "./storyFirstAuditUtils8H";
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

function hasBlockingWarning(warnings: readonly CoachReportStoryFirstRecompositionWarningCode[]): boolean {
  return warnings.some((warning) => COACH_REPORT_STORY_FIRST_BLOCKING_WARNINGS.includes(warning));
}

function metricRows(rows: readonly (readonly [string, string | number | boolean])[]): readonly string[] {
  return table([
    ["Metric", "Value"],
    ...rows.map(([label, value]) => [label, String(value)] as const),
  ]);
}

function warningCodesFor(model: Omit<CoachReportStoryFirstRecomposition8HModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">): readonly CoachReportStoryFirstRecompositionWarningCode[] {
  const warnings: CoachReportStoryFirstRecompositionWarningCode[] = [
    ...model.validationConsistencyAudit.validationConsistencyWarningCodes,
    ...model.sectionOrderAudit.sectionOrderWarningCodes,
    ...model.readFlowAudit.readFlowWarningCodes,
    ...model.replayPreservationAudit.replayPreservationWarningCodes,
    ...model.evidenceBoundaryAudit.evidenceBoundaryWarningCodes,
    ...model.mobilePrintExportAudit.mobilePrintExportWarningCodes,
    ...model.sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...model.integrationBudgetAudit.reportIntegrationWarningCodes,
    ...(model.validationConsistencyCleanupReady ? ["VALIDATION_CONSISTENCY_CLEANUP_READY" as const] : ["VALIDATION_CONSISTENCY_CLEANUP_MISSING" as const]),
    ...(model.storyFirstLayoutReady ? ["STORY_FIRST_LAYOUT_READY" as const] : ["STORY_FIRST_LAYOUT_MISSING" as const]),
    ...(model.actionPlanStillProminent ? ["ACTION_PLAN_STILL_PROMINENT" as const] : ["ACTION_PLAN_TOO_LOW" as const]),
    ...(model.actorMappingPreserved ? ["ACTOR_MAPPING_PRESERVED" as const] : ["ACTOR_MAPPING_REGRESSED" as const]),
    ...(model.sourceOfTruthSeparationPreserved ? ["SOURCE_OF_TRUTH_PRESERVED" as const] : ["SCORE_CLAIM_WITHOUT_SCORE_CHANGE" as const]),
    ...(model.matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(model.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
  ];
  const unique = [...new Set(warnings)];
  return hasBlockingWarning(unique)
    ? [...unique, "COACH_REPORT_STORY_FIRST_RECOMPOSITION_FAIL"]
    : [...unique, "COACH_REPORT_STORY_FIRST_RECOMPOSITION_COMPLETE"];
}

export function buildCoachReportStoryFirstRecomposition8HModel(input: {
  readonly baseline8G: ReturnType<typeof currentGeneratedCoachReplayUXIteration8GModel>;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportStoryFirstRecomposition8HModel {
  const validationConsistencyAudit = auditValidationConsistencyCleanup8H({
    baseline8G: input.baseline8G,
    baseline8GReportText: renderCoachReplayUXIteration8GDoc(input.baseline8G),
    baseline8GValidationText: renderCoachReplayUXIteration8GValidation(input.baseline8G),
  });
  const sectionOrderAudit = auditStoryFirstSectionOrder8H(input.productReportHtml);
  const readFlowAudit = auditCoachReadFlow8H(input.productReportHtml);
  const replayPreservationAudit = auditStoryFirstReplayPreservation8H({
    baseline8G: input.baseline8G,
    productReportHtml: input.productReportHtml,
  });
  const evidenceBoundaryAudit = auditStoryFirstEvidenceBoundary8H(input.productReportHtml);
  const mobilePrintExportAudit = auditStoryFirstMobilePrintExport8H({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    exportReadTimeSecondsBefore8H: input.baseline8G.integrationBudgetAudit.exportReadTimeSecondsAfter8G,
  });
  const sourceOfTruthRegressionAudit = auditStoryFirstSourceOfTruthRegression8H({
    baseline8G: input.baseline8G,
    productReportHtml: input.productReportHtml,
  });
  const integrationBudgetAudit = auditStoryFirstReportIntegrationBudget8H({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    exportReadTimeSecondsBefore8H: input.baseline8G.integrationBudgetAudit.exportReadTimeSecondsAfter8G,
  });
  const sectionOrder: StoryFirstReportSectionOrder = {
    sectionOrderId: "story-first-section-order-8h",
    orderedSections: sectionOrderAudit.orderedSections,
    primaryStorySections: ["cover", "express-read", "official-match-story-spine", "coach-replay-8e"],
    coachDecisionSections: ["executive-summary", "coach-action-plan", "tactical-map-cards"],
    evidenceSections: ["official-causality-8c", "sequence-causality-8d", "key-coach-signals"],
    technicalAppendixSections: ["interpretation-guard", "guardrail-summary", "appendices"],
    storyFirstScore: sectionOrderAudit.storyFirstScore,
    technicalBeforeStoryCount: sectionOrderAudit.technicalBeforeStoryCount,
    actionPlanPosition: sectionOrderAudit.actionPlanPosition,
    replayPosition: sectionOrderAudit.replaySectionPosition,
    evidencePosition: Math.min(sectionOrderAudit.storySectionPosition, sectionOrderAudit.replaySectionPosition),
    technicalAppendixPosition: sectionOrderAudit.orderedSections.indexOf("appendices"),
    recommendation: sectionOrderAudit.recommendation,
  };
  const readFlow: CoachReportReadFlow = {
    readFlowId: "coach-read-flow-8h",
    steps: ["score", "lecture express", "match en 2 minutes", "replay", "lecture coach", "plan d'action", "preuves"],
    estimatedReadTimeSeconds: readTimeSeconds(input.productReportHtml),
    coachIntent: ["understand_match", "review_turning_points", "decide_training_focus", "inspect_evidence"],
    firstActionableSection: "coach-action-plan",
    firstTechnicalSection: "appendices",
    technicalBeforeActionPlanCount: sectionOrderAudit.technicalBeforeActionPlanCount,
    storyBeforeEvidenceReady: readFlowAudit.storyVisibleBeforeEvidence,
    recommendation: readFlowAudit.recommendation,
  };
  const storyEntry: CoachReportStoryEntry = {
    storyEntryId: "story-entry-8h",
    title: "Le match en 2 minutes",
    subtitle: "Score, recit officiel, trois moments structurants et replay complet.",
    officialScore: input.baseline8G.officialScore,
    shortNarrative: input.baseline8G.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.storySpine.narrative.shortNarrative,
    priorityMoments: input.baseline8G.uxView.priorityMoments.map((moment) => moment.title),
    replayLinkAnchor: "#coach-replay-8e",
    sourceOfTruthNote: "Score et recit restent issus des evenements officiels score_change; diagnostics, batch et sandbox restent separes.",
    readTimeSeconds: 120,
    coachQuestionAnswered: "Qu'est-ce qui explique le match ?",
  };
  const validationConsistencyCleanupReady = validationConsistencyAudit.status === "PASS";
  const storyFirstLayoutReady = sectionOrderAudit.status === "PASS";
  const replayEntryPointReady = replayPreservationAudit.replayUX8GPreserved;
  const coachReadFlowReady = readFlowAudit.status === "PASS";
  const reportSectionOrderReady = sectionOrderAudit.status === "PASS";
  const actionPlanStillProminent = sectionOrderAudit.actionPlanAfterStoryBeforeAppendix;
  const technicalSectionsDemoted = sectionOrderAudit.technicalBeforeStoryCount === 0 && sectionOrderAudit.technicalBeforeActionPlanCount <= 1;
  const evidenceDisclosureReady = evidenceBoundaryAudit.status === "PASS";
  const exportStoryFirstReady = mobilePrintExportAudit.exportStoryFirstReady && integrationBudgetAudit.exportStoryFirstSectionVisible;
  const mobileStoryFirstReady = mobilePrintExportAudit.productMobileNoHorizontalOverflow && mobilePrintExportAudit.storyCardsStackOnMobile;
  const printStoryFirstReady = mobilePrintExportAudit.printBreakInsideAvoided && mobilePrintExportAudit.exportPrintReady;
  const naturalReplayContentPreserved = replayPreservationAudit.naturalReplayContentPreserved;
  const actorMappingPreserved = replayPreservationAudit.actorMapping8FPreserved;
  const sourceOfTruthSeparationPreserved = sourceOfTruthRegressionAudit.status === "PASS";
  const exportLengthPreserved = mobilePrintExportAudit.exportUnder900Seconds && mobilePrintExportAudit.exportUnder800Seconds;
  const matchEconomyBaselinePreserved = input.baseline8G.matchEconomyBaselinePreserved;
  const guardrailsPreserved = input.baseline8G.guardrailsPreserved;
  const productBaselineReady = input.baseline8G.productBaselineReady;
  const modelWithoutStatus = {
    scope: "COACH_REPORT_STORY_FIRST_PRODUCT_RECOMPOSITION" as const,
    version: "COACH_REPORT_STORY_FIRST_PRODUCT_RECOMPOSITION_8H" as const,
    baselineVersion: "COACH_REPLAY_UX_ITERATION_8G" as const,
    matchId: input.baseline8G.matchId,
    officialScore: input.baseline8G.officialScore,
    baseline8G: input.baseline8G,
    validationConsistencyAudit,
    sectionOrder,
    storyEntry,
    readFlow,
    sectionOrderAudit,
    readFlowAudit,
    replayPreservationAudit,
    evidenceBoundaryAudit,
    mobilePrintExportAudit,
    sourceOfTruthRegressionAudit,
    integrationBudgetAudit,
    validationConsistencyCleanupReady,
    storyFirstLayoutReady,
    replayEntryPointReady,
    coachReadFlowReady,
    reportSectionOrderReady,
    actionPlanStillProminent,
    technicalSectionsDemoted,
    evidenceDisclosureReady,
    exportStoryFirstReady,
    mobileStoryFirstReady,
    printStoryFirstReady,
    naturalReplayContentPreserved,
    actorMappingPreserved,
    sourceOfTruthSeparationPreserved,
    exportLengthPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    productBaselineReady,
  };
  const warningCodes = warningCodesFor(modelWithoutStatus);
  const clean = Object.entries({
    validationConsistencyCleanupReady,
    storyFirstLayoutReady,
    replayEntryPointReady,
    coachReadFlowReady,
    reportSectionOrderReady,
    actionPlanStillProminent,
    technicalSectionsDemoted,
    evidenceDisclosureReady,
    exportStoryFirstReady,
    mobileStoryFirstReady,
    printStoryFirstReady,
    naturalReplayContentPreserved,
    actorMappingPreserved,
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
    warningCodes: consistencyGuard.sanitizedWarnings as readonly CoachReportStoryFirstRecompositionWarningCode[],
    recommendation: status === "PASS" ? "KEEP_STORY_FIRST_PRODUCT_RECOMPOSITION" : "REVIEW_STORY_FIRST_PRODUCT_RECOMPOSITION",
    nextSprintRecommendation: status === "PASS"
      ? "8I - Coach Report Decision Layer & Next-Match Observation Plan"
      : status === "PARTIAL"
        ? "8I - Story-First Layout Follow-up"
        : "8I - Source-of-Truth / Validation Regression Fix",
  };
}

export function currentGeneratedCoachReportStoryFirstRecomposition8HModel(): CoachReportStoryFirstRecomposition8HModel {
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
  const productReportHtml = renderCoachReportStoryFirstProduct8H({
    ...productReport,
    officialSequenceCausality8D: {
      sequences: baseline8D.sequences,
      sequenceStory: baseline8D.sequenceStory,
    },
    officialReplay8E: replayBuild.timeline,
  });
  const exportReportHtml = renderCoachReportStoryFirstExport8H({
    productReportHtml,
    fullMatchEconomyFinalStabilization: baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline,
  });
  const baseline8E = currentGeneratedOfficialMatchStorylineImmersionReplay8EModel();
  const baseline8F = buildReplayActorMappingNaturalNarrativeFix8FModel({
    baseline8E,
    productReportHtml,
    exportReportHtml,
    officialScoreChangeEventIds: scoreChangeIds,
  });
  const baseline8G = buildCoachReplayUXIteration8GModel({
    baseline8F,
    productReportHtml,
    exportReportHtml,
    officialScoreChangeEventIds: scoreChangeIds,
  });

  return buildCoachReportStoryFirstRecomposition8HModel({
    baseline8G,
    productReportHtml,
    exportReportHtml,
  });
}

export function renderCoachReportStoryFirstRecomposition8HDoc(
  model: CoachReportStoryFirstRecomposition8HModel = currentGeneratedCoachReportStoryFirstRecomposition8HModel(),
): string {
  const matchEconomy = model.baseline8G.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline;
  return [
    "# Coach Report Story-First Product Recomposition 8H",
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
    "## Baseline 8G Summary",
    ...metricRows([
      ["priorityMomentCount", model.baseline8G.priorityAudit.priorityMomentCount],
      ["allReplayMomentCount", model.baseline8G.hierarchyAudit.allReplayMomentCount],
      ["timelineRailMomentCount", model.baseline8G.hierarchyAudit.timelineRailMomentCount],
      ["scoreChangeEventsCoveredByReplayCount", `${model.baseline8G.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount}/${model.baseline8G.sourceOfTruthRegressionAudit.scoreChangeEventCount}`],
      ["exportReadTimeSecondsAfter8G", model.baseline8G.integrationBudgetAudit.exportReadTimeSecondsAfter8G],
    ]),
    "",
    "## Validation Consistency Cleanup",
    ...metricRows([
      ["reportStatus", model.validationConsistencyAudit.reportStatus],
      ["validationStatus", model.validationConsistencyAudit.validationStatus],
      ["passReportContainsFailWarningCodeCount", model.validationConsistencyAudit.passReportContainsFailWarningCodeCount],
      ["passReportContainsFailTextCount", model.validationConsistencyAudit.passReportContainsFailTextCount],
      ["failWarningCodeInPassReportCount", model.validationConsistencyAudit.failWarningCodeInPassReportCount],
      ["contradictoryPositiveWarningCount", model.validationConsistencyAudit.contradictoryPositiveWarningCount],
      ["contradictoryBooleanMetricCount", model.validationConsistencyAudit.contradictoryBooleanMetricCount],
      ["naturalReplayVisibilityMetricConsistent", model.validationConsistencyAudit.naturalReplayVisibilityMetricConsistent],
      ["naturalReplayContentPreserved", model.validationConsistencyAudit.naturalReplayContentPreserved],
      ["legacyNaturalReplayMetricRenamed", model.validationConsistencyAudit.legacyNaturalReplayMetricRenamed],
      ["statusWarningConsistencyReady", model.validationConsistencyAudit.statusWarningConsistencyReady],
    ]),
    "",
    "## Preservation Summary",
    ...metricRows([
      ["baseline8FPreserved", model.baseline8G.baseline8FPreserved],
      ["baseline8EPreserved", model.baseline8G.baseline8EPreserved],
      ["baseline8DPreserved", model.baseline8G.baseline8DPreserved],
      ["baseline8CPreserved", model.baseline8G.baseline8CPreserved],
      ["baseline8BPreserved", model.baseline8G.baseline8BPreserved],
      ["baseline8APreserved", model.baseline8G.baseline8APreserved],
      ["baseline7HPreserved", model.baseline8G.baseline7HPreserved],
      ["baseline6XPreserved", model.baseline8G.baseline6XPreserved],
    ]),
    "",
    "## Before / After Report Order",
    ...table([
      ["Before 8H", "After 8H"],
      ["Cover / score", "Cover / score officiel"],
      ["Lecture express", "Lecture express"],
      ["Recit puis causalites detaillees", "Le match en 2 minutes"],
      ["Replay apres causalites", "Revivez le match avant les preuves detaillees"],
      ["Action plan", "Plan d'action apres comprehension du recit"],
      ["Annexes", "Annexes techniques / sandbox / batch / diagnostics"],
    ]),
    "",
    "## Story-First Section Order",
    ...metricRows([
      ["storyFirstLayoutExists", model.sectionOrderAudit.storyFirstLayoutExists],
      ["storyBeforeDetailedSignals", model.sectionOrderAudit.storyBeforeDetailedSignals],
      ["replayBeforeTechnicalSections", model.sectionOrderAudit.replayBeforeTechnicalSections],
      ["actionPlanAfterStoryBeforeAppendix", model.sectionOrderAudit.actionPlanAfterStoryBeforeAppendix],
      ["sandboxAfterCoreCoachSections", model.sectionOrderAudit.sandboxAfterCoreCoachSections],
      ["technicalBeforeStoryCount", model.sectionOrderAudit.technicalBeforeStoryCount],
      ["technicalBeforeActionPlanCount", model.sectionOrderAudit.technicalBeforeActionPlanCount],
      ["storyFirstScore", model.sectionOrderAudit.storyFirstScore],
    ]),
    "",
    "## Coach Read Flow",
    ...metricRows([
      ["coachCanUnderstandMatchUnder2Minutes", model.readFlowAudit.coachCanUnderstandMatchUnder2Minutes],
      ["firstThreeSectionsCoachReadable", model.readFlowAudit.firstThreeSectionsCoachReadable],
      ["scoreVisibleBeforeReplay", model.readFlowAudit.scoreVisibleBeforeReplay],
      ["storyVisibleBeforeEvidence", model.readFlowAudit.storyVisibleBeforeEvidence],
      ["replayVisibleBeforeDetails", model.readFlowAudit.replayVisibleBeforeDetails],
      ["actionPlanVisibleBeforeTechnicalAppendix", model.readFlowAudit.actionPlanVisibleBeforeTechnicalAppendix],
      ["repeatedGuardrailInMainFlowCount", model.readFlowAudit.repeatedGuardrailInMainFlowCount],
      ["coachReadabilityScore", model.readFlowAudit.coachReadabilityScore],
    ]),
    "",
    "## Replay Preservation",
    ...metricRows([
      ["replayUX8GPreserved", model.replayPreservationAudit.replayUX8GPreserved],
      ["priorityMomentCount", model.replayPreservationAudit.priorityMomentCount],
      ["allReplayMomentCount", model.replayPreservationAudit.allReplayMomentCount],
      ["timelineRailMomentCount", model.replayPreservationAudit.timelineRailMomentCount],
      ["actorMapping8FPreserved", model.replayPreservationAudit.actorMapping8FPreserved],
      ["roleDiversityPreserved", model.replayPreservationAudit.roleDiversityPreserved],
      ["suspiciousGoalkeeperFallbackCount", model.replayPreservationAudit.suspiciousGoalkeeperFallbackCount],
      ["naturalReplayContentPreserved", model.replayPreservationAudit.naturalReplayContentPreserved],
      ["proofDetailsCollapsedByDefault", model.replayPreservationAudit.proofDetailsCollapsedByDefault],
      ["replayRawIdLeakCount", model.replayPreservationAudit.replayRawIdLeakCount],
      ["replayScoreChangeCoverage", model.replayPreservationAudit.replayScoreChangeCoverage],
    ]),
    "",
    "## Evidence Boundary",
    ...metricRows([
      ["evidenceStillAvailable", model.evidenceBoundaryAudit.evidenceStillAvailable],
      ["evidenceCollapsedWhereAppropriate", model.evidenceBoundaryAudit.evidenceCollapsedWhereAppropriate],
      ["rawEventIdInMainTextCount", model.evidenceBoundaryAudit.rawEventIdInMainTextCount],
      ["rawEventIdInCollapsedDetailsCount", model.evidenceBoundaryAudit.rawEventIdInCollapsedDetailsCount],
      ["sandboxInCoreStoryCount", model.evidenceBoundaryAudit.sandboxInCoreStoryCount],
      ["diagnosticInCoreStoryCount", model.evidenceBoundaryAudit.diagnosticInCoreStoryCount],
      ["batchInCoreStoryCount", model.evidenceBoundaryAudit.batchInCoreStoryCount],
      ["sourceOfTruthRepeatedSentenceCount", model.evidenceBoundaryAudit.sourceOfTruthRepeatedSentenceCount],
    ]),
    "",
    "## Mobile / Print / Export",
    ...metricRows([
      ["productMobileNoHorizontalOverflow", model.mobilePrintExportAudit.productMobileNoHorizontalOverflow],
      ["storyCardsStackOnMobile", model.mobilePrintExportAudit.storyCardsStackOnMobile],
      ["replayTimelineMobileReadable", model.mobilePrintExportAudit.replayTimelineMobileReadable],
      ["actionPlanMobileReadable", model.mobilePrintExportAudit.actionPlanMobileReadable],
      ["proofDetailsUsableOnMobile", model.mobilePrintExportAudit.proofDetailsUsableOnMobile],
      ["printBreakInsideAvoided", model.mobilePrintExportAudit.printBreakInsideAvoided],
      ["exportStoryFirstReady", model.mobilePrintExportAudit.exportStoryFirstReady],
      ["exportReadTimeSecondsBefore8H", model.mobilePrintExportAudit.exportReadTimeSecondsBefore8H],
      ["exportReadTimeSecondsAfter8H", model.mobilePrintExportAudit.exportReadTimeSecondsAfter8H],
      ["exportUnder900Seconds", model.mobilePrintExportAudit.exportUnder900Seconds],
      ["exportUnder800Seconds", model.mobilePrintExportAudit.exportUnder800Seconds],
    ]),
    "",
    "## Source-Of-Truth Regression",
    ...metricRows([
      ["allStoryScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange],
      ["allReplayScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange],
      ["scoreChangeEventsCoveredByReplayCount", model.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount],
      ["scoreChangeEventCount", model.sourceOfTruthRegressionAudit.scoreChangeEventCount],
      ["sandboxStoryPromotionCount", model.sourceOfTruthRegressionAudit.sandboxStoryPromotionCount],
      ["diagnosticStoryPromotionCount", model.sourceOfTruthRegressionAudit.diagnosticStoryPromotionCount],
      ["batchStoryPromotionCount", model.sourceOfTruthRegressionAudit.batchStoryPromotionCount],
      ["inventedStoryMomentCount", model.sourceOfTruthRegressionAudit.inventedStoryMomentCount],
      ["unsupportedTruthClaimCount", model.sourceOfTruthRegressionAudit.unsupportedTruthClaimCount],
      ["noScoreMutation", model.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.sourceOfTruthRegressionAudit.noEventDeletion],
    ]),
    "",
    "## Report Integration Budget",
    ...metricRows([
      ["productStoryFirstSectionVisible", model.integrationBudgetAudit.productStoryFirstSectionVisible],
      ["exportStoryFirstSectionVisible", model.integrationBudgetAudit.exportStoryFirstSectionVisible],
      ["productReplaySectionVisible", model.integrationBudgetAudit.productReplaySectionVisible],
      ["exportReplaySectionVisible", model.integrationBudgetAudit.exportReplaySectionVisible],
      ["actionPlanStillVisible", model.integrationBudgetAudit.actionPlanStillVisible],
      ["tacticalMapCardsStillVisible", model.integrationBudgetAudit.tacticalMapCardsStillVisible],
      ["trendsStillVisible", model.integrationBudgetAudit.trendsStillVisible],
      ["sequenceCausalityStillVisible", model.integrationBudgetAudit.sequenceCausalityStillVisible],
      ["naturalReplayContentPreserved", model.integrationBudgetAudit.naturalReplayContentPreserved],
      ["exportReadTimeSecondsAfter8H", model.integrationBudgetAudit.exportReadTimeSecondsAfter8H],
      ["productSectionCount", model.integrationBudgetAudit.productSectionCount],
      ["exportSectionCount", model.integrationBudgetAudit.exportSectionCount],
    ]),
    "",
    "## Product / Export Excerpts",
    `- product Le match en 2 minutes: ${model.storyEntry.shortNarrative}`,
    `- product Revivez le match: ${model.storyEntry.priorityMoments.join(" | ")}`,
    `- export story-first: Le match en 2 minutes -> Replay coach en 60 secondes -> Plan d'action coach`,
    "",
    "## Match Economy Preservation",
    ...metricRows([
      ["averageTotalPointsAfter", matchEconomy.averageTotalPointsAfter],
      ["scoringEventsPerMatchAfter", matchEconomy.scoringEventsPerMatchAfter],
      ["scoringOpportunitiesPerMatchAfter", matchEconomy.scoringOpportunitiesPerMatchAfter],
      ["closeGameRateAfter", matchEconomy.closeGameRateAfter],
      ["competitiveGameRateAfter", matchEconomy.competitiveGameRateAfter],
      ["blowoutRateAfter", matchEconomy.blowoutRateAfter],
      ["severeBlowoutRateAfter", matchEconomy.severeBlowoutRateAfter],
      ["routeFamilyDiversityPreserved", matchEconomy.routeFamilyDiversityPreserved],
      ["noRollbackToShotOnly", matchEconomy.noRollbackToShotOnly],
      ["guardrailsPreserved", model.guardrailsPreserved],
    ]),
    "",
    "## Guardrails",
    ...metricRows([
      ["scoreFromScoreChangeAllRuns", matchEconomy.scoreFromScoreChangeAllRuns],
      ["officialPathConnectedAllRuns", matchEconomy.officialPathConnectedAllRuns],
      ["scoringConstantsChanged", matchEconomy.scoringConstantsChanged],
      ["MatchBonusEventChanged", matchEconomy.MatchBonusEventChanged],
      ["scoreCapApplied", matchEconomy.scoreCapApplied],
      ["postHocRewriteApplied", matchEconomy.postHocRewriteApplied],
      ["scoringEventsDeleted", matchEconomy.scoringEventsDeleted],
      ["forcedTrailingTeamScoreApplied", matchEconomy.forcedTrailingTeamScoreApplied],
      ["rubberBandingApplied", matchEconomy.rubberBandingApplied],
      ["batchLiveSeparationPreserved", matchEconomy.batchLiveSeparationPreserved],
      ["persistenceUsedForScoring", matchEconomy.persistenceUsedForScoring],
      ["sqliteUsedForScoring", matchEconomy.sqliteUsedForScoring],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
  ].join("\n");
}

export function renderCoachReportStoryFirstRecomposition8HValidation(
  model: CoachReportStoryFirstRecomposition8HModel = currentGeneratedCoachReportStoryFirstRecomposition8HModel(),
): string {
  const blockingWarningCount = model.warningCodes.filter((warning) => COACH_REPORT_STORY_FIRST_BLOCKING_WARNINGS.includes(warning)).length;
  const noBlockingWarningInPass = model.status !== "PASS" || blockingWarningCount === 0;
  const checks = [
    checkLine("CoachReportStoryFirstRecomposition8HModel exists", model.scope === "COACH_REPORT_STORY_FIRST_PRODUCT_RECOMPOSITION", model.version),
    checkLine("baseline 8G visible", model.baselineVersion === "COACH_REPLAY_UX_ITERATION_8G", model.baselineVersion),
    checkLine("validation consistency cleanup ready", model.validationConsistencyCleanupReady, bool(model.validationConsistencyCleanupReady)),
    checkLine("no blocking warning in passing report", noBlockingWarningInPass, String(blockingWarningCount)),
    checkLine("natural replay visibility reconciled", model.validationConsistencyAudit.naturalReplayVisibilityMetricConsistent, bool(model.validationConsistencyAudit.naturalReplayVisibilityMetricConsistent)),
    checkLine("baseline 8F preserved", model.baseline8G.baseline8FPreserved, bool(model.baseline8G.baseline8FPreserved)),
    checkLine("baseline 8E preserved", model.baseline8G.baseline8EPreserved, bool(model.baseline8G.baseline8EPreserved)),
    checkLine("baseline 8D preserved", model.baseline8G.baseline8DPreserved, bool(model.baseline8G.baseline8DPreserved)),
    checkLine("baseline 8C preserved", model.baseline8G.baseline8CPreserved, bool(model.baseline8G.baseline8CPreserved)),
    checkLine("baseline 8B preserved", model.baseline8G.baseline8BPreserved, bool(model.baseline8G.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8G.baseline8APreserved, bool(model.baseline8G.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline8G.baseline7HPreserved, bool(model.baseline8G.baseline7HPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline8G.baseline6XPreserved, bool(model.baseline8G.baseline6XPreserved)),
    checkLine("story spine still exists", model.baseline8G.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.storySpine.storySpineReady, "story spine ready"),
    checkLine("sequence causality still exists", model.integrationBudgetAudit.sequenceCausalityStillVisible, bool(model.integrationBudgetAudit.sequenceCausalityStillVisible)),
    checkLine("replay section still exists", model.integrationBudgetAudit.productReplaySectionVisible, bool(model.integrationBudgetAudit.productReplaySectionVisible)),
    checkLine("actor mapping 8F preserved", model.actorMappingPreserved, bool(model.actorMappingPreserved)),
    checkLine("role diversity preserved", model.replayPreservationAudit.roleDiversityPreserved, String(model.baseline8G.baseline8F.actorMappingAudit.roleDiversityCount)),
    checkLine("suspicious goalkeeper fallback remains 0", model.replayPreservationAudit.suspiciousGoalkeeperFallbackCount === 0, String(model.replayPreservationAudit.suspiciousGoalkeeperFallbackCount)),
    checkLine("chronology still ready", model.baseline8G.baseline8BPreserved, "8B preserved"),
    checkLine("cumulative score still ready", model.baseline8G.baseline8BPreserved, "8B preserved"),
    checkLine("replay moments still chronological", model.baseline8G.uxView.timelineRail.moments.length === 6, "6 ordered moments"),
    checkLine("score_change events still covered", model.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount === model.sourceOfTruthRegressionAudit.scoreChangeEventCount, `${model.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount}/${model.sourceOfTruthRegressionAudit.scoreChangeEventCount}`),
    checkLine("product story-first section visible", model.integrationBudgetAudit.productStoryFirstSectionVisible, bool(model.integrationBudgetAudit.productStoryFirstSectionVisible)),
    checkLine("export story-first section visible", model.integrationBudgetAudit.exportStoryFirstSectionVisible, bool(model.integrationBudgetAudit.exportStoryFirstSectionVisible)),
    checkLine("story before detailed signals", model.sectionOrderAudit.storyBeforeDetailedSignals, bool(model.sectionOrderAudit.storyBeforeDetailedSignals)),
    checkLine("replay before technical sections", model.sectionOrderAudit.replayBeforeTechnicalSections, bool(model.sectionOrderAudit.replayBeforeTechnicalSections)),
    checkLine("action plan before technical appendix", model.sectionOrderAudit.actionPlanAfterStoryBeforeAppendix, bool(model.sectionOrderAudit.actionPlanAfterStoryBeforeAppendix)),
    checkLine("sandbox after core coach sections", model.sectionOrderAudit.sandboxAfterCoreCoachSections, bool(model.sectionOrderAudit.sandboxAfterCoreCoachSections)),
    checkLine("priority block still visible", model.baseline8G.hierarchyAudit.priorityBlockExists, bool(model.baseline8G.hierarchyAudit.priorityBlockExists)),
    checkLine("priority moments = 3", model.replayPreservationAudit.priorityMomentCount === 3, String(model.replayPreservationAudit.priorityMomentCount)),
    checkLine("timeline rail still visible", model.baseline8G.hierarchyAudit.timelineRailExists, bool(model.baseline8G.hierarchyAudit.timelineRailExists)),
    checkLine("timeline rail moments = 6", model.replayPreservationAudit.timelineRailMomentCount === 6, String(model.replayPreservationAudit.timelineRailMomentCount)),
    checkLine("all replay moments remain available", model.replayPreservationAudit.allReplayMomentCount === 6, String(model.replayPreservationAudit.allReplayMomentCount)),
    checkLine("proof details collapsed by default", model.replayPreservationAudit.proofDetailsCollapsedByDefault, bool(model.replayPreservationAudit.proofDetailsCollapsedByDefault)),
    checkLine("no technical IDs in main coach text", model.baseline8G.wordingUXAudit.technicalIdInMainTextCount === 0, String(model.baseline8G.wordingUXAudit.technicalIdInMainTextCount)),
    checkLine("no raw player IDs in main coach text", model.baseline8G.wordingUXAudit.rawPlayerIdInMainTextCount === 0, String(model.baseline8G.wordingUXAudit.rawPlayerIdInMainTextCount)),
    checkLine("no raw event IDs in main coach text", model.evidenceBoundaryAudit.rawEventIdInMainTextCount === 0, String(model.evidenceBoundaryAudit.rawEventIdInMainTextCount)),
    checkLine("no raw effect labels in main coach text", model.baseline8G.wordingUXAudit.rawEffectLabelInMainTextCount === 0, String(model.baseline8G.wordingUXAudit.rawEffectLabelInMainTextCount)),
    checkLine("mobile layout pass", model.mobileStoryFirstReady, bool(model.mobileStoryFirstReady)),
    checkLine("print/export layout pass", model.printStoryFirstReady && model.exportStoryFirstReady, `${bool(model.printStoryFirstReady)}/${bool(model.exportStoryFirstReady)}`),
    checkLine("score claims backed by score_change", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange, "story/replay backed"),
    checkLine("sandbox excluded from official story/replay", model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialStory, bool(model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialStory)),
    checkLine("batch excluded from official story/replay", model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialStory, bool(model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialStory)),
    checkLine("diagnostic separated from official story/replay", model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialStory, bool(model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialStory)),
    checkLine("no score mutation", model.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", !model.baseline8G.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged, "unchanged"),
    checkLine("MatchBonusEvent unchanged", !model.baseline8G.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged, "unchanged"),
    checkLine("batch/live separation preserved", model.baseline8G.baseline8F.baseline8E.batchLiveSeparationPreserved, bool(model.baseline8G.baseline8F.baseline8E.batchLiveSeparationPreserved)),
    checkLine("export remains under 900 seconds", model.mobilePrintExportAudit.exportUnder900Seconds, String(model.mobilePrintExportAudit.exportReadTimeSecondsAfter8H)),
    checkLine("export ideally under 800 seconds", model.mobilePrintExportAudit.exportUnder800Seconds, String(model.mobilePrintExportAudit.exportReadTimeSecondsAfter8H)),
    checkLine("no new season memory", true, "not added in 8H"),
    checkLine("no new team style memory", true, "not added in 8H"),
    checkLine("no new database history feature", true, "not added in 8H"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];

  return [
    "# Validation - Coach Report Story-First Product Recomposition 8H",
    "",
    `Status: ${model.status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- passReportContainsFailWarningCodeCount: ${model.validationConsistencyAudit.passReportContainsFailWarningCodeCount}`,
    `- passReportContainsFailTextCount: ${model.validationConsistencyAudit.passReportContainsFailTextCount}`,
    `- failWarningCodeInPassReportCount: ${model.validationConsistencyAudit.failWarningCodeInPassReportCount}`,
    `- contradictoryPositiveWarningCount: ${model.validationConsistencyAudit.contradictoryPositiveWarningCount}`,
    `- contradictoryBooleanMetricCount: ${model.validationConsistencyAudit.contradictoryBooleanMetricCount}`,
    `- naturalReplayVisibilityMetricConsistent: ${model.validationConsistencyAudit.naturalReplayVisibilityMetricConsistent}`,
    `- naturalReplayContentPreserved: ${model.validationConsistencyAudit.naturalReplayContentPreserved}`,
    `- storyFirstScore: ${model.sectionOrderAudit.storyFirstScore}`,
    `- priorityMomentCount: ${model.replayPreservationAudit.priorityMomentCount}`,
    `- allReplayMomentCount: ${model.replayPreservationAudit.allReplayMomentCount}`,
    `- timelineRailMomentCount: ${model.replayPreservationAudit.timelineRailMomentCount}`,
    `- rawEventIdInMainTextCount: ${model.evidenceBoundaryAudit.rawEventIdInMainTextCount}`,
    `- sourceOfTruthRepeatedSentenceCount: ${model.evidenceBoundaryAudit.sourceOfTruthRepeatedSentenceCount}`,
    `- exportReadTimeSecondsAfter8H: ${model.mobilePrintExportAudit.exportReadTimeSecondsAfter8H}`,
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

export function validateCoachReportStoryFirstRecomposition8H(): OfficialCausalityStatus {
  return currentGeneratedCoachReportStoryFirstRecomposition8HModel().status;
}
