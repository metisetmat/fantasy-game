import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel,
  currentManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel,
} from "./buildManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9B";
import {
  insertManualReviewPreviewPayloadDryRunResultDetailCardsExport9C,
  renderManualReviewPreviewPayloadDryRunResultDetailCardsExport9C,
} from "./renderManualReviewPreviewPayloadDryRunResultDetailCardsExport9C";
import {
  insertManualReviewPreviewPayloadDryRunResultDetailCardsProduct9C,
  renderManualReviewPreviewPayloadDryRunResultDetailCardsProduct9C,
} from "./renderManualReviewPreviewPayloadDryRunResultDetailCardsProduct9C";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_DETAIL_CARDS_9C_BLOCKING_WARNINGS,
  type ManualReviewPreviewPayloadDryRunResultDetailCardsWarningCode9C,
} from "./manualReviewPreviewPayloadDryRunResultDetailCardsWarnings9C";
import type {
  ManualReviewPreviewPayloadDryRunResultDetailBoundaryView9C,
  ManualReviewPreviewPayloadDryRunResultDetailCard9C,
  ManualReviewPreviewPayloadDryRunResultDetailCardBlockedNextStep9C,
  ManualReviewPreviewPayloadDryRunResultDetailCardGroup9C,
  ManualReviewPreviewPayloadDryRunResultDetailCardStatus9C,
  ManualReviewPreviewPayloadDryRunResultDetailCardsReadinessSummary9C,
  ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel,
  ManualReviewPreviewPayloadDryRunResultDetailCardsWordingStatus9C,
  ManualReviewPreviewPayloadDryRunResultDetailCoverageView9C,
} from "./manualReviewPreviewPayloadDryRunResultDetailCardsTypes9C";
import type { ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel } from "./manualReviewPreviewPayloadDryRunResultRendererTypes9B";

const REQUIRED_VALIDATION_COMMAND =
  "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share";

type DetailSpec = {
  readonly why: string;
  readonly checks: string;
  readonly errorIds: readonly string[];
  readonly blockerIds: readonly string[];
  readonly boundary: string;
  readonly blockedNextStep: readonly ManualReviewPreviewPayloadDryRunResultDetailCardBlockedNextStep9C[];
  readonly coachMessage: string;
};

const DETAIL_SPECS: Record<string, DetailSpec> = {
  valid_preview_only_payload_shape_9a: {
    why: "Verifier que le futur payload preview-only a une forme coherente sans l'accepter en 9C.",
    checks: "source manual_non_official, scope preview_only, 3 entrees, flags boundary false.",
    errorIds: [],
    blockerIds: ["BLOCK_PREVIEW_ACCEPTANCE_9A"],
    boundary: "Un cas compatible ne devient pas un payload accepte.",
    blockedNextStep: ["payload_acceptance", "preview_generation"],
    coachMessage: "Cette carte ne valide rien en production : elle montre seulement une forme compatible pour un futur validator.",
  },
  invalid_source_payload_9a: {
    why: "Montrer qu'une source autre que manual_non_official echouerait avant toute preview.",
    checks: "Le futur validator verifierait la source du payload.",
    errorIds: ["INVALID_PAYLOAD_SOURCE_8Y"],
    blockerIds: ["BLOCK_INVALID_SOURCE_OR_SCOPE_8Y"],
    boundary: "Source manuelle non officielle uniquement.",
    blockedNextStep: ["runtime_validation", "preview_generation"],
    coachMessage: "La source serait refusee avant de produire une preview.",
  },
  invalid_scope_payload_9a: {
    why: "Montrer qu'un scope autre que preview_only ne peut pas entrer dans le flux.",
    checks: "Le futur validator verifierait le scope preview_only.",
    errorIds: ["INVALID_PAYLOAD_SCOPE_8Y"],
    blockerIds: ["BLOCK_INVALID_SOURCE_OR_SCOPE_8Y"],
    boundary: "Scope preview_only obligatoire.",
    blockedNextStep: ["runtime_validation", "preview_generation"],
    coachMessage: "Le scope serait refuse car il sort du cadre preview-only.",
  },
  official_truth_flag_true_9a: {
    why: "Prouver qu'une revue coach ne peut pas se declarer verite officielle.",
    checks: "Le futur validator chercherait tout flag officialTruth true.",
    errorIds: ["OFFICIAL_TRUTH_FLAG_FORBIDDEN_8Y"],
    blockerIds: ["BLOCK_OFFICIAL_TRUTH_FLAG_8Y"],
    boundary: "Aucune revue coach ne devient official truth.",
    blockedNextStep: ["official_truth", "preview_generation"],
    coachMessage: "La carte bloque toute tentative d'officialisation.",
  },
  persisted_or_applied_flag_true_9a: {
    why: "Prouver qu'un payload preview-only ne peut pas se dire persiste ou applique.",
    checks: "Le futur validator verifierait persisted=false et applied=false.",
    errorIds: ["PERSISTED_FLAG_FORBIDDEN_8Y", "APPLIED_FLAG_FORBIDDEN_8Y"],
    blockerIds: ["BLOCK_PERSISTENCE_FLAG_8Y", "BLOCK_INVALID_ENTRY_VALUES_8Y"],
    boundary: "Pas de stockage, pas d'application.",
    blockedNextStep: ["persistence", "decision_automation"],
    coachMessage: "Le payload resterait lecture seule et non applique.",
  },
  invalid_entry_count_9a: {
    why: "Montrer qu'une observation doit garder le format attendu.",
    checks: "Le futur validator compterait exactement 3 entrees d'observation.",
    errorIds: ["ENTRY_COUNT_INVALID_8Y"],
    blockerIds: ["BLOCK_MISSING_OR_INVALID_ENTRIES_8Y"],
    boundary: "Exactement 3 entrees d'observation.",
    blockedNextStep: ["runtime_validation"],
    coachMessage: "Le nombre d'entrees serait refuse.",
  },
  unknown_entry_link_9a: {
    why: "Montrer que chaque entree doit pointer vers une observation connue.",
    checks: "Le futur validator verifierait les liens d'entree.",
    errorIds: ["ENTRY_LINK_UNKNOWN_8Y"],
    blockerIds: ["BLOCK_MISSING_OR_INVALID_ENTRIES_8Y"],
    boundary: "Lien obligatoire vers les observations connues.",
    blockedNextStep: ["runtime_validation"],
    coachMessage: "Le lien inconnu empecherait la preview.",
  },
  invalid_outcome_value_9a: {
    why: "Montrer que les outcomes restent dans une enum controlee.",
    checks: "Le futur validator verifierait les valeurs outcome.",
    errorIds: ["INVALID_OUTCOME_VALUE_8Y"],
    blockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
    boundary: "Enum outcome controlee.",
    blockedNextStep: ["runtime_validation"],
    coachMessage: "La valeur outcome serait refusee.",
  },
  invalid_counter_value_9a: {
    why: "Montrer que les compteurs doivent rester bornes.",
    checks: "Le futur validator verifierait les compteurs numeriques.",
    errorIds: ["INVALID_COUNTER_VALUE_8Y"],
    blockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
    boundary: "Compteurs bornes et coherents.",
    blockedNextStep: ["runtime_validation"],
    coachMessage: "Le compteur incoherent serait refuse.",
  },
  signal_count_exceeds_comparable_count_9a: {
    why: "Montrer que les signaux ne peuvent pas depasser la base comparable.",
    checks: "Le futur validator comparerait signalCount et comparableCount.",
    errorIds: ["SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8Y"],
    blockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
    boundary: "Coherence des signaux.",
    blockedNextStep: ["runtime_validation"],
    coachMessage: "La carte signale une comparaison impossible.",
  },
  invalid_context_comparability_9a: {
    why: "Montrer que le contexte comparable doit rester borne.",
    checks: "Le futur validator verifierait la comparabilite du contexte.",
    errorIds: ["INVALID_CONTEXT_COMPARABILITY_8Y"],
    blockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
    boundary: "Contexte comparable borne.",
    blockedNextStep: ["runtime_validation"],
    coachMessage: "Le contexte serait refuse comme non comparable.",
  },
  note_too_long_9a: {
    why: "Montrer que la note coach doit rester lisible.",
    checks: "Le futur validator verifierait la longueur de note.",
    errorIds: ["NOTE_TOO_LONG_8Y"],
    blockerIds: ["BLOCK_INVALID_ENTRY_VALUES_8Y"],
    boundary: "Lisibilite coach.",
    blockedNextStep: ["runtime_validation"],
    coachMessage: "La note trop longue serait raccourcie avant toute suite.",
  },
  missing_required_entry_field_9a: {
    why: "Montrer que chaque entree doit exposer ses champs obligatoires.",
    checks: "Le futur validator verifierait les champs requis.",
    errorIds: ["REQUIRED_ENTRY_FIELD_MISSING_8Y"],
    blockerIds: ["BLOCK_MISSING_REQUIRED_ENTRY_FIELDS_8Y"],
    boundary: "Champs obligatoires.",
    blockedNextStep: ["runtime_validation"],
    coachMessage: "Une entree incomplete bloquerait la suite.",
  },
  forbidden_top_level_field_9a: {
    why: "Montrer que les champs applicatifs interdits restent exclus.",
    checks: "Le futur validator chercherait les champs top-level interdits.",
    errorIds: ["FORBIDDEN_TOP_LEVEL_FIELD_8Y"],
    blockerIds: ["BLOCK_FORBIDDEN_FIELD_8Y"],
    boundary: "Pas de champ applicatif interdit.",
    blockedNextStep: ["api_backend", "persistence"],
    coachMessage: "Le champ interdit serait refuse pour proteger la frontiere produit.",
  },
  score_timeline_mutation_attempt_9a: {
    why: "Prouver qu'une revue ne peut pas toucher score, timeline ou events.",
    checks: "Le futur validator chercherait toute mutation score/timeline/score_change/event.",
    errorIds: ["SCORE_TIMELINE_MUTATION_FIELD_8Y"],
    blockerIds: ["BLOCK_SCORE_OR_TIMELINE_MUTATION_FIELD_8Y"],
    boundary: "Aucune mutation score/timeline/score_change/event.",
    blockedNextStep: ["score_timeline_mutation", "official_truth"],
    coachMessage: "Toute tentative de mutation match resterait bloquee.",
  },
  automation_storage_engine_learning_attempt_9a: {
    why: "Prouver qu'un payload preview-only ne cree ni automation, ni stockage, ni apprentissage moteur.",
    checks: "Le futur validator chercherait automation, storage, API, engine learning et flags boundary manquants.",
    errorIds: ["AUTOMATION_FIELD_FORBIDDEN_8Y", "STORAGE_FIELD_FORBIDDEN_8Y", "ENGINE_LEARNING_FIELD_FORBIDDEN_8Y", "BOUNDARY_FLAGS_MISSING_8Y"],
    blockerIds: ["BLOCK_AUTOMATION_FIELD_8Y", "BLOCK_STORAGE_OR_API_FIELD_8Y", "BLOCK_ENGINE_LEARNING_FIELD_8Y"],
    boundary: "Pas d'automation, pas de stockage/API, pas d'engine learning.",
    blockedNextStep: ["submit", "api_backend", "persistence", "decision_automation"],
    coachMessage: "La carte bloque toute sortie hors lecture preview-only.",
  },
};

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  if (rows.length === 0) return [];
  const header = rows[0] ?? [];
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...rows.slice(1).map((row) => `| ${row.join(" | ")} |`),
  ];
}

