import assert from "node:assert/strict";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachActionPlanCards } from "./coachActionPlanCards";
import type { CoachDeepInsight, CoachDeepInsightSourceType } from "./coachDeepInsights";
import {
  buildCoachActionPlanCardsTrainingFocusPackagingModel,
  renderCoachActionPlanCardsTrainingFocusPackaging7CDoc,
  renderCoachActionPlanCardsTrainingFocusPackaging7CValidation,
} from "./coachActionPlanCardsTrainingFocusPackaging";
import { buildCoachInsightDepthNextMatchRecommendationsModel } from "./coachInsightDepthNextMatchRecommendations";
import { currentFullMatchEconomyFinalStabilizationModel } from "./fullMatchMatchEconomyFinalStabilization";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { buildProductBaselineCoachReportReadinessModel } from "./productBaselineCoachReportReadiness";
import { renderCoachProductReport } from "./renderCoachProductReport";
import {
  renderCoachInsightDepthNextMatchRecommendationsSection,
  renderCoachReportExportHtml,
  renderProductBaselineCoachReportReadinessSection,
} from "./renderCoachReportExportHtml";

function appendProductSection(html: string, section: string): string {
  return html.includes("</main>")
    ? html.replace("</main>", `${section}\n</main>`)
    : `${html}\n${section}`;
}

function testInsight(insightId: string, sourceType: CoachDeepInsightSourceType): CoachDeepInsight {
  return {
    insightId,
    title: `Insight ${insightId}`,
    sourceType,
    confidence: "medium",
    observation: "Observation coach lisible.",
    whyItMatters: "Le signal aide a choisir une priorite prudente.",
    probableCause: "Le contexte tactique repete ce comportement.",
    tacticalConsequence: "La sequence devient plus lisible pour le coach.",
    riskIfRepeated: "Le risque doit rester surveille.",
    nextMatchCheck: "Verifier si le signal revient au prochain match.",
    trainingFocus: "Travailler la connexion entre porteur et soutien.",
    evidenceSummary: ["Signal de test avec source explicite."],
    evidenceEventIds: [`event-${insightId}`],
    affectedZones: ["Z2-C"],
    affectedPlayersOrProfiles: ["porteur"],
    coachAction: "Observer avant d'en faire une consigne.",
    tradeoff: "Le gain de securite peut reduire la vitesse.",
  };
}

const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
  routeSelectionMode: "workbench_chain_replay_experimental",
});
const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
const productReportHtml = renderCoachProductReport(productReport);
const matchEconomyBaseline = currentFullMatchEconomyFinalStabilizationModel();
const exportHtmlFor7A = renderCoachReportExportHtml({
  productReportHtml,
  fullMatchEconomyFinalStabilization: matchEconomyBaseline,
});
const baseline7A = buildProductBaselineCoachReportReadinessModel({
  productReport,
  productReportHtml,
  exportReportHtml: exportHtmlFor7A,
  matchEconomyBaseline,
});
const productHtmlWith7A = appendProductSection(
  productReportHtml,
  renderProductBaselineCoachReportReadinessSection(baseline7A),
);
const exportHtmlFor7B = renderCoachReportExportHtml({
  productReportHtml: productHtmlWith7A,
  fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  productBaselineCoachReportReadiness: baseline7A,
});
const baseline7B = buildCoachInsightDepthNextMatchRecommendationsModel({
  productReport,
  productReportHtml: productHtmlWith7A,
  exportReportHtml: exportHtmlFor7B,
  baseline7A,
  matchEconomyBaseline,
});
const productHtmlWith7B = appendProductSection(
  productHtmlWith7A,
  renderCoachInsightDepthNextMatchRecommendationsSection(baseline7B),
);
const exportHtmlFor7C = renderCoachReportExportHtml({
  productReportHtml: productHtmlWith7B,
  fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  productBaselineCoachReportReadiness: baseline7A,
  coachInsightDepthNextMatchRecommendations: baseline7B,
});
const model = buildCoachActionPlanCardsTrainingFocusPackagingModel({
  productReport,
  productReportHtml: productHtmlWith7B,
  exportReportHtml: exportHtmlFor7C,
  baseline7B,
  baseline7A,
  matchEconomyBaseline,
});
const exportHtml = renderCoachReportExportHtml({
  productReportHtml: productHtmlWith7B,
  fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  productBaselineCoachReportReadiness: baseline7A,
  coachInsightDepthNextMatchRecommendations: baseline7B,
  coachActionPlanCardsTrainingFocusPackaging: model,
});
const doc = renderCoachActionPlanCardsTrainingFocusPackaging7CDoc(model);
const validation = renderCoachActionPlanCardsTrainingFocusPackaging7CValidation(model);
const sourcePreservationCards = buildCoachActionPlanCards([
  testInsight("diagnostic-linked", "diagnostic"),
  testInsight("sandbox-linked", "sandbox"),
  testInsight("mixed-linked", "mixed"),
]);

assert.equal(model.scope, "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING");
assert.equal(model.version, "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING_7C");
assert.equal(model.baselineVersion, "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS_7B");
assert.equal(model.status, "PASS");
assert.equal(model.productBaselineReady, true);
assert.equal(model.actionPlanCardsAudit.actionPlanCardCount, 3);
assert.equal(model.actionPlanCardsAudit.primaryActionCardCount, 1);
assert.equal(model.actionPlanCardsAudit.forcedSelectionCardCount, 0);
assert.equal(model.actionPlanCardsAudit.forcedTacticalPlanCardCount, 0);
assert.equal(sourcePreservationCards[0]?.sourceType, "diagnostic");
assert.equal(sourcePreservationCards[1]?.sourceType, "sandbox");
assert.equal(sourcePreservationCards[2]?.sourceType, "mixed");
assert.equal(model.wordingPolishAudit.mechanicalPhraseCount, 0);
assert.equal(model.wordingPolishAudit.duplicatedLabelCount, 0);
assert.equal(model.wordingPolishAudit.forbiddenWordingCount, 0);
assert.match(productReportHtml, /Plan d'action coach/u);
assert.match(productReportHtml, /Focus entrainement/u);
assert.match(exportHtml, /Plan d'action coach/u);
assert.match(exportHtml, /Focus entrainement/u);
assert.match(doc, /# Coach Action Plan Cards & Training Focus Packaging 7C/u);
assert.match(validation, /Status: PASS/u);
assert.match(validation, /npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share/u);

console.log("PASS coachActionPlanCardsTrainingFocusPackaging");
