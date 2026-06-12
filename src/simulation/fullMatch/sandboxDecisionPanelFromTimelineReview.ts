import type { CoachFacingTimelineReviewModel } from "./coachFacingTimelineReview";
import {
  emptySandboxDecisionPanelModel,
  type SandboxDecisionPanelBlock,
  type SandboxDecisionPanelModel,
  type SandboxDecisionPanelStatus,
} from "./sandboxDecisionPanel";

function statusFromReview(status: CoachFacingTimelineReviewModel["status"]): SandboxDecisionPanelStatus {
  if (status === "available" || status === "blocked" || status === "partial" || status === "failed") {
    return status;
  }

  return "not_available";
}

function tagValue(tags: readonly string[], prefix: string): string | undefined {
  return tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length);
}

function buildBlocks(review: CoachFacingTimelineReviewModel): readonly SandboxDecisionPanelBlock[] {
  const finalOutcome = tagValue(review.tags, "timeline_review_override_final_outcome_") ?? "secured_by_goalkeeper_team";
  const finalActor = tagValue(review.tags, "timeline_review_override_final_actor_") ?? "blitz-goalkeeper-free-safety";
  const finalZone = tagValue(review.tags, "timeline_review_override_final_zone_") ?? "Z3-HSR";

  return [
    {
      blockId: "coach_teaching",
      title: "Enseignement coach",
      summary:
        "Le sandbox suggère que FORWARD_PROGRESS peut créer une situation de danger, mais la réponse du gardien et le contrôle du rebond ramènent l'action vers une récupération sécurisée par l'équipe du gardien.",
      bullets: [
        "Cette lecture est une hypothèse de travail, pas une vérité officielle.",
        `L'issue sandbox observée reste ${finalOutcome}.`,
        `L'acteur final sandbox reste ${finalActor} en ${finalZone}.`,
      ],
      confidence: "medium",
      sandboxOnly: true,
      officialTruth: false,
    },
    {
      blockId: "option_to_test",
      title: "Option à tester",
      summary:
        "Tester FORWARD_PROGRESS vers control-space-hunter avec un meilleur soutien autour de Z4-HSR, afin de transformer la progression en seconde action plutôt qu'en tir isolé.",
      bullets: [
        "Ajouter un soutien proche pour sécuriser le deuxième ballon.",
        "Comparer réception sous pression, fenêtre de tir et contrôle du rebond.",
        "Garder la route comme test sandbox tant que la preuve live n'est pas suffisante.",
      ],
      confidence: "low",
      sandboxOnly: true,
      officialTruth: false,
    },
    {
      blockId: "associated_risk",
      title: "Risque associé",
      summary:
        "Si le soutien n'arrive pas, la même route peut produire un tir isolé, une réponse gardien favorable à BLITZ et une récupération sécurisée par l'équipe du gardien.",
      bullets: [
        "Le danger apparent ne garantit pas une conversion.",
        "Un tir isolé peut rendre le rebond plus facile à contrôler pour le gardien.",
        "La rest-defense doit rester lisible avant d'augmenter cette route.",
      ],
      confidence: "medium",
      sandboxOnly: true,
      officialTruth: false,
    },
    {
      blockId: "still_to_prove",
      title: "Ce qui reste à prouver",
      summary:
        "Il faut encore prouver cette option dans plusieurs contextes, avec différents profils de gardien, niveaux de soutien, états de fatigue et pressions défensives.",
      bullets: [
        "La recommandation ne pilote pas la sélection live.",
        "Elle ne modifie pas la résolution de route production.",
        "Elle ne prouve aucune économie globale.",
      ],
      confidence: "low",
      sandboxOnly: true,
      officialTruth: false,
    },
  ];
}

export function sandboxDecisionPanelCannotMutateOfficialFullMatch(model: SandboxDecisionPanelModel): boolean {
  return (
    model.officialTimelineUnchanged &&
    model.officialScoreUnchanged &&
    model.officialPossessionUnchanged &&
    model.officialScoringEventsUnchanged &&
    !model.canMutateOfficialTimeline &&
    !model.canMutateOfficialPossession &&
    !model.canMutateOfficialScore &&
    !model.canMutateOfficialScoringEvents &&
    !model.canCreateProductionScoringEvents
  );
}

export function sandboxDecisionPanelCannotDriveLiveSelection(model: SandboxDecisionPanelModel): boolean {
  return !model.canDriveLiveSelection && !model.canDriveProductionRouteResolution && !model.modelAppliedToNormalLiveSelection;
}

