import type {
  MultiScenarioCoachTest,
  MultiScenarioCoachTestPlanModel,
} from "./multiScenarioCoachTestPlan";

export type SelectionPreviewStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type SelectionPreviewOrigin =
  | "none"
  | "multi_scenario_coach_test_plan";

export type SelectionPreviewId =
  | "support_near_z4_hsr"
  | "second_ball_presence"
  | "strong_goalkeeper_response";

export type SelectionPreviewConfidence =
  | "low"
  | "low_medium"
  | "medium";

export type SelectionPreviewTraceBackingStatus = "sandbox_only";

export type SelectionPreviewCard = {
  readonly previewId: SelectionPreviewId;
  readonly linkedCoachTestId: string;
  readonly linkedScenarioId: string;
  readonly title: string;
  readonly suggestedProfile: string;
  readonly suggestedRoleFamily: string;
  readonly usefulAttributes: readonly string[];
  readonly expectedBenefit: string;
  readonly tradeoff: string;
  readonly observationSignal: string;
  readonly remainsUnproven: string;
  readonly confidence: SelectionPreviewConfidence;
  readonly previewOnly: true;
  readonly officialTruth: false;
  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
};

export type SelectionPreviewModel = {
  readonly status: SelectionPreviewStatus;
  readonly origin: SelectionPreviewOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly title: "Prévisualisation de sélection";
  readonly summary: string;
  readonly previewCount: number;
  readonly previews: readonly SelectionPreviewCard[];
  readonly linkedTestPlanStatus: string;
  readonly linkedTestCount: number;
  readonly previewOnly: true;
  readonly officialTruth: false;
  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly officialTimelineUnchanged: true;
  readonly officialScoreUnchanged: true;
  readonly officialPossessionUnchanged: true;
  readonly officialScoringEventsUnchanged: true;
  readonly diagnosticOnly: true;
  readonly modelAppliedOnlyInSandbox: true;
  readonly modelAppliedToNormalLiveSelection: false;
  readonly selectionPreviewTraceBackingStatus: SelectionPreviewTraceBackingStatus;
  readonly selectionPreviewRequiresMatchTraceSpine: true;
  readonly selectionPreviewFutureTraceConsumer: true;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

type PreviewTemplate = Omit<
  SelectionPreviewCard,
  | "linkedScenarioId"
  | "confidence"
  | "previewOnly"
  | "officialTruth"
  | "canChangeLineup"
  | "canChangeStarters"
  | "canChangeBench"
  | "canDriveLiveSelection"
  | "canDriveProductionRouteResolution"
  | "canCreateProductionScoringEvents"
  | "canClaimGlobalEconomy"
>;

const PREVIEW_TEMPLATES: Readonly<Record<MultiScenarioCoachTest["testId"], PreviewTemplate>> = {
  support_around_z4_hsr: {
    previewId: "support_near_z4_hsr",
    linkedCoachTestId: "support_around_z4_hsr",
    title: "Soutien proche autour de Z4-HSR",
    suggestedProfile: "Profil à prévisualiser : soutien mobile proche de Z4-HSR.",
    suggestedRoleFamily: "support runner / mobile lock / hook link / playmaker support",
    usefulAttributes: ["anticipation", "handling", "off-ball support", "stamina"],
    expectedBenefit:
      "Prévisualiser un joueur de soutien plus proche de Z4-HSR autour de control-space-hunter. L'objectif est de réduire le risque de tir isolé et d'offrir une solution immédiate après la progression.",
    tradeoff:
      "Plus de soutien offensif peut exposer la rest-defense si le ballon est perdu ou repoussé.",
    observationSignal:
      "Vérifier si la progression mène à une continuité contrôlée plutôt qu'à une récupération adverse.",
    remainsUnproven:
      "Le sandbox local ne prouve pas que ce profil doit être utilisé ; il indique seulement une option de sélection à tester.",
  },
  second_ball_occupation: {
    previewId: "second_ball_presence",
    linkedCoachTestId: "second_ball_occupation",
    title: "Présence sur second ballon",
    suggestedProfile: "Profil à prévisualiser : chasseur de rebond et coureur de pression.",
    suggestedRoleFamily: "rebound chaser / pressure forward / high work-rate runner",
    usefulAttributes: ["anticipation", "aggression", "reaction", "acceleration", "balance"],
    expectedBenefit:
      "Prévisualiser un profil capable d'attaquer le second ballon après une parade. L'objectif est de transformer un tir repoussé en seconde action plutôt qu'en récupération propre par BLITZ.",
    tradeoff:
      "Presser le second ballon peut augmenter la fatigue et ouvrir une transition si la récupération échoue.",
    observationSignal:
      "Vérifier si la pression au rebond augmente les secondes chances sans désorganiser la structure défensive.",
    remainsUnproven:
      "Le modèle ne prouve pas encore que l'engagement au rebond reste sûr contre une transition adverse.",
  },
  strong_goalkeeper_fallback: {
    previewId: "strong_goalkeeper_response",
    linkedCoachTestId: "strong_goalkeeper_fallback",
    title: "Réponse face à un gardien fort",
    suggestedProfile: "Profil à prévisualiser : option de continuité plus sûre après arrêt.",
    suggestedRoleFamily: "safer continuity option / secondary playmaker / support receiver / rest-defense anchor",
    usefulAttributes: ["decision-making", "positioning", "composure", "tactical discipline"],
    expectedBenefit:
      "Prévisualiser une solution de continuité si le gardien adverse neutralise le tir. L'objectif est de ne pas dépendre uniquement d'une frappe directe et de préparer une sortie sûre après l'arrêt.",
    tradeoff:
      "Un plan B plus prudent peut réduire la menace immédiate, mais stabiliser la séquence si le gardien gagne le duel.",
    observationSignal:
      "Vérifier si l'équipe garde une structure utile après un arrêt du gardien au lieu de subir une récupération adverse.",
    remainsUnproven:
      "Cette réponse reste une hypothèse de sandbox, pas une sélection officielle ni une composition recommandée.",
  },
};

function cardWithGuard(input: {
  readonly template: PreviewTemplate;
  readonly linkedScenarioId: string;
  readonly confidence: SelectionPreviewConfidence;
}): SelectionPreviewCard {
  return {
    ...input.template,
    linkedScenarioId: input.linkedScenarioId,
    confidence: input.confidence,
    previewOnly: true,
    officialTruth: false,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
  };
}

function confidenceFromTest(confidence: MultiScenarioCoachTest["confidence"]): SelectionPreviewConfidence {
  switch (confidence) {
    case "medium":
      return "medium";
    case "low_medium":
      return "low_medium";
    case "low":
      return "low";
  }
}

function buildPreviewTags(previews: readonly SelectionPreviewCard[]): readonly string[] {
  return [
    "selection_preview",
    `selection_preview_status_${previews.length === 3 ? "available" : "partial"}`,
    "selection_preview_origin_coach_test_plan",
    `selection_preview_count_${previews.length}`,
    ...previews.map((preview) => `selection_preview_${preview.previewId}`),
    ...previews.map((preview) => `selection_preview_${preview.previewId}_test_${preview.linkedCoachTestId}`),
    ...previews.map((preview) => `selection_preview_${preview.previewId}_scenario_${preview.linkedScenarioId}`),
    ...previews.map((preview) => `selection_preview_${preview.previewId}_role_family_${preview.suggestedRoleFamily.replaceAll(" ", "_").replaceAll("/", "_").toLowerCase()}`),
    "selection_preview_only_true",
    "selection_preview_official_truth_false",
    "selection_preview_can_change_lineup_false",
    "selection_preview_can_change_starters_false",
    "selection_preview_can_change_bench_false",
    "selection_preview_can_drive_live_selection_false",
    "selection_preview_can_drive_production_route_resolution_false",
    "selection_preview_global_economy_claim_forbidden",
    "selection_preview_production_scoring_event_creation_count_0",
    "selection_preview_official_timeline_unchanged_true",
    "selection_preview_official_score_unchanged_true",
    "selection_preview_official_possession_unchanged_true",
    "selection_preview_official_scoring_events_unchanged_true",
    "selection_preview_trace_backing_status_sandbox_only",
    "selection_preview_requires_match_trace_spine_true",
    "selection_preview_future_trace_consumer_true",
  ];
}

export function selectionPreviewCannotMutateOfficialFullMatch(model: SelectionPreviewModel): boolean {
  return (
    model.officialTimelineUnchanged &&
    model.officialScoreUnchanged &&
    model.officialPossessionUnchanged &&
    model.officialScoringEventsUnchanged &&
    !model.canCreateProductionScoringEvents
  );
}

export function selectionPreviewCannotChangeSelection(model: SelectionPreviewModel): boolean {
  return (
    !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    !model.modelAppliedToNormalLiveSelection
  );
}

export function selectionPreviewCannotClaimGlobalEconomy(model: SelectionPreviewModel): boolean {
  return !model.canClaimGlobalEconomy;
}

export function emptySelectionPreviewModel(input: {
  readonly testPlan: MultiScenarioCoachTestPlanModel;
  readonly warnings: readonly string[];
}): SelectionPreviewModel {
  return {
    status: "not_available",
    origin: "none",
    ...(input.testPlan.segmentLabel === undefined ? {} : { segmentLabel: input.testPlan.segmentLabel }),
    ...(input.testPlan.chainId === undefined ? {} : { chainId: input.testPlan.chainId }),
    title: "Prévisualisation de sélection",
    summary: "Prévisualisation de sélection indisponible : aucun plan de test coach disponible.",
    previewCount: 0,
    previews: [],
    linkedTestPlanStatus: input.testPlan.status,
    linkedTestCount: input.testPlan.testCount,
    previewOnly: true,
    officialTruth: false,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    officialTimelineUnchanged: true,
    officialScoreUnchanged: true,
    officialPossessionUnchanged: true,
    officialScoringEventsUnchanged: true,
    diagnosticOnly: true,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    selectionPreviewTraceBackingStatus: "sandbox_only",
    selectionPreviewRequiresMatchTraceSpine: true,
    selectionPreviewFutureTraceConsumer: true,
    tags: [],
    warnings: input.warnings,
  };
}

export function selectionPreviewCardsFromCoachTests(
  tests: readonly MultiScenarioCoachTest[],
): readonly SelectionPreviewCard[] {
  return tests.flatMap((test) => {
    const template = PREVIEW_TEMPLATES[test.testId];

    if (template === undefined) {
      return [];
    }

    return [cardWithGuard({
      template,
      linkedScenarioId: test.linkedScenarioId,
      confidence: confidenceFromTest(test.confidence),
    })];
  });
}

export function selectionPreviewModelFromCards(input: {
  readonly testPlan: MultiScenarioCoachTestPlanModel;
  readonly previews: readonly SelectionPreviewCard[];
}): SelectionPreviewModel {
  const status: SelectionPreviewStatus = input.previews.length === 3 ? "available" : "partial";

  return {
    status,
    origin: "multi_scenario_coach_test_plan",
    ...(input.testPlan.segmentLabel === undefined ? {} : { segmentLabel: input.testPlan.segmentLabel }),
    ...(input.testPlan.chainId === undefined ? {} : { chainId: input.testPlan.chainId }),
    title: "Prévisualisation de sélection",
    summary:
      "Ces profils sont des pistes de sélection à prévisualiser, pas des changements appliqués. Ils restent des hypothèses sandbox sans application automatique.",
    previewCount: input.previews.length,
    previews: input.previews,
    linkedTestPlanStatus: input.testPlan.status,
    linkedTestCount: input.testPlan.testCount,
    previewOnly: true,
    officialTruth: false,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    officialTimelineUnchanged: true,
    officialScoreUnchanged: true,
    officialPossessionUnchanged: true,
    officialScoringEventsUnchanged: true,
    diagnosticOnly: true,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    selectionPreviewTraceBackingStatus: "sandbox_only",
    selectionPreviewRequiresMatchTraceSpine: true,
    selectionPreviewFutureTraceConsumer: true,
    tags: buildPreviewTags(input.previews),
    warnings: input.testPlan.warnings,
  };
}

export function validateSelectionPreviewModel(model: SelectionPreviewModel): readonly string[] {
  const shouldValidate = model.status === "available";

  return [
    ...(shouldValidate && model.origin !== "multi_scenario_coach_test_plan"
      ? ["SELECTION_PREVIEW_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.previewCount !== 3
      ? ["SELECTION_PREVIEW_COUNT_NOT_THREE"]
      : []),
    ...(shouldValidate && model.previews.some((preview) =>
      !preview.previewOnly ||
      preview.officialTruth ||
      preview.canChangeLineup ||
      preview.canChangeStarters ||
      preview.canChangeBench ||
      preview.canDriveLiveSelection ||
      preview.canDriveProductionRouteResolution ||
      preview.canCreateProductionScoringEvents ||
      preview.canClaimGlobalEconomy
    )
      ? ["SELECTION_PREVIEW_CARD_GUARD_BREACH"]
      : []),
    ...(!selectionPreviewCannotMutateOfficialFullMatch(model)
      ? ["SELECTION_PREVIEW_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!selectionPreviewCannotChangeSelection(model)
      ? ["SELECTION_PREVIEW_SELECTION_CHANGE_BREACH"]
      : []),
    ...(!selectionPreviewCannotClaimGlobalEconomy(model)
      ? ["SELECTION_PREVIEW_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
    ...(model.selectionPreviewTraceBackingStatus !== "sandbox_only"
      ? ["SELECTION_PREVIEW_TRACE_BACKING_NOT_SANDBOX_ONLY"]
      : []),
    ...(!model.selectionPreviewRequiresMatchTraceSpine
      ? ["SELECTION_PREVIEW_MISSING_TRACE_SPINE_REQUIREMENT"]
      : []),
    ...(!model.selectionPreviewFutureTraceConsumer
      ? ["SELECTION_PREVIEW_MISSING_FUTURE_TRACE_CONSUMER_MARKER"]
      : []),
  ];
}
