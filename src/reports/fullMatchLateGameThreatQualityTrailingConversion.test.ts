import assert from "node:assert/strict";
import {
  buildFullMatchLateGameThreatQualityTrailingConversionModel,
  renderFullMatchLateGameThreatQualityTrailingConversion6VDoc,
  renderFullMatchLateGameThreatQualityTrailingConversion6VValidation,
} from "./fullMatchLateGameThreatQualityTrailingConversion";

const model = buildFullMatchLateGameThreatQualityTrailingConversionModel();
const doc = renderFullMatchLateGameThreatQualityTrailingConversion6VDoc(model);
const validation = renderFullMatchLateGameThreatQualityTrailingConversion6VValidation(model);

assert.equal(model.scope, "FULL_MATCH_LATE_GAME_THREAT_QUALITY_TRAILING_CONVERSION");
assert.equal(model.version, "LATE_GAME_THREAT_QUALITY_6V");
assert.equal(model.baselineVersion, "TRAILING_TEAM_RESPONSE_6U");
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
assert.ok(model.trailingThreatQualityAudit.trailingThreatWindowCount > 0);
assert.ok(model.trailingThreatQualityAudit.trailingThreatQualityDistribution.length > 0);
assert.ok(model.lateGameThreatQualityAudit.lateGameWindowCount > 0);
assert.ok(doc.includes("# Full-Match Late Game Threat Quality & Trailing Conversion 6V"));
assert.ok(doc.includes("Trailing Threat Quality Audit"));
assert.ok(doc.includes("Natural Trailing Conversion Audit"));
assert.ok(doc.includes("Late Game Threat Quality Audit"));
assert.ok(validation.includes("Status:"));
assert.ok(validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"));

console.log("PASS fullMatchLateGameThreatQualityTrailingConversion");
