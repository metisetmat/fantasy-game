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

export function validateCoachReportPremiumSourceGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));
  const exportSnapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });
  const exportHtml = renderCoachReportExportHtml({ productReportHtml: productHtml });
  const layout = buildCoachReportPremiumLayout({
    exportSnapshot,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
  });

  assertTest(layout.origin === "coach_report_export_snapshot", "premium layout must originate from export snapshot.");
  assertTest(layout.singleSourceOfTruth, "premium layout must keep single source of truth.");
  assertTest(!layout.duplicateReportLogic, "premium layout must not duplicate report logic.");
  assertTest(layout.productExportScoreMatches, "premium layout must preserve product/export score match.");
  assertTest(layout.productExportCandidateComparisonMatches, "premium layout must preserve candidate comparison match.");
  assertTest(layout.interpretationGuardMatchesProduct, "premium layout must keep interpretation guard visible.");
  assertTest(exportHtml.includes("Ce rapport export&eacute; reprend la lecture du rapport produit. Il ne cr&eacute;e pas une seconde source de v&eacute;rit&eacute;."), "export source-of-truth guard must remain visible.");

  return [
    "premium layout uses product/export source",
    "premium layout does not create a separate report model with different facts",
    "product/export score matches",
    "candidate comparison matches",
    "interpretation guard remains visible",
    "export source-of-truth guard remains visible",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPremiumSourceGuard();

  console.log("coachReportPremiumSourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
