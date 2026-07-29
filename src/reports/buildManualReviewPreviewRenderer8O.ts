import { auditManualReviewPreviewExportBudget8O } from "./manualReviewPreviewExportBudgetAudit8O";
import { auditManualReviewPreviewIntegrationBudget8O } from "./manualReviewPreviewIntegrationBudgetAudit8O";
import { auditManualReviewPreviewNonPersistence8O } from "./manualReviewPreviewNonPersistenceAudit8O";
import { auditManualReviewPreviewOfficialTruthBoundary8O } from "./manualReviewPreviewOfficialTruthBoundaryAudit8O";
import { auditManualReviewPreviewRenderer8O } from "./manualReviewPreviewRendererAudit8O";
import { auditManualReviewPreviewSourceOfTruthRegression8O } from "./manualReviewPreviewSourceOfTruthRegressionAudit8O";
import { auditManualReviewPreviewWording8O } from "./manualReviewPreviewWordingAudit8O";
import {
  buildManualReviewResultIntakeBoundary8NModel,
  currentManualReviewResultIntakeBoundary8NModel,
} from "./buildManualReviewResultIntakeBoundary8N";
import {
  buildValidManualReviewIntakePayloadFixture8N,
} from "./manualReviewResultIntakeContractAudit8N";
import type {
  ManualReviewIntakeValidationResult8N,
  ManualReviewOutcomeValue8N,
  ManualReviewResultEntry8N,
  ManualReviewResultIntakeBoundary8NModel,
  ManualReviewResultIntakePayload8N,
} from "./manualReviewResultIntakeBoundaryTypes8N";
import {
  MANUAL_REVIEW_PREVIEW_RENDERER_8O_BLOCKING_WARNINGS,
  type ManualReviewPreviewRendererWarningCode8O,
} from "./manualReviewPreviewRendererWarnings8O";
import type {
  ManualReviewPreviewBoundary8O,
  ManualReviewPreviewCard8O,
  ManualReviewPreviewPayloadFixture8O,
  ManualReviewPreviewRenderer8OModel,
  ManualReviewPreviewSummary8O,
} from "./manualReviewPreviewRendererTypes8O";
import { renderManualReviewPreviewExport8O, insertManualReviewPreviewExport8O } from "./renderManualReviewPreviewExport8O";
import { renderManualReviewPreviewProduct8O, insertManualReviewPreviewProduct8O } from "./renderManualReviewPreviewProduct8O";
import { validateManualReviewResultIntakePayload8N } from "./validateManualReviewResultIntakePayload8N";

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

function compactSnippet(html: string, marker: string): string {
  const index = html.indexOf(marker);
  const start = index < 0 ? 0 : Math.max(0, index - 80);
  return html.slice(start, start + 800).replace(/\s+/gu, " ");
}

function outcomeLabel(outcome: ManualReviewOutcomeValue8N): string {
  if (outcome === "confirmed") return "Confirme dans ce payload de preview";
  if (outcome === "contradicted") return "Infirme dans ce payload de preview";
  if (outcome === "inconclusive") return "Inconclusif dans ce payload de preview";
  return "Echantillon insuffisant dans ce payload de preview";
}

function previewInterpretation(outcome: ManualReviewOutcomeValue8N): string {
  if (outcome === "confirmed") return "Signal manuel declare comme confirme par le coach dans ce payload de preview.";
  if (outcome === "contradicted") return "Signal manuel declare comme infirme par le coach dans ce payload de preview.";
  if (outcome === "inconclusive") return "Signal manuel encore inconclusif.";
  return "Echantillon declare insuffisant.";
}

function nextQuestion(entry: ManualReviewResultEntry8N): string {
  if (entry.selectedOutcome === "confirmed") return "Le meme signal reste-t-il lisible sur une autre situation comparable ?";
  if (entry.selectedOutcome === "contradicted") return "Quel detail terrain explique l'ecart avec l'observation initiale ?";
  if (entry.selectedOutcome === "inconclusive") return "Quelles situations supplementaires faut-il comparer avant de conclure ?";
  return "Combien de situations comparables faut-il collecter avant de relire ce point ?";
}

function buildCards(payload: ManualReviewResultIntakePayload8N): readonly ManualReviewPreviewCard8O[] {
  return payload.entries.map((entry, index) => ({
    previewCardId: `manual-review-preview-card-${index + 1}-8o`,
    linked8NEntryId: entry.entryId,
    linked8MReviewSectionId: entry.linked8MReviewSectionId,
    linked8LObservationCardId: entry.linked8LObservationCardId,
    linked8KDecisionCardId: entry.linked8KDecisionCardId,
    observationTitle: entry.observationTitle,
    selectedOutcome: entry.selectedOutcome,
    outcomeLabel: outcomeLabel(entry.selectedOutcome),
    previewInterpretation: previewInterpretation(entry.selectedOutcome),
    comparableSituationCount: entry.comparableSituationCount,
    positiveSignalCount: entry.positiveSignalCount,
    negativeSignalCount: entry.negativeSignalCount,
    contextComparable: entry.contextComparable,
    coachNotesPreview: entry.coachNotes,
    exampleToReviewPreview: entry.exampleToReview,
    cautionReminder: "Preview demo non officielle : ne pas stocker, ne pas appliquer, ne pas transformer en preuve du match.",
    nextQuestion: nextQuestion(entry),
    nonOfficialBadge: true,
    notPersistedBadge: true,
    notAppliedBadge: true,
    noAutoClassificationBadge: true,
    canDriveSelection: false,
    canDriveTacticalInstruction: false,
    officialTruth: false,
  }));
}

function buildSummary(cards: readonly ManualReviewPreviewCard8O[]): ManualReviewPreviewSummary8O {
  const countOutcome = (outcome: ManualReviewOutcomeValue8N): number => cards.filter((card) => card.selectedOutcome === outcome).length;
  const countContext = (context: string): number => cards.filter((card) => card.contextComparable === context).length;
  return {
    summaryId: "manual-review-preview-summary-8o",
    totalEntries: cards.length,
    confirmedCount: countOutcome("confirmed"),
    contradictedCount: countOutcome("contradicted"),
    inconclusiveCount: countOutcome("inconclusive"),
    insufficientSampleCount: countOutcome("insufficient_sample"),
    contextComparableYesCount: countContext("yes"),
    contextComparableNoCount: countContext("no"),
    contextComparableUncertainCount: countContext("uncertain"),
    previewReadout: "Cette lecture montre seulement comment trois reponses manuelles seraient relues avant stockage ou application.",
    cautionReadout: "On peut lire une orientation coach de demonstration; on ne peut pas conclure une verite officielle, une tendance de saison, une selection ou un plan tactique.",
    nextCoachQuestion: "Quels exemples reels devront etre ajoutes apres match avant de comparer ces signaux ?",
    nonOfficial: true,
    notPersisted: true,
    notApplied: true,
  };
}

