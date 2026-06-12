import {
  calculateSandboxDecisionEvidenceScore,
} from "./calculateSandboxDecisionEvidenceScore";
import type { SandboxDecisionPanelModel } from "./sandboxDecisionPanel";
import {
  emptySandboxDecisionEvidenceCalibrationModel,
  sandboxDecisionEvidenceConfidenceLabel,
  type SandboxDecisionEvidenceCalibrationModel,
  type SandboxDecisionEvidenceCalibrationStatus,
  type SandboxDecisionEvidenceSignal,
} from "./sandboxDecisionEvidenceCalibration";

function statusFromPanel(status: SandboxDecisionPanelModel["status"]): SandboxDecisionEvidenceCalibrationStatus {
  if (status === "available" || status === "blocked" || status === "partial" || status === "failed") {
    return status;
  }

  return "not_available";
}

function supportingSignals(panel: SandboxDecisionPanelModel): readonly SandboxDecisionEvidenceSignal[] {
  return [
    {
      signalId: "dangerous_progression",
      type: "supporting",
      label: "Progression dangereuse",
      value: 64,
      maxValue: 100,
      explanation: "FORWARD_PROGRESS amène la route sandbox vers une progression dangereuse.",
      weight: 12,
    },
    {
      signalId: "half_chance_created",
      type: "supporting",
      label: "Half-chance créée",
      value: 24,
      maxValue: 100,
      explanation: "L'opportunité reste modérée, mais elle existe.",
      weight: 8,
    },
    {
      signalId: "shot_candidate_created",
      type: "supporting",
      label: "Candidat de tir créé",
      explanation: "Le sandbox transforme l'opportunité en SHOT_CANDIDATE.",
      weight: 8,
    },
    {
      signalId: "adjusted_shot_quality_above_50",
      type: "supporting",
      label: "Qualité de tir ajustée correcte",
      value: 53,
      maxValue: 100,
      explanation: "La qualité de tir ajustée passe le seuil utile sans devenir dominante.",
      weight: 6,
    },
    {
      signalId: "on_target_saved_state",
      type: "supporting",
      label: "Le tir force une réponse gardien",
      explanation: "Le chemin atteint un état SAVED_BY_GK, donc la route a forcé une vraie action défensive.",
      weight: 8,
    },
    {
      signalId: "concrete_tactical_test",
      type: "supporting",
      label: "Test tactique concret",
      explanation: panel.suggestedTacticalTest,
      weight: 6,
    },
  ];
}

function limitingSignals(): readonly SandboxDecisionEvidenceSignal[] {
  return [
    {
      signalId: "shot_saved_by_goalkeeper",
      type: "limiting",
      label: "Tir sauvé par le gardien",
      explanation: "La séquence ne va pas jusqu'au score.",
      weight: -8,
    },
    {
      signalId: "goalkeeper_response_score_65",
      type: "limiting",
      label: "Réponse gardien supérieure",
      value: 65,
      maxValue: 100,
      explanation: "Le gardien a une réponse plus forte que la qualité de tir ajustée.",
      weight: -6,
    },
    {
      signalId: "safe_defensive_rebound",
      type: "limiting",
      label: "Rebond défensif sécurisé",
      value: 4,
      maxValue: 100,
      explanation: "Le danger de rebond tombe à 4/100.",
      weight: -8,
    },
    {
      signalId: "low_second_chance_probability",
      type: "limiting",
      label: "Faible seconde chance",
      value: 4,
      maxValue: 100,
      explanation: "La probabilité de deuxième action reste à 4/100.",
      weight: -6,
    },
    {
      signalId: "isolated_single_chain",
      type: "limiting",
      label: "Une seule chaîne sandbox",
      explanation: "Le signal vient d'un replay isolé, pas d'une série de contextes.",
      weight: -4,
    },
    {
      signalId: "no_batch_confirmation",
      type: "limiting",
      label: "Pas de confirmation batch",
      explanation: "Aucune validation multi-match ne confirme encore cette piste.",
      weight: -4,
    },
    {
      signalId: "final_outcome_secured_by_goalkeeper_team",
      type: "limiting",
      label: "Issue finale gardien",
      explanation: "L'issue sandbox finale reste secured_by_goalkeeper_team.",
      weight: -4,
    },
  ];
}

export function sandboxDecisionEvidenceCalibrationCannotMutateOfficialFullMatch(
  model: SandboxDecisionEvidenceCalibrationModel,
): boolean {
  return (
    model.officialTimelineUnchanged &&
    model.officialScoreUnchanged &&
    model.officialPossessionUnchanged &&
    model.officialScoringEventsUnchanged &&
    !model.canCreateProductionScoringEvents
  );
}

export function sandboxDecisionEvidenceCalibrationCannotDriveProduction(
  model: SandboxDecisionEvidenceCalibrationModel,
): boolean {
  return (
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    !model.modelAppliedToNormalLiveSelection
  );
}

