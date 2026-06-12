export type MatchReportEvidenceCategory =
  | "SCORING_CONVERSION"
  | "DANGER_CREATION"
  | "PRESSURE_WITHOUT_CONVERSION"
  | "POSSESSION_INSTABILITY"
  | "TERRITORIAL_PRESSURE"
  | "FATIGUE_LOAD"
  | "MOMENTUM_SHIFT"
  | "TACTICAL_PLAN_SIGNAL"
  | "HARNESS_PLAUSIBILITY_WARNING"
  | "WORKBENCH_CHAIN_CONSUMPTION"
  | "WORKBENCH_CHAIN_SEGMENT_CONTEXT"
  | "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE"
  | "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION"
  | "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION"
  | "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT"
  | "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE"
  | "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD"
  | "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT"
  | "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON"
  | "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY"
  | "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX"
  | "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL";

export type MatchReportEvidenceScope =
  | "MATCH_REPORT"
  | "FULL_MATCH_HARNESS_SINGLE_RUN"
  | "MINI_MATCH_LOCAL"
  | "LIVE_SCORING_STREAM"
  | "BATCH_DIAGNOSTIC_PROJECTION";

export type MatchReportEvidenceFact = {
  readonly factId: string;
  readonly matchId: string;
  readonly teamId?: string;
  readonly opponentTeamId?: string;
  readonly category: MatchReportEvidenceCategory;
  readonly scope: MatchReportEvidenceScope;
  readonly eventIds: readonly string[];
  readonly affectedZones: readonly string[];
  readonly summary: string;
  readonly confidence: "low" | "medium" | "high";
  readonly strength: number;
  readonly coachVisible: boolean;
  readonly internalTags: readonly string[];
};
