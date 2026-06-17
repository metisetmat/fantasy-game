import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportPhaseVisualReadability } from "./buildCoachReportPhaseVisualReadability";
import { buildCoachReportPhaseVisuals } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  coachReportPhaseVisualReadabilityCannotDriveSelection,
  coachReportPhaseVisualReadabilityCannotMutateOfficialState,
} from "./coachReportPhaseVisualReadability";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportPhaseVisualReadabilityGuard(): readonly string[] {
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

  assertTest(coachReportPhaseVisualReadabilityCannotDriveSelection(readability), "readability cannot drive selection.");
  assertTest(coachReportPhaseVisualReadabilityCannotMutateOfficialState(readability), "readability cannot mutate official state.");
  assertTest(!readability.canChangeLineup, "readability cannot change lineup.");
  assertTest(!readability.canChangeStarters, "readability cannot change starters.");
  assertTest(!readability.canChangeBench, "readability cannot change bench.");
  assertTest(!readability.canDriveCoachInstruction, "readability cannot drive coach instruction.");
  assertTest(!readability.canDriveLiveSelection, "readability cannot drive live selection.");
  assertTest(!readability.canDriveProductionRouteResolution, "readability cannot drive production route resolution.");
  assertTest(!readability.canMutateTimeline, "readability cannot mutate official timeline.");
  assertTest(!readability.canMutateScore, "readability cannot mutate official score.");
  assertTest(!readability.canMutatePossession, "readability cannot mutate official possession.");
  assertTest(!readability.canCreateScoringEvent, "readability cannot create production scoring events.");
  assertTest(!readability.canClaimGlobalEconomy, "readability cannot claim global economy.");
  assertTest(readability.confidenceUpgradeCount === 0, "readability cannot upgrade confidence.");
  assertTest(readability.playerSelectedCount === 0, "readability cannot select a player.");

  return [
    "readability layer cannot change lineup",
    "cannot change starters",
    "cannot change bench",
    "cannot drive coach instruction",
    "cannot drive live selection",
    "cannot drive production route resolution",
    "cannot mutate official timeline",
    "cannot mutate official score",
    "cannot mutate official possession",
    "cannot create production scoring events",
    "cannot claim global economy",
    "cannot upgrade confidence",
    "cannot select a player",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportPhaseVisualReadabilityGuard();

  console.log("coachReportPhaseVisualReadabilityGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
