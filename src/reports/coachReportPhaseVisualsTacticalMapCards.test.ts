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
const tacticalMapCardsById = new Map(model.tacticalMapCards.map((card) => [card.cardId, card]));
assert.equal(
  tacticalMapCardsById.get("tactical-map-danger-zones")?.linkedActionPlanCardId,
  "action-card-danger-to-continuity",
);
assert.equal(
  tacticalMapCardsById.get("tactical-map-useful-recoveries")?.linkedActionPlanCardId,
  "action-card-secure-first-exit",
);
assert.equal(
  tacticalMapCardsById.get("tactical-map-pressure-continuity")?.linkedActionPlanCardId,
  "action-card-structure-after-pressure",
);
for (const card of model.tacticalMapCards) {
  const signalValues = card.affectedZones.map((zone) => card.zoneIntensity[zone] ?? 0);
  assert.deepEqual(signalValues, [...signalValues].sort((a, b) => b - a));
}
assert.equal(model.tacticalMapCardsAudit.sandboxMapCardInOfficialBodyCount, 0);
assert.equal(model.visualSourceOfTruthAudit.visualClaimsOverstatedCount, 0);
assert.equal(model.visualDensityAudit.visualDensityDelta <= 5, true);
assert.match(renderCoachReportPhaseVisualsTacticalMapCards7EValidation(model), /Status: PASS/u);

console.log("PASS coachReportPhaseVisualsTacticalMapCards");
