import assert from "node:assert/strict";
import {
  currentGeneratedCoachReportPremiumLayoutVisualHierarchyModel,
  renderCoachReportPremiumLayoutVisualHierarchy7DDoc,
  renderCoachReportPremiumLayoutVisualHierarchy7DValidation,
} from "./coachReportPremiumLayoutVisualHierarchy";

const model = currentGeneratedCoachReportPremiumLayoutVisualHierarchyModel();
const doc = renderCoachReportPremiumLayoutVisualHierarchy7DDoc(model);
const validation = renderCoachReportPremiumLayoutVisualHierarchy7DValidation(model);

assert.equal(model.scope, "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY");
assert.equal(model.version, "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY_7D");
assert.equal(model.baselineVersion, "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING_7C");
assert.equal(model.baseline7C.status, "PASS");
assert.equal(model.baseline7C.baseline7B.status, "PASS");
assert.equal(model.baseline7C.baseline7A.status, "PASS");
assert.equal(model.baselineMetadataConsistencyAudit.baselineStatusMismatchCount, 0);
assert.equal(model.baselineMetadataConsistencyAudit.baselineProductReadyMismatchCount, 0);
assert.equal(model.visualHierarchyAudit.expressReadAvailable, true);
assert.equal(model.visualHierarchyAudit.officialScoreProminence, true);
assert.equal(model.visualHierarchyAudit.sourceOfTruthProminence, true);
assert.equal(model.visualHierarchyAudit.actionPlanAboveFold, true);
assert.equal(model.visualHierarchyAudit.primaryActionCardProminence, true);
assert.equal(model.mobileReadabilityAudit.mobileNoHorizontalOverflow, true);
assert.equal(model.exportPrintAudit.exportReady, true);
assert.match(doc, /# Coach Report Premium Layout & Visual Hierarchy 7D/u);
assert.match(doc, /Baseline Metadata Consistency/u);
assert.match(validation, /Status: PASS/u);
assert.match(validation, /baseline 7B visible and consistent/u);
assert.match(validation, /npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share/u);

console.log("PASS coachReportPremiumLayoutVisualHierarchy");
