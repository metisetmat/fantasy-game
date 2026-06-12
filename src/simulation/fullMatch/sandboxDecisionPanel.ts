export type SandboxDecisionPanelStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type SandboxDecisionPanelOrigin =
  | "none"
  | "coach_facing_timeline_review";

export type SandboxDecisionPanelRecommendationType =
  | "none"
  | "test_support_around_forward_progress";

export type SandboxDecisionPanelBlockId =
  | "coach_teaching"
  | "option_to_test"
  | "associated_risk"
  | "still_to_prove";

export type SandboxDecisionPanelBlock = {
  readonly blockId: SandboxDecisionPanelBlockId;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly confidence: "low" | "medium" | "high";
  readonly sandboxOnly: boolean;
  readonly officialTruth: false;
};

export type SandboxDecisionPanelModel = {
  readonly status: SandboxDecisionPanelStatus;
  readonly origin: SandboxDecisionPanelOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly title: string;
  readonly shortSummary: string;
  readonly recommendationType: SandboxDecisionPanelRecommendationType;
  readonly suggestedTacticalTest: string;
  readonly associatedRisk: string;
  readonly stillUnproven: readonly string[];
  readonly blocks: readonly SandboxDecisionPanelBlock[];
  readonly suggestionOnly: true;
  readonly officialTruth: false;
  readonly officialTimelineUnchanged: true;
  readonly officialScoreUnchanged: true;
  readonly officialPossessionUnchanged: true;
  readonly officialScoringEventsUnchanged: true;
  readonly modelAppliedOnlyInSandbox: true;
  readonly modelAppliedToNormalLiveSelection: false;
  readonly diagnosticOnly: true;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canMutateOfficialScore: false;
  readonly canMutateOfficialScoringEvents: false;
  readonly canMutateOfficialPossession: false;
  readonly canMutateOfficialTimeline: false;
  readonly canClaimGlobalEconomy: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptySandboxDecisionPanelModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): SandboxDecisionPanelModel {
  return {
    status: "not_available",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    title: "Panneau de décision sandbox",
    shortSummary: "Le panneau de décision sandbox n'est pas disponible pour ce run.",
    recommendationType: "none",
    suggestedTacticalTest: "none",
    associatedRisk: "none",
    stillUnproven: [],
    blocks: [],
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
    tags: [],
    warnings: input.warnings,
  };
}
