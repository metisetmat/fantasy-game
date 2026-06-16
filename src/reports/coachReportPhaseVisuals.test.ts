import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportPhaseVisuals, deriveCoachReportPhasePanels } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisuals(): readonly string[] {
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
  const panels = deriveCoachReportPhasePanels({ productReportHtml: productHtml });

  assertTest(phaseVisuals.status === "available", "phase visuals status must be available.");
  assertTest(phaseVisuals.panelCount === 3, "phase visuals must expose three panels.");
  assertTest(phaseVisuals.withBallPanelAvailable, "with-ball panel must be available.");
  assertTest(phaseVisuals.withoutBallPanelAvailable, "without-ball panel must be available.");
  assertTest(phaseVisuals.goalkeeperPanelAvailable, "goalkeeper panel must be available.");
  assertTest(panels.length === 3, "derived phase panels must expose three panels.");
  assertTest(phaseVisuals.pitchSvgCount >= 2, "at least two phase panels must expose pitch SVGs.");
  assertTest(phaseVisuals.zoneSignalCount >= 2, "phase visuals must expose zone signals.");

  return [
    "phase visuals model exists",
    "status is available",
    "three panels are exposed",
    "with-ball panel is available",
    "without-ball panel is available",
    "goalkeeper panel is available",
    "at least two panels expose pitch SVGs",
    "zone signals are present",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisuals();

  console.log("coachReportPhaseVisuals tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
