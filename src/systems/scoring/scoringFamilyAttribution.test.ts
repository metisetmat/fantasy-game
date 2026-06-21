import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyScoringEventFamily,
  scoringFamilyTags,
} from "./scoringFamilyAttribution";

test("maps legacy goal scoring_type tags to SHOT_GOAL", () => {
  const attribution = classifyScoringEventFamily({
    eventType: "scoring",
    tags: ["scoring_type_goal"],
    tacticalMoveType: "goal",
    consequencePointValue: 3,
  });

  assert.equal(attribution.family, "SHOT_GOAL");
  assert.equal(attribution.scoringAction, "SHOT_GOAL");
  assert.equal(attribution.confidence, "high");
  assert.ok(attribution.sourceFieldsUsed.includes("tags.scoring_type"));
  assert.ok(scoringFamilyTags(attribution).includes("scoring_family_SHOT_GOAL"));
});

test("maps try, conversion, and drop families from explicit tags", () => {
  assert.equal(classifyScoringEventFamily({
    eventType: "scoring",
    tags: ["scoring_type_try"],
    consequencePointValue: 5,
  }).family, "TRY_TOUCHDOWN");
  assert.equal(classifyScoringEventFamily({
    eventType: "scoring",
    tags: ["scoring_type_conversion"],
    consequencePointValue: 2,
  }).family, "CONVERSION_GOAL");
  assert.equal(classifyScoringEventFamily({
    eventType: "scoring",
    tags: ["scoring_type_drop"],
    consequencePointValue: 2,
  }).family, "DROP_GOAL");
});

test("keeps UNKNOWN explicit when no taxonomy evidence exists", () => {
  const attribution = classifyScoringEventFamily({
    eventType: "scoring",
    tags: [],
  });

  assert.equal(attribution.family, "UNKNOWN");
  assert.equal(
    attribution.unknownReason,
    "Official score_change event lacks enough scoring action, route, tag, or point-value evidence for a safe family attribution.",
  );
  assert.ok(attribution.warningCodes.includes("UNKNOWN_SCORING_FAMILY"));
  assert.ok(attribution.warningCodes.includes("MISSING_SCORE_CHANGE_POINT_VALUE"));
});

test("does not classify bare 2-point score changes as conversions", () => {
  const attribution = classifyScoringEventFamily({
    eventType: "scoring",
    tags: [],
    consequencePointValue: 2,
  });

  assert.equal(attribution.family, "UNKNOWN");
  assert.ok(attribution.warningCodes.includes("AMBIGUOUS_SCORING_FAMILY"));
  assert.ok(attribution.warningCodes.includes("UNKNOWN_SCORING_FAMILY"));
  assert.equal(attribution.sourceFieldsUsed.includes("score_change.value"), false);
});

test("flags inactive penalty shot if it appears", () => {
  const attribution = classifyScoringEventFamily({
    eventType: "scoring",
    tags: ["scoring_type_penalty"],
    consequencePointValue: 3,
  });

  assert.equal(attribution.family, "PENALTY_SHOT");
  assert.ok(attribution.warningCodes.includes("INACTIVE_PENALTY_SHOT_USED"));
});
