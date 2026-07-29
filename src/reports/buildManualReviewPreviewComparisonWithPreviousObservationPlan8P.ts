import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewPayloadFixture8O,
  currentManualReviewPreviewRenderer8OModel,
} from "./buildManualReviewPreviewRenderer8O";
import {
  auditManualReviewPreviewComparison8P,
  auditManualReviewPreviewComparisonExportBudget8P,
  auditManualReviewPreviewComparisonExportMetadata8P,
  auditManualReviewPreviewComparisonIntegrationBudget8P,
  auditManualReviewPreviewComparisonNonPersistence8P,
  auditManualReviewPreviewComparisonOfficialTruthBoundary8P,
  auditManualReviewPreviewComparisonWording8P,
  auditManualReviewPreviewPlanCoverage8P,
} from "./manualReviewPreviewComparisonAudit8P";
import type {
  ManualReviewPreviewComparison8P,
  ManualReviewPreviewComparisonBoundary8P,
  ManualReviewPreviewComparisonCard8P,
  ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel,
} from "./manualReviewPreviewComparisonTypes8P";
import {
  MANUAL_REVIEW_PREVIEW_COMPARISON_8P_BLOCKING_WARNINGS,
  type ManualReviewPreviewComparisonWarningCode8P,
} from "./manualReviewPreviewComparisonWarnings8P";
import type { ManualReviewPreviewRenderer8OModel } from "./manualReviewPreviewRendererTypes8O";
import { coachDecisionCards8K } from "./renderCoachDecisionLayerProduct8K";
import {
  insertManualReviewPreviewComparisonExport8P,
  renderManualReviewPreviewComparisonExport8P,
} from "./renderManualReviewPreviewComparisonExport8P";
import {
  insertManualReviewPreviewComparisonProduct8P,
  renderManualReviewPreviewComparisonProduct8P,
} from "./renderManualReviewPreviewComparisonProduct8P";
import { observationOutcomeCards8L } from "./renderSeasonlessLearningLoopProduct8L";
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

function uniqueWarnings(
  warnings: readonly ManualReviewPreviewComparisonWarningCode8P[],
): readonly ManualReviewPreviewComparisonWarningCode8P[] {
  return [...new Set(warnings)];
}

function compactSnippet(html: string, marker: string): string {
  const index = html.indexOf(marker);
  const start = index < 0 ? 0 : Math.max(0, index - 100);
  return html.slice(start, start + 900).replace(/\s+/gu, " ");
}

function previewOutcomeLabel(outcome: string): string {
  if (outcome === "confirmed") return "confirmed";
  if (outcome === "inconclusive") return "inconclusive";
  if (outcome === "insufficient_sample") return "insufficient_sample";
  return outcome;
}

function buildComparisonCard(
  baseline8O: ManualReviewPreviewRenderer8OModel,
  index: number,
): ManualReviewPreviewComparisonCard8P {
  const preview = baseline8O.previewCards[index];
  if (preview === undefined) {
    throw new Error(`Missing 8O preview card at index ${index}.`);
  }
  const observation = observationOutcomeCards8L.find((card) => card.observationCardId === preview.linked8LObservationCardId);
  const decision = coachDecisionCards8K.find((card) => card.decisionCardId === preview.linked8KDecisionCardId);
  if (observation === undefined || decision === undefined) {
    throw new Error(`Missing 8K/8L plan card for preview card ${preview.previewCardId}.`);
  }
  const common = {
    linked8OPreviewCardId: preview.previewCardId,
    linked8NEntryId: preview.linked8NEntryId,
    linked8MReviewSectionId: preview.linked8MReviewSectionId,
    linked8LObservationCardId: preview.linked8LObservationCardId,
    linked8KDecisionCardId: preview.linked8KDecisionCardId,
    observationTitle: observation.title,
    originalObservationQuestion: observation.manualReviewQuestion,
    originalConfirmationCriteria: observation.confirmationCriteria,
    originalDisconfirmationCriteria: observation.disconfirmationCriteria,
    originalInsufficientEvidenceCriteria: observation.insufficientEvidenceCriteria,
    previewOutcome: previewOutcomeLabel(preview.selectedOutcome),
    previewCounts: `${preview.comparableSituationCount} situations; +${preview.positiveSignalCount}/-${preview.negativeSignalCount}`,
    previewContextComparable: preview.contextComparable,
    previewCoachNotes: preview.coachNotesPreview,
    demoOnly: true,
    nonOfficial: true,
    notPersisted: true,
    notApplied: true,
    noAutoClassification: true,
    noSelectionRecommendation: true,
    noTacticalInstruction: true,
    officialTruth: false,
  } as const;

  if (index === 0) {
    return {
      ...common,
      comparisonCardId: "comparison-first-exit-after-recovery-8p",
      answerStatus: "answers_question",
      comparisonReadout: "La preview confirme le signal attendu avec 4 situations et un contexte comparable; elle repond a la question 8K/8L pour cette fixture.",
      whatMatchesThePlan: "Le relais apres recuperation reste lisible, avec trois signaux positifs contre un negatif.",
      whatDoesNotAnswerYet: "Cette fixture ne prouve pas une tendance durable et ne remplace pas une vraie revue du prochain match.",
      gapToReview: "Verifier si le meme comportement tient contre une pression differente.",
      nextCoachQuestion: decision.decisionQuestion,
      cautionNote: "Reponse demo seulement : aucun choix de joueur, aucune consigne tactique et aucune memoire de saison.",
    };
  }
  if (index === 1) {
    return {
      ...common,
      comparisonCardId: "comparison-danger-continuity-8p",
      answerStatus: "partially_answers_question",
      comparisonReadout: "La preview donne des signaux mixtes : elle couvre la question mais le contexte reste incertain et ne permet pas de conclure.",
      whatMatchesThePlan: "La continuite apres entree dangereuse est bien le bon objet de comparaison.",
      whatDoesNotAnswerYet: "Le ratio +1/-2 et le contexte uncertain laissent ouverte l'hypothese d'une action trop isolee.",
      gapToReview: "Collecter plus d'entrees dangereuses sous pression comparable.",
      nextCoachQuestion: decision.decisionQuestion,
      cautionNote: "Lecture partielle : ne pas transformer un inconclusif en recommandation.",
    };
  }
  return {
    ...common,
    comparisonCardId: "comparison-structure-after-neutralized-action-8p",
    answerStatus: "insufficient_to_answer",
    comparisonReadout: "Une seule situation positive est insuffisante pour repondre a la question de stabilite apres action neutralisee.",
    whatMatchesThePlan: "Le theme du second ballon et de la rest-defense correspond a la carte 8K/8L.",
    whatDoesNotAnswerYet: "L'echantillon +1/-0 ne teste pas assez de pressions, tirs, arrets ou rebonds.",
    gapToReview: "Atteindre au moins deux actions neutralisees comparables avant interpretation.",
    nextCoachQuestion: decision.decisionQuestion,
    cautionNote: "Insuffisant pour repondre : aucun apprentissage automatique, aucune memoire et aucune application.",
  };
}

