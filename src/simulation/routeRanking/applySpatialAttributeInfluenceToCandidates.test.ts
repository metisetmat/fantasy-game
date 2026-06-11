import { sequence1Action1WorkbenchTruth } from "../grounding/fixtures/sequence1Action1.fixture";
import { createWorkbenchReplayMatchInput } from "../grounding/runWorkbenchReplaySeed";
import { workbenchToSpatialMatchContext } from "../spatialContext";
import { applySpatialAttributeInfluenceToCandidates, type RouteCandidateInput } from "./applySpatialAttributeInfluenceToCandidates";
import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function candidates(): readonly RouteCandidateInput[] {
  return sequence1Action1WorkbenchTruth.rankedOptions.map((option) => ({
    candidateId: `rank-${option.rank}`,
    actorId: sequence1Action1WorkbenchTruth.selectedAction.actorId as PlayerId,
    ...(option.receiverId === undefined ? {} : { receiverId: option.receiverId as PlayerId }),
    teamId: sequence1Action1WorkbenchTruth.possessionTeamId as TeamId,
    fromZone: sequence1Action1WorkbenchTruth.selectedAction.fromZone as ZoneId,
    targetZone: option.targetZone as ZoneId,
    actionType: option.actionType,
    ...(option.laneState === undefined ? {} : { laneState: option.laneState }),
    baseScore: option.finalSelectionScore ?? option.score ?? 0,
    baseRisk: option.risk === "HIGH" ? 80 : option.risk === "MEDIUM" ? 50 : 20,
  }));
}

export function validateApplySpatialAttributeInfluenceToCandidates(): readonly string[] {
  const baseCandidates = candidates();
  const unchanged = applySpatialAttributeInfluenceToCandidates({
    candidates: baseCandidates,
  });
  const matchInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const spatialContext = workbenchToSpatialMatchContext({
    matchInput,
    workbench: sequence1Action1WorkbenchTruth,
    frame: "before",
  });
  const adjusted = applySpatialAttributeInfluenceToCandidates({
    spatialContext,
    candidates: baseCandidates,
    pressureLevel: "HIGH",
  });
  const selected = adjusted.find((candidate) => candidate.candidateId === "rank-1");
  const weakSide = adjusted.find((candidate) => candidate.actionType === "WEAK_SIDE_SWITCH");

  assertTest(
    unchanged.every((candidate) => candidate.attributeAdjustedScore === candidate.baseScore && candidate.attributeInfluences.length === 0),
    "absence of spatialContext must leave candidate scores unchanged.",
  );
  assertTest(
    adjusted.some((candidate) => candidate.attributeInfluences.length > 0),
    "spatialContext must add attribute influence metadata.",
  );
  assertTest(selected !== undefined && selected.attributeAdjustedScore >= selected.baseScore, "selected recycle candidate should remain plausible after attribute influence.");
  assertTest(
    weakSide !== undefined && weakSide.laneState === "CONTESTED",
    "attribute influence must preserve lane state and not rewrite legality.",
  );
  assertTest(
    adjusted.every((candidate) => Math.abs(candidate.attributeAdjustedScore - candidate.baseScore) <= 12),
    "total attribute adjustment must remain bounded.",
  );

  return [
    "no spatialContext leaves candidate scores unchanged",
    "spatialContext enriches candidates with attribute influences",
    "selected recycle remains plausible",
    "lane state legality is preserved",
    "candidate score adjustments are bounded",
  ];
}

if (require.main === module) {
  const checks = validateApplySpatialAttributeInfluenceToCandidates();

  console.log("applySpatialAttributeInfluenceToCandidates tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