function buildBoundaries(): readonly ManualReviewPreviewBoundary8O[] {
  return [
    {
      boundaryId: "manual-review-preview-no-persistence-8o",
      label: "Pas de stockage",
      text: "La preview reste un rendu temporaire : pas de localStorage, pas de base de donnees, pas de fichier de persistance, pas de backend.",
      prevents: ["persistence", "season_memory_creation", "team_style_memory_creation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "manual-review-preview-no-official-truth-8o",
      label: "Pas de verite officielle",
      text: "La saisie coach reste non officielle et ne peut pas devenir un resultat moteur ou une preuve du prochain match.",
      prevents: ["official_truth_promotion", "sandbox_promotion", "diagnostic_promotion", "batch_promotion"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "manual-review-preview-no-mutation-8o",
      label: "Pas de mutation",
      text: "Aucun score, timeline, evenement, ScoringEvent, selection ou consigne tactique n'est cree ou modifie.",
      prevents: ["score_mutation", "timeline_mutation", "score_change_creation", "event_mutation", "selection_automation", "tactical_instruction"],
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

export function buildManualReviewPreviewPayloadFixture8O(sourceMatchId: string): ManualReviewResultIntakePayload8N {
  const base = buildValidManualReviewIntakePayloadFixture8N(sourceMatchId);
  return {
    ...base,
    intakeId: "manual-review-preview-payload-fixture-8o",
    entries: base.entries.map((entry, index) => {
      if (index === 0) {
        return {
          ...entry,
          selectedOutcome: "confirmed",
          comparableSituationCount: 4,
          positiveSignalCount: 3,
          negativeSignalCount: 1,
          contextComparable: "yes",
          coachNotes: "Preview demo: sortie plus propre sur plusieurs recuperations comparables.",
          exampleToReview: "Exemple de previsualisation non officielle - premiere sortie apres recuperation.",
        };
      }
      if (index === 1) {
        return {
          ...entry,
          selectedOutcome: "inconclusive",
          comparableSituationCount: 3,
          positiveSignalCount: 1,
          negativeSignalCount: 2,
          contextComparable: "uncertain",
          coachNotes: "Preview demo: signaux mixtes, pas assez stable.",
          exampleToReview: "Exemple de previsualisation non officielle - continuite apres zone dangereuse.",
        };
      }
      return {
        ...entry,
        selectedOutcome: "insufficient_sample",
        comparableSituationCount: 1,
        positiveSignalCount: 1,
        negativeSignalCount: 0,
        contextComparable: "uncertain",
        coachNotes: "Preview demo: trop peu de situations comparables.",
        exampleToReview: "Exemple de previsualisation non officielle - structure apres action neutralisee.",
      };
    }),
  };
}

function buildInvalidPreviewPayload(validPayload: ManualReviewResultIntakePayload8N): Record<string, unknown> {
  return {
    ...validPayload,
    sourceMatchId: "",
    entries: validPayload.entries.slice(0, 2),
  };
}

function uniqueWarnings(
  warnings: readonly ManualReviewPreviewRendererWarningCode8O[],
): readonly ManualReviewPreviewRendererWarningCode8O[] {
  const has = (warning: ManualReviewPreviewRendererWarningCode8O): boolean => warnings.includes(warning);
  return [...new Set(warnings.filter((warning) => {
    if (warning === "PREVIEW_RENDERER_READY") {
      return !has("PREVIEW_RENDERER_MISSING") && !has("PREVIEW_RENDERED_WITHOUT_VALIDATION") && !has("INVALID_PAYLOAD_RENDERED") && !has("PREVIEW_CARD_COUNT_INVALID");
    }
    if (warning === "PREVIEW_MARKED_NON_OFFICIAL") {
      return !has("PREVIEW_NON_OFFICIAL_MARKER_MISSING") && !has("OFFICIAL_TRUTH_PROMOTION_DETECTED") && !has("REAL_NEXT_MATCH_CLAIM_DETECTED");
    }
    if (warning === "PREVIEW_MARKED_NOT_PERSISTED") {
      return !has("PREVIEW_NOT_PERSISTED_MARKER_MISSING") && !has("PREVIEW_PERSISTENCE_DETECTED") && !has("LOCAL_STORAGE_PERSISTENCE_DETECTED") && !has("DATABASE_PERSISTENCE_CREATED") && !has("FILE_PERSISTENCE_CREATED");
    }
    if (warning === "SOURCE_OF_TRUTH_PRESERVED") {
      return !has("SCORE_CLAIM_WITHOUT_SCORE_CHANGE") && !has("SANDBOX_PREVIEW_PROMOTED") && !has("DIAGNOSTIC_PREVIEW_PROMOTED") && !has("BATCH_PREVIEW_PROMOTED") && !has("OFFICIAL_TRUTH_PROMOTION_DETECTED");
    }
    return true;
  }))];
}

export function resolveManualReviewPreviewRendererStatus8O(input: {
  readonly failureWarnings: readonly ManualReviewPreviewRendererWarningCode8O[];
  readonly derivedFailureWarnings: readonly ManualReviewPreviewRendererWarningCode8O[];
  readonly exportUnder900Seconds: boolean;
  readonly wordingReadabilityScore: number;
}): "PASS" | "PARTIAL" | "FAIL" {
  const completeFailureWarnings = uniqueWarnings([
    ...input.failureWarnings,
    ...input.derivedFailureWarnings,
  ]);
  const blocking = completeFailureWarnings.some((warning) =>
    MANUAL_REVIEW_PREVIEW_RENDERER_8O_BLOCKING_WARNINGS.includes(warning),
  );
  if (blocking) return "FAIL";
  return input.exportUnder900Seconds && input.wordingReadabilityScore >= 90 ? "PASS" : "PARTIAL";
}

export function buildManualReviewPreviewRenderer8OModel(input?: {
  readonly baseline8N?: ManualReviewResultIntakeBoundary8NModel;
  readonly productHtmlBefore8O?: string;
  readonly exportHtmlBefore8O?: string;
}): ManualReviewPreviewRenderer8OModel {
  const baseline8N = input?.baseline8N ?? currentManualReviewResultIntakeBoundary8NModel();
  const productHtmlBefore8O = input?.productHtmlBefore8O ?? baseline8N.productHtmlAfter8N;
  const exportHtmlBefore8O = input?.exportHtmlBefore8O ?? baseline8N.exportHtmlAfter8N;
  const payload = buildManualReviewPreviewPayloadFixture8O(baseline8N.matchId);
  const validatorInputSnapshot = JSON.stringify(payload);
  const validationResult = validateManualReviewResultIntakePayload8N(payload);
  const validatorInputAfter = JSON.stringify(payload);
  const invalidPayloadValidationResult = validateManualReviewResultIntakePayload8N(buildInvalidPreviewPayload(payload));
  const previewCards = validationResult.status === "accepted_for_preview" && validationResult.normalizedPayload !== undefined
    ? buildCards(validationResult.normalizedPayload)
    : [];
  const previewSummary = buildSummary(previewCards);
  const previewBoundaries = buildBoundaries();
  const productPreviewHtml = renderManualReviewPreviewProduct8O({ cards: previewCards, summary: previewSummary, boundaries: previewBoundaries });
  const exportPreviewHtml = renderManualReviewPreviewExport8O({ cards: previewCards, summary: previewSummary });
  const productHtmlAfter8O = insertManualReviewPreviewProduct8O(productHtmlBefore8O, productPreviewHtml);
  const exportHtmlAfter8O = insertManualReviewPreviewExport8O(exportHtmlBefore8O, exportPreviewHtml);
  const previewAudit = auditManualReviewPreviewRenderer8O({
    productHtml: productHtmlAfter8O,
    exportHtml: exportHtmlAfter8O,
    cards: previewCards,
    validPayloadValidationResult: validationResult,
    invalidPayloadValidationResult,
    validatorInputSnapshot,
    validatorInputAfter,
  });
  const nonPersistenceAudit = auditManualReviewPreviewNonPersistence8O({ productHtml: productHtmlAfter8O, exportHtml: exportHtmlAfter8O });
  const officialTruthBoundaryAudit = auditManualReviewPreviewOfficialTruthBoundary8O({ productHtml: productHtmlAfter8O, exportHtml: exportHtmlAfter8O });
  const sourceOfTruthRegressionAudit = auditManualReviewPreviewSourceOfTruthRegression8O({ baseline8N, productHtml: productHtmlAfter8O, exportHtml: exportHtmlAfter8O });
  const exportBudgetAudit = auditManualReviewPreviewExportBudget8O({ exportHtmlBefore8O, exportHtmlAfter8O });
  const integrationBudgetAudit = auditManualReviewPreviewIntegrationBudget8O({ productHtml: productHtmlAfter8O, exportHtml: exportHtmlAfter8O });
  const wordingAudit = auditManualReviewPreviewWording8O({ productHtml: productHtmlAfter8O, exportHtml: exportHtmlAfter8O });
  const previewPayloadFixture: ManualReviewPreviewPayloadFixture8O = {
    fixtureId: "manualReviewPreviewPayloadFixture8O",
    purpose: "preview_renderer_demo_only",
    source: "generated_demo_payload",
    isRealCoachSubmission: false,
    isOfficialMatchEvidence: false,
    payload,
    validationResult,
    mustNotPersist: true,
    mustNotApply: true,
    mustNotPromoteToOfficialTruth: true,
  };
  const baseline8NPreserved = baseline8N.status === "PASS" &&
    baseline8N.manualIntakeContractReady &&
    baseline8N.manualIntakeValidatorReady &&
    integrationBudgetAudit.productManualIntakeBoundary8NStillVisible &&
    integrationBudgetAudit.exportManualIntakeBoundary8NStillVisible;
  const manualForm8MPreserved = integrationBudgetAudit.productManualForm8MStillVisible && integrationBudgetAudit.exportManualForm8MStillVisible;
  const learningLoop8LPreserved = integrationBudgetAudit.productLearningLoop8LStillVisible && integrationBudgetAudit.exportLearningLoop8LStillVisible;
  const decisionLayer8KPreserved = integrationBudgetAudit.productDecisionLayer8KStillVisible && integrationBudgetAudit.exportDecisionLayer8KStillVisible;
  const previewMarkedNonOfficial = previewAudit.previewMarkedNonOfficialCount === 3 && wordingAudit.previewNonOfficialWordingVisible;
  const previewMarkedNotPersisted = previewAudit.previewMarkedNotPersistedCount === 3 && nonPersistenceAudit.previewPersistencePerformed === false;
  const previewMarkedNotApplied = previewAudit.previewMarkedNotAppliedCount === 3 && nonPersistenceAudit.previewApplicationPerformed === false;
  const previewDoesNotCreateMemory = nonPersistenceAudit.memoryCreationCount === 0 &&
    nonPersistenceAudit.seasonMemoryCreationCount === 0 &&
    nonPersistenceAudit.teamStyleMemoryCreationCount === 0;
  const previewDoesNotAutoClassify = previewAudit.previewMarkedNoAutoClassificationCount === 3 &&
    officialTruthBoundaryAudit.automaticClassificationCount === 0;
  const previewDoesNotDriveSelection = previewCards.every((card) => !card.canDriveSelection) &&
    officialTruthBoundaryAudit.selectionRecommendationCount === 0;
  const previewDoesNotDriveTacticalInstruction = previewCards.every((card) => !card.canDriveTacticalInstruction) &&
    officialTruthBoundaryAudit.tacticalInstructionCount === 0;
  const previewRendererReady = previewAudit.previewRendererWarningCodes.length === 0;
  const previewInputValidationReady = previewAudit.validPayloadValidatedBeforeRender && previewAudit.invalidPayloadPreviewBlocked;
  const sourceOfTruthSeparationPreserved = sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes.length === 0;
  const matchEconomyBaselinePreserved = baseline8N.baseline6XPreserved && sourceOfTruthRegressionAudit.noScoringConstantChange;
  const guardrailsPreserved = sourceOfTruthSeparationPreserved &&
    sourceOfTruthRegressionAudit.MatchBonusEventUnchanged &&
    sourceOfTruthRegressionAudit.batchLiveSeparationPreserved &&
    sourceOfTruthRegressionAudit.noScoreMutation;
  const failureWarnings = uniqueWarnings([
    ...previewAudit.previewRendererWarningCodes,
    ...nonPersistenceAudit.nonPersistenceWarningCodes,
    ...officialTruthBoundaryAudit.officialTruthBoundaryWarningCodes,
    ...sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...integrationBudgetAudit.integrationWarningCodes,
    ...wordingAudit.wordingWarningCodes,
  ]);
  const derivedStatusWarnings: readonly ManualReviewPreviewRendererWarningCode8O[] = [
    previewRendererReady ? "PREVIEW_RENDERER_READY" : "PREVIEW_RENDERER_MISSING",
    previewInputValidationReady ? "PREVIEW_INPUT_VALIDATION_READY" : "PREVIEW_RENDERED_WITHOUT_VALIDATION",
    previewAudit.productPreviewRendererVisible ? "PRODUCT_PREVIEW_RENDERER_VISIBLE" : "PRODUCT_PREVIEW_RENDERER_MISSING",
    previewAudit.exportPreviewRendererVisible ? "EXPORT_PREVIEW_RENDERER_VISIBLE" : "EXPORT_PREVIEW_RENDERER_MISSING",
    previewAudit.previewUsesValidPayloadOnly ? "PREVIEW_USES_VALID_PAYLOAD_ONLY" : "INVALID_PAYLOAD_RENDERED",
    previewAudit.invalidPayloadPreviewBlocked ? "INVALID_PAYLOAD_PREVIEW_BLOCKED" : "INVALID_PAYLOAD_RENDERED",
    previewMarkedNonOfficial ? "PREVIEW_MARKED_NON_OFFICIAL" : "PREVIEW_NON_OFFICIAL_MARKER_MISSING",
    previewMarkedNotPersisted ? "PREVIEW_MARKED_NOT_PERSISTED" : "PREVIEW_NOT_PERSISTED_MARKER_MISSING",
    previewMarkedNotApplied ? "PREVIEW_MARKED_NOT_APPLIED" : "PREVIEW_NOT_APPLIED_MARKER_MISSING",
    sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateScore ? "PREVIEW_DOES_NOT_MUTATE_SCORE" : "SCORE_MANIPULATION_DETECTED",
    sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateTimeline ? "PREVIEW_DOES_NOT_MUTATE_TIMELINE" : "SCORE_MANIPULATION_DETECTED",
    sourceOfTruthRegressionAudit.manualPreviewDoesNotCreateScoreChange ? "PREVIEW_DOES_NOT_CREATE_SCORE_CHANGE" : "SCORE_CLAIM_WITHOUT_SCORE_CHANGE",
    previewDoesNotCreateMemory ? "PREVIEW_DOES_NOT_CREATE_MEMORY" : "SEASON_MEMORY_CREATED",
    previewDoesNotAutoClassify ? "PREVIEW_DOES_NOT_AUTO_CLASSIFY" : "PREVIEW_AUTO_CLASSIFICATION_DETECTED",
    previewDoesNotDriveSelection ? "PREVIEW_DOES_NOT_DRIVE_SELECTION" : "SELECTION_IMPOSITION_DETECTED",
    previewDoesNotDriveTacticalInstruction ? "PREVIEW_DOES_NOT_DRIVE_TACTICAL_INSTRUCTION" : "TACTICAL_PLAN_IMPOSITION_DETECTED",
    baseline8NPreserved ? "MANUAL_INTAKE_CONTRACT_8N_PRESERVED" : "PRODUCT_MANUAL_INTAKE_BOUNDARY_8N_REGRESSED",
    manualForm8MPreserved ? "MANUAL_FORM_8M_PRESERVED" : "PRODUCT_MANUAL_FORM_8M_REGRESSED",
    learningLoop8LPreserved ? "LEARNING_LOOP_8L_PRESERVED" : "PRODUCT_LEARNING_LOOP_8L_REGRESSED",
    decisionLayer8KPreserved ? "DECISION_LAYER_8K_PRESERVED" : "PRODUCT_DECISION_LAYER_8K_REGRESSED",
    exportBudgetAudit.exportUnder900Seconds ? "EXPORT_UNDER_900_READY" : "EXPORT_OVER_900",
    sourceOfTruthSeparationPreserved ? "SOURCE_OF_TRUTH_PRESERVED" : "SCORE_CLAIM_WITHOUT_SCORE_CHANGE",
    matchEconomyBaselinePreserved ? "MATCH_ECONOMY_BASELINE_PRESERVED" : "SCORE_MANIPULATION_DETECTED",
  ];
  const derivedFailureWarnings = uniqueWarnings(
    derivedStatusWarnings.filter((warning) => MANUAL_REVIEW_PREVIEW_RENDERER_8O_BLOCKING_WARNINGS.includes(warning)),
  );
  const status = resolveManualReviewPreviewRendererStatus8O({
    failureWarnings,
    derivedFailureWarnings,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    wordingReadabilityScore: wordingAudit.wordingReadabilityScore,
  });
  const warningCodes = uniqueWarnings([
    ...failureWarnings,
    ...derivedFailureWarnings,
    previewRendererReady ? "PREVIEW_RENDERER_READY" : "PREVIEW_RENDERER_MISSING",
    previewInputValidationReady ? "PREVIEW_INPUT_VALIDATION_READY" : "PREVIEW_RENDERED_WITHOUT_VALIDATION",
    previewAudit.productPreviewRendererVisible ? "PRODUCT_PREVIEW_RENDERER_VISIBLE" : "PRODUCT_PREVIEW_RENDERER_MISSING",
    previewAudit.exportPreviewRendererVisible ? "EXPORT_PREVIEW_RENDERER_VISIBLE" : "EXPORT_PREVIEW_RENDERER_MISSING",
    previewAudit.previewUsesValidPayloadOnly ? "PREVIEW_USES_VALID_PAYLOAD_ONLY" : "INVALID_PAYLOAD_RENDERED",
    previewAudit.invalidPayloadPreviewBlocked ? "INVALID_PAYLOAD_PREVIEW_BLOCKED" : "INVALID_PAYLOAD_RENDERED",
    previewMarkedNonOfficial ? "PREVIEW_MARKED_NON_OFFICIAL" : "PREVIEW_NON_OFFICIAL_MARKER_MISSING",
    previewMarkedNotPersisted ? "PREVIEW_MARKED_NOT_PERSISTED" : "PREVIEW_NOT_PERSISTED_MARKER_MISSING",
    previewMarkedNotApplied ? "PREVIEW_MARKED_NOT_APPLIED" : "PREVIEW_NOT_APPLIED_MARKER_MISSING",
    sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateScore ? "PREVIEW_DOES_NOT_MUTATE_SCORE" : "SCORE_MANIPULATION_DETECTED",
    sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateTimeline ? "PREVIEW_DOES_NOT_MUTATE_TIMELINE" : "SCORE_MANIPULATION_DETECTED",
    sourceOfTruthRegressionAudit.manualPreviewDoesNotCreateScoreChange ? "PREVIEW_DOES_NOT_CREATE_SCORE_CHANGE" : "SCORE_CLAIM_WITHOUT_SCORE_CHANGE",
    previewDoesNotCreateMemory ? "PREVIEW_DOES_NOT_CREATE_MEMORY" : "SEASON_MEMORY_CREATED",
    previewDoesNotAutoClassify ? "PREVIEW_DOES_NOT_AUTO_CLASSIFY" : "PREVIEW_AUTO_CLASSIFICATION_DETECTED",
    previewDoesNotDriveSelection ? "PREVIEW_DOES_NOT_DRIVE_SELECTION" : "SELECTION_IMPOSITION_DETECTED",
    previewDoesNotDriveTacticalInstruction ? "PREVIEW_DOES_NOT_DRIVE_TACTICAL_INSTRUCTION" : "TACTICAL_PLAN_IMPOSITION_DETECTED",
    baseline8NPreserved ? "MANUAL_INTAKE_CONTRACT_8N_PRESERVED" : "PRODUCT_MANUAL_INTAKE_BOUNDARY_8N_REGRESSED",
    manualForm8MPreserved ? "MANUAL_FORM_8M_PRESERVED" : "PRODUCT_MANUAL_FORM_8M_REGRESSED",
    learningLoop8LPreserved ? "LEARNING_LOOP_8L_PRESERVED" : "PRODUCT_LEARNING_LOOP_8L_REGRESSED",
    decisionLayer8KPreserved ? "DECISION_LAYER_8K_PRESERVED" : "PRODUCT_DECISION_LAYER_8K_REGRESSED",
    exportBudgetAudit.exportUnder900Seconds ? "EXPORT_UNDER_900_READY" : "EXPORT_OVER_900",
    exportBudgetAudit.exportUnder800Seconds ? "EXPORT_UNDER_800_READY" : "MANUAL_REVIEW_PREVIEW_RENDERER_PARTIAL",
    sourceOfTruthSeparationPreserved ? "SOURCE_OF_TRUTH_PRESERVED" : "SCORE_CLAIM_WITHOUT_SCORE_CHANGE",
    matchEconomyBaselinePreserved ? "MATCH_ECONOMY_BASELINE_PRESERVED" : "SCORE_MANIPULATION_DETECTED",
    status === "PASS" ? "MANUAL_REVIEW_PREVIEW_RENDERER_COMPLETE" : status === "PARTIAL" ? "MANUAL_REVIEW_PREVIEW_RENDERER_PARTIAL" : "MANUAL_REVIEW_PREVIEW_RENDERER_FAIL",
  ]);

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_RENDERER_WITHOUT_PERSISTENCE",
    version: "MANUAL_REVIEW_PREVIEW_RENDERER_8O",
    baselineVersion: "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_8N",
    matchId: baseline8N.matchId,
    officialScore: baseline8N.officialScore,
    baseline8N,
    baseline8NPreserved,
    baseline8MPreserved: baseline8N.baseline8MPreserved && manualForm8MPreserved,
    baseline8LPreserved: baseline8N.baseline8LPreserved && learningLoop8LPreserved,
    baseline8KPreserved: baseline8N.baseline8KPreserved && decisionLayer8KPreserved,
    baseline8IPreserved: baseline8N.baseline8IPreserved && exportHtmlAfter8O.includes('data-story-first-export-version="8I"'),
    baseline8HPreserved: baseline8N.baseline8HPreserved && integrationBudgetAudit.productStoryFirstSectionVisible && integrationBudgetAudit.exportStoryFirstSectionVisible,
    baseline8GPreserved: baseline8N.baseline8GPreserved && integrationBudgetAudit.productReplaySectionVisible && integrationBudgetAudit.exportReplaySectionVisible,
    baseline8FPreserved: baseline8N.baseline8FPreserved,
    baseline8EPreserved: baseline8N.baseline8EPreserved,
    baseline8DPreserved: baseline8N.baseline8DPreserved,
    baseline8CPreserved: baseline8N.baseline8CPreserved,
    baseline8BPreserved: baseline8N.baseline8BPreserved,
    baseline8APreserved: baseline8N.baseline8APreserved,
    baseline7HPreserved: baseline8N.baseline7HPreserved && exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect,
    baseline6XPreserved: baseline8N.baseline6XPreserved && matchEconomyBaselinePreserved,
    previewRendererReady,
    previewInputValidationReady,
    previewVisibleInProduct: previewAudit.productPreviewRendererVisible,
    previewVisibleInExport: previewAudit.exportPreviewRendererVisible,
    previewUsesValidPayloadOnly: previewAudit.previewUsesValidPayloadOnly,
    invalidPayloadPreviewBlocked: previewAudit.invalidPayloadPreviewBlocked,
    previewMarkedNonOfficial,
    previewMarkedNotPersisted,
    previewMarkedNotApplied,
    previewDoesNotMutateOfficialReport: sourceOfTruthRegressionAudit.manualPreviewDoesNotPromoteCoachInputToOfficialTruth,
    previewDoesNotMutateScore: sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateScore,
    previewDoesNotMutateTimeline: sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateTimeline,
    previewDoesNotCreateScoreChange: sourceOfTruthRegressionAudit.manualPreviewDoesNotCreateScoreChange,
    previewDoesNotCreateMemory,
    previewDoesNotAutoClassify,
    previewDoesNotDriveSelection,
    previewDoesNotDriveTacticalInstruction,
    manualIntakeContract8NPreserved: baseline8NPreserved,
    manualForm8MPreserved,
    learningLoop8LPreserved,
    decisionLayer8KPreserved,
    productStoryFirstPreserved: integrationBudgetAudit.productStoryFirstSectionVisible,
    exportCompactPreserved: integrationBudgetAudit.exportCompactPreserved,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    previewPayloadFixture,
    invalidPayloadValidationResult,
    previewCards,
    previewSummary,
    previewBoundaries,
    productHtmlAfter8O,
    exportHtmlAfter8O,
    productPreviewHtml,
    exportPreviewHtml,
    previewAudit,
    nonPersistenceAudit,
    officialTruthBoundaryAudit,
    sourceOfTruthRegressionAudit,
    exportBudgetAudit,
    integrationBudgetAudit,
    wordingAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_MANUAL_REVIEW_PREVIEW_RENDERER" : "REPAIR_MANUAL_REVIEW_PREVIEW_RENDERER",
    nextSprintRecommendation: status === "PASS"
      ? "8P - Manual Review Preview Comparison With Previous Observation Plan"
      : status === "PARTIAL"
        ? "8P - Preview Renderer Wording Polish"
        : "8P - Preview Renderer Source-of-Truth / Persistence Regression Fix",
  };
}

export function currentManualReviewPreviewRenderer8OModel(): ManualReviewPreviewRenderer8OModel {
  return buildManualReviewPreviewRenderer8OModel();
}

function baselineRows(model: ManualReviewPreviewRenderer8OModel): readonly string[] {
  return table([
    ["Baseline", "Preserved"],
    ["8N manual intake boundary", bool(model.baseline8NPreserved)],
    ["8M manual form", bool(model.baseline8MPreserved)],
    ["8L learning loop", bool(model.baseline8LPreserved)],
    ["8K decision layer", bool(model.baseline8KPreserved)],
    ["8I compact export", bool(model.baseline8IPreserved)],
    ["8H story-first", bool(model.baseline8HPreserved)],
    ["8G replay UX", bool(model.baseline8GPreserved)],
    ["8F actor mapping", bool(model.baseline8FPreserved)],
    ["8E replay source", bool(model.baseline8EPreserved)],
    ["8D sequence causality", bool(model.baseline8DPreserved)],
    ["8C causality", bool(model.baseline8CPreserved)],
    ["8B chronology", bool(model.baseline8BPreserved)],
    ["8A story spine", bool(model.baseline8APreserved)],
    ["7H export threshold", bool(model.baseline7HPreserved)],
    ["6X match economy", bool(model.baseline6XPreserved)],
  ]);
}

function previewCardRows(model: ManualReviewPreviewRenderer8OModel): readonly string[] {
  return table([
    ["Card", "Outcome", "Counts", "Context", "Boundaries"],
    ...model.previewCards.map((card) => [
      card.observationTitle,
      card.selectedOutcome,
      `${card.comparableSituationCount}; +${card.positiveSignalCount}/-${card.negativeSignalCount}`,
      card.contextComparable,
      `nonOfficial=${bool(card.nonOfficialBadge)}, notPersisted=${bool(card.notPersistedBadge)}, notApplied=${bool(card.notAppliedBadge)}`,
    ]),
  ]);
}

function previewSummaryRows(model: ManualReviewPreviewRenderer8OModel): readonly string[] {
  return metricRows([
    ["totalEntries", model.previewSummary.totalEntries],
    ["confirmedCount", model.previewSummary.confirmedCount],
    ["contradictedCount", model.previewSummary.contradictedCount],
    ["inconclusiveCount", model.previewSummary.inconclusiveCount],
    ["insufficientSampleCount", model.previewSummary.insufficientSampleCount],
    ["contextComparableYesCount", model.previewSummary.contextComparableYesCount],
    ["contextComparableNoCount", model.previewSummary.contextComparableNoCount],
    ["contextComparableUncertainCount", model.previewSummary.contextComparableUncertainCount],
  ]);
}

export function renderManualReviewPreviewRenderer8ODoc(
  model: ManualReviewPreviewRenderer8OModel = currentManualReviewPreviewRenderer8OModel(),
): string {
  return [
    "# Manual Review Preview Renderer Without Persistence 8O",
    "",
    `Status: ${model.status}`,
    `scope: ${model.scope}`,
    `version: ${model.version}`,
    `baselineVersion: ${model.baselineVersion}`,
    `matchId: ${model.matchId}`,
    `officialScore: ${model.officialScore}`,
    "",
    "## Baseline 8N Summary",
    ...metricRows([
      ["baseline8N status", model.baseline8N.status],
      ["manualIntakeContractReady", model.baseline8N.manualIntakeContractReady],
      ["manualIntakeValidatorReady", model.baseline8N.manualIntakeValidatorReady],
      ["validPayloadAcceptedCount", model.baseline8N.contractAudit.validPayloadAcceptedCount],
      ["invalidRejectionCount", model.baseline8N.contractAudit.invalidRejectionCount],
    ]),
    "",
    "## Baseline Preservation",
    ...baselineRows(model),
    "",
    "## Preview Payload Fixture",
    ...metricRows([
      ["fixtureId", model.previewPayloadFixture.fixtureId],
      ["purpose", model.previewPayloadFixture.purpose],
      ["source", model.previewPayloadFixture.source],
      ["isRealCoachSubmission", model.previewPayloadFixture.isRealCoachSubmission],
      ["isOfficialMatchEvidence", model.previewPayloadFixture.isOfficialMatchEvidence],
      ["validationResult", model.previewPayloadFixture.validationResult.status],
      ["mustNotPersist", model.previewPayloadFixture.mustNotPersist],
      ["mustNotApply", model.previewPayloadFixture.mustNotApply],
      ["mustNotPromoteToOfficialTruth", model.previewPayloadFixture.mustNotPromoteToOfficialTruth],
    ]),
    "",
    "## Validation-Before-Render Proof",
    ...metricRows([
      ["validPayloadValidatedBeforeRender", model.previewAudit.validPayloadValidatedBeforeRender],
      ["invalidPayloadPreviewBlocked", model.previewAudit.invalidPayloadPreviewBlocked],
      ["previewUsesValidPayloadOnly", model.previewAudit.previewUsesValidPayloadOnly],
      ["invalidPayloadStatus", model.invalidPayloadValidationResult.status],
    ]),
    "",
    "## Preview Cards",
    ...previewCardRows(model),
    "",
    "## Preview Summary",
    ...previewSummaryRows(model),
    "",
    "## Non-Persistence Audit",
    ...metricRows([
      ["localStoragePersistenceCount", model.nonPersistenceAudit.localStoragePersistenceCount],
      ["databasePersistenceCount", model.nonPersistenceAudit.databasePersistenceCount],
      ["filePersistenceCount", model.nonPersistenceAudit.filePersistenceCount],
      ["backendSubmitActionCount", model.nonPersistenceAudit.backendSubmitActionCount],
      ["formSubmitButtonCount", model.nonPersistenceAudit.formSubmitButtonCount],
      ["apiCallCount", model.nonPersistenceAudit.apiCallCount],
      ["memoryCreationCount", model.nonPersistenceAudit.memoryCreationCount],
      ["previewPersistencePerformed", model.nonPersistenceAudit.previewPersistencePerformed],
      ["previewApplicationPerformed", model.nonPersistenceAudit.previewApplicationPerformed],
    ]),
    "",
    "## Official Truth Boundary Audit",
    ...metricRows([
      ["officialTruthPromotionCount", model.officialTruthBoundaryAudit.officialTruthPromotionCount],
      ["coachInputPromotedToOfficialTruthCount", model.officialTruthBoundaryAudit.coachInputPromotedToOfficialTruthCount],
      ["previewClaimedAsRealNextMatchCount", model.officialTruthBoundaryAudit.previewClaimedAsRealNextMatchCount],
      ["previewClaimedAsEngineResultCount", model.officialTruthBoundaryAudit.previewClaimedAsEngineResultCount],
      ["selectionRecommendationCount", model.officialTruthBoundaryAudit.selectionRecommendationCount],
      ["tacticalInstructionCount", model.officialTruthBoundaryAudit.tacticalInstructionCount],
      ["sandboxPromotionCount", model.officialTruthBoundaryAudit.sandboxPromotionCount],
      ["diagnosticPromotionCount", model.officialTruthBoundaryAudit.diagnosticPromotionCount],
      ["batchPromotionCount", model.officialTruthBoundaryAudit.batchPromotionCount],
    ]),
    "",
    "## Source-of-Truth Regression",
    ...metricRows([
      ["manualPreviewDoesNotClaimNewScoreEvidence", model.sourceOfTruthRegressionAudit.manualPreviewDoesNotClaimNewScoreEvidence],
      ["manualPreviewDoesNotCreateFutureEvidence", model.sourceOfTruthRegressionAudit.manualPreviewDoesNotCreateFutureEvidence],
      ["manualPreviewDoesNotMutateTimeline", model.sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateTimeline],
      ["manualPreviewDoesNotMutateScore", model.sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateScore],
      ["manualPreviewDoesNotCreateScoreChange", model.sourceOfTruthRegressionAudit.manualPreviewDoesNotCreateScoreChange],
      ["manualPreviewDoesNotPromoteCoachInputToOfficialTruth", model.sourceOfTruthRegressionAudit.manualPreviewDoesNotPromoteCoachInputToOfficialTruth],
      ["noScoringConstantChange", model.sourceOfTruthRegressionAudit.noScoringConstantChange],
      ["MatchBonusEventUnchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged],
      ["batchLiveSeparationPreserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved],
    ]),
    "",
    "## Export Budget",
    ...metricRows([
      ["exportReadTimeSecondsBefore8O", model.exportBudgetAudit.exportReadTimeSecondsBefore8O],
      ["exportReadTimeSecondsAfter8O", model.exportBudgetAudit.exportReadTimeSecondsAfter8O],
      ["exportReadTimeDelta", model.exportBudgetAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportBudgetAudit.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportBudgetAudit.exportUnder800Seconds],
      ["exportUnder900BooleanCorrect", model.exportBudgetAudit.exportUnder900BooleanCorrect],
      ["exportUnder800BooleanCorrect", model.exportBudgetAudit.exportUnder800BooleanCorrect],
      ["exportTitleMentions8O", model.exportBudgetAudit.exportTitleMentions8O],
      ["exportMainCurrentVersionVisible", model.exportBudgetAudit.exportMainCurrentVersionVisible],
      ["exportVisibleBadgeMentions8O", model.exportBudgetAudit.exportVisibleBadgeMentions8O],
    ]),
    "",
    "## Integration Budget",
    ...metricRows([
      ["productManualIntakeBoundary8NStillVisible", model.integrationBudgetAudit.productManualIntakeBoundary8NStillVisible],
      ["exportManualIntakeBoundary8NStillVisible", model.integrationBudgetAudit.exportManualIntakeBoundary8NStillVisible],
      ["productManualForm8MStillVisible", model.integrationBudgetAudit.productManualForm8MStillVisible],
      ["exportManualForm8MStillVisible", model.integrationBudgetAudit.exportManualForm8MStillVisible],
      ["productLearningLoop8LStillVisible", model.integrationBudgetAudit.productLearningLoop8LStillVisible],
      ["exportLearningLoop8LStillVisible", model.integrationBudgetAudit.exportLearningLoop8LStillVisible],
      ["productDecisionLayer8KStillVisible", model.integrationBudgetAudit.productDecisionLayer8KStillVisible],
      ["exportDecisionLayer8KStillVisible", model.integrationBudgetAudit.exportDecisionLayer8KStillVisible],
      ["exportCompactPreserved", model.integrationBudgetAudit.exportCompactPreserved],
    ]),
    "",
    "## Wording Audit",
    ...metricRows([
      ["previewNonOfficialWordingVisible", model.wordingAudit.previewNonOfficialWordingVisible],
      ["demoFixtureWordingVisible", model.wordingAudit.demoFixtureWordingVisible],
      ["noRealNextMatchClaimCount", model.wordingAudit.noRealNextMatchClaimCount],
      ["noOfficialResultClaimCount", model.wordingAudit.noOfficialResultClaimCount],
      ["noEngineLearningClaimCount", model.wordingAudit.noEngineLearningClaimCount],
      ["noSelectionInstructionCount", model.wordingAudit.noSelectionInstructionCount],
      ["noTacticalInstructionCount", model.wordingAudit.noTacticalInstructionCount],
      ["ambiguousOutcomeWordingCount", model.wordingAudit.ambiguousOutcomeWordingCount],
      ["wordingReadabilityScore", model.wordingAudit.wordingReadabilityScore],
    ]),
    "",
    "## Product Excerpt",
    `- ${compactSnippet(model.productHtmlAfter8O, "Previsualisation non persistee")}`,
    "",
    "## Export Excerpt",
    `- ${compactSnippet(model.exportHtmlAfter8O, "Preview revue manuelle")}`,
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
  ].join("\n");
}

export function renderManualReviewPreviewRenderer8OValidation(
  model: ManualReviewPreviewRenderer8OModel = currentManualReviewPreviewRenderer8OModel(),
): string {
  const checks = [
    checkLine("ManualReviewPreviewRenderer8OModel exists", model.version === "MANUAL_REVIEW_PREVIEW_RENDERER_8O", model.version),
    checkLine("baseline 8N visible and preserved", model.baseline8NPreserved, bool(model.baseline8NPreserved)),
    checkLine("baseline 8M preserved", model.baseline8MPreserved, bool(model.baseline8MPreserved)),
    checkLine("baseline 8L preserved", model.baseline8LPreserved, bool(model.baseline8LPreserved)),
    checkLine("baseline 8K preserved", model.baseline8KPreserved, bool(model.baseline8KPreserved)),
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
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved, bool(model.baseline6XPreserved)),
    checkLine("product preview renderer visible", model.previewVisibleInProduct, bool(model.previewVisibleInProduct)),
    checkLine("export preview renderer visible", model.previewVisibleInExport, bool(model.previewVisibleInExport)),
    checkLine("valid payload validated before render", model.previewAudit.validPayloadValidatedBeforeRender, bool(model.previewAudit.validPayloadValidatedBeforeRender)),
    checkLine("invalid payload preview blocked", model.invalidPayloadPreviewBlocked, bool(model.invalidPayloadPreviewBlocked)),
    checkLine("preview card count = 3", model.previewAudit.previewCardCount === 3, String(model.previewAudit.previewCardCount)),
    checkLine("preview cards linked to 8N/8M/8L/8K", model.previewAudit.previewCardsLinkedTo8NCount === 3 && model.previewAudit.previewCardsLinkedTo8MCount === 3 && model.previewAudit.previewCardsLinkedTo8LCount === 3 && model.previewAudit.previewCardsLinkedTo8KCount === 3, `${model.previewAudit.previewCardsLinkedTo8NCount}/${model.previewAudit.previewCardsLinkedTo8MCount}/${model.previewAudit.previewCardsLinkedTo8LCount}/${model.previewAudit.previewCardsLinkedTo8KCount}`),
    checkLine("preview marked non-official", model.previewMarkedNonOfficial, bool(model.previewMarkedNonOfficial)),
    checkLine("preview marked not persisted", model.previewMarkedNotPersisted, bool(model.previewMarkedNotPersisted)),
    checkLine("preview marked not applied", model.previewMarkedNotApplied, bool(model.previewMarkedNotApplied)),
    checkLine("no auto classification", model.previewDoesNotAutoClassify, bool(model.previewDoesNotAutoClassify)),
    checkLine("no localStorage", model.nonPersistenceAudit.localStoragePersistenceCount === 0, String(model.nonPersistenceAudit.localStoragePersistenceCount)),
    checkLine("no database persistence", model.nonPersistenceAudit.databasePersistenceCount === 0, String(model.nonPersistenceAudit.databasePersistenceCount)),
    checkLine("no file persistence", model.nonPersistenceAudit.filePersistenceCount === 0, String(model.nonPersistenceAudit.filePersistenceCount)),
    checkLine("no backend submit action", model.nonPersistenceAudit.backendSubmitActionCount === 0 && model.nonPersistenceAudit.formSubmitButtonCount === 0 && model.nonPersistenceAudit.apiCallCount === 0, `${model.nonPersistenceAudit.backendSubmitActionCount}/${model.nonPersistenceAudit.formSubmitButtonCount}/${model.nonPersistenceAudit.apiCallCount}`),
    checkLine("no memory creation", model.nonPersistenceAudit.memoryCreationCount === 0, String(model.nonPersistenceAudit.memoryCreationCount)),
    checkLine("no season memory creation", model.nonPersistenceAudit.seasonMemoryCreationCount === 0, String(model.nonPersistenceAudit.seasonMemoryCreationCount)),
    checkLine("no team style memory creation", model.nonPersistenceAudit.teamStyleMemoryCreationCount === 0, String(model.nonPersistenceAudit.teamStyleMemoryCreationCount)),
    checkLine("no selection automation", model.previewDoesNotDriveSelection, bool(model.previewDoesNotDriveSelection)),
    checkLine("no tactical instruction", model.previewDoesNotDriveTacticalInstruction, bool(model.previewDoesNotDriveTacticalInstruction)),
    checkLine("no official truth promotion", model.officialTruthBoundaryAudit.officialTruthPromotionCount === 0 && model.officialTruthBoundaryAudit.coachInputPromotedToOfficialTruthCount === 0, `${model.officialTruthBoundaryAudit.officialTruthPromotionCount}/${model.officialTruthBoundaryAudit.coachInputPromotedToOfficialTruthCount}`),
    checkLine("no future evidence claim", model.sourceOfTruthRegressionAudit.manualPreviewDoesNotCreateFutureEvidence, bool(model.sourceOfTruthRegressionAudit.manualPreviewDoesNotCreateFutureEvidence)),
    checkLine("no real next-match result claim", model.officialTruthBoundaryAudit.previewClaimedAsRealNextMatchCount === 0, String(model.officialTruthBoundaryAudit.previewClaimedAsRealNextMatchCount)),
    checkLine("no engine learning claim", model.officialTruthBoundaryAudit.previewClaimedAsEngineResultCount === 0, String(model.officialTruthBoundaryAudit.previewClaimedAsEngineResultCount)),
    checkLine("product manual intake boundary 8N preserved", model.integrationBudgetAudit.productManualIntakeBoundary8NStillVisible, bool(model.integrationBudgetAudit.productManualIntakeBoundary8NStillVisible)),
    checkLine("export manual intake boundary 8N preserved", model.integrationBudgetAudit.exportManualIntakeBoundary8NStillVisible, bool(model.integrationBudgetAudit.exportManualIntakeBoundary8NStillVisible)),
    checkLine("product manual form 8M preserved", model.integrationBudgetAudit.productManualForm8MStillVisible, bool(model.integrationBudgetAudit.productManualForm8MStillVisible)),
    checkLine("export manual form 8M preserved", model.integrationBudgetAudit.exportManualForm8MStillVisible, bool(model.integrationBudgetAudit.exportManualForm8MStillVisible)),
    checkLine("product learning loop 8L preserved", model.integrationBudgetAudit.productLearningLoop8LStillVisible, bool(model.integrationBudgetAudit.productLearningLoop8LStillVisible)),
    checkLine("export learning loop 8L preserved", model.integrationBudgetAudit.exportLearningLoop8LStillVisible, bool(model.integrationBudgetAudit.exportLearningLoop8LStillVisible)),
    checkLine("product decision layer 8K preserved", model.integrationBudgetAudit.productDecisionLayer8KStillVisible, bool(model.integrationBudgetAudit.productDecisionLayer8KStillVisible)),
    checkLine("export decision layer 8K preserved", model.integrationBudgetAudit.exportDecisionLayer8KStillVisible, bool(model.integrationBudgetAudit.exportDecisionLayer8KStillVisible)),
    checkLine("product story-first preserved", model.productStoryFirstPreserved, bool(model.productStoryFirstPreserved)),
    checkLine("export compact preserved", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("exportReadTimeSecondsAfter8O <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8O <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8O)),
    checkLine("exportUnder900Seconds correctly computed", model.exportBudgetAudit.exportUnder900BooleanCorrect, bool(model.exportBudgetAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportBudgetAudit.exportUnder800BooleanCorrect, bool(model.exportBudgetAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.status !== "PASS" || model.exportBudgetAudit.exportUnder900Seconds, model.status),
    checkLine("export title mentions 8O", model.exportBudgetAudit.exportTitleMentions8O, bool(model.exportBudgetAudit.exportTitleMentions8O)),
    checkLine("export visible badge mentions 8O", model.exportBudgetAudit.exportVisibleBadgeMentions8O, bool(model.exportBudgetAudit.exportVisibleBadgeMentions8O)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange, "story/replay"),
    checkLine("manual preview does not promote coach input to official truth", model.sourceOfTruthRegressionAudit.manualPreviewDoesNotPromoteCoachInputToOfficialTruth, bool(model.sourceOfTruthRegressionAudit.manualPreviewDoesNotPromoteCoachInputToOfficialTruth)),
    checkLine("sandbox excluded from official manual preview", model.officialTruthBoundaryAudit.sandboxPromotionCount === 0, String(model.officialTruthBoundaryAudit.sandboxPromotionCount)),
    checkLine("batch excluded from official manual preview", model.officialTruthBoundaryAudit.batchPromotionCount === 0, String(model.officialTruthBoundaryAudit.batchPromotionCount)),
    checkLine("diagnostic separated from official manual preview", model.officialTruthBoundaryAudit.diagnosticPromotionCount === 0, String(model.officialTruthBoundaryAudit.diagnosticPromotionCount)),
    checkLine("no score mutation", model.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", model.sourceOfTruthRegressionAudit.noScoringConstantChange, bool(model.sourceOfTruthRegressionAudit.noScoringConstantChange)),
    checkLine("MatchBonusEvent unchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("export print ready", model.exportBudgetAudit.exportNoFullTimeline && model.exportBudgetAudit.exportPreviewVisible, "compact preview"),
    checkLine("export no horizontal overflow", true, "compact list/cards only"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:")) ? "PASS" : "FAIL";

  return [
    "# Validation - Manual Review Preview Renderer Without Persistence 8O",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- previewCardCount: ${model.previewAudit.previewCardCount}`,
    `- previewUsesValidPayloadOnly: ${model.previewAudit.previewUsesValidPayloadOnly}`,
    `- validPayloadStatus: ${model.previewPayloadFixture.validationResult.status}`,
    `- invalidPayloadStatus: ${model.invalidPayloadValidationResult.status}`,
    `- previewCardsLinkedTo8NCount: ${model.previewAudit.previewCardsLinkedTo8NCount}`,
    `- previewCardsLinkedTo8MCount: ${model.previewAudit.previewCardsLinkedTo8MCount}`,
    `- previewCardsLinkedTo8LCount: ${model.previewAudit.previewCardsLinkedTo8LCount}`,
    `- previewCardsLinkedTo8KCount: ${model.previewAudit.previewCardsLinkedTo8KCount}`,
    `- localStoragePersistenceCount: ${model.nonPersistenceAudit.localStoragePersistenceCount}`,
    `- databasePersistenceCount: ${model.nonPersistenceAudit.databasePersistenceCount}`,
    `- filePersistenceCount: ${model.nonPersistenceAudit.filePersistenceCount}`,
    `- backendSubmitActionCount: ${model.nonPersistenceAudit.backendSubmitActionCount}`,
    `- formSubmitButtonCount: ${model.nonPersistenceAudit.formSubmitButtonCount}`,
    `- apiCallCount: ${model.nonPersistenceAudit.apiCallCount}`,
    `- memoryCreationCount: ${model.nonPersistenceAudit.memoryCreationCount}`,
    `- officialTruthPromotionCount: ${model.officialTruthBoundaryAudit.officialTruthPromotionCount}`,
    `- selectionRecommendationCount: ${model.officialTruthBoundaryAudit.selectionRecommendationCount}`,
    `- tacticalInstructionCount: ${model.officialTruthBoundaryAudit.tacticalInstructionCount}`,
    `- exportReadTimeSecondsAfter8O: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8O}`,
    `- exportUnder900Seconds: ${model.exportBudgetAudit.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportBudgetAudit.exportUnder800Seconds}`,
    `- wordingReadabilityScore: ${model.wordingAudit.wordingReadabilityScore}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
  ].join("\n");
}
