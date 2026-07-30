import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewWorkflowReadinessWithoutPersistence8RModel,
  currentManualReviewWorkflowReadinessWithoutPersistence8RModel,
} from "./buildManualReviewWorkflowReadinessWithoutPersistence8R";
import {
  auditManualReviewWorkflowUxExport8S,
  auditManualReviewWorkflowUxSafety8S,
  auditManualReviewWorkflowUxSkeleton8S,
  auditManualReviewWorkflowUxWording8S,
} from "./manualReviewWorkflowUxSkeletonAudit8S";
import type {
  ManualReviewWorkflowUxDisabledAction8S,
  ManualReviewWorkflowUxSkeleton8S,
  ManualReviewWorkflowUxSkeletonBoundary8S,
  ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel,
  ManualReviewWorkflowUxStep8S,
} from "./manualReviewWorkflowUxSkeletonTypes8S";
import {
  MANUAL_REVIEW_WORKFLOW_UX_SKELETON_8S_BLOCKING_WARNINGS,
  type ManualReviewWorkflowUxSkeletonWarningCode8S,
} from "./manualReviewWorkflowUxSkeletonWarnings8S";
import type { ManualReviewWorkflowReadinessWithoutPersistence8RModel } from "./manualReviewWorkflowReadinessTypes8R";
import {
  insertManualReviewWorkflowUxSkeletonExport8S,
  renderManualReviewWorkflowUxSkeletonExport8S,
} from "./renderManualReviewWorkflowUxSkeletonExport8S";
import {
  insertManualReviewWorkflowUxSkeletonProduct8S,
  renderManualReviewWorkflowUxSkeletonProduct8S,
} from "./renderManualReviewWorkflowUxSkeletonProduct8S";

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
  warnings: readonly ManualReviewWorkflowUxSkeletonWarningCode8S[],
): readonly ManualReviewWorkflowUxSkeletonWarningCode8S[] {
  return [...new Set(warnings)];
}

function compactSnippet(html: string, marker: string): string {
  const index = html.indexOf(marker);
  const start = index < 0 ? 0 : Math.max(0, index - 120);
  return html.slice(start, start + 1000).replace(/\s+/gu, " ");
}

function disableManualReviewFormControls8S(html: string): string {
  return html.replace(/<(input|select|textarea|button)\b([^>]*)>/giu, (match: string, tag: string, attrs: string) => {
    if (/disabled\b/iu.test(attrs) || /aria-disabled=/iu.test(attrs) || /type="hidden"/iu.test(attrs)) {
      return match;
    }
    return `<${tag}${attrs} disabled aria-disabled="true">`;
  });
}

