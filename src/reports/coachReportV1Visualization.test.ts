import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportV1Visualization(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION"
  );

  assertTest(fact !== undefined, "Coach Report V1 visualization evidence fact must exist in experimental mode.");
  if (fact === undefined) {
    return [];
  }

  assertTest(fact.internalTags.includes("coach_report_v1_visualization"), "V1 visualization tag must be present.");
  assertTest(fact.internalTags.includes("coach_report_v1_visualization_status_available"), "V1 visualization must be available.");
  assertTest(fact.internalTags.includes("coach_report_v1_origin_coach_report_trace_v0"), "V1 visualization must originate from Coach Report Trace V0.");
  assertTest(fact.internalTags.includes("coach_report_v1_uses_official_aggregates"), "V1 visualization must use official aggregates.");
  assertTest(fact.internalTags.includes("coach_report_v1_diagnostic_cards_count_0"), "V1 visualization must not create diagnostic visible cards.");
  assertTest(fact.internalTags.includes("coach_report_v1_sandbox_cards_count_0"), "V1 visualization must not create sandbox visible cards.");

  return [
    "Coach Report V1 visualization evidence fact exists",
    "V1 visualization status is available",
    "V1 originates from Coach Report Trace V0",
    "V1 uses official aggregates",
    "diagnostic and sandbox visible card counts remain zero",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1Visualization();

  console.log("coachReportV1Visualization tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
