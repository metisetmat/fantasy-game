import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportV1SourceScopeGuard(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const fact = report.evidenceFacts.find((candidate) =>
    candidate.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION"
  );

  assertTest(fact !== undefined, "V1 evidence fact must exist.");
  if (fact === undefined) {
    return [];
  }

  assertTest(fact.internalTags.includes("coach_report_v1_uses_official_aggregates"), "V1 must use official aggregates.");
  assertTest(fact.internalTags.includes("coach_report_v1_diagnostic_kept_separate"), "V1 must keep diagnostics separate.");
  assertTest(fact.internalTags.includes("coach_report_v1_sandbox_kept_separate"), "V1 must keep sandbox separate.");
  assertTest(fact.internalTags.includes("coach_report_v1_selection_preview_still_sandbox_only"), "V1 must not upgrade Selection Preview.");
  assertTest(fact.internalTags.includes("coach_report_v1_selection_preview_confidence_not_upgraded"), "V1 must not upgrade Selection Preview confidence.");
  assertTest(fact.internalTags.includes("coach_report_v1_score_mutation_count_0"), "V1 must not mutate score.");
  assertTest(fact.internalTags.includes("coach_report_v1_possession_mutation_count_0"), "V1 must not mutate possession.");
  assertTest(fact.internalTags.includes("coach_report_v1_production_scoring_event_creation_count_0"), "V1 must not create production scoring events.");
  assertTest(fact.internalTags.includes("coach_report_v1_global_economy_claim_forbidden"), "V1 must not claim global economy.");

  return [
    "V1 uses official aggregates only",
    "diagnostic and sandbox sources remain separate",
    "Selection Preview remains sandbox-only and confidence is not upgraded",
    "score, possession, and production scoring events are not mutated",
    "global economy claim remains forbidden",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1SourceScopeGuard();

  console.log("coachReportV1SourceScopeGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
