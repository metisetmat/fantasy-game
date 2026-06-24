import assert from "node:assert/strict";
import {
  buildFullMatchTrailingTeamResponseLateGamePressureModel,
  renderFullMatchTrailingTeamResponseLateGamePressure6UDoc,
  renderFullMatchTrailingTeamResponseLateGamePressure6UValidation,
} from "./fullMatchTrailingTeamResponseLateGamePressure";

const model = buildFullMatchTrailingTeamResponseLateGamePressureModel();
const doc = renderFullMatchTrailingTeamResponseLateGamePressure6UDoc(model);
const validation = renderFullMatchTrailingTeamResponseLateGamePressure6UValidation(model);

assert.equal(model.scope, "FULL_MATCH_TRAILING_TEAM_RESPONSE_LATE_GAME_PRESSURE");
assert.equal(model.version, "TRAILING_TEAM_RESPONSE_6U");
assert.equal(model.matchCount, 50);
assert.equal(model.scoreFromScoreChangeAllRuns, true);
assert.equal(model.scoringConstantsChanged, false);
assert.equal(model.scoreCapApplied, false);
assert.equal(model.postHocRewriteApplied, false);
assert.equal(model.scoringEventsDeleted, false);
assert.equal(model.forcedTrailingTeamScoreApplied, false);
assert.equal(model.trailingTeamOpportunityForced, false);
assert.equal(model.trailingTeamScoreChangeInjected, false);
assert.equal(model.rubberBandingApplied, false);
assert.equal(model.comebackForced, false);
assert.equal(model.penaltyShotActiveLeakageCount, 0);
assert.ok(model.trailingTeamResponseAudit.trailingTeamResponseWindowCount > 0);
assert.ok(model.trailingTeamResponseRateAfter > model.trailingTeamResponseRateBefore);
assert.ok(model.trailingTeamResponseCauseDistribution.length > 0);
assert.ok(model.lateGamePressureAudit.lateGameWindowCount >= 50);
assert.ok(model.longitudinalWindowCount >= 3);
assert.ok(model.dominantTeamOpportunityChainMaxAfter <= 4);
assert.equal(model.chainMetricConsistencyAfter, true);
assert.ok(doc.includes("# Full-Match Trailing Team Response & Late Game Pressure 6U"));
assert.ok(doc.includes("Trailing Team Response Audit"));
assert.ok(doc.includes("Late Game Pressure Audit"));
assert.ok(doc.includes("noRubberBandingConfirmed") || doc.includes("rubberBandingApplied: false"));
assert.ok(validation.includes("Status:"));
assert.ok(validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"));

console.log("PASS fullMatchTrailingTeamResponseLateGamePressure");
