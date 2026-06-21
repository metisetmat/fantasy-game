import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

test("renders the scoring-family attribution section in the coach export", () => {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const html = context.exportHtml;

  assert.match(html, /Origine des points/);
  assert.match(html, /Famille de score/);
  assert.match(html, /Couverture/);
  assert.match(html, /SHOT_GOAL/);
  assert.doesNotMatch(html, /score ajuste manuellement/);
  assert.equal(context.scoringFamilyAttributionAudit.status, "PASS");
  assert.equal(context.scoringFamilyAttributionAudit.unknownScoringEventCount, 0);
});
