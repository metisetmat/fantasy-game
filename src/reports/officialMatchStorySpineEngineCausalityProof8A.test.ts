import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  currentGeneratedOfficialMatchStorySpineEngineCausalityProof8AModel,
  renderOfficialMatchStorySpineEngineCausalityProof8AValidation,
} from "./officialMatchStorySpineEngineCausalityProof8A";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

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

  it("exports the actual short story instead of the product kicker", () => {
    const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
      routeSelectionMode: "workbench_chain_replay_experimental",
    });
    const product = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
    const story = product.officialMatchStorySpine;
    assert.notEqual(story, undefined);

    const productHtml = renderCoachProductReport(product);
    const exportHtml = renderCoachReportExportHtml({ productReportHtml: productHtml });

    assert.equal(exportHtml.includes(story?.narrative.shortNarrative ?? ""), true);
    assert.equal(/<article class="report-table-card">\s*<p>Lecture officielle<\/p>/u.test(exportHtml), false);
    assert.equal(exportHtml.includes(story?.narrative.sourceOfTruthNote ?? ""), true);
  });
});
