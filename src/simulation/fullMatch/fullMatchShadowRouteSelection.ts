import type { ChainRouteCandidateInfluence } from "./fullMatchChainRouteCandidateInfluence";

export type FullMatchShadowRouteSelectionStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type FullMatchShadowRouteSelectionScope =
  | "diagnostic_shadow_selection"
  | "production_selection_forbidden";

export type ShadowRouteSelectionDifferenceReason =
  | "CHAIN_CONTEXT_FAVORED_CONTINUITY"
  | "CHAIN_CONTEXT_FAVORED_FINAL_CARRIER"
  | "CHAIN_CONTEXT_FAVORED_FINAL_ZONE"
  | "PRODUCTION_SELECTION_IGNORES_CHAIN_CONTEXT"
  | "PRODUCTION_SELECTION_FROM_SEGMENT_HARNESS"
  | "NO_DIAGNOSTIC_DIFFERENCE";

export type FullMatchShadowRouteSelectionResult = {
  readonly status: FullMatchShadowRouteSelectionStatus;
  readonly scope: FullMatchShadowRouteSelectionScope;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly diagnosticOnly: boolean;
  readonly canMutateScore: false;
  readonly canMutateScoringEvents: false;
  readonly canDriveProductionSelection: false;
  readonly productionSelectionCandidateId?: string;
  readonly productionSelectionActionType?: string;
  readonly productionSelectionReceiverId?: string;
  readonly productionSelectionTargetZone?: string;
  readonly shadowSelectionCandidateId?: string;
  readonly shadowSelectionActionType?: string;
  readonly shadowSelectionReceiverId?: string;
  readonly shadowSelectionTargetZone?: string;
  readonly shadowSelectionBaseScore?: number;
  readonly shadowSelectionInfluenceDelta?: number;
  readonly shadowSelectionInfluencedScore?: number;
  readonly candidateCount: number;
  readonly eligibleCandidateCount: number;
  readonly blockedCandidateCount: number;
  readonly closedCandidateRejectedCount: number;
  readonly unavailableCandidateRejectedCount: number;
  readonly shadowSelectionChangedFromProduction: boolean;
  readonly differenceReasons: readonly ShadowRouteSelectionDifferenceReason[];
  readonly explanation: string;
  readonly selectedCandidateLegal: boolean;
  readonly selectedCandidateAvailable: boolean;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyShadowRouteSelection(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): FullMatchShadowRouteSelectionResult {
  return {
    status: "not_available",
    scope: "production_selection_forbidden",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    diagnosticOnly: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canDriveProductionSelection: false,
    candidateCount: 0,
    eligibleCandidateCount: 0,
    blockedCandidateCount: 0,
    closedCandidateRejectedCount: 0,
    unavailableCandidateRejectedCount: 0,
    shadowSelectionChangedFromProduction: false,
    differenceReasons: ["NO_DIAGNOSTIC_DIFFERENCE"],
    explanation: "Shadow route selection is not available because route candidate influence is not available.",
    selectedCandidateLegal: false,
    selectedCandidateAvailable: false,
    tags: [],
    warnings: input.warnings,
  };
}

export function candidateIdentity(candidate: ChainRouteCandidateInfluence | undefined): {
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
} {
  if (candidate === undefined) {
    return {};
  }

  return {
    candidateId: candidate.candidateId,
    actionType: candidate.actionType,
    ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
    ...(candidate.targetZone === undefined ? {} : { targetZone: candidate.targetZone }),
  };
}
