import type {
  SandboxDecisionEvidenceCalibrationModel,
  SandboxDecisionEvidenceConfidence,
} from "./sandboxDecisionEvidenceCalibration";

export type SandboxDecisionBatchConfidenceCalibrationStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type SandboxDecisionBatchConfidenceCalibrationOrigin =
  | "none"
  | "sandbox_decision_evidence_calibration";

export type SandboxDecisionBatchConfidence =
  | "very_low"
  | "low"
  | "low_medium"
  | "medium";

export type SandboxDecisionBatchScenarioType =
  | "base"
  | "better_attacking_support"
  | "weak_attacking_support"
  | "stronger_goalkeeper"
  | "weaker_goalkeeper"
  | "fatigued_attacker"
  | "fatigued_goalkeeper"
  | "higher_defensive_recovery"
  | "better_attacking_rebound_pressure";

export type SandboxDecisionBatchScenario = {
  readonly scenarioId: string;
  readonly scenarioType: SandboxDecisionBatchScenarioType;
  readonly label: string;
  readonly attackingSupportModifier: number;
  readonly secondBallOccupationModifier: number;
  readonly goalkeeperStrengthModifier: number;
  readonly attackerFatigueModifier: number;
  readonly goalkeeperFatigueModifier: number;
  readonly defensiveRecoveryModifier: number;
  readonly pressureModifier: number;
};

export type SandboxDecisionBatchScenarioResult = {
  readonly scenarioId: string;
  readonly scenarioType: SandboxDecisionBatchScenarioType;
  readonly label: string;
  readonly evidenceScore: number;
  readonly confidence: SandboxDecisionEvidenceConfidence;
  readonly supportingSignalCount: number;
  readonly limitingSignalCount: number;
  readonly routeOutcome?: string;
  readonly opportunityType?: string;
  readonly shotResult?: string;
  readonly goalkeeperResponse?: string;
  readonly reboundState?: string;
  readonly continuationAction?: string;
  readonly finalOutcome?: string;
  readonly dangerScore?: number;
  readonly shotQuality?: number;
  readonly goalkeeperResponseScore?: number;
  readonly secondChanceProbability?: number;
  readonly continuationConfidence?: number;
  readonly scenarioInterpretation: string;
  readonly suggestionOnly: true;
  readonly officialTruth: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
};

export type SandboxDecisionBatchConfidenceDistribution = Readonly<
  Record<SandboxDecisionBatchConfidence | SandboxDecisionEvidenceConfidence, number>
>;

export type SandboxDecisionBatchConfidenceCalibrationModel = {
  readonly status: SandboxDecisionBatchConfidenceCalibrationStatus;
  readonly origin: SandboxDecisionBatchConfidenceCalibrationOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly recommendationType: string;
  readonly suggestedTacticalTest: string;
  readonly scenarioCount: number;
  readonly scenarioResults: readonly SandboxDecisionBatchScenarioResult[];
  readonly averageEvidenceScore: number;
  readonly minEvidenceScore: number;
  readonly maxEvidenceScore: number;
  readonly batchConfidence: SandboxDecisionBatchConfidence;
  readonly batchConfidenceLabel: string;
  readonly confidenceDistribution: SandboxDecisionBatchConfidenceDistribution;
  readonly bestScenarioId?: string;
  readonly worstScenarioId?: string;
  readonly repeatedSupportingSignalCount: number;
  readonly repeatedLimitingSignalCount: number;
  readonly recommendationStability:
    | "unstable"
    | "mixed"
    | "stable_but_low"
    | "stable_medium";
  readonly confidenceChangedFromSingleChain: boolean;
  readonly singleChainEvidenceScore: number;
  readonly singleChainConfidence: SandboxDecisionEvidenceConfidence;
  readonly batchSummary: string;
  readonly coachSummary: string;
  readonly localSandboxBatchOnly: true;
  readonly officialTruth: false;
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
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptySandboxDecisionBatchConfidenceCalibrationModel(input: {
  readonly calibration: SandboxDecisionEvidenceCalibrationModel;
  readonly warnings: readonly string[];
}): SandboxDecisionBatchConfidenceCalibrationModel {
  return {
    status: "not_available",
    origin: "none",
    ...(input.calibration.segmentLabel === undefined ? {} : { segmentLabel: input.calibration.segmentLabel }),
    ...(input.calibration.chainId === undefined ? {} : { chainId: input.calibration.chainId }),
    recommendationType: input.calibration.recommendationType,
    suggestedTacticalTest: input.calibration.suggestedTacticalTest,
    scenarioCount: 0,
    scenarioResults: [],
    averageEvidenceScore: 0,
    minEvidenceScore: 0,
    maxEvidenceScore: 0,
    batchConfidence: "very_low",
    batchConfidenceLabel: sandboxDecisionBatchConfidenceLabel("very_low"),
    confidenceDistribution: emptyConfidenceDistribution(),
    repeatedSupportingSignalCount: 0,
    repeatedLimitingSignalCount: 0,
    recommendationStability: "unstable",
    confidenceChangedFromSingleChain: false,
    singleChainEvidenceScore: input.calibration.evidenceScore,
    singleChainConfidence: input.calibration.confidence,
    batchSummary: "Batch sandbox indisponible pour cette suggestion.",
    coachSummary: "La confiance multi-scenarios n'est pas disponible pour ce run.",
    localSandboxBatchOnly: true,
    officialTruth: false,
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
    tags: [],
    warnings: input.warnings,
  };
}

export function sandboxDecisionBatchConfidenceLabel(confidence: SandboxDecisionBatchConfidence): string {
  switch (confidence) {
    case "very_low":
      return "confiance tres faible";
    case "low":
      return "confiance faible";
    case "low_medium":
      return "confiance faible a moyenne";
    case "medium":
      return "confiance moyenne";
  }
}

export function emptyConfidenceDistribution(): SandboxDecisionBatchConfidenceDistribution {
  return {
    very_low: 0,
    low: 0,
    low_medium: 0,
    medium: 0,
    strong: 0,
    very_strong: 0,
  };
}
