import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachProductReportPolish } from "./buildCoachProductReportPolish";
import {
  coachProductReportPolishCannotDriveSelection,
  coachProductReportPolishCannotMutateOfficialState,
} from "./coachProductReportPolish";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportPolishGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const polish = buildCoachProductReportPolish({
    productReportView: buildCoachProductReportViewFromMatchReport(report),
  });

  assertTest(!polish.canChangeLineup, "polish layer cannot change lineup.");
  assertTest(!polish.canChangeStarters, "polish layer cannot change starters.");
  assertTest(!polish.canChangeBench, "polish layer cannot change bench.");
  assertTest(!polish.canDriveCoachInstruction, "polish layer cannot drive coach instruction.");
  assertTest(!polish.canDriveLiveSelection, "polish layer cannot drive live selection.");
  assertTest(!polish.canDriveProductionRouteResolution, "polish layer cannot drive production route resolution.");
  assertTest(!polish.canMutateTimeline, "polish layer cannot mutate official timeline.");
  assertTest(!polish.canMutateScore, "polish layer cannot mutate official score.");
  assertTest(!polish.canMutatePossession, "polish layer cannot mutate official possession.");
  assertTest(!polish.canCreateScoringEvent, "polish layer cannot create production scoring events.");
  assertTest(!polish.canClaimGlobalEconomy, "polish layer cannot claim global economy.");
  assertTest(polish.confidenceUpgradeCount === 0, "polish layer cannot upgrade confidence.");
  assertTest(coachProductReportPolishCannotMutateOfficialState(polish), "official state mutation guard must pass.");
  assertTest(coachProductReportPolishCannotDriveSelection(polish), "selection driver guard must pass.");

  return [
    "polish layer cannot change lineup, starters, or bench",
    "polish layer cannot drive coach instruction, live selection, or production route resolution",
    "polish layer cannot mutate official timeline, score, possession, or scoring events",
    "polish layer cannot claim global economy",
    "polish layer cannot upgrade confidence",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolishGuard();

  console.log("coachProductReportPolishGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