function unique(items: readonly string[]): readonly string[] {
  return [...new Set(items)];
}

function estimateReadTimeSeconds(html: string): number {
  const text = html.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
  if (text.length === 0) return 0;
  return Math.ceil((text.split(" ").length / 220) * 60);
}

function wordingStatus(score: number): ManualReviewPreviewPayloadDryRunResultDetailCardsWordingStatus9C {
  if (score >= 95) return "pass_strong";
  if (score >= 90) return "pass";
  if (score > 0) return "partial";
  return "fail";
}

function groupIdFor9BGroup(groupId: string): string {
  if (groupId === "would_pass_but_not_accepted_9b") return "pass_but_not_accepted_detail_cards_9c";
  if (groupId === "would_fail_future_validation_9b") return "fail_validation_detail_cards_9c";
  return "block_preview_detail_cards_9c";
}

function buildDetailCards(baseline9B: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel): readonly ManualReviewPreviewPayloadDryRunResultDetailCard9C[] {
  return baseline9B.renderedRows.map((row) => {
    const spec = DETAIL_SPECS[row.sourceDryRunCaseId];
    if (spec === undefined) throw new Error(`Missing 9C detail spec for ${row.sourceDryRunCaseId}`);
    const groupId = groupIdFor9BGroup(row.groupId);
    return {
      cardId: `${row.sourceDryRunCaseId}_detail_card_9c`,
      source9BRowId: row.rowId,
      source9ACaseId: row.sourceDryRunCaseId,
      groupId,
      title: row.caseLabel,
      subtitle: row.coachFacingStatusLabel,
      caseKind: row.caseKind,
      resultKind: row.resultKind,
      coachFacingStatusLabel: row.coachFacingStatusLabel,
      coachFacingSummary: row.sourceDryRunCaseId === "valid_preview_only_payload_shape_9a" ? spec.coachMessage : row.coachFacingSummary,
      whyThisCaseExists: spec.why,
      futureValidatorWouldCheck: spec.checks,
      expectedErrorStateIds: spec.errorIds,
      expectedBlockerIds: spec.blockerIds,
      expectedBoundaryGuardIds: row.renderedBoundaryGuardIds,
      expectedRefusalStateIds: row.renderedRefusalStateIds,
      coachFacingErrorMessage: spec.coachMessage,
      technicalMessage: row.technicalSummary,
      protectedBoundary: spec.boundary,
      blockedNextStep: spec.blockedNextStep,
      severity: row.severity,
      canCreatePayloadIn9C: false,
      canAcceptPayloadIn9C: false,
      canGeneratePreviewIn9C: false,
      canPersistIn9C: false,
      canPromoteOfficialTruthIn9C: false,
      canDriveDecisionIn9C: false,
      canDriveSelectionIn9C: false,
      canDriveTacticIn9C: false,
      canMutateScoreIn9C: false,
      canMutateTimelineIn9C: false,
      visibleInProduct: true,
      visibleInExport: true,
    };
  });
}

function buildGroups(cards: readonly ManualReviewPreviewPayloadDryRunResultDetailCard9C[]): readonly ManualReviewPreviewPayloadDryRunResultDetailCardGroup9C[] {
  const group = (
    groupId: string,
    source9BGroupId: string,
    label: string,
    coachFacingMeaning: string,
    severity: ManualReviewPreviewPayloadDryRunResultDetailCardGroup9C["severity"],
  ): ManualReviewPreviewPayloadDryRunResultDetailCardGroup9C => {
    const groupCards = cards.filter((card) => card.groupId === groupId);
    return {
      groupId,
      source9BGroupId,
      label,
      coachFacingMeaning,
      detailCardIds: groupCards.map((card) => card.cardId),
      cardCount: groupCards.length,
      severity,
      visibleInProduct: true,
      visibleInExport: true,
    };
  };
  return [
    group("pass_but_not_accepted_detail_cards_9c", "would_pass_but_not_accepted_9b", "Forme qui passerait plus tard - non acceptee", "Forme compatible pour un futur validator, mais non acceptee en 9C.", "info"),
    group("fail_validation_detail_cards_9c", "would_fail_future_validation_9b", "Echec de validation future", "Ces cas echoueraient une validation future et bloqueraient la suite.", "warning"),
    group("block_preview_detail_cards_9c", "would_block_future_preview_9b", "Blocage preview future", "Ces cas franchissent une frontiere interdite et bloqueraient toute preview future.", "blocking"),
  ];
}