export function sandboxDecisionPanelCannotClaimGlobalEconomy(model: SandboxDecisionPanelModel): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateSandboxDecisionPanelModel(model: SandboxDecisionPanelModel): readonly string[] {
  const shouldValidate = model.status === "available";
  const joinedBlocks = model.blocks.map((block) => `${block.title} ${block.summary} ${block.bullets.join(" ")}`).join("\n");
  const forbiddenWording = [
    "doit faire",
    "doit appliquer",
    "prouve que",
    "officiellement meilleure",
    "score aurait changé",
    "possession aurait officiellement changé",
    "sandbox est officiel",
  ];

  return [
    ...(shouldValidate && model.origin !== "coach_facing_timeline_review"
      ? ["SANDBOX_DECISION_PANEL_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.blocks.length !== 4
      ? ["SANDBOX_DECISION_PANEL_BLOCK_COUNT_NOT_4"]
      : []),
    ...(shouldValidate && model.recommendationType !== "test_support_around_forward_progress"
      ? ["SANDBOX_DECISION_PANEL_RECOMMENDATION_MISSING"]
      : []),
    ...(shouldValidate && !joinedBlocks.includes("hypothèse de travail")
      ? ["SANDBOX_DECISION_PANEL_SUGGESTION_WORDING_MISSING"]
      : []),
    ...(shouldValidate && forbiddenWording.some((fragment) => joinedBlocks.includes(fragment))
      ? ["SANDBOX_DECISION_PANEL_OVERCLAIMS_OFFICIAL_TRUTH"]
      : []),
    ...(!sandboxDecisionPanelCannotMutateOfficialFullMatch(model)
      ? ["SANDBOX_DECISION_PANEL_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!sandboxDecisionPanelCannotDriveLiveSelection(model)
      ? ["SANDBOX_DECISION_PANEL_LIVE_SELECTION_BREACH"]
      : []),
    ...(!sandboxDecisionPanelCannotClaimGlobalEconomy(model)
      ? ["SANDBOX_DECISION_PANEL_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function sandboxDecisionPanelFromTimelineReview(input: {
  readonly timelineReview: CoachFacingTimelineReviewModel;
}): SandboxDecisionPanelModel {
  if (input.timelineReview.status === "not_available") {
    return emptySandboxDecisionPanelModel({
      ...(input.timelineReview.segmentLabel === undefined ? {} : { segmentLabel: input.timelineReview.segmentLabel }),
      ...(input.timelineReview.chainId === undefined ? {} : { chainId: input.timelineReview.chainId }),
      warnings: input.timelineReview.warnings,
    });
  }

  const status = statusFromReview(input.timelineReview.status);
  const blocks = buildBlocks(input.timelineReview);
  const stillUnproven = [
    "multiple match contexts",
    "different goalkeeper profiles",
    "support positioning around Z4-HSR",
    "fatigue and pressure variation",
    "batch economy before production use",
  ];
  const result: SandboxDecisionPanelModel = {
    status,
    origin: "coach_facing_timeline_review",
    ...(input.timelineReview.segmentLabel === undefined ? {} : { segmentLabel: input.timelineReview.segmentLabel }),
    ...(input.timelineReview.chainId === undefined ? {} : { chainId: input.timelineReview.chainId }),
    title: "Panneau de décision sandbox",
    shortSummary:
      "Le sandbox propose une option coach à tester autour de FORWARD_PROGRESS et du soutien proche, sans modifier la vérité officielle du match.",
    recommendationType: "test_support_around_forward_progress",
    suggestedTacticalTest:
      "Tester FORWARD_PROGRESS vers control-space-hunter avec soutien proche autour de Z4-HSR et contrôle du second ballon.",
    associatedRisk:
      "Sans soutien proche, la progression peut devenir un tir isolé que le gardien peut sécuriser ou repousser vers une récupération adverse.",
    stillUnproven,
    blocks,
    suggestionOnly: true,
    officialTruth: false,
    officialTimelineUnchanged: true,
    officialScoreUnchanged: true,
    officialPossessionUnchanged: true,
    officialScoringEventsUnchanged: true,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    diagnosticOnly: true,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canCreateProductionScoringEvents: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateOfficialPossession: false,
    canMutateOfficialTimeline: false,
    canClaimGlobalEconomy: false,
    tags: [
      "sandbox_decision_panel",
      `sandbox_decision_panel_status_${status}`,
      "sandbox_decision_panel_origin_coach_facing_timeline_review",
      "sandbox_decision_recommendation_test_support_around_forward_progress",
      "sandbox_decision_suggestion_only_true",
      "sandbox_decision_official_truth_false",
      "sandbox_decision_can_drive_live_selection_false",
      "sandbox_decision_can_drive_production_route_resolution_false",
      "sandbox_decision_official_timeline_unchanged_true",
      "sandbox_decision_score_unchanged_true",
      "sandbox_decision_possession_unchanged_true",
      "sandbox_decision_scoring_events_unchanged_true",
      "sandbox_decision_production_scoring_event_creation_count_0",
      "sandbox_decision_global_economy_claim_forbidden",
      `sandbox_decision_still_unproven_count_${stillUnproven.length}`,
      "sandbox_decision_model_applied_only_in_sandbox_true",
      "sandbox_decision_model_applied_to_normal_live_false",
    ],
    warnings: input.timelineReview.warnings,
  };
  const warnings = validateSandboxDecisionPanelModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}