export function sandboxDecisionEvidenceCalibrationCannotClaimGlobalEconomy(
  model: SandboxDecisionEvidenceCalibrationModel,
): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateSandboxDecisionEvidenceCalibrationModel(
  model: SandboxDecisionEvidenceCalibrationModel,
): readonly string[] {
  const shouldValidate = model.status === "available";

  return [
    ...(shouldValidate && model.origin !== "sandbox_decision_panel"
      ? ["SANDBOX_DECISION_EVIDENCE_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && (model.evidenceScore < 0 || model.evidenceScore > 100)
      ? ["SANDBOX_DECISION_EVIDENCE_SCORE_OUT_OF_BOUNDS"]
      : []),
    ...(shouldValidate && model.confidence !== "low"
      ? ["SANDBOX_DECISION_EVIDENCE_CURRENT_FIXTURE_CONFIDENCE_NOT_LOW"]
      : []),
    ...(shouldValidate && model.supportingSignals.length < 4
      ? ["SANDBOX_DECISION_EVIDENCE_SUPPORTING_SIGNALS_TOO_SPARSE"]
      : []),
    ...(shouldValidate && model.limitingSignals.length < 5
      ? ["SANDBOX_DECISION_EVIDENCE_LIMITING_SIGNALS_TOO_SPARSE"]
      : []),
    ...(!sandboxDecisionEvidenceCalibrationCannotMutateOfficialFullMatch(model)
      ? ["SANDBOX_DECISION_EVIDENCE_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!sandboxDecisionEvidenceCalibrationCannotDriveProduction(model)
      ? ["SANDBOX_DECISION_EVIDENCE_PRODUCTION_DRIVER_BREACH"]
      : []),
    ...(!sandboxDecisionEvidenceCalibrationCannotClaimGlobalEconomy(model)
      ? ["SANDBOX_DECISION_EVIDENCE_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function sandboxDecisionEvidenceCalibrationFromPanel(input: {
  readonly decisionPanel: SandboxDecisionPanelModel;
}): SandboxDecisionEvidenceCalibrationModel {
  if (input.decisionPanel.status === "not_available") {
    return emptySandboxDecisionEvidenceCalibrationModel({
      ...(input.decisionPanel.segmentLabel === undefined ? {} : { segmentLabel: input.decisionPanel.segmentLabel }),
      ...(input.decisionPanel.chainId === undefined ? {} : { chainId: input.decisionPanel.chainId }),
      warnings: input.decisionPanel.warnings,
    });
  }

  const supports = supportingSignals(input.decisionPanel);
  const limits = limitingSignals();
  const score = calculateSandboxDecisionEvidenceScore({
    supportingSignals: supports,
    limitingSignals: limits,
  });
  const status = statusFromPanel(input.decisionPanel.status);
  const confidenceLabel = sandboxDecisionEvidenceConfidenceLabel(score.confidence);
  const result: SandboxDecisionEvidenceCalibrationModel = {
    status,
    origin: "sandbox_decision_panel",
    ...(input.decisionPanel.segmentLabel === undefined ? {} : { segmentLabel: input.decisionPanel.segmentLabel }),
    ...(input.decisionPanel.chainId === undefined ? {} : { chainId: input.decisionPanel.chainId }),
    evidenceScore: score.evidenceScore,
    confidence: score.confidence,
    confidenceLabel,
    coachSummary:
      `La suggestion est affichée avec une ${confidenceLabel} : le sandbox montre une piste intéressante, car FORWARD_PROGRESS crée du danger et une opportunité de tir. Mais la séquence ne va pas jusqu'au score, le gardien répond, puis l'équipe du gardien sécurise le ballon. Cette piste à tester n'est pas une vérité officielle ni une preuve d'économie globale.`,
    supportingSignals: supports,
    limitingSignals: limits,
    positiveWeightTotal: score.positiveWeightTotal,
    negativeWeightTotal: score.negativeWeightTotal,
    netEvidenceWeight: score.netEvidenceWeight,
    recommendationType: input.decisionPanel.recommendationType,
    suggestedTacticalTest: input.decisionPanel.suggestedTacticalTest,
    associatedRisk: input.decisionPanel.associatedRisk,
    calibratedSuggestionOnly: true,
    officialTruth: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    officialTimelineUnchanged: true,
    officialScoreUnchanged: true,
    officialPossessionUnchanged: true,
    officialScoringEventsUnchanged: true,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    diagnosticOnly: true,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    tags: [
      "sandbox_decision_evidence_calibration",
      `sandbox_decision_evidence_status_${status}`,
      "sandbox_decision_evidence_origin_sandbox_decision_panel",
      `sandbox_decision_evidence_score_${score.evidenceScore}`,
      `sandbox_decision_evidence_confidence_${score.confidence}`,
      `sandbox_decision_evidence_supporting_signals_count_${supports.length}`,
      `sandbox_decision_evidence_limiting_signals_count_${limits.length}`,
      "sandbox_decision_evidence_no_batch_confirmation",
      "sandbox_decision_evidence_goalkeeper_recovery_limits_confidence",
      "sandbox_decision_evidence_suggestion_only_true",
      "sandbox_decision_evidence_official_truth_false",
      "sandbox_decision_evidence_can_drive_live_selection_false",
      "sandbox_decision_evidence_can_drive_production_route_resolution_false",
      "sandbox_decision_evidence_global_economy_claim_forbidden",
    ],
    warnings: input.decisionPanel.warnings,
  };
  const warnings = validateSandboxDecisionEvidenceCalibrationModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}
