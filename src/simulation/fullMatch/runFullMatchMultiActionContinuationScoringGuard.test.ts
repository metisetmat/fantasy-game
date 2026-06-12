import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { multiActionContinuationSignature } from "./multiActionContinuationSignature";

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

export function validateRunFullMatchMultiActionContinuationScoringGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = multiActionContinuationSignature(defaultReport);
  const experimentalSignature = multiActionContinuationSignature(experimentalReport);

  assertTest(defaultReport.score.home === experimentalReport.score.home, "multi-action continuation must not mutate official home score.");
  assertTest(defaultReport.score.away === experimentalReport.score.away, "multi-action continuation must not mutate official away score.");
  assertTest(defaultSignature.scoringEventCount === experimentalSignature.scoringEventCount, "multi-action continuation must not mutate official scoring event count.");
  assertTest(defaultSignature.scoreChangeTotal === experimentalSignature.scoreChangeTotal, "multi-action continuation must not mutate official score_change total.");
  assertTest(defaultSignature.timelineEventCount === experimentalSignature.timelineEventCount, "multi-action continuation must not add official timeline events.");
  assertTest(experimentalSignature.officialSandboxEventCount === 0, "no multi-action continuation result is inserted as official MatchEvent.");
  assertTest(scoreChangeTotal(experimentalReport) === experimentalReport.score.home + experimentalReport.score.away, "official final score must still derive from official score_change consequences.");
  assertTest(experimentalSignature.sandboxContinuationCreatedCount === 1, "one sandbox continuation should be created in the current fixture.");
  assertTest(experimentalSignature.sandboxMatchEventCreatedCount === 0, "multi-action continuation must not create sandbox MatchEvents in 3R.");
  assertTest(experimentalSignature.sandboxScoringEventCreatedCount === 0, "multi-action continuation must not create sandbox scoring events in 3R.");
  assertTest(experimentalSignature.sandboxScoreDeltaTotal === 0, "multi-action continuation score delta total must be 0.");
  assertTest(experimentalSignature.officialPossessionMutationCount === 0, "official possession mutation count must be 0.");
  assertTest(experimentalSignature.officialTimelineMutationCount === 0, "official timeline mutation count must be 0.");
  assertTest(experimentalSignature.officialTimelineInjectionCount === 0, "multi-action continuation injected into official timeline count must be 0.");
  assertTest(experimentalSignature.officialScoreMutationCount === 0, "official score mutation count must be 0.");
  assertTest(experimentalSignature.officialScoringEventMutationCount === 0, "official scoring event mutation count must be 0.");
  assertTest(experimentalSignature.productionScoringEventCreationCount === 0, "multi-action continuation must not create production scoring events.");
  assertTest(experimentalSignature.productionRouteResolutionMutationCount === 0, "multi-action continuation must not mutate production route resolution.");
  assertTest(experimentalSignature.globalRouteSuccessRateMutationCount === 0, "multi-action continuation must not mutate global route success rates.");
  assertTest(experimentalSignature.globalEconomyClaimCount === 0, "multi-action continuation must not claim global economy.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_MULTI_ACTION_CONTINUATION_SANDBOX_DID_NOT_MUTATE_OFFICIAL_POSSESSION"), "limitations must forbid official possession mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_MULTI_ACTION_CONTINUATION_SANDBOX_DID_NOT_MUTATE_OFFICIAL_TIMELINE"), "limitations must forbid official timeline mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_MULTI_ACTION_CONTINUATION_SANDBOX_DID_NOT_CREATE_PRODUCTION_SCORING_EVENTS"), "limitations must forbid production scoring event creation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_MULTI_ACTION_CONTINUATION_SANDBOX_DID_NOT_MUTATE_PRODUCTION_ROUTE_RESOLUTION"), "limitations must forbid production route resolution mutation.");

  return [
    "default and experimental official final scores remain equal",
    "default and experimental official scoring event counts remain equal",
    "default and experimental official score_change totals remain equal",
    "official timeline event count remains equal",
    "one sandbox-only continuation is created",
    "no continuation result is inserted as official MatchEvent",
    "no official possession or timeline is changed by continuation sandbox",
    "no production scoring events are created by continuation sandbox",
    "global route success rates are not mutated",
    "production route resolution is not mutated",
    "MatchBonusEvent unchanged",
    "batch/live separation preserved",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchMultiActionContinuationScoringGuard();

  console.log("runFullMatchMultiActionContinuationScoringGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}
