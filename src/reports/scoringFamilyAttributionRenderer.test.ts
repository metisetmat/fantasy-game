import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

test("keeps scoring-family attribution evidence while 7F removes the visible technical section", () => {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const html = context.exportHtml;

  assert.match(html, /Rapport coach/);
  assert.doesNotMatch(html, /Origine des points/);
  assert.doesNotMatch(html, /score ajuste manuellement/);
  assert.equal(context.scoringFamilyAttributionAudit.status, "PASS");
  assert.equal(context.scoringFamilyAttributionAudit.unknownScoringEventCount, 0);
  assert.equal(context.scoringFamilyAttributionAudit.attributionCoverageRate, 100);
  assert.equal(context.scoringFamilyAttributionAudit.scoringEventsByFamily.SHOT_GOAL > 0, true);
});
