import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function numberFromTag(tags: readonly string[], prefix: string): number {
  const tag = tags.find((candidate) => candidate.startsWith(prefix));

  return tag === undefined ? 0 : Number.parseInt(tag.slice(prefix.length), 10);
}

export function validateMatchTraceGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE"
  );
  const tags = fact?.internalTags ?? [];

  assertTest(fact !== undefined, "trace spine evidence fact must exist.");
  assertTest(tags.includes("match_trace_score_mutation_count_0"), "traces cannot mutate official score.");
  assertTest(tags.includes("match_trace_possession_mutation_count_0"), "traces cannot mutate official possession.");
  assertTest(tags.includes("match_trace_production_scoring_event_creation_count_0"), "traces cannot create production scoring events.");
  assertTest(tags.includes("match_trace_live_selection_driver_count_0"), "traces cannot drive live selection.");
  assertTest(tags.includes("match_trace_production_route_resolution_driver_count_0"), "traces cannot drive production route resolution.");
  assertTest(tags.includes("match_trace_global_economy_claim_forbidden"), "traces cannot claim global economy.");
  assertTest(numberFromTag(tags, "match_trace_official_truth_true_count_") > 0, "official truth trace count must be positive.");
  assertTest(numberFromTag(tags, "match_trace_official_truth_false_count_") > 0, "non-official trace count must be positive.");

  return [
    "traces cannot mutate official timeline, score, possession, or scoring events",
    "traces cannot create production scoring events",
    "traces cannot claim global economy",
    "traces cannot drive live selection or production route resolution",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceGuard();

  console.log("matchTraceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