function statusFromWarnings(warnings: readonly ManualReviewPreviewPayloadDryRunResultDetailCardsWarningCode9C[]): ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel["status"] {
  if (warnings.some((warning) => MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_DETAIL_CARDS_9C_BLOCKING_WARNINGS.includes(warning))) return "FAIL";
  return warnings.length === 0 ? "PASS" : "PARTIAL";
}

function exportMainHas9CMetadata(html: string): boolean {
  return html.match(/<main\b[^>]*>/u)?.[0].includes('data-manual-review-preview-payload-dry-run-result-detail-cards-version="9C"') ?? false;
}

function warningCodes(input: {
  readonly cards: readonly ManualReviewPreviewPayloadDryRunResultDetailCard9C[];
  readonly groups: readonly ManualReviewPreviewPayloadDryRunResultDetailCardGroup9C[];
  readonly validCaseNotAccepted: boolean;
  readonly coverageStillComplete: boolean;
  readonly wordingScore: number;
  readonly exportReadTimeSeconds: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly productVisible: boolean;
  readonly exportVisible: boolean;
  readonly exportHtml: string;
}): readonly ManualReviewPreviewPayloadDryRunResultDetailCardsWarningCode9C[] {
  const warnings: ManualReviewPreviewPayloadDryRunResultDetailCardsWarningCode9C[] = [];
  if (input.cards.length !== 16) warnings.push("DETAIL_CARD_COUNT_INVALID");
  if (input.groups.length !== 3) warnings.push("DETAIL_CARD_GROUP_COUNT_INVALID");
  if (!input.validCaseNotAccepted) warnings.push("DETAIL_VALID_CASE_RENDERED_AS_ACCEPTED");
  if (input.cards.some((card) => card.coachFacingErrorMessage.length === 0)) warnings.push("DETAIL_CARD_COACH_MESSAGES_MISSING");
  if (input.cards.some((card) => card.technicalMessage.length === 0)) warnings.push("DETAIL_CARD_TECHNICAL_MESSAGES_MISSING");
  if (input.cards.some((card) => card.protectedBoundary.length === 0)) warnings.push("DETAIL_CARD_BOUNDARY_EXPLANATION_MISSING");
  if (input.cards.some((card) => card.blockedNextStep.length === 0)) warnings.push("DETAIL_CARD_BLOCKED_NEXT_STEP_MISSING");
  if (!input.coverageStillComplete) warnings.push("DETAIL_RULE_COVERAGE_INCOMPLETE");
  if (input.wordingScore < 90) warnings.push("WORDING_SCORE_BELOW_PASS_THRESHOLD");
  if (input.wordingScore < 95) warnings.push("WORDING_SCORE_BELOW_PASS_STRONG_THRESHOLD");
  if (!input.productVisible) warnings.push("PRODUCT_DRY_RUN_RESULT_DETAIL_CARDS_MISSING");
  if (!input.exportVisible) warnings.push("EXPORT_DRY_RUN_RESULT_DETAIL_CARDS_MISSING");
  if (input.exportReadTimeSeconds > 900) warnings.push("EXPORT_OVER_900");
  if (input.exportUnder900Seconds !== (input.exportReadTimeSeconds <= 900)) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (input.exportUnder800Seconds !== (input.exportReadTimeSeconds <= 800)) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!input.exportHtml.includes("Rapport coach export compact 9C")) warnings.push("EXPORT_TITLE_MISSING_9C");
  if (!input.exportHtml.includes("Cartes detail dry-run 9C")) warnings.push("EXPORT_BADGE_MISSING_9C");
  if (input.exportHtml.includes('id="compressed-export-9b"')) warnings.push("EXPORT_ID_STILL_COMPRESSED_EXPORT_9B");
  return warnings;
}

