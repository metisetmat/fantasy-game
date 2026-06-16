import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import {
  coachReportExportSnapshotCannotDriveSelection,
  coachReportExportSnapshotCannotMutateOfficialState,
} from "./coachReportExportSnapshot";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportExportGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(report));
  const snapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });

  assertTest(coachReportExportSnapshotCannotDriveSelection(snapshot), "export layer cannot drive selection.");
  assertTest(coachReportExportSnapshotCannotMutateOfficialState(snapshot), "export layer cannot mutate official state.");
  assertTest(!snapshot.canChangeLineup, "export layer cannot change lineup.");
  assertTest(!snapshot.canChangeStarters, "export layer cannot change starters.");
  assertTest(!snapshot.canChangeBench, "export layer cannot change bench.");
  assertTest(!snapshot.canDriveCoachInstruction, "export layer cannot drive coach instruction.");
  assertTest(!snapshot.canDriveLiveSelection, "export layer cannot drive live selection.");
  assertTest(!snapshot.canDriveProductionRouteResolution, "export layer cannot drive production route resolution.");
  assertTest(!snapshot.canMutateTimeline, "export layer cannot mutate official timeline.");
  assertTest(!snapshot.canMutateScore, "export layer cannot mutate official score.");
  assertTest(!snapshot.canMutatePossession, "export layer cannot mutate official possession.");
  assertTest(!snapshot.canCreateScoringEvent, "export layer cannot create production scoring events.");
  assertTest(!snapshot.canClaimGlobalEconomy, "export layer cannot claim global economy.");
  assertTest(snapshot.confidenceUpgradeCount === 0, "export layer cannot upgrade confidence.");
  assertTest(snapshot.playerSelectedCount === 0, "export layer cannot select a player.");

  return [
    "export layer cannot change lineup, starters, or bench",
    "export layer cannot drive coach instruction, live selection, or production route resolution",
    "export layer cannot mutate official timeline, score, possession, or scoring events",
    "export layer cannot claim global economy",
    "export layer cannot upgrade confidence",
    "export layer cannot select a player",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportExportGuard();

  console.log("coachReportExportGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
