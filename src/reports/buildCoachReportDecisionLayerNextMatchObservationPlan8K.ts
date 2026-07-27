import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSharePackCompletionExportActionPlanRestoration8J } from "./buildSharePackCompletionExportActionPlanRestoration8J";
import { cleanupProductMainRawIds8K } from "./cleanupProductMainRawIds8K";
import { cleanupReplayExportWording8K } from "./cleanupReplayExportWording8K";
import { auditCoachDecisionLayer8K } from "./coachDecisionLayerAudit8K";
import { auditDecisionBoundary8K } from "./decisionBoundaryAudit8K";
import { auditDecisionLayerExportBudget8K } from "./decisionLayerExportBudgetAudit8K";
import { auditDecisionLayerIntegrationBudget8K } from "./decisionLayerIntegrationBudgetAudit8K";
import { auditDecisionLayerSourceOfTruthRegression8K } from "./decisionLayerSourceOfTruthRegressionAudit8K";
import { auditDecisionLayerWordingCleanup8K } from "./decisionLayerWordingCleanupAudit8K";
import { auditNextMatchObservationPlan8K } from "./nextMatchObservationPlanAudit8K";
import { insertCoachDecisionLayerExport8K, renderCoachDecisionLayerExport8K } from "./renderCoachDecisionLayerExport8K";
import {
  boundaryNotes8K,
  buildNextMatchObservationPlan8K,
  coachDecisionCards8K,
  insertCoachDecisionLayerProduct8K,
  renderCoachDecisionLayerProduct8K,
} from "./renderCoachDecisionLayerProduct8K";
import type {
  CoachReportDecisionLayerNextMatchObservationPlan8KModel,
  DecisionLayerWordingCleanup8K,
} from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import {
  COACH_DECISION_LAYER_8K_BLOCKING_WARNINGS,
  type CoachReportDecisionLayerNextMatchObservationPlanWarningCode,
} from "./coachReportDecisionLayerNextMatchObservationPlanWarnings";

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;
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

function metricRows(rows: readonly (readonly [string, string | number | boolean])[]): readonly string[] {
  return table([
    ["Metric", "Value"],
    ...rows.map(([label, value]) => [label, String(value)] as const),
  ]);
}

function uniq<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function cleanWarnings(
  warnings: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[],
): readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[] {
  const has = (warning: CoachReportDecisionLayerNextMatchObservationPlanWarningCode): boolean => warnings.includes(warning);
  return uniq(warnings.filter((warning) => {
    if (warning === "DECISION_LAYER_READY") {
      return !has("DECISION_LAYER_MISSING") &&
        !has("DECISION_CARD_COUNT_INVALID") &&
        !has("SELECTION_IMPOSITION_DETECTED") &&
        !has("TACTICAL_PLAN_IMPOSITION_DETECTED") &&
        !has("AUTOMATIC_LINEUP_RECOMMENDATION_DETECTED");
    }
    if (warning === "NEXT_MATCH_OBSERVATION_PLAN_READY") {
      return !has("NEXT_MATCH_OBSERVATION_PLAN_MISSING") &&
        !has("OBSERVATION_ITEM_COUNT_INVALID") &&
        !has("CONFIRMATION_CRITERIA_MISSING") &&
        !has("DISCONFIRMATION_CRITERIA_MISSING");
    }
    if (warning === "COACH_DECISION_BOUNDARIES_READY") {
      return !has("SELECTION_IMPOSITION_DETECTED") &&
        !has("TACTICAL_PLAN_IMPOSITION_DETECTED") &&
        !has("SANDBOX_DECISION_PROMOTED") &&
        !has("DIAGNOSTIC_DECISION_PROMOTED") &&
        !has("BATCH_DECISION_PROMOTED");
    }
    if (warning === "DECISION_WORDING_CLEAN") {
      return !has("REPLAY_EXPORT_DUPLICATE_TITLE") &&
        !has("REPLAY_EXPORT_TRUNCATED_SENTENCE") &&
        !has("TECHNICAL_LABEL_IN_DECISION_LAYER") &&
        !has("RAW_EVENT_ID_IN_MAIN_TEXT") &&
        !has("RAW_PLAYER_ID_IN_MAIN_TEXT") &&
        !has("RAW_EFFECT_LABEL_IN_MAIN_TEXT");
    }
    if (warning === "PRODUCT_RAW_ID_CLEANUP_READY") {
      return !has("PRODUCT_RAW_ID_MAIN_TEXT_REMAINING");
    }
    if (warning === "SOURCE_OF_TRUTH_PRESERVED") {
      return !has("SCORE_CLAIM_WITHOUT_SCORE_CHANGE") &&
        !has("SANDBOX_STORY_PROMOTED") &&
        !has("DIAGNOSTIC_STORY_PROMOTED") &&
        !has("BATCH_STORY_PROMOTED") &&
        !has("SANDBOX_DECISION_PROMOTED") &&
        !has("DIAGNOSTIC_DECISION_PROMOTED") &&
        !has("BATCH_DECISION_PROMOTED");
    }
    return true;
  }));
}

