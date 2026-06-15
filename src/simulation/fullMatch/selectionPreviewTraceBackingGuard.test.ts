import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectionPreviewTraceBackingGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING"
  );

  assertTest(fact !== undefined, "trace backing evidence fact must exist.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_can_change_lineup_false"), "trace backing cannot change lineup.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_can_drive_live_selection_false"), "trace backing cannot drive live selection.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_can_drive_production_route_resolution_false"), "trace backing cannot drive production route resolution.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_score_mutation_count_0"), "trace backing cannot mutate score.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_possession_mutation_count_0"), "trace backing cannot mutate possession.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_production_scoring_event_creation_count_0"), "trace backing cannot create scoring events.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_global_economy_claim_forbidden"), "trace backing cannot claim global economy.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_confidence_not_upgraded"), "trace backing cannot upgrade confidence.");

  return [
    "trace backing cannot change lineup",
    "trace backing cannot drive coach instruction, live selection, or production route resolution",
    "trace backing cannot mutate official state or scoring events",
    "trace backing cannot claim global economy",
    "trace backing cannot upgrade confidence",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewTraceBackingGuard();

  console.log("selectionPreviewTraceBackingGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
