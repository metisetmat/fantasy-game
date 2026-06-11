import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";
import { createWorkbenchReplayMatchInput, runWorkbenchReplaySeed } from "./runWorkbenchReplaySeed";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateWorkbenchReplaySeed(): readonly string[] {
  const matchInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const result = runWorkbenchReplaySeed({
    matchInput,
    workbench: sequence1Action1WorkbenchTruth,
  });

  assertTest(result.spatialContextBuilt, "spatial context must be built.");
  assertTest(result.actorPreserved, "actor control-tempo-half must be preserved.");
  assertTest(result.receiverPreserved, "receiver control-mobile-lock must be preserved.");
  assertTest(result.newCarrierPreserved, "new carrier control-mobile-lock must be preserved.");
  assertTest(result.ballZonePreserved, "before and after ball zones must be preserved.");
  assertTest(result.selectedActionRepresented, "SUPPORT_CLUSTER_RECYCLE selected action must be represented.");
  assertTest(result.attributeInfluenceApplied, "replay seed must apply route attribute influence.");
  assertTest(result.routeRankingUsesRealAttributes === "PARTIAL", "replay seed must report attribute route ranking as PARTIAL.");
  assertTest(result.attributeRankingMode === "candidate_modifier", "replay seed must evaluate candidate_modifier mode.");
  assertTest(result.metadataOnlySelectionResult?.selectedCandidateId === "rank-1", "metadata_only replay selection must keep base rank-1.");
  assertTest(result.attributeSelectionResult?.selectedCandidateId === "rank-1", "candidate_modifier replay selection must preserve TH -> ML for workbench truth.");
  assertTest(result.selectedBy === "base_score", "sequence-1-action-1 should remain selected by base score after guard checks.");
  assertTest(!result.selectionChangedByAttributes, "sequence-1-action-1 must not change selection by attributes.");
  assertTest(result.selectedCandidateBaseScore !== undefined, "selected candidate base score must be exposed.");
  assertTest(result.selectedCandidateAttributeAdjustedScore !== undefined, "selected candidate adjusted score must be exposed.");
  assertTest((result.selectedCandidateInfluences ?? []).length > 0, "selected candidate influences must be exposed.");
  assertTest(result.status === "PARTIAL" || result.status === "PASS", `replay seed must not fail, received ${result.status}.`);
  if (result.status === "PARTIAL") {
    assertTest(result.lossyMappings.length > 0, "PARTIAL replay seed must list lossy mappings.");
  }

  return [
    "spatial context is built",
    "actor TH is preserved",
    "receiver ML is preserved",
    "new carrier ML is preserved",
    "before ball zone Z4-HSL is preserved",
    "after ball zone Z3-HSL is preserved",
    "selected action type SUPPORT_CLUSTER_RECYCLE is represented",
    "route attribute influence is applied",
    "candidate_modifier mode is evaluated",
    "TH -> ML remains selected under candidate_modifier guard",
    "selected candidate base and adjusted scores are exposed",
    "replay seed is PARTIAL and honest",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchReplaySeed();

  console.log("workbenchReplaySeed tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
