import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportPhaseVisualReadability } from "./buildCoachReportPhaseVisualReadability";
import { buildCoachReportPhaseVisuals } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualReadability(): readonly string[] {
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
  const readability = buildCoachReportPhaseVisualReadability({
    phaseVisuals,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
  });

  assertTest(readability.status === "available" || readability.status === "partial", "readability status must be available or partial.");
  assertTest(readability.htmlFirst, "readability must remain HTML-first.");
  assertTest(readability.pdfOptional, "readability must keep PDF optional.");
  assertTest(readability.singleSourceOfTruth, "readability must remain single-source-of-truth.");
  assertTest(!readability.duplicateReportLogic, "readability must not create duplicate report logic.");
  assertTest(readability.legendItemCount === 5, "readability legend must expose 5 items.");
  assertTest(readability.panelCount >= 3, "readability must expose at least 3 panels.");
  assertTest(readability.readablePanelCount >= 3, "readability must expose at least 3 readable panels.");
  assertTest(readability.primaryZoneVisualEmphasisPresent, "primary zone emphasis must be present.");
  assertTest(readability.panelsWithSecondaryZonesCount === 0 || readability.secondaryZoneVisualEmphasisPresent, "secondary zone emphasis must be present when secondary zones exist.");
  assertTest(readability.controlledEmptyStateReadable, "controlled empty states must stay readable.");
  assertTest(readability.inventedStatisticCount === 0, "readability must not invent phase statistics.");
  assertTest(readability.sandboxEventsPromotedToOfficialCount === 0, "readability must not promote sandbox events to official.");

  return [
    "readability model exists",
    "status is available or partial",
    "html first is true",
    "pdf optional is true",
    "single source of truth is true",
    "duplicate report logic is false",
    "legend has 5 items",
    "panel count is at least 3",
    "readable panel count is at least 3",
    "primary zone emphasis is present",
    "secondary zone emphasis is present when secondary zones exist",
    "controlled empty states remain allowed",
    "invented statistic count is 0",
    "sandbox events promoted to official count is 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualReadability();

  console.log("coachReportPhaseVisualReadability tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
