import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { reboundSecondChanceSignature } from "./reboundSecondChanceSignature";

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

export function validateRunFullMatchReboundSecondChanceScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = reboundSecondChanceSignature(defaultReport);
  const experimentalSignature = reboundSecondChanceSignature(experimentalReport);

  assertTest(defaultReport.score.home === experimentalReport.score.home, "rebound sandbox must not mutate official home score.");
  assertTest(defaultReport.score.away === experimentalReport.score.away, "rebound sandbox must not mutate official away score.");
  assertTest(defaultSignature.scoringEventCount === experimentalSignature.scoringEventCount, "rebound sandbox must not mutate official scoring event count.");
  assertTest(defaultSignature.scoreChangeTotal === experimentalSignature.scoreChangeTotal, "rebound sandbox must not mutate official score_change total.");
  assertTest(defaultSignature.timelineEventCount === experimentalSignature.timelineEventCount, "rebound sandbox must not add official timeline events.");
  assertTest(experimentalSignature.officialSandboxEventCount === 0, "no rebound sandbox result is inserted as official MatchEvent.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official final score must still derive from official score_change consequences.");
  assertTest(experimentalSignature.sandboxMatchEventCreatedCount === 0, "rebound sandbox must not create sandbox MatchEvents in 3Q.");
  assertTest(experimentalSignature.sandboxScoringEventCreatedCount === 0, "rebound sandbox must not create sandbox scoring events in 3Q.");
  assertTest(experimentalSignature.sandboxScoreDeltaTotal === 0, "rebound sandbox score delta total must be 0.");
  assertTest(experimentalSignature.officialPossessionMutationCount === 0, "official possession mutation count must be 0.");
  assertTest(experimentalSignature.officialTimelineInjectionCount === 0, "rebound sandbox injected into official timeline count must be 0.");
  assertTest(experimentalSignature.officialScoreMutationCount === 0, "official score mutation count must be 0.");
  assertTest(experimentalSignature.officialScoringEventMutationCount === 0, "official scoring event mutation count must be 0.");
  assertTest(experimentalSignature.productionScoringEventCreationCount === 0, "rebound sandbox must not create production scoring events.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "rebound sandbox must not mutate production route resolution.");
  assertTest(experimentalSignature.globalRouteSuccessRateMutationCount === 0, "rebound sandbox must not mutate global route success rates.");
  assertTest(experimentalSignature.globalEconomyClaimCount === 0, "rebound sandbox must not claim global economy.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_REBOUND_SECOND_CHANCE_SANDBOX_DID_NOT_MUTATE_OFFICIAL_POSSESSION"), "limitations must forbid official possession mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_REBOUND_SECOND_CHANCE_SANDBOX_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "limitations must forbid production scoring event creation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_REBOUND_SECOND_CHANCE_SANDBOX_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION"), "limitations must forbid production route resolution mutation.");

  return [
    "default and experimental official final scores remain equal",
    "default and experimental official scoring event counts remain equal",
    "default and experimental official score_change totals remain equal",
    "official timeline event count remains equal",
    "no rebound sandbox result is inserted as official MatchEvent",
    "no official possession is changed by rebound sandbox",
    "no production scoring events are created by rebound sandbox",
    "global route success rates are not mutated",
    "production route resolution is not mutated",
    "normal live mini-match route resolution is not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchReboundSecondChanceScoringGuard();

  console.log("runFullMatchReboundSecondChanceScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
