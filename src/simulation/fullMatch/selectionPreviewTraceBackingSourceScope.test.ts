import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectionPreviewTraceBackingSourceScope(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING"
  );

  assertTest(fact !== undefined, "trace backing evidence fact must exist.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_official_aggregates_support_only"), "official aggregates must be support only.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_diagnostic_kept_separate"), "diagnostic aggregates must remain separate.");
  assertTest(fact.internalTags.includes("selection_preview_trace_backing_sandbox_kept_separate"), "sandbox aggregates must remain separate.");
  assertTest(!fact.internalTags.includes("selection_preview_trace_backing_officially_confirmed_count_1"), "official confirmation must not be used.");

  return [
    "official aggregates can support status",
    "diagnostic aggregates remain separate",
    "sandbox aggregates remain separate",
    "sandbox and diagnostic cannot become official truth",
    "official aggregates are support only",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewTraceBackingSourceScope();

  console.log("selectionPreviewTraceBackingSourceScope tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
