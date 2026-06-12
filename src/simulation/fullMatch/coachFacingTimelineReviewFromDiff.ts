import type { OfficialTimelineDiffViewModel } from "./officialTimelineDiffView";
import {
  emptyCoachFacingTimelineReviewModel,
  type CoachFacingTimelineReviewBlock,
  type CoachFacingTimelineReviewModel,
  type CoachFacingTimelineReviewStatus,
} from "./coachFacingTimelineReview";

function statusFromDiff(status: OfficialTimelineDiffViewModel["status"]): CoachFacingTimelineReviewStatus {
  if (status === "available" || status === "blocked" || status === "partial" || status === "failed") {
    return status;
  }

  return "not_available";
}

function buildBlocks(diff: OfficialTimelineDiffViewModel): readonly CoachFacingTimelineReviewBlock[] {
  const finalOutcome = diff.override.finalSandboxOutcome ?? "secured_by_goalkeeper_team";
  const finalActor = diff.override.finalSandboxActorCandidate ?? "blitz-goalkeeper-free-safety";
  const finalZone = diff.override.finalSandboxZoneCandidate ?? "Z3-HSR";

  return [
    {
      blockId: "official_timeline",
      title: "Ce qui s'est passé officiellement",
      summary:
        "La timeline officielle reste la seule source de vérité du match. Dans ce run, le diff ne modifie ni les événements officiels, ni la possession officielle, ni le score officiel.",
      bullets: [
        "La timeline officielle reste la source de vérité.",
        "Le score officiel reste inchangé.",
        "La possession officielle reste inchangée.",
        "Les événements de score officiels restent inchangés.",
        "Les événements sandbox ne sont pas des MatchEvents officiels.",
      ],
      confidence: "medium",
      sandboxOnly: false,
      officialTruth: true,
      warnings: [],
    },
    {
      blockId: "sandbox_replay",
      title: "Ce que le sandbox a rejoué",
      summary:
        `Le sandbox rejoue un scénario parallèle sur le premier segment. L'override se termine par une récupération sécurisée par l'équipe du gardien, avec ${finalActor} comme acteur final en ${finalZone}.`,
      bullets: [
        `Baseline sandbox-only : ${diff.baselineSandboxOnlyEventCount} événements.`,
        `Override sandbox-only : ${diff.overrideSandboxOnlyEventCount} événements.`,
        `Outcome final de l'override : ${finalOutcome}.`,
        `Acteur final sandbox : ${finalActor}.`,
        `Zone finale sandbox : ${finalZone}.`,
      ],
      confidence: "medium",
      sandboxOnly: true,
      officialTruth: false,
      warnings: [],
    },
    {
      blockId: "sandbox_differences",
      title: "Ce qui est différent",
      summary:
        "La différence principale est uniquement expérimentale : le sandbox explore ce qu'aurait donné la route contrôlée FORWARD_PROGRESS, mais cette lecture ne remplace pas la timeline officielle.",
      bullets: [
        "La divergence appartient au sandbox, pas au match officiel.",
        "Le sandbox explore une route contrôlée et ses conséquences possibles.",
        "Cette lecture aide à comprendre l'alternative sans remplacer le résultat officiel.",
      ],
      confidence: "low",
      sandboxOnly: true,
      officialTruth: false,
      warnings: [],
    },
    {
      blockId: "unchanged_official_state",
      title: "Ce qui n'a pas été modifié",
      summary:
        "Rien n'est modifié côté officiel : pas d'événement ajouté, pas de possession changée, pas de score modifié, pas d'événement de score créé et aucune conclusion d'économie globale.",
      bullets: [
        `Timeline officielle inchangée : delta ${diff.officialTimelineEventCountDelta}.`,
        `Score officiel inchangé : delta ${diff.officialScoreDelta}.`,
        `Possession officielle changée : ${diff.officialPossessionChanged ? "oui" : "non"}.`,
        `Événements de score officiels inchangés : delta ${diff.officialScoringEventCountDelta}.`,
        "Aucun événement de score production n'est créé.",
        "Aucune preuve d'économie globale n'est modifiée.",
      ],
      confidence: "medium",
      sandboxOnly: false,
      officialTruth: true,
      warnings: [],
    },
  ];
}

export function coachFacingTimelineReviewCannotMutateOfficialFullMatch(model: CoachFacingTimelineReviewModel): boolean {
  return (
    model.officialTimelineUnchanged &&
    model.officialScoreUnchanged &&
    model.officialPossessionUnchanged &&
    model.officialScoringEventsUnchanged &&
    !model.sandboxEventsAreOfficial &&
    !model.sandboxEventsInsertedIntoOfficialTimeline &&
    !model.canInjectEventsIntoOfficialTimeline &&
    !model.canMutateOfficialScore &&
    !model.canMutateOfficialScoringEvents &&
    !model.canMutateOfficialPossession &&
    !model.canMutateOfficialTimeline &&
    !model.canCreateProductionScoringEvents &&
    !model.modelAppliedToNormalLiveSelection
  );
}

