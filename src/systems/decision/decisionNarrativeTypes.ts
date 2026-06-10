export interface DecisionNarrativeCandidate {
  readonly rank: number;
  readonly fromZone: string;
  readonly toZone: string;
  readonly actionType: string;
  readonly finalScore: string;
  readonly selected: boolean;
  readonly preOverrideRank: number | null;
  readonly postOverrideRank: number | null;
  readonly overrideReason: string | null;
}

export interface DecisionNarrative {
  readonly actionId: string;
  readonly decisionActor: string;
  readonly rawTopCandidate: string;
  readonly selectedCandidate: string;
  readonly finalExecutedAction: string;
  readonly overrideApplied: boolean;
  readonly overrideReason: string;
  readonly selectedActionType: string;
  readonly selectedActionSubtype: string;
  readonly targetType: string;
  readonly tacticalTargetCluster: string;
  readonly selectedReceiver: string;
  readonly receiverResolvedZone: string;
  readonly actualReceptionZone: string;
  readonly normalizedCandidateActionType: string;
  readonly candidateExecutedConsistencyStatus: "PASS" | "WARNING" | "FAIL";
  readonly candidateExecutedConsistencyExplanation: string;
  readonly whyRawTopLost: string;
  readonly whySelectedWon: string;
  readonly coachSummary: string;
  readonly consistencyStatus: "PASS" | "FAIL";
  readonly compactCandidates: readonly string[];
}
