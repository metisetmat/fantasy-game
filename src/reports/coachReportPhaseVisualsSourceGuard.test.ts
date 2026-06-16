import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportPhaseVisuals } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  COACH_REPORT_PHASE_VISUALS_SCRIPT_ID,
  extractCoachReportPhaseVisualSeed,
} from "./coachReportPhaseVisuals";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualsSourceGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));
  const exportSnapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });
  const exportHtml = renderCoachReportExportHtml({ productReportHtml: productHtml });
  const premiumLayout = buildCoachReportPremiumLayout({
    exportSnapshot,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
  });
  const phaseVisuals = buildCoachReportPhaseVisuals({
    premiumLayout,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
  });
  const seed = extractCoachReportPhaseVisualSeed(productHtml);

  assertTest(productHtml.includes(COACH_REPORT_PHASE_VISUALS_SCRIPT_ID), "product report must carry the hidden phase-visual seed script.");
  assertTest(seed !== null, "product report must expose a readable phase-visual seed.");
  assertTest(phaseVisuals.singleSourceOfTruth, "phase visuals must remain single-source-of-truth.");
  assertTest(!phaseVisuals.duplicateReportLogic, "phase visuals must not duplicate report logic.");
  assertTest(phaseVisuals.productExportScoreMatches, "phase visuals must preserve the product/export score match.");
  assertTest(phaseVisuals.productExportCandidateComparisonMatches, "phase visuals must preserve the candidate comparison match.");

  return [
    "product report carries the hidden phase-visual seed script",
    "phase-visual seed can be parsed back from product HTML",
    "phase visuals remain single-source-of-truth",
    "phase visuals do not duplicate report logic",
    "phase visuals preserve product/export score match",
    "phase visuals preserve candidate comparison match",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualsSourceGuard();

  console.log("coachReportPhaseVisualsSourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
