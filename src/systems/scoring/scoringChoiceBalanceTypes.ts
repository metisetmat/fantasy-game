export type ScoringRouteType = "SHOT_GOAL_ROUTE" | "TRY_TOUCHDOWN_ROUTE" | "CONVERSION_ROUTE" | "DROP_GOAL_ROUTE";

export type ScoringChoiceBalanceRecommendation =
  | "KEEP_SCORING_CHOICE_BALANCE"
  | "MONITOR_SHOT_DOMINANCE"
  | "MONITOR_TRY_STARVATION"
  | "MONITOR_DROP_STARVATION"
  | "MONITOR_DROP_DIFFICULTY"
  | "MONITOR_CONVERSION_DIFFICULTY"
  | "FIX_SCORING_ROUTE_LEAKAGE"
  | "NEEDS_MORE_SAMPLE";

export interface RouteCandidateBalance {
  readonly route: ScoringRouteType;
  readonly candidatesGenerated: number;
  readonly selected: number;
  readonly rejected: number;
  readonly mainRejectionReason: string;
  readonly balanceInterpretation: string;
}

export interface RoutePointsDistribution {
  readonly route: "SHOT_GOAL" | "TRY_TOUCHDOWN" | "CONVERSION_GOAL" | "DROP_GOAL";
  readonly points: number;
  readonly shareOfActiveBatchPoints: number;
  readonly expectedRole: string;
  readonly warning: string;
}

export interface ScoringChoiceBalanceSnapshot {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly activeScoringRules: readonly string[];
  readonly inactiveScoringRules: readonly string[];
  readonly batchMatchesSimulated: number;
  readonly shotAttempts: number;
  readonly shotGoals: number;
  readonly shotSuccessRate: number;
  readonly shotPoints: number;
  readonly shotPointsShare: number;
  readonly tryOpportunities: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly tryScoringRate: number;
  readonly tryPoints: number;
  readonly tryPointsShare: number;
  readonly conversionAttempts: number;
  readonly conversionsMade: number;
  readonly conversionSuccessRate: number;
  readonly conversionPoints: number;
  readonly conversionPointsShare: number;
  readonly dropOpportunities: number;
  readonly dropCandidatesGenerated: number;
  readonly dropCandidatesSelected: number;
  readonly dropCandidatesRejected: number;
  readonly dropAttempts: number;
  readonly dropGoals: number;
  readonly dropMissed: number;
  readonly dropBlocked: number;
  readonly dropInvalid: number;
  readonly dropSuccessRate: number;
  readonly dropPoints: number;
  readonly dropPointsShare: number;
  readonly totalActiveBatchPoints: number;
  readonly routeDominanceWarnings: readonly string[];
  readonly routeStarvationWarnings: readonly string[];
  readonly routeIdentityWarnings: readonly string[];
  readonly candidateBalance: readonly RouteCandidateBalance[];
  readonly pointsDistribution: readonly RoutePointsDistribution[];
  readonly recommendation: ScoringChoiceBalanceRecommendation;
}
