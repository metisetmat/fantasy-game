import assert from "node:assert/strict";
import {
  buildFullMatchEconomyFinalStabilizationModel,
  renderFullMatchEconomyFinalStabilization6XDoc,
  renderFullMatchEconomyFinalStabilization6XValidation,
} from "./fullMatchMatchEconomyFinalStabilization";

const model = buildFullMatchEconomyFinalStabilizationModel();
const doc = renderFullMatchEconomyFinalStabilization6XDoc(model);
const validation = renderFullMatchEconomyFinalStabilization6XValidation(model);

assert.equal(model.scope, "FULL_MATCH_ECONOMY_FINAL_STABILIZATION");
assert.equal(model.version, "MATCH_ECONOMY_FINAL_STABILIZATION_6X");
assert.equal(model.baselineVersion, "LATE_GAME_THREAT_MONITORING_6W");
assert.equal(model.matchCount, 50);
assert.equal(model.metricConsistencyAudit.noRateGreaterThan100WithoutRatioDefinition, true);
assert.equal(model.lateGameThreatRateConsistency, true);
assert.ok(model.lateGameThreatQualityRateAfter <= 100);
assert.equal(model.scoreFromScoreChangeAllRuns, true);
assert.equal(model.officialPathConnectedAllRuns, true);
assert.equal(model.scoringConstantsChanged, false);
assert.equal(model.MatchBonusEventChanged, false);
assert.equal(model.scoreCapApplied, false);
assert.equal(model.postHocRewriteApplied, false);
assert.equal(model.scoringEventsDeleted, false);
assert.equal(model.forcedTrailingTeamScoreApplied, false);
assert.equal(model.rubberBandingApplied, false);
assert.equal(model.comebackForced, false);
assert.equal(model.actualForcedComebackDetected, false);
assert.equal(model.trailingTeamOpportunityForced, false);
assert.equal(model.trailingTeamScoreChangeInjected, false);
assert.equal(model.trailingTeamScoringEventInjected, false);
assert.equal(model.unknownScoringFamilyCount, 0);
assert.equal(model.penaltyShotActiveLeakageCount, 0);
assert.equal(model.noRollbackToShotOnly, true);
assert.equal(model.longitudinalStabilityAudit.windowCount >= 3, true);
assert.ok(doc.includes("# Full-Match Match Economy Final Stabilization 6X"));
assert.ok(doc.includes("Metric Consistency"));
assert.ok(doc.includes("Guardrails Final Audit"));
assert.ok(doc.includes("Longitudinal Stability"));
assert.ok(validation.includes("Status:"));
assert.ok(validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"));

console.log("PASS fullMatchMatchEconomyFinalStabilization");
