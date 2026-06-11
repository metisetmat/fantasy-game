import { applySpatialAttributeInfluenceToCandidates } from "../routeRanking";
import {
  attributeRankingContrastSpatialContext,
  closedLaneContrastCandidates,
  legalContrastCandidates,
  unavailableContrastCandidates,
} from "../routeRanking/fixtures/attributeRankingContrast.fixture";
import { selectMiniMatchRoute } from "./miniMatchRouteSelection";
import type { SpatialRouteCandidate } from "./spatialCandidateGeneration";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function candidatesFromAdjusted(
  candidates: ReturnType<typeof applySpatialAttributeInfluenceToCandidates>,
): readonly SpatialRouteCandidate[] {
  return candidates.map((candidate) => ({
    candidateId: candidate.candidateId,
    actionType: candidate.actionType,
    actorId: candidate.actorId,
    ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
    teamId: candidate.teamId,
    fromZone: candidate.fromZone,
    targetZone: candidate.targetZone,
    laneState: candidate.laneState === "OPEN" || candidate.laneState === "CLOSED" ? candidate.laneState : "CONTESTED",
    availability: candidate.availability ?? "AVAILABLE",
    baseScore: candidate.baseScore,
    source: "spatial_player_option",
    reason: "contrast fixture candidate",
  }));
}

export function validateMiniMatchSpatialSelectionContrast(): readonly string[] {
  const legal = candidatesFromAdjusted(applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: legalContrastCandidates(),
  }));
  const closed = candidatesFromAdjusted(applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: closedLaneContrastCandidates(),
  }));
  const unavailable = candidatesFromAdjusted(applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: unavailableContrastCandidates(),
  }));
  const allBlocked: readonly SpatialRouteCandidate[] = closed.map((candidate) => ({
    ...candidate,
    actorId: "missing-actor",
    laneState: "CLOSED",
    availability: candidate.candidateId === "safe-recycle" ? "NOT_AVAILABLE_NOW" : candidate.availability,
  }));
  const legalSelection = selectMiniMatchRoute({
    selectionSource: "spatial_candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    candidates: legal,
    prototypeCandidateId: "safe-recycle",
    pressureLevel: "MEDIUM",
  });
  const closedSelection = selectMiniMatchRoute({
    selectionSource: "spatial_candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    candidates: closed,
    prototypeCandidateId: "safe-recycle",
    pressureLevel: "MEDIUM",
  });
  const unavailableSelection = selectMiniMatchRoute({
    selectionSource: "spatial_candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    candidates: unavailable,
    prototypeCandidateId: "safe-recycle",
    pressureLevel: "MEDIUM",
  });
  const fallbackSelection = selectMiniMatchRoute({
    selectionSource: "spatial_candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    routeRankingAttributeMode: "candidate_modifier",
    candidates: allBlocked,
    prototypeCandidateId: "safe-recycle",
    pressureLevel: "MEDIUM",
  });

  assertTest(legalSelection.selectedCandidateId === "elite-weak-side", "legal attribute-boosted candidate must win.");
  assertTest(legalSelection.selectedBy === "attribute_adjusted_score", "legal winner must be selected by adjusted score.");
  assertTest(closedSelection.selectedCandidateId === "safe-recycle", "closed candidate must not win.");
  assertTest(unavailableSelection.selectedCandidateId === "safe-recycle", "unavailable candidate must not win.");
  assertTest(fallbackSelection.selectedBy === "fallback", "all-blocked spatial selections must fall back to prototype.");
  assertTest(
    fallbackSelection.selectedCandidateId === "safe-recycle",
    "fallback must preserve prototype candidate identity.",
  );

  return [
    "legal attribute-boosted candidate can win",
    "closed route cannot win",
    "unavailable route cannot win",
    "guard-blocked spatial selections fall back to prototype",
  ];
}

if (require.main === module) {
  const checks = validateMiniMatchSpatialSelectionContrast();

  console.log("miniMatchSpatialSelectionContrast tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
