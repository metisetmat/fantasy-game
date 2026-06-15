import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  coachProductReportCannotDriveSelection,
  coachProductReportCannotMutateOfficialState,
} from "./coachProductReportView";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(report);

  assertTest(coachProductReportCannotDriveSelection(model), "product report cannot drive selection.");
  assertTest(coachProductReportCannotMutateOfficialState(model), "product report cannot mutate official state.");
  assertTest(!model.canChangeLineup, "product report cannot change lineup.");
  assertTest(!model.canChangeStarters, "product report cannot change starters.");
  assertTest(!model.canChangeBench, "product report cannot change bench.");
  assertTest(!model.canDriveCoachInstruction, "product report cannot drive coach instruction.");
  assertTest(!model.canDriveLiveSelection, "product report cannot drive live selection.");
  assertTest(!model.canDriveProductionRouteResolution, "product report cannot drive production route resolution.");
  assertTest(!model.canMutateTimeline, "product report cannot mutate official timeline.");
  assertTest(!model.canMutateScore, "product report cannot mutate official score.");
  assertTest(!model.canMutatePossession, "product report cannot mutate official possession.");
  assertTest(!model.canCreateScoringEvent, "product report cannot create production scoring events.");
  assertTest(!model.canClaimGlobalEconomy, "product report cannot claim global economy.");
  assertTest(model.confidenceUpgradeCount === 0, "product report cannot upgrade confidence.");

  return [
    "product report cannot change lineup, starters, or bench",
    "product report cannot drive coach instruction, live selection, or production route resolution",
    "product report cannot mutate timeline, score, possession, or scoring events",
    "product report cannot claim global economy",
    "product report cannot upgrade confidence",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportGuard();

  console.log("coachProductReportGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
