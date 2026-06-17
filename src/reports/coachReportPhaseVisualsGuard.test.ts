import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportPhaseVisuals } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  coachReportPhaseVisualsCannotDriveSelection,
  coachReportPhaseVisualsCannotMutateOfficialState,
} from "./coachReportPhaseVisuals";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualsGuard(): readonly string[] {
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

  assertTest(coachReportPhaseVisualsCannotDriveSelection(phaseVisuals), "phase visuals cannot drive selection.");
  assertTest(coachReportPhaseVisualsCannotMutateOfficialState(phaseVisuals), "phase visuals cannot mutate official state.");
  assertTest(!phaseVisuals.canChangeLineup, "phase visuals cannot change lineup.");
  assertTest(!phaseVisuals.canDriveLiveSelection, "phase visuals cannot drive live selection.");
  assertTest(!phaseVisuals.canMutateScore, "phase visuals cannot mutate official score.");
  assertTest(phaseVisuals.playerSelectedCount === 0, "phase visuals cannot select a player.");
  assertTest(phaseVisuals.inventedStatisticCount === 0, "phase visuals cannot invent statistics.");

  return [
    "phase visuals cannot change lineup or drive live selection",
    "phase visuals cannot mutate official state",
    "phase visuals cannot select a player",
    "phase visuals cannot invent statistics",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualsGuard();

  console.log("coachReportPhaseVisualsGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
