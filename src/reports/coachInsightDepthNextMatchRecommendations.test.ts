import assert from "node:assert/strict";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildProductBaselineCoachReportReadinessModel } from "./productBaselineCoachReportReadiness";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  buildCoachInsightDepthNextMatchRecommendationsModel,
  renderCoachInsightDepthNextMatchRecommendations7BDoc,
  renderCoachInsightDepthNextMatchRecommendations7BValidation,
} from "./coachInsightDepthNextMatchRecommendations";

const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
  routeSelectionMode: "workbench_chain_replay_experimental",
});
const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
const productHtml = renderCoachProductReport(productReport);
const exportHtml = renderCoachReportExportHtml({ productReportHtml: productHtml });
const baseline7A = buildProductBaselineCoachReportReadinessModel({
  productReport,
  productReportHtml: productHtml,
  exportReportHtml: exportHtml,
});
const model = buildCoachInsightDepthNextMatchRecommendationsModel({
  productReport,
  productReportHtml: productHtml,
  exportReportHtml: exportHtml,
  baseline7A,
});
const doc = renderCoachInsightDepthNextMatchRecommendations7BDoc(model);
const validation = renderCoachInsightDepthNextMatchRecommendations7BValidation(model);

assert.equal(model.scope, "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS");
assert.equal(model.version, "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_7B");
assert.equal(model.baselineVersion, "PRODUCT_BASELINE_COACH_REPORT_READINESS_7A");
assert.equal(model.matchEconomyBaselinePreserved, true);
assert.equal(model.productReportReady, true);
assert.equal(model.coachExportReady, true);
assert.equal(model.sourceOfTruthSeparationPreserved, true);
assert.equal(model.insightDepthReady, true);
assert.equal(model.causalExplanationReady, true);
assert.equal(model.nextMatchRecommendationsReady, true);
assert.equal(model.coachLanguageReady, true);
assert.equal(model.productBaselineReady, true);
assert.equal(model.deepInsightCount >= 3, true);
assert.equal(model.shallowInsightCount, 0);
assert.equal(model.unsupportedCausalClaimCount, 0);
assert.equal(model.unsupportedRecommendationCount, 0);
assert.equal(model.forcedSelectionRecommendationCount, 0);
assert.equal(model.profileObservationForcedCount, 0);
assert.equal(model.sandboxTruthLeakageCount, 0);
assert.equal(model.diagnosticTruthLeakageCount, 0);
assert.equal(model.batchScoreLeakageCount, 0);
assert.equal(model.forbiddenWordingCount, 0);
assert.equal(model.guardrailsPreserved, true);
assert.equal(model.noPenaltyLeak, true);
assert.equal(model.noUnknownScoringFamily, true);
assert.equal(model.noPersistenceSqliteScoring, true);
assert.equal(model.scoreConstantsUnchanged, true);
assert.equal(model.matchBonusEventUnchanged, true);
assert.equal(model.status, "PASS");
assert.ok(productHtml.includes("Insights coach approfondis"));
assert.ok(productHtml.includes("Plan prochain match"));
assert.ok(exportHtml.includes("Insights coach approfondis"));
assert.ok(exportHtml.includes("Plan prochain match"));
assert.ok(doc.includes("# Coach Insight Depth & Next-Match Recommendations 7B"));
assert.ok(doc.includes("Insight Depth Audit"));
assert.ok(doc.includes("Next-Match Recommendations"));
assert.ok(doc.includes("Causality / Evidence Audit"));
assert.ok(doc.includes("Coach Language Audit"));
assert.ok(validation.includes("Status: PASS"));
assert.ok(validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"));

console.log("PASS coachInsightDepthNextMatchRecommendations");
