import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportMultiMatchHistoryView } from "./buildCoachReportMultiMatchHistoryView";
import { buildCoachReportMultiMatchPhaseComparison } from "./buildCoachReportMultiMatchPhaseComparison";
import { buildCoachReportMultiMatchPhaseComparisonSamples } from "./buildCoachReportMultiMatchPhaseComparisonSamples";
import { buildCoachReportPhaseVisualReadability } from "./buildCoachReportPhaseVisualReadability";
import { buildCoachReportPhaseVisuals } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import type { CoachReportMultiMatchPhaseComparisonModel } from "./coachReportMultiMatchPhaseComparison";
import type { CoachReportMultiMatchHistoryViewModel } from "./coachReportMultiMatchHistoryView";
import type { CoachReportPhaseVisualReadabilityModel } from "./coachReportPhaseVisualReadability";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

export interface CoachReportMultiMatchPhaseComparisonTestContext {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly phaseReadability: CoachReportPhaseVisualReadabilityModel;
  readonly comparison: CoachReportMultiMatchPhaseComparisonModel;
  readonly historyView: CoachReportMultiMatchHistoryViewModel;
}

export function buildCoachReportMultiMatchPhaseComparisonTestContext(): CoachReportMultiMatchPhaseComparisonTestContext {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
    enableCoachReportMultiMatchPhaseComparison: true,
  });
  const productView = buildCoachProductReportViewFromMatchReport(report);
  const productHtml = renderCoachProductReport(productView);
  const exportSnapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });
  const baselineExportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtml,
  });
  const premiumLayout = buildCoachReportPremiumLayout({
    exportSnapshot,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const phaseVisuals = buildCoachReportPhaseVisuals({
    premiumLayout,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const phaseReadability = buildCoachReportPhaseVisualReadability({
    phaseVisuals,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const comparison = buildCoachReportMultiMatchPhaseComparison({
    phaseReadability,
    comparisonSamples: buildCoachReportMultiMatchPhaseComparisonSamples(),
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const historyView = buildCoachReportMultiMatchHistoryView({
    multiMatchComparison: comparison,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const exportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtml,
    phaseReadability,
    multiMatchPhaseComparison: comparison,
    multiMatchHistoryView: historyView,
  });

  return {
    productHtml,
    exportHtml,
    phaseReadability,
    comparison,
    historyView,
  };
}
