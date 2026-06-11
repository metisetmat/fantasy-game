export type IsolatedSegmentReplayPathId = "baseline" | "override";

export type IsolatedSegmentReplayEventType =
  | "isolated_route_selection"
  | "isolated_possession_update"
  | "isolated_zone_progression"
  | "isolated_danger_signal"
  | "isolated_scoring_opportunity"
  | "isolated_scoring_event"
  | "isolated_replay_end";

export type IsolatedSegmentReplayEvent = {
  readonly eventId: string;
  readonly pathId: IsolatedSegmentReplayPathId;
  readonly segmentLabel: string;
  readonly eventType: IsolatedSegmentReplayEventType;
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly actorId?: string;
  readonly receiverId?: string;
  readonly fromZone?: string;
  readonly toZone?: string;
  readonly possessionRetained?: boolean;
  readonly resultingCarrierId?: string;
  readonly resultingZone?: string;
  readonly dangerCreated?: boolean;
  readonly scoringOpportunityCreated?: boolean;
  readonly scoringEventCreated?: boolean;
  readonly isolatedScoreDelta?: number;
  readonly experimentalOnly: true;
  readonly canMutateOfficialTimeline: false;
  readonly canMutateOfficialScore: false;
  readonly canCreateOfficialScoringEvent: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};
