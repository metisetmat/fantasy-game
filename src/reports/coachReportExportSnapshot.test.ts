import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportExportSnapshot(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));
  const snapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });

  assertTest(snapshot.status === "available", "export snapshot status must be available.");
  assertTest(snapshot.productHtmlGenerated, "product HTML generated must be true.");
  assertTest(snapshot.exportHtmlGenerated, "export HTML generated must be true.");
  assertTest(snapshot.exportFormat === "print_ready_html" || snapshot.exportFormat === "both", "export format must be print_ready_html or both.");
  assertTest(snapshot.contentSourceSingleTruth, "single source of truth must be true.");
  assertTest(!snapshot.duplicatesReportLogic, "duplicated report logic must be false.");
  assertTest(snapshot.sectionCountMatchesProduct, "section count must match product report.");
  assertTest(snapshot.scoreMatchesProduct, "score must match product report.");
  assertTest(snapshot.candidateComparisonMatchesProduct, "candidate comparison must match product report.");
  assertTest(snapshot.noAutomaticSelection, "no automatic selection must remain true.");
  assertTest(snapshot.playerSelectedCount === 0, "player selected count must remain zero.");

  return [
    "export snapshot model exists",
    "status is available",
    "product HTML generated is true",
    "export HTML generated is true",
    "export format is print_ready_html",
    "single source of truth is true",
    "duplicated report logic is false",
    "section count matches product",
    "score matches product",
    "candidate comparison matches product",
    "no automatic selection is true",
    "no player is selected",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportExportSnapshot();

  console.log("coachReportExportSnapshot tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
