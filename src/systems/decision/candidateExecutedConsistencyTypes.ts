export type CandidateExecutedConsistencyStatus = "PASS" | "WARNING" | "FAIL";

export type CandidateExecutedMismatchType =
  | "NONE"
  | "RAW_TOP_DIFFERS_FROM_SELECTED_WITH_OVERRIDE"
  | "RAW_TOP_DIFFERS_FROM_SELECTED_WITHOUT_OVERRIDE"
  | "SELECTED_CANDIDATE_ACTION_DIFFERS_FROM_FINAL_TYPE"
  | "TARGET_CLUSTER_DIFFERS_FROM_RECEIVER_ZONE_EXPECTED"
  | "TARGET_CLUSTER_DIFFERS_FROM_RECEIVER_ZONE_UNEXPLAINED"
  | "FINAL_TYPE_CONTRADICTS_SELECTED_CANDIDATE"
  | "LEGACY_CANDIDATE_LABEL_WRONG"
  | "REPORT_ONLY_LABEL_MISMATCH";

export interface CandidateExecutedCandidate {
  readonly actionType: string;
  readonly targetZone: string;
  readonly rank: number;
  readonly score: string;
}

export interface CandidateExecutedConsistency {
  readonly actionId: string;
  readonly rawTopCandidateAction: string;
  readonly rawTopCandidateTargetZone: string;
  readonly rawTopCandidateScore: string;
  readonly selectedCandidateAction: string;
  readonly selectedCandidateTargetZone: string;
  readonly selectedCandidateRank: number;
  readonly selectedCandidateScore: string;
  readonly normalizedSelectedCandidateActionType: string;
  readonly normalizedSelectedCandidateDisplayAction: string;
  readonly finalExecutedAction: string;
  readonly selectedActionType: string;
  readonly selectedActionSubtype: string;
  readonly targetType: string;
  readonly tacticalTargetCluster: string;
  readonly selectedReceiver: string;
  readonly receiverResolvedZone: string;
  readonly actualReceptionZone: string;
  readonly overrideApplied: boolean;
  readonly semanticMismatch: boolean;
  readonly mismatchType: CandidateExecutedMismatchType;
  readonly explanation: string;
  readonly consistencyStatus: CandidateExecutedConsistencyStatus;
}
