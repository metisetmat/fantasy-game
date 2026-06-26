import { strict as assert } from "node:assert";
import {
  currentGeneratedCoachReportPhaseVisualsTacticalMapCardsModel,
  renderCoachReportPhaseVisualsTacticalMapCards7EValidation,
} from "./coachReportPhaseVisualsTacticalMapCards";

const model = currentGeneratedCoachReportPhaseVisualsTacticalMapCardsModel();

assert.equal(model.scope, "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS");
assert.equal(model.version, "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS_7E");
assert.equal(model.baselineVersion, "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY_7D");
assert.equal(model.status, "PASS");
assert.equal(model.productBaselineReady, true);
assert.equal(model.premiumLayoutPreserved, true);
assert.equal(model.visualHierarchyPreserved, true);
assert.equal(model.phaseVisualCardsReady, true);
assert.equal(model.tacticalMapCardsReady, true);
assert.ok(model.tacticalMapCards.length >= 2 && model.tacticalMapCards.length <= 3);
assert.equal(model.tacticalMapCardsAudit.sandboxMapCardInOfficialBodyCount, 0);
assert.equal(model.visualSourceOfTruthAudit.visualClaimsOverstatedCount, 0);
assert.equal(model.visualDensityAudit.visualDensityDelta <= 5, true);
assert.match(renderCoachReportPhaseVisualsTacticalMapCards7EValidation(model), /Status: PASS/u);

console.log("PASS coachReportPhaseVisualsTacticalMapCards");
