import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  currentGeneratedOfficialMatchStorySpineEngineCausalityProof8AModel,
  renderOfficialMatchStorySpineEngineCausalityProof8AValidation,
} from "./officialMatchStorySpineEngineCausalityProof8A";

describe("official match story spine engine causality proof 8A", () => {
  it("builds a PASS official story spine without changing scoring guardrails", () => {
    const model = currentGeneratedOfficialMatchStorySpineEngineCausalityProof8AModel();
    const validation = renderOfficialMatchStorySpineEngineCausalityProof8AValidation(model);

    assert.equal(model.status, "PASS");
    assert.equal(model.storySpine.status, "PASS");
    assert.equal(model.scope, "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF");
    assert.equal(model.version, "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_8A");
    assert.equal(model.baseline7H.status, "PASS");
    assert.equal(model.matchEconomyBaselinePreserved, true);
    assert.equal(model.guardrailsPreserved, true);
    assert.equal(model.sourceOfTruthSeparationPreserved, true);
    assert.equal(model.productStorySectionVisible, true);
    assert.equal(model.exportStorySectionVisible, true);
    assert.equal(model.exportCompactStoryVisible, true);
    assert.ok(model.storySpineAudit.storySegmentCount >= 4);
    assert.ok(model.storySpineAudit.storyBeatCount >= 8);
    assert.ok(model.storySpineAudit.turningPointCount >= 2);
    assert.equal(model.storySpineAudit.scoreChangeEventsCoveredByStoryCount, model.storySpineAudit.scoreChangeEventCount);
    assert.equal(model.engineCausalityProofAudit.unsupportedCausalityClaimCount, 0);
    assert.equal(model.officialStorySourceOfTruthAudit.unsupportedTruthClaimCount, 0);
    assert.equal(model.baseline7H.baseline7G.matchEconomyBaseline.scoringConstantsChanged, false);
    assert.equal(model.baseline7H.baseline7G.matchEconomyBaseline.MatchBonusEventChanged, false);
    assert.equal(model.baseline7H.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved, true);
    assert.equal(validation.includes("Status: PASS"), true);
    assert.equal(validation.includes("- FAIL:"), false);
  });
});
