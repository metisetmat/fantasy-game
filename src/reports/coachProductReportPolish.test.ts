import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachProductReportPolish } from "./buildCoachProductReportPolish";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportPolish(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const view = buildCoachProductReportViewFromMatchReport(report);
  const polish = buildCoachProductReportPolish({ productReportView: view });

  assertTest(polish.status === "available", "polish status must be available.");
  assertTest(polish.productReportFileGenerated, "product report file must be generated.");
  assertTest(polish.productReportReviewReady, "product report review-ready flag must be true.");
  assertTest(polish.headerPolished, "headerPolished must be true.");
  assertTest(polish.executiveSummaryCompact, "executiveSummaryCompact must be true.");
  assertTest(polish.keySignalsReadable, "keySignalsReadable must be true.");
  assertTest(polish.profileCardsReadable, "profileCardsReadable must be true.");
  assertTest(polish.nextMatchSignalsReadable, "nextMatchSignalsReadable must be true.");
  assertTest(polish.appendicesLessIntrusive, "appendicesLessIntrusive must be true.");
  assertTest(polish.printFriendly, "printFriendly must be true.");
  assertTest(polish.profileAppliedCount === 0, "profile applied count must be 0.");
  assertTest(polish.officiallyConfirmedCount === 0, "officially confirmed count must be 0.");
  assertTest(polish.confidenceUpgradeCount === 0, "confidence upgrade count must be 0.");

  return [
    "polish model exists",
    "polish status is available",
    "product report file is generated",
    "product report review-ready flag is true",
    "header, summary, signals, profiles, next-match signals, appendices, and print CSS are review-ready",
    "profile applied, officially confirmed, and confidence upgrade counts are 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportPolish();

  console.log("coachProductReportPolish tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
