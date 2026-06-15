import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachProductReportView(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const model = buildCoachProductReportViewFromMatchReport(report);

  assertTest(model.status === "available", "product report model must be available.");
  assertTest(model.sectionCount === 7, "section count must be 7.");
  assertTest(model.keyCoachSignals.length === 3, "key signal count must be 3.");
  assertTest(model.profilesToObserve.length === 3, "profile card count must be 3.");
  assertTest(model.nextMatchSignals.length > 0, "next-match signals must exist.");
  assertTest(model.appendices.length > 0, "appendices must exist.");
  assertTest(model.appendices.every((appendix) => appendix.defaultCollapsed), "appendices must be collapsed by default.");
  assertTest(model.scoreSourceNote.includes("rapport full-match"), "score source note must exist.");
  assertTest(model.profileAppliedCount === 0, "profile applied count must be 0.");
  assertTest(model.officiallyConfirmedCount === 0, "officially confirmed count must be 0.");
  assertTest(model.confidenceUpgradeCount === 0, "confidence upgrade count must be 0.");

  return [
    "product report model exists",
    "status is available when V1 and profile view evidence are available",
    "section count is 7",
    "key signal count is 3",
    "profile card count is 3",
    "next-match signals exist",
    "appendices exist and are collapsed",
    "score source note exists",
    "profile cards remain non-applied",
    "officially confirmed and confidence upgrade counts are 0",
  ];
}

if (require.main === module) {
  const checks = validateCoachProductReportView();

  console.log("coachProductReportView tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
