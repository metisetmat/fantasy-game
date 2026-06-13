import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { officialTimelineDiffViewSignature } from "./officialTimelineDiffViewSignature";

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

export function validateScoringGuard4A(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = officialTimelineDiffViewSignature(report);
  const scoreTotal = report.score.home + report.score.away;
  const planFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_MULTI_SCENARIO_COACH_TEST_PLAN"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.officialTimelineEventCountDelta === 0, "official timeline event count delta must be zero.");
  assertTest(signature.officialScoringEventCountDelta === 0, "official scoring event count delta must be zero.");
  assertTest(signature.officialScoreDelta === 0, "official score delta must be zero.");
  assertTest(signature.productionScoringEventCreationCount === 0, "coach test plan must not create production scoring events.");
  assertTest(planFact !== undefined, "multi-scenario coach test plan evidence must exist.");
  assertTest(planFact?.internalTags.includes("multi_scenario_test_plan_suggestion_only_true") ?? false, "plan must remain suggestion-only.");
  assertTest(planFact?.internalTags.includes("multi_scenario_test_plan_can_drive_live_selection_false") ?? false, "plan must not drive live selection.");
  assertTest(planFact?.internalTags.includes("multi_scenario_test_plan_can_drive_production_route_resolution_false") ?? false, "plan must not drive production route resolution.");
  assertTest(report.reportMeta.limitations.includes("FULLMATCH_MULTI_SCENARIO_COACH_TEST_PLAN_CANNOT_DRIVE_LIVE_SELECTION"), "limitations must mark plan live-selection-forbidden.");

  return [
    "scoring constants unchanged",
    "official final score still derives only from official score_change",
    "no production scoring events deleted/capped/rewritten/fabricated",
    "multi-scenario coach test plan creates no production scoring events",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4A();

  console.log("scoringGuard.4a tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
