import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

test("renders official calibrated scoring connection in the coach export", () => {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const html = context.exportHtml;

  assert.match(html, /Chemin officiel de scoring calibr/);
  assert.match(html, /Score avant/);
  assert.match(html, /Score apr/);
  assert.match(html, /Score issu des score_change/);
  assert.match(html, /CONFIRM_OFFICIAL_SCORING_PATH_CONNECTED_AND_RUN_FULL_MATCH_BATCH_NEXT/);
  assert.doesNotMatch(html, /score corrige/i);
  assert.doesNotMatch(html, /score ajuste/i);
  assert.doesNotMatch(html, /recommandation automatique de selection/i);
  assert.equal(context.fullMatchOfficialScoringConnection.status, "PASS");
  assert.equal(context.fullMatchOfficialScoringConnection.scoreCapApplied, false);
  assert.equal(context.fullMatchOfficialScoringConnection.postHocScoreRewriteApplied, false);
  assert.equal(context.fullMatchOfficialScoringConnection.scoringEventsDeleted, false);
});
