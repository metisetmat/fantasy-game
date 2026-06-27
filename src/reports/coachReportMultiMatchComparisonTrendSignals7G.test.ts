import assert from "node:assert/strict";
import {
  currentGeneratedCoachReportMultiMatchComparisonTrendSignals7GModel,
  renderCoachReportMultiMatchComparisonTrendSignals7GDoc,
  renderCoachReportMultiMatchComparisonTrendSignals7GValidation,
} from "./coachReportMultiMatchComparisonTrendSignals7G";

const model = currentGeneratedCoachReportMultiMatchComparisonTrendSignals7GModel();
const doc = renderCoachReportMultiMatchComparisonTrendSignals7GDoc(model);
const validation = renderCoachReportMultiMatchComparisonTrendSignals7GValidation(model);

assert.equal(model.status, "PASS");
assert.equal(model.baselineVersion, "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP_7F");
assert.equal(model.trendSignalsReady, true);
assert.equal(model.historyScopeClean, true);
assert.equal(model.unresolvedTemplatePlaceholdersRemoved, true);
assert.equal(model.placeholderCleanupAudit.unresolvedTemplatePlaceholderCountAfter, 0);
assert.ok(model.trendSignalsAudit.trendSignalCardCount >= 1);
assert.ok(model.trendSignalsAudit.trendSignalCardCount <= 3);
assert.equal(model.trendSignalsAudit.forcedSelectionTrendCount, 0);
assert.equal(model.trendSignalsAudit.sandboxTrendInOfficialBodyCount, 0);
assert.equal(model.sourceOfTruthSeparationPreserved, true);
assert.equal(model.matchEconomyBaselinePreserved, true);
assert.match(doc, /Coach Report Multi-Match Comparison & Trend Signals 7G/u);
assert.match(doc, /TEMPLATE_PLACEHOLDERS_REMOVED/u);
assert.match(validation, /Status: PASS/u);
assert.match(validation, /unresolvedTemplatePlaceholderCount = 0/u);
assert.match(validation, /trends section visible/u);

console.log("PASS coachReportMultiMatchComparisonTrendSignals7G");
