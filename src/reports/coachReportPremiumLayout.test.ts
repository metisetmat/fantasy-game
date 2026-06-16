import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPremiumLayout(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));
  const exportSnapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });
  const exportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtml,
  });
  const layout = buildCoachReportPremiumLayout({
    exportSnapshot,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
  });

  assertTest(layout.status === "available", "premium layout status must be available.");
  assertTest(layout.htmlFirst, "html first must be true.");
  assertTest(layout.pdfOptional, "pdf optional must be true.");
  assertTest(layout.singleSourceOfTruth, "single source of truth must be true.");
  assertTest(!layout.duplicateReportLogic, "duplicate report logic must be false.");
  assertTest(layout.coverPresent, "cover must be present.");
  assertTest(layout.executiveSummaryPresent, "executive summary must be present.");
  assertTest(layout.keyStatisticsPresent, "key statistics must be present.");
  assertTest(layout.withBallSectionPresent, "with-ball section must be present.");
  assertTest(layout.withoutBallSectionPresent, "without-ball section must be present.");
  assertTest(layout.goalkeeperSectionPresent, "goalkeeper section must be present.");
  assertTest(layout.profilesAndPlayersSectionPresent, "profiles and players section must be present.");
  assertTest(layout.appendicesPresent, "appendices must be present.");

  return [
    "premium layout model exists",
    "status is available",
    "html first is true",
    "pdf optional is true",
    "single source of truth is true",
    "duplicate report logic is false",
    "cover is present",
    "executive summary is present",
    "key statistics section is present",
    "with-ball section is present",
    "without-ball section is present",
    "goalkeeper section is present",
    "profiles and players section is present",
    "appendices are present",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPremiumLayout();

  console.log("coachReportPremiumLayout tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
