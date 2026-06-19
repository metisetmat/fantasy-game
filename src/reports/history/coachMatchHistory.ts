export type CoachMatchHistoryStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachMatchHistorySource =
  | "current_product_report"
  | "controlled_sample"
  | "simulated_match_history"
  | "product_history_store";

export type CoachMatchHistorySignalPhase =
  | "with_ball"
  | "without_ball"
  | "goalkeeper";

export type CoachMatchHistorySignalStability =
  | "local_repeated"
  | "local_visible_once"
  | "local_unstable"
  | "insufficient_data"
  | "not_evaluated";

export interface CoachMatchHistorySignal {
  readonly signalId: string;
  readonly phase: CoachMatchHistorySignalPhase;
  readonly label: string;
  readonly zone?: string;
  readonly value?: number;
  readonly stability: CoachMatchHistorySignalStability;
  readonly source: CoachMatchHistorySource;
  readonly explanation: string;
}

export interface CoachMatchHistoryRecord {
  readonly historyRecordId: string;
  readonly matchId: string;
  readonly runId: string;
  readonly generatedAtIso: string;

  readonly homeTeamId: string;
  readonly awayTeamId: string;
  readonly homeTeamName: string;
  readonly awayTeamName: string;

  readonly scoreHome: number;
  readonly scoreAway: number;
  readonly scoreSource: "official_report_score" | "live_scoring_events_sample" | "unknown";

  readonly source: CoachMatchHistorySource;
  readonly reportVersion: string;

  readonly signals: readonly CoachMatchHistorySignal[];

  readonly officialTimelineSourcePreserved: true;
  readonly officialScorePreserved: true;
  readonly officialPossessionPreserved: true;
  readonly officialScoringEventsPreserved: true;

  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
}

export interface CoachMatchHistoryQuery {
  readonly teamId?: string;
  readonly phase?: CoachMatchHistorySignalPhase;
  readonly maxRecords: number;
  readonly includeControlledSamples: boolean;
  readonly includeProductHistory: boolean;
}

export interface CoachMatchHistoryQueryResult {
  readonly status: CoachMatchHistoryStatus;
  readonly query: CoachMatchHistoryQuery;
  readonly recordCount: number;
  readonly signalCount: number;
  readonly records: readonly CoachMatchHistoryRecord[];
  readonly warnings: readonly string[];
}

