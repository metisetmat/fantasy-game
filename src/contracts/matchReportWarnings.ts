export type MatchReportWarningType =
  | "FULL_MATCH_HARNESS_SINGLE_RUN"
  | "INFLATED_SINGLE_RUN_SCORE"
  | "ONE_TEAM_SCORING_DOMINANCE_SINGLE_RUN"
  | "ZERO_SCORING_EVENTS_FOR_ONE_TEAM"
  | "REPEATED_SEGMENT_PATTERN"
  | "LOW_EVENT_FAMILY_DIVERSITY"
  | "FATIGUE_SIGNAL_FLAT"
  | "HIGH_LOAD_WITH_NO_PAYOFF"
  | "REPORT_COPY_LIMITATION"
  | "ADAPTER_LIMITATION";

export type MatchReportWarning = {
  readonly warningId: string;
  readonly type: MatchReportWarningType;
  readonly scope: "coach_visible" | "internal" | "validation_only";
  readonly severity: "info" | "low" | "medium" | "high";
  readonly title: string;
  readonly coachSummary: string;
  readonly technicalSummary: string;
  readonly evidenceFactIds: readonly string[];
  readonly eventIds: readonly string[];
  readonly mayInvalidateGlobalScoringEconomy: false;
};
