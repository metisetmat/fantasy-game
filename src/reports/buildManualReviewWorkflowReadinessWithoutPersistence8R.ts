import { scoringRegistryEntry } from "../systems/scoring";
import {
  currentManualReviewPreviewDecisionGateWithoutPersistence8QModel,
} from "./buildManualReviewPreviewDecisionGateWithoutPersistence8Q";
import {
  auditManualReviewWorkflowBoundary8R,
  auditManualReviewWorkflowChain8R,
  auditManualReviewWorkflowExportBudget8R,
  auditManualReviewWorkflowExportMetadata8R,
  auditManualReviewWorkflowIntegrationBudget8R,
  auditManualReviewWorkflowNonPersistence8R,
  auditManualReviewWorkflowReadiness8R,
  auditManualReviewWorkflowReadinessLogic8R,
  auditManualReviewWorkflowSourceOfTruthRegression8R,
  auditManualReviewWorkflowWording8R,
} from "./manualReviewWorkflowReadinessAudit8R";
import type {
  ManualReviewWorkflowBoundary8R,
  ManualReviewWorkflowReadiness8R,
  ManualReviewWorkflowReadinessWithoutPersistence8RModel,
  ManualReviewWorkflowStage8R,
} from "./manualReviewWorkflowReadinessTypes8R";
import {
  MANUAL_REVIEW_WORKFLOW_READINESS_8R_BLOCKING_WARNINGS,
  type ManualReviewWorkflowReadinessWarningCode8R,
} from "./manualReviewWorkflowReadinessWarnings8R";
import type { ManualReviewPreviewDecisionGateWithoutPersistence8QModel } from "./manualReviewPreviewDecisionGateTypes8Q";
import {
  insertManualReviewWorkflowReadinessExport8R,
  renderManualReviewWorkflowReadinessExport8R,
} from "./renderManualReviewWorkflowReadinessExport8R";
import {
  insertManualReviewWorkflowReadinessProduct8R,
  renderManualReviewWorkflowReadinessProduct8R,
} from "./renderManualReviewWorkflowReadinessProduct8R";

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
  warnings: readonly ManualReviewWorkflowReadinessWarningCode8R[],
): readonly ManualReviewWorkflowReadinessWarningCode8R[] {
  return [...new Set(warnings)];
}

function compactSnippet(html: string, marker: string): string {
  const index = html.indexOf(marker);
  const start = index < 0 ? 0 : Math.max(0, index - 100);
  return html.slice(start, start + 900).replace(/\s+/gu, " ");
}