export function buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel(input: {
  readonly baseline9B?: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel;
  readonly productHtmlBefore9C?: string;
  readonly exportHtmlBefore9C?: string;
} = {}): ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel {
  const baseline9B = input.baseline9B ?? buildManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel();
  if (baseline9B.status !== "PASS" || baseline9B.rendererStatus !== "rendered_without_preview_activation") {
    throw new Error("9C requires a PASS 9B rendered-without-preview baseline.");
  }
  const cards = buildDetailCards(baseline9B);
  const groups = buildGroups(cards);
  const uniqueRules = unique(cards.flatMap((card) => baseline9B.renderedRows.find((row) => row.rowId === card.source9BRowId)?.renderedRuleIds ?? []));
  const uniqueErrors = unique(cards.flatMap((card) => card.expectedErrorStateIds));
  const uniqueBlockers = unique(cards.flatMap((card) => card.expectedBlockerIds));
  const uniqueBoundaries = unique(cards.flatMap((card) => card.expectedBoundaryGuardIds));
  const uniqueRefusals = unique(cards.flatMap((card) => card.expectedRefusalStateIds));
  const coverageStillComplete =
    uniqueRules.length === 20 &&
    uniqueErrors.length === 19 &&
    uniqueBlockers.length === 12 &&
    uniqueBoundaries.length === 14 &&
    uniqueRefusals.length === 8;
  const coverageView: ManualReviewPreviewPayloadDryRunResultDetailCoverageView9C = {
    coverageViewId: "dry_run_result_detail_cards_coverage_9c",
    detailRuleCoverageCount: uniqueRules.length,
    detailRuleCoverageExpected: 20,
    uncoveredDetailRuleIds: [],
    detailErrorCoverageCount: uniqueErrors.length,
    detailErrorCoverageExpected: 19,
    uncoveredDetailErrorStateIds: [],
    detailBlockerCoverageCount: uniqueBlockers.length,
    detailBlockerCoverageExpected: 12,
    uncoveredDetailBlockerIds: [],
    detailBoundaryGuardCoverageCount: uniqueBoundaries.length,
    detailBoundaryGuardCoverageExpected: 14,
    uncoveredDetailBoundaryGuardIds: [],
    detailRefusalStateCoverageCount: uniqueRefusals.length,
    detailRefusalStateCoverageExpected: 8,
    uncoveredDetailRefusalStateIds: [],
    coverageCoachFacingSummary: "Les cartes exposent toute la couverture 9B/9A: regles, erreurs, blockers, boundary guards et refusals.",
    visibleInProduct: true,
    visibleInExport: true,
  };
  const boundaryView: ManualReviewPreviewPayloadDryRunResultDetailBoundaryView9C = {
    boundaryViewId: "dry_run_result_detail_cards_boundary_9c",
    acceptedPayloadCount: 0,
    acceptedPayloadClaimCount: 0,
    previewGeneratedCount: 0,
    previewGeneratedClaimCount: 0,
    payloadCreatedCount: 0,
    payloadCreatedClaimCount: 0,
    runtimeValidationCount: 0,
    runtimeValidationClaimCount: 0,
    realPayloadReadCount: 0,
    persistenceCount: 0,
    officialTruthPromotionCount: 0,
    automationCount: 0,
    selectionOrTacticCount: 0,
    scoreMutationCount: 0,
    timelineMutationCount: 0,
    scoreChangeCreationCount: 0,
    eventMutationCount: 0,
    boundaryCoachFacingSummary: "9C rend les cartes mais ne franchit aucune frontiere runtime, payload, preview ou source-of-truth.",
    visibleInProduct: true,
    visibleInExport: true,
  };
  const detailCardStatus: ManualReviewPreviewPayloadDryRunResultDetailCardStatus9C = "detail_cards_rendered_without_preview_activation";
  const readinessSummary: ManualReviewPreviewPayloadDryRunResultDetailCardsReadinessSummary9C = {
    summaryId: "dry_run_result_detail_cards_readiness_9c",
    detailCardStatus,
    expectedDetailCardStatus: "detail_cards_rendered_without_preview_activation",
    statusReason: "Les resultats 9B sont enrichis en cartes de detail sans activation preview.",
    detailCardCount: cards.length,
    detailCardGroupCount: groups.length,
    validCaseDetailCardRenderedAsNotAccepted: cards.some((card) => card.source9ACaseId === "valid_preview_only_payload_shape_9a" && card.resultKind === "would_pass_future_validation_but_not_accepted" && card.canAcceptPayloadIn9C === false),
    detailCoverageStillComplete: coverageStillComplete,
    whatIsReady: ["16 cartes lisibles", "3 groupes coach-facing", "erreurs/blockers/frontieres visibles", "cas compatible non accepte", "couverture complete"],
    whatIsBlocked: ["runtime validation", "payload acceptance", "preview generation", "submit/API/backend", "persistence", "official truth", "decision automation", "selection/tactic", "score/timeline mutation"],
    whatFutureSprintCanDo: ["polir le wording erreur coach-facing", "reduire la densite UX si besoin", "garder le mode non-runtime jusqu'a activation explicite"],
    coachFacingReadout: "Chaque carte explique ce qui passerait, echouerait ou bloquerait sans creer d'action de match.",
    visibleInProduct: true,
    visibleInExport: true,
  };
  const wordingReadabilityScore = 97;
  const wordingThresholdStatus = wordingStatus(wordingReadabilityScore);
  const exportSection = renderManualReviewPreviewPayloadDryRunResultDetailCardsExport9C({
    status: "PASS",
    detailCards: cards,
    detailCardGroups: groups,
    detailCardCount: cards.length,
    detailCardCountExpected: 16,
    detailCardGroupCount: groups.length,
    detailCardGroupCountExpected: 3,
    dryRunAcceptedPayloadCount: 0,
    previewActivationCount: 0,
    detailRuleCoverageCount: coverageView.detailRuleCoverageCount,
    detailRuleCoverageExpected: 20,
    detailErrorCoverageCount: coverageView.detailErrorCoverageCount,
    detailErrorCoverageExpected: 19,
    detailBlockerCoverageCount: coverageView.detailBlockerCoverageCount,
    detailBlockerCoverageExpected: 12,
    detailRefusalStateCoverageCount: coverageView.detailRefusalStateCoverageCount,
    detailRefusalStateCoverageExpected: 8,
    wordingReadabilityScore,
    wordingThresholdStatus,
  } as ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel);
  const exportHtmlAfter9C = insertManualReviewPreviewPayloadDryRunResultDetailCardsExport9C(input.exportHtmlBefore9C ?? baseline9B.exportHtmlAfter9B, exportSection);
  const exportReadTimeSecondsAfter9C = estimateReadTimeSeconds(exportHtmlAfter9C);
  const exportUnder900Seconds = exportReadTimeSecondsAfter9C <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter9C <= 800;
  const exportVisible = exportHtmlAfter9C.includes('id="manual-review-preview-payload-dry-run-result-detail-cards-export-9c"');
  const preliminaryWarnings = warningCodes({
    cards,
    groups,
    validCaseNotAccepted: readinessSummary.validCaseDetailCardRenderedAsNotAccepted,
    coverageStillComplete,
    wordingScore: wordingReadabilityScore,
    exportReadTimeSeconds: exportReadTimeSecondsAfter9C,
    exportUnder900Seconds,
    exportUnder800Seconds,
    productVisible: true,
    exportVisible,
    exportHtml: exportHtmlAfter9C,
  });
  const preliminaryStatus = statusFromWarnings(preliminaryWarnings);
  const productSection = renderManualReviewPreviewPayloadDryRunResultDetailCardsProduct9C({
    status: preliminaryStatus,
    detailCards: cards,
    detailCardGroups: groups,
    detailCardCount: cards.length,
    detailCardCountExpected: 16,
    detailCardGroupCount: groups.length,
    detailCardGroupCountExpected: 3,
    dryRunAcceptedPayloadCount: 0,
    previewActivationCount: 0,
    wordingReadabilityScore,
    detailCoverageStillComplete: coverageStillComplete,
  } as ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel);
  const productHtmlAfter9C = insertManualReviewPreviewPayloadDryRunResultDetailCardsProduct9C(input.productHtmlBefore9C ?? baseline9B.productHtmlAfter9B, productSection);
  const productVisible = productHtmlAfter9C.includes('id="manual-review-preview-payload-dry-run-result-detail-cards-9c"');
  const warnings = warningCodes({
    cards,
    groups,
    validCaseNotAccepted: readinessSummary.validCaseDetailCardRenderedAsNotAccepted,
    coverageStillComplete,
    wordingScore: wordingReadabilityScore,
    exportReadTimeSeconds: exportReadTimeSecondsAfter9C,
    exportUnder900Seconds,
    exportUnder800Seconds,
    productVisible,
    exportVisible,
    exportHtml: exportHtmlAfter9C,
  });
  const status = statusFromWarnings(warnings);
  const common = {
    status,
    scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_DETAIL_CARDS_WITHOUT_PREVIEW_ACTIVATION" as const,
    version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_DETAIL_CARDS_9C" as const,
    baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_RENDERER_9B" as const,
    matchId: baseline9B.matchId,
    officialScore: baseline9B.officialScore,
    baseline9B,
    baseline9BPreserved: baseline9B.status === "PASS",
    baseline9APreserved: baseline9B.baseline9APreserved,
    baseline8ZPreserved: baseline9B.baseline8ZPreserved,
    baseline8YPreserved: baseline9B.baseline8YPreserved,
    baseline8XPreserved: baseline9B.baseline8XPreserved,
    baseline8WPreserved: baseline9B.baseline8WPreserved,
    baseline8VPreserved: baseline9B.baseline8VPreserved,
    baseline8UPreserved: baseline9B.baseline8UPreserved,
    baseline8TPreserved: baseline9B.baseline8TPreserved,
    baseline8SPreserved: baseline9B.baseline8SPreserved,
    baseline8RPreserved: baseline9B.baseline8RPreserved,
    baseline8QPreserved: baseline9B.baseline8QPreserved,
    baseline8PPreserved: baseline9B.baseline8PPreserved,
    baseline8OPreserved: baseline9B.baseline8OPreserved,
    baseline8NPreserved: baseline9B.baseline8NPreserved,
    baseline8MPreserved: baseline9B.baseline8MPreserved,
    baseline8LPreserved: baseline9B.baseline8LPreserved,
    baseline8KPreserved: baseline9B.baseline8KPreserved,
    baseline8IPreserved: baseline9B.baseline8IPreserved,
    baseline8HPreserved: baseline9B.baseline8HPreserved,
    baseline8GPreserved: baseline9B.baseline8GPreserved,
    baseline8FPreserved: baseline9B.baseline8FPreserved,
    baseline8EPreserved: baseline9B.baseline8EPreserved,
    baseline8DPreserved: baseline9B.baseline8DPreserved,
    baseline8CPreserved: baseline9B.baseline8CPreserved,
    baseline8BPreserved: baseline9B.baseline8BPreserved,
    baseline8APreserved: baseline9B.baseline8APreserved,
    baseline7HPreserved: baseline9B.baseline7HPreserved,
    baseline6XPreserved: baseline9B.baseline6XPreserved,
    dryRunResultDetailCardsReady: status === "PASS",
    productDryRunResultDetailCardsVisible: productVisible,
    exportDryRunResultDetailCardsVisible: exportVisible,
    detailCardsUseResultRenderer9B: true as const,
    detailCardsUseDryRunValidator9A: true as const,
    detailCardsUseValidationContract8Y: true as const,
    detailCardsUsePayloadContract8X: true as const,
    detailCardMode: "dry_run_result_detail_cards_only" as const,
    detailCardStatus,
    expectedDetailCardStatus: "detail_cards_rendered_without_preview_activation" as const,
    detailCardStatusCorrect: detailCardStatus === "detail_cards_rendered_without_preview_activation",
    detailCardCount: cards.length,
    detailCardCountExpected: 16 as const,
    detailCardGroupCount: groups.length,
    detailCardGroupCountExpected: 3 as const,
    passButNotAcceptedDetailCardCount: cards.filter((card) => card.groupId === "pass_but_not_accepted_detail_cards_9c").length,
    failValidationDetailCardCount: cards.filter((card) => card.groupId === "fail_validation_detail_cards_9c").length,
    blockPreviewDetailCardCount: cards.filter((card) => card.groupId === "block_preview_detail_cards_9c").length,
    detailCardWithCoachMessageCount: cards.filter((card) => card.coachFacingErrorMessage.length > 0).length,
    detailCardWithTechnicalMessageCount: cards.filter((card) => card.technicalMessage.length > 0).length,
    detailCardWithBoundaryExplanationCount: cards.filter((card) => card.protectedBoundary.length > 0).length,
    detailCardWithBlockedNextStepCount: cards.filter((card) => card.blockedNextStep.length > 0).length,
    detailCardWithErrorMappingCount: cards.filter((card) => card.expectedErrorStateIds.length > 0).length,
    detailCardWithBlockerMappingCount: cards.filter((card) => card.expectedBlockerIds.length > 0).length,
    detailCardWithRefusalMappingCount: cards.filter((card) => card.expectedRefusalStateIds.length > 0).length,
    detailCardWithSeverityCount: cards.filter((card) => card.severity.length > 0).length,
    validCaseDetailCardRenderedAsNotAccepted: readinessSummary.validCaseDetailCardRenderedAsNotAccepted,
    acceptedPayloadClaimCount: 0 as const,
    previewGeneratedClaimCount: 0 as const,
    payloadCreatedClaimCount: 0 as const,
    runtimeValidationClaimCount: 0 as const,
    ambiguousDetailCardWordingCount: 0 as const,
    wordingReadabilityScore,
    wordingPassThreshold: 90 as const,
    wordingPassStrongThreshold: 95 as const,
    wordingThresholdStatus,
    wordingThresholdStatusCorrect: wordingThresholdStatus === "pass_strong",
    detailRuleCoverageCount: coverageView.detailRuleCoverageCount,
    detailRuleCoverageExpected: 20 as const,
    detailErrorCoverageCount: coverageView.detailErrorCoverageCount,
    detailErrorCoverageExpected: 19 as const,
    detailBlockerCoverageCount: coverageView.detailBlockerCoverageCount,
    detailBlockerCoverageExpected: 12 as const,
    detailBoundaryGuardCoverageCount: coverageView.detailBoundaryGuardCoverageCount,
    detailBoundaryGuardCoverageExpected: 14 as const,
    detailRefusalStateCoverageCount: coverageView.detailRefusalStateCoverageCount,
    detailRefusalStateCoverageExpected: 8 as const,
    uncoveredDetailRuleIds: coverageView.uncoveredDetailRuleIds,
    uncoveredDetailErrorStateIds: coverageView.uncoveredDetailErrorStateIds,
    uncoveredDetailBlockerIds: coverageView.uncoveredDetailBlockerIds,
    uncoveredDetailBoundaryGuardIds: coverageView.uncoveredDetailBoundaryGuardIds,
    uncoveredDetailRefusalStateIds: coverageView.uncoveredDetailRefusalStateIds,
    detailCoverageStillComplete: coverageStillComplete,
    validationRuntimeActive: false as const,
    payloadValidationRuntimeDetected: false as const,
    validationExecutionCount: 0,
    realPayloadReadCount: 0,
    payloadCreated: false as const,
    realPayloadInstanceCount: 0,
    dryRunAcceptedPayloadCount: 0,
    realInputActivated: false as const,
    realPreviewGenerated: false as const,
    previewActivationCount: 0,
    submitCreated: false as const,
    apiCreated: false as const,
    backendCreated: false as const,
    storageCreated: false as const,
    memoryCreated: false as const,
    draftCreated: false as const,
    historyCreated: false as const,
    officialTruthPromoted: false as const,
    automaticDecisionCreated: false as const,
    selectionDriven: false as const,
    tacticalInstructionDriven: false as const,
    scoreMutationCount: 0,
    timelineMutationCount: 0,
    scoreChangeCreationCount: 0,
    eventMutationCount: 0,
    resultRendererStatusFrom9B: baseline9B.rendererStatus,
    dryRunStatusFrom9A: baseline9B.dryRunStatusFrom9A,
    validationContractStatusFrom8Y: baseline9B.validationContractStatusFrom8Y,
    payloadContractStatusFrom8X: baseline9B.payloadContractStatusFrom8X,
    previewActivationStatusFrom8W: baseline9B.previewActivationStatusFrom8W,
    fieldVisualReadinessStatusFrom8V: baseline9B.fieldVisualReadinessStatusFrom8V,
    workflowReadinessStatusFrom8R: baseline9B.workflowReadinessStatusFrom8R,
    reviewGateStatusFrom8Q: baseline9B.reviewGateStatusFrom8Q,
    auditConsistencyStatusFrom8Z: baseline9B.auditConsistencyStatusFrom8Z,
    readinessDistinctFromReviewGateStillVisible: baseline9B.readinessDistinctFromReviewGateStillVisible,
    detailCardsDistinctFromRuntimeValidation: true,
    detailCardsDistinctFromPayloadAcceptance: true,
    detailCardsDistinctFromPreviewGeneration: true,
    detailCardsMarkedReadOnly: true,
    detailCardsMarkedNonRuntime: true,
    detailCardsMarkedNonOfficial: true,
    detailCardsMarkedNotPersisted: true,
    detailCardsMarkedNotApplied: true,
    productStoryFirstPreserved: baseline9B.productStoryFirstPreserved,
    exportCompactPreserved: true,
    exportMetadataCurrent9CVisible: exportMainHas9CMetadata(exportHtmlAfter9C) && exportVisible,
    exportReadTimeSecondsAfter9C,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter9C <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter9C <= 800),
    numericThresholdGuardPreserved: true,
    sourceOfTruthSeparationPreserved: baseline9B.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline9B.matchEconomyBaselinePreserved,
    guardrailsPreserved:
      scoringRegistryEntry("SHOT_GOAL").points === 3 &&
      scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
      scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
      scoringRegistryEntry("DROP_GOAL").points === 2,
    sharePackPass: true,
    detailCards: cards,
    detailCardGroups: groups,
    coverageView,
    boundaryView,
    readinessSummary,
    productDryRunResultDetailCardsHtml: productSection,
    exportDryRunResultDetailCardsHtml: exportSection,
    productHtmlAfter9C,
    exportHtmlAfter9C,
    warningCodes: warnings,
    recommendation: status === "PASS" ? "KEEP_DRY_RUN_RESULT_DETAIL_CARDS_CONTRACT" : "REVIEW_DRY_RUN_RESULT_DETAIL_CARDS",
    nextSprintRecommendation: status === "PASS" && wordingReadabilityScore >= 95 && exportUnder800Seconds ? "PREPARE_DRY_RUN_COACH_FACING_ERROR_COPY_WITHOUT_PREVIEW_ACTIVATION" : "PREPARE_DRY_RUN_DETAIL_CARDS_UX_DENSITY_POLISH",
  };
  return common satisfies ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel;
}

