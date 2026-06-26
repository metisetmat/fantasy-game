import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

test("renders official calibrated scoring connection in the coach export", () => {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const html = context.exportHtml;

  assert.match(html, /Rapport coach/);
  assert.doesNotMatch(html, /score corrige/i);
  assert.doesNotMatch(html, /score ajuste/i);
  assert.doesNotMatch(html, /recommandation automatique de selection/i);
  assert.equal(context.fullMatchOfficialScoringConnection.status, "PASS");
  assert.equal(context.fullMatchOfficialScoringConnection.createsOfficialScoreChangeAfter, true);
  assert.equal(context.fullMatchOfficialScoringConnection.canDriveOfficialScoreAfter, true);
  assert.equal(context.fullMatchOfficialScoringConnection.scoreCapApplied, false);
  assert.equal(context.fullMatchOfficialScoringConnection.postHocScoreRewriteApplied, false);
  assert.equal(context.fullMatchOfficialScoringConnection.scoringEventsDeleted, false);
});
