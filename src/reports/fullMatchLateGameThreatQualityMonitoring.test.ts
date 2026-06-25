import assert from "node:assert/strict";
import {
  buildFullMatchLateGameThreatQualityMonitoringModel,
  renderFullMatchLateGameThreatQualityMonitoring6WDoc,
  renderFullMatchLateGameThreatQualityMonitoring6WValidation,
} from "./fullMatchLateGameThreatQualityMonitoring";

const model = buildFullMatchLateGameThreatQualityMonitoringModel();
const doc = renderFullMatchLateGameThreatQualityMonitoring6WDoc(model);
const validation = renderFullMatchLateGameThreatQualityMonitoring6WValidation(model);

assert.equal(model.scope, "FULL_MATCH_LATE_GAME_THREAT_QUALITY_MONITORING");
assert.equal(model.version, "LATE_GAME_THREAT_MONITORING_6W");
assert.equal(model.baselineVersion, "LATE_GAME_THREAT_QUALITY_6V");
assert.equal(model.matchCount, 50);
assert.equal(model.scoreFromScoreChangeAllRuns, true);
assert.equal(model.scoringConstantsChanged, false);
assert.equal(model.scoreCapApplied, false);
assert.equal(model.postHocRewriteApplied, false);
assert.equal(model.scoringEventsDeleted, false);
assert.equal(model.forcedTrailingTeamScoreApplied, false);
assert.equal(model.trailingTeamOpportunityForced, false);
assert.equal(model.trailingTeamScoreChangeInjected, false);
assert.equal(model.trailingTeamScoringEventInjected, false);
assert.equal(model.rubberBandingApplied, false);
assert.equal(model.comebackForced, false);
assert.equal(model.penaltyShotActiveLeakageCount, 0);
assert.ok(model.lateGameThreatAutomaticityAudit.lateGameWindowCount > 0);
assert.ok(model.forcedComebackSuspicionAudit.forcedComebackSuspicionCount >= 0);
assert.ok(model.naturalTrailingConversionPathAudit.naturalTrailingScoringEventCount >= 0);
assert.ok(model.longitudinalWindowCount >= 3);
assert.ok(doc.includes("# Full-Match Late Game Threat Quality Monitoring 6W"));
assert.ok(doc.includes("Late Game Threat Automaticity"));
assert.ok(doc.includes("Forced Comeback Suspicion"));
assert.ok(doc.includes("Natural Trailing Conversion Path"));
assert.ok(validation.includes("Status:"));
assert.ok(validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"));

console.log("PASS fullMatchLateGameThreatQualityMonitoring");