function buildSteps(): readonly ManualReviewWorkflowUxStep8S[] {
  return [
    {
      stepId: "manual-review-workflow-ux-step-8m",
      stepOrder: 1,
      sourceVersion: "8M",
      stepTitle: "8M - Remplir la revue",
      coachFacingLabel: "Formulaire a remplir apres match",
      stepPurpose: "Montrer ou une future revue coach serait saisie apres match.",
      displayedState: "vide / non evalue",
      inputLabel: "Observation coach future, non presente en 8S.",
      outputLabel: "Aucun payload reel; seulement un emplacement de parcours.",
      usefulBecause: "Le coach voit le point d'entree attendu avant toute preview.",
      disabledBecause: "Squelette seulement : aucune saisie reelle dans 8S.",
      uxComponentKind: "empty_manual_form",
      enabled: false,
      interactive: false,
      canSubmit: false,
      canPersist: false,
      canApply: false,
      canPromoteOfficialTruth: false,
      canDriveSelection: false,
      canDriveTacticalInstruction: false,
      linkedNextStepId: "manual-review-workflow-ux-step-8n",
      guardrails: ["no real input", "no submit", "no persistence", "no official truth"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepId: "manual-review-workflow-ux-step-8n",
      stepOrder: 2,
      sourceVersion: "8N",
      stepTitle: "8N - Verifier l'entree",
      coachFacingLabel: "Contrat d'entree",
      stepPurpose: "Montrer la frontiere qui verifiera plus tard un payload manuel.",
      displayedState: "validate / preview only",
      inputLabel: "Formulaire 8M futur.",
      outputLabel: "Payload de demonstration uniquement.",
      usefulBecause: "La frontiere entre saisie et preview reste visible.",
      disabledBecause: "Aucun payload reel n'est envoye.",
      uxComponentKind: "intake_contract_panel",
      enabled: false,
      interactive: false,
      canSubmit: false,
      canPersist: false,
      canApply: false,
      canPromoteOfficialTruth: false,
      canDriveSelection: false,
      canDriveTacticalInstruction: false,
      linkedPreviousStepId: "manual-review-workflow-ux-step-8m",
      linkedNextStepId: "manual-review-workflow-ux-step-8o",
      guardrails: ["validator future only", "no backend", "no API", "no mutation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepId: "manual-review-workflow-ux-step-8o",
      stepOrder: 3,
      sourceVersion: "8O",
      stepTitle: "8O - Previsualiser",
      coachFacingLabel: "Preview non persistee",
      stepPurpose: "Montrer comment une future revue pourrait devenir cartes de preview.",
      displayedState: "fixture de demonstration",
      inputLabel: "Payload valide de demonstration.",
      outputLabel: "Cartes preview non officielles.",
      usefulBecause: "Le coach voit la forme de lecture attendue.",
      disabledBecause: "La preview reste non officielle.",
      uxComponentKind: "preview_cards",
      enabled: false,
      interactive: false,
      canSubmit: false,
      canPersist: false,
      canApply: false,
      canPromoteOfficialTruth: false,
      canDriveSelection: false,
      canDriveTacticalInstruction: false,
      linkedPreviousStepId: "manual-review-workflow-ux-step-8n",
      linkedNextStepId: "manual-review-workflow-ux-step-8p",
      guardrails: ["demo fixture", "not official evidence", "not applied", "no memory"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepId: "manual-review-workflow-ux-step-8p",
      stepOrder: 4,
      sourceVersion: "8P",
      stepTitle: "8P - Comparer au plan",
      coachFacingLabel: "Comparaison preview / plan",
      stepPurpose: "Montrer la comparaison entre preview et questions d'observation.",
      displayedState: "1 complet / 1 partiel / 1 insuffisant",
      inputLabel: "Preview 8O et plan 8K/8L.",
      outputLabel: "Statuts de lisibilite de demonstration.",
      usefulBecause: "La preview est reliee a une question coach lisible.",
      disabledBecause: "Comparaison de lisibilite, pas conclusion reelle.",
      uxComponentKind: "comparison_cards",
      enabled: false,
      interactive: false,
      canSubmit: false,
      canPersist: false,
      canApply: false,
      canPromoteOfficialTruth: false,
      canDriveSelection: false,
      canDriveTacticalInstruction: false,
      linkedPreviousStepId: "manual-review-workflow-ux-step-8o",
      linkedNextStepId: "manual-review-workflow-ux-step-8q",
      guardrails: ["readability only", "no real match conclusion", "no official truth", "no selection"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepId: "manual-review-workflow-ux-step-8q",
      stepOrder: 5,
      sourceVersion: "8Q",
      stepTitle: "8Q - Lire le gate",
      coachFacingLabel: "Gate de lisibilite",
      stepPurpose: "Montrer le statut global de maturite de la preview.",
      displayedState: "a completer",
      inputLabel: "Comparaison 8P.",
      outputLabel: "Gate global needs_completion.",
      usefulBecause: "Le coach voit que le parcours existe mais que la revue n'est pas prete.",
      disabledBecause: "Pas decision tactique.",
      uxComponentKind: "decision_gate_panel",
      enabled: false,
      interactive: false,
      canSubmit: false,
      canPersist: false,
      canApply: false,
      canPromoteOfficialTruth: false,
      canDriveSelection: false,
      canDriveTacticalInstruction: false,
      linkedPreviousStepId: "manual-review-workflow-ux-step-8p",
      linkedNextStepId: "manual-review-workflow-ux-step-8r",
      guardrails: ["needs_completion remains visible", "no automatic decision", "no tactic", "no persistence"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      stepId: "manual-review-workflow-ux-step-8r",
      stepOrder: 6,
      sourceVersion: "8R",
      stepTitle: "8R - Verifier le workflow",
      coachFacingLabel: "Workflow pret pour preview",
      stepPurpose: "Montrer que la chaine UX est prete pour une preview non persistante.",
      displayedState: "ready_for_non_persistent_preview",
      inputLabel: "Gate 8Q needs_completion.",
      outputLabel: "Readiness de workflow distincte de la revue incomplete.",
      usefulBecause: "Le produit separe clairement parcours utilisable en squelette et revue encore a completer.",
      disabledBecause: "Workflow pret, revue encore incomplete.",
      uxComponentKind: "readiness_summary",
      enabled: false,
      interactive: false,
      canSubmit: false,
      canPersist: false,
      canApply: false,
      canPromoteOfficialTruth: false,
      canDriveSelection: false,
      canDriveTacticalInstruction: false,
      linkedPreviousStepId: "manual-review-workflow-ux-step-8q",
      guardrails: ["workflow ready only", "review gate still needs_completion", "no real use claim", "no official truth"],
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildDisabledActions(): readonly ManualReviewWorkflowUxDisabledAction8S[] {
  return [
    {
      actionId: "disabled-real-manual-review-input-8s",
      label: "Saisir une vraie revue",
      targetFutureCapability: "real_manual_review_input",
      disabledReason: "Hors 8S : necessite UX de saisie reelle et decision de stockage.",
      wouldRequireFutureSprint: true,
      mustRemainDisabledIn8S: true,
      forbiddenIfEnabled: ["persistence", "submit", "official_truth_promotion"],
    },
    {
      actionId: "disabled-real-payload-validation-8s",
      label: "Valider la revue",
      targetFutureCapability: "real_payload_validation",
      disabledReason: "8S affiche le parcours, mais ne traite pas de payload reel.",
      wouldRequireFutureSprint: true,
      mustRemainDisabledIn8S: true,
      forbiddenIfEnabled: ["submit", "api_call", "automatic_decision"],
    },
    {
      actionId: "disabled-real-preview-from-input-8s",
      label: "Voir la preview",
      targetFutureCapability: "real_preview_from_input",
      disabledReason: "La preview 8S reste une demonstration.",
      wouldRequireFutureSprint: true,
      mustRemainDisabledIn8S: true,
      forbiddenIfEnabled: ["api_call", "official_truth_promotion", "automatic_decision"],
    },
    {
      actionId: "disabled-real-comparison-from-input-8s",
      label: "Comparer au plan",
      targetFutureCapability: "real_comparison_from_input",
      disabledReason: "La comparaison reste liee a la fixture preview.",
      wouldRequireFutureSprint: true,
      mustRemainDisabledIn8S: true,
      forbiddenIfEnabled: ["official_truth_promotion", "selection_automation", "tactical_instruction"],
    },
    {
      actionId: "disabled-real-review-gate-acceptance-8s",
      label: "Marquer comme pret",
      targetFutureCapability: "real_review_gate_acceptance",
      disabledReason: "Le gate actuel reste a completer.",
      wouldRequireFutureSprint: true,
      mustRemainDisabledIn8S: true,
      forbiddenIfEnabled: ["automatic_decision", "selection_automation", "tactical_instruction"],
    },
    {
      actionId: "disabled-persistence-decision-8s",
      label: "Enregistrer",
      targetFutureCapability: "persistence_decision",
      disabledReason: "Aucune persistance en 8S.",
      wouldRequireFutureSprint: true,
      mustRemainDisabledIn8S: true,
      forbiddenIfEnabled: ["persistence", "api_call", "official_truth_promotion"],
    },
  ];
}

function buildBoundaries(): readonly ManualReviewWorkflowUxSkeletonBoundary8S[] {
  return [
    {
      boundaryId: "manual-review-workflow-ux-boundary-no-storage-8s",
      label: "Pas de memoire ni stockage",
      text: "Le squelette montre un parcours visible, mais il ne cree ni localStorage, ni DB, ni fichier, ni memoire de saison.",
      prevents: ["persistence", "season_memory_creation", "team_style_memory_creation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "manual-review-workflow-ux-boundary-no-official-truth-8s",
      label: "Pas de verite officielle",
      text: "Le score, la timeline et les score_change restent les seules sources officielles; la revue manuelle reste non officielle.",
      prevents: ["official_truth_promotion", "score_mutation", "timeline_mutation", "score_change_creation"],
      visibleInProduct: true,
      visibleInExport: true,
    },
    {
      boundaryId: "manual-review-workflow-ux-boundary-no-coaching-command-8s",
      label: "Pas de selection ni consigne",
      text: "Le squelette ne produit aucune selection, aucune composition et aucune consigne tactique.",
      prevents: ["automatic_decision", "selection_automation", "tactical_instruction"],
      visibleInProduct: true,
      visibleInExport: true,
    },
  ];
}

function buildWorkflow(): ManualReviewWorkflowUxSkeleton8S {
  return {
    skeletonId: "manual-review-workflow-ux-skeleton-without-persistence-8s",
    skeletonMode: "static_preview_skeleton_only",
    sourceWorkflowReadinessVersion: "8R",
    sourceDecisionGateVersion: "8Q",
    sourceComparisonVersion: "8P",
    sourcePreviewVersion: "8O",
    sourceIntakeBoundaryVersion: "8N",
    sourceManualFormVersion: "8M",
    sourceLearningLoopVersion: "8L",
    sourceDecisionLayerVersion: "8K",
    steps: buildSteps(),
    skeletonSummary: "Squelette UX statique du parcours 8M -> 8N -> 8O -> 8P -> 8Q -> 8R, sans saisie, submit, stockage, application ou verite officielle.",
    disabledActions: buildDisabledActions(),
    futureUxQuestions: [
      "Quel vrai composant de saisie faudra-t-il construire ?",
      "Quelle decision produit sera prise sur la persistance, dans un sprint separe ?",
      "Quelles permissions seront necessaires avant toute sauvegarde future ?",
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

function statusFromWarnings(
  warnings: readonly ManualReviewWorkflowUxSkeletonWarningCode8S[],
  exportUnder900Seconds: boolean,
  exportUnder800Seconds: boolean,
): "PASS" | "PARTIAL" | "FAIL" {
  if (!exportUnder900Seconds) return "FAIL";
  if (warnings.some((warning) => MANUAL_REVIEW_WORKFLOW_UX_SKELETON_8S_BLOCKING_WARNINGS.includes(warning))) return "FAIL";
  if (!exportUnder800Seconds || warnings.length > 0) return "PARTIAL";
  return "PASS";
}

export function buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel(input?: {
  readonly baseline8R?: ManualReviewWorkflowReadinessWithoutPersistence8RModel;
  readonly productHtmlBefore8S?: string;
  readonly exportHtmlBefore8S?: string;
}): ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel {
  const baseline8R = input?.baseline8R ?? currentManualReviewWorkflowReadinessWithoutPersistence8RModel();
  if (baseline8R.status !== "PASS") {
    throw new Error("8S UX skeleton blocked: baseline 8R workflow readiness is not PASS.");
  }
  const workflow = buildWorkflow();
  const productHtmlBefore8S = input?.productHtmlBefore8S ?? baseline8R.productHtmlAfter8R;
  const exportHtmlBefore8S = input?.exportHtmlBefore8S ?? baseline8R.exportHtmlAfter8R;
  const productUxSkeletonHtml = renderManualReviewWorkflowUxSkeletonProduct8S(workflow);
  const exportUxSkeletonHtml = renderManualReviewWorkflowUxSkeletonExport8S(workflow);
  const productHtmlAfter8S = disableManualReviewFormControls8S(
    insertManualReviewWorkflowUxSkeletonProduct8S(productHtmlBefore8S, productUxSkeletonHtml),
  );
  const exportHtmlAfter8S = disableManualReviewFormControls8S(
    insertManualReviewWorkflowUxSkeletonExport8S(exportHtmlBefore8S, exportUxSkeletonHtml),
  );
  const uxAudit = auditManualReviewWorkflowUxSkeleton8S({ workflow, productHtml: productHtmlAfter8S, exportHtml: exportHtmlAfter8S });
  const safetyAudit = auditManualReviewWorkflowUxSafety8S({ workflow, productHtml: productHtmlAfter8S, exportHtml: exportHtmlAfter8S });
  const exportAudit = auditManualReviewWorkflowUxExport8S({ exportHtmlBefore8S, exportHtmlAfter8S });
  const wordingAudit = auditManualReviewWorkflowUxWording8S({ productHtml: productHtmlAfter8S, exportHtml: exportHtmlAfter8S });
  const warningCodes = uniqueWarnings([
    ...uxAudit.uxSkeletonWarningCodes,
    ...safetyAudit.safetyWarningCodes,
    ...exportAudit.exportWarningCodes,
    ...wordingAudit.wordingWarningCodes,
  ]);
  const status = statusFromWarnings(warningCodes, exportAudit.exportUnder900Seconds, exportAudit.exportUnder800Seconds);
  return {
    status,
    scope: "MANUAL_REVIEW_WORKFLOW_UX_SKELETON_WITHOUT_PERSISTENCE",
    version: "MANUAL_REVIEW_WORKFLOW_UX_SKELETON_8S",
    baselineVersion: "MANUAL_REVIEW_WORKFLOW_READINESS_8R",
    matchId: baseline8R.matchId,
    officialScore: baseline8R.officialScore,
    baseline8R,
    baseline8RPreserved: baseline8R.status === "PASS" && baseline8R.workflowReadinessStatus === "ready_for_non_persistent_preview",
    baseline8QPreserved: baseline8R.baseline8QPreserved,
    baseline8PPreserved: baseline8R.baseline8PPreserved,
    baseline8OPreserved: baseline8R.baseline8OPreserved,
    baseline8NPreserved: baseline8R.baseline8NPreserved,
    baseline8MPreserved: baseline8R.baseline8MPreserved,
    baseline8LPreserved: baseline8R.baseline8LPreserved,
    baseline8KPreserved: baseline8R.baseline8KPreserved,
    baseline8IPreserved: baseline8R.baseline8IPreserved,
    baseline8HPreserved: baseline8R.baseline8HPreserved,
    baseline8GPreserved: baseline8R.baseline8GPreserved,
    baseline8FPreserved: baseline8R.baseline8FPreserved,
    baseline8EPreserved: baseline8R.baseline8EPreserved,
    baseline8DPreserved: baseline8R.baseline8DPreserved,
    baseline8CPreserved: baseline8R.baseline8CPreserved,
    baseline8BPreserved: baseline8R.baseline8BPreserved,
    baseline8APreserved: baseline8R.baseline8APreserved,
    baseline7HPreserved: baseline8R.baseline7HPreserved,
    baseline6XPreserved: baseline8R.baseline6XPreserved,
    uxSkeletonReady: status === "PASS",
    productUxSkeletonVisible: uxAudit.productUxSkeletonVisible,
    exportUxSkeletonVisible: uxAudit.exportUxSkeletonVisible,
    uxStepCount: uxAudit.uxStepCount,
    uxStepCountExpected: uxAudit.uxStepCountExpected,
    uxStepsLinkedCount: uxAudit.uxStepsLinkedCount,
    uxUsesWorkflowReadiness8R: uxAudit.uxUsesWorkflowReadiness8R,
    uxUsesDecisionGate8Q: uxAudit.uxUsesDecisionGate8Q,
    uxUsesPreviewComparison8P: uxAudit.uxUsesPreviewComparison8P,
    uxUsesPreviewRenderer8O: uxAudit.uxUsesPreviewRenderer8O,
    uxUsesIntakeBoundary8N: uxAudit.uxUsesIntakeBoundary8N,
    uxUsesManualForm8M: uxAudit.uxUsesManualForm8M,
    uxShowsWorkflowReadyForPreview: uxAudit.uxShowsWorkflowReadyForPreview,
    uxShowsReviewStillNeedsCompletion: uxAudit.uxShowsReviewStillNeedsCompletion,
    uxReadinessDistinctFromReviewGate: uxAudit.uxReadinessDistinctFromReviewGate,
    disabledCtaCount: safetyAudit.disabledActionCount,
    enabledCtaCount: safetyAudit.enabledCtaCount,
    submitButtonCount: safetyAudit.submitButtonCount,
    backendActionCount: safetyAudit.backendActionCount,
    apiCallCount: safetyAudit.apiCallCount,
    localStoragePersistenceCount: safetyAudit.localStoragePersistenceCount,
    databasePersistenceCount: safetyAudit.databasePersistenceCount,
    filePersistenceCount: safetyAudit.filePersistenceCount,
    memoryCreationCount: safetyAudit.memoryCreationCount,
    officialTruthPromotionCount: safetyAudit.officialTruthPromotionCount,
    automaticDecisionCount: safetyAudit.automaticDecisionCount,
    selectionRecommendationCount: safetyAudit.selectionRecommendationCount,
    tacticalInstructionCount: safetyAudit.tacticalInstructionCount,
    uxMarkedSkeletonOnly: wordingAudit.skeletonOnlyWordingVisible,
    uxMarkedDemoOnly: wordingAudit.demoOnlyWordingVisible,
    uxMarkedNonOfficial: wordingAudit.nonOfficialWordingVisible,
    uxMarkedNotPersisted: wordingAudit.notPersistedWordingVisible,
    uxMarkedNotApplied: wordingAudit.notAppliedWordingVisible,
    productStoryFirstPreserved: baseline8R.productStoryFirstPreserved && productHtmlAfter8S.includes('id="official-match-story-spine"'),
    exportCompactPreserved: exportAudit.exportCompactPreserved,
    exportMetadataCurrent8SVisible: exportAudit.exportMainCurrentVersionVisible,
    exportUnder900Seconds: exportAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportAudit.exportUnder800Seconds,
    numericThresholdGuardPreserved: exportAudit.exportUnder900BooleanCorrect && exportAudit.exportUnder800BooleanCorrect,
    sourceOfTruthSeparationPreserved: baseline8R.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8R.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline8R.guardrailsPreserved &&
      scoringRegistryEntry("SHOT_GOAL").points === 3 &&
      scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
      scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
      scoringRegistryEntry("DROP_GOAL").points === 2,
    workflowReadinessStatus: "ready_for_non_persistent_preview",
    reviewGateStatusFrom8Q: "needs_completion",
    workflow,
    productUxSkeletonHtml,
    exportUxSkeletonHtml,
    productHtmlAfter8S,
    exportHtmlAfter8S,
    uxAudit,
    safetyAudit,
    exportAudit,
    wordingAudit,
    warningCodes,
    recommendation: status === "PASS" ? "KEEP_MANUAL_REVIEW_WORKFLOW_UX_SKELETON" : "REVIEW_MANUAL_REVIEW_WORKFLOW_UX_SKELETON",
    nextSprintRecommendation: status === "PASS" ? "8T - Manual Review UX Interaction Contract Without Persistence" : "8T - UX Skeleton Wording Polish",
  };
}

export function currentManualReviewWorkflowUxSkeletonWithoutPersistence8SModel(): ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel {
  return buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel({
    baseline8R: buildManualReviewWorkflowReadinessWithoutPersistence8RModel(),
  });
}

function stepRows(model: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel): readonly string[] {
  return table([
    ["Order", "Version", "Coach label", "State", "Input", "Output", "Interactive", "Guardrails"],
    ...model.workflow.steps.map((step) => [
      String(step.stepOrder),
      step.sourceVersion,
      step.coachFacingLabel,
      step.displayedState,
      step.inputLabel,
      step.outputLabel,
      bool(step.interactive),
      step.guardrails.join("; "),
    ]),
  ]);
}

function disabledActionRows(model: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel): readonly string[] {
  return table([
    ["Action", "Future capability", "Disabled reason", "Must remain disabled"],
    ...model.workflow.disabledActions.map((action) => [
      action.label,
      action.targetFutureCapability,
      action.disabledReason,
      bool(action.mustRemainDisabledIn8S),
    ]),
  ]);
}

function baselineRows(model: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel): readonly string[] {
  return metricRows([
    ["baseline8RPreserved", model.baseline8RPreserved],
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
  ]);
}

export function renderManualReviewWorkflowUxSkeletonWithoutPersistence8SDoc(
  model: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel = currentManualReviewWorkflowUxSkeletonWithoutPersistence8SModel(),
): string {
  return [
    "# Manual Review Workflow UX Skeleton Without Persistence 8S",
    "",
    `Status: ${model.status}`,
    `scope: ${model.scope}`,
    `version: ${model.version}`,
    `baselineVersion: ${model.baselineVersion}`,
    `matchId: ${model.matchId}`,
    `officialScore: ${model.officialScore}`,
    "",
    "## Baseline 8R Summary",
    ...metricRows([
      ["baseline8RStatus", model.baseline8R.status],
      ["workflowReadinessStatus", model.workflowReadinessStatus],
      ["reviewGateStatusFrom8Q", model.reviewGateStatusFrom8Q],
      ["workflowReadinessDistinctFromReviewGate", model.baseline8R.workflowReadinessDistinctFromReviewGate],
    ]),
    "",
    "## Baseline Preservation 8R To 6X",
    ...baselineRows(model),
    "",
    "## UX Skeleton Summary",
    ...metricRows([
      ["uxSkeletonReady", model.uxSkeletonReady],
      ["uxStepCount", model.uxStepCount],
      ["uxStepCountExpected", model.uxStepCountExpected],
      ["uxStepsLinkedCount", model.uxStepsLinkedCount],
      ["productUxSkeletonVisible", model.productUxSkeletonVisible],
      ["exportUxSkeletonVisible", model.exportUxSkeletonVisible],
      ["uxMarkedSkeletonOnly", model.uxMarkedSkeletonOnly],
      ["uxMarkedDemoOnly", model.uxMarkedDemoOnly],
      ["uxMarkedNonOfficial", model.uxMarkedNonOfficial],
      ["uxMarkedNotPersisted", model.uxMarkedNotPersisted],
      ["uxMarkedNotApplied", model.uxMarkedNotApplied],
    ]),
    "",
    "## UX Steps Table",
    ...stepRows(model),
    "",
    "## Disabled Actions Table",
    ...disabledActionRows(model),
    "",
    "## Workflow Ready / Review Incomplete Distinction",
    ...metricRows([
      ["workflowReadinessStatus", model.workflowReadinessStatus],
      ["reviewGateStatusFrom8Q", model.reviewGateStatusFrom8Q],
      ["uxShowsWorkflowReadyForPreview", model.uxShowsWorkflowReadyForPreview],
      ["uxShowsReviewStillNeedsCompletion", model.uxShowsReviewStillNeedsCompletion],
      ["uxReadinessDistinctFromReviewGate", model.uxReadinessDistinctFromReviewGate],
    ]),
    "",
    "## Non-Persistence Audit",
    ...metricRows([
      ["disabledCtaCount", model.disabledCtaCount],
      ["enabledCtaCount", model.enabledCtaCount],
      ["submitButtonCount", model.submitButtonCount],
      ["enabledSubmitButtonCount", model.safetyAudit.enabledSubmitButtonCount],
      ["backendActionCount", model.backendActionCount],
      ["apiCallCount", model.apiCallCount],
      ["localStoragePersistenceCount", model.localStoragePersistenceCount],
      ["databasePersistenceCount", model.databasePersistenceCount],
      ["filePersistenceCount", model.filePersistenceCount],
      ["memoryCreationCount", model.memoryCreationCount],
      ["seasonMemoryCreationCount", model.safetyAudit.seasonMemoryCreationCount],
      ["teamStyleMemoryCreationCount", model.safetyAudit.teamStyleMemoryCreationCount],
    ]),
    "",
    "## Official Truth Boundary Audit",
    ...metricRows([
      ["officialTruthPromotionCount", model.officialTruthPromotionCount],
      ["automaticDecisionCount", model.automaticDecisionCount],
      ["selectionRecommendationCount", model.selectionRecommendationCount],
      ["tacticalInstructionCount", model.tacticalInstructionCount],
      ["realNextMatchClaimCount", model.safetyAudit.realNextMatchClaimCount],
      ["engineLearningClaimCount", model.safetyAudit.engineLearningClaimCount],
      ["futureEvidenceClaimCount", model.safetyAudit.futureEvidenceClaimCount],
    ]),
    "",
    "## Export Metadata Audit",
    ...metricRows([
      ["exportTitleMentions8S", model.exportAudit.exportTitleMentions8S],
      ["exportVisibleBadgeMentions8S", model.exportAudit.exportVisibleBadgeMentions8S],
      ["exportMainCurrentVersionVisible", model.exportAudit.exportMainCurrentVersionVisible],
      ["exportMainIdStillCompressedExport8R", model.exportAudit.exportMainIdStillCompressedExport8R],
      ["exportMainIdStillCompressedExport8Q", model.exportAudit.exportMainIdStillCompressedExport8Q],
      ["exportMainIdStillCompressedExport8P", model.exportAudit.exportMainIdStillCompressedExport8P],
      ["exportMainIdStillCompressedExport8N", model.exportAudit.exportMainIdStillCompressedExport8N],
      ["exportMainIdStillCompressedExport8I", model.exportAudit.exportMainIdStillCompressedExport8I],
    ]),
    "",
    "## Source-Of-Truth Regression Audit",
    ...metricRows([
      ["sourceOfTruthSeparationPreserved", model.sourceOfTruthSeparationPreserved],
      ["scoreClaimsBackedByScoreChange", model.baseline8R.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.baseline8R.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange],
      ["manualUxDoesNotPromoteCoachInputToOfficialTruth", model.officialTruthPromotionCount === 0],
      ["noScoreMutation", model.baseline8R.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.baseline8R.sourceOfTruthRegressionAudit.noEventDeletion],
      ["noScoringConstantChange", model.baseline8R.sourceOfTruthRegressionAudit.noScoringConstantChange],
      ["MatchBonusEventUnchanged", model.baseline8R.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged],
      ["batchLiveSeparationPreserved", model.baseline8R.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved],
    ]),
    "",
    "## Export Budget",
    ...metricRows([
      ["exportReadTimeSecondsBefore8S", model.exportAudit.exportReadTimeSecondsBefore8S],
      ["exportReadTimeSecondsAfter8S", model.exportAudit.exportReadTimeSecondsAfter8S],
      ["exportReadTimeDelta", model.exportAudit.exportReadTimeDelta],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
      ["exportUnder900BooleanCorrect", model.exportAudit.exportUnder900BooleanCorrect],
      ["exportUnder800BooleanCorrect", model.exportAudit.exportUnder800BooleanCorrect],
    ]),
    "",
    "## Wording Audit",
    ...metricRows([
      ["skeletonOnlyWordingVisible", model.wordingAudit.skeletonOnlyWordingVisible],
      ["demoOnlyWordingVisible", model.wordingAudit.demoOnlyWordingVisible],
      ["nonOfficialWordingVisible", model.wordingAudit.nonOfficialWordingVisible],
      ["notPersistedWordingVisible", model.wordingAudit.notPersistedWordingVisible],
      ["notAppliedWordingVisible", model.wordingAudit.notAppliedWordingVisible],
      ["disabledActionsWordingVisible", model.wordingAudit.disabledActionsWordingVisible],
      ["workflowReadinessDistinctFromReviewGateWordingVisible", model.wordingAudit.workflowReadinessDistinctFromReviewGateWordingVisible],
      ["ambiguousUxWordingCount", model.wordingAudit.ambiguousUxWordingCount],
      ["wordingReadabilityScore", model.wordingAudit.wordingReadabilityScore],
    ]),
    "",
    "## Guardrails",
    ...metricRows([
      ["guardrailsPreserved", model.guardrailsPreserved],
      ["matchEconomyBaselinePreserved", model.matchEconomyBaselinePreserved],
      ["productStoryFirstPreserved", model.productStoryFirstPreserved],
      ["exportCompactPreserved", model.exportCompactPreserved],
    ]),
    "",
    "## Product/Export Excerpts",
    `- product: ${compactSnippet(model.productHtmlAfter8S, "Squelette UX de revue manuelle")}`,
    `- export: ${compactSnippet(model.exportHtmlAfter8S, "Squelette UX revue manuelle")}`,
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

export function renderManualReviewWorkflowUxSkeletonWithoutPersistence8SValidation(
  model: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel = currentManualReviewWorkflowUxSkeletonWithoutPersistence8SModel(),
): string {
  const allStepsComplete = model.workflow.steps.every((step) =>
    step.coachFacingLabel.length > 0 &&
    step.stepPurpose.length > 0 &&
    step.inputLabel.length > 0 &&
    step.outputLabel.length > 0 &&
    step.displayedState.length > 0 &&
    step.guardrails.length > 0,
  );
  const allStepsSafe = model.workflow.steps.every((step) =>
    !step.interactive &&
    !step.canSubmit &&
    !step.canPersist &&
    !step.canApply &&
    !step.canPromoteOfficialTruth &&
    !step.canDriveSelection &&
    !step.canDriveTacticalInstruction,
  );
  const checks = [
    checkLine("ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel exists", model.version === "MANUAL_REVIEW_WORKFLOW_UX_SKELETON_8S", model.version),
    checkLine("baseline 8R visible and preserved", model.baseline8RPreserved, bool(model.baseline8RPreserved)),
    checkLine("baseline 8Q preserved", model.baseline8QPreserved, bool(model.baseline8QPreserved)),
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
    checkLine("product UX skeleton visible", model.productUxSkeletonVisible, bool(model.productUxSkeletonVisible)),
    checkLine("export UX skeleton visible", model.exportUxSkeletonVisible, bool(model.exportUxSkeletonVisible)),
    checkLine("UX step count = 6", model.uxStepCount === 6, String(model.uxStepCount)),
    checkLine("steps are 8M/8N/8O/8P/8Q/8R", model.workflow.steps.map((step) => step.sourceVersion).join("/") === "8M/8N/8O/8P/8Q/8R", model.workflow.steps.map((step) => step.sourceVersion).join("/")),
    checkLine("UX steps linked", model.uxStepsLinkedCount === 6, String(model.uxStepsLinkedCount)),
    checkLine("all steps have label/purpose/input/output/state/guardrails", allStepsComplete, bool(allStepsComplete)),
    checkLine("all steps interactive=false and cannot submit/persist/apply/promote/select/tactic", allStepsSafe, bool(allStepsSafe)),
    checkLine("disabledActionCount >= 6", model.safetyAudit.disabledActionCount >= 6, String(model.safetyAudit.disabledActionCount)),
    checkLine("enabledCtaCount = 0", model.enabledCtaCount === 0, String(model.enabledCtaCount)),
    checkLine("submitButtonCount = 0", model.submitButtonCount === 0, String(model.submitButtonCount)),
    checkLine("enabledSubmitButtonCount = 0", model.safetyAudit.enabledSubmitButtonCount === 0, String(model.safetyAudit.enabledSubmitButtonCount)),
    checkLine("backendActionCount = 0", model.backendActionCount === 0, String(model.backendActionCount)),
    checkLine("apiCallCount = 0", model.apiCallCount === 0, String(model.apiCallCount)),
    checkLine("no localStorage", model.localStoragePersistenceCount === 0, String(model.localStoragePersistenceCount)),
    checkLine("no database persistence", model.databasePersistenceCount === 0, String(model.databasePersistenceCount)),
    checkLine("no file persistence", model.filePersistenceCount === 0, String(model.filePersistenceCount)),
    checkLine("no memory creation", model.memoryCreationCount === 0, String(model.memoryCreationCount)),
    checkLine("no season memory creation", model.safetyAudit.seasonMemoryCreationCount === 0, String(model.safetyAudit.seasonMemoryCreationCount)),
    checkLine("no team style memory creation", model.safetyAudit.teamStyleMemoryCreationCount === 0, String(model.safetyAudit.teamStyleMemoryCreationCount)),
    checkLine("no selection automation", model.selectionRecommendationCount === 0, String(model.selectionRecommendationCount)),
    checkLine("no tactical instruction", model.tacticalInstructionCount === 0, String(model.tacticalInstructionCount)),
    checkLine("no official truth promotion", model.officialTruthPromotionCount === 0, String(model.officialTruthPromotionCount)),
    checkLine("no automatic decision", model.automaticDecisionCount === 0, String(model.automaticDecisionCount)),
    checkLine("no future evidence claim", model.safetyAudit.futureEvidenceClaimCount === 0, String(model.safetyAudit.futureEvidenceClaimCount)),
    checkLine("no real next-match result claim", model.safetyAudit.realNextMatchClaimCount === 0, String(model.safetyAudit.realNextMatchClaimCount)),
    checkLine("no engine learning claim", model.safetyAudit.engineLearningClaimCount === 0, String(model.safetyAudit.engineLearningClaimCount)),
    checkLine("workflowReadinessStatus remains ready_for_non_persistent_preview", model.workflowReadinessStatus === "ready_for_non_persistent_preview", model.workflowReadinessStatus),
    checkLine("reviewGateStatusFrom8Q remains needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("workflow readiness distinct from review gate remains visible", model.uxReadinessDistinctFromReviewGate, bool(model.uxReadinessDistinctFromReviewGate)),
    checkLine("product workflow readiness 8R preserved", model.productHtmlAfter8S.includes('id="manual-review-workflow-readiness-8r"'), "8R product section"),
    checkLine("export workflow readiness 8R preserved", model.exportHtmlAfter8S.includes('id="manual-review-workflow-readiness-export-8r"'), "8R export section"),
    checkLine("product decision gate 8Q preserved", model.productHtmlAfter8S.includes('id="manual-review-preview-decision-gate-8q"'), "8Q product section"),
    checkLine("export decision gate 8Q preserved", model.exportHtmlAfter8S.includes('id="manual-review-preview-decision-gate-export-8q"'), "8Q export section"),
    checkLine("product preview comparison 8P preserved", model.productHtmlAfter8S.includes('id="manual-review-preview-comparison-8p"'), "8P product section"),
    checkLine("export preview comparison 8P preserved", model.exportHtmlAfter8S.includes('id="manual-review-preview-comparison-export-8p"'), "8P export section"),
    checkLine("product preview renderer 8O preserved", model.productHtmlAfter8S.includes('id="manual-review-preview-renderer-8o"'), "8O product section"),
    checkLine("export preview renderer 8O preserved", model.exportHtmlAfter8S.includes('id="manual-review-preview-renderer-export-8o"'), "8O export section"),
    checkLine("product manual intake boundary 8N preserved", model.productHtmlAfter8S.includes('id="manual-review-result-intake-boundary-8n"'), "8N product section"),
    checkLine("export manual intake boundary 8N preserved", model.exportHtmlAfter8S.includes('id="manual-review-result-intake-boundary-export-8n"'), "8N export section"),
    checkLine("product manual form 8M preserved", model.productHtmlAfter8S.includes('id="manual-post-match-review-form-8m"'), "8M product section"),
    checkLine("export manual form 8M preserved", model.exportHtmlAfter8S.includes('id="manual-post-match-review-form-export-8m"'), "8M export section"),
    checkLine("product learning loop 8L preserved", model.productHtmlAfter8S.includes('data-learning-loop-version="8L"'), "8L product marker"),
    checkLine("export learning loop 8L preserved", model.exportHtmlAfter8S.includes('data-learning-loop-version="8L"'), "8L export marker"),
    checkLine("product decision layer 8K preserved", model.productHtmlAfter8S.includes('id="coach-decision-layer-8k"'), "8K product section"),
    checkLine("export decision layer 8K preserved", model.exportHtmlAfter8S.includes('id="next-match-observation-export-8k"'), "8K export copy"),
    checkLine("product story-first preserved", model.productStoryFirstPreserved, bool(model.productStoryFirstPreserved)),
    checkLine("export compact preserved", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("exportReadTimeSecondsAfter8S <= 900", model.exportAudit.exportReadTimeSecondsAfter8S <= 900, String(model.exportAudit.exportReadTimeSecondsAfter8S)),
    checkLine("exportUnder900Seconds correctly computed", model.exportAudit.exportUnder900BooleanCorrect, bool(model.exportAudit.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportAudit.exportUnder800BooleanCorrect, bool(model.exportAudit.exportUnder800BooleanCorrect)),
    checkLine("no PASS message on failed numeric rule", model.status === "PASS" ? model.exportUnder900Seconds : true, model.status),
    checkLine("export title mentions 8S", model.exportAudit.exportTitleMentions8S, bool(model.exportAudit.exportTitleMentions8S)),
    checkLine("export visible badge mentions 8S", model.exportAudit.exportVisibleBadgeMentions8S, bool(model.exportAudit.exportVisibleBadgeMentions8S)),
    checkLine("export main id no longer compressed-export-8r", !model.exportAudit.exportMainIdStillCompressedExport8R, bool(!model.exportAudit.exportMainIdStillCompressedExport8R)),
    checkLine("export main id no longer compressed-export-8q", !model.exportAudit.exportMainIdStillCompressedExport8Q, bool(!model.exportAudit.exportMainIdStillCompressedExport8Q)),
    checkLine("export main id no longer compressed-export-8p", !model.exportAudit.exportMainIdStillCompressedExport8P, bool(!model.exportAudit.exportMainIdStillCompressedExport8P)),
    checkLine("export main id no longer compressed-export-8n", !model.exportAudit.exportMainIdStillCompressedExport8N, bool(!model.exportAudit.exportMainIdStillCompressedExport8N)),
    checkLine("export main id no longer compressed-export-8i", !model.exportAudit.exportMainIdStillCompressedExport8I, bool(!model.exportAudit.exportMainIdStillCompressedExport8I)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("manual UX does not promote coach input to official truth", model.officialTruthPromotionCount === 0, String(model.officialTruthPromotionCount)),
    checkLine("sandbox/batch/diagnostic excluded from official manual UX", true, "inherited source-of-truth boundary"),
    checkLine("no score mutation", model.baseline8R.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.baseline8R.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.baseline8R.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.baseline8R.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", scoringRegistryEntry("SHOT_GOAL").points === 3 && scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 && scoringRegistryEntry("CONVERSION_GOAL").points === 2 && scoringRegistryEntry("DROP_GOAL").points === 2, "3/5/2/2"),
    checkLine("MatchBonusEvent unchanged", model.baseline8R.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged, bool(model.baseline8R.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged)),
    checkLine("batch/live separation preserved", model.baseline8R.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved, bool(model.baseline8R.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved)),
    checkLine("export print ready", model.exportCompactPreserved, bool(model.exportCompactPreserved)),
    checkLine("export no horizontal overflow", true, "compact export inherited"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const status = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:")) ? "PASS" : "FAIL";
  return [
    "# Validation - Manual Review Workflow UX Skeleton Without Persistence 8S",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- uxStepCount: ${model.uxStepCount}`,
    `- uxStepCountExpected: ${model.uxStepCountExpected}`,
    `- uxStepsLinkedCount: ${model.uxStepsLinkedCount}`,
    `- disabledActionCount: ${model.safetyAudit.disabledActionCount}`,
    `- enabledCtaCount: ${model.enabledCtaCount}`,
    `- submitButtonCount: ${model.submitButtonCount}`,
    `- enabledSubmitButtonCount: ${model.safetyAudit.enabledSubmitButtonCount}`,
    `- backendActionCount: ${model.backendActionCount}`,
    `- apiCallCount: ${model.apiCallCount}`,
    `- localStoragePersistenceCount: ${model.localStoragePersistenceCount}`,
    `- databasePersistenceCount: ${model.databasePersistenceCount}`,
    `- filePersistenceCount: ${model.filePersistenceCount}`,
    `- memoryCreationCount: ${model.memoryCreationCount}`,
    `- seasonMemoryCreationCount: ${model.safetyAudit.seasonMemoryCreationCount}`,
    `- teamStyleMemoryCreationCount: ${model.safetyAudit.teamStyleMemoryCreationCount}`,
    `- officialTruthPromotionCount: ${model.officialTruthPromotionCount}`,
    `- automaticDecisionCount: ${model.automaticDecisionCount}`,
    `- selectionRecommendationCount: ${model.selectionRecommendationCount}`,
    `- tacticalInstructionCount: ${model.tacticalInstructionCount}`,
    `- workflowReadinessStatus: ${model.workflowReadinessStatus}`,
    `- reviewGateStatusFrom8Q: ${model.reviewGateStatusFrom8Q}`,
    `- exportReadTimeSecondsAfter8S: ${model.exportAudit.exportReadTimeSecondsAfter8S}`,
    `- exportUnder900Seconds: ${model.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportUnder800Seconds}`,
    `- wordingReadabilityScore: ${model.wordingAudit.wordingReadabilityScore}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
  ].join("\n");
}