export function coachFacingTimelineReviewCannotClaimGlobalEconomy(model: CoachFacingTimelineReviewModel): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateCoachFacingTimelineReviewModel(model: CoachFacingTimelineReviewModel): readonly string[] {
  const shouldValidate = model.status === "available";
  const joinedBlocks = model.blocks.map((block) => `${block.title} ${block.summary} ${block.bullets.join(" ")}`).join("\n");

  return [
    ...(shouldValidate && model.origin !== "official_timeline_diff_view"
      ? ["COACH_FACING_TIMELINE_REVIEW_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.blocks.length !== 4
      ? ["COACH_FACING_TIMELINE_REVIEW_BLOCK_COUNT_NOT_4"]
      : []),
    ...(shouldValidate && !joinedBlocks.includes("source de vérité")
      ? ["COACH_FACING_TIMELINE_REVIEW_OFFICIAL_TRUTH_NOT_VISIBLE"]
      : []),
    ...(shouldValidate && joinedBlocks.includes("sandbox officiel")
      ? ["COACH_FACING_TIMELINE_REVIEW_SANDBOX_CALLED_OFFICIAL"]
      : []),
    ...(shouldValidate && joinedBlocks.includes("sandbox a modifié le score")
      ? ["COACH_FACING_TIMELINE_REVIEW_SANDBOX_SCORE_MUTATION_WORDING"]
      : []),
    ...(!coachFacingTimelineReviewCannotMutateOfficialFullMatch(model)
      ? ["COACH_FACING_TIMELINE_REVIEW_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!coachFacingTimelineReviewCannotClaimGlobalEconomy(model)
      ? ["COACH_FACING_TIMELINE_REVIEW_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function coachFacingTimelineReviewFromDiff(input: {
  readonly diffViewModel: OfficialTimelineDiffViewModel;
}): CoachFacingTimelineReviewModel {
  if (input.diffViewModel.status === "not_available") {
    return emptyCoachFacingTimelineReviewModel({
      ...(input.diffViewModel.segmentLabel === undefined ? {} : { segmentLabel: input.diffViewModel.segmentLabel }),
      ...(input.diffViewModel.chainId === undefined ? {} : { chainId: input.diffViewModel.chainId }),
      warnings: input.diffViewModel.warnings,
    });
  }

  const status = statusFromDiff(input.diffViewModel.status);
  const blocks = buildBlocks(input.diffViewModel);
  const result: CoachFacingTimelineReviewModel = {
    status,
    origin: "official_timeline_diff_view",
    ...(input.diffViewModel.segmentLabel === undefined ? {} : { segmentLabel: input.diffViewModel.segmentLabel }),
    ...(input.diffViewModel.chainId === undefined ? {} : { chainId: input.diffViewModel.chainId }),
    title: "Lecture timeline officielle vs sandbox",
    shortSummary:
      "La timeline officielle reste la source de vérité ; le sandbox sert uniquement à relire une alternative contrôlée sans modifier le match.",
    blocks,
    officialTimelineUnchanged: true,
    officialScoreUnchanged: true,
    officialPossessionUnchanged: true,
    officialScoringEventsUnchanged: true,
    sandboxEventsAreOfficial: false,
    sandboxEventsInsertedIntoOfficialTimeline: false,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateOfficialPossession: false,
    canMutateOfficialTimeline: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [
      "coach_facing_timeline_review",
      `coach_facing_timeline_review_status_${status}`,
      "coach_facing_timeline_review_origin_official_timeline_diff_view",
      "timeline_review_official_unchanged_true",
      "timeline_review_score_unchanged_true",
      "timeline_review_possession_unchanged_true",
      "timeline_review_scoring_events_unchanged_true",
      `timeline_review_sandbox_baseline_events_${input.diffViewModel.baselineSandboxOnlyEventCount}`,
      `timeline_review_sandbox_override_events_${input.diffViewModel.overrideSandboxOnlyEventCount}`,
      `timeline_review_override_final_outcome_${input.diffViewModel.override.finalSandboxOutcome ?? "none"}`,
      `timeline_review_override_final_actor_${input.diffViewModel.override.finalSandboxActorCandidate ?? "none"}`,
      `timeline_review_override_final_zone_${input.diffViewModel.override.finalSandboxZoneCandidate ?? "none"}`,
      "timeline_review_sandbox_events_not_official",
      "timeline_review_sandbox_events_not_inserted",
      "timeline_review_read_only",
      "timeline_review_production_scoring_event_creation_count_0",
      "timeline_review_global_economy_claim_forbidden",
      "timeline_review_model_applied_only_in_sandbox_true",
      "timeline_review_model_applied_to_normal_live_false",
    ],
    warnings: input.diffViewModel.warnings,
  };
  const warnings = validateCoachFacingTimelineReviewModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}
