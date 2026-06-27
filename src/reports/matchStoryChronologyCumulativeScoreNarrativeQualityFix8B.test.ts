import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel } from "./matchStoryChronologyCumulativeScoreNarrativeQualityFix8B";

describe("Sprint 8B official match story chronology and narrative quality", () => {
  it("repairs cumulative segment scores, turning point order, and narrative quality without changing guardrails", () => {
    const model = currentGeneratedOfficialMatchStoryChronologyNarrativeQualityFix8BModel();

    assert.equal(model.status, "PASS");
    assert.equal(model.storyChronologyReady, true);
    assert.equal(model.cumulativeScoreReady, true);
    assert.equal(model.turningPointOrderReady, true);
    assert.equal(model.narrativeQualityReady, true);
    assert.equal(model.storyRegressionFixed, true);
    assert.equal(model.cumulativeScoreAudit.finalCumulativeScoreMatchesOfficial, true);
    assert.equal(model.cumulativeScoreAudit.scoreResetCount, 0);
    assert.equal(model.chronologyAudit.scoreLabelAmbiguityCount, 0);
    assert.equal(model.turningPointOrderAudit.invalidFirstDangerLabelCount, 0);
    assert.equal(model.narrativeQualityAudit.mechanicalSentenceCount, 0);
    assert.equal(model.narrativeQualityAudit.repeatedSentenceCount, 0);
    assert.equal(model.sourceOfTruthRegressionAudit.inventedEventCount, 0);
    assert.equal(model.sourceOfTruthRegressionAudit.noForcedNarrativeOutcome, true);
    assert.ok(model.reportIntegrationRegressionAudit.exportReadTimeSecondsAfter8B <= 900);
    assert.equal(model.guardrailsPreserved, true);
    assert.equal(model.nextSprintRecommendation, "8C - Attribute Role Fatigue Causality Deepening");
  });
});
