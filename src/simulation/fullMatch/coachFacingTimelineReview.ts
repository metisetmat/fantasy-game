export type CoachFacingTimelineReviewStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type CoachFacingTimelineReviewOrigin =
  | "none"
  | "official_timeline_diff_view";

export type CoachFacingTimelineReviewBlockId =
  | "official_timeline"
  | "sandbox_replay"
  | "sandbox_differences"
  | "unchanged_official_state";

export type CoachFacingTimelineReviewBlock = {
  readonly blockId: CoachFacingTimelineReviewBlockId;
  readonly title: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly confidence: "low" | "medium" | "high";
  readonly sandboxOnly: boolean;
  readonly officialTruth: boolean;
  readonly warnings: readonly string[];
};

export type CoachFacingTimelineReviewModel = {
  readonly status: CoachFacingTimelineReviewStatus;
  readonly origin: CoachFacingTimelineReviewOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly title: string;
  readonly shortSummary: string;
  readonly blocks: readonly CoachFacingTimelineReviewBlock[];
  readonly officialTimelineUnchanged: true;
  readonly officialScoreUnchanged: true;
  readonly officialPossessionUnchanged: true;
  readonly officialScoringEventsUnchanged: true;
  readonly sandboxEventsAreOfficial: false;
  readonly sandboxEventsInsertedIntoOfficialTimeline: false;
  readonly modelAppliedOnlyInSandbox: true;
  readonly modelAppliedToNormalLiveSelection: false;
  readonly diagnosticOnly: true;
  readonly canInjectEventsIntoOfficialTimeline: false;
  readonly canMutateOfficialScore: false;
  readonly canMutateOfficialScoringEvents: false;
  readonly canMutateOfficialPossession: false;
  readonly canMutateOfficialTimeline: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyCoachFacingTimelineReviewModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): CoachFacingTimelineReviewModel {
  return {
    status: "not_available",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    title: "Lecture timeline officielle vs sandbox",
    shortSummary: "La lecture coach-facing de la timeline officielle et du sandbox n'est pas disponible pour ce run.",
    blocks: [],
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
    tags: [],
    warnings: input.warnings,
  };
}