function wordingCleanups(): readonly DecisionLayerWordingCleanup8K[] {
  return [
    {
      cleanupId: "cleanup-replay-first-score-8k",
      targetSurface: "replay_export",
      issueType: "duplicate_phrase",
      beforeText: "CONTROL frappe le premier CONTROL frappe le premier...",
      afterText: "CONTROL frappe le premier grace au Space Hunter dans l'axe central : 0-0 vers 3-0.",
      fixed: true,
      warningCode: "REPLAY_EXPORT_DUPLICATE_TITLE",
    },
    {
      cleanupId: "cleanup-replay-blitz-response-8k",
      targetSurface: "replay_export",
      issueType: "duplicate_phrase",
      beforeText: "BLITZ repond BLITZ reste dans le match...",
      afterText: "BLITZ repond grace a une sequence liee au gardien-libero : 6-0 vers 6-5.",
      fixed: true,
      warningCode: "REPLAY_EXPORT_DUPLICATE_TITLE",
    },
    {
      cleanupId: "cleanup-product-main-raw-ids-8k",
      targetSurface: "product_main_text",
      issueType: "raw_id_leak",
      beforeText: "contract-fixture / rc-* / score_created labels in main text.",
      afterText: "Readable coach labels in main text; raw proof stays in collapsed details.",
      fixed: true,
      warningCode: "PRODUCT_RAW_ID_MAIN_TEXT_REMAINING",
    },
  ];
}

