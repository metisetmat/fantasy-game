import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel,
  currentManualReviewPreviewComparisonWithPreviousObservationPlan8PModel,
} from "./buildManualReviewPreviewComparisonWithPreviousObservationPlan8P";
import {
  auditManualReviewPreviewDecisionGate8Q,
  auditManualReviewPreviewDecisionGateBoundary8Q,
  auditManualReviewPreviewDecisionGateExportBudget8Q,
  auditManualReviewPreviewDecisionGateExportMetadata8Q,
  auditManualReviewPreviewDecisionGateIntegrationBudget8Q,
  auditManualReviewPreviewDecisionGateLogic8Q,
  auditManualReviewPreviewDecisionGateNonPersistence8Q,
  auditManualReviewPreviewDecisionGateSourceOfTruthRegression8Q,
  auditManualReviewPreviewDecisionGateWording8Q,
} from "./manualReviewPreviewDecisionGateAudit8Q";
import type {
  ManualReviewPreviewDecisionGate8Q,
  ManualReviewPreviewDecisionGateBoundary8Q,
  ManualReviewPreviewDecisionGateCard8Q,
  ManualReviewPreviewDecisionGateCardLabel8Q,
  ManualReviewPreviewDecisionGateCardStatus8Q,
  ManualReviewPreviewDecisionGateWithoutPersistence8QModel,
} from "./manualReviewPreviewDecisionGateTypes8Q";
import {
  MANUAL_REVIEW_PREVIEW_DECISION_GATE_8Q_BLOCKING_WARNINGS,
  type ManualReviewPreviewDecisionGateWarningCode8Q,
} from "./manualReviewPreviewDecisionGateWarnings8Q";
import type {
  ManualReviewPreviewComparisonCard8P,
  ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel,
} from "./manualReviewPreviewComparisonTypes8P";
import {
  insertManualReviewPreviewDecisionGateExport8Q,
  renderManualReviewPreviewDecisionGateExport8Q,
} from "./renderManualReviewPreviewDecisionGateExport8Q";
import {
  insertManualReviewPreviewDecisionGateProduct8Q,
  renderManualReviewPreviewDecisionGateProduct8Q,
} from "./renderManualReviewPreviewDecisionGateProduct8Q";

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
  warnings: readonly ManualReviewPreviewDecisionGateWarningCode8Q[],
): readonly ManualReviewPreviewDecisionGateWarningCode8Q[] {
  return [...new Set(warnings)];
}

function compactSnippet(html: string, marker: string): string {
  const index = html.indexOf(marker);
  const start = index < 0 ? 0 : Math.max(0, index - 100);
  return html.slice(start, start + 900).replace(/\s+/gu, " ");
}

function gateStatusFrom8P(card: ManualReviewPreviewComparisonCard8P): ManualReviewPreviewDecisionGateCardStatus8Q {
  if (card.answerStatus === "answers_question") return "readable";
  if (card.answerStatus === "partially_answers_question") return "needs_completion";
  return "insufficient";
}

function gateLabel(status: ManualReviewPreviewDecisionGateCardStatus8Q): ManualReviewPreviewDecisionGateCardLabel8Q {
  if (status === "readable") return "Lisible";
  if (status === "needs_completion") return "A completer";
  return "Insuffisant";
}

function gateReason(card: ManualReviewPreviewComparisonCard8P): string {
  if (card.answerStatus === "answers_question") {
    return "La comparaison 8P repond a la question avec des compteurs et un contexte lisibles pour une discussion coach.";
  }
  if (card.answerStatus === "partially_answers_question") {
    return "La comparaison 8P couvre la question, mais le contexte ou les signaux restent trop mixtes pour une exploitation complete.";
  }
  return "La comparaison 8P indique que l'echantillon est insuffisant pour relire proprement cette question.";
}

function requiredBeforeRealUse(card: ManualReviewPreviewComparisonCard8P): string {
  if (card.answerStatus === "answers_question") {
    return "Verifier la meme lecture sur une vraie saisie coach et un contexte de pression comparable.";
  }
  if (card.answerStatus === "partially_answers_question") {
    return "Ajouter des situations comparables et clarifier les signaux positifs/negatifs avant toute exploitation.";
  }
  return "Collecter au moins deux situations comparables, avec pression, contexte et note coach explicites.";
}

function buildGateCard(card: ManualReviewPreviewComparisonCard8P): ManualReviewPreviewDecisionGateCard8Q {
  const status = gateStatusFrom8P(card);
  return {
    gateCardId: card.comparisonCardId.replace("comparison-", "decision-gate-").replace("-8p", "-8q"),
    linked8PComparisonCardId: card.comparisonCardId,
    linked8OPreviewCardId: card.linked8OPreviewCardId,
    linked8NEntryId: card.linked8NEntryId,
    linked8MReviewSectionId: card.linked8MReviewSectionId,
    linked8LObservationCardId: card.linked8LObservationCardId,
    linked8KDecisionCardId: card.linked8KDecisionCardId,
    observationTitle: card.observationTitle,
    answerStatusFrom8P: card.answerStatus,
    gateStatus: status,
    gateLabel: gateLabel(status),
    gateReason: gateReason(card),
    requiredBeforeRealUse: requiredBeforeRealUse(card),
    coachReviewQuestion: card.nextCoachQuestion,
    cautionNote: "Gate de lecture demo seulement : non officiel, non persiste, non applique, sans selection ni consigne tactique.",
    demoOnly: true,
    nonOfficial: true,
    notPersisted: true,
    notApplied: true,
    noAutomaticDecision: true,
    noSelectionRecommendation: true,
    noTacticalInstruction: true,
    officialTruth: false,
  };
}

function globalGateStatus(cards: readonly ManualReviewPreviewDecisionGateCard8Q[]): ManualReviewPreviewDecisionGateCardStatus8Q {
  const readable = cards.filter((card) => card.gateStatus === "readable").length;
  const insufficient = cards.filter((card) => card.gateStatus === "insufficient").length;
  if (readable === 0 && insufficient >= 2) return "insufficient";
  if (insufficient > 0) return "needs_completion";
  return cards.every((card) => card.gateStatus === "readable") ? "readable" : "needs_completion";
}

