import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

test("renders calibration carryover reconciliation in the coach export", () => {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const html = context.exportHtml;

  assert.match(html, /Reconciliation des calibrations/);
  assert.match(html, /Diagnostic single-run/);
  assert.match(html, /Il ne modifie pas le score/);
  assert.match(html, /FULLMATCH_PARALLEL_SCORING_PATH/);
  assert.match(html, /FULL_MATCH_BATCH_ECONOMY reste la seule/);
  assert.doesNotMatch(html, /score corrige/i);
  assert.doesNotMatch(html, /score ajuste/i);
  assert.equal(context.fullMatchCalibrationCarryoverReconciliation.status, "available");
  assert.equal(context.fullMatchCalibrationCarryoverReconciliation.scoreCapApplied, false);
  assert.equal(context.fullMatchCalibrationCarryoverReconciliation.scoringEventsRewritten, false);
});