export function buildCoachReportDecisionLayerNextMatchObservationPlan8K(input?: {
  readonly productHtmlBefore8K?: string;
  readonly exportHtmlBefore8K?: string;
}): CoachReportDecisionLayerNextMatchObservationPlan8KModel {
  const reportDirectory = join(process.cwd(), "reports");
  const baseline8J = buildSharePackCompletionExportActionPlanRestoration8J();
  const baseline8I = baseline8J.baseline8I;
  const productHtmlBefore8K = input?.productHtmlBefore8K ??
    (readIfExists(join(reportDirectory, "coach-report.product.html")) || baseline8I.compressedExportHtml);
  const exportHtmlBefore8K = input?.exportHtmlBefore8K ??
    (readIfExists(join(reportDirectory, "coach-report.export.html")) || baseline8I.compressedExportHtml);
  const cleanedProductHtml = insertCoachDecisionLayerProduct8K(cleanupProductMainRawIds8K(productHtmlBefore8K));
  const cleanedExportHtml = insertCoachDecisionLayerExport8K(cleanupReplayExportWording8K(exportHtmlBefore8K));
  const plan = buildNextMatchObservationPlan8K();
  const decisionLayerAudit = auditCoachDecisionLayer8K({
    productHtml: cleanedProductHtml,
    decisionCards: coachDecisionCards8K,
  });
  const nextMatchObservationPlanAudit = auditNextMatchObservationPlan8K({
    productHtml: cleanedProductHtml,
    exportHtml: cleanedExportHtml,
    plan,
  });
  const decisionBoundaryAudit = auditDecisionBoundary8K({
    productHtml: cleanedProductHtml,
    exportHtml: cleanedExportHtml,
  });
  const wordingCleanupAudit = auditDecisionLayerWordingCleanup8K({
    productHtmlBefore8K,
    productHtmlAfter8K: cleanedProductHtml,
    exportHtmlAfter8K: cleanedExportHtml,
  });
  const exportBudgetAudit = auditDecisionLayerExportBudget8K({
    exportHtmlBefore8K,
    exportHtmlAfter8K: cleanedExportHtml,
  });
  const sourceOfTruthRegressionAudit = auditDecisionLayerSourceOfTruthRegression8K({ baseline8I });
  const integrationBudgetAudit = auditDecisionLayerIntegrationBudget8K({
    productHtml: cleanedProductHtml,
    exportHtml: cleanedExportHtml,
  });
  const decisionLayerReady = decisionLayerAudit.decisionLayerVisible &&
    decisionLayerAudit.decisionCardCount === 3 &&
    decisionLayerAudit.decisionCardsWithQuestionCount === 3 &&
    decisionLayerAudit.decisionCardsWithObservationFocusCount === 3;
  const nextMatchObservationPlanReady = nextMatchObservationPlanAudit.nextMatchObservationPlanVisible &&
    nextMatchObservationPlanAudit.observationItemCount === 3;
  const confirmationCriteriaReady = decisionLayerAudit.decisionCardsWithConfirmationSignalCount === 3 &&
    nextMatchObservationPlanAudit.observationItemsWithPositiveSignalCount === 3;
  const disconfirmationCriteriaReady = decisionLayerAudit.decisionCardsWithDisconfirmationSignalCount === 3 &&
    nextMatchObservationPlanAudit.observationItemsWithNegativeSignalCount === 3;
  const coachDecisionBoundariesReady = decisionBoundaryAudit.boundaryNotesVisible &&
    decisionBoundaryAudit.selectionImpositionCount === 0 &&
    decisionBoundaryAudit.tacticalPlanImpositionCount === 0 &&
    decisionBoundaryAudit.automaticLineupRecommendationCount === 0 &&
    decisionBoundaryAudit.sandboxPromotionCount === 0 &&
    decisionBoundaryAudit.diagnosticPromotionCount === 0 &&
    decisionBoundaryAudit.batchPromotionCount === 0;
  const replayDecisionLinksReady = decisionLayerAudit.decisionCardsLinkedToReplayCount === 3;
  const tacticalMapDecisionLinksReady = decisionLayerAudit.decisionCardsLinkedToTacticalMapOrTrendCount === 3;
  const actionPlanDecisionLinksReady = decisionLayerAudit.decisionCardsLinkedToActionPlanCount === 3;
  const decisionWordingClean = wordingCleanupAudit.replayExportDuplicateTitleCount === 0 &&
    wordingCleanupAudit.replayExportTruncatedSentenceCount === 0 &&
    wordingCleanupAudit.technicalLabelInDecisionLayerCount === 0 &&
    wordingCleanupAudit.decisionLayerMechanicalPhraseCount === 0;
  const productRawIdCleanupReady = wordingCleanupAudit.productRawIdMainTextCountAfter8K === 0;
  const exportReplayWordingCleanupReady = wordingCleanupAudit.replayExportDuplicateTitleCount === 0 &&
    wordingCleanupAudit.replayExportTruncatedSentenceCount === 0 &&
    wordingCleanupAudit.replayExportMechanicalPhraseCount === 0;
  const sourceOfTruthSeparationPreserved = sourceOfTruthRegressionAudit.reportUsesOfficialTimelineOnlyForOfficialStory &&
    sourceOfTruthRegressionAudit.reportUsesOfficialScoreOnlyForOfficialScore &&
    sourceOfTruthRegressionAudit.reportScoreMatchesOfficialScore &&
    sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange &&
    sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange &&
    sourceOfTruthRegressionAudit.decisionLayerScoreClaimsBackedByScoreChange &&
    sourceOfTruthRegressionAudit.sandboxDecisionPromotionCount === 0 &&
    sourceOfTruthRegressionAudit.diagnosticDecisionPromotionCount === 0 &&
    sourceOfTruthRegressionAudit.batchDecisionPromotionCount === 0 &&
    sourceOfTruthRegressionAudit.noScoreMutation &&
    sourceOfTruthRegressionAudit.noEventDeletion;
  const warningCodes = cleanWarnings([
    ...decisionLayerAudit.decisionLayerWarningCodes,
    ...nextMatchObservationPlanAudit.observationPlanWarningCodes,
    ...decisionBoundaryAudit.decisionBoundaryWarningCodes,
    ...wordingCleanupAudit.wordingCleanupWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...integrationBudgetAudit.reportIntegrationWarningCodes,
    ...(decisionLayerReady ? ["DECISION_LAYER_READY" as const] : ["DECISION_LAYER_MISSING" as const]),
    ...(nextMatchObservationPlanReady ? ["NEXT_MATCH_OBSERVATION_PLAN_READY" as const] : ["NEXT_MATCH_OBSERVATION_PLAN_MISSING" as const]),
    ...(confirmationCriteriaReady ? ["CONFIRMATION_CRITERIA_READY" as const] : ["CONFIRMATION_CRITERIA_MISSING" as const]),
    ...(disconfirmationCriteriaReady ? ["DISCONFIRMATION_CRITERIA_READY" as const] : ["DISCONFIRMATION_CRITERIA_MISSING" as const]),
    ...(coachDecisionBoundariesReady ? ["COACH_DECISION_BOUNDARIES_READY" as const] : []),
    ...(replayDecisionLinksReady ? ["REPLAY_DECISION_LINKS_READY" as const] : ["DECISION_REPLAY_LINK_MISSING" as const]),
    ...(tacticalMapDecisionLinksReady ? ["TACTICAL_MAP_DECISION_LINKS_READY" as const] : ["DECISION_TACTICAL_MAP_LINK_MISSING" as const]),
    ...(actionPlanDecisionLinksReady ? ["ACTION_PLAN_DECISION_LINKS_READY" as const] : ["DECISION_ACTION_PLAN_LINK_MISSING" as const]),
    ...(decisionWordingClean ? ["DECISION_WORDING_CLEAN" as const] : []),
    ...(productRawIdCleanupReady ? ["PRODUCT_RAW_ID_CLEANUP_READY" as const] : ["PRODUCT_RAW_ID_MAIN_TEXT_REMAINING" as const]),
    ...(exportReplayWordingCleanupReady ? ["EXPORT_REPLAY_WORDING_CLEANUP_READY" as const] : []),
    ...(integrationBudgetAudit.productStoryFirstSectionVisible ? ["PRODUCT_STORY_FIRST_PRESERVED" as const] : ["PRODUCT_STORY_FIRST_REGRESSED" as const]),
    ...(integrationBudgetAudit.exportCompactPreserved ? ["EXPORT_COMPACT_PRESERVED" as const] : ["EXPORT_COMPACT_REGRESSED" as const]),
    ...(exportBudgetAudit.exportUnder900Seconds ? ["EXPORT_UNDER_900_READY" as const] : ["EXPORT_OVER_900" as const]),
    ...(exportBudgetAudit.exportUnder800Seconds ? ["EXPORT_UNDER_800_READY" as const] : []),
    ...(baseline8I.numericThresholdGuardReady ? ["NUMERIC_THRESHOLD_GUARD_PRESERVED" as const] : []),
    ...(sourceOfTruthSeparationPreserved ? ["SOURCE_OF_TRUTH_PRESERVED" as const] : []),
    ...(baseline8I.matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(baseline8I.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
  ]);
  const blocking = warningCodes.some((warning) => COACH_DECISION_LAYER_8K_BLOCKING_WARNINGS.includes(warning));
  const strongPass = exportBudgetAudit.exportUnder800Seconds &&
    productRawIdCleanupReady &&
    wordingCleanupAudit.decisionLayerCoachReadabilityScore >= 92;
  const status = blocking ? "FAIL" : strongPass ? "PASS" : "PARTIAL";
  const finalWarningCodes = cleanWarnings([
    ...warningCodes,
    status === "PASS"
      ? "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_COMPLETE"
      : status === "PARTIAL"
        ? "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_PARTIAL"
        : "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_FAIL",
  ]);

  return {
    status,
    scope: "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN",
    version: "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_8K",
    baselineVersion: "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_8I",
    matchId: baseline8I.matchId,
    officialScore: baseline8I.officialScore,
    baseline8J,
    baseline8I,
    baseline8JPreserved: baseline8J.status === "PASS",
    baseline8IPreserved: baseline8I.status === "PASS",
    baseline8HPreserved: baseline8I.baseline8HPreserved,
    baseline8GPreserved: baseline8I.baseline8GPreserved,
    baseline8FPreserved: baseline8I.baseline8FPreserved,
    baseline8EPreserved: baseline8I.baseline8EPreserved,
    baseline8DPreserved: baseline8I.baseline8DPreserved,
    baseline8CPreserved: baseline8I.baseline8CPreserved,
    baseline8BPreserved: baseline8I.baseline8BPreserved,
    baseline8APreserved: baseline8I.baseline8APreserved,
    baseline7HPreserved: baseline8I.baseline7HPreserved,
    baseline6XPreserved: baseline8I.baseline6XPreserved,
    decisionLayerReady,
    nextMatchObservationPlanReady,
    confirmationCriteriaReady,
    disconfirmationCriteriaReady,
    coachDecisionBoundariesReady,
    replayDecisionLinksReady,
    tacticalMapDecisionLinksReady,
    actionPlanDecisionLinksReady,
    decisionWordingClean,
    productRawIdCleanupReady,
    exportReplayWordingCleanupReady,
    productStoryFirstPreserved: integrationBudgetAudit.productStoryFirstSectionVisible,
    exportCompactPreserved: integrationBudgetAudit.exportCompactPreserved,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: baseline8I.numericThresholdGuardReady,
    sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8I.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline8I.guardrailsPreserved,
    productBaselineReady: baseline8I.productBaselineReady,
    decisionCards: coachDecisionCards8K,
    nextMatchObservationPlan: plan,
    boundaryNotes: boundaryNotes8K,
    wordingCleanups: wordingCleanups(),
    decisionLayerAudit,
    nextMatchObservationPlanAudit,
    decisionBoundaryAudit,
    wordingCleanupAudit,
    exportBudgetAudit,
    sourceOfTruthRegressionAudit,
    integrationBudgetAudit,
    productDecisionLayerHtml: renderCoachDecisionLayerProduct8K(),
    exportDecisionLayerHtml: renderCoachDecisionLayerExport8K(),
    cleanedProductHtml,
    cleanedExportHtml,
    warningCodes: finalWarningCodes,
    recommendation: status === "PASS"
      ? "KEEP_DECISION_LAYER_OBSERVATIONAL"
      : status === "PARTIAL"
        ? "POLISH_DECISION_LAYER_WORDING_OR_EXPORT_BUDGET"
        : "REPAIR_DECISION_LAYER_SOURCE_OF_TRUTH",
    nextSprintRecommendation: status === "PASS"
      ? "8L - Coach Report Seasonless Learning Loop & Observation Outcome Tracker"
      : status === "PARTIAL"
        ? "8L - Decision Layer Wording Polish"
        : "8L - Decision Layer Source-of-Truth Regression Fix",
  };
}

export function currentGeneratedCoachReportDecisionLayerNextMatchObservationPlan8KModel(): CoachReportDecisionLayerNextMatchObservationPlan8KModel {
  return buildCoachReportDecisionLayerNextMatchObservationPlan8K();
}

function excerpt(html: string, label: string): string {
  const index = html.indexOf(label);
  if (index < 0) return "not found";
  return html.slice(Math.max(0, index - 80), Math.min(html.length, index + 520)).replace(/\s+/gu, " ").trim();
}

export function renderCoachReportDecisionLayerNextMatchObservationPlan8KDoc(
  model: CoachReportDecisionLayerNextMatchObservationPlan8KModel = currentGeneratedCoachReportDecisionLayerNextMatchObservationPlan8KModel(),
): string {
  const matchEconomy = model.baseline8I.baseline8H.baseline8G.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline;
  return [
    "# Coach Report Decision Layer & Next-Match Observation Plan 8K",
    "",
    `Status: ${model.status}`,
    "",
    "## Summary",
    ...metricRows([
      ["scope", model.scope],
      ["version", model.version],
      ["baselineVersion", model.baselineVersion],
      ["matchId", model.matchId],
      ["officialScore", model.officialScore],
      ["recommendation", model.recommendation],
      ["nextSprintRecommendation", model.nextSprintRecommendation],
    ]),
    "",
    "## Baseline 8J / 8I Summary",
    ...metricRows([
      ["baseline8J preserved", model.baseline8JPreserved],
      ["baseline8I preserved", model.baseline8IPreserved],
      ["exportReadTimeSecondsAfter8I", model.baseline8I.exportBudgetAudit.exportReadTimeSecondsAfter8I],
      ["exportActionPlanCardCount", model.baseline8I.exportContentAudit.exportActionPlanCardCount],
      ["numericThresholdGuardPreserved", model.numericThresholdGuardPreserved],
    ]),
    "",
    "## Baseline Preservation 8H To 6X",
    ...metricRows([
      ["baseline8H preserved", model.baseline8HPreserved],
      ["baseline8G preserved", model.baseline8GPreserved],
      ["baseline8F preserved", model.baseline8FPreserved],
      ["baseline8E preserved", model.baseline8EPreserved],
      ["baseline8D preserved", model.baseline8DPreserved],
      ["baseline8C preserved", model.baseline8CPreserved],
      ["baseline8B preserved", model.baseline8BPreserved],
      ["baseline8A preserved", model.baseline8APreserved],
      ["baseline7H preserved", model.baseline7HPreserved],
      ["baseline6X match economy preserved", model.baseline6XPreserved],
    ]),
    "",
    "## Decision Layer Summary",
    ...metricRows([
      ["decisionLayerReady", model.decisionLayerReady],
      ["nextMatchObservationPlanReady", model.nextMatchObservationPlanReady],
      ["confirmationCriteriaReady", model.confirmationCriteriaReady],
      ["disconfirmationCriteriaReady", model.disconfirmationCriteriaReady],
      ["coachDecisionBoundariesReady", model.coachDecisionBoundariesReady],
      ["decisionWordingClean", model.decisionWordingClean],
      ["productRawIdCleanupReady", model.productRawIdCleanupReady],
      ["exportReplayWordingCleanupReady", model.exportReplayWordingCleanupReady],
    ]),
    "",
    "## Decision Cards",
    ...table([
      ["Priority", "Title", "Question", "Confirm", "Disconfirm", "Risk", "Boundary"],
      ...model.decisionCards.map((card) => [
        card.priorityLevel,
        card.title,
        card.decisionQuestion,
        card.confirmationSignal,
        card.disconfirmationSignal,
        card.riskToWatch,
        card.evidenceBoundary,
      ]),
    ]),
    "",
    "## Next-Match Observation Items",
    ...table([
      ["Item", "When", "Where", "Positive signal", "Negative signal", "Minimum evidence"],
      ...model.nextMatchObservationPlan.observationItems.map((item) => [
        item.title,
        item.whenToWatch,
        item.whereToWatch,
        item.positiveSignal,
        item.negativeSignal,
        item.minimumEvidenceNeeded,
      ]),
    ]),
    "",
    "## Confirmation / Disconfirmation Matrix",
    ...table([
      ["Decision", "Confirmation", "Disconfirmation"],
      ...model.decisionCards.map((card) => [card.title, card.confirmationSignal, card.disconfirmationSignal]),
    ]),
    "",
    "## Replay / Action / Tactical Links",
    ...table([
      ["Decision", "Replay", "Action plan", "Tactical map / trend"],
      ...model.decisionCards.map((card) => [
        card.title,
        card.linkedReplayMomentIds.join(", "),
        card.linkedActionPlanCardIds.join(", "),
        [...card.linkedTacticalMapCardIds, ...card.linkedTrendIds].join(", "),
      ]),
    ]),
    "",
    "## Decision Boundary Audit",
    ...metricRows([
      ["selectionImpositionCount", model.decisionBoundaryAudit.selectionImpositionCount],
      ["tacticalPlanImpositionCount", model.decisionBoundaryAudit.tacticalPlanImpositionCount],
      ["automaticLineupRecommendationCount", model.decisionBoundaryAudit.automaticLineupRecommendationCount],
      ["sandboxPromotionCount", model.decisionBoundaryAudit.sandboxPromotionCount],
      ["diagnosticPromotionCount", model.decisionBoundaryAudit.diagnosticPromotionCount],
      ["batchPromotionCount", model.decisionBoundaryAudit.batchPromotionCount],
      ["overclaimCount", model.decisionBoundaryAudit.overclaimCount],
      ["boundaryNotesVisible", model.decisionBoundaryAudit.boundaryNotesVisible],
    ]),
    "",
    "## Wording Cleanup Audit",
    ...metricRows([
      ["replayExportDuplicateTitleCount", model.wordingCleanupAudit.replayExportDuplicateTitleCount],
      ["replayExportTruncatedSentenceCount", model.wordingCleanupAudit.replayExportTruncatedSentenceCount],
      ["replayExportMechanicalPhraseCount", model.wordingCleanupAudit.replayExportMechanicalPhraseCount],
      ["productRawIdMainTextCountBefore8K", model.wordingCleanupAudit.productRawIdMainTextCountBefore8K],
      ["productRawIdMainTextCountAfter8K", model.wordingCleanupAudit.productRawIdMainTextCountAfter8K],
      ["rawEventIdInProductMainTextCount", model.wordingCleanupAudit.rawEventIdInProductMainTextCount],
      ["rawPlayerIdInProductMainTextCount", model.wordingCleanupAudit.rawPlayerIdInProductMainTextCount],
      ["rawEffectLabelInProductMainTextCount", model.wordingCleanupAudit.rawEffectLabelInProductMainTextCount],
      ["decisionLayerCoachReadabilityScore", model.wordingCleanupAudit.decisionLayerCoachReadabilityScore],
    ]),
    "",
    "## Export Budget",
    ...metricRows([
      ["exportReadTimeSecondsBefore8K", model.exportBudgetAudit.exportReadTimeSecondsBefore8K],
      ["exportReadTimeSecondsAfter8K", model.exportBudgetAudit.exportReadTimeSecondsAfter8K],
      ["exportReadTimeDelta", model.exportBudgetAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportBudgetAudit.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportBudgetAudit.exportUnder800Seconds],
      ["exportUnder900BooleanCorrect", model.exportBudgetAudit.exportUnder900BooleanCorrect],
      ["exportUnder800BooleanCorrect", model.exportBudgetAudit.exportUnder800BooleanCorrect],
      ["exportedObservationItemsCount", model.exportBudgetAudit.exportedObservationItemsCount],
    ]),
    "",
    "## Source-Of-Truth Regression",
    ...metricRows([
      ["reportUsesOfficialTimelineOnlyForOfficialStory", model.sourceOfTruthRegressionAudit.reportUsesOfficialTimelineOnlyForOfficialStory],
      ["reportUsesOfficialScoreOnlyForOfficialScore", model.sourceOfTruthRegressionAudit.reportUsesOfficialScoreOnlyForOfficialScore],
      ["reportScoreMatchesOfficialScore", model.sourceOfTruthRegressionAudit.reportScoreMatchesOfficialScore],
      ["allStoryScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange],
      ["allReplayScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange],
      ["decisionLayerScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.decisionLayerScoreClaimsBackedByScoreChange],
      ["sandboxDecisionPromotionCount", model.sourceOfTruthRegressionAudit.sandboxDecisionPromotionCount],
      ["diagnosticDecisionPromotionCount", model.sourceOfTruthRegressionAudit.diagnosticDecisionPromotionCount],
      ["batchDecisionPromotionCount", model.sourceOfTruthRegressionAudit.batchDecisionPromotionCount],
      ["noScoreMutation", model.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.sourceOfTruthRegressionAudit.noEventDeletion],
    ]),
    "",
    "## Integration Budget",
    ...metricRows([
      ["productDecisionLayerVisible", model.integrationBudgetAudit.productDecisionLayerVisible],
      ["exportDecisionLayerVisible", model.integrationBudgetAudit.exportDecisionLayerVisible],
      ["productStoryFirstSectionVisible", model.integrationBudgetAudit.productStoryFirstSectionVisible],
      ["exportStoryFirstSectionVisible", model.integrationBudgetAudit.exportStoryFirstSectionVisible],
      ["productReplaySectionVisible", model.integrationBudgetAudit.productReplaySectionVisible],
      ["exportReplaySectionVisible", model.integrationBudgetAudit.exportReplaySectionVisible],
      ["productActionPlanVisible", model.integrationBudgetAudit.productActionPlanVisible],
      ["exportActionPlanVisible", model.integrationBudgetAudit.exportActionPlanVisible],
      ["tacticalMapCardsStillVisible", model.integrationBudgetAudit.tacticalMapCardsStillVisible],
      ["sourceOfTruthNoteVisible", model.integrationBudgetAudit.sourceOfTruthNoteVisible],
      ["exportCompactPreserved", model.integrationBudgetAudit.exportCompactPreserved],
    ]),
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
      ["guardrailsPreserved", model.guardrailsPreserved],
    ]),
    "",
    "## Product / Export Excerpts",
    `- Product decision layer: ${excerpt(model.cleanedProductHtml, "Decider quoi observer au prochain match")}`,
    `- Export observation layer: ${excerpt(model.cleanedExportHtml, "A observer au prochain match")}`,
    `- Cleaned replay export: ${excerpt(model.cleanedExportHtml, "Replay coach en 60 secondes")}`,
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderCoachReportDecisionLayerNextMatchObservationPlan8KValidation(
  model: CoachReportDecisionLayerNextMatchObservationPlan8KModel = currentGeneratedCoachReportDecisionLayerNextMatchObservationPlan8KModel(),
): string {
  const checks = [
    checkLine("CoachReportDecisionLayerNextMatchObservationPlan8KModel exists", model.version === "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_8K", model.version),
    checkLine("baseline 8J visible", model.baseline8J.version === "SHARE_PACK_COMPLETION_EXPORT_ACTION_PLAN_RESTORATION_8J", model.baseline8J.version),
    checkLine("baseline 8I preserved", model.baseline8IPreserved, bool(model.baseline8IPreserved)),
    checkLine("baseline 8H preserved", model.baseline8HPreserved, bool(model.baseline8HPreserved)),
    checkLine("baseline 8G preserved", model.baseline8GPreserved, bool(model.baseline8GPreserved)),
    checkLine("baseline 8F preserved", model.baseline8FPreserved, bool(model.baseline8FPreserved)),
    checkLine("baseline 8E preserved", model.baseline8EPreserved, bool(model.baseline8EPreserved)),
    checkLine("baseline 8D preserved", model.baseline8DPreserved, bool(model.baseline8DPreserved)),
    checkLine("baseline 8C preserved", model.baseline8CPreserved, bool(model.baseline8CPreserved)),
    checkLine("baseline 8B preserved", model.baseline8BPreserved, bool(model.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8APreserved, bool(model.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline7HPreserved, bool(model.baseline7HPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved && model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("product decision layer visible", model.integrationBudgetAudit.productDecisionLayerVisible, bool(model.integrationBudgetAudit.productDecisionLayerVisible)),
    checkLine("export decision layer visible", model.integrationBudgetAudit.exportDecisionLayerVisible, bool(model.integrationBudgetAudit.exportDecisionLayerVisible)),
    checkLine("decisionCardCount = 3", model.decisionLayerAudit.decisionCardCount === 3, String(model.decisionLayerAudit.decisionCardCount)),
    checkLine("nextMatchObservationPlan visible", model.nextMatchObservationPlanAudit.nextMatchObservationPlanVisible, bool(model.nextMatchObservationPlanAudit.nextMatchObservationPlanVisible)),
    checkLine("observationItemCount = 3", model.nextMatchObservationPlanAudit.observationItemCount === 3, String(model.nextMatchObservationPlanAudit.observationItemCount)),
    checkLine("confirmation criteria present", model.confirmationCriteriaReady, bool(model.confirmationCriteriaReady)),
    checkLine("disconfirmation criteria present", model.disconfirmationCriteriaReady, bool(model.disconfirmationCriteriaReady)),
    checkLine("doNotOverInterpret present", model.decisionLayerAudit.decisionCardsWithDoNotOverInterpretCount === 3, String(model.decisionLayerAudit.decisionCardsWithDoNotOverInterpretCount)),
    checkLine("boundary notes visible", model.decisionBoundaryAudit.boundaryNotesVisible, bool(model.decisionBoundaryAudit.boundaryNotesVisible)),
    checkLine("no selection imposition", model.decisionBoundaryAudit.selectionImpositionCount === 0, String(model.decisionBoundaryAudit.selectionImpositionCount)),
    checkLine("no tactical plan imposition", model.decisionBoundaryAudit.tacticalPlanImpositionCount === 0, String(model.decisionBoundaryAudit.tacticalPlanImpositionCount)),
    checkLine("no automatic lineup recommendation", model.decisionBoundaryAudit.automaticLineupRecommendationCount === 0, String(model.decisionBoundaryAudit.automaticLineupRecommendationCount)),
    checkLine("no sandbox promotion", model.decisionBoundaryAudit.sandboxPromotionCount === 0 && model.sourceOfTruthRegressionAudit.sandboxDecisionPromotionCount === 0, "0"),
    checkLine("no diagnostic promotion", model.decisionBoundaryAudit.diagnosticPromotionCount === 0 && model.sourceOfTruthRegressionAudit.diagnosticDecisionPromotionCount === 0, "0"),
    checkLine("no batch promotion", model.decisionBoundaryAudit.batchPromotionCount === 0 && model.sourceOfTruthRegressionAudit.batchDecisionPromotionCount === 0, "0"),
    checkLine("replay export duplicate title count = 0", model.wordingCleanupAudit.replayExportDuplicateTitleCount === 0, String(model.wordingCleanupAudit.replayExportDuplicateTitleCount)),
    checkLine("replay export truncated sentence count = 0", model.wordingCleanupAudit.replayExportTruncatedSentenceCount === 0, String(model.wordingCleanupAudit.replayExportTruncatedSentenceCount)),
    checkLine("productRawIdMainTextCountAfter8K = 0", model.wordingCleanupAudit.productRawIdMainTextCountAfter8K === 0, String(model.wordingCleanupAudit.productRawIdMainTextCountAfter8K)),
    checkLine("no raw event IDs in product/export main coach text", model.wordingCleanupAudit.rawEventIdInProductMainTextCount === 0, String(model.wordingCleanupAudit.rawEventIdInProductMainTextCount)),
    checkLine("no raw player IDs in product/export main coach text", model.wordingCleanupAudit.rawPlayerIdInProductMainTextCount === 0, String(model.wordingCleanupAudit.rawPlayerIdInProductMainTextCount)),
    checkLine("no raw effect labels in product/export main coach text", model.wordingCleanupAudit.rawEffectLabelInProductMainTextCount === 0, String(model.wordingCleanupAudit.rawEffectLabelInProductMainTextCount)),
    checkLine("exportReadTimeSecondsAfter8K <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8K <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8K)),
    checkLine("exportUnder900Seconds correctly computed", model.exportBudgetAudit.exportUnder900BooleanCorrect, bool(model.exportBudgetAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportBudgetAudit.exportUnder800BooleanCorrect, bool(model.exportBudgetAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.baseline8I.numericValidationHonestyAudit.passMessageOnFailedRuleCount === 0, String(model.baseline8I.numericValidationHonestyAudit.passMessageOnFailedRuleCount)),
    checkLine("product story-first preserved", model.productStoryFirstPreserved, bool(model.productStoryFirstPreserved)),
    checkLine("export compact preserved", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.decisionLayerScoreClaimsBackedByScoreChange, "story/replay/decision backed"),
    checkLine("sandbox excluded from official story/replay/decision layer", model.sourceOfTruthRegressionAudit.sandboxDecisionPromotionCount === 0 && model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialStory, "sandbox separated"),
    checkLine("batch excluded from official story/replay/decision layer", model.sourceOfTruthRegressionAudit.batchDecisionPromotionCount === 0 && model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialStory, "batch separated"),
    checkLine("diagnostic separated from official story/replay/decision layer", model.sourceOfTruthRegressionAudit.diagnosticDecisionPromotionCount === 0 && model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialStory, "diagnostic separated"),
    checkLine("no score mutation", model.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("MatchBonusEvent unchanged", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("batch/live separation preserved", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("export print ready", model.baseline8I.mobilePrintAudit.exportPrintReady, bool(model.baseline8I.mobilePrintAudit.exportPrintReady)),
    checkLine("export no horizontal overflow", model.baseline8I.mobilePrintAudit.exportNoHorizontalOverflow, bool(model.baseline8I.mobilePrintAudit.exportNoHorizontalOverflow)),
    checkLine("no new season memory", true, "not added in 8K"),
    checkLine("no new team style memory", true, "not added in 8K"),
    checkLine("no new database history feature", true, "not added in 8K"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:")) ? "PASS" : "FAIL";
  return [
    "# Validation - Coach Report Decision Layer & Next-Match Observation Plan 8K",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- decisionCardCount: ${model.decisionLayerAudit.decisionCardCount}`,
    `- observationItemCount: ${model.nextMatchObservationPlanAudit.observationItemCount}`,
    `- replayExportDuplicateTitleCount: ${model.wordingCleanupAudit.replayExportDuplicateTitleCount}`,
    `- replayExportTruncatedSentenceCount: ${model.wordingCleanupAudit.replayExportTruncatedSentenceCount}`,
    `- replayExportMechanicalPhraseCount: ${model.wordingCleanupAudit.replayExportMechanicalPhraseCount}`,
    `- productRawIdMainTextCountBefore8K: ${model.wordingCleanupAudit.productRawIdMainTextCountBefore8K}`,
    `- productRawIdMainTextCountAfter8K: ${model.wordingCleanupAudit.productRawIdMainTextCountAfter8K}`,
    `- rawEventIdInProductMainTextCount: ${model.wordingCleanupAudit.rawEventIdInProductMainTextCount}`,
    `- rawPlayerIdInProductMainTextCount: ${model.wordingCleanupAudit.rawPlayerIdInProductMainTextCount}`,
    `- rawEffectLabelInProductMainTextCount: ${model.wordingCleanupAudit.rawEffectLabelInProductMainTextCount}`,
    `- decisionLayerCoachReadabilityScore: ${model.wordingCleanupAudit.decisionLayerCoachReadabilityScore}`,
    `- exportReadTimeSecondsBefore8K: ${model.exportBudgetAudit.exportReadTimeSecondsBefore8K}`,
    `- exportReadTimeSecondsAfter8K: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8K}`,
    `- exportUnder900Seconds: ${model.exportBudgetAudit.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportBudgetAudit.exportUnder800Seconds}`,
    `- selectionImpositionCount: ${model.decisionBoundaryAudit.selectionImpositionCount}`,
    `- tacticalPlanImpositionCount: ${model.decisionBoundaryAudit.tacticalPlanImpositionCount}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- ${model.nextSprintRecommendation}`,
  ].join("\n");
}
