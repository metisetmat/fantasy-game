import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoringEventCount(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline.filter((event) => event.eventType === "scoring").length;
}

function scoreChangeTotal(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function scoreSignature(report: ReturnType<typeof runFullMatch>): string {
  return `${report.score.home}-${report.score.away}:${scoringEventCount(report)}:${scoreChangeTotal(report)}`;
}

export function validateRunFullMatchExperimentalChainConsumption(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const chainFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.internalTags.includes("workbench_chain_consumption"),
  );

  assertTest(defaultReport.reportMeta.limitations.includes("Full-match route selection mode: segment_harness."), "default runFullMatch must remain segment_harness.");
  assertTest(defaultReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_CONSUMPTION_DISABLED_BY_DEFAULT"), "default runFullMatch must not consume chain.");
  assertTest(!defaultReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_CONSUMED_FOR_SEGMENT_1"), "default report must not consume segment-1 chain.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_CONSUMED_FOR_SEGMENT_1"), "experimental report must include chain consumption diagnostic.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_CONSUMPTION_DIAGNOSTIC_ONLY"), "experimental consumption must be diagnostic-only.");
  assertTest(chainFact !== undefined, "experimental report must include chain consumption evidence.");
  assertTest(chainFact?.summary.includes("sequence-1-multi-action-chain") ?? false, "chain evidence must include consumed chain id.");
  assertTest(chainFact?.internalTags.includes("consumed_steps_3") ?? false, "chain evidence must include consumed step count.");
  assertTest(chainFact?.internalTags.includes("visual_steps_3") ?? false, "chain evidence must include visual step count.");
  assertTest(chainFact?.internalTags.includes("spatial_steps_3") ?? false, "chain evidence must include spatial step count.");
  assertTest(scoreSignature(defaultReport) === scoreSignature(experimentalReport), "experimental full-match score signature must equal default for now.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "experimental score must derive from score_change.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match must not be claimed production chain-driven.");

  return [
    "default runFullMatch remains segment_harness",
    "default runFullMatch does not consume chain",
    "experimental runFullMatch consumes chain",
    "experimental report limitations include chain consumption diagnostics",
    "experimental report includes chain consumption evidence",
    "experimental full-match final score equals default full-match final score for now",
    "experimental full-match scoring event count equals default scoring event count",
    "experimental score_change total equals final score total",
    "normal full-match is not claimed as production chain-driven",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalChainConsumption();

  console.log("runFullMatchExperimentalChainConsumption tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
