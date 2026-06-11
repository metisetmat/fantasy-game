import { applySpatialAttributeInfluenceToCandidates } from "./applySpatialAttributeInfluenceToCandidates";
import {
  attributeRankingContrastSpatialContext,
  closedLaneContrastCandidates,
  legalContrastCandidates,
  unavailableContrastCandidates,
} from "./fixtures/attributeRankingContrast.fixture";
import { selectAttributeAdjustedCandidate } from "./selectAttributeAdjustedCandidate";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectAttributeAdjustedCandidate(): readonly string[] {
  const legalAdjusted = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: legalContrastCandidates(),
  });
  const closedAdjusted = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: closedLaneContrastCandidates(),
  });
  const unavailableAdjusted = applySpatialAttributeInfluenceToCandidates({
    spatialContext: attributeRankingContrastSpatialContext,
    candidates: unavailableContrastCandidates(),
  });
  const metadataOnly = selectAttributeAdjustedCandidate({
    candidates: legalAdjusted,
    mode: "metadata_only",
    spatialContext: attributeRankingContrastSpatialContext,
    baseSelectedCandidateId: "safe-recycle",
  });
  const legalFlip = selectAttributeAdjustedCandidate({
    candidates: legalAdjusted,
    mode: "candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    baseSelectedCandidateId: "safe-recycle",
  });
  const closedBlocked = selectAttributeAdjustedCandidate({
    candidates: closedAdjusted,
    mode: "candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    baseSelectedCandidateId: "safe-recycle",
  });
  const unavailableBlocked = selectAttributeAdjustedCandidate({
    candidates: unavailableAdjusted,
    mode: "candidate_modifier",
    spatialContext: attributeRankingContrastSpatialContext,
    baseSelectedCandidateId: "safe-recycle",
  });
  const noSpatialContext = selectAttributeAdjustedCandidate({
    candidates: legalAdjusted,
    mode: "candidate_modifier",
    baseSelectedCandidateId: "safe-recycle",
  });

  assertTest(metadataOnly.selectedCandidateId === "safe-recycle", "metadata_only must keep base selection.");
  assertTest(metadataOnly.selectedBy === "base_score", "metadata_only must select by base score.");
  assertTest(legalFlip.selectedCandidateId === "elite-weak-side", "candidate_modifier must allow legal attribute-driven flip.");
  assertTest(legalFlip.selectedBy === "attribute_adjusted_score", "legal flip must be selected by adjusted score.");
  assertTest(legalFlip.selectionChanged, "legal flip must report selectionChanged.");
  assertTest(closedBlocked.selectedCandidateId === "safe-recycle", "closed lane candidate must not overtake base selection.");
  assertTest(
    closedBlocked.selectedBy === "base_score",
    "closed lane fallback must keep base-score selection.",
  );
  assertTest(unavailableBlocked.selectedCandidateId === "safe-recycle", "NOT_AVAILABLE_NOW candidate must not overtake base selection.");
  assertTest(noSpatialContext.selectedCandidateId === "safe-recycle", "no spatialContext must preserve previous behavior.");
  assertTest(
    legalAdjusted.every((candidate) => Math.abs(candidate.attributeAdjustedScore - candidate.baseScore) <= 12),
    "adjustment bound must still be respected.",
  );

  return [
    "metadata_only keeps base selection",
    "candidate_modifier can select by adjusted score",
    "candidate_modifier cannot select CLOSED lane",
    "NOT_AVAILABLE_NOW cannot be selected by attributes",
    "no spatialContext preserves previous behavior",
    "attribute adjustment bound remains respected",
  ];
}

if (require.main === module) {
  const checks = validateSelectAttributeAdjustedCandidate();

  console.log("selectAttributeAdjustedCandidate tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