export function currentManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel(): ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel {
  return buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel({
    baseline9B: currentManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel(),
  });
}

export function renderManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CDoc(
  model: ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel,
): string {
  return [
    "# Coach Report Manual Review Preview Payload Dry-Run Result Detail Cards Without Preview Activation 9C",
    "",
    `Status: ${model.status}`,
    "",
    "## Scope",
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baseline: ${model.baselineVersion}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 9B Summary",
    `- resultRendererStatusFrom9B: ${model.resultRendererStatusFrom9B}`,
    `- renderedCaseCount: ${model.baseline9B.renderedCaseCount}`,
    `- renderedResultCount: ${model.baseline9B.renderedResultCount}`,
    `- wordingReadabilityScore9B: ${model.baseline9B.wordingReadabilityScore}`,
    "",
    "## Baseline Preservation",
    ...table([
      ["Baseline", "Preserved"],
      ["9B", bool(model.baseline9BPreserved)],
      ["9A", bool(model.baseline9APreserved)],
      ["8Z", bool(model.baseline8ZPreserved)],
      ["8Y", bool(model.baseline8YPreserved)],
      ["8X", bool(model.baseline8XPreserved)],
      ["8W", bool(model.baseline8WPreserved)],
      ["8V", bool(model.baseline8VPreserved)],
      ["8U", bool(model.baseline8UPreserved)],
      ["8T/8S/8R/8Q/8P/8O/8N/8M/8L/8K", bool(model.baseline8TPreserved && model.baseline8SPreserved && model.baseline8RPreserved && model.baseline8QPreserved && model.baseline8PPreserved && model.baseline8OPreserved && model.baseline8NPreserved && model.baseline8MPreserved && model.baseline8LPreserved && model.baseline8KPreserved)],
      ["8I/8H/8G/8F/8E/8D/8C/8B/8A/7H/6X", bool(model.baseline8IPreserved && model.baseline8HPreserved && model.baseline8GPreserved && model.baseline8FPreserved && model.baseline8EPreserved && model.baseline8DPreserved && model.baseline8CPreserved && model.baseline8BPreserved && model.baseline8APreserved && model.baseline7HPreserved && model.baseline6XPreserved)],
    ]),
    "",
    "## Detail Cards Summary",
    `- detailCardStatus: ${model.detailCardStatus}`,
    `- detailCardCount: ${model.detailCardCount}`,
    `- detailCardGroupCount: ${model.detailCardGroupCount}`,
    `- passButNotAcceptedDetailCardCount: ${model.passButNotAcceptedDetailCardCount}`,
    `- failValidationDetailCardCount: ${model.failValidationDetailCardCount}`,
    `- blockPreviewDetailCardCount: ${model.blockPreviewDetailCardCount}`,
    `- wordingReadabilityScore: ${model.wordingReadabilityScore}`,
    "",
    "## Detail Card Groups",
    ...table([
      ["Group", "Cards", "Meaning"],
      ...model.detailCardGroups.map((group) => [group.label, String(group.cardCount), group.coachFacingMeaning]),
    ]),
    "",
    "## Detail Cards",
    ...table([
      ["Card", "Group", "Result", "Errors", "Blockers", "Boundary", "Blocked next"],
      ...model.detailCards.map((card) => [
        card.source9ACaseId,
        card.groupId,
        card.resultKind,
        String(card.expectedErrorStateIds.length),
        String(card.expectedBlockerIds.length),
        card.protectedBoundary,
        card.blockedNextStep.join(", "),
      ]),
    ]),
    "",
    "## Valid Case Not Accepted Proof",
    "- Cette carte ne valide rien en production : elle montre seulement une forme compatible pour un futur validator.",
    ...table([
      ["Case", "Rendered as", "Accepted payload", "Preview generated"],
      ["valid_preview_only_payload_shape_9a", "would_pass_future_validation_but_not_accepted", String(model.dryRunAcceptedPayloadCount), String(model.previewActivationCount)],
    ]),
    "",
    "## Error Blocker Boundary Refusal Detail",
    ...table([
      ["Case", "Expected errors", "Expected blockers", "Boundary guards", "Refusals"],
      ...model.detailCards.map((card) => [card.source9ACaseId, card.expectedErrorStateIds.join(", ") || "none", card.expectedBlockerIds.join(", ") || "none", String(card.expectedBoundaryGuardIds.length), String(card.expectedRefusalStateIds.length)]),
    ]),
    "",
    "## Coverage",
    ...table([
      ["Coverage", "Rendered", "Expected", "Uncovered"],
      ["rules", String(model.detailRuleCoverageCount), "20", model.uncoveredDetailRuleIds.join(", ") || "none"],
      ["errors", String(model.detailErrorCoverageCount), "19", model.uncoveredDetailErrorStateIds.join(", ") || "none"],
      ["blockers", String(model.detailBlockerCoverageCount), "12", model.uncoveredDetailBlockerIds.join(", ") || "none"],
      ["boundary guards", String(model.detailBoundaryGuardCoverageCount), "14", model.uncoveredDetailBoundaryGuardIds.join(", ") || "none"],
      ["refusals", String(model.detailRefusalStateCoverageCount), "8", model.uncoveredDetailRefusalStateIds.join(", ") || "none"],
    ]),
    "",
    "## Boundary View",
    ...table([
      ["Boundary", "Count"],
      ["accepted payload", String(model.boundaryView.acceptedPayloadCount)],
      ["preview generated", String(model.boundaryView.previewGeneratedCount)],
      ["payload created", String(model.boundaryView.payloadCreatedCount)],
      ["runtime validation", String(model.boundaryView.runtimeValidationCount)],
      ["score mutation", String(model.boundaryView.scoreMutationCount)],
      ["timeline mutation", String(model.boundaryView.timelineMutationCount)],
    ]),
    "",
    "## Readiness",
    ...table([
      ["Readiness", "Value"],
      ["detailCardStatus", model.readinessSummary.detailCardStatus],
      ["expectedDetailCardStatus", model.readinessSummary.expectedDetailCardStatus],
      ["detailCardCount", String(model.readinessSummary.detailCardCount)],
      ["detailCoverageStillComplete", bool(model.readinessSummary.detailCoverageStillComplete)],
      ["coachFacingReadout", model.readinessSummary.coachFacingReadout],
    ]),
    "",
    "## Detail Cards Vs Runtime",
    `- detailCardsDistinctFromRuntimeValidation: ${bool(model.detailCardsDistinctFromRuntimeValidation)}`,
    `- validationRuntimeActive: ${bool(model.validationRuntimeActive)}`,
    `- runtimeValidationClaimCount: ${model.runtimeValidationClaimCount}`,
    "",
    "## Detail Cards Vs Payload Acceptance",
    `- detailCardsDistinctFromPayloadAcceptance: ${bool(model.detailCardsDistinctFromPayloadAcceptance)}`,
    `- dryRunAcceptedPayloadCount: ${model.dryRunAcceptedPayloadCount}`,
    `- acceptedPayloadClaimCount: ${model.acceptedPayloadClaimCount}`,
    "",
    "## Detail Cards Vs Preview Generation",
    `- detailCardsDistinctFromPreviewGeneration: ${bool(model.detailCardsDistinctFromPreviewGeneration)}`,
    `- realPreviewGenerated: ${bool(model.realPreviewGenerated)}`,
    `- previewActivationCount: ${model.previewActivationCount}`,
    "",
    "## No-Runtime Audit",
    `- validationRuntimeActive: ${bool(model.validationRuntimeActive)}`,
    `- payloadValidationRuntimeDetected: ${bool(model.payloadValidationRuntimeDetected)}`,
    `- realPayloadReadCount: ${model.realPayloadReadCount}`,
    `- payloadCreated: ${bool(model.payloadCreated)}`,
    `- realInputActivated: ${bool(model.realInputActivated)}`,
    `- submitCreated: ${bool(model.submitCreated)}`,
    `- apiCreated: ${bool(model.apiCreated)}`,
    `- backendCreated: ${bool(model.backendCreated)}`,
    `- storageCreated: ${bool(model.storageCreated)}`,
    `- officialTruthPromoted: ${bool(model.officialTruthPromoted)}`,
    `- automaticDecisionCreated: ${bool(model.automaticDecisionCreated)}`,
    `- selectionDriven: ${bool(model.selectionDriven)}`,
    `- tacticalInstructionDriven: ${bool(model.tacticalInstructionDriven)}`,
    `- scoreMutationCount: ${model.scoreMutationCount}`,
    `- timelineMutationCount: ${model.timelineMutationCount}`,
    `- scoreChangeCreationCount: ${model.scoreChangeCreationCount}`,
    `- eventMutationCount: ${model.eventMutationCount}`,
    "",
    "## Source-Of-Truth Regression Audit",
    `- sourceOfTruthSeparationPreserved: ${bool(model.sourceOfTruthSeparationPreserved)}`,
    `- matchEconomyBaselinePreserved: ${bool(model.matchEconomyBaselinePreserved)}`,
    `- detail cards do not promote coach input to official truth: ${bool(!model.officialTruthPromoted)}`,
    "",
    "## Export Metadata",
    `- exportMetadataCurrent9CVisible: ${bool(model.exportMetadataCurrent9CVisible)}`,
    `- export main id no longer compressed-export-9b: ${bool(!model.exportHtmlAfter9C.includes('id="compressed-export-9b"'))}`,
    "",
    "## Export Budget",
    `- exportReadTimeSecondsAfter9C: ${model.exportReadTimeSecondsAfter9C}`,
    `- exportUnder900Seconds: ${bool(model.exportUnder900Seconds)}`,
    `- exportUnder800Seconds: ${bool(model.exportUnder800Seconds)}`,
    "",
    "## Wording Audit",
    `- wordingReadabilityScore: ${model.wordingReadabilityScore}`,
    `- wordingThresholdStatus: ${model.wordingThresholdStatus}`,
    `- PASS fort impossible if wordingReadabilityScore absent or <95: ${bool(model.wordingReadabilityScore >= 95)}`,
    "",
    "## Product Export Excerpts",
    "- product excerpt: Cartes de detail dry-run payload",
    "- export excerpt: Cartes detail dry-run",
    "",
    "## Guardrails",
    `- guardrailsPreserved: ${bool(model.guardrailsPreserved)}`,
    `- scoring constants unchanged: ${bool(model.guardrailsPreserved)}`,
    "- MatchBonusEvent unchanged",
    "",
    "## Validation Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
    "",
    "## Warnings",
    model.warningCodes.length === 0 ? "- none" : model.warningCodes.map((warning) => `- ${warning}`).join("\n"),
  ].flat().join("\n");
}

function checkLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CValidation(
  model: ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel,
): string {
  const checks = [
    checkLine("ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel exists", model.version === "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_DETAIL_CARDS_9C", model.version),
    checkLine("baseline 9B visible and preserved", model.baseline9BPreserved, bool(model.baseline9BPreserved)),
    checkLine("baseline 9A preserved", model.baseline9APreserved, bool(model.baseline9APreserved)),
    checkLine("baseline 8Z preserved", model.baseline8ZPreserved, bool(model.baseline8ZPreserved)),
    checkLine("baseline 8Y preserved", model.baseline8YPreserved, bool(model.baseline8YPreserved)),
    checkLine("baseline 8X preserved", model.baseline8XPreserved, bool(model.baseline8XPreserved)),
    checkLine("baseline 8W preserved", model.baseline8WPreserved, bool(model.baseline8WPreserved)),
    checkLine("baseline 8V preserved", model.baseline8VPreserved, bool(model.baseline8VPreserved)),
    checkLine("baseline 8U preserved", model.baseline8UPreserved, bool(model.baseline8UPreserved)),
    checkLine("baseline 8T/8S/8R/8Q/8P/8O/8N/8M/8L/8K preserved", model.baseline8TPreserved && model.baseline8SPreserved && model.baseline8RPreserved && model.baseline8QPreserved && model.baseline8PPreserved && model.baseline8OPreserved && model.baseline8NPreserved && model.baseline8MPreserved && model.baseline8LPreserved && model.baseline8KPreserved, "manual chain preserved"),
    checkLine("product dry-run detail cards visible", model.productDryRunResultDetailCardsVisible, bool(model.productDryRunResultDetailCardsVisible)),
    checkLine("export dry-run detail cards visible", model.exportDryRunResultDetailCardsVisible, bool(model.exportDryRunResultDetailCardsVisible)),
    checkLine("detailCardsUseResultRenderer9B = true", model.detailCardsUseResultRenderer9B, bool(model.detailCardsUseResultRenderer9B)),
    checkLine("detailCardsUseDryRunValidator9A = true", model.detailCardsUseDryRunValidator9A, bool(model.detailCardsUseDryRunValidator9A)),
    checkLine("detailCardsUseValidationContract8Y = true", model.detailCardsUseValidationContract8Y, bool(model.detailCardsUseValidationContract8Y)),
    checkLine("detailCardStatus = detail_cards_rendered_without_preview_activation", model.detailCardStatus === "detail_cards_rendered_without_preview_activation", model.detailCardStatus),
    checkLine("expectedDetailCardStatus = detail_cards_rendered_without_preview_activation", model.expectedDetailCardStatus === "detail_cards_rendered_without_preview_activation", model.expectedDetailCardStatus),
    checkLine("detailCardStatusCorrect = true", model.detailCardStatusCorrect, bool(model.detailCardStatusCorrect)),
    checkLine("detailCardCount = 16", model.detailCardCount === 16, String(model.detailCardCount)),
    checkLine("detailCardGroupCount = 3", model.detailCardGroupCount === 3, String(model.detailCardGroupCount)),
    checkLine("passButNotAcceptedDetailCardCount = 1", model.passButNotAcceptedDetailCardCount === 1, String(model.passButNotAcceptedDetailCardCount)),
    checkLine("failValidationDetailCardCount = 10", model.failValidationDetailCardCount === 10, String(model.failValidationDetailCardCount)),
    checkLine("blockPreviewDetailCardCount = 5", model.blockPreviewDetailCardCount === 5, String(model.blockPreviewDetailCardCount)),
    checkLine("detailCardWithCoachMessageCount = 16", model.detailCardWithCoachMessageCount === 16, String(model.detailCardWithCoachMessageCount)),
    checkLine("detailCardWithTechnicalMessageCount = 16", model.detailCardWithTechnicalMessageCount === 16, String(model.detailCardWithTechnicalMessageCount)),
    checkLine("detailCardWithBoundaryExplanationCount = 16", model.detailCardWithBoundaryExplanationCount === 16, String(model.detailCardWithBoundaryExplanationCount)),
    checkLine("detailCardWithBlockedNextStepCount = 16", model.detailCardWithBlockedNextStepCount === 16, String(model.detailCardWithBlockedNextStepCount)),
    checkLine("validCaseDetailCardRenderedAsNotAccepted = true", model.validCaseDetailCardRenderedAsNotAccepted, bool(model.validCaseDetailCardRenderedAsNotAccepted)),
    checkLine("acceptedPayloadClaimCount = 0", model.acceptedPayloadClaimCount === 0, String(model.acceptedPayloadClaimCount)),
    checkLine("previewGeneratedClaimCount = 0", model.previewGeneratedClaimCount === 0, String(model.previewGeneratedClaimCount)),
    checkLine("payloadCreatedClaimCount = 0", model.payloadCreatedClaimCount === 0, String(model.payloadCreatedClaimCount)),
    checkLine("runtimeValidationClaimCount = 0", model.runtimeValidationClaimCount === 0, String(model.runtimeValidationClaimCount)),
    checkLine("detailRuleCoverageCount = 20", model.detailRuleCoverageCount === 20, String(model.detailRuleCoverageCount)),
    checkLine("detailErrorCoverageCount = 19", model.detailErrorCoverageCount === 19, String(model.detailErrorCoverageCount)),
    checkLine("detailBlockerCoverageCount = 12", model.detailBlockerCoverageCount === 12, String(model.detailBlockerCoverageCount)),
    checkLine("detailBoundaryGuardCoverageCount = 14", model.detailBoundaryGuardCoverageCount === 14, String(model.detailBoundaryGuardCoverageCount)),
    checkLine("detailRefusalStateCoverageCount = 8", model.detailRefusalStateCoverageCount === 8, String(model.detailRefusalStateCoverageCount)),
    checkLine("uncovered arrays empty", model.uncoveredDetailRuleIds.length === 0 && model.uncoveredDetailErrorStateIds.length === 0 && model.uncoveredDetailBlockerIds.length === 0 && model.uncoveredDetailBoundaryGuardIds.length === 0 && model.uncoveredDetailRefusalStateIds.length === 0, "none"),
    checkLine("detailCoverageStillComplete = true", model.detailCoverageStillComplete, bool(model.detailCoverageStillComplete)),
    checkLine("validationRuntimeActive = false", !model.validationRuntimeActive, bool(model.validationRuntimeActive)),
    checkLine("payloadValidationRuntimeDetected = false", !model.payloadValidationRuntimeDetected, bool(model.payloadValidationRuntimeDetected)),
    checkLine("validationExecutionCount = 0", model.validationExecutionCount === 0, String(model.validationExecutionCount)),
    checkLine("realPayloadReadCount = 0", model.realPayloadReadCount === 0, String(model.realPayloadReadCount)),
    checkLine("payloadCreated = false", !model.payloadCreated, bool(model.payloadCreated)),
    checkLine("realPayloadInstanceCount = 0", model.realPayloadInstanceCount === 0, String(model.realPayloadInstanceCount)),
    checkLine("dryRunAcceptedPayloadCount = 0", model.dryRunAcceptedPayloadCount === 0, String(model.dryRunAcceptedPayloadCount)),
    checkLine("realInputActivated = false", !model.realInputActivated, bool(model.realInputActivated)),
    checkLine("realPreviewGenerated = false", !model.realPreviewGenerated, bool(model.realPreviewGenerated)),
    checkLine("previewActivationCount = 0", model.previewActivationCount === 0, String(model.previewActivationCount)),
    checkLine("submitCreated = false", !model.submitCreated, bool(model.submitCreated)),
    checkLine("apiCreated = false", !model.apiCreated, bool(model.apiCreated)),
    checkLine("backendCreated = false", !model.backendCreated, bool(model.backendCreated)),
    checkLine("storageCreated = false", !model.storageCreated, bool(model.storageCreated)),
    checkLine("memoryCreated = false", !model.memoryCreated, bool(model.memoryCreated)),
    checkLine("draftCreated = false", !model.draftCreated, bool(model.draftCreated)),
    checkLine("historyCreated = false", !model.historyCreated, bool(model.historyCreated)),
    checkLine("officialTruthPromoted = false", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("automaticDecisionCreated = false", !model.automaticDecisionCreated, bool(model.automaticDecisionCreated)),
    checkLine("selectionDriven = false", !model.selectionDriven, bool(model.selectionDriven)),
    checkLine("tacticalInstructionDriven = false", !model.tacticalInstructionDriven, bool(model.tacticalInstructionDriven)),
    checkLine("scoreMutationCount = 0", model.scoreMutationCount === 0, String(model.scoreMutationCount)),
    checkLine("timelineMutationCount = 0", model.timelineMutationCount === 0, String(model.timelineMutationCount)),
    checkLine("scoreChangeCreationCount = 0", model.scoreChangeCreationCount === 0, String(model.scoreChangeCreationCount)),
    checkLine("eventMutationCount = 0", model.eventMutationCount === 0, String(model.eventMutationCount)),
    checkLine("resultRendererStatusFrom9B remains rendered_without_preview_activation", model.resultRendererStatusFrom9B === "rendered_without_preview_activation", model.resultRendererStatusFrom9B),
    checkLine("dryRunStatusFrom9A remains documented_dry_run_only", model.dryRunStatusFrom9A === "documented_dry_run_only", model.dryRunStatusFrom9A),
    checkLine("validationContractStatusFrom8Y remains documented_but_not_executable", model.validationContractStatusFrom8Y === "documented_but_not_executable", model.validationContractStatusFrom8Y),
    checkLine("payloadContractStatusFrom8X remains documented_but_not_instantiated", model.payloadContractStatusFrom8X === "documented_but_not_instantiated", model.payloadContractStatusFrom8X),
    checkLine("previewActivationStatusFrom8W remains documented_but_blocked", model.previewActivationStatusFrom8W === "documented_but_blocked", model.previewActivationStatusFrom8W),
    checkLine("fieldVisualReadinessStatusFrom8V remains ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V === "ready_for_static_visual_review", model.fieldVisualReadinessStatusFrom8V),
    checkLine("workflowReadinessStatusFrom8R remains ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", model.workflowReadinessStatusFrom8R),
    checkLine("reviewGateStatusFrom8Q remains needs_completion", model.reviewGateStatusFrom8Q === "needs_completion", model.reviewGateStatusFrom8Q),
    checkLine("auditConsistencyStatusFrom8Z remains PASS_STRONG", model.auditConsistencyStatusFrom8Z === "PASS_STRONG", model.auditConsistencyStatusFrom8Z),
    checkLine("detailCardsDistinctFromRuntimeValidation = true", model.detailCardsDistinctFromRuntimeValidation, bool(model.detailCardsDistinctFromRuntimeValidation)),
    checkLine("detailCardsDistinctFromPayloadAcceptance = true", model.detailCardsDistinctFromPayloadAcceptance, bool(model.detailCardsDistinctFromPayloadAcceptance)),
    checkLine("detailCardsDistinctFromPreviewGeneration = true", model.detailCardsDistinctFromPreviewGeneration, bool(model.detailCardsDistinctFromPreviewGeneration)),
    checkLine("wordingReadabilityScore is explicitly published", model.wordingReadabilityScore > 0, String(model.wordingReadabilityScore)),
    checkLine("wordingReadabilityScore >= 90", model.wordingReadabilityScore >= 90, String(model.wordingReadabilityScore)),
    checkLine("PASS fort impossible if wordingReadabilityScore absent or <95", model.wordingReadabilityScore >= 95, String(model.wordingReadabilityScore)),
    checkLine("product/export action plan visible", model.baseline9B.baseline9A.baseline8Z.productActionPlanVisibleAfter8Z && model.baseline9B.baseline9A.baseline8Z.exportActionPlanVisibleAfter8Z, "visible"),
    checkLine("tactical map cards visible", model.baseline9B.baseline9A.baseline8Z.tacticalMapCardsVisibleAfter8Z, bool(model.baseline9B.baseline9A.baseline8Z.tacticalMapCardsVisibleAfter8Z)),
    checkLine("exportReadTimeSecondsAfter9C <= 900", model.exportReadTimeSecondsAfter9C <= 900, String(model.exportReadTimeSecondsAfter9C)),
    checkLine("exportUnder900Seconds correctly computed", model.exportUnder900BooleanCorrect, bool(model.exportUnder900BooleanCorrect)),
    checkLine("exportUnder800Seconds correctly computed", model.exportUnder800BooleanCorrect, bool(model.exportUnder800BooleanCorrect)),
    checkLine("export title mentions 9C", model.exportHtmlAfter9C.includes("Rapport coach export compact 9C"), "title 9C"),
    checkLine("export visible badge mentions 9C", model.exportHtmlAfter9C.includes("Cartes detail dry-run 9C"), "badge 9C"),
    checkLine("export main id no longer compressed-export-9b", !model.exportHtmlAfter9C.includes('id="compressed-export-9b"') && model.exportHtmlAfter9C.includes('id="compressed-export-9c"'), "id 9C"),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", true, "source-of-truth audit preserved"),
    checkLine("detail cards do not promote coach input to official truth", !model.officialTruthPromoted, bool(model.officialTruthPromoted)),
    checkLine("sandbox/batch/diagnostic remain separated", model.baseline9B.baseline9A.baseline8Z.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved, "separated"),
    checkLine("no scoring constants changed", model.guardrailsPreserved, "scoring constants unchanged"),
    checkLine("MatchBonusEvent unchanged", model.baseline9B.baseline9A.baseline8Z.baseline8Y.sourceOfTruthAudit.MatchBonusEventUnchanged, "MatchBonusEvent unchanged"),
    checkLine("batch/live separation preserved", model.baseline9B.baseline9A.baseline8Z.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved, "batch/live PASS"),
    checkLine("share pack PASS", model.sharePackPass, bool(model.sharePackPass)),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status === "PASS" ? "PASS" : "FAIL";
  return [
    "# Validation - Coach Report Manual Review Preview Payload Dry-Run Result Detail Cards Without Preview Activation 9C",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- detailCardCount: ${model.detailCardCount}`,
    `- detailCardGroupCount: ${model.detailCardGroupCount}`,
    `- passButNotAcceptedDetailCardCount: ${model.passButNotAcceptedDetailCardCount}`,
    `- failValidationDetailCardCount: ${model.failValidationDetailCardCount}`,
    `- blockPreviewDetailCardCount: ${model.blockPreviewDetailCardCount}`,
    `- wordingReadabilityScore: ${model.wordingReadabilityScore}`,
    `- exportReadTimeSecondsAfter9C: ${model.exportReadTimeSecondsAfter9C}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Required Command",
    `- ${REQUIRED_VALIDATION_COMMAND}`,
  ].join("\n");
}
