import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  coachReportPremiumLayoutCannotDriveSelection,
  coachReportPremiumLayoutCannotMutateOfficialState,
} from "./coachReportPremiumLayout";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPremiumGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));
  const exportSnapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });
  const layout = buildCoachReportPremiumLayout({
    exportSnapshot,
    productReportHtml: productHtml,
    exportReportHtml: renderCoachReportExportHtml({ productReportHtml: productHtml }),
  });

  assertTest(coachReportPremiumLayoutCannotDriveSelection(layout), "premium layout cannot drive selection.");
  assertTest(coachReportPremiumLayoutCannotMutateOfficialState(layout), "premium layout cannot mutate official state.");
  assertTest(!layout.canChangeLineup, "premium layout cannot change lineup.");
  assertTest(!layout.canChangeStarters, "premium layout cannot change starters.");
  assertTest(!layout.canChangeBench, "premium layout cannot change bench.");
  assertTest(!layout.canDriveCoachInstruction, "premium layout cannot drive coach instruction.");
  assertTest(!layout.canDriveLiveSelection, "premium layout cannot drive live selection.");
  assertTest(!layout.canDriveProductionRouteResolution, "premium layout cannot drive production route resolution.");
  assertTest(!layout.canMutateTimeline, "premium layout cannot mutate official timeline.");
  assertTest(!layout.canMutateScore, "premium layout cannot mutate official score.");
  assertTest(!layout.canMutatePossession, "premium layout cannot mutate official possession.");
  assertTest(!layout.canCreateScoringEvent, "premium layout cannot create production scoring events.");
  assertTest(!layout.canClaimGlobalEconomy, "premium layout cannot claim global economy.");
  assertTest(layout.confidenceUpgradeCount === 0, "premium layout cannot upgrade confidence.");
  assertTest(layout.playerSelectedCount === 0, "premium layout cannot select a player.");

  return [
    "premium layout cannot change lineup, starters, or bench",
    "premium layout cannot drive coach instruction, live selection, or production route resolution",
    "premium layout cannot mutate official timeline, score, possession, or scoring events",
    "premium layout cannot claim global economy",
    "premium layout cannot upgrade confidence",
    "premium layout cannot select a player",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPremiumGuard();

  console.log("coachReportPremiumGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