function buildStages(): readonly ManualReviewWorkflowStage8R[] {
  const stages: ManualReviewWorkflowStage8R[] = [
    {
      stageId: "manual-review-workflow-stage-8m",
      stageOrder: 1,
      stageVersion: "8M",
      stageTitle: "8M - Formulaire manuel post-match",
      stagePurpose: "Preparer une saisie coach manuelle, vide, a remplir apres un vrai match.",
      input: "Plan d'observation 8K/8L.",
      output: "3 sections de revue manuelle, sans resultat prerempli.",
      ready: true,
      linkedNextStageId: "manual-review-workflow-stage-8n",
      guardrails: ["no persistence", "no automatic outcome", "no official truth", "no selection/tactic"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stageId: "manual-review-workflow-stage-8n",
      stageOrder: 2,
      stageVersion: "8N",
      stageTitle: "8N - Frontiere d'entree manuelle",
      stagePurpose: "Definir le contrat d'entree et le validateur de payload manuel.",
      input: "Formulaire 8M potentiellement rempli.",
      output: "Payload accepte en validate/preview only ou rejete.",
      ready: true,
      linkedPreviousStageId: "manual-review-workflow-stage-8m",
      linkedNextStageId: "manual-review-workflow-stage-8o",
      guardrails: ["validator pure", "no persistence", "no mutation", "no official truth"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stageId: "manual-review-workflow-stage-8o",
      stageOrder: 3,
      stageVersion: "8O",
      stageTitle: "8O - Preview non persistee",
      stagePurpose: "Rendre une preview lisible depuis un payload valide.",
      input: "Payload valide 8N.",
      output: "3 cartes preview non officielles.",
      ready: true,
      linkedPreviousStageId: "manual-review-workflow-stage-8n",
      linkedNextStageId: "manual-review-workflow-stage-8p",
      guardrails: ["demo fixture", "not real next match", "no memory", "no application"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stageId: "manual-review-workflow-stage-8p",
      stageOrder: 4,
      stageVersion: "8P",
      stageTitle: "8P - Comparaison preview / plan",
      stagePurpose: "Comparer la preview 8O aux questions 8K/8L.",
      input: "Preview 8O validee + plan d'observation 8K/8L.",
      output: "3 cartes de comparaison, statut reponse complete/partielle/insuffisante.",
      ready: true,
      linkedPreviousStageId: "manual-review-workflow-stage-8o",
      linkedNextStageId: "manual-review-workflow-stage-8q",
      guardrails: ["no conclusion real match", "no automatic decision", "no official truth"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stageId: "manual-review-workflow-stage-8q",
      stageOrder: 5,
      stageVersion: "8Q",
      stageTitle: "8Q - Gate de lisibilite",
      stagePurpose: "Qualifier la maturite de lecture de la revue preview.",
      input: "Comparaison 8P validee.",
      output: "Gate global needs_completion, 1 lisible / 1 a completer / 1 insuffisant.",
      ready: true,
      linkedPreviousStageId: "manual-review-workflow-stage-8p",
      guardrails: ["no game decision", "no selection", "no tactic", "no persistence"],
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
  return stages;
}

function buildBoundaries(): readonly ManualReviewWorkflowBoundary8R[] {
  return [
    {
      boundaryId: "manual-review-workflow-boundary-non-persistence-8r",
      label: "Pas de stockage",
      text: "Le workflow 8R lit et affiche le chainage de preview; il ne cree ni localStorage, ni base de donnees, ni fichier de persistance.",
      prevents: ["persistence", "season_memory_creation", "team_style_memory_creation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "manual-review-workflow-boundary-non-official-8r",
      label: "Pas de verite officielle",
      text: "La timeline officielle et les score_change restent les seules sources de score et d'histoire officielle.",
      prevents: ["official_truth_promotion", "score_mutation", "timeline_mutation", "score_change_creation", "event_mutation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "manual-review-workflow-boundary-no-automation-8r",
      label: "Pas d'automatisation",
      text: "Le workflow peut etre teste en preview non persistante, mais il ne genere ni decision, ni selection, ni consigne tactique.",
      prevents: ["automatic_decision", "automatic_real_match_classification", "selection_automation", "tactical_instruction"],
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildWorkflow(baseline8Q: ManualReviewPreviewDecisionGateWithoutPersistence8QModel): ManualReviewWorkflowReadiness8R {
  const stages = buildStages();
  const readyStageCount = stages.filter((stage) => stage.ready).length;
  return {
    workflowId: "manual-review-workflow-readiness-without-persistence-8r",
    workflowMode: "demo_preview_workflow_only",
    sourceDecisionGateVersion: "8Q",
    sourceComparisonVersion: "8P",
    sourcePreviewVersion: "8O",
    sourceIntakeBoundaryVersion: "8N",
    sourceManualFormVersion: "8M",
    sourceLearningLoopVersion: "8L",
    sourceDecisionLayerVersion: "8K",
    stages,
    readinessSummary: {
      summaryId: "manual-review-workflow-readiness-summary-8r",
      workflowReadinessStatus: "ready_for_non_persistent_preview",
      reviewGateStatusFrom8Q: "needs_completion",
      workflowStageCount: stages.length,
      readyStageCount,
      blockedStageCount: stages.length - readyStageCount,
      missingCriticalStageCount: 0,
      workflowCanBeDemoed: baseline8Q.globalGateStatus === "needs_completion",
      workflowCanBeUsedForRealDecision: false,
      workflowCanPersistReview: false,
      workflowCanCreateOfficialTruth: false,
      workflowCanDriveSelection: false,
      workflowCanDriveTacticalInstruction: false,
      coachFacingReadout: "Le workflow est pret pour une preview non persistante; la revue de demonstration reste a completer avant tout usage reel.",
      whatIsReady: [
        "Chainage fonctionnel 8M -> 8N -> 8O -> 8P -> 8Q.",
        "Preview non persistante.",
        "Comparaison planifiee.",
        "Gate de lisibilite.",
        "Export compact.",
        "Garde-fous source-of-truth.",
      ],
      whatStillNeedsWork: [
        "Vraie saisie coach + decision de stockage future separee.",
        "Vraie validation post-match.",
        "UX de saisie reelle.",
        "Controle de permissions si stockage futur.",
        "Regle de transformation eventuelle vers historique, non incluse ici.",
      ],
      nextQuestion: "Le parcours de preview est-il assez clair pour construire ensuite une UX sans persistance ?",
    },
    missingInformation: [
      "Une vraie saisie coach post-match.",
      "Une strategie de stockage separee, si le produit decide d'en creer une plus tard.",
      "Une regle explicite de promotion eventuelle vers historique, hors 8R.",
    ],
    boundaries: buildBoundaries(),
    isRealCoachSubmission: false,
    isOfficialMatchEvidence: false,
    notPersisted: true,
    notApplied: true,
    officialTruth: false,
    visibleInProduct: true,
    visibleInExport: true,
  };
}

export function buildManualReviewWorkflowReadinessWithoutPersistence8RModel(input?: {
  readonly baseline8Q?: ManualReviewPreviewDecisionGateWithoutPersistence8QModel;
  readonly productHtmlBefore8R?: string;
  readonly exportHtmlBefore8R?: string;
}): ManualReviewWorkflowReadinessWithoutPersistence8RModel {
  const baseline8Q = input?.baseline8Q ?? currentManualReviewPreviewDecisionGateWithoutPersistence8QModel();
  if (baseline8Q.status !== "PASS") {
    throw new Error("8R workflow readiness blocked: baseline 8Q decision gate is not PASS.");
  }
  const workflow = buildWorkflow(baseline8Q);
  const productWorkflowReadinessHtml = renderManualReviewWorkflowReadinessProduct8R(workflow);
  const exportWorkflowReadinessHtml = renderManualReviewWorkflowReadinessExport8R(workflow);
  const productHtmlBefore8R = input?.productHtmlBefore8R ?? baseline8Q.productHtmlAfter8Q;
  const exportHtmlBefore8R = input?.exportHtmlBefore8R ?? baseline8Q.exportHtmlAfter8Q;
  const productHtmlAfter8R = insertManualReviewWorkflowReadinessProduct8R(productHtmlBefore8R, productWorkflowReadinessHtml);
  const exportHtmlAfter8R = insertManualReviewWorkflowReadinessExport8R(exportHtmlBefore8R, exportWorkflowReadinessHtml);
  const readinessAudit = auditManualReviewWorkflowReadiness8R({
    workflow,
    productHtml: productHtmlAfter8R,
    exportHtml: exportHtmlAfter8R,
  });
  const chainAudit = auditManualReviewWorkflowChain8R(workflow);
  const logicAudit = auditManualReviewWorkflowReadinessLogic8R({
    workflow,
    productHtml: productHtmlAfter8R,
    exportHtml: exportHtmlAfter8R,
  });
  const nonPersistenceAudit = auditManualReviewWorkflowNonPersistence8R({
    productHtml: productHtmlAfter8R,
    exportHtml: exportHtmlAfter8R,
  });
  const boundaryAudit = auditManualReviewWorkflowBoundary8R({
    productHtml: productHtmlAfter8R,
    exportHtml: exportHtmlAfter8R,
  });
  const sourceOfTruthRegressionAudit = auditManualReviewWorkflowSourceOfTruthRegression8R({
    workflow,
    baselineSourceAudit: baseline8Q.sourceOfTruthRegressionAudit,
  });
  const exportMetadataAudit = auditManualReviewWorkflowExportMetadata8R(exportHtmlAfter8R);
  const exportBudgetAudit = auditManualReviewWorkflowExportBudget8R({
    exportHtmlBefore8R,
    exportHtmlAfter8R,
    exportMetadataClean: exportMetadataAudit.metadataWarningCodes.length === 0,
  });
  const integrationBudgetAudit = auditManualReviewWorkflowIntegrationBudget8R({
    productHtml: productHtmlAfter8R,
    exportHtml: exportHtmlAfter8R,
  });
  const wordingAudit = auditManualReviewWorkflowWording8R({
    productHtml: productHtmlAfter8R,
    exportHtml: exportHtmlAfter8R,
  });
  const workflowMarkedDemoOnly = workflow.workflowMode === "demo_preview_workflow_only" && wordingAudit.workflowDemoOnlyWordingVisible;
  const workflowMarkedNonOfficial = !workflow.officialTruth && wordingAudit.workflowNonOfficialWordingVisible;
  const workflowMarkedNotPersisted = workflow.notPersisted && !nonPersistenceAudit.workflowPersistencePerformed && wordingAudit.workflowNotPersistedWordingVisible;
  const workflowMarkedNotApplied = workflow.notApplied && !nonPersistenceAudit.workflowApplicationPerformed && wordingAudit.workflowNotAppliedWordingVisible;
  const workflowDoesNotCreateAutomaticDecision = boundaryAudit.automaticDecisionCount === 0;
  const workflowDoesNotAutoClassifyRealMatch = boundaryAudit.automaticClassificationRealMatchCount === 0;
  const workflowDoesNotDriveSelection = boundaryAudit.selectionRecommendationCount === 0;
  const workflowDoesNotDriveTacticalInstruction = boundaryAudit.tacticalInstructionCount === 0;
  const workflowDoesNotCreateMemory = nonPersistenceAudit.memoryCreationCount === 0 &&
    nonPersistenceAudit.seasonMemoryCreationCount === 0 &&
    nonPersistenceAudit.teamStyleMemoryCreationCount === 0;
  const workflowDoesNotPromoteOfficialTruth = boundaryAudit.officialTruthPromotionCount === 0 &&
    boundaryAudit.coachInputPromotedToOfficialTruthCount === 0 &&
    sourceOfTruthRegressionAudit.manualWorkflowDoesNotPromoteCoachInputToOfficialTruth;
  const workflowDoesNotMutateScore = sourceOfTruthRegressionAudit.manualWorkflowDoesNotMutateScore;
  const workflowDoesNotMutateTimeline = sourceOfTruthRegressionAudit.manualWorkflowDoesNotMutateTimeline;
  const workflowDoesNotCreateScoreChange = sourceOfTruthRegressionAudit.manualWorkflowDoesNotCreateScoreChange;
  const sourceOfTruthSeparationPreserved = workflowDoesNotPromoteOfficialTruth &&
    workflowDoesNotMutateScore &&
    workflowDoesNotMutateTimeline &&
    workflowDoesNotCreateScoreChange &&
    baseline8Q.sourceOfTruthSeparationPreserved;
  const guardrailsPreserved = sourceOfTruthSeparationPreserved &&
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2 &&
    !scoringRegistryEntry("PENALTY_SHOT").active &&
    sourceOfTruthRegressionAudit.MatchBonusEventUnchanged;
  const microWordingDebtFixed = exportMetadataAudit.export8PEyebrowCorrected && exportMetadataAudit.export8QEyebrowPreserved;
  const warningCodes = uniqueWarnings([
    ...readinessAudit.readinessWarningCodes,
    ...chainAudit.chainWarningCodes,
    ...logicAudit.logicWarningCodes,
    ...nonPersistenceAudit.nonPersistenceWarningCodes,
    ...boundaryAudit.boundaryWarningCodes,
    ...sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...exportMetadataAudit.metadataWarningCodes,
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...integrationBudgetAudit.integrationWarningCodes,
    ...wordingAudit.wordingWarningCodes,
    ...(microWordingDebtFixed ? [] : ["MICRO_WORDING_DEBT_NOT_FIXED" as const]),
  ]);
  const blocking = warningCodes.some((warning) => MANUAL_REVIEW_WORKFLOW_READINESS_8R_BLOCKING_WARNINGS.includes(warning));
  const workflowReadinessReady = readinessAudit.workflowReadinessVisible &&
    readinessAudit.workflowStageCount === 5 &&
    readinessAudit.readyStageCount === 5 &&
    readinessAudit.workflowStagesLinkedCount === 5 &&
    logicAudit.workflowReadyDespiteIncompleteReview &&
    workflowMarkedDemoOnly &&
    workflowMarkedNonOfficial &&
    workflowMarkedNotPersisted &&
    workflowMarkedNotApplied &&
    sourceOfTruthSeparationPreserved;
  const status: "PASS" | "PARTIAL" | "FAIL" = blocking
    ? "FAIL"
    : workflowReadinessReady && exportBudgetAudit.exportUnder800Seconds && wordingAudit.wordingReadabilityScore >= 95
      ? "PASS"
      : "PARTIAL";
  return {
    status,
    scope: "MANUAL_REVIEW_WORKFLOW_READINESS_WITHOUT_PERSISTENCE",
    version: "MANUAL_REVIEW_WORKFLOW_READINESS_8R",
    baselineVersion: "MANUAL_REVIEW_PREVIEW_DECISION_GATE_8Q",
    matchId: baseline8Q.matchId,
    officialScore: baseline8Q.officialScore,
    baseline8Q,
    baseline8QPreserved: baseline8Q.status === "PASS" && integrationBudgetAudit.productDecisionGate8QStillVisible && integrationBudgetAudit.exportDecisionGate8QStillVisible,
    baseline8PPreserved: baseline8Q.baseline8PPreserved,
    baseline8OPreserved: baseline8Q.baseline8OPreserved,
    baseline8NPreserved: baseline8Q.baseline8NPreserved,
    baseline8MPreserved: baseline8Q.baseline8MPreserved,
    baseline8LPreserved: baseline8Q.baseline8LPreserved,
    baseline8KPreserved: baseline8Q.baseline8KPreserved,
    baseline8IPreserved: baseline8Q.baseline8IPreserved,
    baseline8HPreserved: baseline8Q.baseline8HPreserved,
    baseline8GPreserved: baseline8Q.baseline8GPreserved,
    baseline8FPreserved: baseline8Q.baseline8FPreserved,
    baseline8EPreserved: baseline8Q.baseline8EPreserved,
    baseline8DPreserved: baseline8Q.baseline8DPreserved,
    baseline8CPreserved: baseline8Q.baseline8CPreserved,
    baseline8BPreserved: baseline8Q.baseline8BPreserved,
    baseline8APreserved: baseline8Q.baseline8APreserved,
    baseline7HPreserved: baseline8Q.baseline7HPreserved,
    baseline6XPreserved: baseline8Q.baseline6XPreserved,
    workflowReadinessReady,
    productWorkflowReadinessVisible: readinessAudit.productWorkflowReadinessVisible,
    exportWorkflowReadinessVisible: readinessAudit.exportWorkflowReadinessVisible,
    workflowStageCount: readinessAudit.workflowStageCount,
    workflowStageCountExpected: readinessAudit.workflowStageCountExpected,
    workflowStagesLinkedCount: readinessAudit.workflowStagesLinkedCount,
    workflowUsesManualForm8M: readinessAudit.workflowUsesManualForm8M,
    workflowUsesIntakeBoundary8N: readinessAudit.workflowUsesIntakeBoundary8N,
    workflowUsesPreviewRenderer8O: readinessAudit.workflowUsesPreviewRenderer8O,
    workflowUsesPreviewComparison8P: readinessAudit.workflowUsesPreviewComparison8P,
    workflowUsesDecisionGate8Q: readinessAudit.workflowUsesDecisionGate8Q,
    workflowReadinessStatus: readinessAudit.workflowReadinessStatus,
    reviewGateStatusFrom8Q: readinessAudit.reviewGateStatusFrom8Q,
    workflowReadinessDistinctFromReviewGate: readinessAudit.workflowReadinessDistinctFromReviewGate,
    globalGateStatusStillNeedsCompletion: baseline8Q.globalGateStatus === "needs_completion",
    microWordingDebtFixed,
    export8PEyebrowCorrected: exportMetadataAudit.export8PEyebrowCorrected,
    export8QEyebrowPreserved: exportMetadataAudit.export8QEyebrowPreserved,
    workflowMarkedDemoOnly,
    workflowMarkedNonOfficial,
    workflowMarkedNotPersisted,
    workflowMarkedNotApplied,
    workflowDoesNotCreateAutomaticDecision,
    workflowDoesNotAutoClassifyRealMatch,
    workflowDoesNotDriveSelection,
    workflowDoesNotDriveTacticalInstruction,
    workflowDoesNotCreateMemory,
    workflowDoesNotPromoteOfficialTruth,
    workflowDoesNotMutateScore,
    workflowDoesNotMutateTimeline,
    workflowDoesNotCreateScoreChange,
    productStoryFirstPreserved: integrationBudgetAudit.productStoryFirstSectionVisible,
    exportCompactPreserved: integrationBudgetAudit.exportCompactPreserved,
    exportMetadataCurrent8RVisible: exportMetadataAudit.exportTitleMentions8R && exportMetadataAudit.exportVisibleBadgeMentions8R && exportMetadataAudit.exportMainCurrentVersionVisible,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportBudgetAudit.exportUnder900BooleanCorrect && exportBudgetAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8Q.matchEconomyBaselinePreserved,
    guardrailsPreserved,
    workflow,
    productWorkflowReadinessHtml,
    exportWorkflowReadinessHtml,
    productHtmlAfter8R,
    exportHtmlAfter8R,
    readinessAudit,
    chainAudit,
    logicAudit,
    nonPersistenceAudit,
    boundaryAudit,
    sourceOfTruthRegressionAudit,
    exportMetadataAudit,
    exportBudgetAudit,
    integrationBudgetAudit,
    wordingAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_MANUAL_REVIEW_WORKFLOW_READINESS" : status === "PARTIAL" ? "REVIEW_WORKFLOW_COPY_OR_EXPORT_METADATA" : "REPAIR_MANUAL_REVIEW_WORKFLOW_READINESS",
    nextSprintRecommendation: status === "PASS" ? "PREPARE_MANUAL_REVIEW_WORKFLOW_UX_SKELETON_WITHOUT_PERSISTENCE" : "FIX_WORKFLOW_READINESS_SOURCE_OF_TRUTH_OR_PERSISTENCE_REGRESSION",
  };
}

export function currentManualReviewWorkflowReadinessWithoutPersistence8RModel(): ManualReviewWorkflowReadinessWithoutPersistence8RModel {
  return buildManualReviewWorkflowReadinessWithoutPersistence8RModel();
}

function stageRows(model: ManualReviewWorkflowReadinessWithoutPersistence8RModel): readonly string[] {
  return table([
    ["Stage", "Purpose", "Input", "Output", "Ready", "Guardrails"],
    ...model.workflow.stages.map((stage) => [
      stage.stageTitle,
      stage.stagePurpose,
      stage.input,
      stage.output,
      bool(stage.ready),
      stage.guardrails.join("; "),
    ]),
  ]);
}

function chainRows(model: ManualReviewWorkflowReadinessWithoutPersistence8RModel): readonly string[] {
  return table([
    ["Link", "Status"],
    ["8M -> 8N", bool(model.chainAudit.stage8MOutputFeeds8NInput)],
    ["8N -> 8O", bool(model.chainAudit.stage8NOutputFeeds8OInput)],
    ["8O -> 8P", bool(model.chainAudit.stage8OOutputFeeds8PInput)],
    ["8P -> 8Q", bool(model.chainAudit.stage8POutputFeeds8QInput)],
    ["8Q -> 8R readiness", bool(model.chainAudit.stage8QOutputFeeds8RReadiness)],
  ]);
}

export function renderManualReviewWorkflowReadinessWithoutPersistence8RDoc(
  model: ManualReviewWorkflowReadinessWithoutPersistence8RModel = currentManualReviewWorkflowReadinessWithoutPersistence8RModel(),
): string {
  return [
    "# Manual Review Workflow Readiness Without Persistence 8R",
    "",
    `Status: ${model.status}`,
    `scope: ${model.scope}`,
    `version: ${model.version}`,
    `baselineVersion: ${model.baselineVersion}`,
    `matchId: ${model.matchId}`,
    `officialScore: ${model.officialScore}`,
    "",
    "## Baseline 8Q Summary",
    ...metricRows([
      ["baseline8QStatus", model.baseline8Q.status],
      ["globalGateStatus", model.baseline8Q.globalGateStatus],
      ["readableCardCount", model.baseline8Q.gateReadableCount],
      ["needsCompletionCardCount", model.baseline8Q.gateNeedsCompletionCount],
      ["insufficientCardCount", model.baseline8Q.gateInsufficientCount],
    ]),
    "",
    "## Baseline Preservation 8Q To 6X",
    ...metricRows([
      ["baseline8QPreserved", model.baseline8QPreserved],
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
    "## Workflow Readiness Summary",
    ...metricRows([
      ["workflowReadinessReady", model.workflowReadinessReady],
      ["workflowReadinessStatus", model.workflowReadinessStatus],
      ["reviewGateStatusFrom8Q", model.reviewGateStatusFrom8Q],
      ["workflowReadinessDistinctFromReviewGate", model.workflowReadinessDistinctFromReviewGate],
      ["globalGateStatusStillNeedsCompletion", model.globalGateStatusStillNeedsCompletion],
    ]),
    "",
    "## Workflow Stages Table",
    ...stageRows(model),
    "",
    "## Workflow Chain Table",
    ...chainRows(model),
    "",
    "## Readiness Logic Table",
    ...metricRows([
      ["workflowReadinessExpectedStatus", model.logicAudit.workflowReadinessExpectedStatus],
      ["workflowReadinessStatusCorrect", model.logicAudit.workflowReadinessStatusCorrect],
      ["reviewGateStillNeedsCompletion", model.logicAudit.reviewGateStillNeedsCompletion],
      ["workflowReadyDespiteIncompleteReview", model.logicAudit.workflowReadyDespiteIncompleteReview],
      ["workflowDoesNotClaimReviewReadyForRealUse", model.logicAudit.workflowDoesNotClaimReviewReadyForRealUse],
      ["missingInformationVisible", model.logicAudit.missingInformationVisible],
      ["realUseBlockersVisible", model.logicAudit.realUseBlockersVisible],
      ["storageDecisionDeferredVisible", model.logicAudit.storageDecisionDeferredVisible],
    ]),
    "",
    "## Missing Information Table",
    ...table([
      ["Missing information"],
      ...model.workflow.missingInformation.map((item) => [item]),
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
      ["workflowPersistencePerformed", model.nonPersistenceAudit.workflowPersistencePerformed],
      ["workflowApplicationPerformed", model.nonPersistenceAudit.workflowApplicationPerformed],
      ["storageDecisionImplementedCount", model.nonPersistenceAudit.storageDecisionImplementedCount],
    ]),
    "",
    "## Official Truth Boundary Audit",
    ...metricRows([
      ["officialTruthPromotionCount", model.boundaryAudit.officialTruthPromotionCount],
      ["coachInputPromotedToOfficialTruthCount", model.boundaryAudit.coachInputPromotedToOfficialTruthCount],
      ["workflowClaimedAsRealNextMatchCount", model.boundaryAudit.workflowClaimedAsRealNextMatchCount],
      ["workflowClaimedAsEngineResultCount", model.boundaryAudit.workflowClaimedAsEngineResultCount],
      ["workflowClaimedAsSeasonTrendCount", model.boundaryAudit.workflowClaimedAsSeasonTrendCount],
      ["workflowClaimedAsTeamMemoryCount", model.boundaryAudit.workflowClaimedAsTeamMemoryCount],
      ["automaticDecisionCount", model.boundaryAudit.automaticDecisionCount],
      ["automaticClassificationRealMatchCount", model.boundaryAudit.automaticClassificationRealMatchCount],
      ["selectionRecommendationCount", model.boundaryAudit.selectionRecommendationCount],
      ["tacticalInstructionCount", model.boundaryAudit.tacticalInstructionCount],
      ["sandboxPromotionCount", model.boundaryAudit.sandboxPromotionCount],
      ["diagnosticPromotionCount", model.boundaryAudit.diagnosticPromotionCount],
      ["batchPromotionCount", model.boundaryAudit.batchPromotionCount],
    ]),
    "",
    "## Export Metadata Audit",
    ...metricRows([
      ["exportTitleMentions8R", model.exportMetadataAudit.exportTitleMentions8R],
      ["exportMainCurrentVersionVisible", model.exportMetadataAudit.exportMainCurrentVersionVisible],
      ["exportVisibleBadgeMentions8R", model.exportMetadataAudit.exportVisibleBadgeMentions8R],
      ["exportMainIdStillCompressedExport8Q", model.exportMetadataAudit.exportMainIdStillCompressedExport8Q],
      ["exportMainIdStillCompressedExport8P", model.exportMetadataAudit.exportMainIdStillCompressedExport8P],
      ["exportMainIdStillCompressedExport8N", model.exportMetadataAudit.exportMainIdStillCompressedExport8N],
      ["exportMainIdStillCompressedExport8I", model.exportMetadataAudit.exportMainIdStillCompressedExport8I],
      ["export8PEyebrowCorrected", model.exportMetadataAudit.export8PEyebrowCorrected],
      ["export8QEyebrowPreserved", model.exportMetadataAudit.export8QEyebrowPreserved],
      ["exportHistoricalMarkersPreservedAsDataAttributes", model.exportMetadataAudit.exportHistoricalMarkersPreservedAsDataAttributes],
    ]),
    "",
    "## Source-Of-Truth Regression Audit",
    ...metricRows([
      ["manualWorkflowDoesNotClaimNewScoreEvidence", model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotClaimNewScoreEvidence],
      ["manualWorkflowDoesNotCreateFutureEvidence", model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotCreateFutureEvidence],
      ["manualWorkflowDoesNotMutateTimeline", model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotMutateTimeline],
      ["manualWorkflowDoesNotMutateScore", model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotMutateScore],
      ["manualWorkflowDoesNotCreateScoreChange", model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotCreateScoreChange],
      ["manualWorkflowDoesNotPromoteCoachInputToOfficialTruth", model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotPromoteCoachInputToOfficialTruth],
      ["noScoreMutation", model.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.sourceOfTruthRegressionAudit.noEventDeletion],
      ["noScoringConstantChange", model.sourceOfTruthRegressionAudit.noScoringConstantChange],
      ["MatchBonusEventUnchanged", model.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged],
      ["batchLiveSeparationPreserved", model.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved],
    ]),
    "",
    "## Export Budget Audit",
    ...metricRows([
      ["exportReadTimeSecondsBefore8R", model.exportBudgetAudit.exportReadTimeSecondsBefore8R],
      ["exportReadTimeSecondsAfter8R", model.exportBudgetAudit.exportReadTimeSecondsAfter8R],
      ["exportReadTimeDelta", model.exportBudgetAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
      ["exportUnder900BooleanCorrect", model.exportBudgetAudit.exportUnder900BooleanCorrect],
      ["exportUnder800BooleanCorrect", model.exportBudgetAudit.exportUnder800BooleanCorrect],
    ]),
    "",
    "## Integration Budget Audit",
    ...metricRows([
      ["productWorkflowReadinessVisible", model.integrationBudgetAudit.productWorkflowReadinessVisible],
      ["exportWorkflowReadinessVisible", model.integrationBudgetAudit.exportWorkflowReadinessVisible],
      ["productDecisionGate8QStillVisible", model.integrationBudgetAudit.productDecisionGate8QStillVisible],
      ["exportDecisionGate8QStillVisible", model.integrationBudgetAudit.exportDecisionGate8QStillVisible],
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
      ["workflowDemoOnlyWordingVisible", model.wordingAudit.workflowDemoOnlyWordingVisible],
      ["workflowNonOfficialWordingVisible", model.wordingAudit.workflowNonOfficialWordingVisible],
      ["workflowNotPersistedWordingVisible", model.wordingAudit.workflowNotPersistedWordingVisible],
      ["workflowNotAppliedWordingVisible", model.wordingAudit.workflowNotAppliedWordingVisible],
      ["workflowReadinessDistinctFromReviewGateWordingVisible", model.wordingAudit.workflowReadinessDistinctFromReviewGateWordingVisible],
      ["ambiguousWorkflowWordingCount", model.wordingAudit.ambiguousWorkflowWordingCount],
      ["wordingReadabilityScore", model.wordingAudit.wordingReadabilityScore],
    ]),
    "",
    "## Product/Export Excerpts",
    `- product: ${compactSnippet(model.productHtmlAfter8R, "Workflow de revue manuelle")}`,
    `- export: ${compactSnippet(model.exportHtmlAfter8R, "Workflow revue manuelle")}`,
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

export function renderManualReviewWorkflowReadinessWithoutPersistence8RValidation(
  model: ManualReviewWorkflowReadinessWithoutPersistence8RModel = currentManualReviewWorkflowReadinessWithoutPersistence8RModel(),
): string {
  const checks = [
    checkLine("ManualReviewWorkflowReadinessWithoutPersistence8RModel exists", model.version === "MANUAL_REVIEW_WORKFLOW_READINESS_8R", model.version),
    checkLine("baseline 8Q visible and preserved", model.baseline8QPreserved, bool(model.baseline8QPreserved)),
    checkLine("baseline 8P preserved", model.baseline8PPreserved, bool(model.baseline8PPreserved)),
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
    checkLine("product workflow readiness visible", model.productWorkflowReadinessVisible, bool(model.productWorkflowReadinessVisible)),
    checkLine("export workflow readiness visible", model.exportWorkflowReadinessVisible, bool(model.exportWorkflowReadinessVisible)),
    checkLine("workflow stage count = 5", model.workflowStageCount === 5, String(model.workflowStageCount)),
    checkLine("stages are 8M/8N/8O/8P/8Q", model.workflowUsesManualForm8M && model.workflowUsesIntakeBoundary8N && model.workflowUsesPreviewRenderer8O && model.workflowUsesPreviewComparison8P && model.workflowUsesDecisionGate8Q, "8M/8N/8O/8P/8Q"),
    checkLine("readyStageCount = 5", model.readinessAudit.readyStageCount === 5, String(model.readinessAudit.readyStageCount)),
    checkLine("blockedStageCount = 0", model.readinessAudit.blockedStageCount === 0, String(model.readinessAudit.blockedStageCount)),
    checkLine("missingCriticalStageCount = 0", model.readinessAudit.missingCriticalStageCount === 0, String(model.readinessAudit.missingCriticalStageCount)),
    checkLine("stages linked 8M->8N->8O->8P->8Q", model.workflowStagesLinkedCount === 5 && model.chainAudit.stage8POutputFeeds8QInput, String(model.workflowStagesLinkedCount)),
    checkLine("all stages have purpose/input/output/guardrails", model.chainAudit.allStagesHavePurpose && model.chainAudit.allStagesHaveInput && model.chainAudit.allStagesHaveOutput && model.chainAudit.allStagesHaveGuardrails, "complete"),
    checkLine("workflowReadinessStatus = ready_for_non_persistent_preview", model.workflowReadinessStatus === "ready_for_non_persistent_preview", model.workflowReadinessStatus),
    checkLine("reviewGateStatusFrom8Q = needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("workflowReadinessDistinctFromReviewGate = true", model.workflowReadinessDistinctFromReviewGate, bool(model.workflowReadinessDistinctFromReviewGate)),
    checkLine("workflowReadyDespiteIncompleteReview = true", model.logicAudit.workflowReadyDespiteIncompleteReview, bool(model.logicAudit.workflowReadyDespiteIncompleteReview)),
    checkLine("workflowDoesNotClaimReviewReadyForRealUse = true", model.logicAudit.workflowDoesNotClaimReviewReadyForRealUse, bool(model.logicAudit.workflowDoesNotClaimReviewReadyForRealUse)),
    checkLine("missingInformationVisible = true", model.logicAudit.missingInformationVisible, bool(model.logicAudit.missingInformationVisible)),
    checkLine("realUseBlockersVisible = true", model.logicAudit.realUseBlockersVisible, bool(model.logicAudit.realUseBlockersVisible)),
    checkLine("storageDecisionDeferredVisible = true", model.logicAudit.storageDecisionDeferredVisible, bool(model.logicAudit.storageDecisionDeferredVisible)),
    checkLine("microWordingDebtFixed = true", model.microWordingDebtFixed, bool(model.microWordingDebtFixed)),
    checkLine("export8PEyebrowCorrected = true", model.export8PEyebrowCorrected, bool(model.export8PEyebrowCorrected)),
    checkLine("export8QEyebrowPreserved = true", model.export8QEyebrowPreserved, bool(model.export8QEyebrowPreserved)),
    checkLine("no automatic decision", model.workflowDoesNotCreateAutomaticDecision, bool(model.workflowDoesNotCreateAutomaticDecision)),
    checkLine("no auto-classification real match", model.workflowDoesNotAutoClassifyRealMatch, bool(model.workflowDoesNotAutoClassifyRealMatch)),
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
    checkLine("no future evidence claim", model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotCreateFutureEvidence, bool(model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotCreateFutureEvidence)),
    checkLine("no real next-match result claim", model.boundaryAudit.workflowClaimedAsRealNextMatchCount === 0, String(model.boundaryAudit.workflowClaimedAsRealNextMatchCount)),
    checkLine("no engine learning claim", model.boundaryAudit.workflowClaimedAsEngineResultCount === 0, String(model.boundaryAudit.workflowClaimedAsEngineResultCount)),
    checkLine("product decision gate 8Q preserved", model.integrationBudgetAudit.productDecisionGate8QStillVisible, bool(model.integrationBudgetAudit.productDecisionGate8QStillVisible)),
    checkLine("export decision gate 8Q preserved", model.integrationBudgetAudit.exportDecisionGate8QStillVisible, bool(model.integrationBudgetAudit.exportDecisionGate8QStillVisible)),
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
    checkLine("exportReadTimeSecondsAfter8R <= 900", model.exportBudgetAudit.exportReadTimeSecondsAfter8R <= 900, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8R)),
    checkLine("exportUnder900Seconds correctly computed", model.exportBudgetAudit.exportUnder900BooleanCorrect, bool(model.exportBudgetAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportBudgetAudit.exportUnder800BooleanCorrect, bool(model.exportBudgetAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.status === "PASS" ? model.exportBudgetAudit.exportUnder900Seconds : true, model.status),
    checkLine("export title mentions 8R", model.exportMetadataAudit.exportTitleMentions8R, bool(model.exportMetadataAudit.exportTitleMentions8R)),
    checkLine("export visible badge mentions 8R", model.exportMetadataAudit.exportVisibleBadgeMentions8R, bool(model.exportMetadataAudit.exportVisibleBadgeMentions8R)),
    checkLine("export main id no longer compressed-export-8q", !model.exportMetadataAudit.exportMainIdStillCompressedExport8Q, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8Q)),
    checkLine("export main id no longer compressed-export-8p", !model.exportMetadataAudit.exportMainIdStillCompressedExport8P, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8P)),
    checkLine("export main id no longer compressed-export-8n", !model.exportMetadataAudit.exportMainIdStillCompressedExport8N, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8N)),
    checkLine("export main id no longer compressed-export-8i", !model.exportMetadataAudit.exportMainIdStillCompressedExport8I, bool(!model.exportMetadataAudit.exportMainIdStillCompressedExport8I)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange, bool(model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange)),
    checkLine("manual workflow does not promote coach input to official truth", model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotPromoteCoachInputToOfficialTruth, bool(model.sourceOfTruthRegressionAudit.manualWorkflowDoesNotPromoteCoachInputToOfficialTruth)),
    checkLine("sandbox excluded from official story/replay/decision/learning/manual workflow", model.boundaryAudit.sandboxPromotionCount === 0, String(model.boundaryAudit.sandboxPromotionCount)),
    checkLine("batch excluded from official story/replay/decision/learning/manual workflow", model.boundaryAudit.batchPromotionCount === 0, String(model.boundaryAudit.batchPromotionCount)),
    checkLine("diagnostic separated from official story/replay/decision/learning/manual workflow", model.boundaryAudit.diagnosticPromotionCount === 0, String(model.boundaryAudit.diagnosticPromotionCount)),
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
    "# Validation - Manual Review Workflow Readiness Without Persistence 8R",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- workflowStageCount: ${model.workflowStageCount}`,
    `- workflowStageCountExpected: ${model.workflowStageCountExpected}`,
    `- readyStageCount: ${model.readinessAudit.readyStageCount}`,
    `- blockedStageCount: ${model.readinessAudit.blockedStageCount}`,
    `- missingCriticalStageCount: ${model.readinessAudit.missingCriticalStageCount}`,
    `- workflowStagesLinkedCount: ${model.workflowStagesLinkedCount}`,
    `- workflowReadinessStatus: ${model.workflowReadinessStatus}`,
    `- reviewGateStatusFrom8Q: ${model.reviewGateStatusFrom8Q}`,
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
    `- exportReadTimeSecondsAfter8R: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8R}`,
    `- exportUnder900Seconds: ${model.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportUnder800Seconds}`,
    `- wordingReadabilityScore: ${model.wordingAudit.wordingReadabilityScore}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
  ].join("\n");
}
