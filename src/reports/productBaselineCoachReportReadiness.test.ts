import assert from "node:assert/strict";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { currentFullMatchEconomyFinalStabilizationModel } from "./fullMatchMatchEconomyFinalStabilization";
import {
  buildProductBaselineCoachReportReadinessModel,
  renderProductBaselineCoachReportReadiness7ADoc,
  renderProductBaselineCoachReportReadiness7AValidation,
} from "./productBaselineCoachReportReadiness";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { auditCoachReportActionability } from "./coachReportActionabilityAudit";

const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
  routeSelectionMode: "workbench_chain_replay_experimental",
});
const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
const productHtml = renderCoachProductReport(productReport);
const exportHtml = renderCoachReportExportHtml({
  productReportHtml: productHtml,
});
const model = buildProductBaselineCoachReportReadinessModel({
  productReport,
  productReportHtml: productHtml,
  exportReportHtml: exportHtml,
  matchEconomyBaseline: currentFullMatchEconomyFinalStabilizationModel(),
});
const doc = renderProductBaselineCoachReportReadiness7ADoc(model);
const validation = renderProductBaselineCoachReportReadiness7AValidation(model);

assert.equal(model.scope, "PRODUCT_BASELINE_COACH_REPORT_READINESS");
assert.equal(model.version, "PRODUCT_BASELINE_COACH_REPORT_READINESS_7A");
assert.equal(model.baselineVersion, "MATCH_ECONOMY_FINAL_STABILIZATION_6X");
assert.equal(model.matchEconomyBaselinePreserved, true);
assert.equal(model.guardrailsPreserved, true);
assert.equal(model.routeFamilyDiversityPreserved, true);
assert.equal(model.officialScoreVisible, true);
assert.equal(model.officialScoreSourceExplained, true);
assert.equal(model.scoreChangeSourceVisible, true);
assert.equal(model.batchDiagnosticsSeparated, true);
assert.equal(model.liveScoringSampleSeparated, true);
assert.equal(model.sandboxSeparated, true);
assert.equal(model.noSandboxTruthLeakage, true);
assert.equal(model.noDiagnosticScoreLeakage, true);
assert.equal(model.noBatchScoreLeakage, true);
assert.equal(model.profileRecommendationForcedCount, 0);
assert.equal(model.forbiddenWordingCount, 0);
assert.equal(model.productBaselineReady, true);
assert.equal(model.status, "PASS");
assert.ok(doc.includes("# Product Baseline Coach Report Readiness 7A"));
assert.ok(doc.includes("Source Of Truth Audit"));
assert.ok(doc.includes("Actionability Audit"));
assert.ok(doc.includes("Clarity Audit"));
assert.ok(doc.includes("Appendix Boundary Audit"));
assert.ok(validation.includes("Status: PASS"));
assert.ok(validation.includes("npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share"));

const accentedRecommendationLeakAudit = auditCoachReportActionability({
  productReport,
  productReportHtml: [
    "<p>Ce profil reste non confirm\u00e9e comme recommandation officielle.</p>",
    "<p>Recommandation: doit s\u00e9lectionner ML au prochain match.</p>",
  ].join(""),
  exportReportHtml: "",
});
assert.equal(accentedRecommendationLeakAudit.unsupportedRecommendationCount, 1);
assert.equal(accentedRecommendationLeakAudit.selectionPreviewAsRecommendationCount, 1);

console.log("PASS productBaselineCoachReportReadiness");
