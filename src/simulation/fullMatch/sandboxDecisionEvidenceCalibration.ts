export type SandboxDecisionEvidenceCalibrationStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type SandboxDecisionEvidenceCalibrationOrigin =
  | "none"
  | "sandbox_decision_panel";

export type SandboxDecisionEvidenceConfidence =
  | "very_low"
  | "low"
  | "medium"
  | "strong"
  | "very_strong";

export type SandboxDecisionEvidenceSignalType =
  | "supporting"
  | "limiting";

export type SandboxDecisionEvidenceSignal = {
  readonly signalId: string;
  readonly type: SandboxDecisionEvidenceSignalType;
  readonly label: string;
  readonly value?: number;
  readonly maxValue?: number;
  readonly explanation: string;
  readonly weight: number;
};

export type SandboxDecisionEvidenceCalibrationModel = {
  readonly status: SandboxDecisionEvidenceCalibrationStatus;
  readonly origin: SandboxDecisionEvidenceCalibrationOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly evidenceScore: number;
  readonly confidence: SandboxDecisionEvidenceConfidence;
  readonly confidenceLabel: string;
  readonly coachSummary: string;
  readonly supportingSignals: readonly SandboxDecisionEvidenceSignal[];
  readonly limitingSignals: readonly SandboxDecisionEvidenceSignal[];
  readonly positiveWeightTotal: number;
  readonly negativeWeightTotal: number;
  readonly netEvidenceWeight: number;
  readonly recommendationType: string;
  readonly suggestedTacticalTest: string;
  readonly associatedRisk: string;
  readonly calibratedSuggestionOnly: true;
  readonly officialTruth: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly officialTimelineUnchanged: true;
  readonly officialScoreUnchanged: true;
  readonly officialPossessionUnchanged: true;
  readonly officialScoringEventsUnchanged: true;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly diagnosticOnly: true;
  readonly modelAppliedOnlyInSandbox: true;
  readonly modelAppliedToNormalLiveSelection: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptySandboxDecisionEvidenceCalibrationModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): SandboxDecisionEvidenceCalibrationModel {
  return {
    status: "not_available",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    evidenceScore: 0,
    confidence: "very_low",
    confidenceLabel: "confiance très faible",
    coachSummary: "La calibration d'évidence du panneau sandbox n'est pas disponible pour ce run.",
    supportingSignals: [],
    limitingSignals: [],
    positiveWeightTotal: 0,
    negativeWeightTotal: 0,
    netEvidenceWeight: 0,
    recommendationType: "none",
    suggestedTacticalTest: "none",
    associatedRisk: "none",
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
    tags: [],
    warnings: input.warnings,
  };
}

export function sandboxDecisionEvidenceConfidenceLabel(confidence: SandboxDecisionEvidenceConfidence): string {
  switch (confidence) {
    case "very_low":
      return "confiance très faible";
    case "low":
      return "confiance faible";
    case "medium":
      return "confiance moyenne";
    case "strong":
      return "confiance forte";
    case "very_strong":
      return "confiance très forte";
  }
}
