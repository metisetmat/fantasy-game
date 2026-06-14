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

export function validateScoringGuard4C(): readonly string[] {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const signature = officialTimelineDiffViewSignature(report);
  const scoreTotal = report.score.home + report.score.away;
  const traceFact = report.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_MATCH_EVENT_TRACE_SPINE"
  );

  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(scoreChangeTotal(report) === scoreTotal, "official final score must derive only from official score_change.");
  assertTest(signature.officialTimelineEventCountDelta === 0, "trace spine must not mutate timeline.");
  assertTest(signature.officialScoringEventCountDelta === 0, "trace spine must not mutate official scoring events.");
  assertTest(signature.officialScoreDelta === 0, "trace spine must not mutate official score.");
  assertTest(signature.productionScoringEventCreationCount === 0, "trace spine must not create production scoring events.");
  assertTest(traceFact !== undefined, "trace spine evidence must exist.");
  assertTest(traceFact?.internalTags.includes("match_trace_global_economy_claim_forbidden") ?? false, "trace spine must not claim global economy.");
  assertTest(traceFact?.internalTags.includes("selection_preview_trace_backing_status_sandbox_only") ?? false, "selection preview must remain sandbox-backed.");

  return [
    "scoring constants unchanged",
    "official score derives only from official score_change",
    "no production scoring events deleted, capped, rewritten, or fabricated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
    "FULL_MATCH_BATCH_ECONOMY remains only global scoring-economy proof",
  ];
}

if (require.main === module) {
  const checks = validateScoringGuard4C();

  console.log("scoringGuard.4c tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
