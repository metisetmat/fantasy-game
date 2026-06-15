import type { FullMatchChainSegmentContext } from "./fullMatchChainSegmentContext";

export type FullMatchChainRouteCandidateInfluenceStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type FullMatchChainRouteCandidateInfluenceScope =
  | "diagnostic_shadow_ranking"
  | "production_selection_forbidden";

export type ChainRouteCandidateInfluenceReason =
  | "FINAL_CARRIER_ADVANCED_SUPPORT"
  | "FINAL_ZONE_RIGHT_HALF_SPACE_ACCESS"
  | "CHAIN_CONTEXT_CONTINUITY"
  | "CHAIN_CONTEXT_NOT_COMPATIBLE"
  | "CANDIDATE_ILLEGAL_OR_UNAVAILABLE";

export type DiagnosticRouteCandidate = {
  readonly candidateId: string;
  readonly actionType: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly laneState?: string;
  readonly baseScore: number;
  readonly available: boolean;
};

export type ChainRouteCandidateInfluence = {
  readonly candidateId: string;
  readonly actionType: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly laneState?: string;
  readonly baseScore: number;
  readonly influenceDelta: number;
  readonly influencedScore: number;
  readonly reason: ChainRouteCandidateInfluenceReason;
  readonly legalBeforeInfluence: boolean;
  readonly availableBeforeInfluence: boolean;
  readonly selectableAfterInfluence: boolean;
  readonly blockedReasons: readonly string[];
};

export type FullMatchChainRouteCandidateInfluenceResult = {
  readonly status: FullMatchChainRouteCandidateInfluenceStatus;
  readonly scope: FullMatchChainRouteCandidateInfluenceScope;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly finalCarrierId?: string;
  readonly finalZone?: string;
  readonly diagnosticOnly: boolean;
  readonly canMutateScore: false;
  readonly canMutateScoringEvents: false;
  readonly canDriveProductionSelection: false;
  readonly candidateCount: number;
  readonly influencedCandidateCount: number;
  readonly positiveDeltaCount: number;
  readonly negativeDeltaCount: number;
  readonly illegalCandidateBoostBlockedCount: number;
  readonly unavailableCandidateBoostBlockedCount: number;
  readonly selectedCandidateBefore?: string;
  readonly selectedCandidateAfterDiagnostic?: string;
  readonly diagnosticSelectionChanged: boolean;
  readonly influences: readonly ChainRouteCandidateInfluence[];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyChainRouteCandidateInfluence(
  segmentContext: FullMatchChainSegmentContext,
): FullMatchChainRouteCandidateInfluenceResult {
  return {
    status: "not_available",
    scope: "production_selection_forbidden",
    ...(segmentContext.segmentLabel === undefined ? {} : { segmentLabel: segmentContext.segmentLabel }),
    ...(segmentContext.chainId === undefined ? {} : { chainId: segmentContext.chainId }),
    ...(segmentContext.finalCarrierId === undefined ? {} : { finalCarrierId: segmentContext.finalCarrierId }),
    ...(segmentContext.finalZone === undefined ? {} : { finalZone: segmentContext.finalZone }),
    diagnosticOnly: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canDriveProductionSelection: false,
    candidateCount: 0,
    influencedCandidateCount: 0,
    positiveDeltaCount: 0,
    negativeDeltaCount: 0,
    illegalCandidateBoostBlockedCount: 0,
    unavailableCandidateBoostBlockedCount: 0,
    diagnosticSelectionChanged: false,
    influences: [],
    tags: [],
    warnings: segmentContext.warnings,
  };
}
