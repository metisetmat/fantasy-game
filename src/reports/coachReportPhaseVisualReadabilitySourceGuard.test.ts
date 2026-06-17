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

export function validateCoachReportPhaseVisualReadabilitySourceGuard(): readonly string[] {
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

  assertTest(readability.origin === "coach_report_phase_visuals", "readability layer must use phase visuals only.");
  assertTest(readability.singleSourceOfTruth, "readability layer must not create a second source of truth.");
  assertTest(readability.sandboxEventsPromotedToOfficialCount === 0, "sandbox-only events must not be promoted to official.");
  assertTest(readability.inventedStatisticCount === 0, "invented statistic count must remain zero.");
  assertTest(readability.productExportScoreMatches, "product/export score must match.");
  assertTest(readability.productExportCandidateComparisonMatches, "candidate comparison must match.");
  assertTest(readability.interpretationGuardMatchesProduct, "interpretation guard must remain visible.");

  return [
    "readability layer uses phase visuals only",
    "no second source of truth is created",
    "sandbox-only events are not promoted to official",
    "invented statistic count is 0",
    "product/export score matches",
    "candidate comparison matches",
    "interpretation guard remains visible",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualReadabilitySourceGuard();

  console.log("coachReportPhaseVisualReadabilitySourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