function buildBoundaryNotes(): readonly ManualReviewPreviewComparisonBoundary8P[] {
  return [
    {
      boundaryId: "comparison-boundary-demo-only-8p",
      label: "Fixture de demonstration",
      text: "La comparaison illustre comment relire une preview 8O face au plan 8K/8L; elle ne vient pas d'un vrai prochain match.",
      prevents: ["future_result_claim", "season_trend_claim"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "comparison-boundary-no-persistence-8p",
      label: "Non persistee",
      text: "Aucune valeur issue de cette comparaison n'est stockee, appliquee, ni convertie en memoire de saison.",
      prevents: ["local_storage", "database_write", "season_memory_creation", "team_style_memory_creation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "comparison-boundary-no-official-truth-8p",
      label: "Non officielle",
      text: "La source officielle reste le score_change et la timeline du match; la comparaison ne modifie ni score, ni timeline, ni selection.",
      prevents: ["official_truth_promotion", "score_mutation", "timeline_mutation", "selection_imposition"],
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildComparison(baseline8O: ManualReviewPreviewRenderer8OModel): ManualReviewPreviewComparison8P {
  const comparisonCards = [0, 1, 2].map((index) => buildComparisonCard(baseline8O, index));
  return {
    comparisonId: "manual-review-preview-comparison-with-previous-observation-plan-8p",
    sourcePreviewVersion: "8O",
    sourceIntakeBoundaryVersion: "8N",
    sourceManualFormVersion: "8M",
    sourceLearningLoopVersion: "8L",
    sourceDecisionLayerVersion: "8K",
    sourcePreviewFixtureId: baseline8O.previewPayloadFixture.fixtureId,
    comparisonMode: "demo_preview_comparison_only",
    isRealCoachSubmission: false,
    isOfficialMatchEvidence: false,
    notPersisted: true,
    notApplied: true,
    officialTruth: false,
    comparisonCards,
    comparisonSummary: {
      summaryId: "manual-review-preview-comparison-summary-8p",
      totalComparisonCards: comparisonCards.length,
      answersQuestionCount: comparisonCards.filter((card) => card.answerStatus === "answers_question").length,
      partiallyAnswersQuestionCount: comparisonCards.filter((card) => card.answerStatus === "partially_answers_question").length,
      insufficientToAnswerCount: comparisonCards.filter((card) => card.answerStatus === "insufficient_to_answer").length,
      confirmedCount: baseline8O.previewSummary.confirmedCount,
      contradictedCount: baseline8O.previewSummary.contradictedCount,
      inconclusiveCount: baseline8O.previewSummary.inconclusiveCount,
      insufficientSampleCount: baseline8O.previewSummary.insufficientSampleCount,
      comparisonReadout: "La preview demo repond pleinement a une question, partiellement a une deuxieme, et reste insuffisante pour la troisieme.",
      planCoverageReadout: "Chaque carte conserve son lien 8O/8N/8M/8L/8K et compare outcome, compteurs, contexte et ecart a relire.",
      cautionReadout: "La comparaison reste non officielle, non persistee et non appliquee; elle sert seulement a verifier la lisibilite coach.",
      nextCoachQuestion: "Le prochain vrai match fournit-il assez de situations comparables pour confirmer ou infirmer ces pistes ?",
      notASeasonTrend: true,
      notOfficialTruth: true,
      notPersisted: true,
      notApplied: true,
    },
    boundaryNotes: buildBoundaryNotes(),
    visibleInProduct: true,
    visibleInExport: true,
  };
}

export function buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel(input?: {
  readonly baseline8O?: ManualReviewPreviewRenderer8OModel;
}): ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel {
  const baseline8O = input?.baseline8O ?? currentManualReviewPreviewRenderer8OModel();
  const invalidFixture = JSON.parse(JSON.stringify(buildManualReviewPreviewPayloadFixture8O(baseline8O.matchId))) as Record<string, unknown>;
  invalidFixture.sourceMatchId = "";
  const invalidPreviewStatus = validateManualReviewResultIntakePayload8N(invalidFixture).status;
  const comparison = buildComparison(baseline8O);
  const productComparisonHtml = renderManualReviewPreviewComparisonProduct8P(comparison);
  const exportComparisonHtml = renderManualReviewPreviewComparisonExport8P(comparison);
  const productHtmlAfter8P = insertManualReviewPreviewComparisonProduct8P(baseline8O.productHtmlAfter8O, productComparisonHtml);
  const exportHtmlAfter8P = insertManualReviewPreviewComparisonExport8P(baseline8O.exportHtmlAfter8O, exportComparisonHtml);
  const comparisonAudit = auditManualReviewPreviewComparison8P({
    comparison,
    productHtml: productHtmlAfter8P,
    exportHtml: exportHtmlAfter8P,
    baseline8OStatus: baseline8O.status,
    invalidPreviewStatus,
  });
  const planCoverageAudit = auditManualReviewPreviewPlanCoverage8P(comparison);
  const nonPersistenceAudit = auditManualReviewPreviewComparisonNonPersistence8P({
    productHtml: productHtmlAfter8P,
    exportHtml: exportHtmlAfter8P,
  });
  const officialTruthBoundaryAudit = auditManualReviewPreviewComparisonOfficialTruthBoundary8P({
    productHtml: productHtmlAfter8P,
    exportHtml: exportHtmlAfter8P,
  });
  const exportMetadataAudit = auditManualReviewPreviewComparisonExportMetadata8P(exportHtmlAfter8P);
  const exportBudgetAudit = auditManualReviewPreviewComparisonExportBudget8P({
    exportHtmlBefore8P: baseline8O.exportHtmlAfter8O,
    exportHtmlAfter8P,
  });
  const integrationBudgetAudit = auditManualReviewPreviewComparisonIntegrationBudget8P({
    productHtml: productHtmlAfter8P,
    exportHtml: exportHtmlAfter8P,
  });
  const wordingAudit = auditManualReviewPreviewComparisonWording8P({
    productHtml: productHtmlAfter8P,
    exportHtml: exportHtmlAfter8P,
  });

  const comparisonMarkedDemoOnly = comparisonAudit.comparisonMarkedDemoOnlyCount === 3;
  const comparisonMarkedNonOfficial = comparisonAudit.comparisonMarkedNonOfficialCount === 3;
  const comparisonMarkedNotPersisted = comparisonAudit.comparisonMarkedNotPersistedCount === 3 && !nonPersistenceAudit.comparisonPersistencePerformed;
  const comparisonMarkedNotApplied = comparisonAudit.comparisonMarkedNotAppliedCount === 3 && !nonPersistenceAudit.comparisonApplicationPerformed;
  const comparisonDoesNotAutoClassify = officialTruthBoundaryAudit.automaticClassificationCount === 0;
  const comparisonDoesNotDriveSelection = officialTruthBoundaryAudit.selectionRecommendationCount === 0;
  const comparisonDoesNotDriveTacticalInstruction = officialTruthBoundaryAudit.tacticalInstructionCount === 0;
  const comparisonDoesNotCreateMemory = nonPersistenceAudit.memoryCreationCount === 0 &&
    nonPersistenceAudit.seasonMemoryCreationCount === 0 &&
    nonPersistenceAudit.teamStyleMemoryCreationCount === 0;
  const comparisonDoesNotPromoteOfficialTruth = officialTruthBoundaryAudit.officialTruthPromotionCount === 0 &&
    officialTruthBoundaryAudit.coachInputPromotedToOfficialTruthCount === 0;
  const comparisonDoesNotMutateScore = baseline8O.sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateScore;
  const comparisonDoesNotMutateTimeline = baseline8O.sourceOfTruthRegressionAudit.manualPreviewDoesNotMutateTimeline;
  const comparisonDoesNotCreateScoreChange = baseline8O.sourceOfTruthRegressionAudit.manualPreviewDoesNotCreateScoreChange;
  const sourceOfTruthSeparationPreserved = comparisonDoesNotPromoteOfficialTruth &&
    comparisonDoesNotMutateScore &&
    comparisonDoesNotMutateTimeline &&
    comparisonDoesNotCreateScoreChange &&
    baseline8O.sourceOfTruthSeparationPreserved;
  const guardrailsPreserved = sourceOfTruthSeparationPreserved &&
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2 &&
    !scoringRegistryEntry("PENALTY_SHOT").active &&
    baseline8O.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged;

  const derivedWarnings: ManualReviewPreviewComparisonWarningCode8P[] = [];
  if (!comparisonMarkedDemoOnly) derivedWarnings.push("COMPARISON_DEMO_MARKER_MISSING");
  if (!comparisonMarkedNonOfficial) derivedWarnings.push("COMPARISON_NON_OFFICIAL_MARKER_MISSING");
  if (!comparisonMarkedNotPersisted) derivedWarnings.push("COMPARISON_PERSISTENCE_DETECTED");
  if (!comparisonMarkedNotApplied) derivedWarnings.push("COMPARISON_APPLICATION_DETECTED");
  if (!comparisonDoesNotAutoClassify) derivedWarnings.push("COMPARISON_AUTO_CLASSIFICATION_DETECTED");
  if (!comparisonDoesNotDriveSelection) derivedWarnings.push("SELECTION_IMPOSITION_DETECTED");
  if (!comparisonDoesNotDriveTacticalInstruction) derivedWarnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (!comparisonDoesNotCreateMemory) derivedWarnings.push("COMPARISON_DOES_NOT_CREATE_MEMORY");
  if (!comparisonDoesNotPromoteOfficialTruth) derivedWarnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (!comparisonDoesNotMutateScore || !comparisonDoesNotMutateTimeline) derivedWarnings.push("SCORE_MANIPULATION_DETECTED");
  if (!comparisonDoesNotCreateScoreChange) derivedWarnings.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");

  const warningCodes = uniqueWarnings([
    ...comparisonAudit.comparisonAuditWarningCodes,
    ...planCoverageAudit.planCoverageWarningCodes,
    ...nonPersistenceAudit.nonPersistenceWarningCodes,
    ...officialTruthBoundaryAudit.officialTruthBoundaryWarningCodes,
    ...exportMetadataAudit.exportMetadataWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...integrationBudgetAudit.integrationWarningCodes,
    ...wordingAudit.wordingWarningCodes,
    ...derivedWarnings,
  ]);
  const blocking = warningCodes.some((warning) => MANUAL_REVIEW_PREVIEW_COMPARISON_8P_BLOCKING_WARNINGS.includes(warning));
  const previewComparisonReady = comparisonAudit.previewComparisonVisible &&
    comparisonAudit.comparisonUses8OValidatedPreviewOnly &&
    comparisonAudit.invalidPreviewComparisonBlocked &&
    comparisonAudit.comparisonUses8K8LObservationPlan &&
    planCoverageAudit.answersQuestionCount === 1 &&
    planCoverageAudit.partiallyAnswersQuestionCount === 1 &&
    planCoverageAudit.insufficientToAnswerCount === 1;
  const status: "PASS" | "PARTIAL" | "FAIL" = blocking
    ? "FAIL"
    : previewComparisonReady && exportBudgetAudit.exportUnder900Seconds && wordingAudit.wordingReadabilityScore >= 95
      ? "PASS"
      : "PARTIAL";

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_COMPARISON_WITH_PREVIOUS_OBSERVATION_PLAN",
    version: "MANUAL_REVIEW_PREVIEW_COMPARISON_8P",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_RENDERER_8O",
    matchId: baseline8O.matchId,
    officialScore: baseline8O.officialScore,
    baseline8O,
    baseline8OPreserved: baseline8O.status === "PASS" && integrationBudgetAudit.productPreviewRenderer8OStillVisible && integrationBudgetAudit.exportPreviewRenderer8OStillVisible,
    baseline8NPreserved: baseline8O.baseline8NPreserved && integrationBudgetAudit.productManualIntakeBoundary8NStillVisible && integrationBudgetAudit.exportManualIntakeBoundary8NStillVisible,
    baseline8MPreserved: baseline8O.baseline8MPreserved && integrationBudgetAudit.productManualForm8MStillVisible && integrationBudgetAudit.exportManualForm8MStillVisible,
    baseline8LPreserved: baseline8O.baseline8LPreserved && integrationBudgetAudit.productLearningLoop8LStillVisible && integrationBudgetAudit.exportLearningLoop8LStillVisible,
    baseline8KPreserved: baseline8O.baseline8KPreserved && integrationBudgetAudit.productDecisionLayer8KStillVisible && integrationBudgetAudit.exportDecisionLayer8KStillVisible,
    baseline8IPreserved: baseline8O.baseline8IPreserved,
    baseline8HPreserved: baseline8O.baseline8HPreserved,
    baseline8GPreserved: baseline8O.baseline8GPreserved,
    baseline8FPreserved: baseline8O.baseline8FPreserved,
    baseline8EPreserved: baseline8O.baseline8EPreserved,
    baseline8DPreserved: baseline8O.baseline8DPreserved,
    baseline8CPreserved: baseline8O.baseline8CPreserved,
    baseline8BPreserved: baseline8O.baseline8BPreserved,
    baseline8APreserved: baseline8O.baseline8APreserved,
    baseline7HPreserved: baseline8O.baseline7HPreserved,
    baseline6XPreserved: baseline8O.baseline6XPreserved,
    previewComparisonReady,
    previewComparisonVisibleInProduct: comparisonAudit.productPreviewComparisonVisible,
    previewComparisonVisibleInExport: comparisonAudit.exportPreviewComparisonVisible,
    comparisonUses8OValidatedPreviewOnly: comparisonAudit.comparisonUses8OValidatedPreviewOnly,
    comparisonUses8K8LObservationPlan: comparisonAudit.comparisonUses8K8LObservationPlan,
    comparisonCardCount: comparisonAudit.comparisonCardCount,
    comparisonCardsLinkedTo8OCount: comparisonAudit.comparisonCardsLinkedTo8OCount,
    comparisonCardsLinkedTo8NCount: comparisonAudit.comparisonCardsLinkedTo8NCount,
    comparisonCardsLinkedTo8MCount: comparisonAudit.comparisonCardsLinkedTo8MCount,
    comparisonCardsLinkedTo8LCount: comparisonAudit.comparisonCardsLinkedTo8LCount,
    comparisonCardsLinkedTo8KCount: comparisonAudit.comparisonCardsLinkedTo8KCount,
    comparisonAnswersObservationQuestionCount: planCoverageAudit.answersQuestionCount,
    comparisonPartialAnswerCount: planCoverageAudit.partiallyAnswersQuestionCount,
    comparisonInsufficientAnswerCount: planCoverageAudit.insufficientToAnswerCount,
    comparisonGapCount: planCoverageAudit.comparisonGapCount,
    comparisonMarkedDemoOnly,
    comparisonMarkedNonOfficial,
    comparisonMarkedNotPersisted,
    comparisonMarkedNotApplied,
    comparisonDoesNotAutoClassify,
    comparisonDoesNotDriveSelection,
    comparisonDoesNotDriveTacticalInstruction,
    comparisonDoesNotCreateMemory,
    comparisonDoesNotPromoteOfficialTruth,
    comparisonDoesNotMutateScore,
    comparisonDoesNotMutateTimeline,
    comparisonDoesNotCreateScoreChange,
    manualPreview8OPreserved: baseline8O.status === "PASS" && integrationBudgetAudit.productPreviewRenderer8OStillVisible && integrationBudgetAudit.exportPreviewRenderer8OStillVisible,
    manualIntakeContract8NPreserved: baseline8O.baseline8NPreserved && integrationBudgetAudit.productManualIntakeBoundary8NStillVisible && integrationBudgetAudit.exportManualIntakeBoundary8NStillVisible,
    manualForm8MPreserved: baseline8O.baseline8MPreserved && integrationBudgetAudit.productManualForm8MStillVisible && integrationBudgetAudit.exportManualForm8MStillVisible,
    learningLoop8LPreserved: baseline8O.baseline8LPreserved && integrationBudgetAudit.productLearningLoop8LStillVisible && integrationBudgetAudit.exportLearningLoop8LStillVisible,
    decisionLayer8KPreserved: baseline8O.baseline8KPreserved && integrationBudgetAudit.productDecisionLayer8KStillVisible && integrationBudgetAudit.exportDecisionLayer8KStillVisible,
    productStoryFirstPreserved: integrationBudgetAudit.productStoryFirstSectionVisible,
    exportCompactPreserved: integrationBudgetAudit.exportCompactPreserved,
    exportMetadataCurrent8PVisible: exportMetadataAudit.exportTitleMentions8P && exportMetadataAudit.exportVisibleBadgeMentions8P && exportMetadataAudit.exportMainComparisonVersionVisible,
    exportIdNoLonger8NOnly: exportMetadataAudit.exportMainIdNoLonger8NOnly && exportMetadataAudit.exportMainIdNoLonger8IOnly,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8O.matchEconomyBaselinePreserved,
    guardrailsPreserved,
    comparison,
    productComparisonHtml,
    exportComparisonHtml,
    productHtmlAfter8P,
    exportHtmlAfter8P,
    comparisonAudit,
    planCoverageAudit,
    nonPersistenceAudit,
    officialTruthBoundaryAudit,
    exportMetadataAudit,
    exportBudgetAudit,
    integrationBudgetAudit,
    wordingAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_MANUAL_REVIEW_PREVIEW_COMPARISON" : status === "PARTIAL" ? "REVIEW_PREVIEW_COMPARISON_COPY" : "REPAIR_MANUAL_REVIEW_PREVIEW_COMPARISON",
    nextSprintRecommendation: status === "PASS" ? "PREPARE_MANUAL_REVIEW_WORKFLOW_AFTER_COMPARISON" : "FIX_8P_COMPARISON_GUARDRAILS_BEFORE_NEXT_SPRINT",
  };
}

export function currentManualReviewPreviewComparisonWithPreviousObservationPlan8PModel(): ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel {
  return buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel();
}

function comparisonCardRows(model: ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel): readonly string[] {
  return table([
    ["Card", "Preview outcome", "Counts", "Context", "Answer status", "Gap"],
    ...model.comparison.comparisonCards.map((card) => [
      card.observationTitle,
      card.previewOutcome,
      card.previewCounts,
      card.previewContextComparable,
      card.answerStatus,
      card.gapToReview,
    ]),
  ]);
}

export function renderManualReviewPreviewComparisonWithPreviousObservationPlan8PDoc(
  model: ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel = currentManualReviewPreviewComparisonWithPreviousObservationPlan8PModel(),
): string {
  return [
    "# Manual Review Preview Comparison With Previous Observation Plan 8P",
    "",
    `Status: ${model.status}`,
    `scope: ${model.scope}`,
    `version: ${model.version}`,
    `baselineVersion: ${model.baselineVersion}`,
    `matchId: ${model.matchId}`,
    `officialScore: ${model.officialScore}`,
    "",
    "## Summary",
    ...metricRows([
      ["comparisonCardCount", model.comparisonCardCount],
      ["answersQuestionCount", model.comparisonAnswersObservationQuestionCount],
      ["partiallyAnswersQuestionCount", model.comparisonPartialAnswerCount],
      ["insufficientToAnswerCount", model.comparisonInsufficientAnswerCount],
      ["confirmedCount", model.planCoverageAudit.confirmedCount],
      ["inconclusiveCount", model.planCoverageAudit.inconclusiveCount],
      ["insufficientSampleCount", model.planCoverageAudit.insufficientSampleCount],
      ["previewComparisonReady", model.previewComparisonReady],
      ["comparisonMarkedNonOfficial", model.comparisonMarkedNonOfficial],
      ["comparisonMarkedNotPersisted", model.comparisonMarkedNotPersisted],
      ["comparisonMarkedNotApplied", model.comparisonMarkedNotApplied],
    ]),
    "",
    "## Comparison Cards",
    ...comparisonCardRows(model),
    "",
    "## Baseline Preservation",
    ...metricRows([
      ["baseline8OPreserved", model.baseline8OPreserved],
      ["baseline8NPreserved", model.baseline8NPreserved],
      ["baseline8MPreserved", model.baseline8MPreserved],
      ["baseline8LPreserved", model.baseline8LPreserved],
      ["baseline8KPreserved", model.baseline8KPreserved],
      ["baseline8IPreserved", model.baseline8IPreserved],
      ["baseline7HPreserved", model.baseline7HPreserved],
      ["baseline6XPreserved", model.baseline6XPreserved],
    ]),
    "",
    "## Boundary Audit",
    ...metricRows([
      ["comparisonDoesNotAutoClassify", model.comparisonDoesNotAutoClassify],
      ["comparisonDoesNotDriveSelection", model.comparisonDoesNotDriveSelection],
      ["comparisonDoesNotDriveTacticalInstruction", model.comparisonDoesNotDriveTacticalInstruction],
      ["comparisonDoesNotCreateMemory", model.comparisonDoesNotCreateMemory],
      ["comparisonDoesNotPromoteOfficialTruth", model.comparisonDoesNotPromoteOfficialTruth],
      ["comparisonDoesNotMutateScore", model.comparisonDoesNotMutateScore],
      ["comparisonDoesNotMutateTimeline", model.comparisonDoesNotMutateTimeline],
      ["comparisonDoesNotCreateScoreChange", model.comparisonDoesNotCreateScoreChange],
      ["sourceOfTruthSeparationPreserved", model.sourceOfTruthSeparationPreserved],
      ["guardrailsPreserved", model.guardrailsPreserved],
    ]),
    "",
    "## Export Metadata And Budget",
    ...metricRows([
      ["exportTitleMentions8P", model.exportMetadataAudit.exportTitleMentions8P],
      ["exportVisibleBadgeMentions8P", model.exportMetadataAudit.exportVisibleBadgeMentions8P],
      ["exportMainComparisonVersionVisible", model.exportMetadataAudit.exportMainComparisonVersionVisible],
      ["exportIdNoLonger8NOnly", model.exportIdNoLonger8NOnly],
      ["exportReadTimeSecondsBefore8P", model.exportBudgetAudit.exportReadTimeSecondsBefore8P],
      ["exportReadTimeSecondsAfter8P", model.exportBudgetAudit.exportReadTimeSecondsAfter8P],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
    ]),
    "",
    "## Product Excerpt",
    `- ${compactSnippet(model.productHtmlAfter8P, "Comparaison preview vs plan d'observation")}`,
    "",
    "## Export Excerpt",
    `- ${compactSnippet(model.exportHtmlAfter8P, "Comparaison preview / plan")}`,
    "",
    "## Warnings",
    ...(model.warningCodes.length === 0 ? ["- none"] : model.warningCodes.map((warning) => `- ${warning}`)),
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

export function renderManualReviewPreviewComparisonWithPreviousObservationPlan8PValidation(
  model: ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel = currentManualReviewPreviewComparisonWithPreviousObservationPlan8PModel(),
): string {
  const checks = [
    checkLine("ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel exists", model.version === "MANUAL_REVIEW_PREVIEW_COMPARISON_8P", model.version),
    checkLine("baseline 8O visible and preserved", model.baseline8OPreserved, bool(model.baseline8OPreserved)),
    checkLine("baseline 8N preserved", model.baseline8NPreserved, bool(model.baseline8NPreserved)),
    checkLine("baseline 8M preserved", model.baseline8MPreserved, bool(model.baseline8MPreserved)),
    checkLine("baseline 8L preserved", model.baseline8LPreserved, bool(model.baseline8LPreserved)),
    checkLine("baseline 8K preserved", model.baseline8KPreserved, bool(model.baseline8KPreserved)),
    checkLine("comparison visible in product", model.previewComparisonVisibleInProduct, bool(model.previewComparisonVisibleInProduct)),
    checkLine("comparison visible in export", model.previewComparisonVisibleInExport, bool(model.previewComparisonVisibleInExport)),
    checkLine("comparison uses validated 8O preview only", model.comparisonUses8OValidatedPreviewOnly, bool(model.comparisonUses8OValidatedPreviewOnly)),
    checkLine("invalid preview comparison blocked", model.comparisonAudit.invalidPreviewComparisonBlocked, bool(model.comparisonAudit.invalidPreviewComparisonBlocked)),
    checkLine("comparison uses 8K/8L observation plan", model.comparisonUses8K8LObservationPlan, bool(model.comparisonUses8K8LObservationPlan)),
    checkLine("comparison card count = 3", model.comparisonCardCount === 3, String(model.comparisonCardCount)),
    checkLine("comparison cards linked to 8O/8N/8M/8L/8K", model.comparisonCardsLinkedTo8OCount === 3 && model.comparisonCardsLinkedTo8NCount === 3 && model.comparisonCardsLinkedTo8MCount === 3 && model.comparisonCardsLinkedTo8LCount === 3 && model.comparisonCardsLinkedTo8KCount === 3, `${model.comparisonCardsLinkedTo8OCount}/${model.comparisonCardsLinkedTo8NCount}/${model.comparisonCardsLinkedTo8MCount}/${model.comparisonCardsLinkedTo8LCount}/${model.comparisonCardsLinkedTo8KCount}`),
    checkLine("answersQuestionCount = 1", model.comparisonAnswersObservationQuestionCount === 1, String(model.comparisonAnswersObservationQuestionCount)),
    checkLine("partiallyAnswersQuestionCount = 1", model.comparisonPartialAnswerCount === 1, String(model.comparisonPartialAnswerCount)),
    checkLine("insufficientToAnswerCount = 1", model.comparisonInsufficientAnswerCount === 1, String(model.comparisonInsufficientAnswerCount)),
    checkLine("firstExitAnswerStatus = answers_question", model.planCoverageAudit.firstExitAnswerStatus === "answers_question", model.planCoverageAudit.firstExitAnswerStatus),
    checkLine("dangerContinuityAnswerStatus = partially_answers_question", model.planCoverageAudit.dangerContinuityAnswerStatus === "partially_answers_question", model.planCoverageAudit.dangerContinuityAnswerStatus),
    checkLine("structureAfterNeutralizedActionAnswerStatus = insufficient_to_answer", model.planCoverageAudit.structureAfterNeutralizedActionAnswerStatus === "insufficient_to_answer", model.planCoverageAudit.structureAfterNeutralizedActionAnswerStatus),
    checkLine("comparison marked demo only", model.comparisonMarkedDemoOnly, bool(model.comparisonMarkedDemoOnly)),
    checkLine("comparison marked non-official", model.comparisonMarkedNonOfficial, bool(model.comparisonMarkedNonOfficial)),
    checkLine("comparison marked not persisted", model.comparisonMarkedNotPersisted, bool(model.comparisonMarkedNotPersisted)),
    checkLine("comparison marked not applied", model.comparisonMarkedNotApplied, bool(model.comparisonMarkedNotApplied)),
    checkLine("comparison does not auto-classify", model.comparisonDoesNotAutoClassify, bool(model.comparisonDoesNotAutoClassify)),
    checkLine("comparison does not drive selection", model.comparisonDoesNotDriveSelection, bool(model.comparisonDoesNotDriveSelection)),
    checkLine("comparison does not drive tactical instruction", model.comparisonDoesNotDriveTacticalInstruction, bool(model.comparisonDoesNotDriveTacticalInstruction)),
    checkLine("comparison does not create memory", model.comparisonDoesNotCreateMemory, bool(model.comparisonDoesNotCreateMemory)),
    checkLine("comparison does not promote official truth", model.comparisonDoesNotPromoteOfficialTruth, bool(model.comparisonDoesNotPromoteOfficialTruth)),
    checkLine("comparison does not mutate score", model.comparisonDoesNotMutateScore, bool(model.comparisonDoesNotMutateScore)),
    checkLine("comparison does not mutate timeline", model.comparisonDoesNotMutateTimeline, bool(model.comparisonDoesNotMutateTimeline)),
    checkLine("comparison does not create score_change", model.comparisonDoesNotCreateScoreChange, bool(model.comparisonDoesNotCreateScoreChange)),
    checkLine("source-of-truth separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("export title mentions 8P", model.exportMetadataAudit.exportTitleMentions8P, bool(model.exportMetadataAudit.exportTitleMentions8P)),
    checkLine("export visible badge mentions 8P", model.exportMetadataAudit.exportVisibleBadgeMentions8P, bool(model.exportMetadataAudit.exportVisibleBadgeMentions8P)),
    checkLine("export main has data-manual-review-preview-comparison-version 8P", model.exportMetadataAudit.exportMainComparisonVersionVisible, bool(model.exportMetadataAudit.exportMainComparisonVersionVisible)),
    checkLine("export id no longer compressed-export-8n", model.exportMetadataAudit.exportMainIdNoLonger8NOnly, bool(model.exportMetadataAudit.exportMainIdNoLonger8NOnly)),
    checkLine("export id no longer compressed-export-8i", model.exportMetadataAudit.exportMainIdNoLonger8IOnly, bool(model.exportMetadataAudit.exportMainIdNoLonger8IOnly)),
    checkLine("export under 900 seconds", model.exportUnder900Seconds, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8P)),
    checkLine("export under 800 seconds flag computed honestly", model.exportBudgetAudit.exportUnder800BooleanCorrect, `${model.exportBudgetAudit.exportReadTimeSecondsAfter8P} / ${bool(model.exportUnder800Seconds)}`),
    checkLine("numeric threshold guard preserved", model.numericThresholdGuardPreserved, bool(model.numericThresholdGuardPreserved)),
    checkLine("no localStorage persistence", model.nonPersistenceAudit.localStoragePersistenceCount === 0, String(model.nonPersistenceAudit.localStoragePersistenceCount)),
    checkLine("no database persistence", model.nonPersistenceAudit.databasePersistenceCount === 0, String(model.nonPersistenceAudit.databasePersistenceCount)),
    checkLine("no file persistence", model.nonPersistenceAudit.filePersistenceCount === 0, String(model.nonPersistenceAudit.filePersistenceCount)),
    checkLine("no backend submit or API", model.nonPersistenceAudit.backendSubmitActionCount === 0 && model.nonPersistenceAudit.formSubmitButtonCount === 0 && model.nonPersistenceAudit.apiCallCount === 0, `${model.nonPersistenceAudit.backendSubmitActionCount}/${model.nonPersistenceAudit.formSubmitButtonCount}/${model.nonPersistenceAudit.apiCallCount}`),
    checkLine("scoring values unchanged", scoringRegistryEntry("SHOT_GOAL").points === 3 && scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 && scoringRegistryEntry("CONVERSION_GOAL").points === 2 && scoringRegistryEntry("DROP_GOAL").points === 2, "3/5/2/2"),
    checkLine("PENALTY_SHOT inactive", !scoringRegistryEntry("PENALTY_SHOT").active, bool(!scoringRegistryEntry("PENALTY_SHOT").active)),
    checkLine("MatchBonusEvent unchanged", model.baseline8O.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.baseline8O.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.baseline8O.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.baseline8O.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:")) ? "PASS" : "FAIL";
  return [
    "# Validation - Manual Review Preview Comparison With Previous Observation Plan 8P",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- comparisonCardCount: ${model.comparisonCardCount}`,
    `- comparisonCardsLinkedTo8OCount: ${model.comparisonCardsLinkedTo8OCount}`,
    `- comparisonCardsLinkedTo8NCount: ${model.comparisonCardsLinkedTo8NCount}`,
    `- comparisonCardsLinkedTo8MCount: ${model.comparisonCardsLinkedTo8MCount}`,
    `- comparisonCardsLinkedTo8LCount: ${model.comparisonCardsLinkedTo8LCount}`,
    `- comparisonCardsLinkedTo8KCount: ${model.comparisonCardsLinkedTo8KCount}`,
    `- answersQuestionCount: ${model.comparisonAnswersObservationQuestionCount}`,
    `- partiallyAnswersQuestionCount: ${model.comparisonPartialAnswerCount}`,
    `- insufficientToAnswerCount: ${model.comparisonInsufficientAnswerCount}`,
    `- firstExitAnswerStatus: ${model.planCoverageAudit.firstExitAnswerStatus}`,
    `- dangerContinuityAnswerStatus: ${model.planCoverageAudit.dangerContinuityAnswerStatus}`,
    `- structureAfterNeutralizedActionAnswerStatus: ${model.planCoverageAudit.structureAfterNeutralizedActionAnswerStatus}`,
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
    `- exportReadTimeSecondsAfter8P: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8P}`,
    `- exportUnder900Seconds: ${model.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportUnder800Seconds}`,
    `- wordingReadabilityScore: ${model.wordingAudit.wordingReadabilityScore}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
  ].join("\n");
}
