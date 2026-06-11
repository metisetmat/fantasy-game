import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreChangeTotal(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function fullMatchScoreSignature(report: ReturnType<typeof runFullMatch>): string {
  const scoringEventCount = report.timeline.filter((event) => event.eventType === "scoring").length;

  return `${report.score.home}-${report.score.away}:${scoringEventCount}:${scoreChangeTotal(report)}:${report.timeline.length}`;
}

export function validateRunFullMatchDefaultRegression(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const explicitDefaultReport = runFullMatch(input, { routeSelectionMode: "segment_harness" });

  assertTest(fullMatchScoreSignature(defaultReport) === fullMatchScoreSignature(explicitDefaultReport), "default and explicit segment_harness signatures must match.");
  assertTest(defaultReport.reportMeta.reportScope === "FULL_MATCH_HARNESS_SINGLE_RUN", "default report scope must remain FULL_MATCH_HARNESS_SINGLE_RUN.");
  assertTest(defaultReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_CONSUMPTION_DISABLED_BY_DEFAULT"), "default report must say chain consumption is disabled by default.");
  assertTest(defaultReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS"), "default report must say normal full-match remains segment harness.");
  assertTest(!defaultReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_CONSUMED_FOR_SEGMENT_1"), "default report must not include consumed chain diagnostic.");

  return [
    "runFullMatch(input) and explicit segment_harness produce same score signature",
    "default report still contains FULL_MATCH_HARNESS_SINGLE_RUN limitations",
    "default report says chain consumption is disabled by default",
    "default report does not include FULLMATCH_CHAIN_CONSUMED_FOR_SEGMENT_1",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchDefaultRegression();

  console.log("runFullMatchDefaultRegression tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