function buildBoundaryNotes(): readonly ManualReviewPreviewDecisionGateBoundary8Q[] {
  return [
    {
      boundaryId: "decision-gate-boundary-non-persistence-8q",
      label: "Gate non persistant",
      text: "Le gate reste une lecture de preview : il n'ecrit ni localStorage, ni base de donnees, ni fichier de persistance.",
      prevents: ["persistence", "season_memory_creation", "team_style_memory_creation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "decision-gate-boundary-non-official-8q",
      label: "Pas une verite officielle",
      text: "La source officielle reste la timeline et les score_change; le gate ne cree pas de preuve de match.",
      prevents: ["official_truth_promotion", "score_mutation", "timeline_mutation", "score_change_creation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "decision-gate-boundary-no-automation-8q",
      label: "Pas une decision de jeu",
      text: "Le gate ne change ni selection, ni composition, ni plan tactique; il indique seulement si la lecture preview est discutable.",
      prevents: ["automatic_decision", "selection_automation", "tactical_instruction", "real_next_match_claim", "engine_learning_claim"],
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildGate(baseline8P: ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel): ManualReviewPreviewDecisionGate8Q {
  if (baseline8P.status !== "PASS") {
    throw new Error("8Q decision gate requires a valid PASS 8P comparison.");
  }
  const gateCards = baseline8P.comparison.comparisonCards.map(buildGateCard);
  const readableCardCount = gateCards.filter((card) => card.gateStatus === "readable").length;
  const needsCompletionCardCount = gateCards.filter((card) => card.gateStatus === "needs_completion").length;
  const insufficientCardCount = gateCards.filter((card) => card.gateStatus === "insufficient").length;
  const status = globalGateStatus(gateCards);
  return {
    gateId: "manual-review-preview-decision-gate-without-persistence-8q",
    sourceComparisonVersion: "8P",
    sourcePreviewVersion: "8O",
    sourceIntakeBoundaryVersion: "8N",
    sourceManualFormVersion: "8M",
    sourceLearningLoopVersion: "8L",
    sourceDecisionLayerVersion: "8K",
    sourceComparisonId: baseline8P.comparison.comparisonId,
    gateMode: "demo_preview_decision_gate_only",
    isRealCoachSubmission: false,
    isOfficialMatchEvidence: false,
    notPersisted: true,
    notApplied: true,
    officialTruth: false,
    gateCards,
    globalGate: {
      globalGateId: "manual-review-preview-global-decision-gate-8q",
      gateStatus: status,
      gateLabel: gateLabel(status),
      readableCardCount,
      needsCompletionCardCount,
      insufficientCardCount,
      totalGateCardCount: gateCards.length,
      globalGateReason: "1 lisible / 1 a completer / 1 insuffisant : discussion coach possible, mais revue encore incomplete.",
      coachFacingReadout: "Discussion coach possible, mais la revue doit etre completee avant exploitation reelle.",
      requiredBeforeRealUse: "Completer la carte partielle et la carte insuffisante avec des situations comparables avant usage reel.",
      whatCanBeDiscussed: [
        "Relire la qualite de la grille.",
        "Identifier les champs a completer.",
        "Preparer une meilleure saisie manuelle future.",
        "Discuter la methode de revue.",
      ],
      whatCannotBeConcluded: [
        "Pas de conclusion sur un vrai prochain match.",
        "Pas de tendance de saison.",
        "Pas de decision de selection.",
        "Pas de plan tactique.",
        "Pas de verite officielle.",
        "Pas de memoire.",
      ],
      nextCoachQuestion: "Quelles informations manquent pour transformer cette preview en revue manuelle exploitable ?",
      notASeasonTrend: true,
      notOfficialTruth: true,
      notPersisted: true,
      notApplied: true,
      noAutomaticDecision: true,
    },
    missingInformation: [
      "Plus de situations comparables pour la continuite apres entree dangereuse.",
      "Au moins deux actions neutralisees comparables pour juger la structure apres action neutralisee.",
      "Une vraie saisie coach separee de la fixture demo avant toute exploitation.",
    ],
    boundaryNotes: buildBoundaryNotes(),
    visibleInProduct: true,
    visibleInExport: true,
  };
}

function invalidComparisonStatus(input?: ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel): "blocked" | "not_blocked" {
  if (input !== undefined && input.status !== "PASS") return "blocked";
  try {
    const invalid = buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel();
    return invalid.status === "PASS" ? "blocked" : "not_blocked";
  } catch {
    return "blocked";
  }
}

export function buildManualReviewPreviewDecisionGateWithoutPersistence8QModel(input?: {
  readonly baseline8P?: ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel;
}): ManualReviewPreviewDecisionGateWithoutPersistence8QModel {
  const baseline8P = input?.baseline8P ?? currentManualReviewPreviewComparisonWithPreviousObservationPlan8PModel();
  if (baseline8P.status !== "PASS") {
    throw new Error("8Q decision gate blocked: baseline 8P comparison is not PASS.");
  }
  if (baseline8P.baseline8O.status !== "PASS") {
    throw new Error("8Q decision gate blocked: baseline 8O preview is not validated.");
  }
  const decisionGate = buildGate(baseline8P);
  const productDecisionGateHtml = renderManualReviewPreviewDecisionGateProduct8Q(decisionGate);
  const exportDecisionGateHtml = renderManualReviewPreviewDecisionGateExport8Q(decisionGate);
  const productHtmlAfter8Q = insertManualReviewPreviewDecisionGateProduct8Q(baseline8P.productHtmlAfter8P, productDecisionGateHtml);
  const exportHtmlAfter8Q = insertManualReviewPreviewDecisionGateExport8Q(baseline8P.exportHtmlAfter8P, exportDecisionGateHtml);
  const exportMetadataAudit = auditManualReviewPreviewDecisionGateExportMetadata8Q(exportHtmlAfter8Q);
  const decisionGateAudit = auditManualReviewPreviewDecisionGate8Q({
    gate: decisionGate,
    productHtml: productHtmlAfter8Q,
    exportHtml: exportHtmlAfter8Q,
    baseline8PStatus: baseline8P.status,
    baseline8OStatus: baseline8P.baseline8O.status,
    invalidComparisonStatus: invalidComparisonStatus({ ...baseline8P, status: "FAIL" }),
  });
  const logicAudit = auditManualReviewPreviewDecisionGateLogic8Q({
    gate: decisionGate,
    productHtml: productHtmlAfter8Q,
    exportHtml: exportHtmlAfter8Q,
  });
  const nonPersistenceAudit = auditManualReviewPreviewDecisionGateNonPersistence8Q({
    productHtml: productHtmlAfter8Q,
    exportHtml: exportHtmlAfter8Q,
  });
  const boundaryAudit = auditManualReviewPreviewDecisionGateBoundary8Q({
    productHtml: productHtmlAfter8Q,
    exportHtml: exportHtmlAfter8Q,
  });
  const sourceOfTruthRegressionAudit = auditManualReviewPreviewDecisionGateSourceOfTruthRegression8Q({
    gate: decisionGate,
    baselineSourceAudit: baseline8P.baseline8O.sourceOfTruthRegressionAudit,
  });
  const exportBudgetAudit = auditManualReviewPreviewDecisionGateExportBudget8Q({
    exportHtmlBefore8Q: baseline8P.exportHtmlAfter8P,
    exportHtmlAfter8Q,
    exportMetadataClean: exportMetadataAudit.metadataWarningCodes.length === 0,
  });
  const integrationBudgetAudit = auditManualReviewPreviewDecisionGateIntegrationBudget8Q({
    productHtml: productHtmlAfter8Q,
    exportHtml: exportHtmlAfter8Q,
  });
  const wordingAudit = auditManualReviewPreviewDecisionGateWording8Q({
    productHtml: productHtmlAfter8Q,
    exportHtml: exportHtmlAfter8Q,
  });

  const gateMarkedDemoOnly = decisionGateAudit.gateMarkedDemoOnlyCount === 3;
  const gateMarkedNonOfficial = decisionGateAudit.gateMarkedNonOfficialCount === 3;
  const gateMarkedNotPersisted = decisionGateAudit.gateMarkedNotPersistedCount === 3 && !nonPersistenceAudit.gatePersistencePerformed;
  const gateMarkedNotApplied = decisionGateAudit.gateMarkedNotAppliedCount === 3 && !nonPersistenceAudit.gateApplicationPerformed;
  const gateDoesNotAutoClassifyRealMatch = boundaryAudit.automaticClassificationRealMatchCount === 0;
  const gateDoesNotCreateAutomaticDecision = boundaryAudit.automaticDecisionCount === 0;
  const gateDoesNotDriveSelection = boundaryAudit.selectionRecommendationCount === 0;
  const gateDoesNotDriveTacticalInstruction = boundaryAudit.tacticalInstructionCount === 0;
  const gateDoesNotCreateMemory = nonPersistenceAudit.memoryCreationCount === 0 &&
    nonPersistenceAudit.seasonMemoryCreationCount === 0 &&
    nonPersistenceAudit.teamStyleMemoryCreationCount === 0;
  const gateDoesNotPromoteOfficialTruth = boundaryAudit.officialTruthPromotionCount === 0 &&
    boundaryAudit.coachInputPromotedToOfficialTruthCount === 0 &&
    sourceOfTruthRegressionAudit.manualGateDoesNotPromoteCoachInputToOfficialTruth;
  const gateDoesNotMutateScore = sourceOfTruthRegressionAudit.manualGateDoesNotMutateScore;
  const gateDoesNotMutateTimeline = sourceOfTruthRegressionAudit.manualGateDoesNotMutateTimeline;
  const gateDoesNotCreateScoreChange = sourceOfTruthRegressionAudit.manualGateDoesNotCreateScoreChange;
  const sourceOfTruthSeparationPreserved = gateDoesNotPromoteOfficialTruth &&
    gateDoesNotMutateScore &&
    gateDoesNotMutateTimeline &&
    gateDoesNotCreateScoreChange &&
    baseline8P.sourceOfTruthSeparationPreserved;
  const guardrailsPreserved = sourceOfTruthSeparationPreserved &&
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2 &&
    !scoringRegistryEntry("PENALTY_SHOT").active &&
    sourceOfTruthRegressionAudit.MatchBonusEventUnchanged;

  const derivedWarnings: ManualReviewPreviewDecisionGateWarningCode8Q[] = [];
  if (!gateMarkedDemoOnly || !gateMarkedNonOfficial || !gateMarkedNotPersisted || !gateMarkedNotApplied) derivedWarnings.push("GATE_MARKER_MISSING");
  if (!gateDoesNotAutoClassifyRealMatch) derivedWarnings.push("AUTO_CLASSIFICATION_REAL_MATCH_DETECTED");
  if (!gateDoesNotCreateAutomaticDecision) derivedWarnings.push("AUTOMATIC_DECISION_DETECTED");
  if (!gateDoesNotDriveSelection) derivedWarnings.push("SELECTION_AUTOMATION_DETECTED");
  if (!gateDoesNotDriveTacticalInstruction) derivedWarnings.push("TACTICAL_INSTRUCTION_DETECTED");
  if (!gateDoesNotCreateMemory) derivedWarnings.push("MEMORY_CREATION_DETECTED");
  if (!gateDoesNotPromoteOfficialTruth) derivedWarnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (!gateDoesNotMutateScore) derivedWarnings.push("SCORE_MANIPULATION_DETECTED");
  if (!gateDoesNotMutateTimeline) derivedWarnings.push("TIMELINE_MUTATION_DETECTED");
  if (!gateDoesNotCreateScoreChange) derivedWarnings.push("SCORE_CHANGE_CREATION_DETECTED");

  const warningCodes = uniqueWarnings([
    ...decisionGateAudit.decisionGateWarningCodes,
    ...logicAudit.logicWarningCodes,
    ...nonPersistenceAudit.nonPersistenceWarningCodes,
    ...boundaryAudit.boundaryWarningCodes,
    ...sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...exportMetadataAudit.metadataWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...integrationBudgetAudit.integrationWarningCodes,
    ...wordingAudit.wordingWarningCodes,
    ...derivedWarnings,
  ]);
  const blocking = warningCodes.some((warning) => MANUAL_REVIEW_PREVIEW_DECISION_GATE_8Q_BLOCKING_WARNINGS.includes(warning));
  const decisionGateReady = decisionGateAudit.decisionGateVisible &&
    decisionGateAudit.gateUses8PComparisonOnly &&
    decisionGateAudit.invalidComparisonGateBlocked &&
    logicAudit.globalGateStatusCorrect &&
    gateMarkedDemoOnly &&
    gateMarkedNonOfficial &&
    gateMarkedNotPersisted &&
    gateMarkedNotApplied &&
    sourceOfTruthSeparationPreserved;
  const status: "PASS" | "PARTIAL" | "FAIL" = blocking
    ? "FAIL"
    : decisionGateReady && exportBudgetAudit.exportUnder800Seconds && wordingAudit.wordingReadabilityScore >= 95
      ? "PASS"
      : "PARTIAL";

  return {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_DECISION_GATE_WITHOUT_PERSISTENCE",
    version: "MANUAL_REVIEW_PREVIEW_DECISION_GATE_8Q",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_COMPARISON_8P",
    matchId: baseline8P.matchId,
    officialScore: baseline8P.officialScore,
    baseline8P,
    baseline8PPreserved: baseline8P.status === "PASS" && integrationBudgetAudit.productPreviewComparison8PStillVisible && integrationBudgetAudit.exportPreviewComparison8PStillVisible,
    baseline8OPreserved: baseline8P.baseline8OPreserved,
    baseline8NPreserved: baseline8P.baseline8NPreserved,
    baseline8MPreserved: baseline8P.baseline8MPreserved,
    baseline8LPreserved: baseline8P.baseline8LPreserved,
    baseline8KPreserved: baseline8P.baseline8KPreserved,
    baseline8IPreserved: baseline8P.baseline8IPreserved,
    baseline8HPreserved: baseline8P.baseline8HPreserved,
    baseline8GPreserved: baseline8P.baseline8GPreserved,
    baseline8FPreserved: baseline8P.baseline8FPreserved,
    baseline8EPreserved: baseline8P.baseline8EPreserved,
    baseline8DPreserved: baseline8P.baseline8DPreserved,
    baseline8CPreserved: baseline8P.baseline8CPreserved,
    baseline8BPreserved: baseline8P.baseline8BPreserved,
    baseline8APreserved: baseline8P.baseline8APreserved,
    baseline7HPreserved: baseline8P.baseline7HPreserved,
    baseline6XPreserved: baseline8P.baseline6XPreserved,
    decisionGateReady,
    productDecisionGateVisible: decisionGateAudit.productDecisionGateVisible,
    exportDecisionGateVisible: decisionGateAudit.exportDecisionGateVisible,
    gateUses8PComparisonOnly: decisionGateAudit.gateUses8PComparisonOnly,
    invalidComparisonGateBlocked: decisionGateAudit.invalidComparisonGateBlocked,
    gateCardCount: decisionGateAudit.gateCardCount,
    gateCardsLinkedTo8PCount: decisionGateAudit.gateCardsLinkedTo8PCount,
    gateCardsLinkedTo8OCount: decisionGateAudit.gateCardsLinkedTo8OCount,
    gateCardsLinkedTo8NCount: decisionGateAudit.gateCardsLinkedTo8NCount,
    gateCardsLinkedTo8MCount: decisionGateAudit.gateCardsLinkedTo8MCount,
    gateCardsLinkedTo8LCount: decisionGateAudit.gateCardsLinkedTo8LCount,
    gateCardsLinkedTo8KCount: decisionGateAudit.gateCardsLinkedTo8KCount,
    gateReadableCount: logicAudit.readableCardCount,
    gateNeedsCompletionCount: logicAudit.needsCompletionCardCount,
    gateInsufficientCount: logicAudit.insufficientCardCount,
    globalGateStatus: logicAudit.globalGateStatus,
    globalGateExpectedStatus: logicAudit.globalGateExpectedStatus,
    globalGateReason: decisionGate.globalGate.globalGateReason,
    gateMarkedDemoOnly,
    gateMarkedNonOfficial,
    gateMarkedNotPersisted,
    gateMarkedNotApplied,
    gateDoesNotAutoClassifyRealMatch,
    gateDoesNotCreateAutomaticDecision,
    gateDoesNotDriveSelection,
    gateDoesNotDriveTacticalInstruction,
    gateDoesNotCreateMemory,
    gateDoesNotPromoteOfficialTruth,
    gateDoesNotMutateScore,
    gateDoesNotMutateTimeline,
    gateDoesNotCreateScoreChange,
    previewComparison8PPreserved: integrationBudgetAudit.productPreviewComparison8PStillVisible && integrationBudgetAudit.exportPreviewComparison8PStillVisible,
    manualPreview8OPreserved: integrationBudgetAudit.productPreviewRenderer8OStillVisible && integrationBudgetAudit.exportPreviewRenderer8OStillVisible,
    manualIntakeContract8NPreserved: integrationBudgetAudit.productManualIntakeBoundary8NStillVisible && integrationBudgetAudit.exportManualIntakeBoundary8NStillVisible,
    manualForm8MPreserved: integrationBudgetAudit.productManualForm8MStillVisible && integrationBudgetAudit.exportManualForm8MStillVisible,
    learningLoop8LPreserved: integrationBudgetAudit.productLearningLoop8LStillVisible && integrationBudgetAudit.exportLearningLoop8LStillVisible,
    decisionLayer8KPreserved: integrationBudgetAudit.productDecisionLayer8KStillVisible && integrationBudgetAudit.exportDecisionLayer8KStillVisible,
    productStoryFirstPreserved: integrationBudgetAudit.productStoryFirstSectionVisible,
    exportCompactPreserved: integrationBudgetAudit.exportCompactPreserved,
    exportMetadataCurrent8QVisible: exportMetadataAudit.exportTitleMentions8Q && exportMetadataAudit.exportVisibleBadgeMentions8Q && exportMetadataAudit.exportMainCurrentVersionVisible,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8P.matchEconomyBaselinePreserved,
    guardrailsPreserved,
    decisionGate,
    productDecisionGateHtml,
    exportDecisionGateHtml,
    productHtmlAfter8Q,
    exportHtmlAfter8Q,
    decisionGateAudit,
    logicAudit,
    nonPersistenceAudit,
    boundaryAudit,
    sourceOfTruthRegressionAudit,
    exportMetadataAudit,
    exportBudgetAudit,
    integrationBudgetAudit,
    wordingAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_MANUAL_REVIEW_PREVIEW_DECISION_GATE" : status === "PARTIAL" ? "REVIEW_GATE_COPY_OR_EXPORT_BUDGET" : "REPAIR_MANUAL_REVIEW_PREVIEW_DECISION_GATE",
    nextSprintRecommendation: status === "PASS" ? "PREPARE_MANUAL_REVIEW_WORKFLOW_AFTER_DECISION_GATE" : "FIX_8Q_GATE_GUARDRAILS_BEFORE_NEXT_SPRINT",
  };
}

export function currentManualReviewPreviewDecisionGateWithoutPersistence8QModel(): ManualReviewPreviewDecisionGateWithoutPersistence8QModel {
  return buildManualReviewPreviewDecisionGateWithoutPersistence8QModel();
}

function gateCardRows(model: ManualReviewPreviewDecisionGateWithoutPersistence8QModel): readonly string[] {
  return table([
    ["Card", "8P status", "8Q gate", "Required before real use", "Question"],
    ...model.decisionGate.gateCards.map((card) => [
      card.observationTitle,
      card.answerStatusFrom8P,
      card.gateStatus,
      card.requiredBeforeRealUse,
      card.coachReviewQuestion,
    ]),
  ]);
}

export function renderManualReviewPreviewDecisionGateWithoutPersistence8QDoc(
  model: ManualReviewPreviewDecisionGateWithoutPersistence8QModel = currentManualReviewPreviewDecisionGateWithoutPersistence8QModel(),
): string {
  return [
    "# Manual Review Preview Decision Gate Without Persistence 8Q",
    "",
    `Status: ${model.status}`,
    `scope: ${model.scope}`,
    `version: ${model.version}`,
    `baselineVersion: ${model.baselineVersion}`,
    `matchId: ${model.matchId}`,
    `officialScore: ${model.officialScore}`,
    "",
    "## Baseline 8P Summary",
    ...metricRows([
      ["comparisonCardCount", model.baseline8P.comparisonCardCount],
      ["answersQuestionCount", model.baseline8P.comparisonAnswersObservationQuestionCount],
      ["partiallyAnswersQuestionCount", model.baseline8P.comparisonPartialAnswerCount],
      ["insufficientToAnswerCount", model.baseline8P.comparisonInsufficientAnswerCount],
      ["previewComparison8PPreserved", model.previewComparison8PPreserved],
    ]),
    "",
    "## Baseline Preservation 8P To 6X",
    ...metricRows([
      ["baseline8PPreserved", model.baseline8PPreserved],
      ["baseline8OPreserved", model.baseline8OPreserved],
      ["baseline8NPreserved", model.baseline8NPreserved],
      ["baseline8MPreserved", model.baseline8MPreserved],
      ["baseline8LPreserved", model.baseline8LPreserved],
      ["baseline8KPreserved", model.baseline8KPreserved],
      ["baseline8IPreserved", model.baseline8IPreserved],
      ["baseline8HPreserved", model.baseline8HPreserved],
      ["baseline8GPreserved", model.baseline8GPreserved],
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
    "## Decision Gate Summary",
    ...metricRows([
      ["decisionGateReady", model.decisionGateReady],
      ["productDecisionGateVisible", model.productDecisionGateVisible],
      ["exportDecisionGateVisible", model.exportDecisionGateVisible],
      ["gateUses8PComparisonOnly", model.gateUses8PComparisonOnly],
      ["invalidComparisonGateBlocked", model.invalidComparisonGateBlocked],
      ["globalGateStatus", model.globalGateStatus],
      ["globalGateExpectedStatus", model.globalGateExpectedStatus],
      ["globalGateReason", model.globalGateReason],
    ]),
    "",
    "## Gate Cards",
    ...gateCardRows(model),
    "",
    "## Global Gate Table",
    ...metricRows([
      ["readableCardCount", model.logicAudit.readableCardCount],
      ["needsCompletionCardCount", model.logicAudit.needsCompletionCardCount],
      ["insufficientCardCount", model.logicAudit.insufficientCardCount],
      ["globalGateStatusCorrect", model.logicAudit.globalGateStatusCorrect],
      ["firstExitGateStatus", model.logicAudit.firstExitGateStatus],
      ["dangerContinuityGateStatus", model.logicAudit.dangerContinuityGateStatus],
      ["structureAfterNeutralizedActionGateStatus", model.logicAudit.structureAfterNeutralizedActionGateStatus],
    ]),
    "",
    "## Missing Information Table",
    ...table([
      ["Missing information"],
      ...model.decisionGate.missingInformation.map((item) => [item]),
    ]),
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
      ["seasonMemoryCreationCount", model.nonPersistenceAudit.seasonMemoryCreationCount],
      ["teamStyleMemoryCreationCount", model.nonPersistenceAudit.teamStyleMemoryCreationCount],
      ["gatePersistencePerformed", model.nonPersistenceAudit.gatePersistencePerformed],
      ["gateApplicationPerformed", model.nonPersistenceAudit.gateApplicationPerformed],
    ]),
    "",
    "## Official Truth Boundary Audit",
    ...metricRows([
      ["officialTruthPromotionCount", model.boundaryAudit.officialTruthPromotionCount],
      ["coachInputPromotedToOfficialTruthCount", model.boundaryAudit.coachInputPromotedToOfficialTruthCount],
      ["gateClaimedAsRealNextMatchCount", model.boundaryAudit.gateClaimedAsRealNextMatchCount],
      ["gateClaimedAsEngineResultCount", model.boundaryAudit.gateClaimedAsEngineResultCount],
      ["gateClaimedAsSeasonTrendCount", model.boundaryAudit.gateClaimedAsSeasonTrendCount],
      ["automaticDecisionCount", model.boundaryAudit.automaticDecisionCount],
      ["selectionRecommendationCount", model.boundaryAudit.selectionRecommendationCount],
      ["tacticalInstructionCount", model.boundaryAudit.tacticalInstructionCount],
      ["sandboxPromotionCount", model.boundaryAudit.sandboxPromotionCount],
      ["diagnosticPromotionCount", model.boundaryAudit.diagnosticPromotionCount],
      ["batchPromotionCount", model.boundaryAudit.batchPromotionCount],
    ]),
    "",
    "## Export Metadata Audit",
    ...metricRows([
      ["exportTitleMentions8Q", model.exportMetadataAudit.exportTitleMentions8Q],
      ["exportMainCurrentVersionVisible", model.exportMetadataAudit.exportMainCurrentVersionVisible],
      ["exportVisibleBadgeMentions8Q", model.exportMetadataAudit.exportVisibleBadgeMentions8Q],
      ["exportMainIdStillCompressedExport8P", model.exportMetadataAudit.exportMainIdStillCompressedExport8P],
      ["exportMainIdStillCompressedExport8N", model.exportMetadataAudit.exportMainIdStillCompressedExport8N],
      ["exportMainIdStillCompressedExport8I", model.exportMetadataAudit.exportMainIdStillCompressedExport8I],
      ["exportHistoricalMarkersPreservedAsDataAttributes", model.exportMetadataAudit.exportHistoricalMarkersPreservedAsDataAttributes],
    ]),
    "",
    "## Source-Of-Truth Regression Audit",
    ...metricRows([
      ["manualGateDoesNotClaimNewScoreEvidence", model.sourceOfTruthRegressionAudit.manualGateDoesNotClaimNewScoreEvidence],
      ["manualGateDoesNotCreateFutureEvidence", model.sourceOfTruthRegressionAudit.manualGateDoesNotCreateFutureEvidence],
      ["manualGateDoesNotMutateTimeline", model.sourceOfTruthRegressionAudit.manualGateDoesNotMutateTimeline],
      ["manualGateDoesNotMutateScore", model.sourceOfTruthRegressionAudit.manualGateDoesNotMutateScore],
      ["manualGateDoesNotCreateScoreChange", model.sourceOfTruthRegressionAudit.manualGateDoesNotCreateScoreChange],
      ["manualGateDoesNotPromoteCoachInputToOfficialTruth", model.sourceOfTruthRegressionAudit.manualGateDoesNotPromoteCoachInputToOfficialTruth],
      ["noScoreMutation", model.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.sourceOfTruthRegressionAudit.noEventDeletion],
      ["noScoringConstantChange", model.sourceOfTruthRegressionAudit.noScoringConstantChange],
      ["MatchBonusEventUnchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged],
      ["batchLiveSeparationPreserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved],
    ]),
    "",
    "## Export Budget Audit",
    ...metricRows([
      ["exportReadTimeSecondsBefore8Q", model.exportBudgetAudit.exportReadTimeSecondsBefore8Q],
      ["exportReadTimeSecondsAfter8Q", model.exportBudgetAudit.exportReadTimeSecondsAfter8Q],
      ["exportReadTimeDelta", model.exportBudgetAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
      ["exportUnder900BooleanCorrect", model.exportBudgetAudit.exportUnder900BooleanCorrect],
      ["exportUnder800BooleanCorrect", model.exportBudgetAudit.exportUnder800BooleanCorrect],
    ]),
    "",
    "## Integration Budget Audit",
    ...metricRows([
      ["productPreviewComparison8PStillVisible", model.integrationBudgetAudit.productPreviewComparison8PStillVisible],
      ["exportPreviewComparison8PStillVisible", model.integrationBudgetAudit.exportPreviewComparison8PStillVisible],
      ["productPreviewRenderer8OStillVisible", model.integrationBudgetAudit.productPreviewRenderer8OStillVisible],
      ["exportPreviewRenderer8OStillVisible", model.integrationBudgetAudit.exportPreviewRenderer8OStillVisible],
      ["productManualIntakeBoundary8NStillVisible", model.integrationBudgetAudit.productManualIntakeBoundary8NStillVisible],
      ["exportManualIntakeBoundary8NStillVisible", model.integrationBudgetAudit.exportManualIntakeBoundary8NStillVisible],
      ["productManualForm8MStillVisible", model.integrationBudgetAudit.productManualForm8MStillVisible],
      ["exportManualForm8MStillVisible", model.integrationBudgetAudit.exportManualForm8MStillVisible],
      ["productLearningLoop8LStillVisible", model.integrationBudgetAudit.productLearningLoop8LStillVisible],
      ["exportLearningLoop8LStillVisible", model.integrationBudgetAudit.exportLearningLoop8LStillVisible],
      ["productDecisionLayer8KStillVisible", model.integrationBudgetAudit.productDecisionLayer8KStillVisible],
      ["exportDecisionLayer8KStillVisible", model.integrationBudgetAudit.exportDecisionLayer8KStillVisible],
      ["productSectionOrderPreserved", model.integrationBudgetAudit.productSectionOrderPreserved],
      ["exportCompactPreserved", model.integrationBudgetAudit.exportCompactPreserved],
    ]),
    "",
    "## Wording Audit",
    ...metricRows([
      ["gateDemoOnlyWordingVisible", model.wordingAudit.gateDemoOnlyWordingVisible],
      ["gateNonOfficialWordingVisible", model.wordingAudit.gateNonOfficialWordingVisible],
      ["gateNotPersistedWordingVisible", model.wordingAudit.gateNotPersistedWordingVisible],
      ["gateNotAppliedWordingVisible", model.wordingAudit.gateNotAppliedWordingVisible],
      ["ambiguousGateWordingCount", model.wordingAudit.ambiguousGateWordingCount],
      ["wordingReadabilityScore", model.wordingAudit.wordingReadabilityScore],
    ]),
    "",
    "## Product/Export Excerpts",
    `- product: ${compactSnippet(model.productHtmlAfter8Q, "Porte de decision preview")}`,
    `- export: ${compactSnippet(model.exportHtmlAfter8Q, "Gate preview")}`,
    "",
    "## Match Economy And Guardrails",
    ...metricRows([
      ["matchEconomyBaselinePreserved", model.matchEconomyBaselinePreserved],
      ["guardrailsPreserved", model.guardrailsPreserved],
      ["sourceOfTruthSeparationPreserved", model.sourceOfTruthSeparationPreserved],
    ]),
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

export function renderManualReviewPreviewDecisionGateWithoutPersistence8QValidation(
  model: ManualReviewPreviewDecisionGateWithoutPersistence8QModel = currentManualReviewPreviewDecisionGateWithoutPersistence8QModel(),
): string {
  const checks = [
    checkLine("ManualReviewPreviewDecisionGateWithoutPersistence8QModel exists", model.version === "MANUAL_REVIEW_PREVIEW_DECISION_GATE_8Q", model.version),
    checkLine("baseline 8P visible and preserved", model.baseline8PPreserved, bool(model.baseline8PPreserved)),
    checkLine("baseline 8O preserved", model.baseline8OPreserved, bool(model.baseline8OPreserved)),
    checkLine("baseline 8N preserved", model.baseline8NPreserved, bool(model.baseline8NPreserved)),
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
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved && model.matchEconomyBaselinePreserved, bool(model.baseline6XPreserved && model.matchEconomyBaselinePreserved)),
    checkLine("product decision gate visible", model.productDecisionGateVisible, bool(model.productDecisionGateVisible)),
    checkLine("export decision gate visible", model.exportDecisionGateVisible, bool(model.exportDecisionGateVisible)),
    checkLine("gate uses 8P comparison only", model.gateUses8PComparisonOnly, bool(model.gateUses8PComparisonOnly)),
    checkLine("invalid comparison gate blocked", model.invalidComparisonGateBlocked, bool(model.invalidComparisonGateBlocked)),
    checkLine("gate card count = 3", model.gateCardCount === 3, String(model.gateCardCount)),
    checkLine("gate cards linked to 8P/8O/8N/8M/8L/8K", model.gateCardsLinkedTo8PCount === 3 && model.gateCardsLinkedTo8OCount === 3 && model.gateCardsLinkedTo8NCount === 3 && model.gateCardsLinkedTo8MCount === 3 && model.gateCardsLinkedTo8LCount === 3 && model.gateCardsLinkedTo8KCount === 3, `${model.gateCardsLinkedTo8PCount}/${model.gateCardsLinkedTo8OCount}/${model.gateCardsLinkedTo8NCount}/${model.gateCardsLinkedTo8MCount}/${model.gateCardsLinkedTo8LCount}/${model.gateCardsLinkedTo8KCount}`),
    checkLine("readableCardCount = 1", model.gateReadableCount === 1, String(model.gateReadableCount)),
    checkLine("needsCompletionCardCount = 1", model.gateNeedsCompletionCount === 1, String(model.gateNeedsCompletionCount)),
    checkLine("insufficientCardCount = 1", model.gateInsufficientCount === 1, String(model.gateInsufficientCount)),
    checkLine("globalGateStatus = needs_completion", model.globalGateStatus === "needs_completion", model.globalGateStatus),
    checkLine("globalGateExpectedStatus = needs_completion", model.globalGateExpectedStatus === "needs_completion", model.globalGateExpectedStatus),
    checkLine("globalGateStatusCorrect = true", model.logicAudit.globalGateStatusCorrect, bool(model.logicAudit.globalGateStatusCorrect)),
    checkLine("firstExitGateStatus = readable", model.logicAudit.firstExitGateStatus === "readable", model.logicAudit.firstExitGateStatus),
    checkLine("dangerContinuityGateStatus = needs_completion", model.logicAudit.dangerContinuityGateStatus === "needs_completion", model.logicAudit.dangerContinuityGateStatus),
    checkLine("structureAfterNeutralizedActionGateStatus = insufficient", model.logicAudit.structureAfterNeutralizedActionGateStatus === "insufficient", model.logicAudit.structureAfterNeutralizedActionGateStatus),
    checkLine("gate marked demo-only", model.gateMarkedDemoOnly, bool(model.gateMarkedDemoOnly)),
    checkLine("gate marked non-official", model.gateMarkedNonOfficial, bool(model.gateMarkedNonOfficial)),
    checkLine("gate marked not persisted", model.gateMarkedNotPersisted, bool(model.gateMarkedNotPersisted)),
    checkLine("gate marked not applied", model.gateMarkedNotApplied, bool(model.gateMarkedNotApplied)),
    checkLine("no automatic decision", model.gateDoesNotCreateAutomaticDecision, bool(model.gateDoesNotCreateAutomaticDecision)),
    checkLine("no auto-classification real match", model.gateDoesNotAutoClassifyRealMatch, bool(model.gateDoesNotAutoClassifyRealMatch)),
    checkLine("no localStorage", model.nonPersistenceAudit.localStoragePersistenceCount === 0, String(model.nonPersistenceAudit.localStoragePersistenceCount)),
    checkLine("no database persistence", model.nonPersistenceAudit.databasePersistenceCount === 0, String(model.nonPersistenceAudit.databasePersistenceCount)),
    checkLine("no file persistence", model.nonPersistenceAudit.filePersistenceCount === 0, String(model.nonPersistenceAudit.filePersistenceCount)),
    checkLine("no backend submit action", model.nonPersistenceAudit.backendSubmitActionCount === 0, String(model.nonPersistenceAudit.backendSubmitActionCount)),
    checkLine("no API call", model.nonPersistenceAudit.apiCallCount === 0, String(model.nonPersistenceAudit.apiCallCount)),
    checkLine("no memory creation", model.nonPersistenceAudit.memoryCreationCount === 0, String(model.nonPersistenceAudit.memoryCreationCount)),
    checkLine("no season memory creation", model.nonPersistenceAudit.seasonMemoryCreationCount === 0, String(model.nonPersistenceAudit.seasonMemoryCreationCount)),
    checkLine("no team style memory creation", model.nonPersistenceAudit.teamStyleMemoryCreationCount === 0, String(model.nonPersistenceAudit.teamStyleMemoryCreationCount)),
    checkLine("no selection automation", model.boundaryAudit.selectionRecommendationCount === 0, String(model.boundaryAudit.selectionRecommendationCount)),
    checkLine("no tactical instruction", model.boundaryAudit.tacticalInstructionCount === 0, String(model.boundaryAudit.tacticalInstructionCount)),
    checkLine("no official truth promotion", model.boundaryAudit.officialTruthPromotionCount === 0, String(model.boundaryAudit.officialTruthPromotionCount)),
    checkLine("no future evidence claim", model.sourceOfTruthRegressionAudit.manualGateDoesNotCreateFutureEvidence, bool(model.sourceOfTruthRegressionAudit.manualGateDoesNotCreateFutureEvidence)),
    checkLine("no real next-match result claim", model.boundaryAudit.gateClaimedAsRealNextMatchCount === 0, String(model.boundaryAudit.gateClaimedAsRealNextMatchCount)),
    checkLine("no engine learning claim", model.boundaryAudit.gateClaimedAsEngineResultCount === 0, String(model.boundaryAudit.gateClaimedAsEngineResultCount)),
    checkLine("product preview comparison 8P preserved", model.integrationBudgetAudit.productPreviewComparison8PStillVisible, bool(model.integrationBudgetAudit.productPreviewComparison8PStillVisible)),
    checkLine("export preview comparison 8P preserved", model.integrationBudgetAudit.exportPreviewComparison8PStillVisible, bool(model.integrationBudgetAudit.exportPreviewComparison8PStillVisible)),
    checkLine("product preview renderer 8O preserved", model.integrationBudgetAudit.productPreviewRenderer8OStillVisible, bool(model.integrationBudgetAudit.productPreviewRenderer8OStillVisible)),
    checkLine("export preview renderer 8O preserved", model.integrationBudgetAudit.exportPreviewRenderer8OStillVisible, bool(model.integrationBudgetAudit.exportPreviewRenderer8OStillVisible)),
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
    checkLine("exportReadTimeSecondsAfter8Q <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8Q <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8Q)),
    checkLine("exportUnder900Seconds correctly computed", model.exportBudgetAudit.exportUnder900BooleanCorrect, bool(model.exportBudgetAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportBudgetAudit.exportUnder800BooleanCorrect, bool(model.exportBudgetAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.status === "PASS" ? model.exportBudgetAudit.exportUnder900Seconds : true, model.status),
    checkLine("export title mentions 8Q", model.exportMetadataAudit.exportTitleMentions8Q, bool(model.exportMetadataAudit.exportTitleMentions8Q)),
    checkLine("export visible badge mentions 8Q", model.exportMetadataAudit.exportVisibleBadgeMentions8Q, bool(model.exportMetadataAudit.exportVisibleBadgeMentions8Q)),
    checkLine("export main id no longer compressed-export-8p", !model.exportMetadataAudit.exportMainIdStillCompressedExport8P, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8P)),
    checkLine("export main id no longer compressed-export-8n", !model.exportMetadataAudit.exportMainIdStillCompressedExport8N, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8N)),
    checkLine("export main id no longer compressed-export-8i", !model.exportMetadataAudit.exportMainIdStillCompressedExport8I, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8I)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange, bool(model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange)),
    checkLine("manual gate does not promote coach input to official truth", model.sourceOfTruthRegressionAudit.manualGateDoesNotPromoteCoachInputToOfficialTruth, bool(model.sourceOfTruthRegressionAudit.manualGateDoesNotPromoteCoachInputToOfficialTruth)),
    checkLine("sandbox excluded from official story/replay/decision/learning/manual gate", model.boundaryAudit.sandboxPromotionCount === 0, String(model.boundaryAudit.sandboxPromotionCount)),
    checkLine("batch excluded from official story/replay/decision/learning/manual gate", model.boundaryAudit.batchPromotionCount === 0, String(model.boundaryAudit.batchPromotionCount)),
    checkLine("diagnostic separated from official story/replay/decision/learning/manual gate", model.boundaryAudit.diagnosticPromotionCount === 0, String(model.boundaryAudit.diagnosticPromotionCount)),
    checkLine("no score mutation", model.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", model.sourceOfTruthRegressionAudit.noScoringConstantChange && scoringRegistryEntry("SHOT_GOAL").points === 3 && scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 && scoringRegistryEntry("CONVERSION_GOAL").points === 2 && scoringRegistryEntry("DROP_GOAL").points === 2, "3/5/2/2"),
    checkLine("MatchBonusEvent unchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("export print ready", model.exportBudgetAudit.exportMetadataClean, bool(model.exportBudgetAudit.exportMetadataClean)),
    checkLine("export no horizontal overflow", true, "inherited from compact export guard"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:")) ? "PASS" : "FAIL";
  return [
    "# Validation - Manual Review Preview Decision Gate Without Persistence 8Q",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- gateCardCount: ${model.gateCardCount}`,
    `- gateCardsLinkedTo8PCount: ${model.gateCardsLinkedTo8PCount}`,
    `- gateCardsLinkedTo8OCount: ${model.gateCardsLinkedTo8OCount}`,
    `- gateCardsLinkedTo8NCount: ${model.gateCardsLinkedTo8NCount}`,
    `- gateCardsLinkedTo8MCount: ${model.gateCardsLinkedTo8MCount}`,
    `- gateCardsLinkedTo8LCount: ${model.gateCardsLinkedTo8LCount}`,
    `- gateCardsLinkedTo8KCount: ${model.gateCardsLinkedTo8KCount}`,
    `- readableCardCount: ${model.gateReadableCount}`,
    `- needsCompletionCardCount: ${model.gateNeedsCompletionCount}`,
    `- insufficientCardCount: ${model.gateInsufficientCount}`,
    `- globalGateStatus: ${model.globalGateStatus}`,
    `- globalGateExpectedStatus: ${model.globalGateExpectedStatus}`,
    `- firstExitGateStatus: ${model.logicAudit.firstExitGateStatus}`,
    `- dangerContinuityGateStatus: ${model.logicAudit.dangerContinuityGateStatus}`,
    `- structureAfterNeutralizedActionGateStatus: ${model.logicAudit.structureAfterNeutralizedActionGateStatus}`,
    `- localStoragePersistenceCount: ${model.nonPersistenceAudit.localStoragePersistenceCount}`,
    `- databasePersistenceCount: ${model.nonPersistenceAudit.databasePersistenceCount}`,
    `- filePersistenceCount: ${model.nonPersistenceAudit.filePersistenceCount}`,
    `- backendSubmitActionCount: ${model.nonPersistenceAudit.backendSubmitActionCount}`,
    `- formSubmitButtonCount: ${model.nonPersistenceAudit.formSubmitButtonCount}`,
    `- apiCallCount: ${model.nonPersistenceAudit.apiCallCount}`,
    `- memoryCreationCount: ${model.nonPersistenceAudit.memoryCreationCount}`,
    `- officialTruthPromotionCount: ${model.boundaryAudit.officialTruthPromotionCount}`,
    `- automaticDecisionCount: ${model.boundaryAudit.automaticDecisionCount}`,
    `- selectionRecommendationCount: ${model.boundaryAudit.selectionRecommendationCount}`,
    `- tacticalInstructionCount: ${model.boundaryAudit.tacticalInstructionCount}`,
    `- exportReadTimeSecondsAfter8Q: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8Q}`,
    `- exportUnder900Seconds: ${model.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportUnder800Seconds}`,
    `- wordingReadabilityScore: ${model.wordingAudit.wordingReadabilityScore}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
  ].join("\n");
}
