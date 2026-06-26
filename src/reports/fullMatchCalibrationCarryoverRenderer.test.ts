import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

test("renders calibration carryover reconciliation in the coach export", () => {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const html = context.exportHtml;

  assert.match(html, /Rapport coach/);
  assert.doesNotMatch(html, /score corrige/i);
  assert.doesNotMatch(html, /score ajuste/i);
  assert.equal(context.fullMatchCalibrationCarryoverReconciliation.status, "available");
  assert.equal(context.fullMatchCalibrationCarryoverReconciliation.singleRunOnly, true);
  assert.equal(context.fullMatchCalibrationCarryoverReconciliation.scoreCapApplied, false);
  assert.equal(context.fullMatchCalibrationCarryoverReconciliation.scoringEventsRewritten, false);
  assert.equal(context.fullMatchCalibrationCarryoverReconciliation.fullMatchBatchEconomyRemainsOnlyGlobalProof, true);
});
